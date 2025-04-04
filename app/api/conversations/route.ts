import connectToDatabase from "@/lib/mongodb";
import {
  createErrorResponse,
  createResponse,
  getErrorMessage,
} from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { createSession, deleteSession } from "@/utils/nebula-utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Maximum number of conversations per user
const MAX_CONVERSATIONS_PER_USER = 5;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return createErrorResponse("Please Login for chat", 400);
    }

    // Only select fields we actually need to return
    const conversations = await Conversation.find(
      { userId },
      { sessionId: 1, title: 1, lastChatTime: 1 },
    )
      .sort({ lastChatTime: -1 })
      .lean();

    return createResponse(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, title } = await req.json();

    if (!userId) {
      return createErrorResponse("userId is required", 400);
    }

    // Count existing conversations for this user
    const conversationCount = await Conversation.countDocuments({ userId });

    // If the user already has the maximum number of conversations
    let reachedLimit = false;
    if (conversationCount >= MAX_CONVERSATIONS_PER_USER) {
      reachedLimit = true;
      // Find the oldest conversation by lastChatTime
      const oldestConversation = await Conversation.findOne({ userId })
        .sort({ lastChatTime: 1 })
        .exec();

      if (oldestConversation) {
        // Get the sessionId to delete associated messages
        const oldSessionId = oldestConversation.sessionId;

        // Perform database operations in parallel while still handling Nebula API
        try {
          await deleteSession(oldSessionId);
          console.log(`Deleted Nebula session ${oldSessionId}`);
        } catch (deleteError) {
          console.error(
            `Failed to delete Nebula session: ${oldSessionId}`,
            deleteError,
          );
        }

        // Run database operations in parallel
        await Promise.all([
          Conversation.deleteOne({ _id: oldestConversation._id }),
          Message.deleteMany({ sessionId: oldSessionId }),
        ]);

        console.log(
          `Deleted oldest conversation (${oldSessionId}) for user ${userId} to stay within limit of ${MAX_CONVERSATIONS_PER_USER}`,
        );
      }
    }

    // Create a new session with Nebula API
    const sessionId = await createSession(title);

    // Create a new conversation in our database
    const conversation = await Conversation.create({
      userId,
      sessionId,
      title: title || `Conversation ${new Date().toLocaleString()}`,
      lastChatTime: new Date(),
    });

    // Create response with additional metadata
    const responseData = {
      conversation,
      reachedLimit,
      message: reachedLimit
        ? "Reached maximum conversations limit. Oldest conversation was removed."
        : undefined,
    };

    return createResponse(responseData, true, 201);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const userId = searchParams.get("userId");

    if (!sessionId || !userId) {
      return createErrorResponse("sessionId and userId are required", 400);
    }

    // Find the conversation
    const conversation = await Conversation.findOne({ sessionId, userId });

    if (!conversation) {
      return createErrorResponse("Conversation not found", 404);
    }

    const nebulaDeletePromise = deleteSession(sessionId).catch(
      (deleteError) => {
        console.error(
          `Failed to delete Nebula session: ${sessionId}`,
          deleteError,
        );
        // Return null to avoid breaking Promise.all
        return null;
      },
    );

    // Run all deletion operations in parallel
    await Promise.all([
      nebulaDeletePromise,
      Conversation.deleteOne({ sessionId, userId }),
      Message.deleteMany({ sessionId }),
    ]);

    return createResponse({ deleted: true, sessionId });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

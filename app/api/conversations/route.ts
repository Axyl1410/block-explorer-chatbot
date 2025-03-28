import connectToDatabase from "@/lib/mongodb";
import { getErrorMessage } from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { createSession, deleteSession } from "@/utils/nebula-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Maximum number of conversations per user
const MAX_CONVERSATIONS_PER_USER = 5;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    const conversations = await Conversation.find({ userId })
      .sort({ lastChatTime: -1 })
      .lean();

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, title } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    // Count existing conversations for this user
    const conversationCount = await Conversation.countDocuments({ userId });

    // If the user already has the maximum number of conversations
    if (conversationCount >= MAX_CONVERSATIONS_PER_USER) {
      // Find the oldest conversation by lastChatTime
      const oldestConversation = await Conversation.findOne({ userId })
        .sort({ lastChatTime: 1 })
        .exec();

      if (oldestConversation) {
        // Get the sessionId to delete associated messages
        const oldSessionId = oldestConversation.sessionId;

        // Delete the session from Nebula API first
        try {
          await deleteSession(oldSessionId);
          console.log(`Deleted Nebula session ${oldSessionId}`);
        } catch (deleteError) {
          console.error(
            `Failed to delete Nebula session: ${oldSessionId}`,
            deleteError,
          );
          // Continue with cleanup even if Nebula API call fails
        }

        // Delete the oldest conversation from our database
        await Conversation.deleteOne({ _id: oldestConversation._id });

        // Delete all messages associated with this conversation
        await Message.deleteMany({ sessionId: oldSessionId });

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

    return NextResponse.json(
      {
        success: true,
        data: conversation,
        reachedLimit: conversationCount >= MAX_CONVERSATIONS_PER_USER,
        message:
          conversationCount >= MAX_CONVERSATIONS_PER_USER
            ? "Reached maximum conversations limit. Oldest conversation was removed."
            : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

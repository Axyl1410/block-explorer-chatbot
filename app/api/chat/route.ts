import connectToDatabase from "@/lib/mongodb";
import {
  createErrorResponse,
  createResponse,
  getErrorMessage,
} from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import {
  saveUserMessage,
  getNebulaResponse,
  saveBotMessage,
} from "@/utils/message-utils";
import { ensureValidSession } from "@/utils/session-utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Send message and get bot response
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const {
      userId,
      sessionId: initialSessionId,
      userMessage,
      contractAddress,
      chainId,
    } = await req.json();

    if (!userId) {
      return createErrorResponse("Please Login for chat", 400);
    }

    if (!userMessage) {
      return createErrorResponse("No user message provided", 400);
    }

    try {
      // Ensure we have a valid session
      const { sessionId, isNewSession } = await ensureValidSession(
        userId,
        initialSessionId,
        undefined,
        { contractAddress, chainId },
      );

      // Save user message to database
      const userMessageDoc = await saveUserMessage(
        userId,
        sessionId,
        userMessage,
      );

      // Get response from Nebula
      const { response, newSessionId } = await getNebulaResponse(
        userMessage,
        sessionId,
        chainId,
        contractAddress,
      );

      // If we got a new session ID from error recovery, update references
      let finalSessionId = sessionId;
      if (newSessionId) {
        // Update our database with the new session ID
        await Conversation.findOneAndUpdate(
          { sessionId },
          { sessionId: newSessionId },
          { new: true },
        );

        // Update user message with new session ID
        await Message.updateMany({ sessionId }, { sessionId: newSessionId });

        // Use the new session ID going forward
        finalSessionId = newSessionId;
      }

      // Save bot response to database
      const botMessageDoc = await saveBotMessage(
        userId,
        finalSessionId,
        response,
      );

      return createResponse(
        {
          userMessage: userMessageDoc,
          botMessage: botMessageDoc,
          sessionId: finalSessionId,
          isNewSession,
        },
        true,
        201,
      );
    } catch (error) {
      console.error("Session handling error:", error);
      return createErrorResponse(getErrorMessage(error), 500);
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

// Get chat history by sessionId
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("sessionId is required", 400);
    }

    // Check if the session exists
    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      return createErrorResponse("Session not found", 404);
    }

    // Get messages for this session
    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    return createResponse({
      messages,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

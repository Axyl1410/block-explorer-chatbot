import connectToDatabase from "@/lib/mongodb";
import {
  createErrorResponse,
  createResponse,
  getErrorMessage,
} from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import {
  getNebulaResponse,
  saveBotMessage,
  saveUserMessage,
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

    // Consolidate error handling
    // Ensure we have a valid session
    const { sessionId, isNewSession } = await ensureValidSession(
      userId,
      initialSessionId,
      undefined,
      { contractAddress, chainId },
    );

    // Save user message to database - start this operation immediately
    const userMessagePromise = saveUserMessage(userId, sessionId, userMessage);

    // Start getting Nebula response in parallel
    const nebulaResponsePromise = getNebulaResponse(
      userMessage,
      sessionId,
      chainId,
      contractAddress,
    );

    // Await both operations in parallel
    const [userMessageDoc, { response, newSessionId }] = await Promise.all([
      userMessagePromise,
      nebulaResponsePromise,
    ]);

    // If we got a new session ID from error recovery, update references
    let finalSessionId = sessionId;
    if (newSessionId) {
      // Run these operations in parallel
      await Promise.all([
        // Update our database with the new session ID
        Conversation.findOneAndUpdate(
          { sessionId },
          { sessionId: newSessionId },
          { new: true },
        ),
        // Update user message with new session ID
        Message.updateMany({ sessionId }, { sessionId: newSessionId }),
      ]);

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
    console.error("Error in chat API:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

// Get chat history by sessionId
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const sessionId = new URL(req.url).searchParams.get("sessionId");

    if (!sessionId) {
      return createErrorResponse("sessionId is required", 400);
    }

    const [conversation, messages] = await Promise.all([
      Conversation.findOne({ sessionId }),
      Message.find({ sessionId }).sort({ timestamp: 1 }).lean(),
    ]);

    if (!conversation) {
      return createErrorResponse("Session not found", 404);
    }

    return createResponse({ messages, conversation });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

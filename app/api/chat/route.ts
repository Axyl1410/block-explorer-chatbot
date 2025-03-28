import connectToDatabase from "@/lib/mongodb";
import {
  createResponse,
  createErrorResponse,
  getErrorMessage,
} from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import {
  createSession,
  handleGeneralUserMessage,
  handleUserMessage,
} from "@/utils/nebula-utils";
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
      return createErrorResponse("userId is required", 400);
    }

    let sessionId;
    let isNewSession = false;

    try {
      // Create a new session if none exists
      if (!initialSessionId) {
        isNewSession = true;
        // Get a UUID for Nebula API
        sessionId = await createSession();

        // Create a new conversation record
        await Conversation.create({
          userId,
          sessionId,
          title: `Chat ${new Date().toLocaleString()}`,
          lastChatTime: new Date(),
        });
      } else {
        // Check if the sessionId exists in our database
        const existingConversation = await Conversation.findOne({
          sessionId: initialSessionId,
        });

        if (!existingConversation) {
          // If session doesn't exist, create a new one
          isNewSession = true;
          sessionId = await createSession();

          await Conversation.create({
            userId,
            sessionId,
            title: `Chat ${new Date().toLocaleString()}`,
            lastChatTime: new Date(),
          });
        } else {
          // Use the existing session
          sessionId = initialSessionId;
        }
      }

      // Only proceed if there's a user message to process
      if (userMessage) {
        // Save user message to database
        const userMessageDoc = await Message.create({
          userId,
          sessionId,
          userMessage,
          botMessage: null,
          timestamp: new Date(),
        });

        // Get bot response from Nebula API
        let botResponse;
        try {
          if (contractAddress && chainId) {
            botResponse = await handleUserMessage(
              userMessage,
              sessionId,
              Number(chainId),
              contractAddress,
            );
          } else {
            botResponse = await handleGeneralUserMessage(
              userMessage,
              sessionId,
            );
          }
        } catch (apiError) {
          console.error("Nebula API error:", apiError);

          // If there's an issue with the session ID, create a new one
          if (
            typeof apiError === "object" &&
            apiError !== null &&
            "message" in apiError &&
            typeof apiError.message === "string" &&
            (apiError.message.includes("session ID") ||
              apiError.message.includes("hexadecimal UUID"))
          ) {
            // Create a new session for Nebula
            const newSessionId = await createSession();

            // Try again with the new session ID
            if (contractAddress && chainId) {
              botResponse = await handleUserMessage(
                userMessage,
                newSessionId,
                Number(chainId),
                contractAddress,
              );
            } else {
              botResponse = await handleGeneralUserMessage(
                userMessage,
                newSessionId,
              );
            }

            // Update our database with the new session ID
            await Conversation.findOneAndUpdate(
              { sessionId },
              { sessionId: newSessionId },
              { new: true },
            );

            // Update user message with new session ID
            await Message.updateMany(
              { sessionId },
              { sessionId: newSessionId },
            );

            // Use the new session ID going forward
            sessionId = newSessionId;
          } else {
            throw apiError;
          }
        }

        // Save bot response to database
        const botMessageDoc = await Message.create({
          userId,
          sessionId,
          userMessage: null,
          botMessage: botResponse,
          timestamp: new Date(),
        });

        // Update conversation's last chat time
        await Conversation.findOneAndUpdate(
          { sessionId },
          { lastChatTime: new Date() },
          { new: true },
        );

        return createResponse(
          {
            userMessage: userMessageDoc,
            botMessage: botMessageDoc,
            sessionId,
            isNewSession,
          },
          true,
          201,
        );
      } else {
        return createErrorResponse("No user message provided", 400);
      }
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

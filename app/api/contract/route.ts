import connectToDatabase from "@/lib/mongodb";
import {
  createErrorResponse,
  createResponse,
  getErrorMessage,
} from "@/lib/utils";
import Conversation from "@/models/conversation";
import Message from "@/models/message";
import { createSession, queryContract } from "@/utils/nebula-utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const {
      userId,
      sessionId: initialSessionId,
      contractAddress,
      chainId,
    } = await req.json();

    if (!userId) {
      return createErrorResponse("Please Login for contract details", 400);
    }

    if (!contractAddress || !chainId) {
      return createErrorResponse(
        "Contract address and chain ID are required",
        400,
      );
    }

    let sessionId;
    let isNewSession = false;

    try {
      // Create a new session if none exists
      if (!initialSessionId) {
        isNewSession = true;
        sessionId = await createSession();

        await Conversation.create({
          userId,
          sessionId,
          title: `Contract ${contractAddress.substring(0, 8)}... on Chain ${chainId}`,
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
            title: `Contract ${contractAddress.substring(0, 8)}... on Chain ${chainId}`,
            lastChatTime: new Date(),
          });
        } else {
          // Use the existing session
          sessionId = initialSessionId;
        }
      }

      // Query the contract details using our utility function
      const contractDetails = await queryContract(
        contractAddress,
        Number(chainId),
        sessionId,
      );

      // Create a system message about the contract update
      const systemMessage = `Context updated to Contract: ${contractAddress} on Chain ID: ${chainId}`;

      // Save system message to database
      const systemMessageDoc = await Message.create({
        userId,
        sessionId,
        userMessage: systemMessage,
        botMessage: null,
        timestamp: new Date(),
      });

      // Save contract details as bot response
      const botMessageDoc = await Message.create({
        userId,
        sessionId,
        userMessage: null,
        botMessage: contractDetails,
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
          systemMessage: systemMessageDoc,
          botMessage: botMessageDoc,
          sessionId,
          isNewSession,
        },
        true,
        201,
      );
    } catch (error) {
      console.error("Contract query error:", error);
      return createErrorResponse(getErrorMessage(error), 500);
    }
  } catch (error) {
    console.error("Error processing contract query:", error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

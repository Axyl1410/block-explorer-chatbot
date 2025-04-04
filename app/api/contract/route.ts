import connectToDatabase from "@/lib/mongodb";
import {
  createErrorResponse,
  createResponse,
  getErrorMessage,
} from "@/lib/utils";
import {
  getContractDetails,
  saveUserMessage,
  saveBotMessage,
} from "@/utils/message-utils";
import { ensureValidSession } from "@/utils/session-utils";
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

    try {
      // Ensure we have a valid session
      const { sessionId, isNewSession } = await ensureValidSession(
        userId,
        initialSessionId,
        `Contract ${contractAddress.substring(0, 8)}... on Chain ${chainId}`,
        { contractAddress, chainId },
      );

      // Query the contract details (start this first)
      const contractDetailsPromise = getContractDetails(
        contractAddress,
        chainId,
        sessionId,
      );

      // Create a system message about the contract update
      const systemMessage = `Context updated to Contract: ${contractAddress} on Chain ID: ${chainId}`;

      // Save system message to database (start this in parallel)
      const systemMessagePromise = saveUserMessage(
        userId,
        sessionId,
        systemMessage,
      );

      // Await both promises in parallel
      const [contractDetails, systemMessageDoc] = await Promise.all([
        contractDetailsPromise,
        systemMessagePromise,
      ]);

      // Once we have contract details, save the bot response
      const botMessageDoc = await saveBotMessage(
        userId,
        sessionId,
        contractDetails,
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

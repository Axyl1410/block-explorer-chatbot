/* eslint-disable @typescript-eslint/no-explicit-any */
import Message from "@/models/message";
import {
  createSession,
  handleGeneralUserMessage,
  handleUserMessage,
  queryContract,
} from "@/utils/nebula-utils";
import { updateSessionLastChatTime } from "./session-utils";

/**
 * Saves a user message to the database
 */
export async function saveUserMessage(
  userId: string,
  sessionId: string,
  userMessage: string,
): Promise<any> {
  const message = await Message.create({
    userId,
    sessionId,
    userMessage,
    botMessage: null,
    timestamp: new Date(),
  });

  await updateSessionLastChatTime(sessionId);
  return message;
}

/**
 * Saves a bot message to the database
 */
export async function saveBotMessage(
  userId: string,
  sessionId: string,
  botMessage: string,
): Promise<any> {
  const message = await Message.create({
    userId,
    sessionId,
    userMessage: null,
    botMessage,
    timestamp: new Date(),
  });

  await updateSessionLastChatTime(sessionId);
  return message;
}

/**
 * Handles getting a response from Nebula API with fallback logic for session recreation
 */
export async function getNebulaResponse(
  userMessage: string,
  sessionId: string,
  chainId?: string | number,
  contractAddress?: string,
): Promise<{
  response: string;
  newSessionId?: string;
}> {
  try {
    let botResponse;

    if (contractAddress && chainId) {
      botResponse = await handleUserMessage(
        userMessage,
        sessionId,
        chainId.toString(),
        contractAddress,
      );
    } else {
      botResponse = await handleGeneralUserMessage(userMessage, sessionId);
    }

    return { response: botResponse };
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
      let retryResponse;
      if (contractAddress && chainId) {
        retryResponse = await handleUserMessage(
          userMessage,
          newSessionId,
          chainId.toString(),
          contractAddress,
        );
      } else {
        retryResponse = await handleGeneralUserMessage(
          userMessage,
          newSessionId,
        );
      }

      return {
        response: retryResponse,
        newSessionId,
      };
    } else {
      throw apiError;
    }
  }
}

/**
 * Gets contract details from Nebula
 */
export async function getContractDetails(
  contractAddress: string,
  chainId: number | string,
  sessionId: string,
): Promise<string> {
  return await queryContract(contractAddress, Number(chainId), sessionId);
}

import Conversation from "@/models/conversation";
import { createSession } from "@/utils/nebula-utils";

/**
 * Ensures we have a valid session ID by either validating an existing one
 * or creating a new one
 */
export async function ensureValidSession(
  userId: string,
  initialSessionId?: string,
  title?: string,
  metadata?: { contractAddress?: string; chainId?: string | number },
): Promise<{
  sessionId: string;
  isNewSession: boolean;
}> {
  let sessionId;
  let isNewSession = false;

  // Create a new session if none exists
  if (!initialSessionId) {
    isNewSession = true;
    sessionId = await createSession();

    const conversationTitle = title || generateSessionTitle(metadata);

    await Conversation.create({
      userId,
      sessionId,
      title: conversationTitle,
      lastChatTime: new Date(),
      ...(metadata?.contractAddress && {
        contractAddress: metadata.contractAddress,
      }),
      ...(metadata?.chainId && { chainId: metadata.chainId.toString() }),
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

      const conversationTitle = title || generateSessionTitle(metadata);

      await Conversation.create({
        userId,
        sessionId,
        title: conversationTitle,
        lastChatTime: new Date(),
        ...(metadata?.contractAddress && {
          contractAddress: metadata.contractAddress,
        }),
        ...(metadata?.chainId && { chainId: metadata.chainId.toString() }),
      });
    } else {
      // Use the existing session
      sessionId = initialSessionId;

      // Update metadata if provided
      if (metadata?.contractAddress || metadata?.chainId) {
        await Conversation.findOneAndUpdate(
          { sessionId },
          {
            ...(metadata.contractAddress && {
              contractAddress: metadata.contractAddress,
            }),
            ...(metadata.chainId && { chainId: metadata.chainId.toString() }),
          },
          { new: true },
        );
      }
    }
  }

  return { sessionId, isNewSession };
}

/**
 * Generates a title for a session based on metadata
 */
function generateSessionTitle(metadata?: {
  contractAddress?: string;
  chainId?: string | number;
}): string {
  if (metadata?.contractAddress && metadata?.chainId) {
    return `Contract ${metadata.contractAddress.substring(0, 8)}... on Chain ${metadata.chainId}`;
  }
  return `Chat ${new Date().toLocaleString()}`;
}

/**
 * Updates the last chat time for a session
 */
export async function updateSessionLastChatTime(
  sessionId: string,
): Promise<void> {
  await Conversation.findOneAndUpdate(
    { sessionId },
    { lastChatTime: new Date() },
    { new: true },
  );
}

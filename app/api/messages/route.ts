import { createResponse, createErrorResponse } from "@/lib/utils";
import { createSession, handleGeneralUserMessage } from "@/utils/nebula-utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, sessionId: initialSessionId } = await req.json();
    let sessionId = initialSessionId;

    if (!userMessage) {
      return createErrorResponse("Missing userMessage", 400);
    }

    if (!sessionId) {
      sessionId = await createSession();
    }

    const responseMessage = await handleGeneralUserMessage(
      userMessage,
      sessionId,
    );

    return createResponse({ message: responseMessage, sessionId });
  } catch (error) {
    console.error("Error handling user message:", error);
    return createErrorResponse("Internal Server Error", 500);
  }
}

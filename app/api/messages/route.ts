import { createSession, handleGeneralUserMessage } from "@/utils/nebula-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, sessionId: initialSessionId } = await req.json();
    let sessionId = initialSessionId;

    if (!userMessage) {
      return NextResponse.json(
        { error: "Missing userMessage" },
        { status: 400 },
      );
    }

    if (!sessionId) {
      sessionId = await createSession();
    }

    const responseMessage = await handleGeneralUserMessage(
      userMessage,
      sessionId,
    );
    return NextResponse.json({ message: responseMessage, sessionId });
  } catch (error) {
    console.error("Error handling user message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

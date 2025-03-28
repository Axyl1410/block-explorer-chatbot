import connectToDatabase from "@/lib/mongodb";
import { getErrorMessage } from "@/lib/utils";
import Conversation from "@/models/conversation";
import { createSession } from "@/utils/nebula-utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
      { success: true, data: conversation },
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

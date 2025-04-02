"use client";

import { ChatForm } from "@/components/chat/chat-form";
import { Context } from "@/components/chat/context";
import { Message } from "@/components/chat/message";
import { Loading } from "@/components/common/loading";
import { ConnectButton } from "@/components/thirdweb/connect-button";
import { useChatStore } from "@/store/use-chat-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const { sessionId, messages, isChat, setMessages, setIsLoading, userId } =
    useChatStore();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch message history for a session
  const fetchMessages = useCallback(
    async (selectedSessionId: string) => {
      if (!selectedSessionId) return;

      try {
        setIsLoadingMessages(true);
        const res = await fetch(`/api/chat?sessionId=${selectedSessionId}`);
        const data = await res.json();

        if (data.success) {
          setMessages(data.data.messages);
        } else {
          console.error("Error fetching messages:", data.error);
          toast.error("Failed to load messages", {
            description: data.error,
          });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
        setIsLoading(false);
      }
    },
    [setMessages, setIsLoading],
  );

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const renderContent = () => {
    if (isLoadingMessages && sessionId) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loading text="Loading conversation..." />
        </div>
      );
    }

    if (messages.length > 0) {
      return messages.map((msg) => <Message key={msg._id} message={msg} />);
    }

    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-gray-500">
        <div className="px-4 text-center">
          {!userId ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <p>Please log in to start a conversation</p>
              <ConnectButton />
            </div>
          ) : sessionId ? (
            <div className="flex flex-col gap-2">
              <p>You can provide context to Nebula for your prompts</p>
              <Context />
            </div>
          ) : (
            "Select a conversation or start a new one"
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex h-screen max-w-[800px] flex-col px-2">
      {/* Chat area */}
      <div className="flex-1 pt-4">
        {renderContent()}

        {isChat && (
          <div className="mb-2 ml-2 flex justify-start">
            <div className="rounded-lg bg-gray-100 p-3">
              <Loading text="Thinking..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pb-4">
        <ChatForm />
      </div>
    </div>
  );
}

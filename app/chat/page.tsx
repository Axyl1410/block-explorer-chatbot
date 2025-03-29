"use client";

import { ChatForm } from "@/components/chat/chat-form";
import { Message } from "@/components/chat/message";
import { Loading } from "@/components/common/loading";
import { useChatStore } from "@/store/use-chat-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const { sessionId, messages, isLoading, setMessages, setIsLoading } =
    useChatStore();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch message history for a session
  const fetchMessages = useCallback(
    async (selectedSessionId: string) => {
      try {
        setIsLoadingMessages(true);
        const res = await fetch(`/api/chat?sessionId=${selectedSessionId}`);
        const data = await res.json();
        if (data.success) {
          // Access nested messages data
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
        setIsLoading(false); // Make sure to reset main loading state
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="mx-auto flex h-screen max-w-[800px] flex-col px-2">
      {/* Chat area */}
      <div className="flex-1 pt-4">
        {isLoadingMessages && sessionId ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loading text="Loading conversation..." />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => <Message key={msg._id} message={msg} />)
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-gray-500">
            <p className="px-4 text-center">
              {sessionId
                ? "No messages yet. Start a conversation!"
                : "Select a conversation or start a new one"}
            </p>
          </div>
        )}
        {isLoading && !isLoadingMessages && (
          <div className="mb-2 ml-2 flex justify-start">
            <div className="rounded-lg bg-gray-100 p-3">
              <Loading text="Thinking..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t py-4">
        <ChatForm />
      </div>
    </div>
  );
}

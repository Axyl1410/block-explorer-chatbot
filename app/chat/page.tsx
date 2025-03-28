"use client";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils";
import { Conversation, Message } from "@/types";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ChatPage() {
  const [userId] = useState<string>("user123"); // This should come from authentication
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch message history for a session
  const fetchMessages = async (selectedSessionId: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${selectedSessionId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      } else {
        console.error("Error fetching messages:", data.error);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch conversation history
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);

        // If we have conversations but no active session, select the most recent one
        if (data.data.length > 0 && !sessionId) {
          setSessionId(data.data[0].sessionId);
        }
      } else {
        console.error("Error fetching conversations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [userId, sessionId]);

  // Create a new conversation
  const startNewConversation = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: `New Chat ${new Date().toLocaleString()}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSessionId(data.data.sessionId);
        setMessages([]);

        // Show notification if we reached the limit
        if (data.reachedLimit) {
          toast.warning(
            "Your oldest conversation was removed to make room for this new one.",
          );
        }

        fetchConversations();
      } else {
        console.error("Error creating conversation:", data.error);

        toast.error("Error creating conversation", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Error creating conversation", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input) return;

    setIsLoading(true);

    try {
      // Add optimistic update for user message
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          _id: tempId,
          userMessage: input,
          botMessage: null,
          timestamp: new Date().toISOString(),
        },
      ]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId,
          userMessage: input,
        }),
      });

      const data = await res.json();

      // Clear input regardless of result
      setInput("");

      if (data.success) {
        // If this is a new conversation or the session ID changed
        if (data.data.sessionId !== sessionId) {
          setSessionId(data.data.sessionId);
        }

        // Fetch the full updated conversation
        fetchMessages(data.data.sessionId);
        fetchConversations();
      } else {
        console.error("Error sending message:", data.error);

        // Remove the optimistic update if there was an error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load initial data
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="flex h-screen rounded-lg border bg-white shadow-lg">
        {/* Sidebar */}
        <div className="w-1/4 overflow-y-auto border-r p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chat History</h2>
            <Button onClick={startNewConversation} variant={"outline"}>
              New Chat
            </Button>
          </div>

          <ul className="space-y-2">
            {conversations.map((conv) => (
              <li
                key={conv.sessionId}
                onClick={() => setSessionId(conv.sessionId)}
                className={`cursor-pointer rounded p-2 hover:bg-gray-100 ${
                  sessionId === conv.sessionId ? "bg-blue-100" : ""
                }`}
              >
                <div className="font-medium">
                  {conv.title || `Chat ${conv._id.substring(0, 8)}`}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.lastChatTime).toLocaleString()}
                </div>
              </li>
            ))}
            {conversations.length === 0 && (
              <li className="py-4 text-center text-gray-500">
                No conversations yet
              </li>
            )}
          </ul>
        </div>

        {/* Chat area */}
        <div className="flex w-3/4 flex-col">
          {/* Messages */}
          <ScrollArea className="h-[calc(100vh-141px)] overflow-y-auto">
            <div className="flex-1 p-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg._id} className="mb-4">
                    {msg.userMessage && (
                      <div className="mb-2 flex justify-end">
                        <div className="max-w-[80%] rounded-lg bg-blue-100 p-3">
                          {msg.userMessage}
                        </div>
                      </div>
                    )}
                    {msg.botMessage && (
                      <div className="mb-2 flex justify-start">
                        <div className="max-w-[80%] rounded-lg bg-gray-100 p-3">
                          <ScrollArea>
                            <ReactMarkdown>{msg.botMessage}</ReactMarkdown>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  {sessionId
                    ? "No messages yet. Start a conversation!"
                    : "Select a conversation or start a new one"}
                </div>
              )}
              {isLoading && (
                <div className="mb-2 flex justify-start">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Loading text="Thinking..." />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                // className="flex-1 rounded-l border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!sessionId || isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input || isLoading || !sessionId}
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

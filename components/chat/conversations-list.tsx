"use client";

import { getErrorMessage } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loading } from "../common/loading";
import { Button } from "../ui/button";

export function ConversationsList() {
  const {
    userId,
    sessionId,
    conversations,
    isLoading,
    setSessionId,
    setConversations,
    setMessages,
    setIsLoading,
    setIsFetchingConversations,
    isFetching,
  } = useChatStore();
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  // Fetch conversation history
  const fetchConversations = useCallback(async () => {
    try {
      setIsFetchingConversations(true);
      const res = await fetch(`/api/conversations?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);

        // If we have conversations but no active session, select the most recent one
        if (data.data.length > 0 && !sessionId) {
          setSessionId(data.data[0].sessionId);
        }
      } else {
        toast.error("Failed to load conversations", {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error("Failed to load conversations", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsFetchingConversations(false);
    }
  }, [
    setIsFetchingConversations,
    userId,
    setConversations,
    sessionId,
    setSessionId,
  ]);

  // Fetch message history for a session
  const fetchMessages = useCallback(
    async (selectedSessionId: string) => {
      try {
        setIsFetchingMessages(true);
        const res = await fetch(`/api/chat?sessionId=${selectedSessionId}`);
        const data = await res.json();
        if (data.success) {
          // Access nested messages data
          setMessages(data.data.messages);
        } else {
          toast.error("Failed to load messages", {
            description: data.error,
          });
        }
      } catch (error) {
        toast.error("Failed to load messages", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsFetchingMessages(false);
      }
    },
    [setMessages],
  );

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
        // Access conversation data from nested response
        setSessionId(data.data.conversation.sessionId);
        setMessages([]);

        // Show notification if we reached the limit
        if (data.data.reachedLimit) {
          toast.warning(
            "Your oldest conversation was removed to make room for this new one.",
          );
        }

        fetchConversations();
      } else {
        toast.error("Error creating conversation", {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error("Error creating conversation", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Select a conversation
  const selectConversation = (selectedSessionId: string) => {
    if (isLoading || selectedSessionId === sessionId) return;

    setIsLoading(true); // Show loading in chat area
    setSessionId(selectedSessionId);
    // Note: Messages will be loaded in the ChatPage component via useEffect
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
  }, [fetchMessages, sessionId]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Button
          onClick={startNewConversation}
          variant="outline"
          size="sm"
          disabled={isLoading || isFetching}
          className="bg-sidebar w-full"
        >
          {isFetching
            ? "Loading..."
            : isLoading
              ? "Loading..."
              : "New Conversation"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isFetching && !isLoading ? (
          <div className="flex w-full justify-center">
            <Loading text="Loading conversation" />
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conv) => (
              <li
                key={conv.sessionId}
                onClick={() => selectConversation(conv.sessionId)}
                className={`cursor-pointer rounded p-2 hover:bg-gray-100 ${
                  sessionId === conv.sessionId ? "bg-sky-100" : ""
                } ${isLoading || isFetchingMessages ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className="font-medium">
                  {conv.title || `Chat ${conv._id.substring(0, 8)}`}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.lastChatTime).toLocaleString()}
                </div>
              </li>
            ))}
            {conversations.length === 0 && !isFetching && (
              <li className="py-4 text-center text-gray-500">
                No conversations yet
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

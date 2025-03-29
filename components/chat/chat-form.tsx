import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/use-chat-store";
import { toast } from "sonner";

export function ChatForm() {
  const {
    userId,
    sessionId,
    input,
    isLoading,
    setInput,
    setIsLoading,
    setSessionId,
    messages,
    setMessages,
    isFetching,
  } = useChatStore();

  // Send message
  const sendMessage = async () => {
    if (!input) return;

    setIsLoading(true);

    try {
      // Add optimistic update for user message
      const tempId = `temp-${Date.now()}`;
      setMessages([
        ...messages,
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

        // Update messages with the response
        const updatedMessages = messages
          .filter((msg) => msg._id !== tempId)
          .concat([
            {
              _id: data.data.userMessage._id,
              userMessage: data.data.userMessage.userMessage,
              botMessage: null,
              timestamp: data.data.userMessage.timestamp,
            },
            {
              _id: data.data.botMessage._id,
              userMessage: null,
              botMessage: data.data.botMessage.botMessage,
              timestamp: data.data.botMessage.timestamp,
            },
          ]);

        setMessages(updatedMessages);
      } else {
        console.error("Error sending message:", data.error);

        // Remove the optimistic update if there was an error
        setMessages(messages.filter((msg) => msg._id !== tempId));

        toast.error("Failed to send message", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");

      // Remove optimistic update
      setMessages(messages.filter((msg) => !msg._id.startsWith("temp-")));
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

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        disabled={!sessionId || isLoading}
        className="min-h-[80px]"
      />
      <Button
        onClick={sendMessage}
        disabled={!input || isLoading || !sessionId || isFetching}
        className="w-full"
      >
        {isFetching ? "Loading..." : "Send"}
      </Button>
    </div>
  );
}

import { useChatStore } from "@/store/use-chat-store";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

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
    setIsChat,
    chainId,
    contractAddress,
  } = useChatStore();

  // Send message
  const sendMessage = async () => {
    if (!input) return;

    setIsLoading(true);
    setIsChat(true);

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

      let res;
      if (chainId && contractAddress) {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId,
            userMessage: input,
            chainId,
            contractAddress,
          }),
        });
      } else {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId,
            userMessage: input,
          }),
        });
      }

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
      setIsChat(false);
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
      <div className="border-border bg-card rounded-2xl border p-2">
        <div className="max-h-[70vh] overflow-y-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={!sessionId || isLoading}
            className="h-14 resize-none overflow-y-hidden border-none text-sm outline-none focus:ring-0 focus-visible:ring-0 sm:text-base dark:bg-transparent"
          />
        </div>
        <div className="-mt-3 flex justify-end gap-3 px-2 pb-2">
          <Button
            aria-label="Send"
            type="button"
            onClick={sendMessage}
            disabled={!input || isLoading || !sessionId || isFetching}
            variant={"secondary"}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground flex items-center justify-center text-center text-xs sm:text-sm">
        Nebula may make mistakes. Please use with discretion
      </p>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message as MessageType } from "@/types";
import { Check, Copy } from "lucide-react";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  message: MessageType;
}

export const Message = memo(function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <div className="md:text-md mb-4 text-sm">
      {message.userMessage && (
        <div className="mb-2 flex justify-end">
          <div className="rounded-lg border bg-transparent p-3">
            <ScrollArea className="max-w-[288px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px]">
              {message.userMessage}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
      {message.botMessage && (
        <div className="mb-2 flex flex-col items-start gap-0.5">
          <div className="group rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <ScrollArea className="max-w-[288px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px]">
              <ReactMarkdown unwrapDisallowed={false}>
                {message.botMessage}
              </ReactMarkdown>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div>
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => copyToClipboard(message.botMessage || "")}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">
                {copied ? "Copied" : "Copy message"}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

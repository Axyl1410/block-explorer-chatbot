import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message as MessageType } from "@/types";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  return (
    <div className="md:text-md mb-4 text-sm">
      {message.userMessage && (
        <div className="mb-2 flex justify-end">
          <div className="rounded-lg bg-sky-100 p-3">{message.userMessage}</div>
        </div>
      )}
      {message.botMessage && (
        <div className="mb-2 flex justify-start">
          <div className="rounded-lg bg-gray-100 p-3">
            <ScrollArea className="max-w-[288px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] 2xl:max-w-[800px]">
              <ReactMarkdown unwrapDisallowed={false}>
                {message.botMessage}
              </ReactMarkdown>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

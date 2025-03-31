/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { Settings } from "lucide-react";
import { useState } from "react";
import ResponsiveDialog from "../common/responsive-dialog";
import { Button } from "../ui/button";
import { Context } from "./context";

interface ChatSettingProps {
  className?: string;
  [key: string]: any;
}

export const ChatSetting: React.FC<ChatSettingProps> = ({
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useChatStore();

  return (
    <>
      {userId && (
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Context"
          description="Provide context to Nebula for your prompts"
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-7", className)}
              {...props}
            >
              <Settings />
            </Button>
          }
          closeButton={
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <Context />
        </ResponsiveDialog>
      )}
    </>
  );
};

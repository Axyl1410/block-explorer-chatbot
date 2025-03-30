"use client";

import { useChatStore } from "@/store/use-chat-store";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useActiveWallet, useDisconnect } from "thirdweb/react";
import { Button } from "../ui/button";

export const DisconnectButton = () => {
  const { disconnect } = useDisconnect();
  const account = useActiveWallet();
  const wallet = useActiveWallet();
  const { reset } = useChatStore();
  const { isLoading } = useChatStore();

  const handleDisconnect = async () => {
    if (account && wallet) {
      disconnect(wallet);
      reset();
      toast.success("Disconnected from wallet");
    } else toast.error("No wallet connected");
  };

  return (
    <Button variant={"ghost"} disabled={isLoading} onClick={handleDisconnect}>
      <LogOut />
      Log out
    </Button>
  );
};

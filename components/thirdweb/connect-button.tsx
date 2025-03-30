"use client";

import client from "@/lib/client";
import { formatAddress, getErrorMessage } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { ChevronsUpDown } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Blobbie, useActiveAccount, useConnectModal } from "thirdweb/react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DisconnectButton } from "./disconnect-button";

export const ConnectButton = () => {
  const { connect } = useConnectModal();
  const account = useActiveAccount();
  const { setUserId } = useChatStore();

  const handleConnect = async () => {
    await connect({
      setActive: true,
      client: client,
      showThirdwebBranding: false,
      title: "Connect Wallet",
      welcomeScreen: {
        title: "Welcome to the app",
        subtitle: "Connect your wallet to start using the app",
      },
      appMetadata: {
        description: "Connect your wallet to start using the app",
        name: "Nebula AI",
      },
      theme: "light",
    }).catch((error) => {
      console.error("Error connecting wallet:", error);
      toast.error("Have a error while login", {
        description: getErrorMessage(error),
      });
    });
  };

  useEffect(() => {
    if (account) {
      const address = account.address;
      const userId = address.slice(2, 10);
      setUserId(userId);
    }
  }, [account, , setUserId]);

  return (
    <>
      {account ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hover:bg-background flex cursor-pointer items-center justify-between rounded-sm p-1">
              <div className="flex items-center gap-2">
                <Blobbie
                  address={account.address}
                  className="h-8 w-8 rounded-md shadow"
                />
                <p className="text-sm">{formatAddress(account.address)}</p>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Blobbie
                  address={account.address}
                  className="h-5 w-5 rounded-md shadow"
                />
                <p className="text-sm">{formatAddress(account.address)}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <DisconnectButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleConnect}>Connect Wallet</Button>
      )}
    </>
  );
};

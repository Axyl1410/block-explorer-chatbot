/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ResponsiveDialog from "../common/responsive-dialog";
import { SelectChain } from "../common/select-chain";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatSettingProps {
  className?: string;
  [key: string]: any;
}

export const ChatSetting: React.FC<ChatSettingProps> = ({
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    userId,
    sessionId,
    chainId: storedChainId,
    contractAddress: storedContractAddress,
    setChainId,
    setContractAddress,
    chainId,
    contractAddress,
    messages,
    setMessages,
    setIsChat,
  } = useChatStore();

  // Local state for form values
  const [selectedChainId, setSelectedChainId] = useState<number | null>(
    storedChainId ? Number(storedChainId) : null,
  );
  const [selectedChainName, setSelectedChainName] = useState<string>("");
  const [address, setContractAddressLocal] = useState<string>(
    storedContractAddress || "",
  );

  // Handle chain selection from ComboboxDemo
  const handleChainSelect = (chainId: number, chainName: string) => {
    setSelectedChainId(chainId);
    setSelectedChainName(chainName);
  };

  // Handle update button click
  const handleUpdate = async () => {
    if (!selectedChainId) {
      toast.warning("Please select a chain ID");
      return;
    }

    if (!address) {
      toast.warning("Please enter a contract address");
      return;
    }

    // Basic validation for Ethereum addresses (starts with 0x and has appropriate length)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      toast.warning("Invalid Ethereum address format", {
        description:
          "Address should start with '0x' followed by 40 hex characters",
      });
      return;
    }

    // Update the store with selected values
    setChainId(selectedChainId.toString());
    setContractAddress(address);

    // Close the dialog
    setIsOpen(false);

    // Show loading toast
    const loadingToast = toast.loading("Fetching contract details...");

    setIsLoading(true);
    setIsChat(true);

    try {
      // Add optimistic update for system message
      const tempId = `temp-${Date.now()}`;
      const systemMessage = `Context updated to Contract: ${address} on Chain ID: ${selectedChainId}`;

      setMessages([
        ...messages,
        {
          _id: tempId,
          userMessage: systemMessage,
          botMessage: null,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Call the contract API
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sessionId,
          contractAddress: address,
          chainId: selectedChainId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove loading toast
        toast.dismiss(loadingToast);

        // Update messages with the response
        const updatedMessages = messages
          .filter((msg) => msg._id !== tempId)
          .concat([
            {
              _id: data.data.systemMessage._id,
              userMessage: data.data.systemMessage.userMessage,
              botMessage: null,
              timestamp: data.data.systemMessage.timestamp,
            },
            {
              _id: data.data.botMessage._id,
              userMessage: null,
              botMessage: data.data.botMessage.botMessage,
              timestamp: data.data.botMessage.timestamp,
            },
          ]);

        setMessages(updatedMessages);

        toast.success("Contract details fetched", {
          description: `Chain ID: ${selectedChainId}, Contract: ${address.substring(0, 8)}...`,
        });
      } else {
        // Remove the optimistic update if there was an error
        setMessages(messages.filter((msg) => msg._id !== tempId));

        toast.error("Failed to fetch contract details", {
          description: data.error,
        });
        toast.dismiss(loadingToast);
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);

      // Remove optimistic update
      setMessages(messages.filter((msg) => !msg._id.startsWith("temp-")));

      toast.error("Failed to fetch contract details");
      toast.dismiss(loadingToast);
    } finally {
      setIsLoading(false);
      setIsChat(false);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    // Reset local state
    setSelectedChainId(null);
    setSelectedChainName("");
    setContractAddressLocal("");

    // Clear values in store
    setChainId("");
    setContractAddress("");

    toast.info("Context cleared");
  };

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
          <div className="text-primary flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1">
              <p>Chain IDs</p>
              <p className="text-muted-foreground text-sm">
                Current chainId: {chainId ? chainId : "none"}
              </p>
            </div>

            <SelectChain
              onChainSelect={handleChainSelect}
              defaultValue={selectedChainName}
            />
            <div className="flex items-center justify-between gap-1">
              <p>Contract Address</p>
              <p className="text-muted-foreground text-sm">
                Current address: {contractAddress ? contractAddress : "none"}
              </p>
            </div>

            <Input
              type="text"
              placeholder="0x"
              value={address}
              onChange={(e) => setContractAddressLocal(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? "Loading..." : "Update"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </div>
        </ResponsiveDialog>
      )}
    </>
  );
};

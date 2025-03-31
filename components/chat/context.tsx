import { formatAddress, isAddress } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { useState } from "react";
import { toast } from "sonner";
import { SelectChain } from "./select-chain";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Context = () => {
  const {
    chainId: storedChainId,
    contractAddress: storedContractAddress,
    setChainId,
    setContractAddress,
    messages,
    setMessages,
    setIsChat,
    userId,
    sessionId,
    isLoading,
    setIsLoading,
  } = useChatStore();

  const [selectedChainId, setSelectedChainId] = useState<number | null>(
    storedChainId ? Number(storedChainId) : null,
  );
  const [selectedChainName, setSelectedChainName] = useState<string>("");
  const [address, setContractAddressLocal] = useState<string>(
    storedContractAddress || "",
  );

  const handleChainSelect = (chainId: number, chainName: string) => {
    setSelectedChainId(chainId);
    setSelectedChainName(chainName);
  };

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
    if (isAddress(address)) {
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

  return (
    <div className="text-primary flex flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        <p>Chain IDs</p>
        <p className="text-muted-foreground text-sm">
          Current chainId: {storedChainId ? storedChainId : "none"}
        </p>
      </div>

      <SelectChain
        onChainSelect={handleChainSelect}
        defaultValue={selectedChainName}
      />
      <div className="flex items-center justify-between gap-1">
        <p>Contract Address</p>
        <p className="text-muted-foreground text-sm">
          Current address:{" "}
          {storedContractAddress
            ? formatAddress(storedContractAddress)
            : "none"}
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
          Update
        </Button>
      </div>
    </div>
  );
};

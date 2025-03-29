"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/use-chat-store";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ScrollDown from "../common/scroll-down";

export function SidebarRight() {
  const { chainId, contractAddress, setChainId, setContractAddress } =
    useChatStore();
  const [tempChainId, setTempChainId] = useState(chainId || "");
  const [tempContractAddress, setTempContractAddress] = useState(
    contractAddress || "",
  );
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  // Only show in chat route
  const isChatRoute = pathname === "/chat";

  if (!isChatRoute) {
    return null;
  }

  const saveSettings = () => {
    setChainId(tempChainId);
    setContractAddress(tempContractAddress);
  };

  return (
    <>
      {!isMobile && (
        <Sidebar side="right" collapsible="offcanvas">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Blockchain Settings</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chain ID</label>
                  <Input
                    placeholder="e.g., 1 (Ethereum), 137 (Polygon)"
                    value={tempChainId}
                    onChange={(e) => setTempChainId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Contract Address
                  </label>
                  <Input
                    placeholder="0x..."
                    value={tempContractAddress}
                    onChange={(e) => setTempContractAddress(e.target.value)}
                  />
                </div>

                <Button onClick={saveSettings} className="w-full">
                  Apply Settings
                </Button>

                {(chainId || contractAddress) && (
                  <div className="mt-4 border-t pt-4 text-sm">
                    <div className="font-medium">Current Settings:</div>
                    {chainId && <div>Chain ID: {chainId}</div>}
                    {contractAddress && (
                      <div className="truncate">
                        Contract: {contractAddress}
                      </div>
                    )}
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <ScrollDown />
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
}

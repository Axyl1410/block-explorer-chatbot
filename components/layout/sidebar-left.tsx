"use client";

import { ConversationsList } from "@/components/chat/conversations-list";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { ConnectButton } from "../thirdweb/connect-button";
import { Team } from "./team";

export function SidebarLeft() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Team />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="border-b border-dashed">
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            >
              <ConversationsList />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-dashed">
        <ConnectButton />
      </SidebarFooter>
    </Sidebar>
  );
}

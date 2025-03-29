"use client";

import { ConversationsList } from "@/components/chat/conversations-list";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Team } from "./team";

export function SidebarLeft() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarHeader>
          <Team />
        </SidebarHeader>

        <SidebarGroup>
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
    </Sidebar>
  );
}

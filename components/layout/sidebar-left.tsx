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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "../thirdweb/connect-button";
import { Button } from "../ui/button";
import { Team } from "./team";
import { CircleArrowOutUpRightIcon } from "lucide-react";

export function SidebarLeft() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Team />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="border-b border-dashed">
          {isHomePage ? (
            <>
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
            </>
          ) : (
            <>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <Link href={"/"}>
                  <Button variant={"outline"} className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </SidebarGroupContent>
            </>
          )}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <a
              href="https://t.me/NebulaExploreBot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center justify-center gap-2 p-2">
                <CircleArrowOutUpRightIcon size={16} />
                <p>Try with Telegram</p>
              </div>
            </a>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-dashed">
        <ConnectButton />
      </SidebarFooter>
    </Sidebar>
  );
}

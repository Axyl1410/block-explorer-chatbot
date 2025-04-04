import { ChatSetting } from "@/components/chat/chat-setting";
import ScrollDown from "@/components/common/scroll-down";
import { SidebarLeft } from "@/components/layout/sidebar-left";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { ModeToggle } from "@/components/common/theme-toggle";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  fallback: ["system-ui", "sans-serif"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Nebula blockchain explorer",
  description: "Explore your blockchain data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-[family-name:var(--font-poppins)] antialiased",
          poppins.variable,
        )}
      >
        <Providers>
          <SidebarLeft />
          <SidebarInset>
            <header className="fixed top-0 z-10">
              <SidebarTrigger />
              <ChatSetting />
              <ModeToggle />
            </header>
            <main className="w-full">{children}</main>
          </SidebarInset>
          <ScrollDown className="dark:bg-neutral-900" />
        </Providers>
      </body>
    </html>
  );
}

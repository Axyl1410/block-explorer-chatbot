import { ThemeProvider } from "@/components/common/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ThirdwebProvider } from "thirdweb/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <NextTopLoader />
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster closeButton position="top-right" />
        <SidebarProvider defaultOpen>{children}</SidebarProvider>
      </ThemeProvider>
    </ThirdwebProvider>
  );
}

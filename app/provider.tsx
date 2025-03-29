import { SidebarProvider } from "@/components/ui/sidebar";
import NextTopLoader from "nextjs-toploader";
import { ThirdwebProvider } from "thirdweb/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <NextTopLoader />
      <SidebarProvider defaultOpen>{children}</SidebarProvider>
    </ThirdwebProvider>
  );
}

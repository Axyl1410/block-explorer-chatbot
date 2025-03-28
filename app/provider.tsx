import { SidebarProvider } from "@/components/ui/sidebar";
import { ThirdwebProvider } from "thirdweb/react";
import NextTopLoader from "nextjs-toploader";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <NextTopLoader />
      <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
    </ThirdwebProvider>
  );
}

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ComboboxDemo } from "../common/ComboboxDemo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function SidebarRight() {
  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarHeader>
          <div className="font-bold">Context</div>
          <p className="text-sm">Provide context to Nebula for your prompts</p>
        </SidebarHeader>
        <SidebarGroup>
          <div className="mb-2 font-bold">Chain IDs</div>
          <ComboboxDemo />
          <div className="mt-4 mb-2 font-bold">Address</div>
          <Input className="bg-background" placeholder="Address" />
          <div className="mt-4 flex justify-end">
            <Button className="w-fit">Update Context</Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

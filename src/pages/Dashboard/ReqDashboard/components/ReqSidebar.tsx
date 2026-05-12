import { SidebarUserHeader } from "../../shared/components/SidebarHeader"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CustomSidebarFooter } from "../../shared/components/SidebarFooter"
import { ReqSidebarItem } from "./ReqSidebarItem"


export default function  ReqSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarUserHeader/>
      </SidebarHeader>
      <SidebarContent>
        <ReqSidebarItem/>
      </SidebarContent>
      <SidebarFooter>
        <CustomSidebarFooter/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

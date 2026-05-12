import {
  ClipboardPenLine,
  LayoutGrid,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";

const dashboard = [
  {
    title: "Dashboard",
    url: "/requisitioner/dashboard",
    icon: LayoutGrid,
  },
];

const procurement = [
  {
    title: "Purchase Request",
    url: "/requisitioner/purchase-request",
    icon: ClipboardPenLine,
  },
];



export function ReqSidebarItem() {

  return (
    <SidebarGroup className="">

  <SidebarGroupLabel>Analytics</SidebarGroupLabel>
  <SidebarMenu>
    {dashboard.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className="px-4 py-6"
          isActive={location.pathname === item.url}
        >
          <Link to={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>

  <SidebarGroupLabel>Procurement</SidebarGroupLabel>
  <SidebarMenu>
    {procurement.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          className="px-4 py-6"
          isActive={location.pathname === item.url}
        >
          <Link to={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
</SidebarGroup>
  )
}

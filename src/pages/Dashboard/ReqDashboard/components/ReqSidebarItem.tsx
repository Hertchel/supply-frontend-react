
import {
  ClipboardPenLine,
  LayoutGrid,
  Package,
  Tags,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router-dom";

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

const inventory = [
  {
    title: "Inventory",
    url: "/requisitioner/inventory",
    icon: Package,
  },
];

const property = [
  {
    title: "Property",
    url: "/requisitioner/property",
    icon: Tags,
  },
];

export function ReqSidebarItem() {
  const location = useLocation();

  return (
    <SidebarGroup>
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

      <SidebarGroupLabel>Inventory</SidebarGroupLabel>
      <SidebarMenu>
        {inventory.map((item) => (
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

      <SidebarMenu>
        {property.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className="px-4 py-6"
              isActive={location.pathname.startsWith(item.url)}
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
  );
}

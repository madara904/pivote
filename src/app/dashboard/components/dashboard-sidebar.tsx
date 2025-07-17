"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { 
  Package, 
  Settings, 
  BarChart3,
  ClipboardList,
  House
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";

const menuItems = {
  main: [
    {
      title: "Übersicht",
      url: "/dashboard",
      icon: House,
    },
    {
      title: "Frachtanfragen",
      url: "/dashboard/frachtanfragen",
      icon: ClipboardList,
    },
    {
      title: "Sendungen",
      url: "/dashboard/sendungen",
      icon: Package,
    },
    {
      title: "Statistiken",
      url: "/dashboard/statistiken",
      icon: BarChart3,
    },
  ],
  settings: [
    {
      title: "Einstellungen",
      url: "/dashboard/einstellungen",
      icon: Settings,
    },
  ],
};

const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! bg-primary/5 border-r border-accent shadow-sm"
      {...props}
      collapsible="icon" 
    >
      <SidebarContent>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="m-0"/>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.settings.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      </SidebarContent>
      <SidebarFooter className="">
          <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;

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
  useSidebar,
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
      url: "/dashboard/forwarder",
      icon: House,
    },
    {
      title: "Frachtanfragen",
      url: "/dashboard/forwarder/frachtanfragen",
      icon: ClipboardList,
    },
    {
      title: "Sendungen",
      url: "/dashboard/forwarder/sendungen",
      icon: Package,
    },
    {
      title: "Statistiken",
      url: "/dashboard/forwarder/statistiken",
      icon: BarChart3,
    },
  ],
  settings: [
    {
      title: "Einstellungen",
      url: "/dashboard/forwarder/einstellungen",
      icon: Settings,
    },
  ],
};

const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! bg-primary/5 border-r border-accent"
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
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} onClick={() => setOpenMobile(false)}>
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

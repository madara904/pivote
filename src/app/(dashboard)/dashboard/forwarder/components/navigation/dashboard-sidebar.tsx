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
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Link2,
  Settings, 
  ClipboardList,
  House,
  LogsIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      title: "Verbindungen",
      url: "/dashboard/forwarder/verbindungen",
      icon: Link2,
    },
    {
      title: "Logs & Events",
      url: "/dashboard/forwarder/logs",
      icon: LogsIcon,
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
      className="bg-primary/5 border-r border-accent"
      style={{ 
        top: 'calc(var(--header-height) + var(--banner-height, 0px))',
        height: 'calc(100svh - var(--header-height) - var(--banner-height, 0px))'
      }}
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
                    <Link prefetch href={item.url} onClick={() => setOpenMobile(false)}>
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
                  <Link prefetch href={item.url} onClick={() => setOpenMobile(false)}>
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
    </Sidebar>
  );
};

export default DashboardSidebar;

"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardUserButton } from "./dashboard-user-button";
import { DashboardCommand } from "./dashboard-command";

import Link from "next/link";
import { Fragment, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}



export function SiteHeader() {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard/forwarder",
    });

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      if (segment === "dashboard" || currentPath === "/dashboard/forwarder") return;

      // Check if segment is a UUID (contains hyphens and is long)
      const isUUID = segment.includes("-") && segment.length > 20;
      
      let label: string;
      if (isUUID) {
        // Truncate UUID to show first 8 characters + "..."
        label = `${segment.substring(0, 8)}...`;
      } else {
        // Normal processing for non-UUID segments
        label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-background sticky z-50 flex w-full flex-col border-b" style={{ top: 'var(--banner-height, 0px)' }}>
      <div className="flex h-[var(--header-height)] min-h-[56px] w-full items-center px-4">
        <SidebarTrigger className="mr-2 md:hidden" />
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/forwarder" className="inline-flex items-center">
                  <Logo className="h-7 w-auto text-primary flex-shrink-0" style={{ marginTop: '-0.125rem' }} />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((crumb) => (
              <Fragment key={crumb.href}>
                <BreadcrumbSeparator className="text-accent-foreground/60 [&>svg]:size-3.5">
                  <Slash className="-rotate-15" strokeWidth={1.5} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        

        <div className="lg:flex items-center gap-2 ml-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setCommandOpen(true)
            }
          >
            <Search className="h-4 w-4 opacity-70" />
          </Button>
          <DashboardUserButton />
        </div>
        
      </div>
      <div className="flex min-h-[40px] w-full items-center border-t px-4 md:hidden">
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/forwarder" className="inline-flex items-center">
                  <Logo className="h-7 ml-1 w-auto text-primary flex-shrink-0" style={{ marginTop: '-0.125rem' }} />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((crumb) => (
              <Fragment key={crumb.href}>
                <BreadcrumbSeparator className="text-accent-foreground/60 [&>svg]:size-3.5">
                  <Slash className="-rotate-15" strokeWidth={1.5} />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
    </header>
  );
}
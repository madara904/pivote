"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { SearchForm } from "./dashboard-search-form";
import { Slash } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

export function SiteHeader() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
    });

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      if (segment === "dashboard") return;

      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

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
    <header className="bg-background sticky top-0 z-50 flex w-full flex-col border-b">
      <div className="flex h-(--header-height) w-full items-center px-4">
        <SidebarTrigger className="mr-2 md:hidden" />
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">
                  <Button className="h-7 w-7" variant="link" size="icon">
                    <img src="/logo.svg" width={20} height={20} alt="Logo" />
                  </Button>
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
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
      <div className="flex h-10 w-full items-center border-t px-4 md:hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">
                  <Button className="h-7 w-7" variant="link" size="icon">
                    <img src="/logo.svg" width={20} height={20} alt="Logo" />
                  </Button>
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
    </header>
  );
}

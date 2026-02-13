"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";

const NAV_ITEMS = [
  { key: "konto", label: "Konto", href: "/dashboard/forwarder/einstellungen/konto" },
  { key: "sicherheit", label: "Sicherheit", href: "/dashboard/forwarder/einstellungen/sicherheit" },
  { key: "organisation", label: "Organisation", href: "/dashboard/forwarder/einstellungen/organisation" },
  { key: "Abrechnung", label: "Abrechnung", href: "/dashboard/forwarder/einstellungen/abrechnung" },
  { key: "Logs & Events", label: "Logs", href: "/dashboard/forwarder/einstellungen/logs" },
] as const;

export default function EinstellungenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPathname =
    pathname === "/dashboard/forwarder/einstellungen"
      ? "/dashboard/forwarder/einstellungen/konto"
      : pathname;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-8 pb-0 px-6 md:px-10 border-b bg-background/50 backdrop-blur-md">
        <PageHeader title="Einstellungen" />
        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ key, label, href }) => {
            const isActive = normalizedPathname === href;
            return (
              <Link
                key={key}
                href={href}
                prefetch
                className={cn(
                  "relative pb-3 text-sm transition-all duration-200 ease-in-out whitespace-nowrap",
                  isActive 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>


      <PageContainer>
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </PageContainer>
    </div>
  );
}
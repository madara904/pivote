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
  { key: "abrechnung", label: "Abrechnung", href: "/dashboard/forwarder/einstellungen/abrechnung" },
  { key: "audit-logs", label: "Audit Logs", href: "/dashboard/forwarder/einstellungen/audit-logs" },
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
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar min-h-[44px]">
          {NAV_ITEMS.map(({ key, label, href }) => {
            const isActive = normalizedPathname === href;
            return (
              <Link
                key={key}
                href={href}
                prefetch
                className={cn(
                  "relative -mb-px px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 whitespace-nowrap border-b-2 border-transparent",
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>


      <PageContainer>
        <div className="w-full animate-in fade-in duration-500">
          {children}
        </div>
      </PageContainer>
    </div>
  );
}
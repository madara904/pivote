"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Lock, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { key: "account", label: "Konto", icon: User, href: "/dashboard/forwarder/einstellungen/account" },
  { key: "security", label: "Sicherheit", icon: Lock, href: "/dashboard/forwarder/einstellungen/security" },
  { key: "org", label: "Organisation", icon: Building2, href: "/dashboard/forwarder/einstellungen/org" },
] as const;

export default function EinstellungenLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  return (
    <div className={cn("flex", isMobile ? "flex-col" : "")}>
      <nav
        className={cn(
          "flex gap-2 bg-background",
          isMobile ? "flex-row p-4 border-b" : "w-56 p-6 flex-col"
        )}
      >
        {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Button
              key={key}
              asChild
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2",
                isMobile ? "justify-center flex-1" : "justify-start w-full"
              )}
              title={isMobile ? label : undefined}
            >
              <Link href={href}>
                <Icon className="w-5 h-5" />
                {!isMobile && <span>{label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}

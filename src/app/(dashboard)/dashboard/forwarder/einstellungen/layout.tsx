"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "account", label: "Konto", href: "/dashboard/forwarder/einstellungen/account" },
  { key: "security", label: "Sicherheit", href: "/dashboard/forwarder/einstellungen/security" },
  { key: "org", label: "Organisation", href: "/dashboard/forwarder/einstellungen/org" },
] as const;

export default function EinstellungenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-8 pb-0 px-6 md:px-10 border-b bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Einstellungen</h1>
        
        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ key, label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={key}
                href={href}
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


      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
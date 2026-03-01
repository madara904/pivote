"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: React.ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  variant = "default",
  children,
  className,
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "py-6 px-6 bg-card border border-border",
        "hover:border-foreground/10 transition-colors duration-200",
        variant === "destructive" && "border-destructive/20 hover:border-destructive/30",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3
            className={cn(
              "text-[13px] font-bold tracking-tight flex items-center gap-2",
              variant === "destructive" ? "text-destructive" : "text-foreground"
            )}
          >
            {Icon && <Icon className="size-4 shrink-0 opacity-70" />}
            {title}
          </h3>
          <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="md:col-span-2 w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

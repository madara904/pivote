"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

interface PageHeaderProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

interface PageContainerProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageLayout - Wrapper für gesamte Seitenstruktur
 * Stellt einheitliches Padding und Spacing bereit
 */
function PageLayout({ className, children, ...props }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageHeader - Header-Bereich einer Seite
 * Einheitliches Padding: px-4 md:px-8 py-4
 * Optional: border-b für visuelle Trennung
 */
function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 md:px-8 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageHeaderWithBorder - Header mit Border-Trennung
 */
function PageHeaderWithBorder({ className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border bg-card",
        className
      )}
    >
      <PageHeader {...props}>
        {children}
      </PageHeader>
    </div>
  );
}

/**
 * PageContainer - Container-Bereich für Seiteninhalt
 * Einheitliches Padding: px-4 md:px-8 pb-4
 * Standard Gap: gap-y-4
 */
function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "px-4 md:px-8 pb-4 flex flex-col gap-y-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  PageLayout,
  PageHeader,
  PageHeaderWithBorder,
  PageContainer,
};

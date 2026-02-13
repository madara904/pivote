"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  className?: string;
}

interface PageContainerProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  className?: string;
}


function PageHeader({ title, className }: PageHeaderProps) {
  return (
    <h1 className={cn("text-2xl font-bold text-foreground mb-6", className)}>
      {title}
    </h1>
  );
}


function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full p-6 sm:p-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { PageContainer, PageHeader };

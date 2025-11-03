"use client";

import React from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onReset?: () => void;
  fallback?: React.ReactNode;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
  title,
  description,
}: FallbackProps & {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <Empty className="border border-dashed rounded-lg py-16">
        <EmptyHeader>
          <EmptyMedia>
            <AlertCircle className="h-16 w-16 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>
            {title || "Ein Fehler ist aufgetreten"}
          </EmptyTitle>
          <EmptyDescription>
            {description ||
              "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support."}
          </EmptyDescription>
          <div className="mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={resetErrorBoundary}
              className="group hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              Erneut versuchen
            </Button>
          </div>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

export function ErrorBoundary({
  children,
  title,
  description,
  onReset,
  fallback,
}: ErrorBoundaryProps) {
  const fallbackRender = (props: FallbackProps) => {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <ErrorFallback
        {...props}
        title={title}
        description={description}
      />
    );
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallbackRender}
      onReset={onReset}
      onError={(error, errorInfo) => {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

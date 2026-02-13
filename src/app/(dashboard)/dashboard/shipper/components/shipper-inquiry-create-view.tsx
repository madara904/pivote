"use client";

import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import InquiryForm from "./inquiry-form";
import { DotLoading } from "@/components/ui/dot-loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/ui/page-layout";

const ShipperInquiryCreateView = () => {
  const trpcOptions = useTRPC();
  const {
    data: forwardersData,
    error: forwardersError,
    isLoading: forwardersLoading,
  } = useQuery(trpcOptions.inquiry.shipper.getConnectedForwarders.queryOptions());

  const errorMessage = useMemo(
    () => forwardersError?.message || "Unbekannter Fehler",
    [forwardersError]
  );

  if (forwardersError) {
    return (
      <PageContainer>
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Fehler beim Laden der Spediteure: {errorMessage}
            </AlertDescription>
          </Alert>
      </PageContainer>
    );
  }

  if (forwardersLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-8">
            <DotLoading size="md" />
          </div>
      </PageContainer>
    );
  }

  const forwarders = (forwardersData || []).map((forwarder) => ({
    ...forwarder,
    city: forwarder.city || "",
    country: forwarder.country || "",
    isActive: forwarder.isActive ?? true,
  }));

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Neue Frachtanfrage
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Erstellen Sie eine neue Anfrage und wählen Sie verbundene Spediteure aus.
        </p>
      </div>
      <InquiryForm forwarders={forwarders} />
    </PageContainer>
  );
};

export default ShipperInquiryCreateView;

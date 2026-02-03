"use client";

import { useMemo } from "react";
import { trpc } from "@/trpc/client";
import InquiryForm from "./inquiry-form";
import { DotLoading } from "@/components/ui/dot-loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

const ShipperInquiryCreateView = () => {
  const {
    data: forwardersData,
    error: forwardersError,
    isLoading: forwardersLoading,
  } = trpc.inquiry.shipper.getConnectedForwarders.useQuery();

  const errorMessage = useMemo(
    () => forwardersError?.message || "Unbekannter Fehler",
    [forwardersError]
  );

  if (forwardersError) {
    return (
      <PageLayout>
        <PageContainer>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Fehler beim Laden der Spediteure: {errorMessage}
            </AlertDescription>
          </Alert>
        </PageContainer>
      </PageLayout>
    );
  }

  if (forwardersLoading) {
    return (
      <PageLayout>
        <PageContainer>
          <div className="flex items-center justify-center py-8">
            <DotLoading size="md" />
          </div>
        </PageContainer>
      </PageLayout>
    );
  }

  const forwarders = (forwardersData || []).map((forwarder) => ({
    ...forwarder,
    city: forwarder.city || "",
    country: forwarder.country || "",
    isActive: forwarder.isActive ?? true,
  }));

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Neue Frachtanfrage
          </h1>
          <p className="text-sm text-muted-foreground">
            Erstellen Sie eine neue Anfrage und wählen Sie verbundene Spediteure aus.
          </p>
        </div>
      </PageHeaderWithBorder>
      <PageContainer className="pt-6 pb-8">
        <InquiryForm forwarders={forwarders} />
      </PageContainer>
    </PageLayout>
  );
};

export default ShipperInquiryCreateView;

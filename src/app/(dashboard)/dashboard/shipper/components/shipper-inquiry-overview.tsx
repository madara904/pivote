"use client";

import { trpc } from "@/trpc/client";
import { DotLoading } from "@/components/ui/dot-loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import InquiryList from "./inquiry-list";

const ShipperInquiryOverview = () => {
  const { data, isLoading, error } = trpc.inquiry.shipper.getMyInquiries.useQuery();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <DotLoading size="md" />
      </div>
    );
  }

  const inquiries = data.map((inquiry) => ({
    ...inquiry,
    sentToForwarders: inquiry.sentToForwarders.map((forwarder) => ({
      ...forwarder,
      viewedAt: forwarder.viewedAt ?? null,
    })),
  }));

  return <InquiryList inquiries={inquiries} />;
};

export default ShipperInquiryOverview;

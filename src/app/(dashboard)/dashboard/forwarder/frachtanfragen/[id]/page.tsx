import { requireForwarderAccess } from "@/lib/auth-utils";
import InquiryDetailView from "./components/inquiry-detail-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { InquiryLoadingState } from "../components/inquiry-loading-state";

interface InquiryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  await requireForwarderAccess();

  // Await params before using its properties
  const { id } = await params;

  trpc.inquiry.forwarder.getInquiryDetail.prefetch({ inquiryId: id });


  return (
    <HydrateClient>
      <Suspense fallback={<InquiryLoadingState text="Lade Frachtanfrage" />}>
    <InquiryDetailView inquiryId={id} />    
    </Suspense>
    </HydrateClient>

  );
}

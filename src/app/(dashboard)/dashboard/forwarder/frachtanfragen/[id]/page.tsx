import { HydrateClient, trpc } from "@/trpc/server";
import { requireForwarderAccess } from "@/lib/auth-utils";
import InquiryDetailView from "./components/inquiry-detail-view";

interface InquiryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  await requireForwarderAccess();

  // Await params before using its properties
  const { id } = await params;

  // Prefetch the inquiry detail data
  await trpc.inquiry.forwarder.getInquiryDetail.prefetch({ inquiryId: id });

  return (
    <HydrateClient>
      <InquiryDetailView inquiryId={id} />
    </HydrateClient>
  );
}

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

  // Remove prefetch to eliminate server-side latency
  // Let the client handle the query with proper loading states

  return (
    <InquiryDetailView inquiryId={id} />
  );
}

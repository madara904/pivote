import { requireShipperAccess } from "@/lib/auth-utils";
import QuotationView from "../../../components/quotation-view";
import { PageContainer } from "@/components/ui/page-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ShipperInquiryOffersPageProps {
  params: Promise<{ id: string }>;
}

const ShipperInquiryOffersPage = async ({ params }: ShipperInquiryOffersPageProps) => {
  await requireShipperAccess();
  const resolvedParams = await params;

  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/dashboard/shipper/frachtanfragen/${resolvedParams.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Angebote</h1>
          <p className="text-sm text-muted-foreground">Alle Angebote im Detail.</p>
        </div>
      </div>
      <QuotationView inquiryId={resolvedParams.id} />
    </PageContainer>
  );
};

export default ShipperInquiryOffersPage;

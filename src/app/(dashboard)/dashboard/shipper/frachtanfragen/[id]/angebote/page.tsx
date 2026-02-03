import { requireShipperAccess } from "@/lib/auth-utils";
import QuotationView from "../../../components/quotation-view";
import { PageContainer, PageHeaderWithBorder, PageLayout } from "@/components/ui/page-layout";
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
    <PageLayout>
      <PageHeaderWithBorder>
        <div className="flex items-center gap-3">
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
      </PageHeaderWithBorder>
      <PageContainer className="pt-4 pb-6">
        <QuotationView inquiryId={resolvedParams.id} />
      </PageContainer>
    </PageLayout>
  );
};

export default ShipperInquiryOffersPage;

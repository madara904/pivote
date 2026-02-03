import Link from "next/link";
import { requireShipperAccess } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeaderWithBorder, PageLayout } from "@/components/ui/page-layout";
import { Plus } from "lucide-react";
import ShipperInquiryOverview from "../components/shipper-inquiry-overview";

const ShipperInquiriesPage = async () => {
  await requireShipperAccess();

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Frachtanfragen</h1>
            <p className="text-sm text-muted-foreground">
              Übersicht aller erstellten Anfragen mit schneller Auswahl.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/shipper/frachtanfragen/neu">
              <Plus className="mr-2 h-4 w-4" />
              Neue Anfrage
            </Link>
          </Button>
        </div>
      </PageHeaderWithBorder>
      <PageContainer className="pt-6 pb-8">
        <ShipperInquiryOverview />
      </PageContainer>
    </PageLayout>
  );
};

export default ShipperInquiriesPage;

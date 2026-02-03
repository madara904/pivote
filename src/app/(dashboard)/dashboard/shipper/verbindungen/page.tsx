import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperConnectionsView from "../components/shipper-connections-view";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

const ShipperConnectionsPage = async () => {
  await requireShipperAccess();

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Spediteurverbindungen
          </h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre Spediteurverbindungen und finden Sie neue Partner.
          </p>
        </div>
      </PageHeaderWithBorder>
      <PageContainer className="pt-6 pb-8">
        <ShipperConnectionsView />
      </PageContainer>
    </PageLayout>
  );
};

export default ShipperConnectionsPage;

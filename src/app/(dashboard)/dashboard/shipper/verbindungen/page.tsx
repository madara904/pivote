import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperConnectionsView from "../components/shipper-connections-view";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";

const ShipperConnectionsPage = async () => {
  await requireShipperAccess();

  return (
    <PageContainer>
      <PageHeader title="Spediteurverbindungen" />
      <ShipperConnectionsView />
    </PageContainer>
  );
};

export default ShipperConnectionsPage;

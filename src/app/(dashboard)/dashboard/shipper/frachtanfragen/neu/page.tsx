import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperInquiryCreateView from "../../components/shipper-inquiry-create-view";
import { PageContainer } from "@/components/ui/page-layout";

const ShipperInquiryCreatePage = async () => {
  await requireShipperAccess();

  return (
    <PageContainer>
      <ShipperInquiryCreateView />
    </PageContainer>
  );
};

export default ShipperInquiryCreatePage;

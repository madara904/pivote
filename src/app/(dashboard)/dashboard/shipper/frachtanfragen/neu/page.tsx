import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperInquiryCreateView from "../../components/shipper-inquiry-create-view";

const ShipperInquiryCreatePage = async () => {
  await requireShipperAccess();

  return <ShipperInquiryCreateView />;
};

export default ShipperInquiryCreatePage;

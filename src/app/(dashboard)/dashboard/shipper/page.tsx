import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperInquiryView from "./components/shipper-inquiry-view";

const ShipperDashboard = async () => {
  const {} = await requireShipperAccess();


  return (
    <div>
      <h1>Shipper Dashboard</h1>

      <ShipperInquiryView />
    </div>
  )
}

export default ShipperDashboard
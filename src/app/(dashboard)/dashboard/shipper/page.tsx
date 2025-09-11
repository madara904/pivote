import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperInquiryView from "./components/shipper-inquiry-view";

const ShipperDashboard = async () => {
  const { orgType, user} = await requireShipperAccess();


  return (
    <div>
      <h1>Shipper Dashboard</h1>
      <p>Welcome, {user.name} from {orgType}</p>
      <p>Organization Type: {orgType}</p>

      <ShipperInquiryView />
    </div>
  )
}

export default ShipperDashboard
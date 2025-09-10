import { requireShipperAccess } from "@/lib/auth-utils";
import ShipperInquiryView from "./components/shipper-inquiry-view";

const ShipperDashboard = async () => {
  const { user, organization } = await requireShipperAccess();

  return (
    <div>
      <h1>Shipper Dashboard</h1>
      <p>Welcome, {user.name} from {organization?.name}</p>
      <p>Organization Type: {organization?.type}</p>

      <ShipperInquiryView />
    </div>
  )
}

export default ShipperDashboard
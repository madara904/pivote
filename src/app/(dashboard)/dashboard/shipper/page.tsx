import { requireShipperAccess } from "@/lib/auth-utils";

const ShipperDashboard = async () => {
  const { user, organization } = await requireShipperAccess();

  return (
    <div>
      <h1>Shipper Dashboard</h1>
      <p>Welcome, {user.name} from {organization.name}</p>
      <p>Organization Type: {organization.type}</p>
    </div>
  )
}

export default ShipperDashboard
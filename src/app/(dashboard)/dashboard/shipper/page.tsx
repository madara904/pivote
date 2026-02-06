import { requireShipperAccess } from "@/lib/auth-utils";


const ShipperDashboard = async () => {
  await requireShipperAccess();



  return ( <></>
  );
};

export default ShipperDashboard;
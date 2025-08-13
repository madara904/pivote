
import { requireAnyOrganizationAccess } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const { organization } = await requireAnyOrganizationAccess();
  redirect(`/dashboard/${organization.type}`);
};

export default Dashboard;
import { requireAnyOrganizationAccess } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const { orgType } = await requireAnyOrganizationAccess();

  redirect(`/dashboard/${orgType}`);
};

export default Dashboard;
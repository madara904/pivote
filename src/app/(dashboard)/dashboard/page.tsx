import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Dashboard = async () => {

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log("Session:", session);


  if (!session) {
    redirect("/sign-in");
  }


  const activeOrgId = session.session.activeOrganizationId;
  console.log("Active Org ID:", activeOrgId);

  if (!activeOrgId) {
    redirect("/complete-registration");
  }

  const org = await auth.api.getFullOrganization({ 
    headers: await headers() 
  });
  
  if (!org) redirect("/complete-registration");
  
  const metadata = typeof org.metadata === "string"
    ? JSON.parse(org.metadata)
    : org.metadata;
  
  const orgType = metadata?.organizationType;
  
  if (orgType === "shipper") redirect("/dashboard/shipper");
  if (orgType === "forwarder") redirect("/dashboard/forwarder");
  
  redirect("/complete-registration");
};

export default Dashboard;
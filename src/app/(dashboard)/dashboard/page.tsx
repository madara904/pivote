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

  redirect("/dashboard/forwarder")
  

};

export default Dashboard;
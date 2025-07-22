import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardOverview from "./components/view/dashboard-overview";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in")
  }
  

  return (
    <main>
      <DashboardOverview />
    </main>
  );
}

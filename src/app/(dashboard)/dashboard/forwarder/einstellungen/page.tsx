import SettingsView from "./components/view/settings-view";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";


export default async function EinstellungenPage() {

  const session = await auth.api.getSession({
    headers: await headers()
})

  if(!session)
    redirect("/sign-in")


  return <SettingsView />;
}

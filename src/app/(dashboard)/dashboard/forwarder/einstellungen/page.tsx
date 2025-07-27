import SettingsView from "./components/view/settings-view";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { LogoLoader } from "@/components/ui/loader";

export default async function EinstellungenPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return (
    <Suspense fallback={<LogoLoader />}>
      <SettingsView />
    </Suspense>
  );
}

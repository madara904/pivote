import { LogoLoader } from "@/components/ui/loader";
import SettingsView from "./components/view/settings-view";
import { requireForwarderAccess } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function EinstellungenPage() {
  await requireForwarderAccess();

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <LogoLoader />
      </div>
    }>
      <SettingsView />
    </Suspense>
  );
}

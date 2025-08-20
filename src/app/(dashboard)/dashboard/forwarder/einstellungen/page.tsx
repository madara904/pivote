import SettingsView from "./components/view/settings-view";
import { requireForwarderAccess } from "@/lib/auth-utils";

export default async function EinstellungenPage() {
  await requireForwarderAccess();

  return (
      <SettingsView />
  );
}

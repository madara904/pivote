import { requireForwarderAccess } from "@/lib/auth-utils";
import AccountSettingsPage from "./konto/page";

export default async function EinstellungenPage() {
  await requireForwarderAccess();

  return <AccountSettingsPage />;
}

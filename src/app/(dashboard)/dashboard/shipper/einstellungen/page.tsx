import { requireShipperAccess } from "@/lib/auth-utils";
import AccountSettingsPage from "./konto/page";

export default async function EinstellungenPage() {
  await requireShipperAccess();

  return <AccountSettingsPage />;
}

import { requireShipperAccess } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function EinstellungenPage() {
  await requireShipperAccess();

  redirect("/dashboard/shipper/einstellungen/account");
}

import { requireForwarderAccess } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function EinstellungenPage() {
  await requireForwarderAccess();

  redirect("/dashboard/forwarder/einstellungen/account");
}

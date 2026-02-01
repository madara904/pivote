import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangePasswordCard from "../components/security/change-password-card";

export default async function SecuritySettingsPage() {
  await requireForwarderAccess();

  return <ChangePasswordCard />;
}

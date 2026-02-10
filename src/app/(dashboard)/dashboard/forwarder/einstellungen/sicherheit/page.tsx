import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangePasswordCard from "../components/security/change-password-card";
import MfaCard from "../components/security/mfa-card";


export default async function SecuritySettingsPage() {
  await requireForwarderAccess();

  return (
      <>
      <ChangePasswordCard />
      <MfaCard />
      </>
  );
}

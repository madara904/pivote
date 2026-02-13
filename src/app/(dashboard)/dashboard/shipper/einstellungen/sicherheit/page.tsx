import { requireShipperAccess } from "@/lib/auth-utils";
import ChangePasswordCard from "../../../forwarder/einstellungen/components/security/change-password-card";
import MfaCard from "../../../forwarder/einstellungen/components/security/mfa-card";

export default async function SecuritySettingsPage() {
  await requireShipperAccess();

  return (
    <>
      <ChangePasswordCard />
      <MfaCard />
    </>
  );
}

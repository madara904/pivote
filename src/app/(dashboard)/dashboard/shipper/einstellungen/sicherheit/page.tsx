import { requireShipperAccess } from "@/lib/auth-utils";
import ChangePasswordCard from "../../../forwarder/einstellungen/components/security/change-password-card";
import MfaCard from "../../../forwarder/einstellungen/components/security/mfa-card";
import { PageContainer } from "@/components/ui/page-layout";

export default async function SecuritySettingsPage() {
  await requireShipperAccess();

  return (
    <PageContainer>
      <ChangePasswordCard />
      <MfaCard />
    </PageContainer>
  );
}

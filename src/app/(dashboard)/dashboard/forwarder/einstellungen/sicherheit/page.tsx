import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangePasswordCard from "../components/security/change-password-card";
import MfaCard from "../components/security/mfa-card";
import { PageContainer } from "@/components/ui/page-layout";

export default async function SecuritySettingsPage() {
  await requireForwarderAccess();

  return (
    <PageContainer>
      <ChangePasswordCard />
      <MfaCard />
    </PageContainer>
  );
}

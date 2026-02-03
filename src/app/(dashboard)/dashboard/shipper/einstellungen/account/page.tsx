import { requireShipperAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../../../forwarder/einstellungen/components/account/change-email-card";
import DeleteAccountCard from "../../../forwarder/einstellungen/components/account/delete-account-card";
import UpdateNameCard from "../../../forwarder/einstellungen/components/account/update-name-card";
import { PageContainer } from "@/components/ui/page-layout";

export default async function AccountSettingsPage() {
  await requireShipperAccess();

  return (
    <PageContainer className="space-y-4">
      <UpdateNameCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </PageContainer>
  );
}

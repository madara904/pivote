import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../components/account/change-email-card";
import DeleteAccountCard from "../components/account/delete-account-card";
import UpdateNameCard from "../components/account/update-name-card";
import { PageContainer } from "@/components/ui/page-layout";

export default async function AccountSettingsPage() {
  await requireForwarderAccess();

  return (
    <PageContainer className="space-y-4">
      <UpdateNameCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </PageContainer>
  );
}

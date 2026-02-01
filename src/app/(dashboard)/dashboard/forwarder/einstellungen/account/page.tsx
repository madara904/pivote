import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../components/account/change-email-card";
import DeleteAccountCard from "../components/account/delete-account-card";
import UpdateNameCard from "../components/account/update-name-card";

export default async function AccountSettingsPage() {
  await requireForwarderAccess();

  return (
    <>
      <UpdateNameCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </>
  );
}

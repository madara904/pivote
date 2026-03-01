import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../components/account/change-email-card";
import DeleteAccountCard from "../components/account/delete-account-card";
import UpdateNameCard from "../components/account/update-name-card";
import { Suspense } from "react";
import Loading from "./loading";

export default async function AccountSettingsPage() {
  await requireForwarderAccess();

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full space-y-4">
        <UpdateNameCard />
        <ChangeEmailCard />
        <DeleteAccountCard />
      </div>
    </Suspense>
  );
}
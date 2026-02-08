import { requireShipperAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../../../forwarder/einstellungen/components/account/change-email-card";
import DeleteAccountCard from "../../../forwarder/einstellungen/components/account/delete-account-card";
import UpdateNameCard from "../../../forwarder/einstellungen/components/account/update-name-card";
import { PageContainer } from "@/components/ui/page-layout";
import { Suspense } from "react";
import Loading from "./loading";

export default async function AccountSettingsPage() {
  await requireShipperAccess();

  return (
    <PageContainer>
      <Suspense fallback={<Loading />}>
        <div className="divide-y divide-border/50">
          <UpdateNameCard />
          <ChangeEmailCard />
          <DeleteAccountCard />
        </div>
      </Suspense>
    </PageContainer>
  );
}

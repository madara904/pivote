import { requireForwarderAccess } from "@/lib/auth-utils";
import ChangeEmailCard from "../components/account/change-email-card";
import DeleteAccountCard from "../components/account/delete-account-card";
import UpdateNameCard from "../components/account/update-name-card";
import { PageContainer } from "@/components/ui/page-layout";
import { Suspense } from "react";
import Loading from "./loading";
import { prefetch, trpc } from "@/trpc/server";

export default async function AccountSettingsPage() {
  await requireForwarderAccess();

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
import { requireForwarderAccess } from "@/lib/auth-utils";
import ForwarderConnectionsView from "./verbindungen-view";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { DotLoading } from "@/components/ui/dot-loading";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";

export default async function VerbindungenPage() {
  await requireForwarderAccess();

  return (
    <PageContainer>
      <PageHeader title="Partnerverbindungen" />
      <HydrateClient>
        <Suspense fallback={<DotLoading />}>
          <ForwarderConnectionsView />
        </Suspense>
      </HydrateClient>
    </PageContainer>
  );
}

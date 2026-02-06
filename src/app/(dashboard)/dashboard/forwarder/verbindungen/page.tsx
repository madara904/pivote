import { requireForwarderAccess } from "@/lib/auth-utils";
import ForwarderConnectionsView from "./verbindungen-view";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { DotLoading } from "@/components/ui/dot-loading";
import { Suspense } from "react";

export default async function VerbindungenPage() {
  await requireForwarderAccess();
  void prefetch(trpc.connections.forwarder.listPendingInvites.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<DotLoading />}>
        <ForwarderConnectionsView />
      </Suspense>
    </HydrateClient>
  );
}

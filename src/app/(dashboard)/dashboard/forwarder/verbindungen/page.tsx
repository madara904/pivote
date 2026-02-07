import { requireForwarderAccess } from "@/lib/auth-utils";
import ForwarderConnectionsView from "./verbindungen-view";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { DotLoading } from "@/components/ui/dot-loading";
import { Suspense } from "react";

export default async function VerbindungenPage() {
  await requireForwarderAccess();
  void prefetch(trpc.connections.forwarder.listPendingInvites.queryOptions());

  return (
    <>
    <div className="w-full p-6 sm:p-10">
      <h1 className="text-xl font-bold tracking-wide text-slate-900">Verbundene Partner</h1>
    </div>
    <HydrateClient>
        <Suspense fallback={<DotLoading />}>
          <ForwarderConnectionsView />
        </Suspense>
      </HydrateClient></>

  );
}

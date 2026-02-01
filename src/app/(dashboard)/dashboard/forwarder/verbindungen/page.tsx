import { requireForwarderAccess } from "@/lib/auth-utils";
import ForwarderConnectionsView from "./verbindungen-view";

export default async function VerbindungenPage() {
  await requireForwarderAccess();

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <ForwarderConnectionsView />
    </div>
  );
}

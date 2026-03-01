import { requireForwarderAccess } from "@/lib/auth-utils";
import AuditLogsView from "./audit-logs-view";

export default async function AuditLogsPage() {
  await requireForwarderAccess();

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Verfolgen Sie die Logs zu Ihren Aktionen.
      </p>
      <AuditLogsView />
    </div>
  );
}

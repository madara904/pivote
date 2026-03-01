import { db } from "@/db";
import { auditLog } from "@/db/schema";

type AuditAction = "create" | "update" | "read" | "delete";

interface LogAuditParams {
  organizationId: string;
  actorUserId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Schreibt einen Eintrag in die audit_log Tabelle (DSGVO-konforme Protokollierung).
 * Nicht werfen – Fehler werden geloggt, blockieren aber nicht die Hauptaktion.
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      organizationId: params.organizationId,
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[audit-log] Failed to write audit log:", err);
  }
}

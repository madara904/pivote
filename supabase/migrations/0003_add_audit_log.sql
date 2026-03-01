-- =============================================================================
-- Audit Log Table (separate from activity_event)
-- activity_event = Dashboard-Aktivität (user-facing)
-- audit_log = DSGVO-konforme Protokollierung (admin-only)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "actor_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "action" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text,
  "metadata" jsonb,
  "ip_address" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_log_organization_created_idx"
  ON "audit_log" ("organization_id", "created_at" DESC);

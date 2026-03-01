-- =============================================================================
-- Performance Indexes Migration
-- Based on Supabase Query Performance Advisor (real production query analysis)
-- Top 5 slow queries = ~99% of total query time
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. inquiry_forwarder (forwarder_organization_id)
--    ~68% of slow query time - Forwarder inquiry list (4124 + 544 calls)
--    JOIN: organization.id = inquiry_forwarder.forwarder_organization_id
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "inquiry_forwarder_forwarder_org_id_idx" 
  ON "inquiry_forwarder" ("forwarder_organization_id");

-- -----------------------------------------------------------------------------
-- 2. inquiry_forwarder (inquiry_id)
--    ~15% - Shipper inquiry detail lateral join (997 calls)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "inquiry_forwarder_inquiry_id_idx" 
  ON "inquiry_forwarder" ("inquiry_id");

-- -----------------------------------------------------------------------------
-- 3. inquiry_note (inquiry_id)
--    Subquery: (SELECT count(*) FROM inquiry_note WHERE inquiry_id = inquiry.id)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "inquiry_note_inquiry_id_idx" 
  ON "inquiry_note" ("inquiry_id");

-- -----------------------------------------------------------------------------
-- 4. activity_event (organization_id, created_at DESC)
--    ~10.5% - Dashboard activity feed (1744 calls)
--    WHERE organization_id = $1 ORDER BY created_at DESC
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "activity_event_organization_created_idx" 
  ON "activity_event" ("organization_id", "created_at" DESC);

-- -----------------------------------------------------------------------------
-- 5. organization_connection (forwarder_organization_id)
--    ~6% - Forwarder connection list (1510 calls)
--    WHERE forwarder_organization_id = $2 AND status = $3 ORDER BY created_at DESC
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "organization_connection_forwarder_org_id_idx" 
  ON "organization_connection" ("forwarder_organization_id");

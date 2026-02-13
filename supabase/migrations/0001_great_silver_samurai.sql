-- Normalize legacy status values before enum changes
UPDATE "inquiry" i
SET "status" = CASE
  WHEN i."status" = 'closed' AND EXISTS (
    SELECT 1
    FROM "quotation" q
    WHERE q."inquiry_id" = i."id" AND q."status" = 'accepted'
  ) THEN 'awarded'
  WHEN i."status" = 'closed' THEN 'cancelled'
  WHEN i."status" = 'rejected' THEN 'open'
  ELSE i."status"
END
WHERE i."status" IN ('closed', 'rejected');
--> statement-breakpoint
UPDATE "quotation"
SET "status" = 'rejected'
WHERE "status" = 'withdrawn';
--> statement-breakpoint

ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
--> statement-breakpoint
DROP TYPE "public"."inquiry_status";
--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'open', 'awarded', 'cancelled', 'expired');
--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."inquiry_status";
--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE "public"."inquiry_status" USING "status"::"public"."inquiry_status";
--> statement-breakpoint

ALTER TABLE "quotation" ALTER COLUMN "status" SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
--> statement-breakpoint
DROP TYPE "public"."quotation_status";
--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'submitted', 'accepted', 'rejected', 'expired');
--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."quotation_status";
--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DATA TYPE "public"."quotation_status" USING "status"::"public"."quotation_status";
--> statement-breakpoint

ALTER TABLE "quotation" DROP COLUMN IF EXISTS "withdrawn_at";
--> statement-breakpoint

-- Deduplicate invitation rows before adding uniqueness
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "inquiry_id", "forwarder_organization_id"
      ORDER BY
        CASE "response_status" WHEN 'quoted' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END,
        "created_at" DESC,
        "id" DESC
    ) AS rn
  FROM "inquiry_forwarder"
)
DELETE FROM "inquiry_forwarder" inf
USING ranked r
WHERE inf."id" = r."id" AND r.rn > 1;
--> statement-breakpoint

-- Deduplicate quotation rows before adding uniqueness
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "inquiry_id", "forwarder_organization_id"
      ORDER BY
        CASE "status"
          WHEN 'accepted' THEN 1
          WHEN 'submitted' THEN 2
          WHEN 'draft' THEN 3
          WHEN 'rejected' THEN 4
          ELSE 5
        END,
        COALESCE("updated_at", "created_at") DESC,
        "id" DESC
    ) AS rn
  FROM "quotation"
)
DELETE FROM "quotation" q
USING ranked r
WHERE q."id" = r."id" AND r.rn > 1;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inquiry_forwarder_inquiry_id_forwarder_organization_id_unique'
  ) THEN
    ALTER TABLE "inquiry_forwarder"
    ADD CONSTRAINT "inquiry_forwarder_inquiry_id_forwarder_organization_id_unique"
    UNIQUE("inquiry_id", "forwarder_organization_id");
  END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotation_inquiry_id_forwarder_organization_id_unique'
  ) THEN
    ALTER TABLE "quotation"
    ADD CONSTRAINT "quotation_inquiry_id_forwarder_organization_id_unique"
    UNIQUE("inquiry_id", "forwarder_organization_id");
  END IF;
END $$;
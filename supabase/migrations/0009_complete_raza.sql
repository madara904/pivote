CREATE TYPE "public"."service_direction" AS ENUM('import', 'export');--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "service_direction" "service_direction" DEFAULT 'import';--> statement-breakpoint
UPDATE "inquiry" SET "service_direction" = 'import' WHERE "service_direction" IS NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "service_direction" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "service_details";
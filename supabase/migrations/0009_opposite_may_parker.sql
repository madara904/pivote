CREATE TYPE "public"."service_direction" AS ENUM('import', 'export');--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "service_direction" "service_direction" DEFAULT 'import' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "service_details";
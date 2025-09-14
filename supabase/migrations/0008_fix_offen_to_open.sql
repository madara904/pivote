-- Fix migration to properly convert 'offen' to 'open'
-- First, temporarily add 'open' to the existing enum
ALTER TYPE "public"."inquiry_status" ADD VALUE 'open';--> statement-breakpoint
-- Update all 'offen' values to 'open'
UPDATE "inquiry" SET "status" = 'open' WHERE "status" = 'offen';--> statement-breakpoint
-- Now we can safely recreate the enum without 'offen'
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."inquiry_status";--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'open', 'awarded', 'closed', 'cancelled', 'expired', 'rejected');--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."inquiry_status";--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE "public"."inquiry_status" USING "status"::"public"."inquiry_status";

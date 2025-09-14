-- First, convert existing 'offen' values to 'open' before changing enum
UPDATE "inquiry" SET "status" = 'open' WHERE "status" = 'offen';--> statement-breakpoint
-- Now change the column to text temporarily
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
-- Drop the old enum
DROP TYPE "public"."inquiry_status";--> statement-breakpoint
-- Create new enum with 'open' instead of 'offen'
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'open', 'awarded', 'closed', 'cancelled', 'expired', 'rejected');--> statement-breakpoint
-- Set default and convert back to enum
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."inquiry_status";--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE "public"."inquiry_status" USING "status"::"public"."inquiry_status";
ALTER TABLE "quotation_charge" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "quotation_charge" CASCADE;--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."inquiry_status";--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'offen', 'awarded', 'closed', 'cancelled', 'expired');--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."inquiry_status";--> statement-breakpoint
ALTER TABLE "inquiry" ALTER COLUMN "status" SET DATA TYPE "public"."inquiry_status" USING "status"::"public"."inquiry_status";--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."quotation_status";--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'submitted', 'accepted', 'rejected', 'withdrawn', 'expired');--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."quotation_status";--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "status" SET DATA TYPE "public"."quotation_status" USING "status"::"public"."quotation_status";--> statement-breakpoint
ALTER TABLE "quotation" ALTER COLUMN "submitted_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "incoterms" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "pre_carriage" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "main_carriage" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "on_carriage" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "additional_charges" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "withdrawn_at" timestamp;--> statement-breakpoint
ALTER TABLE "quotation" DROP COLUMN "incoterms";
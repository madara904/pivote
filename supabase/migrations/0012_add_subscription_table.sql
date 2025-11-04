-- Create subscription tier enum
CREATE TYPE "public"."subscription_tier" AS ENUM('basic', 'medium', 'advanced');

-- Create subscription status enum
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due');

-- Create subscription table
CREATE TABLE "subscription" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "tier" "public"."subscription_tier" NOT NULL DEFAULT 'basic',
  "status" "public"."subscription_status" NOT NULL DEFAULT 'active',
  "max_quotations_per_month" integer DEFAULT 5,
  "max_inquiries_per_month" integer,
  "max_team_members" integer,
  "features" text,
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "subscription_organization_id_unique" UNIQUE("organization_id")
);

-- Add foreign key constraint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;

-- Create default subscriptions for all existing organizations
INSERT INTO "subscription" ("id", "organization_id", "tier", "status", "max_quotations_per_month")
SELECT 
  gen_random_uuid()::text,
  "id",
  'basic',
  'active',
  5
FROM "organization"
WHERE "id" NOT IN (SELECT "organization_id" FROM "subscription");


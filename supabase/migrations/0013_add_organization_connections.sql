-- Create connection status enum
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'connected');

-- Create organization connection table
CREATE TABLE "organization_connection" (
  "id" text PRIMARY KEY NOT NULL,
  "shipper_organization_id" text NOT NULL,
  "forwarder_organization_id" text NOT NULL,
  "status" "public"."connection_status" NOT NULL DEFAULT 'pending',
  "invited_by_id" text NOT NULL,
  "accepted_by_id" text,
  "accepted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "organization_connection_shipper_forwarder_unique" UNIQUE("shipper_organization_id", "forwarder_organization_id")
);

-- Add foreign key constraints
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_shipper_organization_id_organization_id_fk" FOREIGN KEY ("shipper_organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_invited_by_id_user_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_accepted_by_id_user_id_fk" FOREIGN KEY ("accepted_by_id") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;

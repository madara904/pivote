CREATE TYPE "public"."cargo_type" AS ENUM('general', 'dangerous', 'perishable', 'fragile', 'oversized');--> statement-breakpoint
CREATE TYPE "public"."charge_type" AS ENUM('freight', 'local_origin', 'local_destination', 'fuel_surcharge', 'security_fee', 'handling', 'customs', 'insurance', 'other');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'sent', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('shipper', 'forwarder');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('pending', 'submitted', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('air_freight', 'sea_freight', 'road_freight', 'rail_freight');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charge_template" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"charge_name" text NOT NULL,
	"charge_code" text NOT NULL,
	"charge_type" charge_type NOT NULL,
	"default_unit_price" numeric(12, 4),
	"default_unit" text,
	"default_currency" text DEFAULT 'EUR',
	"service_type" "service_type" DEFAULT 'air_freight' NOT NULL,
	"location" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"service_type" "service_type" DEFAULT 'air_freight' NOT NULL,
	"origin_airport" text NOT NULL,
	"origin_city" text NOT NULL,
	"origin_country" text NOT NULL,
	"destination_airport" text NOT NULL,
	"destination_city" text NOT NULL,
	"destination_country" text NOT NULL,
	"cargo_type" "cargo_type" DEFAULT 'general' NOT NULL,
	"cargo_description" text,
	"pieces" integer NOT NULL,
	"gross_weight" numeric(10, 2) NOT NULL,
	"chargeable_weight" numeric(10, 2),
	"dimensions" text,
	"ready_date" timestamp NOT NULL,
	"delivery_date" timestamp,
	"temperature" text,
	"special_handling" text,
	"insurance_required" boolean DEFAULT false,
	"customs_clearance" boolean DEFAULT false,
	"status" "inquiry_status" DEFAULT 'draft' NOT NULL,
	"shipper_organization_id" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "inquiry_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "inquiry_forwarder" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"forwarder_organization_id" text NOT NULL,
	"sent_at" timestamp NOT NULL,
	"viewed_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"inviter_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quotation" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_number" text NOT NULL,
	"inquiry_id" text NOT NULL,
	"forwarder_organization_id" text NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"airline_code" text,
	"flight_number" text,
	"transit_time" integer,
	"valid_until" timestamp NOT NULL,
	"payment_terms" text,
	"incoterms" text,
	"notes" text,
	"terms" text,
	"status" "quotation_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_by_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "quotation_quotation_number_unique" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "quotation_charge" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"charge_type" charge_type NOT NULL,
	"charge_name" text NOT NULL,
	"charge_code" text,
	"unit_price" numeric(12, 4),
	"quantity" numeric(10, 2),
	"unit" text,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"location" text,
	"description" text,
	"is_optional" boolean DEFAULT false,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_template" ADD CONSTRAINT "charge_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_shipper_organization_id_organization_id_fk" FOREIGN KEY ("shipper_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_forwarder" ADD CONSTRAINT "inquiry_forwarder_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_forwarder" ADD CONSTRAINT "inquiry_forwarder_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_charge" ADD CONSTRAINT "quotation_charge_quotation_id_quotation_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;
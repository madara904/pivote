CREATE TYPE "public"."cargo_type" AS ENUM('general', 'dangerous', 'perishable', 'fragile', 'oversized');--> statement-breakpoint
CREATE TYPE "public"."charge_type" AS ENUM('freight', 'local_origin', 'local_destination', 'fuel_surcharge', 'security_fee', 'handling', 'customs', 'insurance', 'other');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'connected');--> statement-breakpoint
CREATE TYPE "public"."forwarder_response_status" AS ENUM('pending', 'rejected', 'quoted');--> statement-breakpoint
CREATE TYPE "public"."inquiry_document_type" AS ENUM('packing_list', 'commercial_invoice', 'certificate_of_origin', 'awb', 'other');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('draft', 'open', 'awarded', 'closed', 'cancelled', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('shipper', 'forwarder');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'submitted', 'accepted', 'rejected', 'withdrawn', 'expired');--> statement-breakpoint
CREATE TYPE "public"."service_direction" AS ENUM('import', 'export');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('air_freight', 'sea_freight', 'road_freight', 'rail_freight');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('basic', 'medium', 'advanced');--> statement-breakpoint
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
	"created_at" timestamp DEFAULT now() NOT NULL,
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
	"shipper_reference" text,
	"title" text NOT NULL,
	"description" text,
	"service_type" "service_type" DEFAULT 'air_freight' NOT NULL,
	"service_direction" "service_direction" DEFAULT 'import' NOT NULL,
	"origin_airport" text NOT NULL,
	"origin_city" text NOT NULL,
	"origin_country" text NOT NULL,
	"destination_airport" text NOT NULL,
	"destination_city" text NOT NULL,
	"destination_country" text NOT NULL,
	"cargo_type" "cargo_type" DEFAULT 'general' NOT NULL,
	"cargo_description" text,
	"incoterms" text NOT NULL,
	"ready_date" timestamp NOT NULL,
	"delivery_date" timestamp,
	"validity_date" timestamp,
	"status" "inquiry_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"closed_at" timestamp,
	"shipper_organization_id" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "inquiry_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "inquiry_document" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"uploaded_by_organization_id" text NOT NULL,
	"uploaded_by_user_id" text NOT NULL,
	"document_type" "inquiry_document_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_forwarder" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"forwarder_organization_id" text NOT NULL,
	"sent_at" timestamp NOT NULL,
	"viewed_at" timestamp,
	"rejected_at" timestamp,
	"response_status" "forwarder_response_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_note" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_package" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"package_number" text NOT NULL,
	"description" text,
	"pieces" integer DEFAULT 1 NOT NULL,
	"gross_weight" numeric(10, 3) NOT NULL,
	"chargeable_weight" numeric(10, 3),
	"length" numeric(8, 2),
	"width" numeric(8, 2),
	"height" numeric(8, 2),
	"volume" numeric(10, 6),
	"temperature" text,
	"special_handling" text,
	"is_dangerous" boolean DEFAULT false,
	"dangerous_goods_class" text,
	"un_number" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "organization_type" DEFAULT 'shipper' NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"postal_code" text,
	"country" text,
	"vat_number" text,
	"registration_number" text,
	"logo" text,
	"settings" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_vat_number_unique" UNIQUE("vat_number")
);
--> statement-breakpoint
CREATE TABLE "organization_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"shipper_organization_id" text NOT NULL,
	"forwarder_organization_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"invited_by_id" text NOT NULL,
	"accepted_by_id" text,
	"accepted_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_connection_shipper_organization_id_forwarder_organization_id_unique" UNIQUE("shipper_organization_id","forwarder_organization_id")
);
--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"job_title" text,
	"department" text,
	"permissions" text,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_member_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "quotation" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_number" text NOT NULL,
	"inquiry_id" text NOT NULL,
	"forwarder_organization_id" text NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"airline_flight" text,
	"transit_time" integer,
	"valid_until" timestamp NOT NULL,
	"notes" text,
	"terms" text,
	"pre_carriage" numeric(12, 2) DEFAULT '0',
	"main_carriage" numeric(12, 2) DEFAULT '0',
	"on_carriage" numeric(12, 2) DEFAULT '0',
	"additional_charges" numeric(12, 2) DEFAULT '0',
	"status" "quotation_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp,
	"responded_at" timestamp,
	"withdrawn_at" timestamp,
	"created_by_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "quotation_quotation_number_unique" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"tier" "subscription_tier" DEFAULT 'basic' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"max_quotations_per_month" integer DEFAULT 5,
	"max_inquiries_per_month" integer,
	"max_team_members" integer,
	"features" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "subscription_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"org_type" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_template" ADD CONSTRAINT "charge_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_shipper_organization_id_organization_id_fk" FOREIGN KEY ("shipper_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_document" ADD CONSTRAINT "inquiry_document_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_document" ADD CONSTRAINT "inquiry_document_uploaded_by_organization_id_organization_id_fk" FOREIGN KEY ("uploaded_by_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_document" ADD CONSTRAINT "inquiry_document_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_forwarder" ADD CONSTRAINT "inquiry_forwarder_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_forwarder" ADD CONSTRAINT "inquiry_forwarder_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_note" ADD CONSTRAINT "inquiry_note_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_note" ADD CONSTRAINT "inquiry_note_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_note" ADD CONSTRAINT "inquiry_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_package" ADD CONSTRAINT "inquiry_package_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_shipper_organization_id_organization_id_fk" FOREIGN KEY ("shipper_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_invited_by_id_user_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_connection" ADD CONSTRAINT "organization_connection_accepted_by_id_user_id_fk" FOREIGN KEY ("accepted_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_forwarder_organization_id_organization_id_fk" FOREIGN KEY ("forwarder_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
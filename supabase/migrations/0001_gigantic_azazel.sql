CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
ALTER TYPE "public"."inquiry_status" ADD VALUE 'offen';--> statement-breakpoint
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
CREATE TABLE "organization_invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"invited_user_id" text,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"job_title" text,
	"department" text,
	"permissions" text,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"invite_message" text,
	"invited_by_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_invitation_token_unique" UNIQUE("token"),
	CONSTRAINT "organization_invitation_email_organization_id_unique" UNIQUE("email","organization_id")
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
ALTER TABLE "invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_active_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "validity_date" timestamp;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "type" "organization_type" DEFAULT 'shipper' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "vat_number" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "settings" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "org_type" text;--> statement-breakpoint
ALTER TABLE "inquiry_package" ADD CONSTRAINT "inquiry_package_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_invited_user_id_user_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_id_user_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "pieces";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "gross_weight";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "chargeable_weight";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "temperature";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "special_handling";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "insurance_required";--> statement-breakpoint
ALTER TABLE "inquiry" DROP COLUMN "customs_clearance";--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "active_organization_id";--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_vat_number_unique" UNIQUE("vat_number");
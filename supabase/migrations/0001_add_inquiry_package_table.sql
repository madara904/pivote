-- Create inquiry_package table
CREATE TABLE "inquiry_package" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_id" text NOT NULL,
	"package_number" text NOT NULL,
	"description" text,
	"pieces" integer DEFAULT 1 NOT NULL,
	"gross_weight" numeric(10, 2) NOT NULL,
	"chargeable_weight" numeric(10, 2),
	"length" numeric(8, 2),
	"width" numeric(8, 2),
	"height" numeric(8, 2),
	"volume" numeric(10, 3),
	"temperature" text,
	"special_handling" text,
	"is_dangerous" boolean DEFAULT false,
	"dangerous_goods_class" text,
	"un_number" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "inquiry_package" ADD CONSTRAINT "inquiry_package_inquiry_id_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiry"("id") ON DELETE cascade ON UPDATE no action;

-- Add index for better query performance
CREATE INDEX "inquiry_package_inquiry_id_idx" ON "inquiry_package" ("inquiry_id");
CREATE INDEX "inquiry_package_package_number_idx" ON "inquiry_package" ("package_number");

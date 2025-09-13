ALTER TABLE "quotation" ALTER COLUMN "incoterms" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation_charge" ALTER COLUMN "charge_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "airline_flight" text;--> statement-breakpoint
ALTER TABLE "quotation" DROP COLUMN "airline_code";--> statement-breakpoint
ALTER TABLE "quotation" DROP COLUMN "flight_number";--> statement-breakpoint
ALTER TABLE "quotation" DROP COLUMN "payment_terms";--> statement-breakpoint
ALTER TABLE "quotation_charge" DROP COLUMN "charge_type";--> statement-breakpoint
ALTER TABLE "quotation_charge" DROP COLUMN "charge_name";--> statement-breakpoint
ALTER TABLE "quotation_charge" DROP COLUMN "unit";--> statement-breakpoint
ALTER TABLE "quotation_charge" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "quotation_charge" DROP COLUMN "is_optional";
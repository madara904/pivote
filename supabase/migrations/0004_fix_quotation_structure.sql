-- Fix quotation structure - add incoterms to inquiry, fix quotation charges

-- 1. Add incoterms to inquiry table
ALTER TABLE "inquiry" ADD COLUMN "incoterms" text NOT NULL DEFAULT 'EXW';

-- 2. Remove incoterms from quotation table (it should come from inquiry)
ALTER TABLE "quotation" DROP COLUMN IF EXISTS "incoterms";

-- 3. Fix quotation_charge table structure
ALTER TABLE "quotation_charge" ADD COLUMN "charge_name" text;
ALTER TABLE "quotation_charge" ADD COLUMN "unit" text;
ALTER TABLE "quotation_charge" ADD COLUMN "location" text;
ALTER TABLE "quotation_charge" ADD COLUMN "is_optional" boolean DEFAULT false;

-- 4. Make charge_name required
ALTER TABLE "quotation_charge" ALTER COLUMN "charge_name" SET NOT NULL;

-- 5. Add comments for clarity
COMMENT ON COLUMN "inquiry"."incoterms" IS 'Incoterms specified in the inquiry (EXW, FCA, CPT, CIP, DAP, DPU, DDP)';
COMMENT ON COLUMN "quotation_charge"."charge_name" IS 'Name of the charge (e.g., Hauptfracht, AWB Fee, Fuel Surcharge)';
COMMENT ON COLUMN "quotation_charge"."charge_code" IS 'Optional charge code (e.g., FREIGHT, AWB, FUEL)';
COMMENT ON COLUMN "quotation_charge"."unit" IS 'Unit of measurement (e.g., kg, Stück, m³)';
COMMENT ON COLUMN "quotation_charge"."location" IS 'Location where charge applies (e.g., Frankfurt, New York)';
COMMENT ON COLUMN "quotation_charge"."is_optional" IS 'Whether this charge is optional';

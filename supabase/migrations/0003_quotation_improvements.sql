-- Apply quotation form improvements
-- This migration only applies the quotation changes we need

-- 1. Make incoterms required
ALTER TABLE "quotation" ALTER COLUMN "incoterms" SET NOT NULL;

-- 2. Add new airline_flight column
ALTER TABLE "quotation" ADD COLUMN "airline_flight" text;

-- 3. Remove old columns from quotation table
ALTER TABLE "quotation" DROP COLUMN IF EXISTS "airline_code";
ALTER TABLE "quotation" DROP COLUMN IF EXISTS "flight_number";
ALTER TABLE "quotation" DROP COLUMN IF EXISTS "payment_terms";

-- 4. Update quotation_charge table
-- Make charge_code required
ALTER TABLE "quotation_charge" ALTER COLUMN "charge_code" SET NOT NULL;

-- Remove unnecessary columns from quotation_charge
ALTER TABLE "quotation_charge" DROP COLUMN IF EXISTS "charge_type";
ALTER TABLE "quotation_charge" DROP COLUMN IF EXISTS "charge_name";
ALTER TABLE "quotation_charge" DROP COLUMN IF EXISTS "unit";
ALTER TABLE "quotation_charge" DROP COLUMN IF EXISTS "location";
ALTER TABLE "quotation_charge" DROP COLUMN IF EXISTS "is_optional";

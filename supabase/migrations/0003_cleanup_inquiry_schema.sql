-- Remove legacy fields from inquiry table since we're using packages JSON only
ALTER TABLE "inquiry" DROP COLUMN IF EXISTS "pieces";
ALTER TABLE "inquiry" DROP COLUMN IF EXISTS "gross_weight";
ALTER TABLE "inquiry" DROP COLUMN IF EXISTS "chargeable_weight";
ALTER TABLE "inquiry" DROP COLUMN IF EXISTS "dimensions";

-- Make packages field NOT NULL since it's required
ALTER TABLE "inquiry" ALTER COLUMN "packages" SET NOT NULL;

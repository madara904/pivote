-- Fix null packages values by setting them to empty array
UPDATE "inquiry" SET "packages" = '[]' WHERE "packages" IS NULL;

-- Now we can safely make packages NOT NULL
ALTER TABLE "inquiry" ALTER COLUMN "packages" SET NOT NULL;

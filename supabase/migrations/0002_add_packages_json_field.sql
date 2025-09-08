-- Add packages JSON field to inquiry table
ALTER TABLE "inquiry" ADD COLUMN "packages" text;

-- Drop the inquiry_package table since we're using JSON instead
DROP TABLE IF EXISTS "inquiry_package";

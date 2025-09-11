-- Optional schema improvements for better performance and data integrity

-- Add computed columns for frequently accessed totals (PostgreSQL 12+)
-- This would make queries even faster by pre-calculating totals
ALTER TABLE inquiry ADD COLUMN IF NOT EXISTS total_pieces INTEGER GENERATED ALWAYS AS (
  (SELECT COALESCE(SUM(pieces), 0) FROM inquiry_package WHERE inquiry_id = inquiry.id)
) STORED;

ALTER TABLE inquiry ADD COLUMN IF NOT EXISTS total_gross_weight NUMERIC(10,3) GENERATED ALWAYS AS (
  (SELECT COALESCE(SUM(gross_weight), 0) FROM inquiry_package WHERE inquiry_id = inquiry.id)
) STORED;

-- Add indexes for computed columns
CREATE INDEX IF NOT EXISTS idx_inquiry_total_pieces ON inquiry (total_pieces);
CREATE INDEX IF NOT EXISTS idx_inquiry_total_weight ON inquiry (total_gross_weight);

-- Add constraint to ensure positive weights
ALTER TABLE inquiry_package ADD CONSTRAINT check_positive_gross_weight 
CHECK (gross_weight > 0);

-- Add constraint to ensure positive pieces
ALTER TABLE inquiry_package ADD CONSTRAINT check_positive_pieces 
CHECK (pieces > 0);

-- Add index for package number uniqueness per inquiry
CREATE UNIQUE INDEX IF NOT EXISTS idx_inquiry_package_unique_number 
ON inquiry_package (inquiry_id, package_number);

-- Fix decimal precision for inquiry_package table to match schema
-- Update gross_weight and chargeable_weight to have 3 decimal places instead of 2

-- First, update the column types
ALTER TABLE inquiry_package 
ALTER COLUMN gross_weight TYPE NUMERIC(10, 3);

ALTER TABLE inquiry_package 
ALTER COLUMN chargeable_weight TYPE NUMERIC(10, 3);

-- Update volume to have 6 decimal places to match schema
ALTER TABLE inquiry_package 
ALTER COLUMN volume TYPE NUMERIC(10, 6);

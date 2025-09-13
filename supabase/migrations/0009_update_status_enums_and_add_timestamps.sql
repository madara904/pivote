-- Update status enums and add new timestamp fields for business logic

-- First, add new values to existing inquiry_status enum
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'offen';
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'awarded';
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'expired';

-- Add new values to existing quotation_status enum  
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'withdrawn';

-- Add new timestamp fields to inquiry table
ALTER TABLE inquiry ADD COLUMN IF NOT EXISTS sent_at timestamp;
ALTER TABLE inquiry ADD COLUMN IF NOT EXISTS closed_at timestamp;

-- Add new timestamp fields to quotation table
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS withdrawn_at timestamp;

-- Update quotation table to make submitted_at nullable (it was NOT NULL before)
ALTER TABLE quotation ALTER COLUMN submitted_at DROP NOT NULL;

-- Update existing data to use new status values BEFORE changing enum
-- Update inquiries that were 'sent' to 'offen'
UPDATE inquiry SET status = 'offen' WHERE status = 'sent';

-- Update quotations that were 'pending' to 'draft' 
UPDATE quotation SET status = 'draft' WHERE status = 'pending';

-- Set sent_at for existing offen inquiries
UPDATE inquiry SET sent_at = created_at WHERE status = 'offen' AND sent_at IS NULL;

-- Set submitted_at for existing quotations that are not draft
UPDATE quotation SET submitted_at = created_at WHERE status != 'draft' AND submitted_at IS NULL;

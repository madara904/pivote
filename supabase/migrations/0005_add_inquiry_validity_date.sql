-- Add validity date to inquiry table
ALTER TABLE inquiry ADD COLUMN validity_date timestamp;

-- Add comment for clarity
COMMENT ON COLUMN inquiry.validity_date IS 'Date until which the inquiry is valid for responses from forwarders';


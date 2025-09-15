-- Add forwarder response status enum
CREATE TYPE forwarder_response_status AS ENUM (
  'pending',    -- Forwarder hasn't responded yet
  'rejected',   -- Forwarder declined to quote
  'quoted'      -- Forwarder submitted a quotation
);

-- Add response_status field to inquiry_forwarder table
ALTER TABLE inquiry_forwarder ADD COLUMN response_status forwarder_response_status DEFAULT 'pending' NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN inquiry_forwarder.response_status IS 'Tracks the forwarder response status for this inquiry';

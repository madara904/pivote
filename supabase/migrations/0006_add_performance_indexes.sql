-- Add critical indexes for inquiry performance optimization

-- Index for inquiry_forwarder queries by forwarder organization and creation date
CREATE INDEX IF NOT EXISTS idx_inquiry_forwarder_forwarder_org_created_at 
ON inquiry_forwarder (forwarder_organization_id, created_at DESC);

-- Index for inquiry_forwarder queries by inquiry_id
CREATE INDEX IF NOT EXISTS idx_inquiry_forwarder_inquiry_id 
ON inquiry_forwarder (inquiry_id);

-- Index for inquiry_package queries by inquiry_id (already exists but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_inquiry_package_inquiry_id 
ON inquiry_package (inquiry_id);

-- Index for inquiry queries by status and creation date
CREATE INDEX IF NOT EXISTS idx_inquiry_status_created_at 
ON inquiry (status, created_at DESC);

-- Index for organization_member queries by user_id
CREATE INDEX IF NOT EXISTS idx_organization_member_user_id 
ON organization_member (user_id);

-- Index for inquiry queries by shipper organization
CREATE INDEX IF NOT EXISTS idx_inquiry_shipper_org_id 
ON inquiry (shipper_organization_id);

-- Composite index for inquiry_forwarder lookups
CREATE INDEX IF NOT EXISTS idx_inquiry_forwarder_lookup 
ON inquiry_forwarder (inquiry_id, forwarder_organization_id);

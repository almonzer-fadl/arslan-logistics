-- Add 'inactive' to the forwarders status check constraint
ALTER TABLE forwarders DROP CONSTRAINT IF EXISTS forwarders_status_check;
ALTER TABLE forwarders ADD CONSTRAINT forwarders_status_check 
  CHECK (status IN ('active', 'pending', 'not_contacted', 'approved', 'inactive'));

-- Add source column to patients table
ALTER TABLE patients
ADD COLUMN source TEXT DEFAULT 'Walk In';

-- Add comment to describe the column
COMMENT ON COLUMN patients.source IS 'Source of patient acquisition: Walk In, Google Ads, Meta Ads, GMB, Referral, Other';

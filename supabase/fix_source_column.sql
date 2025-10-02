-- Fix for missing 'source' column in patients table
-- Run this ONLY if you get the error: "Could not find the 'source' column of 'patients' in the schema cache"

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'source'
    ) THEN
        -- Add source column with default value
        ALTER TABLE public.patients
        ADD COLUMN source TEXT DEFAULT 'Walk In';
        
        -- Add comment to describe the column
        COMMENT ON COLUMN public.patients.source IS 'Source of patient acquisition: Walk In, Google Ads, Meta Ads, GMB, Referral, Other';
        
        RAISE NOTICE 'Source column added successfully to patients table';
    ELSE
        RAISE NOTICE 'Source column already exists in patients table';
    END IF;
END $$;

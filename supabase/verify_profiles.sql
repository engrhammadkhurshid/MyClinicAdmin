-- Quick fix for profiles table
-- Run this in Supabase SQL Editor to ensure schema matches code

-- Check if profile_picture_url column exists and remove it if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN profile_picture_url;
    END IF;
END $$;

-- Verify the profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

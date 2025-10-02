-- Add clinic_name and clinic_type to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clinic_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clinic_type TEXT;

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

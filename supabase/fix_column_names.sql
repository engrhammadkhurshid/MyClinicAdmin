-- Update patients table to match TypeScript types
-- Run this in Supabase SQL Editor

-- Rename columns to match TypeScript types
ALTER TABLE public.patients 
  RENAME COLUMN name TO full_name;

ALTER TABLE public.patients 
  RENAME COLUMN contact TO phone;

-- Add labels column (JSONB array for storing patient labels/tags)
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Update the index to use new column name
DROP INDEX IF EXISTS idx_patients_name;
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);

-- Add email column to patients table
-- Run this in Supabase SQL Editor

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index for email lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

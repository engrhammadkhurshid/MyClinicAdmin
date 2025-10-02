-- Remove the updated_at trigger from profiles table only
-- Run this in Supabase SQL Editor

-- Drop only the profiles trigger (keep the function for other tables)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Note: We're NOT dropping the function because patients and appointments tables use it
-- DROP FUNCTION IF EXISTS update_updated_at_column(); -- DON'T RUN THIS

-- Verify only the profiles trigger is removed
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('profiles', 'patients', 'appointments')
ORDER BY event_object_table, trigger_name;

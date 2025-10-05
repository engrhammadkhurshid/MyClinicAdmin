-- =====================================================
-- FIX: Add SECURITY DEFINER to gen_staff_id() Function
-- =====================================================
-- Fixes: "permission denied for table users" error
-- When: Creating staff_member during signup
-- Why: Function needs elevated privileges to access auth.users

-- Drop the old function and trigger
DROP TRIGGER IF EXISTS staff_members_gen_id ON public.staff_members;
DROP FUNCTION IF EXISTS gen_staff_id() CASCADE;

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION gen_staff_id()
RETURNS TRIGGER 
SECURITY DEFINER -- Allows function to access auth.users table
SET search_path = public, auth -- Security best practice
AS $$
DECLARE
    clinic_slug TEXT;
    username TEXT;
    email_local TEXT;
BEGIN
    -- Get clinic slug
    SELECT slug INTO clinic_slug 
    FROM public.clinic 
    WHERE id = NEW.clinic_id;
    
    -- Get username from email (now has permission to access auth.users!)
    SELECT email INTO email_local 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Extract local part of email (before @)
    username := split_part(email_local, '@', 1);
    
    -- Generate staff_id: "clinic-slug-username"
    NEW.staff_id := clinic_slug || '-' || slugify(username);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER staff_members_gen_id
    BEFORE INSERT ON public.staff_members
    FOR EACH ROW 
    WHEN (NEW.staff_id = '' OR NEW.staff_id IS NULL)
    EXECUTE FUNCTION gen_staff_id();

-- Verify the fix
DO $$
DECLARE
    is_definer BOOLEAN;
BEGIN
    SELECT prosecdef INTO is_definer
    FROM pg_proc 
    WHERE proname = 'gen_staff_id';
    
    IF is_definer THEN
        RAISE NOTICE '✅ gen_staff_id() function fixed with SECURITY DEFINER!';
        RAISE NOTICE '✅ Function can now access auth.users table!';
    ELSE
        RAISE WARNING '⚠️  SECURITY DEFINER may not be set correctly';
    END IF;
END $$;

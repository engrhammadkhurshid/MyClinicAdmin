-- =====================================================
-- FIX: Remove Recursive RLS Policies
-- =====================================================
-- Fixes: "infinite recursion detected in policy for relation staff_members"
-- When: During signup when inserting into staff_members
-- Why: staff_members_owner_read policy queries staff_members within itself

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "clinic_owner_insert" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_read" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_update" ON public.clinic;
DROP POLICY IF EXISTS "staff_members_self_insert" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_self_read" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_read" ON public.staff_members;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

-- =====================================================
-- CLINIC POLICIES (Simple, no recursion)
-- =====================================================

CREATE POLICY "clinic_owner_insert" ON public.clinic
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "clinic_owner_read" ON public.clinic
    FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "clinic_owner_update" ON public.clinic
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- =====================================================
-- STAFF_MEMBERS POLICIES (Simple, NO RECURSION!)
-- =====================================================

-- Allow users to insert their own staff_member entry during signup
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Allow users to read their own staff_member records
-- Uses direct column check - NO subquery on same table
CREATE POLICY "staff_members_self_read" ON public.staff_members
    FOR SELECT
    USING (user_id = auth.uid());

-- =====================================================
-- PROFILES POLICIES (Simple, no recursion)
-- =====================================================

CREATE POLICY "profiles_self_insert" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_self_read" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "profiles_self_update" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('clinic', 'staff_members', 'profiles');
    
    IF policy_count = 8 THEN
        RAISE NOTICE '✅ Simple RLS policies created successfully!';
        RAISE NOTICE '✅ No recursive policies - infinite recursion fixed!';
        RAISE NOTICE '✅ Found % policies (clinic: 3, staff_members: 2, profiles: 3)', policy_count;
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Signup should work now without recursion error!';
    ELSE
        RAISE WARNING '⚠️  Expected 8 policies, found %', policy_count;
    END IF;
END $$;

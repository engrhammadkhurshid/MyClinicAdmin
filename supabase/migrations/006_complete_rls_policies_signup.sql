-- =====================================================
-- COMPLETE RLS POLICIES FOR SIGNUP FLOW
-- =====================================================
-- Fixes: "new row violates row-level security policy for table staff_members"
-- When: During signup after OTP verification
-- Why: Missing INSERT policies for clinic, staff_members, profiles

-- Enable RLS on all tables
ALTER TABLE public.clinic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (avoid conflicts)
-- =====================================================

-- Clinic policies
DROP POLICY IF EXISTS "clinic_owner_insert" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_read" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_update" ON public.clinic;

-- Staff members policies
DROP POLICY IF EXISTS "staff_members_self_insert" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_self_read" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_read" ON public.staff_members;

-- Profile policies
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

-- =====================================================
-- CLINIC POLICIES
-- =====================================================

-- Users can create their own clinic during signup
CREATE POLICY "clinic_owner_insert" ON public.clinic
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Users can read their own clinic
CREATE POLICY "clinic_owner_read" ON public.clinic
    FOR SELECT
    USING (auth.uid() = owner_id);

-- Users can update their own clinic
CREATE POLICY "clinic_owner_update" ON public.clinic
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- =====================================================
-- STAFF_MEMBERS POLICIES
-- =====================================================

-- Allow users to create their own staff_member entry during signup
-- THIS IS THE CRITICAL POLICY FOR SIGNUP!
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can read their own staff membership
CREATE POLICY "staff_members_self_read" ON public.staff_members
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can read staff in their clinic (for Team Management)
CREATE POLICY "staff_members_owner_read" ON public.staff_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm
            WHERE sm.clinic_id = staff_members.clinic_id
            AND sm.user_id = auth.uid()
            AND sm.role = 'owner'
            AND sm.status = 'active'
        )
    );

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can create their own profile
CREATE POLICY "profiles_self_insert" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Users can read their own profile
CREATE POLICY "profiles_self_read" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile
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
    
    IF policy_count >= 9 THEN
        RAISE NOTICE '✅ All RLS policies created successfully!';
        RAISE NOTICE '✅ Found % policies for clinic, staff_members, profiles', policy_count;
        RAISE NOTICE '✅ Signup flow should work without RLS errors!';
    ELSE
        RAISE WARNING '⚠️  Expected at least 9 policies, found %', policy_count;
    END IF;
END $$;

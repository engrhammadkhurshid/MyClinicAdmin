-- =====================================================
-- RBAC IMPLEMENTATION - PHASE 3: UPDATE RLS POLICIES
-- =====================================================
-- This migration updates RLS policies for multi-tenancy
-- Run this AFTER migrations 001 and 002

-- =====================================================
-- 1. CREATE RLS HELPER FUNCTIONS
-- =====================================================

-- Check if user is owner of a clinic
CREATE OR REPLACE FUNCTION is_owner(uid UUID, cid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff_members
        WHERE clinic_id = cid 
          AND user_id = uid 
          AND role = 'owner' 
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if user is manager of a clinic
CREATE OR REPLACE FUNCTION is_manager(uid UUID, cid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff_members
        WHERE clinic_id = cid 
          AND user_id = uid 
          AND role = 'manager' 
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if user is staff member (owner OR manager) of a clinic
CREATE OR REPLACE FUNCTION is_staff_member(uid UUID, cid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff_members
        WHERE clinic_id = cid 
          AND user_id = uid 
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get user's clinic ID (returns first active clinic)
CREATE OR REPLACE FUNCTION get_user_clinic_id(uid UUID) 
RETURNS UUID AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT clinic_id INTO cid
    FROM public.staff_members
    WHERE user_id = uid AND status = 'active'
    LIMIT 1;
    
    RETURN cid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- 2. ENABLE RLS ON NEW TABLES
-- =====================================================
ALTER TABLE public.clinic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES FOR CLINIC TABLE
-- =====================================================

-- Owners can view and update their own clinic
CREATE POLICY "clinic_owner_read" ON public.clinic
    FOR SELECT
    USING (is_owner(auth.uid(), id));

CREATE POLICY "clinic_owner_update" ON public.clinic
    FOR UPDATE
    USING (is_owner(auth.uid(), id))
    WITH CHECK (is_owner(auth.uid(), id));

-- Managers can view clinic (read-only)
CREATE POLICY "clinic_manager_read" ON public.clinic
    FOR SELECT
    USING (is_manager(auth.uid(), id));

-- Users can create their own clinic (for signup)
CREATE POLICY "clinic_owner_insert" ON public.clinic
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- =====================================================
-- 4. CREATE RLS POLICIES FOR STAFF_MEMBERS TABLE
-- =====================================================

-- Staff members can view their own membership
CREATE POLICY "staff_members_self_read" ON public.staff_members
    FOR SELECT
    USING (user_id = auth.uid());

-- Owners can view all staff in their clinic
CREATE POLICY "staff_members_owner_read" ON public.staff_members
    FOR SELECT
    USING (is_owner(auth.uid(), clinic_id));

-- Owners can insert new staff members (for invites)
CREATE POLICY "staff_members_owner_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can update staff members (change status, etc.)
CREATE POLICY "staff_members_owner_update" ON public.staff_members
    FOR UPDATE
    USING (is_owner(auth.uid(), clinic_id))
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can delete staff members
CREATE POLICY "staff_members_owner_delete" ON public.staff_members
    FOR DELETE
    USING (is_owner(auth.uid(), clinic_id));

-- =====================================================
-- 5. CREATE RLS POLICIES FOR STAFF_INVITES TABLE
-- =====================================================

-- Owners can view invites for their clinic
CREATE POLICY "staff_invites_owner_read" ON public.staff_invites
    FOR SELECT
    USING (is_owner(auth.uid(), clinic_id));

-- Owners can create invites for their clinic
CREATE POLICY "staff_invites_owner_insert" ON public.staff_invites
    FOR INSERT
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can delete/revoke invites
CREATE POLICY "staff_invites_owner_delete" ON public.staff_invites
    FOR DELETE
    USING (is_owner(auth.uid(), clinic_id));

-- =====================================================
-- 6. UPDATE RLS POLICIES FOR PATIENTS TABLE
-- =====================================================

-- Drop old user-based policies
DROP POLICY IF EXISTS "Users can view their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON public.patients;

-- Create new clinic-based policies
CREATE POLICY "patients_staff_read" ON public.patients
    FOR SELECT
    USING (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "patients_staff_insert" ON public.patients
    FOR INSERT
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "patients_staff_update" ON public.patients
    FOR UPDATE
    USING (is_staff_member(auth.uid(), clinic_id))
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "patients_staff_delete" ON public.patients
    FOR DELETE
    USING (is_staff_member(auth.uid(), clinic_id));

-- =====================================================
-- 7. UPDATE RLS POLICIES FOR APPOINTMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

CREATE POLICY "appointments_staff_read" ON public.appointments
    FOR SELECT
    USING (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "appointments_staff_insert" ON public.appointments
    FOR INSERT
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "appointments_staff_update" ON public.appointments
    FOR UPDATE
    USING (is_staff_member(auth.uid(), clinic_id))
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "appointments_staff_delete" ON public.appointments
    FOR DELETE
    USING (is_staff_member(auth.uid(), clinic_id));

-- =====================================================
-- 8. UPDATE RLS POLICIES FOR ATTACHMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can insert their own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.attachments;

CREATE POLICY "attachments_staff_read" ON public.attachments
    FOR SELECT
    USING (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "attachments_staff_insert" ON public.attachments
    FOR INSERT
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

CREATE POLICY "attachments_staff_delete" ON public.attachments
    FOR DELETE
    USING (is_staff_member(auth.uid(), clinic_id));

-- =====================================================
-- 9. CREATE RPC FOR SECURE INVITE ACCEPTANCE
-- =====================================================

CREATE OR REPLACE FUNCTION accept_staff_invite(p_token TEXT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    inv RECORD;
    user_email TEXT;
BEGIN
    -- Get invite details
    SELECT * INTO inv
    FROM public.staff_invites
    WHERE token = p_token
      AND expires_at > NOW()
      AND accepted_at IS NULL;

    IF inv IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invite token';
    END IF;

    -- Get user's email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = p_user_id;

    -- Verify email matches invite
    IF lower(user_email) != lower(inv.email) THEN
        RAISE EXCEPTION 'Email mismatch: invite is for %, but user email is %', inv.email, user_email;
    END IF;

    -- Create staff membership
    INSERT INTO public.staff_members (clinic_id, user_id, role, staff_id, status, invited_by)
    VALUES (
        inv.clinic_id, 
        p_user_id, 
        inv.role, 
        '', -- Auto-generated by trigger
        'active',
        inv.invited_by
    );

    -- Mark invite as accepted
    UPDATE public.staff_invites
    SET accepted_at = NOW()
    WHERE id = inv.id;

    -- Return success with clinic info
    RETURN jsonb_build_object(
        'success', true,
        'clinic_id', inv.clinic_id,
        'role', inv.role
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_staff_invite(TEXT, UUID) TO authenticated;

-- =====================================================
-- 10. VERIFICATION & COMPLETION
-- =====================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ RBAC Phase 3 Complete: RLS policies updated';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '   - Total RLS policies: %', policy_count;
    RAISE NOTICE '   - Helper functions created: 4';
    RAISE NOTICE '   - RPC functions created: 1';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS is now clinic-based:';
    RAISE NOTICE '   ✅ Both owners and managers can access clinic data';
    RAISE NOTICE '   ✅ Owners can manage team and clinic settings';
    RAISE NOTICE '   ✅ Managers have read-only access to clinic settings';
    RAISE NOTICE '   ✅ Cross-clinic access is prevented';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update application code to use new schema';
    RAISE NOTICE '2. Test RLS policies in Supabase dashboard';
    RAISE NOTICE '3. Deploy frontend changes';
END $$;

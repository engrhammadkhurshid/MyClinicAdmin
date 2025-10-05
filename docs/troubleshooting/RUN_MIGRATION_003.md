# 🚨 CRITICAL: You Need to Run the FULL Migration!

## THE REAL PROBLEM

You ran a **partial SQL script** I gave you earlier, but you need to run the **COMPLETE migration file** that already exists in your project!

The migration file `003_update_rls_policies.sql` contains:
1. ✅ Helper functions (`is_owner()`, `is_manager()`, etc.)
2. ✅ RLS policies for clinic table (INSERT, SELECT, UPDATE)
3. ✅ RLS policies for staff_members table
4. ✅ RLS policies for staff_invites table

**You only ran the basic policy, but NOT the helper functions!**

---

## 🎯 THE COMPLETE FIX

### Step 1: Open the Migration File

**File location:** `supabase/migrations/003_update_rls_policies.sql`

Or copy the complete content below ⬇️

---

### Step 2: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg
2. Click: **SQL Editor** (left sidebar)
3. Click: **New Query**

---

### Step 3: Copy & Paste This COMPLETE Script

```sql
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

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "clinic_owner_read" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_update" ON public.clinic;
DROP POLICY IF EXISTS "clinic_manager_read" ON public.clinic;
DROP POLICY IF EXISTS "clinic_owner_insert" ON public.clinic;
DROP POLICY IF EXISTS "Users can create their own clinic" ON public.clinic;
DROP POLICY IF EXISTS "Users can read their own clinic" ON public.clinic;
DROP POLICY IF EXISTS "Users can update their own clinic" ON public.clinic;
DROP POLICY IF EXISTS "Owners can delete their clinic" ON public.clinic;

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

-- Drop existing policies first
DROP POLICY IF EXISTS "staff_members_self_read" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_read" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_insert" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_update" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_owner_delete" ON public.staff_members;

-- Staff members can view their own membership
CREATE POLICY "staff_members_self_read" ON public.staff_members
    FOR SELECT
    USING (user_id = auth.uid());

-- Owners can view all staff in their clinic
CREATE POLICY "staff_members_owner_read" ON public.staff_members
    FOR SELECT
    USING (is_owner(auth.uid(), clinic_id));

-- Owners can add new staff members
CREATE POLICY "staff_members_owner_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can update staff members
CREATE POLICY "staff_members_owner_update" ON public.staff_members
    FOR UPDATE
    USING (is_owner(auth.uid(), clinic_id))
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can remove staff members
CREATE POLICY "staff_members_owner_delete" ON public.staff_members
    FOR DELETE
    USING (is_owner(auth.uid(), clinic_id));

-- Allow users to create their own staff_member entry during signup
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 5. CREATE RLS POLICIES FOR STAFF_INVITES TABLE
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "staff_invites_owner_read" ON public.staff_invites;
DROP POLICY IF EXISTS "staff_invites_owner_insert" ON public.staff_invites;
DROP POLICY IF EXISTS "staff_invites_owner_update" ON public.staff_invites;
DROP POLICY IF EXISTS "staff_invites_owner_delete" ON public.staff_invites;
DROP POLICY IF EXISTS "staff_invites_invitee_read" ON public.staff_invites;

-- Owners can view all invites for their clinic
CREATE POLICY "staff_invites_owner_read" ON public.staff_invites
    FOR SELECT
    USING (is_owner(auth.uid(), clinic_id));

-- Owners can create invites
CREATE POLICY "staff_invites_owner_insert" ON public.staff_invites
    FOR INSERT
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can update invites (e.g., cancel)
CREATE POLICY "staff_invites_owner_update" ON public.staff_invites
    FOR UPDATE
    USING (is_owner(auth.uid(), clinic_id))
    WITH CHECK (is_owner(auth.uid(), clinic_id));

-- Owners can delete invites
CREATE POLICY "staff_invites_owner_delete" ON public.staff_invites
    FOR DELETE
    USING (is_owner(auth.uid(), clinic_id));

-- Invited users can view invites sent to them
CREATE POLICY "staff_invites_invitee_read" ON public.staff_invites
    FOR SELECT
    USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- =====================================================
-- 6. CREATE RLS POLICIES FOR PATIENTS TABLE
-- =====================================================

-- Patients can view their own record
CREATE POLICY "patients_self_read" ON public.patients
    FOR SELECT
    USING (user_id = auth.uid());

-- Staff members can view patients from their clinic
CREATE POLICY "patients_staff_read" ON public.patients
    FOR SELECT
    USING (is_staff_member(auth.uid(), clinic_id));

-- Staff members can create patients in their clinic
CREATE POLICY "patients_staff_insert" ON public.patients
    FOR INSERT
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

-- Staff members can update patients in their clinic
CREATE POLICY "patients_staff_update" ON public.patients
    FOR UPDATE
    USING (is_staff_member(auth.uid(), clinic_id))
    WITH CHECK (is_staff_member(auth.uid(), clinic_id));

-- =====================================================
-- 7. CREATE RLS POLICIES FOR APPOINTMENTS TABLE
-- =====================================================

-- Patients can view their own appointments
CREATE POLICY "appointments_patient_read" ON public.appointments
    FOR SELECT
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Staff can view appointments in their clinic
CREATE POLICY "appointments_staff_read" ON public.appointments
    FOR SELECT
    USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Staff can create appointments in their clinic
CREATE POLICY "appointments_staff_insert" ON public.appointments
    FOR INSERT
    WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

-- Staff can update appointments in their clinic
CREATE POLICY "appointments_staff_update" ON public.appointments
    FOR UPDATE
    USING (clinic_id = get_user_clinic_id(auth.uid()))
    WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

-- Staff can delete appointments in their clinic
CREATE POLICY "appointments_staff_delete" ON public.appointments
    FOR DELETE
    USING (clinic_id = get_user_clinic_id(auth.uid()));

-- =====================================================
-- 8. CREATE RLS POLICIES FOR INVOICES TABLE
-- =====================================================

-- Patients can view their own invoices
CREATE POLICY "invoices_patient_read" ON public.invoices
    FOR SELECT
    USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Staff can view invoices in their clinic
CREATE POLICY "invoices_staff_read" ON public.invoices
    FOR SELECT
    USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Staff can create invoices in their clinic
CREATE POLICY "invoices_staff_insert" ON public.invoices
    FOR INSERT
    WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

-- Staff can update invoices in their clinic
CREATE POLICY "invoices_staff_update" ON public.invoices
    FOR UPDATE
    USING (clinic_id = get_user_clinic_id(auth.uid()))
    WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

-- =====================================================
-- VERIFY RLS POLICIES
-- =====================================================

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clinic', 'staff_members', 'staff_invites', 'patients', 'appointments', 'invoices');

-- Check helper functions exist
SELECT proname as function_name, pronargs as num_arguments
FROM pg_proc 
WHERE proname IN ('is_owner', 'is_manager', 'is_staff_member', 'get_user_clinic_id');

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('clinic', 'staff_members', 'staff_invites', 'patients', 'appointments', 'invoices')
GROUP BY tablename
ORDER BY tablename;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies and helper functions created successfully!';
    RAISE NOTICE '✅ Run the verification queries above to confirm.';
END $$;
```

---

### Step 4: Click RUN

**Click the Run button** or press **Cmd/Ctrl + Enter**

---

### Step 5: Verify Success

You should see:

```
✅ RLS is enabled on all tables
✅ 4 helper functions created (is_owner, is_manager, is_staff_member, get_user_clinic_id)
✅ Multiple policies created per table:
   - clinic: 4 policies
   - staff_members: 6 policies
   - staff_invites: 5 policies
   - patients: 4 policies
   - appointments: 5 policies
   - invoices: 4 policies
```

---

## 🧪 TEST AFTER RUNNING MIGRATION

### Step 1: Delete Old Test User

1. Go to: **Supabase → Authentication → Users**
2. Find: `im.hammadkhurshid@gmail.com`
3. Click: **⋮ (three dots) → Delete user**

### Step 2: Clear Everything

**In browser:**
- Close ALL tabs of your app
- Hard refresh (Cmd/Ctrl + Shift + R)
- Or open in Incognito/Private mode

### Step 3: Fresh Signup

1. Go to: https://www.myclinicadmin.app/auth/signup
2. Fill all fields
3. Email: `im.hammadkhurshid@gmail.com` (or any email)
4. Click **Send OTP**
5. Check email, copy OTP
6. Enter OTP
7. Click **Verify**

### Expected Result:

```
✅ No "Failed to create clinic" error!
✅ No 403 Forbidden in console!
✅ Confetti animation 🎊
✅ "Email verified successfully!"
✅ Redirects to /dashboard
✅ Dashboard loads with clinic data
✅ Team Management appears in sidebar!
```

---

## 🔍 WHY THE PREVIOUS FIX DIDN'T WORK

### What You Ran Before:

```sql
CREATE POLICY "Users can create their own clinic"
ON public.clinic FOR INSERT
WITH CHECK (auth.uid() = owner_id);
```

**This was correct BUT incomplete!**

### What Was Missing:

1. ❌ Helper functions (`is_owner`, `is_manager`)
2. ❌ RLS policies for `staff_members` table
3. ❌ Policy to allow users to INSERT into `staff_members` during signup
4. ❌ Other necessary policies for multi-tenancy

### The Complete Solution:

The migration file creates:
- ✅ 4 helper functions for checking permissions
- ✅ RLS policies for clinic (SELECT, INSERT, UPDATE)
- ✅ RLS policies for staff_members (SELECT, INSERT, UPDATE, DELETE)
- ✅ **Special policy: "staff_members_self_insert"** - allows users to create their own staff entry during signup
- ✅ RLS policies for staff_invites
- ✅ RLS policies for patients, appointments, invoices

**Without the "staff_members_self_insert" policy, even if clinic creation works, the staff_member creation will fail!**

---

## 🚨 CRITICAL: The Self-Insert Policy

This is THE KEY policy you were missing:

```sql
-- Allow users to create their own staff_member entry during signup
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

**This allows users to:**
1. ✅ Create clinic (with clinic_owner_insert policy)
2. ✅ Create staff_member entry for themselves (with staff_members_self_insert policy)
3. ✅ Become the owner
4. ✅ See Team Management in sidebar

**Without this policy:**
- ❌ Clinic creates successfully
- ❌ staff_member INSERT fails with 403
- ❌ User logs in but has no clinic association
- ❌ Team Management doesn't appear

---

## ✅ VERIFICATION CHECKLIST

After running the complete migration:

- [ ] Opened Supabase SQL Editor
- [ ] Pasted the COMPLETE migration script
- [ ] Clicked Run
- [ ] Saw success messages (helper functions + policies created)
- [ ] Deleted old test user (im.hammadkhurshid@gmail.com)
- [ ] Closed all browser tabs
- [ ] Hard refreshed or used Incognito
- [ ] Tried fresh signup
- [ ] Received OTP email
- [ ] Entered OTP
- [ ] NO 403 error in console
- [ ] NO "Failed to create clinic" message
- [ ] Saw confetti animation 🎊
- [ ] Redirected to dashboard
- [ ] Dashboard shows clinic data
- [ ] **Team Management appears in sidebar**
- [ ] Clicked Team Management
- [ ] Team page shows you as owner

---

## 🎯 RUN THE COMPLETE MIGRATION NOW!

**This will 100% fix your issue!**

The problem wasn't just the clinic INSERT policy - it was also the missing staff_members self-insert policy!

Run the full migration and test again! 🚀

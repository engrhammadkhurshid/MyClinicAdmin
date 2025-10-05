# FIX: RLS Policy for staff_members INSERT

## 🎯 THE ERROR (Updated)

**Console Error:**
```
❌ Staff member creation failed
Staff error details: {
  code: "42501",
  message: "new row violates row-level security policy for table \"staff_members\""
}
💥 Signup failed at some step: Failed to create staff membership: new row violates row-level security policy
```

**Toast:**
```
Failed to create staff membership: new row violates row-level security policy for table "staff_members"
```

---

## ✅ GOOD NEWS!

The `gen_staff_id()` function permission is **fixed**! 

**Evidence:** Error changed from "permission denied for table users" to "violates row-level security policy for table staff_members"

This means the function CAN now access `auth.users`, but now we need the **RLS INSERT policy** for staff_members!

---

## 🔧 THE COMPLETE FIX - RUN THIS SQL

**Go to Supabase SQL Editor and run:**

```sql
-- =====================================================
-- FIX: Add ALL Required RLS Policies
-- =====================================================

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
-- STAFF_MEMBERS POLICIES (THE CRITICAL ONE!)
-- =====================================================

-- 🔥 Allow users to create their own staff_member entry during signup
-- THIS IS THE MISSING POLICY CAUSING THE ERROR!
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
-- PROFILES POLICIES (for completeness)
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
-- VERIFY ALL POLICIES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd = 'INSERT' THEN with_check
        ELSE qual
    END as policy_condition
FROM pg_policies
WHERE tablename IN ('clinic', 'staff_members', 'profiles')
ORDER BY tablename, cmd, policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All RLS policies created successfully!';
    RAISE NOTICE '✅ Clinic policies: INSERT, SELECT, UPDATE';
    RAISE NOTICE '✅ Staff members policies: INSERT, SELECT (self + owner)';
    RAISE NOTICE '✅ Profiles policies: INSERT, SELECT, UPDATE';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now complete signup without RLS errors!';
END $$;
```

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Run the SQL

1. Go to: https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/sql/new
2. **Paste the COMPLETE SQL above**
3. Click **Run** (or Cmd/Ctrl + Enter)

### Step 2: Verify Success

You should see:
```
✅ All RLS policies created successfully!
✅ Clinic policies: INSERT, SELECT, UPDATE
✅ Staff members policies: INSERT, SELECT (self + owner)
✅ Profiles policies: INSERT, SELECT, UPDATE

🚀 You can now complete signup without RLS errors!
```

And a table showing all policies:
```
tablename      | operation | policyname
---------------|-----------|---------------------------
clinic         | INSERT    | clinic_owner_insert
clinic         | SELECT    | clinic_owner_read
clinic         | UPDATE    | clinic_owner_update
staff_members  | INSERT    | staff_members_self_insert  ← THE KEY ONE!
staff_members  | SELECT    | staff_members_self_read
staff_members  | SELECT    | staff_members_owner_read
profiles       | INSERT    | profiles_self_insert
profiles       | SELECT    | profiles_self_read
profiles       | UPDATE    | profiles_self_update
```

---

## 🧪 TEST AFTER RUNNING SQL

### Step 1: Clean Up Old Data

**Delete test user:**
1. Supabase → Authentication → Users
2. Find: `im.hammadkhurshid@gmail.com`
3. Delete user

**Delete partial data (if any):**
```sql
-- Check for partial data
SELECT id, email FROM auth.users WHERE email = 'im.hammadkhurshid@gmail.com';

-- If user ID exists, clean up:
DELETE FROM staff_members WHERE user_id = 'user-id-here';
DELETE FROM clinic WHERE owner_id = 'user-id-here';
DELETE FROM profiles WHERE id = 'user-id-here';
-- Then delete user from Auth UI
```

### Step 2: Fresh Signup Test

1. **Open fresh Incognito window**
2. **Open Console** (F12) and **clear it**
3. Go to: https://www.myclinicadmin.app/auth/signup
4. Fill all fields
5. Click "Send OTP"
6. Enter OTP from email
7. Click "Verify"
8. **👀 WATCH CONSOLE CLOSELY**

---

## ✅ EXPECTED SUCCESS

### Console Output:

```
🔐 Step 1: Verifying OTP for: your@email.com
✅ Step 1 Complete: OTP verified, user ID: abc-123-def

👤 Step 2: Creating profile...
✅ Step 2 Complete: Profile created

🏥 Step 3: Creating clinic...
✅ Step 3 Complete: Clinic created with ID: clinic-123

👔 Step 4: Creating owner staff membership...
✅ Step 4 Complete: Staff member created with role: owner

🎉 ALL STEPS COMPLETE! Showing confetti and redirecting...
🚀 Redirecting to dashboard...
```

### What Happens:

1. ✅ **NO RLS policy error!**
2. ✅ All 5 steps complete with ✅
3. 🎊 **Confetti animation appears**
4. ⏱️ **Waits 2 seconds**
5. 🚀 **Auto-redirects to /dashboard**
6. 📊 **Dashboard loads with clinic data**
7. 🛡️ **"Team Management" link visible in sidebar**

---

## 🔍 WHY THIS FIXES IT

### The Signup Flow:

**Step 1:** User verifies OTP → Supabase creates auth user ✅

**Step 2:** Code creates profile:
```sql
INSERT INTO profiles (id, name, phone, specialty)
VALUES (user_id, 'Name', 'Phone', 'Specialty')
```
✅ Works because of `profiles_self_insert` policy: `CHECK (id = auth.uid())`

**Step 3:** Code creates clinic:
```sql
INSERT INTO clinic (owner_id, name, slug, type, location)
VALUES (user_id, 'Clinic Name', 'clinic-slug', 'Type', 'Location')
```
✅ Works because of `clinic_owner_insert` policy: `CHECK (auth.uid() = owner_id)`

**Step 4:** Code creates staff_member:
```sql
INSERT INTO staff_members (clinic_id, user_id, role, status)
VALUES (clinic_id, user_id, 'owner', 'active')
```
**BEFORE:** ❌ Failed because no INSERT policy exists!
**AFTER:** ✅ Works because of `staff_members_self_insert` policy: `CHECK (user_id = auth.uid())`

**Step 5:** Confetti + redirect! 🎉

---

## 🚨 ABOUT RLS POLICIES

### What is RLS?

**Row Level Security (RLS)** controls who can INSERT, SELECT, UPDATE, DELETE rows in a table.

### Policy Types:

**FOR INSERT:**
- Uses `WITH CHECK (condition)` 
- Must be TRUE to allow INSERT
- Example: `WITH CHECK (user_id = auth.uid())` means "user can only insert rows where user_id matches their auth ID"

**FOR SELECT:**
- Uses `USING (condition)`
- Can only see rows where condition is TRUE
- Example: `USING (user_id = auth.uid())` means "user can only see their own rows"

### The Critical Policy:

```sql
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

**Translation:** 
"Users can INSERT into staff_members table ONLY when the user_id column equals their authenticated user ID"

This allows signup to work because:
- User is authenticated (OTP verified)
- Code tries to INSERT with `user_id = data.user.id`
- `data.user.id` equals `auth.uid()` ✅
- Policy check passes ✅
- INSERT succeeds! ✅

---

## ✅ VERIFICATION CHECKLIST

After running the SQL and testing:

- [ ] Ran complete RLS SQL in Supabase SQL Editor
- [ ] Saw success messages (all policies created)
- [ ] Saw policy verification table (9 policies)
- [ ] Deleted old test user
- [ ] Deleted partial data (clinic, staff_members, profiles)
- [ ] Opened fresh incognito window
- [ ] Opened console (F12) and cleared it
- [ ] Tried fresh signup
- [ ] Received OTP email
- [ ] Entered OTP
- [ ] **NO "violates row-level security policy" error** ✅
- [ ] Console shows all 5 steps with ✅
- [ ] Confetti animation appeared 🎊
- [ ] Auto-redirect to dashboard worked 🚀
- [ ] Dashboard loaded with clinic data
- [ ] "Team Management" visible in sidebar
- [ ] Clicked Team Management → See yourself as "Owner" ✅

---

## 🎯 RUN THE COMPLETE SQL NOW!

1. **Copy the COMPLETE SQL** from top of this document
2. **Go to Supabase SQL Editor**
3. **Paste it**
4. **Click Run**
5. **Verify 9 policies created**
6. **Delete test user**
7. **Try fresh signup in incognito with console**
8. **Watch all 5 steps complete!** ✅

---

**This is THE final fix! The staff_members_self_insert policy is what you need!** 🚀

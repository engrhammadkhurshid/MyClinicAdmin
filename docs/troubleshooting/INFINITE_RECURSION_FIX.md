# FIX: Infinite Recursion in RLS Policy

## 🎯 THE ERROR

**Toast:**
```
Failed to create staff membership: infinite recursion detected in policy for relation "staff_members"
```

**Root Cause:**
The `staff_members_owner_read` policy is causing **infinite recursion** because it queries the `staff_members` table within its own USING clause!

**The problematic policy:**
```sql
CREATE POLICY "staff_members_owner_read" ON public.staff_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm  -- 🔥 RECURSION!
            WHERE sm.clinic_id = staff_members.clinic_id
            AND sm.user_id = auth.uid()
            ...
        )
    );
```

**Why it recurses:**
1. User tries to SELECT from staff_members
2. RLS checks staff_members_owner_read policy
3. Policy needs to SELECT from staff_members to check condition
4. That SELECT triggers the same policy again
5. Infinite loop! 🔄

---

## 🔧 THE FIX - Simple RLS Policies

**Run this SQL in Supabase SQL Editor:**

```sql
-- =====================================================
-- FIX: Remove Recursive RLS Policies
-- =====================================================

-- Drop ALL existing policies
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

-- Allow users to insert their own staff_member entry
CREATE POLICY "staff_members_self_insert" ON public.staff_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Allow users to read their own staff_member records
-- NO recursion - just checks user_id directly
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
-- VERIFY NO RECURSION
-- =====================================================

SELECT 
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd = 'INSERT' THEN with_check
        ELSE qual
    END as policy_check
FROM pg_policies
WHERE tablename IN ('clinic', 'staff_members', 'profiles')
ORDER BY tablename, cmd;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simple RLS policies created - NO RECURSION!';
    RAISE NOTICE '✅ Removed staff_members_owner_read (was causing recursion)';
    RAISE NOTICE '✅ Kept only direct user_id checks for staff_members';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Signup should work now without infinite recursion!';
END $$;
```

---

## 📋 WHAT CHANGED

### ❌ REMOVED (Caused Recursion):

```sql
-- This policy was causing infinite recursion:
CREATE POLICY "staff_members_owner_read" ON public.staff_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm  -- Queries same table!
            WHERE sm.clinic_id = staff_members.clinic_id
            AND sm.user_id = auth.uid()
            AND sm.role = 'owner'
        )
    );
```

### ✅ KEPT (Simple, No Recursion):

```sql
-- This policy is simple and direct - no recursion:
CREATE POLICY "staff_members_self_read" ON public.staff_members
    FOR SELECT
    USING (user_id = auth.uid());  -- Direct check, no subquery!
```

---

## 🧪 TEST AFTER RUNNING SQL

### Step 1: Run the SQL

1. Go to Supabase SQL Editor
2. Paste the complete SQL above
3. Click **Run**
4. Verify success messages

### Step 2: Delete Test User

1. Supabase → Auth → Users
2. Delete: `im.hammadkhurshid@gmail.com`
3. Delete any partial data:

```sql
-- Clean up partial data
DELETE FROM staff_members WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'im.hammadkhurshid@gmail.com'
);
DELETE FROM clinic WHERE owner_id IN (
    SELECT id FROM auth.users WHERE email = 'im.hammadkhurshid@gmail.com'
);
DELETE FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'im.hammadkhurshid@gmail.com'
);
```

### Step 3: Fresh Signup

1. **Open incognito window**
2. **Open console** (F12) and **clear it**
3. Go to signup page
4. Fill all fields
5. Send OTP → Enter OTP → Verify
6. **👀 WATCH CONSOLE**

---

## ✅ EXPECTED SUCCESS

### Console Output:

```
🔐 Step 1: Verifying OTP for: your@email.com
✅ Step 1 Complete: OTP verified, user ID: abc-123

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

- ✅ **NO "infinite recursion" error!**
- ✅ All 5 steps complete
- 🎊 **Confetti animation**
- 🚀 **Auto-redirect to dashboard**
- 📊 **Dashboard loads**
- 🛡️ **Team Management visible**

---

## 🔍 WHY RECURSION HAPPENED

### The Problem:

```
User signup tries to INSERT into staff_members
  ↓
INSERT triggers SELECT to verify policies
  ↓
SELECT checks staff_members_owner_read policy
  ↓
Policy contains: SELECT FROM staff_members (same table!)
  ↓
That SELECT triggers staff_members_owner_read again
  ↓
Infinite loop! 🔄
  ↓
Error: "infinite recursion detected"
```

### The Solution:

**Use simple, direct checks - NO subqueries on the same table!**

**GOOD (no recursion):**
```sql
USING (user_id = auth.uid())  -- Direct column check ✅
```

**BAD (causes recursion):**
```sql
USING (
    EXISTS (
        SELECT 1 FROM staff_members ...  -- Queries same table! ❌
    )
)
```

---

## 📝 NOTE: Team Management Access

**After removing `staff_members_owner_read` policy:**

Users can only see their **own** staff_member record (via `staff_members_self_read`).

**For Team Management page to show all staff:**

We'll need a **helper function** or **different approach** that doesn't cause recursion:

**Option 1: Use a helper function with SECURITY DEFINER**
```sql
CREATE FUNCTION get_clinic_staff(clinic_id UUID)
RETURNS SETOF staff_members
SECURITY DEFINER
AS $$
  SELECT * FROM staff_members WHERE clinic_id = $1;
$$ LANGUAGE sql;
```

**Option 2: Join through clinic table**
```sql
CREATE POLICY "staff_members_clinic_read" ON public.staff_members
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT id FROM clinic WHERE owner_id = auth.uid()
        )
    );
```

**For now:** We're keeping it simple to get signup working. We can add the Team Management policies later without recursion!

---

## ✅ VERIFICATION CHECKLIST

After running SQL and testing:

- [ ] Ran SQL in Supabase SQL Editor
- [ ] Saw success messages (no recursion policies)
- [ ] Verified only 7 policies exist (not 8)
- [ ] Deleted test user
- [ ] Deleted partial data
- [ ] Opened incognito + console
- [ ] Tried fresh signup
- [ ] **NO "infinite recursion" error** ✅
- [ ] Console shows all 5 steps with ✅
- [ ] Confetti appeared 🎊
- [ ] Auto-redirect worked 🚀
- [ ] Dashboard loaded
- [ ] Can view profile and clinic data

---

## 🎯 RUN THE FIX NOW!

1. **Copy the SQL fix** (from top of this document)
2. **Paste in Supabase SQL Editor**
3. **Click Run**
4. **Delete test user and partial data**
5. **Try signup in incognito with console**
6. **Should work perfectly - NO RECURSION!** ✅

---

## 🚀 NEXT STEPS (After Signup Works)

Once signup completes successfully, we can add Team Management policies safely:

1. Create a helper function with SECURITY DEFINER
2. Or use clinic table join (no recursion)
3. Test Team Management page access
4. Verify owners can see all staff

**But first: Get signup working!** 🎯

---

**This fix removes the recursive policy and uses simple direct checks only!** 🚀

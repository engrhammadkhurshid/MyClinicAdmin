# Profile Creation Fix - Implementation Guide

## What We're Fixing

The signup process was failing with "new row violates row-level security policy" because:
1. User is created in `auth.users`
2. App tries to manually create profile in `profiles` table
3. RLS policy blocks it because session might not be fully established

## Solution: Database Trigger (Automated Profile Creation)

We're implementing a database trigger that automatically creates a profile whenever a user signs up.

---

## Step 1: Run the SQL Migration

1. **Go to your Supabase Dashboard**
2. **Navigate to: SQL Editor** (left sidebar)
3. **Click: "New Query"**
4. **Copy and paste this SQL:**

```sql
-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, specialty)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'specialty', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. **Click: "Run"** (or press Cmd+Enter)
6. **Verify:** You should see "Success. No rows returned"

---

## Step 2: How It Works Now

### Before (Manual - Had Issues):
1. User signs up → Creates auth.users row
2. App manually inserts into profiles table
3. ❌ RLS policy blocks it

### After (Automated - Fixed):
1. User signs up → Creates auth.users row
2. ✅ Database trigger automatically creates profiles row
3. App updates clinic info (optional)
4. User can update remaining info from profile page

---

## Step 3: Test the Fix

### Test Signup:
1. Go to your app's signup page
2. Fill in all the fields (name, email, phone, specialty, clinic name, clinic type)
3. Click "Sign Up"
4. Should redirect to dashboard without errors

### Verify in Database:
1. Go to Supabase Dashboard → Table Editor → profiles
2. You should see a new row with:
   - `id`: User's UUID
   - `name`: From signup form
   - `phone`: From signup form
   - `specialty`: From signup form
   - `clinic_name`: From signup form
   - `clinic_type`: From signup form

---

## What Happens with Existing Users

If you have existing users (like your current user) who don't have profile rows:

1. **Option A - Create via Profile Page:**
   - Go to Profile page
   - Update Manager Info → Creates profile with name/phone
   - Update Clinic Info → Adds clinic details

2. **Option B - Create Manually in Supabase:**
   ```sql
   -- Replace <user-id> with actual UUID from auth.users
   INSERT INTO profiles (id, name, phone, specialty)
   VALUES ('<user-id>', 'Your Name', 'Your Phone', '');
   ```

---

## Code Changes Made

### 1. Updated `app/auth/signup/page.tsx`
- Removed manual profile INSERT
- Added metadata to signup (name, phone, specialty, clinic_name, clinic_type)
- Trigger automatically creates profile from metadata
- App updates clinic info after trigger runs

### 2. Updated `app/(dashboard)/profile/page.tsx`
- Manager Info handler: Creates profile if missing, updates name/phone
- Clinic Info handler: Creates profile if missing, updates clinic info
- Both handlers check if profile exists before deciding insert vs update

### 3. Created `supabase/fix_profile_creation.sql`
- SQL migration to create the trigger
- Documentation for manual setup

---

## Benefits

✅ **Secure:** Uses SECURITY DEFINER to bypass RLS during automatic creation  
✅ **Reliable:** Trigger runs immediately after user creation  
✅ **Automatic:** No manual code needed in signup flow  
✅ **Clean:** Profile always exists when user accesses the app  
✅ **Flexible:** User can update details from profile page later  

---

## Troubleshooting

### If signup still fails:

1. **Check if trigger was created:**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check if function exists:**
   ```sql
   SELECT routine_name, routine_type
   FROM information_schema.routines
   WHERE routine_name = 'handle_new_user';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'profiles';
   ```

4. **Test trigger manually:**
   ```sql
   -- This should create a profile automatically
   -- Don't actually run this, just for reference
   -- INSERT INTO auth.users (email) VALUES ('test@example.com');
   ```

---

## Next Steps

After running the SQL:
1. ✅ Test signup with a new user
2. ✅ Test profile page updates (Manager Info and Clinic Info)
3. ✅ Verify data persists after navigation
4. ✅ Check that both sections work independently

If everything works, you're all set! 🎉

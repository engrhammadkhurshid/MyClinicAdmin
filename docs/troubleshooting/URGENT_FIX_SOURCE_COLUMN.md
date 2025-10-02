# 🚨 URGENT FIX: Source Column Error

## Problem
Getting this error when creating appointments or patients:
```
Failed to create patient: Could not find the 'source' column of 'patients' in the schema cache
```

## ✅ Quick Fix (2 Minutes)

### Step 1: Go to Supabase
1. Open your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **MyClinicAdmin** project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### Step 3: Run This SQL

Copy and paste this entire code block:

```sql
-- Add the missing 'source' column to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Walk In';

-- Add description
COMMENT ON COLUMN public.patients.source IS 'Source of patient acquisition: Walk In, Google Ads, Meta Ads, GMB, Referral, Other';
```

### Step 4: Execute
1. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. You should see: **"Success. No rows returned"**

### Step 5: Test
1. Go back to your MyClinic Admin app
2. Refresh the page (`F5` or `Cmd+R`)
3. Try creating a patient or appointment again
4. ✅ **It should work now!**

---

## 🎯 Why This Happened

- The `source` column was added to the code but not to your database
- Your existing database was created before this column was added
- You need to run the migration once to add it

---

## ✅ Verification

To verify the column was added successfully, run this query:

```sql
-- Check if source column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'source';
```

**Expected result:**
```
column_name | data_type | column_default
------------|-----------|---------------
source      | text      | 'Walk In'::text
```

If you see this, you're good to go! ✅

---

## 📞 Still Having Issues?

If the error persists after running the migration:

1. **Clear your browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows/Linux)
   - Or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Restart browser

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for any errors

3. **Contact support:**
   - Email: engr.hammadkhurshid@gmail.com
   - WhatsApp: +92 336 7126719

---

## ⚠️ Important Notes

- ✅ This migration is **safe to run multiple times**
- ✅ It uses `IF NOT EXISTS` so it won't break if column exists
- ✅ Existing patient data will **not be affected**
- ✅ New patients will have "Walk In" as default source

---

**Run the SQL migration now and the error will be fixed!** 🚀

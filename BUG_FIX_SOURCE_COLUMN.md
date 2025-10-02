# Bug Fix: Missing 'source' Column Error

**Version:** 0.1.0-beta  
**Date:** October 3, 2025  
**Status:** ✅ FIXED

---

## 🐛 Bug Report

### Issue Description
When creating a new appointment and filling out patient data in the appointment form, users encountered the following error:

```
Could not find the 'source' column of 'patients' in the schema cache
```

### Reported By
First production user 🎉

### Severity
**HIGH** - Blocked users from creating appointments with new patients

---

## 🔍 Root Cause Analysis

### Problem
The `source` column was referenced in the application code but was **missing from the main database schema** (`supabase/schema.sql`).

**Why it happened:**
- The `source` column was added as a separate migration (`supabase/add_source_field.sql`)
- However, the main schema file (`schema.sql`) was not updated
- New installations using only `schema.sql` were missing this column
- Existing users who ran the migration were fine, but new users got the error

### Affected Files
1. `components/AppointmentForm.tsx` - Used `source` field when creating patients
2. `app/(dashboard)/patients/new/page.tsx` - Used `source` field
3. `supabase/schema.sql` - Missing the column definition

---

## ✅ Fix Applied

### 1. Updated Database Schema
**File:** `supabase/schema.sql`

Added `source` column to the `patients` table definition:

```sql
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT DEFAULT 'Walk In',  -- ✅ ADDED
    labels TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2. Created Migration File for Existing Users
**File:** `supabase/fix_source_column.sql`

Created a safe migration script that:
- Checks if the column already exists
- Only adds it if missing
- Provides clear feedback

```sql
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.patients
        ADD COLUMN source TEXT DEFAULT 'Walk In';
        
        RAISE NOTICE 'Source column added successfully';
    ELSE
        RAISE NOTICE 'Source column already exists';
    END IF;
END $$;
```

---

## 🎁 Bonus Improvements

While fixing this bug, we also added **proper user notifications**!

### Added Toast Notifications
Installed `react-hot-toast` library for beautiful, professional notifications.

**Benefits:**
- ✅ Clear success/error messages
- ✅ Loading states for async operations
- ✅ Auto-dismiss after 4 seconds
- ✅ Consistent UX across the app

### Updated Components

1. **AppointmentForm.tsx**
   - ✅ Toast on successful appointment creation
   - ✅ Toast on errors with specific error messages
   - ✅ Loading toast during creation
   - ❌ Removed old error state div

2. **New Patient Page**
   - ✅ Toast on successful patient creation
   - ✅ Toast on errors with specific messages
   - ✅ Loading toast during creation
   - ❌ Removed old error state div

3. **Profile Page**
   - ✅ Toast on successful profile update
   - ✅ Toast on successful password change
   - ✅ Toast on logout
   - ✅ Toast on errors
   - ✅ Loading toasts for all operations
   - ❌ Removed old success/error divs

4. **Root Layout**
   - ✅ Added `<Toaster />` component
   - ✅ Configured with custom styling
   - ✅ Positioned at top-right
   - ✅ Green for success, red for errors

---

## 📋 How to Apply the Fix

### For New Installations
✅ **No action needed!** The main `schema.sql` now includes the `source` column.

### For Existing Installations

1. **Go to your Supabase dashboard**
2. **Click on SQL Editor**
3. **Run this migration:**

```sql
-- Copy contents from supabase/fix_source_column.sql
-- Or run this directly:

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Walk In';
```

4. **Verify the fix:**

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'source';
```

Expected result:
```
column_name | data_type | column_default
------------|-----------|---------------
source      | text      | 'Walk In'::text
```

---

## 🧪 Testing

### Test Cases
✅ Create new appointment with new patient - **WORKS**  
✅ Create new appointment with existing patient - **WORKS**  
✅ Create new patient directly - **WORKS**  
✅ Update profile - **WORKS with toast**  
✅ Change password - **WORKS with toast**  
✅ Error scenarios - **Shows proper toast messages**

### Build Status
```bash
npm run build
# ✓ Generating static pages (15/15)
# Exit Code: 0
```

---

## 📦 Dependencies Added

```json
{
  "react-hot-toast": "^2.4.1"
}
```

**Installation:**
```bash
npm install react-hot-toast
```

---

## 📸 Screenshots

### Before (Error Message)
```
❌ Could not find the 'source' column of 'patients' in the schema cache
```

### After (Toast Notification)
```
✅ Appointment created successfully!
```

---

## 🔄 Deployment Checklist

- [x] Fix applied to codebase
- [x] Database schema updated
- [x] Migration script created
- [x] Toast notifications implemented
- [x] Build passing
- [x] All features tested
- [ ] Deploy to production
- [ ] Notify users to run migration (if needed)
- [ ] Monitor for any related issues

---

## 📚 Lessons Learned

1. **Keep schema.sql in sync** - Always update the main schema when adding migrations
2. **Test with fresh database** - Simulates new user experience
3. **Better error messages** - Toast notifications provide clear feedback
4. **Document migrations** - Create clear migration paths for existing users

---

## 🎉 Status: RESOLVED

This bug is now **completely fixed**. Users can create appointments and patients without any issues!

### Next Steps
1. Deploy updated code to production
2. Existing users: Run the migration SQL
3. Monitor for any similar schema issues
4. Continue collecting user feedback

---

**Fixed by:** Hammad Khurshid  
**Date:** October 3, 2025  
**Time:** Evening PKT  
**First Production Bug:** ✅ Squashed! 🐛🔨

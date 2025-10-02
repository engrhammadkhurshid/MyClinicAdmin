# Profile Update Debugging Guide

## Changes Made

### 1. Added Extensive Logging
- Added console.log statements before and after database updates
- Logs show user ID, data being sent, and response from Supabase
- Logs errors with full error details

### 2. Enhanced Error Handling
- Added verification check if no data is returned from update
- Better error messages
- Proper error logging to console

### 3. Added `.select()` to Updates
- This ensures we get back the updated data
- Helps verify the update actually happened

## How to Debug

### Step 1: Open Browser Developer Tools
1. Open your app in the browser
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to the "Console" tab

### Step 2: Try Updating Manager Info
1. Navigate to Profile page
2. Change your name or phone number
3. Click "Update Manager Info"
4. Watch the console for logs

### Step 3: Check Console Output

You should see logs like this:

```
Updating profile for user: <uuid>
Profile data to update: { name: "John Doe", phone: "+92 300 1234567" }
Update response: { data: [...], error: null }
```

### Expected Scenarios:

#### Scenario A: Update Succeeds
```
Updating profile for user: abc123...
Profile data to update: { name: "John", phone: "+92..." }
Update response: { data: [{id: "abc123", name: "John", phone: "+92..."}], error: null }
```
✅ This means the update worked!

#### Scenario B: Permission Error
```
Update response: { data: null, error: { message: "new row violates row-level security policy" } }
```
❌ This means RLS policy is blocking the update

#### Scenario C: No Row Exists
```
Update response: { data: [], error: null }
No data returned from update - checking if row exists
Profile check: { data: [], error: null }
```
❌ This means there's no profile row for this user

#### Scenario D: Column Doesn't Exist
```
Update response: { data: null, error: { message: "column 'name' does not exist" } }
```
❌ This means the database schema is missing columns

## Common Issues & Solutions

### Issue 1: No Profile Row Exists
**Symptoms:** Update returns empty array, profile check returns no data

**Solution:** Create the profile row manually in Supabase:
1. Go to Supabase Dashboard
2. Navigate to Table Editor > profiles
3. Click "Insert Row"
4. Set `id` to your user's UUID (from auth.users)
5. Fill in name, phone, specialty

### Issue 2: RLS Policy Blocking Updates
**Symptoms:** Error message about "row-level security policy"

**Solution:** Check RLS policies in Supabase:
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Make sure you have this policy:
```sql
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
```

### Issue 3: Missing Columns
**Symptoms:** Error about column not existing

**Solution:** Run the migration SQL:
```sql
-- Add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clinic_name TEXT,
ADD COLUMN IF NOT EXISTS clinic_type TEXT;
```

### Issue 4: Stale Data in State
**Symptoms:** Update succeeds but UI shows old data

**Solution:** Check if `loadProfile()` is being called after update
- The code should call `await loadProfile()` after successful update
- Check console for "Loading profile..." messages

## Testing Checklist

- [ ] Open browser console (F12)
- [ ] Navigate to profile page
- [ ] Update name field
- [ ] Click "Update Manager Info"
- [ ] Check console for update logs
- [ ] Verify success message appears
- [ ] Navigate to another page (e.g., Dashboard)
- [ ] Come back to profile page
- [ ] Check if name is still updated

## What to Report

If the issue persists, please provide:

1. **Console logs** - Copy all logs from when you click save
2. **Error messages** - Any red error messages in console
3. **Network tab** - Check the Network tab for the Supabase request
   - Look for POST request to `/rest/v1/profiles`
   - Check the request payload and response

4. **Supabase Dashboard** - Check if the data is actually in the database
   - Go to Table Editor > profiles
   - Find your user's row
   - Check if name/phone are updated there

## Quick Verification

Run this in Supabase SQL Editor to check your profile:

```sql
-- Replace <your-user-id> with your actual user UUID
SELECT * FROM profiles WHERE id = '<your-user-id>';
```

This will show you exactly what's in the database for your profile.

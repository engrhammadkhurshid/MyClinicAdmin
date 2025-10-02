# Database Migration: From public.users to profiles + auth.users

## Overview
This document outlines the migration from using a `public.users` table to using Supabase's native `auth.users` table combined with a separate `profiles` table for user metadata.

## What Changed

### 1. Database Schema

**Before:**
- `public.users` table stored both authentication data (email) and profile data (name, phone, specialty)
- Other tables referenced `public.users(id)`

**After:**
- `auth.users` handles authentication (email, password) - managed by Supabase
- `public.profiles` stores user metadata (name, phone, specialty)
- `profiles.id` references `auth.users(id)` with CASCADE delete
- Other tables (`patients`, `appointments`, `attachments`) now reference `auth.users(id)` directly

### 2. SQL Schema Changes

```sql
-- Old table (REMOVED):
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT UNIQUE,  -- Duplicated from auth.users
    phone TEXT,
    specialty TEXT,
    ...
);

-- New table:
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Foreign Key Updates

All tables now reference `auth.users(id)` instead of `public.users(id)`:

```sql
-- patients table
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE

-- appointments table
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE

-- attachments table
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

### 4. TypeScript Type Changes

**File:** `types/database.types.ts`

```typescript
// Removed: users table definition
// Added: profiles table definition

profiles: {
  Row: {
    id: string
    name: string
    phone: string
    specialty: string
    profile_picture_url: string | null
    created_at: string
    updated_at: string
  }
  // ... Insert and Update types
}
```

Note: `email` is no longer in the profiles table as it's managed by `auth.users`.

### 5. Code Changes

#### Signup Flow (`app/auth/signup/page.tsx`)

**Before:**
```typescript
// 1. Create auth user
await supabase.auth.signUp({ email, password })

// 2. Insert into public.users with email
await supabase.from('users').insert({
  id: user.id,
  name,
  email,  // Stored redundantly
  phone,
  specialty
})
```

**After:**
```typescript
// 1. Create auth user
const { data: authData } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, phone, specialty }  // Stored in auth.users.user_metadata
  }
})

// 2. Insert into profiles (without email)
await supabase.from('profiles').insert({
  id: authData.user.id,
  name,
  phone,
  specialty
})
```

#### Profile Page (`app/(dashboard)/profile/page.tsx`)

**Before:**
```typescript
// Fetch from users table
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()

// Access email from users table
const email = data.email
```

**After:**
```typescript
// Get user from auth
const { data: { user } } = await supabase.auth.getUser()
const email = user.email  // From auth.users

// Fetch from profiles table
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// No email in profiles table
```

#### Profile Updates (`app/(dashboard)/profile/page.tsx`)

**Before:**
```typescript
await supabase
  .from('users')
  .update({
    name,
    email,  // Email was editable (bad practice)
    phone,
    specialty
  })
```

**After:**
```typescript
await supabase
  .from('profiles')
  .update({
    name,
    phone,
    specialty
    // Email cannot be updated here
  })
```

## Migration Steps for Existing Databases

If you already have data in `public.users`, follow these steps:

### Step 1: Backup Your Data

```sql
-- Create a backup of users table
CREATE TABLE users_backup AS SELECT * FROM public.users;
```

### Step 2: Create the New profiles Table

```sql
-- Run the new schema from supabase/schema.sql
-- This creates the profiles table
```

### Step 3: Migrate Data

```sql
-- Copy data from users to profiles (excluding email)
INSERT INTO public.profiles (id, name, phone, specialty, created_at, updated_at)
SELECT id, name, phone, specialty, created_at, updated_at
FROM public.users;
```

### Step 4: Update Foreign Keys

```sql
-- Drop old constraints
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_user_id_fkey;

-- Add new constraints
ALTER TABLE patients ADD CONSTRAINT patients_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE appointments ADD CONSTRAINT appointments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE attachments ADD CONSTRAINT attachments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 5: Drop Old Table

```sql
-- After verifying everything works
DROP TABLE public.users CASCADE;
```

### Step 6: Deploy Code Changes

1. Update `types/database.types.ts`
2. Update `app/auth/signup/page.tsx`
3. Update `app/(dashboard)/profile/page.tsx`
4. Deploy to production

## Benefits of This Approach

1. **Single Source of Truth**: Email is only stored in `auth.users`, eliminating data duplication
2. **Security**: Authentication data is managed by Supabase's built-in security
3. **Simplicity**: No need to sync email between tables
4. **Best Practice**: Follows Supabase's recommended pattern for user profiles
5. **Flexibility**: Easy to add/remove profile fields without touching auth data

## Testing Checklist

After migration, test the following:

- [ ] New user signup creates entry in both `auth.users` and `profiles`
- [ ] Login works with existing credentials
- [ ] Profile page loads user data correctly
- [ ] Profile updates work (name, phone, specialty)
- [ ] Email is displayed but cannot be edited
- [ ] Password change functionality works
- [ ] All dashboard queries work (patients, appointments)
- [ ] User deletion cascades to profiles, patients, appointments, and attachments

## Rollback Plan

If you need to rollback:

1. Restore from `users_backup` table
2. Revert code changes
3. Re-add old foreign key constraints
4. Redeploy previous version

## Support

For issues during migration:
- Check Supabase logs: Dashboard → Logs → Database
- Verify RLS policies are active: `SELECT * FROM pg_policies;`
- Ensure auth.users has the expected records

---

**Migration Date**: October 2, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete

# RBAC Database Migrations

This directory contains SQL migration scripts to add multi-role (Owner + Manager) support to MyClinicAdmin.

## 📋 Migration Overview

These migrations add clinic-centric multi-tenancy without breaking existing functionality. All existing users are automatically upgraded to "clinic owners."

## 🔄 Migration Order

**IMPORTANT**: Run migrations in this exact order:

1. **001_create_rbac_tables.sql** - Creates new tables (clinic, staff_members, staff_invites)
2. **002_add_clinic_id_to_tables.sql** - Adds clinic_id to existing tables (patients, appointments, attachments)
3. **003_update_rls_policies.sql** - Updates RLS policies for multi-tenancy

## 🚀 How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `001_create_rbac_tables.sql`
5. Click **Run**
6. Repeat for migrations 002 and 003

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd MyClinicAdmin-1

# Run migrations in order
supabase db push

# Or run individually
psql $DATABASE_URL < supabase/migrations/001_create_rbac_tables.sql
psql $DATABASE_URL < supabase/migrations/002_add_clinic_id_to_tables.sql
psql $DATABASE_URL < supabase/migrations/003_update_rls_policies.sql
```

## 📊 What Each Migration Does

### Migration 001: Create RBAC Tables

**Creates:**
- `clinic` table - Stores clinic information
- `staff_members` table - Links users to clinics with roles (owner/manager)
- `staff_invites` table - Manages invite tokens
- Helper functions for slugification and staff ID generation
- Auto-migration for existing users (creates clinic for each user)

**Safety:**
- ✅ Non-destructive (doesn't modify existing tables)
- ✅ Idempotent (can run multiple times safely)
- ✅ All existing users become clinic owners

### Migration 002: Add clinic_id to Tables

**Modifies:**
- Adds `clinic_id` column to `patients`, `appointments`, `attachments`
- Backfills `clinic_id` for all existing records
- Adds performance indexes
- Updates `get_patient_stats()` function for clinic-awareness

**Safety:**
- ✅ Adds columns as nullable first
- ✅ Backfills data before making NOT NULL
- ✅ Zero data loss
- ✅ Includes data integrity verification

### Migration 003: Update RLS Policies

**Creates:**
- Helper functions: `is_owner()`, `is_manager()`, `is_staff_member()`, `get_user_clinic_id()`
- RPC function: `accept_staff_invite()` for secure invite acceptance
- New RLS policies for all tables (clinic-based instead of user-based)

**Replaces:**
- Old user-based RLS policies with clinic-based policies
- Both owners and managers can access clinic data
- Owners have exclusive access to team and clinic settings

## ✅ Post-Migration Verification

After running all migrations, verify in Supabase SQL Editor:

```sql
-- 1. Check all existing users have clinics
SELECT 
    u.email,
    c.name as clinic_name,
    sm.role,
    sm.staff_id
FROM auth.users u
LEFT JOIN clinic c ON c.owner_id = u.id
LEFT JOIN staff_members sm ON sm.user_id = u.id
WHERE sm.status = 'active';

-- 2. Verify patients have clinic_id
SELECT COUNT(*) as patients_with_clinic
FROM patients
WHERE clinic_id IS NOT NULL;

-- 3. Verify appointments have clinic_id
SELECT COUNT(*) as appointments_with_clinic
FROM appointments
WHERE clinic_id IS NOT NULL;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🔒 Security Features

**RLS Enforcement:**
- ✅ Clinic isolation: Users can only access data from their clinic
- ✅ Role-based access: Owners vs Managers have different permissions
- ✅ Secure invite system: Token-based with expiry

**Helper Functions:**
- All helper functions use `SECURITY DEFINER` for consistent security context
- `STABLE` functions for query optimization

## 📈 Performance Impact

**Indexes Added:**
- `clinic(owner_id, slug)`
- `staff_members(clinic_id, user_id, status)`
- `staff_invites(clinic_id, email, token, expires_at)`
- `patients(clinic_id, full_name)`
- `appointments(clinic_id, appointment_date, status)`
- `attachments(clinic_id)`

**Query Optimization:**
- Composite indexes for common query patterns
- GIN index on staff_invites for fast token lookup

## 🔄 Rollback Procedure

If you need to rollback (NOT RECOMMENDED after data is added):

```sql
-- DANGER: Only use in emergency, will lose RBAC data

-- Step 1: Remove clinic_id constraints
ALTER TABLE patients ALTER COLUMN clinic_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN clinic_id DROP NOT NULL;
ALTER TABLE attachments ALTER COLUMN clinic_id DROP NOT NULL;

-- Step 2: Restore old RLS policies (see old schema.sql)

-- Step 3: Drop new tables (WARNING: loses all clinic/team data)
DROP TABLE IF EXISTS staff_invites CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS clinic CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;
```

## 📝 Migration Log

Keep track of when migrations were run:

```sql
-- Create migration log table
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by TEXT
);

-- Log each migration
INSERT INTO migration_log (migration_name, executed_by)
VALUES ('001_create_rbac_tables.sql', current_user);
```

## 🆘 Troubleshooting

### Issue: "column clinic_id does not exist"

**Solution:** Run migration 002 before migration 003

### Issue: "function is_owner does not exist"

**Solution:** Run migration 003 to create helper functions

### Issue: Existing users can't see data

**Solution:** Verify migration 001 created clinic for all users:

```sql
SELECT COUNT(*) FROM auth.users 
WHERE id NOT IN (SELECT owner_id FROM clinic);
-- Should return 0
```

### Issue: RLS policy errors

**Solution:** Ensure helper functions exist:

```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('is_owner', 'is_manager', 'is_staff_member', 'get_user_clinic_id');
-- Should return 4 rows
```

## 📞 Support

If you encounter issues:

1. Check Supabase logs in Dashboard → Database → Logs
2. Verify each migration completed successfully
3. Run verification queries above
4. Check the main RBAC_IMPLEMENTATION_PLAN.md for detailed context

## ✨ What's Next?

After running all migrations successfully:

1. Update application code (see `/docs/RBAC_IMPLEMENTATION_PLAN.md`)
2. Test invite flow
3. Deploy frontend changes
4. Monitor performance metrics

---

**Migration Status:**
- [x] 001: Create RBAC tables
- [x] 002: Add clinic_id to existing tables
- [x] 003: Update RLS policies
- [ ] Frontend code updates (next phase)

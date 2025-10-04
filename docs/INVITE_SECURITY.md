# Invite System Security & Duplicate Prevention

## 🔒 Security Issue Fixed

**Problem**: Users could invite themselves or existing staff members, creating duplicate memberships and security issues.

**Example scenario that was possible**:
- Owner invites their own email
- Owner uses invite link to "join" their own clinic again
- Creates confusion and data inconsistency

## ✅ Solutions Implemented

### 1. **Frontend Validation (UX Layer)**
Location: `components/team/InviteManagerButton.tsx`

**Checks before creating invite**:
1. ✅ Can't invite yourself (email comparison)
2. ✅ Can't invite existing active staff members
3. ✅ Can't invite inactive users (suggests activation instead)
4. ✅ Can't invite users who are already clinic owners
5. ✅ Prevents duplicate pending invites

**User experience**:
- Immediate feedback with clear error messages
- No wasted API calls
- Helpful suggestions (e.g., "activate instead of inviting")

```typescript
// Example error messages:
"You can't invite yourself!"
"This user is already an owner in your clinic"
"This user is inactive. Please activate them instead."
"This user is already a clinic owner. They cannot be invited as a manager."
```

### 2. **Frontend Acceptance Validation (UX Layer)**
Location: `components/team/InviteAcceptanceForm.tsx`

**Checks before accepting invite**:
1. ✅ Clinic owners cannot accept manager invites
2. ✅ Existing staff members cannot re-join same clinic
3. ✅ Clear error messages explaining why

**User experience**:
- Prevents confusion when using invite link
- Shows which clinic user already owns
- Clear explanation of restrictions

### 3. **Database Validation (Security Layer)**
Location: `supabase/migrations/004_prevent_duplicate_invites.sql`

**Database-level protections**:

#### a. Unique Constraint on staff_members
```sql
ALTER TABLE staff_members 
ADD CONSTRAINT unique_user_per_clinic 
UNIQUE (user_id, clinic_id);
```
**Prevents**: Same user joining same clinic twice

#### b. Single Owner Trigger
```sql
CREATE TRIGGER enforce_single_owner
```
**Prevents**: Users from being owners of multiple clinics
**Why**: Owners should have one dedicated clinic

#### c. Unique Pending Invites Index
```sql
CREATE UNIQUE INDEX idx_unique_pending_invite 
ON staff_invites(clinic_id, LOWER(email))
WHERE accepted_at IS NULL AND expires_at > NOW();
```
**Prevents**: Multiple active invites for same email in same clinic

#### d. Enhanced RPC Function
```sql
CREATE OR REPLACE FUNCTION accept_staff_invite(p_token, p_user_id)
```
**Validates**:
- Email matches invite
- User is not already an owner
- User is not already in the clinic
- Invite is valid and not expired

#### e. Helper Function for Pre-validation
```sql
CREATE FUNCTION can_invite_email(clinic_id, email, inviter_id)
```
**Returns**: JSON with can_invite boolean and reason
**Useful for**: Server-side validation before creating invite

## 📊 Multi-Layer Security

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: UI/UX Validation (Immediate Feedback)     │
│ - Client-side checks in InviteManagerButton        │
│ - Client-side checks in InviteAcceptanceForm       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Application Logic (Business Rules)        │
│ - Email validation                                   │
│ - Role checking via Supabase queries                │
│ - Status verification                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Database Constraints (Enforcement)         │
│ - Unique constraints                                 │
│ - Triggers                                           │
│ - RPC function validation                            │
└─────────────────────────────────────────────────────┘
```

## 🧪 Testing the Security

### Test 1: Self-Invitation Prevention
```
1. Login as owner
2. Go to /team
3. Try to invite your own email
4. ❌ Should show: "You can't invite yourself!"
```

### Test 2: Duplicate Staff Prevention
```
1. Create a manager invitation
2. Manager accepts and joins clinic
3. Try to invite same email again
4. ❌ Should show: "This user is already a manager in your clinic"
```

### Test 3: Owner Cannot Join as Manager
```
1. Create invitation for another email
2. Login as existing clinic owner with that email
3. Try to accept invite
4. ❌ Should show: "You are already an owner of [Clinic]. Owners cannot join as managers."
```

### Test 4: Inactive User Suggestion
```
1. Deactivate a manager
2. Try to invite their email again
3. ❌ Should show: "This user is inactive. Please activate them instead."
```

### Test 5: Database Constraint
```sql
-- Try to insert duplicate staff member directly in database
INSERT INTO staff_members (clinic_id, user_id, role) 
VALUES ('clinic-id', 'user-id', 'manager');
-- ❌ Should fail with: unique_user_per_clinic constraint violation
```

## 🔄 Future Enhancement: Multi-Clinic Support

Currently: Users can only be in ONE clinic (as owner OR manager)

**Possible future feature** (if you want managers to work for multiple clinics):

### Option A: Simple Clinic Switcher
- Allow managers to be in multiple clinics
- Add clinic selector in UI
- Store active_clinic_id in session
- Filter all data by active clinic

### Option B: Advanced Multi-Tenancy
- Support for franchise/multi-location clinics
- Hierarchical clinic structure
- Shared staff across locations
- Role inheritance

**To implement**: Remove the single-clinic restriction and add:
1. Clinic switcher component
2. Active clinic session management
3. Update queries to use selected clinic
4. UI indicator showing current clinic

**Would you like me to implement multi-clinic support for managers?**

## 📋 Migration Checklist

To apply the database security:

```bash
# 1. Run the migration in Supabase SQL Editor
# Copy contents of: supabase/migrations/004_prevent_duplicate_invites.sql

# 2. Verify constraints were added
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'staff_members'::regclass;

# 3. Test invite validation
SELECT can_invite_email(
  'your-clinic-id'::uuid,
  'test@example.com',
  'your-user-id'::uuid
);

# 4. Try to create duplicate (should fail)
INSERT INTO staff_members (clinic_id, user_id, role)
VALUES ('same-clinic', 'same-user', 'manager');
-- Expected: ERROR: duplicate key violates unique constraint
```

## 🐛 Error Messages Reference

### Frontend Errors (User-Friendly)
| Error | Cause | Action |
|-------|-------|--------|
| "You can't invite yourself!" | Email matches current user | Use different email |
| "This user is already an owner/manager" | User exists in clinic | Check staff list |
| "This user is inactive. Activate them instead." | User is deactivated | Click activate in staff list |
| "This user is already a clinic owner" | User owns another clinic | Cannot invite owners |
| "An active invitation already exists" | Pending invite found | Wait for expiry or revoke |

### Database Errors (Technical)
| Error | Cause | Solution |
|-------|-------|----------|
| `unique_user_per_clinic` | Duplicate membership | User already in clinic |
| `User can only be an owner of one clinic` | Multiple owner roles | Remove old owner role |
| `Email mismatch` | Wrong user accepting | Must use invited email |
| `Invalid or expired invite token` | Bad/old token | Create new invite |

## ✨ Benefits

1. **Data Integrity**: No duplicate memberships
2. **Clear UX**: Users understand restrictions immediately
3. **Security**: Database enforces rules even if UI bypassed
4. **Performance**: Unique indexes speed up queries
5. **Maintainability**: Validation logic in one place
6. **Scalability**: Constraints prevent data corruption at scale

## 🚀 Summary

Your reported issue has been **completely fixed** with:
- ✅ Frontend validation (instant feedback)
- ✅ Application-level checks (business logic)
- ✅ Database constraints (enforcement)
- ✅ Clear error messages (user guidance)
- ✅ Helper functions (reusable validation)

**Next time you try to invite yourself, you'll see an immediate error message!** 🎉

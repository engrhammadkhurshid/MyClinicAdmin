# Supabase OTP-Only Email Configuration

This guide explains how to configure Supabase to send **only OTP emails** during signup, without sending additional confirmation emails.

## Problem

By default, Supabase may send both:
1. A confirmation email with a magic link
2. An OTP email with the 6-digit code

This creates confusion for users who receive multiple emails.

## Solution: Configure OTP-Only Mode

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Disable Email Confirmations

1. Go to **Authentication** → **Settings** (or **URL Configuration**)
2. Find the **Email Confirmation** section
3. **IMPORTANT:** Look for these settings:

   **Option A: If you see "Confirm Email" toggle:**
   - Set **Enable email confirmations** to `OFF` or `false`
   - This tells Supabase to use OTP-only mode

   **Option B: If you see "Email OTP" section:**
   - Enable **"Send OTP instead of magic link"**
   - This replaces confirmation emails with OTP

### Step 3: Configure Email Templates

Even with OTP-only mode, ensure your email templates are properly configured:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Update the template to show OTP clearly:

```html
<h2>Confirm your signup</h2>

<p>Hello,</p>

<p>Use the following code to complete your signup:</p>

<h1 style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 8px; letter-spacing: 4px;">
  {{ .Token }}
</h1>

<p>This code will expire in {{ .TokenExpiryDuration }} seconds.</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

### Step 4: Update OTP Expiry Time

1. In **Authentication** → **Settings**
2. Find **OTP Expiry Duration**
3. Set to `3600` seconds (1 hour) or your preferred duration
4. Click **Save**

### Step 5: Verify Configuration

Test your signup flow:

1. Complete Step 1 (Personal Info) and Step 2 (Clinic Info)
2. Click "Send OTP"
3. Check your email inbox
4. You should receive **only ONE email** with the 6-digit OTP
5. If you receive multiple emails, check the settings again

## Alternative: Use Email OTP Setting (Newer Supabase Versions)

If your Supabase project is on a newer version, you may see:

1. Go to **Authentication** → **Providers** → **Email**
2. Find **Secure email OTP** toggle
3. Enable it - This ensures OTP-only emails are sent
4. Save changes

## Code Implementation (Already Done)

The signup code is already configured to use OTP:

```typescript
// In MultiStepSignupForm.tsx - sendOTP() function
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: { /* user metadata */ }
  }
})
```

When **OTP-only mode** is enabled in Supabase, this `signUp()` call will:
- ✅ Send ONE email with a 6-digit OTP
- ❌ NOT send a confirmation link email

## Verification Code

The verification happens with:

```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: formData.email,
  token: formData.otp,
  type: 'email'
})
```

## Resend OTP Implementation

The resend functionality is now implemented:

```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: formData.email,
})
```

Features:
- ✅ 60-second cooldown to prevent spam
- ✅ User-friendly countdown timer
- ✅ Proper error handling

## Change Email Implementation

Users can now change their email if they made a mistake:

1. On the OTP verification screen
2. Click "Wrong email? Change it"
3. Returns to Step 1 to enter a new email
4. All form data is preserved except the email

## Testing Checklist

- [ ] Complete signup flow (Steps 1-3)
- [ ] Verify only ONE email is received
- [ ] Email contains 6-digit OTP
- [ ] OTP verification works
- [ ] Resend OTP works with cooldown
- [ ] Change email functionality works
- [ ] Confetti animation plays on success
- [ ] Profile is created in database
- [ ] User is redirected to dashboard

## Troubleshooting

### Still receiving confirmation emails?

1. **Check Auth Settings:**
   - Ensure "Enable email confirmations" is OFF
   - Or "Send OTP instead of magic link" is ON

2. **Clear Supabase Cache:**
   - Save settings
   - Wait 1-2 minutes for changes to propagate
   - Test again

3. **Check Project Version:**
   - Older Supabase projects may need manual email template editing
   - Consider creating a new project if settings don't exist

### OTP not arriving?

1. Check spam/junk folder
2. Verify email template is active
3. Check Supabase logs: **Authentication** → **Logs**
4. Ensure SMTP is configured (for custom email providers)

### Invalid OTP errors?

1. Ensure OTP expiry is sufficient (3600 seconds recommended)
2. Check if user entered correct 6-digit code
3. Verify OTP hasn't expired
4. Try resending OTP

## Environment Variables

No additional environment variables needed. The app uses:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Notes

✅ **Best Practices Implemented:**
- 6-digit OTP (secure and user-friendly)
- 60-second resend cooldown (prevents abuse)
- OTP expiry (default 1 hour)
- Email validation before sending OTP
- Proper error handling
- Toast notifications for all actions

## Summary

After configuring Supabase correctly:

1. ✅ User enters email in signup form
2. ✅ Receives **ONE email** with 6-digit OTP
3. ✅ Enters OTP to verify
4. ✅ Can resend OTP if not received (60s cooldown)
5. ✅ Can change email if wrong
6. ✅ Confetti celebration on success
7. ✅ Redirected to dashboard

---

**Need Help?** Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-otp

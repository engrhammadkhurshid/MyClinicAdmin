# Supabase Email OTP Configuration Guide

## Overview
This guide explains how to configure Supabase to send OTP (One-Time Password) codes instead of confirmation links for email verification during signup.

## Current Implementation

### Multi-Step Signup Flow
1. **Step 1:** Personal Information (name, email, password, phone, address)
2. **Step 2:** Clinic Information (clinic name, type, location)
3. **Step 3:** Email Verification with OTP

## Supabase Configuration

### Option 1: Using Supabase Dashboard (Recommended)

#### Enable Email OTP
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Settings**
3. Scroll to **Email Templates**
4. Click on **Magic Link** template
5. Enable **"Send OTP instead of Magic Link"**

#### Detailed Steps:
```
Supabase Dashboard
├── Your Project
│   ├── Authentication
│   │   ├── Settings
│   │   │   ├── Email Auth
│   │   │   │   ├── ✓ Enable Email Provider
│   │   │   │   ├── ✓ Confirm Email (REQUIRED for OTP)
│   │   │   │   └── Email Template: Magic Link
│   │   │   │       └── ✓ Send OTP instead of Magic Link
```

#### Configuration Settings:
```json
{
  "MAILER_SECURE_EMAIL_CHANGE_ENABLED": true,
  "MAILER_OTP_EXP": 3600,  // OTP expires in 1 hour (in seconds)
  "MAILER_OTP_LENGTH": 6    // 6-digit OTP code
}
```

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your project
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Update auth config
supabase --experimental --project-ref YOUR_PROJECT_REF \
  functions deploy \
  --set MAILER_SECURE_EMAIL_CHANGE_ENABLED=true
```

### Option 3: Using Supabase Management API

```typescript
// Update auth settings via API
const response = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      MAILER_SECURE_EMAIL_CHANGE_ENABLED: true,
      MAILER_OTP_EXP: 3600,
      MAILER_OTP_LENGTH: 6
    })
  }
)
```

## Email Template Configuration

### Custom OTP Email Template

Go to **Authentication → Email Templates → Magic Link** and use this template:

```html
<h2>Verify Your Email</h2>

<p>Hi {{ .Email }},</p>

<p>Your verification code for MyClinic Admin is:</p>

<div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0;">
  {{ .Token }}
</div>

<p>This code will expire in 1 hour.</p>

<p>If you didn't request this code, please ignore this email.</p>

<p>Best regards,<br>The MyClinic Admin Team</p>
```

### Email Template Variables Available:
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - 6-digit OTP code
- `{{ .SiteURL }}` - Your app's URL
- `{{ .ConfirmationURL }}` - Fallback confirmation link

## Code Implementation

### 1. Sign Up with OTP

```typescript
// During signup (Step 2 → Step 3)
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      // Additional user metadata
      full_name: 'Dr. John Doe',
      clinic_name: 'City Medical Center'
    }
  }
})

// Supabase automatically sends OTP email
```

### 2. Verify OTP

```typescript
// When user enters OTP (Step 3)
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456', // 6-digit code from email
  type: 'email'
})

if (data.user) {
  // User is verified and logged in
  // Create profile, redirect to dashboard
}
```

### 3. Resend OTP

```typescript
// If user didn't receive OTP
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// Sends a new OTP to the email
```

## Testing OTP Flow

### Local Testing
1. **Start your app:** `npm run dev`
2. **Navigate to:** `http://localhost:3000/auth/signup`
3. **Fill Step 1:** Personal information
4. **Fill Step 2:** Clinic information
5. **Click "Send OTP":** Check your email
6. **Enter OTP:** Input the 6-digit code
7. **Verify:** Should see confetti and redirect to dashboard

### Email Testing Services
Use these to test OTP emails in development:

- **Mailtrap.io** - Free email testing
- **MailHog** - Local SMTP server
- **Ethereal Email** - Fake SMTP service

Configure in Supabase:
```
Dashboard → Settings → Auth
SMTP Settings:
- Host: smtp.mailtrap.io
- Port: 2525
- User: your_mailtrap_user
- Pass: your_mailtrap_pass
```

## Security Best Practices

### OTP Configuration
✅ **DO:**
- Set OTP expiry to 1 hour (3600 seconds)
- Use 6-digit codes (balance security vs UX)
- Rate limit OTP requests (3-5 per hour)
- Log OTP verification attempts
- Clear OTP after successful verification

❌ **DON'T:**
- Use short expiry times (<5 minutes) - frustrates users
- Use less than 6 digits - less secure
- Allow unlimited resend attempts - spam/abuse
- Send OTP to unverified emails - security risk

### Rate Limiting

Supabase has built-in rate limiting:
- **Signup:** 2 attempts per hour per IP
- **OTP Resend:** 1 attempt per 60 seconds
- **OTP Verify:** 5 attempts per hour

Configure in Dashboard:
```
Authentication → Rate Limits
├── Signup: 2/hour
├── OTP Resend: 1/60s
└── OTP Verify: 5/hour
```

## Troubleshooting

### Issue: OTP Email Not Received

**Solutions:**
1. Check spam/junk folder
2. Verify email template is enabled
3. Check SMTP settings in Supabase
4. Verify email provider doesn't block Supabase IPs
5. Check rate limits (might be blocked)

**Debug:**
```typescript
const { data, error } = await supabase.auth.signUp(...)

console.log('Signup response:', data)
console.log('Error:', error)

// Check if email was sent
if (data.user && !error) {
  console.log('OTP sent to:', data.user.email)
}
```

### Issue: "Invalid OTP" Error

**Solutions:**
1. Ensure OTP is exactly 6 digits
2. Check OTP hasn't expired (1 hour limit)
3. Verify email matches signup email
4. Try resending OTP
5. Clear browser cache/storage

**Debug:**
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: formData.email,
  token: formData.otp,
  type: 'email'
})

if (error) {
  console.error('OTP verification failed:', error.message)
  // Common errors:
  // - "Invalid OTP" - wrong code
  // - "OTP expired" - code too old
  // - "Email not found" - wrong email
}
```

### Issue: Confetti Not Showing

**Solutions:**
1. Check browser console for errors
2. Verify `canvas-confetti` is installed
3. Check z-index conflicts
4. Ensure function is called after success

**Debug:**
```typescript
// Test confetti directly in console
import confetti from 'canvas-confetti'

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
})
```

## Environment Variables

### Required in `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Settings

```bash
# Vercel/Production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase Production
# Use production project credentials
```

## Migration from Confirmation Links

### Steps to Migrate

1. **Backup existing users**
```sql
-- Export users table
SELECT * FROM auth.users;
```

2. **Enable OTP in Supabase Dashboard**
```
Authentication → Settings → Email Templates
→ Magic Link → Enable "Send OTP instead of Magic Link"
```

3. **Update frontend code**
```typescript
// Old: Email confirmation link
await supabase.auth.signUp({ email, password })
// User clicks link in email → Redirected to app

// New: Email OTP
await supabase.auth.signUp({ email, password })
// User enters OTP code → Verified in-app
await supabase.auth.verifyOtp({ email, token, type: 'email' })
```

4. **Test thoroughly**
- Test signup flow with OTP
- Test OTP resend functionality
- Test expiry (wait 1 hour)
- Test invalid OTP handling

5. **Deploy gradually**
```javascript
// Feature flag for gradual rollout
const useOTP = process.env.NEXT_PUBLIC_USE_OTP === 'true'

if (useOTP) {
  // New OTP flow
} else {
  // Old confirmation link flow
}
```

## Monitoring & Analytics

### Track OTP Metrics

```typescript
// Track OTP sends
analytics.track('otp_sent', {
  email: user.email,
  timestamp: new Date()
})

// Track OTP verification
analytics.track('otp_verified', {
  email: user.email,
  attempts: verificationAttempts,
  success: true
})

// Track OTP failures
analytics.track('otp_failed', {
  email: user.email,
  error: error.message
})
```

### Supabase Logs

View logs in Dashboard:
```
Logs & Reports → Auth Logs
Filter by:
- Event: signup
- Event: token_verification
- Status: success/failed
```

## Resources

### Official Documentation
- [Supabase Auth OTP](https://supabase.com/docs/guides/auth/phone-login)
- [Email OTP Configuration](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

### Support
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

**Status:** ✅ Ready to Configure  
**Updated:** October 4, 2025  
**Version:** 1.0.0

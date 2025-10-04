# Single Email Service Setup - Resend for Everything

## 🎯 Goal: Use Resend for ALL Emails

This guide shows you how to use **Resend** as your single email service for:
- ✅ Supabase Auth (OTPs, password resets, confirmations)
- ✅ Team Invitations
- ✅ Any future emails (reminders, notifications, etc.)

---

## 📋 Prerequisites

1. Resend account (free tier: 3,000 emails/month)
2. Supabase project
3. Your domain (optional, can use onboarding@resend.dev for testing)

---

## 🚀 Complete Setup (10 minutes)

### Step 1: Install Resend Package

```bash
npm install resend
```

### Step 2: Get Resend API Key

1. Go to https://resend.com and sign up
2. Dashboard → API Keys → Create API Key
3. Copy the key (starts with `re_`)

### Step 3: Add to Environment Variables

**Local Development (.env.local):**
```env
RESEND_API_KEY=re_your_api_key_here
```

**Vercel (for production):**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_your_api_key_here`
3. Apply to: Production, Preview, Development

### Step 4: Configure Supabase to Use Resend SMTP

**Go to:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Enable Custom SMTP and enter:**

```
SMTP Host: smtp.resend.com
Port: 587 (or 465 for SSL)
Username: resend
Password: re_your_api_key_here (same API key)
Sender Email: noreply@yourdomain.com
Sender Name: MyClinicAdmin
```

**Testing (no domain required):**
If you don't have a domain yet, use:
```
Sender Email: onboarding@resend.dev
Sender Name: MyClinicAdmin
```

**Click:** Save & Test Configuration

### Step 5: Enable Email Auth in Supabase

**Go to:** Supabase Dashboard → Authentication → Providers

**Enable:**
- ✅ Email (should already be enabled)

**Settings:**
- ✅ Confirm email: ON
- ✅ Secure email change: ON
- Double confirm email changes: OFF (unless you want extra security)

### Step 6: Customize Email Templates (Optional)

**Go to:** Supabase Dashboard → Authentication → Email Templates

You can customize these templates:
- **Confirm signup** - OTP emails
- **Invite user** - Team invites from Supabase (we use custom)
- **Magic Link**
- **Change Email Address**
- **Reset Password**

**Example OTP Template:**
```html
<h2>🏥 Welcome to MyClinicAdmin</h2>
<p>Your verification code is:</p>
<h1 style="font-size: 48px; letter-spacing: 8px; color: #667eea;">{{ .Token }}</h1>
<p>This code expires in 5 minutes.</p>
<p style="color: #888;">If you didn't request this, please ignore this email.</p>
```

### Step 7: Enable Resend in Your Invite Code

**Edit:** `app/api/send-invite/route.ts`

**Uncomment lines 17-25:**

```typescript
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'MyClinicAdmin <invites@yourdomain.com>', // or onboarding@resend.dev
  to: email,
  subject: `You've been invited to join ${clinicName}`,
  html: getEmailTemplate(clinicName, inviterName, inviteLink)
})
```

**Comment out or remove the temporary console.log code (lines 54-62)**

### Step 8: Deploy Changes

```bash
git add -A
git commit -m "feat: Configure Resend as single email service for all emails"
git push origin main
```

Wait for Vercel to deploy, then add the environment variable in Vercel dashboard.

---

## ✅ Verification Checklist

### Test Supabase Auth Emails (OTP):
1. Sign out of your app
2. Try to sign up with a NEW email
3. Check if OTP email arrives
4. Verify it's sent from Resend (check email headers)

### Test Invite Emails:
1. Go to Team Management
2. Invite a new manager
3. Check if invitation email arrives
4. Click the invite link
5. Complete the flow

### Test Other Auth Flows:
- [ ] Password reset email
- [ ] Email change confirmation
- [ ] Re-send OTP (60 second cooldown)

---

## 📊 Email Monitoring

### Resend Dashboard
Monitor all emails in one place:
- https://resend.com/emails

You'll see:
- ✅ OTP emails (via SMTP from Supabase)
- ✅ Invite emails (via API from your app)
- ✅ All future emails

**Features:**
- Real-time delivery status
- Bounce/complaint tracking
- Email logs
- Analytics

---

## 🎨 Domain Setup (Production)

For production, use your own domain instead of `onboarding@resend.dev`:

### 1. Add Domain to Resend
- Resend Dashboard → Domains → Add Domain
- Enter: `yourdomain.com`

### 2. Add DNS Records
Resend will show you DNS records to add:
```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT  
Name: @
Value: [SPF record]
```

Add these to your domain DNS (Cloudflare, Namecheap, etc.)

### 3. Verify Domain
- Click "Verify DNS Records" in Resend
- Wait a few minutes for DNS propagation

### 4. Update Email Addresses
Once verified, update:
- Supabase SMTP settings: `noreply@yourdomain.com`
- Invite API: `invites@yourdomain.com`

---

## 🔧 Configuration Summary

### What Goes Where:

**Resend (Email Service):**
- Handles actual email delivery
- Monitors delivery/bounces
- One API key for everything

**Supabase Auth (Authentication):**
- Generates OTP codes
- Manages user sessions
- Uses Resend SMTP to send auth emails

**Your App (Custom Emails):**
- Sends invites via Resend API
- Future: Appointment reminders, notifications
- Uses Resend API directly

---

## 💰 Pricing Considerations

### Resend Free Tier:
- 3,000 emails/month
- 100 emails/day
- All features included

**Estimate for your app:**
- 50 new signups/month × 1 OTP = 50 emails
- 20 password resets/month = 20 emails
- 30 team invites/month = 30 emails
- **Total: ~100 emails/month** ✅ Well within free tier

### When to Upgrade:
- If you get > 100 signups/day
- If you add appointment reminders
- If you have > 3,000 emails/month

**Paid plan:** $20/month for 50,000 emails

---

## 🐛 Troubleshooting

### OTP Emails Not Arriving

**Check 1: Supabase SMTP Settings**
```
Dashboard → Settings → Auth → SMTP Settings
- Verify Resend credentials are correct
- Click "Test SMTP configuration"
```

**Check 2: Resend Logs**
```
Resend Dashboard → Emails
- Look for recent OTP emails
- Check delivery status
- Look for bounce/errors
```

**Check 3: Email Quotas**
- Free tier: 100 emails/day
- Check if you hit the limit

**Check 4: Spam Folder**
- Check recipient's spam
- Add to safe senders

### Invite Emails Not Sending

**Check 1: Environment Variable**
```bash
# Verify locally
echo $RESEND_API_KEY

# Verify in Vercel
Vercel Dashboard → Settings → Environment Variables
```

**Check 2: Code Enabled**
```typescript
// Make sure this is uncommented in app/api/send-invite/route.ts
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({ ... })
```

**Check 3: API Logs**
```
Vercel Dashboard → Your Project → Logs
- Look for email sending errors
- Check API endpoint calls
```

### "From" Email Rejected

**Error:** "Email address not verified"

**Solution:**
- Use `onboarding@resend.dev` for testing
- Or verify your domain in Resend first

---

## 📝 Email Templates

### Current Templates:

1. **OTP Email** (Supabase Auth)
   - Managed in: Supabase Dashboard → Email Templates
   - Sent via: Resend SMTP
   - Template in: Supabase settings

2. **Team Invite Email** (Custom)
   - Managed in: `app/api/send-invite/route.ts`
   - Sent via: Resend API
   - Template in: `getEmailTemplate()` function

### Future Templates to Add:

```typescript
// Appointment Reminder
await resend.emails.send({
  from: 'MyClinicAdmin <reminders@yourdomain.com>',
  to: patientEmail,
  subject: 'Appointment Reminder - Tomorrow',
  html: appointmentReminderTemplate(...)
})

// Welcome Email (after first login)
// Payment Receipt
// Report Ready Notification
```

---

## 🎯 Best Practices

### Email "From" Addresses:
```
noreply@yourdomain.com     - Auth emails (OTP, reset)
invites@yourdomain.com     - Team invitations  
reminders@yourdomain.com   - Appointment reminders
support@yourdomain.com     - User support emails
```

### Email Rate Limiting:
```typescript
// Add to invite API to prevent spam
const RATE_LIMIT = 5 // 5 invites per hour per user
```

### Email Logs:
- Monitor Resend dashboard daily
- Check bounce rates
- Update templates based on engagement

### Testing:
- Use `youremail+test@gmail.com` for testing
- Gmail treats + as aliases, all go to same inbox
- Great for testing multiple signups

---

## ✅ Final Checklist

Before going to production:

- [ ] Resend API key added to .env.local
- [ ] Resend API key added to Vercel
- [ ] Supabase SMTP configured with Resend
- [ ] Supabase SMTP test successful
- [ ] Invite email code uncommented
- [ ] Code deployed to production
- [ ] Test OTP email delivery
- [ ] Test invite email delivery
- [ ] Test password reset email
- [ ] Domain verified (or using onboarding@resend.dev)
- [ ] Email templates customized
- [ ] Monitoring set up in Resend dashboard

---

## 🚀 You're All Set!

With this setup, you have:
- ✅ Single email service (Resend)
- ✅ Unified monitoring dashboard
- ✅ OTP emails via Supabase → Resend
- ✅ Invite emails via your app → Resend
- ✅ Ready to add more email types
- ✅ Professional email delivery
- ✅ Free tier for 3,000 emails/month

**Next:** Test the full flow and invite your first manager! 🎉

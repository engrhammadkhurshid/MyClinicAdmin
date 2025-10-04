# Email Architecture - How It All Works Together

## 🎯 TL;DR: You Don't Need to Replace Supabase Auth

**Supabase Auth** = Handles authentication (login, signup, sessions)  
**Resend** = Handles email delivery (sending the actual emails)  

They work **together**, not as replacements.

---

## 📊 Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR APPLICATION                         │
│                      (Next.js + Supabase)                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │   SUPABASE AUTH     │         │   YOUR CUSTOM       │
    │                     │         │   EMAIL CODE        │
    │  • User Signup      │         │                     │
    │  • User Login       │         │  • Team Invites     │
    │  • Password Reset   │         │  • Reminders        │
    │  • Email Change     │         │  • Notifications    │
    │  • Magic Links      │         │                     │
    │                     │         │                     │
    │  Generates:         │         │  Triggers:          │
    │  • OTP codes        │         │  • Custom emails    │
    │  • Reset tokens     │         │  • Rich templates   │
    │  • Magic links      │         │  • Attachments      │
    └──────────┬──────────┘         └──────────┬──────────┘
               │                               │
               │ Uses SMTP                     │ Uses API
               │                               │
               └───────────────┬───────────────┘
                               ▼
                    ┌─────────────────────┐
                    │      RESEND         │
                    │  (Email Service)    │
                    │                     │
                    │  • Sends emails     │
                    │  • Tracks delivery  │
                    │  • Handles bounces  │
                    │  • Monitors spam    │
                    │                     │
                    │  Single Dashboard   │
                    │  for ALL emails     │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
           📧 OTP         📧 Invite      📧 Reminders
           Emails         Emails         (Future)
```

---

## 🔄 How Email Flows Work

### Flow 1: User Signup (OTP Email)

```
1. User fills signup form on your app
   └─► POST /auth/signup

2. Supabase Auth processes signup
   ├─► Creates user account
   ├─► Generates OTP code (123456)
   └─► Needs to send email...

3. Supabase looks for email provider
   ├─► Checks: Do I have SMTP configured?
   └─► YES: Use Resend SMTP (smtp.resend.com)

4. Supabase sends to Resend via SMTP
   └─► SMTP: smtp.resend.com:587
       Subject: "Verify your email"
       Body: "Your code is 123456"

5. Resend delivers the email
   ├─► Validates sender domain
   ├─► Sends to user's inbox
   └─► Logs in Resend dashboard

6. User receives OTP email ✅
```

### Flow 2: Team Invitation Email

```
1. Owner clicks "Invite Manager" in your app
   └─► Fills email & name

2. Your app creates invite record
   ├─► INSERT into staff_invites
   ├─► Generates invite token
   └─► Needs to send email...

3. Your code calls Resend API
   └─► POST /api/send-invite
       ├─► Uses: Resend JavaScript SDK
       ├─► Subject: "You've been invited..."
       └─► Body: Beautiful HTML template

4. Resend delivers the email
   ├─► Validates API key
   ├─► Sends to invitee's inbox
   └─► Logs in Resend dashboard

5. Invitee receives invitation email ✅
```

---

## 🔧 Configuration Comparison

### Option A: Multiple Services (Not Recommended)
```
Supabase Auth → Supabase Email (limited, 3 emails/hour)
Custom Code   → SendGrid ($15/month)
              → OR Postmark ($10/month)
              → OR SES (complex setup)

Result: 
❌ Multiple dashboards
❌ Higher cost
❌ More complexity
❌ Harder to monitor
```

### Option B: Single Service - Resend (Recommended) ✅
```
Supabase Auth → Resend SMTP → Resend Dashboard
Custom Code   → Resend API  → Resend Dashboard

Result:
✅ Single dashboard
✅ Free tier (3,000 emails/month)
✅ Simple setup
✅ Easy monitoring
✅ Better deliverability
```

---

## 📋 What You Actually Configure

### In Supabase Dashboard:
```
Settings → Authentication → SMTP Settings

✅ Enable Custom SMTP
   SMTP Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender: onboarding@resend.dev

What this does:
→ Tells Supabase to use Resend for ALL auth emails
→ OTP, password reset, email confirmation, etc.
→ Supabase still manages auth logic
→ Resend just delivers the emails
```

### In Your .env.local:
```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Resend (new - add this)
RESEND_API_KEY=re_your_key_here

What this does:
→ Allows your custom code to send emails via Resend
→ Used by /api/send-invite endpoint
→ Same service, different access method (API vs SMTP)
```

### In Your Code:
```typescript
// app/api/send-invite/route.ts

const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'MyClinicAdmin <invites@yourdomain.com>',
  to: email,
  subject: 'You've been invited!',
  html: getEmailTemplate(...)
})

What this does:
→ Sends custom emails from your app
→ You control content, timing, recipients
→ Goes through same Resend service as OTP emails
```

---

## 💰 Cost Breakdown

### Resend Free Tier:
- **3,000 emails/month** (total)
- **100 emails/day** (rate limit)
- Includes:
  - OTP emails (via Supabase SMTP)
  - Invite emails (via your API)
  - Any future emails

### Typical Monthly Usage:
```
Signups:          50 users × 1 OTP = 50 emails
Password Resets:  20 users × 1     = 20 emails  
Team Invites:     10 invites       = 10 emails
Email Changes:    5 changes        = 5 emails
                                    ─────────
Total:                              85 emails/month

Free Tier Limit:                    3,000 emails/month ✅
Usage:                              2.8% of free tier
```

**You won't hit the limit unless you have 100+ signups/day.**

---

## 🎯 What You're Actually Doing

### You're NOT:
❌ Replacing Supabase Auth  
❌ Building your own auth system  
❌ Managing user sessions manually  
❌ Storing passwords yourself  

### You ARE:
✅ Keeping Supabase Auth (it's great!)  
✅ Adding Resend as email delivery provider  
✅ Using one service for all email types  
✅ Getting better email monitoring  

---

## 🔍 In Simple Terms

Think of it like shipping packages:

**Supabase Auth** = The warehouse that prepares packages (generates OTPs, manages users)  
**Resend** = The shipping company that delivers packages (sends emails)  

You're not replacing the warehouse, you're just telling it to use a better shipping company.

---

## ✅ Final Answer to Your Question

**Question:** "Do I need to replace Supabase auth?"

**Answer:** **NO!** You keep Supabase Auth for everything it does:
- ✅ User registration
- ✅ Login/logout  
- ✅ Session management
- ✅ Password hashing
- ✅ OTP generation
- ✅ Security

You only add Resend as the **email delivery service**:
- ✅ Supabase Auth generates OTP → Resend delivers it
- ✅ Your app creates invite → Resend delivers it
- ✅ All emails in one dashboard
- ✅ Better delivery rates
- ✅ Free for 3,000 emails/month

**It's complementary, not replacement.**

---

## 🚀 5-Minute Setup

```bash
# 1. Install Resend
npm install resend

# 2. Get API key from https://resend.com

# 3. Add to .env.local
echo "RESEND_API_KEY=re_your_key" >> .env.local

# 4. Configure Supabase SMTP (in dashboard)
#    smtp.resend.com:587

# 5. Uncomment code in app/api/send-invite/route.ts

# 6. Deploy
git add -A
git commit -m "feat: Enable Resend for all emails"
git push
```

Done! Both auth emails and custom emails now use Resend. 🎉

---

## 📚 Further Reading

- Full setup guide: `docs/RESEND_SINGLE_SERVICE_SETUP.md`
- Security fixes: `EMAIL_AND_SECURITY_FIXES.md`
- Resend docs: https://resend.com/docs
- Supabase SMTP: https://supabase.com/docs/guides/auth/auth-smtp

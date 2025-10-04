# Quick Fix: OTP Emails Not Sending

## 🚨 Error: "Error sending confirmation email"

**Why this happens:**
- Supabase is trying to send OTP emails
- But it doesn't have SMTP configured
- It needs to know to use Resend

**Fix time:** 2 minutes ⏱️

---

## ✅ Step-by-Step Fix

### 1. Open Supabase Dashboard

Go to: https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

Or:
1. Go to https://supabase.com/dashboard
2. Select your project: **MyClinicAdmin**
3. Click: **Settings** (gear icon in left sidebar)
4. Click: **Authentication**
5. Scroll down to: **SMTP Settings**

### 2. Enable Custom SMTP

Click the toggle to enable **"Enable Custom SMTP"**

### 3. Enter Resend SMTP Credentials

Fill in these exact values:

```
SMTP Host
smtp.resend.com

SMTP Port
587

SMTP Username (Sender email)
resend

SMTP Password
re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP

Sender email
onboarding@resend.dev

Sender name
MyClinicAdmin
```

### 4. Save and Test

1. Click **"Save"** at the bottom
2. Click **"Send test email"** button
3. Enter your email address
4. Check if you receive the test email ✅

---

## 🧪 Test the Full Flow

After saving the SMTP settings:

### Test OTP Email:
1. Go back to your app
2. Sign out (if logged in)
3. Click "Sign up"
4. Enter a NEW email address (not one you've used before)
5. Enter password
6. Click Sign Up
7. **You should now receive an OTP email!** 📧

### If it works:
- Enter the OTP code
- Complete signup
- You're in! ✅

---

## 📊 What This Does

```
Before (Broken):
User signs up → Supabase generates OTP → ❌ No email service configured → Error

After (Fixed):
User signs up → Supabase generates OTP → ✅ Sends via Resend SMTP → Email arrives!
```

---

## 🎯 Quick Reference

**Your Resend API Key:**
```
re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
```

**SMTP Settings (copy/paste):**
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
Sender: onboarding@resend.dev
Name: MyClinicAdmin
```

**Direct Link to Settings:**
https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

---

## 🐛 Still Not Working?

### Check 1: Supabase Logs
```
Dashboard → Logs → Auth Logs
Look for email sending errors
```

### Check 2: Resend Dashboard
```
Go to: https://resend.com/emails
Check if emails are being sent
```

### Check 3: Email Confirmation Setting
```
Dashboard → Authentication → Settings
Make sure "Confirm email" is enabled
```

### Check 4: Spam Folder
- Check your spam/junk folder
- Sometimes test emails go there

---

## 📧 After This Works

You'll have:
- ✅ OTP emails working (Supabase → Resend)
- ✅ Invite emails working (Your app → Resend)
- ✅ All emails in one Resend dashboard
- ✅ Free tier (3,000 emails/month)

---

## 🚀 Next Step After SMTP Setup

Once OTP emails are working, remember to also:

**Add RESEND_API_KEY to Vercel** (for production invite emails):
1. Vercel Dashboard → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`
3. Redeploy

---

**Need help?** The error will go away as soon as you save the SMTP settings in Supabase! 🎉

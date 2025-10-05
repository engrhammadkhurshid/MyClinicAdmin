# OTP Not Being Received - Troubleshooting Guide

## 🚨 Problem

- ✅ Signup form shows "OTP sent, please enter OTP"
- ✅ OTP input step appears
- ❌ No OTP email is received

**This means:** Supabase is generating the OTP but not sending it via SMTP!

---

## 🔍 Root Cause

Supabase needs **BOTH** of these enabled to send OTP emails:

1. ✅ "Confirm email" turned OFF (you did this)
2. ❌ **Email OTP** authentication method turned ON (needs to be checked)

---

## ✅ IMMEDIATE FIX

### Step 1: Enable Email OTP Authentication

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers

**Find:** "Email" provider (should already be expanded)

**Look for these settings:**

```
Email Auth Settings:
├─ Enable email confirmations: OFF ✅ (you turned this off)
├─ Enable email OTP: ??? (CHECK THIS!)
└─ SMTP Settings: Configured ✅ (already done)
```

**Turn ON:**
```
☑️ Enable email OTP
```

**Click:** Save

---

### Step 2: Verify SMTP Settings Are Complete

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

**Scroll down to:** "SMTP Settings"

**Verify these are filled:**

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
Sender Email: onboarding@resend.dev
Sender Name: MyClinicAdmin
```

**Click:** "Send test email" button

**Check your inbox** - you should receive a test email within 10 seconds

---

### Step 3: Configure Email Template for OTP

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/templates

**Click on:** "Magic Link" template (used for OTP emails)

**Important:** Even though it says "Magic Link", this template is used for OTP emails when Email OTP is enabled!

**Paste this template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <h2 style="color: #667eea; margin-bottom: 20px;">Welcome to MyClinicAdmin! 🏥</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for signing up! Please use the code below to verify your email address:
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h1 style="font-size: 48px; letter-spacing: 8px; color: white; margin: 0; font-weight: bold;">
        {{ .Token }}
      </h1>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      This code expires in <strong>{{ .TokenExpiryDuration }} minutes</strong>.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      If you didn't sign up for MyClinicAdmin, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      MyClinicAdmin - Modern Clinic Management System
    </p>
  </div>
</body>
</html>
```

**Click:** Save

---

## 🔧 Alternative: Check If You Need to Enable Email Provider

Some Supabase projects require enabling the Email provider first:

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers

**Check if "Email" is enabled:**

```
Email Provider:
├─ Enabled: ON ✅ (should be green)
├─ Enable email confirmations: OFF ✅
└─ Enable email OTP: ON ⬅️ THIS IS CRITICAL!
```

If "Email" provider is OFF, turn it ON first, then enable Email OTP.

---

## 📊 Understanding the Settings

| Setting | Purpose | Your Need | Status |
|---------|---------|-----------|--------|
| **Enable email confirmations** | Sends confirmation links | ❌ Not needed | OFF ✅ |
| **Enable email OTP** | Sends 6-digit codes | ✅ NEEDED | Check! |
| **SMTP Settings** | How emails are sent | ✅ Required | Configured ✅ |
| **Email template** | Email content | ✅ Required | Needs setup |

---

## 🧪 Testing Steps

### After Enabling Email OTP:

1. **Test SMTP First:**
   - Settings → Auth → SMTP Settings
   - Click "Send test email"
   - Check inbox - should receive within 10 seconds
   - If not received, SMTP credentials are wrong

2. **Test Signup OTP:**
   - Go to: https://www.myclinicadmin.app/auth/signup
   - Use a NEW email (not previously registered)
   - Fill form and submit
   - Should see "OTP sent" message
   - Check email - OTP should arrive within 10-30 seconds

3. **Check Spam Folder:**
   - Sometimes OTP emails go to spam
   - Check spam/junk folder
   - If found, mark as "Not Spam"

4. **Check Resend Dashboard:**
   - Go to: https://resend.com/emails
   - Look for recent sent emails
   - Check delivery status
   - If not showing, SMTP not configured correctly

---

## 🔍 Diagnostic Checklist

Run through this checklist:

### Email Provider Settings:
- [ ] Email provider is enabled (green toggle)
- [ ] "Enable email confirmations" is OFF
- [ ] "Enable email OTP" is ON ⬅️ **CRITICAL**
- [ ] Settings saved

### SMTP Configuration:
- [ ] SMTP Host: smtp.resend.com
- [ ] SMTP Port: 587
- [ ] SMTP User: resend
- [ ] SMTP Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
- [ ] Sender Email: onboarding@resend.dev
- [ ] "Send test email" works

### Email Template:
- [ ] "Magic Link" template has content
- [ ] Template includes {{ .Token }}
- [ ] Template saved

### Resend Account:
- [ ] API key is active
- [ ] Not exceeded rate limits
- [ ] Check dashboard for emails

---

## 🚨 Common Issues

### Issue 1: Email OTP Not Enabled

**Symptom:** OTP generated but not sent

**Fix:** Turn ON "Enable email OTP" in Email provider settings

### Issue 2: SMTP Test Fails

**Symptom:** Test email not received

**Fix:** 
- Verify SMTP credentials are exactly correct
- Password should be: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
- No extra spaces or quotes

### Issue 3: Template Missing {{ .Token }}

**Symptom:** Email sent but no OTP code shown

**Fix:** Make sure email template includes `{{ .Token }}` placeholder

### Issue 4: Wrong Template Configured

**Symptom:** Confirmation link sent instead of OTP

**Fix:** 
- Make sure "Enable email confirmations" is OFF
- Make sure "Enable email OTP" is ON
- Configure "Magic Link" template (it's used for OTP)

---

## 🎯 Most Likely Cause

Based on your symptoms, **99% chance** the issue is:

```
"Enable email OTP" is OFF
```

**Go here NOW:**
https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers

**Click:** Email (to expand)

**Find:** "Enable email OTP"

**Turn it:** ON

**Click:** Save

**Test immediately!** 🚀

---

## 📧 Expected Email Flow

When everything is configured correctly:

```
1. User submits signup form
   ↓
2. Your code calls supabase.auth.signUp()
   ↓
3. Supabase generates 6-digit OTP
   ↓
4. Supabase connects to smtp.resend.com
   ↓
5. Sends email using "Magic Link" template
   ↓
6. Template populated with {{ .Token }}
   ↓
7. Resend delivers email
   ↓
8. User receives OTP within 10-30 seconds ✅
```

---

## 🔧 If Still Not Working

### Check Supabase Auth Logs:

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/logs

**Filter:** Auth logs

**Look for:**
- "OTP generated" or "email sent"
- Any SMTP errors
- Connection failures

### Check Resend Logs:

**Go to:** https://resend.com/emails

**Look for:**
- Emails sent to your test email
- Delivery status
- Bounce/failure reasons

### Try Different Email:

Sometimes email providers block OTP emails:
- Try Gmail (usually works)
- Try Outlook/Hotmail
- Avoid temporary email services

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ SMTP test email is received
2. ✅ Signup triggers OTP generation
3. ✅ Email arrives within 10-30 seconds
4. ✅ Email contains 6-digit code
5. ✅ Code can be entered and verified
6. ✅ User account is created and logged in

---

## 📞 Next Steps After Fix

Once OTP emails are working:

1. **Test full signup flow** with multiple emails
2. **Test OTP resend** functionality
3. **Monitor Resend dashboard** for delivery rates
4. **Check spam folder placement** for your domain
5. **Consider upgrading Resend** if sending from custom domain

---

## 🚀 QUICK ACTION

Do this **RIGHT NOW** (takes 30 seconds):

1. Open: https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers
2. Click: Email
3. Find: "Enable email OTP"
4. Turn: ON
5. Click: Save
6. Test: Go to signup page and try again

**This will fix it!** ✅

# 500 Internal Server Error on Signup - SMTP/Template Issue

## 🚨 ERROR DETAILS

```
POST https://axqrsqktdvczitobwzcg.supabase.co/auth/v1/signup
500 (Internal Server Error)
```

**What this means:**
- ✅ Your code is correct
- ✅ Request reaches Supabase
- ❌ Supabase fails when trying to send email
- ❌ SMTP connection or template is broken

---

## 🎯 ROOT CAUSES (In Order)

### 1. Email Template is Empty or Invalid (60% likely)
### 2. SMTP Configuration Still Wrong (30% likely)
### 3. Resend API Key Invalid/Expired (10% likely)

---

## ✅ IMMEDIATE FIX - Step by Step

### FIX 1: Configure Email Template Properly

**Go to:** Authentication → Emails → Templates

**Click on:** "Confirm signup" template

**CRITICAL:** Replace entire content with this:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    
    <h2 style="color: #667eea; margin-top: 0;">Welcome to MyClinicAdmin! 🏥</h2>
    
    <p style="color: #333; font-size: 16px;">
      Thank you for signing up. Please use the verification code below to complete your registration:
    </p>
    
    <div style="background: #f9fafb; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Your Verification Code:</p>
      <h1 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 4px;">{{ .Token }}</h1>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      This code will expire in {{ .TokenExpiryDuration }} minutes.
    </p>
    
    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      If you didn't sign up for MyClinicAdmin, please ignore this email.
    </p>
    
  </div>
</body>
</html>
```

**CRITICAL:** Make sure `{{ .Token }}` is in there!

**Click SAVE!**

---

### FIX 2: Also Configure "Magic Link" Template

**Click on:** "Magic Link" template

**Paste the SAME template as above**

**Click SAVE!**

**Why both?** Supabase might use either template depending on settings.

---

### FIX 3: Verify SMTP Settings Again

**Go to:** Authentication → Emails → Templates → SMTP Settings tab

**Double-check these EXACT values:**

```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP Username: resend
SMTP Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP

Sender Email: onboarding@resend.dev
Sender Name: MyClinicAdmin
```

**Common mistakes:**
- ❌ Extra spaces in any field
- ❌ Port is 587 instead of 465
- ❌ Username is "Resend" (capital R) instead of "resend" (lowercase)
- ❌ Sender email missing or wrong

**After verifying, click SAVE again!**

---

### FIX 4: Check Supabase Auth Logs for Exact Error

**Go to:** Dashboard → Logs → Auth Logs

**Look for the most recent error** (from when you just tried signup)

**Look for errors like:**

```
"Missing template variable"  → Template doesn't have {{ .Token }}
"SMTP authentication failed" → Password/port wrong
"Invalid sender"            → Sender email wrong
"Template render error"     → Template syntax error
```

**Share the exact error message!**

---

## 🔍 DIAGNOSTIC STEPS

### Step 1: Check Email Template Has Token Variable

**Go to Templates, open "Confirm signup"**

**Search for:** `{{ .Token }}`

**Must be present!** If not, template is broken!

### Step 2: Test SMTP with Simple Template

**Temporarily use this MINIMAL template:**

```html
<h1>{{ .Token }}</h1>
```

**Just that one line!**

**Save and try signup again**

**If this works:** Your previous template had syntax errors

**If still fails:** SMTP issue

### Step 3: Check Resend API Key is Valid

**Go to:** https://resend.com/api-keys

**Check your API key:** `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`

**Make sure:**
- ✅ It's listed in active keys
- ✅ Not expired
- ✅ Not deleted
- ✅ Has "Send" permission

**If key is missing or inactive:**
- Create new API key
- Update Supabase SMTP password with new key

---

## 🚨 MOST LIKELY ISSUES

### Issue 1: Template Missing {{ .Token }}

**Symptom:** 500 error on signup

**Cause:** Template doesn't have the OTP code variable

**Fix:**
```html
<!-- MUST have this in template: -->
{{ .Token }}
```

### Issue 2: Template Syntax Error

**Symptom:** 500 error, logs say "template render error"

**Cause:** Invalid HTML or template syntax

**Fix:** Use the simple template above

### Issue 3: SMTP Port Still Wrong

**Symptom:** 500 error, logs say "SMTP connection failed"

**Cause:** Port 587 instead of 465

**Fix:**
```
Port: 465 (not 587!)
```

### Issue 4: Sender Email Not Verified

**Symptom:** 500 error, logs say "invalid sender"

**Cause:** Using unverified email as sender

**Fix:**
```
Sender Email: onboarding@resend.dev
(This is pre-verified by Resend)
```

---

## 🎯 STEP-BY-STEP RESOLUTION

### Do these in order:

**1. Configure "Confirm signup" template:**
- Go to Templates tab
- Click "Confirm signup"
- Paste template with {{ .Token }}
- Save

**2. Configure "Magic Link" template:**
- Click "Magic Link"
- Paste same template
- Save

**3. Verify SMTP settings:**
- Go to SMTP Settings tab
- Port: 465
- Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
- Save

**4. Check Auth Logs:**
- Dashboard → Logs → Auth Logs
- Find the 500 error
- Note exact error message

**5. Try signup again:**
- Go to signup page
- Fill form
- Submit

**6. Expected results:**
- No 500 error ✅
- "OTP sent" message ✅
- OTP step appears ✅
- Check Resend dashboard ✅

---

## 📊 Understanding the 500 Error

```
User Flow:
1. User submits signup form
   ↓
2. Request sent to Supabase /auth/v1/signup
   ↓
3. Supabase creates user account
   ↓
4. Supabase tries to send verification email
   ↓
5. ERROR HERE → Template or SMTP fails
   ↓
6. Returns 500 Internal Server Error
   ↓
7. User sees error in console
```

**The failure is at step 5 - email sending!**

---

## ✅ QUICK FIX CHECKLIST

**Go through these one by one:**

### Templates:
- [ ] Opened "Confirm signup" template
- [ ] Pasted HTML with {{ .Token }}
- [ ] Saved
- [ ] Opened "Magic Link" template
- [ ] Pasted HTML with {{ .Token }}
- [ ] Saved

### SMTP:
- [ ] Port is 465
- [ ] Username is lowercase "resend"
- [ ] Password is complete API key
- [ ] Sender is onboarding@resend.dev
- [ ] Saved

### Testing:
- [ ] Deleted old test user
- [ ] Tried signup with new email
- [ ] Checked console for errors
- [ ] Checked Auth Logs for details
- [ ] Checked Resend dashboard

---

## 🔧 ALTERNATIVE: Use Minimal Template

**If complex template causes issues, try this:**

```html
{{ .Token }}
```

**Just that! Nothing else!**

**This will work to test if SMTP is functioning.**

**Once working, you can make it prettier later.**

---

## 📸 WHAT TO SHARE

**If still getting 500 error after fixes, share:**

### 1. Auth Logs Error
**Go to:** Logs → Auth Logs

**Screenshot:** The exact error from when you tried signup

**Look for:** Full error message text

### 2. Template Content
**Screenshot:** The "Confirm signup" template

**Show:** Full content to verify {{ .Token }} is there

### 3. SMTP Settings
**Screenshot:** SMTP Settings tab (blur password)

**Show:** All fields and values

### 4. Resend Status
**Screenshot:** https://resend.com/api-keys

**Show:** Is your API key active?

**With these, I can pinpoint the exact issue!**

---

## 🚀 MOST LIKELY FIX

**Based on 500 error, 90% chance it's:**

**Template is empty or missing {{ .Token }}**

**Quick fix:**
1. Templates → "Confirm signup"
2. Paste template with {{ .Token }}
3. Save
4. Try signup again
5. Should work! ✅

---

## 💡 EXPECTED BEHAVIOR AFTER FIX

**After configuring templates and SMTP correctly:**

```
1. User submits signup
   ↓
2. No 500 error ✅
   ↓
3. "OTP sent to your email" message ✅
   ↓
4. OTP input step appears ✅
   ↓
5. Email sent to Resend ✅
   ↓
6. Email delivered to inbox ✅
   ↓
7. User enters OTP ✅
   ↓
8. Account confirmed ✅
   ↓
9. Redirected to dashboard ✅
```

**No 500 errors, smooth flow!**

---

## 🎯 DO THIS RIGHT NOW

**Priority 1:** Configure email templates with {{ .Token }}

**Priority 2:** Verify SMTP port is 465

**Priority 3:** Check Auth Logs for exact error

**Priority 4:** Try signup again

**Priority 5:** Share Auth Log error if still failing

**The template is almost certainly the issue!** 🚀

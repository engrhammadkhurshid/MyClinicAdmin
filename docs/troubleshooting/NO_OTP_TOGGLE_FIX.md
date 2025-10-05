# NO OTP TOGGLE - Alternative Fix

## 🎯 The Real Issue

If you don't see an "Enable email OTP" toggle, it means:

**Your Supabase project is using the OLD email flow where:**
- Turning OFF "Confirm email" = OTP is automatically enabled
- No separate toggle needed
- BUT SMTP must be configured correctly

---

## ✅ REAL FIX: Configure SMTP Properly

The problem is **SMTP is not actually configured or working**.

### Step 1: Go to SMTP Settings

**URL:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

**Scroll down to:** "SMTP Settings" section

### Step 2: Enable Custom SMTP

**Look for a toggle or checkbox:**
```
☐ Enable Custom SMTP
```

**Turn it ON first!** ⬅️ This is probably the issue

### Step 3: Fill in ALL SMTP Fields

**IMPORTANT:** Make sure EVERY field is filled:

```
Enable Custom SMTP: ON ✅

SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP

Sender Email: onboarding@resend.dev
Sender Name: MyClinicAdmin

Admin Email: your-email@example.com (your email)
```

**Click:** Save Changes

---

## 🧪 Step 4: Test SMTP Connection

**In the same SMTP Settings section:**

**Click:** "Send test email" button

**What should happen:**
- ✅ You receive an email within 10 seconds
- ✅ Email is from "MyClinicAdmin <onboarding@resend.dev>"
- ✅ Subject: "Test email from Supabase"

**If test email works:** OTP will work too!

**If test email fails:**
- SMTP credentials are wrong
- "Enable Custom SMTP" is still OFF
- Resend API key is invalid

---

## 🔍 Alternative: Check If Using Supabase Default SMTP

If you see something like:

```
SMTP Provider:
○ Use Supabase SMTP (default)
○ Use Custom SMTP
```

**Select:** "Use Custom SMTP"

Then fill in the Resend credentials above.

---

## 📊 Common Scenarios

### Scenario 1: Custom SMTP Not Enabled

**Symptoms:**
- "Confirm email" is OFF ✅
- No OTP received ❌
- No test email received ❌

**Fix:**
- Enable "Custom SMTP" toggle
- Fill in Resend credentials
- Test

### Scenario 2: SMTP Credentials Wrong

**Symptoms:**
- Custom SMTP enabled ✅
- Test email fails ❌
- Errors in logs

**Fix:**
- Double-check password: `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`
- No extra spaces
- Port is exactly: `587` (not 465 or 25)

### Scenario 3: Sender Email Not Verified

**Symptoms:**
- SMTP configured ✅
- Test email sent but not received ❌

**Fix:**
- With Resend free tier, use: `onboarding@resend.dev`
- This is pre-verified by Resend
- Custom domain requires DNS verification

---

## 🚨 Critical: The "Enable Custom SMTP" Toggle

Many Supabase projects have this hidden toggle that MUST be ON:

**Look for:**
```
Email Settings
├─ Confirm email: OFF ✅
└─ SMTP Settings
    ├─ Enable Custom SMTP: ??? ⬅️ FIND THIS!
    ├─ Host: smtp.resend.com
    ├─ Port: 587
    └─ ...
```

**If you see "Use Supabase SMTP (default)"**, switch to Custom SMTP!

---

## 🎯 EXACT STEPS TO FIX

### 1. Go to Settings → Auth

**URL:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

### 2. Scroll to "SMTP Settings"

### 3. Look for Enable/Use Custom SMTP

**Turn it ON** (or select "Custom SMTP" radio button)

### 4. Fill These EXACTLY:

```
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
Sender email: onboarding@resend.dev
Sender name: MyClinicAdmin
```

### 5. Click "Save"

### 6. Click "Send test email"

### 7. Check Your Inbox

**Expected:** Email arrives within 10-30 seconds

**If received:** ✅ OTP will work!

**If not received:** ❌ Something wrong with config

---

## 🔧 If Test Email Doesn't Arrive

### Check 1: Spam Folder
- Sometimes goes to spam
- Mark as "Not Spam" if found

### Check 2: Resend Dashboard
- Go to: https://resend.com/emails
- Login with your Resend account
- Check "Recent emails" - should see test email
- If NOT showing: SMTP credentials wrong

### Check 3: Resend API Key
- Go to: https://resend.com/api-keys
- Check if key `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP` is active
- If inactive or deleted, create new key

### Check 4: Supabase Logs
- Dashboard → Logs → Auth Logs
- Look for SMTP connection errors
- Should show "email sent" events

---

## 🎯 Screenshot Guide

**Look for this in Supabase Settings → Auth:**

```
┌─────────────────────────────────────────┐
│ SMTP Settings                           │
├─────────────────────────────────────────┤
│                                         │
│ ☑ Enable Custom SMTP   ⬅️ CRITICAL!   │
│                                         │
│ Host: smtp.resend.com                   │
│ Port: 587                               │
│ Username: resend                        │
│ Password: ************************      │
│                                         │
│ Sender email: onboarding@resend.dev    │
│ Sender name: MyClinicAdmin              │
│                                         │
│ [Save Changes]  [Send test email]      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📧 What Happens When Configured Correctly

### Before Configuration:
```
User signs up
  ↓
Supabase generates OTP
  ↓
Tries to send email
  ↓
❌ No SMTP configured
  ↓
Email not sent (silently fails)
```

### After Configuration:
```
User signs up
  ↓
Supabase generates OTP
  ↓
Connects to smtp.resend.com ✅
  ↓
Sends email via Resend ✅
  ↓
User receives OTP ✅
```

---

## 🚀 QUICK TEST

**Do this RIGHT NOW:**

1. **Open:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/settings/auth

2. **Scroll down** to SMTP Settings

3. **Look for:** Any toggle, checkbox, or radio button about "Enable" or "Use Custom SMTP"

4. **Turn it ON** (or select "Custom")

5. **Fill in the Resend credentials** (exactly as shown above)

6. **Click:** Save Changes

7. **Click:** Send test email

8. **Check your inbox**

**If test email arrives:** Problem solved! Try signup again.

**If test email doesn't arrive:** Take a screenshot of your SMTP Settings page and share it - I'll help debug.

---

## 💡 Pro Tip

If you still don't see any SMTP options or toggles:

**Try the NEW Supabase UI path:**

1. Go to: Dashboard
2. Click: Project Settings (⚙️ icon)
3. Click: Authentication
4. Look for: "SMTP" tab or section
5. Enable custom SMTP there

The UI might have changed in newer Supabase versions!

---

## ✅ Success Checklist

Mark these as you complete:

- [ ] Found SMTP Settings page
- [ ] Found "Enable Custom SMTP" option
- [ ] Turned ON Custom SMTP
- [ ] Filled in smtp.resend.com credentials
- [ ] Saved changes
- [ ] Clicked "Send test email"
- [ ] Received test email in inbox
- [ ] Tried signup again
- [ ] Received OTP email
- [ ] Successfully verified OTP

**Once test email works, OTP will work automatically!** 🎉

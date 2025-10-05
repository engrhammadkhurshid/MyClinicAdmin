# SMTP Configuration Checklist - Step by Step

## 🎯 You Found the Right Place!

**Location:** Authentication → Emails → Templates → **SMTP Settings** tab

**Good news:** You don't need an "Enable OTP" toggle! OTP is already enabled when "Confirm email" is OFF.

**The issue:** SMTP is not configured correctly or not actually sending emails.

---

## ✅ SMTP CONFIGURATION CHECKLIST

Go to: **Authentication → Emails → Templates → SMTP Settings**

### 1. Check Every Field Is Filled

**Make sure ALL these are filled in:**

```
SMTP Settings
─────────────────────────────────────

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP

Sender email: onboarding@resend.dev
Sender name: MyClinicAdmin

Admin email: [your-email@example.com]
```

**Critical:** 
- ✅ Host must be exactly: `smtp.resend.com`
- ✅ Port must be exactly: `587` (not 465, not 25)
- ✅ Username must be exactly: `resend`
- ✅ Password must be exactly: `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`

---

## 2. Look for "Enable Custom SMTP" Toggle

**On that same SMTP Settings page, look for:**

```
☐ Enable Custom SMTP
```

**Or:**

```
○ Use Supabase SMTP (default)
○ Use Custom SMTP
```

**If you see this:**
- Turn ON "Enable Custom SMTP"
- OR select "Use Custom SMTP" radio button
- Then Save

**This is probably why emails aren't sending!**

---

## 3. Save Changes

**After filling in ALL fields:**

Click **"Save"** or **"Update Settings"** button

**Wait for confirmation message:**
- ✅ "Settings saved successfully"
- ✅ Green checkmark or success toast

---

## 4. Send Test Email (CRITICAL STEP)

**On the SMTP Settings page, look for:**

```
[Send test email]
```

**Click it!**

**What should happen:**
1. Button shows "Sending..."
2. You get a success message
3. **Check your email inbox** within 10-30 seconds
4. You should receive a test email from "MyClinicAdmin <onboarding@resend.dev>"

**If test email arrives:** ✅ SMTP is configured correctly!

**If test email doesn't arrive:** ❌ Something is wrong (see troubleshooting below)

---

## 5. Check Email Templates

**While you're in:** Authentication → Emails → **Templates** tab

**Click on these templates and make sure they have content:**

### "Confirm signup" Template
```html
<h2>Welcome to MyClinicAdmin!</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>This code expires in {{ .TokenExpiryDuration }} minutes.</p>
```

### "Magic Link" Template  
```html
<h2>Welcome to MyClinicAdmin!</h2>
<p>Your verification code is: <strong>{{ .Token }}</strong></p>
<p>This code expires in {{ .TokenExpiryDuration }} minutes.</p>
```

**Important:** Make sure `{{ .Token }}` is in the template!

**Save each template after adding content.**

---

## 🔍 TROUBLESHOOTING

### Issue 1: Test Email Not Received

**Possible causes:**

#### A) SMTP Not Enabled
- Look for "Enable Custom SMTP" toggle
- Make sure it's ON
- Save again

#### B) Wrong Credentials
- Double-check password: `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`
- No extra spaces before/after
- Port is `587` not `465`

#### C) Resend API Key Invalid
- Go to: https://resend.com/api-keys
- Check if key is active
- If not, create new key and update password field

#### D) Email in Spam
- Check spam/junk folder
- If found there, mark as "Not Spam"

---

### Issue 2: Error When Sending Test Email

**If you see error message when clicking "Send test email":**

**Error:** "Invalid credentials" or "Authentication failed"
- Password is wrong
- Username should be `resend` (lowercase)

**Error:** "Connection timeout" or "Cannot connect"
- Host is wrong (should be `smtp.resend.com`)
- Port is wrong (should be `587`)
- Firewall blocking SMTP

**Error:** "Sender not verified"
- Use `onboarding@resend.dev` as sender email
- This is pre-verified by Resend for free tier

---

### Issue 3: Test Email Works BUT Signup OTP Doesn't

**If test email works but signup OTP still doesn't arrive:**

#### Check Template Variables

**Go to:** Authentication → Emails → Templates

**Click:** "Magic Link" (this is used for OTP!)

**Make sure it includes:** `{{ .Token }}`

**Example template:**
```html
<!DOCTYPE html>
<html>
<body>
  <h2>Welcome to MyClinicAdmin!</h2>
  <p>Your verification code is:</p>
  <h1 style="font-size: 36px; letter-spacing: 4px;">{{ .Token }}</h1>
  <p>Expires in {{ .TokenExpiryDuration }} minutes.</p>
</body>
</html>
```

**Save the template!**

---

## 🎯 STEP-BY-STEP FIX

Do this RIGHT NOW:

### Step 1: Fill SMTP Fields (Again)
```
Authentication → Emails → Templates → SMTP Settings

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
Sender email: onboarding@resend.dev
Sender name: MyClinicAdmin
```

### Step 2: Look for Enable Toggle
```
☑️ Enable Custom SMTP (turn ON if you see it)
```

### Step 3: Save
```
Click "Save" or "Update"
Wait for success message
```

### Step 4: Test
```
Click "Send test email"
Check your inbox
```

### Step 5: Check Templates
```
Click "Templates" tab
Click "Magic Link" template
Add content with {{ .Token }}
Save
```

### Step 6: Try Signup
```
Go to: https://www.myclinicadmin.app/auth/signup
Sign up with NEW email
Check inbox for OTP
```

---

## 📊 Verification Checklist

Mark these as you complete:

- [ ] SMTP Host = smtp.resend.com
- [ ] SMTP Port = 587
- [ ] SMTP Username = resend
- [ ] SMTP Password = re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
- [ ] Sender Email = onboarding@resend.dev
- [ ] Sender Name = MyClinicAdmin
- [ ] Custom SMTP enabled (if toggle exists)
- [ ] Settings saved
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] "Magic Link" template has content
- [ ] Template includes {{ .Token }}
- [ ] Template saved
- [ ] Tried signup with new email
- [ ] Received OTP email

---

## 🚨 Most Common Issue

**99% of the time it's one of these:**

1. **"Enable Custom SMTP" toggle is OFF**
   - Find it on SMTP Settings page
   - Turn it ON
   - Save

2. **Template is empty or missing {{ .Token }}**
   - Go to Templates tab
   - Edit "Magic Link" template
   - Add HTML with {{ .Token }}
   - Save

3. **SMTP credentials have typo**
   - Copy-paste exactly from this guide
   - No extra spaces
   - Port is 587 not 465

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ "Send test email" button works
2. ✅ Test email arrives in inbox within 30 seconds
3. ✅ Email is from "MyClinicAdmin <onboarding@resend.dev>"
4. ✅ Signup shows "OTP sent"
5. ✅ OTP email arrives within 30 seconds
6. ✅ OTP can be verified successfully

---

## 🔧 If Still Not Working

**Do this:**

1. **Take screenshot** of SMTP Settings page (blur password)
2. **Take screenshot** of Templates page
3. **Share the screenshots**
4. **Copy any error messages** from Supabase logs
5. I'll tell you exactly what's wrong

---

## 🎯 Quick Action

**Right now, do this:**

1. Go to SMTP Settings
2. Look for **ANY toggle, checkbox, or radio button** about "Enable" or "Use Custom"
3. Turn it ON or select "Custom"
4. Save
5. Click "Send test email"
6. Check inbox

**If test email works, OTP will work!** 🚀

---

## 📧 Expected Behavior

### When Everything Is Configured:

```
User signs up
  ↓
Supabase generates 6-digit OTP
  ↓
Uses "Magic Link" template
  ↓
Connects to smtp.resend.com:587
  ↓
Authenticates with username: resend, password: re_cyxe...
  ↓
Sends email from: onboarding@resend.dev
  ↓
Email delivered via Resend
  ↓
User receives OTP within 10-30 seconds ✅
```

---

## 🚀 The Critical Test

**Everything hinges on this:**

**Click "Send test email" in SMTP Settings**

- ✅ Works = OTP will work
- ❌ Doesn't work = Need to fix SMTP first

**Do the test NOW and let me know the result!** 💪

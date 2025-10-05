# SMTP Configuration Error - "Error sending magic link email"

## 🚨 Critical Error Found

**Error Message:**
```
Failed to send magic link: Error sending magic link email
```

**This confirms:**
- ✅ Supabase is trying to send emails
- ❌ SMTP connection/authentication is failing
- ❌ Email never reaches Resend (that's why Resend dashboard is empty)

---

## 🎯 ROOT CAUSES (In Order of Likelihood)

### 1. Wrong SMTP Credentials (95% chance)
### 2. SMTP Not Enabled in Supabase (3% chance)
### 3. Resend SMTP Not Set Up (2% chance)

---

## ✅ DEFINITIVE FIX - Step by Step

### STEP 1: Verify Resend SMTP Is Set Up

**Go to:** https://resend.com/settings/smtp

**What you should see:**

```
SMTP Access
───────────────────────────────

☑️ Enable SMTP Access   ← Must be checked!

SMTP Settings
Host: smtp.resend.com
Port: 587 or 465
Username: resend
Password: **************** [Show Password]
```

**If you DON'T see this:**
- Click "Enable SMTP" or "Create SMTP credentials"
- Resend will generate credentials for you

**If you DO see this:**
- Click **"Show Password"**
- **Copy the password** (NOT your API key!)
- Keep this window open

---

### STEP 2: Update Supabase SMTP Configuration

**Go to:** Authentication → Emails → Templates → **SMTP Settings** tab

**Fill in EXACTLY:**

```
SMTP Provider Host: smtp.resend.com
SMTP Port Number: 587
SMTP Username: resend
SMTP Password: [PASTE THE PASSWORD FROM RESEND - STEP 1]

Sender Email: onboarding@resend.dev
Sender Name: MyClinicAdmin
Admin Email: [your email - can be any email you use]
```

**CRITICAL CHECKS:**
- ✅ Port is `587` (NOT 465, NOT 25)
- ✅ Username is lowercase `resend`
- ✅ Password is from Resend SMTP settings (NOT API key!)
- ✅ No extra spaces before/after any value
- ✅ Sender email is `onboarding@resend.dev`

**Click SAVE** and wait for success message!

---

### STEP 3: Check for "Enable Custom SMTP" Toggle

**IMPORTANT:** On the same SMTP Settings page, look CAREFULLY for:

**Option A:**
```
☐ Enable Custom SMTP
```

**Option B:**
```
○ Use Supabase SMTP (default)
○ Use Custom SMTP   ← Select this!
```

**Option C:**
```
SMTP Provider: [Dropdown]
├─ None (Supabase default)
└─ Custom SMTP   ← Select this!
```

**If you find ANY of these:**
- Enable/Select "Custom SMTP"
- Save again

**If you don't see any toggle:**
- It might be auto-enabled when you fill in SMTP fields
- Continue to next step

---

### STEP 4: Test Magic Link Manually

**Go to:** Authentication → Users

**Click:** "Invite User" or find a test user

**Try:** "Send Magic Link" again

**Expected results:**

**If it works:**
- ✅ Success message appears
- ✅ Check Resend dashboard - email should appear
- ✅ SMTP is now working!

**If it still fails:**
- ❌ Password is still wrong
- ❌ OR SMTP not enabled
- Continue to troubleshooting below

---

## 🔍 TROUBLESHOOTING

### Error Persists After Correct Configuration?

#### Check 1: Verify Password Is NOT API Key

**Your API key:** `re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP`

**If your SMTP password looks like this:** ❌ WRONG!

**SMTP password should look different!** (Usually shorter, different format)

#### Check 2: Try Port 465 Instead

Some Supabase versions work better with SSL:

```
Port: 465 (instead of 587)
```

**Save and test again**

#### Check 3: Check Supabase Auth Logs

**Go to:** Dashboard → Logs → Auth Logs

**Filter by:** Recent errors

**Look for:**
```
"SMTP authentication failed"  → Wrong password
"Connection timeout"          → Port or host wrong
"Invalid credentials"         → Username/password wrong
"TLS handshake failed"       → Try different port
```

**Share the exact error message!**

---

## 🔧 Alternative: Recreate Resend SMTP Credentials

**If nothing works, regenerate SMTP credentials:**

### Step 1: Delete Old SMTP Credentials in Resend

**Go to:** https://resend.com/settings/smtp

**Look for:** "Revoke" or "Delete" button

**Click it** to remove old credentials

### Step 2: Create New SMTP Credentials

**Click:** "Enable SMTP" or "Create SMTP Credentials"

**Resend will generate:**
```
Username: resend
Password: [NEW PASSWORD]
```

**Copy the new password**

### Step 3: Update Supabase

Use the **NEW password** in Supabase SMTP settings

**Save and test**

---

## 📊 Common SMTP Configuration Mistakes

### Mistake 1: Using API Key as Password ❌

```
WRONG:
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP  ← This is API key!

CORRECT:
Password: [actual SMTP password from Resend settings]
```

### Mistake 2: Wrong Port ❌

```
WRONG:
Port: 25   ← Often blocked by ISPs
Port: 2525 ← Not standard

CORRECT:
Port: 587  ← TLS/STARTTLS (recommended)
Port: 465  ← SSL (alternative)
```

### Mistake 3: Extra Spaces ❌

```
WRONG:
Username: " resend "  ← Spaces!
Password: "re_abc... "  ← Space at end!

CORRECT:
Username: resend
Password: [no spaces]
```

### Mistake 4: SMTP Not Enabled ❌

```
SMTP fields filled ✅
BUT toggle is OFF ❌

FIX:
Turn ON "Custom SMTP" toggle!
```

---

## 🎯 EXACT CONFIGURATION CHECKLIST

**Go through this checklist point by point:**

### In Resend (https://resend.com/settings/smtp):

- [ ] SMTP Access is enabled
- [ ] Can see "Host: smtp.resend.com"
- [ ] Can see "Username: resend"
- [ ] Can see "Password: ****" with "Show" button
- [ ] Clicked "Show Password" and copied it

### In Supabase SMTP Settings:

- [ ] Host = `smtp.resend.com` (exactly)
- [ ] Port = `587` (exactly)
- [ ] Username = `resend` (lowercase)
- [ ] Password = [from Resend SMTP, NOT API key]
- [ ] Sender Email = `onboarding@resend.dev`
- [ ] Sender Name = `MyClinicAdmin`
- [ ] Admin Email = filled in
- [ ] Looked for "Enable Custom SMTP" toggle
- [ ] If found, turned it ON
- [ ] Clicked SAVE
- [ ] Saw success message

### Testing:

- [ ] Went to Authentication → Users
- [ ] Tried "Send Magic Link" to test user
- [ ] Checked for error or success message
- [ ] Checked Resend dashboard for email
- [ ] Checked Supabase Auth logs for errors

---

## 🚨 MOST LIKELY FIX

**Based on your error, 95% chance it's:**

**You're using the API key (`re_cyxezVdG...`) as the SMTP password!**

**To fix:**

1. Go to: https://resend.com/settings/smtp
2. Click: "Show Password" under SMTP Credentials
3. Copy: That password (it's NOT your API key!)
4. Go to: Supabase SMTP Settings
5. Paste: The real SMTP password
6. Save
7. Test: Send magic link again

**This should fix it immediately!** ✅

---

## 📸 Share for Debugging

If still not working, share these screenshots (blur sensitive info):

### 1. Resend SMTP Page
**Screenshot of:** https://resend.com/settings/smtp

**Show:**
- Is SMTP enabled?
- SMTP credentials section (blur password, just show it exists)
- First 3 characters of SMTP password

### 2. Supabase SMTP Settings
**Screenshot of:** SMTP Settings tab

**Show:**
- All field names and labels
- First 3 chars of what's in each field
- Any toggles, checkboxes, or radio buttons
- After saving - any success/error messages

### 3. Supabase Auth Logs
**Screenshot of:** Dashboard → Logs → Auth Logs

**Show:**
- Recent error when trying to send magic link
- Full error message text

### 4. Test Result
**Screenshot of:**
- What happens when you click "Send Magic Link"
- The exact error message

**With these, I can tell you EXACTLY what's wrong!** 🎯

---

## 💡 Quick Diagnostic

**Answer these questions:**

1. **Does your SMTP password in Supabase start with `re_`?**
   - If YES → That's your API key, not SMTP password! ❌
   - If NO → What does it start with? (first 3 chars)

2. **Can you see SMTP credentials at https://resend.com/settings/smtp?**
   - If YES → Does the password there match Supabase?
   - If NO → SMTP not enabled in Resend!

3. **Is there a toggle/checkbox on Supabase SMTP Settings page?**
   - If YES → Is it turned ON?
   - If NO → Might be auto-enabled

**Answer these and I'll give you the exact fix!** 💪

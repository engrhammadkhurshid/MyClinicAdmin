# Finding SMTP Settings in New Supabase UI

## 🎯 The Issue

The old URL redirects automatically because Supabase changed their dashboard layout!

**Old URL (doesn't work):**
❌ `/settings/auth` → redirects to `/auth/users`

**New URL (correct):**
✅ `/project/settings/auth`

---

## ✅ CORRECT PATH TO SMTP SETTINGS

### Method 1: Direct URL (Fastest)

**Use this URL instead:**
👉 **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/project/settings/auth**

Notice the `/project/settings/auth` at the end instead of just `/settings/auth`

---

### Method 2: Navigate Manually

**Step-by-step:**

1. **Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg

2. **Click:** ⚙️ **"Project Settings"** (bottom left sidebar, gear icon)

3. **In the Settings menu, click:** **"Authentication"**

4. **You should now see tabs like:**
   - Policies
   - Providers
   - **Email Templates** ⬅️ Click this
   - URL Configuration
   - **SMTP Settings** ⬅️ Or this

5. **Scroll down to find:** "SMTP Settings" or "Email SMTP"

---

## 🔍 What You're Looking For

Once you find the SMTP Settings page, you should see:

```
SMTP Settings
─────────────────────────────────────

Enable Custom SMTP: [Toggle] ⬅️ Turn this ON!

OR

○ Use Supabase SMTP (default)
○ Use Custom SMTP ⬅️ Select this

Then fill in:
├─ Host: smtp.resend.com
├─ Port: 587  
├─ Username: resend
├─ Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
├─ Sender email: onboarding@resend.dev
└─ Sender name: MyClinicAdmin

[Save] [Send test email]
```

---

## 🎯 Alternative: Check Email Templates

Sometimes SMTP settings are under **Email Templates** tab:

**Try this URL:**
👉 **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/templates**

**Look for:**
- "SMTP Configuration" section
- "Email Settings" section
- Any mention of SMTP or custom email server

---

## 🔧 New Supabase Dashboard Structure

The new layout is:

```
Dashboard
├─ Authentication
│  ├─ Users ⬅️ You're here now
│  ├─ Policies
│  ├─ Providers ⬅️ Check "Email" provider here
│  └─ Templates
│
└─ Project Settings ⬅️ Need to go here!
   ├─ General
   ├─ Database
   ├─ API
   ├─ Authentication ⬅️ SMTP Settings are here!
   ├─ Storage
   └─ Edge Functions
```

---

## ✅ EXACT STEPS FOR NEW UI

### Step 1: Click Project Settings

**At the bottom of the left sidebar:**

```
┌─────────────────┐
│ Home            │
│ Table Editor    │
│ Authentication  │  ⬅️ This is NOT it
│ Storage         │
│ ...             │
├─────────────────┤
│ ⚙️  Project     │  ⬅️ CLICK THIS!
│    Settings     │
└─────────────────┘
```

### Step 2: Click Authentication Under Settings

**In Project Settings menu (top tabs):**

```
General | Database | API | Authentication | Storage | ...
                          ↑
                    CLICK THIS
```

### Step 3: Look for SMTP Section

**Scroll down on the Authentication page:**

You should see sections like:
- Auth Providers
- Auth Settings  
- **SMTP Configuration** ⬅️ HERE!
- Security Settings

---

## 🚀 QUICK FIX - Try These URLs

Try each of these URLs until you find SMTP settings:

1. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/project/settings/auth**

2. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/templates**

3. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers**

One of these should have the SMTP configuration!

---

## 🎯 What to Do When You Find It

Once you locate SMTP Settings:

### 1. Enable Custom SMTP
```
☑️ Enable Custom SMTP (turn ON)
```

### 2. Fill In Resend Credentials
```
Host: smtp.resend.com
Port: 587
User: resend
Password: re_cyxezVdG_MRytTMZD83VPUSqtQehj7PtP
Sender: onboarding@resend.dev
Name: MyClinicAdmin
```

### 3. Save Changes
```
Click "Save" or "Update"
```

### 4. Test
```
Click "Send test email"
Check your inbox within 30 seconds
```

---

## 🔍 Still Can't Find It?

If none of these work, try:

### Search Bar (Top of Dashboard)

Type in the search: **"SMTP"** or **"Email"**

Should show you the exact page where SMTP settings are!

### Check Account Role

Make sure you're logged in as:
- Owner
- Administrator

Some settings are hidden for read-only roles.

---

## 💡 Alternative: Use Supabase CLI

If the UI is too confusing, you can configure SMTP via Supabase CLI:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link your project
supabase link --project-ref axqrsqktdvczitobwzcg

# Check auth config
supabase secrets list
```

But honestly, finding it in the UI is faster! 😄

---

## 📸 Help Me Help You

If you still can't find SMTP settings:

1. **Take a screenshot** of your Project Settings page
2. **Take a screenshot** of the sidebar menu
3. Share them (can blur sensitive info)
4. I'll point you exactly where to click!

---

## 🎉 Once You Find It

The moment you enable Custom SMTP and fill in Resend credentials:

1. ✅ Save changes
2. ✅ Click "Send test email"
3. ✅ Receive email in 10-30 seconds
4. ✅ Try signup again
5. ✅ OTP will work!

**The test email is the key** - if that works, OTP works! 🚀

---

## 🔗 Quick Links Summary

Try these in order:

1. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/project/settings/auth** (Most likely)

2. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/templates** (Check here)

3. **https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/providers** (Email provider)

4. Use **search bar** in dashboard: Type "SMTP"

One of these WILL have your SMTP settings! 💪

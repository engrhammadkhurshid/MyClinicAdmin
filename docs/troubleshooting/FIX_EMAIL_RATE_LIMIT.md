# Fixing "Email Rate Limit Exceeded" Error

## 🚨 The Problem

**Error:** "email rate limit exceeded"

**Why it happens:**
- Resend free tier: 100 emails/day, **10 emails/hour per sender**
- You've been testing signup multiple times
- Hit the hourly rate limit

**This is actually GOOD news:**
✅ Supabase SMTP is configured correctly!
✅ Emails are being sent!
✅ Just hit rate limits from testing

---

## ✅ Immediate Solutions

### Solution 1: Wait 1 Hour ⏰
Rate limit resets every hour. Come back and test again.

### Solution 2: Delete Test Users 🗑️

**Go to:** https://supabase.com/dashboard/project/axqrsqktdvczitobwzcg/auth/users

**Steps:**
1. Find your test users in the list
2. Click the 3 dots (⋮) next to each user
3. Click "Delete user"
4. Try signing up again with the same email

This is the **fastest way** to continue testing!

### Solution 3: Use Email Aliases 📧

Gmail and other providers support aliases:

```
youremail+test1@gmail.com
youremail+test2@gmail.com  
youremail+signup@gmail.com
youremail+dev@gmail.com
```

All these emails go to `youremail@gmail.com` but Supabase sees them as different users!

### Solution 4: Temporarily Disable Email Verification (Dev Only)

For rapid local testing, you can temporarily skip email verification:

**In Supabase:**
1. Go to: Auth → Providers → Email
2. Turn OFF "Confirm email"
3. Users can signup without OTP
4. **Remember to turn it back ON for production!**

---

## 🔍 Check Your Current Usage

**Go to Resend Dashboard:**
https://resend.com/emails

**Check:**
- How many emails sent today
- Rate limit status
- Failed sends

**Resend Limits:**
```
Free Tier:
- 100 emails/day (total)
- 10 emails/hour (per sender)
- 3,000 emails/month

If you see 10+ emails in last hour → That's why!
```

---

## 🎯 Best Practice for Development

### Option A: Use Supabase's Built-in Email (No Limits for Dev)

Instead of using Resend SMTP for local dev, use Supabase's default:

1. **Go to:** Settings → Auth → SMTP Settings
2. **Toggle OFF** "Enable Custom SMTP" (temporarily)
3. **Use Supabase's built-in email** for development
4. **Turn Custom SMTP back ON** for production

**Benefits:**
- ✅ No rate limits during development
- ✅ Unlimited test emails
- ❌ Emails might go to spam (but good enough for testing)

### Option B: Use Mailtrap for Development

**Mailtrap** catches all emails (nothing actually sends):

1. Sign up: https://mailtrap.io (free)
2. Get SMTP credentials
3. Use in Supabase for development
4. Switch to Resend for production

**Benefits:**
- ✅ Unlimited emails
- ✅ No real emails sent
- ✅ View all emails in Mailtrap inbox

---

## 🚀 Recommended Development Workflow

### For Local Development:

**Use Supabase Built-in Email:**
```
Supabase Dashboard → Settings → Auth → SMTP Settings
→ Disable Custom SMTP
→ Save
```

**Benefits:**
- No Resend limits
- Fast testing
- Free unlimited emails

### For Production:

**Use Resend SMTP:**
```
Supabase Dashboard → Settings → Auth → SMTP Settings
→ Enable Custom SMTP
→ Configure Resend
→ Save
```

**Benefits:**
- Professional email delivery
- Better deliverability
- Email monitoring

---

## 📝 Quick Fix Right Now

**To continue testing immediately:**

1. **Delete test users:**
   - Supabase → Auth → Users → Delete your test accounts

2. **Or wait 1 hour** for rate limit reset

3. **Or disable email verification temporarily:**
   - Supabase → Auth → Providers → Email
   - Turn OFF "Confirm email"
   - Signup works without email
   - Turn back ON later

---

## 🎯 Long-term Solution

### Setup Separate Configs for Dev vs Prod

**For Development (Local):**
- Use Supabase built-in email
- OR use Mailtrap
- Unlimited testing

**For Production (Vercel):**
- Use Resend SMTP
- Professional delivery
- 100 emails/day is plenty for real users

**How to switch:**
- Manually toggle SMTP in Supabase based on environment
- OR use environment variables in your app (advanced)

---

## 🔍 Verify Rate Limit Status

**Check Resend:**
```bash
# Go to: https://resend.com/emails
# Look for:
- Emails sent in last hour: X/10
- Emails sent today: X/100
```

**Check Supabase Logs:**
```bash
# Go to: Dashboard → Logs → Auth Logs
# Look for:
- "Rate limit exceeded" errors
- Failed email attempts
```

---

## ✅ What To Do Right Now

**Choose one:**

### Quick Test (5 seconds):
```
1. Wait 1 hour
2. Try again
```

### Delete & Retry (30 seconds):
```
1. Supabase → Auth → Users
2. Delete test users
3. Sign up again with same email
```

### Disable Email (10 seconds):
```
1. Supabase → Auth → Providers → Email
2. Turn OFF "Confirm email"
3. Signup works immediately (no email needed)
4. Turn back ON when done testing
```

### Switch to Supabase Email (30 seconds):
```
1. Supabase → Settings → Auth → SMTP
2. Toggle OFF "Custom SMTP"
3. Save
4. Unlimited test emails!
5. Turn back ON for production
```

---

## 🎉 The Good News

This error means:
- ✅ Your email integration is working!
- ✅ Supabase is sending emails!
- ✅ Resend is receiving them!
- ✅ Just hit rate limits from testing

**You're almost there!** Just need to manage rate limits for development.

---

## 📊 Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| Rate limit exceeded | Testing signup 10+ times/hour | Delete test users or wait 1 hour |
| Need fast testing | Resend limits hit | Disable Custom SMTP for dev |
| Production emails | Need reliable delivery | Enable Resend SMTP |

**Recommended:** 
- Development: Disable Custom SMTP (use Supabase default)
- Production: Enable Custom SMTP (use Resend)

This way you get unlimited testing + professional production emails! 🚀

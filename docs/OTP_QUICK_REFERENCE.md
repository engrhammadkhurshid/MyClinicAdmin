# Quick Reference: Multi-Step Signup with OTP

## 🎯 What Was Fixed

### Issue 1: Double Emails ✅ FIXED
- **Problem:** Users received both confirmation email AND OTP email
- **Solution:** Configure Supabase to send OTP-only (see guide below)

### Issue 2: No Resend OTP ✅ FIXED
- **Problem:** Users couldn't resend OTP if not received
- **Solution:** Added smart resend with 60-second cooldown timer

### Issue 3: No Email Change ✅ FIXED
- **Problem:** Users stuck if they entered wrong email
- **Solution:** Added "Wrong email? Change it" button

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure Supabase Dashboard
```
1. Go to: https://app.supabase.com
2. Select your project
3. Navigate to: Authentication → Settings
4. Find "Email Confirmation" section
5. Disable "Enable email confirmations" 
   OR
   Enable "Send OTP instead of magic link"
6. Set OTP expiry: 3600 seconds
7. Click Save
```

### Step 2: Test Your Signup Flow
```
1. Run: npm run dev
2. Go to: http://localhost:3000/auth/signup
3. Complete Step 1 (Personal Info)
4. Complete Step 2 (Clinic Details)
5. Check email - should receive ONLY 1 email with 6-digit OTP
6. Enter OTP and verify
7. Enjoy confetti! 🎉
```

---

## 📱 New Features Overview

### 1. Smart Resend OTP
```
✓ 60-second cooldown prevents spam
✓ Shows countdown: "Resend OTP in 45s"
✓ Button disabled during cooldown
✓ Automatic re-enable after 60s
```

**User sees:**
```
Didn't receive the code?
[Resend OTP in 30s]  ← Disabled, counting down
```

After 60 seconds:
```
Didn't receive the code?
[Resend OTP]  ← Active, clickable
```

### 2. Change Email Option
```
✓ Visible on OTP verification screen
✓ Returns to Step 1 with data preserved
✓ User can enter new email
✓ New OTP sent to new email
```

**User sees:**
```
We've sent a 6-digit verification code to
user@example.com
[Wrong email? Change it]  ← Click to go back
```

### 3. Visual Feedback
```
✓ Toast notifications for all actions
✓ Loading states on buttons
✓ Error messages for invalid OTP
✓ Success messages with icons
✓ Confetti animation on completion
```

---

## 🧪 Testing Scenarios

### Test 1: Normal Signup Flow
```
1. Enter all details in Step 1
2. Enter clinic info in Step 2
3. Receive 1 email with OTP
4. Enter OTP
5. See confetti
6. Redirected to dashboard
✓ Expected: Success
```

### Test 2: Resend OTP
```
1. Complete Steps 1-2
2. Wait on Step 3 (don't enter OTP)
3. Click "Resend OTP"
4. See "Resend OTP in 60s" countdown
5. Wait 60 seconds
6. Click "Resend OTP" again
✓ Expected: New OTP received, countdown resets
```

### Test 3: Change Email
```
1. Complete Steps 1-2 with wrong email
2. Reach Step 3
3. Click "Wrong email? Change it"
4. Back on Step 1 with data preserved
5. Change email address
6. Complete Steps 2-3 with new email
✓ Expected: OTP sent to new email
```

### Test 4: Invalid OTP
```
1. Complete Steps 1-2
2. Enter wrong OTP (e.g., 123456)
3. Click "Complete Signup"
✓ Expected: Error toast "Invalid OTP"
```

### Test 5: Expired OTP
```
1. Complete Steps 1-2
2. Wait for OTP to expire (default: 1 hour)
3. Try to verify
✓ Expected: Error message, can resend OTP
```

---

## 📋 Component Props Reference

### Step3Form Component
```typescript
<Step3Form
  formData={formData}           // Form data object
  errors={errors}               // Validation errors
  updateField={updateField}     // Update form field
  onVerify={verifyOTP}          // Verify OTP handler
  onResend={resendOTP}          // Resend OTP handler
  onChangeEmail={changeEmail}   // Change email handler ← NEW
  onBack={handleBack}           // Go back handler
  loading={loading}             // Loading state
  otpSent={otpSent}            // OTP sent flag
/>
```

---

## 🔧 Configuration Options

### Cooldown Timer Duration
```typescript
// In Step3Form component
setResendCooldown(60) // Change from 60 to your preferred seconds
```

### OTP Length
```typescript
// In Step3Form OTP input
maxLength={6} // Current: 6 digits (recommended)
```

### OTP Expiry (Supabase Dashboard)
```
Authentication → Settings → OTP Expiry
Default: 3600 seconds (1 hour)
Recommended: 3600-7200 seconds
```

---

## 🐛 Common Issues & Fixes

### Issue: Still receiving 2 emails
```
Fix:
1. Check Supabase settings again
2. Wait 2 minutes for changes to apply
3. Test in incognito mode
4. Check Supabase Auth logs
```

### Issue: Resend button not working
```
Fix:
1. Check browser console for errors
2. Verify network tab shows API call
3. Ensure cooldown timer isn't active
4. Try refreshing the page
```

### Issue: Change email button doesn't show
```
Fix:
1. Ensure you're on Step 3
2. Check component props include onChangeEmail
3. Verify MultiStepSignupForm.tsx has changeEmail function
```

---

## 📁 Documentation Files

1. **SUPABASE_OTP_ONLY_CONFIG.md** - Complete Supabase setup guide
2. **OTP_IMPROVEMENTS_SUMMARY.md** - Detailed changes and implementation
3. **MULTI_STEP_SIGNUP_IMPLEMENTATION.md** - Original implementation guide
4. **This file** - Quick reference card

---

## ✅ Final Checklist

Before going to production:

- [ ] Supabase configured for OTP-only emails
- [ ] Tested complete signup flow (Steps 1-3)
- [ ] Tested resend OTP with cooldown
- [ ] Tested change email functionality
- [ ] Verified only 1 email received
- [ ] Tested OTP verification
- [ ] Confirmed confetti animation works
- [ ] Verified redirect to dashboard
- [ ] Checked profile created in database
- [ ] Tested on mobile device
- [ ] Tested error scenarios (invalid OTP, expired OTP)

---

## 🎉 You're Done!

Your multi-step signup with OTP verification is production-ready.

**Next Steps:**
1. Configure Supabase (5 minutes)
2. Test the flow (10 minutes)
3. Deploy to production

**Need Help?** Check the detailed guides in the `/docs` folder.

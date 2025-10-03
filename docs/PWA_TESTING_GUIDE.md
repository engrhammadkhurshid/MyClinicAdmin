# 🧪 PWA Testing Guide

## Quick Test Steps

### 1. Local Testing
```bash
# Build the production version
npm run build

# Start production server
npm start

# Open http://localhost:3000 in Chrome
```

### 2. Check PWA Installation

#### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** section - should show MyClinic app details
4. Check **Service Workers** - should show registered worker
5. Click **Update** to test service worker

### 3. Test Install Prompt

#### Desktop (Chrome/Edge):
- Look for install icon (⊕) in address bar
- OR wait 3 seconds for custom install prompt to appear
- Click install and app opens in new window

#### Android (Chrome):
1. Visit site in Chrome
2. Tap menu (⋮)
3. Select "Install app" or "Add to Home screen"
4. Check home screen for MyClinic icon

#### iOS (Safari):
1. Visit site in Safari
2. Tap Share button (⬆️)
3. Scroll to "Add to Home Screen"
4. Tap "Add"
5. Icon appears on home screen

### 4. Test Offline Mode

1. Install the app
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload page - should show cached content or offline page
5. Uncheck "Offline" to go back online

### 5. Test App Shortcuts

#### Android:
- Long-press the MyClinic icon
- Should show: Dashboard, Patients, Appointments
- Tap any shortcut to go directly to that page

#### Desktop:
- Right-click the app icon in taskbar/dock
- Should show the same shortcuts

## Lighthouse PWA Audit

### Run Audit:
```bash
1. npm run build && npm start
2. Open http://localhost:3000 in Chrome
3. Open DevTools (F12)
4. Click "Lighthouse" tab
5. Select "Progressive Web App"
6. Click "Analyze page load"
```

### Expected Results:
- ✅ **PWA Score**: 100/100
- ✅ **Installable**: Pass
- ✅ **Service Worker**: Pass
- ✅ **Offline**: Pass
- ✅ **Fast and reliable**: Pass
- ✅ **Optimized for mobile**: Pass

## Common Issues & Fixes

### Issue: Install prompt doesn't show
**Fix**: 
- Must be HTTPS (works on localhost and Vercel)
- Clear cache and reload
- Wait 3-5 seconds for prompt
- Try incognito mode

### Issue: Service worker not registering
**Fix**:
- Check `/public/sw.js` exists
- Verify HTTPS connection
- Clear all site data in DevTools
- Hard reload (Cmd+Shift+R)

### Issue: Icons not showing
**Fix**:
- Check `/public/icon-192.svg` exists
- Check `/public/icon-512.svg` exists
- Verify manifest.json icons array
- Clear cache and reinstall

### Issue: Offline mode not working
**Fix**:
- Ensure service worker is registered
- Check `/public/offline.html` exists
- Verify cache strategy in sw.js
- Test in private/incognito mode

## Production Deployment Test

### After deploying to Vercel:

1. **Visit your deployed URL**
2. **Open DevTools** → Application tab
3. **Check Manifest**: Should load without errors
4. **Check Service Worker**: Should show "activated and running"
5. **Test Install**: Try installing on real device
6. **Test Offline**: Turn off WiFi/data and reload app

### Real Device Testing:

#### Android:
1. Visit site in Chrome
2. Install from prompt or menu
3. Open from home screen
4. Test app shortcuts
5. Test offline mode (airplane mode)

#### iOS:
1. Visit site in Safari
2. Add to home screen
3. Open from home screen
4. Verify full-screen mode
5. Test cached pages offline

## Success Checklist

Before marking PWA as complete:

- [ ] Service worker registers successfully
- [ ] Manifest.json loads without errors
- [ ] Icons display correctly (192px, 512px)
- [ ] Install prompt appears (desktop & mobile)
- [ ] App can be installed on home screen
- [ ] App opens in standalone mode (no browser UI)
- [ ] Offline page displays when no network
- [ ] App shortcuts work (long-press icon)
- [ ] Lighthouse PWA score is 100
- [ ] Works on Android Chrome
- [ ] Works on iOS Safari
- [ ] Works on Desktop Chrome/Edge

## Monitoring in Production

### Check these metrics:
- Install rate: How many users install the app
- Service worker hits: Cache performance
- Offline usage: How often users go offline
- Engagement: Do installed users visit more often?

### Tools:
- Google Analytics: Track app installs as events
- Vercel Analytics: Monitor performance
- Chrome DevTools: Debug issues remotely

---

**Your PWA is ready! Test locally, then deploy to production.** 🚀

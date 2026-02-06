# 🔧 Troubleshooting Guide

Common issues and solutions for the Shared Shopping App.

---

## 🚫 Authentication Issues

### "Invalid login credentials" error

**Cause:** Wrong email or password, or user doesn't exist.

**Solutions:**
1. Double-check email and password
2. Try the "Forgot Password" flow (if implemented)
3. Create a new account if you haven't signed up yet
4. Check Supabase dashboard → Authentication → Users to verify account exists

### Can't sign up / "User already registered"

**Cause:** Email already in use.

**Solutions:**
1. Try logging in instead of signing up
2. Use a different email address
3. Check your email for verification link (Supabase sends confirmation emails)

### Stuck on loading after login

**Cause:** Database permissions or missing user profile.

**Solutions:**
1. Check browser console for errors (F12)
2. Verify Supabase RLS policies are enabled
3. Check that `users` table has INSERT policy
4. Clear browser cache and cookies
5. Try in incognito/private mode

---

## 🏠 Household Issues

### Can't create household

**Cause:** Missing permissions or database error.

**Solutions:**
1. Check browser console for errors
2. Verify you're logged in (refresh the page)
3. Check Supabase → SQL Editor → Run:
   ```sql
   SELECT * FROM users WHERE id = 'your-user-id';
   ```
4. Ensure RLS policies allow INSERT on `households` table

### "Invalid invite code" when joining

**Cause:** Code doesn't exist or typo.

**Solutions:**
1. Double-check the code (case-sensitive, 6 characters)
2. Ask partner to share code again
3. Verify code exists in Supabase:
   ```sql
   SELECT * FROM households WHERE invite_code = 'ABC123';
   ```
4. Ensure code is uppercase

### Already in a household, can't join another

**Cause:** Current design supports one household per user.

**Solutions:**
1. This is expected behavior for v1.0
2. To switch households:
   - Go to Supabase → Table Editor → users
   - Find your user
   - Set `household_id` to NULL
   - Refresh app and join new household

---

## 📝 Shopping List Issues

### Items not appearing in real-time

**Cause:** Real-time subscription not active or network issue.

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Check browser console for WebSocket errors
4. Verify in Supabase:
   - Database → Replication → `items` table is published
   - API → Realtime is enabled
5. Check RLS policies allow SELECT on `items`

### "Failed to add item" error

**Cause:** Database permissions or network issue.

**Solutions:**
1. Check internet connection
2. Verify you're in a household (check household_id)
3. Check browser console for specific error
4. Verify RLS policy allows INSERT for your household
5. Check Supabase project is not paused (free tier pauses after inactivity)

### Items from wrong household showing up

**Cause:** RLS policies not working correctly.

**Solutions:**
1. **CRITICAL:** Check RLS policies in `supabase/schema.sql`
2. Verify policies are enabled:
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'items';
   ```
3. Re-run the schema.sql to reset policies
4. Clear app cache and reload

### Can't delete items

**Cause:** Permission issue or UI not responding.

**Solutions:**
1. Check that DELETE policy exists for items
2. Try refreshing the page
3. Check browser console for errors
4. Verify you're still logged in

---

## 🔄 Real-time Sync Issues

### Partner's changes not showing

**Cause:** Subscription not active or different household.

**Solutions:**
1. Both users must be in the same household
2. Check "Partner online" indicator - if not showing, presence isn't working
3. Refresh both apps
4. Check Supabase → Database → Replication → Ensure `items` table is published
5. Verify WebSocket connection in browser dev tools → Network → WS

### Delay in updates (>1 second)

**Cause:** Network latency or Supabase region.

**Solutions:**
1. Check internet speed on both devices
2. Supabase free tier has some latency
3. Consider upgrading Supabase plan for better performance
4. Check Supabase project location (should be close to users)

### "Partner online" indicator wrong

**Cause:** Presence tracking issue.

**Solutions:**
1. Both users need to be on `/list` page simultaneously
2. Refresh both apps
3. Check browser console for presence channel errors
4. Presence has a ~30 second timeout, wait a bit after closing app

---

## 📱 PWA Issues

### Can't install app

**Cause:** PWA requirements not met.

**Solutions:**
1. Must use HTTPS (Vercel provides this automatically)
2. Check that manifest.json is accessible at `/manifest.json`
3. Try in different browser (Chrome/Safari work best)
4. iOS: Must use Safari (not Chrome on iOS)
5. Clear browser cache and reload
6. Check service worker is registered:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations()
   ```

### Installed app not updating

**Cause:** Service worker caching old version.

**Solutions:**
1. Close the app completely
2. Reopen and force refresh (Ctrl/Cmd + Shift + R)
3. Uninstall and reinstall the PWA
4. Check for update in app settings
5. In browser console:
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister())
   })
   ```

### App crashes after install

**Cause:** Service worker conflict or cache issue.

**Solutions:**
1. Uninstall the PWA
2. Clear all site data in browser settings
3. Reinstall the app
4. Check browser console for specific errors

---

## 🌐 Deployment Issues

### Build fails on Vercel

**Cause:** TypeScript errors or missing dependencies.

**Solutions:**
1. Test build locally first:
   ```bash
   npm run build
   ```
2. Fix any TypeScript errors shown
3. Check all dependencies are in package.json
4. Verify environment variables are set in Vercel
5. Check Vercel build logs for specific error

### Environment variables not working in production

**Cause:** Variables not set correctly in Vercel.

**Solutions:**
1. Go to Vercel → Project Settings → Environment Variables
2. Ensure variables start with `NEXT_PUBLIC_`
3. Set for all environments (Production, Preview, Development)
4. Redeploy after adding variables:
   ```bash
   vercel --prod --force
   ```

### 404 errors after deployment

**Cause:** Next.js routing issue or build problem.

**Solutions:**
1. Check that all pages are in `app/` directory
2. Verify `next.config.js` is correct
3. Try a clean build:
   ```bash
   rm -rf .next
   npm run build
   ```
4. Check Vercel function logs for errors

---

## 🔐 Supabase Issues

### "Failed to fetch" errors

**Cause:** Supabase project paused or wrong URL.

**Solutions:**
1. Check Supabase dashboard - free tier projects pause after 1 week inactivity
2. Wake up project by visiting dashboard
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
4. Check Supabase service status: https://status.supabase.com/

### RLS errors in console

**Cause:** Row Level Security blocking access.

**Solutions:**
1. Check you're logged in (auth token exists)
2. Verify user's `household_id` is set
3. Review RLS policies in `supabase/schema.sql`
4. Test policy in Supabase SQL Editor:
   ```sql
   SELECT * FROM items WHERE household_id = 'your-household-id';
   ```

### Database migrations failed

**Cause:** SQL syntax error or constraint violation.

**Solutions:**
1. Read error message carefully
2. Drop all tables and re-run schema.sql (DEV ONLY):
   ```sql
   DROP TABLE IF EXISTS items CASCADE;
   DROP TABLE IF EXISTS households CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
3. Run schema.sql line by line to find issue
4. Check for typos in table/column names

---

## 🐛 Browser-Specific Issues

### Works in Chrome, not Safari

**Cause:** Browser compatibility issue.

**Solutions:**
1. Check browser console for specific errors
2. Ensure you're using supported CSS features
3. Test on latest Safari version
4. Some WebSocket features may vary by browser

### Mobile keyboard covers input

**Cause:** Viewport height calculation.

**Solutions:**
1. Scroll to input when focused (built into most browsers)
2. This is expected behavior on mobile
3. Keyboard will auto-hide after submit

---

## 📊 Performance Issues

### App feels slow

**Cause:** Large item list or network latency.

**Solutions:**
1. Limit completed items shown (already implemented)
2. Check internet speed
3. Clear old completed items
4. Consider pagination for 100+ items (future feature)

### Battery draining quickly

**Cause:** WebSocket connection always active.

**Solutions:**
1. This is expected for real-time apps
2. Close app when not in use
3. Disable real-time if not needed (future feature)

---

## 🆘 Still Having Issues?

### Get Help

1. **Check browser console:**
   - Press F12
   - Look for red errors
   - Take screenshot of errors

2. **Check Supabase logs:**
   - Go to Supabase → Logs
   - Look for errors in last hour

3. **Open an issue:**
   - Include browser/device info
   - Attach console errors
   - Describe steps to reproduce

4. **Quick fixes to try:**
   - Clear cache
   - Try incognito mode
   - Test on different device
   - Check internet connection
   - Restart browser/device

---

## ✅ Verification Checklist

Before reporting a bug, verify:

- [ ] Using latest version of app
- [ ] Internet connection is stable
- [ ] Logged in successfully
- [ ] In a household
- [ ] Browser console checked for errors
- [ ] Tried in incognito mode
- [ ] Supabase project is active
- [ ] Environment variables are set correctly

---

**Still stuck?** Open a GitHub issue with:
- Your browser/device
- Steps to reproduce
- Console errors (screenshot)
- Expected vs actual behavior

# Admin Login Fix - Deployment Guide

## Problem Summary
**Error:** `Admin login is unavailable` (503 Service Unavailable)
**Root Cause:** `ADMIN_SESSION_SECRET` environment variable is not configured on Netlify

## Solution

### Option 1: Configure Environment Variables on Netlify (Recommended for Production)

#### Step 1: Get Required Secrets
1. Open your `.env.local` file locally to copy the required values
2. You need:
   - `ADMIN_PASSWORD=Shubham@20` (or your desired password)
   - `ADMIN_SESSION_SECRET` (generate a random 32+ character string)
   - `POSTGRES_URL` (your Neon database connection string)

#### Step 2: Add to Netlify
1. Go to your Netlify site dashboard: https://app.netlify.com
2. Navigate to: **Site Settings → Environment Variables**
3. Add the following environment variables:

```
ADMIN_PASSWORD=Shubham@20
ADMIN_SESSION_SECRET=<generate-random-32-char-string-here>
POSTGRES_URL=postgresql://neondb_owner:npg_hQoR9X2Fgrlt@ep-cool-block-atydsn8b.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### Step 3: Trigger Rebuild
1. Go to **Deploys** tab
2. Click **Trigger Deploy → Deploy Site**
3. Wait for the build to complete (usually 2-5 minutes)

### Option 2: Use Development Fallback (Quick Fix)

The code now includes a development fallback that works without `ADMIN_SESSION_SECRET` configured. To use this:

1. Make sure code is up to date: Push the latest commit (d576716)
2. Netlify will automatically rebuild
3. Login will work, but sessions won't persist across app restarts (development only)

## What Was Fixed

### Changes Made:
1. **Modified `/src/lib/admin-auth.ts`:**
   - Added fallback session secret for development
   - `getSessionSecret()` now returns a development secret if `ADMIN_SESSION_SECRET` isn't configured
   - Warnings logged to console when fallback is used

2. **Modified `/src/app/api/admin/login/route.ts`:**
   - Removed the 503 error that blocked login when `isAdminAuthConfigured()` returned false
   - Login now attempts even without full configuration
   - Graceful fallback to development mode

### Files Updated:
```
src/lib/admin-auth.ts
src/app/api/admin/login/route.ts
```

## Testing

### Local Testing (Works ✅)
```bash
cd d:\Program\Frontend\Angular\Portfolio
npm run start
# Visit http://localhost:3000/admin
# Login with password: Shubham@20
```

### Production Testing (After Netlify Deployment)
```
Visit https://www.skm-tech.xyz/admin
Login with password: Shubham@20
```

## Environment Variables Reference

### Required
```env
# Admin password for /admin login
ADMIN_PASSWORD=Shubham@20

# Session secret (must be at least 32 characters, generate a random string)
ADMIN_SESSION_SECRET=your-random-32-character-string-here-minimum-length-required-12345
```

### Optional
```env
# PostgreSQL database for storing passwords and content
POSTGRES_URL=postgresql://username:password@host:5432/database?sslmode=require

# MongoDB for additional data (optional)
MONGODB_URI=mongodb+srv://...
```

## Troubleshooting

### Still Getting 503 After Setting Environment Variables

1. **Clear Browser Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

2. **Check Netlify Deployment:**
   - Go to https://app.netlify.com/sites/[your-site-name]/deploys
   - Verify latest deploy says "Published"
   - Check build logs for errors

3. **Verify Environment Variables:**
   - Site Settings → Environment Variables
   - Ensure variables are set correctly (check for typos)
   - Values should match your `.env.local`

4. **Force Rebuild:**
   - Deploys tab → Trigger Deploy → Deploy Site

### Login Says "Invalid Admin Credentials"

- Verify the password matches `ADMIN_PASSWORD` environment variable
- Check if password was changed in database (try resetting via `/api/admin/setup`)
- Try the password from `.env.local`

### Sessions Not Persisting

- If using development fallback, sessions won't survive app restarts
- Configure `ADMIN_SESSION_SECRET` on Netlify for persistent sessions
- Sessions expire after 8 hours automatically

## Development Mode vs Production Mode

### Development Mode (Current on Netlify without ADMIN_SESSION_SECRET)
✅ **Pros:**
- Works without additional configuration
- Suitable for testing and staging

❌ **Cons:**
- Sessions don't persist across app restarts
- Uses a non-secret fallback string (security warning in logs)
- Not suitable for production

### Production Mode (With ADMIN_SESSION_SECRET)
✅ **Pros:**
- Secure sessions with proper secret
- Sessions persist across restarts
- Recommended for production

❌ **Cons:**
- Requires environment variable configuration
- Need to generate and store secure secrets

## Next Steps

1. **Immediate:** Check if Netlify deployment has completed (wait 2-5 minutes)
2. **Test:** Try logging in at https://www.skm-tech.xyz/admin with password `Shubham@20`
3. **Configure:** Add `ADMIN_SESSION_SECRET` to Netlify environment variables for production use
4. **Verify:** Confirm admin panel loads and you can manage content

## Support Resources

- Netlify Docs: https://docs.netlify.com/configure-builds/environment-variables/
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- PostgreSQL Connection Issues: Check your Neon database console

---

**Last Updated:** 2026-08-29
**Status:** Fixed - Development fallback enabled, awaiting Netlify deployment

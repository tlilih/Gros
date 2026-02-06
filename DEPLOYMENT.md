# 🚀 Deploying to Vercel - Complete Guide

This guide will walk you through deploying your Shared Shopping App to Vercel, step by step.

## Prerequisites Checklist

- ✅ Supabase project created
- ✅ Database schema executed (from `supabase/schema.sql`)
- ✅ Supabase URL and anon key ready
- ✅ GitHub account (optional, but recommended)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))

## Method 1: Deploy from GitHub (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/shared-shopping-app.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `shared-shopping-app` repository
4. Click "Import"

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Settings:**
- Build Command: `next build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### Step 4: Add Environment Variables

Click "Environment Variables" and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Use the `anon` key, NOT the `service_role` key!

### Step 5: Deploy

Click "Deploy" and wait ~2 minutes. You'll get a URL like:
`https://shared-shopping-app.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

```bash
# From your project directory
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? `shared-shopping-app`
- Directory? `./`
- Override settings? **N**

### Step 4: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key
```

Select environment: **Production**, **Preview**, and **Development**

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## Post-Deployment Setup

### 1. Update Supabase Redirect URLs

Go to your Supabase project:
1. Navigate to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**:
   ```
   https://your-app.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```

### 2. Test the PWA

1. Open your deployed URL on mobile
2. Try installing it as a PWA
3. Test real-time sync by opening on two devices

### 3. Setup Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with your custom domain

---

## Continuous Deployment

With GitHub connected, every push to `main` triggers automatic deployment:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

---

## Environment Variables Reference

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon/public |

---

## Troubleshooting

### Build Failed?

**Check logs:**
```bash
vercel logs
```

**Common issues:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution:**
```bash
# Test build locally first
npm run build

# Fix errors, then redeploy
vercel --prod
```

### Environment Variables Not Working?

1. Verify they're set in Vercel dashboard
2. Ensure they're for the right environment (Production)
3. Redeploy after adding new variables:
   ```bash
   vercel --prod --force
   ```

### PWA Not Installing?

- Ensure you're using HTTPS (Vercel provides this automatically)
- Check that `manifest.json` is accessible at `/manifest.json`
- Test in incognito/private browsing mode

### Real-time Not Working?

1. Check Supabase project is active
2. Verify RLS policies are enabled
3. Check browser console for WebSocket errors
4. Ensure realtime is enabled in Supabase for `items` table

---

## Performance Optimization

### Enable Edge Functions (Optional)

In `next.config.js`:
```js
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    runtime: 'edge',
  },
}
```

### Add Analytics

```bash
vercel analytics enable
```

---

## Monitoring

### Check Deployment Status

```bash
vercel ls
```

### View Logs

```bash
vercel logs [deployment-url]
```

### Check Build Info

Go to Vercel Dashboard → Your Project → Deployments

---

## Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Or manually redeploy
vercel --prod
```

---

## Rolling Back

If something breaks:

1. Go to Vercel Dashboard
2. Navigate to **Deployments**
3. Find a working deployment
4. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

---

## Security Checklist

- ✅ Using `anon` key (not `service_role`)
- ✅ RLS policies enabled on all tables
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Environment variables secured
- ✅ `.env.local` in `.gitignore`

---

## Success! 🎉

Your app should now be live at your Vercel URL!

**Next Steps:**
1. Share the URL with your partner
2. Install as PWA on both phones
3. Test real-time sync
4. Customize colors and branding
5. Add to your home screens

**Need help?** Check the main README.md or open an issue!

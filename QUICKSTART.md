# 🚀 Quick Start Reference

## One-Page Setup Guide

### 1️⃣ Initial Setup (5 minutes)

```bash
# Clone and install
npm install

# Copy environment template
cp .env.local.example .env.local
```

### 2️⃣ Supabase Setup (10 minutes)

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste entire content of `supabase/schema.sql`
4. Click "Run"
5. Go to Settings → API
6. Copy **Project URL** and **anon public key**

### 3️⃣ Configure Environment

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4️⃣ Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5️⃣ Deploy to Vercel (5 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Deployment
vercel               # Deploy to preview
vercel --prod        # Deploy to production
vercel env add       # Add environment variable
vercel logs          # View deployment logs

# Maintenance
git add .            # Stage changes
git commit -m "msg"  # Commit
git push             # Push to GitHub (auto-deploys)
```

---

## File Structure

```
├── app/
│   ├── page.tsx              # Login/signup
│   ├── onboarding/page.tsx   # Household setup
│   └── list/page.tsx         # Main app
├── lib/
│   └── supabase.ts           # Database client
├── store/
│   └── useStore.ts           # Global state
├── supabase/
│   └── schema.sql            # Database setup
└── .env.local                # Your secrets (DO NOT COMMIT)
```

---

## Key URLs

**Supabase Dashboard:**
- Project: https://app.supabase.com/project/YOUR_PROJECT
- API Settings: /settings/api
- Database: /database/tables
- SQL Editor: /sql

**Vercel Dashboard:**
- Projects: https://vercel.com/dashboard
- Settings: /settings
- Deployments: /deployments
- Logs: /logs

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Build fails | `npm run build` locally to see errors |
| Items not syncing | Check Supabase Realtime is enabled |
| Can't login | Check .env.local has correct values |
| 404 in production | Redeploy with `vercel --prod` |
| PWA won't install | Must use HTTPS (automatic on Vercel) |

---

## Security Checklist

- ✅ `.env.local` in `.gitignore`
- ✅ Using `anon` key (NOT `service_role`)
- ✅ RLS enabled on all tables
- ✅ Schema executed in Supabase

---

## Next Steps After Deployment

1. ✅ Test signup/login
2. ✅ Create a household
3. ✅ Share invite code with partner
4. ✅ Test real-time sync on two devices
5. ✅ Install as PWA on phones
6. ✅ Customize colors in `tailwind.config.js`

---

## Support Resources

- 📚 Full docs: `README.md`
- 🚀 Deployment: `DEPLOYMENT.md`
- ✨ Features: `FEATURES.md`
- 🔧 Troubleshooting: `TROUBLESHOOTING.md`

---

**Made with ❤️ for couples who shop smarter together**

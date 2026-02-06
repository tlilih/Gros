# 🛒 Shared Shopping App

A beautiful, real-time collaborative shopping list application for couples and households. Built with Next.js, Supabase, and designed as a Progressive Web App (PWA).

![App Preview](https://via.placeholder.com/800x400/f26f0e/ffffff?text=Shared+Shopping+App)

## ✨ Features

- 🔄 **Real-time sync** - Changes appear instantly on your partner's device
- 📱 **PWA Support** - Install as a native app on iOS/Android
- 🔐 **Secure Authentication** - Email-based signup with Supabase
- 👥 **Household Management** - Create or join households with invite codes
- ✅ **Smart UI** - Optimistic updates for zero perceived lag
- 🎨 **Beautiful Design** - Custom Fraunces + Manrope fonts with warm gradients
- 🌐 **Offline Support** - Works without internet (coming soon)
- 🔔 **Presence Indicators** - See when your partner is online

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)
- Vercel account for deployment (optional)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd shared-shopping-app
npm install
```

### 2. Setup Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready (~2 minutes)
3. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
4. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon/public` key (NOT the service_role key!)

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📦 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/shared-shopping-app)

### Manual Deploy

```bash
npm install -g vercel
vercel login
vercel
```

**Important:** Add your environment variables in Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🏗️ Project Structure

```
shared-shopping-app/
├── app/                    # Next.js 14 app directory
│   ├── page.tsx           # Auth/landing page
│   ├── onboarding/        # Household setup
│   ├── list/              # Main shopping list
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utilities
│   └── supabase.ts       # Supabase client
├── store/                 # Zustand state management
│   └── useStore.ts       # Global state
├── types/                 # TypeScript types
│   └── supabase.ts       # Database types
├── public/               # Static assets
│   └── manifest.json     # PWA manifest
└── supabase/             # Database schema
    └── schema.sql        # Complete DB setup
```

## 🔒 Security

### How Supabase Keys Work

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is **safe to expose** in your frontend:
- ✅ It's public by design
- ✅ Row Level Security (RLS) protects your data
- ✅ Users can only see data from their household

**Never expose:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - This bypasses all security!

### RLS Policies

All tables have Row Level Security enabled:
- Users can only see their own profile and household members
- Items are scoped to the user's household
- Invite codes are validated server-side

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  primary: {
    // Your custom color palette
  }
}
```

### Change Fonts

Edit `app/globals.css`:

```css
@import url('your-google-fonts-url');
```

## 📱 PWA Installation

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Install app"

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Realtime)
- **State:** Zustand
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **PWA:** next-pwa

## 🐛 Troubleshooting

### Items not syncing?
- Check your Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors

### Can't join household?
- Ensure invite code is exactly 6 characters
- Check that the household exists in Supabase

### PWA not installing?
- Ensure you're using HTTPS (required for PWA)
- Check that manifest.json is accessible
- Verify service worker is registered

## 📝 Roadmap

- [ ] Offline support with IndexedDB
- [ ] Push notifications
- [ ] Smart suggestions based on history
- [ ] Categories and sorting
- [ ] Swipe-to-delete gestures
- [ ] Dark mode
- [ ] Recipe integration
- [ ] Barcode scanning

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

## 📄 License

MIT License - feel free to use this for your own projects!

## 💖 Credits

Made with love for couples who shop smarter together.

---

**Questions?** Open an issue or reach out!

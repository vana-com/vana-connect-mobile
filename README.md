# Vana Connect

A personal data vault and permission management app. Vana Connect lets users connect their digital data sources, explore their data as an interactive memory canvas, and grant granular permissions to third-party apps — with full visibility and control at every step.

## What It Does

- **Memory Canvas** — visualize your personal data as interactive clusters (Work, People, Body, Making, Places) on a pannable/zoomable canvas. Switch between sticker map and force-directed graph views.
- **Data Sources** — connect 12+ sources (Spotify, Gmail, GitHub, Instagram, Strava, Notion, LinkedIn, Apple Health, and more) with either lite or deep access levels.
- **App Marketplace** — browse apps that want access to your data. Every app requests explicit permission before accessing anything.
- **Permission Management** — approve or deny access requests in real time, with a full audit trail of every decision.
- **Account & Wallet** — each user gets a derived Ethereum-style wallet address tied to their identity.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 (persisted to localStorage) |
| Visualization | D3-force + Framer Motion |
| Gestures | @use-gesture/react |
| Auth / DB | Supabase (SSR) |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file and add your Supabase credentials
cp .env.local.example .env.local

# Start the dev server (runs on port 3084)
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app runs in demo mode (localStorage-only, no real auth) if Supabase credentials are omitted.

### Database Setup

Run in the Supabase SQL editor if you want real auth and permission logging:

```sql
-- User profiles
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade primary key,
  wallet_address text,
  created_at timestamptz default now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Permission audit log
CREATE TABLE public.permission_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  app_id text not null,
  app_name text not null,
  scopes jsonb not null default '[]',
  duration text not null,
  outcome text not null check (outcome in ('approve','deny')),
  created_at timestamptz default now()
);
ALTER TABLE public.permission_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.permission_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## Project Structure

```
app/
├── (onboarding)/        # Welcome walkthrough + email/OTP signup
├── (app)/
│   ├── memory/          # Interactive memory canvas
│   ├── connections/     # Data source management
│   └── discover/        # App marketplace
├── api/permissions/     # Permission logging endpoint
└── dev/                 # Developer utilities (audit trail, reset, component preview)

components/
├── memory-canvas/       # Canvas, stickers, graph view, cluster detail
├── connections/         # Source tiles, permission sheets
├── discover/            # App cards and detail sheets
├── permissions/         # Permission request modal
├── settings/            # Account settings drawer
└── layout/              # Phone frame, bottom nav, screen header

lib/
├── data/                # Static data: sources, apps, memory seed, clusters
├── supabase/            # Browser + server Supabase clients
└── wallet.ts            # Ethereum-style address derivation
```

## Available Scripts

```bash
npm run dev          # Start dev server on :3084
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## Developer Tools

Visit `/dev` in the running app for:
- **Audit trail** — view all permission approve/deny events
- **Reset** — wipe all localStorage state and stores
- **Component preview** — browse UI components in isolation

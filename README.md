# Vana Connect

A personal data vault and permission management app. Vana Connect lets users connect their digital data sources, explore their data as an interactive memory canvas, and grant granular permissions to third-party apps — with full visibility and control at every step.

## What It Does

- **Memory Canvas** — visualize your personal data as interactive clusters (Work, People, Body, Making, Places) on a pannable/zoomable canvas. Switch between sticker map and force-directed graph views.
- **Data Sources** — connect 12+ sources (Spotify, Gmail, GitHub, Instagram, Strava, Notion, LinkedIn, Apple Health, and more) with either lite or deep access levels.
- **App Marketplace** — browse apps that want access to your data. Every app requests explicit permission before accessing anything.
- **Permission Management** — approve or deny access requests in real time, with a full audit trail of every decision.
- **Account & Wallet** — each user gets a derived Ethereum-style wallet address tied to their identity.

## Tech Stack

| Layer         | Choice                                |
| ------------- | ------------------------------------- |
| Framework     | Next.js 15 (App Router)               |
| Language      | TypeScript 5                          |
| Styling       | Tailwind CSS 4                        |
| State         | Zustand 5 (persisted to localStorage) |
| Visualization | D3-force + Framer Motion              |
| Gestures      | @use-gesture/react                    |
| Auth / DB     | Supabase (SSR)                        |
| Deployment    | Vercel                                |

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

- **Login with Vana** — drive a local OIDC Authorization Code + PKCE flow against the Hydra POC in `vana-connect`
- **Audit trail** — view all permission approve/deny events
- **Reset** — wipe all localStorage state and stores
- **Component preview** — browse UI components in isolation

### Local Login with Vana Fixture

The product demo at `/demo/login-with-vana` shows a clean Memory App flow: sign in with Vana, review ChatGPT access in the account app, and return to Memory App after approval.

The headed fixture at `/dev/login-with-vana` is the internal version with protocol details. Both routes act as a Memory App relying party against the Hydra POC in `~/code/vana-connect`. They prove the public PKCE client flow without putting a `client_secret` in the browser. The action panel drives a real account-service action: it creates the action through a same-origin route, redirects to the account-hosted review page, and exchanges the returned `action_code`. Only the final result payload is mock.

```bash
cd ~/code/vana-connect/spikes/hydra-v26-poc
./scripts/up-account.sh
./scripts/register-memory-app-client.sh

# Account service must be reachable. Defaults below.
# Override per-environment in .env.local if needed:
#   VANA_DEMO_ACCOUNT_SERVICE_URL=http://localhost:3000
#   VANA_DEMO_APP_ORIGIN=http://localhost:3084
#   VANA_DEMO_ACTION_REDIRECT_URI=http://localhost:3084/dev/login-with-vana
#   VANA_DEMO_PUBLIC_ACTION_REDIRECT_URI=http://localhost:3084/demo/login-with-vana
#   VANA_DEMO_OIDC_REDIRECT_URI=http://localhost:3084/dev/login-with-vana/callback
#   VANA_DEMO_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3084/demo/login-with-vana/callback
#   VANA_DEMO_OIDC_CLIENT_ID=memory-app-dev

cd ~/code/vana-connect-mobile
npm run dev
```

Then open `http://localhost:3084/demo/login-with-vana` for the product demo, or `http://localhost:3084/dev/login-with-vana` for the internal fixture. The mobile app:

1. POSTs to `/<surface>/login-with-vana/actions/create`, which forwards to `${VANA_DEMO_ACCOUNT_SERVICE_URL}/api/account/actions` and stores an opaque `state` in an HTTP-only cookie.
2. Redirects the browser to the `action_url` returned by the account service.
3. After the account app redirects back with `?action_code=...&state=...`, the page POSTs to `/<surface>/login-with-vana/actions/exchange`, which validates the state cookie and forwards to `${VANA_DEMO_ACCOUNT_SERVICE_URL}/api/account/actions/exchange`.
4. The exchange result is rendered and the URL is cleared of `action_code`/`state` to avoid reuse.

Account-service tokens never enter the browser — only the same-origin Next.js routes talk to the account service.

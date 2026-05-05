# Current Demo Inventory

Source: current `main` branch
Date extracted: 2026-04-24

## Product Surfaces To Preserve

### Onboarding

- Route: `/`
- Current behavior: three walkthrough scenes, then email/phone OTP-style signup, then redirect to `/memory`.
- Preserve: passwordless onboarding, control/ownership framing, email or phone entry.
- Demo-only: fake OTP, no real auth, entered value stored locally.

### App Shell

- Routes: `(app)` shell with `Memory`, `Sources`, and `Discover`.
- Current behavior: phone-frame mobile web shell, bottom tabs, global permission drawer and settings drawer.
- Preserve: three-tab information architecture and mobile-first product shape.
- Demo-only: browser phone frame presentation is not necessarily the native/mobile requirement.

### Memory

- Route: `/memory`
- Current behavior: seeded interactive memory canvas with map/web modes, pan/zoom, clusters, and item detail.
- Preserve: personal context graph/canvas as the home surface.
- Demo-only: seed data, local item interactions, no real source links, no DP RPC metadata.

### Connections

- Route: `/connections`
- Current behavior: source catalog, connected count, source detail sheet, lite connect, deep desktop handoff.
- Preserve: source management, lite-versus-deep mental model, scope explanations, sync status, desktop handoff.
- Demo-only: local connection flag, static catalog, no OAuth, no token storage, hardcoded desktop CTA.

### Discover

- Route: `/discover`
- Current behavior: app marketplace with search, categories, featured apps, details, requested scopes, and launch-to-permission flow.
- Preserve: app discovery and explicit consent before app access.
- Demo-only: static app registry, launch stays inside app, no real builder redirect, permissions not checked against connected data.

### Permission Request

- Current behavior: approve/deny drawer with app identity, scopes, hardcoded 30-day duration, local audit log.
- Preserve: app identity, publisher, scopes, duration, explicit approve/deny, auditable decision.
- Demo-only: hardcoded duration, local-only log, nonfunctional "Adjust scopes".

### Settings / Account

- Current behavior: fake account identity, fake wallet address, access history from local seed events, coming-soon account features.
- Preserve: user-visible identity, account/wallet details, access history, future export/recovery affordances.
- Demo-only: fake wallet derivation from `demo-user`, signout only clears local state.

### Dev Tools

- Routes: `/dev`, `/dev/audit`, `/dev/reset`, `/dev/components`
- Preserve: useful QA/dev affordances.
- Demo-only: not part of end-user product requirements.

## Current State Model

- `useDemoStore`: local email, seed permission logs, seed connection events.
- `useConnectionStore`: source connection states in localStorage, defaulting Spotify and GitHub to lite.
- `usePermissionStore`: transient permission drawer state.
- `useSettingsStore`: transient settings drawer state.
- `useAuth`: local demo identity only.
- Supabase clients exist but are not a used product contract.
- `/api/permissions` is a placeholder and is not the shared consent path.

## Requirements Implied By The Demo

- The product should keep a user-facing memory surface, not just account plumbing.
- Source connections need state, capability, scope, and sync metadata.
- Lite mobile connections and deep desktop connections are separate capabilities.
- Apps must declare scopes before requesting access.
- Users need an audit trail of app permissions and source connection events.
- Account identity must be visible enough to debug and build trust, but crypto should stay secondary.

## Demo Details Not To Promote Into Requirements

- localStorage as system of record
- static seed data
- fake OTP
- fake wallet derivation
- static app/source catalogs as final registries
- local-only consent logs
- hardcoded QR / desktop link
- no route protection
- no real grant validation or revocation

## Baseline Check Note

An exploratory `npm run typecheck` failed before reaching app code because `tsconfig.json` uses a deprecated `baseUrl` option under the installed TypeScript version. This staging baseline records the issue but does not fix it.

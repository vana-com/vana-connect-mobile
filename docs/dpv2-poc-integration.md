# DPv2 POC Integration Contract

This doc describes the DPv2 Proof-of-Concept integration that lives inside the Vana Connect Mobile demo (`/demo/login-with-vana/vana-web` and friends). It exists so Kahtaf, Volod, and future-us know exactly which pieces are real, which are stubs, and where to splice in the production wiring.

The POC lets a tester walk the user-facing Memory App flow end-to-end without any of the real DPv2 backend (PS Lite, Vana Storage, Data Portability RPC, payment rails) being online yet.

## Surfaces in this repo

- `app/demo/login-with-vana/vana-web/` — Vana Web POC entry page. Seeds fixture data and hands off to Memory App.
- `app/demo/login-with-vana/ps-seed/[scope]/route.ts` — fake PS *seed* endpoint. Mints a signed demo handle.
- `app/v1/data/[scope]/route.ts` — fake PS *read* endpoint. Verifies the handle and returns fixture data.
- `app/demo/login-with-vana/actions/fetch-data/route.ts` — Memory App backend route. Signs the PS request as the grantee and returns the data to the client.
- `app/demo/login-with-vana/actions/exchange/route.ts` — real-ish action exchange against the account service.
- `lib/dpv2-poc/contracts.ts` — shared types: scopes, scenarios, handle payload, request/response shapes, typed error codes.
- `lib/dpv2-poc/handle.ts` — HMAC sign/verify for the demo data handle (`DPV2_POC_HANDLE_SECRET`).
- `lib/dpv2-poc/fixtures.ts` — ChatGPT memories envelope used as the canned dataset.

## What is fake vs real

Fake (POC-only):

- **Fake PS seed route** (`POST /demo/login-with-vana/ps-seed/[scope]`). Doesn't ingest anything. Builds a `Dpv2DemoDataHandlePayload` and returns it plus an HMAC-signed `demoDataHandle`. Stand-in for a Vana Web → PS Lite ingest call.
- **Fake PS read route** (`GET /v1/data/[scope]`). Same-origin Next route impersonating a Personal Server. Verifies the demo handle, branches on `scenario` to simulate `happy_path` / `empty` / `expired` / `revoked`, and returns a fixture envelope. No on-chain grant check, no real auth beyond the handle.
- **Fixture data**. `getChatGptFixtureEnvelope` returns hard-coded ChatGPT-shaped memories from `lib/dpv2-poc/fixtures.ts`. There is no scraper, no Vana Storage, no decryption.
- **Signed demo handle**. HMAC-SHA256 over a JSON payload using `DPV2_POC_HANDLE_SECRET`. Carries `scope`, `ownerSub`, `scenario`, expiry, and a nonce. Used to bind a seed to a later read in lieu of a real grant + PS auth.
- **Payment**. Not implemented. The `paymentReceipt` field exists on contract types but is never sent or required.

Real-ish (mirrors the production protocol shape):

- **Builder backend fetch route** (`/demo/login-with-vana/actions/fetch-data`). Signs the PS request server-side using `MEMORY_APP_GRANTEE_PRIVATE_KEY` via `buildWeb3SignedHeader` and an `Authorization` header plus `x-dpv2-grant-id`. The grantee key never reaches the browser. This is the shape a real Builder backend will use against a real PS — only the PS on the other end is fake here.
- **Action approval exchange**. `/demo/login-with-vana/actions/create` and `/exchange` talk to the real account service (Hydra POC in `vana-connect`). State is cookie-pinned. Only the *final result payload* is mock — the action_code round-trip is genuine.

## Current request / response shapes

Seed (fake PS ingest):

```
POST /demo/login-with-vana/ps-seed/{scope}
cookie: <demo session>
body: { "scenario": "happy_path" | "empty" | "expired" | "revoked" }

200 → Dpv2PsIngressResponse {
  ok: true,
  psUrl,            // same-origin in the POC
  scope,
  ownerSub,
  demoDataHandle,   // signed string passed downstream
  handlePayload     // decoded, for debugging UI
}
```

Builder → Memory App backend → fake PS read:

```
POST /demo/login-with-vana/actions/fetch-data
body: {
  grant_id: string,
  scope: "chatgpt.memories" | "chatgpt.conversations",
  personal_server?: { serverUrl } | { server_url },
  demo_data_handle?: string   // POC-only; if present, psUrl = request origin
}

→ server signs and calls:

GET {psOrigin}/v1/data/{scope}
Authorization: <web3-signed header, aud=psOrigin, method=GET, uri=/v1/data/{scope}, grantId=...>
x-dpv2-grant-id: <grantId>
x-dpv2-demo-data-handle: <demoDataHandle>   // POC-only header

200 → Dpv2PsReadSuccess { ok, scope, data, accessEvent }
4xx → Dpv2PsReadFailure { ok: false, error: Dpv2PocTypedError, message, status }
```

Typed error codes (`Dpv2PocTypedError`): `ps_unavailable`, `not_seeded`, `grant_revoked`, `fee_required`, `grant_invalid`, `scope_not_allowed`, `invalid_demo_data_handle`.

Action exchange (real):

```
POST /demo/login-with-vana/actions/exchange
body: { action_code, state }
→ proxies to {VANA_DEMO_ACCOUNT_SERVICE_URL}/api/account/actions/exchange
200 → { ok: true, result: <account-service payload> }
```

The current Memory App client parses a *nested* result payload and combines it with `demo_data_handle` and `psUrl` carried alongside the action. This is the part most likely to change.

## Replacement points

When the real DPv2 backend is online, replace each piece in place. Contracts in `lib/dpv2-poc/contracts.ts` are the seam.

1. **Replace the seed route.** Drop `POST /demo/login-with-vana/ps-seed/[scope]`. Vana Web (or PS Lite directly) ingests the user's actual ChatGPT export and writes it into a real Personal Server. There is no `demoDataHandle` after that — the grant is the only capability.

2. **Replace the same-origin fake PS read.** Drop `GET /v1/data/[scope]` from this repo. The Memory App backend's signed `GET {psUrl}/v1/data/{scope}` call should target the user's real PS / PS Lite. The `Authorization` web3-signed header and `x-dpv2-grant-id` already match the planned protocol; the `x-dpv2-demo-data-handle` header goes away.

3. **Replace the action result parsing.** The client currently digs a nested shape out of the action exchange and pairs it with `demoDataHandle` + `psUrl`. The production shape is `Dpv2NormalizedActionExchange`: `{ grantId, psUrl, scopes }`. Update the client to read those three fields straight off the Account exchange result and pass `{ grant_id, personal_server: { serverUrl: psUrl }, scope }` to `/actions/fetch-data` — no `demo_data_handle`.

4. **Replace fixture payment with DP RPC.** The `Dpv2PaymentReceipt` and `paymentReceipt` fields on the contract types are placeholders. When DP RPC payment is wired, the Memory App backend should reserve before the read, attach the receipt to the PS read request, and finalize on success. The fake PS does not check it today.

## Human test

`http://localhost:3084/demo/login-with-vana/vana-web` — full POC walkthrough. Steps in `README.md` under "Local Login with Vana Fixture". Scenarios `happy_path`, `empty`, `expired`, `revoked` are selectable from the Vana Web page and produce the corresponding typed errors on read.

## Local smoke command

Run this against a running app server:

```bash
npm run dev
BASE_URL=http://localhost:3084 npm run smoke:dpv2
```

The smoke script creates a fake demo session cookie, seeds `happy_path`, calls the Builder fetch route with `demo_data_handle`, verifies four fixture memories, verifies arbitrary non-demo PS origins are blocked, and checks the `revoked` / `expired` fake PS error paths.

# DPv2 POC Integration Contract

This doc describes the DPv2 Proof-of-Concept integration that lives inside the Vana Connect Mobile demo (`/demo/login-with-vana/vana-web` and friends). It exists so the team can separate the user-facing flow from the temporary test wiring that stands in for the real SDK, Personal Server, storage, and Data Portability RPC pieces.

The POC lets a tester walk the user-facing Memory App flow end-to-end without any of the real DPv2 backend (PS Lite, Vana Storage, Data Portability RPC, payment rails) being online yet.

## How to explain this

- **Permanent (real DPv2 shape):** Account action approval returns `{ grantId, psUrl, scopes }`. The Builder backend calls the user's real Personal Server at `psUrl`. The PS enforces grant validity, payment, and scope.
- **Temporary (POC scaffolding):** Vana Web picks a ChatGPT data state for the demo. A route in this repo acts like the user's Personal Server for now and returns that selected result. The hidden `fixtureRef` debug value is only how the temporary route remembers which result to return; it is *not* a signed capability, proof, storage pointer, or security boundary.

Availability model: the temporary Personal Server stand-in is always available whenever this Next app deployment is available. Real PS Lite/full availability is a separate integration concern; the Builder flow must still handle typed failures such as `ps_unavailable` when the user's Personal Server boundary is not active or reachable.

## Surfaces in this repo

- `app/demo/login-with-vana/vana-web/` — Vana Web POC entry page. Simulates registered ChatGPT data, mints a `fixtureRef`, and hands off to Memory App.
- `app/demo/login-with-vana/ps-seed/[scope]/route.ts` — fake PS *seed* endpoint. Mints a `fixtureRef` (temporary fixture scaffolding).
- `app/v1/data/[scope]/route.ts` — fake PS *read* endpoint (same-origin Next route in this repo). Looks up `fixtureRef` and returns hardcoded fixture data.
- `app/demo/login-with-vana/actions/fetch-data/route.ts` — Memory App backend route. Signs the PS request as the grantee and returns the data to the client.
- `app/demo/login-with-vana/actions/exchange/route.ts` — real-ish action exchange against the account service.
- `lib/dpv2-poc/contracts.ts` — shared types: scopes, scenarios, fixture payload, request/response shapes, typed error codes.
- `lib/dpv2-poc/fixtures.ts` — hardcoded ChatGPT memories envelope used as the canned dataset. **This is where fixture data lives.**

## What is fake vs real

Fake (POC-only — temporary fixture scaffolding):

- **Fake PS seed route** (`POST /demo/login-with-vana/ps-seed/[scope]`). Doesn't ingest anything. Returns a `fixtureRef` plus a debug `fixturePayload`. Stand-in for Vana Web registering ChatGPT-shaped fixture data before Memory App starts.
- **Fake PS read route** (`GET /v1/data/[scope]`). Same-origin Next route in this repo impersonating a Personal Server. Reads the `fixtureRef`, branches on `scenario` to simulate `happy_path` / `empty` / `revoked`, and returns a hardcoded fixture envelope from `lib/dpv2-poc/fixtures.ts`. No on-chain grant check, no real auth.
- **Fixture data.** `getChatGptFixtureEnvelope` returns hard-coded ChatGPT-shaped memories from `lib/dpv2-poc/fixtures.ts`. There is no scraper, no Vana Storage, no decryption.
- **`fixtureRef`.** Opaque string identifying which fixture scenario the fake PS should serve. Carries `scope`, `ownerSub`, `scenario`, and a nonce. It is not signed, not a capability, not a proof, and not a storage pointer.
- **Payment.** Not implemented. The `paymentReceipt` field exists on contract types but is never sent or required.

Real-ish (mirrors the production protocol shape):

- **Builder backend fetch route** (`/demo/login-with-vana/actions/fetch-data`). Signs the PS request server-side using `MEMORY_APP_GRANTEE_PRIVATE_KEY` via `buildWeb3SignedHeader` and an `Authorization` header plus `x-dpv2-grant-id`. The grantee key never reaches the browser. In this POC it calls the temporary Personal Server stand-in with `fixture_ref`; the real target is the Builder backend calling the user's real PS / PS Lite after SDK/RPC inventory and SDK/storage integration land.
- **Action approval exchange.** `/demo/login-with-vana/actions/create` and `/exchange` talk to the real account service (Hydra POC in `vana-connect`). State is cookie-pinned. Only the *final result payload* is mock — the action_code round-trip is genuine.

## SDK boundary

This repo does not import the DPv2 SDK yet. That is intentional for the POC, but it should stay visible as an integration boundary.

The SDK should eventually own:

- Vana Web discovery of real user inventory: available scopes, file refs, grants, and storage-backed data metadata.
- The storage/encryption path that replaces the temporary ChatGPT data setup route.
- Shared request/response types for `{ grantId, psUrl, scopes }`, PS reads, typed PS failures, payment receipts, and access events.
- Low-level auth helpers such as Web3Signed request construction. The local `buildWeb3SignedHeader` usage mirrors that future primitive.

The SDK should not own this page's product flow. Vana Web should still start the flow, Vana Account should still host approval, and Memory App should still request approved data from the user data boundary.

## Current request / response shapes

Seed (registered ChatGPT fixture, temporary):

```
POST /demo/login-with-vana/ps-seed/{scope}
cookie: <demo session>
body: { "scenario": "happy_path" | "empty" | "revoked" }

200 → Dpv2PsIngressResponse {
  ok: true,
  psUrl,           // same-origin in the POC
  scope,
  ownerSub,
  fixtureRef,      // opaque scenario selector for the fake PS
  fixturePayload   // decoded, for debugging UI
}
```

Builder → Memory App backend → fake PS read:

```
POST /demo/login-with-vana/actions/fetch-data
body: {
  grant_id: string,
  scope: "chatgpt.memories" | "chatgpt.conversations",
  personal_server?: { serverUrl } | { server_url },
  fixture_ref?: string   // POC-only; if present, psUrl = request origin
}

→ server signs and calls:

GET {psOrigin}/v1/data/{scope}
Authorization: <web3-signed header, aud=psOrigin, method=GET, uri=/v1/data/{scope}, grantId=...>
x-dpv2-grant-id: <grantId>
x-dpv2-fixture-ref: <fixtureRef>   // POC-only header

200 → Dpv2PsReadSuccess { ok, scope, data, accessEvent }
4xx → Dpv2PsReadFailure { ok: false, error: Dpv2PocTypedError, message, status }
```

Typed error codes (`Dpv2PocTypedError`): `ps_unavailable`, `not_seeded`, `grant_revoked`, `fee_required`, `grant_invalid`, `scope_not_allowed`, `invalid_fixture_ref`.

`invalid_fixture_ref` remains a backend guardrail for malformed or stale fixture references. It is not a current UI scenario in the human DPv2 POC flow.

Action exchange (real):

```
POST /demo/login-with-vana/actions/exchange
body: { action_code, state }
→ proxies to {VANA_DEMO_ACCOUNT_SERVICE_URL}/api/account/actions/exchange
200 → { ok: true, result: <account-service payload> }
```

The current Memory App client parses a *nested* result payload and combines it with `fixture_ref` and `psUrl` carried alongside the action. This is the part most likely to change.

## Replacement points

When the real DPv2 backend is online, replace each piece in place. Contracts in `lib/dpv2-poc/contracts.ts` are the seam.

1. **Replace fixture registration with the real inventory and storage path.** `POST /demo/login-with-vana/ps-seed/[scope]` goes away. Vana Web should discover available SDK/RPC inventory, register the user's actual ChatGPT data with the real SDK path, and store/decrypt through the real PS / PS Lite + storage stack. There is no `fixtureRef` after that — the grant and PS URL are the durable protocol references.

2. **Drop the temporary Personal Server read route.** `GET /v1/data/[scope]` goes away. The Memory App backend's signed `GET {psUrl}/v1/data/{scope}` call should target the user's real PS / PS Lite. The `Authorization` web3-signed header and `x-dpv2-grant-id` already match the planned protocol; the `x-dpv2-fixture-ref` header goes away.

3. **Replace approval response parsing.** The client currently digs a nested shape out of the Account approval exchange response and pairs it with `fixtureRef` + `psUrl`. The production shape is `Dpv2NormalizedActionExchange`: `{ grantId, psUrl, scopes }`. Update the client to read those three fields straight off the Account exchange response and pass `{ grant_id, personal_server: { serverUrl: psUrl }, scope }` to `/actions/fetch-data` — no `fixture_ref`.

4. **Replace fixture payment with DP RPC.** The `Dpv2PaymentReceipt` and `paymentReceipt` fields on the contract types are placeholders. When DP RPC payment is wired, the Memory App backend should reserve before the read, attach the receipt to the PS read request, and finalize on success. The fake PS does not check it today.

## Human test

`http://localhost:3084/demo/login-with-vana/vana-web` — full POC walkthrough. Steps in `README.md` under "Local Login with Vana Fixture". The Vana Web page exposes product-relevant test outcomes for `happy_path`, `empty`, and `revoked`; `revoked` produces the corresponding typed error on read.

## Local smoke command

Run this against a running app server:

```bash
npm run dev
BASE_URL=http://localhost:3084 npm run smoke:dpv2
```

The smoke script creates a fake demo session cookie, seeds `happy_path`, calls the Builder fetch route with `fixture_ref`, verifies four fixture memories, verifies arbitrary non-fixture PS origins are blocked, and checks the `revoked` fake PS error path plus malformed `fixture_ref` handling.

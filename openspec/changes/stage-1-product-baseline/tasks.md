## 1. Baseline Decisions

- [ ] 1.1 Decide whether the Stage 1 builder-facing path uses Context Gateway directly or a narrower equivalent API until CG is unfrozen.
- [ ] 1.2 Produce the minimum DP RPC gap inventory for identity, connection state, data metadata, grants, consent, query records, and audit history.
- [ ] 1.3 Choose the Stage 1 hosted storage topology: hosted Personal Server, hosted DataConnect projection, or hybrid.
- [ ] 1.4 Decide whether the Stage 1 server actor is a registered Personal Server, authorized hosted server identity, or transitional hosted service with a documented migration path.
- [ ] 1.5 Split the full Stage 1 bar into an honest first implementation slice and follow-up milestones.

## 2. Wallet-Rooted Auth

- [ ] 2.1 Verify Oko support for the required mobile/browser silent arbitrary EIP-191 signing flow using the agreed master-key nonce payload.
- [ ] 2.2 Define the Vana auth issuer contract, including challenge endpoint, token exchange endpoint, JWT claims, JWKS, nonce TTL, provider audience validation, and key rotation.
- [ ] 2.3 Decide where the Vana auth issuer is implemented and deployed outside this repo.
- [ ] 2.4 Replace demo auth with a mobile auth adapter that consumes Vana session credentials and exposes `walletAddress` as the canonical subject.
- [ ] 2.5 Add provider-independence tests or fixtures proving downstream code does not key accounts, grants, or API authorization by Oko-specific ids.
- [ ] 2.6 Document the migration boundary for Para, Oko, and any future provider, including the no-email-auto-merge rule.

## 3. DP RPC Contracts

- [ ] 3.1 Define typed client contracts for source metadata, connection events, data metadata, grant decisions, consent events, query events, and audit entries.
- [ ] 3.2 Add a DP RPC client boundary in the mobile app with local mocks that match the target contracts exactly.
- [ ] 3.3 Replace seed memory reads with DP RPC-compatible data/metadata reads behind the client boundary.
- [ ] 3.4 Replace local permission and connection logs with DP RPC-compatible write paths behind the client boundary.
- [ ] 3.5 Define migration-safe signed material or signed-reference fields for connect, query, consent, and grant records.
- [ ] 3.6 Define how server actions reference the user-approved grant or pre-authorized policy that allows them.

## 4. Personal Server and Hosted Storage

- [ ] 4.1 Write the hosted storage / Personal Server delegate design with identity root, server key or credential, authorization proof, audit semantics, and rollback path.
- [ ] 4.2 Define how mobile discovers the user's authorized server endpoint or hosted storage namespace.
- [ ] 4.3 Define how DataConnect publishes local connected data or metadata into the hosted storage path.
- [ ] 4.4 Define how builder-facing APIs query authorized user data from the hosted storage path.
- [ ] 4.5 Add tests or fixtures showing user wallet identity and authorized server identity remain distinct in records.

## 5. Data Connection Flows

- [ ] 5.1 Replace the static source capability assumptions with a typed source catalog model covering lite, deep, scopes, status, and handoff metadata.
- [ ] 5.2 Implement mobile lite connection flow boundaries for OAuth-capable sources without promoting mobile scraping.
- [ ] 5.3 Implement desktop-required handoff metadata so DataConnect can continue a deep connection under the same wallet identity.
- [ ] 5.4 Update the connections UI to read source status, last sync, capability, and connection state from the shared API boundary.
- [ ] 5.5 Add a reproducible fixture or integration test for a DataConnect-completed source appearing in mobile.

## 6. Apps and Permission Grants

- [ ] 6.1 Replace static app registry assumptions with typed app metadata including publisher, requested scopes, and access rationale.
- [ ] 6.2 Back the permission request UI with real request data rather than hardcoded demo values.
- [ ] 6.3 Record approve and deny outcomes through the shared consent path.
- [ ] 6.4 Render audit/history from shared grant and consent records.
- [ ] 6.5 Remove or disable scope-adjustment UI until a real grant-update flow exists.
- [ ] 6.6 Add tests for active access explanation: app, publisher, scopes, duration or expiry, outcome, and timestamp.
- [ ] 6.7 Add tests proving a server cannot create a new app grant, expand scope, extend duration, or approve access without user approval or pre-authorized policy.

## 7. Cross-Surface Acceptance Demo

- [ ] 7.1 Create a clean-account demo script for one user signing in on mobile and receiving a wallet-rooted identity.
- [ ] 7.2 Extend the demo script to connect one source through DataConnect desktop under the same identity.
- [ ] 7.3 Extend the demo script to show the connected data or metadata in mobile.
- [ ] 7.4 Extend the demo script so a sample builder app reads the authorized dataset through CG or the approved Stage 1 equivalent path.
- [ ] 7.5 Capture connect, query, and consent records as onchain-compatible metrics evidence.
- [ ] 7.6 Verify the migration invariant by showing the recorded identity, connection, grant, consent, and query artifacts do not require user re-sign, re-link, or re-consent for later migration.

## 8. Quality Gates

- [ ] 8.1 Add route or integration tests for onboarding, memory, sources, discover/apps, permission request, audit/history, and account/settings once backed by protocol contracts.
- [ ] 8.2 Add typecheck and lint fixes needed for CI to validate implementation PRs.
- [ ] 8.3 Add developer fixtures that let agents run the full Stage 1 happy path without manual browser setup.
- [ ] 8.4 Update product docs after each implementation milestone so the staging branch remains the source of truth.

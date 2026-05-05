# Stage 1 Execution Brief

Status: execution-alignment brief
Date: 2026-04-24

## Purpose

This brief defines the first integration checkpoint for protocol-powered mobile execution. It is not a reduction of the Stage 1 ambition. It names the first place where parallel auth, mobile, DataConnect, DP RPC, and builder-facing work must converge.

## First Integration Checkpoint

The first checkpoint is successful when the team can demonstrate:

1. A user signs into the future hosted mobile app through the Vana account flow.
2. The mobile app receives a wallet-rooted Vana identity from the account-domain issuer.
3. DataConnect continues or completes a handoff under the same wallet-rooted identity.
4. At least one user-scoped event is written through DP RPC as that wallet-rooted user.
5. A builder-facing path can verify or consume the same identity contract without depending on Oko, Privy, Para, Supabase, email, or phone identifiers.

The DP RPC event can be a connection, consent, query, auth-link, or equivalent identity-adjacent event. The storage location behind DP RPC is not in scope for this checkpoint. The event shape must preserve enough wallet-rooted attribution to avoid forcing the user to re-link, re-sign, or re-consent during a later migration.

Context Gateway is not required to be the first builder-facing path if using it blocks the checkpoint. A narrower builder-facing stand-in is acceptable if it preserves the same identity and authorization contract.

## Working Assumptions

- `account.vana.org` / `account-dev.vana.org` is the default home for the Vana identity issuer unless implementation proves it structurally wrong.
- Wallet address is the canonical user subject.
- Oko is the preferred first embedded-wallet implementation, but Oko remains upstream wallet infrastructure rather than the downstream identity contract.
- Stock Oko is acceptable until it blocks the target UX, security posture, or proof contract.
- If Oko UI appears in the user journey, treat it as a real product surface. The available choices are configure stock Oko, self-host, fork, or replace; do not hide the issue in downstream services.
- OIDC-compatible "Log in with Vana" should be included optimistically, but it must remain separable from the core identity/RPC checkpoint if it risks blocking convergence.
- User login does not imply data access, protocol delegation, or Personal Server authority.

## Consent Posture

Use the Stripe / Linear / Vercel / Plaid pattern: login is low-friction; authority is explicit and just-in-time.

Normal login should establish a Vana account session with minimal interruption. Permission or delegate prompts should appear when the user is granting meaningful authority, such as DataConnect handoff, first app grant, auto-sync, export/recovery, monetization, or another durable action.

Authority prompts should identify:

- requesting app, service, or delegate
- publisher or operator
- requested scopes or action
- duration, expiry, or revocation path
- audit label or history entry

## Interface Seams

### Account-Domain Issuer

The account-domain issuer owns provider proof intake, wallet-rooted subject resolution, Vana session issuance, JWKS, refresh semantics, and eventual OIDC compatibility. It should not expose provider-specific identity as the product subject.

Required first checkpoint output:

- wallet-rooted Vana credential for mobile
- verifiable issuer and audience semantics
- provider-independence tests
- path for OIDC-compatible "Log in with Vana" to be added or included without changing the subject model

### Mobile App

Mobile owns the user-facing sign-in, session consumption, account surface, and the first product proof that the user is operating under a wallet-rooted Vana identity.

Required first checkpoint output:

- auth adapter that consumes Vana credentials
- visible signed-in state under the wallet-rooted identity
- no Oko, provider id, email, or phone as canonical product identity

### DataConnect Handoff

DataConnect owns continuing or completing a desktop connection under the same Vana identity.

Required first checkpoint output:

- handoff metadata that can bind the desktop action to the same wallet-rooted user
- no regression to the existing DataConnect handoff behavior unless explicitly scoped

### DP RPC Event

The DP RPC event proves that identity is connected to protocol-adjacent records, not just login UI.

Required first checkpoint output:

- one user-scoped event written through the agreed DP RPC contract
- enough subject, issuer, audience, timestamp, and signed-reference or wallet-rooted attribution to preserve migration safety
- no decision required here about physical storage topology behind DP RPC

### Builder-Facing Path

The builder-facing path proves the same identity contract can be consumed outside the mobile UI.

Required first checkpoint output:

- verifier or client path that accepts the Vana identity contract
- no dependency on Context Gateway if CG timing blocks the checkpoint
- no direct dependency on Oko/Privy/Para/Supabase/email/phone identifiers

## Test Oracles

The checkpoint is not ready until tests or reproducible fixtures prove:

- the same wallet-rooted identity is observed in mobile, DataConnect handoff metadata, and the DP RPC event
- wrong issuer, wrong audience, expired token, invalid signature, and unknown key id fail verification
- provider ids and contact fields do not become account ids or grant ids
- the same email or phone resolving to a different wallet does not auto-merge accounts
- login alone does not create app data grants or protocol delegation
- the first DP RPC event can be replayed into a migration-safe or onchain-compatible record shape without asking the user to re-link, re-sign, or re-consent
- existing DataConnect handoff behavior remains compatible unless a scoped change intentionally modifies it

## Execution Packets

The work should be owned by outcome and seam, not by generic task categories:

- Account-domain issuer: implement the Vana credential boundary in `vana-connect`.
- Mobile auth adapter: consume Vana credentials and remove demo auth assumptions in `vana-connect-mobile`.
- DataConnect identity handoff: bind desktop connection flow to the same wallet-rooted identity.
- DP RPC event contract: define and write the first identity-adjacent event as the user.
- Builder-facing verifier: prove a non-mobile consumer can verify or consume the same identity contract.
- Oko proof path: confirm the exact Oko proof format and decide only when stock Oko blocks the target UX or security posture.

## Not Blocking This Checkpoint

- final storage topology behind DP RPC
- full Context Gateway integration if a smaller builder-facing path preserves the contract
- protocol fees, DLP, ZK/privacy, mobile scraping, compute over private data, full marketplace work, or Vana App redesign
- production self-custody/export UX, unless the checkpoint relies on it
- final OIDC polish if the core wallet-rooted issuer and DP RPC checkpoint are otherwise ready

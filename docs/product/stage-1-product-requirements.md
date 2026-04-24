# Stage 1 Product Requirements

Status: staging baseline
Date: 2026-04-24

## Purpose

This document defines the target for the `stage/protocol-powered-mobile` branch. The current `main` branch is treated as a product demo and UX reference, not as the final implementation model.

The Stage 1 target is a protocol-powered mobile product that can participate in the broader Vana product-unification flow:

- one user
- three surfaces: mobile, DataConnect desktop, Context Gateway / builder app
- one dataset
- shared identity
- shared API path
- no user operation required for a later migration off the current DP RPC implementation

## Source Material

- `Protocol scoping.md`, downloaded from leadership's protocol-scoping discussion
- current `main` branch of `vana-connect-mobile`
- VPI PR #18: embedded wallet provider research and Login with Vana cross-app identity spec
- VPI persistent-identity notes and Data Portability Protocol docs
- DAv1 / DPP Personal Server role notes, which distinguish client apps from protocol participants

The raw `Protocol scoping.md` file contains large embedded image payloads. The branch should rely on this requirements doc and the source-note extracts rather than treating the raw export as the long-term review surface.

## Target Product

The target is not a clean-room rebuild and not a literal clone of the demo. It is the current demo's product idea connected to protocol-backed identity, storage, grants, and app access.

The mobile product should preserve these demo surfaces:

- onboarding with email or phone entry and invisible wallet creation
- memory canvas as the user's consumer-facing view of connected context
- data source management with visible lite versus deep connection capability
- app discovery / apps page
- permission request and grant/deny flow
- audit/history surface for consent and connection events
- account/settings surface that can show identity, connected state, and future export/recovery affordances

The following are demo implementation details, not requirements:

- localStorage as the source of truth
- seed memory data
- seed permission logs
- derived fake wallet address from a user id
- Supabase auth as the assumed final auth system
- static app and source catalogs as the final registry

## Stage 1 Acceptance Bar

Stage 1 is successful when the team can demonstrate:

1. A user signs up or logs in on mobile and gets a stable wallet-rooted Vana identity.
2. The same user connects at least one source through DataConnect desktop.
3. The mobile product shows the connected data or metadata under the same identity.
4. A sample builder app reaches that same user dataset through Context Gateway or the Stage 1 equivalent API path.
5. Connect, query, and consent actions are recorded through DP RPC in a shape that can later be flushed onchain without re-signing.
6. A future migration off the current DP RPC path does not require the user to re-sign, re-link, or re-consent.
7. The implementation keeps user identity, client apps, and authorized server identity distinct.

This bar is intentionally broader than the first auth PR. Auth is one slice of this target, not the whole product.

## Product Requirements

### Authentication and Identity

- The user must be able to sign up with email or phone.
- Crypto concepts should remain invisible in the default user flow.
- The product must link auth to a wallet address.
- The wallet address must be the stable identity root consumed by downstream protocol surfaces.
- Hosted product sessions should use a Vana-controlled identity credential, not a vendor-scoped identifier as the canonical subject.
- Oko is the preferred first implementation target for embedded wallet infrastructure, but requirements should remain provider-agnostic where possible.
- The implementation must avoid baking provider-specific IDs into protocol or product identity.
- Legacy Para Vana App migration is not part of the first staging target unless leadership reverses that scope decision.

### Memory Canvas

- The memory canvas should render protocol-backed user data or metadata, not seed data.
- The product must be able to group records by source, schema, tag, or another DP RPC-backed metadata field.
- Each displayed data item should have enough metadata for the UI to explain source, schema/type, timestamp, and rough size or completeness.
- Editing user data is out of scope for Stage 1.

### Data Connections

- The connections screen must show the current connection state for each source for the logged-in identity.
- Sources must distinguish mobile-capable lite connection from desktop-required deep connection.
- OAuth-capable sources may use mobile lite ingress.
- Desktop-only sources must route to a DataConnect handoff instead of pretending mobile can scrape.
- Connection events must be written through the shared API path rather than only local state.
- The source catalog may start static in this repo, but the target architecture should allow the catalog to come from DP RPC, a registry, or an app-controlled metadata service.

### Apps Page

- The apps page must list apps that can request user data.
- Apps must expose requested scopes and publisher identity before the user grants access.
- The apps page can use lightweight registry metadata for Stage 1.
- A full marketplace service is out of scope.

### Permission Grants

- The user is the permission authority for app data access.
- Permission requests must show requesting app, publisher, scopes, duration, and outcome choices.
- Grant and denial events must be recorded in the shared API path.
- Grant records must preserve enough signed material or signed-message reference to later submit or anchor onchain without a user re-sign.
- A Personal Server or authorized server identity may store, enforce, serve, submit, or attest grants only within user-approved scope, duration, and policy.
- A server must not create a new app grant, expand scope, extend duration, or approve access on behalf of the user unless the user explicitly pre-authorized that policy.
- The UI should answer what app can access what data and for how long.
- Scope editing can be exposed later; the current demo's "Adjust scopes" affordance should not imply it is implemented.

### Audit and Account Surface

- The product must show a user-visible history of connection and permission decisions.
- Account/settings must expose the user's stable identity in a non-crypto-forward way, with wallet details available for advanced/debug contexts.
- Future export, recovery, and provider migration affordances should be left possible, even if not implemented in Stage 1.

## Protocol and Infrastructure Requirements

### DP RPC

- DP RPC is the Stage 1 shared API spine.
- Mobile should not create a custom path for identity, grants, storage metadata, or consent events that bypasses DP RPC semantics.
- DP RPC must carry enough signed state to support a later onchain migration without additional user operations.
- A DP RPC gap inventory is required before final implementation sizing.

### Hosted User Storage

- Stage 1 likely needs centrally hosted user storage so mobile, desktop, and builder-facing APIs can see the same dataset without requiring the user's device to be online.
- The storage shape is still an engineering decision: hosted personal server, hosted projection of DataConnect local storage, or another hybrid.
- The product requirement is availability across surfaces; the implementation choice remains open.

### Personal Server Protocol Role

- The baseline inherited from DAv1 is that mobile, desktop, and builder clients are not protocol participants by themselves.
- A Personal Server, hosted Personal Server, or equivalent authorized server identity is the protocol participant / server delegate that stores, serves, or attests to user data on behalf of the wallet owner.
- If a client bundles or controls a Personal Server, the server role remains separate from the client role.
- The user wallet address remains the stable identity root; the Personal Server or server delegate should have its own key or credential authorized by the user's wallet and auditable as acting for that wallet owner.
- For permissions, the user grants authority and the Personal Server exercises or enforces that authority within the approved grant or pre-authorized policy.
- Stage 1 can choose a pragmatic hosted implementation, but it should not collapse the authorized server identity into an Oko user id, provider account id, or mobile app session.

### DataConnect to Web Transport

- Data connected on desktop must become available to mobile and builder apps under the same identity.
- The exact transport path from DataConnect local storage to hosted storage / DP RPC / Context Gateway remains open.
- The path must respect the migration invariant.

### Context Gateway

- Context Gateway is part of the product acceptance bar because a builder app needs to reach user data.
- The leadership doc also says CG is frozen for the next month. This conflict must be resolved explicitly before the team claims full Stage 1 completion.
- For staging, requirements should allow an equivalent builder-facing API path if CG investment remains frozen.

### Onchain Metrics

- Stage 1 should write or prepare connect, query, and consent records in an onchain-compatible event shape.
- This is for external-observer metrics and future fee attachment, not Stage 1 decentralization.
- Token and finance should review the event shape before the first production write.

## Out of Scope

- DLP migration
- agent-specific features
- mobile scraping
- compute over private data
- ZK, verification, or privacy infrastructure
- protocol-level fees
- user-owned storage as the default Stage 1 implementation
- full marketplace service
- Vana App redesign
- data editing
- automatic migration of inactive legacy Vana App / Para users

## Open Decisions

1. Should the staging branch assume Context Gateway implementation work, or use a narrower builder-facing API stand-in until CG is unfrozen?
2. What is the minimum DP RPC gap inventory required before implementation PRs start?
3. What exact hosted storage shape should Stage 1 use?
4. How does DataConnect desktop publish connected data for mobile and builder access?
5. Which Oko components are operated by Vana, and where do those repos / deployment tasks live?
6. What is the initial Vana identity issuer shape: JWT issuer only, OIDC-compatible provider, or auth service behind an existing account domain?
7. Which Stage 1 subset can honestly land in 4 weeks, and what is the full Stage 1 estimate?
8. Does Stage 1 use a registered Personal Server, an authorized hosted server identity, or a transitional hosted service with a documented migration path to the protocol participant model?

## Branch Policy

Implementation PRs should target `stage/protocol-powered-mobile` until the Stage 1 baseline is coherent enough to merge to `main`.

Auth work should branch from staging and target staging. It should implement the `wallet-rooted-auth` capability without claiming the full one-user-three-surfaces demo is complete.

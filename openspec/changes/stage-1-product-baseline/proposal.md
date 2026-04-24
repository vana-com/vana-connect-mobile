## Why

The current `main` branch is a useful product demo, but it is not yet a scoped target for the Stage 1 protocol-powered mobile product. Leadership's protocol scoping asks for one user, three surfaces, one dataset, shared identity, shared API semantics, and a migration path that does not force users to re-sign, re-link, or re-consent later.

This change turns the demo and the protocol-scoping doc into a staging baseline that future auth, storage, DP RPC, and grant-flow PRs can target without re-litigating product intent.

## What Changes

- Add a product requirements baseline for the Stage 1 mobile product.
- Preserve the current demo's useful product surfaces while marking localStorage, seed data, and mock auth as demo implementation details.
- Define wallet-rooted auth as the identity target, with Oko as the preferred first implementation and provider independence as a requirement.
- Define DP RPC-backed data semantics for memory, connection state, app metadata, grants, consent, and audit history.
- Define the one-user-three-surfaces acceptance bar as the staging branch's north star.
- Capture open decisions that must be resolved before implementation claims completeness, especially Context Gateway scope, hosted storage shape, and Oko infrastructure ownership.

## Capabilities

### New Capabilities

- `mobile-product-baseline`: Product surfaces and UX requirements to preserve from the demo.
- `wallet-rooted-auth`: Signup/login, embedded wallet provisioning, wallet-address identity, session persistence, and provider independence.
- `dp-rpc-backed-data`: Requirements for replacing seed/local data with DP RPC-backed metadata, records, grants, and audit events.
- `data-connection-flows`: Mobile lite-ingress, desktop handoff, connection state, and source capability requirements.
- `permission-grant-flow`: App discovery, permission request, grant approval/denial, scope display, duration, and audit semantics.
- `cross-surface-demo`: Acceptance criteria for one user, three surfaces, one dataset, and migration-safe interoperability.

### Modified Capabilities

None.

## Impact

- `docs/product/stage-1-product-requirements.md`
- `docs/product/source-notes/*.md`
- `openspec/changes/stage-1-product-baseline/`
- Future implementation surfaces under `app/`, `components/`, `hooks/`, and `lib/`
- External dependencies that will need separate work: Oko or compatible embedded wallet infrastructure, Vana identity/JWT issuer, DP RPC, hosted user storage, DataConnect sync path, and Context Gateway user-auth/consent handoff.

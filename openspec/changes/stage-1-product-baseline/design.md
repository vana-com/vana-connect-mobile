## Context

The current `main` branch is a mobile-first demo with useful product surfaces: onboarding, memory canvas, source connections, app discovery, permission requests, audit history, and account settings. The implementation is demo-shaped: localStorage state, seed data, fake OTP, fake wallet derivation, static catalogs, and placeholder permission logging.

Leadership's Stage 1 protocol scoping asks for a different target: one user, three surfaces, one dataset, shared identity, shared API semantics, and a migration path that does not force users to re-sign, re-link, or re-consent later. The named surfaces are Vana mobile, DataConnect desktop, and Context Gateway or an equivalent builder-facing API path.

This change creates a staging baseline for that target. It does not implement the product. It defines the requirements and work packages future implementation agents should target.

## Goals / Non-Goals

**Goals:**

- Preserve the current demo's product shape while replacing demo-only implementation assumptions with protocol-backed requirements.
- Define wallet-rooted identity as the stable account boundary, with Vana-owned session credentials and Oko as the preferred first embedded-wallet implementation.
- Define DP RPC as the Stage 1 shared API spine for identity-adjacent metadata, connection events, grants, consent, and query records.
- Make the Personal Server / authorized server identity role explicit so the mobile app, desktop app, and builder clients are not accidentally treated as protocol participants.
- Convert the broad Stage 1 target into OpenSpec capabilities and tasks that can be assigned independently.

**Non-Goals:**

- Implement auth, storage, DP RPC, DataConnect sync, Context Gateway changes, or onchain writes in this PR.
- Commit to a final hosted storage topology.
- Redesign the Vana App or migrate inactive legacy Para users.
- Add mobile scraping, compute over private data, ZK/privacy infrastructure, protocol fees, user-owned storage as the default Stage 1 implementation, or a full marketplace service.

## Decisions

### Stage branch is the requirements target

`stage/protocol-powered-mobile` becomes the integration target for auth, storage, DP RPC, grant, and cross-surface implementation PRs. `main` remains the source demo until the Stage 1 baseline is coherent enough to merge.

Alternative considered: implement directly on `main`. That would make it harder to separate demo cleanup from protocol architecture and would give follow-on agents a moving target.

### Identity root is wallet address; sessions are Vana credentials

The stable account subject is the wallet address. Hosted product sessions should use a Vana-controlled credential, such as a Vana JWT with `sub = walletAddress`, rather than Oko, Para, Privy, Supabase, email, or phone identifiers as canonical identity.

Oko is the preferred first embedded-wallet implementation because the current strategy favors invisible wallet creation and familiar login. The product contract must remain provider-agnostic: provider tokens are inputs to Vana token exchange, not downstream service credentials.

Alternative considered: use provider identity directly. That is simpler initially but makes cross-surface migration and provider replacement harder.

### Personal Server or authorized server identity is the protocol participant

The inherited DAv1 position is that clients are not protocol participants by themselves. Mobile, DataConnect desktop, Context Gateway, and builder apps should be modeled as clients. A Personal Server, hosted Personal Server, hosted storage service, or equivalent authorized server identity is the protocol participant / server delegate for data storage, serving, and attestation.

The user wallet remains the identity root. The server participant/delegate should have a distinct key or credential authorized by the user's wallet and auditable as acting for that wallet owner.

Alternative considered: make the mobile app itself the participant. That may be simpler in a demo, but it conflicts with cross-surface availability and makes background serving dependent on a user device.

### Users grant permissions; servers exercise limited authority

The user is the permission authority for app data access. A Personal Server or authorized server identity may store, enforce, serve, submit, or attest permissions only inside the scope, duration, and policy the user approved. The server should not create a new app grant, expand scope, extend duration, or approve access unless the user explicitly pre-authorized that policy.

Alternative considered: allow the Personal Server to grant permissions independently. That weakens user control and makes audit records ambiguous about whether access was user-approved or server-selected.

### DP RPC is API semantics, not automatically storage

Stage 1 should route identity-adjacent metadata, connection state, grant decisions, consent records, and query records through DP RPC semantics. That does not decide where records are physically stored. The storage decision remains open: hosted Personal Server, hosted projection of DataConnect local storage, or another hybrid can satisfy the product requirement if all surfaces see one dataset under one identity.

Alternative considered: treat DP RPC as both API and storage. The leadership scoping explicitly keeps storage as an engineering decision.

### Builder access can use CG or a Stage 1 equivalent path

The product acceptance bar includes a builder app reading the user dataset. Context Gateway is the named path, but the scoping material also says CG is frozen for the next month. The staging baseline therefore allows an equivalent builder-facing API path until that conflict is resolved.

Alternative considered: require CG changes immediately. That may be the final path, but it blocks Stage 1 planning on a scope conflict outside this repo.

### Onchain work is limited to migration-safe records and metrics

Stage 1 should produce connect, query, and consent records in a shape that can later be flushed or anchored onchain without re-signing. This PR does not require smart contract changes or protocol-level fees.

Alternative considered: ignore onchain compatibility until later. That risks violating the explicit migration invariant.

## Risks / Trade-offs

- Oko may not support silent arbitrary EIP-191 signing in the required mobile/browser session context. Mitigation: make this a pre-adoption task and keep the Vana session contract provider-agnostic.
- The Vana auth issuer does not live in this repo. Mitigation: specify the contract here and track issuer implementation as a separate work package.
- DP RPC may have gaps for the required metadata, grants, consent, and audit records. Mitigation: require a gap inventory before implementation claims Stage 1 readiness.
- Cross-surface storage is not yet designed. Mitigation: define the product invariant first and make the storage topology a separate design task.
- Context Gateway scope is internally inconsistent in the source material. Mitigation: allow a Stage 1 equivalent builder API path until CG investment is explicitly approved.
- The 3-4 week target may only cover a subset of the full Stage 1 bar. Mitigation: split tasks so leadership can choose an honest first slice without losing the broader target.

## Migration Plan

1. Land this staging branch with OpenSpec requirements and source notes only.
2. Branch auth work from staging and target `wallet-rooted-auth`, including the Vana JWT boundary and Oko feasibility proof.
3. Inventory DP RPC gaps and define typed records for connections, grants, consent, query events, source metadata, and audit history.
4. Choose the hosted storage / authorized server identity topology and document how it preserves the protocol participant model.
5. Integrate mobile surfaces against protocol-backed data using local mocks only when the mocks match the target contracts.
6. Connect DataConnect publishing and builder-facing reads to prove one user, three surfaces, one dataset.

Rollback for this PR is documentation-only: close or revert the staging baseline before implementation PRs depend on it.

## Open Questions

- What is the minimum builder-facing API path if Context Gateway remains frozen?
- What exact DP RPC methods and record types are missing for Stage 1?
- What hosted storage topology should Stage 1 use?
- How does DataConnect publish local connected data for mobile and builder access?
- Which Oko components does Vana operate, and in which repos?
- Is the first auth issuer a JWT issuer only, an OIDC-compatible provider, or an auth service behind an existing account domain?
- Does Stage 1 use a registered Personal Server, an authorized hosted server identity, or a transitional hosted service with a documented migration path?

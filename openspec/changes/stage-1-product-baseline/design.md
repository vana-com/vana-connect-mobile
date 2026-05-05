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

Oko should not be assumed to support silent arbitrary EIP-191 signing. Source validation shows Oko `personal_sign` is user-visible as shipped: web goes through an attached approval modal, and React Native routes signing through OS-browser `open_modal`. Routine product sessions therefore need to be Vana-owned credentials, not repeated silent wallet signatures.

Oko also should not be assumed to support EIP-7702 authorization or smart-account wallet APIs as shipped. The current source ignores EIP-7702 transaction fields and does not expose `wallet_sendCalls`, `wallet_getCapabilities`, or wallet permission APIs. If Stage 1 needs 7702, that is Oko roadmap work, Vana fork work, or a migration/export-import path to a 7702-capable wallet.

Stock Oko is acceptable until it blocks the target UX, security posture, or proof contract. If Vana later self-hosts or forks Oko, Vana can likely modify the attached wallet UI and operate its own deployment under Apache-2.0 license terms. That does not remove the need for legal/trademark review or for a product/security decision on no-prompt signing. Any auto-approval or hidden approval path should be modeled as scoped delegated/session authority with prior consent, not as ordinary user approval.

`account.vana.org` / `account-dev.vana.org` already exists in `vana-com/vana-connect` as the account surface for DataConnect handoff. Stage 1 should evaluate extending that account-domain surface for the Vana issuer.

OIDC-compatible "Log in with Vana" should be included optimistically after the issuer semantics are proven. It would let internal Vana web apps, builder apps, and partner surfaces use standard OAuth/OIDC libraries while still consuming Vana-issued, wallet-rooted identity. The first auth implementation should not require full OIDC, but it should avoid decisions that would make OIDC awkward later.

Alternative considered: use provider identity directly. That is simpler initially but makes cross-surface migration and provider replacement harder.

### Personal Server or authorized server identity is the protocol participant

The inherited DAv1 position is that clients are not protocol participants by themselves. Mobile, DataConnect desktop, Context Gateway, and builder apps should be modeled as clients. A Personal Server, hosted Personal Server, hosted storage service, or equivalent authorized server identity is the protocol participant / server delegate for data storage, serving, and attestation.

The user wallet remains the identity root. The server participant/delegate should have a distinct key or credential authorized by the user's wallet and auditable as acting for that wallet owner.

Alternative considered: make the mobile app itself the participant. That may be simpler in a demo, but it conflicts with cross-surface availability and makes background serving dependent on a user device.

### Users grant permissions; servers exercise limited authority

The user is the permission authority for app data access. A Personal Server or authorized server identity may store, enforce, serve, submit, or attest permissions only inside the scope, duration, and policy the user approved. The server should not create a new app grant, expand scope, extend duration, or approve access unless the user explicitly pre-authorized that policy.

The timing of delegate consent is a product decision. Stage 1 may ask for explicit delegate consent before delegated authority is needed, or defer consent until a high-intent moment. If consent is deferred, pre-consent background behavior should be modeled as Vana product/session behavior, not protocol-authorized delegation.

Alternative considered: allow the Personal Server to grant permissions independently. That weakens user control and makes audit records ambiguous about whether access was user-approved or server-selected.

### DP RPC is API semantics, not automatically storage

Stage 1 should route identity-adjacent metadata, connection state, grant decisions, consent records, and query records through DP RPC semantics. That does not decide where records are physically stored. The storage decision remains open and should not block the first identity/RPC checkpoint; the checkpoint only needs an agreed DP RPC event contract and a place to execute it.

Alternative considered: treat DP RPC as both API and storage. The leadership scoping explicitly keeps storage as an engineering decision.

### Builder access can use CG or a Stage 1 equivalent path

The product acceptance bar includes a builder app reading the user dataset. Context Gateway is the named path, but the scoping material also says CG is frozen for the next month. The staging baseline therefore allows an equivalent builder-facing API path until that conflict is resolved.

Alternative considered: require CG changes immediately. That may be the final path, but it blocks Stage 1 planning on a scope conflict outside this repo.

### Onchain work is limited to migration-safe records and metrics

Stage 1 should produce connect, query, and consent records in a shape that can later be flushed or anchored onchain without re-signing. This PR does not require smart contract changes or protocol-level fees.

Alternative considered: ignore onchain compatibility until later. That risks violating the explicit migration invariant.

## Risks / Trade-offs

- Oko does not appear to support silent arbitrary EIP-191 signing in the required mobile/browser session context as shipped. Mitigation: design routine session refresh around Vana-owned credentials, and use wallet-rooted signatures only for explicit authority events unless Oko provides a documented constrained policy-signing feature.
- Oko does not appear to support EIP-7702 authorization or smart-account wallet APIs as shipped. Mitigation: do not make 7702 a Stage 1 dependency unless Oko commits support, Vana owns a fork/build, or the flow explicitly uses export/import into a 7702-capable wallet.
- Self-hosting or forking gives Vana control over Oko UI and signing-flow code, but no-prompt signing can blur the distinction between user approval and delegated authority. Mitigation: require explicit scope, audience, expiry, revocation, and audit semantics before any no-prompt wallet-authority behavior.
- Oko key export is source-verified for the secp256k1 / EVM path, but full production UX is not verified. Mitigation: keep export/self-custody as a validated design assumption, not a launch claim, until mobile and managed-service behavior are tested.
- The Vana auth issuer does not live in this repo. Mitigation: specify the contract here and track implementation against the existing `account.vana.org` surface in `vana-com/vana-connect`.
- DP RPC may have gaps for the required metadata, grants, consent, and audit records. Mitigation: require a gap inventory before implementation claims Stage 1 readiness.
- Cross-surface storage is not yet designed. Mitigation: define the product invariant first and make the storage topology a separate design task.
- Context Gateway scope is internally inconsistent in the source material. Mitigation: allow a Stage 1 equivalent builder API path until CG investment is explicitly approved.
- The 3-4 week target may only cover a subset of the full Stage 1 bar. Mitigation: split tasks so leadership can choose an honest first slice without losing the broader target.

## Migration Plan

1. Land this staging branch with OpenSpec requirements and source notes only.
2. Branch auth work from staging and target `wallet-rooted-auth`, including the Vana JWT boundary, Oko feasibility evidence, and explicit/deferred delegate-consent choice.
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
- Does Vana need Oko 7702 support in Stage 1, or can 7702 remain a later provider/migration path?
- Does Vana modify Oko's attached wallet UI, and what prior-consent policy governs any no-prompt signing?
- Which concrete client should justify OIDC-compatible "Log in with Vana" first: an internal Vana web app, DataConnect, Context Gateway / builder apps, or an external partner?
- Does Stage 1 use a registered Personal Server, an authorized hosted server identity, or a transitional hosted service with a documented migration path?
- Does Stage 1 ask for delegate consent early, or defer it until a high-intent action?

# Stage 1 Handoff Memo

Date: 2026-04-27

This memo is the handoff point for continuing the current Stage 1 protocol-powered mobile work in a fresh Claude session.

## What Is Already In Place

The work is split across two repos and two active PRs:

- `vana-connect-mobile` PR: <https://github.com/vana-com/vana-connect-mobile/pull/1>
- `vana-connect` PR: <https://github.com/vana-com/vana-connect/pull/112>

The two PRs are linked to each other in their descriptions.

The mobile repo now has a durable execution brief at `docs/product/stage-1-execution-brief.md`. That file defines the first integration checkpoint without shrinking the broader Stage 1 target.

The mobile repo also has the broader staging baseline in `docs/product/stage-1-product-requirements.md` and the OpenSpec change under `openspec/changes/stage-1-product-baseline/`.

The auth issuer repo has the OpenSpec change under `openspec/changes/account-domain-identity-issuer/`.

## Current Working Branches

Mobile repo:

- branch: `stage/protocol-powered-mobile`
- PR: `vana-com/vana-connect-mobile#1`

Auth issuer repo:

- branch: `tim/account-domain-identity-issuer`
- PR: `vana-com/vana-connect#112`

Both branches are ahead of their remote counterparts and contain only the product/doc changes relevant to this stage.

## Current Product Stance

The current stance is:

- `account.vana.org` is the default home for the Vana identity issuer unless the implementation proves it structurally wrong.
- The canonical identity subject is the wallet address.
- Oko is the preferred first embedded-wallet implementation, but it stays behind the Vana issuer boundary.
- Stock Oko is acceptable until it blocks the target UX, security posture, or proof contract.
- OIDC-compatible `Log in with Vana` is an optimistic, non-blocking goal. It should be included if it can ride the first issuer implementation without blocking the core checkpoint.
- Storage topology behind DP RPC is not the first blocker. It should not block the identity/RPC checkpoint.
- Context Gateway is not required to be the first builder-facing path if it blocks the checkpoint. A narrower builder-facing stand-in is acceptable if it preserves the same identity and authorization contract.

## First Integration Checkpoint

The first integration checkpoint is the first state where the team can prove all of the following together:

1. A user signs into the future hosted mobile app through the Vana account flow.
2. The mobile app receives a wallet-rooted Vana identity from the account-domain issuer.
3. DataConnect continues or completes a handoff under the same wallet-rooted identity.
4. At least one user-scoped event is written through DP RPC as that wallet-rooted user.
5. A builder-facing path can verify or consume the same identity contract without depending on Oko, Privy, Para, Supabase, email, or phone identifiers.

This checkpoint is the seam where parallel work should converge.

## What Changed Most Recently

In the mobile repo:

- added `docs/product/stage-1-execution-brief.md`
- updated `docs/product/stage-1-product-requirements.md`
- updated the Stage 1 OpenSpec baseline to reflect the execution checkpoint
- clarified that OIDC is an optimistic stretch goal and not a blocker
- clarified that stock Oko is acceptable until blocked
- clarified that storage topology does not block the first identity/RPC checkpoint
- added a DP RPC scenario that requires at least one user-scoped event to be executed through the agreed DP RPC contract

In the auth issuer repo:

- updated the issuer OpenSpec to make DP RPC attribution explicit
- added a requirement that downstream writers can derive the wallet-rooted subject, issuer, audience, expiration, and key id
- kept storage topology out of the issuer responsibility
- kept OIDC-compatible `Log in with Vana` as an optimistic goal, not a blocker

## PR Scope

PR #1 in `vana-connect-mobile` now describes:

- the staging baseline for protocol-powered mobile
- the first integration checkpoint
- OIDC as an optimistic non-blocking goal
- stock Oko as acceptable until blocked
- the new execution brief

PR #112 in `vana-connect` now describes:

- the account-domain issuer contract
- JWT/JWKS issuance
- provider-verifier adapters
- wallet-rooted subject semantics
- refresh and signing-key behavior
- DP RPC attribution support for downstream writers
- OIDC-compatible `Log in with Vana` as an optimistic goal

## Unresolved Questions

These are intentionally still open:

- Which concrete DP RPC writer or builder-facing consumer should be the first verifier of Vana-issued credentials?
- Which concrete client should justify OIDC-compatible `Log in with Vana` first: an internal Vana web app, DataConnect, Context Gateway / builder apps, or an external partner?
- What exact Oko proof will `account.vana.org` verify?
- What are the initial access-token and refresh-token lifetimes?
- Should refresh tokens be returned in JSON, httpOnly cookies, or both depending on client type?
- Does the first implementation need a Vana JWT in the existing `/connect` DataConnect handoff, or only for the new mobile auth path?
- Should `/api/sign` remain Privy-specific until replaced by delegated/session authority, or should it start requiring a Vana JWT immediately?
- What is the final branding decision? This remains an open question and is not resolved here.

## What The Next Claude Session Should Do First

Start by reading:

- `docs/product/stage-1-execution-brief.md`
- `docs/product/stage-1-product-requirements.md`
- `openspec/changes/stage-1-product-baseline/design.md`
- `openspec/changes/account-domain-identity-issuer/design.md`

Then focus on one of these depending on the task:

1. If continuing product/requirements work, resolve the remaining open decisions in the execution brief.
2. If starting implementation planning, translate the first integration checkpoint into concrete repo-level work packets.
3. If starting engineering work, keep the seam boundaries intact: mobile auth adapter, account-domain issuer, DataConnect handoff, and DP RPC writer verification should remain distinct.

## Important Constraints

- Do not collapse storage topology into auth semantics.
- Do not make full OIDC a gate for the first checkpoint.
- Do not treat login as protocol delegation.
- Do not let Oko-specific implementation details become downstream identity semantics.
- Do not rewrite or revert unrelated untracked work in either repo.

## Files To Know

- `docs/product/stage-1-execution-brief.md`
- `docs/product/stage-1-product-requirements.md`
- `openspec/changes/stage-1-product-baseline/design.md`
- `openspec/changes/stage-1-product-baseline/specs/wallet-rooted-auth/spec.md`
- `openspec/changes/stage-1-product-baseline/specs/dp-rpc-backed-data/spec.md`
- `openspec/changes/account-domain-identity-issuer/design.md`
- `openspec/changes/account-domain-identity-issuer/specs/account-domain-identity-issuer/spec.md`

## Notes On Repo Hygiene

Both repos still have pre-existing unrelated untracked files. Leave them alone unless they become directly relevant to the task.


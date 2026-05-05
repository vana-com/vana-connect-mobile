# Wallet Auth Design Extract

Source: VPI PR #18, `origin/research/embedded-wallet-providers`
Date extracted: 2026-04-24

## Core Target

The mobile product should implement "Login with Vana," not "Login with Oko."

Oko is the preferred first embedded wallet provider implementation, but the stable product and protocol contract should be Vana-owned:

- user identity root: wallet address
- hosted session credential: Vana JWT
- token subject: `sub = walletAddress`
- wallet provider role: human auth, wallet custody, key export, EIP-191 signing
- downstream service role: verify Vana JWTs through Vana JWKS, not provider JWTs

## Product Requirements

- Mobile login must preserve familiar auth UX: email or phone at minimum; Google and Apple depend on the selected provider and product bar.
- Crypto concepts should not be default UX.
- The mobile app should store and send Vana JWTs, not Oko, Privy, or Para tokens.
- Provider tokens should be inputs to a Vana token exchange only.
- Routine mobile session refresh should not require Oko to silently sign `"vana-master-key-v1:" + nonce`; source validation indicates Oko arbitrary EIP-191 signing is user-visible as shipped.
- Oko personal signing should be treated as a user-approved authority event unless Oko provides a documented constrained policy-signing feature.
- Oko raw key export has source-level validation plus a local cryptographic reproduction in `docs/product/source-notes/oko-self-custody-validation.md`; this supports self-custody and provider-detach planning, but does not replace a live mobile export test.
- Oko does not currently appear to support EIP-7702 authorization or smart-account wallet APIs as shipped; if 7702 is required, treat it as Oko roadmap work, Vana fork work, or a migration/export target.
- A self-hosted or forked Oko deployment can likely be Vana-branded because Oko is Apache-2.0 licensed, but legal/trademark review still needs to confirm attribution and mark-removal requirements.
- Cross-surface continuity must be wallet-address based across mobile, DataConnect, Context Gateway, and future surfaces.
- Email, phone, `privyDid`, `paraDid`, and Oko user IDs must not become canonical account identity.

## Vana-Owned Auth Infrastructure

The prior design requires a Vana-owned auth or identity issuer. The current implementation context already has `account.vana.org` / `account-dev.vana.org` in `vana-com/vana-connect`. Stage 1 should treat that existing account surface as the first candidate home.

The issuer contract still needs:

- `POST /v1/auth/challenge`
- `POST /v1/auth/token`
- single-use nonce storage with short TTL
- provider-token verification adapters
- audience validation per provider/client
- RS256 JWT signing
- JWKS endpoint
- key rotation
- Vana JWT claims including `iss`, `sub`, `aud`, `iat`, `exp`, and explicit `walletAddress`

This service does not live in `vana-connect-mobile`. This repo should integrate against the account-domain contract once it exists, and may use a local mock only if the mock has the same semantics.

Relevant existing `vana-com/vana-connect` context:

- SDK environment config already includes `accountUrl` values for `https://account-dev.vana.org` and `https://account.vana.org`.
- Session initialization returns a `connectUrl` where the user signs in on `account.vana.org` and launches Data Connect.
- Existing account-flow docs describe a Privy-to-`account.vana.org` migration, including web login and signing callbacks.

## Oko Infrastructure Outside This Repo

Choosing Oko implies separate infrastructure work:

- self-hosted Oko KSN nodes
- OAuth/email configuration
- Oko SDK integration details for mobile/browser
- provider-session verification story for the Vana auth service
- key export/reimport UX
- attached-wallet approval modal customization or Vana-branded fork strategy
- explicit policy for whether any no-prompt signing is allowed, and under what prior consent, scope, expiry, revocation, and audit constraints
- operational ownership for KSN nodes and provider configuration

If autonomous/background signing is required under Oko, that is a separate session-key project. On the current chain it likely requires ERC-4337, smart accounts, bundler, paymaster or relayer, and session-key policy logic. With EIP-7702, some account-deployment complexity changes, but infra still needs a separate design.

## Session and Delegation Posture

Silent product UX should be provided through Vana sessions and scoped delegation, not by assuming silent wallet signatures.

Two product options remain valid:

- Explicit delegate consent: ask the user for wallet-rooted authorization before a Vana server, hosted Personal Server, or other delegate acts under wallet authority.
- Deferred delegate consent: onboard with Oko and Vana sessions first, then ask for wallet-rooted authorization at a high-intent moment such as DataConnect handoff, first app grant, enabling auto-sync, export/recovery, or monetization.

If consent is deferred, the implementation should not claim protocol-authorized delegation before the wallet-rooted authorization event exists.

## Migration Boundaries

- Do not combine provider migration with identity migration if avoidable.
- First introduce Vana JWTs and wallet-address account lookup while current providers still work.
- Then swap provider implementation behind the Vana identity boundary.
- Preserving an existing user's wallet identity across providers requires user-by-user key export and reimport.
- Without key export, the wallet address changes and the account should be treated as distinct unless a product-level linking flow explicitly resolves it.
- Do not auto-merge accounts by email.
- Personal Server and protocol auth should remain wallet-native and independent of Oko.

## Provider-Agnostic Contracts To Keep Stable

- Vana JWT shape and JWKS verification
- `sub = walletAddress`
- nonce challenge/token API
- master-key signing payload
- Context Gateway wallet-address lookup
- Personal Server `Web3Signed`
- grant signatures
- delegated or session-key policy semantics
- DataConnect / mobile / hosted storage identity boundary

## Open Items For Auth PR

- Design session refresh around Vana-owned credentials rather than silent Oko `personal_sign`.
- Choose whether the first Stage 1 slice uses explicit delegate consent or deferred delegate consent.
- Validate the full Oko export UX in the target mobile/browser environment if self-custody or provider migration is part of the launch claim.
- Confirm Oko 7702 roadmap or decide whether Vana needs to fork/build that capability.
- Confirm self-hosted/forked Oko branding/legal obligations and whether Vana will modify Oko's attached approval UI.
- If product requires no-prompt wallet-authority behavior, define it as scoped delegated/session authority rather than hidden ordinary wallet approval.
- Decide whether Stage 1 requires Apple OAuth or can start with email/phone and Google.
- Decide whether the Vana auth issuer is implemented as an extension of `account.vana.org` in `vana-com/vana-connect`, and what repo/deployment changes are required.
- Decide whether the first mobile auth PR uses a local mock issuer or waits for real issuer infrastructure.
- Decide how to test provider independence without implementing a second provider.

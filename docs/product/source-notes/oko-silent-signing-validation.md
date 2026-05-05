# Oko Silent Signing Validation

Status: source-verified negative finding
Date: 2026-04-24

## Question

Can an already signed-in Oko wallet silently sign an arbitrary EIP-191 / `personal_sign` payload such as `vana-master-key-v1:<nonce>` in the web or React Native path?

## Short Answer

No, not as shipped.

Oko supports arbitrary `personal_sign` payloads, but the supported SDK path is user-visible. The web SDK routes the request through an attached approval modal. The React Native SDK routes the same `open_modal` request through the OS browser and a visible attached iframe. I found no silent flag, trusted-origin allowlist, API endpoint, or test that proves silent arbitrary signing for an already signed-in Oko wallet.

This does not block invisible wallet onboarding. It does mean Stage 1 auth should not depend on Oko silently signing `vana-master-key-v1:<nonce>` for routine session refresh.

## Source Evidence

Oko source checked: `https://github.com/chainapsis/oko.git` at commit `c25214e7c401a7e472d4fdff161fe53dffa56555`.

Key source refs:

- `sdk/oko_sdk_eth/src/provider/base.ts:369` handles `personal_sign`.
- `sdk/oko_sdk_eth/src/methods/make_signature.ts:77` maps `personal_sign` to `sign_type: "arbitrary"`.
- `sdk/oko_sdk_eth/src/methods/make_signature.ts:122` sends `msg_type: "open_modal"` with `modal_type: "eth/make_signature"`.
- `sdk/oko_sdk_eth/src/methods/make_signature.ts:132` waits for `okoWallet.openModal(openModalMsg)`.
- `sdk/oko_sdk_eth/src/methods/make_signature.ts:146` only returns a signature after an `approve` ack.
- `embed/oko_attached/src/components/modal_variants/eth/arbitrary_sig/make_arbitrary_sig_modal.tsx:99` renders `Reject` and `Approve` buttons.
- `embed/oko_attached/src/components/modal_variants/eth/arbitrary_sig/make_arbitrary_sig_modal.tsx:113` wires `Approve` to `onApprove`.
- `embed/oko_attached/src/components/modal_variants/eth/arbitrary_sig/hooks/use_arbitrary_sig_modal.tsx:87` calls the signing primitive only inside `onApprove`.
- `apps/docs_web/docs/v0/sdk-usage/mobile/react-native-integration.md:42` says the React Native SDK uses the OS browser for authentication and signing.
- `sdk/oko_sdk_core_react_native/src/methods/open_modal.ts:46` calls `openAuthSession` for `open_modal`.
- `apps/attached_mobile_host_web/src/app/mobile/rpc/_client.tsx:16` includes `open_modal` in the visible-method list.

Oko's `signin_silently` path is session refresh, not arbitrary payload signing. The backend TSS endpoints can participate in signing after the client supplies authenticated signing protocol inputs, but the supported product SDK still gates arbitrary wallet signatures behind user approval.

## Product Implication

We should separate silent product UX from silent wallet signatures:

- Oko remains viable for invisible wallet creation, wallet-address identity, user-approved signatures, and raw-key export/self-custody planning.
- Routine mobile session refresh should use Vana-owned credentials issued by `account.vana.org` or the chosen account-domain issuer.
- The product can defer delegate consent at onboarding and still provide non-crypto-native UX.
- Protocol-authorized delegation should require a wallet-rooted authorization event before Vana claims that a server or Personal Server delegate is acting under user wallet authority.

## Options To Keep Open

### Option A: Explicit Delegate Consent

Ask the user for a product-level permission when delegated authority is first needed. The Vana screen explains the action in product language, and Oko may show a wallet approval for the underlying authorization signature.

Use this when Stage 1 needs protocol-authorized background sync, grant enforcement, hosted Personal Server behavior, or monetization readiness early.

### Option B: Deferred Delegate Consent

Onboard the user with Oko and issue a Vana session without asking for delegated authority. Treat background behavior before consent as Vana product/session behavior, not wallet-authorized protocol delegation. Ask for wallet-rooted authorization later at a high-intent moment such as DataConnect handoff, first app grant, enabling auto-sync, export/recovery, or monetization.

Use this when product needs the lowest-friction onboarding path.

## Remaining Open Questions

- Does Stage 1 require protocol-authorized delegation immediately, or can it defer until the first cross-surface/high-intent action?
- If delegation is required, what exact delegate identity, scope, audience, expiry, revocation path, and audit label should be signed?
- Should Vana ask Oko for a first-class constrained policy-signing feature, or should Vana implement delegated/session authority outside Oko wallet signing?

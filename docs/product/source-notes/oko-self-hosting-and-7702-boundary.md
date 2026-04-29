# Oko Self-Hosting and EIP-7702 Boundary

Status: source-verified boundary
Date: 2026-04-24

## Questions

- If Vana self-hosts and/or forks Oko, what can be customized?
- Can Vana remove or automatically approve Oko signing prompts?
- Does Oko currently support EIP-7702, smart-account wallet APIs, or session-key style authorization?
- Is Oko's license permissive enough for a Vana-branded deployment?

## Short Answer

Oko is Apache-2.0 licensed and designed to be self-hosted. That is permissive enough to fork, modify, and operate a Vana-branded deployment, subject to preserving required license/copyright notices and separately respecting trademark/branding rules.

Stock Oko SDK customization appears limited at the integration layer. The public React/core SDK exposes `theme: "light" | "dark"`, while the approval UI itself lives in Oko's attached-wallet React app. A Vana-controlled, deeply customized approval experience therefore likely means self-hosting a Vana fork that modifies the attached-wallet UI, or asking Oko for a supported customization surface.

Oko does not currently appear to support EIP-7702 authorization or smart-account wallet APIs as shipped. The ETH SDK explicitly ignores EIP-7702 transaction fields, the supported wallet RPC set excludes current wallet capability / batch-call / permission APIs, and the only EIP-7702 test path found is disabled. No public Oko-specific roadmap item was found in the searched docs, source, issues, or PRs.

With a self-hosted fork, Vana could technically change the approval flow or auto-approve selected signing requests. That should not be described as user approval unless the user previously authorized a scoped policy. If product requires no-prompt wallet-authority behavior, it should be modeled as a Vana session/delegation design with explicit scope, audience, expiry, revocation, and audit semantics.

## Source Evidence

Oko source checked: `https://github.com/chainapsis/oko.git` at commit `c25214e7c401a7e472d4fdff161fe53dffa56555`.

License, self-hosting, and forking:

- `LICENSE` is Apache License 2.0.
- `README.md` says the project is "Apache-2.0 licensed" and that components are designed to be self-hosted with architectural control and customization.

Stock integration customization:

- `sdk/oko_sdk_core/src/types/oko_wallet.ts:56` exposes `setTheme`.
- `sdk/oko_sdk_core/src/types/oko_wallet.ts:77` exposes init arg `theme?: OkoWalletTheme`.
- `sdk/oko_sdk_react/src/types.ts:9` exposes provider config `theme?: OkoWalletTheme`.
- `sdk/oko_sdk_core/src/methods/open_modal.ts:147` passes the selected theme to attached modal URLs.

Approval flow:

- `sdk/oko_sdk_eth/src/methods/make_signature.ts:122` sends `msg_type: "open_modal"` with `modal_type: "eth/make_signature"`.
- `sdk/oko_sdk_eth/src/methods/make_signature.ts:146` only returns a signature after an `approve` ack.
- `embed/oko_attached/src/components/modal_variants/eth/arbitrary_sig/make_arbitrary_sig_modal.tsx:99` renders `Reject` and `Approve` buttons.
- `embed/oko_attached/src/components/modal_variants/eth/eip712_sig/make_eip712_sig_modal.tsx:46` renders `Reject` and `Approve` buttons.
- `embed/oko_attached/src/components/modal_variants/eth/tx_sig/make_tx_sig_modal.tsx:130` renders `Reject` and `Approve` buttons.

EIP-7702 and smart-account APIs:

- `sdk/oko_sdk_eth/src/utils/transaction.ts:65` says Oko does not support blob and EIP-7702 fields.
- `sdk/oko_sdk_eth/src/utils/transaction.ts:79` ignores fields not used for legacy or EIP-1559 signing.
- `sdk/oko_sdk_eth/src/rpc/constants.ts:43` supports only `eth_accounts`, `eth_requestAccounts`, `eth_sendTransaction`, `eth_signTransaction`, `eth_signTypedData_v4`, `personal_sign`, `wallet_addEthereumChain`, and `wallet_switchEthereumChain` as wallet methods.
- `sdk/oko_sdk_eth/src/rpc/constants.ts:65` lists `wallet_getCapabilities`, `wallet_grantPermissions`, `wallet_getPermissions`, `wallet_sendCalls`, and related methods only as unsupported future-reference methods.
- `sdk/oko_sdk_eth/src/tests/viem.test.ts:604` has a disabled EIP-7702 test block, not production support.

Observed public demo shape:

- `https://demo.oko.app/` demonstrates conventional embedded-wallet login, address display, message signing, transaction signing, and send flows. It does not show EIP-7702 authorization, session keys, `wallet_sendCalls`, or no-prompt protocol delegation.

## Product Implication

Self-hosting or forking makes Oko a modifiable wallet infrastructure candidate, not a complete delegation system.

For Stage 1, the safer baseline is:

- Use Oko for familiar login, invisible wallet creation, wallet-address identity, user-approved signatures, and export/self-custody planning.
- Use Vana-owned sessions for routine mobile/backend auth.
- Treat visible wallet prompts as authority events unless there is a documented scoped policy that the user already authorized.
- Treat no-prompt signing as a separate Vana delegation/session design, not as stock Oko behavior.
- Treat EIP-7702 as unsupported in Oko today. If 7702 is required, either wait for Oko support, add it in a Vana fork, or rely on Oko key export followed by migration/import into a wallet that supports 7702.

## Still Unverified

- Oko maintainer confirmation on intended 7702 roadmap and timing.
- Legal/trademark review for exactly how Vana may remove or replace Oko marks in a self-hosted or forked product.
- Whether Oko will support a first-class white-label approval-modal customization API.
- Whether Vana should fork Oko UI/signing-flow code, upstream customization hooks, or do both.
- Whether no-prompt signing is acceptable for any scoped Vana flow, and if so, the exact consent, expiry, revocation, and audit model.
- Live mobile/browser export UX and target-wallet import into a 7702-capable wallet.

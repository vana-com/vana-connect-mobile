# Oko Self-Custody Validation

Status: source-verified with local cryptographic reproduction
Date: 2026-04-24

## Question

Can an Oko-created wallet be exported or detached in a way that gives the user a raw key controlling the same EVM wallet address?

## Short Answer

Yes for the secp256k1 / EVM key path, based on Oko source at commit `c25214e7c401a7e472d4fdff161fe53dffa56555`.

This does not mean there is a clean, documented mobile SDK method today. The implemented shape is a protected export flow: Oko's user dashboard sends an export request to the attached wallet iframe, the iframe re-authenticates the user, fetches server shares from Oko, combines them with local client shares, and stores a raw private key in memory for display/copy.

## Source Evidence

Oko source checked: `https://github.com/chainapsis/oko.git` at commit `c25214e7c401a7e472d4fdff161fe53dffa56555`.

Key source refs:

- `backend/oko_api/server/src/routes/tss_v2/index.ts:200` registers `POST /export_shares`.
- `backend/oko_api/server/src/routes/tss_v2/export_shares.ts:23` registers OpenAPI path `/tss/v2/export_shares` with summary "Export server shares for wallet export".
- `backend/oko_api/server/src/routes/tss_v2/export_shares.ts:144` decrypts the stored secp256k1 server share.
- `backend/oko_api/server/src/routes/tss_v2/export_shares.ts:174` returns `secp256k1_share` and `ed25519_seed_share`.
- `embed/oko_attached/src/window_msgs/export_private_key.ts:48` restricts the flow to configured user-dashboard origins.
- `embed/oko_attached/src/window_msgs/export_private_key.ts:74` reads the local client shares from attached-wallet app state.
- `embed/oko_attached/src/window_msgs/export_private_key.ts:115` calls `${TSS_V2_ENDPOINT}/export_shares`.
- `embed/oko_attached/src/window_msgs/export_private_key.ts:153` combines the local user share and server secp256k1 share into a full scalar.
- `embed/oko_attached/src/window_msgs/export_private_key.ts:160` formats the secp256k1 private key as `0x${fullSecp256k1Scalar}`.
- `crypto/tecdsa/cait_sith_keplr_wasm/wasm/src/keygen.rs:201` exposes the WASM `cli_combine_shares` function used by the export flow.
- `apps/user_dashboard/src/components/dashboard_header/dashboard_header.tsx:217` exposes an "Export Private Key" dashboard menu item.

Oko's current docs also say the private key is never reconstructed or revealed. Treat that as a docs/source mismatch until Oko confirms the intended support contract. The source shows explicit reconstruction during the export path, even if normal signing avoids reconstruction.

## Local Reproduction

Committed artifact:

- `docs/product/source-notes/artifacts/oko_evm_export_repro.mjs`
- `docs/product/source-notes/artifacts/oko_evm_export_repro-sanitized-output.json`

The reproduction generates Oko secp256k1 shares with Oko's own WASM, combines those shares with the same `cli_combine_shares` function used by the export flow, derives an EVM address from the combined key, signs `vana-master-key-v1:<nonce>`, and recovers the signer address.

The sanitized output proves:

- Oko's generated private key equals the combined private key.
- Client and server shares are both present.
- The combined key derives an EVM address.
- A `vana-master-key-v1:<nonce>` signature recovers the same address.

Private key material is intentionally omitted from the committed output. To rerun locally:

```bash
git clone https://github.com/chainapsis/oko.git .tmp/oko-self-custody-validation/oko
cd .tmp/oko-self-custody-validation/oko
git checkout c25214e7c401a7e472d4fdff161fe53dffa56555
wasm-pack build crypto/tecdsa/cait_sith_keplr_wasm/wasm --target nodejs --out-dir ../pkg
cd - >/dev/null
OKO_WASM_PATH="$PWD/.tmp/oko-self-custody-validation/oko/crypto/tecdsa/cait_sith_keplr_wasm/pkg/cait_sith_keplr_wasm.js" \
  node docs/product/source-notes/artifacts/oko_evm_export_repro.mjs
```

The script also requires Python `eth-account` for EVM signing/recovery.

## Product Implication

Oko is viable enough for the current self-custody/export assumption to remain in the Stage 1 auth plan. The provider-agnostic identity boundary is still required: downstream identity and authorization should remain wallet-address and Vana-session based, not Oko-user-id based.

This proof does not provide silent wallet signing. The separate silent-signing validation found that Oko arbitrary EIP-191 signing is user-visible as shipped, so routine session refresh should use Vana-owned credentials rather than assuming silent Oko `personal_sign`.

## Still Unverified

- Full export from a live Oko wallet through Oko API, KSNs, OAuth/re-auth, user dashboard, and attached iframe.
- React Native or mobile WebView behavior for the protected export message flow.
- Whether Vana uses Oko's hosted dashboard, embeds the export screen, or asks Oko for a first-class mobile SDK export method.
- Whether managed Oko production exposes this endpoint and dashboard behavior with stable support guarantees.
- Security UX for raw key exposure: clipboard behavior, screen capture, logging, analytics redaction, memory lifetime, and user education.
- Re-import into another wallet/provider and preservation of the exact wallet address after export.

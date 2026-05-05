import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(import.meta.url);

const wasmPath = process.env.OKO_WASM_PATH;

if (!wasmPath) {
  console.error(
    "Set OKO_WASM_PATH to Oko's built cait_sith_keplr_wasm.js package before running.",
  );
  process.exit(2);
}

const wasm = require(wasmPath);

const keygen = wasm.cli_keygen_centralized();
const clientShare = keygen.keygen_outputs[0].private_share;
const serverShare = keygen.keygen_outputs[1].private_share;

const combinedPrivateKey = wasm.cli_combine_shares({
  shares: {
    "0": clientShare,
    "1": serverShare,
  },
});

const nonce = randomUUID();
const message = `vana-master-key-v1:${nonce}`;

const py = spawnSync(
  "python3",
  [
    "-c",
    `
import json
import sys

try:
    from eth_account import Account
    from eth_account.messages import encode_defunct
except ImportError:
    sys.stderr.write("Missing Python dependency: eth-account\\n")
    sys.exit(2)

payload = json.loads(sys.stdin.read())
private_key = "0x" + payload["combined_private_key"]
message = payload["message"]

account = Account.from_key(private_key)
signed = Account.sign_message(encode_defunct(text=message), private_key)
recovered = Account.recover_message(encode_defunct(text=message), signature=signed.signature)

print(json.dumps({
    "address": account.address,
    "message": message,
    "signature": signed.signature.hex(),
    "recovered_address": recovered,
    "recovered_matches_address": recovered.lower() == account.address.lower(),
}, indent=2))
`,
  ],
  {
    input: JSON.stringify({
      combined_private_key: combinedPrivateKey,
      message,
    }),
    encoding: "utf8",
  },
);

if (py.status !== 0) {
  process.stderr.write(py.stderr);
  process.exit(py.status ?? 1);
}

const ethProof = JSON.parse(py.stdout);
const result = {
  oko_commit: "c25214e7c401a7e472d4fdff161fe53dffa56555",
  source_function_used_by_export_flow:
    "crypto/tecdsa/cait_sith_keplr_wasm/wasm/src/keygen.rs:201 cli_combine_shares",
  generated_oko_private_key_matches_combined:
    keygen.private_key.toLowerCase() === combinedPrivateKey.toLowerCase(),
  public_key_from_keygen: keygen.keygen_outputs[0].public_key,
  client_share_present: Boolean(clientShare),
  server_share_present: Boolean(serverShare),
  ...ethProof,
};

console.log(JSON.stringify(result, null, 2));
process.exit(
  result.generated_oko_private_key_matches_combined &&
    result.recovered_matches_address
    ? 0
    : 1,
);

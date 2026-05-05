/**
 * Build a Web3Signed Authorization header for a Personal Server request.
 *
 * Wire format (matches personal-server-ts/packages/core/src/auth/web3-signed.ts):
 *
 *   Authorization: Web3Signed {base64url(payload)}.{signature}
 *
 *   payload = JSON({
 *     aud: <ps origin>,
 *     bodyHash: "sha256:<hex>",
 *     exp: <unix sec>,
 *     iat: <unix sec>,
 *     method: "GET" | "POST" | ...,
 *     uri: "/v1/data/<scope>",
 *     grantId: <on-chain grant id, optional>,
 *   }) with sorted keys, signed via EIP-191 (personal_sign) by the builder
 *   key registered as the grant's grantee.
 *
 * Memory App holds the grantee private key (`MEMORY_APP_GRANTEE_PRIVATE_KEY`)
 * server-side; signing happens in the route handler so the key never leaves
 * the lambda.
 */

import { createHash } from "node:crypto";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const SHA256_EMPTY =
  "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function base64url(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hashBody(body: string | undefined): string {
  if (!body || body.length === 0) return SHA256_EMPTY;
  const digest = createHash("sha256").update(body, "utf-8").digest("hex");
  return `sha256:${digest}`;
}

export type BuildWeb3SignedHeaderInput = {
  privateKey: Hex;
  aud: string;
  method: string;
  uri: string;
  /** Raw request body (for hashing). Undefined for GET. */
  body?: string;
  /** On-chain grant id authorizing the request, when calling builder routes. */
  grantId?: string;
  /** Override clock for tests; defaults to now. */
  now?: () => number;
  /** TTL in seconds (default 300). */
  ttlSeconds?: number;
};

export async function buildWeb3SignedHeader(
  input: BuildWeb3SignedHeaderInput,
): Promise<string> {
  const account = privateKeyToAccount(input.privateKey);
  const now = (input.now ?? (() => Math.floor(Date.now() / 1000)))();
  const ttl = input.ttlSeconds ?? 300;

  // Sorted-key serialization is required — server validates the exact bytes.
  const payload: Record<string, unknown> = {
    aud: input.aud,
    bodyHash: hashBody(input.body),
    exp: now + ttl,
    iat: now,
    method: input.method,
    uri: input.uri,
  };
  if (input.grantId !== undefined) payload.grantId = input.grantId;

  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = payload[k];
      return acc;
    }, {});
  const encoded = base64url(JSON.stringify(sorted));
  const signature = await account.signMessage({ message: encoded });
  return `Web3Signed ${encoded}.${signature}`;
}

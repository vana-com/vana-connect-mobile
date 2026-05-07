// TEMPORARY POC SCAFFOLDING — not a real capability token.
// `fixtureRef` is a base64url-encoded JSON selector that picks which canned
// fixture the fake Personal Server returns. It is NOT signed, NOT authenticated,
// and MUST be replaced before any non-POC use. No HMAC. No expiry. No secret.

import { randomBytes } from "node:crypto";
import {
  DPV2_POC_DATASET,
  DPV2_POC_FIXTURE_REF_VERSION,
  type Dpv2FixtureRefPayload,
  type Dpv2PocScenario,
  type Dpv2PocScope,
} from "./contracts";

function b64urlEncode(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function b64urlDecode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function buildFixturePayload({
  scope,
  ownerSub,
  scenario,
}: {
  scope: Dpv2PocScope;
  ownerSub: string;
  scenario: Dpv2PocScenario;
}): Dpv2FixtureRefPayload {
  return {
    version: DPV2_POC_FIXTURE_REF_VERSION,
    dataset: DPV2_POC_DATASET,
    scope,
    ownerSub,
    scenario,
    createdAt: new Date().toISOString(),
    nonce: randomBytes(12).toString("base64url"),
  };
}

export function encodeFixtureRef(payload: Dpv2FixtureRefPayload): string {
  return b64urlEncode(JSON.stringify(payload));
}

export type DecodeFixtureRefResult =
  | { ok: true; payload: Dpv2FixtureRefPayload }
  | {
      ok: false;
      error: "malformed" | "wrong_dataset" | "wrong_version";
    };

export function decodeFixtureRef(ref: string): DecodeFixtureRefResult {
  if (!ref || typeof ref !== "string") {
    return { ok: false, error: "malformed" };
  }
  let payload: Dpv2FixtureRefPayload;
  try {
    payload = JSON.parse(b64urlDecode(ref).toString("utf8"));
  } catch {
    return { ok: false, error: "malformed" };
  }
  if (payload.dataset !== DPV2_POC_DATASET) {
    return { ok: false, error: "wrong_dataset" };
  }
  if (payload.version !== DPV2_POC_FIXTURE_REF_VERSION) {
    return { ok: false, error: "wrong_version" };
  }
  return { ok: true, payload };
}

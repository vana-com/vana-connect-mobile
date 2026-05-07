import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  DPV2_POC_DATASET,
  DPV2_POC_HANDLE_VERSION,
  type Dpv2DemoDataHandlePayload,
  type Dpv2PocScenario,
  type Dpv2PocScope,
} from "./contracts";

const DEV_FALLBACK_SECRET =
  "dev-only-dpv2-poc-handle-secret-do-not-use-in-prod";

function getSecret(): string {
  return process.env.DPV2_POC_HANDLE_SECRET || DEV_FALLBACK_SECRET;
}

function b64urlEncode(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function b64urlDecode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function sign(payloadEncoded: string): string {
  return createHmac("sha256", getSecret())
    .update(payloadEncoded)
    .digest("base64url");
}

export function buildHandlePayload({
  scope,
  ownerSub,
  scenario,
  ttlSeconds = 60 * 60,
}: {
  scope: Dpv2PocScope;
  ownerSub: string;
  scenario: Dpv2PocScenario;
  ttlSeconds?: number;
}): Dpv2DemoDataHandlePayload {
  const now = new Date();
  const expiresAt =
    scenario === "expired"
      ? new Date(now.getTime() - 60_000)
      : new Date(now.getTime() + ttlSeconds * 1000);
  return {
    version: DPV2_POC_HANDLE_VERSION,
    dataset: DPV2_POC_DATASET,
    scope,
    ownerSub,
    scenario,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    nonce: randomBytes(12).toString("base64url"),
  };
}

export function signDemoDataHandle(
  payload: Dpv2DemoDataHandlePayload,
): string {
  const encoded = b64urlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export type VerifyHandleResult =
  | { ok: true; payload: Dpv2DemoDataHandlePayload }
  | {
      ok: false;
      error:
        | "malformed"
        | "bad_signature"
        | "wrong_dataset"
        | "wrong_version"
        | "expired";
    };

export function verifyDemoDataHandle(handle: string): VerifyHandleResult {
  if (!handle || typeof handle !== "string") {
    return { ok: false, error: "malformed" };
  }
  const parts = handle.split(".");
  if (parts.length !== 2) {
    return { ok: false, error: "malformed" };
  }
  const [encoded, signature] = parts;
  const expected = sign(encoded);
  const a = b64urlDecode(signature);
  const b = b64urlDecode(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "bad_signature" };
  }

  let payload: Dpv2DemoDataHandlePayload;
  try {
    payload = JSON.parse(b64urlDecode(encoded).toString("utf8"));
  } catch {
    return { ok: false, error: "malformed" };
  }

  if (payload.dataset !== DPV2_POC_DATASET) {
    return { ok: false, error: "wrong_dataset" };
  }
  if (payload.version !== DPV2_POC_HANDLE_VERSION) {
    return { ok: false, error: "wrong_version" };
  }
  const expiresAt = Date.parse(payload.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { ok: false, error: "expired" };
  }
  return { ok: true, payload };
}

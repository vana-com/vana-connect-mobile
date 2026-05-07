import {
  isDpv2PocScope,
  type Dpv2NormalizedActionExchange,
  type Dpv2PocScope,
} from "./contracts";

export type Dpv2NormalizeOptions = {
  demoPsUrl?: string;
};

export type Dpv2NormalizeOk = {
  ok: true;
  value: Dpv2NormalizedActionExchange;
};

export type Dpv2NormalizeErr = {
  ok: false;
  error: string;
};

export type Dpv2NormalizeResult = Dpv2NormalizeOk | Dpv2NormalizeErr;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(record: Record<string, unknown> | null, key: string): string | null {
  if (!record) return null;
  const v = record[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

function extractScopes(source: Record<string, unknown> | null): Dpv2PocScope[] {
  if (!source) return [];
  const candidates = [source.scopes, source.requested_scopes, source.requestedScopes];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      const filtered = c.filter(isDpv2PocScope);
      if (filtered.length > 0) return filtered;
    } else if (typeof c === "string" && isDpv2PocScope(c)) {
      return [c];
    }
  }
  const single =
    pickString(source, "scope") ?? pickString(source, "requested_scope");
  if (single && isDpv2PocScope(single)) return [single];
  return [];
}

export function normalizeActionExchangeResult(
  input: unknown,
  options: Dpv2NormalizeOptions = {},
): Dpv2NormalizeResult {
  const root = asRecord(input);
  if (!root) {
    return { ok: false, error: "Action exchange result was not an object." };
  }

  const payload = asRecord(root.result_payload) ?? root;
  const personalServer = asRecord(payload.personal_server);

  const grantId = pickString(payload, "grantId") ?? pickString(payload, "grant_id");
  const flatPsUrl = pickString(payload, "psUrl");
  const nestedPsUrl =
    pickString(personalServer, "serverUrl") ??
    pickString(personalServer, "server_url");
  const psUrl = options.demoPsUrl ?? flatPsUrl ?? nestedPsUrl;
  const scopes = extractScopes(payload);

  if (!grantId) {
    return { ok: false, error: "Action exchange result was missing grantId." };
  }
  if (!psUrl) {
    return {
      ok: false,
      error: "Action exchange result was missing personal server URL.",
    };
  }

  return {
    ok: true,
    value: {
      grantId,
      psUrl,
      scopes,
      raw: root,
    },
  };
}

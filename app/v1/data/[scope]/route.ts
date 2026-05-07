import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  type Dpv2PocTypedError,
  type Dpv2PsReadFailure,
  type Dpv2PsReadSuccess,
  isDpv2PocScope,
} from "@/lib/dpv2-poc/contracts";
import {
  type ChatGptMemoriesEnvelope,
  getChatGptFixtureEnvelope,
} from "@/lib/dpv2-poc/fixtures";
import { verifyDemoDataHandle } from "@/lib/dpv2-poc/handle";

function fail(
  error: Dpv2PocTypedError,
  message: string,
  status: number,
): NextResponse {
  const body: Dpv2PsReadFailure = { ok: false, error, message, status };
  return NextResponse.json(body, { status });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scope: string }> },
) {
  const { scope } = await context.params;

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return fail(
      "grant_invalid",
      "Missing Authorization header",
      401,
    );
  }

  const handle = request.headers.get("x-dpv2-demo-data-handle");
  if (!handle) {
    return fail(
      "invalid_demo_data_handle",
      "Missing x-dpv2-demo-data-handle header",
      401,
    );
  }

  if (!isDpv2PocScope(scope)) {
    return fail("scope_not_allowed", `Unsupported scope: ${scope}`, 403);
  }

  const verified = verifyDemoDataHandle(handle);
  if (!verified.ok) {
    if (verified.error === "expired") {
      return fail(
        "invalid_demo_data_handle",
        "Demo data handle expired",
        401,
      );
    }
    return fail(
      "invalid_demo_data_handle",
      `Invalid demo data handle: ${verified.error}`,
      401,
    );
  }

  const payload = verified.payload;

  if (payload.scenario === "expired") {
    return fail(
      "invalid_demo_data_handle",
      "Demo data handle expired",
      401,
    );
  }

  if (payload.scenario === "revoked") {
    return fail("grant_revoked", "Grant was revoked by the user", 403);
  }

  if (payload.scope !== scope) {
    return fail(
      "scope_not_allowed",
      `Handle scope ${payload.scope} does not match request scope ${scope}`,
      403,
    );
  }

  const envelope: ChatGptMemoriesEnvelope = getChatGptFixtureEnvelope({
    scope: payload.scope,
    scenario: payload.scenario,
  });

  const requestId =
    request.headers.get("x-request-id") ?? `req_${randomUUID()}`;
  const grantId = request.headers.get("x-dpv2-grant-id") ?? "demo-grant";

  const response: Dpv2PsReadSuccess<ChatGptMemoriesEnvelope> = {
    ok: true,
    scope: payload.scope,
    data: envelope,
    accessEvent: {
      accessEventId: `evt_${randomUUID()}`,
      grantId,
      scope: payload.scope,
      requestId,
      occurredAt: new Date().toISOString(),
    },
  };
  return NextResponse.json(response);
}

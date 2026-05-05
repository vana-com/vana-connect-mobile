import { NextRequest, NextResponse } from "next/server";
import {
  clearActionStateCookie,
  forwardToAccountService,
  getAccountActionConfig,
  PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE,
  readActionStateCookie,
} from "../../../../dev/login-with-vana/actions/_lib/account-actions";

export const runtime = "nodejs";

type ExchangeRequestBody = {
  action_code?: unknown;
  state?: unknown;
};

export async function POST(request: NextRequest) {
  const config = getAccountActionConfig(PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);

  let body: ExchangeRequestBody;
  try {
    body = (await request.json()) as ExchangeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const actionCode =
    typeof body.action_code === "string" ? body.action_code : null;
  const providedState = typeof body.state === "string" ? body.state : null;

  if (!actionCode) {
    const response = NextResponse.json(
      { error: "Missing action_code" },
      { status: 400 },
    );
    clearActionStateCookie(response, PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
    return response;
  }

  const expectedState = readActionStateCookie(request);
  if (!expectedState || !providedState || expectedState !== providedState) {
    const response = NextResponse.json(
      { error: "State mismatch - request rejected" },
      { status: 400 },
    );
    clearActionStateCookie(response, PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
    return response;
  }

  const result = await forwardToAccountService(
    "/api/account/actions/exchange",
    {
      client_id: config.clientId,
      action_code: actionCode,
    },
  );

  if (!result.ok) {
    const response = NextResponse.json(
      { error: result.error, details: result.details ?? null },
      { status: result.status },
    );
    clearActionStateCookie(response, PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
    return response;
  }

  const response = NextResponse.json({ ok: true, result: result.json });
  clearActionStateCookie(response, PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
  return response;
}

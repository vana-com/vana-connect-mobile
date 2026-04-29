import { NextRequest, NextResponse } from "next/server";
import {
  createOpaqueState,
  forwardToAccountService,
  getAccountActionConfig,
  PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE,
  setActionStateCookie,
} from "../../../../dev/login-with-vana/actions/_lib/account-actions";

export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  const config = getAccountActionConfig(PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
  const state = createOpaqueState();

  const body = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    action_type: "data.read.chatgpt",
    execution_mode: "mock",
    result_mode: "mock",
    requested_data: {
      connector: "chatgpt-playwright",
      scopes: ["chatgpt.memories", "chatgpt.conversations"],
      purposeCode: "memory-app.chatgpt-import",
      purposeDescription:
        "Let Memory App build memory from your ChatGPT memories and conversation history.",
      accessMode: "read_until_revoked",
    },
    display_metadata: {
      title: "Share ChatGPT data with Memory App",
      description:
        "Memory App wants access to your ChatGPT memories and conversation history.",
    },
    state,
  };

  const result = await forwardToAccountService("/api/account/actions", body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, details: result.details ?? null },
      { status: result.status },
    );
  }

  const actionUrl =
    typeof result.json.action_url === "string" ? result.json.action_url : null;
  const actionId =
    typeof result.json.action_request_id === "string"
      ? result.json.action_request_id
      : null;

  if (!actionUrl) {
    return NextResponse.json(
      {
        error: "Account service did not return action_url",
        details: result.json,
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json({
    action_url: actionUrl,
    action_id: actionId,
    state,
  });
  setActionStateCookie(response, state, PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE);
  return response;
}

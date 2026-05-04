import { randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { DemoJson } from "../../types";

export const ACCOUNT_ACTION_COOKIES = {
  state: "vana_demo_action_state",
} as const;

const ACTION_STATE_MAX_AGE_SECONDS = 10 * 60;

export type LoginWithVanaActionSurface = {
  basePath: string;
  actionRedirectUriEnv?: string;
};

export const DEV_LOGIN_WITH_VANA_ACTION_SURFACE: LoginWithVanaActionSurface = {
  basePath: "/dev/login-with-vana",
  actionRedirectUriEnv: "VANA_DEMO_ACTION_REDIRECT_URI",
};

export const PUBLIC_LOGIN_WITH_VANA_ACTION_SURFACE: LoginWithVanaActionSurface =
  {
    basePath: "/demo/login-with-vana",
    actionRedirectUriEnv: "VANA_DEMO_PUBLIC_ACTION_REDIRECT_URI",
  };

/**
 * Execution / result modes for action requests forwarded to account.vana.org.
 *
 * Defaults stay at "mock" so existing demo flows keep working without
 * config changes. Set VANA_DEMO_ACTION_EXECUTION_MODE / RESULT_MODE on the
 * Memory App's deployment to switch into real-grant territory:
 *   - "embedded_wallet_account_hosted" : real grant minted on the user's
 *     Personal Server via account.vana.org backend (BUI-372).
 *   - "byo_wallet_client_signed", "delegated_runtime" : reserved.
 */
const SUPPORTED_EXECUTION_MODES = [
  "mock",
  "embedded_wallet_account_hosted",
  "byo_wallet_client_signed",
  "delegated_runtime",
] as const;
type AccountActionExecutionMode = (typeof SUPPORTED_EXECUTION_MODES)[number];

const SUPPORTED_RESULT_MODES = ["mock", "encrypted_bundle_reference"] as const;
type AccountActionResultMode = (typeof SUPPORTED_RESULT_MODES)[number];

function readExecutionMode(): AccountActionExecutionMode {
  const raw = (process.env.VANA_DEMO_ACTION_EXECUTION_MODE ?? "").trim();
  if (
    raw &&
    (SUPPORTED_EXECUTION_MODES as readonly string[]).includes(raw)
  ) {
    return raw as AccountActionExecutionMode;
  }
  return "mock";
}

function readResultMode(): AccountActionResultMode {
  const raw = (process.env.VANA_DEMO_ACTION_RESULT_MODE ?? "").trim();
  if (raw && (SUPPORTED_RESULT_MODES as readonly string[]).includes(raw)) {
    return raw as AccountActionResultMode;
  }
  return "mock";
}

export type AccountActionConfig = {
  serviceUrl: string;
  clientId: string;
  redirectUri: string;
  executionMode: AccountActionExecutionMode;
  resultMode: AccountActionResultMode;
};

export function getAccountActionConfig(
  surface: LoginWithVanaActionSurface = DEV_LOGIN_WITH_VANA_ACTION_SURFACE,
  appOrigin?: string,
): AccountActionConfig {
  return {
    serviceUrl: trimTrailingSlash(
      process.env.VANA_DEMO_ACCOUNT_SERVICE_URL ?? "http://localhost:3000",
    ),
    clientId: process.env.VANA_DEMO_OIDC_CLIENT_ID ?? "memory-app-dev",
    redirectUri:
      readSurfaceEnv(surface.actionRedirectUriEnv) ??
      `${getDemoAppOrigin(appOrigin)}${surface.basePath}`,
    executionMode: readExecutionMode(),
    resultMode: readResultMode(),
  };
}

export function createOpaqueState() {
  return randomBytes(24).toString("base64url");
}

export function setActionStateCookie(
  response: NextResponse,
  value: string,
  surface: LoginWithVanaActionSurface = DEV_LOGIN_WITH_VANA_ACTION_SURFACE,
) {
  response.cookies.set(ACCOUNT_ACTION_COOKIES.state, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: surface.basePath,
    maxAge: ACTION_STATE_MAX_AGE_SECONDS,
  });
}

export function readActionStateCookie(request: NextRequest) {
  return request.cookies.get(ACCOUNT_ACTION_COOKIES.state)?.value ?? null;
}

export function clearActionStateCookie(
  response: NextResponse,
  surface: LoginWithVanaActionSurface = DEV_LOGIN_WITH_VANA_ACTION_SURFACE,
) {
  response.cookies.set(ACCOUNT_ACTION_COOKIES.state, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: surface.basePath,
    maxAge: 0,
  });
}

export type AccountServiceForwardResult =
  | { ok: true; status: number; json: Record<string, DemoJson> }
  | { ok: false; status: number; error: string; details?: unknown };

export async function forwardToAccountService(
  path: string,
  body: unknown,
): Promise<AccountServiceForwardResult> {
  const config = getAccountActionConfig();
  const url = `${config.serviceUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error:
        error instanceof Error
          ? `Account service unreachable at ${url}: ${error.message}`
          : `Account service unreachable at ${url}`,
    };
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      isRecord(parsed) &&
      typeof (parsed as Record<string, unknown>).error === "string"
        ? ((parsed as Record<string, unknown>).error as string)
        : `Account service responded with ${response.status}`;
    return {
      ok: false,
      status: response.status,
      error: errorMessage,
      details: parsed ?? text,
    };
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      status: 502,
      error: "Account service returned a non-JSON object response",
      details: text,
    };
  }

  return {
    ok: true,
    status: response.status,
    json: parsed as Record<string, DemoJson>,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getDemoAppOrigin(appOrigin?: string) {
  return trimTrailingSlash(
    process.env.VANA_DEMO_APP_ORIGIN ?? appOrigin ?? "http://localhost:3084",
  );
}

function readSurfaceEnv(name: string | undefined) {
  return name ? process.env[name] : undefined;
}

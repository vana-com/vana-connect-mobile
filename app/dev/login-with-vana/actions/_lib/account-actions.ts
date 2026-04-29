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

export type AccountActionConfig = {
  serviceUrl: string;
  clientId: string;
  redirectUri: string;
};

export function getAccountActionConfig(
  surface: LoginWithVanaActionSurface = DEV_LOGIN_WITH_VANA_ACTION_SURFACE,
): AccountActionConfig {
  return {
    serviceUrl: trimTrailingSlash(
      process.env.VANA_DEMO_ACCOUNT_SERVICE_URL ?? "http://localhost:3000",
    ),
    clientId: process.env.VANA_DEMO_OIDC_CLIENT_ID ?? "memory-app-dev",
    redirectUri:
      readSurfaceEnv(surface.actionRedirectUriEnv) ??
      `${getDemoAppOrigin()}${surface.basePath}`,
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

function getDemoAppOrigin() {
  return trimTrailingSlash(
    process.env.VANA_DEMO_APP_ORIGIN ?? "http://localhost:3084",
  );
}

function readSurfaceEnv(name: string | undefined) {
  return name ? process.env[name] : undefined;
}

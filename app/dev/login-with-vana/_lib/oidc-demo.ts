import { createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { DemoJson, DemoSession } from "../types";

export const OIDC_DEMO_COOKIES = {
  pkceVerifier: "vana_demo_pkce_verifier",
  state: "vana_demo_oidc_state",
  nonce: "vana_demo_oidc_nonce",
  session: "vana_demo_login_session",
} as const;

const TRANSIENT_MAX_AGE_SECONDS = 10 * 60;
const SESSION_MAX_AGE_SECONDS = 60 * 60;

export type LoginWithVanaOidcSurface = {
  basePath: string;
  oidcRedirectUriEnv?: string;
};

export const DEV_LOGIN_WITH_VANA_OIDC_SURFACE: LoginWithVanaOidcSurface = {
  basePath: "/dev/login-with-vana",
  oidcRedirectUriEnv: "VANA_DEMO_OIDC_REDIRECT_URI",
};

export const PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE: LoginWithVanaOidcSurface = {
  basePath: "/demo/login-with-vana",
  oidcRedirectUriEnv: "VANA_DEMO_PUBLIC_OIDC_REDIRECT_URI",
};

export type OidcDemoConfig = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  audience: string | null;
};

export type OidcDiscovery = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
};

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

type JwtClaims = Record<string, DemoJson | undefined>;

export function getOidcDemoConfig(
  surface: LoginWithVanaOidcSurface = DEV_LOGIN_WITH_VANA_OIDC_SURFACE,
): OidcDemoConfig {
  return {
    issuer: trimTrailingSlash(
      process.env.VANA_DEMO_OIDC_ISSUER ?? "http://127.0.0.1:4444",
    ),
    clientId: process.env.VANA_DEMO_OIDC_CLIENT_ID ?? "memory-app-dev",
    redirectUri:
      readSurfaceEnv(surface.oidcRedirectUriEnv) ??
      `${getDemoAppOrigin()}${surface.basePath}/callback`,
    scope:
      process.env.VANA_DEMO_OIDC_SCOPE ?? "openid profile email offline_access",
    audience: process.env.VANA_DEMO_OIDC_AUDIENCE ?? null,
  };
}

export async function discoverOidc(issuer: string): Promise<OidcDiscovery> {
  const response = await fetch(
    `${trimTrailingSlash(issuer)}/.well-known/openid-configuration`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`OIDC discovery failed: ${response.status}`);
  }

  return response.json();
}

export function createPkcePair() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function createOpaqueValue() {
  return base64url(randomBytes(24));
}

export async function exchangeCodeForTokens({
  code,
  codeVerifier,
  config,
  discovery,
}: {
  code: string;
  codeVerifier: string;
  config: OidcDemoConfig;
  discovery: OidcDiscovery;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  const json = parseJson(text);

  if (!response.ok) {
    const description =
      typeof json?.error_description === "string"
        ? json.error_description
        : typeof json?.error === "string"
          ? json.error
          : text;
    throw new Error(`Token exchange failed: ${response.status} ${description}`);
  }

  return json as TokenResponse;
}

export async function fetchUserInfo(
  discovery: OidcDiscovery,
  accessToken?: string,
) {
  if (!accessToken || !discovery.userinfo_endpoint) return null;

  const response = await fetch(discovery.userinfo_endpoint, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const json = await response.json();
  return isRecord(json) ? (json as Record<string, DemoJson>) : null;
}

export function buildDemoSession({
  tokens,
  userInfo,
  config,
  expectedNonce,
}: {
  tokens: TokenResponse;
  userInfo: Record<string, DemoJson> | null;
  config: OidcDemoConfig;
  expectedNonce: string;
}): DemoSession {
  const idClaims = readJwtPayload(tokens.id_token);
  const audience = normalizeAudience(idClaims?.aud);
  const subject =
    asString(idClaims?.sub) ?? asString(userInfo?.sub) ?? "unknown";
  const nonce = asString(idClaims?.nonce);

  return {
    subject,
    vanaUserId: asString(idClaims?.vana_user_id) ?? null,
    issuer: asString(idClaims?.iss) ?? null,
    audience,
    scope: splitScope(tokens.scope),
    clientId: config.clientId,
    nonceVerified: nonce ? nonce === expectedNonce : null,
    tokenType: tokens.token_type ?? null,
    hasAccessToken: Boolean(tokens.access_token),
    hasRefreshToken: Boolean(tokens.refresh_token),
    userInfo,
    issuedAt: new Date().toISOString(),
  };
}

export function readDemoSessionCookie(
  request: NextRequest,
): DemoSession | null {
  const raw = request.cookies.get(OIDC_DEMO_COOKIES.session)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return isRecord(parsed) && typeof parsed.subject === "string"
      ? (parsed as DemoSession)
      : null;
  } catch {
    return null;
  }
}

export function setTransientCookie(
  response: NextResponse,
  name: string,
  value: string,
  surface: LoginWithVanaOidcSurface = DEV_LOGIN_WITH_VANA_OIDC_SURFACE,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: surface.basePath,
    maxAge: TRANSIENT_MAX_AGE_SECONDS,
  });
}

export function setDemoSessionCookie(
  response: NextResponse,
  session: DemoSession,
  surface: LoginWithVanaOidcSurface = DEV_LOGIN_WITH_VANA_OIDC_SURFACE,
) {
  response.cookies.set(OIDC_DEMO_COOKIES.session, serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: surface.basePath,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearOidcDemoCookies(
  response: NextResponse,
  surface: LoginWithVanaOidcSurface = DEV_LOGIN_WITH_VANA_OIDC_SURFACE,
) {
  for (const name of Object.values(OIDC_DEMO_COOKIES)) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: surface.basePath,
      maxAge: 0,
    });
  }
}

export function redirectToFixture(
  request: NextRequest,
  params: Record<string, string>,
  surface: LoginWithVanaOidcSurface = DEV_LOGIN_WITH_VANA_OIDC_SURFACE,
) {
  const url = new URL(surface.basePath, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function serializeSession(session: DemoSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function readJwtPayload(token: string | undefined): JwtClaims | null {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return isRecord(parsed) ? (parsed as JwtClaims) : null;
  } catch {
    return null;
  }
}

function splitScope(scope: string | undefined) {
  return scope?.split(" ").filter(Boolean) ?? [];
}

function normalizeAudience(value: DemoJson | undefined) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value))
    return value.filter((entry): entry is string => typeof entry === "string");
  return [];
}

function asString(value: DemoJson | undefined) {
  return typeof value === "string" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function base64url(value: Buffer) {
  return value.toString("base64url");
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

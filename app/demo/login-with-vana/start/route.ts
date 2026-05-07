import { NextRequest, NextResponse } from "next/server";
import {
  createOpaqueValue,
  createPkcePair,
  discoverOidc,
  getOidcDemoConfig,
  OIDC_DEMO_COOKIES,
  PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
  redirectToFixture,
  setTransientCookie,
} from "../../../dev/login-with-vana/_lib/oidc-demo";

export const runtime = "nodejs";

const POST_LOGIN_INTENT_COOKIE = "memory_demo_post_login_intent";
const POST_LOGIN_INTENT_IMPORT = "import_chatgpt";
const POST_LOGIN_RETURN_TO_COOKIE = "memory_demo_post_login_return_to";

export async function GET(request: NextRequest) {
  try {
    const config = getOidcDemoConfig(
      PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
      request.nextUrl.origin,
    );
    const discovery = await discoverOidc(config.issuer);
    const pkce = createPkcePair();
    const state = createOpaqueValue();
    const nonce = createOpaqueValue();

    const authorizationUrl = new URL(discovery.authorization_endpoint);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizationUrl.searchParams.set("scope", config.scope);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("code_challenge", pkce.challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    if (config.audience) {
      authorizationUrl.searchParams.set("audience", config.audience);
    }

    const response = NextResponse.redirect(authorizationUrl);
    if (request.nextUrl.searchParams.get("intent") === "import") {
      response.cookies.set(POST_LOGIN_INTENT_COOKIE, POST_LOGIN_INTENT_IMPORT, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE.basePath,
        maxAge: 10 * 60,
      });
    }
    const returnTo = normalizeReturnTo(
      request.nextUrl.searchParams.get("return_to"),
    );
    if (returnTo) {
      response.cookies.set(POST_LOGIN_RETURN_TO_COOKIE, returnTo, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE.basePath,
        maxAge: 10 * 60,
      });
    }
    setTransientCookie(
      response,
      OIDC_DEMO_COOKIES.pkceVerifier,
      pkce.verifier,
      PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
    );
    setTransientCookie(
      response,
      OIDC_DEMO_COOKIES.state,
      state,
      PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
    );
    setTransientCookie(
      response,
      OIDC_DEMO_COOKIES.nonce,
      nonce,
      PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
    );
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OIDC start failed";
    return NextResponse.redirect(
      redirectToFixture(
        request,
        { error: message },
        PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
      ),
    );
  }
}

function normalizeReturnTo(value: string | null) {
  if (!value || value.includes("\\") || value.startsWith("//")) return null;
  if (!value.startsWith(PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE.basePath)) {
    return null;
  }

  try {
    const url = new URL(value, "http://local.test");
    if (url.origin !== "http://local.test") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

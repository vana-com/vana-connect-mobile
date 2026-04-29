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

export async function GET(request: NextRequest) {
  try {
    const config = getOidcDemoConfig(PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE);
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

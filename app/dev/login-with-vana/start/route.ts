import { NextRequest, NextResponse } from "next/server";
import {
  createOpaqueValue,
  createPkcePair,
  discoverOidc,
  getOidcDemoConfig,
  OIDC_DEMO_COOKIES,
  redirectToFixture,
  setTransientCookie,
} from "../_lib/oidc-demo";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const config = getOidcDemoConfig();
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
    setTransientCookie(response, OIDC_DEMO_COOKIES.pkceVerifier, pkce.verifier);
    setTransientCookie(response, OIDC_DEMO_COOKIES.state, state);
    setTransientCookie(response, OIDC_DEMO_COOKIES.nonce, nonce);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OIDC start failed";
    return NextResponse.redirect(
      redirectToFixture(request, { error: message }),
    );
  }
}

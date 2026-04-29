import { NextRequest, NextResponse } from "next/server";
import {
  buildDemoSession,
  clearOidcDemoCookies,
  discoverOidc,
  exchangeCodeForTokens,
  fetchUserInfo,
  getOidcDemoConfig,
  OIDC_DEMO_COOKIES,
  redirectToFixture,
  setDemoSessionCookie,
} from "../_lib/oidc-demo";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  if (error) {
    const description = searchParams.get("error_description") ?? error;
    return NextResponse.redirect(
      redirectToFixture(request, { error: description }),
    );
  }

  try {
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const expectedState = request.cookies.get(OIDC_DEMO_COOKIES.state)?.value;
    const codeVerifier = request.cookies.get(
      OIDC_DEMO_COOKIES.pkceVerifier,
    )?.value;
    const expectedNonce = request.cookies.get(OIDC_DEMO_COOKIES.nonce)?.value;

    if (!code) throw new Error("Missing authorization code");
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      throw new Error("OIDC state mismatch");
    }
    if (!codeVerifier || !expectedNonce) {
      throw new Error("Missing PKCE verifier or nonce cookie");
    }

    const config = getOidcDemoConfig();
    const discovery = await discoverOidc(config.issuer);
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      config,
      discovery,
    });
    const userInfo = await fetchUserInfo(discovery, tokens.access_token);
    const session = buildDemoSession({
      tokens,
      userInfo,
      config,
      expectedNonce,
    });

    const response = NextResponse.redirect(
      redirectToFixture(request, { login: "success" }),
    );
    clearOidcDemoCookies(response);
    setDemoSessionCookie(response, session);
    return response;
  } catch (caught) {
    const response = NextResponse.redirect(
      redirectToFixture(request, {
        error:
          caught instanceof Error ? caught.message : "OIDC callback failed",
      }),
    );
    clearOidcDemoCookies(response);
    return response;
  }
}

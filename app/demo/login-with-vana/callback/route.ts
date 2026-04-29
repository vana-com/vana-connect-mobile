import { NextRequest, NextResponse } from "next/server";
import {
  buildDemoSession,
  clearOidcDemoCookies,
  discoverOidc,
  exchangeCodeForTokens,
  fetchUserInfo,
  getOidcDemoConfig,
  OIDC_DEMO_COOKIES,
  PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
  redirectToFixture,
  setDemoSessionCookie,
} from "../../../dev/login-with-vana/_lib/oidc-demo";

export const runtime = "nodejs";

const POST_LOGIN_INTENT_COOKIE = "memory_demo_post_login_intent";
const POST_LOGIN_INTENT_IMPORT = "import_chatgpt";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  if (error) {
    const description = searchParams.get("error_description") ?? error;
    return NextResponse.redirect(
      redirectToFixture(
        request,
        { error: description },
        PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
      ),
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

    const config = getOidcDemoConfig(PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE);
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
    const shouldImportAfterLogin =
      request.cookies.get(POST_LOGIN_INTENT_COOKIE)?.value ===
      POST_LOGIN_INTENT_IMPORT;

    const response = NextResponse.redirect(
      redirectToFixture(
        request,
        {
          login: "success",
          ...(shouldImportAfterLogin ? { intent: "import" } : {}),
        },
        PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
      ),
    );
    clearOidcDemoCookies(response, PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE);
    response.cookies.set(POST_LOGIN_INTENT_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE.basePath,
      maxAge: 0,
    });
    setDemoSessionCookie(
      response,
      session,
      PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
    );
    return response;
  } catch (caught) {
    const response = NextResponse.redirect(
      redirectToFixture(
        request,
        {
          error:
            caught instanceof Error ? caught.message : "OIDC callback failed",
        },
        PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
      ),
    );
    clearOidcDemoCookies(response, PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE);
    response.cookies.set(POST_LOGIN_INTENT_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE.basePath,
      maxAge: 0,
    });
    return response;
  }
}

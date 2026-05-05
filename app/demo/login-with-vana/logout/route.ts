import { NextResponse } from "next/server";
import {
  clearOidcDemoCookies,
  PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE,
} from "../../../dev/login-with-vana/_lib/oidc-demo";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearOidcDemoCookies(response, PUBLIC_LOGIN_WITH_VANA_OIDC_SURFACE);
  return response;
}

import { NextResponse } from "next/server";
import { clearOidcDemoCookies } from "../_lib/oidc-demo";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearOidcDemoCookies(response);
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { readDemoSessionCookie } from "../../../dev/login-with-vana/_lib/oidc-demo";

export async function GET(request: NextRequest) {
  const session = readDemoSessionCookie(request);
  return NextResponse.json({ loggedIn: Boolean(session), session });
}

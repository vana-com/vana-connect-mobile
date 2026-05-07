import { NextResponse, type NextRequest } from "next/server";
import { readDemoSessionCookie } from "@/app/dev/login-with-vana/_lib/oidc-demo";
import {
  type Dpv2PocScenario,
  type Dpv2PsIngressResponse,
  isDpv2PocScope,
} from "@/lib/dpv2-poc/contracts";
import {
  buildFixturePayload,
  encodeFixtureRef,
} from "@/lib/dpv2-poc/fixture-ref";

const VALID_SCENARIOS: Dpv2PocScenario[] = [
  "happy_path",
  "empty",
  "revoked",
];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scope: string }> },
) {
  const session = readDemoSessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const { scope } = await context.params;
  if (!isDpv2PocScope(scope)) {
    return NextResponse.json(
      { error: "scope_not_allowed", message: `Unsupported scope: ${scope}` },
      { status: 400 },
    );
  }

  let scenario: Dpv2PocScenario = "happy_path";
  try {
    const body = await request.json().catch(() => ({}));
    if (
      body &&
      typeof body === "object" &&
      typeof body.scenario === "string" &&
      VALID_SCENARIOS.includes(body.scenario as Dpv2PocScenario)
    ) {
      scenario = body.scenario as Dpv2PocScenario;
    }
  } catch {
    // ignore body parse errors; default scenario
  }

  const ownerSub = session.vanaUserId ?? session.subject;
  const fixturePayload = buildFixturePayload({ scope, ownerSub, scenario });
  const fixtureRef = encodeFixtureRef(fixturePayload);

  const response: Dpv2PsIngressResponse = {
    ok: true,
    psUrl: request.nextUrl.origin,
    scope,
    ownerSub,
    fixtureRef,
    fixturePayload,
  };
  return NextResponse.json(response);
}

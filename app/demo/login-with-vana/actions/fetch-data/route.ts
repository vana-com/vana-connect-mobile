/**
 * Fetch real data from the user's Personal Server using a grant minted via
 * the Login with Vana flow.
 *
 * Inputs (POST body):
 *   - grant_id          : on-chain grant id from the action exchange
 *   - personal_server   : { server_id, server_url } from the same exchange
 *   - scope             : e.g. "chatgpt.memories"
 *
 * Memory App authenticates as the grant's grantee — i.e. as itself, using
 * the builder/grantee private key it controls. The PS validates the grant
 * via the Vana data gateway and returns the requested data.
 *
 * Why server-side: the grantee private key is a server secret. It must
 * never reach the client bundle.
 */

import { NextRequest, NextResponse } from "next/server";
import type { Hex } from "viem";
import { buildWeb3SignedHeader } from "../../_lib/web3-signed";

export const runtime = "nodejs";

type FetchDataBody = {
  grant_id?: unknown;
  personal_server?: unknown;
  scope?: unknown;
  demo_data_handle?: unknown;
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

export async function POST(request: NextRequest) {
  const granteeKey = process.env.MEMORY_APP_GRANTEE_PRIVATE_KEY as
    | Hex
    | undefined;
  if (!granteeKey || !granteeKey.startsWith("0x")) {
    return NextResponse.json(
      {
        error:
          "Memory App grantee key is not configured (MEMORY_APP_GRANTEE_PRIVATE_KEY)",
      },
      { status: 500 },
    );
  }

  let body: FetchDataBody;
  try {
    body = (await request.json()) as FetchDataBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const grantId = asString(body.grant_id);
  const ps = asObject(body.personal_server);
  const scope = asString(body.scope);
  const serverUrl = ps ? asString(ps.serverUrl) ?? asString(ps.server_url) : null;
  const demoDataHandle = asString(body.demo_data_handle);

  if (!grantId || !serverUrl || !scope) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: grant_id, personal_server.serverUrl, scope",
      },
      { status: 400 },
    );
  }

  const psOrigin = new URL(serverUrl).origin;
  const uri = `/v1/data/${encodeURIComponent(scope)}`;

  let header: string;
  try {
    header = await buildWeb3SignedHeader({
      privateKey: granteeKey,
      aud: psOrigin,
      method: "GET",
      uri,
      grantId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Failed to sign PS request: ${err.message}`
            : "Failed to sign PS request",
      },
      { status: 500 },
    );
  }

  let psRes: Response;
  try {
    psRes = await fetch(`${psOrigin}${uri}`, {
      method: "GET",
      headers: {
        Authorization: header,
        "x-dpv2-grant-id": grantId,
        ...(demoDataHandle
          ? { "x-dpv2-demo-data-handle": demoDataHandle }
          : {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Personal Server unreachable: ${err.message}`
            : "Personal Server unreachable",
      },
      { status: 502 },
    );
  }

  const text = await psRes.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!psRes.ok) {
    return NextResponse.json(
      {
        error: `Personal Server returned ${psRes.status}`,
        details: parsed ?? text,
      },
      { status: psRes.status },
    );
  }

  return NextResponse.json({ ok: true, data: parsed });
}

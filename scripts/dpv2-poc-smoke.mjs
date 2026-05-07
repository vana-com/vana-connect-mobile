#!/usr/bin/env node
// DPv2 POC HTTP smoke harness.
// Validates seed -> Builder fetch -> fake PS read without a browser.
//
// Run: BASE_URL=http://localhost:3084 node scripts/dpv2-poc-smoke.mjs
//      or: npm run smoke:dpv2

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3084").replace(/\/$/, "");
const SCOPE = "chatgpt.memories";

const failures = [];
let stepNum = 0;

function step(name) {
  stepNum += 1;
  console.log(`\n[${stepNum}] ${name}`);
}

function pass(msg) {
  console.log(`  PASS ${msg}`);
}

function fail(msg) {
  failures.push(msg);
  console.log(`  FAIL ${msg}`);
}

function base64url(buf) {
  return Buffer.from(buf).toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fakeSessionCookie() {
  const session = {
    subject: "smoke-subject",
    vanaUserId: "smoke-vana-user",
    issuer: "http://smoke.invalid",
    audience: ["memory-app-dev"],
    scope: ["openid"],
    clientId: "memory-app-dev",
    nonceVerified: true,
    tokenType: "Bearer",
    hasAccessToken: true,
    hasRefreshToken: false,
    userInfo: null,
    issuedAt: new Date().toISOString(),
  };
  const value = base64url(JSON.stringify(session));
  return `vana_demo_login_session=${value}`;
}

const COOKIE = fakeSessionCookie();

async function postJson(path, body, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: opts.cookie ?? COOKIE,
    },
    body: JSON.stringify(body),
  });
  let parsed = null;
  const text = await res.text();
  if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
  return { status: res.status, body: parsed };
}

async function seed(scenario) {
  const r = await postJson(
    `/demo/login-with-vana/ps-seed/${SCOPE}`,
    { scenario },
  );
  if (r.status !== 200 || !r.body?.fixtureRef) {
    throw new Error(`seed ${scenario} failed: ${r.status} ${JSON.stringify(r.body)}`);
  }
  return r.body.fixtureRef;
}

async function getPs(ref) {
  const res = await fetch(`${BASE_URL}/v1/data/${SCOPE}`, {
    method: "GET",
    headers: {
      authorization: "Web3Signed smoke",
      "x-dpv2-fixture-ref": ref,
      "x-dpv2-grant-id": "smoke-grant",
    },
  });
  let parsed = null;
  const text = await res.text();
  if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
  return { status: res.status, body: parsed };
}

async function main() {
  console.log(`DPv2 smoke harness against ${BASE_URL}`);

  step("Seed happy_path");
  const happyRef = await seed("happy_path");
  pass(`got fixtureRef (len=${happyRef.length})`);

  step("Builder fetch-data happy path with example.com PS URL + fixture_ref");
  {
    const r = await postJson("/demo/login-with-vana/actions/fetch-data", {
      grant_id: "smoke-grant",
      personal_server: { serverUrl: "https://example.com" },
      scope: SCOPE,
      fixture_ref: happyRef,
    });
    if (r.status !== 200) fail(`expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    else pass(`status 200`);
    // Builder wraps PS response: { ok, data: { ok, scope, data: { scope, collectedAt, data: { memories, total } } } }
    const memories = r.body?.data?.data?.data?.memories;
    if (!Array.isArray(memories)) fail(`expected memories array, got ${JSON.stringify(r.body).slice(0, 200)}`);
    else if (memories.length !== 4) fail(`expected 4 memories, got ${memories.length}`);
    else pass(`4 memories returned`);
  }

  step("Builder fetch-data without fixture_ref + example.com PS URL -> 400 not allowed");
  {
    const r = await postJson("/demo/login-with-vana/actions/fetch-data", {
      grant_id: "smoke-grant",
      personal_server: { serverUrl: "https://example.com" },
      scope: SCOPE,
    });
    if (r.status !== 400) fail(`expected 400, got ${r.status}: ${JSON.stringify(r.body)}`);
    else pass(`status 400`);
    const errMsg = r.body?.error ?? "";
    if (!String(errMsg).includes("personal_server.serverUrl is not allowed for this demo")) {
      fail(`expected 'not allowed for this demo' error, got: ${errMsg}`);
    } else pass(`error message matches`);
  }

  step("Direct PS read with revoked fixture_ref -> grant_revoked");
  {
    const ref = await seed("revoked");
    const r = await getPs(ref);
    if (r.status !== 403) fail(`expected 403, got ${r.status}: ${JSON.stringify(r.body)}`);
    else pass(`status 403`);
    if (r.body?.error !== "grant_revoked") fail(`expected error grant_revoked, got: ${r.body?.error}`);
    else pass(`error grant_revoked`);
  }

  step("Direct PS read with malformed fixture_ref -> invalid_fixture_ref");
  {
    const r = await getPs("not-a-fixture-ref");
    if (r.status !== 401) fail(`expected 401, got ${r.status}: ${JSON.stringify(r.body)}`);
    else pass(`status 401`);
    if (r.body?.error !== "invalid_fixture_ref") fail(`expected error invalid_fixture_ref, got: ${r.body?.error}`);
    else pass(`error invalid_fixture_ref`);
  }

  console.log("");
  if (failures.length) {
    console.log(`SMOKE FAILED (${failures.length} failure${failures.length === 1 ? "" : "s"})`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log("SMOKE PASSED");
}

main().catch((err) => {
  console.error(`\nSMOKE ERROR: ${err?.stack ?? err}`);
  process.exit(1);
});

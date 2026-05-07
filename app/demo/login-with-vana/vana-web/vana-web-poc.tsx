"use client";

import { useEffect, useState } from "react";
import type {
  Dpv2PocScenario,
  Dpv2PsIngressResponse,
} from "../../../../lib/dpv2-poc/contracts";
import type { DemoSession } from "../../../dev/login-with-vana/types";

type SessionResponse = {
  loggedIn: boolean;
  session: DemoSession | null;
};

const SCENARIOS: Dpv2PocScenario[] = [
  "happy_path",
  "empty",
  "expired",
  "revoked",
];

export function VanaWebPoc() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [scenario, setScenario] = useState<Dpv2PocScenario>("happy_path");
  const [seeding, setSeeding] = useState(false);
  const [seed, setSeed] = useState<Dpv2PsIngressResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/demo/login-with-vana/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SessionResponse) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) setSession({ loggedIn: false, session: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch(
        "/demo/login-with-vana/ps-seed/chatgpt.memories",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ scenario }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Seed failed (${res.status}): ${text}`);
      }
      const data = (await res.json()) as Dpv2PsIngressResponse;
      setSeed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSeeding(false);
    }
  }

  const builderHref = seed
    ? `/demo/login-with-vana?demo_data_handle=${encodeURIComponent(seed.demoDataHandle)}`
    : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 text-sm">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Vana Web POC</h1>
        <p className="text-neutral-600">
          Seed instant ChatGPT fixture data into the fake PS boundary, then
          hand off to the Builder App.
        </p>
      </header>

      <section className="rounded-md border border-neutral-200 p-4">
        <h2 className="mb-2 font-medium">Session</h2>
        {session === null ? (
          <p className="text-neutral-500">Checking session…</p>
        ) : session.loggedIn && session.session ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-neutral-500">Subject</dt>
            <dd className="font-mono">{session.session.subject}</dd>
            <dt className="text-neutral-500">Issuer</dt>
            <dd className="font-mono">{session.session.issuer ?? "—"}</dd>
          </dl>
        ) : (
          <div className="flex flex-col gap-2">
            <p>Not signed in.</p>
            <a
              className="inline-block w-fit rounded bg-black px-3 py-1.5 text-white"
              href="/demo/login-with-vana/start"
            >
              Sign in with Vana
            </a>
            <p className="text-xs text-neutral-500">
              If sign-in redirects elsewhere, return to this page to continue.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-md border border-neutral-200 p-4">
        <h2 className="mb-3 font-medium">Seed ChatGPT demo data</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <span className="text-neutral-600">Scenario</span>
            <select
              className="rounded border border-neutral-300 px-2 py-1"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Dpv2PocScenario)}
              disabled={seeding}
            >
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="w-fit rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? "Seeding…" : "Use ChatGPT demo data"}
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </section>

      {seed && (
        <section className="rounded-md border border-green-300 bg-green-50 p-4">
          <h2 className="mb-2 font-medium">Seeded</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-neutral-500">Scope</dt>
            <dd className="font-mono">{seed.scope}</dd>
            <dt className="text-neutral-500">Owner subject</dt>
            <dd className="font-mono">{seed.ownerSub}</dd>
            <dt className="text-neutral-500">Handle expires</dt>
            <dd className="font-mono">{seed.handlePayload.expiresAt}</dd>
            <dt className="text-neutral-500">PS URL</dt>
            <dd className="font-mono break-all">{seed.psUrl}</dd>
          </dl>
          {builderHref && (
            <a
              className="mt-3 inline-block rounded bg-black px-3 py-1.5 text-white"
              href={builderHref}
            >
              Open Builder App →
            </a>
          )}
        </section>
      )}
    </main>
  );
}

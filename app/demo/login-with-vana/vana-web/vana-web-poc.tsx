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

const SCENARIO_OPTIONS: Array<{
  value: Dpv2PocScenario;
  label: string;
  description: string;
  psStatus: string;
  psDescription: string;
}> = [
  {
    value: "happy_path",
    label: "Data is ready",
    description:
      "Use this for the main demo: Memory App receives ChatGPT memories after the user approves access.",
    psStatus: "Ready for Memory App",
    psDescription:
      "Memory App will receive registered ChatGPT demo memories after approval.",
  },
  {
    value: "empty",
    label: "No ChatGPT memories",
    description:
      "Use this to check the empty state: Memory App is approved, but there is no ChatGPT memory data to import.",
    psStatus: "Ready for Memory App, no memories",
    psDescription:
      "Memory App will complete the approved read and show an empty import.",
  },
  {
    value: "revoked",
    label: "Grant revoked",
    description:
      "Use this to check access handling: the user approves the flow, but the later data read is refused.",
    psStatus: "Access revoked",
    psDescription:
      "Memory App will receive a revoked-access response and import nothing.",
  },
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

  async function handleLogout() {
    await fetch("/demo/login-with-vana/logout", { method: "POST" });
    setSession({ loggedIn: false, session: null });
    setSeed(null);
    setError(null);
  }

  const builderHref = seed
    ? `/demo/login-with-vana?fixture_ref=${encodeURIComponent(seed.fixtureRef)}`
    : null;
  const selectedScenario = SCENARIO_OPTIONS.find(
    (option) => option.value === scenario,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 text-sm">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Vana Web POC</h1>
        <p className="text-neutral-600">
          Set up a ChatGPT data state, then hand off to Memory App to request
          approved access.
        </p>
      </header>

      <section className="rounded-md border border-neutral-200 p-4">
        <h2 className="mb-2 font-medium">Session</h2>
        {session === null ? (
          <p className="text-neutral-500">Checking session...</p>
        ) : session.loggedIn && session.session ? (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-neutral-500">Subject</dt>
              <dd className="font-mono">{session.session.subject}</dd>
              <dt className="text-neutral-500">Issuer</dt>
              <dd className="font-mono">{session.session.issuer ?? "-"}</dd>
            </dl>
            <button
              type="button"
              className="w-fit rounded border border-neutral-300 px-3 py-1.5 text-neutral-800"
              onClick={handleLogout}
            >
              Clear demo session
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p>Not signed in.</p>
            <a
              className="inline-block w-fit rounded bg-black px-3 py-1.5 text-white"
              href="/demo/login-with-vana/start?return_to=/demo/login-with-vana/vana-web"
            >
              Sign in with Vana
            </a>
          </div>
        )}
      </section>

      <section className="rounded-md border border-neutral-200 p-4">
        <h2 className="mb-3 font-medium">
          Configure ChatGPT demo data
        </h2>
        <p className="mb-3 max-w-xl text-neutral-600">
          This POC does not scrape ChatGPT or query a real Personal Server yet.
          It lets us test the Vana Web, approval, and Memory App read flow while
          those integrations are still being built.
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2">
              <span className="text-neutral-600">Test outcome</span>
              <select
                className="rounded border border-neutral-300 px-2 py-1"
                value={scenario}
                onChange={(e) =>
                  setScenario(e.target.value as Dpv2PocScenario)
                }
                disabled={seeding}
              >
                {SCENARIO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedScenario && (
              <p className="max-w-xl text-neutral-500">
                {selectedScenario.description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="w-fit rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
            onClick={handleSeed}
            disabled={seeding || !session?.loggedIn}
          >
            {seeding ? "Connecting..." : "Connect ChatGPT demo data"}
          </button>
          {session && !session.loggedIn && (
            <p className="text-neutral-500">
              Sign in with Vana before configuring demo data.
            </p>
          )}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </section>

      {seed && (
        <section className="rounded-md border border-green-300 bg-green-50 p-4">
          <h2 className="mb-2 font-medium">ChatGPT demo data connected</h2>
          <p className="mb-3 max-w-xl text-green-900">
            {selectedScenario?.psDescription ??
              "Memory App can now request this demo data after approval."}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-neutral-500">Status</dt>
            <dd>{selectedScenario?.psStatus ?? "Configured"}</dd>
            <dt className="text-neutral-500">Scope</dt>
            <dd className="font-mono">{seed.scope}</dd>
            <dt className="text-neutral-500">Owner subject</dt>
            <dd className="font-mono">{seed.ownerSub}</dd>
            <dt className="text-neutral-500">Test outcome</dt>
            <dd>{selectedScenario?.label ?? seed.fixturePayload.scenario}</dd>
          </dl>
          <details className="mt-3 text-xs text-neutral-600">
            <summary className="cursor-pointer">Debug details</summary>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt>temporary read URL</dt>
              <dd className="font-mono break-all">{seed.psUrl}</dd>
              <dt>fixture_ref</dt>
              <dd className="font-mono break-all">{seed.fixtureRef}</dd>
            </dl>
          </details>
          {builderHref && (
            <a
              className="mt-3 inline-block rounded bg-black px-3 py-1.5 text-white"
              href={builderHref}
            >
              Open Builder App to request this data
            </a>
          )}
        </section>
      )}
    </main>
  );
}

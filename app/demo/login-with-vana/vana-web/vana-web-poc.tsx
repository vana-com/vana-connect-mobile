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
      "Use this for the main demo: ChatGPT memories are available in the Personal Server and the Builder App can read them after approval.",
    psStatus: "Ready for Builder App requests",
    psDescription:
      "ChatGPT demo memories are available from the fake Personal Server. In production, this would be the user's real PS Lite or full Personal Server.",
  },
  {
    value: "empty",
    label: "No ChatGPT memories",
    description:
      "Use this to check the empty state: the connection exists, but the Personal Server has no memories for this scope.",
    psStatus: "Connected with no memories",
    psDescription:
      "The fake Personal Server is reachable, but it will return an empty ChatGPT memories list.",
  },
  {
    value: "invalid_ref",
    label: "Broken fixture reference",
    description:
      "Use this to check error handling when the Builder App asks the Personal Server with an invalid temporary fixture reference.",
    psStatus: "Fixture error armed",
    psDescription:
      "The fake Personal Server will reject the read with invalid_fixture_ref, simulating a broken temporary POC reference.",
  },
  {
    value: "revoked",
    label: "Grant revoked",
    description:
      "Use this to check error handling when the Personal Server refuses a read because access has been revoked.",
    psStatus: "Access revoked",
    psDescription:
      "The fake Personal Server is reachable, but it will refuse the Builder App read with grant_revoked.",
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
          Connect ChatGPT to a Personal Server, then hand off to a Builder App
          that requests approved access.
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
          Connect ChatGPT to Personal Server
        </h2>
        <p className="mb-3 max-w-xl text-neutral-600">
          For the POC, this stands in for the user connecting ChatGPT and having
          data available inside their Personal Server. It does not scrape
          ChatGPT or upload anything; it creates a temporary fixture ref so the
          Builder App can exercise the approval and data-read flow instantly.
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
              Sign in with Vana before connecting data to the Personal Server.
            </p>
          )}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </section>

      {seed && (
        <section className="rounded-md border border-green-300 bg-green-50 p-4">
          <h2 className="mb-2 font-medium">Personal Server (POC)</h2>
          <p className="mb-3 max-w-xl text-green-900">
            {selectedScenario?.psDescription ??
              "The fake Personal Server is configured for this POC run."}
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
            <dt className="text-neutral-500">PS URL</dt>
            <dd className="font-mono break-all">{seed.psUrl}</dd>
            <dt className="text-neutral-500">Fixture ref (temporary POC)</dt>
            <dd className="font-mono break-all">{seed.fixtureRef}</dd>
          </dl>
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

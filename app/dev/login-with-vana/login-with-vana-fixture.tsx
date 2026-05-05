"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AccountActionExchangeResult,
  DemoJson,
  DemoSession,
} from "./types";

type SessionResponse = {
  loggedIn: boolean;
  session: DemoSession | null;
};

type ActionState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "redirecting"; actionId: string | null; actionUrl: string }
  | { status: "exchanging"; actionCode: string }
  | {
      status: "exchanged";
      exchangedAt: string;
      result: Record<string, DemoJson>;
    }
  | { status: "denied"; reason: string }
  | { status: "error"; message: string };

export function LoginWithVanaFixture() {
  const [sessionResponse, setSessionResponse] =
    useState<SessionResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    status: "idle",
  });
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const login = params.get("login");
    if (error) setStatusMessage(`OIDC error: ${error}`);
    if (login === "success") setStatusMessage("OIDC login completed.");

    void refreshSession();

    const actionCode = params.get("action_code");
    const returnedState = params.get("state");
    const actionError = params.get("action_error");

    if (actionError) {
      setActionState({ status: "denied", reason: actionError });
      stripActionParams();
      return;
    }

    if (returnedState && !actionCode) {
      setActionState({
        status: "denied",
        reason:
          "No action_code returned; the account action was denied or cancelled.",
      });
      void clearActionStateAfterDeniedReturn(returnedState);
      stripActionParams();
      return;
    }

    if (actionCode && !exchangeAttempted.current) {
      exchangeAttempted.current = true;
      void exchangeActionCode(actionCode, returnedState);
    }
  }, []);

  async function refreshSession() {
    const response = await fetch("/dev/login-with-vana/session", {
      cache: "no-store",
    });
    setSessionResponse((await response.json()) as SessionResponse);
  }

  async function logOut() {
    await fetch("/dev/login-with-vana/logout", { method: "POST" });
    setActionState({ status: "idle" });
    setStatusMessage(null);
    stripFixtureStatusParams();
    await refreshSession();
  }

  async function requestAction() {
    setActionState({ status: "creating" });
    setStatusMessage(null);

    let response: Response;
    try {
      response = await fetch("/dev/login-with-vana/actions/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      });
    } catch (error) {
      setActionState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to reach action create route",
      });
      return;
    }

    const json = (await response.json().catch(() => null)) as {
      action_url?: string;
      action_id?: string | null;
      error?: string;
    } | null;

    if (!response.ok || !json?.action_url) {
      setActionState({
        status: "error",
        message: json?.error ?? `Action create failed (${response.status})`,
      });
      return;
    }

    setActionState({
      status: "redirecting",
      actionId: json.action_id ?? null,
      actionUrl: json.action_url,
    });
    window.location.href = json.action_url;
  }

  async function exchangeActionCode(actionCode: string, state: string | null) {
    setActionState({ status: "exchanging", actionCode });

    let response: Response;
    try {
      response = await fetch("/dev/login-with-vana/actions/exchange", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action_code: actionCode, state }),
        cache: "no-store",
      });
    } catch (error) {
      setActionState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to reach action exchange route",
      });
      stripActionParams();
      return;
    }

    const json = (await response.json().catch(() => null)) as
      | (AccountActionExchangeResult & { error?: string })
      | { error: string }
      | null;

    stripActionParams();

    if (!response.ok || !json || "error" in json) {
      setActionState({
        status: "error",
        message:
          (json && "error" in json && json.error) ||
          `Action exchange failed (${response.status})`,
      });
      return;
    }

    setActionState({
      status: "exchanged",
      exchangedAt: new Date().toISOString(),
      result: json.result,
    });
  }

  async function clearActionStateAfterDeniedReturn(state: string) {
    await fetch("/dev/login-with-vana/actions/exchange", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state }),
      cache: "no-store",
    }).catch(() => null);
  }

  const session = sessionResponse?.session ?? null;
  const isWorking =
    actionState.status === "creating" ||
    actionState.status === "redirecting" ||
    actionState.status === "exchanging";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8">
        <header className="border-2 border-border bg-card p-5 shadow-2 sm:p-8">
          <p className="mb-3 text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Local headed fixture
          </p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-title font-black">Login with Vana</h1>
              <p className="mt-4 text-body text-foreground-dim">
                This page makes the mobile app behave like a Memory App relying
                party. Login runs against the local Hydra OIDC proof in
                `vana-connect`. The action panel creates a real account-service
                action, redirects you to the account-hosted review page, and
                exchanges the returned `action_code`. Only the final result
                payload is mock.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <a
                className="inline-flex h-button items-center justify-center border-2 border-border bg-primary px-5 text-button font-semibold text-primary-foreground shadow-1 transition-transform hover:-translate-y-0.5"
                href="/dev/login-with-vana/start"
              >
                Login with Vana
              </a>
              <button
                className="inline-flex h-button items-center justify-center border-2 border-border bg-card px-5 text-button font-semibold shadow-1 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!session}
                onClick={logOut}
                type="button"
              >
                Clear client session
              </button>
            </div>
          </div>
          {statusMessage && (
            <p className="mt-5 border-2 border-border bg-highlighter px-4 py-3 text-small font-semibold">
              {statusMessage}
            </p>
          )}
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-2 border-border bg-card p-5 shadow-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Step 1
                </p>
                <h2 className="text-heading font-bold">OIDC session</h2>
              </div>
              <StatusPill
                active={Boolean(session)}
                label={session ? "Signed in" : "No session"}
              />
            </div>

            {session ? (
              <dl className="grid gap-3 text-small">
                <KeyValue label="sub" value={session.subject} />
                <KeyValue
                  label="vana_user_id"
                  value={session.vanaUserId ?? "not present"}
                />
                <KeyValue label="issuer" value={session.issuer ?? "unknown"} />
                <KeyValue
                  label="audience"
                  value={session.audience.join(", ") || "none"}
                />
                <KeyValue
                  label="scope"
                  value={session.scope.join(" ") || "none"}
                />
                <KeyValue label="client_id" value={session.clientId} />
                <KeyValue
                  label="nonce"
                  value={
                    session.nonceVerified === null
                      ? "not returned"
                      : session.nonceVerified
                        ? "verified"
                        : "mismatch"
                  }
                />
                <KeyValue
                  label="tokens"
                  value={[
                    session.hasAccessToken ? "access" : null,
                    session.hasRefreshToken ? "refresh" : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </dl>
            ) : (
              <div className="border-2 border-dashed border-border p-4 text-body text-foreground-dim">
                Start the local Hydra stack, register the `memory-app-dev`
                client, then click Login with Vana. A successful callback stores
                only decoded, non-sensitive session facts in an HTTP-only local
                cookie.
              </div>
            )}
          </div>

          <div className="border-2 border-border bg-accent-subtle p-5 shadow-1">
            <p className="text-fine font-semibold uppercase tracking-[0.12em] text-accent-foreground-dim">
              Account issuer
            </p>
            <h2 className="mt-2 text-heading font-bold">
              Inspect the account side
            </h2>
            <p className="mt-2 text-body text-accent-foreground-dim">
              This fixture logs the client in through OIDC. Use the account
              surface only to inspect the Vana account session, apps, grants,
              and revoke semantics.
            </p>
            <div className="mt-4 grid gap-3">
              <SurfaceLink
                href="http://localhost:3000/account/access"
                label="Open Vana account"
                value="Inspect connected apps, grants, activity, and revoke behavior in the account app."
              />
            </div>
          </div>
        </section>

        <section className="border-2 border-border bg-card p-5 shadow-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Step 2
              </p>
              <h2 className="text-heading font-bold">ChatGPT access request</h2>
              <p className="mt-2 max-w-2xl text-body text-foreground-dim">
                Creates a real action against the account service, sends you to
                its hosted review page, and exchanges the returned
                `action_code`. The returned data is mock — that is the only mock
                part of this flow.
              </p>
            </div>
            <button
              className="inline-flex h-button items-center justify-center border-2 border-border bg-electric-blue px-5 text-button font-semibold text-white shadow-1 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!session || isWorking}
              onClick={requestAction}
              type="button"
            >
              {actionState.status === "creating"
                ? "Creating action…"
                : actionState.status === "redirecting"
                  ? "Redirecting…"
                  : actionState.status === "exchanging"
                    ? "Exchanging…"
                    : "Request ChatGPT access"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ActionCard title="Action type" value="data.read.chatgpt" />
            <ActionCard
              title="Scopes"
              value="chatgpt.memories, chatgpt.conversations"
            />
            <ActionCard
              title="User"
              value={session?.vanaUserId ?? session?.subject ?? "not signed in"}
            />
          </div>

          <ActionPanel state={actionState} />
        </section>
      </div>
    </main>
  );
}

function stripActionParams() {
  const url = new URL(window.location.href);
  for (const key of ["action_code", "state", "action_error"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

function stripFixtureStatusParams() {
  const url = new URL(window.location.href);
  for (const key of ["login", "error"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={
        active
          ? "border-2 border-border bg-success px-3 py-2 text-fine font-bold uppercase tracking-[0.08em]"
          : "border-2 border-border bg-muted px-3 py-2 text-fine font-bold uppercase tracking-[0.08em]"
      }
    >
      {label}
    </span>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-2 border-border bg-muted p-3 sm:grid-cols-[140px_1fr]">
      <dt className="font-mono text-mono uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="break-all font-mono text-small">{value || "none"}</dd>
    </div>
  );
}

function ActionCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-2 border-border bg-muted p-4">
      <p className="text-fine font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 break-all text-body font-semibold">{value}</p>
    </div>
  );
}

function SurfaceLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <a
      className="block border-2 border-border bg-card p-4 shadow-1 transition-transform hover:-translate-y-0.5"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <p className="text-fine font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-body text-foreground-dim">{value}</p>
      <p className="mt-3 break-all font-mono text-small">{href}</p>
    </a>
  );
}

function ActionPanel({ state }: { state: ActionState }) {
  if (state.status === "idle") {
    return (
      <div className="mt-5 border-2 border-dashed border-border p-5 text-body text-foreground-dim">
        No action in flight. Click Request ChatGPT access to create one against
        the account service.
      </div>
    );
  }

  if (state.status === "creating") {
    return (
      <div className="mt-5 border-2 border-border bg-highlighter p-5">
        <p className="font-mono text-mono uppercase tracking-[0.08em]">
          Creating action
        </p>
        <p className="mt-2 text-small text-foreground-dim">
          Forwarding to the account service…
        </p>
      </div>
    );
  }

  if (state.status === "redirecting") {
    return (
      <div className="mt-5 border-2 border-border bg-highlighter p-5">
        <p className="font-mono text-mono uppercase tracking-[0.08em]">
          Redirecting
        </p>
        <p className="mt-3 break-all font-mono text-small">
          action_id={state.actionId ?? "(none)"}
          <br />
          action_url={state.actionUrl}
        </p>
      </div>
    );
  }

  if (state.status === "exchanging") {
    return (
      <div className="mt-5 border-2 border-border bg-highlighter p-5">
        <p className="font-mono text-mono uppercase tracking-[0.08em]">
          Exchanging action_code
        </p>
        <p className="mt-3 break-all font-mono text-small">
          action_code={state.actionCode}
        </p>
      </div>
    );
  }

  if (state.status === "exchanged") {
    return (
      <div className="mt-5 border-2 border-border bg-success p-5 text-success-foreground">
        <p className="font-mono text-mono uppercase tracking-[0.08em]">
          Exchange complete — result payload is mock
        </p>
        <h3 className="mt-2 text-xlarge font-bold">Account service returned</h3>
        <p className="mt-1 text-small">exchanged_at={state.exchangedAt}</p>
        <pre className="mt-4 overflow-x-auto border-2 border-border bg-card p-4 text-mono text-foreground">
          <code>{JSON.stringify(state.result, null, 2)}</code>
        </pre>
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div className="mt-5 border-2 border-border bg-destructive p-5 text-destructive-foreground">
        <p className="font-mono text-mono uppercase tracking-[0.08em]">
          Action denied
        </p>
        <p className="mt-3 break-all font-mono text-small">
          reason={state.reason}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-2 border-border bg-destructive p-5 text-destructive-foreground">
      <p className="font-mono text-mono uppercase tracking-[0.08em]">
        Action error
      </p>
      <p className="mt-3 break-all font-mono text-small">{state.message}</p>
    </div>
  );
}

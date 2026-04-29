"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AccountActionExchangeResult,
  DemoJson,
  DemoSession,
} from "../../dev/login-with-vana/types";

const DEMO_BASE_PATH = "/demo/login-with-vana";

type ChatGptMemory = {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  type?: string;
};

type ChatGptMemoriesExport = {
  memories: ChatGptMemory[];
  total: number;
};

const MOCK_CHATGPT_MEMORIES: ChatGptMemoriesExport = {
  total: 6,
  memories: [
    {
      id: "mem_demo_001",
      content:
        "You prefer concise, direct status updates with clear next steps.",
      created_at: "2026-04-02T15:24:00.000Z",
      updated_at: "2026-04-29T19:04:00.000Z",
      type: "preference",
    },
    {
      id: "mem_demo_002",
      content:
        "You are working on account access, data grants, and Login with Vana flows.",
      created_at: "2026-04-08T18:12:00.000Z",
      updated_at: "2026-04-29T21:11:00.000Z",
      type: "project",
    },
    {
      id: "mem_demo_003",
      content:
        "You want demo apps to focus on the client product value before explaining auth or provider details.",
      created_at: "2026-04-18T14:36:00.000Z",
      updated_at: "2026-04-29T20:31:00.000Z",
      type: "preference",
    },
    {
      id: "mem_demo_004",
      content:
        "You prefer realistic flows that use real grants while mocking unfinished RPC dependencies.",
      created_at: "2026-04-21T16:50:00.000Z",
      updated_at: "2026-04-29T18:47:00.000Z",
      type: "preference",
    },
    {
      id: "mem_demo_005",
      content:
        "You care about copy that feels product-owned and avoids internal implementation language.",
      created_at: "2026-04-26T13:08:00.000Z",
      updated_at: "2026-04-29T19:42:00.000Z",
      type: "preference",
    },
    {
      id: "mem_demo_006",
      content:
        "You expect important UI changes to be tested through the full browser journey.",
      created_at: "2026-04-27T17:19:00.000Z",
      updated_at: "2026-04-29T20:06:00.000Z",
      type: "working_style",
    },
  ],
};

type SessionResponse = {
  loggedIn: boolean;
  session: DemoSession | null;
};

type GrantState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "redirecting" }
  | { status: "exchanging" }
  | {
      status: "approved";
      exchangedAt: string;
      result: Record<string, DemoJson>;
    }
  | { status: "denied"; reason: string }
  | { status: "error"; message: string };

type ApprovedGrantState = Extract<GrantState, { status: "approved" }>;

export function MemoryAppLoginDemo() {
  const [sessionResponse, setSessionResponse] =
    useState<SessionResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [grantState, setGrantState] = useState<GrantState>({ status: "idle" });
  const exchangeAttempted = useRef(false);
  const postLoginImportAttempted = useRef(false);

  useEffect(() => {
    void initialize();

    async function initialize() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const login = params.get("login");
      const intent = params.get("intent");
      const actionCode = params.get("action_code");
      const returnedState = params.get("state");
      const actionError = params.get("action_error");

      if (error) setStatusMessage(`Sign-in error: ${error}`);
      if (login === "success") setStatusMessage("You're signed in.");

      const refreshed = await refreshSession();

      if (actionError) {
        setGrantState({ status: "denied", reason: actionError });
        stripGrantParams();
        return;
      }

      if (returnedState && !actionCode) {
        setGrantState({
          status: "denied",
          reason: "The ChatGPT access request was not approved.",
        });
        void clearGrantStateAfterDeniedReturn(returnedState);
        stripGrantParams();
        return;
      }

      if (actionCode && !exchangeAttempted.current) {
        exchangeAttempted.current = true;
        void exchangeGrantCode(actionCode, returnedState);
        return;
      }

      if (
        login === "success" &&
        intent === "import" &&
        refreshed.session &&
        !postLoginImportAttempted.current
      ) {
        postLoginImportAttempted.current = true;
        stripStatusParams();
        void openAccessReview();
      }
    }
  }, []);

  async function refreshSession(): Promise<SessionResponse> {
    const response = await fetch(`${DEMO_BASE_PATH}/session`, {
      cache: "no-store",
    });
    const parsed = (await response.json()) as SessionResponse;
    setSessionResponse(parsed);
    return parsed;
  }

  async function startImport() {
    if (!sessionResponse?.session) {
      window.location.assign(`${DEMO_BASE_PATH}/start?intent=import`);
      return;
    }
    await openAccessReview();
  }

  async function openAccessReview() {
    setGrantState({ status: "creating" });
    setStatusMessage(null);

    let response: Response;
    try {
      response = await fetch(`${DEMO_BASE_PATH}/actions/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      });
    } catch (error) {
      setGrantState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not open the access review.",
      });
      return;
    }

    const json = (await response.json().catch(() => null)) as {
      action_url?: string;
      error?: string;
    } | null;

    if (!response.ok || !json?.action_url) {
      setGrantState({
        status: "error",
        message: json?.error ?? `Access request failed (${response.status})`,
      });
      return;
    }

    setGrantState({ status: "redirecting" });
    window.location.assign(json.action_url);
  }

  async function exchangeGrantCode(actionCode: string, state: string | null) {
    setGrantState({ status: "exchanging" });

    let response: Response;
    try {
      response = await fetch(`${DEMO_BASE_PATH}/actions/exchange`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action_code: actionCode, state }),
        cache: "no-store",
      });
    } catch (error) {
      setGrantState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not complete the return.",
      });
      stripGrantParams();
      return;
    }

    const json = (await response.json().catch(() => null)) as
      | (AccountActionExchangeResult & { error?: string })
      | { error: string }
      | null;

    stripGrantParams();

    if (!response.ok || !json || "error" in json) {
      setGrantState({
        status: "error",
        message:
          (json && "error" in json && json.error) ||
          `Access confirmation failed (${response.status})`,
      });
      return;
    }

    setGrantState({
      status: "approved",
      exchangedAt: new Date().toISOString(),
      result: json.result,
    });
  }

  async function clearGrantStateAfterDeniedReturn(state: string) {
    await fetch(`${DEMO_BASE_PATH}/actions/exchange`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state }),
      cache: "no-store",
    }).catch(() => null);
  }

  const isWorking =
    grantState.status === "creating" ||
    grantState.status === "redirecting" ||
    grantState.status === "exchanging";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 sm:py-10">
        <header className="grid gap-6 border-2 border-border bg-card p-5 shadow-2 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-3 text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Memory App
            </p>
            <h1 className="max-w-3xl text-title font-black">
              Turn your ChatGPT history into useful memory.
            </h1>
            <p className="mt-4 max-w-2xl text-body text-foreground-dim">
              Memory App finds the recurring projects, preferences, people, and
              writing patterns buried in your old chats so future apps can
              understand you faster.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
            <button
              className="inline-flex h-button items-center justify-center border-2 border-border bg-primary px-5 text-button font-semibold text-primary-foreground shadow-1 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isWorking}
              onClick={() => void startImport()}
              type="button"
            >
              {grantState.status === "creating"
                ? "Preparing..."
                : grantState.status === "redirecting"
                  ? "Opening review..."
                  : grantState.status === "exchanging"
                    ? "Finishing..."
                    : grantState.status === "approved"
                      ? "Refresh from ChatGPT"
                      : "Import from ChatGPT"}
            </button>
          </div>
        </header>

        {statusMessage && (
          <p className="border-2 border-border bg-highlighter px-4 py-3 text-small font-semibold">
            {statusMessage}
          </p>
        )}

        {grantState.status === "approved" ? (
          <ProfileDraft state={grantState} />
        ) : (
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-2 border-border bg-card p-5 shadow-2 sm:p-6">
              <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Import source
              </p>
              <h2 className="mt-2 text-heading font-bold">
                Use ChatGPT as the starting point.
              </h2>
              <p className="mt-3 max-w-2xl text-body text-foreground-dim">
                The import reads your ChatGPT memories and conversation history.
                You review the request before anything is shared.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <RequestFact title="Data source" value="ChatGPT" />
                <RequestFact
                  title="Data included"
                  value="Memories and conversation history"
                />
                <RequestFact title="Access lasts" value="Until you revoke it" />
              </div>

              <GrantStatus state={grantState} />
            </div>

            <div className="border-2 border-border bg-card p-5 shadow-1">
              <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                What you get
              </p>
              <h2 className="mt-2 text-heading font-bold">
                A profile you can actually use.
              </h2>
              <p className="mt-3 text-body text-foreground-dim">
                Memory App turns the import into a compact profile you can
                review before using anywhere else.
              </p>
              <ul className="mt-4 grid gap-3 text-body text-foreground-dim">
                <li>Recurring projects and topics you return to.</li>
                <li>
                  Preferences, writing style, and useful personal context.
                </li>
                <li>
                  A private memory profile to review before it powers anything.
                </li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function stripGrantParams() {
  const url = new URL(window.location.href);
  for (const key of ["action_code", "state", "action_error"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

function stripStatusParams() {
  const url = new URL(window.location.href);
  for (const key of ["login", "error", "intent"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

function RequestFact({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-2 border-border bg-muted p-4">
      <p className="text-fine font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-body font-semibold">{value}</p>
    </div>
  );
}

function ProfileDraft({ state }: { state: ApprovedGrantState }) {
  return (
    <section className="grid gap-5 border-2 border-border bg-card p-5 shadow-2 sm:p-7 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Profile draft
          </p>
          <h2 className="mt-2 text-heading font-bold">
            Imported {MOCK_CHATGPT_MEMORIES.total} ChatGPT memories.
          </h2>
          <p className="mt-3 text-body text-foreground-dim">
            Memory App turned your ChatGPT saved memories into editable profile
            entries. Review them before using the profile anywhere else.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <RequestFact title="Source" value="ChatGPT memories" />
          <RequestFact title="Imported" value={formatDate(state.exchangedAt)} />
        </div>
      </div>

      <div className="grid gap-3">
        {MOCK_CHATGPT_MEMORIES.memories.map((memory) => (
          <article
            className="border-2 border-border bg-muted p-4"
            key={memory.id}
          >
            <p className="text-body font-semibold">{memory.content}</p>
            <p className="mt-2 text-fine font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {formatMemoryType(memory.type)} · saved{" "}
              {formatShortDate(memory.created_at)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GrantStatus({ state }: { state: GrantState }) {
  if (state.status === "idle") {
    return (
      <div className="mt-5 border-2 border-dashed border-border p-5 text-body text-foreground-dim">
        When you're ready, start the import. You'll review the request before
        anything is shared.
      </div>
    );
  }

  if (state.status === "creating" || state.status === "redirecting") {
    return (
      <div className="mt-5 border-2 border-border bg-highlighter p-5">
        <h3 className="text-large font-bold">Opening review</h3>
        <p className="mt-2 text-small text-foreground-dim">
          You will review the request before anything is approved.
        </p>
      </div>
    );
  }

  if (state.status === "exchanging") {
    return (
      <div className="mt-5 border-2 border-border bg-highlighter p-5">
        <h3 className="text-large font-bold">Finishing approval</h3>
        <p className="mt-2 text-small text-foreground-dim">
          Memory App is confirming the approval.
        </p>
      </div>
    );
  }

  if (state.status === "approved") {
    return null;
  }

  if (state.status === "denied") {
    return (
      <div className="mt-5 border-2 border-border bg-muted p-5">
        <h3 className="text-large font-bold">Access was not approved</h3>
        <p className="mt-2 text-small text-foreground-dim">{state.reason}</p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-2 border-border bg-destructive p-5 text-destructive-foreground">
      <h3 className="text-large font-bold">Something went wrong</h3>
      <p className="mt-2 text-small">{state.message}</p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMemoryType(value: string | undefined) {
  if (!value) return "memory";
  return value.replaceAll("_", " ");
}

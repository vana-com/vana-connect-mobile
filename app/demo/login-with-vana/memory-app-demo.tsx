"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AccountActionExchangeResult,
  DemoJson,
  DemoSession,
} from "../../dev/login-with-vana/types";
import { normalizeActionExchangeResult } from "../../../lib/dpv2-poc/action-exchange";

const DEMO_BASE_PATH = "/demo/login-with-vana";
const FIXTURE_REF_KEY = "dpv2_fixture_ref";

function readFixtureRef(): string | null {
  try {
    return window.localStorage.getItem(FIXTURE_REF_KEY);
  } catch {
    return null;
  }
}

function writeFixtureRef(ref: string) {
  try {
    window.localStorage.setItem(FIXTURE_REF_KEY, ref);
  } catch {
    // ignore
  }
}

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

type MemoryAccessFailure = {
  title: string;
  message: string;
  code?: string;
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
      /** Real PS-fetched ChatGPT memories. null = still fetching, undefined = fetch failed/refused. */
      memories?: ChatGptMemoriesExport | null;
      memoriesFailure?: MemoryAccessFailure;
    }
  | { status: "denied"; reason: string }
  | { status: "error"; message: string };

type ApprovedGrantState = Extract<GrantState, { status: "approved" }>;

export function MemoryAppLoginDemo() {
  const [sessionResponse, setSessionResponse] =
    useState<SessionResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [grantState, setGrantState] = useState<GrantState>({ status: "idle" });
  const [fixtureRef, setFixtureRef] = useState<string | null>(null);
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
      const incomingRef = params.get("fixture_ref");

      if (incomingRef) {
        writeFixtureRef(incomingRef);
        stripFixtureRefParam();
      }
      setFixtureRef(readFixtureRef());

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

    const exchangedAt = new Date().toISOString();
    setGrantState({
      status: "approved",
      exchangedAt,
      result: json.result,
      memories: null,
    });
    void fetchRealMemories(json.result, exchangedAt);
  }

  /**
   * Pull real ChatGPT memories from the user's Personal Server using the
   * grant minted during the action exchange. Falls back to the mock display
   * if anything goes wrong — the demo should still render something useful
   * even if the data path isn't configured.
   */
  async function fetchRealMemories(
    result: Record<string, DemoJson>,
    exchangedAt: string,
  ) {
    const fixtureRef = readFixtureRef();
    const normalized = normalizeActionExchangeResult(result, {
      demoPsUrl: fixtureRef ? window.location.origin : undefined,
    });
    if (!normalized.ok) {
      setGrantState({
        status: "approved",
        exchangedAt,
        result,
        memories: undefined,
        memoriesFailure: {
          title: "Personal Server details are missing",
          message: normalized.error,
        },
      });
      return;
    }
    const { grantId, psUrl } = normalized.value;
    const personalServer = { serverUrl: psUrl };

    let response: Response;
    try {
      response = await fetch(`${DEMO_BASE_PATH}/actions/fetch-data`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grant_id: grantId,
          personal_server: personalServer,
          scope: "chatgpt.memories",
          ...(fixtureRef ? { fixture_ref: fixtureRef } : {}),
        }),
        cache: "no-store",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach the data endpoint.";
      setGrantState({
        status: "approved",
        exchangedAt,
        result,
        memories: undefined,
        memoriesFailure: {
          title: "Personal Server unavailable",
          message,
        },
      });
      return;
    }

    const json = (await response.json().catch(() => null)) as {
      ok?: boolean;
      data?: unknown;
      error?: string;
      details?: unknown;
    } | null;

    if (!response.ok || !json?.ok) {
      setGrantState({
        status: "approved",
        exchangedAt,
        result,
        memories: undefined,
        memoriesFailure: buildMemoryAccessFailure(json, response.status),
      });
      return;
    }

    // Accept both the old raw PS envelope and the DPv2 read wrapper:
    // `{ ok, data: { scope, collectedAt, data: <body> } }`.
    const raw = (json.data ?? null) as Record<string, unknown> | null;
    const psData =
      raw && raw.ok === true && raw.data && typeof raw.data === "object"
        ? (raw.data as Record<string, unknown>)
        : raw;
    const envelopeBody =
      psData && psData.data && typeof psData.data === "object"
        ? (psData.data as Record<string, unknown>)
        : psData;
    const inner =
      envelopeBody &&
      Array.isArray((envelopeBody as { memories?: unknown }).memories)
        ? (envelopeBody as unknown as ChatGptMemoriesExport)
        : null;
    if (!inner || !Array.isArray(inner.memories)) {
      setGrantState({
        status: "approved",
        exchangedAt,
        result,
        memories: undefined,
        memoriesFailure: {
          title: "Unexpected Personal Server response",
          message:
            "The Personal Server response did not include ChatGPT memories.",
        },
      });
      return;
    }
    setGrantState({
      status: "approved",
      exchangedAt,
      result,
      memories: {
        memories: inner.memories,
        total:
          typeof inner.total === "number" ? inner.total : inner.memories.length,
      },
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

        {fixtureRef && (
          <p className="border-2 border-dashed border-border bg-muted px-4 py-2 text-fine font-mono text-muted-foreground">
            fixture_ref (temporary POC): {fixtureRef}
          </p>
        )}

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

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function buildMemoryAccessFailure(
  json: { error?: string; details?: unknown } | null,
  status: number,
): MemoryAccessFailure {
  const details = readObject(json?.details);
  const code = readString(details?.error);
  const detailMessage = readString(details?.message);
  const fallbackMessage =
    detailMessage ?? json?.error ?? `Personal Server returned ${status}`;

  if (code === "grant_revoked") {
    return {
      title: "Access revoked",
      message:
        "The Personal Server refused this read because access was revoked. No ChatGPT memories were imported.",
      code,
    };
  }

  if (code === "fee_required") {
    return {
      title: "Payment required",
      message:
        "The Personal Server requires payment before releasing this data. No ChatGPT memories were imported.",
      code,
    };
  }

  if (code === "ps_unavailable") {
    return {
      title: "Personal Server unavailable",
      message:
        "The Personal Server is not reachable right now. No ChatGPT memories were imported.",
      code,
    };
  }

  return {
    title: "Personal Server refused the read",
    message: `${fallbackMessage} No ChatGPT memories were imported.`,
    code: code ?? undefined,
  };
}

function stripGrantParams() {
  const url = new URL(window.location.href);
  for (const key of ["action_code", "state", "action_error"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

function stripFixtureRefParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("fixture_ref");
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
  // Four states:
  //  - state.memories === null  → still loading from PS
  //  - state.memories === undefined  → fetch failed/refused
  //  - state.memoriesFailure exists  → explain why nothing was imported
  //  - state.memories has memories  → show real data
  const isLoading = state.memories === null;
  const accessFailure = state.memoriesFailure;
  const memoriesExport = state.memories;

  return (
    <section className="grid gap-5 border-2 border-border bg-card p-5 shadow-2 sm:p-7 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p className="text-fine font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Profile draft
          </p>
          <h2 className="mt-2 text-heading font-bold">
            {isLoading
              ? "Loading your ChatGPT memories…"
              : accessFailure
                ? accessFailure.title
                : `Imported ${memoriesExport?.total ?? 0} ChatGPT memories.`}
          </h2>
          <p className="mt-3 text-body text-foreground-dim">
            {accessFailure
              ? accessFailure.message
              : "Memory App turned your ChatGPT saved memories into editable profile entries. Review them before using the profile anywhere else."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <RequestFact
            title="Source"
            value={
              accessFailure
                ? "Personal Server refused access"
                : "ChatGPT memories"
            }
          />
          <RequestFact
            title={accessFailure ? "Result" : "Imported"}
            value={accessFailure ? "Not imported" : formatDate(state.exchangedAt)}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="border-2 border-dashed border-border p-4 text-body text-foreground-dim">
            Fetching your data from the Personal Server…
          </div>
        ) : accessFailure ? (
          <div className="border-2 border-border bg-muted p-4 text-body text-foreground-dim">
            <p className="font-semibold text-foreground">
              {accessFailure.code ?? "personal_server_error"}
            </p>
            <p className="mt-2">{accessFailure.message}</p>
          </div>
        ) : memoriesExport ? (
          memoriesExport.memories.map((memory) => (
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
          ))
        ) : (
          <div className="border-2 border-border bg-muted p-4 text-body text-foreground-dim">
            No ChatGPT memories were imported.
          </div>
        )}
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

# DP RPC Memory App UI Flow

Date: 2026-04-28

## Decision

The first product workflow should be the **DP RPC-backed memory app**, not a single Context Gateway connector.

The goal is to make the current vibe-coded memory app real enough to support Anna's Stage 1 claim:

- data connected from any surface becomes available across the ecosystem
- Vana mobile is the canonical consumer place to see/manage personal context
- Context Gateway routes users to mobile or DataConnect when a builder app needs data the user does not have yet
- apps and tools can request access through a user-visible grant

## What Changed From The Previous Flow

The earlier `260428-mobile-source-connection-first-flow` is still useful, but it is now a **leaf flow**:

- "connect Instagram through CG/DataConnect"
- "handle requestInput retry"
- "deal with connector partial/failure"

It is not the first product workflow.

The first product workflow is:

```text
Auth -> Data readiness -> Connect/import data -> Memory surface -> Tool/app request -> Consent grant -> Data served -> Manage access
```

## Anna's Stage 1 Constraint

Keep scope tight:

- use the existing Data Portability RPC
- no smart contract or chain changes required for the app experience
- no DLP work
- no agent-specific architecture
- write some DP RPC data onchain only for metrics in parallel

The UI should optimize for cross-surface legibility in weeks, not protocol completeness.

## Surfaces

### Vana Mobile / Memory App

Consumer home for personal context.

Primary jobs:

- sign in
- see whether Vana already has usable data
- connect/import more data
- browse/search memory
- approve or deny app/tool access
- manage connected sources and grants

### DataConnect Desktop

Heavy/deep connector surface.

Primary jobs:

- run desktop/local connectors
- handle connector auth and extraction
- push encrypted data into the DP RPC / Personal Server path

### Context Gateway / Builder API

Builder-facing surface.

Primary jobs:

- let apps request data
- detect whether the user already has required data
- route user to Vana mobile or DataConnect when data is missing
- receive grant/access result

## UI-Oriented Flow

### 1. Authenticate

User signs in with Vana.

UI should expose:

- email/phone/social auth
- session loading
- auth failed
- returning user
- new user

Do not expose:

- Privy as the product subject
- master key signature details
- wallet-provider internals

Product language:

- "Sign in to Vana"
- "Your Vana identity"
- "Setting up your private data space"

### 2. Data Readiness

App checks what data the user already has through the DP RPC path.

UI should answer:

- Do I have any connected data?
- Which sources are available?
- Which data can power memory and apps right now?
- Which sources require desktop?

States:

- no data
- some data
- source connected but syncing
- source unavailable
- source needs desktop
- source failed/retry

### 3. Connect Or Import Data

The user connects data from mobile when possible, or is routed to DataConnect for desktop-required sources.

UI should expose:

- source list
- source detail
- scopes/data types
- connect button
- mobile-supported vs desktop-required indicator
- progress
- partial result
- retry

The implementation may involve Personal Servers, escrow, cloud storage, DP RPC, and chain writes. The UI should compress that to:

- "Your data is encrypted"
- "Available to you across Vana"
- "Works even when your laptop is offline" only if Hosted PS is actually guaranteed

### 4. Memory Surface

Connected data becomes usable personal context.

UI should expose:

- memory overview
- source-backed context clusters
- recently added data
- source provenance
- stale/sync-needed state
- search or ask interface

For Stage 1, this is the core consumer utility. It should be more important than marketplace browsing.

### 5. Plug Memory Into Tools

User connects memory to a tool like Claude or a builder app.

Entry points:

- inside Vana mobile: "Use with Claude" / "Connect a tool"
- inside builder app: "Connect with Vana"
- inside Context Gateway: user has no data -> route to Vana mobile/DataConnect

UI should expose:

- requesting app/tool identity
- requested data types/scopes
- whether required data exists
- missing-data route
- approve/deny
- duration/expiry

### 6. Consent Grant

Only explicit data sharing consent should feel like a user-visible signing moment.

UI should expose:

- app/tool name
- requested data
- duration
- destination
- approve
- deny
- Face ID / device confirmation if required
- success
- denied
- expired

Do not expose:

- `addPermission`
- `permissionId`
- `K_enc_HPS`
- chain flush details

### 7. Manage Access

User can inspect and revoke data access later.

UI should expose:

- connected tools/apps
- connected sources
- access history
- revoke action
- source disconnect
- export/delete data

## Canvas Shape

Use six horizontal lanes:

- User
- Vana Mobile / Memory App
- DataConnect Desktop
- DP RPC + Personal Server
- Context Gateway / Builder API
- External Tool/App

Main path:

```text
Sign in -> check data -> connect/import -> memory ready -> tool requests data -> approve grant -> data served -> manage access
```

Important branches:

- no data -> route to connect source
- source needs desktop -> hand off to DataConnect
- connector auth issue -> re-prompt or streamed-browser fallback
- data sync pending -> show pending memory state
- app requests missing data -> route to connect/import
- grant denied -> no access
- grant revoked/expired -> access stops

## Engineering Questions

- Is Vana mobile the canonical first place a user connects data, or the canonical first place they use already-connected data?
- Which sources are mobile-supported in Stage 1?
- Which sources require DataConnect desktop?
- Does mobile call DP RPC directly, or only through a Vana app backend?
- What API answers "what data does this user already have?"
- What API answers "what data is missing for this app/tool request?"
- What is the minimum normalized memory schema for the current memory app?
- What is the source of truth for source labels, scope labels, and descriptions?
- What is the Stage 1 story for Claude: MCP, browser extension, API key, OAuth-style app, or copy/export?
- Does tool access create a DP grant, a Context Gateway grant, or both?
- Where does revoke live technically, and how quickly does it take effect?
- Which events must appear in user-visible history?

## Product Questions

- Should the first-run experience optimize for "connect data" or "see your memory"?
- What is the first source that makes the memory app feel useful?
- What is the minimum useful memory view before Claude/tool integration?
- What is the trust copy for always-on Hosted Personal Server access?
- How much protocol transparency helps users versus scaring them?

## Relation To Context Gateway PRs

Context Gateway PR #181 remains useful as a deterministic lab harness:

- provider/source selection
- scope selection
- canonical flow states
- forced preview states

But the product app should not inherit lab-only controls:

- theme picker
- viewport picker
- preview mode picker

PR #184 / #135 matter as connector UX requirements:

- wrong password should re-prompt via `requestInput`
- CAPTCHA or harder auth should escalate to streamed/headed browser fallback
- connector auth failure should not always be terminal

PR #142 matters as an integration warning:

- mobile should depend on contracts/APIs, not repo snapshot paths

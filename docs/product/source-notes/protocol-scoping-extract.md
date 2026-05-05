# Protocol Scoping Extract

Source: `Protocol scoping.md`
Date extracted: 2026-04-24

## Core Goal

Leadership's motivating question is how to make data added through any Vana surface available in the others. The named surfaces are Vana mobile app, DataConnect desktop, and Context Gateway / builder-facing API.

The product frame is unification, not protocol expansion. The Stage 1 target is to connect existing surfaces through shared primitives quickly enough to demonstrate network effects.

## Stage 1 Scope

- Unify around the existing Data Portability RPC.
- Avoid smart contract or chain changes except metric-oriented onchain writes.
- Route Context Gateway through DP RPC.
- Unify auth or allow wallet linking across surfaces.
- Surface an apps page across DataConnect, Vana mobile, and the website.
- Write some DP RPC activity onchain for visible metrics.

## Stage 1 Outcomes

Stage 1 is done when:

- every surface reads and writes through one shared API
- a single user identity resolves across surfaces through wallet linking or a stronger unified identity design
- a builder app calling Context Gateway can reach a dataset connected on any surface
- onchain records exist for connect, query, and consent actions
- nothing built in Stage 1 forces a user operation for later migration off the current DP RPC implementation

## Acceptance Bar

The hard demo target is one user, three surfaces, one dataset:

- user connects a source on DataConnect
- user sees the same data in the Vana app
- sample builder app reads that same data through Context Gateway or the Stage 1 builder-facing API path
- the flow is reproducible and onchain-attested

## Hard Constraints

- Later migration off current DP RPC must not require re-signing, re-linking, or re-consenting.
- DP RPC is the shared API, not automatically the storage layer.
- Storage location, desktop-to-web transport, Context Gateway wiring, and onchain write path are engineering decisions.
- Out-of-scope work stays out unless something else is removed or the timeline expands.

## Technical Workstreams Named

- unified identity / wallet handling
- DP RPC as the spine for all surfaces
- always-on user storage
- Context Gateway user-auth and consent handoff
- apps page / marketplace across surfaces
- mobile-side OAuth lite-ingress
- mobile to desktop session handoff
- onchain metric writes
- reliable priority desktop connectors

## Out of Scope

- DLP-related work
- agent-specific work
- compute over private data
- ZK / verification / privacy infrastructure
- user-owned storage as default Stage 1 implementation
- protocol-level fees
- mobile scraping
- Vana App redesign
- editing connected data

## Tensions to Preserve

- The doc includes both "Context Gateway routes through DP RPC" and "Context Gateway is frozen for the next month." The staging branch must keep this as an open decision.
- The doc says existing Vana App users are on a different wallet vendor and matter for identity, but later Q&A says legacy Vana App users do not need migration for Stage 1. The staging baseline chooses not to migrate inactive legacy users for the first auth target.
- The doc says DP RPC is not storage, but the action plan says Stage 1 should centrally host user storage. The product requirement is cross-surface availability; the storage design remains open.
- The doc wants 3-4 weeks, but identity resolution is explicitly called out as the likely reason the real window could stretch.
- The doc wants sovereign protocol design while allowing an ODL-owned implementation for Stage 1.

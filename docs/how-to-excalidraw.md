# How to Excalidraw

This repo uses Excalidraw as a shared product-flow canvas.

There is no Excalidraw workspace, login, plugin, or MCP integration. The workflow is deliberately simple:

1. The `.excalidraw` file lives in Git.
2. Excalidraw is the drawing format and editor.
3. The repo is the source of truth.

## Current Canvas

The canonical canvas file is:

`docs/flows/260428-vana-mobile-production-flow-map.excalidraw`

## Mode 1: Product Discussion

Use this when working with a product manager or anyone outside the local dev loop.

1. Pull the latest branch.
2. Open `https://excalidraw.com/` in a normal external browser.
3. Import `docs/flows/260428-vana-mobile-production-flow-map.excalidraw`.
4. Edit the canvas together.
5. Export/save the updated `.excalidraw` file.
6. Replace the repo file with the updated version.
7. Commit the changed `.excalidraw` file.

Do not use the Codex in-app browser for importing the file. It blocks the browser file APIs Excalidraw needs.

If the discussion creates a meaningfully different map, save a dated version instead of overwriting the canonical file.

Example:

`docs/flows/260428-vana-mobile-production-flow-map-v2.excalidraw`

## Mode 2: Live Codex Editing

Use this when discussing the canvas with Codex.

1. Run the app locally: `npm run dev`.
2. Open `http://localhost:3084/dev/excalidraw`.
3. Keep that browser tab open.
4. Ask Codex to change the flow map.
5. Codex edits the repo file.
6. The local canvas polls the file and updates automatically.

Browser edits in `/dev/excalidraw` also save back to the same repo file.

This local route is dev-only. It reads and writes:

`docs/flows/260428-vana-mobile-production-flow-map.excalidraw`

## Agent Workflow

An agent should update the canvas by editing the `.excalidraw` JSON directly and preserving the same file path:

`docs/flows/260428-vana-mobile-production-flow-map.excalidraw`

When adding new product thinking, prefer updating the written companion doc too:

`docs/flows/260428-dp-rpc-memory-app-ui-flow.md`

## What This Canvas Is For

Use it to discuss and refine the production flow for the Vana mobile app:

- data readiness
- auth/account state
- source connection handoff
- DP RPC / Personal Server assumptions
- consent and grants
- tool/app access
- revoke, recovery, and failure states

Keep implementation details out unless they affect the user-facing flow.

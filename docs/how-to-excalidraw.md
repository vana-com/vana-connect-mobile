# How to Excalidraw

This repo uses Excalidraw as a shared product-flow canvas.

There is no Excalidraw workspace, login, plugin, or Codex integration. The workflow is deliberately simple:

1. The `.excalidraw` file lives in Git.
2. Excalidraw is only the editor.
3. The repo is the source of truth.

## Current Canvas

Open this file in Excalidraw:

`docs/flows/260428-vana-mobile-production-flow-map.excalidraw`

Use the normal external browser at:

`https://excalidraw.com/`

Do not use the Codex in-app browser for importing the file. It blocks the browser file APIs Excalidraw needs.

## Editing Workflow

1. Pull the latest branch.
2. Open `https://excalidraw.com/` in a normal browser.
3. Import `docs/flows/260428-vana-mobile-production-flow-map.excalidraw`.
4. Edit the canvas.
5. Export/save the updated `.excalidraw` file.
6. Replace the repo file with the updated version.
7. Commit the changed `.excalidraw` file.

## Agent Workflow

An agent can update the canvas by editing the `.excalidraw` JSON directly, but it should preserve the same file path:

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

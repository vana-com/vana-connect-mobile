# Excalidraw Flow Workflow

Date: 2026-04-28

## Brief

Vana Connect is still early enough that the core flows should be made deterministic before more UI code lands.

The goal is to define product workflows first, then implement from those decisions. The canvas is for shaping and reviewing flows, not for inventing UI detail too early.

## Tool Choice

Use Excalidraw.

Reasons:

- It stores editable drawings as `.excalidraw` JSON files.
- Codex can draft and revise those files directly.
- Product/design can edit the same files visually.
- The repo keeps ownership of the source artifacts.
- No Figma dependency is required.

Do not use Obsidian Canvas for UX flows. It is useful for note maps, but too weak for product workflow design.

## Repository Convention

Flow work should live under:

```text
docs/flows/
```

Each flow should have:

```text
docs/flows/<flow-name>.md
docs/flows/<flow-name>.excalidraw
docs/flows/exports/<flow-name>.png
```

The Markdown file is the deterministic source. The Excalidraw file is the editable canvas. The PNG is only for easy review in PRs, Slack, Linear, or docs.

## Drafting Process

1. Capture the flow in Markdown first.
2. Include screens, states, transitions, branches, failure cases, and data dependencies.
3. Generate or revise the `.excalidraw` canvas from that source.
4. Review the canvas with product/design.
5. Bring the edited canvas back into Codex for cleanup, normalization, or implementation planning.
6. Only then touch app code.

## Flow Source Template

```md
# <Flow Name>

## Intent

What user/business job this flow serves.

## Entry Points

- Where the user can enter this flow.

## Screens

- Screen name
- Purpose
- Primary action
- Secondary actions
- Empty/loading/error states

## Transitions

- From -> To: condition or action

## Branches

- Branch: condition, destination, recovery path

## Data Dependencies

- Required local state
- Required remote data
- External services
- Persistence/audit requirements

## Open Questions

- Decisions needed before implementation
```

## Initial Flow Targets

Start with the flows that define the app's foundation:

- onboarding and account creation
- connecting a data source
- granting an app permission
- reviewing active permissions
- revoking access
- viewing audit/history

These should become the first deterministic workflow set before new feature code continues.

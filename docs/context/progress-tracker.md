# Progress Tracker

Update after every meaningful change. Distinguish observed, verified, pending and blocked work.

## Current Phase
Phase 0 — System design and project specifications (draft ready for developer review). Basic Nx workspace was created before design finalization.

## Current Goal
Place these context files in the existing `nx-learning` root, approve the baseline, and verify Nx installation before generating any apps.

## Completed / observed
- Developer screenshot shows `nx-learning/` with nx.json, package.json, package-lock.json, node_modules, .nx, .vscode, .editorconfig, .gitignore and README.md.
- Six tutorial templates reviewed and customized as proposed project specs; agent entry points prepared. Local installation of these documents not yet confirmed.

## In Progress
- Developer review of architecture, scope, UI tokens and proposed API contract.

## Next Up
| Phase | Unit | Status |
|---|---|---|
| 0 | Place specs and approve baseline; run Nx report | Pending |
| 1 | Verify compatibility and generate Angular, Next.js, Express apps individually | Pending |
| 2 | Create shared design tokens and import global styles in both frontends | Pending |
| 3 | Implement and verify Lit UICs one at a time (button first) | Pending |
| 4 | Compose SIC sidebar | Pending |
| 5 | Assemble editor pages in both frameworks | Pending |
| 6 | Implement Express project REST API and focused tests | Pending |
| 7 | Shared API client and frontend integration | Pending |
| 8 | Full local smoke, independent builds, affected analysis | Pending |
| 9 | Docker, CI/CD, AWS — separate approval and cost plan | Deferred |

## Open Questions
- Confirm proposed design baseline, API contract and local-only in-memory model before implementation.
- Record installed Node, npm, Nx, Angular, Next.js/React, Express and Lit versions and actual generator options during Phase 1.
- Confirm compatible local test tooling and package/alias setup before library generation.
- Storybook and persistent storage are deferred unless explicitly approved.

## Architecture Decisions
- User selected Nx with modern Angular, Next.js, Express, Lit and shared global tokens.
- Proposed: one shared UI and SIC library, shared types and API client; no duplicate frontend UI implementations.
- Proposed: one local Express API with in-memory state; no authentication or paid services initially.

## Verification Evidence
| Check | Status | Evidence |
|---|---|---|
| Workspace folder | Observed | Developer screenshot |
| Node/npm/Nx compatibility | NOT RUN | Await local terminal output |
| Nx report | NOT RUN | Await local terminal output |
| Application builds/tests | NOT RUN | Applications not yet generated |
| Browser/API checks | NOT RUN | Applications not yet generated |

## Session Notes
- \`uic-button\` registration now checks for \`customElements\` before accessing the browser global, allowing non-browser evaluation.
- Verified with \`npx tsc --noEmit --strict --skipLibCheck --moduleResolution bundler --module esnext --target es2015 --lib es2020,dom libs/shared-ui/src/uic-button/uic-button.ts\` — PASS.
- Verified with \`npx eslint libs/shared-ui/src/uic-button/uic-button.ts\` — PASS.

## Session Notes
Run commands from the existing nx-learning directory, not its parent. Do not recreate the workspace. No application code or generated apps are included in this documentation bundle.

# Progress Tracker

Update after every meaningful change. Distinguish observed, verified, pending and blocked work.

## Current Phase
Phase 4/5 — Feature 02 editor layout implemented; final evidence review pending.

## Current Goal
Verify the Feature 02 shared editor chrome and both frontend routes.

## Completed / observed
- Developer screenshot shows `nx-learning/` with nx.json, package.json, package-lock.json, node_modules, .nx, .vscode, .editorconfig, .gitignore and README.md.
- Six tutorial templates reviewed and customized as proposed project specs; agent entry points prepared. Local installation of these documents not yet confirmed.

## In Progress
- Browser and Nx-target verification for the shared UI preview.
- Feature 02 implemented and verified in the available local environment; screenshot files and full accessibility-tree relationship verification remain pending. The existing Angular test fixture fails independently.

## Next Up
| Phase | Unit | Status |
|---|---|---|
| 0 | Place specs and approve baseline; run Nx report | Pending |
| 1 | Verify compatibility and generate Angular, Next.js, Express apps individually | Pending |
| 2 | Create shared design tokens and import global styles in both frontends | Implemented; verification pending |
| 3 | Implement and verify Lit UICs one at a time (button first) | Implemented; focused typecheck passed; browser/tests pending |
| 4 | Compose SIC sidebar | Implemented; focused tests and browser checks passed |
| 5 | Assemble editor pages in both frameworks | Implemented; builds and browser checks passed |
| 6 | Implement Express project REST API and focused tests | Pending |
| 7 | Shared API client and frontend integration | Pending |
| 8 | Full local smoke, independent builds, affected analysis | Pending |
| 9 | Docker, CI/CD, AWS — separate approval and cost plan | Deferred |

## Open Questions
- Feature spec 01 authorized design-system implementation. API contract remains deferred.
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
| Shared UI TypeScript | PASS | `tsc --noEmit -p libs/shared-ui/tsconfig.lib.json` |
| Frontend TypeScript | PASS | `tsc --noEmit` for Angular app and Next app configs |
| Application builds/tests | NOT RUN | Nx command output was unavailable in this run |
| Browser/API checks | NOT RUN | Chrome DevTools MCP not run; API out of scope |

## Session Notes — 2026-11-24
- Simplified Feature 02 code for readability: expanded shared sidebar/navbar templates and styles, named their handlers, and aligned frontend state names and tab types. Existing local formatting changes were retained. Shared-ui/shared-sections tests, shared-sections/Angular/Next lint, and both production builds passed after the refactor. Lint still reports the existing `no-explicit-any` warning in the Next preview. Chrome DevTools confirmed toggle, tab selection, close focus and unchanged canvas bounds in both editor routes.
- Feature 02: added shared Lit editor navbar and overlay sidebar, native dialog description/footer pattern, both `/editor` routes and the approved `--motion-sidebar: 150ms` token. The existing UICs and Lucide registry are reused; project creation remains intent only.
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx run-many -t test --projects=shared-ui,shared-sections --skip-nx-cache --output-style=static` passed 5 shared-ui and 3 shared-sections tests. The analogous four-project lint run passed with one pre-existing `no-explicit-any` warning in the Next root preview. `npx nx run-many -t build --projects=angular-app,next-app --skip-nx-cache --output-style=static` passed both builds.
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx run-many -t test --projects=angular-app,next-app --skip-nx-cache --output-style=static`: Next.js passed one test; Angular failed before running tests because its existing `app.spec.ts` imports missing `./nx-welcome`. This fixture predates Feature 02.
- Chrome DevTools checked both editor URLs at 390, 768 and 1440px. Initial state was closed at 390 and open at 768/1440; toggling left canvas bounds unchanged and produced no horizontal overflow. Both apps passed tab selection/panel visibility, tab persistence, single create intent, close focus restoration, Escape and reduced-motion checks. Console errors and failed network requests were absent in the inspected sessions. Root previews opened and closed the dialog with Escape and restored focus. MCP captured open/closed screenshots at all three viewport sizes, but denied saving files; full accessibility-tree relationship verification remains pending.
- `npx nx graph --file=/private/tmp/nx-learning-feature02-graph.json` exported the graph. Affected analysis for `libs/shared-sections/src/sic-sidebar/sic-sidebar.ts` returned shared-sections, angular-app and next-app, not Express. Graph edges show both apps depend on shared-sections and design-tokens; shared-sections depends on shared-ui. Next build inputs include `^default`; Angular build inputs include `^production`.
- Developer reports that the previously blocked Feature 01 prerequisite checks and frontend builds passed in their local terminal. Exact commands and output were not provided; this is developer-reported evidence, not a build observed by this agent. Prior Chrome checks showed SVG rendering inside both previews' shadow roots and matching tab/panel associations.
- Approved and configured shared-ui's Jest target for Lit ESM with existing dependencies. Installed versions: Nx 24.0.6, Jest 30.3.0, ts-jest 29.4.15, TypeScript 6.0.3 and Lit 3.3.3. `npx nx test shared-ui --skip-nx-cache --output-style=static` passed 3 suites and 3 tests; `npx nx lint shared-ui --skip-nx-cache --output-style=static` passed. Node emits an experimental VM modules warning.
- Added optional `uic-tabs` panel slots and same-shadow-root tab/panel IDs, selection and keyboard focus. The regression test failed before implementation and passed afterward. Both root previews demonstrate the panel slots.
- Chrome DevTools MCP checked existing Angular and Next.js root servers: each rendered an SVG with computed width 20px matching `--icon-md`, ArrowRight selected and focused Details, matching `aria-controls`/`aria-labelledby` IDs and hiding the other panel. Accessibility snapshots showed the selected Details tab and panel text; console error lists were empty. Screenshots were captured in the tool output; saving them to disk was denied by MCP path restrictions.
- `npx nx run-many -t build --projects=angular-app,next-app --output-style=static` produced a successful Angular build; Next.js Turbopack failed with `binding to a port: Operation not permitted` even after requesting elevated execution. Feature 02 remains NOT STARTED until the required prerequisite build passes. No Nx daemon or isolation settings were permanently changed.
- Approved Feature 01 prerequisite corrections and Feature 02 implementation. Updated both feature specs with the approved icon repair and optional same-shadow-root tab panel slots. `uic-icon` now creates Lucide SVG elements locally; its focused regression test failed before the change and passed afterward using a temporary ESM Jest configuration. Browser verification remains pending.
- `npx tsc --noEmit -p libs/shared-ui/tsconfig.lib.json` and `npx eslint libs/shared-ui/src/uic-icon/uic-icon.ts libs/shared-ui/src/uic-icon/uic-icon.spec.ts` passed. The normal `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx test shared-ui --skip-nx-cache --output-style=static` failed because the existing CommonJS Jest configuration cannot load Lit ESM. A permanent compatible test configuration has not been approved or applied.
- Nx daemon and isolated plugin workers reported Unix socket permission errors (`EPERM`) in this environment. No permanent Nx settings changed. A build retry outside the sandbox passed Angular production build but Next.js failed with Turbopack `binding to a port: Operation not permitted`. Dev server attempts waited on existing Nx tasks; both preview URLs were unavailable. Chrome verification and screenshots are NOT RUN.
- Feature 02 requested for implementation. Branch is `dev`; existing staged changes were preserved. `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx show projects` listed both frontends, Express, design-tokens, shared-ui and shared-sections. The default `npx nx show projects` did not complete during inspection.
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx test shared-ui` passed its existing tests. This does not verify the Feature 01 component contracts or browser rendering.
- Feature 02 unit A is blocked: `uic-icon` calls Lucide's document-wide `createIcons` for an element inside a shadow root, so its icons cannot be relied on as the required local rendering prerequisite. Existing `uic-tabs` provides no tab/panel association contract, while Feature 02 requires one and limits shared UI changes to its explicitly authorized extensions. Feature 01 verification remains pending. No Feature 02 code or browser verification has been performed.
- Implemented spec 01 shared primitives: icon, icon-button, card, input, textarea, tabs, modal, scroll-area, avatar, nav, list-item and empty-state.
- Preserved existing `uic-button`; added approved `--icon-sm`, `--icon-md`, and `--avatar-size` tokens.
- Added `lucide` runtime dependency. Install completed with peer-resolution warnings; no audit fix run.
- Replaced Angular and Next root previews with shared-control demonstrations.
- TypeScript checks pass for shared-ui, Angular app and Next app. Nx lint/test/build and Chrome checks remain pending.

## Session Notes
- \`uic-button\` registration now checks for \`customElements\` before accessing the browser global, allowing non-browser evaluation.
- Verified with \`npx tsc --noEmit --strict --skipLibCheck --moduleResolution bundler --module esnext --target es2015 --lib es2020,dom libs/shared-ui/src/uic-button/uic-button.ts\` — PASS.
- Verified with \`npx eslint libs/shared-ui/src/uic-button/uic-button.ts\` — PASS.

## Session Notes
Run commands from the existing nx-learning directory, not its parent. Do not recreate the workspace. No application code or generated apps are included in this documentation bundle.

# Progress Tracker

Update this file when a feature changes status. Keep one concise entry per feature; record only actual results and outstanding checks.

## Current Phase
- Feature 09 implementation in progress; Feature 07 cross-account and Feature 06 security gates remain open.

## Current Goal
- Verify Feature 09 project switching and preserve Feature 08, Feature 07 and Feature 06 outstanding gates.

## Completed Implementation

- Foundation — Nx workspace with Angular, Next.js and Express; shared design-tokens, shared-ui and shared-sections libraries; main/dev workflow.
- Feature 01: Design System — Shared SCSS tokens, Lit UICs and Lucide icons implemented. Shadow DOM icon rendering and accessible tabs corrected. Focused tests, lint, type checks and browser checks passed.
- Feature 02: Editor Layout — Shared editor navbar, floating project sidebar, tabs, empty states and reusable dialog pattern implemented in both apps. Responsive layout, sidebar controls and unchanged canvas bounds verified.
- Feature 05: PostgreSQL 17 and Prisma 7 local database foundation, initial migration and reusable Express client implemented and verified.
- Feature 07A: Free-plan Prisma Postgres cloud startup verified; restored records matched local source, migration status was current, and authenticated create/reload/rename/delete smoke passed. Local Docker mode and isolated test guard remain available; cloud and local writes do not synchronize.
- Feature 03: Clerk Authentication — Clerk integrated with protected editor routes and native account UI. Next.js Clerk URLs are configured locally; sign-in and sign-up force redirects to the editor, and sign-out uses the configured destination. Next.js sign-in/sign-up screens use Archloom branding, the supplied split-screen visual reference and existing design tokens; sign-in copy matches the mock and responsive form layout was checked. Developer reports sign-in and sign-out working; remaining acceptance checks are listed below.

## In Progress

- Feature 10: React Flow 13.0.3 (MIT) replaces the custom canvas engine, with temporary catalog nodes and Lit activation/drag events. TypeScript, Next.js lint, mocked canvas tests (5), and webpack build passed after fixing stale drops when the library closes mid-drag. Earlier editor tests (16), library tests (3), and shared-sections lint passed. Default Turbopack remains blocked by the known worker-port restriction. The running API connected to local Docker PostgreSQL at loopback port 5432. Chrome verified panned drop centers within 0.13 CSS pixels at 25%, 100%, and 200%, distinct IDs, external drag release and recovery, search-field deletion guards, synthetic invalid drops, and reset preserving node positions. Earlier checks covered keyboard node movement/deletion, reload, project switch, and sign-out. At 390px emulated viewport, click-add and visible delete worked without overflow; physical touch remains unverified. Node drag movement scaling and interrupted node movement remain open: the browser drag tool did not move the node. Cross-account and token-security gates remain open; the existing monitoring-extension discrepancy remains unexplained.

- Feature 09: Browse-only 12-component catalog and panel implemented. Focused tests, lint, TypeScript and webpack build passed; Nx Turbopack build hit the existing worker-port restriction. Local Docker Chrome verified search, clear, no-results, close focus, owned-project switching and reset, keyboard scrolling and tile/search interaction without canvas changes, unavailable UUID, and desktop/mobile fit. A narrow-screen sidebar overlap was fixed and rechecked. A disposable local project was created and deleted. Sign-out removed the panel and redirected to sign-in; switching between distinct identities and physical wheel/touch gesture isolation remain unverified.

- Feature 08: Workspace routes, verified project title and temporary canvas implemented. Focused Next.js tests (19), shared-sections tests (8), TypeScript, both lints and webpack production build passed; default Turbopack build was blocked by port binding. Local Docker Chrome checks passed for create, rename, reload, history, unavailable UUID, active deletion, keyboard and mouse pan, wheel and button zoom, reset, and 1440px/390px layout; the disposable local project was removed. Signed-out routes redirected to sign-in. Desktop and mobile workspace screenshots were inspected. A synthetic pointer cancellation during a mouse drag released capture; a subsequent drag succeeded. Touch pan remains unverified: Chrome DevTools drag emits mouse events under touch emulation. Cross-account verification remains a pre-production gate: no second account was available. Feature 06/07 security gates remain open.

- Feature 07: Authenticated Chrome checks passed for create, rename with stable UUID, reload persistence, duplicate validation, simulated load failure and retry, legacy preservation, and last-delete focus at 390px. Destructive-button contrast now passes at 5.41:1; delete-dialog Lighthouse accessibility is 100 at 390px and desktop. Simulated 400, 404, 409, 413, 500 and 503 responses and pending dismissal were checked. The editor now ends only the rejected Clerk session and blocks project state while sign-out is pending or fails; focused tests cover sign-out failure and stale 401 responses. Live 401 verification: an invalid token received API 401, ended the current Clerk session, and the protected editor redirected to a stable sign-in screen; after reauthentication the editor reopened and fetched the original projects with HTTP 200. Three test projects survived reload and were removed; at desktop and 390px the footer remained visible while a 30-row simulated list scrolled independently. Escape and deletion restored focus. Cross-account checks remain blocked. Existing focused tests, lint, TypeScript and webpack build passed; default Turbopack build remained blocked by sandbox port binding.

- Feature 06: Implemented — automated tests and available live API verification passed. Remaining live security checks blocked by unavailable fixtures. Mandatory before production: verify wrong-instance token rejection, non-session token rejection, untrusted authorized-party rejection, and cross-account isolation.

- Feature 05A: PASS — configuration checks and production builds passed; Chrome observed signed-in editor access, sign-out and protected-route redirect. Compose loaded app-local settings; synthetic Docker context checks, private-file Git ignores, current Nx cache scan and Angular diff check passed.

- Feature 04: deletion focus passed regression tests and authenticated desktop/390px browser checks. Mobile dialog accessibility: Lighthouse 100, no failed audits; Escape restores focus and no horizontal overflow. Live account switching remains unverified: no second account visible in the current Clerk session.

## Next Up

- Complete Feature 09 distinct-identity and physical wheel/touch gesture isolation verification when available.

- Complete blocked cross-account verification when a second existing account is available. Finish Feature 06 security checks before production.
- Feature 04: Local Project Management — `docs/context/feature-specs/04-local-project-management.md`.
- Future: Express API authentication, project ownership and frontend integration (separate specs).

## Verification

- PASS: Latest Angular and Next.js production builds, TypeScript checks, lint and `git diff --check`.
- PASS: Focused authentication tests (Angular 3, Next.js 2); shared UI and sections tests passed in prior runs.
- PASS: Editor layout browser checks in both apps at 390, 768 and 1440px.
- PASS (agent-observed, temporary local servers): Signed-out editor redirects, auth form rendering and token-based styling in both apps.
- Developer-reported: Clerk sign-in and sign-out working.
- Pending: Confirm authenticated flows, session refresh, sign-out route protection and configuration loading on both normal app ports; confirm selected Clerk application and remaining accessibility checks.
- Known issue: Full Angular test suite fails on the pre-existing missing `./nx-welcome` fixture. Existing build/lint warnings remain.
- PASS: Chrome DevTools observed signed-out Next.js `/editor` redirect to Clerk sign-in after sign-out.
- PASS: Clerk sign-in and sign-up URLs moved to local Next.js configuration; signed-out `/editor` redirected to sign-in and sign-up rendered in Chrome DevTools. Next.js tests (6), lint and TypeScript passed; lint retained the existing preview warning.
- PASS: Focused project-data, shared-ui, shared-sections and next-app tests, including editor mutations and simulated identity change; lint for shared-ui, shared-sections and next-app; project-data ESLint; Next.js TypeScript; `git diff --check`; Next.js production build with webpack.
- PASS: Chrome DevTools observed Next.js create from both entry points, slug validation and collisions, rename with stable ID, persistence across reload, confirmed deletion, preserved selection when deleting another row, empty and Shared states, Escape focus return, and simulated storage read/write failures. Mobile 390px had no horizontal overflow; desktop was checked at 1440px.
- BLOCKED: Default Nx Next.js build: Turbopack could not bind a worker port in this environment. Webpack production build passed.
- PASS: Desktop create/rename/delete cancellation preserved storage; Enter created projects; validation feedback was associated with its input; row actions preserved selection and cancel restored action focus. Lighthouse desktop dialog snapshot: accessibility 100, no failed audits. Current-user storage key matched the Clerk user ID.
- PASS: Focused Next.js tests (6), TypeScript and lint after the deletion focus change; lint retains one existing preview warning.
- PASS: Last-project deletion returns focus to New Project on desktop and at 390px; mobile dialog Escape restores focus. Lighthouse mobile dialog accessibility 100 with no failed audits; no horizontal overflow. Focus regression tests passed (2 cases).
- NOT RUN: Live identity switch with a second Clerk account and developer-terminal default Nx build result.

- PASS: Feature 05 PostgreSQL 17 Compose health, Prisma 7.10 validation/generation, initial migration and status, synthetic CRUD/uniqueness/stable-ID checks, restart persistence and fixture cleanup. Express Nx test, lint, typecheck, clean-generation build and existing `/api` endpoint passed. Browser checks not applicable.

## Open Questions

- Feature 07A: Previously observed monitoring-extension catalog mismatch remains unexplained; no extension was intentionally modified.
- No unresolved Feature 04 requirements recorded; confirm any new decisions against the approved spec.
- Complete the remaining Clerk acceptance checks before treating authentication as fully verified.

## Architecture Decisions

- Next.js is the only active Architecture Studio frontend; Angular is reserved for a separate future project and its existing contracts remain intact. Express remains available when required.
- Shared SCSS design tokens; no duplicated component implementations or hardcoded theme colors.
- Clerk owns authentication UI and sessions; frontend integrations stay outside shared Lit libraries.
- Feature 04 legacy localStorage remains preserved and exportable. Feature 07 uses the owner-scoped API for active projects; live verification remains pending.
- Private Express project APIs require server-side authentication and ownership checks before exposure.
- Implement approved feature specs on dev; verify changes before PR to main.

## Session Notes

- Last updated: 2026-11-25.
- Active local URLs: Next.js `http://localhost:3000/editor`; Express `http://localhost:3001` when needed.
- Latest recorded versions: Nx 24.0.6, Angular 22.2.7, Next.js 16.4.6, Lit 3.3.3.
- Agent environment previously restricted Nx sockets and Next.js build ports. Both frontend builds later passed outside the sandbox; no permanent Nx restrictions were disabled.
- Keep detailed test output and screenshots in implementation reports or PRs, not in this tracker.

## Feature 11 — Node connections (implementation in progress, 2026-11-26)

Approved contract: `docs/context/feature-specs/11-node-connections.md`. Changed `apps/next-app/src/app/editor/project-canvas.tsx`, `project-canvas.css`, `apps/next-app/specs/project-canvas.spec.tsx`, and this tracker. Existing untracked specification preserved. React Flow 13.0.3 owns handles and edge geometry; canvas owns temporary edge state and a keyboard Connect form. No new dependency, diagram persistence, API or backend changes.

- D1 BLOCKED: Handles, native connect callbacks and keyboard control implemented; real drag, click/tap and keyboard browser verification unavailable.
- D2 BLOCKED: Expected invalid/self/duplicate rejection and reverse/cycle support. Mock tests observed self/duplicate rejection, reverse direction and rapid native duplicate rejection; cycles, stale callbacks and wrong handles lack focused evidence.
- D3 BLOCKED: Expected directional anchors, selection and reset. TypeScript/build pass; real geometry, focus, edge selection and movement not verified.
- D4 BLOCKED: Mock test observed incident edge removal after node deletion; edge deletion, unrelated edge preservation, input guards and interrupted gesture recovery need further evidence.
- D5 BLOCKED: Existing identity/project keyed canvas boundary retained, with temporary edge state; actual lifecycle and network verification not run.
- D6 BLOCKED: `npx tsc --noEmit -p apps/next-app/tsconfig.json` PASS; `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx lint next-app` PASS; focused Nx Jest PASS (eight tests), direct Jest from `apps/next-app` PASS (eight tests). `npx next build --webpack` from `apps/next-app` PASS; `git diff --check` PASS. Chrome DevTools MCP: port 3000 refused connection; `npm run dev:archloom -- --local` failed because Docker socket access was denied, so no browser interaction, screenshots, console or network evidence. No synthetic input claimed as physical proof.
- D7 BLOCKED: Scope inspection shows no dependency/backend/Angular/Liveblocks changes; full acceptance and verification remain open. Feature 10 pointer movement/interruption, physical touch/panel isolation, cross-account/identity, token gates, Turbopack restriction and prior monitoring discrepancy remain open.

Continued development only; Feature 11 is not acceptance-closed or production-ready. Remaining tests include native gestures, accessible edge deletion, stale scope and cancellation, cycles, unrelated-edge preservation, lifecycle, viewport geometry and 390px browser checks.

### Feature 11 browser follow-up — 2026-11-26

Chrome DevTools MCP reached the manually started frontend and an existing authorized project. Project-list GET returned 200; diagram interactions produced no diagram write in the inspected fetch/XHR list. The backend answered on port 3001; `/api/health` and `/health` returned 404, so these requests do not establish database profile. Docker socket inspection was denied; local database profile was not independently confirmed. Console had no errors in the inspected workspace; Lit development mode, Clerk development mode and a preload warning appeared.

- D1 BLOCKED: Desktop native drag created EC2 → PostgreSQL and Frontend → S3; the Connect form created Frontend → EC2. Click-to-connect and complete keyboard-only activation remain unverified. Mobile emulation used clicks, not physical touch.
- D2 BLOCKED: The form disabled self and duplicate pairs and created the reverse pair. Other invalid handles, stale callbacks, cycles and interrupted gestures remain unverified in browser.
- D3 BLOCKED: Screenshot showed arrowheads at targets. After keyboard-moving EC2 by 5 pixels, its incoming and outgoing SVG paths changed by 5 pixels at the EC2 endpoint while the unrelated path remained unchanged. Panned 25%/100%/200% geometry, reset and single-selection coverage remain incomplete.
- D4 BLOCKED: Delete on a focused edge removed only that edge; deleting EC2 removed its incoming and outgoing edges and preserved Frontend → S3. At 390px, Backspace/Delete in catalog search preserved two nodes and one edge. Interrupted gesture recovery remains open.
- D5 BLOCKED: Switching between existing owned projects and returning yielded an empty graph; reload of a two-node/two-edge graph yielded zero nodes and edges. Signing out with a node present redirected to sign-in; sign-out with an edge present and access-loss behavior remain unverified. No project/database records were created or modified.
- D6 BLOCKED: Desktop screenshot `/private/tmp/archloom-feature11-desktop.png` shows the connected graph; mobile screenshot `/private/tmp/archloom-feature11-mobile.png` shows a connected pair at 390px. Both panels opened separately; mobile Connect form created an edge and document scroll width equaled viewport width. Full mobile gesture/visible-edge deletion, all zoom levels, runtime network failure inspection and physical touch remain open. Prior passing automated checks were not rerun because no production code changed.
- D7 BLOCKED: No production code changes in this follow-up; existing untracked spec and other workspace changes preserved. Feature 10 pointer movement/interruption, physical touch/panel isolation, cross-account and token gates, Turbopack restriction and monitoring discrepancy remain open. A successful native connection drag does not prove node drag movement or physical touch.

Recommendation: ready for continued development with these gates open; not acceptance-closed or production-ready. Smallest manual follow-up: exercise click-to-connect and interruption, edge anchors under panned 25%/100%/200%, reset, mobile touch/visible deletion, sign-out with an edge and access loss; inspect console/network and verify the intended local database profile without revealing credentials.

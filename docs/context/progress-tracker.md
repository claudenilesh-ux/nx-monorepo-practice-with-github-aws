# Progress Tracker

Update this file when a feature changes status. Keep one concise entry per feature; record only actual results and outstanding checks.

## Current Phase
- Feature 04 — Local Project Management (Next.js implementation in verification).

## Current Goal
- Create, rename and delete projects using shared Lit dialogs in Next.js.
- Validate project names and generated slugs; persist projects locally per signed-in user.

## Completed Implementation

- Foundation — Nx workspace with Angular, Next.js and Express; shared design-tokens, shared-ui and shared-sections libraries; main/dev workflow.
- Feature 01: Design System — Shared SCSS tokens, Lit UICs and Lucide icons implemented. Shadow DOM icon rendering and accessible tabs corrected. Focused tests, lint, type checks and browser checks passed.
- Feature 02: Editor Layout — Shared editor navbar, floating project sidebar, tabs, empty states and reusable dialog pattern implemented in both apps. Responsive layout, sidebar controls and unchanged canvas bounds verified.
- Feature 03: Clerk Authentication — Clerk integrated with protected editor routes and native account UI. Next.js Clerk URLs are configured locally; sign-in and sign-up force redirects to the editor, and sign-out uses the configured destination. Next.js sign-in/sign-up screens use Archloom branding, the supplied split-screen visual reference and existing design tokens; sign-in copy matches the mock and responsive form layout was checked. Developer reports sign-in and sign-out working; remaining acceptance checks are listed below.

## In Progress

- Feature 04: Next.js local project management implemented. Deletion focus fix passes focused tests; authenticated desktop and mobile browser verification is pending.

## Next Up

- Feature 04: Local Project Management — `docs/context/feature-specs/04-local-project-management.md`.
- Future: Express API authentication, project ownership and database persistence (separate specs).

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
- PENDING: Verify deletion focus and remaining accessibility checks at desktop and 390px in a signed-in browser. The previous implementation placed focus on `body` after the last deletion; the new fix is not yet browser-verified.
- NOT RUN: Live identity switch with a second Clerk account and developer-terminal default Nx build result.

## Open Questions

- No unresolved Feature 04 requirements recorded; confirm any new decisions against the approved spec.
- Complete the remaining Clerk acceptance checks before treating authentication as fully verified.

## Architecture Decisions

- Next.js is the only active Architecture Studio frontend; Angular is reserved for a separate future project and its existing contracts remain intact. Express remains available when required.
- Shared SCSS design tokens; no duplicated component implementations or hardcoded theme colors.
- Clerk owns authentication UI and sessions; frontend integrations stay outside shared Lit libraries.
- Feature 04 uses browser localStorage scoped by Clerk user. Data is separate per browser origin; no server persistence yet.
- Private Express project APIs require server-side authentication and ownership checks before exposure.
- Implement approved feature specs on dev; verify changes before PR to main.

## Session Notes

- Last updated: 2026-11-25.
- Active local URLs: Next.js `http://localhost:3000/editor`; Express `http://localhost:3001` when needed.
- Latest recorded versions: Nx 24.0.6, Angular 22.2.7, Next.js 16.4.6, Lit 3.3.3.
- Agent environment previously restricted Nx sockets and Next.js build ports. Both frontend builds later passed outside the sandbox; no permanent Nx restrictions were disabled.
- Keep detailed test output and screenshots in implementation reports or PRs, not in this tracker.

# Progress Tracker

Update this file when a feature changes status. Keep one concise entry per feature; record only actual results and outstanding checks.

## Current Phase
- Feature 04 — Local Project Management (spec ready; implementation pending).

## Current Goal
- Create, rename and delete projects using shared Lit dialogs in Angular and Next.js.
- Validate project names and generated slugs; persist projects locally per signed-in user.

## Completed Implementation

- Foundation — Nx workspace with Angular, Next.js and Express; shared design-tokens, shared-ui and shared-sections libraries; main/dev workflow.
- Feature 01: Design System — Shared SCSS tokens, Lit UICs and Lucide icons implemented. Shadow DOM icon rendering and accessible tabs corrected. Focused tests, lint, type checks and browser checks passed.
- Feature 02: Editor Layout — Shared editor navbar, floating project sidebar, tabs, empty states and reusable dialog pattern implemented in both apps. Responsive layout, sidebar controls and unchanged canvas bounds verified.
- Feature 03: Clerk Authentication — Clerk integrated into both apps with protected editor routes, sign-in/sign-up pages, dark theme and native UserButton. Authentication files organized. Developer reports sign-in and sign-out working; remaining acceptance checks are listed below.

## In Progress

- None reported. Feature 04 is ready for implementation.

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
- Feature 04: NOT RUN.

## Open Questions

- No unresolved Feature 04 requirements recorded; confirm any new decisions against the approved spec.
- Complete the remaining Clerk acceptance checks before treating authentication as fully verified.

## Architecture Decisions

- Nx + Angular + Next.js + Express; reusable Lit UICs and SICs.
- Shared SCSS design tokens; no duplicated component implementations or hardcoded theme colors.
- Clerk owns authentication UI and sessions; frontend integrations stay outside shared Lit libraries.
- Feature 04 uses browser localStorage scoped by Clerk user. Data is separate per app origin; no server persistence yet.
- Private Express project APIs require server-side authentication and ownership checks before exposure.
- Implement approved feature specs on dev; verify changes before PR to main.

## Session Notes

- Last updated: 2026-11-25.
- Local URLs: Angular `http://localhost:4200/editor`; Next.js `http://localhost:3000/editor`; Express `http://localhost:3001`.
- Latest recorded versions: Nx 24.0.6, Angular 22.2.7, Next.js 16.4.6, Lit 3.3.3.
- Agent environment previously restricted Nx sockets and Next.js build ports. Both frontend builds later passed outside the sandbox; no permanent Nx restrictions were disabled.
- Keep detailed test output and screenshots in implementation reports or PRs, not in this tracker.

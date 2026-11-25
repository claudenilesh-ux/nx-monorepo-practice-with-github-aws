# Feature 08 - Project Workspace and Canvas Foundation

Status: Proposed scope for implementation on `dev`.
Prerequisite: Feature 07 API-backed projects and Feature 07A cloud cutover.

## Objective

Open an owned project in a refreshable workspace URL and provide the first usable empty canvas with a dark dotted grid, pan, zoom and reset. Preserve the current editor shell and project CRUD. This is a workspace/view foundation, not a diagram editor yet.

## 1. Scope and baseline

- Read root `AGENTS.md`, `CLAUDE.md` if present, current `docs/context/` files, Feature 02/04/06/07/07A specs and actual existing route/component contracts. Check branch, HEAD and `git status`; work on `dev`, preserving unrelated changes. Stop on conflicts rather than reverting user work.
- Next.js is the active frontend. Keep Express as the only project API/database owner. Reuse Clerk, current API client, Lit UIC/SIC components, registered icons and SCSS CSS-variable tokens. No Angular changes.
- No new dependencies, diagram engine, API endpoints, Prisma schema/migrations, cloud configuration, storage, authentication changes, or unrelated refactoring. Preserve existing local/cloud startup modes.

## 2. Project routing and access

- Keep `/editor` as the protected editor shell with its existing no-selection state and project management controls. Add protected `/editor/[projectId]` (UUID), using actual Next App Router conventions and the same editor implementation; no duplicated editor shell or CRUD state. Ensure the existing Clerk route protection covers nested workspace routes; extend only the relevant route matcher if needed.
- URL is the authoritative selected project identity. Clicking a project row or successfully creating a project navigates to that UUID workspace. Edit/delete row actions must not trigger row navigation. Browser Back/Forward and direct URL/reload must restore the corresponding selection. Rename updates title and row without changing the UUID or URL. On successful deletion of the active project, replace route with `/editor`; deletion of another project keeps current route. Failed operations preserve confirmed state. Keep existing pending, focus, and error behavior.
- Resolve the requested UUID from the current authenticated `GET /api/projects` response through `projects-api.ts`. Reuse the existing owned-list request and validated response; do not fetch twice just to resolve the workspace. No trusting localStorage, stale identity state, route text, or unverified cached records. This is a frontend view gate backed by the server-filtered owner list; it is not a substitute for backend authorization of future canvas resources.
- Before identity and list are verified, show existing loading behavior, not a project canvas or stale title. Invalid UUID or a valid UUID absent from a successfully loaded owned list shows a generic unavailable state and a return-to-editor action; do not disclose whether another owner has that UUID. API failures use existing error/retry behavior, not a false unavailable/empty result. Keep existing 401 recovery, abort/late-response protections and identity isolation. Shared stays a placeholder. No collaborator access added in this unit.

## 3. Workspace visual foundation

- Existing top navbar, floating project sidebar, Clerk UserButton, dialogs and dark theme remain. Sidebar overlay must not resize or shift canvas. Display the selected project's verified name in the navbar using the existing composition contract or a narrowly scoped compatible SIC property/slot; handle long names without layout overflow. Use shared components for controls and existing accessible icons. No new theme, hardcoded colors or duplicated SVG icons.
- On a verified selected workspace, render a viewport-filling dotted canvas within the existing editor content area. Use CSS transforms/background and minimal app-local pointer/viewport state; do not implement a general diagram engine. The dotted grid moves/scales with the viewport. Empty-state text may remain a centered UI overlay and must not block panning.
- Drag the empty canvas to pan (mouse/pen and single-pointer touch); release/cancel safely. Provide accessible zoom out/in, visible percentage and reset view controls. Initial zoom 100%; button steps 10 percentage points; clamp to 25%-200%; disable controls at bounds. Wheel zoom over canvas only, centered at cursor; buttons zoom around viewport center. Do not hijack browser/page scrolling outside canvas or intercept browser zoom shortcuts. Reset returns translation to zero and zoom to 100%. No fit-to-content algorithm until nodes exist. Use keyboard-accessible native controls; ensure keyboard users can pan via arrow keys when canvas itself is focused, and controls do not trigger pan. Use pointer capture only while actively dragging; respect reduced motion.
- View state is temporary in memory, resets when project UUID or authenticated identity changes, and does not persist on reload. No autosave or diagram persistence. Keep canvas controls reachable with sidebar open/closed at desktop and mobile widths; do not allow canvas gestures on sidebar, navbar or dialogs.

## 4. Target files

Inspect actual paths and reuse equivalent owners. Expected touch set:
- `apps/next-app/src/app/editor/editor.tsx` and current `/editor` route entry; add `apps/next-app/src/app/editor/[projectId]/page.tsx` if absent.
- Existing app-local canvas implementation if present; otherwise a focused `apps/next-app/src/app/editor/project-canvas.tsx` and only necessary styling/helper files. Keep viewport math small and testable.
- `apps/next-app/src/app/editor/projects-api.ts` only if necessary to reuse current typed list contract; no transport redesign.
- `libs/shared-sections/src/sic-editor-navbar/` and `libs/shared-sections/src/sic-sidebar/` only necessary compatible seams; reuse existing UICs and icon registry. Route/auth state remains in Next.js, not Lit.
- `apps/next-app/specs/editor.spec.tsx` and focused canvas tests; relevant shared-section tests only if changed. Existing Clerk proxy only if nested routes are not already protected.
- `docs/context/feature-specs/08-project-workspace-canvas.md`, `docs/context/progress-tracker.md`; update architecture/UI context only if a real boundary or contract changes.

## 5. Definition of Done

- [ ] Existing project CRUD and protected `/editor` continue to work. Owned project click/create opens UUID route; reload, direct navigation, Back/Forward and rename keep correct selection/title; successful active delete returns to `/editor`. Row edit/delete do not navigate unintentionally.
- [ ] Signed-out nested route uses existing Clerk protection. Unknown/unowned UUID and malformed UUID do not expose canvas or project data. Loading, API failure, 401 and identity switch clear/protect route state; late responses cannot restore prior identity. Focused tests cover these cases using mocks; live two-account checks remain BLOCKED if no second approved account exists. Preserve Feature 06 pre-production security gates and Feature 07 cross-account check.
- [ ] Pan, zoom bounds, percentage, reset, pointer cancel and per-project reset work; keyboard controls are accessible; sidebar and dialogs do not interfere; no new horizontal overflow. No diagram nodes, connections or persistence claims.
- [ ] Run focused changed-project tests, ESLint, `npx tsc --noEmit -p apps/next-app/tsconfig.json`, `npx nx build next-app`, `git diff --check`; run changed shared library checks only when touched. Record actual commands/results, and any default build sandbox limitation separately.
- [ ] Chrome DevTools MCP real browser verification: `npm run dev:archloom -- --local`, `http://localhost:3000/editor`, `http://localhost:3001/api/projects`, using existing authorized Clerk session and isolated disposable local project fixture(s) only. Test route entry/reload/history, rename, active deletion, unavailable UUID, pan/zoom/reset, sidebar overlay at 1440px and 390px, console/network/hydration and keyboard access. Delete only feature-owned fixture(s); leave existing local and cloud records intact. No cloud writes or repeated Feature 07A verification; no automated cloud integration tests. If local runtime/session unavailable, complete independent checks and report blocked browser evidence, not a false PASS.
- [ ] Update tracker with actual status. Report exact changed paths, focused test counts, browser evidence, outstanding blockers and decisions. No secrets in reports or screenshots. Existing private configuration can be consumed only by approved application loaders; do not directly inspect/display/change/copy credentials.

## Out of scope

Diagram nodes, edges, AWS asset catalog, drag/drop, selection tools, undo/redo, persistence/autosave, diagram data model, sharing, collaboration, exports, new libraries, backend/API redesign, cloud migration and deployment. Evaluate a suitable diagram engine separately before implementing actual nodes/edges. No commit, push, merge or next feature without approval.

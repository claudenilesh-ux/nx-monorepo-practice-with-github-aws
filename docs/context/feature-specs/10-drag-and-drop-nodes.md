# Feature 10 — React Flow Canvas Integration & Drag-and-drop Nodes

**Product:** Archloom — Weave your ideas into architecture
**Revision:** 2 — supersedes the earlier custom-canvas Feature 10 proposal
**Status:** React Flow direction approved; detailed acceptance contract ready for review before coding
**Branch:** `dev`
**Repository destination:** `docs/context/feature-specs/10-drag-and-drop-nodes.md`
**Depends on:** Features 08 and 09
**Next feature:** 11 — Node Connections (not in scope)

## 1. Objective

Replace the internal custom canvas engine with React Flow (`@xyflow/react`) and allow an authenticated owner to place, select, move and delete architecture nodes in the existing project workspace. Retain the existing editor shell, Lit component library, tokens, project routing and authorization. Nodes are temporary frontend state. Do not add connections, persistence, sharing or collaboration yet.

Example: open an owned project, drag EC2 from the library onto the canvas, tap PostgreSQL to add it, add a second EC2, move the first and delete the second independently. Pan and zoom without changing the nodes' stored positions.

## 2. Architecture decision and dependency

Use the official open-source `@xyflow/react` package rather than expanding the custom diagram engine. React Flow owns canvas transforms, pan/zoom, node dragging and selection. Next.js owns the project scope, node data, catalog adapter, activation/drop handling and presentation. Lit remains presentational. Express, Clerk and Prisma/PostgreSQL retain their existing responsibilities.

- Inspect actual root package manifest, lockfile, package manager, Nx/Next configuration and installed React/React DOM versions. Select a compatible supported release, verify its license and peer dependencies, and report the resolved version. Use the existing package manager and dependency location convention. For npm workspaces with root dependencies, the expected command is `npm install @xyflow/react` from the root. Change only the appropriate manifest and lockfile; normal necessary transitive dependencies are allowed. Do not use force/legacy-peer-deps, upgrade unrelated packages or add other direct dependencies. Report incompatibility instead of bypassing it.
- Integrate React Flow in the existing client canvas boundary; import required `@xyflow/react/dist/style.css` once at a supported Next.js location. Use one provider/engine per authorized workspace and an appropriately sized parent. No parallel custom transform/pan/drag engine; remove superseded handlers/styles/tests only after equivalent behavior is verified. Preserve existing toolbar/panels and navigation.
- Use React Flow's public APIs, not internal store/DOM assumptions where a public API exists. Do not copy a complete template app. Use existing design tokens, catalog icons and controls. Do not suppress required attribution or alter third-party code.
- Future integration: `@liveblocks/react-flow` provides a controlled flow backed by Liveblocks Storage. Do not install or configure Liveblocks, create rooms, use its credentials or add network requests now. Keep serializable node data and UI-local state distinct. Diagram storage authority (Liveblocks vs PostgreSQL) must be explicitly decided before persistence; avoid two writable sources of truth.

References (official):
- https://reactflow.dev/learn
- https://reactflow.dev/examples/interaction/drag-and-drop
- https://reactflow.dev/api-reference/react-flow
- https://reactflow.dev/api-reference/types/react-flow-instance
- https://reactflow.dev/learn/advanced-use/accessibility
- https://liveblocks.io/docs/api-reference/liveblocks-react-flow

## 3. Scope

In scope: React Flow integration, replacement of obsolete canvas internals, existing controls/background adaptation, desktop library drag/drop, click/tap/keyboard addition, custom architecture nodes, single selection, node movement/deletion, project/identity isolation, responsive and accessibility regressions, focused verification.

Out of scope: edges, connections, handles, minimap, multi-selection, resize, snap-to-grid, undo/redo, auto-layout, diagram persistence (including local/session storage), backend/API/Prisma changes, sharing, Liveblocks, WebSockets, new services, AWS provisioning, export, remote/vendor icon downloads, new UI framework, Angular and unrelated cleanup.

## 4. Functional contract

### 4.1 Existing canvas behavior

- Keep the owned `/editor/[projectId]` workspace, existing title, navigation, generic unavailable state, component library open/close, search, clear, categories, aliases, focus return and responsive panel stacking fix.
- Preserve initial viewport `{x: 0, y: 0, zoom: 1}` relative to the canvas origin, min 25%, max 200%, zoom buttons stepping by 0.1 (10 percentage points, clamped), reset to original translation/100%. No automatic fitView on creation/resize/reset. Reset never deletes nodes. Use existing zoom anchoring and blank-canvas mouse/keyboard pan behavior from Feature 08; inspect its exact spec and implementation before replacing. If React Flow defaults differ, configure or adapt narrowly through public APIs. Do not silently change interactions (including wheel/pinch/double-click) from the existing approved contract. Keep temporary viewport lifecycle as before.
- Keep current dark dotted canvas and toolbar using shared tokens; React Flow Background (dots) may replace the old background. Keep controls outside the transformed node layer. Panels and controls must not pan, zoom or create nodes. Preserve both-panel usability at 390px.

### 4.2 Add nodes

- All 12 existing component types remain available. No duplicated catalog or new entries.
- Desktop native drag-and-drop from an actual library tile into unobscured canvas creates exactly one node centered at the drop location; panel remains open. Ignore invalid/external/stale sources, drops over panels/toolbar/navbar/sidebar or outside canvas; drag ending outside is not click-to-add. Prevent duplicate activation after drag.
- Click/tap or Enter/Space activation adds exactly one node at the center of the usable visible canvas, closes the library through its existing close behavior, and selects/focuses the new node. Calculate actual geometry after close where layout changes. Respect remaining overlays; if no usable space, do not create an invisible node and show a non-blocking message. Mobile library dragging is optional: tap-to-add required.
- Repeated additions get new stable UUIDs. Offset repeated center placement by a small deterministic step (24 world units per axis proposed) when a visible distinct center is available. Otherwise allow overlap; selected node is raised above other nodes, not panels. No collision solver.

### 4.3 Node appearance and interaction

- Use a single app-local custom React Flow node type, e.g. `architecture`, with existing catalog label, icon and tokens. Reuse Lit `uic-icon` and other existing presentational UI if suitable. No remote icons or hardcoded theme colors. Custom node type mapping stable outside render. No Handles or connection callbacks; `nodesConnectable={false}`; edges empty.
- Use React Flow's native selection, dragging, keyboard accessibility and change handlers. Only one selected node; disable box/multi-selection using documented props, and enforce single selection if needed. Clear selection by blank click or Escape in diagram scope; pan/zoom never deletes nodes. Focus and selection visibly distinct. Duplicates distinguishable by accessible name.
- Moving a placed node uses React Flow's native drag, not a second Pointer Events engine. Preserve grab offset, UUID and other nodes. Disable automatic viewport panning on node drag for Feature 10; prevent explicit viewport changes during active drag when necessary to maintain existing isolation. No node/viewport simultaneous movement. Release commits last valid position. On interrupted/cancelled gesture, clear transient interaction state and ensure the next interaction works; rollback to initial position only if supported by a small reliable public-event adapter. Do not build a second gesture engine for rollback. Document observed behavior and any unsupported cancellation case; a stuck gesture or cross-scope mutation is a defect.
- Keep native React Flow keyboard node movement (library-supported step, not the earlier proposed fixed 10-world-unit step). Ensure arrows move a focused selected node, while blank-canvas keyboard panning remains the existing behavior. Keep keyboard accessibility enabled. Avoid duplicate movement handlers; if the library's behavior conflicts with the approved existing keyboard contract, report the conflict before changing it.
- Provide an accessible visible delete action usable on mobile for the selected node; no confirmation or undo for temporary nodes. Delete/Backspace deletes only the focused selected node, never when input/search/editable control owns focus. Disable global library delete shortcuts if needed (`deleteKeyCode={null}`) and implement one diagram-scoped action, not a document-wide listener. Clear selection and return focus to canvas after removal. Keep library input handling and existing panel focus semantics.

### 4.4 State and access lifecycle

- React state is owned by the authorized mounted workspace. Key/remount the flow provider and local state by verified Clerk identity + project UUID or implement equivalent synchronous isolation. No old nodes during unresolved/unavailable auth/project state. Reject stale callbacks/drop sources after scope changes.
- Clear nodes, selection, viewport and transient interactions on reload, workspace leave, different project UUID, sign-out, identity or access loss. Return to prior project starts empty. Same mounted workspace rerender, panel toggle/search, view changes/reset do not clear nodes.
- Visible notice: “Temporary diagram — refreshing or leaving this project will discard nodes.” No saved indicator. No node storage in PostgreSQL, localStorage, sessionStorage, URL or Liveblocks. Existing project API reads/auth traffic remain allowed; no new diagram writes or API endpoints.
- Existing owner-only server-side resource authorization remains authoritative. No collaborator access granted; frontend isolation is not a substitute for backend authorization.

## 5. Technical contract

### 5.1 Controlled React Flow data

Use the native typed node shape rather than a second mirrored graph state. Example (adapt actual exported catalog type):

```ts
import type { Node } from '@xyflow/react';

type ArchitectureFlowNode = Node<
  { componentId: CatalogComponentId },
  'architecture'
>;
```

Each created node has `id: crypto.randomUUID()` (or existing safe UUID helper), `type: 'architecture'`, `position: {x, y}` in flow/world units, and `data: {componentId}`. Derive labels/icons from existing catalog; no copied metadata, credentials, auth identity, DOM objects or callbacks in node data. Validate finite positions and catalog IDs. Use controlled `nodes` and typed `onNodesChange`/`applyNodeChanges` or `useNodesState`; use one local source of truth. Native `selected`, `dragging`, measured dimensions and viewport are transient UI state, not future persisted business data. Avoid duplicating selection state; derive selected node from controlled nodes or maintain a single consistent representation. No generic store or persistence abstraction.

### 5.2 Coordinates and viewport

Use `screenToFlowPosition({x: event.clientX, y: event.clientY})` on initialized React Flow instance for drop/click positions; do not manually subtract bounds or pan before invoking it. Set explicit node origin `[0.5, 0.5]` for centered placement; use consistent origin for all node additions and future data. Verify actual rendered center and movement. Use `flowToScreenPosition` for tests/visibility where useful. Use public viewport helpers (`getViewport`, `setViewport`) to implement existing toolbar step/reset semantics, not a separate transform. Preserve negative finite world positions. No arbitrary clamping of world positions.

Example: at 200% zoom, 100 CSS pixels of movement correspond to 50 world units; at 25%, 25 CSS pixels correspond to 100 world units. Test non-default pan and actual non-zero canvas offset, not just origin at 100%.

### 5.3 Lit integration

Inspect `sic-component-library` API and React wrapper/event handling. Reuse its existing activation event if present; add only minimal typed, bubbling/composed activation or drag lifecycle events where needed across shadow DOM. Lit owns tile semantics and events; Next.js owns drag scope, catalog validation, node state and positioning. For native drag, use a dedicated MIME value and active same-workspace drag record; a payload alone is not authorization. Clear record on end, cancellation, unmount/scope change. Check actual uncovered canvas target and initialized instance; prevent default only for accepted drags. Use `nopan`, `nodrag`, `nowheel` or equivalent documented classes where relevant; do not apply broad global touch-action or event suppression. No third-party drag library.

## 6. Target file map

| Path | Expected action |
| --- | --- |
| `package.json`, existing lockfile (actual location confirmed) | Add compatible `@xyflow/react` only |
| `apps/next-app/src/app/editor/project-canvas.tsx` | Integrate controlled React Flow, provider, drop/activation, viewport controls and scope |
| `apps/next-app/src/app/editor/project-canvas.css` | Adapt theme/background/stacking; remove superseded engine CSS; preserve responsive fix |
| `apps/next-app/src/app/editor/architecture-node.tsx` | Proposed small app-local custom node component, only if useful |
| `apps/next-app/src/app/editor/component-catalog.ts` | Read/reuse; minimal type export only if necessary |
| `libs/shared-sections/src/sic-component-library/sic-component-library.ts` | Minimal presentational seam only if needed |
| `libs/shared-sections/src/sic-component-library/sic-component-library.spec.ts` | Focused seam tests if changed |
| `apps/next-app/specs/project-canvas.spec.tsx` | Update coverage from custom engine internals to behavior; add node cases |
| `apps/next-app/src/app/editor/editor.tsx`, `apps/next-app/src/app/editor/[projectId]/page.tsx` | Inspect auth/route boundary; edit only if needed for synchronous isolation |
| `libs/shared-ui/src/uic-icon/uic-icon.ts` | Read/reuse icons; no expected edit |
| `docs/context/architecture.md`, `docs/context/ui-context.md`, `docs/context/progress-tracker.md` | Record actual engine/boundary changes and evidence; no wholesale replacement |

If Next.js requires CSS import in an existing global entry, use the smallest supported change and report exact path. Add targeted tests only as needed. No new shared libraries or unrelated cleanup. Verify actual paths before edits.

## 7. Verification

### 7.1 Preflight and commands

Check `git branch --show-current`, `git rev-parse --short HEAD`, `git status --short`. Expected `dev`. Read actual `AGENTS.md`, `CLAUDE.md`, relevant current `docs/context/` and Feature 08/09 specs plus this approved revision. Preserve dirty state; no automatic branch switch, commit, push, merge or discard. Report conflicts and continue only independent safe work. Never print secrets.

Use actual Nx/Jest target names and flag syntax; commands below are expected, not verified against repository:

```sh
npx tsc --noEmit -p apps/next-app/tsconfig.json
npx nx test next-app --runInBand --testPathPatterns=project-canvas
npx nx lint next-app
npx nx build next-app
git diff --check
```

If library seam changes, run focused shared-sections Jest and lint targets; if catalog changes, include its tests. Include any added node/adapter tests. Use existing test setup; small targeted mocks/polyfills only if needed in test files, no production workarounds. If known Turbopack worker-port issue occurs, record separately and use actual established webpack production command. Verify dependency/lockfile diff and build; no unrelated test reruns.

### 7.2 Automated coverage

- Valid catalog IDs, independent UUID instances, invalid/external/stale/overlay drops, no duplicate activation, click/tap/keyboard placement and selected node behavior.
- Controlled state changes, deletion only intended node, keyboard/input guards, viewport reset preserving nodes, scope isolation on pending/unavailable/identity/project change, stale callbacks, no storage/API writes.
- Correct placement and movement via public coordinate APIs at 25/100/200% with pan and offset; verify real browser geometry (mocked API tests prove wiring only, not library coordinate math). Cancellation/recovery where testable. Preserve Feature 08/09 user-observable contracts rather than tests tied to removed implementation internals. Do not weaken assertions to make tests pass.

### 7.3 Chrome DevTools MCP required

Run `npm run dev:archloom -- --local` from repository root (Docker PostgreSQL); frontend `http://localhost:3000`, backend `http://localhost:3001`, entry `http://localhost:3000/editor`, workspace `http://localhost:3000/editor/<authorized-existing-project-uuid>` resolved through authorized UI/API. Use authorized Clerk test session and existing local owned projects. No new persistent fixtures/accounts without explicit approval; no mutation of existing project records or cloud integration. If session/fixture unavailable, report BLOCKED and complete independent checks.

Desktop: verify initial viewport, existing pan/keyboard/zoom/reset contract and dotted background; drag EC2, click PostgreSQL, add second EC2, move one, delete the other. Check invalid/overlay/outside drop; search/clear/scroll and input guards; verify no unwanted pan/zoom from node/panel/toolbar. At panned 25%, 100%, 200% verify node center at drop point and measured deltas, reset preserves nodes. Verify interruption recovery, keyboard creation/movement/deletion and focus. Inspect real DOM, console/runtime errors, failed requests and relevant responses, no diagram writes. Capture minimal screenshots/evidence without secrets.

390px: both existing panels usable; search/clear, tap-to-add, node visibility, select and delete, no overflow, blank-canvas pan and node movement. Label emulation/synthetic input distinctly from physical device checks.

Reload, leave/return, switch owned projects, sign out, unavailable UUID; no stale nodes. Actual distinct account switching only with authorized sessions; otherwise keep gate open. No repeat full old suites or cloud tests.

## 8. Definition of Done

Mark each PASS / FAIL / BLOCKED / NOT RUN with actual evidence; distinguish emulated from physical proof.

- [ ] D1 — Compatible React Flow dependency integrated; one viewport/drag engine; no custom parallel engine; existing editor/layout/tokens and library preserved.
- [ ] D2 — Existing catalog supports valid desktop drag and accessible click/tap/keyboard add; duplicates independent; invalid/stale/external/overlay drops rejected; no double-add.
- [ ] D3 — Custom catalog nodes correctly styled; selection, drag, keyboard move and accessible delete work independently; no connections; no input interference; gesture interruption recovers.
- [ ] D4 — Initial 100%, bounds 25–200%, button step 10 points, reset, pan/keyboard controls and component panel interactions preserved; correct placement/delta at panned 25/100/200% verified in real browser; desktop and 390px pass.
- [ ] D5 — Temporary notice; state preserved in same workspace, cleared on reload/leave/project/identity/access change; no stale render or callbacks; zero diagram persistence or new API calls.
- [ ] D6 — Focused tests, TypeScript, lint, production build (established webpack alternative if required), diff check and Chrome DevTools MCP evidence with console/network inspection; no introduced failures.
- [ ] D7 — No Liveblocks, connections, backend, Prisma, Angular, unrelated dependency upgrade, cloud writes, secret exposure or Git commit/push; docs updated with actual status and open gates.

## 9. Existing gates and future roadmap

Keep recorded: actual two-account project isolation and identity switching; wrong-instance, non-session and untrusted authorized-party token rejection; physical touch canvas panning and physical wheel/touch panel isolation; add physical node gesture proof if unavailable; known Turbopack worker-port restriction; unexplained earlier monitoring-extension catalog discrepancy; local/cloud databases independent. Do not claim passed or reopen migration without cause. These remain pre-production gates as appropriate.

Proposed subsequent order (separate specs/approvals): 11 Node Connections (React Flow); 12 Project Access & Sharing (Clerk + Express + Prisma); 13 Diagram Persistence & Synchronization (evaluate Liveblocks Storage and choose authoritative store); 14 Real-time Collaboration (Liveblocks, server-authorized room access). No implementation of these now. Backend permission checks must precede collaborative room access; never trust client role claims.

## 10. Deliverables and explicit revised decisions

Deliver minimal code, dependency change, tests, evidence and concise actual progress update; record architecture/UI change only where applicable. Report files, diff summary, commands/results, Chrome evidence, blockers, regressions and decisions; no commit/push. User approved revising to React Flow. Detailed choices for review: center origin, click-add closes panel and uses visible center, simple duplicate offset, single selection, native library keyboard movement rather than custom 10-unit step, library cancellation recovery rather than mandatory custom rollback, existing toolbar unchanged, temporary state. Confirm approval of this spec before code edits. If current repo contradicts a contract, report it rather than silently changing scope.

# Feature 11 - Node Connections

Product: Archloom | Branch: `dev` | Revision: 1
Status: Proposed implementation contract for review; Feature 10 approved for continued development, not acceptance-closed.
Repository destination: `docs/context/feature-specs/11-node-connections.md`
Depends on: Feature 10 (React Flow integration). Next: Feature 12 (Project Access & Sharing).

## 1. Objective

Allow an authenticated project owner to create, select and delete directed connections between existing temporary architecture nodes. Connections follow their nodes as the diagram changes. Preserve the existing React Flow engine, Lit UI, catalog, viewport and authorization. Nodes and edges remain temporary frontend state; no persistence or collaboration yet.

Example: Add Frontend, EC2 and PostgreSQL; connect Frontend -> EC2 -> PostgreSQL. Move EC2 and both arrows follow it. Delete EC2 and both incident arrows disappear; Frontend and PostgreSQL remain.

## 2. Scope and ownership

In scope: source/target handles, native drag and click/tap connections, keyboard-operable creation alternative, directed arrow styling, connection validation, controlled edge state, single node/edge selection, scoped deletion and incident-edge cleanup, cancellation and scope isolation, responsive UI, focused tests.

Out of scope: persistence (including local/session storage), Liveblocks, collaboration, access/sharing changes, new APIs or schema, new packages, Angular, edge labels/protocols, custom routing engine, reconnecting existing edges, multiple ports per direction, multi-selection, undo/redo, auto-layout, export, provisioning, catalog changes, unrelated refactor.

React Flow owns rendering, native handle gestures, line geometry and edge interaction. Next.js owns validation, authorized workspace lifecycle, controlled node/edge state and UI actions. Lit remains presentational. Reuse existing design tokens and controls; no duplicate SVG engine or new UI framework. Use installed @xyflow/react (reported 13.0.3); confirm actual local public API/type signatures before coding. No install or upgrade.

## 3. Functional contract

### 3.1 Handles and creation

- All existing 12 catalog types use the same custom architecture-node rendering, with one top incoming target handle (`in`) and one bottom outgoing source handle (`out`). Keep labels/icons and current node dimensions as far as practical. Make handles visible, distinguish direction with accessible names, and provide practical hit areas without overlapping node controls. Use existing tokens, not hardcoded colors.
- Enable native React Flow connections in strict source-to-target mode. Drag from a source to a target; also support source click/tap followed by target click/tap using native connectOnClick where supported. Keep connection preview visible and distinct from committed edges. Handle interactions must not start node drag or blank-canvas pan; preserve existing viewport policy and do not introduce unexpected auto-pan.
- Keyboard alternative: reuse existing accessible canvas controls and provide a compact Connect action with labeled source/target node selectors (native select or existing accessible UIC). Both selectors list current nodes with unique human-readable instance identifiers for duplicate catalog labels; default to no target, optionally prefill selected node as source. Connect is disabled for invalid pairs; Enter/Space activates the action, Escape or Cancel closes the UI and returns focus to its trigger. No custom keyboard gesture engine. Do not duplicate a library-supported fully keyboard-operable handle flow if installed version provides equivalent behavior; report the chosen accessible route.
- All input paths call one validation/commit policy. One accepted interaction adds exactly one edge with a stable instance ID. Cancel/invalid gestures create nothing. No implicit creation of nodes.

### 3.2 Validation rules

Reject missing/unknown endpoints, endpoints outside current authorized workspace, missing/wrong handle IDs, same source and target node, and duplicate directed source-target pairs. Revalidate at commit time against latest nodes/edges and current scope, not just at hover. Stale callbacks after scope change or endpoint deletion must not add edges. Use functional state update or equivalent atomic graph update to prevent duplicate rapid submissions; do not generate side effects inside state updater functions.

Allow multiple incoming/outgoing connections to different nodes. Allow reverse direction B -> A when A -> B exists, and cycles (architecture diagrams are not necessarily trees or DAGs). Two EC2 instances are distinct nodes and can connect. No validation based on AWS component categories. A duplicate A -> B is rejected regardless of generated edge ID. Use strict handles; normalize explicit keyboard action to out/in. Native invalid drop on blank canvas, same node, source-to-source or target-to-target creates no edge.

### 3.3 Edge appearance and selection

- Directed solid arrow with arrowhead at target, built-in smoothstep or equivalent installed built-in edge type; use a single consistent default. Existing cyan accent and contrasting selection/focus tokens. Keep preview and selected edge clear; make edge hit area usable without making nearby nodes inaccessible. No animation by default. Use native marker API.
- Edge stays anchored when source or target moves, including keyboard movement, pan and zoom. Reset viewport does not modify nodes or edges. Do not store screen coordinates or duplicate geometry.
- Click/tap edge to select; keyboard focus and selection supported through React Flow. Preserve Feature 10 single-selection contract across nodes and edges (one selected entity at a time); blank click or Escape clears selection in diagram scope. Disable edge reconnection for this milestone. No custom edge path drawing.
- Extend existing visible delete action to selected edge as well as node; deleting edge leaves both nodes. Existing scoped Delete/Backspace action applies only when diagram owns focus and selected entity is intended target; never delete while typing in search/input/select/editable controls. Keep one deletion owner, not competing global and native handlers. Accessible action works on mobile and returns focus safely after deletion.
- Deleting a node removes all incident incoming and outgoing edges via any supported deletion path. Unrelated nodes/edges remain. No orphan edges in rendered or stored graph; use existing controlled state and React Flow deletion APIs or a small cohesive update. No automatic connection between former neighbors.

### 3.4 Lifecycle and cancellation

- Same verified identity + project UUID owns temporary nodes, edges, selection and pending connection state. Preserve graph on ordinary rerender, panel/search changes, pan/zoom/reset.
- Reload, leave, project switch, sign-out, identity/access loss clear graph and pending connection. No old graph during unresolved/unavailable project/auth. Returning starts empty. Maintain existing temporary-diagram notice. No API requests for diagram changes.
- On escape/cancel, invalid release, interrupted gesture, endpoint deletion, panel/control interruption that cancels a gesture, or unmount, clear applicable pending connection state; no stuck preview, accidental edge, or stale keyboard selection. Use supported native event lifecycle; do not introduce parallel gesture engine. Document native limitations honestly and ensure next connection succeeds. Keyboard form selections reconcile when endpoints disappear.
- Preserve Feature 10 library drop guards including fixed stale drop when panel closes. Handle gestures must not trigger library addition or node deletion. No changes to auth/data-fetching behavior.

## 4. Technical approach

Use existing controlled React Flow node state and a controlled edge collection (`useEdgesState`, change helpers, or installed equivalent), with a shared validated commit path for native `onConnect` and accessible action. Prefer public `Handle`, `Position`, `isValidConnection`, `onConnect`, `onEdgesChange`, `addEdge` and built-in marker/edge types where compatible. Use one consistent controlled deletion policy for node and edge changes. Keep UI transient fields separate from the future serializable graph; no new abstraction solely for future persistence.

Minimal logical edge example (illustrative UUIDs):

```ts
type DiagramConnection = {
  id: string;
  source: string; // existing node instance ID
  target: string;
  sourceHandle: 'out';
  targetHandle: 'in';
};
```

Use existing React Flow Edge typing rather than duplicating data models if not needed. IDs generated once per committed connection, stable through movement/selection. Use source/target instance IDs, not catalog IDs. Derive styling, accessibility labels and marker from existing tokens/configuration. Keep state scoped by same authorized workspace boundary; no independent room/storage abstraction. Liveblocks and PostgreSQL storage authority remains undecided until Feature 13.

Official references (verify installed version against local declarations):
- https://reactflow.dev/api-reference/components/handle
- https://reactflow.dev/api-reference/react-flow
- https://reactflow.dev/examples/interaction/validation
- https://reactflow.dev/api-reference/utils/add-edge
- https://reactflow.dev/learn/advanced-use/accessibility

## 5. Target files

- `apps/next-app/src/app/editor/project-canvas.tsx`: existing graph state, custom node rendering if inline, native connections, validation, scoped delete and accessible control.
- `apps/next-app/src/app/editor/project-canvas.css`: handles, edge styling, selected/focus states, responsive control placement.
- `apps/next-app/specs/project-canvas.spec.tsx`: focused wiring and policy regression tests; mock tests do not establish browser geometry.
- Existing custom node component or existing control owner if extracted in actual repo; inspect actual imports before edits. Add small app-local helper/test only if useful for pure validation or deletion tests; no unnecessary new shared components.
- `apps/next-app/src/app/editor/component-catalog.ts`: read/reuse, no expected edit.
- `apps/next-app/src/app/editor/editor.tsx`: inspect scope boundary only; edit only if proven necessary.
- `docs/context/progress-tracker.md`: update actual status and evidence. `docs/context/architecture.md` or `ui-context.md` only if actual contract changed and not already documented.

No expected changes to Lit library, manifest/lockfile, backend, Angular or database. Report deviations and rationale before expanding scope.

## 6. Verification

Preflight: check `git branch --show-current`, `git rev-parse --short HEAD`, `git status --short`. Expected dev. Read AGENTS.md, CLAUDE.md, relevant current docs/context, Feature 10 spec and progress tracker. Preserve all existing changes/untracked specs. No commit, push, merge, branch switch or discard. Do not print secrets.

Focused automated coverage:
- Valid directional commit, stable ID, native and keyboard path share validation; duplicate rapid commits, self-loop, unknown/wrong handle/missing endpoints, stale scope, canceled gestures, reverse edge and cycle allowed, distinct same-type instances.
- Edge selection and scoped deletion; deleting node removes incoming/outgoing edges through keyboard and visible action, unrelated graph preserved; no orphan edges; search/editable controls protected.
- Reset preserves graph; scope/access/reload clears graph and pending interactions; library behavior preserved. Mocked React Flow only proves wiring/policy, not actual geometry/gesture behavior.

Expected commands (confirm actual Nx syntax/config):

```sh
npx tsc --noEmit -p apps/next-app/tsconfig.json
npx nx test next-app --runInBand --testPathPatterns=project-canvas
npx nx lint next-app
git diff --check
```

Run established webpack production build after production code changes. Do not repeatedly trigger known Turbopack worker-port restriction; if default target is blocked record it, use actual established webpack path. Run other affected focused tests only if their code changes. Preserve existing unrelated lint warning as separate evidence. No unnecessary broad test reruns.

### Chrome DevTools MCP (mandatory)

Use `npm run dev:archloom -- --local` when needed; reuse verified running local server if appropriate. FE `http://localhost:3000/editor`; workspace `http://localhost:3000/editor/<authorized-existing-project-uuid>`; BE `http://localhost:3001`. Confirm local DB profile using safe diagnostics (prior run 127.0.0.1:5432, not assumed current). Existing authorized Clerk session and owned local projects only. No DB writes, new accounts or persistent fixtures. Do not kill unrelated processes. If unavailable, report BLOCKED and finish independent work.

Desktop: add Frontend, EC2, PostgreSQL and S3. Connect Frontend -> EC2, EC2 -> PostgreSQL and EC2 -> S3. Verify arrow direction and selection; duplicate, self, wrong handle, empty canvas and cancel produce no edge. Verify click-to-connect, accessible keyboard action, keyboard delete and visible delete, input guards. Move a connected node and confirm both endpoint anchors update; use keyboard movement if tool cannot perform native mouse drag, label evidence separately. Verify panned 25%, 100%, 200% rendering/anchor alignment, reset preserving graph, no unwanted viewport motion. Delete EC2 and verify only incident edges removed (include unrelated edge). Reload, switch owned projects, sign-out and unavailable workspace clear graph/gesture state. Check no new diagram API calls, console/runtime errors, network failures; capture concise screenshots or conversation evidence.

390px: both panels remain usable, tap/click connection, select and visible delete, accessible control usable, no overflow; label emulated clicks/touch separately from physical touch. Actual cross-account only if authorized identities exist. If tool cannot drag, report BLOCKED, do not call synthetic event or keyboard movement equivalent to native pointer proof. Preserve Feature 10 mouse-movement and interruption gates unless actual evidence closes them.

## 7. Definition of Done

- [ ] D1 All existing nodes have accessible input/output handles; native drag and click/tap connection plus keyboard-operable creation supported.
- [ ] D2 One stable directed edge per valid pair; invalid, duplicate, self, stale, unknown endpoints rejected; reverse/cycles and multiple independent instances work.
- [ ] D3 Native arrows attach correctly and follow nodes; selection, focus, deletion, viewport reset and graph isolation preserve Feature 10 behavior.
- [ ] D4 Node deletion removes incident edges only; edge deletion preserves nodes; editable input protected; interruption recovers without stale edge.
- [ ] D5 Temporary graph and pending connections scoped to authorized identity/project; clear on reload/leave/access loss; no persistence/API changes.
- [ ] D6 Focused tests, TypeScript, lint, webpack production build and diff check; Chrome evidence at desktop and 390px, panned zooms, console/network inspection. Record PASS/FAIL/BLOCKED/NOT RUN individually, not blanket pass.
- [ ] D7 No dependency, backend, Angular or Liveblocks changes; actual progress recorded; prior open gates preserved.

## 8. Explicit decisions and existing gates

Proposed choices for approval: top target/bottom source, one handle per direction, smoothstep arrow, strict validation, no self-links or duplicate directed links, allow reverse/cycles, no reconnection/labels, keyboard Connect control if native handle keyboard creation is insufficient, single selection across nodes/edges, cascade incident-edge deletion, temporary graph. No implementation before approval of these details; user has approved starting Feature 11, not every individual UX choice.

Retain Feature 10 mouse node movement scaling and interruption recovery (tool blocked), physical touch/panel gesture isolation, actual cross-account and identity switching, wrong-instance/non-session/untrusted authorized-party token rejection, known Turbopack worker-port restriction, prior cloud monitoring-extension discrepancy and independent local/cloud data. No production-readiness claim. Next Feature 12 sharing; Feature 13 persistence/storage authority and Liveblocks integration decision; Feature 14 collaboration. No work on later features now.

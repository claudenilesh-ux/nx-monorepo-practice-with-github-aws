# 02 - Editor Layout and Base Chrome

Status: Proposed for developer approval; implementation and verification pending.
Developer approved implementation and prerequisite corrections on 2026-11-24. Repair and verify `uic-icon` and the optional `uic-tabs` panel-slot contract described in Feature 01 before implementing this feature. The sidebar may use that contract to associate tabs and panels within the same shadow root.
Branch: `dev` | Merge target: `main` via pull request.
Prerequisite: Feature 01 - Design System and Shared UI Primitives.

## Objective

Read root `AGENTS.md`, the six project context files and `docs/context/feature-specs/01-design-system.md` before starting.

Create the reusable chrome that frames every editor screen: a top navbar, floating left project sidebar, empty editor canvas and a reusable dialog layout pattern. Demonstrate the same UI in Angular and Next.js using the existing Lit UICs, shared SCSS tokens and framework-neutral icons. This is a layout-only iteration, not project management.

## 1. Baseline and ownership

- Inspect `git status`, `git branch --show-current`, `npx nx show projects`, public library exports, existing UIC contracts and actual routing/registration files. Work only on `dev`; report if on another branch before editing. Preserve unrelated changes.
- Verify Feature 01 prerequisites: `uic-nav`, `uic-button`, `uic-icon`, `uic-icon-button`, `uic-tabs`, `uic-empty-state`, `uic-scroll-area` and `uic-modal`. Reuse existing components and actual Nx import aliases. Report missing prerequisites or conflicting contracts; do not silently implement unfinished Feature 01 or recreate libraries.
- `libs/shared-sections/src/sic-editor-navbar/`: editor navbar composition (new if absent).
- `libs/shared-sections/src/sic-sidebar/`: project sidebar composition (reuse if present).
- `libs/shared-sections/src/index.ts`: expose new SICs via the existing public entry point (use the actual entry point if different).
- `libs/shared-ui/src/uic-nav/`, `uic-icon/`, `uic-modal/`: only the additive changes explicitly described below, if required. Preserve other UICs and existing consumers.
- `libs/design-tokens/src/`: existing SCSS tokens and global entry point. No second theme or application-specific theme overrides.
- `apps/angular-app/` and `apps/next-app/`: thin editor route, layout and state integration. Do not duplicate SIC markup or component styles. Preserve the existing root design-system preview.
- No Express changes or new runtime packages. Use the installed framework-neutral Lucide package and existing icon registry; do not install shadcn/ui, Tailwind, lucide-react or Angular-only icon packages.

## 2. Editor navbar

Create shared Lit `sic-editor-navbar`. Compose the existing generic `uic-nav` and `uic-icon-button`.

- Fixed height using `--nav-height`; dark surface and subtle bottom border using existing theme tokens. Place at the top of the editor shell; do not interpret fixed height as requiring viewport-fixed positioning.
- Three sections: left, center and right. Left contains the sidebar toggle; center and right are empty in this iteration. Preserve space for future content without adding actions or product titles.
- Use Lucide `PanelLeftOpen` when the sidebar is closed and `PanelLeftClose` when open. Extend the existing typed icon registry with `panel-left-open` and `panel-left-close` using named imports supported by the installed package. Do not duplicate SVG paths.
- Toggle accessible name: `Open projects sidebar` or `Close projects sidebar`. Expose current expanded state on the actual actionable control; if the existing icon button lacks this capability, add a narrowly scoped optional accessible-expanded property and preserve its existing behavior. Native keyboard activation and visible focus are required.
- Reuse the existing left/right slots on `uic-nav`. If no center slot exists, add an optional named `center` slot in a backward-compatible manner; do not break the Feature 01 preview or reposition existing left/right content.

Public SIC contract (new contract; preserve an existing compatible contract if present):

| Input / event | Type / detail | Behavior |
|---|---|---|
| `sidebarOpen` | boolean | Controlled by the frontend editor page. |
| `sidebar-toggle` | CustomEvent, no detail required | Fires once on user activation; frontend toggles its own state. |

No routing, storage, API calls or internal authoritative sidebar state in the navbar.

## 3. Project sidebar

Create or extend shared Lit `sic-sidebar`. Compose existing `uic-tabs`, `uic-icon-button`, `uic-empty-state`, `uic-scroll-area` and `uic-button` as appropriate.

### Layout and interaction

- Float above the editor canvas on the left, below the navbar, within the editor workspace. Opening or closing the sidebar must not change the canvas width, height or position. The overlay is non-modal; no backdrop or focus trap in this iteration.
- Use an animated horizontal slide from the left on open/close; respect `prefers-reduced-motion`. When closed, the sidebar must be hidden from interaction, keyboard navigation and accessibility tree (including during exit animation). It must not block pointer access to the canvas when closed.
- Use the existing `--sidebar-width` token; constrain to available viewport width and height. Use existing spacing/radius/border tokens. Header and bottom action remain reachable; the middle content can scroll independently. No horizontal page overflow.
- Header: `Projects` title and accessible close icon button (`Close projects sidebar`).
- Tabs: `My Projects` (`mine`) and `Shared` (`shared`). Reuse `uic-tabs` and its existing typed contract. My Projects is initially selected. Selected state is owned by the frontend. Ensure the active tab is associated with its accessible panel; retain keyboard navigation from Feature 01.
- My Projects panel displays `No projects yet`; Shared panel displays `No shared projects yet`. No project rows, mock projects, loading indicators or API requests in this iteration.
- Bottom: full-width primary `New Project` button with existing `plus` icon. Emit the intent event once; the page does not create data, open a dialog or navigate. If the existing button has no width control, prefer an existing supported styling seam; a narrowly scoped optional full-width property on `uic-button` is permitted if required, without altering its default rendering or click behavior. Verify the native button fills the available width, not only its host.
- Closing via header or Escape while focus is within the sidebar requests close and returns focus to the navbar toggle; opening from the toggle keeps focus on it, with a logical next Tab into the sidebar. Do not intercept Escape elsewhere in the editor. Closing and reopening preserves the selected tab during the current page session.

### Public contract

| Input / event | Type / detail | Behavior |
|---|---|---|
| `isOpen` | boolean | Controlled open state, Lit property binding. |
| `activeTab` | `mine` or `shared` | Controlled tab state. |
| `sidebar-close` | CustomEvent, no detail required | Requests close; frontend updates `isOpen`. |
| `tab-change` | CustomEvent, `{ value: 'mine' or 'shared' }` | Requests tab change. |
| `project-create` | CustomEvent, no detail required | Intent only; no creation behavior yet. |

The reference's React `onClose` callback is represented by the existing Lit `sidebar-close` event. Events bubble and are composed as needed. Do not emit multiple section action events for one interaction. If `sic-sidebar` already exposes future project data properties/events, preserve them; do not implement project CRUD or populate them for this iteration.

## 4. Dialog pattern (no actual product dialogs)

Reuse Feature 01 `uic-modal` and its native dialog implementation. Ensure a consistent pattern for future create/rename/delete dialogs:

- Title: existing `heading` property provides the visible accessible dialog name.
- Description: optional named `description` slot for supporting text. Associate supplied description with the native dialog using `aria-describedby` and a valid internal ID; do not reference an absent description.
- Body: preserve the existing default slot for caller content.
- Footer: optional named `footer` slot for caller-provided actions, styled with existing token spacing and responsive wrapping. Use existing UIC buttons for actions.
- Dark surface, text, border, radius, spacing and backdrop use shared SCSS CSS variables. Preserve existing `open`, `uic-close`, Escape handling and focus restoration behavior.
- If the existing modal already offers an equivalent contract, reuse it and document usage rather than adding duplicate slots. Otherwise the two optional slots above are the only authorized modal API extensions.
- Demonstrate the pattern in the existing design-system preview/test fixture only if needed for verification. No new dialog on the editor route, no automatic opening, no Create/Rename/Delete dialog or submit behavior.

## 5. Editor route and framework integration

Both applications expose `/editor`:
- Angular: `http://localhost:4200/editor`
- Next.js: `http://localhost:3000/editor`

Use the actual generated route and component conventions. Keep `/` as the existing Feature 01 preview. If `/editor` already exists, reuse it and report any conflict before replacing behavior.

The editor shell fills the viewport: navbar at top, remaining canvas as the positioning container for the floating sidebar. The canvas is a simple empty dark workspace; no nodes, edges, grid engine, toolbar or diagram library. Page/layout positioning belongs to the frontend; visual composition of navbar and sidebar belongs to shared SICs. Use existing public library entry points and shared tokens; keep local layout CSS minimal.

Each page owns `sidebarOpen` and `activeTab`. Initial state: sidebar open at widths of 768px and above, closed below 768px; `activeTab = 'mine'`. Use the existing documented breakpoint if equivalent; initial viewport detection must be browser-safe. Do not reset user choice on resize. The two apps have independent local state; no storage or cross-app synchronization.

- Angular: reuse browser registration; add `CUSTOM_ELEMENTS_SCHEMA` only on relevant component boundaries. Bind Lit properties and handle typed DOM events.
- Next.js: use existing client-only Lit registration and typed JSX/bridge. Register elements before rendering property-dependent UI. Keep server page where possible; no server execution of browser registration and no hydration mismatch from viewport-dependent initial state.
- Do not call the backend or import API client from UIC/SIC. Ensure public exports create the intended Nx dependencies: both apps -> shared-sections -> shared-ui. Both apps retain design-tokens dependency. Avoid circular dependencies or duplicate registration.

## 6. Styling and execution rules

Use the existing dark theme from `libs/design-tokens/src/global.scss` and its token partials (actual paths after Feature 01). All theme values come from shared tokens. If a necessary layout/animation token is missing, use an existing equivalent or report proposed central token/value for approval; do not silently introduce theme constants. Structural CSS values and required responsive media-query literals are permitted under the existing standards. Honor strict TypeScript and `noImplicitOverride`.

Execute in small units: (A) inspect prerequisites and resolve existing contracts; (B) navbar and toggle icons; (C) sidebar shell, tabs and close/create intents; (D) dialog pattern; (E) integrate both editor routes; (F) final verification. Keep each unit focused and verifiable; stop a blocked unit and report the exact issue. Reuse existing packages and test setup.

Out of scope: project CRUD, real project cards, actual creation dialogs, database, authentication, collaboration, AI workspace, Save/Import/Share buttons, diagram editing, Express changes, theme switching, deployment and unrelated cleanup. No paid services. Do not commit, push, create a PR, merge or start Feature 03 without developer permission.

## 7. Check when done (Definition of Done)

- [ ] Both `/editor` routes compile without TypeScript errors; existing `/` design-system previews remain functional.
- [ ] Shared navbar and sidebar implemented once in Lit; no duplicate Angular/React component implementations or icon libraries.
- [ ] Navbar height, three sections, left toggle and correct open/close icon/accessible name work; center/right remain empty.
- [ ] Sidebar floats and slides above the canvas. Compare canvas bounding rect before/after toggle: identical position and dimensions at the same viewport. Closed sidebar is not focusable/clickable; reduced motion works.
- [ ] Header close and Escape work, focus returns to toggle, keyboard tab navigation and visible focus work. My Projects and Shared show correct empty states; selected tab survives close/reopen. New Project spans the panel width and emits one intent without opening a dialog, navigating or calling an API.
- [ ] Dialog pattern supports title, optional description, body and footer; accessible name/description, Escape and focus restoration verified in the existing preview or focused test fixture. No product dialog implemented.
- [ ] All styling consumes shared dark tokens. Verify computed styles in Shadow DOM; no default light styling. No horizontal overflow or inaccessible controls at 390px mobile, 768px tablet and 1440px desktop; mobile initially closed, desktop initially open.
- [ ] Automatically verify both actual editor URLs using Chrome DevTools MCP at these viewport sizes. Inspect DOM/Shadow DOM, computed styles, geometry, interactions, console errors, failed requests and Next.js hydration warnings. Capture screenshots of open/closed states in both apps; report evidence. If MCP unavailable, mark NOT RUN/BLOCKED, not PASS.
- [ ] Add focused tests for navbar/sidebar properties, events and modal pattern using existing compatible runner. Run applicable `npx nx test shared-ui`, `npx nx test shared-sections` and targeted frontend tests after checking actual targets. Do not disable tests or TS/lint checks to obtain a pass.
- [ ] Run applicable `npx nx lint shared-ui`, `npx nx lint shared-sections`, `npx nx lint angular-app`, `npx nx lint next-app`; confirm actual targets first. Run `npx nx run-many -t build --projects=angular-app,next-app`. No new lint or TS errors; report existing unrelated failures separately and do not claim full PASS if required checks fail.
- [ ] Verify `npx nx graph` or exported graph, and affected projects using `npx nx show projects --affected --files=<actual changed shared-sections file>`; both frontends are affected, Express is not. Verify dependency inputs for build caching. Replace the placeholder with the actual file path.
- [ ] Update `ui-context.md` with approved SIC and dialog contracts/layout; update `architecture.md` only for approved changes if needed; update `progress-tracker.md` with actual evidence and remaining blockers. Review `git diff --stat`, `git diff`, `git status`. Leave changes uncommitted for developer review.

## 8. Final agent report

Return overall PASS/FAIL/BLOCKED, per-unit and DoD status, changed files with exact paths and diff summary, reused components and any additive public contracts, commands and actual lint/test/build results, browser screenshots and console/network/geometry evidence, Nx graph/affected evidence, manual reproduction steps, pre-existing failures and limitations, progress-tracker update and recommended next unit. Never mark unverified work complete.

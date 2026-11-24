# 01 - Design System and Shared UI Primitives

Status: Ready for developer review; implementation and verification pending.
Approved prerequisite corrections (2026-11-24): render Lucide SVG within `uic-icon`'s own shadow root without document scanning. Preserve its public API. Extend `uic-tabs` with optional panel slots: when `panels` is enabled, each item uses a named `panel-<id>` slot inside a corresponding tabpanel in the same shadow root as its tab. Link tabs and panels with IDs, maintain roving focus and keyboard selection, and preserve existing behavior when `panels` is omitted.
The shared-ui Jest target may be configured for Lit ESM using the existing Jest and ts-jest dependencies, without weakening TypeScript checks or changing other projects' test configuration.
Branch: `dev` | Merge target: `main` via pull request.

## Objective

Read the root `AGENTS.md` and all six context files before planning or editing.

Complete the first product iteration: a reusable dark design system and framework-independent Lit UI primitives, demonstrated in both Angular and Next.js. Preserve the existing Nx workspace, global SCSS tokens, and working `uic-button`; do not regenerate them.

The visual reference is the dark architecture editor: near-black surfaces, subtle borders, cyan primary actions, compact rounded controls and stroke-based icons. This iteration builds the UI building blocks, not the editor itself.

## 1. Inspect and reconcile the baseline

- From the Nx workspace root, inspect `git status`, `git branch --show-current`, `npx nx show projects`, installed dependencies, public library exports and actual frontend entry points. Work on `dev` only; if not on `dev`, report before editing. Preserve unrelated changes.
- Check the existing `design-tokens`, `shared-ui`, `shared-sections` projects and the implementation of `uic-button`. Reuse working code and report any existing failures.
- The approved styling approach is shared SCSS + runtime CSS custom properties + native Lit `css` styles inside Shadow DOM. Reconcile old `tokens.css`/`global.css` references in context docs with actual SCSS paths. Keep existing approved token values; flag conflicting values or unrelated architectural requirements instead of silently choosing replacements.
- Use the actual generated Nx aliases, project names and test targets, not guessed paths or CLI flags. No new application or library generation is needed.

## 2. Shared global styles

Owner: `libs/design-tokens/src/`.

Reuse `global.scss`, `_colors.scss`, `_typography.scss`, `_spacing.scss`, `_radius.scss`, `_breakpoints.scss`, `_mixins.scss` and `_reset.scss` where present. Keep one global stylesheet entry point imported once in each frontend. Express must not consume UI code or styles.

- All theme colors, typography, spacing, radii, control dimensions, icon sizes, borders and focus styling come from the shared tokens. Retain existing tokens, including `--bg-base`, `--bg-surface`, `--bg-hover`, `--accent-primary`, `--text-primary`, `--text-muted`, `--text-on-accent`, `--border-default`, `--state-error`, `--state-success`, `--space-*` and `--radius-*`.
- If a required token is missing, add it centrally only if its value is already defined in approved context; otherwise report the proposed token/value for approval. Do not create duplicate theme definitions or per-app token overrides.
- Dark-only theme for this iteration. No default light surfaces, hardcoded component theme values, external fonts or theme switcher. Structural CSS values (0, 100%, flex/grid) are allowed. Apply local box sizing and inherited token styles inside shadow roots; global selectors do not cross Shadow DOM.
- Keep the existing Nx project dependency and cache input configuration correct for both frontends consuming design-tokens. Verify the graph and affected projects.

## 3. Framework-neutral icons

Use the official `lucide` vanilla JavaScript package (https://lucide.dev/guide/lucide). This is the only new runtime dependency authorized by this spec once approved. Reuse it if installed; otherwise install from the workspace root using the existing npm setup and record the resolved version. Inspect its actual exports/types before implementation.

Create a shared `uic-icon` in `libs/shared-ui/src/uic-icon/` with a typed, explicit registry of only the needed icons: plus, x, pencil, trash-2, menu, user, folder, save, upload, link, sparkles, check, chevron-down. Map names to named imports using the installed package's API. Render SVG locally within Lit (not document-wide DOM scanning); decorative icons are aria-hidden and use currentColor and shared icon size tokens. No full icon collection import, CDN, icon font, untrusted SVG/HTML injection, lucide-react or Angular-specific icon package. Unknown names render no icon without throwing. Accessible names belong to the enclosing actionable control.

## 4. Shared UI component catalogue

Owner: `libs/shared-ui/src/`. Use one Lit implementation per tag, public exports through the existing library entry point, typed reactive properties and slots. Keep existing contracts intact. All new contracts below are proposals approved by the developer when this spec is authorized; if an existing public contract conflicts, stop the affected unit and report the conflict.

| Component | Public contract | Required behavior |
|---|---|---|
| `uic-button` (existing) | `variant: primary/secondary`, `disabled`, default slot; native click | Preserve working implementation; primary/secondary, hover, focus and disabled states; native button semantics. |
| `uic-icon` | `name`, `size: sm/md` (default md) | Render registered decorative SVG using theme tokens. |
| `uic-icon-button` | `icon`, `label`, `disabled`; native click | Reuse uic-icon; native button, accessible label, visible focus; no activation when disabled. |
| `uic-card` | default slot | Dark surface, border, radius and padding from tokens; no actions or API logic. |
| `uic-input` | `label`, `placeholder`, `value`, `disabled`; `uic-change` with `{ value: string }` | Native labelled text input, controlled value, emits on user input, disabled and focus states. |
| `uic-textarea` | same as uic-input | Native labelled multiline input, newline support, controlled value; vertical resize. |
| `uic-tabs` | `items: {id: string; label: string}[]`, `value`; `uic-change` with `{ value: string }` | Selected/unselected styling; keyboard arrows, Home/End, activation; tablist/tab semantics and caller-owned panel content. |
| `uic-modal` | `heading`, `open`, default slot; `uic-close` | Native dialog; token-based backdrop, close control, Escape, focus restoration; emits once on user dismissal; programmatic close does not emit a duplicate. |
| `uic-scroll-area` | default slot | Native scrolling within caller-constrained height; overflow-y auto; keyboard reachable where needed; no custom scrollbar engine. |
| `uic-avatar` | `src`, `label` | Circular local image, accessible label, initials fallback for missing/failed image. |
| `uic-nav` | named `left`/`right` slots | Token-based bar and border; no routing or application logic. |
| `uic-list-item` | `label`, `selected`; `uic-select`, `uic-edit`, `uic-delete` | Separate accessible actions, no nested buttons; selection visual; edit/delete must not trigger select. |
| `uic-empty-state` | `heading`, `description`, named `action` slot | Centered copy and optional caller-provided action. |

Custom events bubble and are composed where needed, and are emitted only for user actions. Complex values bind as properties, not serialized attributes. Respect `noImplicitOverride` (`static override properties/styles`, `protected override render()`); use strict TS and safe reactive field initialization. Keep browser registration idempotent. Do not add a second UI framework, Tailwind, shadcn/ui, or a Tailwind class-merging `cn()` helper.

## 5. Integrate and demonstrate

- Use the existing design-system preview on the root route of both frontends (Angular `http://localhost:4200/`, Next.js `http://localhost:3000/`). If the existing preview moved, use its actual route and record it. No new product routes are required.
- Reuse the existing app entry points and replace only equivalent temporary native preview controls and unused styles. Add simple demonstrations of every component, including interactive tabs, text input, textarea, dialog, disabled controls and scroll overflow. Preview state is local and has no API calls.
- Angular: browser registration and `CUSTOM_ELEMENTS_SCHEMA` on relevant component boundaries; bind properties and events properly.
- Next.js: keep the page server component where possible; register Lit in a browser-only client boundary before mounting property-dependent elements. Use typed JSX declarations or the existing compatible bridge for installed React. No server evaluation of browser registration and no hydration warnings.
- Both frontends use the same Lit implementations, shared icon registry and SCSS tokens. They may have thin framework-specific preview state and event handlers; do not duplicate component internals or styles.

## 6. Execution order and boundaries

Execute small verifiable units, in this order: (A) inspect/reconcile styles and existing button; (B) icon and icon button; (C) card, input and textarea, one component at a time; (D) tabs, modal and scroll area, one component at a time; (E) avatar, nav, list item and empty state, one component at a time; (F) final preview and regression check. For each component, confirm contract, implement, add focused tests and verify both frontends before advancing. Record partial results and stop a blocked unit rather than guessing.

Out of scope: SIC sidebar, full editor page, diagram canvas/nodes, AI workspace/chat, Save/Import/Share logic, project CRUD, authentication, database, Express changes, deployment, Storybook, dark/light switcher, unrelated cleanup or library migration. No paid services. Do not commit, push, create a PR or merge without permission.

## 7. Check when done (Definition of Done)

- [ ] Existing button remains working; all listed UICs are implemented once and import in both apps without errors.
- [ ] Components match the existing dark theme; no light fallback or hardcoded theme styling. Both preview pages demonstrate the same controls and icons.
- [ ] Change `--accent-primary` temporarily in `_colors.scss`; verify computed styles inside Lit shadow roots in both apps, then restore it. Verify shared typography/spacing/radius usage.
- [ ] Verify property updates, event payloads, one event per action, disabled states, keyboard focus and activation, modal Escape/focus restoration, scroll overflow and avatar fallback.
- [ ] Use Chrome DevTools MCP against both real preview URLs at desktop and 390px mobile; inspect DOM/Shadow DOM, computed styles, console, failed network requests, hydration errors and horizontal overflow. Capture screenshots of both and record evidence. If unavailable, mark NOT RUN/BLOCKED, not PASS.
- [ ] Run focused tests for component contracts with the existing compatible test runner; if Jest cannot load Lit ESM, report the exact blocker and propose a minimal test configuration change for approval; do not disable tests.
- [ ] Run `npx nx show projects`, `npx nx graph` (or export graph), and `npx nx show projects --affected --files=libs/design-tokens/src/_colors.scss`; both frontends are affected, Express is not. Confirm build inputs include dependency changes.
- [ ] Run `npx nx lint shared-ui`, `npx nx test shared-ui`, and applicable frontend lint/test targets after confirming target names. Run `npx nx run-many -t build --projects=angular-app,next-app`. Record exact commands and results; do not invent missing targets or claim unavailable checks pass.
- [ ] Update `docs/context/ui-context.md`, `architecture.md`, `code-standards.md` only for approved decisions; update `progress-tracker.md` with actual results and outstanding issues. Add the feature-spec reading rule to root `AGENTS.md`/`CLAUDE.md` only if developer approves that workflow update.
- [ ] Review `git diff --stat`, `git diff` and `git status`; no unrelated changes, no generated artifacts or secrets staged. Leave work uncommitted for developer review.

## 8. Final agent report

Return: overall PASS/FAIL/BLOCKED; component-by-component status; files changed and exact paths; contract/style decisions and diff summary; dependency/version changes; exact lint/test/build commands and results; browser screenshots and console/network evidence; Nx graph/affected evidence; manual reproduction steps; unrelated failures and limitations; tracker update; next recommended unit. Never mark an unverified check complete.

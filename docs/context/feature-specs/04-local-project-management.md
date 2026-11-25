# Feature 04 - Local Project Management

Read `AGENTS.md`, the required context files and the existing editor/authentication specs before starting. Work on `dev`. Inspect existing implementation and reuse it. This spec is approved for Next.js only.

## Objective

Allow signed-in users to create, select, rename and delete local projects in Next.js using the existing dark editor layout and shared Lit components.

## Implementation

### 1. Create project

- Both the sidebar `New Project` button and the central empty-state `+ Create Project` button open the same Create Project dialog.
- Use `uic-modal`, `uic-input`, `uic-button` and existing Lucide icons. Title: `Create Project`.
- Show a labelled Project Name input and a read-only Project Slug preview below it. Update the slug as the user types.
- Footer: `Cancel` and `Create`. Enter submits a valid name; invalid input cannot submit. Cancel, Escape and close dismiss without changes.
- On successful creation, close the dialog, select the new project, activate `My Projects`, and show the project in the sidebar. Display its name in the editor workspace; do not implement a diagram canvas or a new slug-based route yet.

### 2. Validation and slug

- Trim leading/trailing whitespace and collapse consecutive internal spaces. Require 1-100 characters after normalization and at least one ASCII letter or digit.
- Accept ASCII letters, digits, spaces and hyphens only. Reject unsupported characters rather than silently removing them. Display inline validation feedback; disable submission while invalid.
- Slug: lowercase the normalized name, replace runs of spaces/hyphens with one hyphen, remove leading/trailing hyphens. Require a nonempty slug. Reject duplicate slugs within the current user's local projects, excluding the project being renamed.

| Name | Slug / result |
|---|---|
| `My First Project` | `my-first-project` |
| `  AWS   Architecture  ` | `aws-architecture` |
| `API--Gateway` | `api-gateway` |
| `!!!!`, `---`, empty, `Project!` | Invalid |

### 3. Sidebar and rename

- Render the local projects under `My Projects` using `sic-sidebar` and `uic-list-item`; show name and slug (secondary text), selected styling, and accessible pencil and trash icon buttons.
- Keep `Shared` as its existing empty placeholder. Selecting a row opens/selects that project locally. Edit/delete actions must not also select the row.
- Pencil opens `Rename Project` dialog with the current name and derived slug. Reuse the create form/dialog composition and validation. Footer: `Cancel` and `Save`.
- Save updates the name and slug, preserves the stable ID, list position and selection, and closes the dialog. An unchanged normalized name makes no data change. Cancel/Escape leaves data unchanged.

### 4. Delete project

- Trash opens `Delete Project` confirmation dialog showing the project name and stating the action cannot be undone.
- Footer: `Cancel` and `Delete` (destructive styling from existing error tokens). No deletion before confirmation.
- Confirm removes only that project. Preserve selection if deleting another project; if deleting the selected one, clear selection and show the central empty state. Restore the sidebar empty state when the last project is removed.

### 5. Local data and ownership

- Model: `{ id: string; name: string; slug: string }`; generate a stable UUID once on create. Rename never changes the ID.
- Use browser `localStorage` with a versioned key scoped by the authenticated Clerk user ID. Start with an empty list; persist successful create/rename/delete operations across reloads.
- Use framework-independent TypeScript validation, slug and local repository logic via an existing suitable shared library; create one narrowly scoped Nx library only if no suitable owner exists.
- Read storage only after authentication and browser initialization; reset/reload state on identity changes. Never store Clerk tokens, secrets or profile data. Storage is local to the browser origin; Different browser origins do not synchronize. This is not a security boundary or server-side authorization.
- Validate stored data on read. On malformed/unavailable storage or failed writes, show an error and preserve existing data; do not silently overwrite it or claim a successful mutation.
- This iteration explicitly defers the previously planned Express-backed project repository. Update architecture/project overview only to record this temporary local-storage decision; keep future backend ownership unchanged.

## UI and scope

- Reuse the existing shared `uic-modal`, `uic-input`, `uic-button`, `uic-icon`, `uic-icon-button`, `uic-list-item`, `uic-empty-state` and `sic-sidebar` contracts. Extend only missing optional seams needed here (secondary row text, validation feedback, destructive action styling, or project row inputs/events); preserve existing consumers.
- Shared Lit create/rename form and delete confirmation composition belong in `libs/shared-sections/src/`; apps own authenticated state and persistence orchestration. UIC/SIC must not access Clerk or storage. Use typed properties/events and existing public exports. Do not duplicate dialog markup or component styles.
- Keep global SCSS tokens, dark theme, responsive floating sidebar and Clerk route protection intact. Use native dialog focus management, accessible labels, keyboard activation, visible focus, associated validation feedback and focus return to trigger (or a logical surviving control after deletion). Prevent duplicate submission.
- Target the existing editor route in `apps/next-app/`, `libs/shared-sections/src/sic-sidebar/`, required shared UICs in `libs/shared-ui/src/`, and the shared project logic. Inspect actual paths and import aliases before changes.
- Out of scope: Express APIs, database, real sharing, diagram editing, slug-based routing, Clerk changes, new UI/icon dependencies, deployment and unrelated refactoring.

## Check when done

Use Chrome DevTools MCP against `http://localhost:3000/editor` with signed-in sessions.

- [ ] Create dialog opens from both entry points; live slug and invalid/duplicate-name checks work.
- [ ] Create/select, rename (same ID), cancel and confirmed delete work; row actions do not select unintentionally.
- [ ] Refresh retains projects; identity changes do not display the previous user's list; storage failures do not discard data silently.
- [ ] Last deletion restores empty states; Shared tab remains unchanged; Clerk sign-in/sign-out and protected routes are preserved.
- [ ] Next.js uses shared UIC/SIC and global dark tokens; keyboard, focus and desktop/mobile layouts work; no unexpected console/network/hydration errors. Capture browser evidence.
- [ ] Focused tests cover validation, slug collisions, persistence and mutation behavior; run applicable Nx lint/test targets for changed projects, the Next.js production build, and `git diff --check`.
- [ ] Update `docs/context/progress-tracker.md` with actual results. Report changed files, exact commands/results, browser evidence and remaining blockers. Use PASS/FAIL/BLOCKED/NOT RUN; continue independent approved work if verification is unavailable.

Do not commit, push, merge or begin the next feature without approval.

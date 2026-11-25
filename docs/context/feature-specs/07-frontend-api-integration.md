# Feature 07 - Frontend API Integration

## Objective

Connect Archloom's Next.js editor to the existing authenticated Express project APIs. PostgreSQL becomes the single source of truth; preserve Feature 04 UI and interaction contracts.

Read `AGENTS.md`, current context files and Feature 04/05A/06 specs. Work on `dev`; inspect existing changes, project-data contracts and actual API implementation first. Feature 06's available local verification permits development; retain its four blocked live security checks as mandatory pre-production gates. Do not claim them passed.

## 1. API contract

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in the Next.js app-local configuration and safe `.env.example`. Validate the configured HTTP(S) base origin; no hardcoded runtime fallback. Production uses HTTPS. Include this public build-time variable in the existing Nx configuration hash/input mechanism.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/projects` | None | 200 `{ projects: Project[] }` |
| POST | `/api/projects` | `{ name: string }` | 201 `{ project: Project }` |
| PATCH | `/api/projects/:projectId` | `{ name: string }` | 200 `{ project: Project }` |
| DELETE | `/api/projects/:projectId` | None | 204, empty body |

`Project = { id: string; name: string; slug: string; createdAt: string; updatedAt: string }`. Use server-returned UUIDs, slugs and ISO timestamps. Never send client IDs, owner IDs, slugs, roles or timestamps in mutation bodies. Reuse shared types and pure name/slug validation; backend validation and uniqueness remain authoritative.

## 2. Authenticated API client

- Create one small typed client using native `fetch` (reuse an existing equivalent). Keep HTTP transport separate from editor state and Lit presentation; inject token retrieval if shared, rather than importing Clerk into shared libraries. No new fetching dependency.
- After Clerk is loaded and signed in, retrieve the current default session token using `useAuth().getToken()` for each request. If absent, do not call the API. Send `Authorization: Bearer <token>`, JSON content type for mutations, `credentials: 'omit'` and `cache: 'no-store'`. Never persist or log tokens. Do not follow unexpected API redirects with credentials.
- Validate expected success/error response shapes; handle DELETE 204 without parsing JSON. Map HTTP/network failures to safe typed errors. No secret keys, Prisma or direct database access in Next.js.
- Clear visible projects, selection, dialogs and pending state immediately on sign-out or user/session change. Abort outstanding requests and ignore late results from previous identities or superseded loads, including token retrieval and mutations. Do not fetch until identity is known. Do not retry mutations automatically.

## 3. Editor behaviour

- On entry, load owned projects from GET. Distinguish loading, loaded-empty and failed states; show retry on load failure, not a false empty state. Shared remains an empty placeholder.
- Both existing create entry points open the same dialog. Keep live slug preview and local validation, including known duplicates. Submit only the name; select the server-returned project and close on success. Keep newest-first ordering with the existing API tie-breaker.
- Rename: prefill current name, retain stable ID and selection, replace only the returned record. Delete: require confirmation, remove only after 204; preserve other selection or clear the deleted selection. Last deletion restores empty states and focus to a surviving New Project control.
- Cancel/Escape before submission leaves data unchanged. While a mutation is pending, show accessible busy state, prevent duplicate submission and accidental dismissal, then restore controls. Apply successful changes only after server confirmation. Avoid stale GET responses overwriting completed mutations; serialize conflicting work or reconcile with a fresh GET.
- Preserve existing UIC/SIC styling, dark tokens, mobile sidebar, keyboard controls and focus restoration. Add only narrowly required optional loading/error seams; keep existing consumers compatible. No new UI library.

## 4. Error behaviour

| Condition | Expected UI |
|---|---|
| 400 / VALIDATION_ERROR | Inline validation feedback; preserve form |
| 401 / UNAUTHORIZED or missing token | Clear protected state; require re-authentication through existing Clerk flow; no auth bypass |
| 404 / PROJECT_NOT_FOUND | Explain unavailable project and refresh list; remove stale selection if absent |
| 409 / SLUG_CONFLICT | Inline duplicate-name/slug feedback; keep dialog open |
| 413 / PAYLOAD_TOO_LARGE | Safe validation message; no data mutation claimed |
| 500 / 503 / network failure | Safe error, retain last confirmed data and input; retry GET explicitly |

For uncertain mutation outcomes (e.g. connection lost after commit), do not claim success or failure of the database write. Refresh server data before allowing a deliberate retry. Do not auto-replay POST/PATCH/DELETE. Never display raw stack traces, credentials or tokens.

## 5. Legacy localStorage projects

- Stop reading/writing localStorage as the active project repository. No fallback to local CRUD if the API is unavailable.
- Preserve existing user-scoped legacy keys and data; do not delete, overwrite or automatically upload them. Once authenticated, detect legacy data only for the current user using the existing storage contract.
- If legacy projects exist, display a concise notice that they are local-only and not synchronized. Offer an explicit JSON backup/export of validated legacy project fields using existing controls. Preserve malformed data unchanged and report that it cannot be read; storage errors must not prevent server-backed CRUD.
- No automatic import, merge, deduplication or ID mapping in this feature. Users may recreate projects manually; a dedicated import flow can be approved later. No cross-user legacy data access or token/profile export.

## 6. Target files and boundaries

- `apps/next-app/src/app/editor/editor.tsx` and `apps/next-app/specs/editor.spec.tsx`.
- Existing app-local API client location, or a focused `apps/next-app/src/app/editor/projects-api.ts` and tests if absent. Extract state orchestration only if needed for clarity/testing.
- `libs/project-data/src/`: reuse pure validation/types, extend only if needed; keep legacy storage compatibility.
- `libs/shared-sections/src/sic-project-dialog/`, `libs/shared-sections/src/sic-sidebar/` and existing UICs: only necessary backward-compatible seams.
- `apps/next-app/.env.example`, existing private local configuration (developer-managed), and existing public config hash/cache inputs if required.
- Express, Prisma schema/migrations, Angular, Clerk configuration, sharing, invitations, workspace routing, canvas, new infrastructure and unrelated refactoring are out of scope. Report API contract defects separately; do not silently change backend behavior.

## 7. Definition of Done

- [ ] Focused tests: token/header handling, null token, all four API response contracts (including 204), error mappings, duplicate submission, loading/empty/error, stale identity/load results, mutation failure and legacy preservation/export. No optimistic mutation or secret logging.
- [ ] Chrome DevTools MCP at `http://localhost:3000/editor` with Express `http://localhost:3001/api/projects` and local PostgreSQL: verify real create from both entry points, list, rename (same UUID), cancel, confirmed delete, reload persistence, duplicate/invalid name handling, actual requests/statuses and last-delete focus. Verify desktop and 390px mobile; no unexpected console, network or hydration errors. Do not expose tokens in evidence.
- [ ] Prove persistence in a second browser context using the same existing account, if available. Verify sign-out and identity isolation; use focused simulated identity-switch tests and record unavailable live two-account checks as BLOCKED. Do not create accounts/instances without approval.
- [ ] Simulate backend unavailable and recovery, 401/409/404 errors, pending/double-submit and late responses; check no local CRUD fallback or false success. Verify legacy data remains intact. Clean up only feature-owned test records.
- [ ] Run relevant changed-project Nx tests/lint, `npx tsc --noEmit -p apps/next-app/tsconfig.json`, `npx nx build next-app`, `git diff --check`. If sandbox blocks default build, report it separately from any alternative build. No unnecessary repeated tests or paid resources.
- [ ] Update `architecture.md` and `progress-tracker.md` concisely. Report exact changed paths, actual test counts/results, browser evidence and remaining blockers. Do not claim COMPLETE if mandatory verification is missing.

Do not commit, push, merge or start Feature 08 without approval.

Reference: https://clerk.com/docs/guides/development/making-requests

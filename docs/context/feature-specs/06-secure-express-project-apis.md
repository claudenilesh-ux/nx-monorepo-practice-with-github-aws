# Feature 06 - Secure Express Project APIs

## Objective

Expose authenticated project CRUD APIs in Express using the existing Prisma/PostgreSQL database. Each user can access and mutate only their own projects. Next.js continues using localStorage until Feature 07.

Work on `dev`. Read `AGENTS.md`, current context files and Feature 04/05/05A specs. Check branch, existing changes and the actual schema/configuration before implementation. Preserve unfinished work; do not reapply completed changes. Feature 05 database readiness and migration status are prerequisites for live API verification. If unavailable, complete independent approved work and report the blocker.

## 1. API contract

Base URL: `http://localhost:3001/api/projects`.

| Method | Path | Request body | Success response |
|---|---|---|---|
| GET | `/api/projects` | None | 200 `{ projects: Project[] }` (owned projects, newest first; stable ID tie-breaker) |
| POST | `/api/projects` | `{ name: string }` | 201 `{ project: Project }` |
| PATCH | `/api/projects/:projectId` | `{ name: string }` | 200 `{ project: Project }` |
| DELETE | `/api/projects/:projectId` | None | 204, empty body |

Public response model: `Project = { id: string; name: string; slug: string; createdAt: string; updatedAt: string }`. IDs are UUIDs; dates are ISO 8601 strings. Return only these fields. No owner IDs, collaborator records or Clerk profile data in responses. Keep the existing starter `/api` behavior unchanged.

## 2. Authentication and authorization

- Use the official compatible `@clerk/express` SDK (`clerkMiddleware` and `getAuth`, or the installed SDK's equivalent supported server-side verifier). Accept only verified Clerk user session Bearer tokens. Reject missing, malformed, invalid, expired, wrong-instance and non-session tokens with JSON 401; do not redirect or fall back to cookie authentication on project routes. Never manually trust decoded JWT claims.
- Load Clerk configuration from Express app-local configuration using Feature 05A conventions; reuse the existing Clerk instance. Add placeholder-only `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` and `CORS_ORIGIN=http://localhost:3000` to the Express example as needed. Configure Clerk authorized parties from explicit trusted frontend origins. Fail closed for missing/invalid required configuration; never print credentials or tokens.
- Allow CORS only for the configured Next.js origin, with Authorization and Content-Type headers and the required methods. Allow preflight without authentication; require authentication for actual project requests. No wildcard origins or credentialed cookies. CORS is not authorization.
- Derive `ownerId` exclusively from the verified Clerk user ID. Never accept client-supplied `ownerId`, `id`, `slug`, role or timestamps. No Clerk user lookup per request.
- List by `ownerId`; create with authenticated `ownerId`; rename/delete with both `id` and `ownerId` in the database mutation filter (not just a prior ownership check). Return 404 for both nonexistent and other-user project IDs to avoid revealing their existence.
- Keep collaborator records/schema intact if present. Membership does not grant access to these owner-only routes yet. Sharing, invitations and collaborator authorization are future scope.

## 3. Validation and errors

- Reuse Feature 04 pure name/slug logic from `libs/project-data/src/` (no browser storage imports or browser globals in Express). Expose a server-safe shared entry point if required; do not duplicate validation rules or modify frontend behavior.
- Require a JSON object containing only `name` for POST/PATCH. Trim and collapse internal spaces; require 1-100 normalized characters, ASCII letters/digits/spaces/hyphens only, and at least one letter/digit. Generate slug on the server using the existing normalization rule. Reject unsupported names, missing fields, unexpected fields, malformed JSON and invalid UUID path parameters. Bound JSON request size.
- Database generates the stable UUID. Rename updates name/slug without changing ID or owner. An unchanged normalized name returns the existing project without a write. Delete removes only the authorized project; preserve existing schema cascade behavior if applicable.
- Enforce per-owner slug uniqueness using the database constraint. Map the relevant Prisma unique-constraint conflict (P2002) to 409, including concurrent duplicate requests. Map an owner-scoped mutation's missing record (P2025 or equivalent) to 404.

Error body: `{ "error": { "code": "...", "message": "..." } }`.

| HTTP | Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body/name/UUID or malformed JSON |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 404 | `PROJECT_NOT_FOUND` | Missing or not owned by caller |
| 409 | `SLUG_CONFLICT` | Duplicate slug for this owner |
| 413 | `PAYLOAD_TOO_LARGE` | Request exceeds configured limit |
| 500 | `INTERNAL_ERROR` | Unexpected failure |
| 503 | `DATABASE_UNAVAILABLE` | Recognized database connectivity failure |

Use centralized error handling consistent with the existing Express version; no stack traces, SQL, credentials or tokens in responses/logs. Project responses must not be publicly cached (`Cache-Control: no-store`).

## 4. Implementation boundaries

- `apps/express-api/src/main.ts` or actual Express entry point: register middleware/routes and preserve startup/shutdown behavior.
- Proposed focused files under `apps/express-api/src/app/`: `auth/require-session.ts`, `projects/projects.routes.ts`, `projects/projects.service.ts`, and corresponding tests. Reuse existing equivalents rather than creating parallel files. Routes own HTTP concerns; service owns project operations and ownership filters. Use the existing reusable Prisma client in `database/prisma.ts`.
- `libs/project-data/src/`: reuse server-safe validation/types only. `libs/config`: reuse existing env validation. Do not put Prisma, Clerk or secrets in browser-facing shared libraries.
- No new database schema changes in this feature. Verify existing Feature 05 constraints; if missing, report the prerequisite rather than silently changing the schema. Install only missing compatible dependencies; retain lockfile and existing Prisma major version.

## 5. Definition of Done

- [ ] Focused unit/API tests cover success, invalid/missing bodies, invalid UUID, forged owner fields, missing/invalid/expired tokens, non-session tokens, wrong instance, cookie-only rejection and safe error responses. Mocked auth tests do not count as real Clerk verification.
- [ ] Local PostgreSQL integration tests prove create/list/rename/delete, stable ID, unchanged rename, same-owner duplicate create/rename (including concurrent duplicate create), different-owner same slug, owner-only listing and denial of cross-owner mutation with no data change. If collaborator schema exists, verify membership alone does not grant mutation access. Use isolated synthetic fixtures and clean up only test-owned records; no reset, broad deletion or paid services.
- [ ] API smoke on `http://localhost:3001/api/projects`: unauthenticated request returns 401; allowed CORS preflight succeeds; disallowed origin receives no CORS grant. Test real Clerk authentication with an existing signed-in session at `http://localhost:3000/editor` using Chrome DevTools MCP and a temporary in-session request (no token logging/copying, no frontend changes). Prove authenticated CRUD against synthetic data and cross-account denial if two existing test sessions are available. Otherwise mark real identity isolation BLOCKED; do not create accounts without approval. No UI integration or UI regression suite required for this backend-only feature.
- [ ] Relevant Nx tests/lint for Express and touched shared libraries, Express TypeScript check, `npx nx build express-api`, `git diff --check`. Record exact commands and results; reuse valid existing evidence where applicable.
- [ ] Update `architecture.md` and `progress-tracker.md` concisely. Return approved final report with exact changed file paths, verification results/test counts, API evidence, notable discoveries and remaining blockers. Do not claim COMPLETE with mandatory checks missing.

## Out of scope

Next.js API integration, importing localStorage projects, Angular, shared UI/SIC changes, collaboration endpoints, invitations, canvas, pagination/search, rate-limiting infrastructure, cloud deployment and unrelated refactoring. Record production hardening needs for later; do not implement speculative infrastructure. No commit, push or merge without approval.

## Official references

- https://clerk.com/docs/reference/express/clerk-middleware
- https://clerk.com/docs/reference/express/get-auth
- https://clerk.com/docs/guides/development/making-requests
- https://www.prisma.io/docs/orm/v7/reference/prisma-client-reference

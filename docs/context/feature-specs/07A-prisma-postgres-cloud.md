# Feature 07A — Prisma Postgres Cloud Integration

## Objective
Use managed Prisma Postgres for daily Archloom development while retaining Docker PostgreSQL for offline development and isolated integration tests. Preserve existing data, Prisma ORM 7, schema, migrations, API contracts and UI.

## 1. Configuration and scope
- Work on `dev`; inspect current branch, existing changes, README, `AGENTS.md`, configuration loaders, Prisma config and startup script before editing. Preserve unrelated changes.
- Developer creates a persistent `archloom-dev` database in Prisma Console on the Free plan; no temporary database, paid resources or plan upgrades. Developer supplies credentials privately; never display, inspect directly, copy into logs or commit them. Approved processes may consume them via existing loaders.
- Express runtime uses the pooled TCP `DATABASE_URL`; Prisma CLI/Studio use direct TCP `DIRECT_URL` in cloud mode. Both must refer to the same intended database and require TLS. Retain existing `@prisma/adapter-pg`, `pg`, Prisma 7 and connection lifecycle; no Accelerate URLs or major upgrades.
- Reuse application-scoped configuration and process-variable precedence. Keep local and cloud profiles separate, git-ignored and excluded from Docker/Nx artifacts. Extend safe `.env.example` with placeholders and document profile selection. No database secrets in Next.js. Reject missing/mixed target configuration without printing URLs; do not silently fall back between targets.
- Reuse external database mode in `tools/dev-archloom.cjs`. Make `npm run dev:archloom` use the cloud development profile after approved cutover; provide/document an explicit local mode (e.g. `npm run dev:archloom -- --local`, subject to existing script conventions). External mode skips Docker; local mode starts Compose and waits for health. Both start existing Next/Express Nx targets and support clean shutdown.
- Scope: existing `prisma.config.ts`, `apps/express-api/src/app/config/load-local.ts`, `apps/express-api/src/app/database/prisma.ts`, `apps/express-api/.env.example`, `tools/dev-archloom.cjs` and its test, `package.json` only if needed, README and context docs. Inspect actual paths; reuse equivalent owners. Update ignore rules only if required. Private files remain developer-managed. No Next.js, Angular, shared UI, API or schema changes.

## 2. Data preservation and cutover
- Stop application writes during cutover. Preserve existing Docker volume and local projects; take a private backup before data transfer. Never delete/reset either database.
- Developer must approve either copying existing local records to the new cloud database (recommended) or starting with an empty cloud database. Do not silently switch to an empty database or transfer private records without approval.
- Fresh empty database: verify target and apply existing migrations using `npx prisma migrate deploy` with direct connection, then `npx prisma migrate status`. No new migration required.
- Approved data copy: use PostgreSQL `pg_dump`/`pg_restore` via direct connections with secure credential loading and `--no-owner --no-privileges` for restore. Use a verified empty destination; restore schema, records and migration history together, not on top of an already migrated schema. Verify migration status and compare project/collaborator counts and stable IDs, ownership, slugs and relationships. Stop on mismatch; no destructive flags or automatic retries. Keep backup outside Git and local volume intact.
- Switch daily startup only after target and data verification. Document rollback to local profile; cloud-only writes are not automatically copied back. Do not imply synchronization.

## 3. Testing and cost controls
- Automated database integration tests must use an explicitly isolated local test database. Guard test entry points against cloud hosts, non-test databases and inherited cloud URLs (including `DIRECT_URL`) before any writes or cleanup. Verify guards without cloud access.
- Test profile selection, missing/mixed URL rejection, startup mode, environment precedence and clean shutdown locally. Run focused tests/lint/typecheck/build for touched Express/config/startup code; reuse unrelated evidence.
- After developer configuration and approved data decision, run one cloud migration/status check and minimal authenticated browser smoke via Chrome DevTools MCP: `http://localhost:3000/editor`, `http://localhost:3001/api/projects`. Create one uniquely named disposable project, verify list/reload and cloud record via Studio or targeted query, rename with stable ID, delete only that fixture. Verify normal existing project list if copied. Never log credentials or tokens. Verify no Docker startup in cloud mode (do not stop unrelated running containers).
- Preserve prior Feature 06 security gates, Feature 07 cross-account check and any default build limitation. No paid services, broad scans, repeated cloud tests or production deployment.

## Definition of Done
- [ ] Cloud database developer-provisioned on Free plan; pooled runtime and direct CLI configuration verified.
- [ ] Existing migrations current; approved data decision completed and local data preserved.
- [ ] Cloud daily startup and explicit local startup documented and verified; rollback documented.
- [ ] Database integration tests guarded and isolated from cloud; focused checks pass.
- [ ] Minimal real authenticated cloud CRUD smoke passes; only test fixture removed.
- [ ] No credentials exposed; no unrelated changes; tracker and architecture updated.

## Final report
Use the approved concise implementation report: exact paths, actual changes, tests/build/browser evidence, blockers and decisions. If credentials or data-copy approval are unavailable, complete independent safe work and report remaining dependent checks as BLOCKED. Do not commit, push, merge or start Feature 08.

## References
- https://www.prisma.io/docs/postgres/database/connecting-to-your-database
- https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections
- https://www.prisma.io/docs/prisma-postgres/import-from-existing-database-postgresql
- https://www.prisma.io/pricing

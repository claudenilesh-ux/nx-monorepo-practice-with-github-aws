# Feature 05 — PostgreSQL & Prisma Setup

## Objective

Set up a persistent local PostgreSQL database, Prisma schema, initial migration and reusable server-side database client for Archloom. Express owns all database access. Next.js continues using Feature 04 localStorage until frontend API integration is approved.

## 1. Local database

- Use PostgreSQL 17 with Docker Compose for local development; reuse an existing suitable local service if present.
- Add a root `compose.yaml` only if no Compose file exists; otherwise extend the existing file. Service: `postgres`; database: `archloom`; local port: 5432 (loopback only); named persistent volume; `pg_isready` health check.
- Use local development credentials supplied through an ignored environment file. Provide placeholder-only configuration in the existing example env file (or a narrowly scoped example file if absent). Never print or commit credentials.
- Use the same server-only `DATABASE_URL` for Prisma CLI and Express runtime. Reuse the approved config/env mechanism; document exact loading and startup commands. Do not expose it through `NEXT_PUBLIC_*` or shared browser libraries.
- No hosted database, AWS resources, paid services, destructive reset or volume removal.

## 2. Prisma setup

- Inspect installed Node, TypeScript, Nx and Express module/build configuration before installing. Use mutually compatible stable Prisma 7.x packages, not a prerelease or a major upgrade.
- Install missing packages at the workspace root: `prisma` and `@types/pg` (dev); `@prisma/client`, `@prisma/adapter-pg`, `pg` (runtime); `dotenv` only if needed by existing env loading. Pin compatible Prisma versions and preserve the lockfile.
- Use one Prisma CLI config at the workspace root (`prisma.config.ts` or `prisma7.config.ts`, matching the installed CLI), targeting the Express schema and migrations.
- Use the `prisma-client` generator with explicit output under `apps/express-api/src/generated/prisma/`; match the existing Express module format. Do not edit generated code or commit generated client files. Make client generation reproducible before backend typecheck/build using the existing Nx conventions. Do not globally convert the monorepo to ESM or bypass TypeScript checks.

## 3. Data model

`apps/express-api/prisma/schema.prisma`:

```enum ProjectRole {
  EDITOR
  VIEWER
}

model Project {
  id            String   @id @default(uuid()) @db.Uuid
  ownerId       String
  name          String   @db.VarChar(100)
  slug          String   @db.VarChar(100)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  collaborators ProjectCollaborator[]

  @@unique([ownerId, slug])
  @@index([ownerId, createdAt])
}

model ProjectCollaborator {
  id        String      @id @default(uuid()) @db.Uuid
  projectId String      @db.Uuid
  userId    String
  role      ProjectRole @default(VIEWER)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  project Project @relation(
    fields: [projectId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([projectId, userId])
  @@index([userId])
}
```

- Provider: `postgresql`. Define the generator and datasource alongside this model using Prisma 7 conventions.
- `ownerId` stores the Clerk user ID, not email. No local User table or password storage.
- Stable UUID supports the existing Feature 04 project identity. Rename must never change it.
- A slug is unique per owner, not globally. Preserve existing name/slug validation rules in Feature 04; the database unique constraint also prevents concurrent duplicate inserts.
- No collaborators, canvas, AI, archive status or additional tables in this iteration.

## 4. Migration and connection management

- Generate and apply a named initial migration (`init_project`) against the dedicated local development database. Review generated SQL; commit-ready migration files belong in `apps/express-api/prisma/migrations/`. Do not use `db push` instead of a migration.
- Add a small server-only database module, proposed `apps/express-api/src/app/database/prisma.ts` (align with the actual Express source structure). Use `PrismaPg` and one reusable `PrismaClient` per running process, not one per request.
- Validate missing configuration without leaking connection strings. Use finite connection timeout and bounded pool settings. Integrate graceful shutdown with the existing Express lifecycle where applicable; disconnect once. No public database/debug endpoint.
- Keep `libs/project-data`, shared UI/SICs, Clerk, Next.js and Angular unchanged. Prisma must never enter browser bundles.

## 5. Definition of Done

- [ ] Local PostgreSQL service is healthy and uses a persistent named volume. Document how to start/stop it without deleting data.
- [ ] From the workspace root, `npx prisma validate`, `npx prisma generate`, `npx prisma migrate dev --name init_project` (first application only), and `npx prisma migrate status` succeed using the selected config. Record any required config argument.
- [ ] Focused integration test using synthetic records in a dedicated local test/development database proves connection, create/read/update/delete, same-owner duplicate slug rejection, different-owner same slug acceptance and stable ID on rename. Roll back or clean up only test-created records; never touch real user data.
- [ ] Prove a test record survives PostgreSQL service restart without removing the volume; clean up the fixture afterward. Missing/unavailable database fails predictably without exposing secrets.
- [ ] Run relevant Express tests, lint, TypeScript check, `npx nx build express-api`, and `git diff --check`. Verify Prisma generation works from a clean generated-output state. Existing Express starter behavior is preserved.
- [ ] Browser checks: not applicable to this backend-only feature; no UI changes. Verify the existing Express endpoint if the server is run.
- [ ] Update `architecture.md` and `progress-tracker.md` concisely; report actual paths, commands/results and remaining blockers. If Docker or environment access is unavailable, complete independent setup and mark live database verification BLOCKED.

## Out of scope

Project REST APIs, Clerk backend token verification, authorization, importing localStorage, frontend API integration, collaboration, cloud deployment and unrelated refactoring. These are separate features.

Work on `dev`. Check existing Feature 04 status before changing code; do not mark its outstanding checks as passed. Do not commit, push or merge without approval.

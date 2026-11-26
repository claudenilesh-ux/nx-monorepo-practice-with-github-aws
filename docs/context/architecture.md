# Architecture Context

Feature 07A: Express uses a Prisma Postgres pooled runtime connection and matching direct CLI connection through a separate developer-managed cloud profile. Cloud is the default development startup; `--local` retains Docker PostgreSQL. Integration tests require an isolated loopback test database. Cloud and local data do not synchronize automatically.

## Boundaries

- `apps/next-app/` is the only active Architecture Studio frontend. It owns browser registration, Clerk integration, editor state and persistence orchestration.
- `apps/angular-app/` is reserved for a separate future project. Do not modify or migrate it for Architecture Studio. Preserve existing shared component contracts used by Angular.
- `libs/shared-ui/` contains framework-independent Lit UICs; `libs/shared-sections/` composes SICs. Components receive properties and emit events; they do not access Clerk, storage or routing.
- Shared SCSS tokens and Lucide icons provide the design system. Shared libraries remain framework-independent.
- Express provides backend functionality when required. Private project APIs require server-side authentication and ownership checks.

## Feature 04 legacy storage

Versioned browser localStorage remains preserved per Clerk user. Feature 07 reads validated legacy projects only for an explicit JSON backup; it does not import, overwrite or delete them.

## Integration and verification

Register Lit in the browser before binding complex properties in Next.js. Use public library entry points. Verify product changes in Next.js at `http://localhost:3000/editor`; run relevant shared-library tests when shared components change. Keep Clerk route protection intact.

## Feature 10 canvas

The authorized Next.js workspace owns temporary React Flow nodes and viewport state. The Lit catalog emits component activation and drag intents; no diagram data is persisted or sent to the project API. Workspace identity and project changes remount the canvas. Browser acceptance remains in progress.

## Feature 05 local database

Express owns a Prisma 7 client backed by PostgreSQL 17. Projects and collaborators have owner-scoped slug and project/user uniqueness; no project API or frontend database access exists. Feature 04 remains browser-local.

Each app owns its private `.env.local` and tracked `.env.example`. Next.js uses its native loader; Express and Prisma share `apps/express-api/src/app/config/load-local.ts`, which loads the Express file from the workspace or Express app root without overriding process variables. `libs/config` contains value-free validation. Next.js validates Clerk configuration in its server layout; only `NEXT_PUBLIC_` values may reach browser bundles.

From the workspace root, copy `apps/express-api/.env.example` to `apps/express-api/.env.local` and replace placeholders. Start PostgreSQL with `docker compose --env-file apps/express-api/.env.local up -d --wait`; stop it with `docker compose --env-file apps/express-api/.env.local stop`. Run `npx prisma migrate status` and `npx prisma generate`; migrations remain under Express. Nx generates the client before Express build, test and typecheck. Use `RUN_DATABASE_TESTS=1 npx jest --config apps/express-api/jest.config.cts --runInBand` for synthetic database tests.

## Feature 06 project API

Express exposes owner-only project CRUD under `/api/projects`, using Clerk session Bearer verification, the existing Prisma client and shared project-name validation. Database mutations include the authenticated owner ID; collaborator membership does not grant access. CORS permits only the configured frontend origin, responses are not cached, and the Feature 07 editor uses the API. Configure the Express Clerk keys and CORS origin through its app-local configuration before starting the API. Real cross-account and complete token-negative verification remain pending.

For future apps, create an app-local placeholder template and ignored local file, validate required values through `libs/config`, and use the framework's native loader or one app-owned loader. Process variables take precedence. Exclude private files from Git, Docker contexts and Nx inputs; hash build-time public configuration in cache inputs without printing values. Never put server values in shared browser modules.

## Feature 07 frontend integration

Next.js requests owner-scoped projects through a typed fetch client with per-request Clerk session tokens. The editor clears identity-scoped state and cancels stale requests; confirmed API responses drive mutations. Legacy browser projects remain local and can be exported. Live end-to-end verification remains pending.

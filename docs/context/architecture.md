# Architecture Context

## Boundaries

- `apps/next-app/` is the only active Architecture Studio frontend. It owns browser registration, Clerk integration, editor state and persistence orchestration.
- `apps/angular-app/` is reserved for a separate future project. Do not modify or migrate it for Architecture Studio. Preserve existing shared component contracts used by Angular.
- `libs/shared-ui/` contains framework-independent Lit UICs; `libs/shared-sections/` composes SICs. Components receive properties and emit events; they do not access Clerk, storage or routing.
- Shared SCSS tokens and Lucide icons provide the design system. Shared libraries remain framework-independent.
- Express provides backend functionality when required. Private project APIs require server-side authentication and ownership checks.

## Feature 04 storage

Projects use versioned browser localStorage scoped by Clerk user ID. The application validates stored data and reports read or write failures without overwriting existing data. Storage is origin-local, not a security boundary; server persistence is deferred.

## Integration and verification

Register Lit in the browser before binding complex properties in Next.js. Use public library entry points. Verify product changes in Next.js at `http://localhost:3000/editor`; run relevant shared-library tests when shared components change. Keep Clerk route protection intact.

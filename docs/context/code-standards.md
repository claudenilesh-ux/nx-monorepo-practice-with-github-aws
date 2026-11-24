# Code Standards

## General
Small single-purpose modules; fix root causes; reuse existing components, tokens and contracts. No unrelated refactors, new dependencies or speculative abstractions. Use lowercase kebab-case filenames and custom-element tags, PascalCase classes/types, camelCase functions and properties.

## TypeScript
Enable strict mode; avoid `any`, unsafe assertions and blanket suppression. Validate unknown external input at runtime. Shared types are the source of truth for API payloads; types alone do not validate requests.

## Frameworks
- Angular: standalone components, typed state, focused templates and services. Use custom-element schema only where necessary; register Lit before use.
- Next.js: App Router, server components by default; isolate interactive editor and registration to a client boundary. Use safe browser-only imports, wait for registration before complex property binding. Keep wrappers thin and typed.
- Lit: extend LitElement; use reactive properties without class-field shadowing of accessors (e.g. declare + constructor initialization or supported decorator configuration). Use slots and CSS variables; no framework imports, network calls or navigation. Use native semantic controls. Prevent duplicate custom element registration; register once through agreed entry points. Test event names, payloads and property updates.
- Express: focused routes, validation and project service/repository. Validate input before mutation. Consistent status codes and errors; no stack trace in HTTP responses. Local in-memory repository, no DB dependencies initially.

## Styling
Follow ui-context.md. Theme values only in tokens.css; import global.css at app root. Component-specific layout/styles remain in each component; shared variables style shadow DOM. No duplicate token maps or CSS frameworks introduced without approval.

## File organization
- `apps/*`: framework-specific entry points and page logic.
- `libs/shared-ui/src/uic-*/`: component implementation, optional separate styles and focused spec.
- `libs/shared-sections/src/sic-*/`: composite UI, optional styles and focused spec.
- `libs/design-tokens/src/`: shared CSS.
- `libs/shared-types/src/`: contracts.
- `libs/api-client/src/`: fetch functions and tests.
Use public entry points. Respect actual Nx generated conventions, document approved deviations and avoid unnecessary empty folders.

## Tests and verification
The shared-ui Jest target supports Lit ESM using its own configuration; retain strict TypeScript checks and existing tests.
Use installed compatible test tooling. Add focused tests for component properties/events, API validation, service CRUD and error paths. Browser verification must cover both frontends when shared UI changes; inspect console, network, DOM, screenshots and accessibility basics. Keep tests local and deterministic. Use actual Nx project names and available targets from `nx show projects` and `nx show project <name>`; never claim a command passed unless it was run successfully.

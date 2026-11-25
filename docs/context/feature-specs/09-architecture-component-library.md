# Feature 09 - Architecture Component Library

Status: Approved to start development; implementation and verification pending.
Prerequisite: Feature 08 approved for continued development, with outstanding verification gates retained.

## Objective

Provide a searchable, categorized catalog of 12 architecture components in an owned project workspace. This is a browse-only catalog foundation for later drag-and-drop nodes; it does not create diagram objects.

## Scope and baseline

Read root AGENTS.md, CLAUDE.md if present, current docs/context files and Feature 01/02/08 specs. Inspect branch, HEAD and git status; work on dev and preserve unrelated changes. Use actual existing file owners and aliases; do not recreate working components. Next.js remains the active frontend, Lit UIC/SIC and shared SCSS tokens remain the UI system. No Angular changes, Express/API changes, Prisma migrations, cloud configuration changes, dependencies, remote icon assets or extra infrastructure.

## 1. Catalog contract

Use a small static typed app-local TypeScript catalog, with readonly entries containing stable id, label, category, registered icon name, and search aliases. Use stable ids independent of labels, not array indexes. Category order and item order below are fixed. No database or API for this catalog. Generic existing Lucide-style icons are intentional; no official cloud vendor logos or new icon library in this milestone.

| Category | Stable ID | Label | Suggested registered icon | Search aliases |
| --- | --- | --- | --- | --- |
| Compute | aws-ec2 | EC2 | server | amazon aws compute virtual machine |
| Compute | aws-lambda | Lambda | zap | aws serverless function compute |
| Compute | aws-ecs | ECS | container | amazon aws elastic container service compute |
| Database | postgresql | PostgreSQL | database | sql relational postgres |
| Database | mongodb | MongoDB | database | nosql document |
| Database | aws-dynamodb | DynamoDB | table | amazon aws nosql database |
| Networking | aws-api-gateway | API Gateway | network | amazon aws networking api |
| Networking | load-balancer | Load Balancer | git-branch | networking traffic elb |
| Networking | aws-cloudfront | CloudFront | globe | amazon aws cdn networking |
| Storage | aws-s3 | S3 | archive | amazon aws object bucket storage |
| Applications | frontend | Frontend | monitor | client web browser ui application |
| Applications | backend | Backend | server | server api application |

Reuse existing registered icons where equivalent. Add only the missing named icons required by these entries from the already installed icon package through the existing typed registry. No raw SVG duplication or external URLs. If an exact icon is unavailable, use an existing appropriate generic icon and report it.

## 2. Panel and behavior

- Add an accessible Components toggle in the verified project canvas toolbar/upper workspace area; default closed. Open a right-side component panel within the editor content area (not a new route or modal). Use a visible title, labelled search field, clear-search action when nonempty, scrollable grouped tiles, close button, and no-results state. Reuse existing UIC input, icon, icon-button, scroll-area, card and empty-state as appropriate. Use shared tokens, dark theme and existing spacing; no hardcoded theme colors.
- Create a focused shared Lit section `sic-component-library` with typed catalog input and a composed close intent. Keep project route/access and panel open/close ownership in Next.js. Section owns only transient search UI state. Catalog tiles are informational, not buttons or draggable elements; no misleading click/drag affordances. Accessible visible text labels; decorative icons hidden from assistive technology.
- Search case-insensitively using trimmed text against label, category and aliases (substring match); retain fixed category/item order, hide empty groups, show all 12 for empty query. Search is local and synchronous, no API calls. Clear search restores all entries. Show `No components found` and helpful guidance when nothing matches.
- Panel must be independently scrollable and not alter canvas viewport geometry. Preserve project sidebar/navbar/CRUD and canvas pan, zoom, keyboard and reset. Panel interactions must not trigger canvas gestures or change viewport state. Closing returns focus to the Components toggle. Support keyboard access and visible focus. When narrow (390px), panel may cover canvas but must fit within viewport, provide accessible close, not overflow horizontally or trap user; canvas controls remain usable after closing. Avoid adding a second overlay manager.
- Only render toggle/panel for a verified owned project workspace; never show on loading, API error, unavailable UUID, signed-out or stale identity states. Close and reset search on project/identity change or panel close. No persisted preferences, nodes, diagram storage or collaboration.

## 3. Expected file owners

Confirm existing repo paths before edits; names below are proposed where new. Keep the touched set minimal.
- `apps/next-app/src/app/editor/editor.tsx` and Feature 08 canvas owner `apps/next-app/src/app/editor/project-canvas.tsx` (or actual existing equivalent): toggle/panel composition, reset on route/identity, gesture separation. Only necessary styles.
- `apps/next-app/src/app/editor/component-catalog.ts` (new if no equivalent): static typed catalog.
- `libs/shared-sections/src/sic-component-library/` (new): Lit presentational section, typed entry contract, local filter and accessible panel. Export/register through actual existing shared-sections entry point; reuse existing React integration convention.
- `libs/shared-ui/src/uic-icon/` only if registry additions necessary; no changes to other existing UIC internals unless an explicit incompatible contract is reported for approval.
- `apps/next-app/specs/editor.spec.tsx` and focused catalog/section tests using existing test infrastructure. Add tests to affected shared library only as needed.
- `docs/context/feature-specs/09-architecture-component-library.md` and `docs/context/progress-tracker.md`. Update UI context only for new panel contract; architecture only if an actual boundary changes. Keep Feature 08 and prior security gates documented.

## 4. Definition of Done

- [ ] Exactly 12 entries, unique stable IDs, fixed order, five categories. Search works for partial name, alias, category, mixed case, leading/trailing whitespace, no result, clearing. `aws` returns AWS entries; `database` returns the three database entries; `lambda` returns Lambda. No external requests for catalog data or icons.
- [ ] Open/close, focus return, keyboard search, independently scrollable panel, existing theme and mobile/desktop fit. No canvas gesture when interacting with panel; pan/zoom/reset still work when panel closed; panel open/close does not reset viewport. No nodes, drag/drop, API or persistence.
- [ ] Catalog available only within verified owned workspace; route switch and identity change clear search/panel; unavailable or loading workspace does not show it. Preserve Feature 08 route behavior and existing CRUD without repeating unrelated acceptance flows.
- [ ] Run focused tests for catalog/filter and editor/section changes; focused ESLint, `npx tsc --noEmit -p apps/next-app/tsconfig.json`, `npx nx build next-app` (record existing Turbopack worker-port blocker if encountered; use established webpack verification path if needed), `git diff --check`. Only changed shared lib checks. No repeated full suites or cloud integration tests.
- [ ] Chrome DevTools MCP on `npm run dev:archloom -- --local`, `http://localhost:3000/editor`, select an owned local test project (UUID route). Verify open/search/clear/no-results/close, project switching, keyboard focus, canvas control isolation and desktop 1440px/mobile 390px screenshots with no horizontal overflow. Check unexpected console/network errors. Use existing authorized session and fixture where safe; if new disposable fixture required, delete only that fixture. No cloud writes. If browser/session unavailable, report BLOCKED, not PASS.
- [ ] Update tracker with actual results and remaining limitations. Report exact changed paths, focused test counts/build results, Chrome evidence, blockers and decisions. No credentials in reports, screenshots or logs; existing private config consumed only through approved application loaders.

## Out of scope

Drag/drop, clickable insertion, nodes, edges, real AWS provisioning, official vendor logos, diagram persistence, database or API catalog, sharing/collaboration, Angular, deployment, dependency selection and full canvas engine. Existing Feature 06/07 cross-account and token security gates, Feature 08 mobile touch verification and Turbopack limitation remain recorded; do not silently close them. No commit, push, merge or next feature without approval.

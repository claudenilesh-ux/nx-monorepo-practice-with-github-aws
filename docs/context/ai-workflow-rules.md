# AI Workflow Rules

## Approach
Spec-driven incremental development. Read all six context documents before work. Treat proposed requirements as requiring developer approval; do not invent behavior or silently change architecture. If documents conflict, identify the conflict and request a decision before implementing the affected scope.

## Scoping
1. Inspect current working directory, Git branch/status, actual Nx projects and relevant existing files.
2. State exact objective, scope, target paths, exclusions, test targets and expected results before editing. Work one verifiable unit at a time.
3. Reuse existing files and components. Do not duplicate implementations, use workarounds, introduce dependencies or change unrelated files without approval.
4. Record missing decisions in progress-tracker.md; do not implement ambiguous behavior. Do not overwrite developer changes or commit, push, deploy, delete resources or run paid services without explicit permission.

## When to split work
Separate workspace generation, design tokens, individual UICs, SIC composition, each frontend integration, API contract/storage, frontend API integration and deployment. If a unit cannot be verified quickly, split it. A shared component may be integrated into both frontends within its verification unit.

## Protected boundaries
Do not edit node_modules, generated output, lockfiles manually, unrelated application code, or approved architecture and public contracts without approval. Generator-driven lockfile updates are expected when approved packages are installed. Do not run destructive Git commands.

## Before moving to next unit
- Relevant acceptance criteria verified; no architecture invariant violated.
- Run focused local tests and applicable Nx builds. Discover actual target names first. For full baseline verification run `npx nx run-many -t build` after apps exist; use affected tasks with explicit correct Git base/head when appropriate.
- Browser-accessible changes: use Chrome DevTools MCP to test real Angular `http://localhost:4200/editor` and Next.js `http://localhost:3000/editor` when available; inspect console, errors, network, DOM, and capture meaningful screenshots. API target: `http://localhost:3001/api/health` and relevant project endpoints. Check desktop and 390px viewport for UI. If MCP or another target is unavailable, report NOT RUN/BLOCKED; do not claim a pass. Before editor routes exist, use actual generated root routes.
- Update tracker with real evidence, exact commands, PASS/FAIL/NOT RUN, and next unit. Keep specs synchronized only with approved decisions.

## Final report
Objective and result; files changed with paths; summary of diffs; exact tests/build commands and outcomes; browser/API evidence; manual reproduction steps; unrelated failures and known limitations; next action. No fabricated evidence or completion claims.

## Cost control
Local development only initially. No AWS, MongoDB Atlas, external AI/media generation, repeated full E2E runs, or paid infrastructure. Prefer focused tests and minimal local smoke checks.

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

## Feature Dependency Verification

Before implementing a new feature:

- Inspect the existing components and capabilities required by the feature.
- Verify that prerequisite component contracts are complete.
- Verify actual runtime behavior, not only unit test results.
- Identify missing capabilities and defects before implementation.
- Document prerequisite conflicts in the progress tracker.
- Do not modify protected component contracts without explicit approval.
- Once approved, update the relevant specifications before implementing corrections.
- Continue the assigned feature only after prerequisite verification passes.
- Do not mark a feature complete while required browser verification remains pending.

## Controlled Implementation Autonomy

The agent is authorized to resolve minor technical issues independently when they are necessary to complete the approved feature.

Permitted corrections:

- TypeScript and lint errors.
- Incorrect imports and exports.
- Scoped build and test configuration compatibility issues.
- Existing component defects that violate documented behavior.
- Regression tests for discovered defects.

Conditions:

- Preserve existing architecture and public contracts.
- Keep changes minimal and directly related to the assigned feature.
- Fix root causes rather than introduce workarounds.
- Do not weaken security, typing, testing or validation rules.
- Document all additional corrections in the final report.

Explicit developer approval remains mandatory for:

- Architectural changes.
- Public contract changes.
- New product functionality.
- Framework or tooling replacement.
- Storage and database changes.
- Unrelated refactoring.
- Commit, push and merge operations.

Do not stop for minor authorized technical corrections. Continue implementation and verification unless a genuine architectural, product or environment blocker prevents further progress.

This authorization applies to future feature specifications unless a feature explicitly defines stricter boundaries.

## Blocker Classification and Handling

Before declaring a feature blocked, classify the cause:

- IMPLEMENTATION_DEFECT
- MISSING_REQUIREMENT
- ARCHITECTURE_CONFLICT
- ENVIRONMENT_RESTRICTION
- UNRELATED_FAILURE

For environment restrictions:

- Do not assume an application defect.
- Do not weaken security, TypeScript, lint or architecture rules.
- Provide the exact command for developer-side verification.
- Continue independent work where the approved specification permits it.
- Keep affected verification checks pending until evidence is available.

For prerequisite failures:

- Fix only defects explicitly authorized by the feature specification or developer.
- Preserve existing component contracts.
- Do not introduce speculative fixes.
- Reuse previous successful verification evidence when it remains applicable.

Never mark an unverified requirement as PASS.

## Progress Tracker Rules

- Keep `progress-tracker.md` concise and up to date.
- Maintain one short entry per completed feature.
- Update existing entries instead of repeatedly appending session history.
- Record only meaningful implementation progress, verification results and unresolved blockers.
- Remove obsolete blockers once resolved.
- Keep detailed logs, command outputs, screenshots and file-level changes in implementation reports or pull requests.
- Never mark unverified functionality as PASS.
- Update Current Phase, Current Goal, In Progress and Next Up after every feature.

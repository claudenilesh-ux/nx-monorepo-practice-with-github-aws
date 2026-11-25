# Feature 03 — Clerk Authentication

Read `AGENTS.md` and all required project context files before starting.

Work on the `dev` branch.

## Objective

Integrate Clerk authentication into both Angular and Next.js applications.

Reuse Clerk's built-in authentication and account management UI. Do not rebuild Clerk functionality.

## Existing Implementation

- Nx monorepo with Angular, Next.js and Express.
- Shared Lit UIC and SIC libraries.
- Global SCSS design tokens.
- Existing editor navbar and project sidebar.
- Existing `uic-profile` component.

Inspect and reuse existing implementation. Do not recreate completed work.

## Dependencies

Inspect installed dependencies before installing anything.

Use compatible versions of:

- `@clerk/nextjs` for Next.js.
- `@clerk/clerk-js` for Angular.
- `@clerk/ui` for Clerk's theme support.

Install only missing required packages.

Use the existing Clerk development application and environment configuration.

Do not create another Clerk application, invent credentials or expose secret keys.

## Design

Use Clerk's supported dark theme as the base.

Override supported Clerk appearance variables using existing global CSS custom properties.

Reuse the shared SCSS design tokens for:

- Background colors.
- Surface colors.
- Primary accent.
- Text colors.
- Borders.
- Typography.
- Border radius.

Do not hardcode theme colors.

### Sign-in and Sign-up Pages

Large screens:

- Minimal two-panel layout.
- Left panel: compact product logo, tagline and short text-only feature list.
- Right panel: centered Clerk authentication form.

Small screens:

- Display the authentication form only.

Do not introduce gradients, oversized hero sections, feature cards or unnecessary animations.

## Next.js Implementation

- Integrate ClerkProvider into the root layout.
- Create sign-in and sign-up pages using Clerk's built-in components.
- Use proxy.ts for Next.js 16 or newer. Use middleware.ts only if required by the installed older Next.js version.
- Place the proxy or middleware in the correct Next.js application directory, not the Nx workspace root.
- Use Clerk's server-side route protection.
- Keep sign-in and sign-up routes public.
- Protect all other application routes by default, excluding required static assets and framework internals.
- Redirect authenticated visitors from `/` to `/editor`.
- Redirect unauthenticated visitors from `/` to `/sign-in`.
- Add Clerk's built-in UserButton to the existing editor navbar right slot.

## Angular Implementation

- Integrate Clerk's JavaScript SDK through an application-level authentication service.
- Initialize Clerk before evaluating authenticated route access.
- Create sign-in and sign-up routes using Clerk's built-in mounted components.
- Implement Angular route guards for protected application routes.
- Keep sign-in and sign-up routes public.
- Redirect authenticated visitors from `/` to `/editor`.
- Redirect unauthenticated visitors from `/` to `/sign-in`.
- Mount Clerk's built-in UserButton in the editor navbar right slot.
- Correctly unmount Clerk components when their Angular host components are destroyed.

Authentication initialization failures must fail closed. Never display protected editor content while authentication state is unknown.

## Shared UI Architecture

Reuse the existing Lit editor navbar.

Use its right slot to receive the framework-specific Clerk UserButton.

Do not import Clerk SDKs into shared Lit UIC or SIC libraries.

Preserve the existing uic-profile component and tests, but do not use it to duplicate Clerk's built-in account management flows.

Reuse existing global styles and design tokens.

## Configuration and Blocker Handling

Use existing environment variable names and the application's established configuration mechanism.

Never expose Clerk secret keys in Angular, browser bundles, shared libraries, logs or Git.

Clerk CLI login, Clerk MCP access, browser profile availability and test account availability are not mandatory prerequisites for independent implementation work.

If configuration is missing:

- Implement independent SDK integration, layouts and route protection where possible.
- Document all missing configuration together.
- Keep unavailable live verification checks marked BLOCKED or NOT RUN.
- Never use mock credentials or bypass authentication.

Do not claim authentication is operational until verified against the selected Clerk development application.

## Out of Scope

- Custom authentication forms.
- Custom Clerk profile management.
- New authentication providers.
- Express API authentication in this iteration.
- Project ownership and authorization.
- Database changes.
- AWS deployment.

Do not expose private project data through Express until server-side authentication and authorization are implemented.

## Test Targets

Angular:

- http://localhost:4200/
- http://localhost:4200/sign-in
- http://localhost:4200/sign-up
- http://localhost:4200/editor

Next.js:

- http://localhost:3000/
- http://localhost:3000/sign-in
- http://localhost:3000/sign-up
- http://localhost:3000/editor

Use Chrome DevTools MCP for automatic browser verification.

## Check When Done

- [ ] Both applications integrate their supported Clerk SDK.
- [ ] ClerkProvider is configured in Next.js.
- [ ] Next.js proxy or middleware protects application routes.
- [ ] Angular route guards protect application routes.
- [ ] Sign-in and sign-up pages are publicly accessible.
- [ ] Signed-out visitors cannot access either editor.
- [ ] Signed-in visitors are redirected to the editor.
- [ ] Authentication survives page refresh.
- [ ] Clerk UserButton appears in both editor navbars.
- [ ] Built-in account settings and logout work.
- [ ] Protected routes remain inaccessible after logout.
- [ ] Dark theme matches shared global tokens.
- [ ] Desktop and mobile layouts work correctly.
- [ ] No hardcoded theme colors.
- [ ] No unexpected browser console or network errors.
- [ ] Relevant tests and lint checks pass.
- [ ] Angular production build passes.
- [ ] Next.js production build passes.
- [ ] Progress tracker records actual verification results.

## Verification Commands

Run applicable targets:

- `npx nx lint angular-app`
- `npx nx lint next-app`
- `npx nx test shared-ui`
- `npx nx test angular-app`
- `npx nx test next-app`
- `npx nx run-many -t build --projects=angular-app,next-app`
- `git diff --check`

Report environment restrictions separately from implementation defects.

## Final Report

Provide:

- Files changed.
- Dependencies added.
- Authentication implementation summary.
- Tests and builds executed.
- Chrome DevTools MCP verification evidence.
- PASS, FAIL, BLOCKED or NOT RUN acceptance results.
- Remaining configuration requirements and limitations.

Update `progress-tracker.md`.

Do not commit, push, merge or start the next feature without approval.

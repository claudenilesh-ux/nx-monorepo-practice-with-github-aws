# Nx Learning Workspace — Project Overview

Status: proposed baseline for developer review. No application implementation is claimed.

## Overview
Build a local project-management dashboard to learn Nx, modern Angular (not AngularJS 1.x), Next.js, Express, and framework-independent Lit Web Components. Both frontends reproduce the same dark editor dashboard reference and use the same backend, shared UI and design system.

## Goals
1. Run three independent Nx applications locally.
2. Implement each shared UI component once in Lit and consume it in both frontends.
3. Change a design token in one source file and observe the change in both frontends.
4. Create, list, open, rename and delete projects using a single Express API.
5. Verify independent builds and demonstrate affected-project analysis.

## Core user flow
1. Open either frontend at `/editor`; show a project sidebar and an empty workspace.
2. Load existing projects from the API. Select a project to display its name in the workspace.
3. Click New Project in the sidebar or workspace; enter a name and submit, or cancel.
4. Rename an existing project or delete it after confirmation. Show errors without losing the existing list.
5. Refresh or open the other frontend and see the same server-side data while the API process remains running.

## Features
- Project navigation: My Projects and Shared tabs; project selection, sidebar open/close, responsive layout.
- Project CRUD: create, read, update, delete; loading, empty and error states; clear feedback for mutations.
- Shared tab: informational empty state only. No actual sharing or authorization in this phase.
- Shared UIC: button, icon-button, nav, avatar, tabs, list-item, input, modal, empty-state; card as a separate learning exercise if approved.
- Shared SIC: project sidebar composed of UICs. Both frontends own page state and API orchestration.

## Scope
### In scope
Local development, design tokens, Lit integration, TypeScript contracts, Express in-memory storage, focused tests and production builds.
### Out of scope
Real authentication, user ownership, collaboration, editor canvas/diagram tools, AI services, database persistence, paid infrastructure, AWS, Docker and deployment (separate later learning phase). Storybook is optional later work, not required for initial completion.

## Success criteria
- Angular :4200 and Next.js :3000 render the same shared components; Express :3001 serves JSON.
- A token change affects both apps after dev refresh or rebuild, without duplicate style definitions.
- Create a project in one app, refresh the other and see it; rename and delete propagate on refresh.
- Invalid requests return predictable errors; failed requests show understandable UI feedback.
- Both frontends are keyboard usable and work at desktop and narrow widths; builds and relevant tests pass.
- No external paid services are used; no production security or persistence is implied.

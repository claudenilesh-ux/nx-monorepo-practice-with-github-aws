# Nx Learning Workspace — Project Overview

Architecture Studio uses Next.js as its only active frontend. Angular is reserved for a separate future project; its existing application remains unchanged.

## Scope

- Next.js owns the editor, authenticated state and project orchestration. Clerk authentication remains in place.
- Shared framework-independent Lit UICs and SICs, Lucide icons and global SCSS design tokens provide the design system.
- Feature 04 stores projects in browser localStorage scoped by Clerk user ID. Storage is local to the browser origin and is not server authorization.
- Express remains the backend when required. Server-side project ownership and persistent storage require a separate approved specification.
- Project creation, selection, rename and deletion use the existing editor layout; sharing and diagram editing remain out of scope.

## Verification

Verify future product features in Next.js at `http://localhost:3000/editor`, including browser accessibility and responsive behavior. Run relevant shared-library tests when shared components change. Preserve existing Angular component contracts.

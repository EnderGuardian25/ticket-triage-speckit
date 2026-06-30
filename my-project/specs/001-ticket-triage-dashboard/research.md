# Research: Ticket Triage Dashboard

**Date**: 2026-06-23
**Feature**: specs/001-ticket-triage-dashboard/spec.md

All technical decisions for this feature were pre-decided in ADR-001 (framework) and ADR-002 (data layer). This document records those decisions alongside supplementary decisions made during planning.

---

## Decision 1: Full-Stack Framework

**Decision**: Next.js 15 App Router with TypeScript strict mode

**Rationale**: Co-locates the dashboard UI (server components) and REST API (Route Handlers) in one repository. Server components fetch from Prisma directly, avoiding a client-side fetch round-trip for the initial render and helping hit the < 1.5s render target. Single `pnpm dev` command satisfies Constitution Principle II.

**Alternatives considered**:
- Remix 2 — good data loading patterns but no existing team Remix projects; extra deployment profile
- Express + React SPA — two packages, more CI complexity, no benefit at this scale

**Source**: ADR-001

---

## Decision 2: Data Layer

**Decision**: Prisma ORM with SQLite

**Rationale**: SQLite is a file in the repo — zero infrastructure. Prisma provides fully typed queries that satisfy the TypeScript strict requirement (Constitution III). Migration path to PostgreSQL in v2 is a connection string change. Seed data (≤ 50 tickets) will never stress SQLite.

**Alternatives considered**:
- Prisma + PostgreSQL — right at scale, but requires Docker for local dev, violating Constitution II
- Plain JSON file store — not type-safe; concurrent PATCHes require manual locking

**Source**: ADR-002

---

## Decision 3: Test Runner

**Decision**: Vitest

**Rationale**: Vitest shares configuration with the Vite/Next.js build pipeline. PRD NFR-2 explicitly references Vitest for timing measurements. Faster than Jest for TypeScript projects due to native ESM support.

**Alternatives considered**:
- Jest — more ecosystem inertia but slower TypeScript transform; PRD already pointed to Vitest

---

## Decision 4: State Management for Immediate Badge Updates

**Decision**: Lift ticket state to the dashboard page client boundary using React `useState`. The server component fetches the initial data; a thin client wrapper holds a `tickets` array in state. The `TicketRow` component receives an `onUpdate` callback that updates the parent state optimistically after a successful PATCH.

**Rationale**: The spec requires count badges to update immediately when a ticket moves between priority groups (Clarification Q1). This requires shared state across all `TicketRow` instances. A lightweight `useState` at the page level avoids adding a state management library (Zustand, Redux) for a single shared array. The server component fetches once; all subsequent writes go through the PATCH API and update local state — no full page reloads needed.

**Alternatives considered**:
- Next.js `router.refresh()` after each PATCH — triggers a full server re-render, but introduces a visible flash and is slower than optimistic state update
- URL-based state (search params) — appropriate for filters, not for mutation results
- Zustand/Jotai — unnecessary library weight for one piece of shared state

---

## Decision 5: Owner Autocomplete Implementation

**Decision**: Derive unique, non-null owner names client-side from the existing `tickets` state array. No additional API endpoint required.

**Rationale**: The dashboard already holds all tickets in React state (Decision 4). Extracting distinct non-empty owner names is a `Set` operation on the existing data. Adding a `GET /tickets/owners` endpoint would be redundant and out of scope for v1.

**Alternatives considered**:
- Dedicated `/api/owners` endpoint — adds an API endpoint with no user-facing value; owner list is a derived subset of ticket data already on the client

---

## Decision 6: Accessibility Testing

**Decision**: `@axe-core/react` in development mode for continuous feedback; manual axe browser extension check before marking any UI story complete.

**Rationale**: `@axe-core/react` logs violations to the console during development without requiring a separate test command. Constitution Principle V requires zero critical violations before a UI story is done. This gives developers immediate feedback.

**Alternatives considered**:
- Playwright + axe — appropriate for CI accessibility gates but adds CI setup complexity beyond the < 3 min target in v1
- Manual-only — too easy to miss violations; in-dev tooling catches issues earlier

---

## Decision 7: Commit Hygiene Enforcement

**Decision**: `commitlint` with Conventional Commits config, run as a `commit-msg` git hook via `husky`.

**Rationale**: PRD NFR-4 requires Conventional Commits enforced via `commitlint`. `husky` wires it as a pre-commit hook so it runs locally, not only in CI.

**Alternatives considered**:
- CI-only check — catches violations too late; fails builds after code is already written

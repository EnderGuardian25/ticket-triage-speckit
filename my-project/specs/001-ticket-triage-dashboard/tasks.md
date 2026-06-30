---
description: "Task list for Ticket Triage Dashboard v1"
---

# Tasks: Ticket Triage Dashboard

**Input**: Design documents from `specs/001-ticket-triage-dashboard/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

> **Last updated**: 2026-06-30 — Added T032 (jest-axe CI accessibility gate), T033 (API perf benchmark); updated T006/T017/T030 per speckit-analyze remediation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

- App Router pages and API routes: `app/`
- Shared client components: `components/`
- Shared utilities: `lib/`
- Database schema and seed: `prisma/`
- Tests: `__tests__/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js project with all tooling configured before any feature work begins.

- [X] T001 Initialize Next.js 15 App Router project with TypeScript strict mode and pnpm (package.json, tsconfig.json with `strict: true`, next.config.ts)
- [X] T002 [P] Configure Prisma with SQLite provider in prisma/schema.prisma and add `prisma` scripts to package.json (`migrate dev`, `db seed`, `generate`)
- [X] T003 [P] Configure Vitest with jsdom environment for component tests in vitest.config.ts and add `test` and `typecheck` scripts to package.json
- [X] T004 [P] Configure ESLint with Next.js core-web-vitals rules and commitlint with Conventional Commits spec in eslint.config.mjs and commitlint.config.ts
- [X] T005 [P] Configure Husky commit-msg hook to run commitlint on every commit in .husky/commit-msg
- [X] T006 [P] Create GitHub Actions CI workflow running typecheck → lint → test in sequence, targeting < 3 min total, in .github/workflows/ci.yml; include pnpm store caching (`actions/cache` keyed on `pnpm-lock.yaml`) to keep cold runs under budget

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Define Ticket model in prisma/schema.prisma (fields: id, title, priority, owner, status, createdAt — per data-model.md) and run `prisma migrate dev --name init`
- [X] T008 [P] Create Prisma client singleton exported as `db` in lib/db.ts
- [X] T009 [P] Create Zod validation schemas for the PATCH request body (priority enum: P0/P1/P2, owner: string or null) and structured 422 error shape in lib/validations.ts
- [X] T010 Create seed script with ≥ 10 sample tickets spanning P0/P1/P2 with a mix of owned and unowned tickets in prisma/seed.ts; add `"seed"` script to package.json pointing to `prisma/seed.ts`

**Checkpoint**: `pnpm prisma migrate dev` and `pnpm prisma db seed` must both succeed before continuing.

---

## Phase 3: User Story 1 — View All Open Tickets Grouped by Priority (P1) 🎯 MVP

**Goal**: PMO coordinator opens `/tickets` and sees all open tickets grouped under P0/P1/P2 headers with count badges, ordered oldest first within each group. Empty groups show a message.

**Independent Test**: Run `pnpm prisma db seed`, open `http://localhost:3000/tickets`, verify three priority sections each with correct badge counts and ticket rows. Check empty group state by clearing one priority from seed data.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Write contract test for GET /api/tickets validating response is a JSON array with correct field types and sort order (priority ASC, createdAt ASC) in __tests__/api/get-tickets.test.ts

### Implementation for User Story 1

- [X] T012 [US1] Create GET /api/tickets route handler that queries all open tickets via `db`, ordered by priority ASC then createdAt ASC, and returns JSON array in app/api/tickets/route.ts
- [X] T013 [P] [US1] Create TicketBoard client component (`"use client"`) that accepts an initial `tickets` array prop, holds it in `useState`, groups tickets into P0/P1/P2 sections with live count badges, and renders a `TicketRow` per ticket in components/TicketBoard.tsx
- [X] T014 [P] [US1] Create PriorityGroup sub-component that renders a section header with count badge and an empty-state message when the group has zero tickets in components/PriorityGroup.tsx
- [X] T015 [US1] Create dashboard page server component that fetches all open tickets from Prisma directly (no fetch() call) and passes them to TicketBoard in app/tickets/page.tsx
- [X] T016 [US1] Create root page that redirects to /tickets in app/page.tsx
- [X] T017 [US1] Install @axe-core/react; add dev-only axe initialisation to app/layout.tsx; open dashboard in browser and confirm zero critical axe violations logged to console (supplementary dev diagnostic only — CI gate is T032)

**Checkpoint**: US1 fully functional — all acceptance scenarios from spec.md §User Story 1 pass independently.

---

## Phase 4: User Story 2 — Update a Ticket's Priority (P2)

**Goal**: PMO coordinator clicks a ticket's priority badge, selects a new priority, and the ticket immediately moves to the correct group — count badges update in the same interaction, no page reload. Change persists after refresh.

**Independent Test**: Seed DB, open dashboard, change a P1 ticket to P0 — confirm visual move, both badge counts update immediately, then refresh and confirm ticket still shows under P0.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US2] Write contract tests for PATCH /api/tickets/:id covering: valid priority update (200), invalid priority value (422 with issues array), non-existent ticket id (404) in __tests__/api/patch-ticket.test.ts
- [X] T019 [P] [US2] Write unit tests for TicketRow priority selector: renders current priority, opens selector on click, calls onUpdate with updated ticket on selection in __tests__/components/TicketRow.test.tsx

### Implementation for User Story 2

- [X] T020 [US2] Create PATCH /api/tickets/:id route handler: parse id, validate body with Zod schema from lib/validations.ts, update via `db`, return 200 with updated ticket / 404 if not found / 422 with structured error in app/api/tickets/[id]/route.ts
- [X] T021 [US2] Create TicketRow client component (`"use client"`) that renders ticket fields and a priority badge selector; on priority selection, calls PATCH /api/tickets/:id and invokes `onUpdate(updatedTicket)` callback in components/TicketRow.tsx
- [X] T022 [US2] Wire `onUpdate` callback in TicketBoard to replace the updated ticket in local `tickets` state; verify count badges recompute immediately from new state in components/TicketBoard.tsx

**Checkpoint**: US1 + US2 both independently functional — badge counts update live, change persists after refresh.

---

## Phase 5: User Story 3 — Assign or Reassign a Ticket Owner (P3)

**Goal**: PMO coordinator clicks the owner field on any ticket, types a name (with autocomplete suggestions from existing owners), confirms, and the change is reflected immediately and persists after refresh. Blank owner clears the assignment.

**Independent Test**: Seed DB with some owned tickets, open dashboard, assign owner to unowned ticket, verify autocomplete shows existing names, confirm, refresh — owner persists. Then clear an owner (blank submit) and verify null is stored.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T023 [P] [US3] Write unit tests for TicketRow owner input: renders owner value, enters edit mode on click, shows autocomplete suggestions from distinct non-null owners in tickets state, calls onUpdate on confirm, accepts blank input as null in __tests__/components/TicketRow.test.tsx

### Implementation for User Story 3

- [X] T024 [US3] Add owner input field to TicketRow with inline edit mode (click to edit, Enter/blur to confirm); derive autocomplete suggestions by extracting distinct non-null owner values from the `tickets` prop passed down from TicketBoard; on confirm, call PATCH /api/tickets/:id with `{owner}` and invoke `onUpdate(updatedTicket)` in components/TicketRow.tsx
- [X] T025 [US3] Pass full `tickets` array as prop to TicketRow (or derive suggestions in TicketBoard and pass as `ownerSuggestions` prop) so autocomplete list reflects all currently known owners in components/TicketBoard.tsx

**Checkpoint**: US1 + US2 + US3 all independently functional — owner autocomplete works, blank owner clears assignment, changes persist.

---

## Phase 6: User Story 4 — Machine-Readable Ticket API (P4)

**Goal**: External clients can read all tickets as JSON and update priority/owner programmatically. API routes were created in US1 and US2; this phase validates full contract coverage.

**Independent Test**: Use curl or REST client to run all four scenarios from quickstart.md §US4: GET all tickets (200), PATCH valid (200), PATCH invalid priority (422), PATCH missing id (404).

### Tests for User Story 4

> **Extend existing contract tests — no new test files**

- [X] T026 [P] [US4] Extend __tests__/api/patch-ticket.test.ts to cover owner field: set owner (200), clear owner with null (200), clear owner with empty string normalised to null (200)
- [X] T027 [P] [US4] Extend __tests__/api/get-tickets.test.ts to assert all required fields present (id, title, priority, owner, status, createdAt) with correct types and that sort order is priority ASC then createdAt ASC

**Checkpoint**: All four user stories independently functional. Full API contract test suite green.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and CI verification across all stories.

- [X] T028 [P] Run all quickstart.md validation scenarios end-to-end and fix any discrepancies found
- [X] T029 Run `pnpm typecheck` (tsc --noEmit --strict) and resolve every type error until output is clean with zero errors
- [X] T030 [P] Verify GitHub Actions CI pipeline completes all steps (typecheck, lint, test) in under 3 minutes; if over budget, add `--reporter=verbose` to identify slow tests and enable pnpm store caching in .github/workflows/ci.yml
- [X] T031 [P] Add README.md to repo root with: prerequisites, setup commands (`pnpm install`, `prisma migrate dev`, `prisma db seed`, `pnpm dev`), and link to quickstart.md
- [X] T032 [P] Install jest-axe and @types/jest-axe; write accessibility test in __tests__/components/accessibility.test.tsx that renders TicketBoard with seeded fixture data and asserts zero critical axe violations; this test MUST run (and pass) in CI as the automated gate for FR-012 / SC-005
- [X] T033 [P] Add a Vitest timing assertion in __tests__/api/get-tickets.test.ts that calls GET /api/tickets with the full 50-ticket seed set and asserts the response arrives in under 150ms (p95 approximation via single warm call); validates SC-004

---

## Phase 8: Convergence

- [X] T034 Add `where: { status: 'open' }` filter to `db.ticket.findMany` in app/tickets/page.tsx and add a second query for distinct non-null owner names from all tickets (regardless of status); pass the result as an `initialOwnerSuggestions` prop to TicketBoard so TicketBoard can merge server-provided names with locally-derived ones, satisfying FR-001 (only open tickets displayed) and FR-005 (autocomplete draws from all tickets) simultaneously per FR-001 / FR-005 (partial)
- [X] T035 [P] Add dev-only @axe-core/react initialization to app/layout.tsx (import and call `axe(React, ReactDOM, 1000)` inside a `typeof window !== 'undefined'` guard or a `useEffect` in a client wrapper); this is the supplementary console diagnostic called for by T017 — the CI accessibility gate (T032) is already in place per T017 (partial)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; all [P] tasks in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
  - T007 must complete before T008 (schema before client)
  - T008 and T009 can run in parallel
  - T010 depends on T007 (seed needs schema)
- **User Stories (Phases 3–6)**: All depend on Phase 2 completion
  - Stories can run in priority order (P1 → P2 → P3 → P4) or in parallel if team capacity allows
- **Polish (Phase 7)**: Depends on all desired user stories being complete; T032 additionally requires TicketBoard (T013) to exist; T033 requires GET /api/tickets (T012) to exist

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P2)**: Depends on US1 (reuses TicketRow component foundation and TicketBoard state wiring)
- **US3 (P3)**: Depends on US2 (extends TicketRow component already created in US2)
- **US4 (P4)**: Depends on US1 + US2 (API routes created in those stories)

### Within Each User Story

- Test tasks (T011, T018–T019, T023, T026–T027) MUST be written and FAIL before implementation
- Route handlers before component integration
- Components before TicketBoard wiring
- Story complete and tested before moving to next priority

---

## Parallel Opportunities

```bash
# Phase 1 — all [P] tasks launch together after T001:
T002 Configure Prisma schema setup
T003 Configure Vitest
T004 Configure ESLint + commitlint
T005 Configure Husky hook
T006 Create CI workflow

# Phase 2 — after T007 completes:
T008 Create lib/db.ts
T009 Create lib/validations.ts

# US1 — T011 (test) in parallel with T012 (route):
T011 GET /tickets contract test
T012 GET /tickets implementation

# T013 and T014 in parallel (different files):
T013 TicketBoard component
T014 PriorityGroup component

# US2 — T018 and T019 in parallel:
T018 PATCH contract tests
T019 TicketRow unit tests
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open dashboard, verify all US1 acceptance scenarios pass
5. Demo to PMO coordinator for early feedback

### Incremental Delivery

1. Setup + Foundational → project ready to run
2. US1 → read-only dashboard with grouped tickets (**MVP**)
3. US2 → inline priority editing with live badge updates
4. US3 → owner assignment with autocomplete
5. US4 → API contract validation complete
6. Polish → CI verified, README done

---

## Notes

- [P] tasks = different files, no shared dependencies with other concurrent tasks
- [Story] label maps each task to its user story for traceability
- Tests marked with story label MUST fail before implementation tasks in the same story begin
- Commit after each task or logical group using Conventional Commits format
- Validate each story independently at its checkpoint before advancing

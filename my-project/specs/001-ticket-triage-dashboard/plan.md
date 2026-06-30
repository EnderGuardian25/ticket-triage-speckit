# Implementation Plan: Ticket Triage Dashboard

**Branch**: `001-ticket-triage-dashboard` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-ticket-triage-dashboard/spec.md`

## Summary

Build a browser-based PMO dashboard that displays all open tickets grouped by priority (P0/P1/P2) with live count badges, inline priority and owner editing, and a REST API surface — all running from a single `pnpm dev` command with zero external infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode — Node.js LTS

**Primary Dependencies**: Next.js 15 App Router, Prisma ORM, Zod (payload validation), pnpm (package manager), Vitest (testing), jest-axe (CI accessibility gate), @axe-core/react (dev-mode diagnostics), commitlint (commit hygiene)

**Storage**: SQLite via Prisma ORM — single file, zero server setup

**Testing**: Vitest for unit and API contract tests; jest-axe for CI-enforced accessibility assertions (FR-012); @axe-core/react for additional dev-mode console diagnostics

**Target Platform**: Desktop browser (localhost), served by Next.js dev server

**Project Type**: Full-stack web application — single Next.js repository co-locating UI and API Route Handlers

**Performance Goals**: Dashboard initial render < 1.5s on localhost; API p95 < 150ms for ≤ 50 tickets

**Constraints**: Single command startup (`pnpm dev`); zero `any` types; CI < 3 minutes; ≤ 50 tickets in v1; no auth; no Docker

**Scale/Scope**: 3 PMO coordinators, up to 50 tickets, effectively single-user (last-write-wins acceptable)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see ✅ marks.*

| Principle | Gate Requirement | Status |
|-----------|-----------------|--------|
| I. Non-Technical User First | UI requires no training; priority change ≤ 3 clicks; owner autocomplete | ✅ PASS |
| II. Zero-Setup Local Development | SQLite (no server), `pnpm install && pnpm dev` sufficient | ✅ PASS |
| III. Type Safety is Non-Negotiable | `tsc --noEmit --strict` enforced in CI; Zod validates API boundary | ✅ PASS |
| IV. API Contract Integrity | All write endpoints validated by Zod; 200/404/422 returned per spec | ✅ PASS |
| V. Accessibility as a Quality Gate | Zero critical axe violations required before any UI story is done; CI-enforced via jest-axe (T032) | ✅ PASS |
| VI. CI as the Arbiter | Type check + lint + tests in CI; pipeline target < 3 min | ✅ PASS |

No violations — Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-ticket-triage-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── get-tickets.md
│   └── patch-ticket.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── page.tsx                        # Root — redirects to /tickets
├── tickets/
│   └── page.tsx                    # Dashboard server component (US1)
└── api/
    └── tickets/
        ├── route.ts                # GET /tickets (US4)
        └── [id]/
            └── route.ts            # PATCH /tickets/:id (US2, US3, US4)

components/
├── TicketBoard.tsx                 # Client component — groups tickets by priority, holds state (US1)
├── PriorityGroup.tsx               # Sub-component — section header, count badge, empty-state (US1)
└── TicketRow.tsx                   # Client component — inline priority + owner editing (US2, US3)

lib/
├── db.ts                           # Prisma client singleton
└── validations.ts                  # Zod schemas (shared by API and tests)

prisma/
├── schema.prisma                   # Ticket model
└── seed.ts                         # Seed script (US1 dependency)

__tests__/
├── api/
│   ├── get-tickets.test.ts         # Contract tests for GET /tickets
│   └── patch-ticket.test.ts        # Contract tests for PATCH /tickets/:id
└── components/
    ├── TicketRow.test.tsx          # Unit tests for priority/owner interactions
    └── accessibility.test.tsx     # jest-axe CI-enforced accessibility gate (FR-012)
```

**Structure Decision**: Single Next.js App Router repository. The App Router co-locates server components (dashboard page, data fetching) and API Route Handlers in the same `app/` tree. `components/` holds the single client component. `lib/` holds shared utilities. `prisma/` holds schema and seed. This keeps the project to one `pnpm dev` invocation and one CI pipeline.

# Ticket Triage Dashboard

Browser-based PMO dashboard for Bistec Global. Displays all open tickets grouped by priority (P0/P1/P2) with live count badges, inline priority and owner editing, and a REST API surface.

## Prerequisites

- [Node.js LTS](https://nodejs.org/) (v22+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Setup

```bash
pnpm install
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
pnpm dev
```

App runs at **http://localhost:3000** (redirects to `/tickets`).

## Development commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm test` | Run full test suite |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm lint` | Lint with ESLint |
| `pnpm exec prisma db seed` | Re-seed the database |
| `pnpm exec prisma studio` | Open Prisma Studio (DB browser) |

## Validation

See [specs/001-ticket-triage-dashboard/quickstart.md](specs/001-ticket-triage-dashboard/quickstart.md) for end-to-end validation scenarios covering all four user stories.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tickets` | Returns all tickets as JSON array |
| `PATCH` | `/api/tickets/:id` | Updates `priority` and/or `owner` |

Full contract specs: [get-tickets.md](specs/001-ticket-triage-dashboard/contracts/get-tickets.md) · [patch-ticket.md](specs/001-ticket-triage-dashboard/contracts/patch-ticket.md)

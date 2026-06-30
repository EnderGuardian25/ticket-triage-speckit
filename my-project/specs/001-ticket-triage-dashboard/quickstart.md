# Quickstart & Validation Guide: Ticket Triage Dashboard

**Date**: 2026-06-23
**Feature**: specs/001-ticket-triage-dashboard/spec.md

Use this guide to validate that the feature works end-to-end after implementation.

---

## Prerequisites

- Node.js LTS installed
- pnpm installed (`npm install -g pnpm`)
- Repository cloned

---

## Setup

```bash
pnpm install
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm dev
```

The app is now running at `http://localhost:3000`.

The seed script populates the database with sample tickets across all three priority levels (P0, P1, P2) and a mix of owned and unowned tickets.

---

## Validation Scenarios

### US1 — View All Open Tickets Grouped by Priority

1. Open `http://localhost:3000/tickets` in a desktop browser.
2. **Expected**: Three sections visible — P0, P1, P2 — each with a count badge.
3. **Expected**: Each ticket row shows: ID, title, priority, owner (or blank), status.
4. **Expected**: Within each section, tickets are ordered oldest first.
5. **Expected**: Page fully renders in under 2 seconds (check browser Network tab — no throttling).
6. Remove all seeded tickets from one priority group (or use a fresh empty DB), reload.
7. **Expected**: The empty group shows an informational empty-state message, not a blank space or error.

### US2 — Update a Ticket's Priority

1. On the dashboard, click the priority badge on any P1 ticket.
2. Select P0 from the popup/dropdown.
3. **Expected** (3 clicks total or fewer): The ticket disappears from P1, appears under P0 immediately — no page reload.
4. **Expected**: The P1 count badge decrements and the P0 count badge increments in the same interaction.
5. Refresh the page.
6. **Expected**: The ticket still appears under P0 — the change persisted.

### US3 — Assign or Reassign a Ticket Owner

1. Click the owner field on a ticket that has no owner.
2. Type a name (e.g., "Amal") and confirm (press Enter or click confirm).
3. **Expected**: The owner field updates immediately — no page reload.
4. Refresh the page.
5. **Expected**: "Amal" still shows as owner — the change persisted.
6. Click the owner field on another ticket and begin typing.
7. **Expected**: "Amal" appears as an autocomplete suggestion (drawn from existing owners).
8. Set a ticket owner to blank/empty and confirm.
9. **Expected**: The owner field shows as unassigned — blank owner is accepted and persisted.

### US4 — Machine-Readable Ticket API

Use a REST client (curl, Postman, or browser fetch console) for the following:

**GET all tickets**
```bash
curl http://localhost:3000/api/tickets
```
Expected: JSON array with `id`, `title`, `priority`, `owner`, `status`, `createdAt` fields. HTTP 200.

**PATCH priority — valid**
```bash
curl -X PATCH http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"priority": "P0"}'
```
Expected: Updated ticket object returned. HTTP 200.

**PATCH priority — invalid value**
```bash
curl -X PATCH http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"priority": "critical"}'
```
Expected: Structured error with `issues` array. HTTP 422.

**PATCH — ticket not found**
```bash
curl -X PATCH http://localhost:3000/api/tickets/99999 \
  -H "Content-Type: application/json" \
  -d '{"priority": "P1"}'
```
Expected: `{"error": "Ticket not found", "id": 99999}`. HTTP 404.

---

## Automated Tests

```bash
pnpm test
```

All tests must pass. The test suite covers:
- API contract tests for `GET /tickets` and `PATCH /tickets/:id`
- Unit tests for `TicketRow` priority and owner interactions

---

## CI Gate

```bash
pnpm typecheck   # tsc --noEmit — must produce zero errors
pnpm lint        # must produce zero errors
pnpm test        # all tests must pass
```

All three must pass before merging. The CI pipeline runs these in sequence and must complete in under 3 minutes.

---

## API Contract Reference

- [GET /tickets](contracts/get-tickets.md)
- [PATCH /tickets/:id](contracts/patch-ticket.md)

## Data Model Reference

- [data-model.md](data-model.md)

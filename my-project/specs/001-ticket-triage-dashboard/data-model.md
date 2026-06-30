# Data Model: Ticket Triage Dashboard

**Date**: 2026-06-23
**Feature**: specs/001-ticket-triage-dashboard/spec.md

---

## Entity: Ticket

The sole persistent entity. Represents a unit of work that needs PMO triage.

### Fields

| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | Integer | Yes | Auto-increment | Primary key; unique; immutable after creation |
| `title` | String | Yes | — | Non-empty; max 255 characters |
| `priority` | String | Yes | `"P1"` | Enum: `"P0"`, `"P1"`, `"P2"` only |
| `owner` | String | No | `null` | Free text; nullable (null = unassigned); max 100 characters |
| `status` | String | Yes | `"open"` | `"open"` only in v1; field reserved for future statuses |
| `createdAt` | DateTime | Yes | Current timestamp | Set on creation; immutable; used for sort order |

### Validation Rules

- `title`: MUST be a non-empty string. Whitespace-only strings are rejected.
- `priority`: MUST be exactly one of `"P0"`, `"P1"`, `"P2"`. Case-sensitive. Any other value rejected with HTTP 422.
- `owner`: MAY be `null` or an empty string (treated as unassigned). Non-null values are trimmed of leading/trailing whitespace before storage.
- `status`: Read-only via API in v1. Cannot be updated via `PATCH /tickets/:id`.
- `id`, `createdAt`: Immutable. Cannot be set or updated via API.

### State Transitions

```
[created with status="open"]
        │
        ▼
    status: "open"  ←──── PATCH priority / owner (status unchanged)
        │
        │  (v2+: transition to "resolved", "blocked", etc.)
        ▼
    [future statuses — out of scope in v1]
```

In v1, `status` is always `"open"`. The field exists in the schema to avoid a breaking migration when statuses are introduced in v2.

### Sort Order

Within each priority group on the dashboard, tickets are ordered by `createdAt ASC` (oldest first). This is applied at the query level.

---

## Derived Concept: Priority Group

Not a stored entity — computed at query time and rendered in the UI.

| Attribute | Description |
|-----------|-------------|
| `level` | One of `"P0"`, `"P1"`, `"P2"` |
| `tickets` | Array of `Ticket` records with matching `priority`, ordered by `createdAt ASC` |
| `count` | `tickets.length` — displayed as a badge on the group header |

All three priority groups are always rendered, even when `count === 0` (empty-state message shown).

---

## Derived Concept: Owner Suggestions

Not stored — derived client-side at runtime.

- Source: the `owner` field across all `Ticket` records currently in client state
- Derivation: collect all non-null, non-empty owner values; deduplicate; sort alphabetically
- Used by: the owner input autocomplete in `TicketRow` (User Story 3)
- No separate API endpoint required

---

## Storage Notes

- Storage engine: SQLite (single file in repo)
- ORM: Prisma — schema defined in `prisma/schema.prisma`
- Migration: `prisma migrate dev` creates the `Ticket` table
- Seed: `prisma db seed` populates ≤ 50 tickets from `prisma/seed.ts`
- Prisma client: generated into `node_modules/.prisma/client`; imported via singleton at `lib/db.ts`

# Contract: PATCH /tickets/:id

**Version**: v1
**Feature**: specs/001-ticket-triage-dashboard/spec.md — FR-008, FR-009, FR-010, US2, US3, US4

---

## Endpoint

```
PATCH /api/tickets/:id
```

`:id` — integer, the ticket's `id` field.

## Purpose

Partially updates a ticket's `priority` and/or `owner` fields. Used by the `TicketRow` client component for inline edits and by external automated clients.

## Request

**Content-Type**: `application/json`

**Body**: At least one of `priority` or `owner` must be present. All other fields are ignored.

```json
{
  "priority": "P0"
}
```

```json
{
  "owner": "Kavya"
}
```

```json
{
  "priority": "P1",
  "owner": null
}
```

### Accepted Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `priority` | string | No | Must be `"P0"`, `"P1"`, or `"P2"` if present |
| `owner` | string \| null | No | `null` clears the owner; non-null values trimmed of whitespace; empty string treated as `null` |

Fields not listed above (`id`, `title`, `status`, `createdAt`) are ignored and MUST NOT cause an error.

## Response: 200 OK

Returns the full updated ticket object.

```json
{
  "id": 3,
  "title": "Resolve CI pipeline timeout",
  "priority": "P0",
  "owner": "Kavya",
  "status": "open",
  "createdAt": "2026-06-15T09:00:00.000Z"
}
```

## Response: 404 Not Found

Returned when `:id` does not match any ticket in the data store.

```json
{
  "error": "Ticket not found",
  "id": 999
}
```

## Response: 422 Unprocessable Entity

Returned when the request body fails Zod validation (e.g., invalid priority value, wrong type).

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "field": "priority",
      "message": "Invalid enum value. Expected 'P0' | 'P1' | 'P2', received 'critical'"
    }
  ]
}
```

## Validation Rules (enforced by Zod)

- Body must be a valid JSON object.
- `priority` (if present): must be exactly `"P0"`, `"P1"`, or `"P2"`. Case-sensitive.
- `owner` (if present): string or null. Empty string is normalised to `null` before storage.
- At least one updatable field (`priority` or `owner`) should be present; a body with neither is accepted but results in a no-op 200 (no error, unchanged ticket returned).

## Notes

- `status`, `id`, `title`, and `createdAt` cannot be changed via this endpoint. Fields present in the body beyond `priority` and `owner` are silently stripped before the Zod parse step.
- Concurrent PATCH requests from multiple clients: last-write-wins in v1. No optimistic locking.

# Contract: GET /tickets

**Version**: v1
**Feature**: specs/001-ticket-triage-dashboard/spec.md — FR-007, US4

---

## Endpoint

```
GET /api/tickets
```

## Purpose

Returns all tickets in the data store as a JSON array. Used by the dashboard page on initial load (via server component, not client fetch) and by external automated clients.

## Request

No request body. No query parameters in v1.

## Response: 200 OK

Returns a JSON array of ticket objects. Empty array if no tickets exist.

```json
[
  {
    "id": 1,
    "title": "Fix login redirect loop",
    "priority": "P0",
    "owner": "Amal",
    "status": "open",
    "createdAt": "2026-06-01T08:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Update onboarding email copy",
    "priority": "P2",
    "owner": null,
    "status": "open",
    "createdAt": "2026-06-10T14:30:00.000Z"
  }
]
```

### Field Descriptions

| Field | Type | Notes |
|-------|------|-------|
| `id` | integer | Auto-increment primary key |
| `title` | string | Non-empty |
| `priority` | string | `"P0"` \| `"P1"` \| `"P2"` |
| `owner` | string \| null | `null` if unassigned |
| `status` | string | `"open"` in v1 |
| `createdAt` | string (ISO 8601) | UTC timestamp |

### Sort Order

The array is ordered by `priority ASC` then `createdAt ASC` (P0 first, oldest within each group first).

## Error Responses

No error responses defined for this endpoint in v1 (no auth, no filters, no params to validate).

## Notes

- The server component at `app/tickets/page.tsx` calls Prisma directly rather than fetching this endpoint — this avoids an HTTP round-trip during SSR.
- This endpoint exists for external/programmatic clients (US4) and future webhook integration.

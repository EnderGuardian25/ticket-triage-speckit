# Feature Specification: Ticket Triage Dashboard

**Feature Branch**: `001-ticket-triage-dashboard`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Full v1 ticket triage dashboard for PMO coordinators at Bistec Global — grouped priority view, inline editing, and REST API surface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Open Tickets Grouped by Priority (Priority: P1)

A PMO coordinator opens the dashboard and immediately sees all open tickets organised into three priority groups (P0, P1, P2). Each group header shows how many tickets it contains. This is the daily starting point for every standup.

**Why this priority**: Without a working ticket list, nothing else in the feature has value. This is the read-only foundation everything else builds on.

**Independent Test**: Seed the data store with tickets across all three priority levels, open the dashboard, and verify each group header, badge count, and ticket row are visible without any additional interaction.

**Acceptance Scenarios**:

1. **Given** the dashboard is opened with tickets present across all priority groups, **When** the page loads, **Then** all tickets are displayed, each showing: ID, title, priority, owner, and status.
2. **Given** tickets are loaded, **When** the PMO coordinator views the page, **Then** tickets are visually grouped under P0, P1, and P2 headers, each displaying a count badge reflecting the number of tickets in that group.
3. **Given** a priority group contains no tickets, **When** the page renders, **Then** that group shows an empty-state message rather than an empty section.
4. **Given** the dashboard, **When** the page finishes loading, **Then** all tickets are visible within 2 seconds of navigation.

---

### User Story 2 - Update a Ticket's Priority (Priority: P2)

A PMO coordinator spots a ticket in the wrong priority group and reassigns it to a new priority without leaving the dashboard. The change is reflected immediately in the UI and survives a page refresh.

**Why this priority**: Priority editing is the primary write action the PRD measures (under 3 clicks). It directly reduces the 25-minute daily sorting effort.

**Independent Test**: Load the dashboard, change one ticket's priority badge from P1 to P0, refresh the page, and confirm the ticket now appears under P0.

**Acceptance Scenarios**:

1. **Given** a ticket is displayed, **When** the PMO coordinator clicks its priority badge and selects a new priority, **Then** the ticket moves to the correct group immediately without a full page reload, and both the source and destination group count badges update in the same interaction.
2. **Given** a priority change is made, **When** the coordinator refreshes the page, **Then** the updated priority is still shown — the change has been persisted.
3. **Given** the entire priority-update flow, **When** timed from first click to confirmed change, **Then** the full interaction completes in 3 or fewer clicks.

---

### User Story 3 - Assign or Reassign a Ticket Owner (Priority: P3)

A PMO coordinator assigns an unowned ticket to a team member, or corrects a wrong owner, directly on the dashboard. The name persists after refresh.

**Why this priority**: Owner assignment prevents tickets from sitting unactioned, but it is secondary to knowing what to prioritise.

**Independent Test**: Load the dashboard, click an owner field on an unowned ticket, type a name, confirm, then refresh — verify the name persists.

**Acceptance Scenarios**:

1. **Given** a ticket with no owner, **When** the PMO coordinator clicks the owner field and types a name and confirms, **Then** the owner field updates immediately in the UI.
2. **Given** an owner has been set, **When** the coordinator refreshes the page, **Then** the owner name is still displayed — the change has been persisted.
3. **Given** a ticket already has an owner, **When** the coordinator edits the owner field, **Then** the previous name is replaced with the new name.
4. **Given** one or more tickets already have owners assigned, **When** a coordinator begins typing in the owner field of any ticket, **Then** the input shows autocomplete suggestions matching names already used across existing tickets.

---

### User Story 4 - Machine-Readable Ticket API (Priority: P4)

An automated client (future webhook or integration script) reads all tickets in a structured format and updates individual tickets programmatically.

**Why this priority**: The API enables the future GitHub Issues integration (G-4) and supports any scripted reporting. It has no direct PMO user interaction in v1 but must be present for the architecture to support growth.

**Independent Test**: Use a REST client to call `GET /tickets`, verify the JSON structure; then call `PATCH /tickets/:id` with a valid payload and verify the updated ticket is returned; then call `PATCH /tickets/:id` with an invalid payload and verify a structured error response.

**Acceptance Scenarios**:

1. **Given** a client calls `GET /tickets`, **When** the request is valid, **Then** the response is a JSON array of all tickets, each containing: id, title, priority, owner, and status.
2. **Given** a client calls `PATCH /tickets/:id` with a valid payload, **When** the request is processed, **Then** the updated ticket object is returned with a 200 status code.
3. **Given** a client calls `PATCH /tickets/:id` with an invalid payload, **When** the request is processed, **Then** a structured error message is returned with a 422 status code.
4. **Given** a client calls `PATCH /tickets/:id` for a ticket that does not exist, **When** the request is processed, **Then** a 404 response is returned.

---

### Edge Cases

- What happens when the data store is empty (no tickets seeded)? The dashboard must render with empty-state messages in all three priority groups rather than crashing or showing a blank page.
- What happens if a `PATCH` request contains a priority value outside the allowed set (P0, P1, P2)? The API must reject it with a 422 and a descriptive error message.
- What happens if the owner field is submitted as blank? The system must accept a blank/null owner (clearing the assignment) as a valid state.
- What happens when two users update the same ticket simultaneously? In v1, last-write-wins is acceptable; no conflict resolution is required.
- What happens when the dashboard loads more than 50 tickets? Performance targets are defined for up to 50 tickets; behaviour beyond that is undefined in v1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display all open tickets (status = "open") on a single dashboard page, each showing: ID, title, priority, owner, and status. Within each priority group, tickets MUST be ordered oldest first (by creation time). In v1, "open" is the only status value; tickets with any other status MUST NOT appear on the dashboard.
- **FR-002**: The system MUST group tickets visually under P0, P1, and P2 headers, with a count badge on each header. Count badges MUST update immediately when a ticket moves between groups (no page reload required).
- **FR-003**: Each priority group MUST display an empty-state message when it contains no tickets.
- **FR-004**: A PMO coordinator MUST be able to change a ticket's priority from the dashboard in 3 or fewer clicks, with the change taking effect immediately in the UI.
- **FR-005**: A PMO coordinator MUST be able to set or change a ticket's owner from the dashboard, with the change taking effect immediately in the UI. The owner input MUST offer autocomplete suggestions drawn from distinct non-null owner values across all tickets (regardless of status), while still accepting any free-text value not in that list. Submitting a blank or empty owner field MUST clear the owner assignment (set owner to null).
- **FR-006**: All priority and owner changes MUST be persisted so they survive a full page refresh.
- **FR-007**: The system MUST expose a `GET /tickets` endpoint that returns all tickets as a JSON array with fields: id, title, priority, owner, status, and createdAt. The response MUST be ordered by priority ASC, then createdAt ASC.
- **FR-008**: The system MUST expose a `PATCH /tickets/:id` endpoint that accepts partial updates to priority and owner fields and returns the updated ticket on success (HTTP 200).
- **FR-009**: The `PATCH /tickets/:id` endpoint MUST reject payloads that fail validation with a structured error response (HTTP 422).
- **FR-010**: The `PATCH /tickets/:id` endpoint MUST return HTTP 404 when the requested ticket does not exist.
- **FR-011**: The system MUST be pre-loaded with seed data so it is usable immediately after setup without manual data entry.
- **FR-012**: The dashboard MUST pass automated accessibility checks with no critical violations. This MUST be enforced in CI via an automated test (e.g., jest-axe) — a manual browser-console check alone is insufficient to mark a UI story complete.

### Key Entities

- **Ticket**: The core unit of work. Attributes: unique identifier, title (required), priority (P0 / P1 / P2, required), owner (optional, free-text name with autocomplete from previously used names; blank submission clears to null), status (allowed values: "open" — the only value in v1; open by default), creation timestamp.
- **Priority Group**: A logical grouping of tickets sharing the same priority level. Displays a count of member tickets. Always rendered for all three levels (P0, P1, P2) even when empty.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard displays all tickets within 1.5 seconds of page load on a local development environment (up to 50 tickets).
- **SC-002**: A PMO coordinator can change a ticket's priority in 3 or fewer clicks, from first click to confirmed change.
- **SC-003**: Ticket sorting time for a PMO coordinator is reduced from approximately 25 minutes per day to under 5 minutes per day.
- **SC-004**: The API returns ticket data within 150ms at the 95th percentile for a data set of up to 50 tickets.
- **SC-005**: The dashboard renders without any critical accessibility violations when checked with an automated accessibility tool.
- **SC-006**: The continuous integration pipeline completes end-to-end in under 3 minutes.
- **SC-007**: All code changes pass strict type checking with zero unchecked type usages anywhere in the codebase.

## Assumptions

- The tool is deployed and accessed on a local network; no authentication is required in v1.
- No real-time push updates are required in v1; polling or manual refresh is acceptable.
- The initial data set is loaded from a seed file; no manual ticket creation UI is needed in v1.
- The maximum data volume in v1 is 50 tickets; scalability beyond that is not a v1 requirement.
- No mobile-specific layout is required in v1; the tool is used on desktop browsers only.
- This tool does not replace or sync with GitHub Issues, Jira, or any external ticketing platform in v1; the seed file is the sole data source.
- Future integration with GitHub Issues via webhook is noted as a goal but is explicitly out of scope for v1.
- The three PMO coordinators who will use the tool share a single view with no per-user filtering or role separation in v1.
- Concurrent write conflicts are handled by last-write-wins in v1; no locking or conflict resolution UI is required.

## Clarifications

### Session 2026-06-23

- Q: Do priority group count badges update immediately when a ticket is re-prioritised? → A: Yes, badges update immediately in the same interaction (no page reload needed)
- Q: What is the sort order for tickets within each priority group? → A: Oldest first (by creation time, FIFO triage queue)
- Q: Is the owner field free text, a predefined list, or autocomplete? → A: Free text with autocomplete suggestions from previously used names; any value accepted

### Session 2026-06-30 (speckit-analyze remediation)

- Q: What is the authoritative dashboard load performance target? → A: < 1.5 seconds on localhost (constitution and plan.md); SC-001 updated to match.
- Q: Does submitting a blank owner field clear the owner? → A: Yes — blank/empty string MUST be normalised to null, clearing the assignment. Added to FR-005.
- Q: Should autocomplete draw from all tickets or only open ones? → A: All tickets regardless of status, so owner names are not lost when tickets close. Added to FR-005.
- Q: Must `createdAt` be included in the GET /tickets API response? → A: Yes — required for sort-order verification by API consumers. Added to FR-007.
- Q: Is accessibility CI-enforced or manual only? → A: CI-enforced via automated test (jest-axe) per constitution Principle V. Updated FR-012 and added T032.

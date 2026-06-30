<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
First ratification — all principles are new.

Added sections:
  - I. Non-Technical User First
  - II. Zero-Setup Local Development
  - III. Type Safety is Non-Negotiable
  - IV. API Contract Integrity
  - V. Accessibility as a Quality Gate
  - VI. CI as the Arbiter
  - Performance Standards
  - Governance

Templates reviewed:
  ✅ .specify/templates/plan-template.md
     — Constitution Check gate placeholder present; no structural changes required.
        Gates will be filled by /speckit-plan referencing this file.
  ✅ .specify/templates/spec-template.md
     — No mandatory sections added or removed by this constitution.
  ✅ .specify/templates/tasks-template.md
     — Existing task categories (setup, linting, testing, accessibility)
       cover all principle-driven task types. No additions required.

Deferred TODOs: none.
-->

# Ticket Triage Dashboard Constitution

## Core Principles

### I. Non-Technical User First

Every feature decision MUST optimise for PMO coordinators who are non-technical
and work exclusively in a browser. Interfaces MUST require no training to operate.
Write actions (priority change, owner assignment) MUST complete in 3 or fewer
clicks. Jargon, tooltips, and onboarding flows are a last resort, not a design
strategy. When a technical constraint conflicts with a simpler user experience,
simplicity wins unless the conflict is documented and approved.

### II. Zero-Setup Local Development

The tool MUST start with a single command (`pnpm dev`) on any machine with
Node.js installed. No Docker, no running database server, no environment variable
configuration is permitted as a prerequisite for local development in v1.
Any change that adds a mandatory local service or setup step beyond
`pnpm install && pnpm dev` MUST be documented, reviewed, and justified before
merge.

### III. Type Safety is Non-Negotiable

All source code MUST pass `tsc --noEmit` with `strict: true` enabled. Zero `any`
types are permitted anywhere in the codebase — not in application code, not in
test files, not in configuration helpers. CI enforces this as a hard gate; a
failing type check blocks merge. Suppression comments (`// @ts-ignore`,
`// @ts-expect-error`) MUST NOT be used as a workaround for type errors.

### IV. API Contract Integrity

Every write endpoint MUST validate its payload against a defined schema before
touching persistent storage. Invalid payloads MUST be rejected with a structured
error response (HTTP 422) containing machine-readable field-level messages.
The schema definition is the source of truth for both the API layer and the
client; they MUST stay in sync. Endpoints MUST return appropriate HTTP status
codes: 200 for success, 404 for missing resources, 422 for validation failures.

### V. Accessibility as a Quality Gate

No UI user story is complete until the dashboard passes automated accessibility
checks with zero critical violations. Accessibility is not a polish step — it is
a definition-of-done criterion for every frontend task. Violations introduced
during development MUST be resolved before the story is marked complete, not
deferred to a later cleanup pass.

### VI. CI as the Arbiter

The CI pipeline is the authority on code quality. Every pull request MUST pass
all CI checks — type checking, linting, and automated tests — before it is
eligible for merge. The pipeline MUST complete in under 3 minutes end-to-end.
Bypassing CI (force merge, `--no-verify`, skipping checks) is never permitted
except in an explicit, time-boxed incident response, and MUST be documented
immediately afterward.

## Performance Standards

| Metric | Target | Scope |
|--------|--------|-------|
| Dashboard initial render | < 1.5 s on localhost | Up to 50 tickets in seed data |
| API response time (p95) | < 150 ms | `GET /tickets`, `PATCH /tickets/:id` |
| CI pipeline duration | < 3 minutes | End-to-end, including type check and tests |

These targets apply to v1 with a seed data set of up to 50 tickets. Behaviour
beyond this volume is undefined and not a v1 requirement.

## Governance

- This constitution supersedes all informal conventions and verbal agreements.
- Any amendment requires: (1) a written rationale documenting the change and
  its impact, (2) review by at least one other team member, and (3) a version
  bump following semantic versioning rules (MAJOR: principle removal/rewrite;
  MINOR: new principle or section; PATCH: wording/clarification).
- All pull requests and spec reviews MUST verify compliance with the principles
  above before approval.
- Complexity that conflicts with any principle MUST be logged in the
  `## Complexity Tracking` section of the relevant `plan.md` with explicit
  justification.
- Use this constitution as the authoritative gate in the `## Constitution Check`
  section of every `plan.md`.

**Version**: 1.0.0 | **Ratified**: 2026-06-23 | **Last Amended**: 2026-06-23

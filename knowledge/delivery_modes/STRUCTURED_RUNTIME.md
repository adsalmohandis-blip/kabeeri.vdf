# Structured Delivery Runtime

Structured Delivery is the Kabeeri runtime for Waterfall-style and enterprise
delivery. It is designed for projects where reliability, traceability,
approved requirements, phase gates, change control, and formal handoff matter
more than sprint-by-sprint discovery.

Runtime state lives in:

```text
.kabeeri/structured.json
.kabeeri/dashboard/structured_state.json
.kabeeri/tasks.json
```

## Runtime Flow

```bash
kvdf structured requirement add --id REQ-001 --title "Email login" --priority high --source questionnaire --acceptance "User can login,Invalid password is rejected"
kvdf structured requirement approve REQ-001 --reason "Owner reviewed"
kvdf structured phase plan phase-001 --requirements REQ-001 --goal "Authentication foundation"
kvdf structured task REQ-001 --task task-001
kvdf structured deliverable add --id deliv-001 --phase phase-001 --title "Authentication specification" --acceptance "Owner approved"
kvdf structured deliverable approve deliv-001
kvdf structured risk add --id risk-001 --phase phase-001 --severity high --title "OAuth provider limit" --mitigation "Fallback email login"
kvdf structured risk mitigate risk-001 --mitigation "Fallback documented"
kvdf structured gate check phase-001
kvdf structured phase complete phase-001
kvdf structured health
kvdf validate structured
```

## Record Types

- Requirements define approved scope, acceptance criteria, owners,
  workstreams, apps, dependencies, risks, and task traceability.
- Phases group approved requirements into controlled delivery units with
  entry criteria, exit criteria, deliverables, dependencies, and gate status.
- Milestones mark formal dates or scope checkpoints.
- Deliverables represent approved documents, specs, builds, reports, or
  client-facing artifacts.
- Change requests make scope movement explicit instead of silently changing
  approved requirements.
- Risks track high-impact delivery, compliance, security, integration, or
  operational concerns.
- Gates evaluate whether a phase can close safely.

## Enterprise Rules

- A phase cannot be planned from unapproved requirements unless `--force` is
  used.
- A requirement should not become implementation work until it is approved.
- Phase completion runs a gate check.
- Phase gates block unresolved high/critical risks.
- Phase gates block unapproved deliverables.
- Phase gates block requirements without measurable acceptance criteria.
- Approved requirements should be converted into governed tasks using
  `kvdf structured task <requirement-id>`.
- Structured tasks keep `source: structured_requirement` and
  `source_reference: requirement:<id>` for traceability.

## Live Structured State

`kvdf structured health` writes:

```text
.kabeeri/dashboard/structured_state.json
```

The dashboard also exposes:

```text
/__kvdf/api/structured
```

The live state includes:

- requirements and approval counts
- requirements with governed tasks
- phase status and gate status
- blocked gates
- open high/critical risks
- proposed change requests
- traceability gaps
- action items

## Relationship To Agile

Structured and Agile share Kabeeri governance, task tracking, app boundaries,
workstreams, access tokens, acceptance, policy gates, AI usage, handoff, and
release checks.

They differ in planning:

- Structured plans scope through approved requirements and phases.
- Agile plans scope through backlog items, stories, sprints, reviews, and
  retrospectives.

Do not mix both modes casually inside one project. If a project uses
Structured Delivery, treat changes as controlled change requests or extensions.

# v3.1.0 - Collaboration Identity and Role Model

Goal: allow multiple human developers and AI Developers to work on the same Kabeeri project without losing traceability or ownership boundaries.

## Identity Files

`.kabeeri/developers.json` stores human developers.

`.kabeeri/agents.json` stores AI Developers and service agents.

Each identity should include:

- `id`
- `type`: `human`, `ai_developer`, or `service_agent`
- `display_name`
- `role`
- `workstreams`
- `status`: `active`, `inactive`, `suspended`
- `created_at`
- `created_by`
- `last_activity_at`

## Role Model

Supported roles:

- Owner
- Maintainer
- Reviewer
- Backend Developer
- Frontend Developer
- Admin Frontend Developer
- Business Analyst
- AI Developer
- Viewer

See [roles_matrix.md](roles_matrix.md) for permissions.

## Workstream Ownership

Supported workstreams:

- backend
- public_frontend
- admin_frontend
- database
- docs
- qa

See [workstream_ownership.md](workstream_ownership.md) for ownership rules.

## Issues

1. Define collaboration identity model  
   Labels: `multi-ai`, `permissions`, `priority-high`

2. Define role and permission model  
   Labels: `permissions`, `multi-ai`, `priority-high`

3. Add workstream ownership rules  
   Labels: `multi-ai`, `task-governance`, `priority-medium`

## Acceptance Criteria

- Every developer/agent has a unique ID.
- Identity changes are traceable in audit log.
- Role matrix exists.
- Exactly one Owner exists.
- Workstream rules prevent overlap.


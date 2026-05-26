# Evolution Assignment Bridge

The Evolution assignment bridge connects the framework-owner and developer
priority pipeline to `multi_ai_governance` so the active Evolution priority can
be translated into a safe, master-led task assignment plan.

## What It Does

- Reads the active Evolution priority and temporary queue.
- Reviews the five governance cases for open conflicts or approval pressure.
- Selects a leader AI and one or more worker AIs when safe.
- Keeps the master laptop as the canonical output owner.
- Keeps GitHub push authority on the master laptop only.
- Records the assignment plan under `.kabeeri/multi_ai_governance/`.
- Surfaces a master status summary with active, stale, recovered, pending, and
  completed counts.
- Surfaces a session health indicator so the master view can distinguish
  healthy, attention, and recovery states at a glance.

## Commands

- `kvdf multi-ai evolution status`
- `kvdf multi-ai evolution assign`
- `kvdf multi-ai evolution workflow`
- `kvdf multi-ai evolution status --json` for the machine-readable master
  summary

## Safety Rules

- Block distribution if any governance case reports active conflicts.
- Require owner approval for high-risk assignment plans.
- Fall back to master-only execution when no safe worker split exists.
- Do not let workers self-approve, self-push, or bypass leases.

## Runtime State

- `.kabeeri/multi_ai_governance/evolution_assignments.json`

## Result

The bridge does not replace Evolution or the five governance cases. It simply
turns the current Evolution priority into a coordinated assignment plan that
fits the existing `multi_ai_governance` authority model.

For day-to-day operation, use `kvdf multi-ai evolution workflow` to print the
master checklist and worker prompt for the current assignment before handing
work to the second laptop.

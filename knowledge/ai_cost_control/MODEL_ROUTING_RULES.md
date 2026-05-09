# Model Routing Rules

Model routing chooses the cheapest safe model class for a task.

Kabeeri does not hard-code provider pricing. Routing reads configured pricing rules from `.kabeeri/ai_usage/pricing_rules.json` or example pricing files.

## Model Classes

- `local_or_template`: no external AI, use local rules/templates.
- `cheap`: classification, extraction, small summaries, label suggestions.
- `balanced`: normal docs/spec work, moderate code explanation, task breakdown.
- `premium`: complex implementation, architecture review, security-sensitive analysis, high-risk debugging.
- `human_only`: secrets, legal approval, publish approval, Owner verification.

## Routing Rules

- Use `local_or_template` when the repo already has a template.
- Use `cheap` for intent classification, task labels, and summarizing small docs.
- Use `balanced` for standard implementation planning and documentation synthesis.
- Use `premium` only when complexity, ambiguity, or risk justifies it.
- Use `human_only` for final Owner verify, publish decisions, and secret handling.

## Override Rules

Owner can override routing with a reason. Overrides must be logged with task ID, actor, selected model class, estimated cost, and rationale.


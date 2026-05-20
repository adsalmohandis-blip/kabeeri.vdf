# KVDF Planner Evolution Prompt Template

## Context

- Repo: `kabeeri.vdf`
- Track: `framework_owner`
- Delivery mode: `direct_main`
- Owner is the only active KVDF Core developer
- Planning method: `{{planning_method}}`
- Method reason: `{{method_reason}}`
- Docs status: `{{docs_status}}`
- Review warnings: `{{review_warnings}}`
- Source control: `{{source_control}}`
- Stop condition: `{{stop_condition}}`

## Goal

{{goal}}

## Scope

### Allowed files

{{allowed_files}}

### Forbidden files

{{forbidden_files}}

## Implementation Tasks

{{implementation_tasks}}

## Validation

{{validation_commands}}

## Commit

git add -A
git commit -m "feat: add KVDF planner layer MVP"
git push origin main

## Stop Condition

{{stop_condition}}

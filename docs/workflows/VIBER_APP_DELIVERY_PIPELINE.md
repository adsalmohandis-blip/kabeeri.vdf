# Viber App Delivery Pipeline

The Viber App Delivery Pipeline is the gated path from a raw app idea to
Codex execution. It is file-first and local-first by default, and it does not
allow code execution until the planning artifacts are ready.

## Core Rule

Raw ideas do not go straight to execution.

The pipeline is ordered and gated. The canonical stage order is:

1. idea
2. questionnaire_generation
3. questionnaire_answers
4. answer_completeness_check
5. brief_generation
6. brief_review
7. brief_approval
8. state_resync
9. current_state_report
10. app_boundary
11. documentation_architecture
12. documentation_folders
13. documentation_files
14. system_design
15. database_design
16. ui_ux_design
17. source_control_plan
18. security_plan
19. version_plan
20. evolutions
21. evolution_order_validation
22. task_punches
23. task_punch_review
24. approval
25. materialization
26. codex_prompt
27. security_gate
28. handoff_gate
29. source_control_gate
30. execution
31. validation
32. security_scan
33. handoff
34. dashboard_update
35. learning_capture
36. closeout

Planning methods share the same order:

- structured: full foundation first for enterprise, security-heavy, or integration-heavy work
- agile: lighter docs per iteration, but no raw-idea execution and no skipped gates
- hybrid: the default for full app/product work, with a structured foundation and agile slices after approval

No answers = no real planning.
No approved brief = no evolutions.
No approved evolutions = no task punches.
No valid evolution order = no task punches.
No materialized task punch = no Codex execution.

## Documentation Layers

Viber app planning uses two documentation layers that must stay aligned:

- Portable App Docs Package
- Planner Foldered Docs Package

The portable app docs package is the canonical long-term product knowledge
surface. It lives in the app workspace and uses the numbered portable
documentation sequence.

The planner foldered docs package is the stage-driven planning surface. It
lives under `workspaces/apps/<app-slug>/docs/<category>/` and is used to plan,
materialize, stage, review, and approve readiness before implementation.

`documentation_folders` is the primary planner output. `documentation_files`
is a derived compatibility list for older surfaces and summaries.

Planner foldered docs map back to the portable package through the portable
docs mapping. That lets the app keep the canonical numbered package intact
while still supporting stage-driven planning and review.

## Docs And Design Gates

The Viber pipeline now exposes explicit docs/design readiness gates for:

- documentation architecture
- documentation folders
- documentation files
- system design
- database design
- UI/UX design
- version plan

These gates are enforced before version approval, evolutions, task punches,
materialization, and execution. If the docs/design gates are blocked, the
pipeline must stop at the next docs/design stage instead of jumping to code
execution.

Structured planning requires the full docs/design foundation unless a gate is
explicitly marked not applicable. Agile planning can defer heavy docs only when
that deferral is explicit and safe. Hybrid planning keeps the same gate order
but usually needs the structured foundation before the first execution slice.

## Source Of Truth

For Viber/App Track:

1. Current app docs, requirements, manifests, specs, configs, source tree, and tests
2. Local Git history if available
3. Release/tag history if available
4. Remote provider history only if enabled
5. `.kabeeri/` runtime state as supporting state only
6. Chat history as supporting context only

GitHub is optional and never required for state authority.

## Source Control Modes

Supported modes:

- local_only
- direct_main
- branch
- branch_pr

Rules:

- `local_only` does not require commit, push, branch, or PR.
- `direct_main` can validate, then commit and push to `main` after approval.
- `branch` can create and push a branch, but PR remains optional.
- `branch_pr` can create a branch, push it, and prepare a PR with review and
  handoff gates.
- GitHub language appears only when the remote provider or provider plugin is
  GitHub.
- Future providers remain possible.

## Workflow Bridge

Planner docs materialize the foldered package.
Planner docs status reports whether the planned docs are present.
Planner docs apply-stage marks a foldered doc as applied to the current stage.
Planner docs review checks whether the app is ready for the next execution
step.

The current-state report, design docs, version plan, evolutions, task punches,
approval, materialization, and security gates must all be ready before Codex
execution is allowed.

The pipeline also enforces a version-and-evolution gate sequence after docs
and design readiness:

- version plan approval comes before evolutions
- approved evolutions come before task punches
- evolution order validation comes before task punches
- task punch review comes before materialization
- materialization comes before Codex execution

The pipeline also enforces final execution gates before any Codex run:

- security gate comes before execution
- handoff gate comes before execution and handoff
- source-control gate is mode-driven and optional in local-only mode
- validation gate lists the expected validation commands but does not pass before execution
- warning-level execution gates still block by default unless the Owner explicitly approves them

The pipeline also exposes a planning authority level:

- placeholder: raw idea or incomplete questionnaire / brief state
- draft: questionnaire answers exist and the brief is in review
- approved: the brief is approved, the order is valid, task punches are
  materialized, and execution gates pass

## What The Pipeline Must Not Do

- It must not let raw ideas jump directly into code execution.
- It must not treat `documentation_files` as the only docs model.
- It must not replace the portable app docs package.
- It must not require GitHub.
- It must not make branch or PR the default delivery shape.
- It must not let Viber/App work edit KVDF Core files by default.
- It must not let version or evolution planning skip the approval and review
  gates.

## Task Archive Confirmation

Viber tasks are not archived automatically after closure.

When a Viber task reaches `done`, `completed`, or `closed`, it stays in
closure until the Viber explicitly requests archive/trash.

Archive/trash requires explicit Viber confirmation.

Task trash is recoverable until retention expires. Default retention is 30 days.

Both the JSON output and the human-readable lifecycle output must show the
archive policy, the retention warning, and the 30-day trash window before a
Viber task is moved into trash.

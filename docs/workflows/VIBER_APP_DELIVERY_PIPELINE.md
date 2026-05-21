# Viber App Delivery Pipeline

The Viber App Delivery Pipeline is the gated path from a raw app idea to
Codex execution. It is file-first and local-first by default, and it does not
allow code execution until the planning artifacts are ready.

## Core Rule

Raw ideas do not go straight to execution.

The pipeline must progress through:

1. State Resync
2. Current-State Report
3. Documentation Files and Folders
4. System Design
5. Database Design
6. UI/UX Design
7. Visual Planning
8. Version Plan
9. Evolutions
10. Task Punches
11. Approval
12. Materialization
13. Codex Prompt
14. Task Execution
15. Validation
16. Security Scan
17. Handoff
18. Dashboard Update
19. AI Learning Capture

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

## What The Pipeline Must Not Do

- It must not let raw ideas jump directly into code execution.
- It must not treat `documentation_files` as the only docs model.
- It must not replace the portable app docs package.
- It must not require GitHub.
- It must not make branch or PR the default delivery shape.
- It must not let Viber/App work edit KVDF Core files by default.


# KVDOS V1 Implementation Punch

Updated: 2026-05-22

Branch: `docs/kvdos-v1-ide-studio-expanded-implementation-map`

Status: implementation roadmap only

This document defines the real KVDOS v1 implementation slices only.
KVDOS Studio is being expanded into a workspace-based AI IDE.
It stays app-local to `workspaces/apps/kvdos/`.
It does not authorize code changes by itself.
It does not hide the Viber/App delivery gates.
It does not start implementation on its own.

## Product Direction

KVDOS Studio must become a workspace-based AI IDE.

It must:
- hide KVDOS internal source/product files by default
- open user folders, applications, and workspaces like VS Code
- show workspace applications, not KVDOS internals
- provide a terminal panel
- provide an AI Workbench with multiple chat boxes
- preview HTML, Markdown, and Mermaid reports like a browser
- provide a KVDOS health dashboard
- provide a workspace applications dashboard
- provide a plugin center / marketplace shell
- capture programming-language context and errors
- provide a Problems / Errors panel
- convert captured errors into governed tasks
- provide logs, audit, and trace views
- provide a patch/diff review panel
- provide a command palette
- provide a secrets/privacy guard
- provide a resource/activity monitor

## Viber Pipeline Gate Requirement

This roadmap is not execution approval.

Every `impl-*` slice must be reviewed and executed only through the
Viber/App delivery pipeline gates:

1. questionnaire answers and approved brief before real planning
2. docs/design readiness before version/evolution approval
3. version plan before evolutions
4. evolution order validation before task punches
5. task punch review and materialization before Codex execution
6. security, handoff, and source-control gates before implementation
7. validation and security scan before handoff
8. dashboard update and learning capture before closeout

No implementation branch may start from this roadmap alone.
Each slice requires Owner approval and the relevant Viber pipeline readiness
evidence.

## Implementation Order

1. `impl-0` Implementation Baseline And Guardrails
2. `impl-1` Local IDE Studio Shell Skeleton
3. `impl-2` Studio Navigation Scaffold
4. `impl-3` Workspace-Based IDE Model
5. `impl-4` Open Folder / Open Workspace Flow
6. `impl-5` Recent Workspaces + Project Registry
7. `impl-6` Selected Workspace Context
8. `impl-7` Studio Landing Canvas
9. `impl-8` Empty-State Orchestration
10. `impl-9` Command Palette Shell
11. `impl-10` Local Runtime State Skeleton
12. `impl-11` Workspace Persistence Layer
13. `impl-12` `.kvdos` Workspace Surface
14. `impl-13` App State Validation
15. `impl-14` Workspace Explorer / File Surface
16. `impl-15` Discovery Questionnaires Surface
17. `impl-16` Spec Blueprint Surface
18. `impl-17` Tasking Surface
19. `impl-18` Approval Surface
20. `impl-19` Task / Approval Persistence
21. `impl-20` Reports Dashboard
22. `impl-21` Terminal Panel Shell
23. `impl-22` Preview Browser / HTML Report Viewer
24. `impl-23` AI Workbench Multi-Chat Shell
25. `impl-24` AI Tool Session Model
26. `impl-25` Problems / Errors Panel
27. `impl-26` Context & Error Capture Engine
28. `impl-27` Error-To-Task Conversion
29. `impl-28` Logs / Trace / Audit Viewer
30. `impl-29` Patch / Diff Review Panel
31. `impl-30` KVDOS Health Dashboard
32. `impl-31` Workspace Applications Dashboard
33. `impl-32` Plugin Center Shell
34. `impl-33` Marketplace Catalog Shell
35. `impl-34` Plugin Safety + Permissions Boundary
36. `impl-35` Cloud Account Shell
37. `impl-36` Authentication Session Flow
38. `impl-37` Subscription Entitlement Wiring
39. `impl-38` Device Activation Flow
40. `impl-39` Local License Gate Enforcement
41. `impl-40` Release Access Controls
42. `impl-41` Safety Gate Surface
43. `impl-42` Quality Gate Surface
44. `impl-43` Execution Approval Flow
45. `impl-44` Local Runner Skeleton
46. `impl-45` Approved Execution Loop
47. `impl-46` Desktop Build Pipeline
48. `impl-47` Release Packaging + Update Strategy
49. `impl-48` KVDOS Adapter Boundary And V1 Hardening
50. `impl-49` V1 QA, Release Candidate, And Launch Handoff

## Foundation And Expansion Notes

This roadmap expands the Studio direction from a shell into a
workspace-based AI IDE.

The early slices focus on:

- Studio shell and navigation
- workspace-based IDE model and open-folder flow
- recent workspaces and selected workspace context
- landing canvas, empty state, and command palette

The middle slices focus on:

- local runtime state and workspace persistence
- `.kvdos` workspace surface and validation
- workspace explorer and report previewing
- discovery, spec, tasking, approval, and task persistence

The later slices focus on:

- reports, terminal, AI Workbench, problems, capture, and task conversion
- logs, trace, audit, patch review, health, and workspace dashboards
- plugin center, marketplace shell, and safety / permissions boundaries
- cloud commercial, auth, subscription, activation, and license gates
- release access, safety, quality, execution, packaging, adapter hardening,
  and launch handoff

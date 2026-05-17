# Task Executor Contract

Contract ID: task-executor-contract-1778971693410
Generated at: 2026-05-16T22:48:13.410Z
Surface role: executor
Status: ready
Message: Executor contract compiled for packet task-packet-1778971693150.
Packet ID: task-packet-1778971693150
Packet state path: docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json
Current task: task-063
Executor role: implementation_worker
Planner role: control_plane

Allowed actions:
- read packet
- inspect allowed files
- edit allowed files
- record evidence
- return next action

Forbidden actions:
- change task priority
- invent new task scopes
- edit files outside the allowed list
- bypass tokens or locks
- replan the workflow

Packet hints:
- Recommended assignee: codex
- Next action: kvdf task assign task-063 --assignee codex
- Next command: kvdf task assign task-063 --assignee codex

Allowed files:
- src/cli/index.js
- src/cli/ui.js
- docs/cli/CLI_COMMAND_REFERENCE.md

Contract points:
- The AI executor is a worker that consumes a packet.
- The control plane owns planning, packet creation, and task ordering.
- The executor only acts inside approved task boundaries and allowed files.
- The executor returns evidence and the next action instead of inventing new scope.

Control-plane packet summary:
  # Task Control Plane Packet
  
  Next exact action: kvdf task assign task-063 --assignee codex
  
  Packet ID: task-packet-1778971693150
  Generated at: 2026-05-16T22:48:13.161Z
  Surface role: control_plane
  Current change: evo-099
  Status: ready
  Message: Compiled a deterministic control-plane packet for 7 execution candidate(s).
  Packet state path: docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json
  Recommended assignee: codex
  
  Summary:
  - Total tasks: 69
  - Approved tasks: 7
  - Ready tasks: 7
  - In progress tasks: 0
  - Proposed tasks: 0
  - Execution candidates: 7
  - First candidate: task-063
  
  Source snapshot:
  - Vibe intent: intent-004 | ابدأ تطوير | type=create_task | risk=low
  - Questionnaire answers: 25 answer(s), 25 confirmed
  - Brief: brief-1778788879920 | intent=intent-004 | suggestions=6 | open_tasks=10
  - Task synthesis: none
  - Blueprints: unknown | modules=0/0/0
  - Data design: 0 module(s), 0 entity(s)
  - Delivery: unknown | selected
  - Traceability: brief:brief-1778788879920 -> questionnaire:questionnaire-intake-1778790943730 -> modules:module-plan-1778790943729 -> delivery:delivery-map-1778790943730 -> complete
  
  Assumptions:
  - The CLI owns planning and packet compilation.
  - The AI executor should consume the packet instead of inventing the work plan.
  - Approved or ready tasks are the execution candidates for the packet.
  - Latest vibe intent is: ابدأ تطوير.
  - There are 7 execution-ready task(s) in the tracker.
  
  Expected outputs:

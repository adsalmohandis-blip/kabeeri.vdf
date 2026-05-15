# KVDF Dev System

This bundle packages the framework-development side of KVDF as a removable
plugin so KVDF itself stays separate from app-building plugins and app-track
workflows.

Use it when you need to work on:

- Evolution Steward priorities
- framework-only governance
- CLI/runtime changes for KVDF itself
- control-plane packet compilation before execution
- packet-only executor contract compilation
- batch execution of ready KVDF tasks
- plugin and capability split rules

Common entry points:

- `kvdf evolution`
- `kvdf evolution priorities`
- `kvdf evolution batch-exe`
- `kvdf task packet`
- `kvdf task executor-contract`
- `kvdf batch-exe`
- `kvdf task batch-run`
- `kvdf plugins install kvdf-dev`
- `kvdf plugins enable kvdf-dev`
- `kvdf plugins uninstall kvdf-dev`
- `kvdf plugins disable kvdf-dev`

`kvdf task batch-run` is the plugin-owned task execution helper. It walks approved or ready
tasks in governed priority order, auto-assigns missing tasks to the active Multi-AI leader or
`codex` fallback, starts each task until a blocker appears, and writes a durable report to
`.kabeeri/reports/task_batch_run.json`.

`kvdf task packet` compiles a durable control-plane packet from vibe intake, questionnaire
answers, briefs, module breakdowns, traceability chain state, and approved task state before
execution starts. The packet is written to `docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json`
and can be previewed without re-reading chat history.

`kvdf task executor-contract` turns that packet into a packet-only AI boundary report that
lists allowed files, allowed actions, forbidden actions, and the exact next-command hints the
AI worker must follow. The contract is written to
`docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json`.

`kvdf task batch-run` can run in `--mode dry-run` to preview the packet, `--mode review` to
preview the packet and executor contract, or `--mode execute` to start tasks in governed
priority order.

The app-building side remains in the app track and in app plugins such as
`ecommerce-builder` and `booking-builder`.

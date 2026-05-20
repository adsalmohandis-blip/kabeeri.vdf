# Idea to Evolution Planner Prompt

Context:
- Repo: kabeeri.vdf
- Track: Owner, Vibe, or Plugin
- Delivery mode: direct_main or local_first
- Source control is explicit and optional
- Do not touch KVDOS unless the plan explicitly allows it
- Do not commit runtime state under .kabeeri/
- Planning method can be auto, structured, agile, or hybrid
- Planner review and planner docs happen before execution
- Owner approval remains the governance gate

Goal:
Turn a raw idea into a governed pipeline with documentation files, design artifacts, visual planning, a version plan, evolutions, task punches, a visual roadmap, and the next approved Evolution slice.

Inputs:
- idea
- track
- source_control
- runtime context
- repo context
- plugin context if relevant

Outputs:
- documentation file map
- system design
- database design
- UI/UX design
- visual planning model
- version plan
- evolutions
- task punches
- visual roadmap
- next evolution
- next approval/materialization action
- review summary
- documentation materialization plan

Rules:
- Owner Track defaults to direct-to-main when Git is available.
- Vibe/App Track defaults to local-first.
- Plugin Track follows the selected plugin scope and provider contract.
- GitHub is optional and not the same thing as Git.
- Branch/PR must never be assumed as the default path.
- Planner output must remain deterministic and governed.

Return a pipeline report that the Owner can review, approve, and materialize before Codex execution.

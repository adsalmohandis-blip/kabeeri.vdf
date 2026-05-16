Kabeeri Scorecards

Generated at: 2026-05-16T00:36:30.342Z
Status: ready
Average score: 4.27
Strong: 3 | Watch: 3 | Needs attention: 0
Evolution plans materialized: 0
Scorecards are review-only by default: yes

Card              Score  Band    Risk    Suggested Evolution ID          Next action                                                                                              
----------------  -----  ------  ------  ------------------------------  ---------------------------------------------------------------------------------------------------------
architecture      4.6    strong  medium  evo-scorecard-architecture      Create a follow-up plan that trims legacy aliases and keeps the contract layer as the source of truth.   
ai_usability      4.4    watch   medium  evo-scorecard-ai_usability      Expand machine-readable next-action fields and keep the contract registry aligned with command behavior. 
plugin_system     4.5    strong  low     evo-scorecard-plugin_system     Review plugin bundles for any missing business-type, schema, or test coverage.                           
task_governance   4.7    strong  low     evo-scorecard-task_governance   Re-check packet, contract, coverage, and completion reports after any task-system change.                
docs_consistency  3.6    watch   medium  evo-scorecard-docs_consistency  Treat docs generation as a governed output of the CLI contract rather than a separate copy-paste surface.
maintainability   3.8    watch   medium  evo-scorecard-maintainability   Continue extracting repeated command logic into service modules before adding more surface area.         

Evidence and notes:
- architecture: The two-track model, foldering contract, pipeline guards, and task-control surfaces already make Kabeeri structurally strong.
  Weakness: Compatibility aliases, legacy paths, and many report surfaces still make the architecture harder to read than it should be.
  Evidence: docs/SYSTEM_CAPABILITIES_REFERENCE.md documents the track split and shared platform layer. | docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md defines the repository foldering contract. | src/cli/services/pipeline_guard.js enforces the fail-closed pipeline.
- ai_usability: The CLI already gives the AI a command contract, `next_exact_action` fields, and JSON outputs that are easy to consume.
  Weakness: Some commands still expose different phrasing or multiple aliases, which makes the AI loop less uniform than it could be.
  Evidence: src/cli/services/command_registry.js defines the shared operating contract. | src/cli/commands/contract.js and src/cli/commands/resume.js already publish next action guidance. | src/cli/services/pipeline_guard.js renders fail-closed blockers.
- plugin_system: The plugin loader can install, enable, disable, and uninstall removable bundles while keeping plugin state persisted.
  Weakness: The app-builder plugins still need occasional parity work so every bundle feels equally mature and contract-complete.
  Evidence: src/cli/services/plugin_loader.js owns the canonical reversible plugin state. | plugins/booking-builder/ and plugins/ecommerce-builder/ provide mature domain packs. | The newer app-builder plugins now have mode packs, schemas, and smoke tests.
- task_governance: Task packet, executor contract, coverage, lifecycle, and batch execution give Kabeeri a strong governed execution path.
  Weakness: The task model is rich enough that the system must keep state, verification, and archive trails perfectly synchronized to avoid drift.
  Evidence: plugins/kvdf-dev/runtime/task_packet.js compiles the control-plane packet. | src/cli/services/pipeline_guard.js blocks packet and execution paths when prerequisites are missing. | src/cli/services/task_coverage.js and src/cli/commands/task_lifecycle.js keep task state visible.
- docs_consistency: The docs system is broad, and the CLI/docs split is now visible in reports, command reference pages, and capability maps.
  Weakness: The large number of docs layers, historical reports, and compatibility aliases can still drift if they are not generated from shared metadata.
  Evidence: docs/cli/CLI_COMMAND_REFERENCE.md documents the command surface. | docs/SYSTEM_CAPABILITIES_REFERENCE.md acts as the high-level capability map. | docs/reports/ holds historical and execution reports.
- maintainability: A lot of reusable behavior has already been pushed into services, which makes the CLI less monolithic than it used to be.
  Weakness: The command layer is still fairly large, and some ownership boundaries are spread across multiple helper files and reports.
  Evidence: src/cli/services/ contains shared orchestration logic. | src/cli/commands/ still holds a large command surface. | src/core/bootstrap.js and the plugin loader keep the runtime split explicit.

Next actions:
- Review each scorecard as a standalone evaluation artifact.
- Use `kvdf contract` or `kvdf pipeline strict` to inspect the current operating state.
- Re-run `kvdf evolution scorecards` after a major system change to refresh the assessment.
- If you later want to materialize Evolution work from these cards, rerun with `--materialize`.
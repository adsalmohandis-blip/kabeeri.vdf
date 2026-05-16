# KVDF AI and CLI Operating Contract

## Role Split

- AI: Reason over current state, choose the next CLI command, and stay inside the command contract.
- CLI: Validate prerequisites, persist state, write artifacts, and fail closed when something is missing.
- State: Filesystem state under .kabeeri/ and docs/reports/ is the source of truth.

## Operating Principles

- AI reads state, CLI enforces the gate, and files record the result.
- No command should silently guess or auto-skip a missing prerequisite.
- Every write command must explain what it needs and what it produced.
- The next exact action should always be available in the report.
- Blocked paths are useful if they say why they blocked and what to do next.

## Task Control Boundary

- `kvdf task packet` compiles the durable control-plane packet from intake,
  blueprints, and approved task state before execution begins.
- `kvdf task executor-contract` narrows that packet into the packet-only file
  and action boundary for the worker.
- `kvdf task batch-run` starts approved tasks in governed order and stops on
  the first blocker instead of guessing a fallback path.
- `docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json`,
  `docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json`, and
  `.kabeeri/reports/task_batch_run.json` are the source of truth for this
  workflow.

## Session State

- Workspace exists: yes
- Current delivery mode: structured
- Current blueprint: unset
- Questionnaire plan: questionnaire-intake-1778790943730
- Approved or ready tasks: 0
- Packet traceability complete: no
- Next exact action: Data design blocked: select a blueprint first with `kvdf blueprint select <key>`.

## Selected Command

Command         Stage  Purpose                                                       Prerequisites  Outputs  Next commands
--------------  -----  ------------------------------------------------------------  -------------  -------  -------------
None selected.         Run `kvdf contract <command>` to inspect a specific command.                                       

## Command Registry

Command                 Category    Stage           Owner         Purpose                                                                            Next commands                                       
----------------------  ----------  --------------  ------------  ---------------------------------------------------------------------------------  ----------------------------------------------------
resume                  session     entry           shared        Resolve the current workspace, track, and the next exact action.                   kvdf contract, kvdf init, kvdf track status         
init                    workspace   bootstrap       shared        Create the minimum viable workspace state and intake scaffolding.                  kvdf questionnaire plan, kvdf project profile route 
delivery                planning    mode-selection  app-or-owner  Persist whether the work will follow Agile or Structured delivery.                 kvdf questionnaire plan, kvdf blueprint recommend   
project-profile         planning    classification  shared        Classify the project and route the intake flow into the right profile.             kvdf delivery choose, kvdf questionnaire plan       
questionnaire           planning    intake          shared        Collect the missing product facts that shape the app or system.                    kvdf brief, kvdf blueprint, kvdf task packet        
blueprint               design      shape           shared        Translate the intake into concrete structure: pages, modules, data, and UI hints.  kvdf task assessment, kvdf task packet              
task-packet             execution   control-plane   kvdf-dev      Compile the durable execution packet from intake, design, and approved tasks.      kvdf task executor-contract, kvdf task batch-run    
task-executor-contract  execution   boundary        kvdf-dev      Derive the packet-only file/action boundary for the worker.                        kvdf task batch-run --mode execute                  
task-batch-run          execution   execution       kvdf-dev      Start approved tasks in governed order and stop on the first blocker.              kvdf task verify, kvdf task complete                
pipeline                governance  validation      shared        Render and enforce the strict pipeline guard table.                                kvdf contract, kvdf task packet, kvdf task batch-run
plugin                  governance  capability      shared        Control install, enable, disable, and report the plugin loader state.              kvdf plugin status, kvdf contract                   
contract                governance  control-plane   shared        Explain the AI/CLI operating contract and the current next exact action.           kvdf resume, kvdf pipeline strict, kvdf task packet 

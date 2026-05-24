# KVDOS Architecture

> Note: this is the target architecture, not the current shipped feature set.

## Architecture Summary

KVDOS is designed as a hybrid commercial AI Software Factory OS.

```text
KVDOS Cloud
  accounts / billing / licenses / packages / teams
        |
        | optional sync
        v
KVDOS Studio
  UI / approvals / project control / task visibility
        |
        v
KVDOS Runner
  local or cloud execution
        |
        v
KVDOS Core
  kernel / tasks / agents / workspace / sandbox / quality gates
        |
        v
Generated Apps
  backend / frontend / database / tests / docs
```

## First Product Architecture

Do not build the full OS at once.

The first architecture should focus on:

```text
Local Studio
Local Runner
Core task system
app.kvdos.yaml
VDF boundary
```

## Main Layers

### Apps

```text
apps/studio
apps/runner
apps/cloud
```

### Core

```text
core/boot
core/kernel
core/commands
core/events
core/contracts
core/schemas
core/task_system
core/agent_runtime
core/workspace
core/patch_system
core/sandbox
core/security
core/quality_gates
core/vdf_bridge
```

### Cloud Services

```text
cloud_services/licensing
cloud_services/billing
cloud_services/package_registry
cloud_services/marketplace
cloud_services/team_sync
cloud_services/update_server
```

## Runtime Files

```text
.kvdos/
  manifest.json
  app.kvdos.yaml
  discovery/
  blueprint/
  tasks/
  task_queue/
  agents/
  patches/
  approvals/
  audit/
  sandbox/
  learning/
```

## Main Spec

```text
app.kvdos.yaml
```

This file should become the primary product specification for generated applications.

## KVDOS Core Rule

Agents should not mutate project files directly.

The intended execution chain is:

```text
Discovery
→ Blueprint
→ app.kvdos.yaml
→ FIFO Tasks
→ MasterAgent
→ Specialized Agents
→ Patches
→ Sandbox
→ Quality Gates
→ Generated App
→ Learning
→ Evolution
```

## VDF Integration

KVDOS should integrate with Kabeeri VDF in stages:

1. Documentation boundary.
2. GitHub package dependency.
3. CLI bridge.
4. State mapping.
5. Export commands.
6. API bridge.

The first KVDOS foundation should not copy VDF source code.

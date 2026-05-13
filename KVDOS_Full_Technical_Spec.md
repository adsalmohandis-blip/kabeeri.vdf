# KVDOS — Kabeeri Vide Development OS / Kabeeri VDOS

**Document:** KVDOS Full Technical Specification  
**Version:** v2.0  
**Language:** Arabic  
**Purpose:** تحويل كل ما تم نقاشه إلى مستند تنفيذي مفصل لبناء KVDOS كمنتج حقيقي.

---

## Naming

```text
Full Technical Name:
  Kabeeri Vide Development OS

Short System Name:
  KVDOS

Commercial / Brand Name:
  Kabeeri VDOS

CLI:
  kvdos

Main Spec File:
  app.kvdos.yaml

Repository:
  kvdos-platform
```


---

## فهرس المحتويات

1. تعريف KVDOS
2. نطاق المنتج والجمهور المستهدف
3. نموذج المنتج: SaaS + Local Runner + Enterprise
4. التقنية البرمجية واللغات
5. المبادئ غير القابلة للكسر
6. البنية العامة للنظام
7. هيكل الـ Repository الكامل
8. KVDOS Cloud
9. KVDOS Studio
10. KVDOS Runner
11. KVDOS Enterprise
12. Boot Layer
13. Kernel
14. Commands & Events
15. Contracts & Schema Registry
16. State Machine
17. Workflow Orchestrator
18. Saga / Transactions
19. Task System FIFO
20. Master Agent
21. Agent Runtime
22. Specialized Agents
23. Multi-Agent Execution
24. Workspace System
25. Patch System
26. Sandbox System
27. Discovery System
28. KVDOS Spec / IR
29. Learning System
30. Evolution System
31. Package Manager
32. Plugin Runtime
33. Security System
34. Licensing & Subscription Protection
35. Governance
36. Approval System
37. Risk Engine
38. Quality Gates
39. Model Router
40. Cost Manager
41. Privacy System
42. Observability
43. Artifact Registry
44. Traceability
45. Provenance
46. Policy as Code
47. Migration System
48. Feature Flags
49. Safe Mode & Kill Switch
50. Health System
51. Cloud Services
52. Database Design
53. API Design
54. UI Screens
55. CLI Commands
56. Generated Apps Structure
57. Knowledge Packs
58. Golden Projects
59. Testing Strategy
60. SDK
61. MVP Scope
62. Implementation Tickets
63. Roadmap
64. Risks and Mitigations
65. Final Operating Rules

---

# 1. تعريف KVDOS

KVDOS هو **نظام تشغيل تطبيقي لبناء البرمجيات بالذكاء الاصطناعي**.

هو ليس نظام تشغيل hardware-level مثل Linux أو Windows، وليس مجرد chatbot يكتب كودًا، بل منصة داخلية تعمل كـ **AI Software Factory OS**.

المعادلة الأساسية:

```text
User Idea
  ↓
Discovery Questions
  ↓
Blueprint
  ↓
app.kvdos.yaml
  ↓
Task Planner
  ↓
FIFO Task Queue
  ↓
Master Agent
  ↓
Specialized Agents
  ↓
Patches
  ↓
Build / Test / Security Review
  ↓
Generated App
  ↓
Post-Project Learning
  ↓
Evolution System
```

الهدف:

```text
تحويل فكرة المستخدم إلى تطبيق كامل قابل للتشغيل، مع تحليل، تصميم، كود، اختبارات، توثيق، ونشر.
```

---

# 2. نطاق المنتج والجمهور المستهدف

## 2.1 الجمهور الأساسي

### Software Agencies

الجمهور الأول المقترح.

أسباب الاستهداف:

- يبنون تطبيقات متكررة.
- يحتاجون تسريع التحليل.
- يحتاجون boilerplate أقل.
- لديهم مشاريع CRUD/Admin/SaaS متشابهة.
- يمكنهم الدفع إذا وفّر النظام وقتًا حقيقيًا.

أمثلة تطبيقاتهم:

```text
CRM
Clinic Management
Inventory Management
School Management
Booking System
Accounting System
Restaurant Management
Admin Dashboard
SaaS MVP
```

## 2.2 الجمهور الثاني

### Startups / Founders

يستخدمون KVDOS لبناء MVP، لكن يجب ضبط التوقعات:

```text
KVDOS لا ينتج منتجًا سحريًا بلا مراجعة.
KVDOS يبني MVP منظمًا قابلًا للمراجعة والتطوير.
```

## 2.3 الجمهور الثالث

### Enterprise Internal Tools Teams

احتياجاتهم:

```text
Self-hosted
Private knowledge base
SSO
Audit logs
Strict policies
Offline license
Local model mode
No cloud code sharing
```

---

# 3. نموذج المنتج: SaaS + Local Runner + Enterprise

## 3.1 أفضل نموذج

```text
SaaS-first for distribution
+ Local Runner for privacy
+ Enterprise self-hosted later
```

## 3.2 KVDOS Cloud

مسؤول عن:

- الحسابات
- الاشتراكات
- الخطط
- التراخيص
- Marketplace
- Package Registry
- Signed Updates
- Team Workspaces
- Cloud Runner optional
- Billing

## 3.3 KVDOS Studio

واجهة استخدام:

- Local Web App
- Desktop App لاحقًا عبر Tauri
- يعرض Projects, Tasks, Agents, Logs, Files, Approvals

## 3.4 KVDOS Runner

هو منفذ العمل الحقيقي.

أنواع:

```text
Cloud Runner:
  يعمل على بنية KVDOS السحابية.

Local Runner:
  يعمل على جهاز العميل أو سيرفره.

Enterprise Runner:
  يعمل داخل شبكة الشركة.
```

## 3.5 لماذا ليس SaaS فقط؟

لأن KVDOS يتعامل مع:

```text
كود حساس
وثائق عملاء
مفاتيح API
ملفات مشاريع
Docker builds
بيانات تجارية
```

لذلك النموذج الهجين أفضل:

```text
تجربة SaaS سهلة
+
تنفيذ محلي عند الحاجة
```

---

# 4. التقنية البرمجية واللغات

## 4.1 واجهة المستخدم

```text
TypeScript + React / Next.js
```

الاستخدام:

- Dashboard
- Task Queue UI
- Agent Activity
- Blueprint Viewer
- Spec Viewer
- File Explorer
- Logs
- Approvals
- Package Manager

## 4.2 Desktop Shell

```text
Tauri + Rust
```

الاستخدام:

- Desktop wrapper
- Secure local daemon
- License verification
- Signed update verification
- Integrity checks
- Local runner control

## 4.3 Local Backend

```text
Python + FastAPI
```

الاستخدام:

- Agent Runtime
- Task Queue
- Learning System
- Sandbox orchestration
- LLM API calls
- Project APIs

## 4.4 Secure Core

```text
Rust
```

للأجزاء الحساسة:

- License verifier
- Integrity checker
- Update verifier
- Token storage
- Tamper detection

## 4.5 Cloud Backend

```text
FastAPI أو Go
```

الاستخدام:

- Licensing
- Billing
- Package Registry
- Update Server
- Team Sync
- Cloud Runner Orchestration

## 4.6 Database

```text
MVP Local:
  SQLite

SaaS / Team:
  PostgreSQL

Vector Search:
  pgvector أو Qdrant لاحقًا
```

## 4.7 Queue

```text
MVP:
  SQLite-backed FIFO queue

Next:
  Redis + RQ أو Celery

Advanced:
  Temporal للـ workflows طويلة ومعقدة
```

## 4.8 Sandbox

```text
Docker
```

## 4.9 AI Layer

```text
OpenAI API كبداية
Model Router
Embeddings
Local models لاحقًا
```

## 4.10 First Generated Stack

```text
Frontend: React + TypeScript
Backend: FastAPI
Database: PostgreSQL
Deployment: Docker Compose
Auth: JWT + RBAC
UI: Tailwind/shadcn-style components
```

---

# 5. المبادئ غير القابلة للكسر

```text
1. app.kvdos.yaml هو مصدر الحقيقة.
2. لا Agent يعمل بدون Task.
3. كل Task تأتي من التحليل أو من Task سابقة.
4. Task Queue تعمل FIFO مع Dependencies.
5. MasterAgent ينسق ولا يكتب الكود.
6. Agents تنتج Patches فقط.
7. Patch Manager هو بوابة الدمج.
8. Sandbox يشغل الكود.
9. Quality Gates تمنع التسليم الرديء.
10. Learning System هو الذاكرة الدائمة.
11. Agent memory مؤقتة.
12. Evolution System لا يعدل Core مباشرة.
13. كل Package يجب أن تكون موقعة.
14. كل Update يجب أن يكون موقّعًا.
15. لا أسرار داخل العميل.
16. لا secrets ترسل للـ LLM.
17. أي خطر يحتاج Approval.
18. كل شيء Audit-able.
19. Rollback مطلوب للتحديثات.
20. Local Runner يحمي خصوصية الكود.
```

---

# 6. البنية العامة للنظام

```text
+------------------------------------------------------+
| KVDOS Cloud                                          |
| Accounts / Billing / Licenses / Packages / Teams     |
+------------------------------------------------------+
                         |
                         | optional sync
                         |
+------------------------------------------------------+
| KVDOS Studio                                         |
| UI / Dashboard / Approvals / Project Control         |
+------------------------------------------------------+
                         |
                         |
+------------------------------------------------------+
| KVDOS Runner                                         |
| Local or Cloud execution                             |
+------------------------------------------------------+
                         |
+------------------------------------------------------+
| Core                                                 |
| Kernel / Tasks / Agents / Workspace / Sandbox        |
+------------------------------------------------------+
                         |
+------------------------------------------------------+
| Generated Apps                                       |
| Backend / Frontend / DB / Tests / Docs               |
+------------------------------------------------------+
```

---

# 7. هيكل الـ Repository الكامل

```text
kvdos-platform/
  README.md
  LICENSE.md
  CONTRIBUTING.md

  product/
  docs/
  system_constitution/

  apps/
    cloud/
    studio/
    runner/
    enterprise/

  core/
    boot/
    kernel/
    commands/
    events/
    contracts/
    schemas/
    state_machine/
    workflows/
    transactions/
    task_system/
    agent_runtime/
    agents/
    multi_agent_runtime/
    discovery_system/
    spec_system/
    learning_system/
    evolution_system/
    package_manager/
    plugin_runtime/
    workspace/
    patch_system/
    sandbox/
    security/
    governance/
    approval_system/
    risk_engine/
    quality_gates/
    model_router/
    cost_manager/
    observability/
    privacy/
    rollback/
    artifact_registry/
    traceability/
    provenance/
    policy/
    migrations/
    dependency_map/
    feature_flags/
    health/
    integration_bus/

  cloud_services/
    licensing/
    billing/
    package_registry/
    marketplace/
    update_server/
    team_sync/
    cloud_runner/

  generated_apps/
  packages/
  knowledge_packs/
  templates/
  golden_projects/
  tests/
  sdk/
  scripts/
```

---

# 8. KVDOS Cloud

## 8.1 Structure

```text
apps/cloud/
  frontend/
    app/
    components/
    pages/
    dashboard/
    billing/
    marketplace/
    team/
    projects/
    runners/
    settings/

  backend/
    main.py
    routes/
      auth.py
      billing.py
      licenses.py
      packages.py
      marketplace.py
      teams.py
      projects.py
      runners.py
      updates.py
    services/
      auth_service.py
      license_service.py
      billing_service.py
      package_service.py
      team_service.py
      runner_service.py
    db/
      models.py
      migrations/
```

## 8.2 مسؤوليات Cloud

```text
User accounts
Subscription plans
License tokens
Package registry
Marketplace
Team management
Runner registration
Update distribution
Signed package delivery
Billing
Usage tracking
```

## 8.3 Cloud API أمثلة

```http
POST /auth/login
POST /auth/logout
GET  /me

GET  /billing/plans
POST /billing/subscribe
GET  /billing/subscription

POST /licenses/activate
POST /licenses/refresh
GET  /licenses/entitlements

GET  /packages
GET  /packages/{id}
POST /packages/{id}/download

POST /runners/register
GET  /runners/{id}/status

GET  /updates/latest
```

---

# 9. KVDOS Studio

## 9.1 Structure

```text
apps/studio/
  desktop/
    src-tauri/
      src/
        main.rs
        license.rs
        updater.rs
        integrity.rs
        runner_control.rs
        secure_store.rs
      tauri.conf.json

  ui/
    app/
      dashboard/
      discovery/
      blueprint/
      spec/
      tasks/
      agents/
      files/
      logs/
      approvals/
      learning/
      packages/
      settings/
      billing/
    components/
      TaskCard.tsx
      AgentStatus.tsx
      FileExplorer.tsx
      LogViewer.tsx
      BlueprintViewer.tsx
      SpecViewer.tsx
      ApprovalPanel.tsx
    lib/

  local_backend/
    main.py
    api/
    services/
```

## 9.2 شاشات KVDOS Studio

### Dashboard

يعرض:

```text
Projects
Recent activity
System health
Active runners
Subscription status
Pending approvals
```

### Project Dashboard

يعرض:

```text
Project status
Current phase
Completion %
Active agents
Task counters
Build status
Last errors
```

### Discovery UI

يعرض:

```text
Questions
Answers
Progress
Confidence score
Open questions
Assumptions
Conflicts
```

### Blueprint Viewer

يعرض:

```text
Product summary
Users
Roles
Features
MVP scope
Pages
Entities
APIs
Security
Deployment
Required packages
```

### Spec Viewer

يعرض `app.kvdos.yaml`.

### Task Queue UI

يعرض:

```text
FIFO queues
Task status
Dependencies
Assigned agent
Attempts
Errors
```

### Agent Activity

يعرض:

```text
Agent running
Current task
Last result
Cost
Tokens
Duration
```

### File Explorer

يعرض ملفات المشروع المولد.

### Logs

يعرض:

```text
Build logs
Test logs
Agent logs
Audit logs
Sandbox logs
```

### Approvals

يعرض:

```text
Risky actions
Package installs
Evolution patches
Deployment approvals
Secret access requests
```

---

# 10. KVDOS Runner

## 10.1 Structure

```text
apps/runner/
  local_runner/
    runner.py
    config.yaml
    connect_to_cloud.py
    task_listener.py
    sandbox_executor.py
    health_check.py
    local_task_executor.py

  cloud_runner/
    worker.py
    sandbox_pool.py
    job_executor.py
    isolation_policy.py
    resource_allocator.py
```

## 10.2 Runner Responsibilities

```text
Poll or receive tasks
Execute tasks
Run agents
Use sandbox
Write patches
Run tests
Return results
Report health
Respect license entitlements
```

## 10.3 Local Runner Flow

```text
User starts KVDOS Studio
  ↓
Local Runner starts
  ↓
Runner registers locally/cloud
  ↓
Task Dispatcher sends tasks
  ↓
Runner executes in local sandbox
  ↓
Results returned to Studio/Cloud
```

---

# 11. KVDOS Enterprise

```text
apps/enterprise/
  self_hosted/
    docker-compose.yml
    helm/
    config/
    offline_license/
    private_registry/
    private_knowledge_base/
    sso/
    audit/
```

Enterprise features:

```text
Self-hosted deployment
Offline signed license
Private package registry
Private knowledge base
SSO
Audit logs
Policy control
Local model mode
No cloud dependency
```

---

# 12. Boot Layer

```text
core/boot/
  boot_manager.py
  config_loader.py
  dependency_checker.py
  service_registry.py
  safe_mode_boot.py
  recovery_boot.py
```

## 12.1 Boot Sequence

```text
1. Load config
2. Check DB
3. Check Docker
4. Check license token
5. Start Event Bus
6. Start Kernel
7. Load Installed Packages
8. Register Syscalls
9. Start Task Queue
10. Start Agent Runtime
11. Start Learning System
12. Start API/UI
```

## 12.2 Safe Mode Boot

Safe mode disables:

```text
Evolution System
Package installs
Auto maintenance
Deployment
Writing to Learning System
Risky operations
```

Allowed:

```text
Read-only inspection
Logs
Recovery
Rollback
Manual approvals
```

---

# 13. Kernel

```text
core/kernel/
  core.py
  syscall_router.py
  capability_checker.py
  resource_manager.py
  context_manager.py
  project_registry.py
  error_handler.py
  audit_bridge.py
```

## 13.1 Kernel Responsibilities

```text
Route syscalls
Check capabilities
Enforce policies
Manage project registry
Manage resources
Emit events
Record audit
Prevent direct agent mutations
```

## 13.2 Kernel Does Not Do

```text
Generate code
Call LLM directly
Write business logic
Install packages directly without manager
Run shell directly
```

## 13.3 Core Syscalls

```text
project.create
project.read_manifest
project.update_manifest

workspace.read_file
workspace.write_file
workspace.patch_file
workspace.create_snapshot
workspace.rollback

task.create
task.enqueue
task.lock
task.complete
task.fail

learning.retrieve
learning.save_lesson_candidate

package.install
package.uninstall
package.enable
package.disable

sandbox.run_command
sandbox.run_tests
sandbox.run_build

approval.request
approval.resolve

audit.record_event
```

---

# 14. Commands & Events

## 14.1 Commands

```text
core/commands/
  command_schema.py
  command_router.py
  command_validator.py
  command_log.py
  commands.yaml
```

Command = طلب تنفيذ شيء.

Examples:

```text
CREATE_PROJECT
START_DISCOVERY
GENERATE_BLUEPRINT
GENERATE_SPEC
VALIDATE_SPEC
PLAN_TASKS
ENQUEUE_TASKS
RUN_TASK
APPLY_PATCH
INSTALL_PACKAGE
ROLLBACK_PROJECT
```

## 14.2 Events

```text
core/events/
  event_bus.py
  event_store.py
  event_router.py
  event_schema_registry.py
  subscribers.py
  events.yaml
```

Event = شيء حدث.

Examples:

```text
project.created
discovery.started
discovery.completed
blueprint.generated
spec.created
spec.validated
task.created
task.ready
task.locked
task.started
task.completed
task.failed
patch.created
patch.merged
build.failed
repair.requested
learning.updated
package.installed
approval.requested
```

---

# 15. Contracts & Schema Registry

```text
core/contracts/
  discovery_contract.json
  blueprint_contract.json
  kvdos_spec_contract.json
  task_contract.json
  agent_output_contract.json
  package_manifest_contract.json
  learning_item_contract.json
  quality_report_contract.json
  evolution_patch_contract.json
  runtime_issue_contract.json

core/schemas/
  schema_registry.py
  schema_validator.py
  schema_versioning.py
  compatibility_checker.py
```

## 15.1 Why Contracts?

لمنع أن يتعامل Agent أو نظام مع نص حر غير مضمون.

كل مخرج يجب أن يكون:

```text
Valid JSON/YAML
Schema validated
Versioned
Traceable
```

---

# 16. State Machine

```text
core/state_machine/
  project_lifecycle.py
  project_states.yaml
  transition_validator.py
```

## 16.1 Project States

```text
IDEA_RECEIVED
DISCOVERY_IN_PROGRESS
DISCOVERY_COMPLETED
BLUEPRINT_REVIEW
BLUEPRINT_APPROVED
SPEC_GENERATED
SPEC_VALIDATED
TASKS_PLANNED
GENERATION_IN_PROGRESS
BUILDING
TESTING
REPAIRING
QUALITY_REVIEW
READY_FOR_DEPLOYMENT
DEPLOYED
MONITORING
MAINTENANCE
ARCHIVED
```

## 16.2 Transition Rule Example

```yaml
from: SPEC_GENERATED
to: SPEC_VALIDATED
requires:
  - spec.schema_valid
  - spec.business_rules_valid
```

---

# 17. Workflow Orchestrator

```text
core/workflows/
  workflow_engine.py
  workflow_context.py
  workflow_runner.py
  workflow_definitions/
    build_app.yaml
    evolve_system.yaml
    import_knowledge.yaml
    deploy_app.yaml
    maintain_app.yaml
```

## 17.1 Build App Workflow

```yaml
name: build_app
steps:
  - start_discovery
  - generate_blueprint
  - approve_blueprint
  - generate_spec
  - validate_spec
  - resolve_packages
  - plan_tasks
  - enqueue_tasks
  - run_agents
  - merge_patches
  - run_build
  - run_tests
  - security_review
  - quality_gate
  - generate_docs
  - export_project
  - post_project_learning
```

---

# 18. Saga / Transactions

```text
core/transactions/
  saga_manager.py
  transaction_log.py
  compensation_actions.py
  rollback_hooks.py
```

## 18.1 Use Cases

```text
package.install
package.uninstall
evolution.update.apply
deployment.publish
knowledge_pack.import
```

## 18.2 Example: package.install

Steps:

```text
1. download package
2. verify signature
3. verify checksum
4. check compatibility
5. check capabilities
6. copy package files
7. register package
8. run package tests
9. enable package
```

Compensation if failed:

```text
remove copied files
unregister package
restore previous installed_packages.json
restore capability graph
```

---

# 19. Task System FIFO

```text
core/task_system/
  task_model.py
  task_store.py
  task_queue.py
  fifo_queue.py
  dependency_resolver.py
  task_planner.py
  task_dispatcher.py
  task_worker.py
  task_lock_manager.py
  retry_manager.py
  task_events.py
  priority_lanes.py
  idempotency.py
```

## 19.1 Task Origin

Tasks تأتي من:

```text
app.kvdos.yaml
Task Planner
MasterAgent
Failed build
Security review
User change request
Evolution request
Runtime monitoring
```

## 19.2 FIFO Rule

```text
Oldest READY task executes first inside its queue.
But task cannot be READY until dependencies are completed.
```

## 19.3 Task Queues

```text
architecture
database
backend
frontend
uiux
testing
security
devops
documentation
repair
evolution
```

## 19.4 Task Schema

```json
{
  "id": "task_0007",
  "project_id": "clinic_001",
  "title": "Generate patients backend module",
  "type": "backend.generate_module",
  "status": "PENDING",
  "queue": "backend",
  "assigned_agent_type": "BackendAgent",
  "input": {
    "module": "patients",
    "spec_refs": [
      "entities.Patient",
      "api.patients",
      "permissions.receptionist.patients"
    ]
  },
  "dependencies": [
    "task_0002",
    "task_0003"
  ],
  "capabilities_required": [
    "workspace.read_file",
    "workspace.patch_file",
    "learning.retrieve"
  ],
  "output_contract": {
    "must_create": [
      "backend/app/models/patient.py",
      "backend/app/routes/patients.py",
      "backend/app/schemas/patient.py"
    ],
    "must_update": [
      "backend/app/main.py"
    ]
  },
  "risk": "low",
  "attempts": 0,
  "max_attempts": 3
}
```

## 19.5 Task Status

```text
PENDING
READY
LOCKED
RUNNING
WAITING_DEPENDENCY
WAITING_APPROVAL
COMPLETED
FAILED
RETRYING
BLOCKED
CANCELLED
MERGED
```

## 19.6 Task Result

```json
{
  "task_id": "task_0007",
  "status": "COMPLETED",
  "agent": "BackendAgent",
  "summary": "Generated patient backend module",
  "artifacts": [
    "patch_0034",
    "backend/app/models/patient.py",
    "backend/app/routes/patients.py"
  ],
  "events": [
    "backend.module.generated"
  ],
  "new_tasks": [
    "test.generate_patient_api_tests"
  ],
  "lessons": [],
  "errors": []
}
```

---

# 20. Master Agent

## 20.1 Role

```text
ProjectOrchestratorAgent
```

MasterAgent هو مدير المشروع الذكي.

## 20.2 Responsibilities

```text
Read app.kvdos.yaml
Create Task Graph
Enqueue FIFO tasks
Monitor tasks
Handle failures
Create repair tasks
Update blackboard
Record decisions
Request approvals
Coordinate phases
Declare phase completion
```

## 20.3 Forbidden

```text
Direct code writing
Direct file mutation
Direct package install
Bypassing kernel
Bypassing approval
Changing security policy
```

## 20.4 MasterAgent Permissions

```yaml
MasterAgent:
  allowed:
    - task.create
    - task.update
    - task.cancel
    - task.requeue
    - project.read_manifest
    - spec.read
    - blackboard.read
    - blackboard.write
    - decision_ledger.write
    - learning.retrieve
    - approval.request
    - event.emit

  restricted:
    - package.install
    - evolution.apply_patch
    - deployment.publish
    - security.policy_change

  forbidden:
    - workspace.write_file_direct
    - secret.read
    - sandbox.run_unrestricted
    - bypass_approval
```

---

# 21. Agent Runtime

```text
core/agent_runtime/
  agent_base.py
  agent_executor.py
  agent_context.py
  agent_pool.py
  agent_registry.py
  agent_permissions.py
  llm_output_normalizer.py
  tool_call_recorder.py
  replay_runner.py
```

## 21.1 Agent Startup Protocol

كل Agent يبدأ بـ:

```text
1. Receive task
2. Read project manifest
3. Read relevant app.kvdos.yaml sections
4. Read blackboard
5. Retrieve learning context
6. Build task context
7. Execute via syscalls
8. Produce patch/result
9. Emit events
10. Record audit
```

---

# 22. Specialized Agents

## 22.1 DatabaseAgent

Inputs:

```text
entities
relations
data constraints
database type
```

Outputs:

```text
models
migrations
ERD summary
seed data
```

## 22.2 BackendAgent

Inputs:

```text
api contract
entities
permissions
business rules
```

Outputs:

```text
routes
services
schemas
auth logic
error handlers
```

## 22.3 UIUXAgent

Inputs:

```text
personas
journeys
pages
domain
ui preferences
```

Outputs:

```text
ui contract
layout plan
component list
navigation model
```

## 22.4 FrontendAgent

Inputs:

```text
ui contract
api contract
pages
entities
```

Outputs:

```text
React pages
components
forms
tables
API client
```

## 22.5 TestAgent

Inputs:

```text
spec
acceptance criteria
api contract
permissions
```

Outputs:

```text
unit tests
api tests
rbac tests
acceptance tests
```

## 22.6 SecurityAgent

Checks:

```text
auth
rbac
secret exposure
input validation
insecure dependencies
dangerous APIs
```

## 22.7 DevOpsAgent

Outputs:

```text
Dockerfile
docker-compose.yml
.env.example
deployment guide
health checks
```

## 22.8 RepairAgent

Triggered by:

```text
build.failed
test.failed
contract.failed
security.failed
```

Restrictions:

```text
can patch only files related to failure
max retry attempts
must rerun test/build
```

---

# 23. Multi-Agent Execution

```text
core/multi_agent_runtime/
  orchestrator.py
  task_graph.py
  agent_worker.py
  agent_workspace.py
  patch_manager_bridge.py
  merge_queue_bridge.py
  file_lock_manager.py
  conflict_detector.py
  blackboard.py
  decision_ledger.py
```

## 23.1 Principle

```text
Parallel Thinking
Isolated Writing
Controlled Merging
Shared Contracts
Central Orchestration
```

## 23.2 Agent Workspaces

```text
projects/project_001/.kvdos/agent_workspaces/
  backend_agent/
  frontend_agent/
  database_agent/
  uiux_agent/
  test_agent/
```

## 23.3 File Ownership

```yaml
ownership:
  DatabaseAgent:
    - database/**
    - backend/app/models/**
    - migrations/**

  BackendAgent:
    - backend/app/routes/**
    - backend/app/services/**
    - backend/app/schemas/**

  FrontendAgent:
    - frontend/src/pages/**
    - frontend/src/components/**
    - frontend/src/api/**

  DevOpsAgent:
    - Dockerfile
    - docker-compose.yml
    - .github/**
    - deployment/**
```

---

# 24. Workspace System

```text
core/workspace/
  workspace_manager.py
  virtual_fs.py
  file_manager.py
  snapshot_manager.py
  diff_engine.py
  file_lock_manager.py
  project_blackboard.py
```

## 24.1 Project Directory

```text
projects/project_001/
  .kvdos/
    manifest.json
    app.kvdos.yaml
    discovery/
    tasks/
    blackboard/
    decision_ledger/
    audit.log
    snapshots/
    agent_workspaces/
    build_logs/
    test_logs/
    lessons/

  app/
    backend/
    frontend/
    database/
    tests/
    docker-compose.yml
```

---

# 25. Patch System

```text
core/patch_system/
  patch_model.py
  patch_manager.py
  patch_validator.py
  merge_queue.py
  conflict_resolver.py
  patch_to_commit.py
  patch_review.py
```

## 25.1 Patch Flow

```text
Agent completes task
  ↓
Creates patch
  ↓
Patch Manager validates
  ↓
Merge Queue
  ↓
Conflict check
  ↓
Merge
  ↓
Task status becomes MERGED
```

---

# 26. Sandbox

```text
core/sandbox/
  sandbox_manager.py
  docker_runner.py
  command_runner.py
  resource_limits.py
  network_policy.py
  log_collector.py
  sandbox_profiles.yaml
```

## 26.1 Sandbox Rules

```text
No access outside project workspace
Limited CPU/RAM
Network restricted by profile
No unrestricted shell
Logs captured
Timeouts enforced
```

---

# 27. Discovery System

```text
core/discovery_system/
  discovery_orchestrator.py
  question_generator.py
  question_strategy.py
  adaptive_flow_engine.py
  decision_tree_engine.py
  answer_analyzer.py
  ambiguity_detector.py
  conflict_detector.py
  requirement_extractor.py
  blueprint_builder.py
  priority_ranker.py
  completeness_evaluator.py
  audience_adapter.py
  persona_builder.py
  journey_builder.py
  nfr_discovery.py
  red_team_question_agent.py
  blueprint_diff_engine.py
```

## 27.1 Discovery Output

```text
PRD
Blueprint
Roles
Features
MVP scope
Entities
Pages
API draft
UI/UX direction
Architecture recommendation
Security requirements
Deployment requirements
Acceptance criteria
Open questions
Assumptions
```

## 27.2 Blueprint Sections

```text
Product Summary
Users & Roles
Features
MVP Scope
Pages
Database Entities
API Endpoints
UI/UX Direction
System Architecture
Security Requirements
Integrations
Deployment Plan
Required Packages
Open Questions
```

---

# 28. KVDOS Spec / IR

```text
core/spec_system/
  kvdos_spec_schema.py
  spec_parser.py
  spec_validator.py
  semantic_validator.py
  business_rule_validator.py
  spec_versioning.py
  spec_migrations.py
  blueprint_to_spec_mapper.py
  spec_to_tasks.py
  spec_to_tests.py
  spec_to_docs.py
  spec_to_packages.py
```

## 28.1 `app.kvdos.yaml`

This is the single source of truth.

Example:

```yaml
app:
  name: clinic_management
  domain: healthcare
  type: web_dashboard

architecture:
  frontend: react
  backend: fastapi
  database: postgres
  deployment: docker

features:
  - auth
  - role_based_access
  - patients
  - doctors
  - appointments
  - invoices

entities:
  Patient:
    fields:
      name: string
      phone: string
      birth_date: date
      medical_history: text

  Appointment:
    fields:
      date: datetime
      status: enum[pending, confirmed, cancelled, completed]
    relations:
      patient: Patient
      doctor: User

permissions:
  doctor:
    appointments:
      read_scope: own

pages:
  - name: Dashboard
    type: dashboard

  - name: Patients
    type: list_page
    entity: Patient

  - name: PatientProfile
    type: detail_page
    entity: Patient

quality:
  require_tests: true
  require_audit_logs: true
  require_accessibility: true
```

---

# 29. Learning System

```text
core/learning_system/
  service.py
  ingestion/
  memory/
  retrieval/
  learning_loop/
  evaluation/
  quality/
  promotion/
  knowledge/
  indexes/
  feedback/
```

## 29.1 Memory Types

```text
Raw Document Store
Structured Knowledge Store
Vector Index
Project Memory
Feedback Store
Case Studies
Lessons
Anti-patterns
```

## 29.2 Agent Retrieval Flow

```text
Agent receives task
  ↓
Context Builder asks Learning System
  ↓
Relevant knowledge retrieved
  ↓
Context compressed
  ↓
Agent executes
```

## 29.3 Knowledge Promotion

```text
raw observation
  ↓
lesson candidate
  ↓
curator review
  ↓
approved lesson
  ↓
knowledge pack update
```

---

# 30. Evolution System

```text
core/evolution_system/
  evolution_orchestrator.py
  agents/
  services/
  policies/
  update_packages/
```

## 30.1 Evolution Flow

```text
User requests system improvement
  ↓
Evolution analyzes
  ↓
Learning retrieval
  ↓
Patch plan
  ↓
Package/update generated
  ↓
Sandbox tests
  ↓
Security review
  ↓
Approval
  ↓
Apply update
  ↓
Rollback available
```

## 30.2 Allowed First Version

MVP Evolution should only create:

```text
new packages
new templates
new docs
new tests
```

Not:

```text
core mutation
security policy changes
package manager changes
```

---

# 31. Package Manager

```text
core/package_manager/
  package_model.py
  package_manifest.py
  package_registry.py
  package_installer.py
  package_uninstaller.py
  dependency_resolver.py
  version_manager.py
  package_validator.py
  signature_verifier.py
  checksum_validator.py
  compatibility_matrix.py
```

## 31.1 Package Commands

```bash
kvdos pkg list
kvdos pkg info generator.fastapi
kvdos pkg install generator.fastapi
kvdos pkg uninstall generator.fastapi
kvdos pkg enable generator.fastapi
kvdos pkg disable generator.fastapi
kvdos pkg update generator.fastapi
```

---

# 32. Plugin Runtime

```text
core/plugin_runtime/
  plugin_loader.py
  plugin_sandbox.py
  hook_manager.py
  extension_points.py
```

Hooks:

```text
on_install
on_uninstall
on_project_created
on_generate_backend
on_build_failed
on_project_completed
```

---

# 33. Security System

```text
core/security/
  capability_model.py
  capability_graph.py
  permission_checker.py
  policy_evaluator.py
  secret_manager.py
  agent_firewall.py
  prompt_injection_detector.py
  untrusted_content_sanitizer.py
  integrity_checker.py
  kill_switch.py
  safe_mode.py
```

## 33.1 Prompt Injection Defense

Rule:

```text
Documents are data, not instructions.
```

## 33.2 Sensitive Data

Never send to LLM:

```text
.env
API keys
secrets
tokens
private keys
customer PII unless explicitly allowed and redacted
```

---

# 34. Licensing & Subscription Protection

## 34.1 Cloud Licensing

```text
cloud_services/licensing/
  license_server.py
  license_token.py
  entitlement_service.py
  device_activation.py
  offline_license.py
```

## 34.2 License Token

Contains:

```json
{
  "user_id": "user_123",
  "org_id": "org_123",
  "plan": "agency",
  "features": [
    "discovery",
    "learning_system",
    "package_manager",
    "local_runner",
    "github_export"
  ],
  "max_projects": 50,
  "max_parallel_agents": 6,
  "expires_at": "2026-06-13",
  "device_limit": 3
}
```

Must be:

```text
digitally signed
time-limited
refreshable
device-bound optionally
```

## 34.3 Subscription Plans

```text
Trial:
  1 project
  limited agents

Pro:
  more projects
  local runner
  basic learning

Agency:
  team workspace
  private knowledge base
  more agents
  GitHub export

Enterprise:
  self-hosted
  offline license
  SSO
  audit logs
  private registry
  local model mode
```

## 34.4 Product Protection

```text
No private keys in client
Signed license tokens
Signed updates
Signed packages
Rust secure core
Cloud entitlements
Offline grace period
Integrity checks
```

---

# 35. Governance

```text
core/governance/
  decision_engine.py
  approval_policy.py
  human_review_queue.py
  change_control_board.py
  architecture_gate.py
  complexity_score.py
```

Controls:

```text
MVP scope
Feature admission
Risk escalation
Human review
Architecture freeze
Complexity budget
```

---

# 36. Approval System

```text
core/approval_system/
  approval_request.py
  approval_queue.py
  approval_policy.py
  approval_history.py
```

Requires approval:

```text
deployment.publish
package.install_untrusted
evolution.apply_patch
core.patch
security.policy_change
secret.read
```

---

# 37. Risk Engine

```text
core/risk_engine/
  risk_classifier.py
  risk_score.py
  mitigation_planner.py
  risk_registry.py
```

Risk inputs:

```text
affected files
capabilities
data sensitivity
rollback availability
test results
package trust level
agent type
```

---

# 38. Quality Gates

```text
core/quality_gates/
  pre_generation_gate.py
  spec_quality_gate.py
  post_generation_gate.py
  build_quality_gate.py
  security_quality_gate.py
  release_gate.py
```

Gate examples:

```text
Spec gate:
  app.kvdos.yaml valid
  no critical ambiguity
  no conflicting requirements

Build gate:
  backend build passes
  frontend build passes
  docker compose valid

Security gate:
  no secret exposure
  RBAC tests pass
  no high-risk dependency
```

---

# 39. Model Router

```text
core/model_router/
  model_registry.py
  routing_policy.py
  fallback_manager.py
  local_model_router.py
```

Routing:

```text
Planning → stronger model
Code generation → coding-capable model
Summarization → cheap fast model
Embeddings → embedding model
Private docs → local model if configured
```

---

# 40. Cost Manager

```text
core/cost_manager/
  budget_policy.py
  token_tracker.py
  model_cost_estimator.py
  cache_manager.py
  usage_limits.py
```

Controls:

```text
tokens
parallel agents
monthly limits
per-project budget
subscription entitlements
```

---

# 41. Privacy

```text
core/privacy/
  data_classifier.py
  pii_detector.py
  redaction_engine.py
  retention_policy.py
  private_context_filter.py
  cloud_block_policy.py
```

Modes:

```text
cloud mode
hybrid mode
local-only mode
enterprise private mode
```

---

# 42. Observability

```text
core/observability/
  metrics_collector.py
  trace_manager.py
  cost_tracker.py
  agent_performance_monitor.py
  task_metrics.py
  dashboard_adapter.py
```

Metrics:

```text
agent success rate
task duration
repair count
build failures
test pass rate
token usage
cost per project
package errors
```

---

# 43. Artifact Registry

```text
core/artifact_registry/
  artifact_store.py
  artifact_metadata.py
  artifact_versioning.py
  artifact_lineage.py
```

Artifacts:

```text
Blueprint
Spec
Task graph
Patches
Packages
Knowledge packs
Build logs
Test reports
Docs
Deployments
Updates
```

---

# 44. Traceability

```text
core/traceability/
  trace_graph.py
  answer_to_spec_mapper.py
  requirement_to_code_mapper.py
  spec_to_test_mapper.py
  decision_trace.py
```

Goal:

```text
كل كود يمكن تتبعه إلى سؤال/إجابة/Spec/Task.
```

---

# 45. Provenance

```text
core/provenance/
  source_tracker.py
  knowledge_lineage.py
  trust_score.py
```

Tracks:

```text
where knowledge came from
who approved it
confidence score
usage history
```

---

# 46. Policy as Code

```text
core/policy/
  policies/
    agent_permissions.yaml
    package_install_policy.yaml
    evolution_policy.yaml
    learning_policy.yaml
    privacy_policy.yaml
    deployment_policy.yaml

  policy_loader.py
  policy_propagation.py
  policy_tests/
```

---

# 47. Migration System

```text
core/migrations/
  system_migrations/
  spec_migrations/
  knowledge_migrations/
  package_migrations/
  migration_runner.py
```

Required because schemas will evolve.

---

# 48. Feature Flags

```text
core/feature_flags/
  flags.yaml
  flag_evaluator.py
```

Example:

```yaml
features:
  evolution_system:
    enabled: false
  auto_apply_low_risk_patches:
    enabled: false
  local_model_mode:
    enabled: true
```

---

# 49. Safe Mode & Kill Switch

```text
core/security/
  kill_switch.py
  safe_mode.py
```

Commands:

```bash
kvdos emergency stop
kvdos safe-mode
kvdos disable evolution.system
kvdos freeze packages
```

Safe mode disables:

```text
Evolution
Package install
Deployment
Auto-maintenance
Learning writes
```

---

# 50. Health System

```text
core/health/
  health_score.py
  system_health.py
  learning_health.py
  package_health.py
  security_health.py
  evolution_safety.py
```

Example:

```json
{
  "system_health": 0.91,
  "learning_health": 0.84,
  "package_health": 0.88,
  "security_health": 0.93,
  "evolution_safety": 0.79
}
```

---

# 51. Database Design

## 51.1 Core Tables

### users

```sql
users
- id
- email
- name
- password_hash
- created_at
- updated_at
```

### organizations

```sql
organizations
- id
- name
- plan
- created_at
```

### projects

```sql
projects
- id
- org_id
- name
- domain
- status
- spec_version
- created_at
- updated_at
```

### tasks

```sql
tasks
- id
- project_id
- type
- title
- status
- queue_name
- assigned_agent_type
- locked_by
- lock_expires_at
- input_json
- output_json
- dependencies_json
- attempts
- max_attempts
- risk
- created_at
- started_at
- finished_at
```

### task_events

```sql
task_events
- id
- task_id
- event_type
- payload
- created_at
```

### agents

```sql
agents
- id
- agent_type
- status
- current_task_id
- capabilities_json
- created_at
```

### packages

```sql
packages
- id
- name
- version
- type
- enabled
- installed_at
- manifest_path
- signature_status
```

### approvals

```sql
approvals
- id
- type
- target
- risk
- requested_by
- status
- payload_json
- created_at
- resolved_at
```

### audit_logs

```sql
audit_logs
- id
- actor
- action
- target
- risk_level
- result
- metadata_json
- timestamp
```

### knowledge_items

```sql
knowledge_items
- id
- type
- title
- domain
- tags_json
- summary
- content_path
- confidence
- source_id
- version
- created_at
- updated_at
```

### knowledge_embeddings

```sql
knowledge_embeddings
- id
- knowledge_item_id
- chunk_id
- embedding
- text
- metadata_json
```

### project_lessons

```sql
project_lessons
- id
- project_id
- agent
- problem
- solution
- reusable_rule
- confidence
- approved
- created_at
```

### artifacts

```sql
artifacts
- id
- project_id
- type
- version
- path
- hash
- created_by
- metadata_json
- created_at
```

---

# 52. API Design

## Project APIs

```http
POST /projects
GET  /projects
GET  /projects/{project_id}
POST /projects/{project_id}/build
POST /projects/{project_id}/test
POST /projects/{project_id}/export
```

## Discovery APIs

```http
POST /projects/{id}/discovery/start
GET  /projects/{id}/discovery/question
POST /projects/{id}/discovery/answer
POST /projects/{id}/discovery/finalize
GET  /projects/{id}/blueprint
```

## Spec APIs

```http
GET  /projects/{id}/spec
POST /projects/{id}/spec/validate
PUT  /projects/{id}/spec
GET  /projects/{id}/spec/diff
```

## Task APIs

```http
GET  /projects/{id}/tasks
GET  /tasks/{task_id}
POST /tasks/{task_id}/cancel
POST /tasks/{task_id}/retry
```

## Agent APIs

```http
GET /agents
GET /agents/{id}
GET /projects/{id}/agents
```

## Package APIs

```http
GET  /packages
POST /packages/install
POST /packages/uninstall
POST /packages/enable
POST /packages/disable
```

## Learning APIs

```http
POST /learning/import
POST /learning/index
GET  /learning/search
POST /learning/post-project
POST /learning/approve-lesson
```

## Approval APIs

```http
GET  /approvals
POST /approvals/{id}/approve
POST /approvals/{id}/reject
```

## Logs APIs

```http
GET /projects/{id}/logs
GET /projects/{id}/build-logs
GET /projects/{id}/test-logs
```

---

# 53. UI Screens

## Main Dashboard

Widgets:

```text
Active projects
Recent builds
Pending approvals
Runner status
Subscription status
System health
```

## Project Dashboard

Widgets:

```text
Current state
Completion %
Task counters
Active agents
Last build
Open issues
```

## Discovery Screen

Components:

```text
Question card
Answer input
Progress
Confidence score
Assumptions
Conflicts
```

## Blueprint Screen

Sections:

```text
Summary
Roles
Features
MVP
Data model
Pages
APIs
Security
Deployment
```

## Spec Screen

Features:

```text
YAML editor
Validation results
Spec diff
Trace links
```

## Task Queue Screen

Features:

```text
FIFO lane
Task status
Dependencies
Agent assigned
Retry count
Errors
```

## Agent Screen

Features:

```text
Agent status
Current task
Past tasks
Token usage
Failures
```

## File Explorer

Features:

```text
Tree view
Diff view
Patch view
Generated files
```

## Approvals

Features:

```text
Risk score
Requested action
Affected files
Rollback availability
Approve/Reject
```

## Learning Center

Features:

```text
Imported docs
Case studies
Lessons
Knowledge packs
Search
```

## Package Manager

Features:

```text
Installed packages
Available packages
Signatures
Capabilities
Dependencies
Install/uninstall
```

---

# 54. CLI Commands

```bash
kvdos start
kvdos safe-mode
kvdos emergency stop

kvdos project create "Clinic Management"
kvdos project status project_001
kvdos project build project_001
kvdos project test project_001
kvdos project export project_001

kvdos pkg list
kvdos pkg info generator.fastapi
kvdos pkg install generator.fastapi
kvdos pkg uninstall generator.fastapi
kvdos pkg enable generator.fastapi
kvdos pkg disable generator.fastapi

kvdos learn import ./docs --domain clinic --type case_study
kvdos learn index
kvdos learn search "clinic appointment calendar"
kvdos learn approve-lesson lesson_123

kvdos evolve "أضف دعم Flutter"
kvdos evolution plan
kvdos evolution apply
kvdos evolution rollback update_123

kvdos runner start
kvdos runner status
kvdos runner connect
```

---

# 55. Generated Apps Structure

```text
generated_apps/project_001/
  .kvdos/
    manifest.json
    app.kvdos.yaml
    discovery/
      questions.json
      answers.json
      blueprint.json
    tasks/
      tasks.json
      task_events.json
    trace_graph/
    audit.log
    build_logs/
    test_logs/
    docs/
    lessons/

  app/
    backend/
      app/
        main.py
        models/
        routes/
        services/
        schemas/
        auth/
      tests/
      requirements.txt
      Dockerfile

    frontend/
      src/
        pages/
        components/
        api/
        hooks/
        styles/
      package.json
      Dockerfile

    database/
      migrations/
      seed/

    docker-compose.yml
    README.md
```

---

# 56. Knowledge Packs

```text
knowledge_packs/
  knowledge.uiux.core/
  knowledge.system_design.core/
  knowledge.domain.crm/
  knowledge.domain.clinic/
  knowledge.domain.ecommerce/
  knowledge.security.web_apps/
```

Each pack:

```text
kvdos.package.json
knowledge/
  patterns/
  case_studies/
  anti_patterns/
  checklists/
  examples/
indexes/
README.md
```

---

# 57. Golden Projects

```text
golden_projects/
  simple_todo/
  crm_basic/
  clinic_management/
  ecommerce_mvp/
  school_system/
```

Each:

```text
input_prompt.txt
expected_blueprint.json
expected_spec.yaml
expected_tasks.json
quality_thresholds.yaml
```

Used for:

```text
Regression testing
Benchmarking agents
Testing Evolution updates
Quality assurance
```

---

# 58. Testing Strategy

## 58.1 Unit Tests

- Kernel
- Task Queue
- Spec Parser
- Package Manager
- Policy Engine

## 58.2 Integration Tests

- Full app generation
- Package install/uninstall
- Learning import
- Evolution patch flow
- Rollback flow
- Task FIFO behavior
- MasterAgent orchestration

## 58.3 Policy Tests

- Agent permissions
- Package policy
- Evolution policy
- Privacy policy

## 58.4 Security Tests

- Prompt injection
- Secret redaction
- Unsigned package rejection
- Sandbox escape attempts

## 58.5 Contract Tests

- Spec to tests
- API contract
- RBAC contract
- UI contract

---

# 59. SDK

```text
sdk/
  agent_sdk/
  package_sdk/
  driver_sdk/
  knowledge_pack_sdk/
  testing_sdk/
```

## 59.1 Agent SDK Example

```python
from kvdos.sdk import Agent

class LaravelAgent(Agent):
    id = "agent.backend.laravel"

    can_handle = [
        "backend.generate_module"
    ]

    capabilities = [
        "workspace.read_file",
        "workspace.patch_file",
        "learning.retrieve"
    ]

    def run(self, task, context):
        ...
```

---

# 60. MVP Scope

## 60.1 MVP v0.1 Includes

```text
KVDOS Studio Local Web
FastAPI backend
React UI
SQLite
Basic FIFO Task Queue
MasterAgent
BackendAgent
FrontendAgent
Basic TestAgent
Workspace
Patch Manager basic
Docker Sandbox
Discovery basic
app.kvdos.yaml
Export ZIP
```

## 60.2 MVP v0.1 Excludes

```text
Full Evolution System
Marketplace
Enterprise self-hosting
Runtime monitoring
Auto maintenance
Advanced licensing
Multi-tenant advanced
Full package ecosystem
```

## 60.3 First Supported App

```text
CRM Basic
أو
Clinic Basic
```

## 60.4 First Generated Stack

```text
React + TypeScript
FastAPI
PostgreSQL
Docker Compose
JWT Auth
RBAC Basic
```

---

# 61. Implementation Tickets

## Phase 0 — Foundation

### Ticket 0.1

Create monorepo structure.

### Ticket 0.2

Build FastAPI local backend skeleton.

### Ticket 0.3

Build React Studio UI skeleton.

### Ticket 0.4

Implement SQLite storage.

### Ticket 0.5

Implement Event Bus minimal.

### Ticket 0.6

Implement Audit Log minimal.

---

## Phase 1 — Task System

### Ticket 1.1

Implement Task model.

### Ticket 1.2

Implement FIFO queue.

### Ticket 1.3

Implement dependency resolver.

### Ticket 1.4

Implement task dispatcher.

### Ticket 1.5

Implement worker loop.

### Ticket 1.6

Build Task Queue UI.

---

## Phase 2 — Discovery + Spec

### Ticket 2.1

Implement basic question bank.

### Ticket 2.2

Implement discovery session.

### Ticket 2.3

Implement answer analyzer.

### Ticket 2.4

Generate Blueprint.

### Ticket 2.5

Map Blueprint to app.kvdos.yaml.

### Ticket 2.6

Implement spec validator.

---

## Phase 3 — Agents

### Ticket 3.1

Implement Agent base class.

### Ticket 3.2

Implement MasterAgent.

### Ticket 3.3

Implement BackendAgent basic.

### Ticket 3.4

Implement FrontendAgent basic.

### Ticket 3.5

Implement TestAgent basic.

### Ticket 3.6

Implement Agent activity UI.

---

## Phase 4 — Workspace + Patch

### Ticket 4.1

Implement Workspace manager.

### Ticket 4.2

Implement Patch model.

### Ticket 4.3

Implement Patch Manager.

### Ticket 4.4

Implement Merge Queue.

### Ticket 4.5

Implement File Explorer UI.

---

## Phase 5 — Sandbox

### Ticket 5.1

Implement Docker runner.

### Ticket 5.2

Implement build runner.

### Ticket 5.3

Implement test runner.

### Ticket 5.4

Capture logs.

### Ticket 5.5

Show logs in UI.

---

## Phase 6 — First App Generation

### Ticket 6.1

Generate backend structure.

### Ticket 6.2

Generate frontend structure.

### Ticket 6.3

Generate docker-compose.

### Ticket 6.4

Run build/test.

### Ticket 6.5

Export ZIP.

---

## Phase 7 — Learning MVP

### Ticket 7.1

Import markdown docs.

### Ticket 7.2

Chunk documents.

### Ticket 7.3

Store knowledge items.

### Ticket 7.4

Retrieve relevant docs for Agent context.

### Ticket 7.5

Post-project lesson extraction basic.

---

## Phase 8 — SaaS & Licensing

### Ticket 8.1

Cloud auth.

### Ticket 8.2

Subscription plans.

### Ticket 8.3

License token.

### Ticket 8.4

Local license verification.

### Ticket 8.5

Entitlements.

---

# 62. Roadmap

## v0.1

- Local Studio
- FIFO Tasks
- MasterAgent
- Basic Agents
- Generated CRM/Clinic app

## v0.2

- Learning retrieval
- Import docs
- Basic case studies

## v0.3

- Package Manager
- Install/uninstall packages
- generator.fastapi
- frontend.react

## v0.4

- Multi-Agent parallel execution
- Agent workspaces
- Patch manager improvements

## v0.5

- KVDOS Cloud account
- Licensing
- Subscriptions
- Signed packages

## v0.6

- Local Runner connected to Cloud
- Team workspace basic

## v0.7

- Limited Evolution System
- Generate packages only

## v1.0

- Agency-ready product
- Learning system stable
- Quality gates
- GitHub export
- Private knowledge base

---

# 63. Risks and Mitigations

## Risk: Scope Explosion

Mitigation:

```text
MVP Scope
Architecture Freeze
Deferred Features
Complexity Budget
```

## Risk: Agent Chaos

Mitigation:

```text
Task Queue
MasterAgent
Patch Manager
Contracts
Blackboard
```

## Risk: Bad Learning

Mitigation:

```text
CuratorAgent
Knowledge promotion
Confidence scoring
Provenance
```

## Risk: Security Leakage

Mitigation:

```text
Secret Manager
Redaction
Privacy Layer
Local Runner
No secrets in prompts
```

## Risk: Subscription Cracking

Mitigation:

```text
Signed license tokens
Cloud entitlements
Signed packages
Signed updates
Rust secure core
No private keys in client
```

## Risk: Evolution System Unsafe

Mitigation:

```text
No direct mutation
Sandbox
Approval
Rollback
Feature flags
Safe mode
```

---

# 64. Final Operating Rules

```text
1. Always start from Discovery.
2. Always generate Blueprint.
3. Always produce app.kvdos.yaml.
4. Always validate Spec.
5. Always generate Tasks.
6. Agents work only through Tasks.
7. Tasks run through FIFO Queue.
8. MasterAgent coordinates only.
9. Specialized Agents generate Patches.
10. Patch Manager controls merge.
11. Sandbox runs code.
12. Quality Gates decide delivery.
13. Learning System stores experience.
14. Evolution System proposes updates safely.
15. Licensing controls commercial access.
16. Local Runner protects user code.
17. Cloud controls subscription and packages.
18. Enterprise can self-host.
```

---

# 65. Final Summary

KVDOS is a **AI Software Factory Operating System**.

It is built around this chain:

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

The core product strategy:

```text
SaaS-first distribution
Local Runner for privacy
Enterprise self-hosted later
```

The core technical stack:

```text
React/TypeScript
FastAPI/Python
Rust/Tauri
SQLite/PostgreSQL
Docker
OpenAI API + Model Router
```

The core commercial protection:

```text
Signed license tokens
Cloud entitlements
Signed packages
Signed updates
No secrets in client
Rust secure core
```

The most important principle:

```text
KVDOS does not let AI act randomly.
KVDOS turns AI into an organized, auditable, secure, learning software factory.
```

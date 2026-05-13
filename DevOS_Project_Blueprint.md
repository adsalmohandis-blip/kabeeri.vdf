# Kabeeri VDOS — AI Software Factory Operating System

> **Kabeeri VDOS** هو نظام تشغيل تطبيقي لبناء البرمجيات بالذكاء الاصطناعي.  
> يحوّل فكرة المستخدم إلى أسئلة تحليلية، ثم إلى Blueprint، ثم إلى `app.kvdos.yaml`، ثم إلى Tasks FIFO، ثم يوزعها على Agents متخصصة، ثم يدمج النتائج عبر Patches، ويختبر ويسلم التطبيق، ثم يتعلم من التجربة، ويمكنه تطوير نفسه بطريقة آمنة.

---

## 1. التعريف المختصر

**Kabeeri VDOS = AI Software Factory OS**

ليس مجرد AI Code Generator، بل منصة كاملة لإدارة دورة حياة بناء التطبيقات:

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
Master Agent + Specialized Agents
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

---

## 2. الهدف من النظام

النظام مصمم لبناء تطبيقات برمجية كاملة، خصوصًا تطبيقات الأعمال المتكررة مثل:

- CRM
- Clinic Management
- School Management
- Inventory Management
- Booking Systems
- Accounting Systems
- Admin Dashboards
- SaaS MVPs
- Internal Tools

النظام لا يبدأ بكتابة الكود مباشرة، بل يبدأ بفهم المطلوب وتحويله إلى مواصفات منظمة.

---

## 3. الجمهور المستهدف

### 3.1 الجمهور الأول

**Software Agencies / شركات البرمجة الصغيرة والمتوسطة**

لأنهم يبنون تطبيقات متكررة ويحتاجون:

- تسريع التحليل
- تقليل وقت كتابة boilerplate
- توحيد جودة المشاريع
- تخزين خبرة المشاريع السابقة
- تسليم MVP أسرع
- إنتاج توثيق واختبارات تلقائية

### 3.2 الجمهور الثاني

**Startups / Founders**

يستخدمون Kabeeri VDOS لبناء MVP منظم وليس مجرد كود عشوائي.

### 3.3 الجمهور الثالث لاحقًا

**Enterprise Internal Tools Teams**

يحتاجون:

- Self-hosted deployment
- Private knowledge base
- Audit logs
- SSO
- Policies
- Local-only/private mode

---

## 4. نموذج المنتج

أفضل نموذج:

```text
SaaS-first for distribution
+ Local Runner for privacy
+ Enterprise self-hosted later
```

### 4.1 Kabeeri VDOS Cloud

مسؤول عن:

- الحسابات
- الاشتراكات
- الخطط
- Package Marketplace
- تحديثات النظام
- Team collaboration
- Cloud Runner option
- Licensing
- Billing

### 4.2 Kabeeri VDOS Studio

واجهة المستخدم الرئيسية:

- Dashboard
- Discovery Session
- Blueprint Viewer
- Spec Viewer
- Task Queue
- Agent Activity
- File Explorer
- Logs
- Approvals
- Learning Center
- Package Manager

### 4.3 Kabeeri VDOS Runner

ينفذ فعليًا:

- Agents
- Tasks
- Docker builds
- Tests
- File generation
- Patch creation
- Sandbox execution

ويكون نوعين:

```text
Cloud Runner
Local Runner
```

### 4.4 Kabeeri VDOS Enterprise

نسخة self-hosted للشركات:

- Offline license
- Private package registry
- Private knowledge base
- SSO
- Full audit
- Local models
- Custom policies

---

## 5. التقنية البرمجية المقترحة

### 5.1 واجهة المستخدم

```text
TypeScript + React / Next.js
```

### 5.2 Desktop Shell

```text
Tauri + Rust
```

يستخدم لـ:

- Desktop wrapper
- License verification
- Update verification
- Integrity checks
- Runner control

### 5.3 Local Backend / Agent Runtime

```text
Python + FastAPI
```

يستخدم لـ:

- Agents
- Task Queue
- Learning System
- Sandbox orchestration
- LLM calls
- APIs

### 5.4 Secure Core

```text
Rust
```

للأجزاء الحساسة مثل:

- License verification
- Signed updates
- Integrity checks
- Local daemon
- Protection from tampering

### 5.5 Cloud Backend

```text
FastAPI أو Go
```

للخدمات السحابية:

- Licensing
- Billing
- Package registry
- Team sync
- Update server

### 5.6 Database

```text
SQLite محليًا في البداية
PostgreSQL للفرق و SaaS و Enterprise
```

### 5.7 Queue

MVP:

```text
SQLite-backed queue
```

لاحقًا:

```text
Redis + RQ / Celery
Temporal للـ workflows المعقدة
```

### 5.8 Sandbox

```text
Docker
```

### 5.9 AI Layer

```text
OpenAI API كبداية
Model Router
Embeddings
Local Models لاحقًا
```

### 5.10 التطبيقات المولدة في أول نسخة

```text
Frontend: React + TypeScript
Backend: FastAPI
Database: PostgreSQL
Deployment: Docker Compose
Auth: JWT / RBAC
```

---

## 6. القواعد المعمارية الأساسية

```text
1. app.kvdos.yaml هو مصدر الحقيقة.
2. لا Agent يعمل بدون Task.
3. الـ Tasks تأتي من التحليل أو من Task سابقة.
4. الـ Queue تعمل FIFO مع Dependencies.
5. MasterAgent ينسق ولا يكتب الكود.
6. Agents تنتج Patches فقط.
7. Patch Manager يدمج.
8. Sandbox يشغل الكود.
9. Quality Gates تمنع التسليم الرديء.
10. Learning System هو الذاكرة الدائمة.
11. Evolution System يطور النظام عبر Patches فقط.
12. الاشتراكات تتحكم بها Cloud Licensing.
13. الحزم والتحديثات موقعة.
14. لا أسرار داخل العميل.
15. Local Runner يحمي خصوصية الكود.
```

---

## 7. هيكل المشروع الكامل

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

## 8. مجلد Product

```text
product/
  product_vision.md
  target_audience.md
  pricing_model.md
  roadmap.md
  mvp_scope.yaml
  phase_plan.yaml
  deferred_features.yaml
  competitor_positioning.md
```

### 8.1 `product_vision.md`

يحتوي:

- ما هو Kabeeri VDOS؟
- لماذا موجود؟
- ما المشكلة التي يحلها؟
- لماذا ليس مجرد AI code generator؟
- ما الفرق بينه وبين IDEs وأدوات الكود؟

### 8.2 `target_audience.md`

الجمهور:

```text
1. Software agencies
2. Startups
3. Enterprise internal tools teams
4. Freelancers لاحقًا
```

### 8.3 `mvp_scope.yaml`

مثال:

```yaml
include:
  - discovery_system
  - app_kvdos_spec
  - fifo_task_queue
  - master_agent
  - backend_agent
  - frontend_agent
  - test_agent_basic
  - workspace
  - sandbox
  - patch_manager
  - local_runner
  - basic_learning_retrieval

exclude_now:
  - full_evolution_system
  - marketplace
  - enterprise_compliance
  - runtime_monitoring
  - auto_maintenance
  - multi_tenant_complex
```

---

## 9. System Constitution

```text
system_constitution/
  principles.yaml
  forbidden_actions.yaml
  escalation_rules.yaml
  safety_rules.yaml
```

### 9.1 المبادئ

```yaml
principles:
  - app.kvdos.yaml is the single source of truth.
  - Agents do not write directly to main workspace.
  - Agents produce patches.
  - All dangerous actions require approval.
  - Code runs only inside sandbox.
  - Every task is auditable.
  - Learning System stores durable knowledge.
  - Agent memory is temporary.
  - Evolution System proposes changes, not direct mutations.
  - Rollback must exist for system updates.
```

### 9.2 أفعال ممنوعة

```yaml
forbidden:
  - agent.direct_workspace_write
  - agent.bypass_task_queue
  - evolution.modify_core_without_approval
  - package.install_unsigned
  - sandbox.run_unrestricted
  - secret.expose_to_llm
  - delete.audit_logs
  - disable.security_engine
```

---

## 10. Apps

### 10.1 Kabeeri VDOS Cloud

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

  backend/
    main.py
    routes/
      auth.py
      billing.py
      licenses.py
      packages.py
      teams.py
      projects.py
      runners.py
      updates.py
    services/
    db/
```

مسؤول عن:

- الحسابات
- الاشتراكات
- الخطط
- Marketplace
- Package registry
- تحديثات
- Team workspaces
- Cloud Runner

---

### 10.2 Kabeeri VDOS Studio

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
    components/
    lib/

  local_backend/
    main.py
    api/
    services/
```

---

### 10.3 Kabeeri VDOS Runner

```text
apps/runner/
  local_runner/
    runner.py
    config.yaml
    connect_to_cloud.py
    task_listener.py
    sandbox_executor.py
    health_check.py

  cloud_runner/
    worker.py
    sandbox_pool.py
    job_executor.py
    isolation_policy.py
```

---

### 10.4 Enterprise

```text
apps/enterprise/
  self_hosted/
    docker-compose.yml
    helm/
    config/
    offline_license/
    private_registry/
    private_knowledge_base/
```

---

## 11. Core Boot

```text
core/boot/
  boot_manager.py
  config_loader.py
  dependency_checker.py
  service_registry.py
  safe_mode_boot.py
  recovery_boot.py
```

Boot sequence:

```text
Load config
  ↓
Check Docker
  ↓
Check DB
  ↓
Start Event Bus
  ↓
Start Kernel
  ↓
Load Installed Packages
  ↓
Start Task Queue
  ↓
Start Agent Runtime
  ↓
Start Learning System
  ↓
Start API/UI
```

---

## 12. Kernel

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

وظائفه:

- Syscall routing
- Capability checks
- Resource management
- Project registry
- Agent access control
- Event emission
- Audit bridge

---

## 13. Commands and Events

### 13.1 Commands

```text
core/commands/
  command_schema.py
  command_router.py
  command_validator.py
  command_log.py
  commands.yaml
```

أمثلة:

```text
CREATE_PROJECT
START_DISCOVERY
GENERATE_SPEC
CREATE_TASKS
RUN_TASK
INSTALL_PACKAGE
APPLY_PATCH
ROLLBACK_UPDATE
```

### 13.2 Events

```text
core/events/
  event_bus.py
  event_store.py
  event_router.py
  event_schema_registry.py
  subscribers.py
  events.yaml
```

أمثلة:

```text
discovery.completed
blueprint.generated
spec.created
task.created
task.started
task.completed
task.failed
patch.created
patch.merged
build.failed
learning.updated
evolution.patch.proposed
```

---

## 14. Contracts and Schemas

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

الهدف: منع التواصل العشوائي بين المكونات.

---

## 15. State Machine

```text
core/state_machine/
  project_lifecycle.py
  project_states.yaml
  transition_validator.py
```

الحالات:

```text
IDEA_RECEIVED
DISCOVERY_IN_PROGRESS
DISCOVERY_COMPLETED
BLUEPRINT_REVIEW
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

---

## 16. Workflow Orchestrator

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

### `build_app.yaml`

```yaml
steps:
  - start_discovery
  - generate_blueprint
  - generate_spec
  - validate_spec
  - plan_tasks
  - enqueue_tasks
  - run_agents
  - merge_patches
  - run_tests
  - quality_gate
  - package_output
  - post_project_learning
```

---

## 17. Transactions / Saga

```text
core/transactions/
  saga_manager.py
  transaction_log.py
  compensation_actions.py
  rollback_hooks.py
```

تستخدم في:

- install package
- apply evolution update
- deploy app
- import knowledge pack
- rollback system update

---

## 18. Task System — FIFO

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

### 18.1 القاعدة

```text
Spec → Tasks → FIFO Queue → Dispatcher → Agents → Patches
```

### 18.2 حالات Task

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

### 18.3 Task مثال

```json
{
  "id": "task_0007",
  "project_id": "clinic_001",
  "title": "Generate patients backend module",
  "type": "backend.generate_module",
  "queue": "backend",
  "assigned_agent_type": "BackendAgent",
  "status": "PENDING",
  "dependencies": ["task_0002", "task_0003"],
  "input": {
    "module": "patients",
    "spec_refs": [
      "entities.Patient",
      "api.patients"
    ]
  },
  "risk": "low",
  "attempts": 0,
  "max_attempts": 3
}
```

### 18.4 FIFO مع Dependencies

```text
FIFO داخل كل Queue
لكن لا تنفذ Task حتى تكتمل Dependencies
```

---

## 19. Agent Runtime

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

كل Agent يعرف:

- Task types التي يستطيع تنفيذها
- Capabilities المطلوبة
- Input contract
- Output contract
- Risk level
- Memory scope

---

## 20. Agents

```text
core/agents/
  master_agent.py
  discovery_agent.py
  requirements_agent.py
  architect_agent.py
  database_agent.py
  backend_agent.py
  uiux_agent.py
  frontend_agent.py
  test_agent.py
  security_agent.py
  devops_agent.py
  documentation_agent.py
  reviewer_agent.py
  repair_agent.py
  conflict_resolver_agent.py
  curator_agent.py
```

### 20.1 MasterAgent

الدور:

```text
Project Orchestrator / Supervisor
```

وظائفه:

- قراءة `app.kvdos.yaml`
- إنشاء Task Graph
- إدخال Tasks في FIFO Queue
- مراقبة التنفيذ
- التعامل مع فشل Tasks
- إنشاء Repair Tasks
- تحديث Blackboard
- تسجيل Decision Ledger
- طلب Approvals
- إعلان اكتمال المراحل

لا يفعل:

- لا يكتب الكود مباشرة
- لا يثبت Packages مباشرة
- لا يتجاوز Kernel
- لا يغير Security Policy

### 20.2 Specialized Agents

#### DatabaseAgent

- Entities
- Migrations
- DB schema
- Relationships

#### BackendAgent

- APIs
- Services
- Models
- Auth
- Business logic

#### UIUXAgent

- Personas
- Journeys
- Layouts
- Design system
- Wireframe direction

#### FrontendAgent

- Pages
- Components
- Forms
- Tables
- API client

#### TestAgent

- Unit tests
- API tests
- Acceptance tests
- RBAC tests

#### SecurityAgent

- Auth review
- Secrets review
- Permission checks
- OWASP-style review

#### DevOpsAgent

- Dockerfile
- docker-compose
- env examples
- deployment notes

#### RepairAgent

- يعمل فقط عند فشل build/test/contract
- يقترح Patch محدود بالخطأ

#### ReviewerAgent

- يراجع النتيجة مقابل Spec

#### ConflictResolverAgent

- يحل تعارضات Agents وPatches

#### CuratorAgent

- يراجع Lessons قبل دخولها Learning System

---

## 21. Multi-Agent Runtime

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

القاعدة:

```text
Parallel Thinking
Isolated Writing
Controlled Merging
Shared Contracts
Central Orchestration
```

### 21.1 Agent Workspaces

```text
projects/project_001/.kvdos/agent_workspaces/
  backend_agent/
  frontend_agent/
  database_agent/
  uiux_agent/
  test_agent/
```

### 21.2 Blackboard

```text
project_blackboard/
  current_phase.json
  decisions.json
  open_questions.json
  blocked_tasks.json
  agent_notes.json
  contracts_status.json
```

### 21.3 Decision Ledger

```json
{
  "decision_id": "decision_014",
  "decision": "Use PostgreSQL instead of SQLite",
  "reason": "The app requires relational reports and multiple user roles",
  "source": "app.kvdos.yaml",
  "approved_by": "user",
  "affects": ["database", "backend", "deployment"]
}
```

---

## 22. Discovery System

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

  question_bank/
    general.yaml
    uiux.yaml
    system_design.yaml
    security.yaml
    deployment.yaml
    domains/
      clinic.yaml
      crm.yaml
      ecommerce.yaml
      school.yaml
      accounting.yaml

  playbooks/
    clinic_discovery_playbook.yaml
    crm_discovery_playbook.yaml
    ecommerce_discovery_playbook.yaml

  sessions/
```

### 22.1 وظيفة Discovery System

- يسأل المستخدم أسئلة
- يستنتج المطلوب
- يكتشف الغموض
- يكتشف التعارض
- يبني Blueprint
- ينتج Acceptance Criteria
- يحدد MVP Scope
- يحدد User Personas
- يحدد User Journeys
- يحدد NFRs

### 22.2 أنواع الأسئلة

- هدف التطبيق
- المستخدمون والصلاحيات
- الميزات
- البيانات
- UI/UX
- System Design
- الأمان
- النشر
- التكاملات
- الأولويات

### 22.3 Starter Modes

```text
Quick Mode
Standard Mode
Deep Mode
Enterprise Mode
```

---

## 23. Kabeeri VDOS Spec System / IR

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

### 23.1 مصدر الحقيقة

```text
app.kvdos.yaml
```

### 23.2 مثال Spec

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

  - name: PatientProfile
    type: detail_page
    entity: Patient
```

---

## 24. Learning System

```text
core/learning_system/
  service.py

  ingestion/
    document_importer.py
    parser.py
    chunker.py
    metadata_extractor.py
    knowledge_classifier.py

  memory/
    raw_document_store.py
    structured_knowledge_store.py
    vector_index.py
    project_memory.py
    feedback_store.py

  retrieval/
    retriever.py
    reranker.py
    context_builder.py
    context_compressor.py

  learning_loop/
    post_project_analyzer.py
    lesson_extractor.py
    pattern_extractor.py
    case_study_builder.py
    knowledge_curator.py

  evaluation/
    uiux_evaluator.py
    system_design_evaluator.py
    code_quality_evaluator.py
    security_evaluator.py

  quality/
    confidence_scorer.py
    contradiction_detector.py
    outdated_knowledge_detector.py
    duplicate_detector.py
    usage_tracker.py

  promotion/
    candidate_store.py
    curator_review.py
    publish_to_pack.py

  knowledge/
    uiux/
    system_design/
    domains/
    case_studies/
    lessons/
    anti_patterns/
    code_patterns/

  indexes/
  feedback/
```

### 24.1 ماذا يخزن؟

- UI/UX patterns
- System design patterns
- Domain case studies
- Previous system specs
- Lessons learned
- Anti-patterns
- Build errors and fixes
- User feedback
- Architecture decisions
- Code patterns

### 24.2 استيراد وثائق أنظمة

```text
PDF / Markdown / Word / README / OpenAPI / DB schema
  ↓
Parser
  ↓
Chunker
  ↓
Metadata Extractor
  ↓
Knowledge Classifier
  ↓
Structured Knowledge
  ↓
Vector Index
```

### 24.3 Post-Project Learning

```text
Project Completed
  ↓
Analyze output
  ↓
Extract lessons
  ↓
Extract patterns
  ↓
Create case study
  ↓
Curator review
  ↓
Update knowledge index
```

---

## 25. Evolution System

```text
core/evolution_system/
  evolution_orchestrator.py

  agents/
    evolution_master_agent.py
    product_agent.py
    codebase_analyzer_agent.py
    patch_planner_agent.py
    code_generation_agent.py
    migration_agent.py
    test_agent.py
    security_review_agent.py
    documentation_agent.py
    release_agent.py

  services/
    codebase_indexer.py
    change_request_service.py
    patch_service.py
    release_builder.py
    compatibility_checker.py

  policies/
    evolution_policy.yaml
    risk_rules.yaml

  update_packages/
```

### 25.1 وظيفة Evolution System

- تطوير Kabeeri VDOS نفسه
- إنشاء Packages جديدة
- تعديل Packages موجودة
- إنشاء Update Packages
- اختبار التحديث داخل Sandbox
- طلب موافقة
- توفير Rollback

### 25.2 القاعدة

```text
Evolution System does not mutate core directly.
It proposes patches and update packages.
```

---

## 26. Package Manager

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

### 26.1 أنواع الحزم

```text
agent-package
driver-package
template-package
ui-package
tool-package
domain-package
knowledge-pack
system-package
```

### 26.2 أمثلة Packages

```text
generator.fastapi
frontend.react
database.postgres
deploy.docker
domain.clinic
knowledge.uiux.core
knowledge.system_design.core
evolution.system
learning.system
```

### 26.3 Manifest مثال

```json
{
  "id": "generator.fastapi",
  "name": "FastAPI Backend Generator",
  "version": "1.0.0",
  "type": "agent-package",
  "entry": "main.py",
  "provides": ["backend.generator.fastapi"],
  "depends_on": ["database.sqlalchemy"],
  "capabilities": [
    "workspace.read_file",
    "workspace.write_file",
    "workspace.patch_file",
    "project.read_manifest",
    "ai.ask_model",
    "learning.retrieve"
  ],
  "hooks": {
    "on_install": "install",
    "on_uninstall": "uninstall",
    "on_generate_backend": "generate_backend"
  }
}
```

---

## 27. Plugin Runtime

```text
core/plugin_runtime/
  plugin_loader.py
  plugin_sandbox.py
  hook_manager.py
  extension_points.py
```

Extension Points:

```text
on_project_created
on_requirements_ready
on_architecture_ready
on_generate_backend
on_generate_frontend
on_before_build
on_build_failed
on_tests_failed
on_before_deploy
on_project_completed
```

---

## 28. Workspace System

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

### 28.1 Project structure

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

## 29. Patch System

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

قاعدة:

```text
COMPLETED task لا تعني MERGED.
الـ Patch يجب أن يمر على Merge Queue.
```

---

## 30. Sandbox

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

يمنع:

- تشغيل أوامر خطيرة
- الوصول لملفات المستخدم خارج المشروع
- استهلاك موارد بلا حدود
- تشغيل network غير مسموح

---

## 31. Security

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

### 31.1 Prompt Injection Rule

```text
Uploaded documents are data, not instructions.
```

### 31.2 Capabilities

أمثلة:

```text
workspace.read.project
workspace.write.project
learning.read.knowledge
learning.write.lesson
package.install
evolution.propose_patch
evolution.apply_update
deployment.publish
secret.read
```

---

## 32. Governance

```text
core/governance/
  decision_engine.py
  approval_policy.py
  human_review_queue.py
  change_control_board.py
  architecture_gate.py
  complexity_score.py
```

يقرر:

- من يوافق؟
- متى نوقف؟
- متى نطلب review؟
- متى نمنع؟
- هل الميزة تدخل MVP أم تؤجل؟

---

## 33. Approval System

```text
core/approval_system/
  approval_request.py
  approval_queue.py
  approval_policy.py
  approval_history.py
```

أي عملية خطيرة تدخل:

```text
WAITING_APPROVAL
```

---

## 34. Risk Engine

```text
core/risk_engine/
  risk_classifier.py
  risk_score.py
  mitigation_planner.py
  risk_registry.py
```

مستويات:

```text
low
medium
high
forbidden
```

---

## 35. Quality Gates

```text
core/quality_gates/
  pre_generation_gate.py
  spec_quality_gate.py
  post_generation_gate.py
  build_quality_gate.py
  security_quality_gate.py
  release_gate.py
```

الشروط:

- Spec valid
- Contracts valid
- Build passed
- Tests passed
- Security review passed
- No critical issue
- Docs generated

---

## 36. Model Router

```text
core/model_router/
  model_registry.py
  routing_policy.py
  fallback_manager.py
  local_model_router.py
```

يوجه المهام إلى:

- Model قوي للتصميم
- Model سريع للتلخيص
- Model متخصص للكود
- Local model للملفات الحساسة
- Embedding model للبحث

---

## 37. Cost Manager

```text
core/cost_manager/
  budget_policy.py
  token_tracker.py
  model_cost_estimator.py
  cache_manager.py
  usage_limits.py
```

يتحكم في:

- Tokens
- LLM calls
- Parallel agents
- Project budget
- Subscription quota

---

## 38. Observability

```text
core/observability/
  metrics_collector.py
  trace_manager.py
  cost_tracker.py
  agent_performance_monitor.py
  task_metrics.py
  dashboard_adapter.py
```

يراقب:

- Agent success rate
- Task duration
- Build failure rate
- Cost
- Latency
- Token usage
- Package failures

---

## 39. Privacy

```text
core/privacy/
  data_classifier.py
  pii_detector.py
  redaction_engine.py
  retention_policy.py
  private_context_filter.py
  cloud_block_policy.py
```

قواعد:

```text
.env لا يذهب إلى LLM
API keys يتم redaction
customer data masked
private mode يمنع cloud calls
```

---

## 40. Rollback

```text
core/rollback/
  rollback_manager.py
  project_rollback.py
  package_rollback.py
  knowledge_rollback.py
  system_rollback.py
  rollback_verifier.py
```

يدعم:

- Project rollback
- Package rollback
- Knowledge rollback
- Prompt rollback
- System update rollback
- Evolution rollback

---

## 41. Artifact Registry

```text
core/artifact_registry/
  artifact_store.py
  artifact_metadata.py
  artifact_versioning.py
  artifact_lineage.py
```

يسجل:

- Blueprints
- Specs
- Patches
- Packages
- Prompts
- Knowledge Packs
- Build Logs
- Test Reports
- Deployments
- Updates
- Docs

---

## 42. Traceability

```text
core/traceability/
  trace_graph.py
  answer_to_spec_mapper.py
  requirement_to_code_mapper.py
  spec_to_test_mapper.py
  decision_trace.py
```

مثال trace:

```text
Question
  ↓
Answer
  ↓
Spec
  ↓
Task
  ↓
Patch
  ↓
Code
  ↓
Test
  ↓
Docs
```

---

## 43. Provenance

```text
core/provenance/
  source_tracker.py
  knowledge_lineage.py
  trust_score.py
```

يعرف مصدر كل معرفة:

- وثيقة
- مشروع سابق
- إجابة مستخدم
- درس مستخرج
- تقييم Agent

---

## 44. Policy

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

## 45. Migrations

```text
core/migrations/
  system_migrations/
  spec_migrations/
  knowledge_migrations/
  package_migrations/
  migration_runner.py
```

لأن كل شيء له نسخ:

- DB schema
- Spec schema
- Package manifest
- Knowledge schema
- Contracts
- Policies

---

## 46. Feature Flags

```text
core/feature_flags/
  flags.yaml
  flag_evaluator.py
```

مثال:

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

## 47. Health System

```text
core/health/
  health_score.py
  system_health.py
  learning_health.py
  package_health.py
  security_health.py
  evolution_safety.py
```

Health example:

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

## 48. Integration Bus

```text
core/integration_bus/
  integration_backbone.py
  service_router.py
  internal_gateway.py
  event_command_bridge.py
```

وظيفته:

```text
ربط كل الأنظمة عبر Events وCommands وContracts
بدل النداءات المباشرة العشوائية
```

---

## 49. Cloud Services

### 49.1 Licensing

```text
cloud_services/licensing/
  license_server.py
  license_token.py
  entitlement_service.py
  device_activation.py
  offline_license.py
```

يتحكم في:

- Plan
- Seats
- Feature entitlements
- Device binding
- Offline grace period
- Signed license tokens

### 49.2 Billing

```text
cloud_services/billing/
  plans.py
  subscriptions.py
  invoices.py
  payment_provider.py
```

Plans:

```text
Trial
Pro
Agency
Enterprise
```

### 49.3 Package Registry

```text
cloud_services/package_registry/
  registry_api.py
  package_upload.py
  package_signing.py
  package_download.py
  entitlement_check.py
```

### 49.4 Marketplace

```text
cloud_services/marketplace/
  listings.py
  publisher_accounts.py
  ratings.py
  reviews.py
  certification_status.py
```

### 49.5 Update Server

```text
cloud_services/update_server/
  update_manifest.py
  signed_updates.py
  rollout_manager.py
```

كل update موقّع.

---

## 50. حماية الاشتراكات والمنتج

### 50.1 المبادئ

```text
لا private keys داخل العميل
لا API secrets داخل العميل
كل License Token موقّع
كل Package مدفوعة تحتاج entitlement
كل Update موقّع
Offline grace محدود
Enterprise offline license موقّع
```

### 50.2 Secure Client

```text
core/security/licensing_client/
  license_verifier.rs
  token_store.rs
  entitlement_cache.rs
  offline_grace.rs
```

### 50.3 Code Protection

- Rust secure core
- Tauri signed app
- Signed updates
- Signed packages
- Integrity checks
- Cloud entitlements
- No secrets in client

### 50.4 Subscription Controls

الاشتراك يتحكم في:

- عدد المشاريع
- عدد Agents المتوازية
- عدد Tasks
- Packages premium
- Knowledge Packs premium
- Team collaboration
- GitHub export
- Evolution System
- Private mode
- Cloud Runner

---

## 51. Generated Apps

```text
generated_apps/
  project_001/
    .kvdos/
      manifest.json
      app.kvdos.yaml
      discovery/
      tasks/
      trace_graph/
      test_reports/
      build_logs/
      docs/

    app/
      backend/
      frontend/
      database/
      tests/
      docker-compose.yml
      README.md
```

---

## 52. Packages

```text
packages/
  available/
    generator.fastapi/
    frontend.react/
    database.postgres/
    deploy.docker/
    domain.clinic/
    knowledge.uiux.core/

  installed/
  cache/
  registry_index.json
  installed_packages.json
```

Package structure:

```text
generator.fastapi/
  kvdos.package.json
  main.py
  README.md
  tests/
  templates/
  prompts/
```

---

## 53. Knowledge Packs

```text
knowledge_packs/
  knowledge.uiux.core/
  knowledge.system_design.core/
  knowledge.domain.crm/
  knowledge.domain.clinic/
  knowledge.domain.ecommerce/
  knowledge.security.web_apps/
```

---

## 54. Templates

```text
templates/
  fastapi_react_postgres/
  crm_basic/
  clinic_management/
  ecommerce_mvp/
  admin_dashboard/
```

---

## 55. Golden Projects

```text
golden_projects/
  simple_todo/
    input_prompt.txt
    expected_blueprint.json
    expected_spec.yaml
    expected_tasks.json
    quality_thresholds.yaml

  crm_basic/
  clinic_management/
  ecommerce_mvp/
  school_system/
```

تستخدم لاختبار جودة Kabeeri VDOS نفسه.

---

## 56. Tests

```text
tests/
  unit/

  integration/
    test_full_app_generation.py
    test_package_install_uninstall.py
    test_learning_import.py
    test_evolution_patch_flow.py
    test_rollback_flow.py
    test_task_queue_fifo.py
    test_master_agent_flow.py

  policy/
    test_agent_permissions.py
    test_package_policy.py
    test_evolution_policy.py

  security/
    test_prompt_injection.py
    test_secret_redaction.py

  contract/
    test_spec_to_tests.py
    test_api_contract.py
```

---

## 57. SDK

```text
sdk/
  agent_sdk/
  package_sdk/
  driver_sdk/
  knowledge_pack_sdk/
  testing_sdk/
```

الغرض:

- بناء Agents جديدة
- بناء Packages
- بناء Drivers
- بناء Knowledge Packs
- اختبار التكامل

---

## 58. Scripts

```text
scripts/
  kvdos_start.sh
  kvdos_start.ps1
  kvdos_init_project.py
  kvdos_install_package.py
  kvdos_run_worker.py
  kvdos_safe_mode.py
```

---

## 59. CLI Commands

```bash
kvdos start

kvdos project create
kvdos project build
kvdos project test
kvdos project export

kvdos pkg list
kvdos pkg install generator.fastapi
kvdos pkg uninstall generator.fastapi

kvdos learn import ./docs
kvdos learn index
kvdos learn search "clinic dashboard"

kvdos evolve "أضف دعم Flutter"

kvdos emergency stop
kvdos safe-mode
```

---

## 60. تدفق بناء تطبيق كامل

```text
User creates project
  ↓
Discovery System asks questions
  ↓
Blueprint generated
  ↓
app.kvdos.yaml generated
  ↓
Spec validated
  ↓
MasterAgent creates Task Graph
  ↓
Tasks enter FIFO Queue
  ↓
Dispatcher assigns Tasks to Agents
  ↓
Agents work in isolated workspaces
  ↓
Agents produce Patches
  ↓
Patch Manager validates and merges
  ↓
Build/Test runs in Sandbox
  ↓
RepairAgent fixes failures
  ↓
SecurityAgent reviews
  ↓
Quality Gates pass
  ↓
Generated App delivered
  ↓
Post-Project Learning stores lessons
```

---

## 61. تدفق تطوير Kabeeri VDOS نفسه

```text
User requests system improvement
  ↓
Evolution System analyzes request
  ↓
Learning System retrieves relevant patterns
  ↓
Codebase Analyzer analyzes current system
  ↓
Patch Planner creates plan
  ↓
Code Generation Agent creates package/patch
  ↓
Sandbox tests update
  ↓
Security Review
  ↓
Governance Approval
  ↓
Update Manager applies
  ↓
Rollback remains available
  ↓
Learning System records result
```

---

## 62. أول MVP حقيقي

### MVP v0.1

```text
Kabeeri VDOS Studio Local Web
FastAPI backend
React UI
SQLite
Basic FIFO Task Queue
MasterAgent
BackendAgent
FrontendAgent
Basic TestAgent
Workspace
Basic Patch Manager
Docker Sandbox
Basic Discovery
app.kvdos.yaml
Export ZIP
```

### أول نوع تطبيق

```text
CRM Basic
أو
Clinic Basic
```

### أول Stack مولد

```text
React + TypeScript
FastAPI
PostgreSQL
Docker Compose
JWT Auth
RBAC Basic
```

---

## 63. Roadmap

### v0.1

- Local Studio
- FIFO Tasks
- MasterAgent
- Basic Agents
- Basic generated app

### v0.2

- Learning retrieval
- Import docs
- Basic case studies

### v0.3

- Package Manager
- Install/uninstall packages
- generator.fastapi
- frontend.react

### v0.4

- Multi-Agent parallel execution
- Agent workspaces
- Patch manager improvements

### v0.5

- Kabeeri VDOS Cloud account
- Licensing
- Subscriptions
- Signed packages

### v0.6

- Local Runner connected to Cloud
- Team workspace basic

### v0.7

- Limited Evolution System
- Generate packages only

### v1.0

- Agency-ready product
- Learning system stable
- Quality gates
- GitHub export
- Private knowledge base

---

## 64. أهم المخاطر

### 64.1 تضخم التصميم

الحل:

```text
Architecture Freeze
MVP Scope
Phase Plan
Deferred Features
```

### 64.2 فوضى Agents

الحل:

```text
Task Queue
MasterAgent
Patch Manager
Blackboard
Contracts
```

### 64.3 تسريب أسرار

الحل:

```text
Privacy Layer
Secret Manager
Redaction
No secrets in prompts
```

### 64.4 كسر الاشتراك

الحل:

```text
Signed License Tokens
Cloud entitlements
Signed packages
Rust secure core
No private keys in client
```

### 64.5 تعلم خاطئ

الحل:

```text
CuratorAgent
Knowledge Promotion Pipeline
Confidence scoring
Provenance
```

### 64.6 Evolution System خطير

الحل:

```text
No direct core mutation
Sandbox
Approval
Rollback
Feature flags
Safe mode
```

---

## 65. الخلاصة النهائية

Kabeeri VDOS ليس برنامجًا واحدًا، بل نظام تشغيل تطبيقي لبناء البرمجيات.

أقصر معادلة:

```text
Discovery
→ Spec
→ Tasks
→ Agents
→ Patches
→ Tests
→ Delivery
→ Learning
→ Evolution
```

وأهم جملة:

```text
Kabeeri VDOS لا يجعل الذكاء الاصطناعي يكتب كودًا فقط.
Kabeeri VDOS يحوّل الذكاء الاصطناعي إلى مصنع برمجيات منظم، قابل للتعلم، قابل للتوسع، وقابل للحماية تجاريًا.
```



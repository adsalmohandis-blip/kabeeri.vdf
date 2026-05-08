# Kabeeri-vdf — DEEP Codex Execution Command Pack

This is the markdown version of the DEEP execution pack.

Project: **Kabeeri-vdf**

Core rule: `.kabeeri/` is source of truth; CLI is an engine; VS Code/Dashboard/Docs are user-facing layers.

## Master Prompt

```text
You are working inside the Kabeeri-vdf repository.
Your job is to prepare the project for real operational production and publishing.

You must NOT implement from a summary only.
First read all roadmap source documents for v1, v2, v3, v4, v5, v6, and the v7 design governance requirements.

Critical execution order:
1. Create a safe execution session and mutation policy.
2. Create ROADMAP_SOURCE_INDEX.md.
3. Create REQUIREMENTS_TRACEABILITY_MATRIX.md.
4. Create CURRENT_REPOSITORY_ANALYSIS.md.
5. Create V1_STABLE_FOUNDATION_AUDIT.md.
6. Create IMPLEMENTATION_PLAN.md and PHASE_TASK_BREAKDOWN.md.
7. Implement in small phases only.
8. Stop after every phase and report.

Never:
- overwrite existing Kabeeri work blindly
- push directly to main
- expose secrets
- generate unrelated app code
- use raw design images/PDFs/links as implementation specs
- close or verify tasks without Owner verification rules

Expected first output:
- docs/reports/EXECUTION_SESSION_LOG.md
- docs/reports/ROADMAP_SOURCE_INDEX.md
- docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md
- docs/reports/CURRENT_REPOSITORY_ANALYSIS.md
- docs/reports/IMPLEMENTATION_PLAN.md
No destructive changes.
```

## Phase order

### PHASE-00 — Execution Safety, Branching, and No-Mutation Gate

**Goal:** منع Codex من البدء العشوائي، وإنشاء فرع عمل آمن، وتثبيت قاعدة أن أي تعديل يجب أن يكون قابلًا للمراجعة والرجوع.

**Outputs:**
- `docs/reports/EXECUTION_SESSION_LOG.md`
- `docs/reports/SAFE_RUN_DECISION.md`
- `docs/reports/REPO_MUTATION_POLICY.md`

**Checks:**
- لا تعديل قبل scan
- لا push إلى main
- لا حذف بدون تقرير
- كل مرحلة تنتهي بتقرير

**Codex command:**

```text
You are working inside the Kabeeri-vdf repository.
Before changing anything, create a safe execution session.
Rules:
- Do not modify source files yet.
- Check git status.
- If not already on a feature branch, recommend a branch name: chore/deep-production-readiness.
- Do not push to main.
- Create docs/reports/EXECUTION_SESSION_LOG.md.
- Create docs/reports/REPO_MUTATION_POLICY.md.
- Stop and report.
```

### PHASE-01 — Roadmap Source Pack Ingestion

**Goal:** إجبار Codex على عدم الاعتماد على ملخص قصير فقط، بل قراءة كل ملفات v1-v6 ومصدر v7 وإنشاء فهرس مصادر رسمي.

**Outputs:**
- `docs/reports/ROADMAP_SOURCE_INDEX.md`
- `docs/reports/ROADMAP_SOURCE_INTEGRITY_REPORT.md`
- `docs/reports/SOURCE_TO_PHASE_MAP.md`

**Checks:**
- كل ملف roadmap مذكور باسمه
- كل تحديث له scope وmilestones وissues
- أي مصدر ناقص يظهر كـ blocker

**Codex command:**

```text
Read all roadmap source documents available in the repository or codex_context/roadmap_sources/.
Create docs/reports/ROADMAP_SOURCE_INDEX.md.
For each source, record:
- file name
- version covered
- main goals
- key layers
- issue/milestone count if available
- whether content is complete or partial
Do not implement yet.
If a source is missing, mark it as BLOCKER and create a required-action note.
```

### PHASE-02 — Requirements Traceability Matrix

**Goal:** تحويل كل مطلب من v1-v7 إلى Requirement ID وربطه بملف/فولدر/تاسك واضح، لمنع نسيان أي تفصيلة.

**Outputs:**
- `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `docs/reports/PHASE_TASK_BREAKDOWN.md`
- `docs/reports/MISSING_REQUIREMENTS_BACKLOG.md`

**Checks:**
- كل Requirement له source version
- كل Requirement له target files
- كل Requirement له status
- كل Missing له task

**Codex command:**

```text
Create a Requirements Traceability Matrix for Kabeeri-vdf.
Do not implement yet.
For every requirement from v1-v7, create a row with:
- requirement_id
- source_version
- source_section_or_issue
- requirement_summary
- required_files_or_folders
- implementation_type: docs/spec/schema/template/example/code/future
- status: exists/partial/missing/deferred/unclear
- priority
- acceptance_check
- related_phase
Save it to docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md.
Also create PHASE_TASK_BREAKDOWN.md with small tasks.
```

### PHASE-03 — Current Repository Deep Scan and v1 Stable Audit

**Goal:** فحص Kabeeri-vdf الحالي بعمق، خصوصًا v1 لأنه النسخة المنشورة والأساس الذي سنبني عليه.

**Outputs:**
- `docs/reports/CURRENT_REPOSITORY_ANALYSIS.md`
- `docs/reports/V1_STABLE_FOUNDATION_AUDIT.md`
- `docs/reports/V1_FIX_PLAN.md`

**Checks:**
- README وREADME_AR
- generators
- questionnaires
- prompt_packs
- task_tracking
- acceptance_checklists
- examples
- schemas
- docs

**Codex command:**

```text
Run a deep repository scan for Kabeeri-vdf.
Create CURRENT_REPOSITORY_ANALYSIS.md and V1_STABLE_FOUNDATION_AUDIT.md.
Audit v1 foundation areas:
- README and README_AR
- docs/ar and docs/en
- generators and schemas
- questionnaires
- prompt_packs
- task_tracking
- acceptance_checklists
- examples
- CLI design
- VS Code planning
- roadmap/release docs
Classify each as ok/partial/missing/outdated/duplicate.
Do not implement fixes yet; create V1_FIX_PLAN.md.
```

### PHASE-04 — Apply v1 Stabilization Fixes

**Goal:** إصلاح الأساس المنشور فقط بعد التدقيق، بدون تغيير فلسفة v1 أو خلطها بتحديثات v2-v7.

**Outputs:**
- `docs/reports/V1_STABILIZATION_REPORT.md`
- `docs/production/V1_CURRENT_STATE.md`

**Checks:**
- لا تحويل v1 إلى Agile
- لا حذف محتوى موجود
- الدوكس مفهومة للمستخدم الجديد
- روابط داخلية سليمة

**Codex command:**

```text
Apply only safe v1 stabilization fixes from V1_FIX_PLAN.md.
Do not introduce v2-v7 concepts into v1 pages except as future roadmap links.
Update docs and indexes if needed.
Create docs/reports/V1_STABILIZATION_REPORT.md with:
- files changed
- reason
- risks
- what remains deferred.
```

### PHASE-05 — Apply v2 Deep Foundations

**Goal:** تطبيق v2 بتفاصيله: Structured/Agile، Project Intake، Task Governance، Provenance، AI Usage foundation.

**Outputs:**
- `delivery_modes/`
- `project_intake/`
- `task_tracking/ governance files`
- `agile_delivery/`
- `.kabeeri/ai_usage examples`

**Checks:**
- Structured وAgile لا يلغيان بعض
- مشروع جديد/موجود/غير كبيري موثق
- كل Task لها source
- Sprint cost metadata موجود

**Codex command:**

```text
Implement v2 foundations from the traceability matrix.
Create/update:
- delivery_modes/README.md
- delivery_modes/STRUCTURED_DELIVERY.md
- delivery_modes/AGILE_DELIVERY.md
- delivery_modes/DELIVERY_MODE_SELECTION_GUIDE.md
- project_intake/README.md
- project_intake/NEW_PROJECT.md
- project_intake/EXISTING_KABEERI_PROJECT.md
- project_intake/EXISTING_NON_KABEERI_PROJECT.md
- task_tracking/TASK_CREATION_RULES.md
- task_tracking/TASK_INTAKE_TEMPLATE.md
- task_tracking/TASK_DEFINITION_OF_READY.md
- task_tracking/TASK_ASSIGNMENT_RULES.md
- task_tracking/TASK_SOURCE_RULES.md
- task_tracking/TASK_PROVENANCE_SCHEMA.json
- agile_delivery/README.md
- agile_delivery/PRODUCT_BACKLOG_TEMPLATE.md
- agile_delivery/EPIC_TEMPLATE.md
- agile_delivery/USER_STORY_TEMPLATE.md
- agile_delivery/SPRINT_PLANNING_TEMPLATE.md
- agile_delivery/SPRINT_REVIEW_TEMPLATE.md
- agile_delivery/SPRINT_COST_METADATA_SCHEMA.json
- .kabeeri/ai_usage/README.md
Stop after v2 report.
```

### PHASE-06 — Apply v3 Platform Integration Layer

**Goal:** تثبيت .kabeeri كمصدر الحقيقة، ومواصفات GitHub/VS Code/Dashboard/Owner Verify/AI Token Cost.

**Outputs:**
- `.kabeeri examples`
- `github_sync specs`
- `dashboard specs`
- `vscode docs`
- `AI cost analytics docs`

**Checks:**
- Dashboard ليس Source of Truth
- Owner-only verify واضح
- GitHub لا يتعدل بدون موافقة
- تكلفة التوكنز قابلة للعرض

**Codex command:**

```text
Implement v3 platform specs from the traceability matrix.
Create/update:
- .kabeeri/README.md
- .kabeeri/project.json.example
- .kabeeri/tasks.json.example
- .kabeeri/audit_log.example.jsonl
- .kabeeri/dashboard/technical_state.example.json
- .kabeeri/dashboard/business_state.example.json
- .kabeeri/github/sync_config.example.json
- .kabeeri/github/issue_map.example.json
- github_sync/GITHUB_SYNC_RULES.md
- github_sync/GITHUB_ISSUE_MAPPING.md
- vscode_extension/README.md
- vscode_extension/COMMAND_PALETTE_PLAN.md
- dashboard/TECHNICAL_DASHBOARD_SPEC.md
- dashboard/BUSINESS_DASHBOARD_SPEC.md
- dashboard/AI_TOKEN_COST_DASHBOARD_SPEC.md
- dashboard/SPRINT_COST_DASHBOARD_SPEC.md
- task_tracking/OWNER_VERIFY_RULES.md
Create v3 implementation report.
```

### PHASE-07 — Apply v4 Multi-AI Governance

**Goal:** إدارة أكثر من مطور أو AI Agent بدون تداخل: Owner واحد، tokens، locks، budgets، audit.

**Outputs:**
- `governance/`
- `.kabeeri access tokens`
- `.kabeeri locks`
- `budgets and audit specs`

**Checks:**
- Owner واحد فقط
- Access Tokens منفصلة عن AI Usage Tokens
- locks تمنع التضارب
- verify من Owner فقط

**Codex command:**

```text
Implement v4 multi-AI governance.
Create/update:
- governance/README.md
- governance/ROLE_PERMISSION_MATRIX.md
- governance/SINGLE_OWNER_RULE.md
- governance/OWNER_TRANSFER_TOKEN.md
- governance/TASK_ACCESS_TOKENS.md
- governance/ACCESS_TOKEN_LIFECYCLE.md
- governance/LOCKING_RULES.md
- governance/ASSIGNMENT_EXECUTION_GOVERNANCE.md
- governance/AI_DEVELOPER_OUTPUT_CONTRACT.md
- governance/TOKEN_BUDGET_RULES.md
- governance/OWNER_VERIFY_TOKEN_REVOCATION_AUDIT.md
- .kabeeri/developers.json.example
- .kabeeri/agents.json.example
- .kabeeri/locks.json.example
- .kabeeri/access_tokens/README.md
Create v4 implementation report.
```

### PHASE-08 — Apply v5 Intelligence, Adaptive Questions, and Trust Layer

**Goal:** تطبيق محرك الأسئلة الذكي، System Capability Map، الذاكرة، السياسات، الصحة، الأمان، والتسليم التجاري.

**Outputs:**
- `questionnaire_engine/`
- `standard_systems/`
- `.kabeeri/memory`
- `.kabeeri/policies`
- `.kabeeri/security`
- `.kabeeri/handoff`

**Checks:**
- أسئلة تكيفية لا ترهق المستخدم
- 53 System Areas موجودة
- Coverage Matrix
- Missing Answers Report
- Policy Engine
- Handoff

**Codex command:**

```text
Implement v5 intelligence and trust layer deeply.
Create/update:
- questionnaire_engine/README.md
- questionnaire_engine/QUESTIONNAIRE_FLOW_RULES.md
- questionnaire_engine/QUESTION_GROUP_SCHEMA.json
- questionnaire_engine/CONDITIONAL_GROUP_RULES.md
- questionnaire_engine/SYSTEM_AREA_ACTIVATION_RULES.md
- questionnaire_engine/QUESTIONNAIRE_MINIMIZATION_RULES.md
- questionnaire_engine/UNKNOWN_ANSWER_FOLLOWUP_RULES.md
- standard_systems/SYSTEM_CAPABILITY_MAP.md
- standard_systems/SYSTEM_AREAS_INDEX.md
- standard_systems/SYSTEM_AREA_SCHEMA.json
- standard_systems/COVERAGE_MATRIX_TEMPLATE.md
- standard_systems/MISSING_ANSWERS_REPORT_TEMPLATE.md
- standard_systems/examples/saas_capability_map.example.json
- standard_systems/examples/landing_page_capability_map.example.json
- .kabeeri/memory/README.md
- .kabeeri/adr/ADR_TEMPLATE.md
- .kabeeri/ai_runs/README.md
- .kabeeri/policies/README.md
- .kabeeri/policies/task_verification_policy.example.json
- .kabeeri/events/README.md
- .kabeeri/security/SECRETS_POLICY.md
- .kabeeri/security/PRIVACY_POLICY_FOR_AI.md
- .kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md
Create v5 implementation report.
```

### PHASE-09 — Apply Low-Cost AI Development Layer

**Goal:** حل مشكلة تكلفة Codex والذكاء الاصطناعي عبر Context Packs، Preflight، budgets، model routing، وتقارير الهدر.

**Outputs:**
- `ai_cost_control/`
- `.kabeeri/ai_usage cost schemas`
- `reports templates`

**Checks:**
- Codex لا يستخدم في كل شيء
- تقدير تكلفة قبل التنفيذ
- Random usage ظاهر
- Sprint cost واضح

**Codex command:**

```text
Implement AI Cost Control and Low-Cost Development Mode.
Create/update:
- ai_cost_control/README.md
- ai_cost_control/LOW_COST_DEVELOPMENT_MODE.md
- ai_cost_control/TASK_CONTEXT_PACK_RULES.md
- ai_cost_control/AI_COST_PREFLIGHT_TEMPLATE.md
- ai_cost_control/MODEL_ROUTING_RULES.md
- ai_cost_control/TOKEN_BUDGET_RULES.md
- ai_cost_control/RANDOM_USAGE_DETECTION_RULES.md
- ai_cost_control/SPRINT_COST_CONTROL.md
- ai_cost_control/COST_SAVING_STRATEGIES.md
- .kabeeri/ai_usage/pricing_rules.example.json
- .kabeeri/ai_usage/usage_event.example.json
- .kabeeri/ai_usage/sprint_costs.example.json
- .kabeeri/ai_usage/random_usage_report.example.json
Create cost-control report.
```

### PHASE-10 — Apply v6 Vibe-First Human Experience

**Goal:** تحويل Kabeeri من CLI-heavy إلى تجربة بشرية داخل VS Code/Dashboard/Chat UI، مع Post-Work Capture.

**Outputs:**
- `vibe_ux/`
- `.kabeeri/interactions examples`

**Checks:**
- كل أمر CLI له UI equivalent
- الطلبات الطبيعية تتحول لكروت
- Post-work capture
- Arabic/English UX examples

**Codex command:**

```text
Implement v6 Vibe-first interaction layer.
Create/update:
- vibe_ux/README.md
- vibe_ux/VIBE_UX_PRINCIPLES.md
- vibe_ux/CLI_AS_ENGINE.md
- vibe_ux/INTERACTION_SURFACES.md
- vibe_ux/CHAT_INTERACTION_MODEL.md
- vibe_ux/NATURAL_LANGUAGE_TASK_CREATION.md
- vibe_ux/INTENT_CLASSIFICATION_RULES.md
- vibe_ux/SUGGESTED_TASK_CARD.md
- vibe_ux/VAGUE_REQUEST_DETECTION.md
- vibe_ux/WORKSTREAM_DETECTION_RULES.md
- vibe_ux/POST_WORK_CAPTURE.md
- vibe_ux/COMMAND_ABSTRACTION_RULES.md
- vibe_ux/INTERACTION_MODES.md
- vibe_ux/UX_FRICTION_RULES.md
- .kabeeri/interactions/README.md
- .kabeeri/interactions/user_intents.example.jsonl
- .kabeeri/interactions/suggested_tasks.example.json
Create v6 implementation report.
```

### PHASE-11 — Apply v7 Design Source Governance and Frontend Control

**Goal:** حل كارثة UI/UX في الفايب كودينج: مصادر التصميم لا تدخل Codex مباشرة، بل تتحول إلى Text Specs معتمدة.

**Outputs:**
- `design_sources/`
- `design_system/`
- `frontend_specs/`
- `ui_acceptance templates`

**Checks:**
- لا تنفيذ Frontend من صورة/PDF/Drive link فقط
- Manual/Assisted/Automated Spec modes
- Reference websites inspiration only
- Visual QA

**Codex command:**

```text
Implement v7 design source governance.
Create/update:
- design_sources/README.md
- design_sources/DESIGN_SOURCE_TO_TEXT_SPEC_RULES.md
- design_sources/DESIGN_SOURCE_TYPES.md
- design_sources/DESIGN_SOURCE_INTAKE_TEMPLATE.md
- design_sources/DESIGN_SOURCE_SNAPSHOT_RULES.md
- design_sources/DESIGN_AUDIT_RULES.md
- design_sources/MISSING_DESIGN_REPORT_TEMPLATE.md
- design_sources/REFERENCE_WEBSITE_INSPIRATION_RULES.md
- design_sources/DO_NOT_COPY_RULES.md
- design_sources/DESIGN_CHANGE_REQUEST_TEMPLATE.md
- design_sources/EXTRACTION_MODES.md
- design_system/DESIGN_TOKENS_TEMPLATE.json
- design_system/BRAND_IDENTITY_TEMPLATE.md
- design_system/COMPONENT_RULES.md
- design_system/UI_ACCEPTANCE_CHECKLIST.md
- frontend_specs/PAGE_SPEC_TEMPLATE.md
- frontend_specs/COMPONENT_CONTRACT_TEMPLATE.md
- codex_commands/CODEX_FRONTEND_TASK_PROMPT_TEMPLATE.md
Create v7 implementation report.
```

### PHASE-12 — Production Documentation Website Deep Build

**Goal:** إنشاء دليل استخدام عربي/إنجليزي HTML/CSS/JS فقط، يعمل محليًا، يشرح للمستخدم يبدأ منين ويكمل إزاي ويراقب العمل.

**Outputs:**
- `docs_site/`
- `docs_site/pages/ar`
- `docs_site/pages/en`
- `local docs README`

**Checks:**
- Arabic/English
- language switcher
- sidebar
- no backend
- covers v1-v7
- getting started واضح

**Codex command:**

```text
Build a static documentation site for Kabeeri-vdf.
No backend.
Use HTML/CSS/JavaScript only.
Create:
- docs_site/index.html
- docs_site/assets/css/style.css
- docs_site/assets/js/app.js
- docs_site/pages/ar/*.html
- docs_site/pages/en/*.html
Required UX:
- navbar with Arabic/English language switcher
- sidebar navigation
- responsive layout
- RTL support for Arabic
- simple local search or filter if possible
Required pages in both languages:
- What is Kabeeri-vdf
- Start here
- New project workflow
- Existing project adoption
- Structured Delivery
- Agile Delivery
- Questionnaire engine
- Task governance and provenance
- Dashboard and monitoring
- Owner verify
- AI cost control
- Multi-AI governance
- Vibe-first workflow
- Design source governance
- Production vs Publish
- Troubleshooting
Create docs_site/README.md with local run instructions.
```

### PHASE-13 — GitHub Import, Issues, Milestones, and Release Readiness

**Goal:** إنشاء ملفات GitHub جاهزة للاستيراد أو استخدام gh CLI بأمان بعد موافقة المالك.

**Outputs:**
- `github/labels.json`
- `github/milestones.md`
- `github/issues_backlog.md`
- `docs/production/release checklist`

**Checks:**
- gh CLI لا يغير بدون موافقة
- Branch/PR flow
- Owner verify قبل closing
- Issue bodies تحتوي source/scope/acceptance

**Codex command:**

```text
Prepare GitHub update files for Kabeeri-vdf.
Do not mutate GitHub unless the Owner explicitly approves and gh auth is available.
Create/update:
- github/labels.json
- github/milestones.md
- github/issues_backlog.md
- github/import_instructions.md
- docs/production/FINAL_RELEASE_PREPARATION_CHECKLIST.md
- docs/production/PUBLISHING_GUIDE.md
- docs/reports/FINAL_VALIDATION_REPORT.md
For each issue include:
- title
- labels
- milestone
- source/version
- scope
- acceptance criteria
- owner verify requirement if applicable
- cost/design/security notes if applicable.
```

### PHASE-14 — Final QA, Policy Checks, and Publish Decision

**Goal:** فحص نهائي قبل اعتبار Kabeeri جاهز للاستخدام والنشر: ملفات، روابط، docs site، GitHub، أمن، تكلفة، UX، Design.

**Outputs:**
- `docs/reports/FINAL_DEEP_QA_REPORT.md`
- `docs/reports/OPEN_BLOCKERS.md`
- `docs/reports/PUBLISH_DECISION.md`

**Checks:**
- لا blockers حرجة
- docs site يعمل محليًا
- أوامر كودكس موجودة
- كل Phase reports موجودة
- مخاطر معروفة

**Codex command:**

```text
Run final deep QA for Kabeeri-vdf.
Create:
- docs/reports/FINAL_DEEP_QA_REPORT.md
- docs/reports/OPEN_BLOCKERS.md
- docs/reports/PUBLISH_DECISION.md
Check:
- all required folders exist or are intentionally deferred
- README and docs links work
- docs_site can run locally
- v1-v7 reports exist
- GitHub import files exist
- no secrets in docs/examples
- design source rules prevent raw PDF/image execution
- CLI is documented as engine, not mandatory UX
- low-cost AI rules are present
- Owner-only verify rules are present
State clearly: ready / ready with warnings / not ready.
```


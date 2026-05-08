**Kabeeri VDF**

**خطة تحديث v6.0.0**

**Vibe-First Interaction Layer**

حل مشكلة تحويل Kabeeri إلى تجربة CLI-heavy وإرجاع حرية الفايب كودنج بطريقة منظمة

هذا الملف مرتب لاستخدامه كمرجع عند إنشاء GitHub Milestones وGitHub Issues الخاصة بتحديث v6.0.0، بعد تحديثات v2/v3/v4/v5.

> Core Principle:  
> Files = Source of Truth  
> CLI = Background Engine  
> VS Code / Dashboard / Chat UI = Main Human Experience

# ملخص تنفيذي

| **Item**       | **Description**                                                                                                                     |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------|
| اسم التحديث    | v6.0.0 — Vibe-First Interaction Layer                                                                                               |
| المشكلة        | تحويل Kabeeri إلى CLI-first قد يعطّل حرية الفايب كودنج ويعيد المستخدم إلى أوامر جامدة بدل التعامل الطبيعي.                           |
| الحل           | جعل CLI محركًا داخليًا، وبناء تجربة استخدام طبيعية عبر VS Code Webview، Dashboard، Chat UI، Suggested Task Cards، وPost-Work Capture. |
| الفلسفة        | Kabeeri يوجّه الفايب كودنج ولا يعطّله. يسمح بالعمل الطبيعي، ثم يضيف الحوكمة والتتبع والمراجعة في اللحظة المناسبة.                     |
| الناتج المتوقع | تجربة بشرية سهلة: اكتب المطلوب، راجع الاقتراحات، اضغط Approve/Run/Verify، بينما تعمل الملفات والـ CLI والسياسات في الخلفية.         |

# لماذا v6.0.0 ضروري؟

بعد v5 أصبح Kabeeri قويًا في الأسئلة والحوكمة والتتبع والسياسات. لكن إذا أصبح التعامل اليومي معه معتمدًا على أوامر CLI كثيرة، سيخسر أهم ميزة: حرية الفايب كودنج. لذلك v6 يحوّل التجربة من terminal-first إلى human-first.

• المستخدم يجب أن يستطيع كتابة ما يريد بلغة طبيعية.

• Kabeeri يحوّل الكلام إلى تاسكات مقترحة قابلة للمراجعة.

• كل أمر CLI يجب أن يكون له زر أو واجهة مقابلة.

• المطور يستطيع العمل بحرية ثم يلتقط Kabeeri التغييرات بعد ذلك Post-Work Capture.

• الحوكمة لا تظهر إلا عند الحاجة: Owner Verify، تكلفة عالية، تضارب ملفات، أو إجراء خطر.

# المبدأ الحاكم

> Kabeeri should guide vibe coding, not interrupt it.  
>   
> Arabic:  
> كبيري يوجه الفايب كودنج ولا يعطله.

الـ CLI يظل مهمًا للأتمتة والـ CI/CD والمستخدمين المحترفين، لكنه لا يجب أن يكون التجربة الأساسية للمطور أو صاحب المشروع.

# المحاور الأساسية في v6.0.0

| **Axis**                       | **Purpose**                                                                 |
|--------------------------------|-----------------------------------------------------------------------------|
| Vibe UX Layer                  | طبقة تجربة استخدام طبيعية تحافظ على حرية المطور وتخفي التعقيد.              |
| Natural Language Task Creation | تحويل الكلام الطبيعي إلى تاسكات مقترحة مع نطاق وAcceptance ومصدر.           |
| VS Code Webview Experience     | واجهة ويب داخل VS Code لإدارة الأسئلة والتاسكات والتكلفة والـ verify.       |
| Post-Work Capture              | التقاط التغييرات بعد العمل الحر وربطها بتاسك أو ChangeSet.                  |
| Command Abstraction            | إخفاء أوامر CLI خلف أزرار وأحداث وواجهات.                                   |
| Interaction Modes              | Vibe Mode وGuided Mode وGovernance Mode وCLI Mode.                          |
| Cost-Aware Vibe Coding         | تقليل تكلفة AI داخل تجربة الفايب عن طريق context packs وpreflight وbudgets. |
| Human UX Quality               | اختبار سهولة الاستخدام ودعم العربية والـ RTL وتقليل الاحتكاك.               |

# هيكل ملفات مقترح

هذا الهيكل يضاف بجانب .kabeeri/ وطبقات v5، ولا يستبدلها. الهدف هو فصل تجربة الاستخدام عن محرك التنفيذ.

> vibe_ux/  
> ├── README.md  
> ├── VIBE_UX_PRINCIPLES.md  
> ├── VIBE_MODE.md  
> ├── GUIDED_MODE.md  
> ├── GOVERNANCE_MODE.md  
> ├── CLI_MODE.md  
> ├── NATURAL_LANGUAGE_TASK_CREATION.md  
> ├── POST_WORK_CAPTURE.md  
> ├── COMMAND_ABSTRACTION_RULES.md  
> ├── CLI_AS_ENGINE.md  
> ├── UX_FRICTION_RULES.md  
> └── V6_FINAL_ACCEPTANCE_CHECKLIST.md  
>   
> .kabeeri/interactions/  
> ├── user_intents.jsonl  
> ├── suggested_tasks.json  
> ├── ui_actions.jsonl  
> ├── command_results.jsonl  
> ├── post_work_captures.jsonl  
> ├── mode_state.json  
> └── ux_metrics.json

# قواعد تجربة الاستخدام

• لا يحتاج المستخدم إلى CLI إلا إذا اختار ذلك.

• كل أمر CLI شائع يجب أن يكون له زر أو واجهة مقابلة.

• المستخدم يستطيع كتابة المطلوب بلغة طبيعية.

• Kabeeri يحول الكلام إلى اقتراحات وليس تنفيذًا مباشرًا.

• AI لا ينفذ إلا بعد Approval عندما تكون المهمة حساسة أو مكلفة أو مؤثرة.

• النظام يسمح بالعمل الحر ثم يلتقط التغييرات بأثر رجعي.

• الحوكمة يجب أن تظهر عند الخطر وليس عند كل حركة صغيرة.

• الـ Owner فقط يستطيع final verify عند الحاجة.

# Labels مقترحة

| **Label**           | **Description**                                                | **Color** |
|---------------------|----------------------------------------------------------------|-----------|
| vibe-ux             | تجربة الاستخدام الطبيعية وواجهات الفايب داخل VS Code/Dashboard | \#1D76DB  |
| natural-language    | تحويل الكلام الطبيعي إلى تاسكات واقتراحات منظمة                | \#5319E7  |
| post-work-capture   | التقاط التغييرات بعد العمل الحر وتحويلها إلى تاسكات بأثر رجعي  | \#FBCA04  |
| command-abstraction | إخفاء أوامر CLI خلف واجهات وأزرار وأحداث                       | \#0E8A16  |
| vscode-extension    | تكامل VS Code Webview وتجربة المطور                            | \#0075CA  |
| dashboard           | لوحات التحكم والـ live status والـ verify queue                | \#C5DEF5  |
| cost-control        | ضوابط التكلفة وميزانية التوكنز داخل تجربة الفايب               | \#D93F0B  |
| accessibility       | سهولة الاستخدام ودعم RTL واللغة العربية والإنجليزية            | \#7057FF  |
| priority-high       | عمل مهم يجب تنفيذه مبكرًا                                       | \#B60205  |
| priority-medium     | عمل مفيد للمرحلة الحالية أو التالية                            | \#FBCA04  |
| good-first-issue    | مناسب كمساهمة أولى بسيطة                                       | \#7057FF  |

# Milestones المقترحة داخل v6.0.0

| **Milestone** | **Title**                      | **Goal**                                               | **Issues** |
|---------------|--------------------------------|--------------------------------------------------------|------------|
| v6.1.0        | Vibe UX Foundation             | تأسيس تجربة Vibe-first وإخفاء CLI خلف الواجهات.        | 7          |
| v6.2.0        | Natural Language Task Creation | تحويل الكلام الطبيعي إلى تاسكات مقترحة قابلة للمراجعة. | 7          |
| v6.3.0        | VS Code Webview Experience     | تصميم تجربة VS Code لإدارة Kabeeri بدون CLI يدوي.      | 7          |
| v6.4.0        | Post-Work Capture              | التقاط العمل الحر بعد تنفيذه وربطه بتاسكات ومراجعة.    | 7          |
| v6.5.0        | Command Abstraction Layer      | ربط أوامر CLI بأزرار وواجهات وأحداث.                   | 7          |
| v6.6.0        | Interaction Modes              | تعريف Vibe وGuided وGovernance وCLI Modes.             | 7          |
| v6.7.0        | Cost-Aware Vibe Coding         | إدخال تقدير التكلفة والميزانيات داخل تجربة الفايب.     | 7          |
| v6.8.0        | Human UX Quality               | اختبار سهولة الاستخدام ودعم العربية وRTL قبل الإطلاق.  | 7          |

# v6.1.0 — Vibe UX Foundation

Milestone description: تأسيس طبقة Vibe UX بحيث لا يكون CLI هو تجربة الاستخدام الأساسية، بل يصبح محركًا داخليًا خلف VS Code/Dashboard/Chat UI.

**Issue count: 7**

## Issue 1: Create Vibe UX layer

**Labels: vibe-ux, priority-high**

### Scope

• Create vibe_ux/ as the official human-first interaction layer.

• Explain that CLI is an engine, not the main experience.

• Define relationship between files, CLI, VS Code, dashboard, chat, desktop, and cloud.

• Document how Vibe UX preserves freedom while keeping governance.

### Acceptance criteria

• vibe_ux/ exists.

• README explains Vibe-first philosophy.

• The CLI is documented as hidden/optional engine.

• The layer supports human natural workflow.

## Issue 2: Add Vibe UX principles

**Labels: vibe-ux, docs, priority-high**

### Scope

• Create VIBE_UX_PRINCIPLES.md.

• Define principles: guide, do not interrupt; suggest, do not force; capture after work; approval only when needed.

• Explain that every CLI command should have a UI equivalent.

• Define when governance is strict and when vibe flow is flexible.

### Acceptance criteria

• Principles file exists.

• Principles protect vibe coding from CLI overload.

• Principles are understandable for users and contributors.

## Issue 3: Define CLI as background engine

**Labels: command-abstraction, docs, priority-high**

### Scope

• Create CLI_AS_ENGINE.md.

• Explain that CLI powers actions behind UI buttons and automation.

• Document when users may use CLI directly.

• List examples of UI actions mapped to internal CLI commands.

### Acceptance criteria

• CLI-as-engine concept is documented.

• User-facing UX does not require terminal-first interaction.

• Power users can still use CLI.

## Issue 4: Define Kabeeri interaction surfaces

**Labels: vibe-ux, dashboard, vscode-extension, priority-medium**

### Scope

• Create INTERACTION_SURFACES.md.

• Document VS Code Webview, Local Dashboard, Chat Panel, Desktop App, Cloud App, and CLI.

• Define which surfaces are primary, secondary, and future.

• Clarify source of truth remains .kabeeri/.

### Acceptance criteria

• Interaction surfaces are documented.

• Each surface has a clear role.

• No surface replaces .kabeeri/ as source of truth.

## Issue 5: Add chat-style Kabeeri interaction model

**Labels: vibe-ux, natural-language, priority-medium**

### Scope

• Create CHAT_INTERACTION_MODEL.md.

• Define how users express intent in natural language.

• Define how Kabeeri responds with suggestions, questions, tasks, warnings, and approvals.

• Add examples in Arabic and English.

### Acceptance criteria

• Chat interaction model exists.

• Arabic/English examples are included.

• Chat suggestions require approval for execution.

## Issue 6: Add UX friction rules

**Labels: vibe-ux, accessibility, priority-medium**

### Scope

• Create UX_FRICTION_RULES.md.

• Define maximum steps for common actions.

• Identify actions that must not require long CLI commands.

• Define quick actions and progressive disclosure.

### Acceptance criteria

• Friction rules exist.

• Common actions are designed to be short.

• Governance does not block simple exploration.

## Issue 7: Add Vibe UX file structure specification

**Labels: vibe-ux, docs, good-first-issue**

### Scope

• Create VIBE_UX_FILE_STRUCTURE.md.

• List recommended files under vibe_ux/ and .kabeeri/interactions/.

• Define relationship to v5 questionnaire engine and v4 governance.

### Acceptance criteria

• File structure is documented.

• Future contributors know where UX specs live.

• Structure connects to existing Kabeeri layers.

# v6.2.0 — Natural Language Task Creation

Milestone description: تحويل كلام المطور أو صاحب المشروع إلى تاسكات مقترحة، مع نطاق وملفات مسموحة ومصدر وAcceptance قبل التنفيذ.

**Issue count: 7**

## Issue 8: Add natural language task creation rules

**Labels: natural-language, task-governance, priority-high**

### Scope

• Create NATURAL_LANGUAGE_TASK_CREATION.md.

• Define how free text becomes suggested tasks.

• Require generated tasks to include source, scope, workstream, allowed files, forbidden files, and acceptance criteria.

• Prevent vague tasks from entering execution.

### Acceptance criteria

• Rules exist.

• Natural language can produce suggested tasks.

• Suggested tasks cannot execute without approval.

## Issue 9: Add intent classification for user requests

**Labels: natural-language, priority-high**

### Scope

• Create INTENT_CLASSIFICATION_RULES.md.

• Classify requests as task, question, idea, bug, feature, refactor, review, documentation, cost query, or project decision.

• Define confidence and follow-up questions.

• Add Arabic examples.

### Acceptance criteria

• Intent rules exist.

• Ambiguous requests trigger clarification.

• Arabic examples are included.

## Issue 10: Add suggested task card format

**Labels: natural-language, dashboard, priority-high**

### Scope

• Create SUGGESTED_TASK_CARD.md.

• Define UI card fields: title, workstream, source, scope, allowed files, acceptance, cost estimate, risk, approve/reject/edit actions.

• Support owner-only approve when required.

### Acceptance criteria

• Task card format exists.

• Cards are easy to review.

• Owner-only actions are clearly marked.

## Issue 11: Add vague request detection

**Labels: natural-language, task-governance, priority-medium**

### Scope

• Create VAGUE_REQUEST_DETECTION.md.

• Detect requests such as build the whole dashboard, improve everything, fix all docs, make it professional.

• Provide follow-up question patterns.

• Recommend task splitting.

### Acceptance criteria

• Vague requests are detected.

• System suggests clearer task breakdown.

• No vague task enters execution.

## Issue 12: Add workstream detection from natural language

**Labels: natural-language, task-governance, priority-medium**

### Scope

• Create WORKSTREAM_DETECTION_RULES.md.

• Detect backend, public frontend, admin frontend, database, docs, dashboard, security, deployment, and AI usage workstreams.

• Allow manual override.

• Connect workstream to allowed files.

### Acceptance criteria

• Workstream detection rules exist.

• Workstream can be reviewed/edited before approval.

• Generated tasks avoid frontend/backend mixing unless integration task.

## Issue 13: Add natural language to acceptance criteria rules

**Labels: natural-language, acceptance, priority-high**

### Scope

• Create NATURAL_LANGUAGE_ACCEPTANCE_RULES.md.

• Generate initial acceptance criteria from user intent.

• Require human/Owner review before execution.

• Ensure criteria are testable and not too broad.

### Acceptance criteria

• Acceptance rules exist.

• Acceptance criteria are generated as draft.

• Owner/reviewer can edit before task approval.

## Issue 14: Add task approval flow from suggested tasks

**Labels: natural-language, task-governance, priority-high**

### Scope

• Create SUGGESTED_TASK_APPROVAL_FLOW.md.

• Define draft -\> suggested -\> approved -\> ready -\> assigned flow.

• Support owner approval, maintainer recommendation, and rejection with reason.

• Connect to v5 task governance.

### Acceptance criteria

• Approval flow exists.

• Suggested tasks are not executable by default.

• Rejected suggestions are logged with reason.

# v6.3.0 — VS Code Webview Experience

Milestone description: تصميم تجربة Kabeeri داخل VS Code كواجهة ويب تفاعلية لإدارة الأسئلة والتاسكات والتكاليف والـ verify.

**Issue count: 7**

## Issue 15: Design Kabeeri VS Code main panel

**Labels: vscode-extension, vibe-ux, priority-high**

### Scope

• Create VSCODE_MAIN_PANEL_FLOW.md.

• Design sections: Ask Kabeeri, Project Questions, Suggested Tasks, Active Work, Cost, Verify Queue, Reports.

• Support Arabic/English and RTL.

• Make CLI optional.

### Acceptance criteria

• Main panel flow exists.

• Sections are clear.

• Design supports Vibe Mode and Governance Mode.

## Issue 16: Design Ask Kabeeri webview

**Labels: vscode-extension, natural-language, priority-high**

### Scope

• Create ASK_KABEERI_WEBVIEW.md.

• Design chat-like input where user writes natural requests.

• Show generated task cards, follow-up questions, risk warnings, and cost estimates.

• Allow edit before approval.

### Acceptance criteria

• Ask Kabeeri flow exists.

• Users can create tasks without CLI.

• Generated suggestions are reviewable.

## Issue 17: Design suggested tasks board in VS Code

**Labels: vscode-extension, dashboard, priority-high**

### Scope

• Create SUGGESTED_TASKS_BOARD.md.

• Define columns: Draft, Suggested, Needs Owner Approval, Ready, Rejected.

• Support card edit, approve, reject, split, estimate cost.

• Connect to GitHub later.

### Acceptance criteria

• Suggested tasks board design exists.

• Board supports approval workflow.

• No terminal use required.

## Issue 18: Design active work and developer progress panel

**Labels: vscode-extension, dashboard, priority-medium**

### Scope

• Create ACTIVE_WORK_PANEL.md.

• Show active tasks, current assignee, workstream, locks, last activity, cost so far, blocked state.

• Support live updates from .kabeeri/events/.

### Acceptance criteria

• Active work panel exists.

• Progress is visible to owner/developers.

• Panel is read-friendly.

## Issue 19: Design owner verify queue in VS Code

**Labels: vscode-extension, dashboard, priority-high**

### Scope

• Create OWNER_VERIFY_QUEUE.md.

• Show tasks needing final verify.

• Only Owner can verify.

• Allow review of changed files, output contract, acceptance, token usage, and risks.

• Support reject/reopen.

### Acceptance criteria

• Verify queue design exists.

• Owner-only final verify is documented.

• Review data is visible before verify.

## Issue 20: Design token cost panel for VS Code

**Labels: vscode-extension, cost-control, priority-medium**

### Scope

• Create VSCODE_TOKEN_COST_PANEL.md.

• Show cost by task, sprint, developer, workstream, model, and untracked usage.

• Provide calculator input for token price.

• Warn when budgets are exceeded.

### Acceptance criteria

• Token cost panel design exists.

• Cost calculator requirements are documented.

• Budget warnings are included.

## Issue 21: Design VS Code onboarding flow for Kabeeri

**Labels: vscode-extension, accessibility, good-first-issue**

### Scope

• Create VSCODE_ONBOARDING_FLOW.md.

• Explain first launch flow: detect project, choose mode, connect GitHub, set owner, choose language, open dashboard.

• Avoid overwhelming new users.

### Acceptance criteria

• Onboarding flow exists.

• First-time users can start without CLI.

• Arabic/English UX is considered.

# v6.4.0 — Post-Work Capture

Milestone description: السماح للمطور بالعمل بحرية ثم التقاط التغييرات وتحويلها إلى Task/ChangeSet/Review بدل إجباره على CLI قبل كل خطوة.

**Issue count: 7**

## Issue 22: Add post-work capture concept

**Labels: post-work-capture, priority-high**

### Scope

• Create POST_WORK_CAPTURE.md.

• Explain how Kabeeri detects work done outside approved tasks.

• Allow creating task/change record after free coding.

• Preserve developer freedom while restoring traceability.

### Acceptance criteria

• Post-work capture concept exists.

• Free coding can be captured after the fact.

• Traceability can be restored.

## Issue 23: Add changed files detection rules

**Labels: post-work-capture, task-governance, priority-high**

### Scope

• Create CHANGED_FILES_DETECTION_RULES.md.

• Define how Kabeeri reads git diff/status.

• Classify changed files by workstream and possible system area.

• Identify untracked or out-of-scope changes.

### Acceptance criteria

• Changed files rules exist.

• Files can be mapped to workstreams.

• Untracked changes are visible.

## Issue 24: Add retroactive task capture flow

**Labels: post-work-capture, natural-language, priority-high**

### Scope

• Create RETROACTIVE_TASK_CAPTURE_FLOW.md.

• Allow user to turn recent changes into a task.

• Ask for intent, source, acceptance, and review notes after the work.

• Mark as retroactive.

### Acceptance criteria

• Retroactive flow exists.

• Captured tasks include source and scope.

• Retroactive tasks require review/verify.

## Issue 25: Add changeset summary generation rules

**Labels: post-work-capture, docs, priority-medium**

### Scope

• Create CHANGESET_SUMMARY_RULES.md.

• Define summary: files changed, reason, likely feature, risk, tests needed, suggested task/source.

• Support AI-assisted summary but require user confirmation.

### Acceptance criteria

• Changeset summary rules exist.

• Summaries are useful for review.

• AI summaries require confirmation.

## Issue 26: Add unapproved work classification

**Labels: post-work-capture, policy-engine, priority-high**

### Scope

• Create UNAPPROVED_WORK_CLASSIFICATION.md.

• Classify work as harmless, needs task, risky, blocked, or security-sensitive.

• Define owner approval for risky/unapproved work.

• Connect to audit log.

### Acceptance criteria

• Classification rules exist.

• Risky changes require approval.

• Unapproved work is not hidden.

## Issue 27: Add post-work acceptance review

**Labels: post-work-capture, acceptance, priority-medium**

### Scope

• Create POST_WORK_ACCEPTANCE_REVIEW.md.

• Define how retroactive tasks are reviewed and verified.

• Require changed files, output contract, tests/checks, risks, and owner verify if needed.

### Acceptance criteria

• Post-work review exists.

• Retroactive changes can be accepted/rejected.

• Owner-only verify still applies.

## Issue 28: Add free coding safety boundaries

**Labels: post-work-capture, security, priority-high**

### Scope

• Create FREE_CODING_SAFETY_BOUNDARIES.md.

• Define when free coding is allowed.

• Warn about secrets, migrations, production actions, and locked files.

• Document when governance must interrupt.

### Acceptance criteria

• Safety boundaries exist.

• Free coding remains possible.

• Critical actions still require approval.

# v6.5.0 — Command Abstraction Layer

Milestone description: ربط كل أوامر CLI بأزرار وواجهات وأحداث، بحيث يبقى CLI اختياريًا وليس عائقًا.

**Issue count: 7**

## Issue 29: Add command abstraction rules

**Labels: command-abstraction, priority-high**

### Scope

• Create COMMAND_ABSTRACTION_RULES.md.

• Define mapping between UI actions and internal CLI commands.

• Require every common CLI command to have a UI equivalent.

• Define command result format.

### Acceptance criteria

• Command abstraction exists.

• UI can call CLI internally.

• Users are not forced to type commands.

## Issue 30: Add UI action registry

**Labels: command-abstraction, dashboard, priority-high**

### Scope

• Create UI_ACTION_REGISTRY.json.

• List actions: create task, approve task, estimate cost, verify, reject, capture changes, generate context pack.

• Define required permissions and confirmation prompts.

### Acceptance criteria

• Action registry exists.

• Actions include permissions.

• Actions can be reused by VS Code and Dashboard.

## Issue 31: Add command result contract

**Labels: command-abstraction, policy-engine, priority-medium**

### Scope

• Create COMMAND_RESULT_CONTRACT.md.

• Define success, warning, failure, needs approval, and partial result outputs.

• Make results UI-friendly and machine-readable.

### Acceptance criteria

• Result contract exists.

• UI can show clear messages.

• Errors are not raw terminal noise.

## Issue 32: Add safe confirmation prompts

**Labels: command-abstraction, security, priority-high**

### Scope

• Create SAFE_CONFIRMATION_PROMPTS.md.

• Define confirmation copy for overwrite, migration, verify, publish, owner transfer, and budget override.

• Make prompts clear and non-technical.

### Acceptance criteria

• Confirmation prompts exist.

• Dangerous actions require explicit confirmation.

• Prompts are beginner-friendly.

## Issue 33: Add command error translation

**Labels: command-abstraction, accessibility, priority-medium**

### Scope

• Create COMMAND_ERROR_TRANSLATION.md.

• Translate technical CLI errors into human explanations.

• Map common error codes to Arabic/English messages.

• Suggest next action.

### Acceptance criteria

• Error translation exists.

• Users understand what failed.

• Arabic/English messages are supported.

## Issue 34: Add background task runner UX rules

**Labels: command-abstraction, dashboard, priority-medium**

### Scope

• Create BACKGROUND_TASK_RUNNER_UX.md.

• Define how long-running actions show progress.

• Support cancel, retry, view logs, and safe rollback when applicable.

• Do not freeze the UI.

### Acceptance criteria

• Background UX rules exist.

• Long actions are trackable.

• Users can cancel safely when supported.

## Issue 35: Add no-terminal required policy

**Labels: command-abstraction, vibe-ux, priority-high**

### Scope

• Create NO_TERMINAL_REQUIRED_POLICY.md.

• State that core user flows must work without manually typing terminal commands.

• Allow CLI as optional advanced surface.

• Define exception cases.

### Acceptance criteria

• Policy exists.

• Core flows are UI-capable.

• CLI remains available for power users.

# v6.6.0 — Interaction Modes

Milestone description: تعريف Vibe Mode وGuided Mode وGovernance Mode وCLI Mode، بحيث يناسب Kabeeri المبتدئ والمحترف والفريق.

**Issue count: 7**

## Issue 36: Define Vibe Mode

**Labels: vibe-ux, natural-language, priority-high**

### Scope

• Create VIBE_MODE.md.

• Define low-friction mode for natural language requests and flexible exploration.

• Explain when Kabeeri suggests tasks instead of forcing forms.

• Include safety boundaries.

### Acceptance criteria

• Vibe Mode exists.

• Users can work naturally.

• Critical actions are still protected.

## Issue 37: Define Guided Mode

**Labels: vibe-ux, questionnaire, priority-high**

### Scope

• Create GUIDED_MODE.md.

• Define step-by-step experience using adaptive question groups.

• Connect to v5 System Capability Map.

• Support non-technical users.

### Acceptance criteria

• Guided Mode exists.

• Adaptive questions are integrated.

• Mode is suitable for beginners.

## Issue 38: Define Governance Mode

**Labels: vibe-ux, task-governance, priority-high**

### Scope

• Create GOVERNANCE_MODE.md.

• Define strict workflow for teams and client projects.

• Require approvals, task source, locks, budgets, and owner verify.

• Connect to v4 and v5 policies.

### Acceptance criteria

• Governance Mode exists.

• Strict rules are clear.

• Mode supports teams and agencies.

## Issue 39: Define CLI Mode as advanced option

**Labels: command-abstraction, docs, priority-medium**

### Scope

• Create CLI_MODE.md.

• Explain CLI for automation, advanced users, CI/CD, and power workflows.

• Document that CLI is optional and has UI equivalents for common actions.

### Acceptance criteria

• CLI Mode exists.

• CLI is positioned correctly.

• No conflict with Vibe UX.

## Issue 40: Add mode switching rules

**Labels: vibe-ux, policy-engine, priority-medium**

### Scope

• Create MODE_SWITCHING_RULES.md.

• Define when a project can switch between Vibe, Guided, Governance, and CLI modes.

• Require owner approval for stricter/looser governance changes.

• Log mode changes.

### Acceptance criteria

• Mode switching rules exist.

• Mode changes are auditable.

• Owner approval is required for risky switches.

## Issue 41: Add mode-specific dashboard behavior

**Labels: dashboard, vibe-ux, priority-medium**

### Scope

• Create MODE_DASHBOARD_BEHAVIOR.md.

• Define what dashboard shows in each mode.

• Vibe shows suggestions; Governance shows locks/approvals; Guided shows progress; CLI shows logs and commands.

### Acceptance criteria

• Dashboard behavior per mode is documented.

• Users see the right level of complexity.

• Owner-only actions remain protected.

## Issue 42: Add mode-specific documentation templates

**Labels: docs, vibe-ux, good-first-issue**

### Scope

• Create templates explaining each mode to users.

• Add Arabic and English quick guides.

• Make mode choice easy during project onboarding.

### Acceptance criteria

• Mode quick guides exist.

• Users can choose a mode confidently.

• Guides are concise.

# v6.7.0 — Cost-Aware Vibe Coding

Milestone description: دمج تقليل تكلفة AI داخل تجربة الفايب: context packs، تقدير التكلفة قبل التشغيل، budgets، واختيار النموذج المناسب.

**Issue count: 7**

## Issue 43: Add cost-aware task suggestion rules

**Labels: cost-control, natural-language, priority-high**

### Scope

• Create COST_AWARE_TASK_SUGGESTION_RULES.md.

• When generating tasks, estimate likely cost level: low/medium/high.

• Suggest splitting high-cost tasks.

• Recommend low-cost or premium AI paths.

### Acceptance criteria

• Cost-aware rules exist.

• High-cost tasks are flagged early.

• Users can choose cheaper paths.

## Issue 44: Add task context pack UI flow

**Labels: cost-control, vibe-ux, priority-high**

### Scope

• Create TASK_CONTEXT_PACK_UI_FLOW.md.

• Design UI action to generate compact context pack for a task.

• Show included files, summaries, allowed files, acceptance, memory summary.

• Avoid sending entire repository unless necessary.

### Acceptance criteria

• Context pack flow exists.

• Users can inspect context before AI use.

• Costs are reduced through smaller context.

## Issue 45: Add AI cost preflight UX

**Labels: cost-control, dashboard, priority-high**

### Scope

• Create AI_COST_PREFLIGHT_UX.md.

• Show estimated token/cost before running premium AI.

• Warn if task is too large.

• Suggest splitting or template-first execution.

### Acceptance criteria

• Cost preflight UX exists.

• Users see estimated cost before running.

• Owner approval can be required for expensive actions.

## Issue 46: Add low-cost mode UX

**Labels: cost-control, vibe-ux, priority-high**

### Scope

• Create LOW_COST_MODE_UX.md.

• Define UI for low-cost development mode.

• Prefer templates, summaries, cheaper models, local processing, and small tasks.

• Require approval before premium agent use.

### Acceptance criteria

• Low-cost UX exists.

• Users can select low-cost mode easily.

• Premium AI use is controlled.

## Issue 47: Add model recommendation UI

**Labels: cost-control, dashboard, priority-medium**

### Scope

• Create MODEL_RECOMMENDATION_UI.md.

• Recommend cheap/planning/premium models based on task type and risk.

• Explain recommendation in simple language.

• Allow owner override.

### Acceptance criteria

• Model recommendation UI exists.

• Recommendations are explainable.

• Override is possible with logging.

## Issue 48: Add budget warnings inside Vibe UX

**Labels: cost-control, vibe-ux, priority-medium**

### Scope

• Create VIBE_BUDGET_WARNINGS.md.

• Warn when active work exceeds task, sprint, or project budgets.

• Show suggested actions: stop, split, continue with approval, switch model.

• Include Arabic/English text examples.

### Acceptance criteria

• Budget warning rules exist.

• Warnings are human-readable.

• Over-budget actions require approval where configured.

## Issue 49: Add untracked cost explanation cards

**Labels: cost-control, dashboard, priority-medium**

### Scope

• Create UNTRACKED_COST_EXPLANATION_CARDS.md.

• Show untracked/random AI usage in a way users understand.

• Classify exploration, waste, rework, missing task, or uncaptured work.

• Suggest post-work capture.

### Acceptance criteria

• Untracked cost cards exist.

• Users understand where cost went.

• Post-work capture is recommended when appropriate.

# v6.8.0 — Human UX Quality, Accessibility, and Adoption

Milestone description: اختبار التجربة البشرية، دعم العربية والـ RTL، تقليل الاحتكاك، وتوثيق تجربة استخدام سهلة قبل التوسع التجاري.

**Issue count: 7**

## Issue 50: Add human UX testing checklist

**Labels: accessibility, vibe-ux, priority-high**

### Scope

• Create HUMAN_UX_TESTING_CHECKLIST.md.

• Test if users can create tasks, answer questions, approve, run, capture changes, and verify without CLI.

• Include beginner and power user scenarios.

### Acceptance criteria

• UX testing checklist exists.

• No-CLI core flow is testable.

• Friction points can be reported.

## Issue 51: Add Arabic RTL UX requirements

**Labels: accessibility, docs, priority-high**

### Scope

• Create ARABIC_RTL_UX_REQUIREMENTS.md.

• Define RTL layout, Arabic labels, mixed Arabic/English technical terms, code blocks LTR.

• Support VS Code and Dashboard.

### Acceptance criteria

• Arabic RTL requirements exist.

• Mixed-language UX is considered.

• Code remains readable.

## Issue 52: Add accessibility requirements for Kabeeri UI

**Labels: accessibility, priority-medium**

### Scope

• Create ACCESSIBILITY_REQUIREMENTS.md.

• Define keyboard navigation, focus states, contrast, screen reader labels, clear errors, reduced motion.

• Include dashboard and VS Code webview.

### Acceptance criteria

• Accessibility requirements exist.

• UI must support basic accessibility.

• Color/theme choices cannot break readability.

## Issue 53: Add beginner-friendly language rules

**Labels: vibe-ux, docs, good-first-issue**

### Scope

• Create BEGINNER_FRIENDLY_LANGUAGE_RULES.md.

• Avoid intimidating CLI jargon in primary UX.

• Translate technical errors into action-oriented guidance.

• Use examples and progressive disclosure.

### Acceptance criteria

• Language rules exist.

• UX is friendlier for non-experts.

• CLI terminology is minimized where possible.

## Issue 54: Add onboarding evaluation report

**Labels: vibe-ux, dashboard, priority-medium**

### Scope

• Create ONBOARDING_EVALUATION_REPORT.md.

• Evaluate time to first task, time to first answer, time to first accepted work, and CLI dependency.

• Track friction metrics.

### Acceptance criteria

• Evaluation report exists.

• Adoption metrics are defined.

• UX improvements can be measured.

## Issue 55: Add Vibe UX adoption guide

**Labels: docs, vibe-ux, priority-medium**

### Scope

• Create VIBE_UX_ADOPTION_GUIDE.md.

• Explain how existing Kabeeri users move from CLI-heavy workflows to Vibe-first UX.

• Show workflows for individuals, agencies, and teams.

### Acceptance criteria

• Adoption guide exists.

• Users understand new workflow.

• Teams can adopt gradually.

## Issue 56: Add v6 final acceptance checklist

**Labels: acceptance, vibe-ux, priority-high**

### Scope

• Create V6_FINAL_ACCEPTANCE_CHECKLIST.md.

• Verify CLI is optional for core flows, UI actions exist, post-work capture works, owner verify is protected, cost warnings are visible, RTL is supported.

• Prepare v6 release readiness.

### Acceptance criteria

• Final checklist exists.

• v6 can be reviewed before release.

• Checklist covers the CLI-heavy problem.

# تجربة الاستخدام النهائية المقترحة

الشكل النهائي المقترح لا يجعل المستخدم يفكر في CLI. المستخدم يتعامل مع Kabeeri مثل مساعد تطوير داخل VS Code أو Dashboard.

> User says:  
> عايز أضيف نظام ألوان يتحكم فيه الأدمن من الداشبورد  
>   
> Kabeeri suggests:  
> \[Admin Frontend\] Add theme settings screen  
> \[Backend\] Add theme settings API  
> \[Database\] Add theme settings table or config store  
> \[Acceptance\] Validate contrast and preview changes  
>   
> User actions:  
> Edit -\> Approve -\> Run -\> Review -\> Owner Verify

بهذا الشكل، Kabeeri لا يفرض أوامر طويلة، بل يحول النية البشرية إلى عمل منظم ومراجع وقابل للتتبع.

# علاقة v6 بالتحديثات السابقة

| **Version** | **Relationship to v6**                                                                           |
|-------------|--------------------------------------------------------------------------------------------------|
| v2          | يدعم Structured وAgile وProject Intake؛ v6 يوفر له تجربة استخدام طبيعية بدل CLI.                 |
| v3          | يدعم GitHub وVS Code وDashboard؛ v6 يحدد كيف تكون الواجهة البشرية داخل هذه الأدوات.              |
| v4          | يدعم Multi-AI وOwner Verify وTokens وLocks؛ v6 يجعل التحكم بها سهلًا من الواجهة.                  |
| v5          | يدعم الأسئلة الذكية والذاكرة والسياسات؛ v6 يجعلها قابلة للاستخدام بسلاسة داخل VS Code/Dashboard. |

# الخلاصة التنفيذية

تحديث v6.0.0 يحل مشكلة مهمة: Kabeeri لا يجب أن يتحول إلى أداة CLI-heavy تقتل حرية الفايب كودنج. الحل هو بناء Vibe-First Interaction Layer تجعل المطور يتعامل بطريقة بشرية داخل VS Code/Dashboard/Chat UI، بينما تبقى ملفات .kabeeri/ مصدر الحقيقة ويبقى CLI محركًا داخليًا اختياريًا.

بعد v6، يصبح Kabeeri قادرًا على الجمع بين حرية الفايب كودنج وحوكمة التطوير الاحترافية: يترك المطور يفكر ويتحرك بحرية، لكنه يلتقط المصدر، ينظم التاسكات، يقدر التكلفة، يمنع التضارب، ويمكّن الـ Owner من verify نهائيًا عند الحاجة.

> Kabeeri VDF v6.0.0 = Vibe Freedom + Hidden CLI Engine + Human-first Governance

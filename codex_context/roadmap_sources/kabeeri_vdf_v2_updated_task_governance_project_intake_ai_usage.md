# v2.0.0 Updated Plan

Dual Delivery Modes + Project Intake + Task Governance + Task Provenance + AI Usage Foundation

## الغرض من الملف

هذا الملف يحدّث خطة v2.0.0 بحيث لا تكتفي بدعم Structured و Agile، بل تضيف قواعد إنشاء التاسكات، تتبع مصدرها، اعتماد المشاريع الموجودة، وتأسيس قياس AI Usage Tokens قبل الداشبورد.

## ملخص سريع

| **القيمة**                                     | **العنصر**             |
|------------------------------------------------|------------------------|
| v2.0.0                                         | **الإصدار المستهدف**   |
| 5                                              | **عدد الـ Milestones** |
| 22                                             | **إجمالي Issues**      |
| GitHub Milestones and Issues planning document | **نوع الملف**          |

## مصطلحات أساسية

| **التعريف**                                                                    | **المصطلح**             |
|--------------------------------------------------------------------------------|-------------------------|
| تسليم منظم يبدأ من الفكرة والأسئلة ثم المستندات ثم الت tasks والقبول والإصدار. | **Structured Delivery** |
| تسليم تكراري يعتمد على Backlog وUser Stories وSprints ومراجعة مستمرة.          | **Agile Delivery**      |
| تتبع مصدر نشأة التاسك: سؤال، إجابة، مستند، Story، Bug، أو اقتراح AI.           | **Task Provenance**     |
| توكن صلاحية يسمح لمطور أو AI Agent بالعمل على نطاق محدد.                       | **Access Token**        |
| توكنات استهلاك الذكاء الاصطناعي المستخدمة لحساب التكلفة والتحليل.              | **AI Usage Tokens**     |
| التحقق النهائي من إتمام التاسك، ويجب أن يكون من Owner فقط.                     | **Owner Verify**        |

## Labels المقترحة

| **Color** | **Description**                                 | **Label**               |
|-----------|-------------------------------------------------|-------------------------|
| \#5319E7  | كل ما يخص أنماط التشغيل: Structured و Agile     | **delivery-mode**       |
| \#0075CA  | النمط المنظم/التسلسلي                           | **structured-delivery** |
| \#0E8A16  | Agile: Backlog, Sprint, Stories                 | **agile**               |
| \#1D76DB  | بدء مشروع جديد أو اعتماد مشروع موجود            | **project-intake**      |
| \#D93F0B  | قواعد إنشاء وإدارة التاسكات                     | **task-governance**     |
| \#FBCA04  | تتبع مصدر نشأة التاسك                           | **provenance**          |
| \#7057FF  | توثيق استهلاك AI Tokens وتكلفة الذكاء الاصطناعي | **ai-usage**            |
| \#C5DEF5  | داشبورد المشروع                                 | **dashboard**           |
| \#0075CA  | تكامل GitHub                                    | **github**              |
| \#5319E7  | تكامل VS Code                                   | **vscode**              |
| \#5319E7  | أوامر CLI                                       | **cli**                 |
| \#D93F0B  | الصلاحيات والأدوار                              | **permissions**         |
| \#B60205  | توكنات الوصول والصلاحيات                        | **token-access**        |
| \#B60205  | أولوية عالية                                    | **priority-high**       |
| \#FBCA04  | أولوية متوسطة                                   | **priority-medium**     |
| \#7057FF  | مناسب للمساهمين الجدد                           | **good-first-issue**    |

## قائمة Milestones المختصرة

| **Issues** | **Goal**                                                                      | **Milestone**                                             |
|------------|-------------------------------------------------------------------------------|-----------------------------------------------------------|
| 4          | تعريف أنماط التشغيل وكيف يختار المستخدم النمط المناسب.                        | **v1.1.0 — Delivery Modes Foundation**                    |
| 4          | جعل Kabeeri قادرًا على إنشاء مشروع من الصفر أو تبني مشروع موجود بأمان.         | **v1.2.0 — Project Intake and Existing System Adoption**  |
| 5          | منع التاسكات العشوائية وجعل كل Task قابلة للتتبع والمراجعة.                   | **v1.3.0 — Task Creation Governance and Provenance**      |
| 5          | جعل Agile قابل للتشغيل والقياس من أول Sprint.                                 | **v1.4.0 — Agile Delivery Core and Sprint Cost Metadata** |
| 4          | تأسيس قياس تكلفة الذكاء الاصطناعي على مستوى task/sprint/workstream/developer. | **v1.5.0 — Basic AI Usage Accounting Foundation**         |

# Milestone: v1.1.0 — Delivery Modes Foundation

تأسيس أن Kabeeri VDF يدعم نمطين رسميين: Structured Delivery و Agile Delivery بدون إلغاء v1.0.0.

| **القيمة**                                             | **العنصر**      |
|--------------------------------------------------------|-----------------|
| تعريف أنماط التشغيل وكيف يختار المستخدم النمط المناسب. | **الهدف**       |
| 4                                                      | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                | **ملاحظات**     |

## Issues

### 1. Create delivery modes overview

Labels: delivery-mode, docs, priority-high

**Scope:**

- إنشاء delivery_modes/README.md أو docs/delivery_modes.md.

- تعريف Structured Delivery و Agile Delivery.

- توضيح أن v1.0.0 هو Structured foundation.

**Acceptance criteria:**

- يوجد Overview واضح.

- المستخدم يفهم الفرق بين النمطين.

- لا يتم وصف v1.0.0 كـ Waterfall-only.

### 2. Add delivery mode selection guide

Labels: delivery-mode, docs, priority-high

**Scope:**

- إضافة دليل اختيار النمط المناسب.

- إضافة أمثلة قرارات للمشاريع الصغيرة والكبيرة.

- توضيح متى يستخدم المستخدم Structured أو Agile.

**Acceptance criteria:**

- Selection Guide موجود.

- الدليل عملي للمبتدئين.

- لا يفضل نمطًا بشكل مطلق.

### 3. Document Structured Delivery terminology

Labels: structured-delivery, docs, priority-medium

**Scope:**

- تعريف مصطلحات Structured Delivery.

- ربط المصطلحات بـ generators/questionnaires/prompt_packs/task_tracking/acceptance.

**Acceptance criteria:**

- المصطلحات موحدة.

- لا يوجد خلط بين Structured و Agile.

### 4. Document Agile terminology inside Kabeeri VDF

Labels: agile, docs, task-tracking, priority-medium

**Scope:**

- تعريف Backlog, Epic, User Story, Sprint, Increment, Definition of Done.

- شرح علاقة Agile بالـ AI Prompt Packs.

**Acceptance criteria:**

- مصطلحات Agile موحدة.

- المستخدم يفهم أن AI ينفذ Story/Task واحدة فقط.

# Milestone: v1.2.0 — Project Intake and Existing System Adoption

دعم بدء مشروع جديد أو اعتماد مشروع موجود، سواء كان معمولًا بكبيري أو بدون كبيري.

| **القيمة**                                                            | **العنصر**      |
|-----------------------------------------------------------------------|-----------------|
| جعل Kabeeri قادرًا على إنشاء مشروع من الصفر أو تبني مشروع موجود بأمان. | **الهدف**       |
| 4                                                                     | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                               | **ملاحظات**     |

## Issues

### 1. Define project intake modes

Labels: project-intake, docs, priority-high

**Scope:**

- تعريف New Project, Existing Kabeeri Project, Existing Non-Kabeeri Project.

- تحديد الفرق بين scan و adopt و migrate.

**Acceptance criteria:**

- Intake modes موثقة.

- المستخدم يعرف أي مسار يختار.

### 2. Add new project initialization rules

Labels: project-intake, generator, priority-high

**Scope:**

- توثيق كيف يبدأ Kabeeri مشروعًا من الصفر.

- تعريف الملفات التي تنشأ أولًا.

- ربط البداية بـ delivery mode.

**Acceptance criteria:**

- New project flow واضح.

- لا يتم إنشاء كود تطبيق حقيقي بدون موافقة.

### 3. Add existing Kabeeri project upgrade rules

Labels: project-intake, migration, priority-high

**Scope:**

- تحديد كيف يتعامل Kabeeri مع مشروع تم إنشاؤه بإصدار قديم.

- إضافة compatibility check.

- تحديث البنية عند الحاجة بدون كسر الملفات القديمة.

**Acceptance criteria:**

- Upgrade rules موجودة.

- يوجد compatibility report قبل التعديل.

### 4. Add non-Kabeeri project adoption workflow

Labels: project-intake, migration, priority-high

**Scope:**

- scan المشروع الموجود.

- detect stack and structure.

- إنشاء ملفات .kabeeri المطلوبة.

- إنتاج adoption report و suggested tasks.

**Acceptance criteria:**

- لا يتم تعديل الكود مباشرة.

- التاسكات المقترحة تنتظر موافقة Owner.

# Milestone: v1.3.0 — Task Creation Governance and Provenance

إضافة قواعد صارمة لإنشاء التاسكات وتتبع مصدر نشأتها من سؤال أو مستند أو Story أو Bug أو اقتراح AI.

| **القيمة**                                                  | **العنصر**      |
|-------------------------------------------------------------|-----------------|
| منع التاسكات العشوائية وجعل كل Task قابلة للتتبع والمراجعة. | **الهدف**       |
| 5                                                           | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                     | **ملاحظات**     |

## Issues

### 1. Add task creation governance rules

Labels: task-governance, task-tracking, acceptance, priority-high

**Scope:**

- إضافة TASK_CREATION_RULES.md.

- تعريف الحقول المطلوبة لكل Task.

- تحديد من يحق له propose / approve / assign / review.

- اشتراط scope و acceptance criteria و allowed/forbidden files.

**Acceptance criteria:**

- لا توجد Task بدون scope واضح.

- كل Task لها acceptance criteria.

- القواعد تدعم Structured و Agile.

### 2. Add task intake template

Labels: task-governance, task-tracking, priority-high

**Scope:**

- إضافة TASK_INTAKE_TEMPLATE.md.

- دعم task type, workstream, delivery mode, source, assignee, reviewer.

- تحديد business value و technical scope.

**Acceptance criteria:**

- القالب جاهز للنسخ في GitHub Issue.

- القالب يمنع التاسكات العامة.

### 3. Add task definition of ready

Labels: task-governance, acceptance, priority-high

**Scope:**

- إضافة TASK_DEFINITION_OF_READY.md.

- تحديد متى تصبح Task جاهزة للتنفيذ.

- ربط الجاهزية بـ source و approval و acceptance.

**Acceptance criteria:**

- أي Task غير جاهزة لا تدخل التنفيذ.

- DoR واضح للمطورين وAI Agents.

### 4. Add task provenance and source tracing rules

Labels: provenance, task-tracking, questionnaire, priority-high

**Scope:**

- إضافة TASK_SOURCE_RULES.md.

- تعريف source types: manual, questionnaire_answer, generated_document, user_story, epic, sprint_planning, acceptance_review, bug_report, github_issue, ai_suggestion, existing_project_scan, migration_report.

- تعريف source modes: direct, indirect, derived, suggested, required.

**Acceptance criteria:**

- كل Task لها مصدر واضح.

- AI-suggested tasks لا تنفذ بدون approval.

- Questionnaire tasks تربط question_id و answer_id.

### 5. Update task schema with governance and provenance fields

Labels: task-governance, provenance, priority-high

**Scope:**

- إضافة delivery_mode, intake_mode, source_type, source_mode, source_reference.

- إضافة owner, assignee, reviewer, allowed_files, forbidden_files.

- الحفاظ على التوافق مع v1.0.0.

**Acceptance criteria:**

- schema يدعم الحقول الجديدة.

- ملفات v1 القديمة تظل قابلة للقراءة.

# Milestone: v1.4.0 — Agile Delivery Core and Sprint Cost Metadata

تأسيس Agile Delivery مع Backlog وEpics وStories وSprint Planning مع حقول تكلفة AI Tokens.

| **القيمة**                                    | **العنصر**      |
|-----------------------------------------------|-----------------|
| جعل Agile قابل للتشغيل والقياس من أول Sprint. | **الهدف**       |
| 5                                             | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                       | **ملاحظات**     |

## Issues

### 1. Create agile delivery layer

Labels: agile, docs, task-tracking, priority-high

**Scope:**

- إنشاء agile_delivery/.

- إضافة README.md يشرح Agile داخل Kabeeri VDF.

- شرح العلاقة بين Agile وAI-assisted development.

**Acceptance criteria:**

- agile_delivery/ موجود.

- لا يكرر task_tracking بدون إضافة قيمة.

### 2. Add product backlog template

Labels: agile, task-tracking, priority-high

**Scope:**

- إضافة PRODUCT_BACKLOG_TEMPLATE.md.

- دعم item, priority, status, epic, sprint, acceptance notes.

**Acceptance criteria:**

- Backlog template موجود.

- يعمل مع GitHub Issues.

### 3. Add epic and user story templates

Labels: agile, task-tracking, priority-high

**Scope:**

- إضافة EPIC_TEMPLATE.md و USER_STORY_TEMPLATE.md.

- إضافة acceptance criteria و AI implementation notes.

- منع تنفيذ Epic كامل مرة واحدة.

**Acceptance criteria:**

- Templates موجودة.

- جاهزة للنسخ داخل GitHub Issues.

### 4. Add sprint planning and review templates

Labels: agile, acceptance, task-tracking, priority-medium

**Scope:**

- إضافة SPRINT_PLANNING_TEMPLATE.md.

- إضافة SPRINT_REVIEW_TEMPLATE.md.

- ربط Sprint output بـ acceptance_checklists.

**Acceptance criteria:**

- Sprint templates موجودة.

- تدعم Increment صغير قابل للمراجعة.

### 5. Add sprint cost metadata schema

Labels: agile, ai-usage, priority-high

**Scope:**

- تعريف sprint_id, stories, tasks, total_tokens, total_cost, workstream costs.

- دعم accepted/rejected/rework cost.

**Acceptance criteria:**

- Sprint cost metadata موجود.

- يمكن استخدامه لاحقًا في dashboard.

# Milestone: v1.5.0 — Basic AI Usage Accounting Foundation

إضافة ملفات أولية لتسجيل استهلاك AI Tokens قبل عرضها في Dashboard لاحقًا.

| **القيمة**                                                                    | **العنصر**      |
|-------------------------------------------------------------------------------|-----------------|
| تأسيس قياس تكلفة الذكاء الاصطناعي على مستوى task/sprint/workstream/developer. | **الهدف**       |
| 4                                                                             | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                                       | **ملاحظات**     |

## Issues

### 1. Create ai usage folder specification

Labels: ai-usage, docs, priority-high

**Scope:**

- تعريف .kabeeri/ai_usage/.

- تحديد الملفات: usage_events.jsonl, usage_summary.json, pricing_rules.json, cost_breakdown.json, sprint_costs.json.

**Acceptance criteria:**

- المجلد موثق.

- الفصل واضح بين access tokens و AI usage tokens.

### 2. Add AI usage event schema

Labels: ai-usage, priority-high

**Scope:**

- تعريف event_id, timestamp, developer_id, task_id, workstream, provider, model, input/output/cached tokens, tracked.

- دعم untracked usage.

**Acceptance criteria:**

- usage event schema موجود.

- يمكن تسجيل كل استخدام AI.

### 3. Add pricing rules schema

Labels: ai-usage, priority-medium

**Scope:**

- تعريف currency, unit, provider/model pricing.

- دعم input/output/cached prices.

- عدم تضمين أسعار ثابتة إلزامية.

**Acceptance criteria:**

- pricing_rules schema موجود.

- المستخدم يستطيع إدخال الأسعار يدويًا.

### 4. Add untracked AI usage rules

Labels: ai-usage, task-governance, priority-high

**Scope:**

- تعريف متى يعتبر الاستخدام random/untracked.

- أي استخدام بدون task_id أو approved token أو source_reference يظهر كـ untracked.

**Acceptance criteria:**

- untracked usage موثق.

- قابل للعرض لاحقًا في dashboard.

# ملاحظات تنفيذية أخيرة

- v2.0.0 لا يلغي Structured Mode؛ هو يضيف Agile ويؤسس قواعد التحكم.

- كل Task يجب أن تكون لها source و acceptance و owner approval قبل التنفيذ.

- AI usage tokens تختلف عن access tokens ويجب فصلهما في الملفات.

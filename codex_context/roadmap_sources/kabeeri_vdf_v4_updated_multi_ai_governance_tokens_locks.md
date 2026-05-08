# v4.0.0 Updated Plan

Multi-AI Developer Governance + Single Owner + Access Tokens + Locks + Budgets + Audit

## الغرض من الملف

هذا الملف يحدّث خطة v4.0.0 لتدعم إدارة أكثر من مطور أو AI Developer على نفس المشروع بدون تداخل، مع Owner واحد فقط، توكنات وصول، locks، ميزانيات توكنات، وتدقيق كامل.

## ملخص سريع

| **القيمة**                                     | **العنصر**             |
|------------------------------------------------|------------------------|
| v4.0.0                                         | **الإصدار المستهدف**   |
| 9                                              | **عدد الـ Milestones** |
| 28                                             | **إجمالي Issues**      |
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

| **Color** | **Description**                                            | **Label**               |
|-----------|------------------------------------------------------------|-------------------------|
| \#5319E7  | كل ما يخص أنماط التشغيل: Structured و Agile                | **delivery-mode**       |
| \#0075CA  | النمط المنظم/التسلسلي                                      | **structured-delivery** |
| \#0E8A16  | Agile: Backlog, Sprint, Stories                            | **agile**               |
| \#1D76DB  | بدء مشروع جديد أو اعتماد مشروع موجود                       | **project-intake**      |
| \#D93F0B  | قواعد إنشاء وإدارة التاسكات                                | **task-governance**     |
| \#FBCA04  | تتبع مصدر نشأة التاسك                                      | **provenance**          |
| \#7057FF  | توثيق استهلاك AI Tokens وتكلفة الذكاء الاصطناعي            | **ai-usage**            |
| \#C5DEF5  | داشبورد المشروع                                            | **dashboard**           |
| \#0075CA  | تكامل GitHub                                               | **github**              |
| \#5319E7  | تكامل VS Code                                              | **vscode**              |
| \#5319E7  | أوامر CLI                                                  | **cli**                 |
| \#D93F0B  | الصلاحيات والأدوار                                         | **permissions**         |
| \#B60205  | توكنات الوصول والصلاحيات                                   | **token-access**        |
| \#B60205  | أولوية عالية                                               | **priority-high**       |
| \#FBCA04  | أولوية متوسطة                                              | **priority-medium**     |
| \#7057FF  | مناسب للمساهمين الجدد                                      | **good-first-issue**    |
| \#5319E7  | إدارة أكثر من AI Developer أو مطور مدعوم بالذكاء الاصطناعي | **multi-ai**            |
| \#D93F0B  | قفل تاسكات/ملفات/فولدرات لمنع التعارض                      | **locking**             |
| \#B60205  | نقل صلاحية Owner الوحيد                                    | **owner-transfer**      |
| \#FBCA04  | ميزانية توكنات وتكلفة لكل تاسك                             | **budget-control**      |

## قائمة Milestones المختصرة

| **Issues** | **Goal**                                                              | **Milestone**                                           |
|------------|-----------------------------------------------------------------------|---------------------------------------------------------|
| 3          | إتاحة عمل أكثر من مطور أو AI Agent بدون تداخل.                        | **v3.1.0 — Collaboration Identity and Role Model**      |
| 3          | منع تضارب الصلاحية العليا مع إتاحة نقلها بأمان.                       | **v3.2.0 — Single Owner and Owner Transfer**            |
| 3          | السماح بالعمل على Task محددة بحدود واضحة وتنتهي صلاحيتها عند الإتمام. | **v3.3.0 — Task Access Tokens Lifecycle**               |
| 3          | منع تداخل التاسكات والملفات والعمل المتوازي الخطر.                    | **v3.4.0 — Locks and Conflict Prevention**              |
| 3          | منع أي AI Developer من العمل على Task غير معتمدة أو غير مخصصة له.     | **v3.5.0 — Assignment and Execution Governance**        |
| 3          | جعل كل مخرجات AI قابلة للقراءة والمراجعة والتكلفة والتدقيق.           | **v3.6.0 — AI Developer Sessions and Output Contracts** |
| 3          | منع استهلاك AI tokens عشوائيًا وإتاحة التسعير والتحليل.                | **v3.7.0 — Token Budgets and Cost Controls**            |
| 3          | إغلاق دورة التاسك بأمان بعد تحقق Owner فقط.                           | **v3.8.0 — Owner Verify, Token Revocation, and Audit**  |
| 4          | تسليم نموذج حوكمة قوي ومرن للتطوير الجماعي المدعوم بالذكاء الاصطناعي. | **v4.0.0 — Stable Multi-AI Governance Release**         |

# Milestone: v3.1.0 — Collaboration Identity and Role Model

تعريف هوية المطورين وAI Agents والأدوار والصلاحيات.

| **القيمة**                                     | **العنصر**      |
|------------------------------------------------|-----------------|
| إتاحة عمل أكثر من مطور أو AI Agent بدون تداخل. | **الهدف**       |
| 3                                              | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                        | **ملاحظات**     |

## Issues

### 1. Define collaboration identity model

Labels: multi-ai, permissions, priority-high

**Scope:**

- تعريف developers.json و agents.json.

- دعم human developer و AI developer.

- تسجيل role و workstream و status.

**Acceptance criteria:**

- كل مطور/Agent له ID.

- الهوية قابلة للتتبع في audit log.

### 2. Define role and permission model

Labels: permissions, multi-ai, priority-high

**Scope:**

- Owner, Maintainer, Reviewer, Backend Developer, Frontend Developer, Admin Frontend Developer, Business Analyst, AI Developer, Viewer.

- تحديد صلاحيات كل دور.

**Acceptance criteria:**

- Role matrix موجود.

- Owner واحد فقط.

### 3. Add workstream ownership rules

Labels: multi-ai, task-governance, priority-medium

**Scope:**

- Backend, Public Frontend, Admin Frontend, Database, Docs, QA.

- تحديد من يمكنه استلام تاسكات كل workstream.

**Acceptance criteria:**

- Workstream rules تمنع التداخل.

# Milestone: v3.2.0 — Single Owner and Owner Transfer

تثبيت نموذج Owner واحد فقط مع إمكانية نقل الصلاحية بتوكن.

| **القيمة**                                      | **العنصر**      |
|-------------------------------------------------|-----------------|
| منع تضارب الصلاحية العليا مع إتاحة نقلها بأمان. | **الهدف**       |
| 3                                               | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                         | **ملاحظات**     |

## Issues

### 1. Enforce single owner rule

Labels: permissions, owner-transfer, priority-high

**Scope:**

- توثيق Only one Owner at a time.

- منع وجود 2 Owners.

- تحديد default downgrade للمالك القديم عند النقل.

**Acceptance criteria:**

- قاعدة Owner واحد واضحة.

- لا يوجد سيناريو بمالكين في نفس الوقت.

### 2. Design owner transfer token lifecycle

Labels: owner-transfer, token-access, priority-high

**Scope:**

- created, issued, accepted, used, expired, revoked.

- بعد الاستخدام ينتقل الدور للمالك الجديد وينزل القديم لدور عادي.

**Acceptance criteria:**

- Owner transfer flow موثق.

- التوكن يستخدم مرة واحدة.

### 3. Add owner transfer audit log rules

Labels: owner-transfer, docs, priority-high

**Scope:**

- تسجيل من أنشأ التوكن، من قبله، وقت النقل، الدور الجديد للمالك القديم.

**Acceptance criteria:**

- كل نقل ملكية قابل للتدقيق.

# Milestone: v3.3.0 — Task Access Tokens Lifecycle

إدارة توكنات العمل على التاسكات لكل مطور أو AI Agent.

| **القيمة**                                                            | **العنصر**      |
|-----------------------------------------------------------------------|-----------------|
| السماح بالعمل على Task محددة بحدود واضحة وتنتهي صلاحيتها عند الإتمام. | **الهدف**       |
| 3                                                                     | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                               | **ملاحظات**     |

## Issues

### 1. Define task access token schema

Labels: token-access, task-governance, priority-high

**Scope:**

- task_id, assignee_id, workstream, allowed_files, forbidden_files, expires_at, max_usage_tokens, max_cost, owner_verify_required.

**Acceptance criteria:**

- Token schema موجود.

- كل توكن مربوط بتاسك ومطور.

### 2. Add access token lifecycle rules

Labels: token-access, priority-high

**Scope:**

- created, assigned, active, used, expired, revoked, reissued.

- إلغاء التوكن بعد إتمام التاسك أو رفضها حسب القواعد.

**Acceptance criteria:**

- Lifecycle واضح.

- لا توجد صلاحية مفتوحة بلا نهاية.

### 3. Add token issue and revoke commands design

Labels: token-access, cli, priority-medium

**Scope:**

- kvdf token issue --task.

- kvdf token revoke TOKEN-ID.

- kvdf token list.

**Acceptance criteria:**

- CLI commands موثقة.

- Owner/Maintainer فقط حسب الصلاحية.

# Milestone: v3.4.0 — Locks and Conflict Prevention

نظام Locks لمنع أكثر من مطور/AI من تعديل نفس النطاق بدون موافقة.

| **القيمة**                                         | **العنصر**      |
|----------------------------------------------------|-----------------|
| منع تداخل التاسكات والملفات والعمل المتوازي الخطر. | **الهدف**       |
| 3                                                  | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                            | **ملاحظات**     |

## Issues

### 1. Define task file folder workstream lock types

Labels: locking, task-governance, priority-high

**Scope:**

- Task Lock, File Lock, Folder Lock, Workstream Lock, Database Table Lock, Prompt Pack Lock.

**Acceptance criteria:**

- Lock types موثقة.

- كل lock له owner و expiry و reason.

### 2. Add conflict detection rules

Labels: locking, priority-high

**Scope:**

- منع Task جديدة من نفس allowed_files/folders إذا في lock نشط.

- تعريف manual conflict resolution.

**Acceptance criteria:**

- Conflict rules تمنع التداخل.

- لا يتم حل التعارض تلقائيًا بخطر.

### 3. Design lock dashboard view

Labels: locking, dashboard, priority-medium

**Scope:**

- عرض locks الحالية، مالكها، التاسك، الملفات، وقت الانتهاء.

**Acceptance criteria:**

- الداشبورد يوضح مين قافل إيه.

# Milestone: v3.5.0 — Assignment and Execution Governance

قواعد اعتماد وتوزيع التاسكات قبل التنفيذ.

| **القيمة**                                                        | **العنصر**      |
|-------------------------------------------------------------------|-----------------|
| منع أي AI Developer من العمل على Task غير معتمدة أو غير مخصصة له. | **الهدف**       |
| 3                                                                 | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                           | **ملاحظات**     |

## Issues

### 1. Add task assignment rules for multi developer work

Labels: multi-ai, task-governance, priority-high

**Scope:**

- Task proposed -\> approved -\> ready -\> assigned -\> in_progress -\> review -\> verified.

- من يمكنه assign ومتى.

**Acceptance criteria:**

- Assignment flow واضح.

- لا تنفيذ بدون assignment.

### 2. Add backend frontend admin frontend task separation rules

Labels: multi-ai, task-governance, priority-high

**Scope:**

- فصل Backend/Public Frontend/Admin Frontend.

- منع Task واحدة من لمس أكثر من workstream إلا Integration Task مع approval.

**Acceptance criteria:**

- التاسكات متقسمة بوضوح.

- Integration tasks لها قواعد خاصة.

### 3. Add reviewer independence rule

Labels: acceptance, permissions, priority-medium

**Scope:**

- المنفذ لا يقبل Task بنفسه.

- Reviewer يوصي فقط، Owner يverify نهائيًا.

**Acceptance criteria:**

- Review governance واضح.

# Milestone: v3.6.0 — AI Developer Sessions and Output Contracts

تنظيم جلسات AI Developers ومخرجاتها القياسية.

| **القيمة**                                                  | **العنصر**      |
|-------------------------------------------------------------|-----------------|
| جعل كل مخرجات AI قابلة للقراءة والمراجعة والتكلفة والتدقيق. | **الهدف**       |
| 3                                                           | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                     | **ملاحظات**     |

## Issues

### 1. Define AI developer session schema

Labels: multi-ai, ai-usage, priority-high

**Scope:**

- session_id, developer_id, task_id, model/provider, start/end, token usage, files touched.

**Acceptance criteria:**

- AI sessions قابلة للتتبع.

### 2. Add AI output contract rules

Labels: multi-ai, acceptance, priority-high

**Scope:**

- Summary, Files created, Files changed, Checks run, Risks, Known limitations, Needs review, Next suggested task.

**Acceptance criteria:**

- كل AI output له صيغة ثابتة.

- عدم الالتزام يمنع verify.

### 3. Add random prompt prevention rules

Labels: ai-usage, task-governance, priority-medium

**Scope:**

- أي استخدام AI بدون task/token/source يصنف untracked.

- إظهار التحذير في dashboard لاحقًا.

**Acceptance criteria:**

- Random AI usage قابل للرصد.

# Milestone: v3.7.0 — Token Budgets and Cost Controls

ميزانيات توكنات وتكلفة لكل Task وSprint ومطور.

| **القيمة**                                             | **العنصر**      |
|--------------------------------------------------------|-----------------|
| منع استهلاك AI tokens عشوائيًا وإتاحة التسعير والتحليل. | **الهدف**       |
| 3                                                      | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                | **ملاحظات**     |

## Issues

### 1. Add task token budget fields

Labels: budget-control, ai-usage, priority-high

**Scope:**

- max_input_tokens, max_output_tokens, max_total_tokens, max_cost.

- ربط budget بـ Task Access Token.

**Acceptance criteria:**

- كل Task يمكن أن يكون لها budget.

### 2. Add budget warning and approval rules

Labels: budget-control, dashboard, priority-high

**Scope:**

- تحذير عند الاقتراب من budget.

- طلب Owner approval لتجاوز الحد.

**Acceptance criteria:**

- تجاوز الميزانية لا يحدث بصمت.

### 3. Add cost control dashboard metrics

Labels: budget-control, dashboard, ai-usage, priority-medium

**Scope:**

- Cost by task, sprint, developer, workstream, accepted/rejected/rework.

**Acceptance criteria:**

- مؤشرات التكلفة واضحة.

# Milestone: v3.8.0 — Owner Verify, Token Revocation, and Audit

ربط verify النهائي بإلغاء التوكن وتسجيل audit كامل.

| **القيمة**                                  | **العنصر**      |
|---------------------------------------------|-----------------|
| إغلاق دورة التاسك بأمان بعد تحقق Owner فقط. | **الهدف**       |
| 3                                           | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                     | **ملاحظات**     |

## Issues

### 1. Link owner verify to token revocation

Labels: owner-verify, token-access, priority-high

**Scope:**

- عند verify: revoke access token.

- تحديث task status.

- تسجيل audit event.

**Acceptance criteria:**

- التوكن يلغى بعد verify.

- الحالة تتحدث تلقائيًا.

### 2. Add owner rejection and reissue rules

Labels: owner-verify, task-governance, priority-medium

**Scope:**

- إذا rejected: تسجيل السبب.

- إعادة إصدار token محدود إذا لزم.

**Acceptance criteria:**

- رفض التاسك لا يسبب فوضى صلاحيات.

### 3. Add final verification audit report

Labels: owner-verify, docs, priority-medium

**Scope:**

- تقرير: task, assignee, reviewer, owner, token, files, acceptance, usage tokens.

**Acceptance criteria:**

- كل Task verified لها تقرير نهائي.

# Milestone: v4.0.0 — Stable Multi-AI Governance Release

إصدار مستقر يدعم أكثر من مطور/AI Developer بصلاحيات وتوكنات وlocks وتكلفة.

| **القيمة**                                                            | **العنصر**      |
|-----------------------------------------------------------------------|-----------------|
| تسليم نموذج حوكمة قوي ومرن للتطوير الجماعي المدعوم بالذكاء الاصطناعي. | **الهدف**       |
| 4                                                                     | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                               | **ملاحظات**     |

## Issues

### 1. Prepare v4.0.0 governance release checklist

Labels: acceptance, docs, priority-high

**Scope:**

- فحص roles, tokens, locks, assignment, verify, audit, budgets.

**Acceptance criteria:**

- Checklist جاهزة.

### 2. Run multi-ai collaboration scenario review

Labels: multi-ai, acceptance, priority-high

**Scope:**

- سيناريو Backend + Frontend + Admin Frontend + Owner verify.

- توثيق gaps.

**Acceptance criteria:**

- السيناريو يعمل بدون task overlap.

### 3. Prepare v4.0.0 release notes

Labels: docs, priority-high

**Scope:**

- تلخيص Multi-AI Governance وSingle Owner وTokens وLocks وCost Control.

**Acceptance criteria:**

- Release notes جاهزة.

### 4. Publish v4.0.0 GitHub release

Labels: docs, priority-high

**Scope:**

- Confirm milestones complete.

- Create tag v4.0.0.

- Publish release.

**Acceptance criteria:**

- v4.0.0 منشور.

# ملاحظات تنفيذية أخيرة

- Owner واحد فقط في نفس الوقت.

- كل مطور أو AI Developer يعمل بتوكن مخصص لمهمة محددة.

- لا توجد Task تنفذ بدون assignment وlock وacceptance وsource واضح.

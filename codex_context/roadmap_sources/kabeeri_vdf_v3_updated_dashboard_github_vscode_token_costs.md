# v3.0.0 Updated Plan

GitHub CLI + VS Code + Live Dashboard + Owner Verify + AI Token Cost Analytics

## الغرض من الملف

هذا الملف يحدّث خطة v3.0.0 لتجعل Kabeeri يعمل داخل VS Code وCLI، يتزامن مع GitHub، ويعرض Dashboard حية لحالة التطوير والتكلفة والتقدم والتحقق النهائي بواسطة Owner فقط.

## ملخص سريع

| **القيمة**                                     | **العنصر**             |
|------------------------------------------------|------------------------|
| v3.0.0                                         | **الإصدار المستهدف**   |
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
| \#B60205  | التحقق النهائي بواسطة Owner فقط                 | **owner-verify**        |
| \#0E8A16  | عرض حالة البزنس والقدرات ومسار المستخدم         | **business-dashboard**  |
| \#0075CA  | عرض حالة التطوير التقني                         | **technical-dashboard** |
| \#FBCA04  | تحليل تكلفة التوكنات                            | **cost-analytics**      |

## قائمة Milestones المختصرة

| **Issues** | **Goal**                                                         | **Milestone**                                        |
|------------|------------------------------------------------------------------|------------------------------------------------------|
| 3          | جعل Dashboard وCLI وGitHub يقرؤون من حالة موحدة.                 | **v2.1.0 — Local Project State and Source of Truth** |
| 3          | ربط Kabeeri tasks مع GitHub بشكل قابل للمزامنة.                  | **v2.2.0 — GitHub CLI Integration**                  |
| 3          | تشغيل Kabeeri من داخل VS Code عبر CLI وExtension/Webview.        | **v2.3.0 — VS Code Integration Foundation**          |
| 3          | تمكين المطور والمالك من رؤية حالة المشروع تقنيًا.                 | **v2.4.0 — Live Technical Dashboard**                |
| 3          | تقديم رؤية واضحة لصاحب المشروع والجمهور المستهدف عن قيمة المنتج. | **v2.5.0 — Business Dashboard**                      |
| 3          | منع إغلاق التاسكات أو اعتبارها مكتملة بدون موافقة المالك الأعلى. | **v2.6.0 — Owner-Only Task Verification**            |
| 4          | تحويل استهلاك AI Tokens إلى بيانات تسعير ومراقبة جودة.           | **v2.7.0 — AI Token Cost Dashboard**                 |
| 3          | تحديد سعر Sprint والتعلم من تكلفة كل Increment.                  | **v2.8.0 — Agile Sprint Cost Analytics**             |
| 3          | تسليم منصة تشغيل محلية قابلة للقياس والربط.                      | **v3.0.0 — Stable Platform Integration Release**     |

# Milestone: v2.1.0 — Local Project State and Source of Truth

تثبيت .kabeeri/ كمصدر الحقيقة للحالة المحلية داخل المشروع.

| **القيمة**                                       | **العنصر**      |
|--------------------------------------------------|-----------------|
| جعل Dashboard وCLI وGitHub يقرؤون من حالة موحدة. | **الهدف**       |
| 3                                                | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                          | **ملاحظات**     |

## Issues

### 1. Define .kabeeri source of truth structure

Labels: docs, cli, priority-high

**Scope:**

- تعريف .kabeeri/project.json, tasks.json, developers.json, locks.json, acceptance.json, audit_log.jsonl.

- تحديد أن Dashboard ليست مصدر الحقيقة.

**Acceptance criteria:**

- .kabeeri structure موثق.

- Source of Truth واضح.

### 2. Add dashboard state file specification

Labels: dashboard, docs, priority-high

**Scope:**

- تعريف .kabeeri/dashboard/technical_state.json و business_state.json.

- تحديد ما يظهر في الداشبورد وما يبقى داخليًا.

**Acceptance criteria:**

- Dashboard state schema واضح.

- لا يعرض أسرار.

### 3. Add project audit log specification

Labels: docs, task-governance, priority-high

**Scope:**

- تعريف audit_log.jsonl.

- تسجيل task creation, assignment, verify, reject, token issue/revoke.

**Acceptance criteria:**

- Audit events موثقة.

- كل حدث مهم قابل للتتبع.

# Milestone: v2.2.0 — GitHub CLI Integration

إدارة Issues/Milestones/Releases عبر CLI بدون الاعتماد على GitHub UI.

| **القيمة**                                      | **العنصر**      |
|-------------------------------------------------|-----------------|
| ربط Kabeeri tasks مع GitHub بشكل قابل للمزامنة. | **الهدف**       |
| 3                                               | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                         | **ملاحظات**     |

## Issues

### 1. Design GitHub sync configuration

Labels: github, cli, priority-high

**Scope:**

- تعريف .kabeeri/github/sync_config.json.

- تحديد repo, branch, milestones, labels, issue mapping.

**Acceptance criteria:**

- GitHub sync config موثق.

- لا يتم تعديل GitHub بدون تأكيد.

### 2. Add GitHub issue mapping rules

Labels: github, task-tracking, priority-high

**Scope:**

- ربط task_id بـ issue number.

- تعريف حالات sync والتعارض.

**Acceptance criteria:**

- issue_map schema موجود.

- تعارض الحالة لا يحل تلقائيًا بدون موافقة.

### 3. Design CLI commands for GitHub issues and milestones

Labels: github, cli, priority-high

**Scope:**

- kvdf github issue create/list/sync.

- kvdf github milestone create/list/sync.

- دعم dry-run.

**Acceptance criteria:**

- الأوامر موثقة.

- لا تحتاج GitHub UI للتشغيل الأساسي.

# Milestone: v2.3.0 — VS Code Integration Foundation

تصميم التكامل مع VS Code كبداية للتكامل مع أي Text Editor لاحقًا.

| **القيمة**                                                | **العنصر**      |
|-----------------------------------------------------------|-----------------|
| تشغيل Kabeeri من داخل VS Code عبر CLI وExtension/Webview. | **الهدف**       |
| 3                                                         | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                   | **ملاحظات**     |

## Issues

### 1. Design VS Code extension integration architecture

Labels: vscode, docs, priority-high

**Scope:**

- تحديد علاقة Extension بـ CLI و .kabeeri files.

- تحديد panels: tasks, dashboard, usage, GitHub sync.

**Acceptance criteria:**

- Architecture document موجود.

- Extension لا يصبح مصدر الحقيقة.

### 2. Add VS Code command palette plan

Labels: vscode, cli, priority-medium

**Scope:**

- أوامر مثل: Verify Task, Open Dashboard, Sync GitHub, Show Token Usage.

**Acceptance criteria:**

- Command palette موثق.

- مرتبط بـ CLI.

### 3. Design editor-agnostic integration rules

Labels: vscode, docs, priority-medium

**Scope:**

- تحديد كيف يمكن دعم Text Editors أخرى لاحقًا.

- عدم ربط Kabeeri بالكامل بـ VS Code فقط.

**Acceptance criteria:**

- Integration abstraction واضح.

# Milestone: v2.4.0 — Live Technical Dashboard

داشبورد تقنية تعرض حالة التطوير مباشرة من ملفات .kabeeri وGitHub sync.

| **القيمة**                                       | **العنصر**      |
|--------------------------------------------------|-----------------|
| تمكين المطور والمالك من رؤية حالة المشروع تقنيًا. | **الهدف**       |
| 3                                                | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                          | **ملاحظات**     |

## Issues

### 1. Design technical dashboard sections

Labels: technical-dashboard, dashboard, priority-high

**Scope:**

- Tasks, GitHub Issues, branches, build status, test status, database tables, backend/public frontend/admin frontend progress.

**Acceptance criteria:**

- الأقسام موثقة.

- كل قسم يقرأ من ملف state محدد.

### 2. Add backend frontend admin frontend progress model

Labels: technical-dashboard, docs, priority-high

**Scope:**

- تقسيم التقدم إلى backend, public_frontend, admin_frontend, database, docs, testing.

**Acceptance criteria:**

- progress model موجود.

- يناسب المشاريع الكبيرة.

### 3. Add live developer progress model

Labels: dashboard, task-tracking, priority-high

**Scope:**

- إظهار developer/agent, role, current task, locks, last activity, status, cost so far.

**Acceptance criteria:**

- يمكن معرفة كل مطور وصل لفين.

- لا يوجد خلط بين المطورين.

# Milestone: v2.5.0 — Business Dashboard

داشبورد بزنس تعرض القدرات، قيمة المنتج، مسار المستخدم، والجمهور المستهدف.

| **القيمة**                                                       | **العنصر**      |
|------------------------------------------------------------------|-----------------|
| تقديم رؤية واضحة لصاحب المشروع والجمهور المستهدف عن قيمة المنتج. | **الهدف**       |
| 3                                                                | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                          | **ملاحظات**     |

## Issues

### 1. Design business dashboard sections

Labels: business-dashboard, dashboard, priority-high

**Scope:**

- Product capabilities, feature readiness, user journey, target audience, onboarding, release value.

**Acceptance criteria:**

- Business dashboard موثق.

- يفصل بين اللغة التقنية ولغة البزنس.

### 2. Add feature readiness business model

Labels: business-dashboard, docs, priority-medium

**Scope:**

- تعريف ready_to_demo, ready_to_publish, needs_review, future.

- ربط feature بالـ tasks والacceptance.

**Acceptance criteria:**

- حالة كل feature واضحة لغير التقنيين.

### 3. Add onboarding and user journey dashboard model

Labels: business-dashboard, example, priority-medium

**Scope:**

- عرض مسار المستخدم والإجراءات الأساسية.

- إظهار what is ready to show.

**Acceptance criteria:**

- User journey قابل للعرض.

- يساعد التسويق والعرض للعميل.

# Milestone: v2.6.0 — Owner-Only Task Verification

تمكين verify من الداشبورد والCLI لكن بصلاحية Owner فقط.

| **القيمة**                                                       | **العنصر**      |
|------------------------------------------------------------------|-----------------|
| منع إغلاق التاسكات أو اعتبارها مكتملة بدون موافقة المالك الأعلى. | **الهدف**       |
| 3                                                                | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                          | **ملاحظات**     |

## Issues

### 1. Add owner-only verify rules

Labels: owner-verify, permissions, priority-high

**Scope:**

- تعريف أن final verify من Owner فقط.

- Reviewer يمكنه recommendation لكن لا يملك final verify.

**Acceptance criteria:**

- Owner-only rule موثق.

- لا يوجد أكثر من صاحب Verify نهائي.

### 2. Design dashboard verify action

Labels: owner-verify, dashboard, priority-high

**Scope:**

- زر Verify Task في الداشبورد.

- إظهاره/تفعيله فقط للـ Owner.

- تسجيل verify في audit_log.

**Acceptance criteria:**

- verify action موثق.

- غير متاح للمطور العادي.

### 3. Design CLI task verify reject reopen commands

Labels: owner-verify, cli, priority-high

**Scope:**

- kvdf task verify TASK-ID.

- kvdf task reject TASK-ID --reason.

- kvdf task reopen TASK-ID.

**Acceptance criteria:**

- الأوامر موثقة.

- تحتاج owner session أو owner approval token.

# Milestone: v2.7.0 — AI Token Cost Dashboard

داشبورد وتحليل توكنات الذكاء الاصطناعي حسب المشروع والمطور والتاسك والنسخة والSprint.

| **القيمة**                                             | **العنصر**      |
|--------------------------------------------------------|-----------------|
| تحويل استهلاك AI Tokens إلى بيانات تسعير ومراقبة جودة. | **الهدف**       |
| 4                                                      | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                                | **ملاحظات**     |

## Issues

### 1. Add AI token usage dashboard sections

Labels: ai-usage, dashboard, cost-analytics, priority-high

**Scope:**

- Total tokens, cost, by version, milestone, sprint, task, developer, workstream, model/provider.

**Acceptance criteria:**

- كل تقسيم موثق.

- يدعم تسعير المنتج.

### 2. Add token cost calculator specification

Labels: ai-usage, dashboard, priority-high

**Scope:**

- إدخال تكلفة input/output/cached tokens.

- دعم per token/per 1K/per 1M.

- اختيار currency.

**Acceptance criteria:**

- Calculator spec موجود.

- لا يعتمد على أسعار ثابتة.

### 3. Add workstream token breakdown

Labels: ai-usage, cost-analytics, priority-high

**Scope:**

- Backend, public frontend, admin frontend, database, docs, testing, debugging, refactor, business analysis, untracked.

**Acceptance criteria:**

- التكلفة توضح أين ذهبت التوكنات.

### 4. Add developer token efficiency analysis

Labels: ai-usage, dashboard, priority-medium

**Scope:**

- تحليل استهلاك كل developer/AI Agent.

- إظهار high usage warnings.

- تمييز accepted vs rejected/rework cost.

**Acceptance criteria:**

- يمكن تقييم كفاءة المطور.

# Milestone: v2.8.0 — Agile Sprint Cost Analytics

حساب تكلفة كل Sprint في Agile بالـ Tokens والتكلفة والتوزيع حسب Stories وWorkstreams.

| **القيمة**                                      | **العنصر**      |
|-------------------------------------------------|-----------------|
| تحديد سعر Sprint والتعلم من تكلفة كل Increment. | **الهدف**       |
| 3                                               | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                         | **ملاحظات**     |

## Issues

### 1. Add sprint token cost model

Labels: agile, ai-usage, cost-analytics, priority-high

**Scope:**

- Sprint total tokens/cost.

- Cost per story/task/developer/workstream.

- Accepted/rework/untracked cost.

**Acceptance criteria:**

- Sprint cost model موثق.

- يساعد في pricing.

### 2. Add sprint cost dashboard view

Labels: agile, dashboard, ai-usage, priority-high

**Scope:**

- عرض تكلفة Sprint الحالية والسابقة.

- مقارنة Backend/Frontend/Admin frontend.

- تحذير من untracked usage.

**Acceptance criteria:**

- Sprint dashboard view موثق.

### 3. Add sprint pricing notes

Labels: agile, docs, cost-analytics, priority-medium

**Scope:**

- شرح أن سعر Sprint = AI tokens + developer time + review cost + risk margin.

- Kabeeri يبدأ بـ AI token cost ثم يتوسع لاحقًا.

**Acceptance criteria:**

- Pricing notes واضحة.

# Milestone: v3.0.0 — Stable Platform Integration Release

إصدار مستقر يثبت GitHub/VS Code/Dashboard/Verify/Token Cost Analytics.

| **القيمة**                                  | **العنصر**      |
|---------------------------------------------|-----------------|
| تسليم منصة تشغيل محلية قابلة للقياس والربط. | **الهدف**       |
| 3                                           | **عدد الإشيوز** |
| لا توجد ملاحظات إضافية.                     | **ملاحظات**     |

## Issues

### 1. Prepare v3.0.0 integration release checklist

Labels: acceptance, docs, priority-high

**Scope:**

- فحص GitHub sync, VS Code integration, dashboard, owner verify, token analytics.

**Acceptance criteria:**

- Checklist موجودة.

- كل المكونات لها review.

### 2. Prepare v3.0.0 release notes

Labels: docs, priority-high

**Scope:**

- تلخيص GitHub CLI, VS Code, Dashboard, Owner Verify, Token Cost Analytics.

- ذكر limitations.

**Acceptance criteria:**

- Release notes جاهزة.

### 3. Publish v3.0.0 GitHub release

Labels: docs, priority-high

**Scope:**

- Confirm milestone complete.

- Create tag v3.0.0.

- Publish release.

**Acceptance criteria:**

- v3.0.0 منشور.

# ملاحظات تنفيذية أخيرة

- Dashboard تعرض البيانات ولا تكون Source of Truth.

- Verify النهائي من Owner فقط.

- تكلفة AI Tokens يجب أن تظهر حسب task/sprint/workstream/developer/version.

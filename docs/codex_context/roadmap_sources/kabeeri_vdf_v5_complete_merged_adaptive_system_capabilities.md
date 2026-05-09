**Kabeeri VDF v5.0.0  
Complete Merged Update Plan  
**Adaptive Questionnaire Flow + System Capability Map + Original v5 Trust Layer

# ملاحظة مهمة عن الدمج

هذه النسخة لا تحذف المحتوى الذي كان موجودًا قبل التحديث. تم الحفاظ على خطة v5.0.0 الأصلية كاملة في القسم الأخير من الملف، وتمت إضافة طبقتين جديدتين فوقها: نظام الأسئلة المرن الذكي، وخريطة جميع جوانب الأنظمة والتطبيقات التي تساعد محرك الأسئلة على عدم تفويت أي جزء مهم.

| **الجزء**                  | **الحالة في هذه النسخة**                                    |
|----------------------------|-------------------------------------------------------------|
| المحتوى الأصلي قبل التحديث | موجود بالكامل في قسم: المحتوى الأصلي الكامل قبل التحديث     |
| نظام الأسئلة المرن الذكي   | مضاف كطبقة جديدة قبل المحتوى الأصلي                         |
| System Capability Map      | مضاف كعقل مرجعي للأسئلة والجوانب المطلوبة لكل نوع نظام      |
| الهدف                      | تقليل الأسئلة غير الضرورية وعدم تفويت الجوانب المهمة للنظام |

# A. Adaptive Questionnaire Flow — نظام الأسئلة المرن الذكي

بدل أن يسأل Kabeeri كل الأسئلة لكل المشاريع، يتم استخدام مجموعات أسئلة تكيفية. كل مجموعة إجابات تحدد ما إذا كانت المجموعة التالية مطلوبة، اختيارية، مؤجلة، غير منطبقة، أو تحتاج متابعة.

> Entry Questions  
> → Project Type Detection  
> → System Area Activation  
> → Grouped Questionnaires  
> → Conditional Deep Questions  
> → Coverage Review  
> → Missing Answers Only  
> → Generated Docs / Tasks

## أهداف النظام

- تقليل عدد الأسئلة على المشاريع الصغيرة.

- زيادة عمق الأسئلة فقط عندما يكون النظام كبيرًا أو يحتاج ذلك.

- عدم توليد أسئلة SaaS إذا كان المشروع ليس SaaS.

- عدم سؤال المستخدم عن مدفوعات أو Multi-tenancy إلا إذا كانت مطلوبة أو غير واضحة.

- تحويل الإجابات إلى System Coverage Matrix ثم إلى Docs وTasks وAcceptance Criteria.

## قواعد أساسية

| **القاعدة**           | **المعنى**                                                              |
|-----------------------|-------------------------------------------------------------------------|
| Question Minimization | لا تسأل عن جانب غير مطلوب أو غير مرتبط بنوع المشروع.                    |
| Progressive Expansion | ابدأ بأسئلة قليلة ثم توسع حسب الإجابات.                                 |
| Unknown Follow-up     | إجابة غير متأكد لا تغلق الجانب، بل تفتح أسئلة مساعدة.                   |
| No Silent Skip        | لا يتم تجاهل جانب إلا إذا كان answered أو deferred أو not_applicable.   |
| Traceability          | كل إجابة تؤدي إلى Task يجب أن تسجل question_id وanswer_id وsource_mode. |

## مجموعات الأسئلة المقترحة

| **المجموعة**           | **الهدف**                             | **أمثلة**                             |
|------------------------|---------------------------------------|---------------------------------------|
| Entry Questions        | تحديد نوع المشروع وحجمه وحالته        | SaaS؟ متجر؟ حجز؟ جديد أم موجود؟       |
| Project Identity       | تعريف المشروع والمالك والهدف          | اسم المشروع، الجمهور، القيمة الأساسية |
| Users and Access       | تحديد المستخدمين والدخول والصلاحيات   | هل يوجد تسجيل دخول؟ أدوار؟ Owner؟     |
| Frontend Split         | تحديد واجهات الزائر والمستخدم والأدمن | Public / User / Admin / Internal      |
| Backend and Data       | تحديد API والبيانات والمنطق الداخلي   | Tables، Services، Integrations        |
| Operations and Release | تحديد الإنتاج والنشر والتشغيل         | staging، production-ready، publish    |

## حالات تفعيل جوانب النظام

| **الحالة**      | **متى تستخدم؟**                            |
|-----------------|--------------------------------------------|
| required        | الجانب مطلوب في المشروع أو في V1.          |
| optional        | الجانب مفيد لكنه ليس مؤكدًا.                |
| deferred        | الجانب مطلوب لاحقًا وليس في الإصدار الحالي. |
| not_applicable  | الجانب لا ينطبق على نوع المشروع.           |
| unknown         | المستخدم غير متأكد ويحتاج أسئلة متابعة.    |
| needs_follow_up | الإجابة ناقصة أو متناقضة وتحتاج توضيح.     |

## ملفات مقترحة لمحرك الأسئلة

> questionnaire_engine/  
> ├── QUESTIONNAIRE_FLOW_RULES.md  
> ├── QUESTION_GROUP_SCHEMA.json  
> ├── CONDITIONAL_GROUP_RULES.md  
> ├── SYSTEM_AREA_ACTIVATION_RULES.md  
> ├── QUESTIONNAIRE_DECISION_TREE.md  
> ├── QUESTIONNAIRE_MINIMIZATION_RULES.md  
> ├── UNKNOWN_ANSWER_FOLLOWUP_RULES.md  
> └── PROGRESSIVE_EXPANSION_RULES.md

# B. System Capability Map — خريطة جميع جوانب الأنظمة والتطبيقات

System Capability Map هي العقل المرجعي الذي يعرف Kabeeri بجوانب أي نظام برمجي. وظيفتها تحديد الجوانب المطلوبة حسب نوع المشروع، ثم توليد الأسئلة المناسبة فقط، ثم قياس التغطية.

> Project type  
> → Required / optional / deferred / not_applicable areas  
> → Question groups  
> → Answers  
> → Coverage matrix  
> → Generated documents  
> → Generated tasks  
> → Task provenance

## هيكل ملفات مقترح

> standard_systems/  
> ├── README.md  
> ├── SYSTEM_CAPABILITY_MAP.md  
> ├── SYSTEM_AREAS_INDEX.md  
> ├── SYSTEM_AREA_SCHEMA.json  
> ├── QUESTION_GENERATION_RULES.md  
> ├── COVERAGE_MATRIX_TEMPLATE.md  
> ├── MISSING_ANSWERS_REPORT_TEMPLATE.md  
> ├── system_areas/  
> └── examples/

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>المجموعة</strong></th>
<th><strong>الجوانب التي تغطيها</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>A. Product &amp; Business</td>
<td>Product vision<br />
Target users<br />
Business goals<br />
Core value proposition<br />
Use cases<br />
Pricing/revenue model<br />
MVP scope<br />
Future scope<br />
Out of scope<br />
KPIs</td>
</tr>
<tr class="even">
<td>B. Users, Access, and Journeys</td>
<td>User roles<br />
Permissions<br />
Role hierarchy<br />
User journey<br />
Onboarding<br />
Offboarding<br />
Authentication<br />
Authorization<br />
Owner / Admin / Staff / Customer flows</td>
</tr>
<tr class="odd">
<td>C. Frontend Experience</td>
<td>Public frontend<br />
User portal<br />
Admin frontend<br />
Internal operations frontend<br />
Responsive UI<br />
Accessibility<br />
RTL/LTR<br />
Navigation<br />
Forms</td>
</tr>
<tr class="even">
<td>D. Backend, Data, and APIs</td>
<td>Backend APIs<br />
Business logic<br />
Services<br />
Jobs/queues<br />
Database<br />
Migrations<br />
Data model<br />
API access<br />
Webhooks</td>
</tr>
<tr class="odd">
<td>E. Admin, Settings, and Customization</td>
<td>Admin panel<br />
Settings system<br />
Theme/colors/branding<br />
Design tokens<br />
Dashboard customization<br />
Feature flags<br />
Custom fields<br />
Email templates</td>
</tr>
<tr class="even">
<td>F. Engagement, Content, and Growth</td>
<td>Notifications<br />
Search/filtering<br />
Files/media<br />
Content management<br />
SEO<br />
Localization<br />
Support/help center<br />
Feedback</td>
</tr>
<tr class="odd">
<td>G. Commerce and Integrations</td>
<td>Payments<br />
Billing<br />
Subscriptions<br />
Invoices<br />
Coupons<br />
Integrations<br />
CRM/ERP<br />
Email/SMS providers<br />
Maps/calendar</td>
</tr>
<tr class="even">
<td>H. Quality, Security, and Compliance</td>
<td>Security<br />
Audit logs<br />
Data governance<br />
Privacy/legal<br />
Testing/QA<br />
Error handling<br />
Performance<br />
Secrets policy</td>
</tr>
<tr class="odd">
<td>I. Operations and Release</td>
<td>Deployment<br />
Production vs publish<br />
Backup/recovery<br />
Monitoring<br />
Maintenance mode<br />
Import/export<br />
Scheduling/automation<br />
Versioning</td>
</tr>
<tr class="even">
<td>J. Kabeeri Control Layer</td>
<td>Delivery mode<br />
Intake mode<br />
Task creation rules<br />
Task provenance<br />
AI token usage<br />
Owner verify<br />
Locks<br />
Prompt runs<br />
Cost calculator<br />
Dashboard state</td>
</tr>
</tbody>
</table>

## System Areas Index — 53 Area

| **\#** | **System Area**                           | **Activation State**                                      |
|--------|-------------------------------------------|-----------------------------------------------------------|
| 1      | Product & Business                        | required / optional / deferred / not_applicable / unknown |
| 2      | Users & Roles                             | required / optional / deferred / not_applicable / unknown |
| 3      | Permissions                               | required / optional / deferred / not_applicable / unknown |
| 4      | User Journeys                             | required / optional / deferred / not_applicable / unknown |
| 5      | Onboarding                                | required / optional / deferred / not_applicable / unknown |
| 6      | Offboarding                               | required / optional / deferred / not_applicable / unknown |
| 7      | Public Frontend                           | required / optional / deferred / not_applicable / unknown |
| 8      | User Frontend                             | required / optional / deferred / not_applicable / unknown |
| 9      | Admin Frontend                            | required / optional / deferred / not_applicable / unknown |
| 10     | Internal Operations Frontend              | required / optional / deferred / not_applicable / unknown |
| 11     | Backend APIs                              | required / optional / deferred / not_applicable / unknown |
| 12     | Business Logic                            | required / optional / deferred / not_applicable / unknown |
| 13     | Database                                  | required / optional / deferred / not_applicable / unknown |
| 14     | Authentication                            | required / optional / deferred / not_applicable / unknown |
| 15     | Authorization                             | required / optional / deferred / not_applicable / unknown |
| 16     | Admin Panel                               | required / optional / deferred / not_applicable / unknown |
| 17     | Settings System                           | required / optional / deferred / not_applicable / unknown |
| 18     | Theme / Colors / Branding / Design Tokens | required / optional / deferred / not_applicable / unknown |
| 19     | Dashboard Customization                   | required / optional / deferred / not_applicable / unknown |
| 20     | Notifications                             | required / optional / deferred / not_applicable / unknown |
| 21     | Search & Filtering                        | required / optional / deferred / not_applicable / unknown |
| 22     | Files & Media                             | required / optional / deferred / not_applicable / unknown |
| 23     | Reports & Analytics                       | required / optional / deferred / not_applicable / unknown |
| 24     | Audit Logs                                | required / optional / deferred / not_applicable / unknown |
| 25     | Security                                  | required / optional / deferred / not_applicable / unknown |
| 26     | Integrations                              | required / optional / deferred / not_applicable / unknown |
| 27     | Payments / Billing                        | required / optional / deferred / not_applicable / unknown |
| 28     | SEO                                       | required / optional / deferred / not_applicable / unknown |
| 29     | Localization / Languages                  | required / optional / deferred / not_applicable / unknown |
| 30     | Accessibility                             | required / optional / deferred / not_applicable / unknown |
| 31     | Performance                               | required / optional / deferred / not_applicable / unknown |
| 32     | Error Handling                            | required / optional / deferred / not_applicable / unknown |
| 33     | Testing / QA                              | required / optional / deferred / not_applicable / unknown |
| 34     | Deployment                                | required / optional / deferred / not_applicable / unknown |
| 35     | Production vs Publish                     | required / optional / deferred / not_applicable / unknown |
| 36     | Backup / Recovery                         | required / optional / deferred / not_applicable / unknown |
| 37     | Monitoring                                | required / optional / deferred / not_applicable / unknown |
| 38     | Documentation                             | required / optional / deferred / not_applicable / unknown |
| 39     | Support / Help Center                     | required / optional / deferred / not_applicable / unknown |
| 40     | Legal / Compliance                        | required / optional / deferred / not_applicable / unknown |
| 41     | Content Management                        | required / optional / deferred / not_applicable / unknown |
| 42     | Workflows / Approvals                     | required / optional / deferred / not_applicable / unknown |
| 43     | Multi-Tenancy                             | required / optional / deferred / not_applicable / unknown |
| 44     | Feature Flags                             | required / optional / deferred / not_applicable / unknown |
| 45     | Data Import / Export                      | required / optional / deferred / not_applicable / unknown |
| 46     | Scheduling / Automation                   | required / optional / deferred / not_applicable / unknown |
| 47     | AI Product Features                       | required / optional / deferred / not_applicable / unknown |
| 48     | Data Governance                           | required / optional / deferred / not_applicable / unknown |
| 49     | Tenant / Admin Customization              | required / optional / deferred / not_applicable / unknown |
| 50     | Email / Notification Templates            | required / optional / deferred / not_applicable / unknown |
| 51     | Dynamic Forms / Custom Fields             | required / optional / deferred / not_applicable / unknown |
| 52     | Versioning / API Versioning               | required / optional / deferred / not_applicable / unknown |
| 53     | Kabeeri Development Control Layer         | required / optional / deferred / not_applicable / unknown |

## Coverage Matrix و Missing Answers Report

بعد انتهاء مجموعات الأسئلة، يجب أن ينتج Kabeeri تقرير تغطية يوضح ما تمت تغطيته وما تم تأجيله وما لا ينطبق وما يحتاج إجابة إضافية.

| **Area**       | **Status**      | **Reason**                                    | **Required Action**               |
|----------------|-----------------|-----------------------------------------------|-----------------------------------|
| Authentication | required        | Users need login                              | Generate auth questions and tasks |
| Payments       | deferred        | Not in V1                                     | Add to future roadmap             |
| SEO            | required        | Public pages exist                            | Ask SEO questions                 |
| Theme Colors   | required        | Admin wants customization                     | Generate design token tasks       |
| Multi-tenancy  | not_applicable  | Single organization only                      | No tasks                          |
| Audit Logs     | needs_follow_up | Admin actions exist but retention not defined | Ask audit detail questions        |

## نماذج أسئلة ذكية مهمة

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>الجانب</strong></th>
<th><strong>أسئلة نموذجية</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Theme / Colors / Branding</td>
<td>هل تريد التحكم في الألوان من لوحة الإدارة؟<br />
هل تحتاج Dark Mode؟<br />
هل يجب منع الألوان ضعيفة التباين؟<br />
هل التخصيص عام أم لكل Tenant؟</td>
</tr>
<tr class="even">
<td>Dashboard Customization</td>
<td>ما أنواع الداشبورد المطلوبة؟<br />
هل تختلف Widgets حسب الدور؟<br />
هل يحتاج Owner-only actions؟<br />
هل تحتاج Export للتقارير؟</td>
</tr>
<tr class="odd">
<td>User Roles and Permissions</td>
<td>ما أنواع المستخدمين؟<br />
هل يوجد Owner واحد فقط؟<br />
من يوافق؟ من ينشر؟ من يحذف؟<br />
هل يوجد نقل صلاحية عليا؟</td>
</tr>
<tr class="even">
<td>SaaS / Multi-tenancy</td>
<td>هل يستخدم النظام أكثر من شركة؟<br />
هل بيانات كل شركة منفصلة؟<br />
هل لكل Tenant إعدادات وألوان وفواتير؟</td>
</tr>
</tbody>
</table>

# C. Milestone الجديد المقترح داخل v5.0.0

## v5.1.0 — Adaptive Questionnaire Flow and System Capability Coverage

Goal: بناء محرك أسئلة تكيفي يعتمد على خريطة جوانب النظام، بحيث يسأل Kabeeri الأسئلة المناسبة فقط ولا ينسى أي جانب مهم.

| **Issue**                                         | **Labels**                                      | **Scope**                                                                                                               |
|---------------------------------------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| Create adaptive questionnaire flow engine         | questionnaire, priority-high                    | Create the flow engine that controls question groups, branching, and progressive expansion.                             |
| Add entry question groups                         | questionnaire, priority-high                    | Add first questions that detect project type, intake mode, delivery mode, users, admin panel, payments, and complexity. |
| Add system area activation rules                  | questionnaire, priority-high                    | Define required, optional, deferred, not_applicable, unknown, and needs_follow_up states.                               |
| Add conditional question group rules              | questionnaire, priority-medium                  | Open or skip question groups based on previous answers.                                                                 |
| Add progressive questionnaire expansion rules     | questionnaire, priority-medium                  | Increase question depth based on project complexity.                                                                    |
| Add questionnaire minimization rules              | questionnaire, priority-high                    | Avoid asking questions for irrelevant system areas.                                                                     |
| Add unknown answer follow-up rules                | questionnaire, docs, priority-medium            | Handle unsure answers with small helper questions instead of skipping.                                                  |
| Create standard system capability map             | questionnaire, docs, priority-high              | Create the reference map of all system areas.                                                                           |
| Add system areas index                            | questionnaire, docs, priority-high              | Add the organized index of 53 system areas.                                                                             |
| Add coverage matrix and missing answers report    | questionnaire, acceptance, priority-high        | Generate coverage status and missing answers report.                                                                    |
| Connect answers to generated tasks and provenance | task-governance, task-provenance, priority-high | Ensure every generated task references system area, question_id, answer_id, and source_mode.                            |
| Add project type to required system areas mapping | generator, questionnaire, priority-high         | Map project types to required/optional/deferred/not applicable areas.                                                   |

# D. المحتوى الأصلي الكامل قبل التحديث

القسم التالي يحتفظ بمحتوى ملف v5.0.0 الأصلي كما كان قبل إضافة نظام الأسئلة المرن الذكي وخريطة جوانب النظام، حتى لا تضيع أي محاور أو Issues كانت موجودة.

Kabeeri VDF

خطة تحديث v5.0.0

Project Intelligence, Professional Intake, and Trust Layer

هدف هذا التحديث هو تحويل Kabeeri VDF إلى طبقة ذكية وآمنة لإدارة فهم المشروع، استقبال الإجابات، تتبع القرارات، قياس جودة التنفيذ، منع الهدر، وحماية المشاريع أثناء التطوير أو التحديث.

هذا الملف مرتب لاستخدامه كمرجع عند إنشاء GitHub Milestones وGitHub Issues الخاصة بتحديث v5.0.0، وبعد اكتمال تحديثات v2/v3/v4.

# ملخص تنفيذي

| **Item**       | **Description**                                                                                                                                          |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| اسم التحديث    | v5.0.0 — Project Intelligence, Professional Intake, and Trust Layer                                                                                      |
| الهدف          | إضافة طبقة ذكاء وتشغيل وثقة فوق Kabeeri: أسئلة احترافية، قواعد إنشاء تاسكات، تتبع المصدر، ذاكرة المشروع، سياسات قابلة للفحص، Health Check، وحماية أسرار. |
| الفلسفة        | Kabeeri لا يكتفي بإدارة الملفات؛ بل يفهم لماذا وُجدت كل مهمة، من أين أتت، من وافق عليها، ما تكلفة تنفيذها، وهل يمكن قبولها بأمان.                         |
| الناتج المتوقع | نظام أكثر استعدادًا للتوسع التجاري، والفرق، والـ AI Agents، ومشاريع العملاء، والتحديثات الآمنة بين الإصدارات.                                             |

# المحاور الأساسية في v5.0.0

• Professional Questionnaire Intake Engine — أخذ إجابات الأسئلة من واجهة احترافية داخل VS Code Webview أو Dashboard مع تخزين وتتبع المصدر.

• Task Creation Governance — منع إنشاء أو تنفيذ أي Task بدون نطاق، مصدر، ملفات مسموحة، Acceptance، وReviewer.

• Task Provenance / Source Tracing — كل Task يجب أن ترجع إلى سؤال أو وثيقة أو User Story أو Scan أو AI Suggestion مع direct/indirect/required.

• Project Memory — ذاكرة رسمية للقرارات والافتراضات والقيود والمخاطر والمميزات المؤجلة.

• Architecture Decision Records — تسجيل قرارات التصميم والتكنولوجيا وأسباب الاختيار.

• AI Prompt Run History — تسجيل كل تشغيل مهم للذكاء الاصطناعي وما نتج عنه.

• AI Token Waste Detector — كشف الاستخدام العشوائي أو غير المتتبع للتوكنات.

• Policy Engine — تحويل القواعد إلى سياسات قابلة للفحص قبل Verify أو Release أو Migration.

• Project Identity and Version Compatibility — هوية المشروع وتوافق النسخ والمهاجرات.

• Migration, Backup, and Rollback — تحديث آمن للمشاريع القديمة وإمكانية الرجوع.

• Event Bus and Audit Log — سجل أحداث موحد يدعم الداشبورد والـ Sync والـ Audit.

• Health Check / Doctor System — فحص صحة المشروع وتنبيهات الأخطاء.

• Privacy and Secrets Policy — حماية الأسرار ومنع تسريب البيانات إلى AI أو Dashboard.

• Human Approval Gates — موافقات بشرية قبل المهام الحساسة والإصدارات والنشر.

• Client / Business Handoff Package — تقارير تسليم احترافية للعميل أو صاحب المشروع.

# هيكل ملفات مقترح داخل المشروع

القاعدة الأساسية: ملفات .kabeeri/ هي مصدر الحقيقة، والـ Dashboard أو VS Code أو Cloud يعرضون الحالة ولا يستبدلونها.

.kabeeri/

├── project.json

├── version_compatibility.json

├── migration_state.json

├── questionnaires/

│ ├── core_answers.json

│ ├── production_answers.json

│ ├── extension_answers.json

│ ├── answer_sources.json

│ └── completion_state.json

├── memory/

│ ├── decisions.jsonl

│ ├── assumptions.jsonl

│ ├── constraints.jsonl

│ ├── risks.jsonl

│ └── deferred_features.jsonl

├── adr/

├── ai_runs/

├── ai_usage/

├── policies/

├── events/

├── approvals/

├── migrations/

├── security/

└── handoff/

# Labels مقترحة

| **Label**        | **Description**                                           | **Color** |
|------------------|-----------------------------------------------------------|-----------|
| questionnaire    | Questionnaire Engine, UI, answers, and provenance         | \#1D76DB  |
| task-governance  | Task creation, readiness, assignment, and conflict rules  | \#0E8A16  |
| task-provenance  | Task source tracing and direct/indirect source logic      | \#5319E7  |
| project-memory   | Decisions, assumptions, risks, and deferred features      | \#C5DEF5  |
| adr              | Architecture Decision Records                             | \#0075CA  |
| ai-run-history   | Prompt run history, accepted/rejected AI outputs          | \#FBCA04  |
| ai-usage         | AI token usage, waste detection, and cost analysis        | \#D93F0B  |
| policy-engine    | Machine-checkable policies and gates                      | \#B60205  |
| migration        | Version compatibility, migration, backup, rollback        | \#D93F0B  |
| security         | Secrets, privacy, data sharing, safety                    | \#B60205  |
| handoff          | Client handoff and commercial reporting                   | \#7057FF  |
| priority-high    | Important work that should be handled early               | \#B60205  |
| priority-medium  | Useful work planned for the current or upcoming milestone | \#FBCA04  |
| good-first-issue | Suitable for simple first contributions                   | \#7057FF  |

# Milestones المقترحة داخل v5.0.0

| **Milestone** | **Title**                                     | **Goal**                                                                                                                                                | **Issues** |
|---------------|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| v5.1.0        | Professional Questionnaire Intake             | Build schema-driven questionnaire intake, answer storage, answer provenance, conditional questions, and VS Code / Dashboard-ready UI flow.              | 7          |
| v5.2.0        | Task Governance and Provenance                | Add strict task creation rules and trace every task back to its source before assignment, execution, review, or acceptance.                             | 7          |
| v5.3.0        | Project Memory and Decisions                  | Give Kabeeri official memory for project decisions, assumptions, constraints, risks, and deferred features so AI and developers keep context over time. | 7          |
| v5.4.0        | AI Run History and Waste Detection            | Track AI prompt runs, accepted/rejected outputs, token usage, and wasted/untracked AI usage for cost, quality, and pricing intelligence.                | 7          |
| v5.5.0        | Policy Engine and Approval Gates              | Turn Kabeeri rules into checkable policies before tasks, releases, migrations, verification, and production/publish actions.                            | 7          |
| v5.6.0        | Identity, Compatibility, and Migration Safety | Make every project version-aware and safe to migrate between Kabeeri versions without breaking existing projects.                                       | 7          |
| v5.7.0        | Health, Security, and Secrets Protection      | Add doctor checks, privacy rules, secrets policies, and safety reports to protect Kabeeri projects and AI workflows.                                    | 7          |
| v5.8.0        | Client Handoff and Commercial Reports         | Generate professional handoff and business reports for clients, agencies, and project owners, including feature readiness and AI token cost reports.    | 7          |

# v5.1.0 — Professional Questionnaire Intake

Milestone description: Build schema-driven questionnaire intake, answer storage, answer provenance, conditional questions, and VS Code / Dashboard-ready UI flow.

Issue count: 7

Issues

### Issue 1: Add questionnaire intake engine

Labels: questionnaire, priority-high

Scope

• Create questionnaire_engine/ as the reusable core for professional questions.

• Define engine responsibilities: schema, renderer, validation, answer storage, export, AI help.

• Make the engine reusable for VS Code Webview, Local Dashboard, Desktop App, and Cloud later.

Acceptance criteria

• questionnaire_engine/ exists.

• README explains the intake flow clearly.

• Engine is UI-agnostic and schema-driven.

### Issue 2: Add questionnaire intake schema

Labels: questionnaire, priority-high

Scope

• Create QUESTIONNAIRE_INTAKE_SCHEMA.json.

• Support question_id, section, language, answer_type, required flag, choices, help text, and related output.

• Support delivery_mode and intake_mode metadata.

Acceptance criteria

• Schema exists and is valid JSON.

• Schema supports Arabic/English and future UI rendering.

• Schema can represent current questionnaire groups.

### Issue 3: Add questionnaire answer storage rules

Labels: questionnaire, docs, priority-high

Scope

• Create ANSWER_STORAGE_RULES.md.

• Define where answers are stored inside .kabeeri/questionnaires/.

• Define draft, confirmed, reviewed, and exported answer states.

Acceptance criteria

• Answer storage rules exist.

• Rules support resuming answers later.

• .kabeeri/questionnaires/ structure is documented.

### Issue 4: Add answer provenance rules

Labels: questionnaire, task-provenance, priority-high

Scope

• Create ANSWER_PROVENANCE_RULES.md.

• Define how each answer records answered_by, answered_at, confidence, source, delivery_mode, and intake_mode.

• Explain how answers generate docs, tasks, user stories, acceptance criteria, and prompt recommendations.

Acceptance criteria

• Every answer can be traced.

• Rules support task provenance.

• Rules are clear for direct and indirect task generation.

### Issue 5: Add conditional question rules

Labels: questionnaire, priority-medium

Scope

• Create CONDITIONAL_QUESTIONS_RULES.md.

• Support questions that appear only when previous answers require them.

• Add examples such as admin dashboard, authentication, payments, and multi-role systems.

Acceptance criteria

• Conditional question logic is documented.

• Examples are beginner-friendly.

• Rules avoid overwhelming small projects.

### Issue 6: Add AI help for answers

Labels: questionnaire, docs, priority-medium

Scope

• Create AI_HELP_FOR_ANSWERS.md.

• Define buttons/actions such as Explain this question, Suggest sample answer, Improve my answer, Help me choose.

• Define safety rules so AI does not invent requirements without approval.

Acceptance criteria

• AI help flow is documented.

• AI suggestions require human confirmation.

• Technical questions include beginner help.

### Issue 7: Design VS Code questionnaire webview flow

Labels: questionnaire, docs, priority-high

Scope

• Create QUESTIONNAIRE_UI_FLOW.md.

• Design VS Code Webview pages: setup, questionnaire list, section progress, question page, review, export.

• Include Arabic/English and RTL support requirements.

Acceptance criteria

• VS Code questionnaire flow is documented.

• Progress, save draft, review, and export are included.

• The design can later be reused by Dashboard/Desktop/Cloud.

# v5.2.0 — Task Governance and Provenance

Milestone description: Add strict task creation rules and trace every task back to its source before assignment, execution, review, or acceptance.

Issue count: 7

Issues

### Issue 8: Add task creation governance rules

Labels: task-governance, acceptance, priority-high

Scope

• Create TASK_CREATION_RULES.md.

• Define required fields before a task can be proposed, approved, assigned, or executed.

• Define who can propose, approve, assign, review, and verify tasks.

Acceptance criteria

• Task creation rules exist.

• No task can be executed without scope and acceptance criteria.

• Rules support Structured and Agile modes.

### Issue 9: Add task intake template

Labels: task-governance, docs, priority-high

Scope

• Create TASK_INTAKE_TEMPLATE.md.

• Include Task ID, title, workstream, delivery_mode, intake_mode, source, creator, assignee, reviewer, scope, out-of-scope, allowed files, forbidden files, dependencies, acceptance criteria, and rollback notes.

Acceptance criteria

• Template exists.

• Template is ready for GitHub Issues and .kabeeri tasks.

• Template prevents vague tasks.

### Issue 10: Add task definition of ready

Labels: task-governance, acceptance, priority-high

Scope

• Create TASK_DEFINITION_OF_READY.md.

• Define when a task is ready for implementation.

• Require source reference, approved scope, allowed/forbidden files, acceptance criteria, and reviewer assignment.

Acceptance criteria

• Definition of Ready exists.

• Tasks without required fields cannot enter execution.

• Rules are understandable for AI and humans.

### Issue 11: Add task assignment rules

Labels: task-governance, priority-medium

Scope

• Create TASK_ASSIGNMENT_RULES.md.

• Define how tasks are assigned to humans, AI developers, Codex/Copilot/Cursor/Windsurf, or custom agents.

• Define assignee responsibilities and reviewer separation.

Acceptance criteria

• Assignment rules exist.

• Assignee and reviewer are separate roles.

• Rules support backend, public frontend, admin frontend, docs, and QA workstreams.

### Issue 12: Add task conflict rules

Labels: task-governance, priority-high

Scope

• Create TASK_CONFLICT_RULES.md.

• Define task/file/folder/workstream conflict checks.

• Explain when Owner or Maintainer approval is required for overlap.

Acceptance criteria

• Conflict rules exist.

• Tasks cannot overlap silently.

• Rules support future lock system.

### Issue 13: Add task provenance rules

Labels: task-provenance, questionnaire, priority-high

Scope

• Create TASK_SOURCE_RULES.md.

• Define source types: manual, questionnaire_answer, generated_document, user_story, epic, sprint_planning, acceptance_review, bug_report, github_issue, ai_suggestion, existing_project_scan, migration_report, production_check, publish_check.

• Define source modes: direct, indirect, derived, suggested, required.

Acceptance criteria

• Every task can trace back to a source.

• Direct and indirect task creation are clearly documented.

• AI-suggested tasks require approval before execution.

### Issue 14: Add task source schema

Labels: task-provenance, task-governance, priority-medium

Scope

• Create TASK_PROVENANCE_SCHEMA.json or update task schema with provenance fields.

• Support question_id, answer_id, document section, user story, sprint, issue, scan report, and source_reason.

Acceptance criteria

• Task provenance schema exists.

• Schema supports questionnaire-generated tasks.

• Schema supports Structured and Agile modes.

# v5.3.0 — Project Memory and Decisions

Milestone description: Give Kabeeri official memory for project decisions, assumptions, constraints, risks, and deferred features so AI and developers keep context over time.

Issue count: 7

Issues

### Issue 15: Add project memory structure

Labels: project-memory, priority-high

Scope

• Create .kabeeri/memory/ structure.

• Add decisions.jsonl, assumptions.jsonl, constraints.jsonl, risks.jsonl, deferred_features.jsonl, and memory_summary.json.

• Define how memory is updated by humans, AI suggestions, and approvals.

Acceptance criteria

• Project memory structure exists.

• Memory is append-friendly and auditable.

• AI can reference memory without overwriting decisions.

### Issue 16: Add architecture decision records

Labels: adr, docs, priority-high

Scope

• Create .kabeeri/adr/.

• Add ADR_TEMPLATE.md.

• Define ADR fields: decision, context, options, chosen option, why, risks, consequences, date, approved by.

Acceptance criteria

• ADR structure exists.

• ADR template is clear.

• Major technical decisions can be recorded.

### Issue 17: Add assumptions log

Labels: project-memory, good-first-issue

Scope

• Add assumptions.jsonl format and documentation.

• Define fields: assumption_id, text, source, status, owner, review_date.

• Explain how assumptions become confirmed, rejected, or outdated.

Acceptance criteria

• Assumptions log exists.

• Assumptions have status.

• Unconfirmed assumptions are visible.

### Issue 18: Add constraints log

Labels: project-memory, priority-medium

Scope

• Add constraints.jsonl format and documentation.

• Support business, technical, budget, timeline, security, legal, and hosting constraints.

• Explain how constraints affect tasks and acceptance.

Acceptance criteria

• Constraints log exists.

• Constraints can influence task generation and review.

• Constraints are easy to read.

### Issue 19: Add risk register

Labels: project-memory, acceptance, priority-high

Scope

• Add risk register files for technical, business, security, and AI risks.

• Define risk level, impact, mitigation, owner, and status.

• Connect risks to release readiness.

Acceptance criteria

• Risk register exists.

• Risks can be tracked and reviewed.

• Release checklist can reference risks.

### Issue 20: Add deferred features log

Labels: project-memory, docs, priority-medium

Scope

• Add deferred_features.jsonl.

• Track features intentionally postponed from current version.

• Prevent AI from implementing deferred features accidentally.

Acceptance criteria

• Deferred features log exists.

• Deferred features include reason and target future version.

• Prompt rules can reference deferred features.

### Issue 21: Add decision approval rules

Labels: project-memory, policy-engine, priority-medium

Scope

• Document who can approve project decisions and ADRs.

• Require Owner approval for high-impact decisions.

• Log approval events.

Acceptance criteria

• Decision approval rules exist.

• High-impact decisions require approval.

• Decisions are auditable.

# v5.4.0 — AI Run History and Waste Detection

Milestone description: Track AI prompt runs, accepted/rejected outputs, token usage, and wasted/untracked AI usage for cost, quality, and pricing intelligence.

Issue count: 7

Issues

### Issue 22: Add AI prompt run history

Labels: ai-run-history, ai-usage, priority-high

Scope

• Create .kabeeri/ai_runs/.

• Add prompt_runs.jsonl.

• Record prompt_id, task_id, developer_id, AI provider, model, files changed, tokens used, result, and timestamps.

Acceptance criteria

• Prompt run history exists.

• Each important AI run can be traced to a task or source.

• History is append-only by default.

### Issue 23: Add accepted and rejected AI run logs

Labels: ai-run-history, acceptance, priority-medium

Scope

• Add accepted_runs.jsonl and rejected_runs.jsonl.

• Record why an AI output was accepted or rejected.

• Connect rejection reasons to future improvements.

Acceptance criteria

• Accepted/rejected run logs exist.

• Rejected runs include reason.

• Accepted runs link to verification or review.

### Issue 24: Add AI output contract enforcement

Labels: ai-run-history, policy-engine, priority-high

Scope

• Define required AI output contract: summary, files created, files changed, checks run, risks, known limitations, needs review, next task.

• Define what happens if AI output misses required fields.

Acceptance criteria

• Output contract exists.

• Tasks cannot be accepted without output contract.

• Rules support any AI tool.

### Issue 25: Add AI token waste detector

Labels: ai-usage, priority-high

Scope

• Create waste_rules.json.

• Detect usage without task_id, source_reference, approved token, workstream, or acceptance state.

• Flag repeated work, unnecessary refactor, and high token usage without accepted output.

Acceptance criteria

• Waste detector rules exist.

• Untracked AI usage can be reported.

• Warnings are clear and useful for pricing.

### Issue 26: Add random usage report

Labels: ai-usage, docs, priority-medium

Scope

• Create random_usage_report.json format.

• Classify random or exploratory AI usage.

• Do not treat all random usage as bad; mark it visible and explainable.

Acceptance criteria

• Random usage report exists.

• Report distinguishes exploration from waste.

• Report supports dashboard display.

### Issue 27: Add token efficiency report

Labels: ai-usage, priority-medium

Scope

• Create token_efficiency_report.json.

• Track accepted output cost vs rejected/reworked output cost.

• Compare developer/agent token efficiency.

Acceptance criteria

• Token efficiency report exists.

• Reports can be grouped by task, sprint, workstream, developer, provider, and model.

• Useful for pricing and performance analysis.

### Issue 28: Add AI run review rules

Labels: ai-run-history, acceptance, priority-medium

Scope

• Define review rules for AI prompt runs.

• Record whether run output was used, rejected, partially used, or sent back for changes.

• Connect review to audit log.

Acceptance criteria

• AI run review rules exist.

• Review outcomes are standardized.

• Rules support Owner-only final verify.

# v5.5.0 — Policy Engine and Approval Gates

Milestone description: Turn Kabeeri rules into checkable policies before tasks, releases, migrations, verification, and production/publish actions.

Issue count: 7

Issues

### Issue 29: Add policy engine structure

Labels: policy-engine, priority-high

Scope

• Create .kabeeri/policies/.

• Define policy files and policy_results.jsonl.

• Explain policy inputs, outputs, pass/warn/fail states, and manual override requirements.

Acceptance criteria

• Policy engine structure exists.

• Policies can be evaluated by CLI later.

• Policy results are auditable.

### Issue 30: Add task verification policy

Labels: policy-engine, task-governance, priority-high

Scope

• Create task_verification_policy.json.

• Require source reference, acceptance checklist, allowed files compliance, output contract, token usage record, and owner verification.

Acceptance criteria

• Task verification policy exists.

• Task cannot be verified if critical requirements are missing.

• Policy supports dashboard and CLI.

### Issue 31: Add owner verify policy

Labels: policy-engine, priority-high

Scope

• Create owner_verify_policy.json.

• Define that only Owner can perform final verify.

• Support future Owner approval tokens and owner transfer rules.

Acceptance criteria

• Owner verify policy exists.

• Final verify is Owner-only.

• Policy is clear for dashboard controls.

### Issue 32: Add token usage policy

Labels: policy-engine, ai-usage, priority-medium

Scope

• Create token_usage_policy.json.

• Require AI usage to be linked to task/source/workstream.

• Warn when usage exceeds task or sprint budget.

Acceptance criteria

• Token usage policy exists.

• Untracked usage causes warnings.

• Exceeded budgets require approval.

### Issue 33: Add lock policy

Labels: policy-engine, task-governance, priority-high

Scope

• Create lock_policy.json.

• Define file/folder/workstream lock conflicts.

• Define rules for override and owner approval.

Acceptance criteria

• Lock policy exists.

• Task conflicts can be detected.

• Overrides are auditable.

### Issue 34: Add release policy

Labels: policy-engine, acceptance, priority-high

Scope

• Create release_policy.json.

• Require release checklist, accepted tasks, no critical open risks, no unresolved conflicts, production/publish distinction, and owner approval.

Acceptance criteria

• Release policy exists.

• Releases have clear gates.

• Policy supports Structured and Agile modes.

### Issue 35: Add human approval gates

Labels: policy-engine, acceptance, priority-high

Scope

• Create .kabeeri/approvals/ structure.

• Define approval_gates.json, approval_log.jsonl, pending_approvals.json, and approval_rules.md.

• Support approvals for generated tasks, file scope, migration, release, publish, owner transfer, and production actions.

Acceptance criteria

• Approval gates exist.

• AI suggestions cannot bypass human approval.

• Owner-level approvals are auditable.

# v5.6.0 — Identity, Compatibility, and Migration Safety

Milestone description: Make every project version-aware and safe to migrate between Kabeeri versions without breaking existing projects.

Issue count: 7

Issues

### Issue 36: Add project identity file

Labels: migration, docs, priority-high

Scope

• Create .kabeeri/project.json.

• Include project_id, project_name, owner_id, created_at, kabeeri_version, delivery_mode, intake_mode, repository_url, and main_stack.

Acceptance criteria

• Project identity file exists.

• Every project has stable identity.

• Identity supports CLI, dashboard, and sync later.

### Issue 37: Add version compatibility file

Labels: migration, priority-high

Scope

• Create .kabeeri/version_compatibility.json.

• Track created_with_version, current_engine_version, compatibility_status, migration_required, and last_migration.

Acceptance criteria

• Version compatibility file exists.

• Project can report whether migration is required.

• Future CLI can read compatibility state.

### Issue 38: Add migration state file

Labels: migration, priority-medium

Scope

• Create .kabeeri/migration_state.json.

• Track current migration phase, pending migration, last migration, rollback availability, and migration risks.

Acceptance criteria

• Migration state file exists.

• Migration state is machine-readable.

• Rollbacks can be documented.

### Issue 39: Add migration plan template

Labels: migration, docs, priority-high

Scope

• Create migration plan template.

• Define source version, target version, files affected, schema changes, backup requirements, risks, and approval.

Acceptance criteria

• Migration plan template exists.

• Migrations require a plan before apply.

• Template supports dry-run.

### Issue 40: Add migration dry-run rules

Labels: migration, cli, priority-high

Scope

• Define dry-run rules for future kvdf migrate apply --dry-run.

• Show files that would change.

• Require no mutation during dry-run.

Acceptance criteria

• Dry-run rules exist.

• No files change in dry-run.

• Output is understandable for humans.

### Issue 41: Add rollback plan template

Labels: migration, acceptance, priority-high

Scope

• Create ROLLBACK_PLAN_TEMPLATE.md.

• Define how to revert migration changes, affected files, backups, and manual recovery notes.

Acceptance criteria

• Rollback template exists.

• High-risk migrations require rollback plan.

• Rollback notes are clear.

### Issue 42: Add migration audit log

Labels: migration, docs, priority-medium

Scope

• Create migration_logs/ format and migration audit log rules.

• Record who approved, who applied, files changed, results, and rollback availability.

Acceptance criteria

• Migration audit log exists.

• Migrations are traceable.

• Failed migrations can be investigated.

# v5.7.0 — Health, Security, and Secrets Protection

Milestone description: Add doctor checks, privacy rules, secrets policies, and safety reports to protect Kabeeri projects and AI workflows.

Issue count: 7

Issues

### Issue 43: Add kvdf doctor specification

Labels: security, docs, priority-high

Scope

• Create doctor specification document.

• Define kvdf doctor, kvdf doctor --deep, and kvdf doctor --fix-suggestions.

• List checks for .kabeeri, project identity, schemas, tasks, sources, locks, usage, migrations, and dashboard state.

Acceptance criteria

• Doctor specification exists.

• Checks are grouped by severity.

• Future CLI can implement the specification.

### Issue 44: Add deep health check rules

Labels: security, migration, priority-high

Scope

• Define deep health checks.

• Check for tasks without source, expired locks, untracked tokens, migration required, invalid JSON, and GitHub sync conflicts.

Acceptance criteria

• Deep health rules exist.

• Rules warn about serious project health issues.

• Rules support existing and new projects.

### Issue 45: Add secrets policy

Labels: security, priority-high

Scope

• Create SECRETS_POLICY.md.

• Ban storing production secrets in Kabeeri files.

• Ban sending secrets to AI prompts.

• Define placeholder format and safe examples.

Acceptance criteria

• Secrets policy exists.

• Rules are clear and enforceable.

• Dashboard must not expose secrets.

### Issue 46: Add privacy policy for AI usage

Labels: security, ai-usage, priority-high

Scope

• Create PRIVACY_POLICY_FOR_AI.md.

• Define what data can be sent to AI and what must be redacted.

• Explain handling of personal data, credentials, customer data, and confidential business data.

Acceptance criteria

• Privacy policy exists.

• Policy protects user/project data.

• AI usage rules are clear.

### Issue 47: Add AI data sharing rules

Labels: security, ai-run-history, priority-medium

Scope

• Create AI_DATA_SHARING_RULES.md.

• Define allowed, restricted, and forbidden data categories.

• Add rules for human approval before sharing sensitive context.

Acceptance criteria

• AI data sharing rules exist.

• Sensitive data requires approval/redaction.

• Rules are suitable for teams and agencies.

### Issue 48: Add secrets scan report format

Labels: security, good-first-issue

Scope

• Create secrets_scan_report.json format.

• Define findings, severity, location, recommendation, and status.

• Do not implement scanner yet; define report format.

Acceptance criteria

• Secrets scan report format exists.

• Findings can be tracked.

• Future CLI can generate reports.

### Issue 49: Add security readiness checklist

Labels: security, acceptance, priority-medium

Scope

• Create SECURITY_READINESS_CHECKLIST.md.

• Include secrets, privacy, AI data sharing, owner verification, production/publish, and release gates.

Acceptance criteria

• Security checklist exists.

• Checklist is usable before release.

• Checklist works with Structured and Agile modes.

# v5.8.0 — Client Handoff and Commercial Reports

Milestone description: Generate professional handoff and business reports for clients, agencies, and project owners, including feature readiness and AI token cost reports.

Issue count: 7

Issues

### Issue 50: Add technical handoff summary

Labels: handoff, docs, priority-high

Scope

• Create technical_summary.md template.

• Summarize architecture, stack, backend/frontend/admin split, database, integrations, build status, tests, and known technical limitations.

Acceptance criteria

• Technical summary template exists.

• It can be generated for a project handoff.

• It is readable by developers and project owners.

### Issue 51: Add business handoff summary

Labels: handoff, docs, priority-high

Scope

• Create business_summary.md template.

• Summarize product goal, target audience, capabilities, user journeys, onboarding, release value, and what is ready to show.

Acceptance criteria

• Business summary template exists.

• It is understandable for non-technical stakeholders.

• It connects features to business value.

### Issue 52: Add feature readiness report

Labels: handoff, acceptance, priority-medium

Scope

• Create feature_readiness_report.md template.

• Show feature status: planned, in progress, accepted, production-ready, published, deferred.

• Connect features to tasks and acceptance decisions.

Acceptance criteria

• Feature readiness report exists.

• Report distinguishes production-ready from published.

• Report supports dashboard and handoff.

### Issue 53: Add production vs publish status report

Labels: handoff, acceptance, priority-high

Scope

• Create production_publish_status.md template.

• Explain production-ready vs published.

• List environment state: local, development, staging, production-ready, published, maintenance.

Acceptance criteria

• Production/publish status report exists.

• Difference between production and publish is clear.

• Report can be used before client launch.

### Issue 54: Add AI token cost report

Labels: handoff, ai-usage, priority-high

Scope

• Create ai_token_cost_report.md template.

• Summarize token usage by task, sprint, version, backend, public frontend, admin frontend, docs, testing, developer/agent, model, and untracked usage.

Acceptance criteria

• AI token cost report template exists.

• Report supports pricing discussions.

• Untracked usage is clearly visible.

### Issue 55: Add next roadmap report

Labels: handoff, docs, priority-medium

Scope

• Create next_roadmap.md template.

• List deferred features, next sprint candidates, next version tasks, risks, and recommended priorities.

Acceptance criteria

• Next roadmap report exists.

• Report connects current delivery to future work.

• Deferred features are included.

### Issue 56: Add client handoff package template

Labels: handoff, docs, priority-high

Scope

• Create client_handoff_package.md template.

• Combine technical summary, business summary, feature readiness, known limitations, production/publish status, token cost report, and next roadmap.

Acceptance criteria

• Client handoff package template exists.

• Package is professional enough for agencies and freelancers.

• Package can be exported later to PDF/DOCX.

# الخلاصة التنفيذية

تحديث v5.0.0 يجعل Kabeeri VDF أكثر من CLI أو Dashboard أو ملفات تنظيمية. هذا التحديث يضيف طبقة ذكاء وتشغيل وثقة فوق كل ما سبق، بحيث يعرف النظام لماذا وُجدت كل إجابة، ومن أين جاءت كل Task، ومن وافق عليها، وما تكلفة تنفيذها، وهل يمكن قبولها بأمان.

بعد هذا التحديث، يصبح Kabeeri مؤهلًا بشكل أقوى للتوسع التجاري، دعم الفرق، دعم AI Agents متعددة، والتعامل مع مشاريع جديدة أو قائمة بطريقة آمنة وقابلة للتدقيق.

Kabeeri VDF v5.0.0 = Project Intelligence + Professional Intake + Trust Layer

# تتبع وحوكمة المهام

هذا المجلد هو الطبقة الموحّدة للمهام داخل **Kabeeri Vibe Developer Framework**.

كان النظام يفرق سابقًا بين:

- تتبع المهام: القوالب، الحالات، السكيما، الأمثلة، وسجل تنفيذ الذكاء الاصطناعي.
- حوكمة المهام: القواعد التي تحدد هل المهمة صالحة، جاهزة، محددة المصدر، محددة النطاق، قابلة للمراجعة، وآمنة للتنفيذ.

الآن أصبح المكان الموحّد لكل ذلك هو:

```text
knowledge/task_tracking/
```

## الهدف

هدف هذا المجلد هو منع تنفيذ العمل البرمجي بطريقة عشوائية أو واسعة جدًا.

بدل أن يطلب المطور من الذكاء الاصطناعي "ابني التطبيق كله" أو "حسّن المشروع"،
يقوم Kabeeri بتحويل العمل إلى مهام صغيرة واضحة يمكن تنفيذها ومراجعتها والتحقق
منها.

المسار العام:

```text
طلب المالك / إجابة questionnaire / Vibe intent / GitHub issue / Design source / Security scan
-> مهمة محكومة
-> تكليف أو token محدود النطاق
-> تنفيذ بواسطة مطور أو AI
-> أدلة مراجعة
-> تحقق Owner
-> ظهور في الداشبورد
-> commit أو release أو handoff
```

## ما هي المهمة المحكومة؟

المهمة المحكومة هي وحدة عمل صغيرة وواضحة تكفي لكي ينفذها مطور أو Codex أو
Claude أو Copilot أو أي AI agent بدون تخمين.

المهمة المحكومة يجب أن توضح:

- ما المطلوب تنفيذه.
- لماذا توجد المهمة.
- ما مصدرها.
- ما التطبيق أو الـ workstream أو الملفات المتأثرة.
- ما هو داخل النطاق.
- ما هو خارج النطاق.
- ما معايير القبول.
- من المسؤول عن التنفيذ.
- ما أدلة المراجعة المطلوبة.
- ما بوابات الحوكمة المطلوبة قبل اعتبارها منتهية.

## المكان الرسمي

استخدم هذا المجلد لكل ما يخص:

- task schemas
- task templates
- task states
- task intake
- task provenance
- task governance policy
- Owner verification rules
- review checklists
- AI execution logs
- examples
- runtime task-tracker guidance

المجلد القديم `task_governance/` تم حذفه ولا يجب إعادة إنشائه.

الملف:

```text
knowledge/governance/TASK_GOVERNANCE.md
```

موجود فقط كتوافق مع الروابط القديمة، أما السياسة الفعلية فهي هنا:

```text
knowledge/task_tracking/TASK_GOVERNANCE.md
```

## حالة المهام أثناء التشغيل

حالة المهام الأساسية تعيش في:

```text
.kabeeri/tasks.json
```

وحالة الداشبورد المختصرة تعيش في:

```text
.kabeeri/dashboard/task_tracker_state.json
```

هذه الحالة تتغذى من المهام، التوكنات، الأقفال، الجلسات، سجلات القبول، التطبيقات،
السبرنتات، تكلفة الذكاء الاصطناعي، اقتراحات Vibe، و post-work captures.

الأوامر المهمة:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf dashboard task-tracker
kvdf dashboard serve
```

وعند تشغيل الداشبورد المحلي، تظهر بيانات المهام هنا:

```text
/__kvdf/api/tasks
```

## مسار العمل المقترح

```text
1. تحديد مصدر المهمة.
2. إنشاء أو اعتماد مهمة محكومة.
3. تأكيد النطاق، الاستثناءات، workstream، app boundary، ومعايير القبول.
4. تكليف المطور أو AI agent.
5. إصدار token محدود النطاق أو بدء session عند الحاجة.
6. تنفيذ النطاق فقط.
7. تسجيل الملفات المتغيرة، الاختبارات، الصور، اللوجات، والمخاطر.
8. مراجعة مستقلة قدر الإمكان.
9. تحقق Owner أو رفضه.
10. ظهور الحالة النهائية في الداشبورد والتقارير.
```

## حالات المهمة

استخدم هذه الحالات الموحدة:

```text
todo
in_progress
blocked
review
done
closed
```

وتجنب خلط حالات متشابهة مثل:

```text
pending
started
complete
finished
```

## قاعدة استخدام الذكاء الاصطناعي

عند استخدام AI coding assistant داخل مهمة، يجب تزويده بتعليمات واضحة مثل:

```text
You are working inside Kabeeri Vibe Developer Framework.
Implement only this task.
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
List changed files.
List checks/tests to run.
Stop after completing this task.
```

## محتويات المجلد

```text
README.md
README_AR.md
TASK_GOVERNANCE.md
TASK_TEMPLATE.md
TASK_STATES.md
TASK_INTAKE_TEMPLATE.md
TASK_PROVENANCE_SCHEMA.json
TASK_REVIEW_CHECKLIST.md
AI_EXECUTION_LOG_TEMPLATE.md
EXAMPLE_TASK.md
OWNER_VERIFY_RULES.md
task.schema.json
task.schema.example.json
task_tracking_manifest.json
```

## الأوامر الأساسية

```bash
kvdf task create
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task assessment
kvdf task lifecycle
kvdf trace report
kvdf change report
kvdf task tracker
kvdf dashboard task-tracker
kvdf validate task
```

## الحالة

طبقة موحّدة لتتبع وحوكمة المهام داخل Kabeeri VDF.

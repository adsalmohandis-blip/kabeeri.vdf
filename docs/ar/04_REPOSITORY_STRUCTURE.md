# 04 - هيكل المستودع

هذا الملف هو النظير العربي الكانوني لملف `docs/en/04_REPOSITORY_STRUCTURE.md`.

## الجذر

```text
kabeeri-vdf/
├── bin/
├── src/
├── generators/
├── templates/
├── questionnaires/
├── questionnaire_engine/
├── standard_systems/
├── project_intake/
├── prompt_packs/
├── task_tracking/
├── governance/
├── acceptance_checklists/
├── schemas/
├── examples/
├── dashboard/
├── docs/
└── docs_site/
```

## المسؤوليات الرئيسية

| المجال | المسؤولية |
| --- | --- |
| `bin/`, `src/` | نقطة تشغيل الـ CLI وتنفيذ المنطق. |
| `generators/` | تعريفات skeleton لـ Lite وStandard وEnterprise. |
| `templates/` | قوالب عربية وإنجليزية قابلة لإعادة الاستخدام. |
| `questionnaires/` | مصادر الأسئلة الأساسية والإنتاجية والإضافية. |
| `task_tracking/` | مخططات المهام، القوالب، الأمثلة، الحالات، وحوكمة التنفيذ مع ذاكرة استئناف دائمة. |
| `governance/` | سياسات المالك، المهام، حدود التطبيقات، workstreams، tokens، والتنفيذ. |
| `acceptance_checklists/` | قوالب المراجعة والقبول. |
| `schemas/` | JSON Schemas وسجل التحقق من الحالات الحية. |
| `examples/` | أمثلة على سير العمل والملخصات. |
| `dashboard/` | الداشبورد الحي وملفاته المساعدة. |
| `docs/` | التوثيق العربي والإنجليزي والعمليات والتقارير. |
| `docs_site/` | الموقع الثابت للوثائق. |

## القاعدة

يجب توثيق القدرات الجديدة في المجلد الأقرب لمجالها، ثم إدراجها في
`docs/SYSTEM_CAPABILITIES_REFERENCE.md` عندما تصبح جزءًا من واجهة النظام.


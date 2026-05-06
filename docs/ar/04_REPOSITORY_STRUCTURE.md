# 04 — هيكل المستودع المقترح

```text
Kabeeri-Vibe-Developer-Framework/
├── generators/
│   ├── lite.json
│   ├── standard.json
│   └── enterprise.json
│
├── templates/
│   ├── arabic/
│   └── english/
│
├── questionnaires/
│   ├── core/
│   ├── production/
│   └── extension/
│
├── prompt_packs/
│   ├── laravel/
│   ├── dotnet/
│   ├── nextjs/
│   └── wordpress/
│
├── task_tracking/
├── acceptance_checklists/
├── schemas/
├── examples/
└── docs/
```

## generators

يحتوي على ملفات JSON التي تنشئ Skeleton المشروع. يجب أن تكون محدودة: فولدرات + دليل + ملفات أسئلة.

## templates

قوالب Word أو Markdown للدليل وملفات الأسئلة.

## questionnaires

الأسئلة الأصلية لكل فولدر، مقسمة إلى Core و Production و Extension.

## prompt_packs

برومبتات تنفيذ مخصصة لكل Framework.

## task_tracking

أدوات تتبع المهام.

## acceptance_checklists

قوائم قبول جاهزة.

## schemas

تعريفات JSON Schema للتحقق من ملفات generators و prompt packs.

## examples

أمثلة مشاريع مبنية بالفريمورك.

## docs

كل التوثيق الرسمي.

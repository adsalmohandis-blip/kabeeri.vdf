# Kabeeri Vibe Developer Framework

**Kabeeri Vibe Developer Framework** هو Meta-Framework مفتوح المصدر لمطوري البرمجيات بالذكاء الاصطناعي. يعمل كطبقة تطبيقية أعلى من Laravel و .NET و Next.js و Django و WordPress وغيرها، ولا يستبدلها.

الفكرة الأساسية: بدل أن يبدأ الـ vibe developer من Prompt عشوائي مثل “ابنِ لي تطبيقًا”، يبدأ من إطار منظم يحوّل فكرة المنتج إلى:

1. هيكل مشروع واضح.
2. ملفات أسئلة سهلة لصاحب المشروع.
3. مستندات تفصيلية قابلة للتوليد بالذكاء الاصطناعي.
4. Prompt Packs للتكويد.
5. Task Tracking.
6. Acceptance Checklists.
7. Extension Layer للتطور بعد الإطلاق.

## الجملة التعريفية

Laravel يساعد المبرمج يكتب الكود أسرع.  
Kabeeri Vibe Developer Framework يساعد الـ vibe developer يعرف ماذا يطلب من AI، وبأي ترتيب، وكيف يراجع الناتج.

## لماذا يوجد هذا الفريمورك؟

أدوات الذكاء الاصطناعي أصبحت قادرة على كتابة الكود، لكن كثيرًا من المستخدمين لا يعرفون:

- كيف يشرحون المنتج للذكاء الاصطناعي.
- كيف يقسمون المشروع إلى مراحل.
- كيف يمنعون AI من خلط V1 مع مميزات مستقبلية.
- كيف يراجعون ما تم إنشاؤه.
- كيف يحافظون على المشروع قابلًا للتطوير.

هذا الفريمورك يحل هذه المشكلة بمنهجية قابلة للتكرار.

## لمن هذا الفريمورك؟

- مطوري الذكاء الاصطناعي / vibe developers.
- أصحاب المشاريع التقنية غير المتخصصين برمجيًا.
- فرق صغيرة تستخدم ChatGPT أو Codex أو Cursor أو Claude أو Windsurf أو GitHub Copilot.
- رواد أعمال يريدون تحويل فكرة إلى مشروع قابل للبناء.
- فرق برمجية تريد توحيد طريقة التعامل مع AI.

## ما الذي لا يفعله؟

- لا يستبدل Laravel أو .NET أو Next.js.
- لا يضمن جودة الكود بدون مراجعة.
- لا يلغي الحاجة إلى اختبار أمني وتقني.
- لا يحوّل كل فكرة إلى منتج ناجح تلقائيًا.

## أول نسخة مقترحة

النسخة الأولى يجب أن تكون GitHub Repository يحتوي على:

```text
Kabeeri-Vibe-Developer-Framework/
├── generators/
├── templates/
├── questionnaires/
├── prompt_packs/
├── task_tracking/
├── acceptance_checklists/
├── schemas/
├── examples/
└── docs/
```

بعدها يتم تطوير CLI ثم VS Code Extension ثم Desktop/SaaS حسب الخطة الموجودة في `docs/ar/13_PRODUCT_ROADMAP_AND_DISTRIBUTION.md`.

## ابدأ من هنا

1. اقرأ `docs/ar/01_VISION_AND_POSITIONING.md`.
2. اقرأ `docs/ar/03_FRAMEWORK_ARCHITECTURE.md`.
3. راجع `docs/ar/04_REPOSITORY_STRUCTURE.md`.
4. نفّذ خطة MVP من `docs/ar/19_MVP_BUILD_PLAN.md`.
5. استخدم `CONTRIBUTING.md` لإدارة مساهمات الفريق.

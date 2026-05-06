# 13 — خطة التطور والتوزيع

## السؤال: GitHub Repo أم VS Code Extension أم Desktop App أم SaaS؟

الإجابة: كلهم، لكن بترتيب مراحل.

## المرحلة الأولى — GitHub Repository

ابدأ بمستودع GitHub مفتوح المصدر. هذا أقل تكلفة، أسرع في النشر، وأسهل لجذب مساهمين.

المحتوى:

- Docs.
- Generators.
- Questionnaires.
- Templates.
- Prompt Packs.
- Examples.
- Schemas.

## المرحلة الثانية — CLI

بعد ثبات الهيكل، ابنِ CLI:

```bash
kvdf new my-project --profile standard --lang ar
kvdf validate
kvdf list-questionnaires
kvdf export-ai-handoff
```

## المرحلة الثالثة — VS Code Extension

بعد CLI، ابنِ إضافة VS Code لأنها قريبة من بيئة العمل.

وظائفها:

- عرض الفولدرات.
- فتح الأسئلة.
- تتبع المهام.
- تصدير Prompt للـ AI.
- عرض Acceptance Checklist.

## المرحلة الرابعة — Desktop App

للمستخدمين غير التقنيين. يعمل كواجهة رسومية محلية.

## المرحلة الخامسة — SaaS

لفرق العمل، القوالب المشتركة، Marketplace، إدارة الصلاحيات، تكاملات AI.

## الترتيب النهائي

```text
GitHub Repo → CLI → VS Code Extension → Desktop App → SaaS
```

## لماذا لا نبدأ SaaS؟

لأن الفكرة تحتاج اعتماد ومنهجية ومساهمين أولًا. GitHub يعطي ثقة وانتشارًا أسرع.

# 09 — Prompt Packs

## الهدف

تحويل المستندات إلى أوامر تنفيذ دقيقة لأي AI coding tool.

## أنواع Prompt Packs

- Laravel.
- .NET.
- Next.js.
- WordPress.
- Generic Web App.
- Mobile.
- API-only backend.

## قواعد Prompt Pack

1. Prompt واحد لا يبني النظام كاملًا.
2. كل Prompt يجب أن يكون مرتبطًا بـ Task ID.
3. كل Prompt يحدد الملفات المتوقع تعديلها.
4. كل Prompt يحتوي على اختبارات أو خطوات تحقق.
5. كل Prompt يحتوي على قيود واضحة: ما الذي لا يجب تغييره.
6. كل Prompt يحتوي على Definition of Done.

## شكل Prompt مقترح

```text
Task ID:
Context:
Goal:
Allowed files:
Do not touch:
Steps:
Validation:
Expected output:
Definition of Done:
```

## مثال مبدأي

```text
لا تنشئ موديولات مستقبلية.
لا تعدل Extension Layer.
نفذ فقط Auth foundation كما هو موضح في مستند V1.
بعد الانتهاء شغّل الاختبارات أو اكتب خطوات اختبار يدوية.
```

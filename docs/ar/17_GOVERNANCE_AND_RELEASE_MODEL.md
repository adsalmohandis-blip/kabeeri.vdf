# 17 — الحوكمة ونموذج الإصدارات

## الإصدارات

استخدم Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

## أمثلة

- v0.1.0: أول توثيق وهيكل.
- v0.2.0: إضافة Lite و Enterprise.
- v0.3.0: Prompt Pack Laravel.
- v1.0.0: أول نسخة مستقرة.

## قرارات لا تتم عشوائيًا

- تغيير أسماء الفولدرات الأساسية.
- تغيير lifecycle.
- تغيير generator schema.
- تغيير مفهوم questionnaire.

## RFC

أي تغيير كبير يجب أن يبدأ كـ RFC داخل:

```text
docs/rfcs/
```

## سياسة التوافق

إذا تغير generator schema يجب توفير migration guide.

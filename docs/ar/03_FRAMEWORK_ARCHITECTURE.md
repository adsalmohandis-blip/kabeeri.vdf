# 03 — معمارية الفريمورك

## الطبقات الرئيسية

```text
Kabeeri Vibe Developer Framework
├── Project Skeleton Layer
├── Questionnaire Layer
├── Documentation Generation Layer
├── Prompt Pack Layer
├── Task Execution Layer
├── Acceptance & Review Layer
└── Extension Layer
```

## 1. Project Skeleton Layer

ينشئ الفولدرات الأساسية فقط مع ملف دليل وملفات أسئلة. لا ينشئ ملفات تفصيلية فاضية.

## 2. Questionnaire Layer

كل فولدر يحتوي على ملف أسئلة متخصص. الأسئلة موجهة للمبتدئين، وتستخرج معلومات المنتج بطريقة سهلة.

## 3. Documentation Generation Layer

بعد الإجابة على ملف الأسئلة داخل فولدر معين، يطلب المستخدم من AI توليد مستندات هذا الفولدر فقط.

## 4. Prompt Pack Layer

بعد اكتمال المستندات، يتم توليد Prompt Packs خاصة بالإطار البرمجي المختار.

## 5. Task Execution Layer

كل Prompt يتحول إلى Task يمكن تتبعها.

## 6. Acceptance & Review Layer

كل Task وكل Feature لها Checklist للتحقق.

## 7. Extension Layer

أي ميزة بعد الإطلاق تبدأ كامتداد، ولا تعدل Core إلا بعد اعتماد واضح.

## العلاقة مع Laravel وغيره

```text
Kabeeri VDF → يحدد المنتج والمستندات والبرومبتات والمهام
Laravel/.NET/Next.js → ينفذ الكود
AI Coding Tools → تساعد في الكتابة والتنفيذ
Human Reviewer → يراجع ويقبل أو يرفض
```

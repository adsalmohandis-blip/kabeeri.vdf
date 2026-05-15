# أوامر KVDF CLI

هذا الملف يحدد هيكل الأوامر المقترح للأداة المستقبلية `kvdf`.

## الأمر الرئيسي

```bash
kvdf
```

## المساعدة

```bash
kvdf --help
kvdf <command> --help
```

## معرفة النسخة

```bash
kvdf --version
```

---

# 1. init

إنشاء Workspace خاص بـ Kabeeri VDF داخل Repository موجود.

```bash
kvdf init
```

أمثلة:

```bash
kvdf init --profile lite
kvdf init --profile standard
kvdf init --profile enterprise
kvdf init --lang ar
kvdf init --lang en
kvdf init --lang both
```

## الوظيفة

تجهيز فولدرات وملفات البداية الخاصة بالفريمورك.

## لا يجب أن يفعل

```text
- لا يثبت فريموركات برمجية
- لا ينشئ تطبيق إنتاج حقيقي
- لا يستبدل ملفات المستخدم بدون تأكيد
```

---

# 2. generate

توليد هيكل مستندات الفريمورك حسب البروفايل.

```bash
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
```

---

# 3. questionnaire

إنشاء أو إدارة ملفات الأسئلة.

```bash
kvdf questionnaire list
kvdf questionnaire create --profile lite
kvdf questionnaire create --group core
kvdf questionnaire status
```

يدعم:

```text
core
production
extension
```

---

# 4. prompt-pack

عرض أو استخدام Prompt Packs.

```bash
kvdf prompt-pack list
kvdf prompt-pack show laravel
kvdf prompt-pack use laravel
kvdf prompt-pack validate laravel
```

لا يجب أن يثبت Laravel أو Next.js أو أي فريمورك.

---

# 5. task

إنشاء وإدارة ملفات تتبع المهام.

```bash
kvdf task create
kvdf task list
kvdf task status
kvdf task review
```

مثال:

```bash
kvdf task create --title "Create first auth prompt" --type prompt-pack
kvdf task create --issue 9 --milestone v0.1.1
```

---

# 6. acceptance

إنشاء أو مراجعة Acceptance Checklists.

```bash
kvdf acceptance create
kvdf acceptance review
kvdf acceptance list
```

مثال:

```bash
kvdf acceptance create --type task-completion --issue 9
kvdf acceptance create --type release --version v0.1.1
```

---

# 7. example

عرض أو نسخ أمثلة الاستخدام.

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
```

---

# 8. validate

فحص ملفات الفريمورك.

```bash
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
```

---

# 9. release

تجهيز ملفات ومراجعة الإصدار.

```bash
kvdf release check
kvdf release notes --version v0.1.1
kvdf release checklist --version v0.1.1
```

في النسخ الأولى لا يجب أن ينشر Release تلقائيًا.

---

# 10. doctor

فحص صحة Workspace.

```bash
kvdf doctor
```

يفحص:

```text
- وجود الفولدرات الأساسية
- وجود README
- صحة JSON
- وجود Manifest files
- عدم بقاء Placeholder files واضحة
```

# 📋 جدول أولويات تطوير Kabeeri VDF

> تم التحديث: 2026-05-10

---

## ✅ المنجز (Done) — 5 أولويات

| # | المعرف | العنوان | ملخص |
|---|--------|---------|------|
| 1 | `evo-auto-001` | **Autonomous Evolution Steward workflow** | جعل Evolution Steward هو backlog التلقائي الوحيد لأولويات تطوير الإطار |
| 2 | `evo-auto-002` | **Owner resume scan** | تحسين `kvdf resume --scan` مع نقطة تفتيش المالك وملخص التغييرات |
| 3 | `evo-auto-003` | **Continue CLI index modularization** | استخراج 20+ أمر CLI من `src/cli/index.js` إلى وحدات أوامر منفصلة ✅ |
| 4 | `evo-auto-004-temp-priorities` | **Temporary execution priorities** | إنشاء قائمة مهام مؤقتة وتقسيم الأولوية النشطة |
| 5 | `evo-auto-005-durable-task-details` | **Durable execution-grade task descriptions** | تفاصيل مهام دقيقة قابلة للتنفيذ لتجاوز مشكلة انقطاع الجلسة |

---

## 🔄 قيد التنفيذ (In Progress) — أولوية واحدة نشطة

| # | المعرف | العنوان | الوضع الحالي |
|---|--------|---------|-------------|
| **6** 🎯 | `evo-auto-004` | **Runtime services layer** | الشريحة الحالية: `scope` (تحديد نطاق العمل) |

**التفاصيل:** نقل المنطق المتكرر من معالجات الأوامر إلى خدمات وقت التشغيل.

**الشرائح:**
| الشريحة | الحالة | الوصف |
|----------|--------|-------|
| 1. `scope` | 🟢 **نشط** | تحديد نطاق العمل والنتيجة المطلوبة |
| 2. `map` | ⏳ pending | تحديد الملفات المتأثرة |
| 3. `implement` | ⏳ pending | تنفيذ أصغر تغيير متماسك |
| 4. `sync` | ⏳ pending | مزامنة التوثيق والحالة والتقارير |
| 5. `validate` | ⏳ pending | التحقق من الصحة وإغلاق القائمة |

---

## 📝 مخطط (Planned) — 11 أولوية

| # | المعرف | العنوان | ملخص |
|---|--------|---------|------|
| 7 | `evo-auto-005` | **Manual source package intake** | التعامل مع `KVDF_New_Features_Docs` كمصدر تصميم ووثائق مرجعي مؤقت |
| 8 | `evo-auto-006` | **Reference design duplicate analysis** | تحليل أنظمة التصميم المرجعية مقابل خريطة القدرات المركزية |
| 9 | `evo-auto-007` | **Project documentation generator import** | استيراد مولد وثائق المشاريع والـ templates المرتبطة به |
| 10 | `evo-auto-008` | **Source package cleanup and removal workflow** | نقل المحتوى ثم إزالة الفولدر المصدر بعد التحقق |
| 11 | `evo-auto-009` | **UI/UX questionnaire linkage** | ربط قرارات UI/UX بالاستبيانات وتوليد المهام |
| 12 | `evo-auto-010` | **Low-cost project start mode** | وضع بدء مشروع منخفض التكلفة بسياق مضغوط |
| 13 | `evo-auto-011` | **Runtime schema registry enforcement** | منع ملفات الحالة الجديدة دون تغطية مخططات |
| 14 | `evo-auto-012` | **Docs source-of-truth checks** | كشف الأوامر المفقودة من التوثيق الرسمي |
| 15 | `evo-auto-013` | **Team GitHub sync deepening** | إضافة تكامل issues/PRs/status للفريق |
| 16 | `evo-auto-014` | **Dashboard separation** | فصل لوحة التحكم عن CLI الأساسي |
| 17 | `evo-auto-015` | **Fast test layers** | إضافة اختبارات وحدة/خدمة أسرع |
| 18 | `evo-auto-016` | **Historical folder/version clarity** | توضيح المجلدات التاريخية والتقارير القديمة |

---

## 💤 مؤجل (Deferred) — فكرة واحدة

| # | المعرف | العنوان | ملخص |
|---|--------|---------|------|
| 19 | `evo-deferred-ideas` | **Kabeeri + n8n + LLM orchestration** | دمج Kabeeri مع n8n لتقليل الاعتماد على جلسات AI عالية التكلفة |

---

## ملخص سريع

```
✅ منجز:     3
🔄 قيد التنفيذ:  1 (أنت هنا)
📝 مخطط:   13
💤 مؤجل:    1 (فكرتان)
-------------------
المجموع:   19 أولوية
```

## الأوامر المفيدة

```bash
# عرض الأولويات
node bin/kvdf.js evolution priorities

# عرض تفاصيل أولوية محددة
node bin/kvdf.js evolution show evo-auto-001

# عرض القائمة المؤقتة للأولوية النشطة
node bin/kvdf.js evolution temp

# التقدم إلى الشريحة التالية
node bin/kvdf.js evolution temp advance

# عرض الأفكار المؤجلة
node bin/kvdf.js evolution deferred
## Current Runtime Update

- `evo-auto-034-developer-onboarding` is now `done`.
- `evo-auto-035-governance-expansion` is now `done`.
- `evo-auto-036-capability-doc-matrix` is now `done`.
- `evo-auto-037-source-normalization` is now `done`.
- `evo-auto-038-full-task-coverage` is now `done`.
- `evo-auto-039-blocked-scenarios` is now done.
- `evo-auto-040-searchable-reference` is now done.
- `evo-auto-041-execution-reports` is now done.
- `kvdf evolution report` now writes `docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md` as a resumable execution snapshot for the next session.
- No Evolution priorities remain open right now; continue the runtime-services slice by extracting the remaining reusable helpers out of `src/cli/index.js`.
- Shared command suggestions and git snapshot helpers now live in `src/cli/services/command_suggestions.js` and `src/cli/services/git_snapshot.js`.
- `kvdf capability search` now publishes a searchable index across the registry, CLI surface, documentation matrix, and roadmap views.
- The onboarding workflow now persists `kvdf onboarding` guidance in `.kabeeri/reports/session_onboarding.json` and can be reloaded with `kvdf onboarding report`.
- `kvdf governance report` now includes a governance coverage view for trust, safety, privacy, compliance, and extensibility.
- `kvdf capability matrix` now publishes the docs, CLI, runtime, tests, and report links for every capability in a single traceable matrix.
- `kvdf source-package normalize` now publishes lowercase aliases and preserved mappings for the imported source roots and sections.

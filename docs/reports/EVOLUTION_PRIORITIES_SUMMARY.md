# 📋 جدول أولويات تطوير Kabeeri VDF

> تم التحديث: 2026-05-10

---

## ✅ المنجز (Done) — 3 أولويات

| # | المعرف | العنوان | ملخص |
|---|--------|---------|------|
| 1 | `evo-auto-001` | **Autonomous Evolution Steward workflow** | جعل Evolution Steward هو backlog التلقائي الوحيد لأولويات تطوير الإطار |
| 2 | `evo-auto-002` | **Owner resume scan** | تحسين `kvdf resume --scan` مع نقطة تفتيش المالك وملخص التغييرات |
| 3 | `evo-auto-003` | **Continue CLI index modularization** | استخراج 20+ أمر CLI من `src/cli/index.js` إلى وحدات أوامر منفصلة ✅ |

---

## 🔄 قيد التنفيذ (In Progress) — أولوية واحدة نشطة

| # | المعرف | العنوان | الوضع الحالي |
|---|--------|---------|-------------|
| **4** 🎯 | `evo-auto-004-temp-priorities` | **Temporary execution priorities** | الشريحة الحالية: `scope` (تحديد نطاق العمل) |

**التفاصيل:** إنشاء قائمة مهام مؤقتة للأولوية النشطة، تقسيمها إلى شرائح تنفيذية بأوصاف دقيقة.

**الشرائح:**
| الشريحة | الحالة | الوصف |
|----------|--------|-------|
| 1. `scope` | 🟢 **نشط** | تحديد نطاق العمل والنتيجة المطلوبة |
| 2. `map` | ⏳ pending | تحديد الملفات المتأثرة |
| 3. `implement` | ⏳ pending | تنفيذ أصغر تغيير متماسك |
| 4. `sync` | ⏳ pending | مزامنة التوثيق والحالة والتقارير |
| 5. `validate` | ⏳ pending | التحقق من الصحة وإغلاق القائمة |

---

## 📝 مخطط (Planned) — 13 أولوية

| # | المعرف | العنوان | ملخص |
|---|--------|---------|------|
| 5 | `evo-auto-005-durable-task-details` | **Durable execution-grade task descriptions** | تفاصيل مهام دقيقة قابلة للتنفيذ بعد انقطاع الجلسة |
| 6 | `evo-auto-004` | **Runtime services layer** | نقل المنطق المتكرر من معالجات الأوامر إلى خدمات وقت التشغيل |
| 7 | `evo-auto-005` | **Manual feature-docs inbox** | التعامل مع مجلد `KVDF_New_Features_Docs` يدوياً فقط |
| 8 | `evo-auto-006` | **Feature-docs duplicate analysis** | تحليل 38 وثيقة حوكمة مقابل خريطة القدرات المركزية |
| 9 | `evo-auto-007` | **Project reference packs import** | استيراد 83 حزمة مرجعية مفقودة |
| 10 | `evo-auto-008` | **Feature-docs inbox cleanup workflow** | تنظيف مجلد الميزات بعد الاستيراد |
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
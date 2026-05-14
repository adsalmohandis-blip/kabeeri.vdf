# Kabeeri Vibe Developer Framework

`Kabeeri VDF` أو `kabeeri.vdf` هو إطار عمل مفتوح المصدر لبناء البرمجيات بمساعدة الذكاء الاصطناعي.

هو لا يستبدل Laravel أو Next.js أو React أو Vue أو Angular أو WordPress أو Django أو .NET أو Flutter أو React Native.
بدل ذلك، يوفّر بيئة عمل محكومة قبل وأثناء وبعد توليد الكود.

Kabeeri يحول فكرة المنتج إلى:

- أسئلة واضحة
- حدود تطبيقية
- خطط Agile أو Structured
- blueprints للمنتج والبيانات
- توجيه UI/UX
- مهام محكومة
- سياق Prompt للذكاء الاصطناعي
- سجلات التكلفة والاستخدام
- رؤية حية للوحة التحكم
- readiness و release gates
- سجلات Evolution للتغييرات على النظام نفسه
- تقارير handoff

## مبدأ العمل

- المسار `owner` خاص بتطوير النظام نفسه
- المسار `app` خاص ببناء تطبيقات العميل
- المسار `plugin` خاص بالميزات المستقلة التي يمكن إضافتها أو حذفها أو تعطيلها

الذكاء الاصطناعي يجب أن يستخدم `kvdf` مباشرة عندما تكون الحالة أو المهمة أو التقرير موجودًا بالفعل.

## لماذا Kabeeri؟

Kabeeri يساعد عندما:

- تكون الفكرة غير واضحة
- يبدأ الذكاء الاصطناعي بالبرمجة قبل إنشاء المهام
- يختلط عمل backend و frontend و mobile
- يعمل أكثر من مطور على نفس الملفات
- يتم العمل خارج نطاق المهمة المتفق عليه
- يحتاج المالك إلى معرفة ما هو جاهز أو معطل أو عالي المخاطرة

## أوامر CLI

`kvdf` هو المحرك التنفيذي، وليس الواجهة الأساسية الوحيدة.

```bash
kvdf init
kvdf questionnaire plan "Build an ecommerce store"
kvdf task tracker --json
kvdf readiness report --json
kvdf governance report --json
kvdf reports live --json
```

## تقليل استهلاك الكريديت

استخدم أقل سياق ممكن:

- استخدم مخرجات CLI بدل تكرار الشرح
- فضّل `--json` والتقارير المولدة
- استخدم prompt packs و questionnnaire لسد النواقص فقط
- افصل owner-track عن app-track
- اعتبر plugins ميزات مستقلة

## Prompt Packs

Prompt packs ليست أدوات تثبيت أو إنشاء تطبيقات كاملة.
هي تعليمات AI جاهزة للاستخدام بعد مرحلة التخطيط.

القواعد الأساسية:

- استخدم حزمة واحدة في كل مرة
- لا توسع النطاق
- لا تعدّل ملفات غير مرتبطة
- لا تتجاوز governance

## Vibe-first

Kabeeri مصمم لـ vibe coding أولًا:

1. اشرح الهدف بلغة طبيعية
2. دع الذكاء الاصطناعي يستخدم Kabeeri لتنظيم العمل
3. أنشئ المهام المحكومة
4. نفّذ عبر CLI
5. راقب التكلفة والحالة والـ handoff

## مصدر الحقيقة

- الحالة الحية في `.kabeeri/`
- المهام في `.kabeeri/tasks.json`
- التقارير الحية في `.kabeeri/reports/`
- التوثيق في `docs/` و `knowledge/`

## خلاصة

القاعدة الذهبية في Kabeeri:

- مدخل واحد
- CLI مباشر
- owner/app فصل واضح
- plugins مستقلة
- تقارير حية
- سياق AI صغير وواضح


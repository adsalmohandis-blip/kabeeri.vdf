# Kabeeri Vibe Developer Framework

Kabeeri VDF أو `kabeeri.vdf` هو فريمورك مفتوح المصدر يساعد المطورين وأصحاب المشاريع على بناء البرمجيات باستخدام أدوات الذكاء الاصطناعي بطريقة منظمة وقابلة للمتابعة.

كبيري لا يستبدل Laravel أو Next.js أو React أو Vue أو Angular أو WordPress أو Django أو .NET أو Flutter أو React Native. هو طبقة تنظيم وحوكمة فوق هذه الأدوات، تجعل المطور والذكاء الاصطناعي يعملان داخل نظام واضح بدل التنفيذ العشوائي.

كبيري يساعدك على تحويل الفكرة إلى:

- أسئلة واضحة للمطور أو العميل
- حدود واضحة للتطبيقات داخل المشروع
- اختيار Agile أو Structured حسب طبيعة المشروع
- خريطة نوع النظام المطلوب بناؤه
- توجيه لتصميم قاعدة البيانات
- توجيه لتصميم الواجهات
- تاسكات محكومة
- سياق جاهز للذكاء الاصطناعي
- تسجيل استهلاك التوكنات والتكلفة
- لوحة مراقبة مباشرة
- تقارير readiness وgovernance
- بوابات نشر وتسليم
- تقارير handoff للمالك أو العميل

الفكرة الأساسية: المطور يتكلم طبيعي، وأداة الذكاء الاصطناعي تستخدم كبيري كطبقة تشغيل وتنظيم للمشروع، وكبيري يحافظ على وضوح المشروع عندما تنتهي جلسة وتبدأ جلسة أخرى.

## Vibe-first أولا

كبيري مبني أساسا للفايب كودنج.

التجربة الطبيعية ليست أن يحفظ المطور أوامر كثيرة في التيرمنال. التجربة الطبيعية هي:

```text
المطور يتكلم مع أداة الذكاء الاصطناعي بلغة طبيعية.
أداة الذكاء الاصطناعي تستخدم قواعد وسجلات كبيري في الخلفية.
كبيري ينظم التاسكات والقرارات والحدود والتوكنات والداشبورد.
```

مثال:

```text
أريد بناء متجر إلكتروني فيه باك إند Laravel، واجهة Next.js،
لوحة إدارة، دفع، شحن، وتطبيق موبايل لاحقا.
```

بعدها يجب أن تستخدم أداة الذكاء الاصطناعي كبيري لتحديد نوع النظام، طرح الأسئلة الناقصة، اقتراح Agile أو Structured، تقسيم العمل إلى تاسكات، تتبع التوكنات، وتحديث لوحة المراقبة.

## ما دور CLI؟

كبيري يحتوي على CLI حقيقي باسم `kvdf`، لكن الـ CLI ليس هو تجربة المستخدم الأساسية.

الـ CLI هو المحرك التنفيذي والتتبعي في الخلفية. تستخدمه أدوات الذكاء الاصطناعي، أو السكربتات، أو المطور المتقدم عند الحاجة لتحديث حالة المشروع بدقة.

يستطيع `kvdf` إنشاء `.kabeeri/`، إنشاء هياكل مشاريع، توليد تاسكات محكومة، تشغيل التحقق، تسجيل استهلاك الذكاء الاصطناعي، إدارة task access tokens، تشغيل الداشبورد، تطبيق policy gates، وإخراج تقارير readiness وgovernance.

بالنسبة لمعظم مطوري الفايب كودنج، الفكرة المهمة هي: تحدث مع أداة الذكاء الاصطناعي بشكل طبيعي، ودعها تستخدم `kvdf` عندما يحتاج المشروع إلى تتبع أو حوكمة.

مصدر الحقيقة داخل أي مشروع هو:

```text
.kabeeri/
```

- الـ CLI يكتب الحالة داخل `.kabeeri/`.
- الداشبورد تقرأ من `.kabeeri/`.
- أدوات الذكاء الاصطناعي يجب أن تعمل عبر التاسكات والحدود والتقارير بدل التعديل العشوائي.

مراجع مهمة:

- [System Capabilities Reference](docs/SYSTEM_CAPABILITIES_REFERENCE.md)
- [CLI Command Reference](cli/CLI_COMMAND_REFERENCE.md)
- [Documentation Site](docs/site/index.html)

## لمن يستخدم كبيري؟

كبيري مناسب لـ:

- مطوري الفايب كودنج
- أصحاب المشاريع الذين يبنون بالذكاء الاصطناعي
- المطورين الذين يريدون تتبع عمل الذكاء الاصطناعي
- الفرق الصغيرة التي تستخدم أدوات AI
- الوكالات التي تريد طريقة تسليم متكررة ومنظمة
- أصحاب المنتجات الذين يحتاجون تخطيط أوضح قبل الكود
- المطورين الذين يعملون على أكثر من تطبيق داخل نفس المنتج

يمكن استخدام كبيري مع أي أداة ذكاء اصطناعي. هو غير مرتبط بأداة واحدة.

## لماذا تحتاج كبيري؟

أدوات الذكاء الاصطناعي قوية، لكن المشاريع تتعطل عندما:

- تكون الفكرة غير واضحة
- يبدأ الذكاء الاصطناعي في الكود قبل وجود تاسكات
- تختلط ملفات الباك إند والفرونت إند والموبايل
- يعدل أكثر من مطور نفس الملفات
- لا يتم تسجيل التوكنات والتكلفة
- تتوقف الداشبورد أو تصبح قديمة
- يتم العمل خارج نظام التاسكات
- لا يعرف المالك ما الذي انتهى وما الذي يحتاج مراجعة

كبيري هو طبقة الحوكمة حول تجربة التطوير بالذكاء الاصطناعي.

## إعداد سريع

من داخل هذا المستودع:

```bash
npm install
```

اختبار المحرك:

```bash
npm run kvdf -- --help
npm run kvdf -- doctor
npm run kvdf -- validate
```

بعد الربط المحلي أو التثبيت يمكن استخدام `kvdf` مباشرة. في الاستخدام اليومي، يمكن لأداة الذكاء الاصطناعي تشغيل هذه الأوامر نيابة عنك عند الحاجة.

## ابدأ مع أداة ذكاء اصطناعي

افتح المستودع أو فولدر المشروع في المحرر، ثم قل لأداة الذكاء الاصطناعي مثلا:

```text
استخدم كبيري لمساعدتي في بدء مشروع متجر إلكتروني جديد.
اسألني فقط عن المعلومات الناقصة، اقترح طريقة التسليم، أنشئ تاسكات محكومة،
وحدث الداشبورد. لا تنفذ خارج التاسكات المعتمدة.
```

بعدها يمكن للأداة استخدام سجلات كبيري ومحرك `kvdf` في الخلفية.

## بدء Workspace جديد

داخل فولدر المشروع:

```bash
kvdf init --profile standard --mode structured
```

اللغة الافتراضية الآن هي:

```text
language: user
```

يعني كبيري يحاول اتباع لغة المستخدم في الأسئلة والتوجيهات. ويمكن تحديد اللغة صراحة:

```bash
kvdf init --profile standard --lang ar
kvdf init --profile standard --lang en
```

## إنشاء هيكل مشروع

كبيري يدعم ثلاث بروفايلات:

| البروفايل | مناسب لـ |
| --- | --- |
| `lite` | صفحات بسيطة، MVP صغير، أدوات داخلية |
| `standard` | SaaS، متجر إلكتروني، CMS، حجوزات، أنظمة أعمال |
| `enterprise` | ERP، Marketplace، Multi-tenant، أنظمة كبيرة طويلة المدى |

يمكن لأداة الذكاء الاصطناعي إنشاء الهيكل، أو يمكن للمطور المتقدم تشغيل:

```bash
kvdf create --profile standard --output my-project
```

أو:

```bash
kvdf generate --profile standard --output my-project
```

لو الأمر يعمل داخل workspace يحتوي `.kabeeri/`، سيقوم كبيري تلقائيا بإنشاء تاسكات حوكمة مقترحة للمراجعة والتنفيذ والتحقق. هذا يمنع توليد Laravel أو Next.js أو WordPress أو غيرها بدون تاسكات.

لو أردت هيكل خام فقط بدون تاسكات:

```bash
kvdf create --profile standard --output my-project --no-tasks
```

## طريقة العمل المقترحة

1. فعّل كبيري داخل المشروع.
2. اشرح المنتج بلغة طبيعية.
3. دع كبيري يقترح blueprint وdelivery mode وdata design وUI direction وprompt packs.
4. اسأل فقط الأسئلة الناقصة.
5. حول المقترحات المعتمدة إلى تاسكات.
6. نفذ تاسك واحدة في كل مرة.
7. استخدم task tokens وlocks لتحديد نطاق التنفيذ.
8. سجل استهلاك التوكنات.
9. استخدم post-work capture لأي عمل تم خارج المسار.
10. راجع، تحقق، ثم سلم.

قد تستخدم أداة الذكاء الاصطناعي أوامر مثل هذه في الخلفية:

```bash
kvdf questionnaire plan "Build an ecommerce store with Laravel backend, Next.js frontend, payments, shipping, and a mobile app" --json
kvdf blueprint recommend "Build ecommerce store with catalog cart checkout payments shipping"
kvdf data-design context ecommerce --json
kvdf design recommend ecommerce --json
kvdf delivery recommend "Build a regulated ERP with accounting and approvals" --json
```

## أمثلة CLI للأتمتة

هذه الأمثلة موجهة أكثر لأدوات الذكاء الاصطناعي، السكربتات، والمطورين المتقدمين. ليست هي الطريقة الأساسية التي يجب أن يفكر بها مطور الفايب كودنج في كبيري:

```bash
kvdf vibe suggest "Add a checkout page for customers"
kvdf vibe plan "Build ecommerce store with products cart checkout admin and tests"
kvdf vibe convert suggestion-001
kvdf capture --summary "Implemented checkout validation" --files src/checkout.ts --checks "npm test" --evidence "checkout tests passed"
```

لو تم تغيير ملفات بدون تاسك مرتبط، يمكن أن تصبح readiness في حالة blocked حتى يتم ربط capture بتاسك أو تحويله أو رفضه أو حله.

## حوكمة التاسكات

كبيري يتوقع أن التنفيذ يتم من خلال تاسكات.

```bash
kvdf task create --title "Build product catalog API" --workstream backend
kvdf task approve task-001
kvdf task assign task-001 --assignee agent-001
kvdf token issue --task task-001 --assignee agent-001 --max-usage-tokens 50000
kvdf lock acquire --task task-001 --type folder --scope src/api/products --owner agent-001
kvdf task start task-001 --actor agent-001
```

عرض التراكر:

```bash
kvdf task tracker
kvdf task tracker --json
```

## تسجيل التوكنات والتكلفة

تسجيل استهلاك مرتبط بتاسك:

```bash
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --cost 0.25
```

تسجيل استفسارات أو عمليات إدارية غير مرتبطة بتاسك:

```bash
kvdf usage inquiry --input-tokens 300 --output-tokens 120 --cost 0.04 --operation owner-question
kvdf usage admin --input-tokens 500 --output-tokens 200 --cost 0.08 --operation dashboard-review
```

الملخص:

```bash
kvdf usage summary
kvdf usage efficiency
```

## لوحة المراقبة المباشرة

تشغيل الداشبورد:

```bash
kvdf dashboard serve --port 4177
```

المسارات:

- صفحة العميل: `http://127.0.0.1:4177/`
- الداشبورد الخاصة: `http://127.0.0.1:4177/__kvdf/dashboard`
- حالة live كاملة: `http://127.0.0.1:4177/__kvdf/api/state`
- حالة التاسكات: `http://127.0.0.1:4177/__kvdf/api/tasks`
- التقارير الحية: `http://127.0.0.1:4177/__kvdf/api/reports`

الداشبورد تعرض التطبيقات، التاسكات، execution scopes، workstreams، Vibe suggestions، post-work captures، Agile، Structured، AI usage، السياسات، readiness، الأمن، المايجريشن، وكفاءة المطورين.

كل قسم داخل الداشبورد يحتوي وصفا مختصرا يوضح معناه وسبب وجوده.

## Readiness وGovernance وRelease Gates

إنشاء تقارير مستقلة:

```bash
kvdf readiness report --output readiness.md
kvdf governance report --output governance.md
kvdf reports live
```

النشر وGitHub محميان بسياسات:

```bash
kvdf policy evaluate --release v0.2.0
kvdf release publish --version v0.2.0 --dry-run
```

وجود تاسكات مفتوحة قد يجعل readiness في حالة warning، وهذا ليس دائما blocker. الـ blockers الحقيقية تشمل فشل validation، سياسات blocked، مشاكل security أو migration، أو work capture غير مربوط بتاسك.

## Agile وStructured

كبيري يدعم طريقتين للتسليم:

- Agile: backlog وepics وstories وsprints وreviews وimpediments وvelocity.
- Structured: requirements وphases وdeliverables وrisks وapprovals وgates وtraceability.

كبيري يمكن أن يقترح الطريقة المناسبة، لكن القرار النهائي للمطور أو المالك:

```bash
kvdf delivery recommend "Build CRM with pipeline, reporting, and integrations" --json
kvdf delivery choose agile --reason "Client wants iterative delivery"
```

## هيكل المستودع

```text
src/                 كود CLI
bin/                 ملف تشغيل kvdf
knowledge/           معرفة الحوكمة والتاسكات والتصميم وAgile والبيانات
packs/               generators وtemplates وprompt packs وexamples
integrations/        dashboard وGitHub وVS Code وmulti-AI
schemas/             runtime schemas وcontract schemas
docs/                الوثائق والتقارير وموقع الدوكس
cli/                 مرجع الأوامر
tests/               اختبارات CLI
```

حالة المشروع التشغيلية تكون داخل:

```text
.kabeeri/
```

## الوثائق

ابدأ من:

- [System Capabilities Reference](docs/SYSTEM_CAPABILITIES_REFERENCE.md)
- [CLI Command Reference](cli/CLI_COMMAND_REFERENCE.md)
- [Production State](docs/production/V1_CURRENT_STATE.md)
- [Docs Site](docs/site/index.html)

فتح موقع الوثائق:

```bash
kvdf docs open
kvdf docs serve --port 4180
```

## التطوير

تشغيل الاختبارات:

```bash
npm test
```

تشغيل smoke checks:

```bash
npm run test:smoke
```

تشغيل التحقق الكامل:

```bash
npm run check
```

## الترخيص

Kabeeri Vibe Developer Framework برنامج مفتوح المصدر تحت رخصة MIT.

راجع [LICENSE](LICENSE).

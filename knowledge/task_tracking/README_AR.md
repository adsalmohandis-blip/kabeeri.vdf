# تتبع المهام

هذا الفولدر يحدد طبقة تتبع المهام داخل **Kabeeri Vibe Developer Framework**.

الفولدر الحالي بدأ كملف بسيط جدًا، وهذه النسخة تحوله إلى نظام عملي لتتبع مهام التطوير بالذكاء الاصطناعي من الفكرة إلى المراجعة والإغلاق.

## الهدف

الهدف من `task_tracking/` هو مساعدة مطور الذكاء الاصطناعي على تنفيذ المشروع في مهام صغيرة قابلة للمراجعة بدل طلب بناء المنتج بالكامل من AI مرة واحدة.

يربط بين:

```text
مستندات المشروع
→ Prompt Packs
→ مهام تنفيذ
→ تنفيذ AI
→ مراجعة بشرية
→ قبول
→ Commit
→ إغلاق GitHub Issue
```

## ما وظيفة هذا الفولدر؟

يوفر هذا الفولدر:

- صيغة موحدة للمهمة.
- حالات واضحة للمهمة.
- مثال JSON للمهمة.
- Schema قابل للتطوير.
- Checklist للمراجعة.
- قالب لتسجيل تنفيذ AI.
- مثال مهمة يمكن نسخه داخل GitHub Issue.

## ما الذي لا يفعله؟

هذا الفولدر لا يستبدل:

- GitHub Issues
- GitHub Projects
- Jira
- Linear
- Trello

هو فقط صيغة داخل الفريمورك يمكن استخدامها داخل هذه الأدوات.

## طريقة العمل المقترحة على GitHub

```text
1. افتح GitHub Issue.
2. أضف Label مناسب.
3. اربطها بالـ Milestone.
4. أضفها إلى GitHub Project.
5. ضعها في Todo.
6. عند بداية العمل انقلها إلى In Progress.
7. استخدم TASK_TEMPLATE.md لتعريف المهمة.
8. استخدم Prompt Pack المناسب إذا كان هناك تنفيذ برمجي.
9. استخدم AI_EXECUTION_LOG_TEMPLATE.md بعد تنفيذ AI.
10. استخدم TASK_REVIEW_CHECKLIST.md قبل الإغلاق.
11. اعمل Commit و Push.
12. انقل الكارد إلى Done.
13. اقفل الـ Issue.
```

## حالات المهمة

```text
todo
in_progress
blocked
review
done
closed
```

## قاعدة استخدام AI

انسخ هذه التعليمات دائمًا مع أي مهمة:

```text
You are working inside Kabeeri Vibe Developer Framework.
Implement only this task.
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
List changed files.
List checks/tests to run.
Stop after completing this task.
```

## أمر Git المقترح

```bash
git add task_tracking
git commit -m "Define first task tracking format for v0.1.1

Closes #6"
git push
```

## الحالة

صيغة تأسيسية لتتبع المهام للنسخة `v0.1.1`.

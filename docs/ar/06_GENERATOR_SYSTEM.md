# 06 — نظام الـ Generators

## الهدف

ملف الـ Generator هو ملف JSON يستطيع أي AI أو CLI أو أداة مستقبلية قراءته لإنشاء Skeleton مشروع.

## القاعدة الذهبية

Generator لا ينشئ ملفات تفصيلية كثيرة فاضية. ينشئ فقط:

- الفولدرات.
- ملف دليل المعمارية داخل index.
- ملف أسئلة داخل كل فولدر.

## أنواع Generators

### Lite

للمشاريع الصغيرة والسريعة.

### Standard

لأغلب تطبيقات SaaS و dashboards و marketplaces الصغيرة.

### Enterprise

للأنظمة الكبيرة متعددة الفرق والموديولات.

## حقول مقترحة داخل JSON

```json
{
  "framework": "Kabeeri Vibe Developer Framework",
  "profile": "standard",
  "language": "ar",
  "folders": [],
  "architecture_guide": {},
  "questionnaire_template": {},
  "rules": []
}
```

## قواعد مهمة

- كل فولدر يجب أن يحتوي على questionnaire.
- لا يتم إنشاء مستندات تفصيلية قبل الإجابات.
- يجب حفظ أسماء الفولدرات بنفس الترتيب.
- يجب دعم العربية والإنجليزية.

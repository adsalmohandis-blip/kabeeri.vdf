# 08 — تدفق توليد المستندات

## الفكرة

لا يتم توليد مستندات الفولدر من البداية وهي فارغة. يتم توليدها بعد إجابة ملف الأسئلة.

## التدفق

```text
Folder Questionnaire answered
→ send to AI
→ AI reads folder purpose and answers
→ AI generates Word/Markdown files for this folder only
→ user reviews
→ files saved in same folder
```

## تعليمات AI العامة عند استلام ملف أسئلة مجاب

- أنشئ ملفات هذا الفولدر فقط.
- لا تعدل فولدرات أخرى.
- استخدم إجابات المستخدم كمصدر رئيسي.
- إن وجدت نقصًا، أضف قسم “Assumptions and Questions”.
- لا تبدأ في كتابة كود.
- لا تضف مميزات غير مذكورة.
- اجعل الملفات قابلة للاستخدام لاحقًا في توليد Prompt Packs.

## الملفات الناتجة

كل فولدر له قائمة ملفات مقترحة. مثال Strategy:

```text
01_Product_Master_Summary.docx
02_Target_Users_And_Use_Cases.docx
03_Business_Model.docx
04_Pricing_And_Plans.docx
05_Go_To_Market_Plan.docx
```

مثال Database:

```text
01_Data_Objects_Map.docx
02_Tables_And_Relationships_Draft.docx
03_Data_Privacy_And_Access_Rules.docx
04_Seed_Data_Plan.docx
05_Database_AI_Handoff.docx
```

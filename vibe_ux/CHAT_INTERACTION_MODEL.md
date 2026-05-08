# Chat Interaction Model

Users can describe work in natural language. Kabeeri responds with questions, suggested tasks, warnings, and approval prompts.

## Response Flow

```text
User intent
-> intent classification
-> missing detail detection
-> suggested task cards
-> user edits or approves
-> governed execution
-> review and Owner verify when needed
```

## English Example

User: "Add admin-controlled theme colors."

Kabeeri suggests:

- Admin Frontend: Add theme settings screen.
- Backend: Add theme settings API.
- Database: Add theme settings storage.
- Acceptance: Validate contrast and preview changes.

## Arabic Example

User: "عايز أضيف نظام ألوان يتحكم فيه الأدمن من الداشبورد."

Kabeeri suggests:

- Admin Frontend: شاشة إعدادات الألوان.
- Backend: API لحفظ إعدادات الثيم.
- Database: جدول أو ملف إعدادات للثيم.
- Acceptance: مراجعة التباين والمعاينة قبل الحفظ.

## Approval Rule

Chat suggestions do not execute automatically. Execution requires approval when the task changes files, costs money, touches sensitive scope, or requires governed assignment.


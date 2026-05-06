# 10 — Task Tracking

## الهدف

منع ضياع التنفيذ مع AI.

## الحالات المقترحة

```text
pending
in_progress
ai_done
review_needed
verified
blocked
rejected
```

## حقول Task

```json
{
  "id": "T001",
  "title": "Create project skeleton",
  "status": "pending",
  "prompt_id": "P001",
  "folder": "05_EXECUTION_PLAN",
  "depends_on": [],
  "tests": [],
  "review_notes": ""
}
```

## القاعدة المهمة

AI يمكنه نقل المهمة إلى `ai_done`، لكن الإنسان فقط ينقلها إلى `verified`.

## لماذا؟

لأن AI ينفذ، لكن صاحب المشروع أو المراجع هو من يقبل.

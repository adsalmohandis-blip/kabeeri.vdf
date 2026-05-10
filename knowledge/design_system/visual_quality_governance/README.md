# Visual Quality Governance

This pack gives Kabeeri a measurable UI quality layer after implementation.
It complements the UI Execution Kit, Accessibility, Performance, Content, RTL,
and Motion packs.

Use it when recording or reviewing implemented UI:

- before Owner or client visual approval
- after frontend changes
- after applying a business UI template
- when comparing generated UI against a page spec
- when deciding whether a UI needs rework

Primary files:

- `VISUAL_QUALITY_RUBRIC.md` - scoring model for visual QA.
- `VISUAL_REVIEW_EVIDENCE.md` - evidence rules for screenshots and notes.
- `DESIGN_QA_CHECKLIST.md` - reviewer checklist.
- `REWORK_DECISION_RULES.md` - when to pass, rework, or block.

Runtime command:

```bash
kvdf design visual-review --page <page-spec-id> --screenshots desktop.png,mobile.png --checks responsive,states,accessibility,performance,content,motion,creative --decision pass
kvdf design governance --json
```


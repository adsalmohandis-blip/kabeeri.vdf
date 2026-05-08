# Codex Frontend Task Prompt Template

Use this prompt shape before asking Codex or another AI coding agent to implement frontend work.

## Required Context

- Approved design source ID:
- Approved text spec:
- Page spec:
- Component contracts:
- Design tokens:
- Allowed files:
- Forbidden files:
- Required states:
- Accessibility requirements:
- Visual acceptance checklist:

## Prompt

```text
Implement only the approved frontend spec below.

Do not implement directly from raw images, PDFs, links, screenshots, or reference websites.
Do not invent visual identity, colors, typography, layout patterns, or component variants.
Use the approved design tokens, page spec, and component contracts.
If a required visual detail is missing, stop and create a missing design note instead of guessing.

Approved source:
[paste source ID and snapshot reference]

Approved page spec:
[paste page spec]

Component contracts:
[paste relevant contracts]

Allowed files:
[list allowed files]

Forbidden files:
[list forbidden files]

Acceptance:
[paste UI acceptance criteria]
```


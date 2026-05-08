# Delivery Mode Selection Guide

This is the canonical v2 selection guide. The earlier file [SELECTION_GUIDE.md](SELECTION_GUIDE.md) remains valid and is preserved for compatibility.

## Quick Decision

| Choose | When |
| --- | --- |
| Structured Delivery | Requirements are known, scope is complex, compliance matters, or the owner wants full planning before implementation. |
| Agile Delivery | Requirements are uncertain, feedback cycles are important, the team wants sprint delivery, or MVP learning matters more than complete upfront planning. |

## Non-Negotiable Rules

- Choose one primary mode per project or version.
- Do not call v1 "Waterfall"; v1 is the foundation that Structured and Agile both reuse.
- Both modes must keep task provenance, acceptance criteria, and review gates.
- Switching modes mid-project requires a documented decision and migration note.

## Output

Record the selected mode in `.kabeeri/project.json` when a project workspace is initialized.

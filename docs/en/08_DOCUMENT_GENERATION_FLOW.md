# 08 - Document Generation Flow

Kabeeri document generation should be controlled and traceable.

## Flow

```text
questionnaire answers
-> focused folder or system document
-> review
-> task candidates
-> implementation prompts
```

## Rules

- Generate documents from answered context, not guesses.
- Keep generated documents tied to a folder, capability, or task.
- Do not generate final implementation prompts before scope is clear.
- Preserve the owner decision trail when a document changes task scope.

## Good Output

Good generated documents explain assumptions, open questions, scope boundaries,
and next tasks. They should not pretend unknown information is confirmed.

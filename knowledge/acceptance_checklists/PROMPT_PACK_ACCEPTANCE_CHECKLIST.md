# Prompt Pack Acceptance Checklist

Use this checklist when reviewing a prompt pack.

## Required files

```text
- [ ] README.md exists.
- [ ] 00_*_PROMPT_PACK_INDEX.md exists.
- [ ] Usage or safety rules exist.
- [ ] Project context prompt exists.
- [ ] Structure/setup prompt exists.
- [ ] Testing/review prompt exists.
- [ ] Release handoff prompt exists.
- [ ] prompt_pack_manifest.json exists.
```

## Scope control

```text
- [ ] Pack says it is not an installer.
- [ ] Pack tells AI to work one prompt at a time.
- [ ] Pack prevents building the whole project at once.
- [ ] Pack includes allowed/forbidden file guidance.
```

## Beginner-friendly review

```text
- [ ] Questions are understandable for non-experts.
- [ ] Technical questions include help notes when needed.
- [ ] Prompts avoid heavy jargon where possible.
- [ ] Prompt order is logical.
```

## Safety

```text
- [ ] Secrets warning exists.
- [ ] Stack-specific safety rules exist where needed.
- [ ] Production-impacting actions require approval.
```

## Decision

```text
accepted / needs_changes / blocked / rejected
```

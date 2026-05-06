# Contributing to Kabeeri Vibe Developer Framework

## Principle

This project is not only a file template. It is a repeatable method for AI-driven software development. Contributions must improve clarity, repeatability, safety, or productivity for vibe developers.

## Contribution types

1. Documentation improvements.
2. New questionnaire templates.
3. Better generator JSON formats.
4. New prompt packs for frameworks such as Laravel, .NET, Next.js, WordPress, Django, or Flutter.
5. Task tracking improvements.
6. Acceptance checklist improvements.
7. Examples and case studies.
8. Translations.

## Rules

- Keep beginner language clear and non-technical where possible.
- Do not add vague questions to questionnaires.
- Technical questions must include guidance or choices.
- Every prompt pack must include review and test instructions.
- Every generated output must have an acceptance checklist.
- Do not mix core, production, and extension layers.

## Suggested pull request format

```text
Type: docs | questionnaire | generator | prompt-pack | schema | example | bugfix
Layer: core | production | extension | tooling | docs
Why this change is needed:
What files changed:
How it was tested:
```

## Maintainer review checklist

- Is the language beginner-friendly?
- Does the change reduce ambiguity?
- Does it preserve the framework lifecycle?
- Does it avoid forcing a specific coding framework too early?
- Is it compatible with AI tools and human review?

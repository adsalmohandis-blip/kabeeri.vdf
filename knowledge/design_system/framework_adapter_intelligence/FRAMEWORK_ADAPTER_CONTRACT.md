# Framework Adapter Contract

## Purpose

Every frontend implementation should have one selected framework adapter before code generation.

The adapter must define:

- framework key, package, version, and install command;
- required imports or build setup;
- token mapping strategy;
- component mapping for the selected screen composition;
- icon strategy;
- state implementation guidance;
- accessibility, RTL, performance, and motion notes;
- compatibility warnings.

## Selection Rules

- Use the framework explicitly requested by the developer when it is approved.
- Otherwise use the first approved UI library from the UI/UX Advisor pattern.
- Do not mix two full component frameworks on the same surface unless a migration decision exists.
- Tailwind-dependent adapters require an approved Tailwind setup.
- React component adapters require a React-compatible frontend.
- shadcn/ui is owned source copied into the app, not a black-box component package.

## Prompt Rule

Implementation prompts should reference:

- adapter key;
- token set ID or token file;
- composition ID;
- business pattern;
- relevant recipe.

Do not paste full framework documentation into prompts.

## Review Rule

Before delivery, confirm:

- selected adapter is compatible with the frontend stack;
- no unapproved framework was added;
- tokens are mapped through the adapter instead of raw values;
- components come from the adapter map or a documented project component contract;
- imports and build setup are documented;
- RTL, accessibility, performance, and motion notes are handled.


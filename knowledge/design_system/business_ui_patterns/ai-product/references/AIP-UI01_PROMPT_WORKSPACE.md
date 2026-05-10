# AIP-UI01 Prompt Workspace

## Identity

- Design code: `AIP-UI01`
- Business: AI product
- View: prompt workspace
- Style: focused input with examples and clear generation controls
- Dashboard reference: `ADMIT-ADB05`

## Core Pattern

```text
prompt input
templates/suggestions
parameters
generate action
usage visibility
```

## Required Sections

- prompt textarea;
- suggested prompts or templates;
- optional parameters;
- upload action when needed;
- generate button;
- usage or credit indicator.

## Component Contracts

- `PromptConsole`
- `SuggestedPrompt`
- `ParameterPanel`
- `UploadButton`
- `GenerateButton`
- `UsageIndicator`

## States

- first run;
- ready;
- processing;
- validation error;
- usage limit;
- upload failed.

## Design Rules

- User must know what to type.
- Generate action is clear and disabled when invalid.
- Usage limits are visible before failure.

## Motion

- `BALANCED_MOTION`
- Prompt suggestions can reveal subtly.
- No fake long thinking animation.

## Task Seed

- Build AI prompt workspace with suggestions, upload, usage, validation, processing, and error states.


# AIP-UI02 Streaming Response

## Identity

- Design code: `AIP-UI02`
- Business: AI product
- View: streaming response and generated result
- Style: readable output with trustworthy processing state

## Core Pattern

```text
processing indicator
streaming output
copy/save/regenerate
feedback
version history
```

## Required Sections

- processing state;
- output region;
- copy, save, regenerate actions;
- feedback controls;
- version or history hint.

## Component Contracts

- `StreamingIndicator`
- `GeneratedResult`
- `CopyButton`
- `RegenerateButton`
- `SaveButton`
- `FeedbackActions`

## States

- thinking/processing;
- streaming;
- ready;
- empty result;
- error;
- regenerated.

## Design Rules

- Generated text must remain easy to read.
- Copy and regenerate are available when output exists.
- Processing must be truthful and not theatrical.

## Motion

- `BALANCED_MOTION`
- Streaming cursor or subtle indicator is allowed.
- Reduced motion uses static progress/status text.

## Task Seed

- Build streaming result view with processing, output actions, feedback, error, and empty result states.


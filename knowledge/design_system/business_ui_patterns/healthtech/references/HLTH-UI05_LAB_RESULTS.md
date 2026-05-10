# HLTH-UI05 Lab Results

## Identity

- Design code: `HLTH-UI05`
- Business: healthtech
- View: lab results
- Style: readable results with reference ranges and clinician notes

## Layout Anatomy

```text
result summary
test groups
values/ranges
flags
clinician notes
download/share
```

## UX Goals

- Make results understandable.
- Highlight abnormal values responsibly.
- Provide next steps or clinician notes.

## Required Components

- `ResultSummary`
- `TestGroup`
- `ResultValue`
- `RangeIndicator`
- `ClinicianNote`
- `DownloadButton`

## Required States

- pending;
- normal;
- abnormal;
- critical;
- unavailable;
- downloaded.

## Data Requirements

- test name;
- value;
- unit;
- reference range;
- flag;
- clinician note.

## Accessibility

- Abnormal status is text plus icon.
- Tables have headers.
- Critical results do not rely on color only.

## Motion

- `MINIMAL_MOTION`
- No decorative motion.
- Critical information appears immediately.

## Common Mistakes

- Values without units/ranges.
- Scary language without context.
- Hiding clinician notes.

## Acceptance Criteria

- Results are readable, contextual, and status-clear.

## Task Seed

- Build lab results with grouped tests, values, ranges, notes, pending/unavailable states, and download.


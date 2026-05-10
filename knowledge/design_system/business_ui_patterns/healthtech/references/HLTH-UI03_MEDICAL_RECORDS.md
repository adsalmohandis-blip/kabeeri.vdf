# HLTH-UI03 Medical Records

## Identity

- Design code: `HLTH-UI03`
- Business: healthtech
- View: medical records
- Style: structured readable health data

## Layout Anatomy

```text
record categories
filters
record list
detail view
download/share
```

## UX Goals

- Let users inspect health records safely.
- Group records by mental model.
- Support download/share when allowed.

## Required Components

- `RecordCategoryNav`
- `RecordFilter`
- `RecordList`
- `RecordDetail`
- `DownloadButton`
- `ShareControl`

## Required States

- no records;
- loading;
- restricted;
- shared;
- download failed.

## Data Requirements

- record type;
- date;
- provider;
- summary;
- attachment/result.

## Accessibility

- Records use headings and labels.
- Download/share controls are explicit.
- Medical abbreviations should include explanations when possible.

## Motion

- `MINIMAL_MOTION`
- Detail expand/collapse can transition.
- Do not animate medical text heavily.

## Common Mistakes

- Dense data without grouping.
- Records hidden behind unclear icons.
- No permission or sharing explanation.

## Acceptance Criteria

- Records are grouped, readable, and permission-aware.

## Task Seed

- Build medical records view with categories, filters, detail, download/share, and restricted states.


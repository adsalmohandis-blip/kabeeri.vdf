# AIP-UI03 File Analysis

## Identity

- Design code: `AIP-UI03`
- Business: AI product
- View: upload and document analysis
- Style: file-first workflow with progress and result summary

## Core Pattern

```text
file upload
requirements
progress
analysis summary
extracted insights
download/share
```

## Required Sections

- upload dropzone;
- accepted file rules;
- upload progress;
- analysis progress;
- results summary;
- download or export actions.

## Component Contracts

- `FileDropzone`
- `FileRules`
- `UploadProgress`
- `AnalysisProgress`
- `InsightSummary`
- `ExportButton`

## States

- empty upload;
- file selected;
- uploading;
- analyzing;
- unsupported file;
- failed analysis;
- result ready.

## Design Rules

- File requirements are visible before upload.
- Progress distinguishes upload from analysis.
- Failed analysis offers retry and support path.

## Motion

- `BALANCED_MOTION`
- Progress can animate.
- Do not loop decorative analysis effects.

## Task Seed

- Build file analysis flow with upload rules, progress, insight summary, failure, retry, and export.


# LMS-UI05 Progress Certificate

## Identity

- Design code: `LMS-UI05`
- Business: lms
- View: progress and certificate
- Style: achievement summary with next learning path

## Layout Anatomy

```text
progress summary
module completion
certificate preview
next recommendations
download/share
```

## UX Goals

- Show progress clearly.
- Celebrate completion appropriately.
- Guide next learning.

## Required Components

- `ProgressSummary`
- `ModuleCompletionList`
- `CertificatePreview`
- `DownloadButton`
- `NextCourseRecommendation`

## Required States

- in progress;
- completed;
- certificate locked;
- certificate ready;
- download failed.

## Data Requirements

- course progress;
- modules;
- certificate status;
- recommendations;
- completion date.

## Accessibility

- Progress has text values.
- Certificate preview has accessible description.
- Download action is labeled.

## Motion

- `BALANCED_MOTION`
- Completion feedback can be expressive but brief.
- Avoid confetti in serious professional contexts unless requested.

## Common Mistakes

- Progress bar without module details.
- Certificate action hidden.
- No next learning path.

## Acceptance Criteria

- Learner understands progress, certificate status, and next step.

## Task Seed

- Build progress/certificate page with module list, certificate preview, download, and next recommendations.


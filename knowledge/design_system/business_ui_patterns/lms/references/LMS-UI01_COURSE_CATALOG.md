# LMS-UI01 Course Catalog

## Identity

- Design code: `LMS-UI01`
- Business: lms
- View: course catalog
- Style: discoverable learning grid

## Layout Anatomy

```text
search/filter
course cards
categories
progress/level
empty states
```

## UX Goals

- Help learners find relevant courses.
- Show level, duration, and progress.
- Support search and filtering.

## Required Components

- `CourseSearch`
- `CategoryFilter`
- `CourseCard`
- `LevelBadge`
- `ProgressIndicator`
- `EmptyState`

## Required States

- loading;
- no courses;
- filtered empty;
- enrolled;
- completed.

## Data Requirements

- course title;
- duration;
- level;
- instructor;
- progress;
- rating.

## Accessibility

- Cards have descriptive links.
- Progress includes text.
- Filter controls are labeled.

## Motion

- `BALANCED_MOTION`
- Course card hover can be subtle.
- Avoid motion near reading content.

## Common Mistakes

- Course cards with no duration/level.
- Progress shown by color only.
- Filters too hidden.

## Acceptance Criteria

- Learner can compare courses quickly.

## Task Seed

- Build course catalog with search, filters, cards, progress, and empty states.


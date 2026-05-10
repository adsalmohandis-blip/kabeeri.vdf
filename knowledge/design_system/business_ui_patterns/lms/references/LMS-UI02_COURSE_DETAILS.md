# LMS-UI02 Course Details

## Identity

- Design code: `LMS-UI02`
- Business: lms
- View: course details
- Style: course preview and enrollment decision

## Layout Anatomy

```text
course hero
overview
curriculum
instructor
reviews
enroll/continue CTA
```

## UX Goals

- Explain what the learner will gain.
- Show curriculum and commitment.
- Encourage enrollment or continuation.

## Required Components

- `CourseHero`
- `CurriculumList`
- `InstructorCard`
- `ReviewSummary`
- `EnrollButton`
- `ContinueButton`

## Required States

- not enrolled;
- enrolled;
- in progress;
- completed;
- enrollment error.

## Data Requirements

- outcomes;
- lessons/modules;
- instructor;
- duration;
- requirements;
- reviews.

## Accessibility

- Curriculum is navigable.
- CTA labels match state.
- Video preview has captions if present.

## Motion

- `BALANCED_MOTION`
- Curriculum accordion can transition.
- Avoid autoplay distractions.

## Common Mistakes

- No learning outcomes.
- Hidden curriculum.
- CTA inconsistent with enrollment state.

## Acceptance Criteria

- User can decide whether to enroll or continue.

## Task Seed

- Build course details with outcomes, curriculum, instructor, reviews, and enrollment states.


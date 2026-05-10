# LMS-UI03 Lesson Player

## Identity

- Design code: `LMS-UI03`
- Business: lms
- View: lesson page/player
- Style: focused learning workspace

## Layout Anatomy

```text
lesson sidebar
video/content area
notes/resources
progress
next lesson
```

## UX Goals

- Reduce distraction.
- Keep progress visible.
- Make next lesson easy.

## Required Components

- `LessonSidebar`
- `VideoPlayer`
- `ContentPanel`
- `ResourceList`
- `ProgressBar`
- `NextLessonButton`

## Required States

- loading lesson;
- completed;
- locked;
- offline/resource error;
- no resources.

## Data Requirements

- lesson title;
- content/video;
- resources;
- progress;
- next lesson;
- completion status.

## Accessibility

- Video controls accessible.
- Captions/transcripts when available.
- Sidebar keyboard navigable.

## Motion

- `MINIMAL_MOTION`
- Progress update can animate.
- No constant animation near lesson content.

## Common Mistakes

- Too many panels competing with lesson.
- Next lesson hidden.
- Completion state unclear.

## Acceptance Criteria

- Learner can study, mark progress, and continue without distraction.

## Task Seed

- Build lesson player with sidebar, content, resources, progress, completion, and next action.


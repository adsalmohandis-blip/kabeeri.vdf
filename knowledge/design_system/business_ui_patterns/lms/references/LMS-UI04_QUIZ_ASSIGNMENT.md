# LMS-UI04 Quiz Assignment

## Identity

- Design code: `LMS-UI04`
- Business: lms
- View: quiz or assignment
- Style: clear assessment workflow

## Layout Anatomy

```text
instructions
question/task
answer input
progress
submit
feedback/result
```

## UX Goals

- Make instructions clear.
- Reduce assessment anxiety.
- Provide useful feedback.

## Required Components

- `InstructionPanel`
- `QuestionCard`
- `AnswerInput`
- `QuizProgress`
- `SubmitButton`
- `FeedbackPanel`

## Required States

- not started;
- answering;
- validation error;
- submitted;
- correct/incorrect;
- graded.

## Data Requirements

- instructions;
- questions/tasks;
- answers;
- score;
- feedback;
- due date.

## Accessibility

- Inputs have labels.
- Feedback uses text plus icon.
- Timer warnings are accessible if timed.

## Motion

- `BALANCED_MOTION`
- Answer feedback can be subtle.
- Avoid distracting motion during answering.

## Common Mistakes

- Feedback only color-coded.
- Submit without review.
- Unclear save state.

## Acceptance Criteria

- Learner understands task, progress, submission, and feedback.

## Task Seed

- Build quiz/assignment view with instructions, inputs, progress, validation, submit, and feedback states.


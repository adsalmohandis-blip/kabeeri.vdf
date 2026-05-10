# Rework Decision Rules

## Pass

Use `pass` when:

- no acceptance blocker remains
- screenshots cover required viewports
- critical states are covered
- accessibility and contrast are reviewed
- deviations are acceptable or minor

## Needs Rework

Use `needs_rework` when:

- visual quality score is below 75%
- required states are incomplete
- copy is unclear but the workflow is still usable
- mobile or desktop has polish issues
- performance, motion, or content checks are missing on a relevant screen

## Blocked

Use `blocked` when:

- implementation conflicts with approved page spec
- critical action is unclear or unsafe
- forms cannot be submitted or recovered from
- destructive action lacks consequence clarity
- layout is unusable on mobile or desktop
- accessibility failure blocks core workflow
- screenshots or page spec evidence are missing


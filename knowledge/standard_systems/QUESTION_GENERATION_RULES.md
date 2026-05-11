# Question Generation Rules

Do not search the repository tree to discover question intent. Use the
questionnaire flow and capability list first, then ask the smallest helpful
question.

- Required areas produce direct questions.
- Unknown areas produce short helper questions.
- Deferred areas produce roadmap notes, not implementation tasks.
- Not applicable areas produce no tasks.
- Optional areas stay visible for Owner review.

Every question that generates a task must record:

- `question_id`
- `answer_id`
- `system_area_key`
- `source_mode`
- `source_reason`

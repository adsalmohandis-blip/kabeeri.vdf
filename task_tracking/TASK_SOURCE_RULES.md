# Task Source Rules

Every task must trace back to a source.

## Source Types

- manual
- questionnaire_answer
- generated_document
- user_story
- epic
- sprint_planning
- acceptance_review
- bug_report
- github_issue
- ai_suggestion
- existing_project_scan
- migration_report
- production_check
- publish_check

## Source Modes

| Mode | Meaning |
| --- | --- |
| direct | The source directly asks for this task. |
| indirect | The source implies the task. |
| derived | The task is derived from multiple sources. |
| suggested | AI or reviewer suggested it; approval required. |
| required | The task is mandatory for policy, release, or safety. |

## Rule

Tasks with missing, vague, or unverifiable source stay unready.

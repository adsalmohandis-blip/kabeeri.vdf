# Task Intake Template

```yaml
task_id:
title:
delivery_mode: structured | agile
intake_mode: new_project | existing_kabeeri | existing_non_kabeeri
workstream:
source:
  type:
  reference:
  question_id:
  answer_id:
  source_mode: direct | indirect | derived | suggested | required
creator:
assignee:
reviewer:
priority: low | medium | high
scope:
  included:
  excluded:
allowed_files:
forbidden_files:
dependencies:
assessment_id:
assessment_status:
assessment_summary:
acceptance_criteria:
execution_summary:
resume_steps:
required_inputs:
expected_outputs:
do_not_change:
verification_commands:
rollback_notes:
ai_usage_budget:
  max_input_tokens:
  max_output_tokens:
  max_total_tokens:
  max_cost:
```

Use this template before creating a GitHub Issue, local `.kabeeri` task, or AI execution handoff.

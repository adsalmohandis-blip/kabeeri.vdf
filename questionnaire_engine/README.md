# Adaptive Questionnaire Engine

The v5 questionnaire engine asks fewer questions first, activates only relevant system areas, and then expands when the project answers require deeper coverage.

Flow:

```text
Entry Questions -> Project Type Detection -> System Area Activation -> Grouped Questionnaires -> Conditional Deep Questions -> Coverage Review -> Missing Answers Only -> Generated Docs / Tasks
```

Runtime support is available through:

```bash
kvdf questionnaire flow
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
```

Answers are stored in `.kabeeri/questionnaires/answers.json`. Coverage and missing answer reports are generated into `.kabeeri/questionnaires/coverage_matrix.json` and `.kabeeri/questionnaires/missing_answers_report.json`.

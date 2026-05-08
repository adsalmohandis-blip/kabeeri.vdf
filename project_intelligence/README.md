# Kabeeri VDF v5.0.0 Project Intelligence

v5.0.0 merges three layers:

- Adaptive Questionnaire Flow
- System Capability Map
- Project Intelligence, Professional Intake, and Trust Layer

Implemented runtime entrypoints:

```bash
kvdf capability list
kvdf capability map
kvdf questionnaire flow
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
kvdf memory add --type decision --text "Use PostgreSQL"
kvdf memory summary
```

Generated workspace files:

```text
.kabeeri/questionnaires/answers.json
.kabeeri/questionnaires/answer_sources.json
.kabeeri/questionnaires/coverage_matrix.json
.kabeeri/questionnaires/missing_answers_report.json
.kabeeri/memory/*.jsonl
.kabeeri/version_compatibility.json
.kabeeri/migration_state.json
```

The dashboard and VS Code surfaces remain views over `.kabeeri`; they are not the source of truth.

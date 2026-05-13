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
kvdf adr create --title "Use PostgreSQL" --context "Need relational consistency" --decision "Use PostgreSQL for v1"
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500
kvdf ai-run report
kvdf ai-run provenance
```

Generated workspace files:

```text
.kabeeri/questionnaires/answers.json
.kabeeri/questionnaires/answer_sources.json
.kabeeri/questionnaires/coverage_matrix.json
.kabeeri/questionnaires/missing_answers_report.json
.kabeeri/memory/*.jsonl
.kabeeri/adr/records.json
.kabeeri/ai_runs/*.jsonl
.kabeeri/interactions/post_work_captures.json
.kabeeri/version_compatibility.json
.kabeeri/migration_state.json
```

The dashboard and VS Code surfaces remain views over `.kabeeri`; they are not the source of truth.

See `ADR_AI_RUN_HISTORY_RUNTIME.md` for the formal ADR and AI run review workflow.
See `AI_SESSION_CONTRACT_RUNTIME.md` for governed session contracts, scope snapshots, and handoff evidence.

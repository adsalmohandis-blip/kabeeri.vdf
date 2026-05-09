# Adaptive Questionnaire Engine

The v5 questionnaire engine asks fewer questions first, activates only relevant system areas, and then expands when the project answers require deeper coverage.

Flow:

```text
Entry Questions -> Project Type Detection -> System Area Activation -> Grouped Questionnaires -> Conditional Deep Questions -> Coverage Review -> Missing Answers Only -> Generated Docs / Tasks
```

Runtime support is available through:

```bash
kvdf questionnaire flow
kvdf questionnaire plan "Build ecommerce store with Laravel backend React frontend payments and mobile app"
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
```

Answers are stored in `.kabeeri/questionnaires/answers.json`. Coverage and missing answer reports are generated into `.kabeeri/questionnaires/coverage_matrix.json` and `.kabeeri/questionnaires/missing_answers_report.json`.

`kvdf questionnaire plan` is the adaptive intake bridge. It uses:

- Product Blueprints to infer application type, channels, modules, pages, entities, and risks.
- Framework prompt packs to ask stack-specific backend, frontend, and mobile questions.
- Data Design Blueprint to ask database, tenancy, entity, constraint, and migration questions.
- UI/UX Advisor to ask design source, page pattern, component, SEO/GEO, dashboard, and mobile UX questions.
- Delivery Mode Advisor to ask whether Agile or Structured is the right methodology.

The generated plan is stored in `.kabeeri/questionnaires/adaptive_intake_plan.json` and should be used before generating tasks from missing coverage.

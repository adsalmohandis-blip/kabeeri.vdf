# Token Budget Rules

The canonical token budget governance policy now lives in:

- [../governance/TOKEN_BUDGET_RULES.md](../governance/TOKEN_BUDGET_RULES.md)

This file remains as an AI Cost Control pointer because budget rules are still
part of cost-aware AI execution.

Use this folder for:

- context pack rules
- cost preflight templates
- model routing rules
- random usage detection
- sprint cost reporting
- cost saving strategies

Use `governance/TOKEN_BUDGET_RULES.md` for:

- budget thresholds
- over-budget approval rules
- audit requirements
- token budget policy connected to task access tokens and AI usage sessions

The runtime `usage summary` now also emits a `budget_pressure` rollup so the
current warning, attention, and over-budget tasks stay visible in state as well
as in the report output.

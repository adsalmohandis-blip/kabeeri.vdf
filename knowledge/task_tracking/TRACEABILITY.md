# Traceability Layer

The traceability layer ties together the evidence chain for governed work:

- task source and scope
- task assessment readiness
- verification commands and checks
- ADR decisions
- AI run history
- docs source-of-truth validation

Use `kvdf trace report` to generate the current report and inspect open gaps.
Use `kvdf trace status` for the same data in summary form.

The report is written to:

- `.kabeeri/reports/traceability_report.json`

The report is meant to be a working operational view, not a historical archive.
If the report shows gaps, prefer adding the missing links or evidence before
moving the task forward.

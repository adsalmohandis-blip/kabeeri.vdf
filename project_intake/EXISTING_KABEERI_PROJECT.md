# Existing Kabeeri Project Intake

Use this file when a project already has Kabeeri files and needs to upgrade or adopt newer rules.

## Required Checks

- Current Kabeeri version.
- Existing `.kabeeri/project.json` or equivalent metadata.
- Existing generator/profile.
- Existing delivery mode, or default to Structured with an audit note.
- Existing tasks and acceptance records.
- Migration risk and backup availability.

## Flow

1. Read current project metadata.
2. Create a compatibility report.
3. Back up current project state.
4. Add missing metadata without deleting old files.
5. Mark old decisions, tasks, and answers as preserved.
6. Revalidate task governance and provenance fields.

## Acceptance Check

An existing Kabeeri project intake is valid when the upgrade path is documented, old state is preserved, and new rules are added without silently changing prior decisions.

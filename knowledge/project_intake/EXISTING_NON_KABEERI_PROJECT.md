# Existing Non-Kabeeri Project Intake

Use this file when adopting Kabeeri around an existing codebase.

## Core Principle

Adoption adds a Kabeeri management layer. It must not rewrite, move, or refactor existing application code during intake.

## Flow

1. Scan repository structure.
2. Detect stack, app boundaries, database, tests, and deployment clues.
3. Create an adoption report.
4. Initialize `.kabeeri/project.json` with `intake_mode: existing_non_kabeeri`.
5. Map existing features to Kabeeri workstreams.
6. Create adoption tasks with source `existing_project_scan`.
7. Start new work through Kabeeri task governance.

## Acceptance Check

Adoption is valid when the existing code remains untouched, the scan report exists, and all adoption tasks trace back to the scan.

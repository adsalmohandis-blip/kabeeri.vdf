# Command Abstraction Rules

Command abstraction maps UI actions to internal command execution and structured results.

## UI Action Registry Fields

- action ID
- label
- internal command
- required permission
- confirmation requirement
- expected result shape
- safe retry behavior
- audit requirement

## Common Actions

- create task
- approve task
- assign task
- issue token
- create lock
- estimate cost
- generate context pack
- capture changes
- review task
- Owner verify
- reject task
- export dashboard

## Error Translation

UI should translate technical errors into actionable messages with a next step. Raw stack traces and terminal noise should be hidden unless the user opens details.

## Confirmation Rule

Dangerous actions require plain-language confirmation: overwrite, migration, publish, owner transfer, budget override, broad file changes, and GitHub mutation.


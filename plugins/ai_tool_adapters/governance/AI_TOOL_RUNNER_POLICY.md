# AI Tool Runner Policy

`ai_tool_adapter` may run a local tool only when a valid run contract has been
supplied and the registry entry has been explicitly enabled.

## Policy Summary

- execution is disabled by default for every tool
- `multi_ai_governance` will later create assignments and run contracts
- this plugin does not decide task authority
- this plugin does not assign work
- this plugin does not execute arbitrary shell commands
- this plugin only runs the contracted command for the selected tool
- `--confirm` is required for any execution attempt
- every run writes evidence to `.kabeeri/ai_tool_runs.jsonl`

## Required Contract Checks

A run contract must:

- include `contract_id`
- include `tool_id`
- include `command`
- include `working_directory`
- keep `timeout_seconds` at or below 1800
- match the registered tool command or resolved path
- include the command in `allowed_commands`
- avoid forbidden command tokens
- use a working directory that exists inside the repo root

## Evidence Logging

Each run attempt records:

- run id
- contract id
- tool id
- task id and assignment id when present
- status
- command and argument count
- working directory
- timestamps
- duration
- exit code or timeout status
- redaction markers for secret-like output

## Safety Rules

- do not enable execution implicitly
- do not bypass contract validation
- do not use `shell=true`
- do not print secrets in stdout/stderr excerpts
- do not treat a run contract as an assignment contract
- leave authority to `multi_ai_governance`

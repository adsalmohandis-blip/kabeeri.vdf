# KVDF CLI Commands

This file tracks the `kvdf` CLI command structure. The current executable entrypoint is `bin/kvdf.js`; see `CLI_COMMAND_REFERENCE.md` for implemented command behavior.

## Main command

```bash
kvdf
```

## Help

```bash
kvdf --help
kvdf <command> --help
```

## Version

```bash
kvdf --version
```

---

# 1. init

Create a Kabeeri VDF workspace inside an existing repository.

## Command

```bash
kvdf init
```

## Options

```bash
kvdf init --profile lite
kvdf init --profile standard
kvdf init --profile enterprise
kvdf init --lang en
kvdf init --lang ar
kvdf init --lang both
```

## Purpose

Prepare the framework folders and starting files.

## Should create or update

```text
docs/
generators/
templates/
questionnaires/
prompt_packs/
task_tracking/
acceptance_checklists/
schemas/
examples/
```

## Should not do

```text
- install app frameworks
- create production application code
- overwrite user files without confirmation
```

---

# 2. generate

Generate framework planning structure for a chosen profile.

## Command

```bash
kvdf generate
```

## Examples

```bash
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
```

## Purpose

Copy the correct generator/template files for the selected project size.

## Future behavior

```text
Read generators/lite.json
Read generators/standard.json
Read generators/enterprise.json
Create the expected folder skeleton
Add starter README files
Add questionnaire files
```

---

# 3. questionnaire

Create or manage questionnaire files.

## Commands

```bash
kvdf questionnaire list
kvdf questionnaire create --profile lite
kvdf questionnaire create --profile standard
kvdf questionnaire create --profile enterprise
kvdf questionnaire status
```

## Purpose

Help users generate and complete beginner-friendly questions.

## Should support

```text
core
production
extension
```

Example:

```bash
kvdf questionnaire create --group core
```

---

# 4. prompt-pack

List or copy prompt packs.

## Commands

```bash
kvdf prompt-pack list
kvdf prompt-pack show laravel
kvdf prompt-pack use laravel
kvdf prompt-pack use nextjs
kvdf prompt-pack validate laravel
```

## Purpose

Help users choose the correct implementation-stack prompt pack.

## Should not do

```text
- install Laravel
- install Next.js
- install dependencies
- generate real app code
```

---

# 5. task

Create and manage task tracking files.

## Commands

```bash
kvdf task create
kvdf task list
kvdf task status
kvdf task review
```

## Examples

```bash
kvdf task create --title "Create first auth prompt" --type prompt-pack
kvdf task create --issue 9 --milestone v0.1.1
```

## Purpose

Help users keep AI work small and reviewable.

## Should use

```text
task_tracking/TASK_TEMPLATE.md
task_tracking/task.schema.json
```

---

# 6. acceptance

Create or run acceptance checklist scaffolds.

## Commands

```bash
kvdf acceptance create
kvdf acceptance review
kvdf acceptance list
```

## Examples

```bash
kvdf acceptance create --type task-completion --issue 9
kvdf acceptance create --type prompt-pack --pack laravel
kvdf acceptance create --type release --version v0.1.1
```

## Purpose

Help users review AI output before accepting it.

## Should use

```text
acceptance_checklists/ACCEPTANCE_CHECKLIST_TEMPLATE.md
acceptance_checklists/acceptance.schema.json
```

---

# 7. example

Show or copy example workflows.

## Commands

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
kvdf example copy lite
```

## Purpose

Help beginners understand how to use Kabeeri VDF.

---

# 8. validate

Validate framework files.

## Commands

```bash
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
```

## Purpose

Check JSON schemas, required files, and basic folder structure.

## Should validate

```text
- valid JSON
- required folder names
- required README files
- manifest files
- task schema examples
- acceptance schema examples
```

---

# 9. release

Prepare release files and check milestone readiness.

## Commands

```bash
kvdf release check
kvdf release notes --version v0.1.1
kvdf release checklist --version v0.1.1
```

## Purpose

Help prepare GitHub Release notes and release acceptance review.

## Should not do in early version

```text
- publish GitHub Releases automatically
- push tags automatically
- change remote repository settings
```

---

# 10. doctor

Check the local Kabeeri VDF workspace health.

## Command

```bash
kvdf doctor
```

## Checks

```text
- required folders exist
- README files exist
- JSON files are valid
- known manifests exist
- no obvious placeholder files remain
```

---

# Recommended command maturity

## v0.1.1

```text
Design only
```

## v0.2.0

```text
kvdf --help
kvdf doctor
kvdf validate
```

## v0.3.0

```text
kvdf init
kvdf generate
kvdf questionnaire
```

## v0.4.0

```text
kvdf prompt-pack
kvdf task
kvdf acceptance
```

## v0.5.0

```text
kvdf release
```

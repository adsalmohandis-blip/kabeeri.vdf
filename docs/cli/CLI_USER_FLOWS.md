# CLI User Flows

This file explains the main user flows for the current and future `kvdf` CLI. Some flows are already executable in the MVP; others remain staged roadmap behavior. Confirm current behavior with `kvdf --help` or `npm run kvdf -- --help`.

## Flow 1 — New framework workspace

```bash
kvdf init --profile standard --lang both
```

Expected flow:

```text
1. Check current folder.
2. Show folders that will be created.
3. Ask before overwriting.
4. Create Kabeeri VDF folders.
5. Add starter README files.
6. Show next steps.
```

## Flow 2 — Generate Lite planning files

```bash
kvdf generate --profile lite
```

Expected flow:

```text
1. Read generators/lite.json.
2. Create Lite folder skeleton.
3. Add beginner-friendly questionnaire files.
4. Add task tracking starter file.
5. Add acceptance checklist starter file.
```

## Flow 3 — Choose a prompt pack

```bash
kvdf prompt-pack list
kvdf prompt-pack show laravel
```

Expected flow:

```text
1. List available prompt packs.
2. Show what each pack is for.
3. Remind user that prompt packs are not installers.
4. Suggest the first prompt to use.
```

## Flow 4 — Create a task

```bash
kvdf task create --title "Add auth foundation" --type prompt-pack --issue 12
```

Expected flow:

```text
1. Read task_tracking/task.schema.json.
2. Create a task record.
3. Add the default intake status.
4. Ask for milestone if missing.
5. Show suggested GitHub issue content.
```

## Flow 5 — Create acceptance checklist

```bash
kvdf acceptance create --type task-completion --issue 12
```

Expected flow:

```text
1. Read acceptance checklist template.
2. Create checklist file or console output.
3. Include issue number.
4. Include decision placeholder.
5. Show review instructions.
```

## Flow 6 — Validate workspace

```bash
kvdf validate
```

Expected flow:

```text
1. Check required folders.
2. Validate JSON files.
3. Check manifests.
4. Warn about placeholder files.
5. Show pass/warning/fail summary.
```

## Flow 7 — Release check

```bash
kvdf release check --version v0.1.1
```

Expected flow:

```text
1. Check release checklist exists.
2. Check milestone tasks manually or by local config if available.
3. Check manifests.
4. Check examples.
5. Generate release notes draft.
```

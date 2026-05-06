# CLI Safety Rules

The future `kvdf` CLI must be safe by default.

## Main rule

Do not perform destructive actions without explicit confirmation.

## File safety

The CLI should:

```text
- avoid overwriting user files by default
- show what files will be created
- show what files will be changed
- ask before overwriting
- support dry-run mode
```

## Required option

Every write command should support:

```bash
--dry-run
```

Example:

```bash
kvdf generate --profile standard --dry-run
```

## Secrets safety

The CLI must never ask users to type real production secrets into generated files.

It should use placeholders only:

```text
YOUR_API_KEY_HERE
YOUR_DATABASE_URL_HERE
```

## Framework installer safety

The CLI should not install Laravel, .NET, Next.js, Django, or any other application framework in early versions.

It should explain:

```text
KVDF prompt packs are not installers.
Prepare your framework project separately, then use the matching prompt pack.
```

## Git safety

The CLI should not automatically commit, push, tag, or publish releases in early versions.

It may show suggested commands:

```bash
git add .
git commit -m "..."
git push
```

## Production safety

The CLI must not:

```text
- deploy to production
- modify live stores
- publish releases automatically
- change GitHub repository settings
- delete user files
- run database migrations automatically
```

## Recommended confirmation language

Before overwriting files:

```text
The following files already exist:
- ...

Do you want to overwrite them? yes/no
```

## Dry-run output example

```text
Dry run mode.

The following files would be created:
- docs/
- task_tracking/
- acceptance_checklists/

No files were changed.
```

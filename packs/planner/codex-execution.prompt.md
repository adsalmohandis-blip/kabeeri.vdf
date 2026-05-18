# CODEx PROMPT — KVDF Core

Context:
- Repo: kabeeri.vdf
- Track: Owner Track / KVDF Core only
- Delivery mode: Direct-to-main
- No branch / no PR unless explicitly requested
- Do not touch KVDOS
- Do not commit runtime state under .kabeeri/
- The Owner is the only active KVDF Core developer
- Codex is the executor, not the planner

Goal:
{{goal}}

Scope:
Allowed files:
{{allowed_files}}

Forbidden files:
{{forbidden_files}}

Implementation tasks:
{{implementation_tasks}}

Validation:
Run:
{{validation_commands}}

Commit:
git add -A
git commit -m "feat: add KVDF planner layer MVP"
git push origin main

Stop condition:
{{stop_condition}}

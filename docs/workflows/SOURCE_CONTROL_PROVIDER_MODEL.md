# Source Control Provider Model

## Purpose

KVDF treats source control as a provider-driven delivery choice, not as a
hardcoded GitHub workflow.

This lets the system support:

- no source control
- local-only delivery
- Git direct-to-main
- Git branch workflow without PR
- Git branch + PR workflow
- GitHub as an optional remote/provider plugin, canonicalized in `github_provider`
- future source-control providers such as GitLab, Bitbucket, or custom plugins

## Git vs GitHub vs Branch vs PR

- **Git** is the local source-control provider.
- **GitHub** is an optional remote/provider layer, implemented canonically by the `github_provider` plugin.
- **Branch** is a delivery mode.
- **PR** is an optional review and merge workflow.

Git and GitHub are related but not the same thing.

## Delivery Modes

### No Source Control

Use when the workspace is intentionally local-only or source control is not
available.

### Local-Only Mode

Use when the work stays local and no commit/push step should be implied.

### Git Direct-to-Main

Use when the repo has Git, the Owner is working on KVDF Core, and the approved
delivery path is direct-to-main.

### Git Branch Mode

Use when a branch is helpful but PR is not required.

### Git Branch + PR Mode

Use when team review, protected branches, or risky changes require a PR-based
handoff.

## Track Behavior

### Owner Track

- defaults to Git direct-to-main when Git is detected
- never assumes GitHub is mandatory
- must protect `.kabeeri/` runtime state

### Vibe/App Track

- defaults to local-first
- can optionally enable Git or GitHub handoff
- should not touch KVDF Core unless the Owner explicitly asks for framework
  work

### Plugin Track

- follows the selected plugin or parent repository provider contract
- must protect `.kabeeri/plugin-links/`
- must keep plugin manifest, docs, runtime, schemas, and tests in parity

### Viber/App Git Boundary Guard

When a Viber app workspace lives inside `workspaces/apps/<app-slug>` but the
Git root resolves to the KVDF Core repository, the workspace must be treated as
parent-repo blocked. In that case:

- branch, push, and PR actions are blocked for the app workspace
- local-only planning remains valid
- the source-control context report explains that the parent repo is KVDF Core
- the safe next action is to use local-only mode or link the app to its own Git
  repository

Use `kvdf source-control context --track vibe --app <app-slug> --json` to
inspect the Git boundary before planning or prompting branch/PR work.

## Provider Replacement

The model is intentionally replaceable.

GitHub may be used today, but KVDF should remain compatible with future source
control providers by expressing delivery as:

- provider
- remote provider
- mode
- branch/PR capability

GitHub provider plugins do not override the Viber/App boundary guard. If the
workspace resolves to KVDF Core Git, the track boundary still wins and branch /
push / PR remain blocked until the app has its own repository.

The canonical GitHub remote-provider implementation lives in the optional
`github_provider` plugin. Legacy `github` and `github_sync` bundles are
compatibility wrappers only.

## Planner Integration

Planner outputs, Codex prompts, visual planner reports, and materialization
artifacts all carry the same `source_control` object so the whole workflow stays
consistent.

That object may also include a `git_context` report so Viber/App work can see
whether the current folder is KVDF Core, a standalone app repo, a linked
external repo, or a parent-repo-blocked app workspace.

That object is the source of truth for:

- enabled or disabled source control
- provider
- remote provider
- branching
- PR support
- current branch
- default branch
- owner approval requirement

## Rule Summary

- Git is the default provider only when a Git repository is detected.
- GitHub is optional.
- Branch and PR are optional.
- Local-only delivery remains valid.
- KVDF Core defaults to direct-to-main.
- Vibe/App defaults to local-first.
- The planner must expose the source-control mode instead of hiding it.

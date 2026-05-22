# GitHub Provider

`github_provider` is the canonical optional GitHub plugin for KVDF.

It owns GitHub-specific provider behavior:

- readiness checks
- sync planning
- issue planning
- pull-request planning
- release planning
- handoff planning
- compatibility support for `kvdf github`

KVDF Core still owns local Git, source-control contracts, planner contracts, and
direct-to-main defaults. GitHub remains optional.

## What this plugin does

- reports GitHub provider availability
- inspects local Git and GitHub remote readiness
- builds dry-run sync and handoff plans
- keeps confirmed remote actions behind explicit confirmation gates when
  available
- provides planner-facing provider metadata

## What it does not do

- it does not make GitHub mandatory
- it does not replace local Git
- it does not change KVDF Core planner rules
- it does not write remote state by default

## Compatibility

The legacy `kvdf github ...` command remains a compatibility surface and now
routes to this plugin runtime.

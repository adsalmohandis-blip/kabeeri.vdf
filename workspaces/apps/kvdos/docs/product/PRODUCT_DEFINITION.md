# KVDOS Product Definition

## Review Metadata

- Status: Draft
- Source: Promoted from KVDF-generated KVDOS discovery docs
- Product: KVDOS
- Review state: Pending owner review before implementation
- Canonical status: Not canonical until merged and approved by owner

> Note: this document describes the intended product definition and not the
> current shipped feature set. The current workspace release is a local-first
> Studio foundation. The v1 product boundary includes cloud login,
> subscriptions, licenses, activation, and release access control, while the
> discovery/spec boundary remains documentation-first and app-local.

## Product Definition

KVDOS is a local-first, cloud-controlled IDE and control layer for AI-assisted
software creation, maintenance, and publishing.

It is designed for developers, agencies, and serious AI-assisted teams that want to turn an idea into a governed, reviewable, publish-ready software product.

## Discovery And Spec Boundary

Discovery and spec work for KVDOS starts as app-local documentation and
validation.

The boundary covers:

- questionnaire flow
- blueprint/spec derivation
- `app.kvdos.yaml` validation

It does not include questionnaire UI code, blueprint/spec generator code, or
`app.kvdos.yaml` generation logic yet.

## What KVDOS Does

KVDOS provides a structured workflow for:

- discovery and product definition
- blueprint generation
- `app.kvdos.yaml` creation
- task generation and assignment
- AI tool execution
- review and approvals
- testing and reporting
- cleanup and maintenance
- publish-ready handoff

## Core Value

KVDOS solves the problem of AI-assisted software work becoming messy, untraceable, and hard to resume.

It helps teams:

- keep scope clear
- use one or many AI tools
- maintain local source-of-truth control
- reduce drift across docs, code, tasks, and reports
- review and approve risky changes
- produce handoff-ready evidence

## Main User

The primary users are:

- software agencies
- software houses
- AI-assisted developers
- freelance programmers
- small software teams

The first product priority should be agencies and serious AI-assisted developers because they repeatedly build software products and need speed, governance, and delivery control.

## Product Shape

KVDOS starts as:

```text
Local IDE Studio + Local Runtime + Cloud subscription/license control
```

KVDOS is not intended to replace VS Code in its first versions. Users may still write and review code in VS Code, Cursor, Codex-enabled workflows, or other editors while KVDOS governs the project workflow.

The current KVDOS workspace is intentionally narrower than the eventual v1
commercial boundary: app spec validation, local task persistence, Studio
browsing, dependency navigation, and read-only readiness reporting.

## Main Product Promise

Build full software applications with your favorite AI tools — safely, locally, and under strong project governance.

## First v1 Focus

KVDOS v1 should focus on one visible behavior:

```text
Idea -> Discovery -> Blueprint -> app.kvdos.yaml -> Tasks -> AI execution -> Review -> Test -> Report -> Export/Publish-ready project
```

## Non-Goals for the First Version

KVDOS should not try to deliver every later platform layer at once.

Delay:

- full IDE replacement
- full marketplace
- enterprise self-hosting
- cloud runner
- Web3 or token systems
- advanced evolution system
- many app templates
- automatic risky cleanup

## Product Boundary

KVDF is the open-source governance core used to help build and manage KVDOS.

KVDOS is the commercial product described by this repository.

Discovery/spec boundary work stays app-local to `workspaces/apps/kvdos/` until
explicitly approved for implementation.

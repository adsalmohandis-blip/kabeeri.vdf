# KVDOS Product Definition

## Review Metadata

- Status: Draft
- Source: Promoted from KVDF-generated KVDOS discovery docs
- Product: KVDOS
- Review state: Pending owner review before implementation
- Canonical status: Not canonical until merged and approved by owner

> Note: this document describes the intended product definition and not the
> current shipped feature set. The current workspace release is local-first and
> does not include execution, agents, cloud licensing, marketplace, or
> enterprise automation yet.

## Product Definition

KVDOS is a local-first, cloud-connected IDE and control layer for AI-assisted software creation, maintenance, and publishing.

It is designed for developers, agencies, and serious AI-assisted teams that want to turn an idea into a governed, reviewable, publish-ready software product.

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
Local Studio + Local Runner + Cloud-managed licensing/sync
```

KVDOS is not intended to replace VS Code in its first versions. Users may still write and review code in VS Code, Cursor, Codex-enabled workflows, or other editors while KVDOS governs the project workflow.

The current shipped KVDOS workspace is intentionally narrower: app spec
validation, local task persistence, Studio browsing, dependency navigation, and
read-only readiness reporting.

## Main Product Promise

Build full software applications with your favorite AI tools — safely, locally, and under strong project governance.

## First v1 Focus

KVDOS v1 should focus on one visible behavior:

```text
Idea -> Discovery -> Blueprint -> app.kvdos.yaml -> Tasks -> AI execution -> Review -> Test -> Report -> Export/Publish-ready project
```

## Non-Goals for the First Version

KVDOS should not try to deliver all commercial layers at once.

Delay:

- full IDE replacement
- full marketplace
- enterprise self-hosting
- advanced evolution system
- cloud runner
- Web3 or token systems
- many app templates
- automatic risky cleanup

## Product Boundary

KVDF is the open-source governance core used to help build and manage KVDOS.

KVDOS is the commercial product described by this repository.

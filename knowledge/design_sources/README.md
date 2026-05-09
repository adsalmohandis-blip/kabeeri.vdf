# Design Sources

This folder defines v7 Design Source Governance.

Design sources are inputs, not implementation specs. Codex and other AI coding agents must not build frontend directly from raw images, PDFs, links, screenshots, Figma files, reference websites, or vague visual requests. Every source must become an approved text spec first.

## Pipeline

```text
Design Source
-> Source Snapshot
-> Source Type Classification
-> Extraction Mode
-> Draft Text Spec
-> Missing Design Report
-> Human Review
-> Approved Text Spec
-> Design Tokens
-> Page Specs
-> Component Contracts
-> Frontend Tasks
-> AI Implementation
-> Visual Acceptance
-> Owner / Client Verify
```

## Runtime Commands

Kabeeri includes runtime commands for both pre-implementation and post-implementation design governance.

Pre-implementation:

```bash
kvdf design add --id design-source-001 --type figma --location "https://figma.example/file" --use "Checkout page"
kvdf design snapshot design-source-001 --reference checkout-export-v1
kvdf design spec-create --source design-source-001 --title "Checkout page"
kvdf design spec-approve text-spec-001 --tokens design_system/tokens.json
kvdf design page-create --spec text-spec-001 --name "Checkout page"
kvdf design page-approve page-spec-001
kvdf design component-create --page page-spec-001 --name CheckoutSummary
kvdf design component-approve component-contract-001
```

Post-implementation:

```bash
kvdf design visual-review --page page-spec-001 --task task-001 --screenshots desktop.png,mobile.png --decision pass
kvdf design gate --task task-001 --page page-spec-001 --json
kvdf validate design
```

See `VISUAL_ACCEPTANCE_RUNTIME.md`.

## Core Rules

- Links are not specs.
- Images are not specs.
- PDFs are not specs.
- Reference websites are inspiration sources, not copy sources.
- AI-extracted specs are drafts until approved by a human.
- Codex implements approved UI contracts; Codex does not invent UI.

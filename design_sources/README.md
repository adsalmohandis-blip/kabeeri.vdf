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

## Core Rules

- Links are not specs.
- Images are not specs.
- PDFs are not specs.
- Reference websites are inspiration sources, not copy sources.
- AI-extracted specs are drafts until approved by a human.
- Codex implements approved UI contracts; Codex does not invent UI.


# Kabeeri VDF Public Roadmap

This roadmap describes the open-source Kabeeri VDF core only.

KVDOS commercial product work is tracked separately in the KVDOS repository.

## v0.3.0-alpha — Open Core Stabilization

Goal: make Kabeeri VDF understandable as an open-source CLI governance layer.

Planned work:

- Align package version with honest open-core status.
- Clarify that Kabeeri VDF works inside existing editors and terminals.
- Define the commercial boundary between VDF and KVDOS.
- Add open-core strategy documentation.
- Add versioning policy.
- Classify stable and experimental CLI surfaces.
- Prepare the repository for public contribution.

## v0.3.1-alpha — Contributor Readiness

Goal: make outside contribution safer and clearer.

Planned work:

- Contributor guide.
- Security policy.
- Code of conduct.
- Issue templates.
- Pull request template.
- Testing guide.
- Documentation contribution guide.

## v0.4.0-alpha — Governance Contract Hardening

Goal: stabilize the core contracts that AI-assisted projects and downstream products can rely on.

Planned work:

- Stabilize task schema.
- Stabilize output contract.
- Stabilize capture workflow.
- Stabilize validation outputs.
- Document schema versioning rules.
- Add more examples for WordPress, Laravel, and React workflows.

## v0.4.5-alpha — KVDOS Bridge Preparation

Goal: prepare Kabeeri VDF to be consumed by KVDOS without copying or forking the core.

Planned work:

- `kvdf export state --json`.
- `kvdf export tasks --json`.
- `kvdf export schemas --output <dir>`.
- Machine-readable validation reports.
- Downstream consumer documentation.

## v0.5.0-beta — Public Core Beta

Goal: provide a usable beta open-core release.

Planned work:

- Stable core CLI workflow.
- Stable prompt pack structure.
- Stable questionnaire/intake structure.
- Stable basic reports.
- Clean install from GitHub or package source.
- KVDOS integration examples.

## v1.0.0 — Stable Open Core

Goal: stable open-source AI development governance framework.

Requirements:

- Stable CLI onboarding.
- Stable task governance model.
- Stable prompt pack format.
- Stable questionnaire/intake flow.
- Stable local runtime state expectations.
- Stable validation and report outputs.
- Clear public documentation.
- Clear KVDOS relationship boundary.
- Passing tests and smoke checks.

## Explicitly Out of Scope for Kabeeri VDF

The following belong to KVDOS, not VDF:

- KVDOS Studio.
- KVDOS Runner.
- KVDOS Cloud.
- Billing and subscriptions.
- Commercial licensing.
- Marketplace.
- Signed package registry.
- Enterprise self-hosting.
- Secure commercial runtime.
- Advanced commercial agent execution.

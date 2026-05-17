# Technical Debt And Product Gap Backlog

This backlog turns the current audit into an ordered execution plan. It focuses on the highest-leverage work first: making the shipped product clearer, reducing CLI complexity, and tightening the most valuable partial surfaces.

## Priority 0

### 1. Separate shipped runtime from roadmap language

**Problem**

The repo is strong technically, but the product story still reads broader than the shipped experience. New readers can easily confuse working runtime with aspirational platform layers.

**Why it matters**

- Reduces buyer confusion.
- Lowers onboarding friction for contributors.
- Prevents roadmap language from overwriting product reality.

**Next actions**

- Keep the new `Current Reality` section in `README.md`.
- Maintain a single authoritative shipped-vs-roadmap summary.
- Mark historical phase reports as historical, not current product truth.

**Success criteria**

- A new reader can tell in under 30 seconds what is shipped today.
- Roadmap claims do not appear to be current runtime guarantees.

## Priority 1

### 2. Break up the CLI dispatcher

**Problem**

`src/cli/index.js` is the main routing hub for the entire tool. That works now, but it is a long-term maintenance risk as the command surface grows.

**Why it matters**

- Reduces coupling.
- Makes command families easier to test.
- Lowers the risk of regressions when adding features.

**Next actions**

- Extract command-family routing into smaller modules.
- Keep `bin/kvdf.js` as the thin entrypoint.
- Keep `src/core/bootstrap.js` as the boot context adapter.
- Leave permissions and track-surface checks in a shared guard layer.

**Suggested first split**

- session and routing commands
- project/init/generator commands
- governance and validation commands
- product and delivery commands
- dashboard/report commands

**Success criteria**

- The top-level dispatcher is smaller and easier to read.
- Command families are independently discoverable.
- Adding a new command family does not require editing one giant file.

### 3. Clarify the partial surfaces

**Problem**

Some subsystems are intentionally partial, but that status is not always obvious from the product surface.

**Why it matters**

- Prevents enterprise-style claims from getting ahead of implementation.
- Helps decide what belongs in v1, v1.5, or later.

**Next actions**

- Label VS Code integration as scaffold/partial until a real UI ships.
- Label security and migration as governance-first until execution is added.
- Keep docs-site language aligned with actual runtime depth.

**Success criteria**

- Partial surfaces are labeled clearly everywhere they appear.
- Users can distinguish `governed` from `fully executed`.

## Priority 2

### 4. Reduce documentation sprawl

**Problem**

There are many docs layers: root README, current-state docs, roadmap, reports, site pages, and historical phase notes. The information is rich, but there is too much overlap.

**Why it matters**

- Slows contributor onboarding.
- Makes it harder to identify the source of truth.
- Increases the chance of stale claims persisting.

**Next actions**

- Keep one canonical current-state document.
- Mark older phase reports as historical by default.
- Reduce repeated explanations across README, roadmap, and reports.

**Success criteria**

- Contributors know where to look first.
- Older docs are still preserved, but no longer mistaken for current status.

### 5. Narrow the primary customer segment

**Problem**

The product currently speaks to founders, agencies, small teams, and enterprise teams at once.

**Why it matters**

- Broad messaging weakens positioning.
- Pricing and packaging become harder to design.

**Next actions**

- Pick one primary ICP.
- Pick one secondary ICP.
- Align onboarding, examples, and pricing language to those two segments first.

**Recommended initial ICP**

- Primary: agencies and small teams shipping repeated business apps.
- Secondary: founders building AI-assisted MVPs.

**Success criteria**

- Marketing language can be summarized in one sentence.
- The main examples and docs clearly serve one primary buyer.

### 6. Define the commercial boundary

**Problem**

The repo hints at SaaS, licensing, enterprise, and plugin monetization, but the boundary between free/open-source and paid layers is not crisp.

**Why it matters**

- A blurry commercial model creates confusion for adoption and future sales.

**Next actions**

- Document what is free, paid, enterprise, and plugin-based.
- Decide which capabilities are core and which are add-ons.
- Keep the open-source core opinionated but not bloated.

**Success criteria**

- A future buyer can tell what they are paying for.
- The open-source core and commercial layers do not overlap ambiguously.

## Suggested Execution Order

1. Keep the shipped-vs-roadmap story sharp.
2. Split the CLI dispatcher.
3. Clarify partial surfaces.
4. Consolidate docs around a single current-state source.
5. Narrow the primary ICP.
6. Define the commercial boundary.

## Notes

- The repo already validates successfully, so this backlog is about product clarity and maintainability rather than fixing a broken runtime.
- The CLI, runtime state, validation, and plugin model are real; the work now is to make the product easier to understand, evolve, and sell.

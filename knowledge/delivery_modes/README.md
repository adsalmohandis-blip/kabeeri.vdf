# Delivery Modes

Phase 05 canonical files:

- [DELIVERY_MODE_SELECTION_GUIDE.md](DELIVERY_MODE_SELECTION_GUIDE.md)
- [STRUCTURED_DELIVERY.md](STRUCTURED_DELIVERY.md)
- [AGILE_DELIVERY.md](AGILE_DELIVERY.md)

Kabeeri VDF supports **two official delivery modes** to accommodate different project needs, team structures, and development philosophies. Both modes are equally valid and share the same foundation established in v1.0.0.

## Overview

### Structured Delivery Mode

**Structured Delivery** follows a comprehensive, upfront planning approach based on the original v1.0.0 design.

It now has an executable runtime for approved requirements, phases,
deliverables, risks, change requests, phase gates, and live dashboard health.

- **Emphasis:** Product clarity before code, all core features planned upfront
- **Workflow:** Questionnaires → Documentation → Full specification → Implementation
- **Best for:** Teams who prefer complete planning, complex products, regulatory requirements, distributed teams
- **Planning phase:** Long initial planning, detailed requirements
- **Change handling:** Changes managed through extension layer or version planning
- **Suitable projects:** Enterprise systems, financial apps, healthcare platforms, large SaaS products

**Key characteristics:**
- Comprehensive questionnaires for the entire project scope
- Full documentation generated before implementation
- All core features identified and approved upfront
- Clear separation between core and extension features
- Fixed scope, with changes managed formally

### Agile Delivery Mode

**Agile Delivery** follows an iterative, incremental approach with sprint-based execution.

- **Emphasis:** Building and learning in iterations, adaptive planning
- **Workflow:** Product vision → Epic & Story creation → Sprint planning → Incremental delivery
- **Best for:** Fast-moving teams, MVPs, uncertain requirements, frequent feedback cycles, startup environments
- **Planning phase:** Initial vision and roadmap, detailed planning per sprint
- **Change handling:** Changes incorporated into backlog and prioritized in sprint planning
- **Suitable projects:** MVPs, startups, experimental features, fast-moving SaaS, consumer applications

**Key characteristics:**
- High-level product vision upfront
- Stories and tasks created iteratively in sprints
- Continuous acceptance and feedback loops
- Backlog prioritization between sprints
- Flexible scope, with regular stakeholder feedback

---

## Key Differences

| Aspect | Structured Delivery | Agile Delivery |
|--------|-------------------|-----------------|
| **Planning scope** | All features planned upfront | Vision planned, features added iteratively |
| **Planning duration** | Long initial phase (days/weeks) | Short initial phase, detailed per sprint |
| **Documentation** | Complete before implementation | Evolves with product |
| **Change process** | Formal change management | Backlog prioritization |
| **Sprint/Phase length** | Single or long phases | Fixed 1-2 week sprints |
| **AI involvement** | Full project prompt packs | Story-by-story prompts |
| **Review cadence** | Per phase or feature completion | Per sprint/increment |
| **Best for** | Known requirements, complex architecture | Fast iteration, learning products |

---

## Important Note: v1.0.0 Foundation

**v1.0.0 is NOT "Waterfall-only"** — it is the **Structured foundation** that both delivery modes are built upon.

The core components of v1.0.0:
- Project profiles (Lite, Standard, Enterprise)
- Generator and skeleton system
- Questionnaires and documentation generation
- Prompt packs
- Task tracking and acceptance checklists

**Both v1.1.0 delivery modes use these v1.0.0 components:**
- Structured mode uses them as originally designed (full upfront planning)
- Agile mode adapts them for incremental delivery (vision → backlog → sprints)

Neither mode abandons or breaks v1.0.0. Instead:
- **Structured extends** the v1.0.0 workflow as-is
- **Agile adapts** v1.0.0 components into an iterative framework

---

## How to Choose Your Delivery Mode

See [SELECTION_GUIDE.md](SELECTION_GUIDE.md) for detailed guidance on selecting the right mode for your project.

The CLI can also recommend a mode from a project description:

```bash
kvdf delivery recommend "Build ecommerce MVP with fast user feedback"
kvdf delivery choose agile --reason "MVP discovery"
```

---

## Documentation Structure

- [SELECTION_GUIDE.md](SELECTION_GUIDE.md) — How to choose between Structured and Agile
- [STRUCTURED_DELIVERY.md](STRUCTURED_DELIVERY.md) — Structured mode terminology and workflow
- [STRUCTURED_RUNTIME.md](STRUCTURED_RUNTIME.md) — Structured runtime commands, gates, and live JSON
- [AGILE_DELIVERY.md](AGILE_DELIVERY.md) — Agile mode terminology and workflow

---

## Implementation Timeline

- **v1.1.0:** Delivery modes defined and documented
- **v1.2.0:** Project intake systems for both modes
- **v1.3.0:** Task governance rules for both modes
- **v1.4.0:** Agile-specific tools (backlog, sprints, cost tracking)
- **v1.5.0+:** Dashboards, CLI, VS Code extension support for both modes

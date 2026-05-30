# Architecture

The package is organized as a small planning engine with clear service boundaries.

## Core services

- registry loading
- validation
- visibility filtering
- profile building
- compatibility assessment
- source routing
- questionnaire routing
- spec resolution
- roadmap ordering
- workspace planning
- evidence summarization

## Design rules

- categories are data, not hardcoded control flow
- visibility is driven by readiness and activation state
- incompatible selections fail safely
- source conflicts are preserved, not silently resolved
- every derived output is deterministic and repeatable

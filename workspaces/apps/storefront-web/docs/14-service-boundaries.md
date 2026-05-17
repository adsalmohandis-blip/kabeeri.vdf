# Service Boundaries

## Purpose
Define which service owns which responsibility and what must not leak across layers.

## Questions this document must answer
- Which services are allowed to own state?
- Which service calls are internal versus external?
- What must never be coupled directly?

## Suggested sections
- Service map
- Responsibility split
- Boundary rules
- Cross-service calls

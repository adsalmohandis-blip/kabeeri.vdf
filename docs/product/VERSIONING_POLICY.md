# Versioning Policy

Kabeeri VDF uses honest semantic versioning.

## Version Meaning

```text
0.x        = alpha/beta development releases
1.0.0      = stable open-source core
1.x        = stable open-source core improvements
```

## Current Direction

The current open-core stabilization target is:

```text
v0.3.0-alpha
```

This version represents the first clearly positioned open-core release after separating Kabeeri VDF from future KVDOS commercial product work.

## What Version Numbers Must Not Do

Version numbers must not claim that commercial layers are complete when they are still roadmap items.

KVDOS commercial versions are tracked separately from Kabeeri VDF versions.

## Kabeeri VDF v1.0.0 Requirements

Kabeeri VDF should not be called `v1.0.0` until the open-source core has:

- Stable CLI onboarding.
- Stable task governance model.
- Stable prompt pack format.
- Stable questionnaire/intake flow.
- Stable local runtime state expectations.
- Stable validation and report outputs.
- Clear public documentation.
- Clear KVDOS relationship boundary.
- Passing tests and smoke checks.

## KVDOS Relationship

KVDOS may consume Kabeeri VDF releases through a GitHub dependency, package dependency, CLI bridge, or API bridge.

KVDOS versioning belongs to the commercial KVDOS repository and should not be mixed with Kabeeri VDF package versions.

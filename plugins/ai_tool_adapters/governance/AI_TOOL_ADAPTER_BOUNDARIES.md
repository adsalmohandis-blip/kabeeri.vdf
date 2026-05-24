# AI Tool Adapter Boundaries

`ai_tool_adapter` is a governed integration layer. It is intentionally not an
authority layer.

## Allowed

- discover local AI tool executables
- register and unregister local tools
- validate run contracts
- evaluate policy gates
- run only through governed direct process spawn
- write evidence and policy results
- expose dashboard, readiness, evidence, audit, and provider reports

## Not Allowed

- approve assignments
- decide queue ownership
- decide merge approval
- become a general shell launcher
- bypass policy checks
- bypass `--confirm`
- execute when policy evaluation fails
- treat visibility reports as approval
- turn runtime state into the source of truth

## Authority Boundary

`multi_ai_governance` is the authority plugin. It may consume the provider API
or coordinate work, but the adapter does not grant itself authority.

## Source of Truth Boundary

The repository remains the source of truth for code and patches.
External AI tools never become the source of truth for workspace state.

## Compatibility Boundary

The bundle stays in `plugins/ai_tool_adapters/` for now. That folder and the
legacy plural plugin id remain compatible with the singular public identity.

# Case 4 GitHub Provider Boundary

`github_provider` is not part of Case 4.
It is reserved for a future Case 5 GitHub provider integration layer.

## Why it is outside this case

- Case 4 is about Kabeeri / KVDOS Cloud governance.
- `github_provider` is a source-control provider layer, not a cloud governance layer.
- The authority for Case 4 must remain inside `multi_ai_governance`.

## What this case should not do

- Do not add GitHub provider commands.
- Do not add GitHub provider runtime state.
- Do not make GitHub provider part of cloud policy checks.
- Do not use GitHub provider as a permission authority.

## Future boundary

If a later case adds GitHub provider governance, it should be documented separately and must not change the Case 4 cloud authority model.


# Case 5 KCloud Boundary

`kcloud_data_sharing` is not part of Case 5.

## Why

- Case 4 already reserves Kabeeri / KVDOS Cloud transport and sync.
- Case 5 is specifically about GitHub provider governance.
- Mixing the two would blur the authority boundary and duplicate transport work.

## Boundary Rules

- `github_provider` handles GitHub provider interactions.
- `multi_ai_governance` handles governance decisions.
- `kcloud_data_sharing` remains unrelated to this task.

## What Case 5 Must Not Do

- Do not read or write KCloud runtime state.
- Do not depend on KCloud transport.
- Do not add KCloud commands.
- Do not add KCloud schemas.
- Do not add KCloud docs beyond this boundary note.

## Why This Matters

- The GitHub provider layer must stay separate from cloud transport.
- Case 5 should remain source-control focused and provider-backed only.


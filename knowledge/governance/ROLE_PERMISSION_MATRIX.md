# Role Permission Matrix

## Roles

- `Owner`: sole final authority for verification, publishing decisions, ownership transfer, and high-risk overrides.
- `Maintainer`: can prepare and coordinate work but cannot final-verify as Owner.
- `Reviewer`: can inspect work and recommend acceptance.
- `Backend Developer`: executes approved backend tasks.
- `Frontend Developer`: executes approved public frontend tasks.
- `Admin Frontend Developer`: executes approved admin dashboard/backoffice frontend tasks.
- `Business Analyst`: can propose and refine tasks from requirements.
- `AI Developer`: executes only assigned tasks inside a task access token scope.
- `Viewer`: read-only role with no execution authority.

## Permissions

| Permission | Owner | Maintainer | Reviewer | Backend Dev | Frontend Dev | Admin Dev | Business Analyst | AI Dev | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Create task | Yes | Yes | No | No | No | No | Yes | No | No |
| Approve task | Yes | Yes | No | No | No | No | No | No | No |
| Assign task | Yes | Yes | No | No | No | No | No | No | No |
| Execute assigned task | Yes | Yes | No | Yes | Yes | Yes | No | Yes | No |
| Recommend acceptance | Yes | Yes | Yes | No | No | No | Yes | No | No |
| Final verify | Yes | No | No | No | No | No | No | No | No |
| Issue task access token | Yes | Yes | No | No | No | No | No | No | No |
| Revoke task access token | Yes | Yes | No | No | No | No | No | No | No |
| Issue owner transfer token | Yes | No | No | No | No | No | No | No | No |
| Accept owner transfer token | Yes | No | No | No | No | No | No | No | No |
| Create lock | Yes | Yes | No | Yes | Yes | Yes | No | Yes | No |
| Override lock | Yes | Yes | No | No | No | No | No | No | No |
| Transfer ownership | Yes | No | No | No | No | No | No | No | No |
| View audit log | Yes | Yes | Yes | Limited | Limited | Limited | Limited | Limited | No |

## Reviewer Independence

The executor of a task cannot be the final verifier. A reviewer can recommend acceptance, but Owner verification is the only final close action.

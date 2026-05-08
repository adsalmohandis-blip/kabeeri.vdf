# Roles Matrix

## Single Owner Rule

Only one identity can have the `Owner` role at any time.

## Permissions

| Permission | Owner | Maintainer | Reviewer | Backend Dev | Frontend Dev | Admin Dev | Business Analyst | AI Dev | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Create task | Yes | Yes | No | No | No | No | Yes | No | No |
| Approve task | Yes | Yes | No | No | No | No | No | No | No |
| Assign task | Yes | Yes | No | No | No | No | No | No | No |
| Execute assigned task | Yes | Yes | No | Yes | Yes | Yes | No | Yes | No |
| Recommend acceptance | Yes | Yes | Yes | No | No | No | Yes | No | No |
| Final verify | Yes | No | No | No | No | No | No | No | No |
| Issue task token | Yes | Yes | No | No | No | No | No | No | No |
| Revoke task token | Yes | Yes | No | No | No | No | No | No | No |
| Create lock | Yes | Yes | No | Yes | Yes | Yes | No | Yes | No |
| Override lock | Yes | Yes | No | No | No | No | No | No | No |
| Transfer ownership | Yes | No | No | No | No | No | No | No | No |
| View audit log | Yes | Yes | Yes | Limited | Limited | Limited | Limited | Limited | No |

## Review Independence

The executor of a task cannot be the final verifier. Reviewers can recommend acceptance, but Owner verification is final.


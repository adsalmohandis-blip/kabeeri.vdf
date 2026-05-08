# Access Token Lifecycle

## State Flow

```text
created -> assigned -> active -> used
active -> expired
active -> revoked
revoked -> reissued
expired -> reissued
```

## Rules

- Tokens are scoped to one task and one assignee.
- Tokens must expire.
- Tokens must list allowed and forbidden scope.
- Tokens cannot be broadened silently. A broader token is a new token with an audit event.
- Tokens are revoked after Owner verify, Owner rejection, explicit revocation, or expiry.
- Reissued tokens must reference the previous token and the reason for reissue.

## Reissue Rules

Reissue is allowed only when:

- the task remains approved
- the assignee is still valid
- the new scope is equal or narrower, or Owner approval exists for a broader scope
- conflict locks have been checked again
- budget limits are copied or intentionally changed with approval


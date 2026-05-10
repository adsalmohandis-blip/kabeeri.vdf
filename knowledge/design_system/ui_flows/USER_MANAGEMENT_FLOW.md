# User Management Flow

Use for inviting users, roles, permissions, teams, profiles, and access control.

Steps:

1. List users with search, filters, status, role, and last activity.
2. Invite or create a user with visible role and permission choices.
3. Edit profile, role, team, and status from a clear detail surface.
4. Confirm role downgrades, removal, deactivation, or permission changes.
5. Show audit or activity where relevant.

Required states:

- Pending invite
- Active
- Suspended or deactivated
- Permission conflict
- Success and error feedback

Rules:

- Role changes must communicate impact.
- Permission labels should be understandable without code terms.
- Keep audit-sensitive actions traceable.


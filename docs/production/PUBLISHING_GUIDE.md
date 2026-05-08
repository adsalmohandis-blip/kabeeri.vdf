# Publishing Guide

Publishing means making the project public, tagged, released, distributed, or available to users. Production-ready means the project can safely run in a production environment. These are different states.

## Before Publishing

- Complete the final release preparation checklist.
- Run validation and tests.
- Review open blockers.
- Confirm no secrets are committed.
- Confirm Owner approval.
- Confirm design source governance for frontend work.
- Confirm GitHub import package is reviewed if GitHub will be updated.

## GitHub Publishing

Do not create tags, releases, or issue mutations without explicit Owner approval.

Recommended sequence after approval:

1. Create a feature branch.
2. Open a pull request.
3. Review validation and test output.
4. Merge through the approved repository process.
5. Create tag only after Owner release approval.
6. Publish GitHub release only after Owner publish approval.

## Documentation Publishing

The docs site is static and local-first. Before publishing it publicly:

- verify English and Arabic pages
- check RTL behavior
- confirm no internal secrets or private links are exposed
- confirm publish target and ownership

## Rollback

Record rollback steps before public publish. If a release is published incorrectly, document the corrective action, owner approval, and audit trail.


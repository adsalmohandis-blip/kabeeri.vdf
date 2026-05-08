# Open Blockers

## Critical Blockers

None found in final local QA.

## Warnings Before Publish

| Warning | Impact | Required Action |
| --- | --- | --- |
| Uncommitted phased work exists | Publish should not proceed from an unreviewed dirty tree. | Review diff, create branch/PR, and commit through the approved flow. |
| GitHub was not mutated | Labels, milestones, and issues are import-ready only. | Owner must approve any GitHub import or `gh` write commands. |
| Owner approval still required | Final release and publish decisions are Owner-only. | Record Owner release and publish approval before tags/releases/public launch. |
| Static docs site not hosted | The docs site works locally but is not deployed. | Choose a hosting target and run publish checks if public docs are required. |
| v6/v7 are spec layers | Vibe UX and design governance define behavior, but no production UI app was built. | Treat UI app implementation as future scoped work. |

## Residual Risks

- Link coverage was checked on key docs, not every markdown file in the repository.
- Secret scanning was lightweight pattern scanning, not a full security scanner.
- GitHub import instructions require careful manual review before use.
- Real project workspaces should generate their own `.kabeeri` state rather than using repository examples as live state.


# Random Usage Detection Rules

Random or untracked AI usage is AI usage that lacks enough source context to count cleanly against official delivery.

This is not always bad. Exploration, learning, and emergency investigation may be valid. Kabeeri makes them visible.

## Flag As Untracked When Missing

- `task_id`
- `source_reference`
- `workstream`
- `developer_id` or `agent_id`
- pricing rule
- access token for file-changing work
- acceptance or review outcome

## Classifications

- `exploration`
- `learning`
- `waste`
- `rework`
- `missing_task`
- `uncaptured_work`
- `urgent_investigation`

## Suggested Actions

- create a task
- link usage to an existing task
- move usage to learning budget
- run post-work capture
- reject cost from official delivery accounting
- request Owner approval for retroactive association


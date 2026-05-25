# KCloud Data Sharing

`kcloud_data_sharing` is a removable transport shell for governed Kabeeri /
KVDOS cloud data sharing.

## Authority Split

- `multi_ai_governance` decides policy, approval, and audit.
- `ai_tool_adapter` can provide tool identity.
- `kcloud_data_sharing` only transmits and receives governed cloud data.

## Phase 1 Contract

- local runtime root: `.kabeeri/kcloud/`
- config file: `.kabeeri/kcloud/config.json`
- no real cloud connection required
- no transmit or receive logic yet

## Commands

```bash
kvdf kcloud status
kvdf kcloud init
```

## Config Contract

The cloud project config stores:

- `project_id`
- `repo_url`
- `cloud_project_id`
- `transmit_enabled`
- `receive_enabled`
- `authority_plugin`
- `created_at`
- `updated_at`

# Multi-AI Governance Commands

The `multi-ai` command surface is owned by this bundle.

- `multi_ai_governance.js`: leader sessions, agents, queues, merges, and sync.
- `multi_ai_communications.js`: conversations, relay inboxes, and message flow.

The core CLI now mounts `plugins/multi_ai_governance/bootstrap.js` and forwards
the command calls into this bundle.

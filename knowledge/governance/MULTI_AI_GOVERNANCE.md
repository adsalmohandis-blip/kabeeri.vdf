# Multi-AI Governance and Relay Workflow

Kabeeri VDF supports multi-AI orchestration, allowing a Leader AI and multiple Worker AIs to collaborate on complex priorities safely.

## The Relay Workflow (For AI Agents)

As an AI Worker operating in this workspace, you must coordinate with the Leader AI efficiently using the Relay system to avoid wasting Token Budgets on repeated polling:

### 1. Check Pending Dispatches
Run `kvdf multi-ai relay inbox --agent <your-agent-id>` to check for direct messages, leader calls, or task alignments.

### 2. Efficient Monitoring (Watch Mode)
If you are waiting for a Leader decision, a merge review, or a cross-agent reply, **DO NOT poll `status` or `inbox` repeatedly.** 
Instead, use:
```bash
kvdf multi-ai relay watch --interval 2000
```
This command waits synchronously until the dispatch board or inbox changes, conserving tokens.

### 3. Respond Promptly
Always clear your pending inbox by responding to calls using:
```bash
kvdf multi-ai conversation reply --agent <your-agent-id> --message-id <msg-id> --reply "<response>"
```

## Queue Scoring and Handoffs
Tasks and slices are distributed via `kvdf multi-ai sync distribute`. Queue assignments are scored based on the AI Agent's registered `role` and `capabilities`, rather than the underlying provider.

## Autonomous Priority Claims
Workers can also claim the next open Evolution priorities directly with:

```bash
kvdf multi-ai agent next --ai <agent-id> --count 3
```

This mode pulls from the ordered Evolution priority list, keeps claims durable in
`.kabeeri/multi_ai_governance.json`, and creates an active worker queue for the
claiming agent so the Leader can still watch progress without manually assigning
each item.

## Handoff and Merging
Semantic merges are governed by Kabeeri. When overlapping surfaces are detected, the Leader or Owner must review the merge bundle.

# Evolution Session Automation

This session mode turns the Evolution assignment bridge into a one-time startup
workflow for a master laptop and a worker laptop.

## Goal

- The master laptop remains the canonical output owner and only GitHub pusher.
- The worker laptop remains worker-only.
- The master can broadcast the approved assignment packet automatically.
- The worker can watch the Wi-Fi inbox and apply only the approved assignment.
- No per-task copy/paste is required after the session starts.

## How It Works

1. The master laptop runs the bridge and evaluates the current Evolution priority.
2. The master laptop starts a session watcher that broadcasts the approved
   assignment packet to the trusted worker node.
3. The worker laptop starts a session watcher that advertises readiness and
   reads the Wi-Fi inbox.
4. The worker laptop sends a bootstrap `worker_join_request` packet so the
   master can see the worker even before trust is finalized.
5. When the master discovers trusted ready worker nodes, it broadcasts the
   approved assignment packet to all of them automatically.
6. The worker laptop also sends periodic heartbeats so the master can tell
   which workers are fresh, ready, or stale.
7. When a worker receives an approved assignment packet, it records the
   applied assignment locally, can submit a completion packet back to the
   master, and keeps waiting for later broadcasts.

## Startup Commands

Master laptop:

```bash
kvdf multi-ai evolution session master --watch
```

Worker laptop:

```bash
kvdf multi-ai evolution session worker --watch
```

## Safety Rules

- The worker does not push to GitHub.
- The worker does not self-approve.
- The master discovers trusted ready worker nodes and does not widen scope
  beyond the current bridge decision.
- If Wi-Fi/LAN is unavailable, the session stays local and safe.
- If the bridge decision is blocked, the session does not broadcast.
- If a worker stops heartbeating, the master requeues the assignment to a
  fresh ready worker instead of reusing the stale node.
- The worker join packet is a governed bootstrap packet. It helps the worker
  become visible to the master without turning discovery into trust.
- If a worker comes back after a timeout, it can send a fresh join request and
  the master records the worker as recovered.
- If the worker sends a completion packet, the master records the completion
  and keeps the session ready for the next assignment.
- The session command also shows a combined badge like `attention / fresh` so
  the health and assignment freshness are visible on one line.

## Outputs

The session command reports:

- role
- transport status
- broadcast status
- received packet status
- heartbeat status
- completion status
- the current assignment
- the next safe action

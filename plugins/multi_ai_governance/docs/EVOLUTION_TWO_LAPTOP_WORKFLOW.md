# Evolution Two-Laptop Workflow

This workflow keeps one machine as the master laptop and one or more machines as worker laptops for the current Evolution priority.

## Master Laptop

- Keep this laptop as the canonical output owner.
- Keep GitHub push authority here only.
- Review the current bridge report before handing out work.
- Create or confirm leases before the worker edits files.
- Review diffs, run tests, and push only from this machine.

## Worker Laptop

- Treat this machine as worker-only.
- Do not push to GitHub.
- Do not widen the scope.
- Edit only the assigned files or leased scope.
- Report changed files, tests, blockers, and risks back to the master laptop.

## Recommended Flow

1. On the master laptop, run `kvdf multi-ai evolution status`.
2. If the bridge decision is safe, run `kvdf multi-ai evolution assign`.
3. Start the session watcher on the master laptop with `kvdf multi-ai evolution session master --watch`.
4. Start the session watcher on the worker laptop with `kvdf multi-ai evolution session worker --watch`.
5. The master laptop scans the LAN, discovers trusted ready worker nodes, and broadcasts the approved assignment packet automatically over Wi-Fi/LAN.
6. The worker laptop advertises readiness, sends periodic heartbeats, watches the inbox, applies the approved assignment packet, and can submit a completion packet back to the master.
7. If a worker goes stale, the master requeues the assignment to a fresh ready worker rather than reusing the stale node.
8. Accept only the assigned scope and run the relevant tests.
9. Return the diff, tests, and completion packet to the master laptop.
10. Review on the master laptop, then commit and push only from here.

## Safety Rules

- The worker laptop never pushes.
- The worker laptop never self-approves.
- The master laptop remains the final reviewer and merge coordinator.
- If a conflict appears in any case, pause the assignment and re-run the bridge report before continuing.
- If a worker stops heartbeating, do not assign new work until the worker is fresh again or the assignment is requeued.
- If a worker times out and then rejoins, the master should treat it as a recovered worker and return it to the pool only after a fresh join or heartbeat.
- The worker session report should show a master overview line so the worker can see whether the current assignment is pending, completed, or recovering.

## Outputs

The workflow command prints:

- the current bridge decision
- the master checklist
- the worker prompt
- the next safe action
- the current worker pool freshness
- the session broadcast or inbox status when the watch mode is running

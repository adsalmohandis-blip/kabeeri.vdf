# AI Usage Accounting Foundation

**v1.5.0** establishes the foundation for tracking AI token usage across tasks, sprints, and workstreams.

---

## Purpose

Track how many AI tokens are used, by whom, for what work, and at what cost. This enables:

- **Budget forecasting** — Predict MVP cost before building
- **Cost optimization** — Identify expensive features
- **Pricing modeling** — What does each feature cost?
- **Team learning** — Which tasks are inefficient?
- **Future planning** — Budget for v2, new features

---

## AI Usage vs Access Tokens

### Access Tokens (not tracked here)

Used to authenticate with API services:
- GitHub API token
- Claude/OpenAI API key
- Database credentials
- AWS credentials

These are **secrets**, not tracked for cost accounting.

### AI Usage Tokens (tracked in v1.5.0)

Tokens consumed by LLM models:
- Claude input tokens
- Claude output tokens
- GPT input/output tokens
- Cached tokens (cheaper, still counted)

These are **metered** and **billed**, so we track them.

---

## Folder Structure

```
.kabeeri/
└── ai_usage/
    ├── usage_events.jsonl (append-only log)
    ├── usage_summary.json (rolled-up summary)
    ├── pricing_rules.json (user-configured pricing)
    ├── cost_breakdown.json (categorized costs)
    ├── sprint_costs.json (per-sprint)
    └── README.md
```

---

## Files & Schemas

### usage_events.jsonl

Append-only log of every AI usage event.

**Format:** One JSON object per line (JSONL)

```json
{"event_id":"evt-001","timestamp":"2026-05-07T10:00:00Z","task_id":"task-001","workstream":"04_CORE_FEATURES","developer_id":"dev-001","provider":"claude","model":"claude-3-5-sonnet","input_tokens":1500,"output_tokens":3200,"cached_tokens":0,"total_tokens":4700,"cost_cents":141,"source":"manual_entry","tracked":true}
{"event_id":"evt-002","timestamp":"2026-05-07T10:30:00Z","task_id":"task-001","workstream":"04_CORE_FEATURES","developer_id":"dev-001","provider":"openai","model":"gpt-4","input_tokens":2000,"output_tokens":1500,"cached_tokens":0,"total_tokens":3500,"cost_cents":140,"source":"api_logging","tracked":true}
```

**Fields:**
- `event_id`: Unique event ID
- `timestamp`: ISO 8601 timestamp
- `task_id`: Which task (must exist)
- `workstream`: Which workstream
- `developer_id`: Who ran the AI
- `provider`: claude, openai, anthropic, etc.
- `model`: Specific model (claude-3-5-sonnet, gpt-4, etc.)
- `input_tokens`: Tokens in prompt
- `output_tokens`: Tokens generated
- `cached_tokens`: Tokens reused from cache (cheaper)
- `total_tokens`: Sum of all tokens
- `cost_cents`: Cost in cents (calculated from pricing_rules)
- `source`: How was this tracked? (manual_entry, api_logging, untracked)
- `tracked`: Is this counted in official budget?

### pricing_rules.json

User-configurable pricing (not hard-coded):

```json
{
  "currency": "USD",
  "token_unit": 1000,
  "providers": [
    {
      "name": "claude",
      "models": [
        {
          "name": "claude-3-5-sonnet",
          "input_price_per_1k": 0.003,
          "output_price_per_1k": 0.015,
          "cached_input_price_per_1k": 0.00030
        }
      ]
    },
    {
      "name": "openai",
      "models": [
        {
          "name": "gpt-4",
          "input_price_per_1k": 0.03,
          "output_price_per_1k": 0.06,
          "cached_input_price_per_1k": 0.015
        }
      ]
    }
  ],
  "pricing_source": "https://pricing.anthropic.com",
  "last_updated": "2026-05-01"
}
```

**Note:** Users manually update this file based on current pricing. No prices are hard-coded.

### usage_summary.json

Rolled-up summary (can be regenerated from events):

```json
{
  "period": "2026-05-07",
  "total_events": 124,
  "total_tokens": {
    "input": 85000,
    "output": 120000,
    "cached": 15000,
    "total": 220000
  },
  "total_cost_cents": 3250,
  "by_provider": {
    "claude": {
      "events": 98,
      "tokens": 180000,
      "cost_cents": 2700
    },
    "openai": {
      "events": 26,
      "tokens": 40000,
      "cost_cents": 550
    }
  },
  "by_workstream": {
    "04_CORE_FEATURES": {
      "tokens": 150000,
      "cost_cents": 2250
    },
    "05_DATA_AND_DATABASE": {
      "tokens": 50000,
      "cost_cents": 750
    },
    "06_INTEGRATIONS_AND_APIS": {
      "tokens": 20000,
      "cost_cents": 250
    }
  },
  "by_developer": {
    "dev-001": {
      "events": 50,
      "tokens": 100000,
      "cost_cents": 1500
    },
    "dev-002": {
      "events": 74,
      "tokens": 120000,
      "cost_cents": 1750
    }
  },
  "tracked_vs_untracked": {
    "tracked": {
      "events": 120,
      "tokens": 210000,
      "cost_cents": 3100
    },
    "untracked": {
      "events": 4,
      "tokens": 10000,
      "cost_cents": 150
    }
  }
}
```

### cost_breakdown.json

Categorized breakdown:

```json
{
  "period": "2026-05-07",
  "total_cost_cents": 3250,
  "breakdown": {
    "by_category": {
      "feature_development": {
        "tokens": 150000,
        "cost_cents": 2250,
        "tasks": 18
      },
      "bug_fixes": {
        "tokens": 30000,
        "cost_cents": 450,
        "tasks": 4
      },
      "tech_debt": {
        "tokens": 20000,
        "cost_cents": 300,
        "tasks": 2
      },
      "documentation": {
        "tokens": 20000,
        "cost_cents": 250,
        "tasks": 3
      }
    },
    "by_status": {
      "accepted_first_pass": {
        "tokens": 180000,
        "cost_cents": 2700,
        "acceptance_rate": "90%"
      },
      "rework": {
        "tokens": 30000,
        "cost_cents": 450,
        "acceptance_rate": "10%"
      }
    }
  }
}
```

### sprint_costs.json

Per-sprint tracking:

```json
{
  "sprints": [
    {
      "sprint_id": "sprint-001",
      "dates": "2026-05-07 to 2026-05-21",
      "total_tokens": 85000,
      "total_cost_cents": 1275,
      "stories": [
        {
          "story_id": "story-001",
          "tokens": 15000,
          "cost_cents": 225
        },
        {
          "story_id": "story-002",
          "tokens": 12000,
          "cost_cents": 180
        }
      ],
      "cost_per_point": {
        "tokens": 2428,
        "cost_cents": 36.43
      }
    }
  ]
}
```

---

## Untracked Usage Rules

Usage that doesn't belong in cost accounting:

### Definition

**Untracked usage** is AI usage without:
- Valid task_id, OR
- Approved budget allocation, OR
- Valid source_reference

### Examples

```json
{
  "event_id": "evt-untracked-001",
  "timestamp": "2026-05-07T15:00:00Z",
  "task_id": null,
  "developer_id": "dev-001",
  "reason": "Random exploration, no task",
  "tokens": 5000,
  "tracked": false
}
```

### Handling Untracked

1. Log it in usage_events.jsonl with `tracked: false`
2. Show in cost_breakdown as separate category
3. Alert: "Untracked usage detected"
4. Action: Either create task, or move to learning budget

---

## Monitoring & Alerts

### Budget Alerts

```
Sprint 1 Budget: 50,000 tokens
Sprint 1 Used: 48,000 tokens
Alert: 96% of budget used, 3 days left in sprint

Action: 
- Prioritize remaining stories carefully
- If need more, escalate to product lead
- May defer low-priority stories
```

### Efficiency Alerts

```
Story A: 8,000 tokens for simple form
Story B: 9,000 tokens for complex API

Analysis: Story A costs more than expected
Alert: "Story A efficiency below target"

Action:
- Review: Did story grow in scope?
- Learn: Is form validation complex?
- Adjust: Future forms estimated higher
```

### Quality Alerts

```
Story: 10,000 tokens for first pass
Rework: 5,000 tokens for fixes (50% rework cost)

Alert: "High rework rate for this story"

Action:
- Review: Acceptance criteria clear?
- Learn: Better planning needed?
- Improve: Tighter DoR for next sprint
```

---

## Integration Points

### With Task Governance

Every task has token estimate:

```markdown
## Task Estimation

estimated_tokens: 12000
estimated_hours: 6

# After execution:

actual_tokens: 11500 (⬇ 4% efficient)
actual_hours: 5.5 (⬇ 8% efficient)
```

### With Sprint Tracking

Sprint cost metrics:

```
Sprint 1 Summary
- Completed: 35 story points
- Tokens used: 85,000
- Cost: $1.27
- Velocity: 35 points / $1.27 = 27.6 points per dollar
```

### With Acceptance Checklists

Rework costs flagged:

```
Acceptance Review: FAILED
Issues found: 3
Rework cost estimated: 4000 tokens

Story moves to: REWORK_NEEDED
Tracking: Cost marked as rework (quality metric)
```

---

## Usage Scenarios

### Scenario 1: New Developer Learning

```
Developer: "I'm new, using AI to learn codebase"
Task: task-learning-001 (learning budget)
Tokens: 5,000
Status: tracked (learning budget)
Note: Normal for new team members first week
```

### Scenario 2: AI Exploration

```
AI: "Suggesting alternative implementation"
Developer: "Interesting, let me explore"
Usage: 8,000 tokens
Status: untracked (exploration)
Action: If exploration leads to task, link retroactively
```

### Scenario 3: Production Issue

```
Bug: "Production API down"
Emergency task: task-emergency-001
AI investigation: 2,000 tokens
Status: tracked (critical priority)
Note: Marked as urgent in cost breakdown
```

---

## Reporting & Analytics (Future)

In v1.6+, dashboard would show:

- Cost trends over time
- Most expensive features
- Team efficiency metrics
- Budget vs actual
- ROI per feature
- Forecast for v2

---

## Cost Forecasting Example

```
Completed features: 5 features
Tokens used: 50,000 tokens
Cost to date: $0.75

Remaining MVP features: 8 features

Forecast:
- Avg tokens per feature: 10,000
- Remaining tokens: 80,000
- Remaining cost: $1.20
- Total MVP cost: $1.95

Budget: $10
- Used: $0.75
- Remaining: $9.25
- Status: ✅ On track
```

---

## Manual Entry Example

If not using API logging:

```markdown
# AI Usage Entry

Date: 2026-05-07  
Developer: james@example.com  
Task: task-001 (User authentication)  
AI Tool: Claude  
Model: claude-3-5-sonnet  

Tokens:
- Input: 1,500
- Output: 3,200
- Total: 4,700

How tracked: Manual entry (copied from Claude UI)
Estimated cost: $0.14 (using current pricing)

Acceptance: First pass ✅
```

---

## Best Practices

1. **Log consistently** — Every AI usage gets logged
2. **Use pricing_rules.json** — Keep pricing current
3. **Tag workstreams** — Every event categorized
4. **Accept first pass** — Minimize rework costs
5. **Review efficiency** — Track tokens vs scope
6. **Budget planning** — Forecast before building

---

## FAQ

**Q: Why track AI tokens vs just money?**  
A: Tokens are provider-independent. If you switch from Claude to OpenAI, token counts stay comparable.

**Q: Can I just use AI without logging?**  
A: You can, but it won't be tracked for budgeting. Mark as `untracked: true`.

**Q: Who enters the token counts?**  
A: Developer after each AI session (manual), or API logging hook (automated).

**Q: What if I exceed my sprint budget?**  
A: Escalate to product lead. Either reduce scope or increase budget.

**Q: Can I allocate budget differently between sprints?**  
A: Yes, but track in sprint_costs.json and adjust pricing_rules if needed.

---

## Next Steps

1. **Set up .kabeeri/ai_usage/** folder
2. **Configure pricing_rules.json** (get current prices)
3. **Create logging process** (manual or API hook)
4. **Start logging** usage_events.jsonl
5. **Review weekly** usage_summary.json
6. **Forecast** remaining project cost

---

## Related Documents

- [../task_governance/](../task_governance/) — Task estimation (includes token estimates)
- [../agile_delivery/](../agile_delivery/) — Sprint cost tracking
- [SPRINT_COST_METADATA.md](../agile_delivery/SPRINT_AND_BACKLOG_CORE.md) — Sprint-level costs

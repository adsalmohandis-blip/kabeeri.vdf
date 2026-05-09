# Visual Acceptance Runtime

Visual Acceptance Runtime completes Design Governance after frontend implementation.

Existing Design Source Governance already controls the path before coding:

```text
raw source -> snapshot -> approved text spec -> approved page spec -> approved component contract
```

This runtime controls the path after coding:

```text
implemented UI -> screenshot evidence -> visual review -> design gate -> Owner/client verify
```

It is useful for Codex and vibe developers because it prevents vague claims such as "the UI looks good" from becoming accepted work without evidence.

## Commands

```bash
kvdf design visual-review \
  --page page-spec-001 \
  --task task-001 \
  --screenshots desktop.png,mobile.png \
  --checks responsive,states,accessibility \
  --decision pass \
  --reviewer designer-001

kvdf design visual-review-list
kvdf design gate --task task-001 --page page-spec-001 --json
kvdf validate design
```

## Runtime State

Visual reviews are stored in:

```text
.kabeeri/design_sources/visual_reviews.json
```

Each review records:

- `review_id`
- `task_id`
- `page_spec_id`
- `source_id`
- `screenshots`
- `viewport_checks`
- `checks`
- `deviations`
- `decision`: `pass`, `needs_rework`, or `blocked`
- `reviewer`
- `notes`

## Design Gate

`kvdf design gate` checks whether a frontend task has enough design evidence to move toward verification.

The gate blocks when:

- no page spec is provided
- page spec is missing
- page spec is not approved
- passing visual review is missing

The gate warns when:

- no approved component contract is linked
- the task is not in a known frontend workstream and no page is supplied

## Relationship To Existing Governance

This feature does not replace:

- design source intake
- source snapshots
- approved text specs
- page specs
- component contracts
- task acceptance review
- Owner verification

It adds the missing visual evidence step between frontend implementation and final verification.

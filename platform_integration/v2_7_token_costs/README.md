# v2.7.0 - AI Token Cost Dashboard

Goal: convert AI token usage into cost, pricing, and quality analytics.

## Dashboard Sections

The token dashboard should show totals and breakdowns by:

- version
- milestone
- sprint
- task
- developer/AI agent
- workstream
- provider
- model
- accepted work vs rejected/rework
- tracked vs untracked usage

## Calculator

Pricing must be user-configured, never hard-coded.

Supported units:

- per token
- per 1K tokens
- per 1M tokens

Supported token categories:

- input
- output
- cached input
- cached output, if provider supports it

Supported fields:

- `currency`
- `provider`
- `model`
- `input_price`
- `output_price`
- `cached_input_price`
- `cached_output_price`
- `unit`
- `last_updated`
- `pricing_source`

## Workstream Breakdown

Standard buckets:

- `backend`
- `public_frontend`
- `admin_frontend`
- `database`
- `docs`
- `testing`
- `debugging`
- `refactor`
- `business_analysis`
- `untracked`

## Developer Efficiency

Efficiency analytics should include:

- total tokens
- total cost
- accepted cost
- rejected/rework cost
- untracked cost
- average cost per accepted task
- high usage warnings

Warnings are advisory. They should not automatically block work.

## Acceptance Criteria

- All token breakdowns are documented.
- Calculator supports user-defined prices and currencies.
- Cost shows where tokens went.
- Developer/agent efficiency can be reviewed.


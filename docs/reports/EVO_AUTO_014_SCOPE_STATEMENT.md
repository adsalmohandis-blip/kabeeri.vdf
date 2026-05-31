# EVO_AUTO_014 Scope Statement

## Priority

- ID: `evo-auto-014`
- Title: `Dashboard separation`
- Source: `technical_debt_review`

## Scope

This priority keeps owner and viber dashboards separate products with distinct state builders, report types, and export paths.

The scope includes:

- owner dashboard JSON contract
- viber dashboard JSON contract
- separate dashboard exports
- track-scoped dashboard behavior in the CLI

## Out of scope

- merging the dashboards into one filtered page
- changing unrelated planner or evolution behavior
- removing the separate report types
- weakening track-scoped dashboard routing

## Success criteria

- owner and viber dashboard states are distinct
- dashboard export preserves separate outputs
- the CLI makes the split obvious
- tests and docs keep the separation explicit


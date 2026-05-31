# EVO_AUTO_015 Scope Statement

## Priority

- ID: `evo-auto-015`
- Title: `Fast test layers`
- Source: `technical_debt_review`

## Scope

This priority keeps fast unit/service tests beside slower integration tests so everyday development gets quick feedback without losing end-to-end coverage.

The scope includes:

- a clearly separated fast service/unit layer
- a clearly separated slower integration layer
- documentation that points developers at the correct tier
- evolution status that reflects the split

## Out of scope

- removing integration coverage
- forcing every behavior change through the slower suite first
- rewriting product behavior to make tests pass
- merging all checks into one undifferentiated command

## Success criteria

- service/unit validation stays fast and local
- integration coverage remains separate and available
- docs and evolution status reflect the layered testing model
- the fast path is still useful for routine behavior changes

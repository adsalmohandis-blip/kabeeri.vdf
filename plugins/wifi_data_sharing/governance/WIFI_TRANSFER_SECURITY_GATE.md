# Wi-Fi Transfer Security Gate

`wifi_data_sharing` treats trust, receipt, and acceptance as separate steps.
This gate exists to keep those steps explicit and reviewable.

## Principles

- A trusted node does not automatically mean a trusted package.
- Every received package starts in quarantine and inbox review.
- Package release is always manual.
- No package is executable by default.
- `multi_ai_governance` remains the authority for AI work and package consumption decisions.

## What The Gate Checks

- Sender node trust status
- Revocation status
- Allowed package type
- Size limits
- Hash integrity
- Executable-looking extensions or scripts
- Unsafe path indicators
- Secret-like payload markers
- Inbox review requirement
- Transfer confirmation
- Manifest/source alignment
- Package schema validity
- Maximum package age

## Expected Workflow

1. A trusted sender delivers a package into inbox quarantine.
2. An operator runs `kvdf wifi-data-sharing security check --package <package-id>`.
3. The policy result is recorded locally.
4. The operator reviews the quarantine entry.
5. The operator may release the package from quarantine with `--confirm`.
6. The package can then be accepted in inbox review with `--confirm`.

## Safety Boundary

- The gate does not execute package contents.
- The gate does not auto-apply package contents.
- The gate does not modify `multi_ai_governance`.
- The gate does not replace inbox review or operator judgment.

## Runtime Records

- Policy results: `.kabeeri/wifi_transfer_policy_results.json`
- Quarantine state: `.kabeeri/wifi_data_quarantine.json`

## Notes

- Security pass is required before release or acceptance.
- Failed or suspicious packages remain quarantined until a human explicitly rejects them.

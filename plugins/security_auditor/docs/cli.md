# Security Auditor CLI

```bash
kvdf security-auditor status
kvdf security-auditor scan
kvdf security-auditor scan --task task-001
kvdf security-auditor scan --evolution current
kvdf security-auditor report
kvdf plugins install security-auditor
kvdf plugins uninstall security-auditor
```

## Behavior

- `status` is safe to run even when no scan has been recorded yet.
- `scan` writes the latest scan to `.kabeeri/security/security_auditor_scans.json`.
- `report` returns the latest scan summary and findings as JSON or text.
- `scan` and `report` are optional plugin actions and should be enabled through `kvdf plugins install security-auditor`.
- KVDF Core reads that scan history when building the optional security gate status surface.

## Supported Findings

The scanner looks for:
- private keys and API keys
- `.env` leakage
- hardcoded passwords and secrets
- `eval` and `Function` constructor use
- shell execution patterns
- insecure CORS settings
- unsafe upload hints
- SQL injection hints
- XSS injection hints
- missing auth warnings for admin/internal routes
- suspicious backdoor-like comments or hidden admin routes

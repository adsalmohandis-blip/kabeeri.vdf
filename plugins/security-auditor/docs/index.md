# Security Auditor

Security Auditor is an optional, removable KVDF plugin that scans workspace files and governed runtime state for common security risks before completion, handoff, or release.

It is built for:
- secret leakage detection
- injection-risk hints
- insecure route and auth warnings
- handoff and release preflight checks

The plugin is intentionally lightweight:
- KVDF Core owns the security gate policy.
- KVDF Core also owns the read-only security gate status surface.
- Security Auditor owns the scanner implementation.
- The plugin does not require external security tools.
- The plugin is shared across owner, vibe, and plugin tracks.

## References

- [CLI guide](cli.md)

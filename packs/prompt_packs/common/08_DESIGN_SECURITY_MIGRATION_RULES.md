# Design, Security, And Migration Rules

- Do not implement frontend visuals from raw design sources; use approved design text specs, page specs, component contracts, or a documented exception.
- Do not expose secrets, service role keys, private credentials, signing keys, or payment secrets in generated code.
- Treat authentication, payments, permissions, personal data, and admin actions as high-risk surfaces.
- Do not run destructive migrations or irreversible data changes from a prompt alone.
- For migration work, require a migration plan, rollback plan, and dry-run/check evidence where available.
- For UI work, include accessibility, empty, loading, error, and responsive behavior in the review evidence.
- For architecture-impacting choices, create or link an ADR and connect meaningful AI runs to it.

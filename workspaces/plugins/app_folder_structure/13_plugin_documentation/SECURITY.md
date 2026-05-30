# Security

Security rules:

- fail closed on unsafe slugs
- fail closed on invalid category profiles
- never write outside the governed app workspace root
- never overwrite non-empty files without an explicit safe path
- keep source tracking neutral in `08_source/`
- require evidence for create, validate, and repair operations

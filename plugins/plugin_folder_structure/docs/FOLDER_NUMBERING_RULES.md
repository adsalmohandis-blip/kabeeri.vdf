# Folder Numbering Rules

The Plugin Development Track workspace uses one canonical numbered layout.

## Numbering

1. `00` - inputs
2. `01` - identity
3. `02` - roadmaps and plans
4. `03` - specifications
5. `04` - plugin package
6. `05` - version control
7. `06` - evolutions
8. `07` - task punches
9. `08` - agents
10. `09` - tests and quality
11. `10` - evidence and audit
12. `11` - reviews and approvals
13. `12` - package and release
14. `13` - documentation
15. `99` - archive

## Rules

- `04_plugin_package/` is the real candidate plugin package.
- `08_plugin_source/` is not part of the canonical structure.
- Folder numbers must remain sequential.
- Legacy folders may only be used for migration history or archive notes.
- The package promoted to Owner Track must come from `04_plugin_package/`.

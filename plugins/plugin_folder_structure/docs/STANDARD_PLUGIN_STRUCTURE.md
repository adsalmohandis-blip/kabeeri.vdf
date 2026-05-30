# Standard Plugin Structure

The plugin folder structure engine defines one standard plugin package and applies it consistently to Owner Track and Plugin Development Track.

Owner Track creates the package directly under `./plugins/<plugin-slug>/`.

Plugin Development Track creates the workspace under `./workspaces/plugins/<plugin-slug>/` and the real candidate package under `./workspaces/plugins/<plugin-slug>/04_plugin_package/`.

The canonical Plugin Development Track workspace numbering is:

1. `00_plugin_inputs/`
2. `01_plugin_identity/`
3. `02_plugin_roadmaps_plans/`
4. `03_plugin_specifications/`
5. `04_plugin_package/`
6. `05_plugin_version_control/`
7. `06_plugin_evolutions/`
8. `07_plugin_task_punches/`
9. `08_plugin_agents/`
10. `09_plugin_tests_quality/`
11. `10_plugin_evidence_audit/`
12. `11_plugin_reviews_approvals/`
13. `12_plugin_package_release/`
14. `13_plugin_documentation/`
15. `99_plugin_archive/`

There is no redundant `08_plugin_source/` folder in the canonical model.

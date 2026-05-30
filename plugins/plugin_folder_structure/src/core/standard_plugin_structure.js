const OWNER_PACKAGE_ROOT = "plugins";
const WORKSPACE_ROOT = "workspaces/plugins";
const WORKSPACE_PACKAGE_SEGMENT = "04_plugin_package";

const STANDARD_PACKAGE_DIRS = [
  "src",
  "src/commands",
  "src/services",
  "src/core",
  "src/adapters",
  "src/policies",
  "src/utils",
  "schemas",
  "docs",
  "docs/integrations",
  "docs/policies",
  "tests",
  "tests/unit",
  "tests/contract",
  "tests/integration",
  "tests/smoke",
  "tests/fixtures",
  "prompts",
  "dashboard",
  "dashboard/views",
  "dashboard/widgets",
  "examples",
  "config"
];

const STANDARD_PACKAGE_FILES = [
  "plugin.json",
  "bootstrap.js",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "plugin_manifest.json",
  "docs/OVERVIEW.md",
  "docs/COMMANDS.md",
  "docs/ARCHITECTURE.md",
  "docs/SCHEMAS.md",
  "docs/RUNTIME.md",
  "docs/INTEGRATIONS.md",
  "docs/PERMISSIONS.md",
  "docs/SECURITY.md",
  "docs/TESTING.md",
  "docs/TROUBLESHOOTING.md"
];

const LEGACY_COMPACT_WORKSPACE_DIRS = [
  "00_inputs",
  "00_inputs/files",
  "00_inputs/screenshots",
  "00_inputs/git_libraries",
  "00_inputs/git_libraries/reviews",
  "01_spec",
  "02_tasks",
  "03_plugin_package",
  "04_evidence",
  "05_release"
];

const LEGACY_COMPACT_WORKSPACE_FILES = [
  "00_inputs/links.md",
  "00_inputs/questions_answers.md",
  "00_inputs/git_libraries/libraries.md",
  "00_inputs/git_libraries/selected_libraries.json",
  "00_inputs/git_libraries/adoption_decisions.md",
  "01_spec/plugin_brief.md",
  "01_spec/plugin_type.md",
  "01_spec/plugin_scope.md",
  "01_spec/architecture.md",
  "01_spec/commands.md",
  "01_spec/schemas.md",
  "01_spec/runtime.md",
  "01_spec/integrations.md",
  "01_spec/dashboard.md",
  "01_spec/security.md",
  "01_spec/marketplace.md",
  "01_spec/acceptance_criteria.md",
  "02_tasks/evolution_index.md",
  "02_tasks/tasks.md",
  "04_evidence/readiness_report.md",
  "04_evidence/readiness_report.json",
  "04_evidence/test_summary.md",
  "04_evidence/security_summary.md",
  "04_evidence/integration_summary.md",
  "04_evidence/license_summary.md",
  "04_evidence/git_library_summary.md",
  "04_evidence/approval_summary.md",
  "04_evidence/audit_log.md",
  "04_evidence/audit_log.jsonl",
  "05_release/package_manifest.json",
  "05_release/promotion_manifest.json",
  "05_release/promotion_archive_manifest.json",
  "05_release/checksums.json",
  "05_release/owner_approval_request.json",
  "05_release/owner_decision.json",
  "05_release/direct_install_request.json",
  "05_release/marketplace_upload_request.json"
];

const WORKSPACE_WRAPPER_DIRS = LEGACY_COMPACT_WORKSPACE_DIRS;
const WORKSPACE_WRAPPER_FILES = LEGACY_COMPACT_WORKSPACE_FILES;

const CANONICAL_WORKSPACE_DIRS = [
  "00_plugin_inputs",
  "00_plugin_inputs/uploaded_snapshots",
  "00_plugin_inputs/uploaded_external_files",
  "00_plugin_inputs/git_libraries",
  "00_plugin_inputs/git_libraries/library_analysis",
  "00_plugin_inputs/git_libraries/license_review",
  "00_plugin_inputs/git_libraries/security_review",
  "00_plugin_inputs/git_libraries/compatibility_review",
  "00_plugin_inputs/git_libraries/maintenance_review",
  "01_plugin_identity",
  "02_plugin_roadmaps_plans",
  "02_plugin_roadmaps_plans/architecture_plan",
  "02_plugin_roadmaps_plans/command_surface_plan",
  "02_plugin_roadmaps_plans/runtime_state_plan",
  "02_plugin_roadmaps_plans/schema_plan",
  "02_plugin_roadmaps_plans/dashboard_plan",
  "02_plugin_roadmaps_plans/integration_plan",
  "02_plugin_roadmaps_plans/testing_plan",
  "02_plugin_roadmaps_plans/release_plan",
  "02_plugin_roadmaps_plans/marketplace_plan",
  "03_plugin_specifications",
  "03_plugin_specifications/integration_specification",
  "05_plugin_version_control",
  "05_plugin_version_control/branches",
  "05_plugin_version_control/issues",
  "05_plugin_version_control/pull_requests",
  "05_plugin_version_control/releases",
  "06_plugin_evolutions",
  "06_plugin_evolutions/evolution_0001",
  "07_plugin_task_punches",
  "07_plugin_task_punches/pending",
  "07_plugin_task_punches/active",
  "07_plugin_task_punches/blocked",
  "07_plugin_task_punches/completed",
  "08_plugin_agents",
  "08_plugin_agents/agent_logs",
  "09_plugin_tests_quality",
  "09_plugin_tests_quality/unit_tests",
  "09_plugin_tests_quality/contract_tests",
  "09_plugin_tests_quality/integration_tests",
  "09_plugin_tests_quality/smoke_tests",
  "09_plugin_tests_quality/security_tests",
  "09_plugin_tests_quality/marketplace_readiness_tests",
  "09_plugin_tests_quality/fixtures",
  "09_plugin_tests_quality/test_reports",
  "10_plugin_evidence_audit",
  "10_plugin_evidence_audit/requirement_evidence",
  "10_plugin_evidence_audit/git_library_evidence",
  "10_plugin_evidence_audit/command_evidence",
  "10_plugin_evidence_audit/schema_evidence",
  "10_plugin_evidence_audit/runtime_evidence",
  "10_plugin_evidence_audit/integration_evidence",
  "10_plugin_evidence_audit/security_evidence",
  "10_plugin_evidence_audit/test_evidence",
  "10_plugin_evidence_audit/owner_approval_evidence",
  "10_plugin_evidence_audit/marketplace_request_evidence",
  "11_plugin_reviews_approvals",
  "12_plugin_package_release",
  "12_plugin_package_release/release_notes",
  "12_plugin_package_release/changelog",
  "12_plugin_package_release/sanitized_marketplace_bundle",
  "12_plugin_package_release/private_evidence_bundle",
  "12_plugin_package_release/deployment_checks",
  "13_plugin_documentation",
  "99_plugin_archive",
  "99_plugin_archive/evidence_bundle"
];

const CANONICAL_WORKSPACE_FILES = [
  "00_plugin_inputs/links.md",
  "00_plugin_inputs/questions_answers.md",
  "00_plugin_inputs/git_libraries/libraries.md",
  "00_plugin_inputs/git_libraries/selected_libraries.json",
  "00_plugin_inputs/git_libraries/adoption_decisions.md",
  "01_plugin_identity/plugin_brief.md",
  "01_plugin_identity/plugin_type.md",
  "01_plugin_identity/plugin_scope.md",
  "01_plugin_identity/plugin_dependencies.md",
  "01_plugin_identity/plugin_permissions.md",
  "01_plugin_identity/plugin_market_position.md",
  "01_plugin_identity/success_criteria.md",
  "02_plugin_roadmaps_plans/architecture_plan/README.md",
  "02_plugin_roadmaps_plans/command_surface_plan/README.md",
  "02_plugin_roadmaps_plans/runtime_state_plan/README.md",
  "02_plugin_roadmaps_plans/schema_plan/README.md",
  "02_plugin_roadmaps_plans/dashboard_plan/README.md",
  "02_plugin_roadmaps_plans/testing_plan/README.md",
  "02_plugin_roadmaps_plans/release_plan/README.md",
  "02_plugin_roadmaps_plans/marketplace_plan/README.md",
  "02_plugin_roadmaps_plans/integration_plan/dependency_map.md",
  "02_plugin_roadmaps_plans/integration_plan/required_integrations.md",
  "02_plugin_roadmaps_plans/integration_plan/optional_integrations.md",
  "02_plugin_roadmaps_plans/integration_plan/provided_capabilities.md",
  "02_plugin_roadmaps_plans/integration_plan/consumed_capabilities.md",
  "02_plugin_roadmaps_plans/integration_plan/event_hooks_plan.md",
  "02_plugin_roadmaps_plans/integration_plan/command_delegation_plan.md",
  "02_plugin_roadmaps_plans/integration_plan/dashboard_integration_plan.md",
  "02_plugin_roadmaps_plans/integration_plan/conflict_resolution_plan.md",
  "03_plugin_specifications/plugin_specification.md",
  "03_plugin_specifications/command_specification.md",
  "03_plugin_specifications/schema_specification.md",
  "03_plugin_specifications/runtime_specification.md",
  "03_plugin_specifications/integration_specification/integration_contracts.md",
  "03_plugin_specifications/integration_specification/plugin_dependency_contracts.md",
  "03_plugin_specifications/integration_specification/command_contracts.md",
  "03_plugin_specifications/integration_specification/event_hook_contracts.md",
  "03_plugin_specifications/integration_specification/schema_contracts.md",
  "03_plugin_specifications/integration_specification/runtime_state_contracts.md",
  "03_plugin_specifications/integration_specification/permission_contracts.md",
  "03_plugin_specifications/integration_specification/dashboard_contracts.md",
  "03_plugin_specifications/integration_specification/compatibility_rules.md",
  "03_plugin_specifications/dashboard_specification.md",
  "03_plugin_specifications/security_specification.md",
  "03_plugin_specifications/marketplace_specification.md",
  "03_plugin_specifications/acceptance_criteria.md",
  "04_plugin_package/plugin.json",
  "04_plugin_package/bootstrap.js",
  "04_plugin_package/README.md",
  "04_plugin_package/CHANGELOG.md",
  "04_plugin_package/LICENSE",
  "04_plugin_package/plugin_manifest.json",
  "04_plugin_package/docs/OVERVIEW.md",
  "04_plugin_package/docs/COMMANDS.md",
  "04_plugin_package/docs/ARCHITECTURE.md",
  "04_plugin_package/docs/SCHEMAS.md",
  "04_plugin_package/docs/RUNTIME.md",
  "04_plugin_package/docs/INTEGRATIONS.md",
  "04_plugin_package/docs/PERMISSIONS.md",
  "04_plugin_package/docs/SECURITY.md",
  "04_plugin_package/docs/TESTING.md",
  "04_plugin_package/docs/TROUBLESHOOTING.md",
  "04_plugin_package/src/index.js",
  "04_plugin_package/src/commands/register.js",
  "04_plugin_package/src/commands/status.js",
  "04_plugin_package/src/commands/create.js",
  "04_plugin_package/src/core/constants.js",
  "04_plugin_package/src/core/errors.js",
  "04_plugin_package/src/core/track_resolver.js",
  "04_plugin_package/src/core/standard_plugin_structure.js",
  "04_plugin_package/src/services/status_service.js",
  "04_plugin_package/src/services/target_path_service.js",
  "04_plugin_package/src/services/package_structure_service.js",
  "04_plugin_package/src/utils/fs_safe.js",
  "04_plugin_package/src/utils/json_safe.js",
  "04_plugin_package/src/utils/slugify.js",
  "04_plugin_package/src/adapters/index.js",
  "04_plugin_package/src/policies/index.js",
  "04_plugin_package/tests/unit/status_service.test.js",
  "04_plugin_package/tests/unit/target_path_service.test.js",
  "04_plugin_package/tests/unit/package_structure_service.test.js",
  "04_plugin_package/tests/contract/plugin_contract.test.js",
  "04_plugin_package/tests/README.md",
  "04_plugin_package/prompts/README.md",
  "04_plugin_package/dashboard/README.md",
  "04_plugin_package/dashboard/views/README.md",
  "04_plugin_package/dashboard/widgets/README.md",
  "04_plugin_package/examples/README.md",
  "04_plugin_package/config/README.md",
  "04_plugin_package/schemas/README.md",
  "05_plugin_version_control/github_plan.md",
  "05_plugin_version_control/branch_strategy.md",
  "05_plugin_version_control/issue_plan.md",
  "05_plugin_version_control/pull_request_rules.md",
  "05_plugin_version_control/release_tags.md",
  "05_plugin_version_control/ownership_history.md",
  "06_plugin_evolutions/evolution_index.md",
  "06_plugin_evolutions/evolution_0001/README.md",
  "07_plugin_task_punches/task_index.md",
  "08_plugin_agents/agent_assignments.md",
  "08_plugin_agents/allowed_agents.md",
  "08_plugin_agents/blocked_agents.md",
  "09_plugin_tests_quality/integration_tests/dependency_available.test.js",
  "09_plugin_tests_quality/integration_tests/dependency_missing_fails_safely.test.js",
  "09_plugin_tests_quality/integration_tests/command_contract.test.js",
  "09_plugin_tests_quality/integration_tests/event_hook_contract.test.js",
  "09_plugin_tests_quality/integration_tests/schema_compatibility.test.js",
  "09_plugin_tests_quality/integration_tests/runtime_state_boundary.test.js",
  "09_plugin_tests_quality/integration_tests/permission_boundary.test.js",
  "09_plugin_tests_quality/integration_tests/plugin_conflict.test.js",
  "09_plugin_tests_quality/test_reports/README.md",
  "10_plugin_evidence_audit/requirement_evidence/README.md",
  "10_plugin_evidence_audit/git_library_evidence/README.md",
  "10_plugin_evidence_audit/command_evidence/README.md",
  "10_plugin_evidence_audit/schema_evidence/README.md",
  "10_plugin_evidence_audit/runtime_evidence/README.md",
  "10_plugin_evidence_audit/security_evidence/README.md",
  "10_plugin_evidence_audit/test_evidence/README.md",
  "10_plugin_evidence_audit/owner_approval_evidence/README.md",
  "10_plugin_evidence_audit/marketplace_request_evidence/README.md",
  "10_plugin_evidence_audit/integration_evidence/dependency_review.md",
  "10_plugin_evidence_audit/integration_evidence/integration_contract_evidence.md",
  "10_plugin_evidence_audit/integration_evidence/compatibility_evidence.md",
  "10_plugin_evidence_audit/integration_evidence/conflict_review.md",
  "10_plugin_evidence_audit/integration_evidence/permissions_review.md",
  "10_plugin_evidence_audit/integration_evidence/integration_test_report.md",
  "10_plugin_evidence_audit/audit_log.md",
  "10_plugin_evidence_audit/audit_log.jsonl",
  "11_plugin_reviews_approvals/plugin_dev_review.md",
  "11_plugin_reviews_approvals/technical_review.md",
  "11_plugin_reviews_approvals/security_review.md",
  "11_plugin_reviews_approvals/marketplace_review.md",
  "11_plugin_reviews_approvals/owner_approval_request.json",
  "11_plugin_reviews_approvals/owner_decision.json",
  "11_plugin_reviews_approvals/approval_decisions.md",
  "12_plugin_package_release/package_manifest.json",
  "12_plugin_package_release/promotion_manifest.json",
  "12_plugin_package_release/promotion_archive_manifest.json",
  "12_plugin_package_release/checksums.json",
  "12_plugin_package_release/readiness_report.md",
  "12_plugin_package_release/readiness_report.json",
  "12_plugin_package_release/marketplace_upload_request.json",
  "12_plugin_package_release/direct_install_request.json",
  "12_plugin_package_release/release_notes/README.md",
  "12_plugin_package_release/changelog/README.md",
  "12_plugin_package_release/sanitized_marketplace_bundle/README.md",
  "12_plugin_package_release/private_evidence_bundle/README.md",
  "12_plugin_package_release/deployment_checks/README.md",
  "13_plugin_documentation/README.md",
  "13_plugin_documentation/COMMANDS.md",
  "13_plugin_documentation/ARCHITECTURE.md",
  "13_plugin_documentation/SCHEMAS.md",
  "13_plugin_documentation/RUNTIME.md",
  "13_plugin_documentation/INTEGRATIONS.md",
  "13_plugin_documentation/PERMISSIONS.md",
  "13_plugin_documentation/SECURITY.md",
  "13_plugin_documentation/TESTING.md",
  "13_plugin_documentation/MARKETPLACE.md",
  "13_plugin_documentation/TROUBLESHOOTING.md",
  "99_plugin_archive/archive_manifest.json",
  "99_plugin_archive/archive_locations.md",
  "99_plugin_archive/evidence_bundle/README.md",
  "99_plugin_archive/compact_structure_mapping.md"
];

function buildStandardPackagePlan(root, slug, options = {}) {
  const pluginSlug = String(slug || "").trim();
  const directories = STANDARD_PACKAGE_DIRS.map((relative) => `${root}/${relative}`);
  const files = [
    [`${root}/plugin.json`, buildPluginJson(pluginSlug, options.packageType || "owner")],
    [`${root}/bootstrap.js`, buildBootstrapJs()],
    [`${root}/README.md`, buildReadme(pluginSlug)],
    [`${root}/CHANGELOG.md`, buildChangelog()],
    [`${root}/LICENSE`, buildLicense(pluginSlug)],
    [`${root}/plugin_manifest.json`, buildPluginManifest(pluginSlug, options)],
    [`${root}/docs/OVERVIEW.md`, buildDoc("Overview")],
    [`${root}/docs/COMMANDS.md`, buildDoc("Commands")],
    [`${root}/docs/ARCHITECTURE.md`, buildDoc("Architecture")],
    [`${root}/docs/SCHEMAS.md`, buildDoc("Schemas")],
    [`${root}/docs/RUNTIME.md`, buildDoc("Runtime")],
    [`${root}/docs/INTEGRATIONS.md`, buildDoc("Integrations")],
    [`${root}/docs/PERMISSIONS.md`, buildDoc("Permissions")],
    [`${root}/docs/SECURITY.md`, buildDoc("Security")],
    [`${root}/docs/TESTING.md`, buildDoc("Testing")],
    [`${root}/docs/TROUBLESHOOTING.md`, buildDoc("Troubleshooting")],
    [`${root}/src/index.js`, buildSrcIndexJs()],
    [`${root}/src/commands/register.js`, buildSrcPassthrough("register")],
    [`${root}/src/commands/status.js`, buildSrcPassthrough("status")],
    [`${root}/src/commands/create.js`, buildSrcPassthrough("create")],
    [`${root}/src/core/constants.js`, buildSrcConstantsJs()],
    [`${root}/src/core/errors.js`, buildSrcErrorsJs()],
    [`${root}/src/core/track_resolver.js`, buildSrcTrackResolverJs()],
    [`${root}/src/core/standard_plugin_structure.js`, buildSrcStandardStructureJs()],
    [`${root}/src/services/status_service.js`, buildSrcPassthrough("status_service")],
    [`${root}/src/services/target_path_service.js`, buildSrcPassthrough("target_path_service")],
    [`${root}/src/services/package_structure_service.js`, buildSrcPassthrough("package_structure_service")],
    [`${root}/src/utils/fs_safe.js`, buildSrcFsSafeJs()],
    [`${root}/src/utils/json_safe.js`, buildSrcJsonSafeJs()],
    [`${root}/src/utils/slugify.js`, buildSrcSlugifyJs()],
    [`${root}/src/adapters/index.js`, "module.exports = {};\n"],
    [`${root}/src/policies/index.js`, "module.exports = {};\n"],
    [`${root}/tests/unit/status_service.test.js`, buildSmokeTest("status")],
    [`${root}/tests/unit/target_path_service.test.js`, buildSmokeTest("target")],
    [`${root}/tests/unit/package_structure_service.test.js`, buildSmokeTest("package")],
    [`${root}/tests/contract/plugin_contract.test.js`, buildSmokeTest("contract")],
    [`${root}/prompts/README.md`, "# Prompts\n"],
    [`${root}/dashboard/README.md`, "# Dashboard\n"],
    [`${root}/dashboard/views/README.md`, "# Views\n"],
    [`${root}/dashboard/widgets/README.md`, "# Widgets\n"],
    [`${root}/examples/README.md`, "# Examples\n"],
    [`${root}/config/README.md`, "# Config\n"],
    [`${root}/schemas/README.md`, "# Schemas\n"],
    [`${root}/tests/README.md`, "# Tests\n"],
    [`${root}/docs/README.md`, "# Docs\n"]
  ];
  return { root, directories, files, package_root: root };
}

function buildWorkspacePlan(slug, options = {}) {
  const root = `${WORKSPACE_ROOT}/${slug}`;
  const packageRoot = `${root}/${WORKSPACE_PACKAGE_SEGMENT}`;
  const packagePlan = buildStandardPackagePlan(packageRoot, slug, { packageType: "plugin_dev", workspaceRoot: root, packageRoot });
  const canonicalDirectories = [
    `${root}/00_plugin_inputs`,
    `${root}/00_plugin_inputs/uploaded_snapshots`,
    `${root}/00_plugin_inputs/uploaded_external_files`,
    `${root}/00_plugin_inputs/git_libraries`,
    `${root}/00_plugin_inputs/git_libraries/library_analysis`,
    `${root}/00_plugin_inputs/git_libraries/license_review`,
    `${root}/00_plugin_inputs/git_libraries/security_review`,
    `${root}/00_plugin_inputs/git_libraries/compatibility_review`,
    `${root}/00_plugin_inputs/git_libraries/maintenance_review`,
    `${root}/01_plugin_identity`,
    `${root}/02_plugin_roadmaps_plans`,
    `${root}/02_plugin_roadmaps_plans/architecture_plan`,
    `${root}/02_plugin_roadmaps_plans/command_surface_plan`,
    `${root}/02_plugin_roadmaps_plans/runtime_state_plan`,
    `${root}/02_plugin_roadmaps_plans/schema_plan`,
    `${root}/02_plugin_roadmaps_plans/dashboard_plan`,
    `${root}/02_plugin_roadmaps_plans/integration_plan`,
    `${root}/02_plugin_roadmaps_plans/testing_plan`,
    `${root}/02_plugin_roadmaps_plans/release_plan`,
    `${root}/02_plugin_roadmaps_plans/marketplace_plan`,
    `${root}/03_plugin_specifications`,
    `${root}/03_plugin_specifications/integration_specification`,
    `${root}/04_plugin_package`,
    `${root}/05_plugin_version_control`,
    `${root}/05_plugin_version_control/branches`,
    `${root}/05_plugin_version_control/issues`,
    `${root}/05_plugin_version_control/pull_requests`,
    `${root}/05_plugin_version_control/releases`,
    `${root}/06_plugin_evolutions`,
    `${root}/06_plugin_evolutions/evolution_0001`,
    `${root}/07_plugin_task_punches`,
    `${root}/07_plugin_task_punches/pending`,
    `${root}/07_plugin_task_punches/active`,
    `${root}/07_plugin_task_punches/blocked`,
    `${root}/07_plugin_task_punches/completed`,
    `${root}/08_plugin_agents`,
    `${root}/08_plugin_agents/agent_logs`,
    `${root}/09_plugin_tests_quality`,
    `${root}/09_plugin_tests_quality/unit_tests`,
    `${root}/09_plugin_tests_quality/contract_tests`,
    `${root}/09_plugin_tests_quality/integration_tests`,
    `${root}/09_plugin_tests_quality/smoke_tests`,
    `${root}/09_plugin_tests_quality/security_tests`,
    `${root}/09_plugin_tests_quality/marketplace_readiness_tests`,
    `${root}/09_plugin_tests_quality/fixtures`,
    `${root}/09_plugin_tests_quality/test_reports`,
    `${root}/10_plugin_evidence_audit`,
    `${root}/10_plugin_evidence_audit/requirement_evidence`,
    `${root}/10_plugin_evidence_audit/git_library_evidence`,
    `${root}/10_plugin_evidence_audit/command_evidence`,
    `${root}/10_plugin_evidence_audit/schema_evidence`,
    `${root}/10_plugin_evidence_audit/runtime_evidence`,
    `${root}/10_plugin_evidence_audit/integration_evidence`,
    `${root}/10_plugin_evidence_audit/security_evidence`,
    `${root}/10_plugin_evidence_audit/test_evidence`,
    `${root}/10_plugin_evidence_audit/owner_approval_evidence`,
    `${root}/10_plugin_evidence_audit/marketplace_request_evidence`,
    `${root}/11_plugin_reviews_approvals`,
    `${root}/12_plugin_package_release`,
    `${root}/12_plugin_package_release/release_notes`,
    `${root}/12_plugin_package_release/changelog`,
    `${root}/12_plugin_package_release/sanitized_marketplace_bundle`,
    `${root}/12_plugin_package_release/private_evidence_bundle`,
    `${root}/12_plugin_package_release/deployment_checks`,
    `${root}/13_plugin_documentation`,
    `${root}/99_plugin_archive`,
    `${root}/99_plugin_archive/evidence_bundle`
  ];
  const directories = dedupePaths([
    ...canonicalDirectories,
    ...packagePlan.directories
  ]);
  const files = dedupeFileEntries([
    [`${root}/plugin_workspace_manifest.json`, buildWorkspaceManifest(slug, options)],
    [`${root}/README.md`, buildWorkspaceReadme(slug)],
    [`${root}/00_plugin_inputs/links.md`, "# Links\n"],
    [`${root}/00_plugin_inputs/questions_answers.md`, "# Questions and Answers\n"],
    [`${root}/00_plugin_inputs/git_libraries/libraries.md`, "# Git libraries\n"],
    [`${root}/00_plugin_inputs/git_libraries/selected_libraries.json`, "{\n  \"libraries\": []\n}\n"],
    [`${root}/00_plugin_inputs/git_libraries/adoption_decisions.md`, "# Adoption decisions\n"],
    [`${root}/00_plugin_inputs/git_libraries/library_analysis/README.md`, "# Library analysis\n"],
    [`${root}/00_plugin_inputs/git_libraries/license_review/README.md`, "# License review\n"],
    [`${root}/00_plugin_inputs/git_libraries/security_review/README.md`, "# Security review\n"],
    [`${root}/00_plugin_inputs/git_libraries/compatibility_review/README.md`, "# Compatibility review\n"],
    [`${root}/00_plugin_inputs/git_libraries/maintenance_review/README.md`, "# Maintenance review\n"],
    [`${root}/01_plugin_identity/plugin_brief.md`, buildWorkspaceSpec("plugin brief", slug)],
    [`${root}/01_plugin_identity/plugin_type.md`, buildWorkspaceSpec("plugin type", slug)],
    [`${root}/01_plugin_identity/plugin_scope.md`, buildWorkspaceSpec("plugin scope", slug)],
    [`${root}/01_plugin_identity/plugin_dependencies.md`, buildWorkspaceSpec("plugin dependencies", slug)],
    [`${root}/01_plugin_identity/plugin_permissions.md`, buildWorkspaceSpec("plugin permissions", slug)],
    [`${root}/01_plugin_identity/plugin_market_position.md`, buildWorkspaceSpec("plugin market position", slug)],
    [`${root}/01_plugin_identity/success_criteria.md`, buildWorkspaceSpec("success criteria", slug)],
    [`${root}/02_plugin_roadmaps_plans/architecture_plan/README.md`, buildWorkspaceSpec("architecture plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/command_surface_plan/README.md`, buildWorkspaceSpec("command surface plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/runtime_state_plan/README.md`, buildWorkspaceSpec("runtime state plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/schema_plan/README.md`, buildWorkspaceSpec("schema plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/dashboard_plan/README.md`, buildWorkspaceSpec("dashboard plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/testing_plan/README.md`, buildWorkspaceSpec("testing plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/release_plan/README.md`, buildWorkspaceSpec("release plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/marketplace_plan/README.md`, buildWorkspaceSpec("marketplace plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/dependency_map.md`, buildWorkspaceSpec("dependency map", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/required_integrations.md`, buildWorkspaceSpec("required integrations", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/optional_integrations.md`, buildWorkspaceSpec("optional integrations", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/provided_capabilities.md`, buildWorkspaceSpec("provided capabilities", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/consumed_capabilities.md`, buildWorkspaceSpec("consumed capabilities", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/event_hooks_plan.md`, buildWorkspaceSpec("event hooks plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/command_delegation_plan.md`, buildWorkspaceSpec("command delegation plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/dashboard_integration_plan.md`, buildWorkspaceSpec("dashboard integration plan", slug)],
    [`${root}/02_plugin_roadmaps_plans/integration_plan/conflict_resolution_plan.md`, buildWorkspaceSpec("conflict resolution plan", slug)],
    [`${root}/03_plugin_specifications/plugin_specification.md`, buildWorkspaceSpec("plugin specification", slug)],
    [`${root}/03_plugin_specifications/command_specification.md`, buildWorkspaceSpec("command specification", slug)],
    [`${root}/03_plugin_specifications/schema_specification.md`, buildWorkspaceSpec("schema specification", slug)],
    [`${root}/03_plugin_specifications/runtime_specification.md`, buildWorkspaceSpec("runtime specification", slug)],
    [`${root}/03_plugin_specifications/integration_specification/integration_contracts.md`, buildWorkspaceSpec("integration contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/plugin_dependency_contracts.md`, buildWorkspaceSpec("plugin dependency contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/command_contracts.md`, buildWorkspaceSpec("command contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/event_hook_contracts.md`, buildWorkspaceSpec("event hook contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/schema_contracts.md`, buildWorkspaceSpec("schema contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/runtime_state_contracts.md`, buildWorkspaceSpec("runtime state contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/permission_contracts.md`, buildWorkspaceSpec("permission contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/dashboard_contracts.md`, buildWorkspaceSpec("dashboard contracts", slug)],
    [`${root}/03_plugin_specifications/integration_specification/compatibility_rules.md`, buildWorkspaceSpec("compatibility rules", slug)],
    [`${root}/03_plugin_specifications/dashboard_specification.md`, buildWorkspaceSpec("dashboard specification", slug)],
    [`${root}/03_plugin_specifications/security_specification.md`, buildWorkspaceSpec("security specification", slug)],
    [`${root}/03_plugin_specifications/marketplace_specification.md`, buildWorkspaceSpec("marketplace specification", slug)],
    [`${root}/03_plugin_specifications/acceptance_criteria.md`, buildWorkspaceSpec("acceptance criteria", slug)],
    [`${root}/99_plugin_archive/compact_structure_mapping.md`, buildCompactStructureMapping(slug, root)],
    [`${root}/99_plugin_archive/archive_manifest.json`, buildArchiveManifest(slug, root, packageRoot)],
    [`${root}/99_plugin_archive/archive_locations.md`, buildArchiveLocations(slug, root, packageRoot)],
    [`${root}/99_plugin_archive/evidence_bundle/README.md`, buildLegacyCompactFile("evidence bundle", slug)],
    [`${root}/05_plugin_version_control/github_plan.md`, buildWorkspaceSpec("github plan", slug)],
    [`${root}/05_plugin_version_control/branch_strategy.md`, buildWorkspaceSpec("branch strategy", slug)],
    [`${root}/05_plugin_version_control/issue_plan.md`, buildWorkspaceSpec("issue plan", slug)],
    [`${root}/05_plugin_version_control/pull_request_rules.md`, buildWorkspaceSpec("pull request rules", slug)],
    [`${root}/05_plugin_version_control/release_tags.md`, buildWorkspaceSpec("release tags", slug)],
    [`${root}/05_plugin_version_control/ownership_history.md`, buildWorkspaceSpec("ownership history", slug)],
    [`${root}/06_plugin_evolutions/evolution_index.md`, "# Evolution index\n"],
    [`${root}/06_plugin_evolutions/evolution_0001/README.md`, buildWorkspaceSpec("evolution 0001", slug)],
    [`${root}/07_plugin_task_punches/task_index.md`, "# Task index\n"],
    [`${root}/08_plugin_agents/agent_assignments.md`, buildWorkspaceSpec("agent assignments", slug)],
    [`${root}/08_plugin_agents/allowed_agents.md`, buildWorkspaceSpec("allowed agents", slug)],
    [`${root}/08_plugin_agents/blocked_agents.md`, buildWorkspaceSpec("blocked agents", slug)],
    [`${root}/09_plugin_tests_quality/unit_tests/README.md`, "# Unit tests\n"],
    [`${root}/09_plugin_tests_quality/contract_tests/README.md`, "# Contract tests\n"],
    [`${root}/09_plugin_tests_quality/integration_tests/dependency_available.test.js`, buildSmokeTest("dependency available")],
    [`${root}/09_plugin_tests_quality/integration_tests/dependency_missing_fails_safely.test.js`, buildSmokeTest("dependency missing fails safely")],
    [`${root}/09_plugin_tests_quality/integration_tests/command_contract.test.js`, buildSmokeTest("command contract")],
    [`${root}/09_plugin_tests_quality/integration_tests/event_hook_contract.test.js`, buildSmokeTest("event hook contract")],
    [`${root}/09_plugin_tests_quality/integration_tests/schema_compatibility.test.js`, buildSmokeTest("schema compatibility")],
    [`${root}/09_plugin_tests_quality/integration_tests/runtime_state_boundary.test.js`, buildSmokeTest("runtime state boundary")],
    [`${root}/09_plugin_tests_quality/integration_tests/permission_boundary.test.js`, buildSmokeTest("permission boundary")],
    [`${root}/09_plugin_tests_quality/integration_tests/plugin_conflict.test.js`, buildSmokeTest("plugin conflict")],
    [`${root}/09_plugin_tests_quality/smoke_tests/README.md`, "# Smoke tests\n"],
    [`${root}/09_plugin_tests_quality/security_tests/README.md`, "# Security tests\n"],
    [`${root}/09_plugin_tests_quality/marketplace_readiness_tests/README.md`, "# Marketplace readiness tests\n"],
    [`${root}/09_plugin_tests_quality/fixtures/README.md`, "# Fixtures\n"],
    [`${root}/09_plugin_tests_quality/test_reports/README.md`, "# Test reports\n"],
    [`${root}/10_plugin_evidence_audit/requirement_evidence/README.md`, buildWorkspaceSpec("requirement evidence", slug)],
    [`${root}/10_plugin_evidence_audit/git_library_evidence/README.md`, buildWorkspaceSpec("git library evidence", slug)],
    [`${root}/10_plugin_evidence_audit/command_evidence/README.md`, buildWorkspaceSpec("command evidence", slug)],
    [`${root}/10_plugin_evidence_audit/schema_evidence/README.md`, buildWorkspaceSpec("schema evidence", slug)],
    [`${root}/10_plugin_evidence_audit/runtime_evidence/README.md`, buildWorkspaceSpec("runtime evidence", slug)],
    [`${root}/10_plugin_evidence_audit/security_evidence/README.md`, buildWorkspaceSpec("security evidence", slug)],
    [`${root}/10_plugin_evidence_audit/test_evidence/README.md`, buildWorkspaceSpec("test evidence", slug)],
    [`${root}/10_plugin_evidence_audit/owner_approval_evidence/README.md`, buildWorkspaceSpec("owner approval evidence", slug)],
    [`${root}/10_plugin_evidence_audit/marketplace_request_evidence/README.md`, buildWorkspaceSpec("marketplace request evidence", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/dependency_review.md`, buildWorkspaceSpec("dependency review", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/integration_contract_evidence.md`, buildWorkspaceSpec("integration contract evidence", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/compatibility_evidence.md`, buildWorkspaceSpec("compatibility evidence", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/conflict_review.md`, buildWorkspaceSpec("conflict review", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/permissions_review.md`, buildWorkspaceSpec("permissions review", slug)],
    [`${root}/10_plugin_evidence_audit/integration_evidence/integration_test_report.md`, buildWorkspaceSpec("integration test report", slug)],
    [`${root}/10_plugin_evidence_audit/audit_log.md`, "# Audit log\n"],
    [`${root}/10_plugin_evidence_audit/audit_log.jsonl`, ""],
    [`${root}/11_plugin_reviews_approvals/plugin_dev_review.md`, buildWorkspaceSpec("plugin dev review", slug)],
    [`${root}/11_plugin_reviews_approvals/technical_review.md`, buildWorkspaceSpec("technical review", slug)],
    [`${root}/11_plugin_reviews_approvals/security_review.md`, buildWorkspaceSpec("security review", slug)],
    [`${root}/11_plugin_reviews_approvals/marketplace_review.md`, buildWorkspaceSpec("marketplace review", slug)],
    [`${root}/11_plugin_reviews_approvals/owner_approval_request.json`, JSON.stringify({ plugin_slug: slug, status: "pending_owner_review" }, null, 2) + "\n"],
    [`${root}/11_plugin_reviews_approvals/owner_decision.json`, JSON.stringify({ plugin_slug: slug, status: "pending_owner_decision" }, null, 2) + "\n"],
    [`${root}/11_plugin_reviews_approvals/approval_decisions.md`, "# Approval decisions\n"],
    [`${root}/12_plugin_package_release/package_manifest.json`, buildReleaseJson("package manifest", slug)],
    [`${root}/12_plugin_package_release/promotion_manifest.json`, buildReleaseJson("promotion manifest", slug)],
    [`${root}/12_plugin_package_release/promotion_archive_manifest.json`, buildReleaseJson("promotion archive manifest", slug)],
    [`${root}/12_plugin_package_release/checksums.json`, JSON.stringify({ files: [] }, null, 2) + "\n"],
    [`${root}/12_plugin_package_release/readiness_report.md`, buildWorkspaceEvidence("readiness report", slug)],
    [`${root}/12_plugin_package_release/readiness_report.json`, JSON.stringify({ plugin_slug: slug, status: "draft" }, null, 2) + "\n"],
    [`${root}/12_plugin_package_release/marketplace_upload_request.json`, buildReleaseJson("marketplace upload request", slug)],
    [`${root}/12_plugin_package_release/direct_install_request.json`, buildReleaseJson("direct install request", slug)],
    [`${root}/12_plugin_package_release/release_notes/README.md`, "# Release notes\n"],
    [`${root}/12_plugin_package_release/changelog/README.md`, "# Changelog\n"],
    [`${root}/12_plugin_package_release/sanitized_marketplace_bundle/README.md`, "# Sanitized marketplace bundle\n"],
    [`${root}/12_plugin_package_release/private_evidence_bundle/README.md`, "# Private evidence bundle\n"],
    [`${root}/12_plugin_package_release/deployment_checks/README.md`, "# Deployment checks\n"],
    [`${root}/13_plugin_documentation/README.md`, "# Documentation\n"],
    [`${root}/13_plugin_documentation/COMMANDS.md`, buildWorkspaceSpec("commands", slug)],
    [`${root}/13_plugin_documentation/ARCHITECTURE.md`, buildWorkspaceSpec("architecture", slug)],
    [`${root}/13_plugin_documentation/SCHEMAS.md`, buildWorkspaceSpec("schemas", slug)],
    [`${root}/13_plugin_documentation/RUNTIME.md`, buildWorkspaceSpec("runtime", slug)],
    [`${root}/13_plugin_documentation/INTEGRATIONS.md`, buildWorkspaceSpec("integrations", slug)],
    [`${root}/13_plugin_documentation/PERMISSIONS.md`, buildWorkspaceSpec("permissions", slug)],
    [`${root}/13_plugin_documentation/SECURITY.md`, buildWorkspaceSpec("security", slug)],
    [`${root}/13_plugin_documentation/TESTING.md`, buildWorkspaceSpec("testing", slug)],
    [`${root}/13_plugin_documentation/MARKETPLACE.md`, buildWorkspaceSpec("marketplace", slug)],
    [`${root}/13_plugin_documentation/TROUBLESHOOTING.md`, buildWorkspaceSpec("troubleshooting", slug)],
    ...packagePlan.files,
  ]);
  return { root, directories, files, package_root: packageRoot };
}

function comparePackageStructure(left, right) {
  return {
    same_directories: JSON.stringify(left.directories.map(normalizeRelativePath)) === JSON.stringify(right.directories.map(normalizeRelativePath)),
    same_files: JSON.stringify(left.files.map(([file]) => normalizeRelativePath(file))) === JSON.stringify(right.files.map(([file]) => normalizeRelativePath(file)))
  };
}

function dedupePaths(paths) {
  return Array.from(new Set(paths));
}

function dedupeFileEntries(entries) {
  const seen = new Set();
  const result = [];
  for (const [filePath, content] of entries) {
    if (seen.has(filePath)) continue;
    seen.add(filePath);
    result.push([filePath, content]);
  }
  return result;
}

function buildLicense(slug) {
  return `# License\n\nCopyright (c) ${new Date().getFullYear()} ${toTitle(slug)}\n`;
}

function buildSourceReadme(slug) {
  return `# Source Tracking\n\nThis folder points to the canonical candidate plugin package for ${slug}.\n`;
}

function buildSourceManifest(slug, workspaceRoot, packageRoot) {
  return JSON.stringify({
    plugin_slug: slug,
    workspace_root: formatManifestPath(workspaceRoot),
    package_root: formatManifestPath(packageRoot),
    actual_plugin_package: WORKSPACE_PACKAGE_SEGMENT,
    notes: "04_plugin_package is the real candidate plugin package. No redundant source-pointer folder is generated."
  }, null, 2) + "\n";
}

function buildCompactStructureMapping(slug, root) {
  return [
    "# Compact Structure Mapping",
    "",
    `- ${root}/00_inputs/ -> ${root}/00_plugin_inputs/`,
    `- ${root}/01_spec/ -> ${root}/01_plugin_identity/, ${root}/02_plugin_roadmaps_plans/, ${root}/03_plugin_specifications/`,
    `- ${root}/02_tasks/ -> ${root}/06_plugin_evolutions/, ${root}/07_plugin_task_punches/`,
    `- ${root}/04_evidence/ -> ${root}/09_plugin_tests_quality/, ${root}/10_plugin_evidence_audit/`,
    `- ${root}/05_release/ -> ${root}/11_plugin_reviews_approvals/, ${root}/12_plugin_package_release/`,
    "",
    "Compact folders are preserved for backward compatibility and are not removed automatically."
  ].join("\n") + "\n";
}

function buildArchiveManifest(slug, workspaceRoot, packageRoot) {
  return JSON.stringify({
    plugin_slug: slug,
    workspace_path: formatManifestPath(workspaceRoot),
    package_root: formatManifestPath(packageRoot),
    generated_at: new Date().toISOString(),
    archive_status: "generated",
    archive_locations: [
      `${workspaceRoot}/99_plugin_archive/evidence_bundle`,
      `${workspaceRoot}/12_plugin_package_release/private_evidence_bundle`
    ],
    checksum_algorithm: "sha256",
    files_included: [
      "plugin_workspace_manifest.json",
      "readiness_report.md",
      "readiness_report.json",
      "promotion_manifest.json",
      "owner_approval_request.json",
      "owner_decision.json",
      "direct_install_request.json",
      "marketplace_upload_request.json",
      "license_summary.md",
      "security_summary.md",
      "integration_summary.md",
      "git_library_summary.md",
      "test_summary.md",
      "approval_summary.md",
      "audit_log.md",
      "audit_log.jsonl",
      "checksums.json"
    ],
    files_excluded: [
      "temporary build output",
      "private runtime caches",
      "unapproved marketplace payloads"
    ],
    notes: "Archive is additive and preserves compact compatibility folders."
  }, null, 2) + "\n";
}

function buildArchiveLocations(slug, workspaceRoot, packageRoot) {
  return [
    "# Archive Locations",
    "",
    `- Workspace: ${formatManifestPath(workspaceRoot)}`,
    `- Candidate package: ${formatManifestPath(packageRoot)}`,
    `- Evidence bundle: ${formatManifestPath(workspaceRoot)}/99_plugin_archive/evidence_bundle`,
    `- Private evidence bundle: ${formatManifestPath(workspaceRoot)}/12_plugin_package_release/private_evidence_bundle`
  ].join("\n") + "\n";
}

function buildLegacyCompactFile(title, slug) {
  return `# ${toTitle(slug)} ${title}\n`;
}

function buildLegacyCompactWorkspaceFiles(slug, root) {
  const compactFiles = [
    [`${root}/00_inputs/links.md`, "# Links\n"],
    [`${root}/00_inputs/questions_answers.md`, "# Questions and Answers\n"],
    [`${root}/00_inputs/git_libraries/libraries.md`, "# Git libraries\n"],
    [`${root}/00_inputs/git_libraries/selected_libraries.json`, "{\n  \"libraries\": []\n}\n"],
    [`${root}/00_inputs/git_libraries/adoption_decisions.md`, "# Adoption decisions\n"],
    [`${root}/01_spec/plugin_brief.md`, buildWorkspaceSpec("plugin brief", slug)],
    [`${root}/01_spec/plugin_type.md`, buildWorkspaceSpec("plugin type", slug)],
    [`${root}/01_spec/plugin_scope.md`, buildWorkspaceSpec("plugin scope", slug)],
    [`${root}/01_spec/architecture.md`, buildWorkspaceSpec("architecture", slug)],
    [`${root}/01_spec/commands.md`, buildWorkspaceSpec("commands", slug)],
    [`${root}/01_spec/schemas.md`, buildWorkspaceSpec("schemas", slug)],
    [`${root}/01_spec/runtime.md`, buildWorkspaceSpec("runtime", slug)],
    [`${root}/01_spec/integrations.md`, buildWorkspaceSpec("integrations", slug)],
    [`${root}/01_spec/dashboard.md`, buildWorkspaceSpec("dashboard", slug)],
    [`${root}/01_spec/security.md`, buildWorkspaceSpec("security", slug)],
    [`${root}/01_spec/marketplace.md`, buildWorkspaceSpec("marketplace", slug)],
    [`${root}/01_spec/acceptance_criteria.md`, buildWorkspaceSpec("acceptance criteria", slug)],
    [`${root}/02_tasks/evolution_index.md`, "# Evolutions\n"],
    [`${root}/02_tasks/tasks.md`, "# Tasks\n"],
    [`${root}/04_evidence/readiness_report.md`, buildWorkspaceEvidence("readiness report", slug)],
    [`${root}/04_evidence/readiness_report.json`, JSON.stringify({ plugin_slug: slug, status: "draft" }, null, 2) + "\n"],
    [`${root}/04_evidence/test_summary.md`, buildWorkspaceEvidence("test summary", slug)],
    [`${root}/04_evidence/security_summary.md`, buildWorkspaceEvidence("security summary", slug)],
    [`${root}/04_evidence/integration_summary.md`, buildWorkspaceEvidence("integration summary", slug)],
    [`${root}/04_evidence/license_summary.md`, buildWorkspaceEvidence("license summary", slug)],
    [`${root}/04_evidence/git_library_summary.md`, buildWorkspaceEvidence("git library summary", slug)],
    [`${root}/04_evidence/approval_summary.md`, buildWorkspaceEvidence("approval summary", slug)],
    [`${root}/04_evidence/audit_log.md`, "# Audit log\n"],
    [`${root}/04_evidence/audit_log.jsonl`, ""],
    [`${root}/05_release/package_manifest.json`, buildReleaseJson("package manifest", slug)],
    [`${root}/05_release/promotion_manifest.json`, buildReleaseJson("promotion manifest", slug)],
    [`${root}/05_release/promotion_archive_manifest.json`, buildReleaseJson("promotion archive manifest", slug)],
    [`${root}/05_release/checksums.json`, JSON.stringify({ files: [] }, null, 2) + "\n"],
    [`${root}/05_release/owner_approval_request.json`, buildReleaseJson("owner approval request", slug)],
    [`${root}/05_release/owner_decision.json`, buildReleaseJson("owner decision", slug)],
    [`${root}/05_release/direct_install_request.json`, buildReleaseJson("direct install request", slug)],
    [`${root}/05_release/marketplace_upload_request.json`, buildReleaseJson("marketplace upload request", slug)]
  ];
  return compactFiles;
}

function buildPluginJson(slug, kind) {
  const isOwner = kind === "owner";
  return JSON.stringify({
    plugin_id: slug,
    id: slug,
    name: toTitle(slug),
    version: "1.0.0",
    type: "kvdf_plugin",
    status: isOwner ? "owner_direct_development" : "draft",
    entry: "bootstrap.js",
    commands: ["status", "create", "validate", "readiness"],
    depends_on: [],
    integrates_with: [],
    provides: [],
    consumes: [],
    conflicts_with: [],
    permissions_required: [],
    runtime_path: "bootstrap.js",
    schemas: []
  }, null, 2) + "\n";
}

function buildPluginManifest(slug, options = {}) {
  const packageRoot = formatManifestPath(options.packageRoot || options.workspaceRoot || `./plugins/${slug}/`);
  const kind = options.packageType || "owner";
  return JSON.stringify({
    plugin_slug: slug,
    track: kind === "owner" ? "owner_track" : "plugin_development_track",
    package_root: packageRoot,
    status: kind === "owner" ? "owner_direct_development" : "draft",
    owner_created_directly: kind === "owner",
    marketplace_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2) + "\n";
}

function buildWorkspaceManifest(slug, options = {}) {
  const root = formatManifestPath(options.workspaceRoot || `${WORKSPACE_ROOT}/${slug}`);
  const packageRoot = formatManifestPath(options.packageRoot || `${WORKSPACE_ROOT}/${slug}/${WORKSPACE_PACKAGE_SEGMENT}`);
  return JSON.stringify({
    plugin_slug: slug,
    track: "plugin_development_track",
    workspace_root: root,
    package_root: packageRoot,
    actual_plugin_package: WORKSPACE_PACKAGE_SEGMENT,
    canonical_package_folder: WORKSPACE_PACKAGE_SEGMENT,
    previous_package_folder: "03_plugin_package",
    renumbering_migrated: false,
    removed_redundant_source_folder: true,
    direct_install_target: `./plugins/${slug}/`,
    marketplace_target: `./marketplace/plugins/${slug}/`,
    status: "draft",
    installed: false,
    marketplace_published: false,
    owner_approval_required_for_promotion: true,
    compatibility: {
      compact_folders_detected: false,
      compact_folders_preserved: false,
      canonical_full_set_enabled: true,
      actual_plugin_package: WORKSPACE_PACKAGE_SEGMENT,
      canonical_package_folder: WORKSPACE_PACKAGE_SEGMENT,
      previous_package_folder: "03_plugin_package",
      renumbering_migrated: false,
      removed_redundant_source_folder: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, null, 2) + "\n";
}

function buildWorkspaceSpec(title, slug) {
  return `# ${toTitle(slug)} ${title}\n`;
}

function buildWorkspaceReadme(slug) {
  return `# ${toTitle(slug)}\n\nPlugin Development Track workspace for ${slug}.\n`;
}

function buildReadme(slug) {
  return `# ${toTitle(slug)}\n`;
}

function buildChangelog() {
  return "# Changelog\n\n## 1.0.0\n\n- Initial structure.\n";
}

function buildBootstrapJs() {
  return `const { pluginFolderStructure } = require("./src");\n\nmodule.exports = {\n  plugin_id: "plugin_folder_structure",\n  name: "Plugin Folder Structure",\n  command_entrypoint: "bootstrap.js",\n  runtime_entrypoint: "bootstrap.js",\n  pluginFolderStructure\n};\n`;
}

function buildSrcIndexJs() {
  return `const { registerPluginFolderStructure } = require("./commands/register");\nconst { runStatus } = require("./commands/status");\nconst { runCreate } = require("./commands/create");\n\nfunction pluginFolderStructure(action, value, flags = {}, rest = [], deps = {}) {\n  const normalized = String(action || "").trim().toLowerCase();\n  if (!normalized || normalized === "status") return runStatus({ action, value, flags, rest, deps }, deps);\n  if (normalized === "create") return runCreate({ action, value, flags, rest, deps }, deps);\n  if (normalized === "register") return registerPluginFolderStructure({ action, value, flags, rest, deps });\n  return runStatus({ action, value, flags, rest, deps }, deps);\n}\n\nmodule.exports = {\n  pluginFolderStructure,\n  registerPluginFolderStructure\n};\n`;
}

function buildSrcPassthrough(name) {
  if (name === "status") return `const { buildStatusReport, renderStatusReport } = require("../services/status_service");\nmodule.exports = { buildStatusReport, renderStatusReport, runStatus: (context, deps) => buildStatusReport(context, deps) };\n`;
  if (name === "create") return `const { createTargetStructure } = require("../services/target_path_service");\nmodule.exports = { createTargetStructure, runCreate: (context, deps) => createTargetStructure(context, deps) };\n`;
  if (name === "register") return `function registerPluginFolderStructure() { return { command: "plugin-folder" }; }\nmodule.exports = { registerPluginFolderStructure };\n`;
  return `module.exports = {};\n`;
}

function buildSrcConstantsJs() {
  return `const OWNER_ROOT = "plugins";\nconst WORKSPACE_ROOT = "workspaces/plugins";\nconst WORKSPACE_PACKAGE_SEGMENT = "04_plugin_package";\nconst STANDARD_PACKAGE_DIRS = ${JSON.stringify(STANDARD_PACKAGE_DIRS, null, 2)};\nconst STANDARD_PACKAGE_FILES = ${JSON.stringify(STANDARD_PACKAGE_FILES, null, 2)};\nconst LEGACY_COMPACT_WORKSPACE_DIRS = ${JSON.stringify(LEGACY_COMPACT_WORKSPACE_DIRS, null, 2)};\nconst LEGACY_COMPACT_WORKSPACE_FILES = ${JSON.stringify(LEGACY_COMPACT_WORKSPACE_FILES, null, 2)};\nconst CANONICAL_WORKSPACE_DIRS = ${JSON.stringify(CANONICAL_WORKSPACE_DIRS, null, 2)};\nconst CANONICAL_WORKSPACE_FILES = ${JSON.stringify(CANONICAL_WORKSPACE_FILES, null, 2)};\nconst STATUS_MESSAGE = {\n  owner: "Owner Track plugin target: ./plugins/<plugin-slug>/",\n  plugin_dev: "Plugin Development Track plugin target: ./workspaces/plugins/<plugin-slug>/04_plugin_package/",\n  viber: "Viber/App Track plugin creation: blocked"\n};\nmodule.exports = { OWNER_ROOT, WORKSPACE_ROOT, WORKSPACE_PACKAGE_SEGMENT, STANDARD_PACKAGE_DIRS, STANDARD_PACKAGE_FILES, LEGACY_COMPACT_WORKSPACE_DIRS, LEGACY_COMPACT_WORKSPACE_FILES, CANONICAL_WORKSPACE_DIRS, CANONICAL_WORKSPACE_FILES, STATUS_MESSAGE };\n`;
}

function buildSrcErrorsJs() {
  return `class PluginFolderError extends Error {\n  constructor(message) { super(message); this.name = "PluginFolderError"; }\n}\nfunction pluginFolderError(message) { return new PluginFolderError(message); }\nmodule.exports = { PluginFolderError, pluginFolderError };\n`;
}

function buildSrcTrackResolverJs() {
  return `function resolveTrack(context = {}) {\n  const value = String(context.flags && context.flags.track || "").trim().toLowerCase();\n  if (!value) return "owner";\n  if ([\"owner\", \"framework_owner\", \"owner_track\"].includes(value)) return "owner";\n  if ([\"plugin_dev\", \"plugin-development\", \"plugin_development\", \"plugin_development_track\"].includes(value)) return "plugin_dev";\n  if ([\"viber\", \"vibe\", \"vibe_app_developer\"].includes(value)) return "viber";\n  throw new Error(\`Invalid track: \${value}\`);\n}\nmodule.exports = { resolveTrack };\n`;
}

function buildSrcStandardStructureJs() {
  return `const { buildStandardPackagePlan, buildWorkspacePlan, comparePackageStructure, STANDARD_PACKAGE_DIRS, STANDARD_PACKAGE_FILES, LEGACY_COMPACT_WORKSPACE_DIRS, LEGACY_COMPACT_WORKSPACE_FILES, CANONICAL_WORKSPACE_DIRS, CANONICAL_WORKSPACE_FILES, WORKSPACE_WRAPPER_DIRS, WORKSPACE_WRAPPER_FILES } = require("./standard_plugin_structure");\nmodule.exports = { buildStandardPackagePlan, buildWorkspacePlan, comparePackageStructure, STANDARD_PACKAGE_DIRS, STANDARD_PACKAGE_FILES, LEGACY_COMPACT_WORKSPACE_DIRS, LEGACY_COMPACT_WORKSPACE_FILES, CANONICAL_WORKSPACE_DIRS, CANONICAL_WORKSPACE_FILES, WORKSPACE_WRAPPER_DIRS, WORKSPACE_WRAPPER_FILES };\n`;
}

function buildSrcFsSafeJs() {
  return `const fs = require("fs");\nconst path = require("path");\nfunction ensureDir(dirPath) { fs.mkdirSync(dirPath, { recursive: true }); }\nfunction writeFileIfMissing(filePath, content) { if (fs.existsSync(filePath)) return false; ensureDir(path.dirname(filePath)); fs.writeFileSync(filePath, content, "utf8"); return true; }\nfunction dirIsEmpty(dirPath) { return !fs.existsSync(dirPath) || fs.readdirSync(dirPath).length === 0; }\nmodule.exports = { ensureDir, writeFileIfMissing, dirIsEmpty };\n`;
}

function buildSrcJsonSafeJs() {
  return `const fs = require("fs");\nconst path = require("path");\nfunction readJson(filePath, fallback = null) { if (!fs.existsSync(filePath)) return fallback; return JSON.parse(fs.readFileSync(filePath, "utf8")); }\nfunction writeJson(filePath, value) { fs.mkdirSync(path.dirname(filePath), { recursive: true }); fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\\n", "utf8"); }\nmodule.exports = { readJson, writeJson };\n`;
}

function buildSrcSlugifyJs() {
  return `function slugify(value) { return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""); }\nfunction isSafeSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || "")); }\nmodule.exports = { slugify, isSafeSlug };\n`;
}

function buildDoc(title) {
  return `# ${title}\n`;
}

function buildSmokeTest(name) {
  return `const assert = require("assert");\n\ntest("${name} placeholder", () => { assert.ok(true); });\nfunction test(label, fn) { try { fn(); console.log(\`OK \${label}\`); } catch (error) { console.error(\`FAIL \${label}\`); console.error(error.stack || error.message); process.exitCode = 1; } }\n`;
}

function buildWorkspaceEvidence(title, slug) {
  return `# ${toTitle(slug)} ${title}\n`;
}

function buildReleaseJson(title, slug) {
  return JSON.stringify({ plugin_slug: slug, title, status: "draft" }, null, 2) + "\n";
}

function toTitle(slug) {
  return String(slug || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^.*?(src|schemas|docs|tests|prompts|dashboard|examples|config|plugin.json|bootstrap.js|README.md|CHANGELOG.md|plugin_manifest.json|LICENSE)/, "$1");
}

function formatManifestPath(value) {
  const text = String(value || "").replace(/\\/g, "/");
  if (!text) return text;
  if (text.startsWith("./") || text.startsWith("../")) return text;
  return text.startsWith("/") ? text : `./${text}`;
}

module.exports = {
  OWNER_PACKAGE_ROOT,
  WORKSPACE_ROOT,
  WORKSPACE_PACKAGE_SEGMENT,
  STANDARD_PACKAGE_DIRS,
  STANDARD_PACKAGE_FILES,
  LEGACY_COMPACT_WORKSPACE_DIRS,
  LEGACY_COMPACT_WORKSPACE_FILES,
  CANONICAL_WORKSPACE_DIRS,
  CANONICAL_WORKSPACE_FILES,
  WORKSPACE_WRAPPER_DIRS,
  WORKSPACE_WRAPPER_FILES,
  buildStandardPackagePlan,
  buildWorkspacePlan,
  comparePackageStructure
};



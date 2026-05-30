const PLUGIN_ID = "app_folder_structure";
const PLUGIN_NAME = "App Folder Structure";
const PLUGIN_VERSION = "1.0.0";
const PLUGIN_TRACK = "plugin_development_track";
const APP_WORKSPACE_ROOT = "workspaces/apps";
const SOURCE_PLUGIN = "app_category_registry";
const PROFILE_VERSION = "v1";

const APP_TOP_LEVEL_DIRS = [
  "00_viber_inputs",
  "01_category",
  "02_roadmaps_plans",
  "03_full_specifications",
  "04_version_control",
  "05_evolutions",
  "06_task_punches",
  "07_agents",
  "08_source",
  "09_tests_quality",
  "10_evidence_audit",
  "11_reviews_approvals",
  "12_releases_deployment",
  "13_owner_portal",
  "99_archive"
];

const APP_TOP_LEVEL_FILES = [
  "README.md",
  "app.kvdos.yaml",
  ".kabeeri/app_state.json",
  ".kabeeri/app_folder_manifest.json"
];

const APP_RUNTIME_DIRS = [".kabeeri/locks", ".kabeeri/cache"];

const APP_INPUT_DIRS = [
  "00_viber_inputs/snapshots",
  "00_viber_inputs/external_files",
  "00_viber_inputs/questions_answers",
  "00_viber_inputs/references"
];

const APP_ROADMAP_DIRS = [
  "02_roadmaps_plans/01_uiux",
  "02_roadmaps_plans/02_system_design",
  "02_roadmaps_plans/03_database"
];

const APP_SPEC_FILES = [
  "03_full_specifications/specification_index.md",
  "03_full_specifications/product_requirements.md",
  "03_full_specifications/software_requirements_specification.md",
  "03_full_specifications/functional_specification.md",
  "03_full_specifications/non_functional_requirements.md",
  "03_full_specifications/acceptance_criteria.md",
  "03_full_specifications/uxui_specification.md",
  "03_full_specifications/system_architecture_specification.md",
  "03_full_specifications/database_specification.md",
  "03_full_specifications/api_specification.md",
  "03_full_specifications/security_specification.md",
  "03_full_specifications/testing_specification.md",
  "03_full_specifications/deployment_specification.md",
  "03_full_specifications/operations_maintenance_specification.md",
  "03_full_specifications/traceability_matrix.md",
  "03_full_specifications/glossary.md",
  "03_full_specifications/assumptions_constraints.md",
  "03_full_specifications/handover_package.md"
];

const APP_VERSION_CONTROL_DIRS = [
  "04_version_control/branches",
  "04_version_control/commits",
  "04_version_control/issues",
  "04_version_control/pull_requests",
  "04_version_control/releases"
];

const APP_EVOLUTION_DIRS = [
  "05_evolutions/active",
  "05_evolutions/completed",
  "05_evolutions/blocked",
  "05_evolutions/archived"
];

const APP_TASK_PUNCH_DIRS = [
  "06_task_punches/ready",
  "06_task_punches/active",
  "06_task_punches/blocked",
  "06_task_punches/completed",
  "06_task_punches/reports"
];

const APP_AGENT_DIRS = [
  "07_agents/run_contracts",
  "07_agents/prompts",
  "07_agents/outputs",
  "07_agents/logs"
];

const APP_TEST_DIRS = [
  "09_tests_quality/unit",
  "09_tests_quality/integration",
  "09_tests_quality/e2e",
  "09_tests_quality/security",
  "09_tests_quality/performance",
  "09_tests_quality/accessibility",
  "09_tests_quality/test_reports"
];

const APP_EVIDENCE_DIRS = [
  "10_evidence_audit/input_evidence",
  "10_evidence_audit/roadmap_evidence",
  "10_evidence_audit/specification_evidence",
  "10_evidence_audit/version_control_evidence",
  "10_evidence_audit/evolution_evidence",
  "10_evidence_audit/task_punch_evidence",
  "10_evidence_audit/agent_evidence",
  "10_evidence_audit/patch_evidence",
  "10_evidence_audit/test_evidence",
  "10_evidence_audit/approval_evidence",
  "10_evidence_audit/release_evidence",
  "10_evidence_audit/structure_evidence"
];

const APP_REVIEW_DIRS = [
  "11_reviews_approvals/owner_reviews",
  "11_reviews_approvals/viber_reviews",
  "11_reviews_approvals/technical_reviews",
  "11_reviews_approvals/security_reviews",
  "11_reviews_approvals/qa_reviews",
  "11_reviews_approvals/approvals"
];

const APP_RELEASE_DIRS = [
  "12_releases_deployment/readiness_reports",
  "12_releases_deployment/release_notes",
  "12_releases_deployment/deployment_reports",
  "12_releases_deployment/rollback_plans",
  "12_releases_deployment/environment_reports",
  "12_releases_deployment/changelogs"
];

const APP_ARCHIVE_DIRS = [
  "99_archive/deprecated_docs",
  "99_archive/rejected_outputs",
  "99_archive/old_versions"
];

const TOP_LEVEL_READMES = {
  "00_viber_inputs": "Source material and Viber-provided inputs live here.",
  "01_category": "Category selection and folder-structure profile live here.",
  "02_roadmaps_plans": "Category-governed roadmap plans live here.",
  "03_full_specifications": "Handoff-grade specifications live here.",
  "04_version_control": "Version-control governance lives here.",
  "05_evolutions": "Evolutions and lifecycle slices live here.",
  "06_task_punches": "Task punches and governed work items live here.",
  "07_agents": "Agent contracts and execution notes live here.",
  "08_source": "Stack-adaptive source tracking lives here.",
  "09_tests_quality": "Tests and quality gates live here.",
  "10_evidence_audit": "Evidence and audit records live here.",
  "11_reviews_approvals": "Reviews and approvals live here.",
  "12_releases_deployment": "Release and deployment controls live here.",
  "13_owner_portal": "Owner-facing summaries live here.",
  "99_archive": "Archived content lives here."
};

module.exports = {
  APP_ARCHIVE_DIRS,
  APP_AGENT_DIRS,
  APP_EVIDENCE_DIRS,
  APP_EVOLUTION_DIRS,
  APP_INPUT_DIRS,
  APP_RELEASE_DIRS,
  APP_REVIEW_DIRS,
  APP_ROADMAP_DIRS,
  APP_RUNTIME_DIRS,
  APP_SPEC_FILES,
  APP_TASK_PUNCH_DIRS,
  APP_TEST_DIRS,
  APP_TOP_LEVEL_DIRS,
  APP_TOP_LEVEL_FILES,
  APP_VERSION_CONTROL_DIRS,
  APP_WORKSPACE_ROOT,
  PLUGIN_ID,
  PLUGIN_NAME,
  PLUGIN_TRACK,
  PLUGIN_VERSION,
  PROFILE_VERSION,
  SOURCE_PLUGIN,
  TOP_LEVEL_READMES
};

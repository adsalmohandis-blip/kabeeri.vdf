const fs = require("fs");
const path = require("path");

const DEFAULT_VALIDATION_COMMANDS = ["node bin/kvdf.js validate", "npm test", "npm run check"];
const PLANNER_STATE_FILE = ".kabeeri/planner.json";
const OWNER_ROADMAP_TRAIN_STATE_FILE = ".kabeeri/owner_roadmap_train.json";
const VIBER_RELEASE_TRAIN_FALLBACK_FILE = ".kabeeri/viber_release_train.json";
const PLANNER_STATUSES = new Set(["proposed", "approved", "rejected", "completed"]);
const { buildAiLearningPromptContext, buildAiLearningPromptSection } = require("./ai_learning");
const { buildDeliveryModeRecommendation } = require("./delivery");
const { buildAppDocsPackageTemplates } = require("../workspace");
const { buildMermaidPreviewHtml } = require("../services/mermaid_preview");
const { pathToFileURL } = require("url");
const { injectFullscreenShell, openExternalUrl, shouldLaunchFullscreen, shouldOpenPreviewBrowser } = require("../services/local_server");
const { buildPlannerTruth: buildPlannerTruthReportService } = require("../services/truth_reconciler");
const { reconcileRuntimeTruth } = require("../services/truth_registry");
const { buildCurrentStateReport: buildCurrentStateReportService, buildStaleStateReport: buildStaleStateReportService } = require("../services/source_truth");
const { buildWorkspaceBoundaryReport: buildWorkspaceBoundaryReportService } = require("../services/workspace_boundary");
const { loadStateResyncReport, evaluateStateResyncFreshness, CURRENT_STATE_REPORT_PATH } = require("./state_resync");
const { buildEvolutionOrderValidationReport } = require("./evolution");
const { readGitHeadCommit, readGitRepositoryState } = require("../services/git_snapshot");
const { getPluginSourcePath } = require("../services/plugin_mounts");
const { repoRoot } = require("../fs_utils");

const MODE_ALIASES = {
  owner: "owner",
  framework_owner: "owner",
  kvdf: "owner",
  vibe: "vibe",
  app: "vibe",
  app_developer: "vibe",
  vibe_app_developer: "vibe",
  plugin: "plugin",
  plugins: "plugin"
};

const OWNER_ALLOWED_FILES = [
  "knowledge/governance/KVDF_PLANNER_LAYER.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
  "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
  "docs/workflows/PLANNER_SELF_PLANNING_ENGINE.md",
  "docs/workflows/SOURCE_CONTROL_PROVIDER_MODEL.md",
  "packs/planner/evolution-planner.prompt.md",
  "packs/planner/codex-execution.prompt.md",
  "packs/planner/idea-to-evolution.prompt.md",
  "schemas/planner/planner-method.schema.json",
  "schemas/planner/planner-review.schema.json",
  "schemas/planner/planner-docs-materialization.schema.json",
  "schemas/planner/evolution-plan.schema.json",
  "schemas/planner/task-punch.schema.json",
  "schemas/planner/idea-to-evolution-pipeline.schema.json",
  "schemas/planner/design-artifacts.schema.json",
  "schemas/planner/version-plan.schema.json",
  "schemas/planner/source-control.schema.json",
  "src/cli/commands/planner.js",
  "src/cli/dispatchers/build.js",
  "src/cli/index.js",
  "src/cli/ui.js",
  "src/cli/validate.js",
  "tests/cli.integration.test.js",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "docs/reports/*"
];

const OWNER_FORBIDDEN_FILES = [
  "KVDOS/",
  ".kabeeri/",
  "workspaces/apps/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  "plugins/*/docs/",
  "docs/site/pages/ar/",
  "docs/site/pages/en/vibe-developer.html"
];

const OWNER_OUT_OF_SCOPE = [
  "KVDOS files or workspace content",
  "runtime state under .kabeeri/",
  "branch/PR as the default KVDF Core delivery path",
  "plugin runtime behavior",
  "app builder behavior",
  "dashboard behavior",
  "evolution execution behavior outside the planner layer MVP"
];

const VIBE_ALLOWED_FILES = [
  "workspaces/apps/<app-slug>/",
  ".kabeeri/questionnaires/",
  ".kabeeri/interactions/",
  ".kabeeri/reports/",
  "knowledge/vibe_ux/",
  "docs/workflows/KVDF_LED_DELIVERY.md",
  "docs/workflows/PR_HANDOFF_TEMPLATE.md",
  "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
  "docs/site/pages/en/vibe-developer.html",
  "docs/site/pages/ar/vibe-developer.html",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "tests/cli.integration.test.js"
];

const VIBE_FORBIDDEN_FILES = [
  "KVDOS/",
  "src/cli/commands/planner.js",
  "src/cli/commands/evolution.js",
  "src/cli/commands/dashboard.js",
  "src/cli/commands/dashboard_site.js",
  "src/cli/commands/dashboard_state.js",
  "knowledge/governance/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  ".kabeeri/plugin-links/",
  "docs/reports/"
];

const VIBE_OUT_OF_SCOPE = [
  "KVDF Core edits by default",
  "unrelated products or workspaces",
  "branch/PR as the default path",
  "plugin runtime behavior",
  "dashboard ownership mixing",
  "runtime state writes outside the app-first flow"
];

const VIBE_PIPELINE = [
  "request",
  "questions",
  "answers",
  "intake_plan",
  "review",
  "approve",
  "evolution",
  "task_slicing",
  "implementation",
  "verify",
  "handoff"
];

const VIBER_PIPELINE_STAGE_ORDER = [
  "idea",
  "questionnaire_generation",
  "questionnaire_answers",
  "answer_completeness_check",
  "brief_generation",
  "brief_review",
  "brief_approval",
  "state_resync",
  "current_state_report",
  "app_boundary",
  "documentation_architecture",
  "documentation_folders",
  "documentation_files",
  "system_design",
  "database_design",
  "ui_ux_design",
  "source_control_plan",
  "security_plan",
  "version_plan",
  "evolutions",
  "evolution_order_validation",
  "task_punches",
  "task_punch_review",
  "approval",
  "materialization",
  "codex_prompt",
  "security_gate",
  "handoff_gate",
  "source_control_gate",
  "execution",
  "validation",
  "security_scan",
  "handoff",
  "dashboard_update",
  "learning_capture",
  "closeout"
];

const VIBER_PIPELINE_STAGE_GROUPS = {
  intake: ["idea", "questionnaire_generation", "questionnaire_answers", "answer_completeness_check"],
  brief: ["brief_generation", "brief_review", "brief_approval"],
  state_and_boundary: ["state_resync", "current_state_report", "app_boundary"],
  documentation_and_design: ["documentation_architecture", "documentation_folders", "documentation_files", "system_design", "database_design", "ui_ux_design"],
  planning: ["source_control_plan", "security_plan", "version_plan", "evolutions", "evolution_order_validation"],
  tasking: ["task_punches", "task_punch_review", "approval", "materialization", "codex_prompt"],
  execution: ["security_gate", "handoff_gate", "source_control_gate", "execution", "validation", "security_scan", "handoff"],
  feedback: ["dashboard_update", "learning_capture", "closeout"]
};

const PLUGIN_ALLOWED_FILES_GENERIC = [
  "plugins/<plugin-id>/plugin.json",
  "plugins/<plugin-id>/README.md",
  "plugins/<plugin-id>/docs/",
  "plugins/<plugin-id>/runtime/",
  "plugins/<plugin-id>/tests/",
  "plugins/<plugin-id>/schemas/",
  "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
  "src/cli/commands/plugin.js",
  "src/cli/services/plugin_loader.js",
  "src/cli/services/plugin_mounts.js",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "knowledge/governance/KVDF_PLANNER_LAYER.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
];

const PLUGIN_FORBIDDEN_FILES = [
  "KVDOS/",
  ".kabeeri/plugin-links/",
  ".kabeeri/",
  "workspaces/apps/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  "docs/reports/"
];

const PLUGIN_OUT_OF_SCOPE = [
  "unrelated plugin bundles",
  "KVDOS files or workspace content",
  "runtime mount state under .kabeeri/plugin-links/",
  "branch/PR as the default path",
  "app-builder behavior",
  "dashboard ownership mixing"
];

const PLANNER_DOC_CATEGORIES = [
  { id: "product", title: "Product", folder: "product" },
  { id: "architecture", title: "Architecture", folder: "architecture" },
  { id: "database", title: "Database", folder: "database" },
  { id: "ui_ux", title: "UI/UX", folder: "ui-ux" },
  { id: "api", title: "API", folder: "api" },
  { id: "security", title: "Security", folder: "security" },
  { id: "delivery", title: "Delivery", folder: "delivery" },
  { id: "dependencies", title: "Dependencies", folder: "dependencies" }
];

const PLANNER_DOC_TEMPLATE_LIBRARY = buildAppDocsPackageTemplates({ name: "App", slug: "app" });

const PLANNER_DOC_DEFINITIONS = [
  { doc_id: "prd", title: "Product Requirements Document", filename: "PRD.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["00-overview.md", "01-vision-and-goals.md"], source_planner_stage: "idea", depends_on: [], next_action: "Draft the PRD from the app vision and goals templates." },
  { doc_id: "brd", title: "Business Requirements Document", filename: "BRD.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["00-overview.md"], source_planner_stage: "idea", depends_on: ["prd"], next_action: "Capture the business intent and approval context." },
  { doc_id: "srs", title: "Software Requirements Specification", filename: "SRS.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["01-vision-and-goals.md", "04-user-stories-and-jobs-to-be-done.md"], source_planner_stage: "requirements", depends_on: ["prd"], next_action: "Convert the PRD into a requirements specification." },
  { doc_id: "frd", title: "Functional Requirements Document", filename: "FRD.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["04-user-stories-and-jobs-to-be-done.md", "24-feature-breakdown.md"], source_planner_stage: "requirements", depends_on: ["prd"], next_action: "Document the functional behavior and feature-level rules." },
  { doc_id: "scope", title: "Scope And Non-Goals", filename: "SCOPE_AND_NON_GOALS.md", category: "product", pipeline_stage: "idea", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["02-scope-and-non-goals.md"], source_planner_stage: "idea", depends_on: ["prd"], next_action: "Clarify what is in scope and out of scope." },
  { doc_id: "personas", title: "Users And Personas", filename: "USERS_AND_PERSONAS.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["03-users-and-personas.md"], source_planner_stage: "requirements", depends_on: ["scope"], next_action: "Describe the personas that will use the app." },
  { doc_id: "jtbd", title: "User Stories And JTBD", filename: "USER_STORIES_AND_JTBD.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["04-user-stories-and-jobs-to-be-done.md"], source_planner_stage: "requirements", depends_on: ["personas"], next_action: "Turn user needs into stories and jobs to be done." },
  { doc_id: "feature_breakdown", title: "Feature Breakdown", filename: "FEATURE_BREAKDOWN.md", category: "product", pipeline_stage: "requirements", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["24-feature-breakdown.md"], source_planner_stage: "requirements", depends_on: ["jtbd"], next_action: "Split the app into buildable features." },
  { doc_id: "acceptance_criteria", title: "Acceptance Criteria", filename: "ACCEPTANCE_CRITERIA.md", category: "product", pipeline_stage: "validation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["28-acceptance-criteria.md"], source_planner_stage: "validation", depends_on: ["feature_breakdown"], next_action: "Define how reviewers will confirm the app is done." },
  { doc_id: "system_design", title: "System Design", filename: "SYSTEM_DESIGN.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["12-architecture-overview.md"], source_planner_stage: "system_design", depends_on: ["srs"], next_action: "Map the app architecture and runtime shape." },
  { doc_id: "c4_context", title: "C4 Context", filename: "C4_CONTEXT.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["12-architecture-overview.md"], source_planner_stage: "system_design", depends_on: ["system_design"], next_action: "Capture the app boundary and external actors." },
  { doc_id: "c4_container", title: "C4 Container", filename: "C4_CONTAINER.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["12-architecture-overview.md", "13-module-breakdown.md"], source_planner_stage: "system_design", depends_on: ["c4_context"], next_action: "Describe the runtime containers and deployment units." },
  { doc_id: "c4_component", title: "C4 Component", filename: "C4_COMPONENT.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["13-module-breakdown.md"], source_planner_stage: "system_design", depends_on: ["c4_container"], next_action: "Break containers into components and responsibilities." },
  { doc_id: "module_breakdown", title: "Module Breakdown", filename: "MODULE_BREAKDOWN.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["13-module-breakdown.md"], source_planner_stage: "system_design", depends_on: ["system_design"], next_action: "Define modules and implementation boundaries." },
  { doc_id: "service_boundaries", title: "Service Boundaries", filename: "SERVICE_BOUNDARIES.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["14-service-boundaries.md"], source_planner_stage: "system_design", depends_on: ["module_breakdown"], next_action: "Explain how services stay isolated." },
  { doc_id: "integration_map", title: "Integration Map", filename: "INTEGRATION_MAP.md", category: "architecture", pipeline_stage: "api_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["18-integration-map.md"], source_planner_stage: "api_design", depends_on: ["service_boundaries"], next_action: "Map internal and external integrations." },
  { doc_id: "state_and_lifecycle", title: "State And Lifecycle", filename: "STATE_AND_LIFECYCLE.md", category: "architecture", pipeline_stage: "system_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["23-state-and-lifecycle.md"], source_planner_stage: "system_design", depends_on: ["system_design"], next_action: "Document important object state transitions." },
  { doc_id: "erd", title: "Entity Relationship Diagram", filename: "ERD.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["20-entities-and-relationships.md"], source_planner_stage: "database_design", depends_on: ["system_design"], next_action: "Draft the entity relationships and cardinalities." },
  { doc_id: "data_model", title: "Data Model", filename: "DATA_MODEL.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["19-data-model.md"], source_planner_stage: "database_design", depends_on: ["erd"], next_action: "Define the business objects and persistence model." },
  { doc_id: "database_schema", title: "Database Schema", filename: "DATABASE_SCHEMA.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["22-schema-rules.md"], source_planner_stage: "database_design", depends_on: ["data_model"], next_action: "Write the table and schema rules." },
  { doc_id: "data_dictionary", title: "Data Dictionary", filename: "DATA_DICTIONARY.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["21-data-dictionary.md"], source_planner_stage: "database_design", depends_on: ["data_model"], next_action: "List the important data fields and constraints." },
  { doc_id: "entities_and_relationships", title: "Entities And Relationships", filename: "ENTITIES_AND_RELATIONSHIPS.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["20-entities-and-relationships.md"], source_planner_stage: "database_design", depends_on: ["data_model"], next_action: "Describe how entities connect." },
  { doc_id: "schema_rules", title: "Schema Rules", filename: "SCHEMA_RULES.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["22-schema-rules.md"], source_planner_stage: "database_design", depends_on: ["database_schema"], next_action: "Capture schema constraints and migration safety rules." },
  { doc_id: "migration_plan", title: "Migration Plan", filename: "MIGRATION_PLAN.md", category: "database", pipeline_stage: "database_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["22-schema-rules.md", "33-deployment-and-environments.md"], source_planner_stage: "database_design", depends_on: ["database_schema"], next_action: "Plan the data migration path." },
  { doc_id: "backup_and_recovery", title: "Backup And Recovery", filename: "BACKUP_AND_RECOVERY.md", category: "database", pipeline_stage: "handoff", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["36-backup-and-recovery.md"], source_planner_stage: "handoff", depends_on: ["database_schema"], next_action: "Document backup and recovery expectations." },
  { doc_id: "ui_ux_design", title: "UI/UX Design", filename: "UI_UX_DESIGN.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["05-ux-principles.md", "06-information-architecture.md", "07-user-flows.md"], source_planner_stage: "ui_ux_design", depends_on: ["personas"], next_action: "Draft the experience direction and screen model." },
  { doc_id: "ux_principles", title: "UX Principles", filename: "UX_PRINCIPLES.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["05-ux-principles.md"], source_planner_stage: "ui_ux_design", depends_on: ["ui_ux_design"], next_action: "Capture the experience principles." },
  { doc_id: "information_architecture", title: "Information Architecture", filename: "INFORMATION_ARCHITECTURE.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["06-information-architecture.md"], source_planner_stage: "ui_ux_design", depends_on: ["ui_ux_design"], next_action: "Describe navigation and content hierarchy." },
  { doc_id: "user_flows", title: "User Flows", filename: "USER_FLOWS.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["07-user-flows.md"], source_planner_stage: "ui_ux_design", depends_on: ["information_architecture"], next_action: "Map the major user journeys." },
  { doc_id: "wireframes", title: "Wireframes", filename: "WIREFRAMES.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["08-wireframes.md"], source_planner_stage: "ui_ux_design", depends_on: ["user_flows"], next_action: "Lay out the screen structure." },
  { doc_id: "ui_specification", title: "UI Specification", filename: "UI_SPECIFICATION.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["09-ui-specification.md"], source_planner_stage: "ui_ux_design", depends_on: ["wireframes"], next_action: "Specify the interface components and states." },
  { doc_id: "content_and_tone", title: "Content And Tone", filename: "CONTENT_AND_TONE.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["10-content-and-tone.md"], source_planner_stage: "ui_ux_design", depends_on: ["ui_specification"], next_action: "Capture voice, tone, and microcopy guidance." },
  { doc_id: "accessibility", title: "Accessibility", filename: "ACCESSIBILITY.md", category: "ui_ux", pipeline_stage: "ui_ux_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["11-accessibility.md"], source_planner_stage: "ui_ux_design", depends_on: ["ui_specification"], next_action: "Document accessibility requirements and checks." },
  { doc_id: "api_specification", title: "API Specification", filename: "API_SPECIFICATION.md", category: "api", pipeline_stage: "api_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["15-api-contracts.md"], source_planner_stage: "api_design", depends_on: ["integration_map"], next_action: "Draft the API surface." },
  { doc_id: "api_contracts", title: "API Contracts", filename: "API_CONTRACTS.md", category: "api", pipeline_stage: "api_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["15-api-contracts.md"], source_planner_stage: "api_design", depends_on: ["api_specification"], next_action: "Detail payloads, status codes, and response shapes." },
  { doc_id: "error_handling", title: "Error Handling", filename: "ERROR_HANDLING.md", category: "api", pipeline_stage: "api_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["17-error-handling.md"], source_planner_stage: "api_design", depends_on: ["api_contracts"], next_action: "Define failure and recovery behavior." },
  { doc_id: "authentication_and_permissions", title: "Authentication And Permissions", filename: "AUTHENTICATION_AND_PERMISSIONS.md", category: "api", pipeline_stage: "security_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["16-authentication-and-permissions.md"], source_planner_stage: "security_design", depends_on: ["api_specification"], next_action: "Specify auth and permission rules." },
  { doc_id: "integration_api_notes", title: "Integration API Notes", filename: "INTEGRATION_API_NOTES.md", category: "api", pipeline_stage: "api_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["18-integration-map.md"], source_planner_stage: "api_design", depends_on: ["api_contracts"], next_action: "Record integration-specific API notes." },
  { doc_id: "security_design", title: "Security Design", filename: "SECURITY_DESIGN.md", category: "security", pipeline_stage: "security_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["38-security-and-privacy.md", "39-compliance-notes.md"], source_planner_stage: "security_design", depends_on: ["api_specification"], next_action: "Document the security posture." },
  { doc_id: "threat_model", title: "Threat Model", filename: "THREAT_MODEL.md", category: "security", pipeline_stage: "security_design", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["38-security-and-privacy.md", "40-audit-and-logging.md"], source_planner_stage: "security_design", depends_on: ["security_design"], next_action: "Write the threat model and attack surface." },
  { doc_id: "security_and_privacy", title: "Security And Privacy", filename: "SECURITY_AND_PRIVACY.md", category: "security", pipeline_stage: "security_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["38-security-and-privacy.md"], source_planner_stage: "security_design", depends_on: ["threat_model"], next_action: "Document sensitive data and privacy rules." },
  { doc_id: "role_and_permission_matrix", title: "Role And Permission Matrix", filename: "ROLE_AND_PERMISSION_MATRIX.md", category: "security", pipeline_stage: "security_design", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["16-authentication-and-permissions.md", "41-role-and-permission-matrix.md"], source_planner_stage: "security_design", depends_on: ["security_design"], next_action: "Map roles to permissions and protected actions." },
  { doc_id: "audit_and_logging", title: "Audit And Logging", filename: "AUDIT_AND_LOGGING.md", category: "security", pipeline_stage: "handoff", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["40-audit-and-logging.md"], source_planner_stage: "handoff", depends_on: ["security_design"], next_action: "Define audit and logging expectations." },
  { doc_id: "compliance_notes", title: "Compliance Notes", filename: "COMPLIANCE_NOTES.md", category: "security", pipeline_stage: "handoff", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["39-compliance-notes.md"], source_planner_stage: "handoff", depends_on: ["security_design"], next_action: "Record regulatory or policy obligations." },
  { doc_id: "planning_method", title: "Planning Method", filename: "PLANNING_METHOD.md", category: "delivery", pipeline_stage: "idea", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["01-vision-and-goals.md"], source_planner_stage: "idea", depends_on: ["prd"], next_action: "Confirm the method, rationale, and gates." },
  { doc_id: "version_plan", title: "Version Plan", filename: "VERSION_PLAN.md", category: "delivery", pipeline_stage: "version_plan", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["27-release-plan.md"], source_planner_stage: "version_plan", depends_on: ["feature_breakdown"], next_action: "Plan versions and release slices." },
  { doc_id: "evolutions", title: "Evolutions", filename: "EVOLUTIONS.md", category: "delivery", pipeline_stage: "evolution", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["24-feature-breakdown.md", "25-task-plan.md"], source_planner_stage: "evolution", depends_on: ["version_plan"], next_action: "List governed evolutions." },
  { doc_id: "task_punches", title: "Task Punches", filename: "TASK_PUNCHES.md", category: "delivery", pipeline_stage: "task_punch", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["25-task-plan.md"], source_planner_stage: "task_punch", depends_on: ["evolutions"], next_action: "Break the evolutions into Codex-ready task punches." },
  { doc_id: "implementation_order", title: "Implementation Order", filename: "IMPLEMENTATION_ORDER.md", category: "delivery", pipeline_stage: "implementation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["26-implementation-order.md"], source_planner_stage: "implementation", depends_on: ["task_punches"], next_action: "Sequence the build order." },
  { doc_id: "release_plan", title: "Release Plan", filename: "RELEASE_PLAN.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["27-release-plan.md"], source_planner_stage: "handoff", depends_on: ["implementation_order"], next_action: "Describe the release path." },
  { doc_id: "qa_checklist", title: "QA Checklist", filename: "QA_CHECKLIST.md", category: "delivery", pipeline_stage: "validation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["30-qa-checklist.md"], source_planner_stage: "validation", depends_on: ["test_strategy"], next_action: "Write the manual QA checklist." },
  { doc_id: "test_strategy", title: "Test Strategy", filename: "TEST_STRATEGY.md", category: "delivery", pipeline_stage: "validation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["29-test-strategy.md"], source_planner_stage: "validation", depends_on: ["task_punches"], next_action: "Define automated and manual test coverage." },
  { doc_id: "edge_cases", title: "Edge Cases", filename: "EDGE_CASES.md", category: "delivery", pipeline_stage: "validation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "agile", "hybrid"], optional_for: [], source_template: ["31-edge-cases.md"], source_planner_stage: "validation", depends_on: ["test_strategy"], next_action: "List unusual scenarios and recovery behavior." },
  { doc_id: "performance_notes", title: "Performance Notes", filename: "PERFORMANCE_NOTES.md", category: "delivery", pipeline_stage: "validation", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["32-performance-notes.md"], source_planner_stage: "validation", depends_on: ["test_strategy"], next_action: "Capture performance expectations." },
  { doc_id: "deployment_and_environments", title: "Deployment And Environments", filename: "DEPLOYMENT_AND_ENVIRONMENTS.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["33-deployment-and-environments.md"], source_planner_stage: "handoff", depends_on: ["release_plan"], next_action: "Describe deployment targets and configs." },
  { doc_id: "observability_and_analytics", title: "Observability And Analytics", filename: "OBSERVABILITY_AND_ANALYTICS.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["34-observability-and-analytics.md"], source_planner_stage: "handoff", depends_on: ["deployment_and_environments"], next_action: "Define logs, metrics, and analytics." },
  { doc_id: "support_runbook", title: "Support Runbook", filename: "SUPPORT_RUNBOOK.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["35-support-runbook.md"], source_planner_stage: "handoff", depends_on: ["deployment_and_environments"], next_action: "Document operator support steps." },
  { doc_id: "change_log", title: "Change Log", filename: "CHANGE_LOG.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["37-change-log.md"], source_planner_stage: "handoff", depends_on: ["release_plan"], next_action: "Track meaningful release changes." },
  { doc_id: "handoff", title: "Handoff", filename: "HANDOFF.md", category: "delivery", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["35-support-runbook.md", "27-release-plan.md"], source_planner_stage: "handoff", depends_on: ["support_runbook"], next_action: "Prepare the final handoff summary." },
  { doc_id: "vendor_and_dependency_inventory", title: "Vendor And Dependency Inventory", filename: "VENDOR_AND_DEPENDENCY_INVENTORY.md", category: "dependencies", pipeline_stage: "handoff", planning_method_relevance: ["structured", "agile", "hybrid"], required_for: ["structured", "hybrid"], optional_for: ["agile"], source_template: ["42-vendor-and-dependency-inventory.md"], source_planner_stage: "handoff", depends_on: ["integration_map"], next_action: "List vendors, packages, and service dependencies." }
];

const PLANNER_PORTABLE_DOC_MAPPINGS = [
  {
    doc_id: "ui_ux_design",
    canonical_docs: ["05-ux-principles.md", "06-information-architecture.md", "09-ui-specification.md"]
  },
  {
    doc_id: "system_design",
    canonical_docs: ["12-architecture-overview.md", "13-module-breakdown.md", "14-service-boundaries.md"]
  },
  {
    doc_id: "data_model",
    canonical_docs: ["19-data-model.md", "20-entities-and-relationships.md", "21-data-dictionary.md"]
  },
  {
    doc_id: "security_design",
    canonical_docs: ["38-security-and-privacy.md", "16-authentication-and-permissions.md", "41-role-and-permission-matrix.md"]
  },
  {
    doc_id: "version_plan",
    canonical_docs: ["28-release-plan.md", "27-implementation-order.md"]
  },
  {
    doc_id: "task_punches",
    canonical_docs: ["26-task-plan.md", "27-implementation-order.md", "31-qa-checklist.md"]
  }
];

function planner(action, value, flags = {}, rest = [], deps = {}) {
  const mode = normalizePlannerAction(action);
  if (!["next", "status", "show", "plan", "prompt", "method", "auto", "review", "resume", "docs", "version", "feedback", "truth", "evolution", "task-punch", "visual", "pipeline", "train", "propose", "approve", "current", "current-state", "boundary", "stale-state", "reject", "complete", "materialize", "guard", "state", "state-resync"].includes(mode)) {
    throw new Error(`Unknown planner action: ${action}`);
  }

  const request = resolvePlannerRequest({ action: mode, value, flags, rest }, deps);

  if (mode === "guard") {
    const report = buildPlannerGuardReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "guard");
    return;
  }

  if (mode === "state" || mode === "state-resync") {
    const report = buildPlannerCurrentStateReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "current-state");
    return;
  }

  if (mode === "propose") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner propose.");
    const report = buildPlannerProposalReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "propose");
    return;
  }

  if (mode === "approve") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner approve.");
    const report = approvePlannerPlan(planId, resolveApprovalOwner(flags), deps);
    printPlannerOutput(report, flags, deps, "approve");
    return;
  }

  if (mode === "current") {
    const report = buildPlannerCurrentReport(deps);
    printPlannerOutput(report, flags, deps, "current");
    return;
  }

  if (mode === "current-state") {
    const report = buildPlannerCurrentStateReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "current-state");
    return;
  }

  if (mode === "boundary") {
    const report = buildPlannerWorkspaceBoundaryReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "boundary");
    return;
  }

  if (mode === "stale-state") {
    const report = buildPlannerStaleStateReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "stale-state");
    return;
  }

  if (mode === "resume") {
    const report = buildPlannerResumeReport(deps);
    printPlannerOutput(report, flags, deps, "current");
    return;
  }

  if (mode === "reject") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner reject.");
    const report = rejectPlannerPlan(planId, resolveRejectReason(flags, rest), flags, deps);
    printPlannerOutput(report, flags, deps, "reject");
    return;
  }

  if (mode === "complete") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner complete.");
    const report = completePlannerPlan(planId, resolveCompleteNote(flags, rest), deps);
    printPlannerOutput(report, flags, deps, "complete");
    return;
  }

  if (mode === "materialize") {
    const planId = isFromCurrentPlan(flags) ? null : resolvePlanId(value, flags, rest);
    const report = materializePlannerPlan(planId, flags, deps);
    printPlannerOutput(report, flags, deps, "materialize");
    return;
  }

  if (mode === "method") {
    const goal = resolveGoal(value, flags, rest, "");
    const report = buildPlannerMethodReport(goal, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "method");
    return;
  }

  if (mode === "auto") {
    const goal = resolveGoal(value, flags, rest, "");
    const report = buildPlannerAutoPlanReport(goal, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "auto");
    return;
  }

  if (mode === "review") {
    const report = buildPlannerReviewReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "review");
    return;
  }

  if (mode === "docs") {
    const docsAction = normalizePlannerDocsAction(value, rest);
    const report = buildPlannerDocsCommandReport(docsAction, value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "docs");
    return;
  }

  if (mode === "version") {
    const versionAction = normalizePlannerVersionAction(value, rest);
    const report = buildPlannerVersionCommandReport(versionAction, value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "version");
    return;
  }

  if (mode === "feedback") {
    const report = buildPlannerFeedbackCommandReport(value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "feedback");
    return;
  }

  if (mode === "truth") {
    const report = buildPlannerTruthReportService(deps);
    printPlannerOutput(report, flags, deps, "truth");
    return;
  }

  if (mode === "prompt") {
    if (isFromCurrentPlan(flags)) {
      const report = buildPlannerPromptFromCurrentPlan(request, deps);
      printPlannerOutput(report, flags, deps, "prompt");
      return;
    }
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner prompt.");
    const report = buildPlannerPromptReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "prompt");
    return;
  }

  if (mode === "evolution") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner evolution.");
    const report = buildPlannerEvolutionReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "evolution");
    return;
  }

  if (mode === "task-punch") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner task punch.");
    const report = buildPlannerTaskPunchReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "task-punch");
    return;
  }

  if (mode === "visual") {
    if (isFromCurrentPlan(flags)) {
      const report = buildPlannerVisualFromCurrentReport(request, deps);
      printPlannerOutput(report, flags, deps, "visual");
      return;
    }
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner visual.");
    const report = buildPlannerVisualReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "visual");
    return;
  }

  if (mode === "pipeline") {
    const idea = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!idea) throw new Error("Missing idea for planner pipeline.");
    const report = buildIdeaToEvolutionPipelineReport(idea, request, deps);
    printPlannerOutput(report, flags, deps, "pipeline");
    return;
  }

  if (mode === "train") {
    const trainAction = normalizePlannerTrainAction(value, rest);
    const report = buildPlannerTrainCommandReport(trainAction, value, flags, rest, deps);
    printPlannerOutput(report, flags, deps, "train");
    return;
  }

  const report = buildPlannerNextReport(request, deps);
  printPlannerOutput(report, flags, deps, "next");
}

function buildPlannerNextReport(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const sourceControl = request.source_control || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const stateResync = buildPlannerStateResyncSummary(context, request);
  const recommendedEvolution = recommendNextEvolution(mode, context, pluginContext, request);
  const plan = buildPlannerEvolutionPlan(recommendedEvolution.title, { ...request, mode, deliveryMode, pluginContext, sourceControl, recommendedEvolution }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const report = {
    report_type: "kvdf_planner_next",
    generated_at: new Date().toISOString(),
    status: stateResync.status === "blocked" ? "blocked" : (stateResync.status === "warning" ? "warning" : "pass"),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    state_resync: stateResync,
    state_resync_required: !stateResync.fresh,
    recommended_evolution: recommendedEvolution,
    allowed_files: plan.allowed_files,
    forbidden_files: plan.forbidden_files,
    out_of_scope: plan.out_of_scope,
    validation_commands: plan.validation_commands,
    stop_condition: plan.stop_condition,
    task_punch: taskPunch,
    next_action: getPlannerNextAction(mode, plan.title, pluginContext),
    source: context.source
  };
  if (mode === "vibe") report.pipeline = [...VIBE_PIPELINE];
  if (mode === "plugin") report.plugin_context = pluginContext;
  return attachPlannerCurrentStateSummary(report, context, request);
}

function buildPlannerMethodReport(goal, flags = {}, rest = [], deps = {}) {
  const planning = buildPlannerPlanningContext(goal, { flags, ...flags }, deps, { methodFromFlags: true, rest });
  return {
    report_type: "kvdf_planner_method_recommendation",
    generated_at: new Date().toISOString(),
    goal: planning.goal,
    planner_mode: planning.mode,
    track: planning.track,
    recommended_method: planning.method.recommended_method,
    reason: planning.method.reason,
    confidence: planning.method.confidence,
    method_rules_matched: planning.method.method_rules_matched,
    delivery_recommendation: planning.method.delivery_recommendation,
    risks: planning.method.risks,
    next_action: `Run kvdf planner auto --goal "${escapeQuotes(planning.goal)}" --track ${planning.mode} --method ${planning.method.recommended_method} --json`
  };
}

function buildPlannerAutoPlanReport(goal, flags = {}, rest = [], deps = {}) {
  const planning = buildPlannerPlanningContext(goal, { flags, ...flags }, deps, { methodFromFlags: true, rest });
  const pipeline = buildIdeaToEvolutionPipelineReport(planning.goal, {
    ...flags,
    mode: planning.mode,
    deliveryMode: planning.delivery_mode,
    pluginContext: planning.plugin_context,
    source_control: planning.source_control
  }, planning.context);
  const planningStrategy = buildPlannerStrategy(planning.method.recommended_method, planning.mode, pipeline);
  const review = buildPlannerReviewSummary({
    goal: planning.goal,
    planner_mode: planning.mode,
    track: pipeline.track,
    planning_method: planning.method.recommended_method,
    source_control: planning.source_control,
    documentation_files: pipeline.documentation_files,
    docs_plan: pipeline.docs_plan,
    docs_status: pipeline.docs_status,
    visual_planning: pipeline.visual_planning,
    task_punches: pipeline.task_punches,
    evolutions: pipeline.evolutions,
    method: planning.method,
    plugin_context: planning.plugin_context,
    delivery_mode: planning.delivery_mode,
    version_control: pipeline.version_control,
    latest_feedback: pipeline.latest_feedback || null,
    roadmap_train: pipeline.roadmap_train || null
  });
  const visualPlanning = {
    ...(pipeline.visual_planning || {}),
    planning_method: planning.method.recommended_method,
    method_reason: planning.method.reason,
    confidence: planning.method.confidence,
    review_status: review.status,
    docs_status: pipeline.docs_status ? pipeline.docs_status.status : "planned",
    docs_created_total: pipeline.docs_status ? pipeline.docs_status.existing_total || 0 : (Array.isArray(pipeline.documentation_files) ? pipeline.documentation_files.length : 0),
    version_control: pipeline.version_control || null,
    risks: planning.method.risks,
    current_gate: planning.current_gate,
    next_action: pipeline.next_action || ""
  };
  const codexPrompt = renderCodexPrompt({
    goal: planning.goal,
    mode: planning.mode,
    plan: pipeline.version_plan && pipeline.version_plan.versions && pipeline.version_plan.versions[0] ? pipeline.version_plan.versions[0].evolution : pipeline.evolutions[0],
    taskPunch: pipeline.task_punches && pipeline.task_punches[0] ? pipeline.task_punches[0] : {},
    context: planning.context,
    pluginContext: planning.plugin_context,
    sourceControl: planning.source_control,
    aiLearning: planning.ai_learning,
    planningMethod: planning.method.recommended_method,
    methodReason: planning.method.reason,
    review,
    docsStatus: pipeline.docs_status ? pipeline.docs_status.status : "planned",
    visualSummary: visualPlanning,
    currentGate: planning.current_gate,
    versionControl: pipeline.version_control,
    latestFeedback: pipeline.latest_feedback || null,
    roadmapTrain: pipeline.roadmap_train || null
  });
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_auto_plan",
    generated_at: new Date().toISOString(),
    planner_mode: planning.mode,
    track: pipeline.track,
    planning_method: planning.method.recommended_method,
    method_reason: planning.method.reason,
    confidence: planning.method.confidence,
    goal: planning.goal,
    source_control: planning.source_control,
    planning_strategy: planningStrategy,
    documentation_files: pipeline.documentation_files,
    docs_plan: pipeline.docs_plan,
    docs_status: pipeline.docs_status,
    design_artifacts: pipeline.design_artifacts,
    version_plan: pipeline.version_plan,
    evolutions: pipeline.evolutions,
    task_punches: pipeline.task_punches,
    visual_planning: visualPlanning,
    review,
    codex_prompt: codexPrompt,
    validation_commands: pipeline.validation_commands || [],
    stop_condition: pipeline.stop_condition || "",
    next_evolution: pipeline.next_evolution || null,
    version_control: pipeline.version_control || null,
    publish_readiness: pipeline.version_control ? pipeline.version_control.publish_readiness || null : null,
    latest_feedback: pipeline.latest_feedback || null,
    source_pipeline: pipeline,
    approval_required: true,
    next_action: "Review the auto plan, then run kvdf planner propose/approve/materialize or kvdf planner docs."
  }, planning.context, {
    track: planning.mode,
    app: planning.pipeline && planning.pipeline.app || flags.app || flags.app_slug || flags["app-slug"] || "",
    plugin: planning.plugin_context && planning.plugin_context.plugin_id || flags.plugin || flags.plugin_id || ""
  });
}

function buildPlannerPlanningContext(goal, request = {}, deps = {}, options = {}) {
  const isResolvedRequest = request && typeof request === "object" && Object.prototype.hasOwnProperty.call(request, "mode") && Object.prototype.hasOwnProperty.call(request, "deliveryMode") && Object.prototype.hasOwnProperty.call(request, "recommended_evolution") && Object.prototype.hasOwnProperty.call(request, "context");
  const resolved = isResolvedRequest
    ? request
    : resolvePlannerRequest({ action: options.action || "auto", value: goal, flags: request.flags || request, rest: options.rest || [] }, deps);
  const flags = request.flags || request || {};
  const mode = normalizePlannerMode(resolved.mode || request.mode || flags.mode || normalizeTrackAlias(flags.track) || "owner");
  const planningMethodInput = normalizePlannerMethod(
    readPlannerFlag(flags, "method", "planning-method", "planning_method") ||
    request.method ||
    request.planning_method ||
    request["planning-method"] ||
    "auto"
  );
  const method = buildPlannerMethodRecommendation(goal || resolved.goal, {
    ...request,
    flags,
    mode,
    deliveryMode: resolved.deliveryMode,
    pluginContext: mode === "plugin" && (resolved.plugin_id || flags.plugin) ? buildPluginContext({ plugin_id: resolved.plugin_id || flags.plugin }, resolved.context) : null,
    source_control: resolved.source_control
  }, resolved.context, planningMethodInput);
  const selectedMethod = planningMethodInput === "auto" ? method.recommended_method : planningMethodInput;
  const pluginContext = mode === "plugin" ? (resolved.plugin_id ? buildPluginContext({ plugin_id: resolved.plugin_id }, resolved.context) : (flags.plugin ? buildPluginContext({ plugin_id: flags.plugin }, resolved.context) : null)) : null;
  const sourceControl = resolved.source_control || buildPlannerSourceControl({ flags }, resolved.context, mode, resolved.deliveryMode, pluginContext);
  const aiLearning = buildAiLearningPromptContext(mode, { include_all: true });
  const currentGate = buildPlannerCurrentGate(selectedMethod, sourceControl, mode);
  const pipeline = options.skip_pipeline ? null : buildIdeaToEvolutionPipelineReport(goal || resolved.goal, {
    ...flags,
    mode,
    deliveryMode: resolved.deliveryMode,
    method: selectedMethod,
    planning_method: selectedMethod,
    pluginContext,
    source_control: sourceControl
  }, resolved.context);
  return {
    ...resolved,
    mode,
    flags,
    goal: goal || resolved.goal,
    method: {
      ...method,
      requested_method: planningMethodInput,
      selected_method: selectedMethod
    },
    planning_method: selectedMethod,
    method_input: planningMethodInput,
    plugin_context: pluginContext,
    source_control: sourceControl,
    ai_learning: aiLearning,
    current_gate: currentGate,
    pipeline,
    track: getPlannerTrack(mode)
  };
}

function buildPlannerMethodRecommendation(goal, request = {}, context = {}, explicitMethod = "auto") {
  const mode = request.mode || resolvePlannerMode(request, context);
  const track = getPlannerTrack(mode);
  const text = String(goal || request.goal || request.idea || "").toLowerCase();
  const deliveryRecommendation = buildDeliveryModeRecommendation(goal || request.goal || request.idea || "", request.flags || request);
  const methodRulesMatched = [];
  let structuredScore = 0;
  let agileScore = 0;
  let hybridScore = 0;
  const addRule = (rule, weights = { structured: 0, agile: 0, hybrid: 0 }) => {
    methodRulesMatched.push(rule);
    structuredScore += weights.structured || 0;
    agileScore += weights.agile || 0;
    hybridScore += weights.hybrid || 0;
  };
  const has = (pattern) => pattern.test(text);

  if (mode === "plugin") {
    addRule("plugin_track_structured_default", { structured: 5 });
  } else if (mode === "owner") {
    addRule("owner_track_prefers_structured_or_hybrid", { structured: 2, hybrid: 1 });
  } else if (mode === "vibe") {
    addRule("vibe_track_prefers_hybrid_or_agile", { hybrid: 2, agile: 1 });
  }

  if (has(/security|database|schema|source control|source-control|core|plugin-loader|migration|integration|enterprise|release|architecture|api|backend|compliance|audit|governance|sso|permissions|regulatory/)) {
    addRule("hardening_integration_or_core_work", { structured: 4 });
  }
  if (has(/ui|ux|design|content|prototype|mvp|iterate|feedback|small|quick|landing|single screen|copy|blog|marketing/)) {
    addRule("iteration_or_small_scope_work", { agile: 3 });
  }
  if (has(/build|full|app|product|system|end-to-end|dashboard|booking|commerce|platform|suite|workflow/)) {
    addRule("full_product_or_system_build", { hybrid: 4 });
  }
  if (has(/unclear|idea|brainstorm|explore|discover|research|not sure|unknown scope|rough/)) {
    addRule("unclear_scope_needs_hybrid", { hybrid: 4 });
  }
  if (mode === "vibe" && has(/small|quick|ui|content|copy|single|simple|one screen|landing/)) {
    addRule("vibe_small_iteration_agile", { agile: 4 });
  }
  if (mode === "vibe" && has(/build|full app|product|system|booking|commerce|dashboard|platform/)) {
    addRule("vibe_full_product_hybrid", { hybrid: 5 });
  }
  if (mode === "plugin") {
    addRule("plugin_manifest_runtime_docs_tests_parity", { structured: 2 });
  }
  if (!methodRulesMatched.length) {
    addRule("safe_default", { structured: 1, hybrid: 1 });
  }

  let recommended_method = "structured";
  let scoreSnapshot = { structured: structuredScore, agile: agileScore, hybrid: hybridScore };
  if (hybridScore >= structuredScore && hybridScore >= agileScore) recommended_method = "hybrid";
  else if (agileScore > structuredScore) recommended_method = "agile";
  if (mode === "plugin") recommended_method = "structured";
  if (mode === "owner" && recommended_method === "agile") recommended_method = "hybrid";
  if (mode === "vibe" && recommended_method === "structured" && /build|full|product|system|booking|commerce|dashboard|platform/.test(text)) recommended_method = "hybrid";
  if (mode === "vibe" && recommended_method === "structured" && /ui|content|copy|small|quick|landing/.test(text)) recommended_method = "agile";
  if (mode === "owner" && /security|database|schema|source control|plugin-loader|core|enterprise|integration/.test(text)) recommended_method = "structured";
  if (/unclear|idea|brainstorm|explore|discover|research|full|product|system|build/.test(text) && mode !== "plugin" && recommended_method === "structured") {
    recommended_method = "hybrid";
  }

  const total = Math.max(structuredScore + agileScore + hybridScore, 1);
  const margin = Math.max(structuredScore, agileScore, hybridScore) - sortedMethodScores(scoreSnapshot)[1];
  const confidence = margin >= 4 ? "high" : margin >= 2 ? "medium" : "low";
  const reasonMap = {
    structured: "Structured planning is recommended because the request benefits from upfront docs, acceptance gates, and controlled validation.",
    agile: "Agile planning is recommended because the request benefits from smaller iterations and faster feedback.",
    hybrid: "Hybrid planning is recommended because the request needs a structured foundation first, then agile execution slices."
  };
  const risks = [];
  if (recommended_method === "agile" && has(/security|database|schema|source control|core|integration|enterprise|release/)) risks.push("Agile may under-plan a scope that benefits from stronger upfront structure.");
  if (recommended_method === "structured" && has(/ui|content|copy|prototype|small|quick|feedback/)) risks.push("Structured planning may over-specify a small iteration that needs faster feedback.");
  if (recommended_method === "hybrid") risks.push("Hybrid requires disciplined transitions from foundation to slices.");
  return {
    recommended_method,
    reason: reasonMap[recommended_method],
    confidence,
    method_rules_matched: methodRulesMatched,
    delivery_recommendation: deliveryRecommendation,
    risks
  };
}

function buildPlannerStrategy(method, mode, pipeline = null) {
  const base = {
    method,
    mode,
    foundation: method === "hybrid" ? "structured" : method,
    execution: method === "hybrid" ? "agile" : method,
    review_gates: method === "agile" ? ["lightweight feedback", "task punch review"] : ["requirements", "design", "acceptance gates", "validation"],
    notes: []
  };
  if (method === "hybrid") {
    base.notes.push("Use a structured foundation first, then move into agile evolutions.");
  }
  if (mode === "plugin") {
    base.notes.push("Keep plugin manifest, runtime, docs, schemas, and tests in parity.");
  }
  if (mode === "vibe") {
    base.notes.push("Keep app docs and handoff artifacts file-first and local-first.");
  }
  if (pipeline && Array.isArray(pipeline.pipeline)) {
    base.pipeline = [...pipeline.pipeline];
  }
  return base;
}

function buildPlannerReviewSummary({ goal, planner_mode, track, planning_method, source_control, documentation_files = [], visual_planning = null, task_punches = [], evolutions = [], method = null, plugin_context = null, delivery_mode = null, current_plan = null, security_gate = null, docs_plan = null, docs_status = null, version_control = null, latest_feedback = null, roadmap_train = null }) {
  const risks = [];
  const requiredFixes = [];
  let status = "pass";
  const docsEntries = Array.isArray(docs_status && docs_status.docs)
    ? docs_status.docs
    : Array.isArray(docs_plan && docs_plan.docs)
      ? docs_plan.docs
      : Array.isArray(documentation_files)
        ? documentation_files
        : [];
  const docsCount = docsEntries.length;
  const hasVisual = Boolean(visual_planning && visual_planning.graph && visual_planning.board);
  const hasPrompt = Boolean(goal && goal.trim());
  const sourceControlMode = source_control ? String(source_control.mode || "local_only") : "local_only";
  const sourceControlReview = {
    status: source_control ? "pass" : "warning",
    summary: source_control ? summarizeSourceControl(source_control) : "No source control context recorded.",
    notes: source_control ? (source_control.notes || []) : ["Source control context is not available."]
  };
  const scopeReview = {
    status: planner_mode ? "pass" : "blocked",
    track,
    planner_mode,
    notes: []
  };
  if (!goal) {
    status = "blocked";
    requiredFixes.push("Provide a goal or current plan before proceeding.");
  }
  const methodReview = {
    status: planning_method ? "pass" : "blocked",
    planning_method,
    recommended_method: method ? method.recommended_method : planning_method,
    reason: method ? method.reason : "",
    notes: []
  };
  if (method && method.recommended_method && planning_method && method.recommended_method !== planning_method) {
    methodReview.status = "warning";
    methodReview.notes.push(`Recommended ${method.recommended_method} but selected ${planning_method}.`);
    risks.push("The selected planning method differs from the recommendation.");
  }
  const docsReview = {
    status: docs_status && docs_status.status ? (docs_status.status === "missing" ? "warning" : docs_status.status) : (docsCount > 0 ? "pass" : "warning"),
    docs_count: docsCount,
    docs_status: docs_status && docs_status.status ? docs_status.status : (docsCount > 0 ? "planned" : "missing"),
    stage_status: docs_status && docs_status.stage_status ? docs_status.stage_status : {},
    required_total: docs_status && typeof docs_status.required_total === "number" ? docs_status.required_total : 0,
    missing_total: docs_status && typeof docs_status.missing_total === "number" ? docs_status.missing_total : 0,
    notes: docsCount > 0 ? ["Documentation files are planned or generated."] : ["Documentation files are not yet planned."]
  };
  const securityReview = {
    status: security_gate ? security_gate.status || "unknown" : "not_recorded",
    next_action: security_gate ? security_gate.next_action || "" : "Security gate not recorded for this plan.",
    notes: security_gate ? [security_gate.next_action || "Security gate data is available."] : ["Security gate state is optional and not recorded."]
  };
  const taskQualityReview = {
    status: Array.isArray(task_punches) && task_punches.length ? "pass" : "warning",
    notes: Array.isArray(task_punches) && task_punches.length ? ["Task punches are available."] : ["Task punches are missing."],
    task_punches: Array.isArray(task_punches) ? task_punches.length : 0
  };
  const visualReview = {
    status: hasVisual ? "pass" : "warning",
    notes: hasVisual ? ["Visual planner output is present."] : ["Visual planner output is missing."],
    review_status: hasVisual ? "pass" : "warning"
  };
  const versionControlReview = {
    status: version_control ? (version_control.publish_readiness && version_control.publish_readiness.status === "blocked" ? "warning" : "pass") : "warning",
    current_version: version_control && version_control.current_version ? version_control.current_version.version_id || version_control.current_version.title || "" : "",
    next_version: version_control && version_control.next_version ? version_control.next_version.version_id || version_control.next_version.title || "" : "",
    publish_readiness: version_control ? version_control.publish_readiness || null : null,
    notes: version_control ? ["Version control summary is available."] : ["Version control summary is missing."]
  };
  const publishReadinessReview = {
    status: version_control && version_control.publish_readiness ? version_control.publish_readiness.status || "unknown" : "unknown",
    blockers: version_control && version_control.publish_readiness ? [...(version_control.publish_readiness.blockers || [])] : [],
    warnings: version_control && version_control.publish_readiness ? [...(version_control.publish_readiness.warnings || [])] : [],
    next_action: version_control && version_control.publish_readiness ? version_control.publish_readiness.next_action || "" : ""
  };
  const trainReview = roadmap_train ? {
    status: roadmap_train.readiness ? roadmap_train.readiness.status || roadmap_train.status || "unknown" : roadmap_train.status || "unknown",
    next_action: roadmap_train.next_action || (roadmap_train.readiness && roadmap_train.readiness.next_action) || "Review the roadmap train.",
    next_evolution_id: roadmap_train.next_evolution_id || null,
    blockers: roadmap_train.readiness && Array.isArray(roadmap_train.readiness.blockers) ? [...roadmap_train.readiness.blockers] : [],
    warnings: roadmap_train.readiness && Array.isArray(roadmap_train.readiness.warnings) ? [...roadmap_train.readiness.warnings] : []
  } : null;
  const docsStatus = docsReview.docs_status;
  if (!hasVisual) requiredFixes.push("Generate the visual planner output before execution.");
  if (!Array.isArray(task_punches) || !task_punches.length) requiredFixes.push("Generate task punches before execution.");
  if (sourceControlMode === "none") {
    sourceControlReview.status = "warning";
    sourceControlReview.notes.push("Source control is local-only or unavailable.");
  }
  if (planner_mode === "owner" && track !== "framework_owner") {
    status = "blocked";
    requiredFixes.push("Owner track must resolve to framework_owner.");
  }
  if (planner_mode === "vibe" && track !== "vibe_app_developer") {
    status = "blocked";
    requiredFixes.push("Vibe track must resolve to vibe_app_developer.");
  }
  if (planner_mode === "plugin" && track !== "plugin") {
    status = "blocked";
    requiredFixes.push("Plugin track must resolve to plugin.");
  }
  if (security_gate && security_gate.status === "blocked") {
    status = "blocked";
    requiredFixes.push(security_gate.next_action || "Address security gate blockers.");
  }
  if (status !== "blocked" && (methodReview.status === "warning" || docsReview.status === "warning" || sourceControlReview.status === "warning" || visualReview.status === "warning")) {
    status = "warning";
  }
  if (status === "pass" && !hasPrompt) {
    status = "warning";
    risks.push("Goal text is missing from the planner review.");
  }
  if (latest_feedback && latest_feedback.status && latest_feedback.status !== "pass") {
    risks.push(`Latest feedback status: ${latest_feedback.status}`);
  }
  return {
    plan_id: current_plan && current_plan.plan_id ? current_plan.plan_id : null,
    status,
    planner_mode,
    planning_method,
    scope_review: scopeReview,
    method_review: methodReview,
    docs_review: docsReview,
    security_review: securityReview,
    source_control_review: sourceControlReview,
    task_quality_review: taskQualityReview,
    visual_review: visualReview,
    version_control_review: versionControlReview,
    publish_readiness_review: publishReadinessReview,
    train_review: trainReview,
    review_status: status,
    docs_status: docsStatus,
    risks,
    required_fixes: uniqueList(requiredFixes),
    next_action: status === "blocked"
      ? (requiredFixes[0] || "Resolve the blocked planning checks.")
      : status === "warning"
        ? "Review the warnings, then decide whether to approve or materialize."
        : "Planner review passed. Proceed to approval or materialization."
  };
}

function buildPlannerBlockedReviewReport(message, context) {
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_review",
    generated_at: new Date().toISOString(),
    plan_id: null,
    status: "blocked",
    planner_mode: null,
    planning_method: null,
    scope_review: { status: "blocked", notes: [message] },
    method_review: { status: "blocked", notes: [message] },
    docs_review: { status: "blocked", notes: [message] },
    security_review: { status: "blocked", notes: [message] },
    source_control_review: { status: "blocked", notes: [message] },
    task_quality_review: { status: "blocked", notes: [message] },
    visual_review: { status: "blocked", notes: [message] },
    risks: [message],
    required_fixes: [message],
    next_action: message
  }, context, {});
}

function buildPlannerReviewFromCurrentPlan(currentPlan, context) {
  const mode = normalizePlannerMode(currentPlan.planner_mode);
  const planningMethod = currentPlan.planning_method || currentPlan.review && currentPlan.review.planning_method || null;
  const method = buildPlannerMethodRecommendation(currentPlan.goal || "", { mode, flags: {}, source_control: currentPlan.source_control }, context, planningMethod || "auto");
  const versionControl = buildPlannerVersionControlSummary({
    versionPlan: currentPlan.version_plan || {},
    currentPlan,
    versionControlState: readPlannerVersionControlState(context.repo_root, currentPlan.app_slug || ""),
    context,
    appSlug: currentPlan.app_slug || "",
    track: currentPlan.track || getPlannerTrack(mode),
    plannerMode: mode,
    sourceControl: currentPlan.source_control || null
  });
  const latestFeedback = readPlannerLatestFeedback(context.repo_root, currentPlan.app_slug || "");
  const roadmapTrain = currentPlan.version_plan
    ? buildPlannerRoadmapTrainSummary({
      pipeline: {
        version_plan: currentPlan.version_plan || {},
        version_control: versionControl,
        docs_plan: currentPlan.docs_plan || null,
        docs_status: currentPlan.docs_status || null,
        validation_commands: currentPlan.validation_commands || [],
        visual_planning: currentPlan.visual_planning || currentPlan.visual || null
      },
      context,
      profile: {
        train_type: mode === "vibe" ? "viber" : "owner",
        track: currentPlan.track || getPlannerTrack(mode),
        mode,
        planning_method: planningMethod || method.recommended_method,
        app_slug: currentPlan.app_slug || ""
      },
      planning: {
        planning_method: planningMethod || method.recommended_method,
        source_control: currentPlan.source_control || null
      },
      goal: currentPlan.goal || "",
      flags: {}
    })
    : currentPlan.roadmap_train || null;
  const review = buildPlannerReviewSummary({
    goal: currentPlan.goal,
    planner_mode: mode,
    track: currentPlan.track || getPlannerTrack(mode),
    planning_method: planningMethod || method.recommended_method,
    source_control: currentPlan.source_control,
    documentation_files: currentPlan.documentation_files || [],
    docs_plan: currentPlan.docs_plan || null,
    docs_status: currentPlan.docs_status || null,
    visual_planning: currentPlan.visual_planning || currentPlan.visual || null,
    task_punches: currentPlan.task_punches || (currentPlan.task_punch ? [currentPlan.task_punch] : []),
    evolutions: currentPlan.evolutions || (currentPlan.recommended_evolution ? [currentPlan.recommended_evolution] : []),
    method,
    plugin_context: currentPlan.plugin_context || null,
    delivery_mode: currentPlan.delivery_mode || getDeliveryMode(mode),
    current_plan: currentPlan,
    security_gate: readJsonFileIfExists(path.join(context.repo_root, ".kabeeri", "security", "security_gate_state.json")),
    version_control: versionControl,
    latest_feedback: latestFeedback,
    roadmap_train: roadmapTrain
  });
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_review",
    generated_at: new Date().toISOString(),
    plan_id: currentPlan.plan_id || null,
    status: review.status,
    planner_mode: mode,
    planning_method: review.planning_method,
    scope_review: review.scope_review,
    method_review: review.method_review,
    docs_review: review.docs_review,
    docs_status: review.docs_status,
    security_review: review.security_review,
    source_control_review: review.source_control_review,
    task_quality_review: review.task_quality_review,
    visual_review: review.visual_review,
    version_control_review: review.version_control_review,
    publish_readiness_review: review.publish_readiness_review,
    risks: review.risks,
    required_fixes: review.required_fixes,
    next_action: review.next_action
  }, context, {
    track: currentPlan.track || getPlannerTrack(mode),
    app: normalizeAppSlug(currentPlan.app_slug || "")
  });
}

function buildPlannerCurrentGate(method, sourceControl, mode) {
  if (!sourceControl || sourceControl.mode === "local_only" || sourceControl.provider === "none") return "owner_approval_gate";
  if (mode === "vibe") return "app_delivery_gate";
  if (mode === "plugin") return "plugin_parity_gate";
  return method === "hybrid" ? "structured_foundation_gate" : "owner_approval_gate";
}

function buildPlannerResumeNextAction({ currentPlan, review, securityGateState, plannerState, deliveryDecisions, dashboard, tasksState }) {
  if (!plannerState) return "Run kvdf planner propose --goal \"...\" --track owner|vibe|plugin --json to create planner runtime state.";
  if (!currentPlan) return "Run kvdf planner propose --goal \"...\" --track owner|vibe|plugin --json, then approve the recommended plan.";
  if (review && review.status === "blocked") return review.required_fixes && review.required_fixes.length ? review.required_fixes[0] : "Resolve the blocked review items.";
  if (securityGateState && securityGateState.status === "blocked") return securityGateState.next_action || "Resolve the blocked security gate.";
  if (currentPlan.materialization_status !== "materialized") return "Run kvdf planner materialize --from-current --json to create Evolution and Task Punch runtime records.";
  return "Run kvdf planner prompt --from-current --json, then execute the first approved task slice.";
}

function buildPlannerDocsCatalog(options = {}) {
  const plannerMode = normalizePlannerMode(options.plannerMode || options.track || "vibe");
  const appSlug = normalizeAppSlug(options.appSlug || "app-draft");
  const pluginId = normalizePluginId(options.pluginId || "plugin");
  const docs = PLANNER_DOC_DEFINITIONS.map((definition) => ({
    ...definition,
    path: buildPlannerDocsPath(definition, { plannerMode, appSlug, pluginId }),
    source_templates: Array.isArray(definition.source_template) ? [...definition.source_template] : (definition.source_template ? [definition.source_template] : [])
  }));
  const categories = PLANNER_DOC_CATEGORIES.map((category) => ({
    ...category,
    docs: docs.filter((doc) => doc.category === category.id).map((doc) => ({
      doc_id: doc.doc_id,
      title: doc.title,
      path: doc.path,
      pipeline_stage: doc.pipeline_stage
    }))
  }));
  return {
    catalog_type: "kvdf_planner_docs_catalog",
    planner_mode: plannerMode,
    track: getPlannerTrack(plannerMode),
    folder_categories: PLANNER_DOC_CATEGORIES.map((category) => category.folder),
    categories,
    docs
  };
}

function buildPlannerDocumentationFolders(docs = [], options = {}) {
  const plannerMode = normalizePlannerMode(options.plannerMode || options.track || "vibe");
  const appSlug = normalizeAppSlug(options.appSlug || "app-draft");
  const pluginId = normalizePluginId(options.pluginId || "plugin");
  const repoRootPath = options.repo_root || process.cwd();
  const baseRoot = plannerMode === "plugin"
    ? path.join(getPluginSourcePath(pluginId), "docs")
    : path.join(repoRootPath, "workspaces", "apps", appSlug, "docs");
  const categoryMap = new Map(PLANNER_DOC_CATEGORIES.map((category) => [category.id, category]));
  const docsByCategory = new Map();
  for (const doc of Array.isArray(docs) ? docs : []) {
    const categoryId = String(doc.category || "").trim();
    if (!docsByCategory.has(categoryId)) docsByCategory.set(categoryId, []);
    docsByCategory.get(categoryId).push(doc);
  }
  return PLANNER_DOC_CATEGORIES.map((category) => {
    const files = (docsByCategory.get(category.id) || []).map((doc) => ({
      doc_id: doc.doc_id,
      title: doc.title,
      path: doc.path,
      status: doc.status,
      pipeline_stage: doc.pipeline_stage
    }));
    const folderPath = normalizeRelativePath(repoRootPath, path.join(baseRoot, category.folder));
    const required = files.some((file) => ["planned", "generated", "reviewed", "approved", "applied_to_stage"].includes(String(file.status || "").toLowerCase()));
    const status = files.some((file) => String(file.status || "").toLowerCase() === "blocked")
      ? "blocked"
      : files.some((file) => String(file.status || "").toLowerCase() === "missing")
        ? "missing"
        : files.some((file) => String(file.status || "").toLowerCase() === "planned")
          ? "planned"
          : files.some((file) => String(file.status || "").toLowerCase() === "generated")
            ? "generated"
            : files.some((file) => String(file.status || "").toLowerCase() === "reviewed")
              ? "reviewed"
              : files.some((file) => String(file.status || "").toLowerCase() === "approved")
                ? "approved"
                : "unknown";
    const requiredTotal = files.filter((file) => ["planned", "generated", "reviewed", "approved", "applied_to_stage"].includes(String(file.status || "").toLowerCase())).length;
    return {
      folder_id: category.folder,
      title: category.title,
      path: `${folderPath.replace(/\\/g, "/").replace(/\/?$/, "/")}`,
      required,
      status,
      required_total: requiredTotal,
      files
    };
  }).filter((folder) => folder.files.length || folder.required);
}

function buildPlannerPortableDocsMapping(options = {}) {
  const plannerMode = normalizePlannerMode(options.plannerMode || options.track || "vibe");
  const appSlug = normalizeAppSlug(options.appSlug || "app-draft");
  const pluginId = normalizePluginId(options.pluginId || "plugin");
  const repoRootPath = options.repo_root || process.cwd();
  const plannerDocsRoot = plannerMode === "plugin"
    ? normalizeRelativePath(repoRootPath, path.join(getPluginSourcePath(pluginId), "docs"))
    : normalizeRelativePath(repoRootPath, path.join(repoRootPath, "workspaces", "apps", appSlug, "docs"));
  const canonicalRoot = normalizeRelativePath(repoRootPath, path.join(repoRootPath, "workspaces", "apps", appSlug, "docs"));
  const mappingById = new Map(PLANNER_PORTABLE_DOC_MAPPINGS.map((item) => [item.doc_id, item]));
  return PLANNER_DOC_DEFINITIONS.map((definition) => {
    const mapping = mappingById.get(definition.doc_id);
    if (!mapping) return null;
    const canonicalDocs = Array.isArray(mapping.canonical_docs) ? mapping.canonical_docs.map((doc) => `${canonicalRoot}/${doc}`) : [];
    const categoryFolder = (PLANNER_DOC_CATEGORIES.find((category) => category.id === definition.category) || {}).folder || definition.category;
    return {
      planner_doc: `${plannerDocsRoot.replace(/\\/g, "/")}/${categoryFolder}/${definition.filename}`,
      canonical_docs: canonicalDocs,
      mapping_status: "planned"
    };
  }).filter(Boolean);
}

function buildPlannerDocumentationFilesFromFolders(folders = []) {
  const files = [];
  for (const folder of Array.isArray(folders) ? folders : []) {
    for (const file of Array.isArray(folder.files) ? folder.files : []) {
      if (file && file.path) files.push(file.path);
    }
  }
  return uniqueList(files);
}

function buildPlannerDocsPlan(sourcePipeline = {}, options = {}) {
  const plannerMode = normalizePlannerMode(sourcePipeline.planner_mode || options.plannerMode || options.track || "vibe");
  const track = sourcePipeline.track || getPlannerTrack(plannerMode);
  const requestedMethod = normalizePlannerMethod(sourcePipeline.planning_method || options.method || "structured");
  const idea = String(sourcePipeline.idea || sourcePipeline.goal || options.idea || options.goal || sourcePipeline.next_evolution && sourcePipeline.next_evolution.title || "KVDF Planning Idea").trim();
  const appSlug = normalizeAppSlug(options.appSlug || sourcePipeline.app_slug || sourcePipeline.app || (plannerMode === "vibe" ? "app-draft" : "app-draft"));
  const pluginId = normalizePluginId(options.pluginId || sourcePipeline.plugin_id || sourcePipeline.plugin_context && sourcePipeline.plugin_context.plugin_id || "plugin");
  const catalog = buildPlannerDocsCatalog({ plannerMode, appSlug, pluginId });
  const method = requestedMethod === "auto"
    ? buildPlannerMethodRecommendation(idea, { mode: plannerMode, flags: { track: plannerMode }, source_control: sourcePipeline.source_control || null }, {}, "auto").recommended_method
    : requestedMethod;
  const heuristics = buildPlannerDocsHeuristics({ idea, plannerMode, track, method });
  const docs = catalog.docs.map((definition) => buildPlannerDocsPlanEntry(definition, {
    plannerMode,
    track,
    method,
    idea,
    appSlug,
    pluginId,
    heuristics,
    repo_root: options.repo_root || process.cwd(),
    dryRun: Boolean(options.dryRun),
    force: Boolean(options.force),
    sourcePipeline
  }));
  const documentationFolders = buildPlannerDocumentationFolders(docs, { plannerMode, appSlug, pluginId, repo_root: options.repo_root || process.cwd() });
  const portableDocsMapping = buildPlannerPortableDocsMapping({ plannerMode, appSlug, pluginId, repo_root: options.repo_root || process.cwd() });
  const documentationFiles = buildPlannerDocumentationFilesFromFolders(documentationFolders);
  const summary = summarizePlannerDocsEntries(docs);
  return {
    report_type: "kvdf_planner_docs_plan",
    generated_at: new Date().toISOString(),
    planner_mode: plannerMode,
    track,
    planning_method: method,
    requested_method: requestedMethod,
    idea,
    app: plannerMode === "vibe" ? appSlug : null,
    plugin: plannerMode === "plugin" ? pluginId : null,
    folder_categories: catalog.folder_categories,
    catalog,
    documentation_folders: documentationFolders,
    portable_docs_mapping: portableDocsMapping,
    documentation_files: documentationFiles,
    docs,
    docs_plan: docs,
    stage_status: summary.stage_status,
    required_total: summary.required_total,
    existing_total: summary.existing_total,
    generated_total: summary.generated_total,
    missing_total: summary.missing_total,
    applied_total: summary.applied_total,
    not_applied_total: summary.not_applied_total,
    status: summary.status,
    next_action: summary.next_action,
    source_pipeline: sourcePipeline
  };
}

function buildPlannerDocsPlanEntry(definition, options = {}) {
  const repoRootPath = options.repo_root || process.cwd();
  const docsPath = buildPlannerDocsPath(definition, options);
  const relativePath = normalizeRelativePath(repoRootPath, docsPath);
  const heuristics = options.heuristics || buildPlannerDocsHeuristics({ idea: options.idea || "", plannerMode: options.plannerMode || "vibe", track: options.track || "vibe_app_developer", method: options.method || "structured" });
  const required = isPlannerDocRequired(definition, heuristics, options.method);
  const relevant = isPlannerDocRelevant(definition, heuristics, options.method);
  const fileExistsNow = fs.existsSync(docsPath);
  const status = required
    ? (fileExistsNow ? "generated" : "planned")
    : (relevant ? "planned" : "not_applicable");
  return {
    doc_id: definition.doc_id,
    title: definition.title,
    path: relativePath,
    category: definition.category,
    pipeline_stage: definition.pipeline_stage,
    planning_method_relevance: Array.isArray(definition.planning_method_relevance) ? [...definition.planning_method_relevance] : [],
    required_for: Array.isArray(definition.required_for) ? [...definition.required_for] : [],
    optional_for: Array.isArray(definition.optional_for) ? [...definition.optional_for] : [],
    status,
    applied: false,
    implemented: false,
    review_required: required || relevant,
    source_template: Array.isArray(definition.source_template) ? definition.source_template[0] : definition.source_template || "",
    source_templates: Array.isArray(definition.source_template) ? [...definition.source_template] : [],
    source_planner_stage: definition.source_planner_stage || definition.pipeline_stage,
    depends_on: Array.isArray(definition.depends_on) ? [...definition.depends_on] : [],
    next_action: definition.next_action || "Review and complete this draft.",
    required,
    relevant,
    file_exists: fileExistsNow,
    write_path: docsPath,
    content: buildPlannerFolderedDocMarkdown(definition, {
      idea: options.idea || "",
      plannerMode: options.plannerMode || "vibe",
      track: options.track || getPlannerTrack(options.plannerMode || "vibe"),
      method: options.method || "structured",
      appSlug: options.appSlug || null,
      pluginId: options.pluginId || null,
      heuristics
    }),
    dry_run: Boolean(options.dryRun),
    force: Boolean(options.force)
  };
}

function summarizePlannerDocsEntries(docs = []) {
  const stageStatus = {};
  let required_total = 0;
  let existing_total = 0;
  let generated_total = 0;
  let missing_total = 0;
  let applied_total = 0;
  let not_applied_total = 0;
  for (const doc of docs) {
    const stage = doc.pipeline_stage || "unknown";
    if (!stageStatus[stage]) {
      stageStatus[stage] = { required: 0, existing: 0, generated: 0, missing: 0, applied: 0, not_applied: 0, status: "missing" };
    }
    if (doc.required) required_total += 1;
    if (doc.status !== "not_applicable") not_applied_total += doc.status === "planned" ? 1 : 0;
    if (doc.file_exists) {
      existing_total += 1;
      generated_total += 1;
    }
    if (doc.status === "missing") missing_total += 1;
    if (doc.applied) applied_total += 1;
    stageStatus[stage].required += doc.required ? 1 : 0;
    stageStatus[stage].existing += doc.file_exists ? 1 : 0;
    stageStatus[stage].generated += doc.status === "generated" ? 1 : 0;
    stageStatus[stage].missing += doc.status === "missing" || (doc.required && !doc.file_exists) ? 1 : 0;
    stageStatus[stage].applied += doc.applied ? 1 : 0;
    stageStatus[stage].not_applied += doc.status === "planned" ? 1 : 0;
    stageStatus[stage].status = stageStatus[stage].missing > 0 ? "missing" : (stageStatus[stage].not_applied > 0 ? "partial" : "complete");
  }
  const anyMissing = docs.some((doc) => doc.required && !doc.file_exists);
  const anyPlanned = docs.some((doc) => doc.status === "planned");
  const anyBlocked = docs.some((doc) => doc.status === "blocked");
  const status = anyBlocked ? "blocked" : anyMissing ? "missing" : anyPlanned ? "partial" : "complete";
  return {
    stage_status: stageStatus,
    required_total,
    existing_total,
    generated_total,
    missing_total,
    applied_total,
    not_applied_total,
    status,
    next_action: anyBlocked
      ? "Resolve the blocked docs or stage dependencies."
      : anyMissing
        ? "Generate the missing required docs."
        : anyPlanned
          ? "Review and materialize the planned docs."
          : "Docs are complete. Apply the next stage or proceed to implementation."
  };
}

function buildPlannerDocsStatusSummaryFromPlan(docsPlan = {}) {
  const docs = Array.isArray(docsPlan.docs) ? docsPlan.docs : [];
  const summary = summarizePlannerDocsEntries(docs);
  return {
    report_type: "kvdf_planner_docs_status",
    generated_at: new Date().toISOString(),
    planner_mode: docsPlan.planner_mode || null,
    track: docsPlan.track || null,
    planning_method: docsPlan.planning_method || null,
    app: docsPlan.app || null,
    plugin: docsPlan.plugin || null,
    documentation_folders: Array.isArray(docsPlan.documentation_folders) ? docsPlan.documentation_folders.map((folder) => ({
      ...folder,
      files: Array.isArray(folder.files) ? folder.files.map((file) => ({ ...file })) : []
    })) : [],
    portable_docs_mapping: Array.isArray(docsPlan.portable_docs_mapping) ? docsPlan.portable_docs_mapping.map((mapping) => ({
      ...mapping,
      canonical_docs: Array.isArray(mapping.canonical_docs) ? [...mapping.canonical_docs] : []
    })) : [],
    documentation_files: Array.isArray(docsPlan.documentation_files) ? [...docsPlan.documentation_files] : [],
    required_total: summary.required_total,
    existing_total: summary.existing_total,
    generated_total: summary.generated_total,
    missing_total: summary.missing_total,
    applied_total: summary.applied_total,
    not_applied_total: summary.not_applied_total,
    docs,
    stage_status: summary.stage_status,
    status: summary.status,
    next_action: summary.next_action
  };
}

function buildPlannerDocsHeuristics({ idea = "", plannerMode = "vibe", track = "vibe_app_developer", method = "structured" } = {}) {
  const text = String(idea || "").toLowerCase();
  const needsData = /payment|booking|saas|admin|dashboard|crm|database|data|tenant|subscription|order|inventory|auth|role|permission|multi-tenant|backend|api|integration|webhook/.test(text);
  const needsApi = needsData || /api|integration|backend|webhook/.test(text);
  const needsSecurity = needsData || /payment|admin|auth|security|privacy|tenant|permission|sso|audit|compliance/.test(text);
  const landingMvp = /landing page|marketing site|static site|mvp|prototype/.test(text) && !needsData;
  const methodNormalized = normalizePlannerMethod(method);
  const isFullBuild = methodNormalized === "structured" || methodNormalized === "hybrid" || /full|saas|platform|booking|system|enterprise/.test(text);
  const requiredDocIds = new Set();
  const relevantDocIds = new Set();
  const add = (ids, target = requiredDocIds) => {
    for (const id of ids) target.add(id);
  };
  const productCore = ["prd", "brd", "scope", "personas", "jtbd", "feature_breakdown", "acceptance_criteria"];
  const uiCore = ["ui_ux_design", "ux_principles", "information_architecture", "user_flows", "wireframes", "ui_specification", "content_and_tone", "accessibility"];
  const deliveryCore = ["planning_method", "version_plan", "evolutions", "task_punches", "qa_checklist"];
  const handoffCore = ["handoff"];
  if (methodNormalized === "agile") {
    add(productCore);
    add(uiCore);
    add(deliveryCore);
    add(handoffCore);
  } else {
    add(productCore.concat(["srs", "frd", "feature_breakdown"]));
    add(["system_design", "c4_context", "c4_container", "c4_component", "module_breakdown", "service_boundaries", "integration_map", "state_and_lifecycle"]);
    add(uiCore);
    add(["planning_method", "version_plan", "evolutions", "task_punches", "implementation_order", "release_plan", "qa_checklist", "test_strategy", "edge_cases", "performance_notes", "deployment_and_environments", "observability_and_analytics", "support_runbook", "change_log", "handoff"]);
  }
  if (needsData || isFullBuild) {
    add(["erd", "data_model", "database_schema", "data_dictionary", "entities_and_relationships", "schema_rules", "migration_plan", "backup_and_recovery"]);
  }
  if (needsApi || isFullBuild) {
    add(["api_specification", "api_contracts", "error_handling", "authentication_and_permissions", "integration_api_notes"]);
  }
  if (needsSecurity || isFullBuild) {
    add(["security_design", "threat_model", "security_and_privacy", "role_and_permission_matrix", "audit_and_logging", "compliance_notes"]);
  }
  add(["vendor_and_dependency_inventory"], isFullBuild || needsData || needsApi || needsSecurity ? requiredDocIds : relevantDocIds);
  if (plannerMode === "plugin") {
    add(["vendor_and_dependency_inventory", "integration_map", "api_specification"], requiredDocIds);
  }
  if (landingMvp) {
    // Keep the MVP lean; heavy docs stay deferred until the app proves it needs them.
  }
  return {
    idea: String(idea || "").trim(),
    plannerMode,
    track,
    method: methodNormalized,
    needsData,
    needsApi,
    needsSecurity,
    landingMvp,
    required_doc_ids: requiredDocIds,
    relevant_doc_ids: relevantDocIds,
    method_alignment: {
      method: methodNormalized,
      planner_mode: plannerMode,
      track,
      needs_database: needsData,
      needs_api: needsApi,
      needs_security: needsSecurity,
      landing_page_mvp: landingMvp
    }
  };
}

function isPlannerDocRequired(definition, heuristics, method) {
  return heuristics.required_doc_ids.has(definition.doc_id) || (Array.isArray(definition.required_for) && definition.required_for.includes(method));
}

function isPlannerDocRelevant(definition, heuristics, method) {
  if (isPlannerDocRequired(definition, heuristics, method)) return true;
  if (heuristics.relevant_doc_ids.has(definition.doc_id)) return true;
  return ["product", "ui_ux", "delivery"].includes(definition.category);
}

function buildPlannerDocsPath(definition, options = {}) {
  const plannerMode = normalizePlannerMode(options.plannerMode || "vibe");
  const appSlug = normalizeAppSlug(options.appSlug || "app-draft");
  const pluginId = normalizePluginId(options.pluginId || "plugin");
  const categoryFolder = (PLANNER_DOC_CATEGORIES.find((category) => category.id === definition.category) || {}).folder || definition.category;
  if (plannerMode === "plugin") {
    return path.join(getPluginSourcePath(pluginId), "docs", categoryFolder, definition.filename);
  }
  return path.join(options.repo_root || process.cwd(), "workspaces", "apps", appSlug, "docs", categoryFolder, definition.filename);
}

function buildPlannerFolderedDocMarkdown(definition, options = {}) {
  const goal = String(options.idea || options.goal || "").trim();
  const plannerMode = options.plannerMode || "vibe";
  const method = options.method || "structured";
  const templates = Array.isArray(definition.source_template) ? definition.source_template : (definition.source_template ? [definition.source_template] : []);
  const sourceTemplateLines = templates.length ? templates.map((template) => `- ${template}`).join("\n") : "- None";
  return [
    `# ${definition.title}`,
    "",
    `- Doc ID: ${definition.doc_id}`,
    `- Category: ${definition.category}`,
    `- Pipeline stage: ${definition.pipeline_stage}`,
    `- Planning method: ${method}`,
    `- Planner mode: ${plannerMode}`,
    `- Goal: ${goal}`,
    `- Source templates:`,
    sourceTemplateLines,
    "",
    "## Draft Notes",
    `- Source planner stage: ${definition.source_planner_stage || definition.pipeline_stage}`,
    `- Depends on: ${(definition.depends_on || []).length ? definition.depends_on.join(", ") : "none"}`,
    `- Next action: ${definition.next_action || "Review and refine this draft."}`,
    "",
    "## Reuse Notes",
    "- This draft is reorganized from the portable app docs package templates.",
    "- Keep the final app docs inside the app workspace."
  ].join("\n");
}

function normalizeAppSlug(value) {
  const slug = String(value || "app-draft").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "app-draft";
}

function normalizePlannerDocsAction(value, rest = []) {
  const candidate = String(value || rest[0] || "").trim().toLowerCase();
  if (["catalog", "plan", "materialize", "status", "apply-stage", "review"].includes(candidate)) return candidate;
  return "materialize";
}

function readPlannerDocsStatusFile(root, plannerMode, appSlug, pluginId) {
  const filePath = buildPlannerDocsStatusFilePath(root, plannerMode, appSlug, pluginId);
  return readJsonFileIfExists(filePath);
}

function buildPlannerDocsStatusFilePath(root, plannerMode, appSlug, pluginId) {
  if (plannerMode === "plugin") return path.join(getPluginSourcePath(pluginId), ".kabeeri", "planner_docs_status.json");
  return path.join(root, "workspaces", "apps", appSlug, ".kabeeri", "planner_docs_status.json");
}

function writePlannerDocsStatusFile(filePath, report) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function buildPlannerDocsMaterializationReport(value, flags = {}, rest = [], deps = {}) {
  const action = normalizePlannerDocsAction(value, rest);
  if (action !== "materialize" && action !== "plan") {
    return buildPlannerDocsCommandReport(action, value, flags, rest, deps);
  }
  const context = buildPlannerContext(deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  const sourcePipeline = isFromCurrentPlan(flags)
    ? buildPlannerCurrentPipelineSnapshot(context, flags)
    : buildPlannerDocsSourcePipeline(value, flags, rest, deps);
  const plannerMode = normalizePlannerMode(flags.track || sourcePipeline.planner_mode || flags.mode || "vibe");
  const explicitAppSlug = String(flags.app || flags.app_slug || flags["app-slug"] || "").trim();
  const explicitPluginId = String(flags.plugin || flags.plugin_id || "").trim();
  const appSlug = explicitAppSlug ? normalizeAppSlug(explicitAppSlug) : (sourcePipeline.app || sourcePipeline.app_slug ? normalizeAppSlug(sourcePipeline.app || sourcePipeline.app_slug) : "app-draft");
  const pluginId = explicitPluginId ? normalizePluginId(explicitPluginId) : (sourcePipeline.plugin || sourcePipeline.plugin_id ? normalizePluginId(sourcePipeline.plugin || sourcePipeline.plugin_id) : "plugin");
  if (plannerMode === "vibe" && !explicitAppSlug && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing app slug for planner docs materialization. Use --app or --app-slug, or add --dry-run to preview the docs plan.");
    error.current_state = currentState;
    throw error;
  }
  if (plannerMode === "plugin" && !explicitPluginId && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing plugin id for planner docs materialization. Use --plugin or add --dry-run to preview the docs plan.");
    error.current_state = currentState;
    throw error;
  }
  const plan = buildPlannerDocsPlan(sourcePipeline, {
    repo_root: context.repo_root,
    dryRun: resolveBooleanFlag(flags.dry_run || flags["dry-run"]),
    force: resolveBooleanFlag(flags.force),
    appSlug,
    pluginId,
    plannerMode,
    method: normalizePlannerMethod(flags.method || flags.planning_method || sourcePipeline.planning_method || "auto"),
    idea: sourcePipeline.idea || sourcePipeline.goal || value || flags.idea || flags.goal || ""
  });
  const result = materializePlannerDocs(plan, context);
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_docs_materialization",
    generated_at: new Date().toISOString(),
    planner_mode: plan.planner_mode,
    track: plan.track,
    planning_method: plan.planning_method,
    status: "draft",
    docs_plan: plan,
    docs_status: result.docs_status,
    docs_created: result.docs_created,
    docs_updated: result.docs_updated,
    docs_skipped: result.docs_skipped,
    source_pipeline: result.source_pipeline,
    next_action: "Review generated docs, then approve/materialize the first Evolution."
  }, context, { track: plan.planner_mode, app: appSlug, plugin: pluginId });
}

function buildPlannerDocsSourcePipeline(value, flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const idea = resolveGoal(value, flags, rest, flags.idea || flags.goal || "");
  const mode = normalizePlannerMode(flags.track || flags.mode || (flags.plugin ? "plugin" : "vibe"));
  const method = normalizePlannerMethod(flags.method || flags.planning_method || "auto");
  const planning = buildPlannerPlanningContext(idea || "", { ...flags, mode, method }, deps, { methodFromFlags: true, rest, skip_pipeline: false });
  const docsPlan = buildPlannerDocsPlan({
    idea: idea || planning.goal || "",
    goal: idea || planning.goal || "",
    planner_mode: mode,
    track: planning.track,
    planning_method: planning.planning_method,
    plugin_context: planning.plugin_context,
    source_control: planning.source_control,
    pipeline: planning.pipeline,
    docs_plan: planning.pipeline && planning.pipeline.docs_plan ? planning.pipeline.docs_plan : null,
    docs_status: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status : null,
    app_slug: flags.app || flags.app_slug || flags["app-slug"],
    plugin_id: flags.plugin || flags.plugin_id
  }, {
    repo_root: context.repo_root,
    plannerMode: mode,
    track: planning.track,
    method: planning.planning_method,
    appSlug: flags.app || flags.app_slug || flags["app-slug"],
    pluginId: flags.plugin || flags.plugin_id
  });
  return {
    report_type: "kvdf_planner_docs_source_pipeline",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: planning.track,
    planning_method: planning.planning_method,
    goal: planning.goal,
    idea: idea || planning.goal,
    method_reason: planning.method.reason,
    source_control: planning.source_control,
    plugin_context: planning.plugin_context,
    docs_plan: docsPlan,
    docs_status: buildPlannerDocsStatusSummaryFromPlan(docsPlan)
  };
}

function materializePlannerDocs(docsPlan, context = {}) {
  const created = [];
  const updated = [];
  const skipped = [];
  const docsStatusEntries = [];
  for (const entry of docsPlan.docs || []) {
    const absolutePath = entry.write_path || path.resolve(context.repo_root || process.cwd(), entry.path);
    const relativePath = normalizeRelativePath(context.repo_root || process.cwd(), absolutePath);
    const exists = fs.existsSync(absolutePath);
    const record = { ...entry, path: relativePath };
    if (exists && !entry.force) {
      skipped.push(relativePath);
      docsStatusEntries.push({ ...record, status: entry.status === "not_applicable" ? "not_applicable" : "generated", applied: entry.applied, implemented: entry.implemented, file_exists: true });
      continue;
    }
    if (entry.dry_run) {
      created.push(relativePath);
      docsStatusEntries.push({ ...record, status: entry.status === "not_applicable" ? "not_applicable" : "planned", applied: false, implemented: false, file_exists: exists });
      continue;
    }
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, `${entry.content}\n`, "utf8");
    if (exists) updated.push(relativePath);
    else created.push(relativePath);
    docsStatusEntries.push({ ...record, status: "generated", applied: false, implemented: false, file_exists: true });
  }
  const summary = summarizePlannerDocsEntries(docsStatusEntries.length ? docsStatusEntries : docsPlan.docs || []);
  const statusFile = buildPlannerDocsStatusFilePath(context.repo_root || process.cwd(), docsPlan.planner_mode, docsPlan.app || normalizeAppSlug("app-draft"), docsPlan.plugin || normalizePluginId("plugin"));
  const statusReport = {
    report_type: "kvdf_planner_docs_status",
    generated_at: new Date().toISOString(),
    planner_mode: docsPlan.planner_mode,
    track: docsPlan.track,
    planning_method: docsPlan.planning_method,
    app: docsPlan.app || null,
    plugin: docsPlan.plugin || null,
    required_total: summary.required_total,
    existing_total: summary.existing_total,
    missing_total: summary.missing_total,
    applied_total: summary.applied_total,
    not_applied_total: summary.not_applied_total,
    generated_total: summary.generated_total,
    docs: docsStatusEntries.length ? docsStatusEntries : docsPlan.docs || [],
    stage_status: summary.stage_status,
    status: summary.status,
    next_action: summary.next_action
  };
  if (!docsPlan.docs.some((entry) => entry.dry_run)) {
    writePlannerDocsStatusFile(statusFile, statusReport);
  }
  return {
    docs_created: created,
    docs_updated: updated,
    docs_skipped: skipped,
    source_pipeline: docsPlan.source_pipeline || null,
    status_file: statusFile,
    docs_status: statusReport
  };
}

function buildPlannerDocsCommandReport(action, value, flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const plannerMode = normalizePlannerMode(flags.track || flags.mode || (flags.plugin ? "plugin" : "vibe"));
  const method = normalizePlannerMethod(flags.method || flags.planning_method || "auto");
  const explicitAppSlug = String(flags.app || flags.app_slug || flags["app-slug"] || "").trim();
  const explicitPluginId = String(flags.plugin || flags.plugin_id || "").trim();
  const appSlug = explicitAppSlug ? normalizeAppSlug(explicitAppSlug) : "app-draft";
  const pluginId = explicitPluginId ? normalizePluginId(explicitPluginId) : "plugin";
  const sourcePipeline = isFromCurrentPlan(flags)
    ? buildPlannerCurrentPipelineSnapshot(context, flags)
    : buildPlannerDocsSourcePipeline(value, flags, rest, deps);
  if (action === "materialize") {
    const requiresWrite = !resolveBooleanFlag(flags.dry_run || flags["dry-run"]);
    const materializeMode = normalizePlannerMode(flags.track || sourcePipeline.planner_mode || flags.mode || plannerMode);
    const hasAppSlug = Boolean(String(flags.app || flags.app_slug || flags["app-slug"] || "").trim());
    const hasPluginId = Boolean(String(flags.plugin || flags.plugin_id || "").trim());
    if (requiresWrite && materializeMode === "vibe" && !hasAppSlug) {
      throw new Error("Missing app slug for planner docs materialization. Use --app or --app-slug, or add --dry-run to preview the docs plan.");
    }
    if (requiresWrite && materializeMode === "plugin" && !hasPluginId) {
      throw new Error("Missing plugin id for planner docs materialization. Use --plugin or add --dry-run to preview the docs plan.");
    }
  }
  if (action === "catalog") {
    const catalog = buildPlannerDocsCatalog({ plannerMode, appSlug, pluginId });
    return {
      ...catalog,
      generated_at: new Date().toISOString(),
      idea: sourcePipeline.idea || sourcePipeline.goal || ""
    };
  }
  if (action === "plan") {
    const report = buildPlannerDocsPlan(sourcePipeline, {
      repo_root: context.repo_root,
      appSlug,
      pluginId,
      plannerMode,
      method,
      idea: sourcePipeline.idea || sourcePipeline.goal || value || flags.idea || flags.goal || ""
    });
    return attachPlannerCurrentStateSummary(report, context, { track: plannerMode, app: appSlug, plugin: pluginId });
  }
  if (action === "status") {
    const report = buildPlannerDocsStatusReport({
      repo_root: context.repo_root,
      plannerMode,
      track: getPlannerTrack(plannerMode),
      method,
      appSlug,
      pluginId,
      idea: sourcePipeline.idea || sourcePipeline.goal || value || flags.idea || flags.goal || ""
    });
    return attachPlannerCurrentStateSummary(report, context, { track: plannerMode, app: appSlug, plugin: pluginId });
  }
  if (action === "apply-stage") {
    return applyPlannerDocsStage({
      repo_root: context.repo_root,
      plannerMode,
      track: getPlannerTrack(plannerMode),
      method,
      appSlug,
      pluginId,
      stage: String(flags.stage || flags.pipeline_stage || value || "").trim(),
      idea: sourcePipeline.idea || sourcePipeline.goal || value || flags.idea || flags.goal || ""
    });
  }
  if (action === "review") {
    const report = buildPlannerDocsReviewReport({
      repo_root: context.repo_root,
      plannerMode,
      track: getPlannerTrack(plannerMode),
      method,
      appSlug,
      pluginId,
      idea: sourcePipeline.idea || sourcePipeline.goal || value || flags.idea || flags.goal || ""
    });
    return attachPlannerCurrentStateSummary(report, context, { track: plannerMode, app: appSlug, plugin: pluginId });
  }
  return buildPlannerDocsMaterializationReport(value, flags, rest, deps);
}

function buildPlannerDocsStatusReport(options = {}) {
  const repoRootPath = options.repo_root || process.cwd();
  const plannerMode = normalizePlannerMode(options.plannerMode || options.track || "vibe");
  const track = options.track || getPlannerTrack(plannerMode);
  const method = normalizePlannerMethod(options.method || "structured");
  const appSlug = normalizeAppSlug(options.appSlug || "app-draft");
  const pluginId = normalizePluginId(options.pluginId || "plugin");
  const plan = buildPlannerDocsPlan({
    planner_mode: plannerMode,
    track,
    planning_method: method,
    idea: options.idea || "",
    goal: options.idea || ""
  }, { repo_root: repoRootPath, plannerMode, appSlug, pluginId, method, idea: options.idea || "" });
  const statusFile = buildPlannerDocsStatusFilePath(repoRootPath, plannerMode, appSlug, pluginId);
  const existingStatus = readJsonFileIfExists(statusFile);
  const docs = (existingStatus && Array.isArray(existingStatus.docs) ? existingStatus.docs : plan.docs).map((doc) => {
    const absolutePath = buildPlannerDocsPath(PLANNER_DOC_DEFINITIONS.find((item) => item.doc_id === doc.doc_id) || doc, { plannerMode, appSlug, pluginId, repo_root: repoRootPath });
    const fileExistsNow = fs.existsSync(absolutePath);
    const status = fileExistsNow ? (doc.status === "applied_to_stage" ? "applied_to_stage" : (doc.status === "reviewed" || doc.status === "approved" ? doc.status : "generated")) : (doc.required ? "missing" : "not_applicable");
    return {
      ...doc,
      path: normalizeRelativePath(repoRootPath, absolutePath),
      file_exists: fileExistsNow,
      status,
      applied: status === "applied_to_stage" || Boolean(doc.applied),
      implemented: status === "approved" || Boolean(doc.implemented)
    };
  });
  const summary = summarizePlannerDocsEntries(docs);
  return {
    report_type: "kvdf_planner_docs_status",
    generated_at: new Date().toISOString(),
    track,
    app: plannerMode === "vibe" ? appSlug : null,
    plugin: plannerMode === "plugin" ? pluginId : null,
    planner_mode: plannerMode,
    planning_method: method,
    required_total: summary.required_total,
    existing_total: summary.existing_total,
    missing_total: summary.missing_total,
    applied_total: summary.applied_total,
    not_applied_total: summary.not_applied_total,
    generated_total: summary.generated_total,
    docs,
    stage_status: summary.stage_status,
    status: summary.status,
    next_action: summary.next_action
  };
}

function applyPlannerDocsStage(options = {}) {
  const statusReport = buildPlannerDocsStatusReport(options);
  const stage = String(options.stage || "").trim();
  if (!stage) {
    return {
      report_type: "kvdf_planner_docs_apply_stage",
      generated_at: new Date().toISOString(),
      track: statusReport.track,
      app: statusReport.app,
      plugin: statusReport.plugin,
      planner_mode: statusReport.planner_mode,
      planning_method: statusReport.planning_method,
      stage,
      status: "blocked",
      stage_blockers: ["Missing stage. Use --stage with a valid pipeline stage."],
      next_action: "Provide a valid stage."
    };
  }
  const docs = statusReport.docs.map((doc) => {
    if (doc.pipeline_stage !== stage) return doc;
    if (!doc.file_exists) return { ...doc, status: "missing", applied: false };
    return { ...doc, status: "applied_to_stage", applied: true };
  });
  const summary = summarizePlannerDocsEntries(docs);
  const updated = {
    ...statusReport,
    docs,
    stage_status: summary.stage_status,
    status: summary.status,
    next_action: summary.next_action
  };
  const statusFile = buildPlannerDocsStatusFilePath(options.repo_root || process.cwd(), statusReport.planner_mode, statusReport.app || normalizeAppSlug("app-draft"), statusReport.plugin || normalizePluginId("plugin"));
  if (fs.existsSync(statusFile)) writePlannerDocsStatusFile(statusFile, updated);
  return {
    report_type: "kvdf_planner_docs_apply_stage",
    generated_at: new Date().toISOString(),
    track: statusReport.track,
    app: statusReport.app,
    plugin: statusReport.plugin,
    planner_mode: statusReport.planner_mode,
    planning_method: statusReport.planning_method,
    stage,
    status: summary.status === "missing" ? "blocked" : (summary.status === "complete" ? "pass" : "warning"),
    docs,
    stage_status: summary.stage_status,
    next_action: summary.next_action,
    stage_blockers: docs.filter((doc) => doc.pipeline_stage === stage && doc.required && !doc.file_exists).map((doc) => `${doc.doc_id}: missing required doc`),
    docs_status: updated
  };
}

function buildPlannerDocsReviewReport(options = {}) {
  const statusReport = buildPlannerDocsStatusReport(options);
  const missing_required_docs = statusReport.docs.filter((doc) => doc.required && !doc.file_exists).map((doc) => doc.path);
  const not_applied_docs = statusReport.docs.filter((doc) => doc.required && doc.file_exists && doc.status !== "applied_to_stage").map((doc) => doc.path);
  const stage_blockers = Object.entries(statusReport.stage_status || {}).filter(([, stage]) => stage.missing > 0).map(([stage, details]) => `${stage}: ${details.missing} missing required doc(s)`);
  const method_alignment = {
    method: statusReport.planning_method,
    track: statusReport.track,
    docs_ready: missing_required_docs.length === 0,
    missing_required: missing_required_docs.length,
    not_applied: not_applied_docs.length
  };
  const status = missing_required_docs.length ? "blocked" : (not_applied_docs.length || stage_blockers.length ? "warning" : "pass");
  return {
    report_type: "kvdf_planner_docs_review",
    generated_at: new Date().toISOString(),
    track: statusReport.track,
    app: statusReport.app,
    plugin: statusReport.plugin,
    planning_method: statusReport.planning_method,
    status,
    missing_required_docs,
    not_applied_docs,
    stage_blockers,
    method_alignment,
    next_action: status === "blocked" ? "Generate the missing required docs before proceeding." : (status === "warning" ? "Apply the next stage or review the staged docs." : "Docs are ready for implementation.")
  };
}

function buildPlannerDocsMaterializationDraftContent(definition, options = {}) {
  return buildPlannerFolderedDocMarkdown(definition, options);
}

function normalizeRelativePath(root, filePath) {
  if (!root) return filePath.replace(/\\/g, "/");
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function buildPlannerVibeDocContent(fileName, { goal, sourcePipeline, plannerMode, track, method }) {
  return buildPlannerDraftMarkdown({
    title: `KVDF Planner Draft - ${fileName.replace(/\.md$/i, "")}`,
    goal,
    plannerMode,
    track,
    method,
    sourcePipeline,
    includeDesign: true
  });
}

function buildPlannerPluginDocContent(fileName, { goal, sourcePipeline, plannerMode, track, method, pluginId }) {
  return buildPlannerDraftMarkdown({
    title: `Plugin Draft - ${fileName.replace(/\.md$/i, "")}`,
    goal,
    plannerMode,
    track,
    method,
    sourcePipeline,
    pluginId,
    includeDesign: true
  });
}

function buildPlannerOwnerDocContent(fileName, { goal, sourcePipeline, plannerMode, track, method }) {
  return buildPlannerDraftMarkdown({
    title: `KVDF Planner Draft - ${fileName.replace(/\.md$/i, "")}`,
    goal,
    plannerMode,
    track,
    method,
    sourcePipeline,
    includeDesign: true
  });
}

function buildPlannerDraftMarkdown({ title, goal, plannerMode, track, method, sourcePipeline, pluginId = null, includeDesign = false }) {
  const docs = sourcePipeline.documentation_files || [];
  const review = sourcePipeline.review || null;
  const visual = sourcePipeline.visual_planning || null;
  const design = sourcePipeline.design_artifacts || {};
  const versionPlan = sourcePipeline.version_plan || {};
  const evolutions = sourcePipeline.evolutions || [];
  const taskPunches = sourcePipeline.task_punches || [];
  const lines = [
    `# ${title}`,
    "",
    `- Goal: ${goal || ""}`,
    `- Planning method: ${method || ""}`,
    `- Method reason: ${sourcePipeline.method_reason || sourcePipeline.method && sourcePipeline.method.reason || ""}`,
    `- Planner mode: ${plannerMode || ""}`,
    `- Track: ${track || ""}`,
    pluginId ? `- Plugin: ${pluginId}` : null,
    `- Source control: ${sourcePipeline.source_control ? summarizeSourceControl(sourcePipeline.source_control) : "none"}`,
    "",
    "## Visual Planning Summary",
    visual && visual.markdown_report ? visual.markdown_report : "- None",
    "",
    "## Documentation Status",
    docs.length ? docs.map((item) => `- ${item}`).join("\n") : "- None",
    "",
    "## Review Status",
    review ? `- ${review.status || "unknown"}${review.required_fixes && review.required_fixes.length ? `: ${review.required_fixes.join("; ")}` : ""}` : "- None",
    "",
    "## Validation Commands",
    ...(sourcePipeline.validation_commands || DEFAULT_VALIDATION_COMMANDS).map((command) => `- ${command}`),
    "",
    "## Stop Condition",
    sourcePipeline.stop_condition || "",
    "",
    "## Next Evolution",
    sourcePipeline.next_evolution ? `- ${sourcePipeline.next_evolution.title || sourcePipeline.next_evolution.evolution_id || ""}` : "- None"
  ].filter(Boolean);
  if (includeDesign) {
    lines.push(
      "",
      "## System Design",
      ...renderIndentedObjectSection(design.system_design || {}),
      "",
      "## Database Design",
      ...renderIndentedObjectSection(design.database_design || {}),
      "",
      "## UI/UX Design",
      ...renderIndentedObjectSection(design.ui_ux_design || {}),
      "",
      "## API Design",
      ...renderIndentedObjectSection(design.api_design || {}),
      "",
      "## Security Design",
      ...renderIndentedObjectSection(design.security_design || {}),
      "",
      "## Version Plan",
      ...renderIndentedObjectSection(versionPlan || {}),
      "",
      "## Evolutions",
      ...(evolutions.length ? evolutions.map((evolution) => `- ${evolution.title || evolution.evolution_id || ""}`) : ["- None"]),
      "",
      "## Task Punches",
      ...(taskPunches.length ? taskPunches.map((taskPunch) => `- ${taskPunch.title || taskPunch.evolution_id || ""}`) : ["- None"])
    );
  }
  return lines.join("\n");
}

function buildPlannerCurrentPipelineSnapshot(context, flags = {}) {
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) return buildPlannerBlockedReviewReport("No approved current planner plan exists.", context);
  const review = buildPlannerReviewFromCurrentPlan(currentPlan, context);
  const documentationFolders = Array.isArray(currentPlan.documentation_folders)
    ? currentPlan.documentation_folders
    : (currentPlan.docs_plan && Array.isArray(currentPlan.docs_plan.documentation_folders) ? currentPlan.docs_plan.documentation_folders : []);
  const portableDocsMapping = Array.isArray(currentPlan.portable_docs_mapping)
    ? currentPlan.portable_docs_mapping
    : (currentPlan.docs_plan && Array.isArray(currentPlan.docs_plan.portable_docs_mapping) ? currentPlan.docs_plan.portable_docs_mapping : []);
  return {
    report_type: "kvdf_planner_auto_plan",
    generated_at: new Date().toISOString(),
    planner_mode: currentPlan.planner_mode,
    track: currentPlan.track,
    planning_method: currentPlan.planning_method || review.planning_method || "structured",
    method_reason: currentPlan.method_reason || "",
    confidence: currentPlan.confidence || "medium",
    goal: currentPlan.goal || "",
    source_control: currentPlan.source_control || null,
    planning_strategy: currentPlan.planning_strategy || null,
    documentation_files: Array.isArray(currentPlan.documentation_files) && currentPlan.documentation_files.length
      ? [...currentPlan.documentation_files]
      : Array.isArray(currentPlan.docs_plan && currentPlan.docs_plan.documentation_files)
        ? [...currentPlan.docs_plan.documentation_files]
        : [],
    documentation_folders: documentationFolders.map((folder) => ({
      ...folder,
      files: Array.isArray(folder.files) ? folder.files.map((file) => ({ ...file })) : []
    })),
    portable_docs_mapping: portableDocsMapping.map((mapping) => ({
      ...mapping,
      canonical_docs: Array.isArray(mapping.canonical_docs) ? [...mapping.canonical_docs] : []
    })),
    docs_plan: currentPlan.docs_plan || null,
    docs_status: currentPlan.docs_status || null,
    design_artifacts: currentPlan.design_artifacts || null,
    version_plan: currentPlan.version_plan || null,
    evolutions: currentPlan.evolutions || (currentPlan.recommended_evolution ? [currentPlan.recommended_evolution] : []),
    task_punches: currentPlan.task_punches || (currentPlan.task_punch ? [currentPlan.task_punch] : []),
    visual_planning: currentPlan.visual_planning || currentPlan.visual || null,
    review,
    codex_prompt: currentPlan.codex_prompt || renderPlannerPromptFromPlan(currentPlan, context, currentPlan.source_control || null, buildAiLearningPromptContext(normalizePlannerMode(currentPlan.planner_mode), { include_all: true })),
    approval_required: true,
    next_action: "Review the approved current plan, then run kvdf planner prompt --from-current --json."
  };
}

function readJsonFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return safeReadJson(filePath);
  } catch {
    return null;
  }
}

function readDashboardState(dashboardDir) {
  if (!fs.existsSync(dashboardDir)) return null;
  const result = {};
  for (const entry of fs.readdirSync(dashboardDir)) {
    const filePath = path.join(dashboardDir, entry);
    if (fs.statSync(filePath).isFile() && entry.endsWith(".json")) {
      result[entry] = readJsonFileIfExists(filePath);
    }
  }
  return Object.keys(result).length ? result : null;
}

function sortedMethodScores(scoreSnapshot) {
  return Object.values(scoreSnapshot).sort((left, right) => right - left);
}

function uniqueList(items = []) {
  return Array.from(new Set((Array.isArray(items) ? items : []).filter((item) => item !== null && item !== undefined && String(item).trim()))).map((item) => String(item));
}

function buildPlannerReviewReport(value, flags = {}, rest = [], deps = {}) {
  const fromCurrent = isFromCurrentPlan(flags);
  if (fromCurrent) {
    const context = buildPlannerContext(deps);
    const state = loadPlannerState(context.repo_root);
    const currentPlan = findCurrentPlannerPlan(state);
    if (!currentPlan) {
      return buildPlannerBlockedReviewReport("No approved current planner plan exists.", context);
    }
    return buildPlannerReviewFromCurrentPlan(currentPlan, context);
  }
  const goal = resolveGoal(value, flags, rest, "");
  if (!goal) {
    return buildPlannerBlockedReviewReport("Missing goal for planner review.", buildPlannerContext(deps));
  }
  const planning = buildPlannerPlanningContext(goal, { flags, ...flags }, deps, { methodFromFlags: true, rest });
  const versionControl = buildPlannerVersionControlSummary({
    versionPlan: planning.pipeline && planning.pipeline.version_plan ? planning.pipeline.version_plan : {},
    currentPlan: null,
    versionControlState: readPlannerVersionControlState(buildPlannerContext(deps).repo_root, normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || "")),
    context: planning.context,
    appSlug: normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || ""),
    track: planning.track,
    plannerMode: planning.mode,
    sourceControl: planning.source_control
  });
  const latestFeedback = readPlannerLatestFeedback(buildPlannerContext(deps).repo_root, normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || ""));
  const review = buildPlannerReviewSummary({
    goal: planning.goal,
    planner_mode: planning.mode,
    track: planning.track,
    planning_method: planning.method.recommended_method,
    source_control: planning.source_control,
    documentation_files: planning.pipeline.documentation_files,
    docs_plan: planning.pipeline.docs_plan,
    docs_status: planning.pipeline.docs_status,
    visual_planning: planning.pipeline.visual_planning,
    task_punches: planning.pipeline.task_punches,
    evolutions: planning.pipeline.evolutions,
    method: planning.method,
    plugin_context: planning.plugin_context,
    delivery_mode: planning.delivery_mode,
    version_control: versionControl,
    latest_feedback: latestFeedback
  });
  return {
    report_type: "kvdf_planner_review",
    generated_at: new Date().toISOString(),
    plan_id: null,
    status: review.status,
    planner_mode: planning.mode,
    planning_method: review.planning_method,
    scope_review: review.scope_review,
    method_review: review.method_review,
    docs_review: review.docs_review,
    docs_status: review.docs_status,
    security_review: review.security_review,
    source_control_review: review.source_control_review,
    task_quality_review: review.task_quality_review,
    visual_review: review.visual_review,
    version_control_review: review.version_control_review,
    publish_readiness_review: review.publish_readiness_review,
    risks: review.risks,
    required_fixes: review.required_fixes,
    next_action: review.next_action
  };
}

function buildPlannerResumeReport(deps = {}) {
  const context = buildPlannerContext(deps);
  const repoRootPath = context.repo_root;
  const plannerState = readJsonFileIfExists(path.join(repoRootPath, ".kabeeri", "planner.json"));
  const evolutionState = readJsonFileIfExists(path.join(repoRootPath, ".kabeeri", "evolution.json"));
  const tasksState = readJsonFileIfExists(path.join(repoRootPath, ".kabeeri", "tasks.json"));
  const dashboardDir = path.join(repoRootPath, ".kabeeri", "dashboard");
  const dashboard = readDashboardState(dashboardDir);
  const deliveryDecisions = readJsonFileIfExists(path.join(repoRootPath, ".kabeeri", "delivery_decisions.json"));
  const securityGateState = readJsonFileIfExists(path.join(repoRootPath, ".kabeeri", "security", "security_gate_state.json"));
  const currentPlan = plannerState && Array.isArray(plannerState.plans)
    ? findCurrentPlannerPlan(plannerState)
    : null;
  const roadmapTrainState = currentPlan
    ? readPlannerRoadmapTrainState(repoRootPath, currentPlan.planner_mode === "vibe" ? "viber" : "owner", normalizeAppSlug(currentPlan.app_slug || ""))
    : readPlannerRoadmapTrainState(repoRootPath, "owner", "");
  const currentEvolution = evolutionState && Array.isArray(evolutionState.changes)
    ? (evolutionState.current_change_id ? evolutionState.changes.find((item) => String(item.change_id || "") === String(evolutionState.current_change_id)) || null : null)
    : null;
  const currentTaskPunch = currentPlan ? currentPlan.task_punch || null : null;
  const review = currentPlan ? buildPlannerReviewFromCurrentPlan(currentPlan, context) : buildPlannerBlockedReviewReport("No approved current planner plan exists.", context);
  const versionControl = currentPlan ? buildPlannerVersionControlSummary({
    versionPlan: currentPlan.version_plan || {},
    currentPlan,
    versionControlState: readPlannerVersionControlState(repoRootPath, normalizeAppSlug(currentPlan.app_slug || "")),
    context,
    appSlug: normalizeAppSlug(currentPlan.app_slug || ""),
    track: currentPlan.track || "framework_owner",
    plannerMode: currentPlan.planner_mode || "owner",
    sourceControl: currentPlan.source_control || null
  }) : null;
  const blockers = [];
  if (!plannerState) blockers.push("Planner runtime state is missing.");
  if (!currentPlan) blockers.push("No approved current planner plan exists.");
  if (review.status === "blocked") blockers.push(...(review.required_fixes || []));
  if (securityGateState && securityGateState.status === "blocked") blockers.push(`Security gate blocked: ${securityGateState.next_action || "review required"}`);
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_resume",
    generated_at: new Date().toISOString(),
    current_plan: currentPlan || null,
    current_evolution: currentEvolution || null,
    current_task_punch: currentTaskPunch || null,
    planning_method: currentPlan ? currentPlan.planning_method || currentPlan.review && currentPlan.review.planning_method || null : null,
    planner_mode: currentPlan ? currentPlan.planner_mode || null : null,
    delivery_mode: currentPlan ? currentPlan.delivery_mode || null : null,
    source_control: currentPlan ? currentPlan.source_control || null : null,
    docs_plan: currentPlan ? currentPlan.docs_plan || null : null,
    docs_status: currentPlan ? currentPlan.docs_status || null : null,
    version_control: versionControl,
    roadmap_train: roadmapTrainState || null,
    latest_feedback: readPlannerLatestFeedback(repoRootPath, normalizeAppSlug(currentPlan && currentPlan.app_slug || "")) || null,
    review_status: review.status || "unknown",
    next_recommended_action: buildPlannerResumeNextAction({ currentPlan, review, securityGateState, plannerState, deliveryDecisions, dashboard, tasksState }),
    blocked: blockers.length > 0,
    blockers,
    security_gate: securityGateState || null,
    dashboard,
    delivery_decisions: deliveryDecisions || null
  }, context, {
    track: currentPlan ? currentPlan.track : null,
    app: currentPlan ? currentPlan.app_slug || "" : ""
  });
}

function buildPlannerTruthReport(deps = {}) {
  return buildPlannerTruthReportService(deps);
}

function buildPlannerDocsMaterializationReport(value, flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const fromCurrent = isFromCurrentPlan(flags);
  const currentPlan = fromCurrent ? findCurrentPlannerPlan(loadPlannerState(context.repo_root)) : null;
  const goal = resolveGoal(value, flags, rest, currentPlan ? currentPlan.goal || "" : "");
  const planning = buildPlannerPlanningContext(goal || (currentPlan ? currentPlan.goal || "" : ""), { ...flags, method: flags.method || flags.planning_method || "auto" }, deps, { methodFromFlags: true, rest, skip_pipeline: true });
  const sourcePipeline = fromCurrent && currentPlan
    ? buildPlannerCurrentPipelineSnapshot(context, flags)
    : buildPlannerAutoPlanReport(planning.goal, flags, rest, deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  const plannerMode = normalizePlannerMode(flags.track || sourcePipeline.planner_mode || flags.mode || "vibe");
  const explicitAppSlug = String(flags.app || flags.app_slug || flags["app-slug"] || "").trim();
  const explicitPluginId = String(flags.plugin || flags.plugin_id || "").trim();
  const appSlug = explicitAppSlug ? normalizeAppSlug(explicitAppSlug) : (sourcePipeline.app || sourcePipeline.app_slug ? normalizeAppSlug(sourcePipeline.app || sourcePipeline.app_slug) : "app-draft");
  const pluginId = explicitPluginId ? normalizePluginId(explicitPluginId) : (sourcePipeline.plugin || sourcePipeline.plugin_id ? normalizePluginId(sourcePipeline.plugin || sourcePipeline.plugin_id) : "plugin");
  if (plannerMode === "vibe" && !explicitAppSlug && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing app slug for planner docs materialization. Use --app or --app-slug, or add --dry-run to preview the docs plan.");
    error.current_state = currentState;
    throw error;
  }
  if (plannerMode === "plugin" && !explicitPluginId && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing plugin id for planner docs materialization. Use --plugin or add --dry-run to preview the docs plan.");
    error.current_state = currentState;
    throw error;
  }
  const docsPlan = buildPlannerDocsPlan(sourcePipeline, {
    repo_root: context.repo_root,
    dryRun: resolveBooleanFlag(flags.dry_run || flags["dry-run"]),
    force: resolveBooleanFlag(flags.force),
    appSlug,
    pluginId,
    plannerMode
  });
  const result = materializePlannerDocs(docsPlan, context);
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_docs_materialization",
    generated_at: new Date().toISOString(),
    planner_mode: docsPlan.planner_mode,
    track: docsPlan.track,
    planning_method: docsPlan.planning_method,
    status: "draft",
    docs_plan: docsPlan,
    docs_status: result.docs_status,
    docs_created: result.docs_created,
    docs_updated: result.docs_updated,
    docs_skipped: result.docs_skipped,
    source_pipeline: result.source_pipeline,
    next_action: "Review generated docs, then approve/materialize the first Evolution."
  }, context, { track: plannerMode, app: appSlug, plugin: pluginId });
}

function buildPlannerPromptReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const sourceControl = request.source_control || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const aiLearning = buildAiLearningPromptContext(mode, { include_all: true });
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const planning = buildPlannerPlanningContext(goal, request, deps, { mode, deliveryMode, pluginContext, sourceControl, skip_pipeline: true });
  const docsPlan = buildPlannerDocsPlan({
    idea: goal,
    goal,
    planner_mode: mode,
    track: plan.track,
    planning_method: planning.planning_method,
    source_control: sourceControl,
    plugin_context: pluginContext,
    app_slug: request.app || request.app_slug || request["app-slug"],
    plugin_id: request.plugin || request.plugin_id || (pluginContext && pluginContext.plugin_id ? pluginContext.plugin_id : null)
  }, {
    repo_root: context.repo_root,
    plannerMode: mode,
    track: plan.track,
    method: planning.planning_method,
    appSlug: request.app || request.app_slug || request["app-slug"],
    pluginId: request.plugin || request.plugin_id || (pluginContext && pluginContext.plugin_id ? pluginContext.plugin_id : null),
    idea: goal
  });
  const docsStatus = buildPlannerDocsStatusSummaryFromPlan(docsPlan);
  const versionControl = planning.pipeline && planning.pipeline.version_control
    ? planning.pipeline.version_control
    : buildPlannerVersionControlSummary({
      versionPlan: planning.pipeline && planning.pipeline.version_plan ? planning.pipeline.version_plan : {},
      currentPlan: null,
      versionControlState: null,
      context,
      appSlug: normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || ""),
      track: plan.track,
      plannerMode: mode,
      sourceControl
    });
  const latestFeedback = planning.pipeline && planning.pipeline.latest_feedback ? planning.pipeline.latest_feedback : readPlannerLatestFeedback(context.repo_root, normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || ""));
  const visualSummary = buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan: plan,
    taskPunch,
    context,
    pluginContext,
    sourceControl,
    planningMethod: planning.method.recommended_method,
    methodReason: planning.method.reason,
    confidence: planning.method.confidence,
    review: null,
    docsStatus: docsStatus.status,
    docsCreatedTotal: docsStatus.existing_total,
    versionControl,
    risks: planning.method.risks,
    currentGate: planning.current_gate,
    nextAction: plan.next_action,
    roadmapTrain: planning.pipeline ? planning.pipeline.roadmap_train || null : null,
    planningPipeline: planning.pipeline
  });
  const review = buildPlannerReviewSummary({
    goal,
    planner_mode: mode,
    track: plan.track,
    planning_method: planning.method.recommended_method,
    source_control: sourceControl,
    documentation_files: [],
    docs_plan: docsPlan,
    docs_status: docsStatus,
    visual_planning: visualSummary,
    task_punches: [taskPunch],
    evolutions: [plan],
    method: planning.method,
    plugin_context: pluginContext,
    delivery_mode: deliveryMode,
    version_control: versionControl,
    latest_feedback: latestFeedback,
    roadmap_train: planning.pipeline ? planning.pipeline.roadmap_train || null : null
  });
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_codex_prompt",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    ai_learning: aiLearning,
    planning_method: planning.method.recommended_method,
    method_reason: planning.method.reason,
    confidence: planning.method.confidence,
    goal,
    allowed_files: plan.allowed_files,
    forbidden_files: plan.forbidden_files,
    validation_commands: plan.validation_commands,
    stop_condition: plan.stop_condition,
    docs_plan: docsPlan,
    docs_status: docsStatus,
    version_control: versionControl,
    publish_readiness: versionControl.publish_readiness || null,
    latest_feedback: latestFeedback,
    roadmap_train: planning.pipeline ? planning.pipeline.roadmap_train || null : null,
    review,
    visual_summary: visualSummary,
    task_punch: taskPunch,
    prompt: renderCodexPrompt({
      goal,
      mode,
      plan,
      taskPunch,
      context,
      pluginContext,
      sourceControl,
      aiLearning,
      planningMethod: planning.method.recommended_method,
      methodReason: planning.method.reason,
      review,
      docsStatus: docsStatus.status,
      visualSummary,
      currentGate: planning.current_gate,
      versionControl,
      latestFeedback,
      roadmapTrain: planning.pipeline ? planning.pipeline.roadmap_train || null : null,
      pipelineState: visualSummary.viber_pipeline || null
    })
  }, context, {
    track: mode,
    app: request.app || request.app_slug || request["app-slug"] || "",
    plugin: pluginContext ? pluginContext.plugin_id : (request.plugin || request.plugin_id || "")
  });
}

function buildPlannerEvolutionReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const sourceControl = request.source_control || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const aiLearning = buildAiLearningPromptContext(mode, { include_all: true });
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  return {
    report_type: "kvdf_planner_evolution_plan",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    ai_learning: aiLearning,
    goal,
    evolution_plan: plan,
    task_punch: taskPunch,
    prompt: renderCodexPrompt({ goal, mode, plan, taskPunch, context, pluginContext, sourceControl, aiLearning })
  };
}

function buildPlannerTaskPunchReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const sourceControl = request.source_control || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const aiLearning = buildAiLearningPromptContext(mode, { include_all: true });
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    ai_learning: aiLearning,
    evolution_id: plan.evolution_id,
    title: `${plan.title} Task Punch`,
    tasks: taskPunch.tasks,
    plugin_context: pluginContext || undefined
  };
}

function buildPlannerVisualReport(goal, request = {}, deps = {}) {
  const planning = buildPlannerPlanningContext(goal, request, deps);
  const context = planning.context;
  const mode = planning.mode;
  const deliveryMode = planning.deliveryMode;
  const pluginContext = planning.plugin_context;
  const sourceControl = planning.source_control;
  const aiLearning = planning.ai_learning;
  const stateResync = buildPlannerStateResyncSummary(context, request, { track: mode, pluginId: pluginContext ? pluginContext.plugin_id : null });
  const evolutionPlan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const taskPunch = buildPlannerTaskPunch(evolutionPlan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const versionControl = planning.pipeline && planning.pipeline.version_control
    ? planning.pipeline.version_control
    : buildPlannerVersionControlSummary({
      versionPlan: planning.pipeline && planning.pipeline.version_plan ? planning.pipeline.version_plan : {},
      currentPlan: null,
      versionControlState: null,
      context,
      appSlug: normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || ""),
      track: evolutionPlan.track,
      plannerMode: mode,
      sourceControl
    });
  const review = buildPlannerReviewSummary({
    goal,
    planner_mode: mode,
    track: evolutionPlan.track,
    planning_method: planning.planning_method,
    source_control: sourceControl,
    documentation_files: planning.pipeline ? planning.pipeline.documentation_files : [],
    docs_plan: planning.pipeline ? planning.pipeline.docs_plan : null,
    docs_status: planning.pipeline ? planning.pipeline.docs_status : null,
    visual_planning: null,
    task_punches: [taskPunch],
    evolutions: [evolutionPlan],
    method: planning.method,
    plugin_context: pluginContext,
    delivery_mode: deliveryMode,
    version_control: versionControl,
    latest_feedback: planning.pipeline && planning.pipeline.latest_feedback ? planning.pipeline.latest_feedback : readPlannerLatestFeedback(context.repo_root, normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || "")),
    roadmap_train: planning.pipeline ? planning.pipeline.roadmap_train || null : null
  });
  return buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    context,
    pluginContext,
    sourceControl,
    versionControl,
    aiLearning,
    stateResync,
    planningMethod: planning.planning_method,
    methodReason: planning.method.reason,
    confidence: planning.method.confidence,
    review,
    docsStatus: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status.status : "planned",
    docsStatusReport: planning.pipeline ? planning.pipeline.docs_status : null,
    docsCreatedTotal: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status.existing_total || 0 : (planning.pipeline && Array.isArray(planning.pipeline.documentation_files) ? planning.pipeline.documentation_files.length : 0),
    risks: planning.method.risks,
    currentGate: planning.current_gate,
    nextAction: evolutionPlan.next_action
  });
}

function buildPlannerVisualFromCurrentReport(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const goal = currentPlan.goal || (currentPlan.recommended_evolution && currentPlan.recommended_evolution.title) || "Approved planner plan";
  const mode = normalizePlannerMode(currentPlan.planner_mode);
  const deliveryMode = currentPlan.delivery_mode || getDeliveryMode(mode);
  const sourceControl = currentPlan.source_control || buildPlannerSourceControl(
    { flags: {} },
    context,
    mode,
    deliveryMode,
    mode === "plugin" ? (currentPlan.plugin_context || (currentPlan.recommended_evolution && currentPlan.recommended_evolution.plugin_context) || null) : null
  );
  const pluginContext = mode === "plugin"
    ? (currentPlan.plugin_context || buildPluginContext({ plugin_id: currentPlan.recommended_evolution && currentPlan.recommended_evolution.plugin_context && currentPlan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  const stateResync = buildPlannerStateResyncSummary(context, request, { track: mode, pluginId: pluginContext ? pluginContext.plugin_id : null });
  const evolutionPlan = currentPlan.recommended_evolution && Object.keys(currentPlan.recommended_evolution).length
    ? currentPlan.recommended_evolution
    : buildPlannerEvolutionPlan(goal, { mode, deliveryMode, pluginContext }, context);
  const taskPunch = currentPlan.task_punch && Array.isArray(currentPlan.task_punch.tasks) && currentPlan.task_punch.tasks.length
    ? currentPlan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode, pluginContext }, context);
  const review = currentPlan.review || buildPlannerReviewFromCurrentPlan(currentPlan, context);
  const versionControl = currentPlan.version_control || buildPlannerVersionControlSummary({
    versionPlan: currentPlan.version_plan || {},
    currentPlan,
    versionControlState: readPlannerVersionControlState(context.repo_root, normalizeAppSlug(currentPlan.app_slug || "")),
    context,
    appSlug: normalizeAppSlug(currentPlan.app_slug || ""),
    track: currentPlan.track || getPlannerTrack(mode),
    plannerMode: mode,
    sourceControl
  });
  if (currentPlan.visual && currentPlan.visual.report_type === "kvdf_planner_visual" && currentPlan.visual.source_control) {
    return currentPlan.visual;
  }
  return buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    context,
    pluginContext,
    currentPlan,
    sourceControl,
    versionControl,
    stateResync,
    planningMethod: currentPlan.planning_method || review.planning_method || null,
    methodReason: currentPlan.method_reason || "",
    confidence: currentPlan.confidence || "",
    review,
    docsStatus: currentPlan.docs_status ? currentPlan.docs_status.status : (currentPlan.documentation_files && currentPlan.documentation_files.length ? "draft" : "planned"),
    docsStatusReport: currentPlan.docs_status || null,
    docsCreatedTotal: currentPlan.docs_status ? currentPlan.docs_status.existing_total || 0 : (Array.isArray(currentPlan.documentation_files) ? currentPlan.documentation_files.length : 0),
    risks: review.risks || [],
    currentGate: currentPlan.current_gate || buildPlannerCurrentGate(currentPlan.planning_method || "structured", sourceControl, mode),
    nextAction: currentPlan.next_action || evolutionPlan.next_action,
    roadmapTrain: currentPlan.roadmap_train || null
  });
}

function buildPlannerVisualPayload({ goal, mode, deliveryMode, evolutionPlan, taskPunch, context, pluginContext, currentPlan = null, sourceControl = null, planningMethod = null, methodReason = "", confidence = "", review = null, docsStatus = "planned", docsStatusReport = null, docsCreatedTotal = 0, versionControl = null, risks = [], currentGate = null, nextAction = "", roadmapTrain = null, stateResync = null, planningPipeline = null }) {
  const graph = buildPlannerVisualGraph({ mode });
  const board = buildPlannerVisualBoard({ mode, evolutionPlan, taskPunch, currentPlan, sourceControl });
  const scopeMap = buildPlannerVisualScopeMap({ mode, evolutionPlan, taskPunch, pluginContext, sourceControl });
  const planningReadiness = buildPlannerVisualReadinessSummary({ versionControl, docsStatus, docsStatusReport, review, currentPlan, mode, planningMethod, repoRoot: context && context.repo_root ? context.repo_root : null });
  const executionReadiness = buildPlannerVisualExecutionReadiness({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    currentPlan,
    sourceControl,
    versionControl,
    planningReadiness,
    docsStatus,
    docsStatusReport,
    review,
    currentGate,
    nextAction,
    roadmapTrain,
    stateResync,
    context,
    pluginContext,
    risks
  });
  const viberPipeline = mode === "vibe"
    ? buildViberPipelineState({
      idea: goal,
      mode,
      deliveryMode,
      sourceControl,
      stateResync,
      docsPlan: currentPlan && currentPlan.docs_plan ? currentPlan.docs_plan : planningPipeline && planningPipeline.docs_plan ? planningPipeline.docs_plan : null,
      docsStatus: planningPipeline && planningPipeline.docs_status ? planningPipeline.docs_status : docsStatus,
      designArtifacts: planningPipeline && planningPipeline.design_artifacts ? planningPipeline.design_artifacts : null,
      visualPlanning: planningPipeline && planningPipeline.visual_planning ? planningPipeline.visual_planning : null,
      versionPlan: planningPipeline && planningPipeline.version_plan ? planningPipeline.version_plan : null,
      versionControl,
      evolutions: planningPipeline && Array.isArray(planningPipeline.evolutions) ? planningPipeline.evolutions : [],
      taskPunches: planningPipeline && Array.isArray(planningPipeline.task_punches) ? planningPipeline.task_punches : [],
      currentPlan,
      taskPunch,
      pluginContext,
      planningMethod,
      appSlug: currentPlan && currentPlan.app_slug ? normalizeAppSlug(currentPlan.app_slug || "") : ""
    })
    : null;
  const validationCommands = [...(evolutionPlan.validation_commands || DEFAULT_VALIDATION_COMMANDS)];
  const stopCondition = buildPlannerVisualStopCondition({
    base: evolutionPlan.stop_condition || buildPlannerStopCondition(mode, context, pluginContext),
    blockers: executionReadiness.blockers
  });
  const reviewStatus = review ? review.status || "unknown" : (currentPlan && currentPlan.review && currentPlan.review.status) || "warning";
  const markdownReport = buildPlannerVisualMarkdown({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    graph,
    board,
    scopeMap,
    validationCommands,
    stopCondition,
    sourceControl,
    planningMethod,
    methodReason,
    reviewStatus,
    docsStatus,
    docsCreatedTotal,
    docsStatusReport,
    versionControl,
    planningReadiness,
    executionReadiness,
    risks,
    currentGate,
    nextAction: nextAction || evolutionPlan.next_action || "",
    roadmapTrain,
    viberPipeline
  });
  const report = {
    report_type: "kvdf_planner_visual",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    goal,
    source_control: sourceControl,
    graph,
    board,
    scope_map: scopeMap,
    legend: buildPlannerVisualLegend(),
    markdown_report: markdownReport,
    planning_lifecycle: executionReadiness.planning_lifecycle,
    gate_matrix: executionReadiness.gate_matrix,
    blockers: executionReadiness.blockers,
    readiness_summary: executionReadiness.readiness_summary,
    publish_readiness: executionReadiness.publish_readiness,
    execution_feedback: executionReadiness.execution_feedback,
    stage_timeline: executionReadiness.stage_timeline,
    dashboard_summary: executionReadiness.dashboard_summary,
    warnings: executionReadiness.warnings,
    execution_allowed: viberPipeline ? viberPipeline.execution_allowed : null,
    execution_blockers: viberPipeline ? viberPipeline.execution_blockers : [],
    next_stage: viberPipeline ? viberPipeline.next_stage : null,
    validation_commands: validationCommands,
    stop_condition: stopCondition,
    recommended_evolution: evolutionPlan,
    task_punch: taskPunch,
    planning_method: planningMethod,
    method_reason: methodReason,
    confidence: confidence || (review ? review.review_status || review.status || "unknown" : "unknown"),
    review_status: reviewStatus,
    docs_status: docsStatus,
    planning_readiness: planningReadiness,
    docs_created_total: docsCreatedTotal,
    docs_status_report: docsStatusReport,
    version_control: versionControl,
    roadmap_train: roadmapTrain || null,
    risks,
    current_gate: currentGate,
    next_action: nextAction || evolutionPlan.next_action || "",
    state_resync: stateResync || null,
    viber_pipeline: viberPipeline
  };
  if (pluginContext) report.plugin_context = pluginContext;
  return report;
}

function buildPlannerVisualGraph({ mode }) {
  if (mode === "vibe") {
    return {
      format: "mermaid",
      diagram: [
        "flowchart TD",
        "  Request[Request] --> Questions[Questions]",
        "  Questions --> Answers[Answers]",
        "  Answers --> IntakePlan[Intake Plan]",
        "  IntakePlan --> Review[Review]",
        "  Review --> Approval[Approval]",
        "  Approval --> Evolution[Evolution]",
        "  Evolution --> TaskSlicing[Task Slicing]",
        "  TaskSlicing --> Implementation[Implementation]",
        "  Implementation --> Verify[Verify]",
        "  Verify --> Handoff[Handoff]"
      ].join("\n")
    };
  }
  if (mode === "plugin") {
    return {
      format: "mermaid",
      diagram: [
        "flowchart TD",
        "  PluginGoal[Plugin Goal] --> ManifestReview[Manifest Review]",
        "  ManifestReview --> RuntimeEntrypoint[Runtime Entrypoint]",
        "  RuntimeEntrypoint --> Docs[Docs]",
        "  Docs --> Schemas[Schemas]",
        "  Schemas --> Tests[Tests]",
        "  Tests --> InstallUninstall[Install/Uninstall Check]",
        "  InstallUninstall --> Validation[Validation]"
      ].join("\n")
    };
  }
  return {
    format: "mermaid",
    diagram: [
      "flowchart TD",
      "  %% KVDF Core - Detailed Mermaid for highest-priority evolution",
      "",
      "  subgraph Context[\"Current Context\"]",
      "    G[\"Git repo detected\"]",
      "    B[\"Branch: main\"]",
      "    M[\"Planner mode: owner\"]",
      "    T[\"Track: framework_owner\"]",
      "    D[\"Delivery mode: direct_main\"]",
      "  end",
      "",
      "  subgraph Priority[\"Highest Priority Evolution\"]",
      "    E[\"KVDF Planner Track Awareness\"]",
      "    E1[\"Document planner layer and workflow contract\"]",
      "    E2[\"Wire planner command into KVDF Core CLI\"]",
      "    E3[\"Add planner integration and documentation coverage\"]",
      "    E4[\"Source Control: git / direct_main\"]",
      "    E --> E1",
      "    E --> E2",
      "    E --> E3",
      "    E --> E4",
      "  end",
      "",
      "  subgraph Workflow[\"Planner Flow\"]",
      "    A[\"Owner Direction\"] --> P[\"Planner Proposal\"]",
      "    P --> O[\"Owner Approval\"]",
      "    O --> X[\"Evolution\"]",
      "    X --> Y[\"Task Punch\"]",
      "    Y --> C[\"Codex Prompt\"]",
      "    C --> V[\"Validation\"]",
      "    V --> S[\"Direct-to-main Commit\"]",
      "  end",
      "",
      "  subgraph TaskPunch[\"Task Punch Breakdown\"]",
      "    TP1[\"Docs Task\\n- KVDF_PLANNER_LAYER.md\\n- EVOLUTION_PLANNER_WORKFLOW.md\\n- prompt templates\"]",
      "    TP2[\"CLI Task\\n- src/cli/commands/planner.js\\n- src/cli/dispatchers/build.js\\n- src/cli/index.js\\n- src/cli/ui.js\"]",
      "    TP3[\"Tests + Docs Task\\n- tests/cli.integration.test.js\\n- CLI_COMMAND_REFERENCE.md\\n- SYSTEM_CAPABILITIES_REFERENCE.md\"]",
      "    TP4[\"Source Control Task\\n- git\\n- direct_main\\n- main branch\\n- no PR by default\"]",
      "  end",
      "",
      "  subgraph Allowed[\"Allowed Files\"]",
      "    L1[\"knowledge/governance/KVDF_PLANNER_LAYER.md\"]",
      "    L2[\"docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md\"]",
      "    L3[\"docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md\"]",
      "    L4[\"docs/workflows/SOURCE_CONTROL_PROVIDER_MODEL.md\"]",
      "    L5[\"packs/planner/evolution-planner.prompt.md\"]",
      "    L6[\"packs/planner/codex-execution.prompt.md\"]",
      "    L7[\"packs/planner/idea-to-evolution.prompt.md\"]",
      "    L8[\"schemas/planner/evolution-plan.schema.json\"]",
      "    L9[\"schemas/planner/task-punch.schema.json\"]",
      "    L10[\"schemas/planner/idea-to-evolution-pipeline.schema.json\"]",
      "    L11[\"schemas/planner/design-artifacts.schema.json\"]",
      "    L12[\"schemas/planner/version-plan.schema.json\"]",
      "    L13[\"schemas/planner/source-control.schema.json\"]",
      "    L14[\"src/cli/commands/planner.js\"]",
      "    L15[\"src/cli/dispatchers/build.js\"]",
      "    L16[\"src/cli/index.js\"]",
      "    L17[\"src/cli/ui.js\"]",
      "    L18[\"src/cli/validate.js\"]",
      "    L19[\"tests/cli.integration.test.js\"]",
      "    L20[\"docs/cli/CLI_COMMAND_REFERENCE.md\"]",
      "    L21[\"docs/SYSTEM_CAPABILITIES_REFERENCE.md\"]",
      "  end",
      "",
      "  subgraph Validation[\"Validation\"]",
      "    V1[\"node bin/kvdf.js validate\"]",
      "    V2[\"npm test\"]",
      "    V3[\"npm run check\"]",
      "  end",
      "",
      "  subgraph Output[\"Expected Output\"]",
      "    R1[\"Deterministic next evolution recommendation\"]",
      "    R2[\"Task punch with scoped tasks\"]",
      "    R3[\"Codex-ready execution prompt\"]",
      "    R4[\"Track-aware direct-to-main delivery\"]",
      "  end",
      "",
      "  Context --> Priority",
      "  Priority --> Workflow",
      "  Priority --> TaskPunch",
      "  TaskPunch --> Allowed",
      "  TaskPunch --> Validation",
      "  Validation --> Output",
      "",
      "  G --> E4",
      "  B --> E4",
      "  M --> E",
      "  T --> E",
      "  D --> E4",
      "",
      "  E1 --> R1",
      "  E2 --> R3",
      "  E3 --> R2",
      "  E4 --> R4"
    ].join("\n")
  };
}

function buildPlannerVisualBoard({ mode, evolutionPlan, taskPunch, currentPlan, sourceControl }) {
  const baseColumns = [
    { id: "proposed", title: "Proposed", cards: [] },
    { id: "approved", title: "Approved", cards: [] },
    { id: "in_progress", title: "In Progress", cards: [] },
    { id: "blocked", title: "Blocked", cards: [] },
    { id: "verified", title: "Verified", cards: [] },
    { id: "completed", title: "Completed", cards: [] }
  ];
  const evolutionCard = {
    id: evolutionPlan.evolution_id,
    title: evolutionPlan.title,
    type: "evolution",
    status: currentPlan && String(currentPlan.status || "").toLowerCase() === "approved" ? "approved" : "proposed",
    track: evolutionPlan.track,
    delivery_mode: evolutionPlan.delivery_mode,
    next_action: evolutionPlan.next_action
  };
  const taskCards = (taskPunch.tasks || []).map((task) => ({
    id: task.id,
    title: task.title,
    type: "task",
    status: task.status || "proposed",
    allowed_files: task.allowed_files || [],
    forbidden_files: task.forbidden_files || [],
    acceptance_criteria: task.acceptance_criteria || []
  }));
  const evolutionColumn = evolutionCard.status === "approved" ? "approved" : "proposed";
  baseColumns.find((column) => column.id === evolutionColumn).cards.push(evolutionCard);
  for (const task of taskCards) {
    const columnId = normalizePlannerBoardColumn(task.status);
    const column = baseColumns.find((item) => item.id === columnId) || baseColumns[0];
    column.cards.push(task);
  }
  if (mode === "vibe") {
    baseColumns.find((column) => column.id === "proposed").cards.push({
      id: `${evolutionPlan.evolution_id}-pipeline`,
      title: "Request to Handoff Pipeline",
      type: "pipeline",
      status: "proposed",
      pipeline: VIBE_PIPELINE
    });
  }
  if (mode === "plugin") {
    baseColumns.find((column) => column.id === "proposed").cards.push({
      id: `${evolutionPlan.evolution_id}-plugin-parity`,
      title: "Plugin Manifest / Runtime / Docs / Schema / Tests Parity",
      type: "plugin-parity",
      status: "proposed"
    });
  }
  if (sourceControl) {
    baseColumns.find((column) => column.id === "proposed").cards.push({
      id: `${evolutionPlan.evolution_id}-source-control`,
      title: `Source Control: ${summarizeSourceControl(sourceControl)}`,
      type: "source-control",
      status: sourceControl.mode || "proposed",
      source_control: sourceControl
    });
  }
  return { columns: baseColumns };
}

function normalizePlannerBoardColumn(status) {
  const normalized = String(status || "proposed").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "in_progress") return "in_progress";
  if (normalized === "blocked") return "blocked";
  if (normalized === "verified") return "verified";
  if (normalized === "completed" || normalized === "done" || normalized === "owner_verified") return "completed";
  return "proposed";
}

function buildPlannerVisualScopeMap({ mode, evolutionPlan, taskPunch, pluginContext, sourceControl }) {
  const runtimeState = mode === "plugin"
    ? [".kabeeri/plugin-links/", ".kabeeri/plugins.json"]
    : [".kabeeri/planner.json"];
  const generatedArtifacts = ["docs/reports/"];
  if (mode === "plugin") generatedArtifacts.push(`plugins/${pluginContext ? pluginContext.plugin_id : "plugin"}/`);
  const forbiddenFiles = [...(evolutionPlan.forbidden_files || [])];
  if (mode === "plugin") forbiddenFiles.push("plugins/* (unrelated plugins)");
  return {
    allowed_files: [...(evolutionPlan.allowed_files || [])],
    forbidden_files: forbiddenFiles,
    source_control: sourceControl || null,
    runtime_state: runtimeState,
    generated_artifacts: generatedArtifacts,
    docs: [
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
      "knowledge/governance/KVDF_PLANNER_LAYER.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
    ],
    tests: ["tests/cli.integration.test.js"]
  };
}

function buildPlannerVisualLegend() {
  return {
    allowed: "Files Codex may edit",
    forbidden: "Files Codex must not edit",
    source_control: "Source control provider, remote provider, and branch/PR mode",
    runtime_state: "Runtime files that must not be committed",
    generated_artifacts: "Generated files that may refresh during validation",
    docs: "Documentation surfaces",
    tests: "Validation and test surfaces"
  };
}

function buildPlannerVisualQuestionsSection({ mode, goal, planningMethod, methodReason }) {
  const normalizedMode = String(mode || "owner").toLowerCase();
  const baseQuestions = [
    "- Clarify planning goal and acceptance criteria before task execution.",
    "- Confirm source-of-truth file set before mutation: current app docs/specs/config/tests for app, manifest/schema for plugin, or core docs for owner."
  ];
  const modeQuestions = normalizedMode === "vibe"
    ? [
      "- Define app boundaries and out-of-scope items.",
      "- Confirm required data model/API/auth/payment/security scope before versioning.",
      "- Confirm whether workspace docs are draft-only or ready-to-implement."
    ]
    : normalizedMode === "plugin"
      ? [
        "- Confirm plugin manifest and runtime compatibility requirements.",
        "- Confirm schema/docs/test parity expectations before implementation.",
        "- Confirm plugin mount and uninstall behavior assumptions."
      ]
      : [
        "- Confirm exactly which KVDF Core files are in-scope.",
        "- Confirm direct-to-main policy and approval boundaries.",
        "- Confirm whether this request is design-only or execution-ready."
      ];
  return [
    "## Questions and Clarification",
    `- Mode: ${normalizedMode}`,
    `- Goal: ${goal}`,
    `- Planning Method: ${planningMethod || "auto"}`,
    methodReason ? `- Method reason: ${methodReason}` : null,
    "- Clarifications and assumptions:",
    ...baseQuestions.map((item) => `  ${item}`),
    ...modeQuestions.map((item) => `  ${item}`)
  ].filter(Boolean).join("\n");
}

function buildPlannerVisualGateState(gate, status, summary, blockers = [], warnings = [], nextAction = "") {
  return {
    gate,
    status,
    summary,
    blockers: Array.isArray(blockers) ? [...blockers] : [],
    warnings: Array.isArray(warnings) ? [...warnings] : [],
    next_action: nextAction || ""
  };
}

function buildPlannerVisualExecutionReadiness({
  goal,
  mode,
  deliveryMode,
  evolutionPlan,
  taskPunch,
  currentPlan = null,
  sourceControl = null,
  versionControl = null,
  planningReadiness = {},
  docsStatus = "planned",
  docsStatusReport = null,
  review = null,
  currentGate = null,
  nextAction = "",
  roadmapTrain = null,
  stateResync = null,
  context = {},
  pluginContext = null,
  risks = []
}) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const nextVersion = versionControl && versionControl.next_version ? versionControl.next_version : null;
  const currentEvolution = currentPlan && currentPlan.recommended_evolution && currentPlan.recommended_evolution.evolution_id
    ? currentPlan.recommended_evolution.evolution_id
    : evolutionPlan && evolutionPlan.evolution_id
      ? evolutionPlan.evolution_id
      : null;
  const nextEvolution = nextVersion && nextVersion.evolution && nextVersion.evolution.evolution_id
    ? nextVersion.evolution.evolution_id
    : evolutionPlan && evolutionPlan.evolution_id
      ? evolutionPlan.evolution_id
      : currentEvolution;
  const stateFreshness = stateResync && stateResync.state_freshness ? stateResync.state_freshness : "unknown";
  const sourceOfTruth = determinePlannerVisualSourceOfTruth({ mode, stateResync, sourceControl, context, pluginContext });
  const stateResyncGate = buildPlannerVisualGateState(
    "state_resync",
    stateResync && stateResync.status === "blocked"
      ? "blocked"
      : stateFreshness === "current"
        ? "pass"
        : "blocked",
    stateResync && stateResync.reason
      ? stateResync.reason
      : stateFreshness === "current"
        ? "Current-state evidence is fresh."
        : "Run kvdf state resync before authoritative planning.",
    stateResync && stateResync.reasons ? stateResync.reasons.map((item) => String(item)) : [],
    stateFreshness === "current" ? [] : ["State resync is required before execution."]
  );
  const docsGate = buildPlannerVisualDocsGate({ docsStatus, docsStatusReport });
  const evolutionGate = buildPlannerVisualEvolutionGate({ evolutionPlan, currentPlan, currentVersion, nextVersion, stateResync });
  const taskGate = buildPlannerVisualTaskGate({ taskPunch, currentPlan, mode });
  const validationGate = buildPlannerVisualValidationGate({ versionControl, planningReadiness, evolutionPlan });
  const securityGate = buildPlannerVisualSecurityGate({ versionControl, planningReadiness, currentGate, stateResync });
  const handoffGate = buildPlannerVisualHandoffGate({ versionControl, planningReadiness, deliveryMode, sourceControl, mode });
  const publishGate = buildPlannerVisualPublishGate({ versionControl, planningReadiness, sourceControl, mode, handoffGate, validationGate, securityGate, stateResyncGate });
  const gateMatrix = {
    state_resync: stateResyncGate,
    docs: docsGate,
    evolution: evolutionGate,
    task: taskGate,
    validation: validationGate,
    security: securityGate,
    handoff: handoffGate,
    publish: publishGate
  };
  const blockers = buildPlannerVisualBlockers({ gateMatrix, stateResync, docsStatusReport, currentPlan, mode });
  const warnings = buildPlannerVisualWarnings({ gateMatrix, planningReadiness, docsStatusReport, stateResync, currentPlan, risks });
  const readinessSummary = buildPlannerVisualReadinessSummaryV2({ gateMatrix, docsStatus, currentPlan, mode });
  const publishReadiness = buildPlannerVisualPublishReadiness({ publishGate, gateMatrix, stateResync, mode });
  const executionFeedback = buildPlannerVisualExecutionFeedback({ planningReadiness, versionControl, stateResync, currentPlan, evolutionPlan, validationGate });
  const stageTimeline = buildPlannerVisualStageTimeline({
    mode,
    goal,
    evolutionPlan,
    taskPunch,
    docsGate,
    evolutionGate,
    taskGate,
    validationGate,
    securityGate,
    handoffGate,
    publishGate,
    stateResyncGate,
    readinessSummary,
    publishReadiness,
    currentPlan,
    validationCommands: evolutionPlan.validation_commands || DEFAULT_VALIDATION_COMMANDS
  });
  const dashboardSummary = buildPlannerVisualDashboardSummary({
    versionControl,
    publishReadiness,
    gateMatrix,
    blockers,
    warnings
  });
  const planningLifecycle = {
    method: stateResync && stateResync.state_freshness === "current"
      ? "state_resync"
      : currentPlan
        ? "planner_current"
        : goal
          ? "goal_based"
          : "manual",
    confidence: stateResync && stateResync.state_freshness === "current"
      ? "high"
      : currentPlan
        ? "medium"
        : goal
          ? "low"
          : "low",
    reason: stateResync && stateResync.state_freshness === "current"
      ? "Fresh state-resync evidence is available."
      : currentPlan
        ? "Planner current-state evidence exists, but it is not fully resynced."
        : goal
          ? "The report is goal-based and should be validated against current files before execution."
          : "Manual planning context only.",
    current_version: currentVersion && currentVersion.version_id ? currentVersion.version_id : null,
    next_version: nextVersion && nextVersion.version_id ? nextVersion.version_id : null,
    current_evolution: currentEvolution,
    next_evolution: nextEvolution,
    state_freshness: stateFreshness,
    source_of_truth: sourceOfTruth
  };
  return {
    planning_lifecycle: planningLifecycle,
    gate_matrix: gateMatrix,
    blockers,
    warnings,
    readiness_summary: readinessSummary,
    publish_readiness: publishReadiness,
    execution_feedback: executionFeedback,
    stage_timeline: stageTimeline,
    dashboard_summary: dashboardSummary,
    state_resync: stateResync
  };
}

function buildPlannerVisualStopCondition({ base = "", blockers = [] }) {
  const blockerMessages = Array.isArray(blockers) ? blockers.filter(Boolean) : [];
  if (!blockerMessages.length) {
    return base || "Execution may continue when the current-state report is fresh and all required gates are clear.";
  }
  const prefix = base ? `${base.trim()} ` : "";
  return `${prefix}Execution must not continue until blockers are resolved: ${blockerMessages.map((item) => item.message || item.id || item).join("; ")}.`;
}

function buildPlannerVisualDocsGate({ docsStatus = "planned", docsStatusReport = null }) {
  const stageStatus = docsStatusReport && docsStatusReport.stage_status ? docsStatusReport.stage_status : {};
  const missingStages = Object.entries(stageStatus).filter(([, item]) => Number(item && item.missing || 0) > 0);
  const appliedStages = Object.entries(stageStatus).filter(([, item]) => String(item && item.status || "").toLowerCase() === "applied_to_stage");
  const hasMissing = docsStatus === "missing" || missingStages.length > 0;
  const status = hasMissing ? "blocked" : docsStatus === "generated" || docsStatus === "applied_to_stage" || appliedStages.length ? "pass" : "warning";
  const blockers = hasMissing ? (docsStatusReport && docsStatusReport.missing_total ? [`${docsStatusReport.missing_total} required doc(s) are missing.`] : ["Required docs are missing."]) : [];
  const warnings = status === "warning" ? ["Docs are planned but not yet fully applied."] : [];
  return buildPlannerVisualGateState(
    "docs",
    status,
    hasMissing
      ? "Required documentation is missing."
      : status === "pass"
        ? "Current docs are generated or applied to stage."
        : "Documentation is planned but not yet fully staged.",
    blockers,
    warnings,
    hasMissing ? "Generate or apply the required docs before execution." : "Docs are aligned with the current plan."
  );
}

function buildPlannerVisualEvolutionGate({ evolutionPlan = null, currentPlan = null, currentVersion = null, nextVersion = null, stateResync = null }) {
  const currentStatus = String(currentPlan && currentPlan.status || "").toLowerCase();
  const activeEvolution = stateResync && stateResync.active_evolution ? stateResync.active_evolution : null;
  const plannedEvolution = stateResync && Array.isArray(stateResync.planned_evolutions) && stateResync.planned_evolutions.length ? stateResync.planned_evolutions[0] : null;
  let status = "warning";
  const blockers = [];
  const warnings = [];
  if (currentStatus === "blocked") {
    status = "blocked";
    blockers.push("Current planner plan is blocked.");
  } else if (currentStatus === "approved" || currentStatus === "materialized" || currentStatus === "completed") {
    status = "pass";
  } else if (!currentPlan) {
    warnings.push("Evolution is based on the goal only and should be approved before execution.");
  } else {
    warnings.push(`Current planner plan status is ${currentStatus || "unknown"}.`);
  }
  if (activeEvolution && evolutionPlan && activeEvolution.evolution_id && evolutionPlan.evolution_id && activeEvolution.evolution_id !== evolutionPlan.evolution_id) {
    warnings.push("Active evolution differs from the proposed execution slice.");
  }
  if (plannedEvolution && evolutionPlan && plannedEvolution.evolution_id && plannedEvolution.evolution_id !== evolutionPlan.evolution_id) {
    warnings.push("A planned evolution exists that should be reconciled before execution.");
  }
  return buildPlannerVisualGateState(
    "evolution",
    status,
    status === "pass"
      ? "Evolution is aligned with the approved planner state."
      : status === "blocked"
        ? "Evolution cannot continue because the current planner plan is blocked."
        : "Evolution is proposed but still needs approval or reconciliation.",
    blockers,
    warnings,
    status === "pass"
      ? "Continue with the approved evolution slice."
      : "Resolve planner-state alignment before execution."
  );
}

function buildPlannerVisualTaskGate({ taskPunch = null, currentPlan = null, mode = "owner" }) {
  const tasks = taskPunch && Array.isArray(taskPunch.tasks) ? taskPunch.tasks : [];
  const blockedTasks = tasks.filter((task) => String(task.status || "").toLowerCase() === "blocked");
  const inProgressTasks = tasks.filter((task) => ["assigned", "in_progress", "review"].includes(String(task.status || "").toLowerCase()));
  const status = blockedTasks.length ? "blocked" : tasks.length ? "pass" : "warning";
  const warnings = [];
  if (!tasks.length) warnings.push("No task punch exists for the current execution slice.");
  if (inProgressTasks.length && status !== "blocked") warnings.push("Some tasks are still in progress.");
  const blockers = blockedTasks.map((task) => `${task.id || task.title || "task"} is blocked`);
  return buildPlannerVisualGateState(
    "task",
    status,
    status === "pass"
      ? "Task punch exists for the current execution slice."
      : tasks.length
        ? "Task punch exists but requires review."
        : "Task punch is missing.",
    blockers,
    warnings,
    status === "pass"
      ? "Execute the planned task slices."
      : "Create or reconcile the task punch before execution."
  );
}

function buildPlannerVisualValidationGate({ versionControl = null, planningReadiness = {}, evolutionPlan = null }) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const gate = currentVersion && currentVersion.validation_gate ? currentVersion.validation_gate : buildEmptyVersionGate("validation");
  const hasCommands = Array.isArray(evolutionPlan && evolutionPlan.validation_commands) && evolutionPlan.validation_commands.length > 0;
  const status = gate.status === "blocked" ? "blocked" : gate.status === "pass" ? "pass" : hasCommands ? "warning" : "warning";
  return buildPlannerVisualGateState(
    "validation",
    status,
    status === "pass"
      ? "Validation gates are recorded."
      : hasCommands
        ? "Validation commands are available but execution evidence is not yet recorded."
        : "Validation commands are missing.",
    status === "blocked" ? [...(gate.blockers || [])] : [],
    [...(gate.warnings || []), ...(hasCommands ? [] : ["Validation commands are missing."])].filter(Boolean),
    gate.next_action || (hasCommands ? "Run the validation commands and capture the result." : "Add validation commands before execution.")
  );
}

function buildPlannerVisualSecurityGate({ versionControl = null, planningReadiness = {}, currentGate = null, stateResync = null }) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const gate = currentVersion && currentVersion.security_gate ? currentVersion.security_gate : buildEmptyVersionGate("security");
  const status = gate.status === "blocked" ? "blocked" : gate.status === "pass" ? "pass" : "warning";
  const blockers = [...(gate.blockers || [])];
  const warnings = [...(gate.warnings || [])];
  if (currentGate && /security/i.test(String(currentGate)) && status !== "pass" && !warnings.length) warnings.push("Security readiness is not confirmed.");
  if (stateResync && stateResync.state_freshness !== "current") warnings.push("State resync is not current.");
  return buildPlannerVisualGateState(
    "security",
    status,
    status === "pass"
      ? "Security readiness is recorded."
      : "Security readiness is not fully recorded.",
    blockers,
    warnings,
    gate.next_action || "Review the security gate before execution."
  );
}

function buildPlannerVisualHandoffGate({ versionControl = null, planningReadiness = {}, deliveryMode = "direct_main", sourceControl = null, mode = "owner" }) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const gate = currentVersion && currentVersion.handoff_gate ? currentVersion.handoff_gate : buildEmptyVersionGate("handoff");
  const status = gate.status === "blocked" ? "blocked" : gate.status === "pass" ? "pass" : "warning";
  const warnings = [...(gate.warnings || [])];
  if (mode === "vibe" && deliveryMode !== "local_first") warnings.push("Vibe track should remain local-first unless explicitly changed.");
  return buildPlannerVisualGateState(
    "handoff",
    status,
    status === "pass"
      ? "Handoff readiness is recorded."
      : "Handoff readiness is not fully recorded.",
    [...(gate.blockers || [])],
    warnings,
    gate.next_action || "Prepare the handoff package before publish or commit."
  );
}

function buildPlannerVisualPublishGate({ versionControl = null, planningReadiness = {}, sourceControl = null, mode = "owner", handoffGate = null, validationGate = null, securityGate = null, stateResyncGate = null }) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const gate = currentVersion && currentVersion.publish_gate ? currentVersion.publish_gate : buildEmptyVersionGate("publish");
  const blockers = [...(stateResyncGate && stateResyncGate.status === "blocked" ? stateResyncGate.blockers : []), ...(gate.blockers || [])];
  const warnings = [...(gate.warnings || [])];
  const summary = gate.status === "pass"
    ? "Publish is allowed only with explicit Owner approval or a configured delivery gate."
    : gate.status === "blocked"
      ? "Publish is blocked."
      : "Publish readiness is not final.";
  const status = blockers.length ? "blocked" : gate.status === "pass" ? "pass" : gate.status === "blocked" ? "blocked" : "warning";
  return buildPlannerVisualGateState(
    "publish",
    status,
    summary,
    blockers,
    warnings,
    gate.next_action || "KVDF must not auto-publish."
  );
}

function buildPlannerVisualBlockers({ gateMatrix = {}, stateResync = null, docsStatusReport = null, currentPlan = null, mode = "owner" }) {
  const blockers = [];
  const addGateBlocker = (area, gate, fallbackMessage) => {
    if (!gate || gate.status !== "blocked") return;
    blockers.push({
      id: `${area}-blocked`,
      severity: "blocker",
      area,
      message: gate.summary || fallbackMessage || `${area} is blocked.`,
      next_action: gate.next_action || `Resolve the ${area} blocker.`
    });
  };
  addGateBlocker("state_resync", gateMatrix.state_resync, "State resync is blocked.");
  addGateBlocker("docs", gateMatrix.docs, "Docs are blocked.");
  addGateBlocker("evolution", gateMatrix.evolution, "Evolution is blocked.");
  addGateBlocker("task", gateMatrix.task, "Task readiness is blocked.");
  addGateBlocker("validation", gateMatrix.validation, "Validation is blocked.");
  addGateBlocker("security", gateMatrix.security, "Security is blocked.");
  addGateBlocker("handoff", gateMatrix.handoff, "Handoff is blocked.");
  addGateBlocker("publish", gateMatrix.publish, "Publish is blocked.");
  if (stateResync && Array.isArray(stateResync.conflicts)) {
    for (const conflict of stateResync.conflicts) {
      if (!conflict || conflict.severity !== "blocking") continue;
      blockers.push({
        id: conflict.id || `state-conflict-${blockers.length + 1}`,
        severity: "blocker",
        area: "state_resync",
        message: conflict.message || "State resync conflict detected.",
        next_action: conflict.next_action || "Resolve the state conflict."
      });
    }
  }
  if (docsStatusReport && docsStatusReport.status === "blocked") {
    blockers.push({
      id: "docs-status-blocked",
      severity: "blocker",
      area: "docs",
      message: "Documentation status report is blocked.",
      next_action: docsStatusReport.next_action || "Generate the missing documentation."
    });
  }
  if (mode === "vibe" && currentPlan && currentPlan.status === "blocked") {
    blockers.push({
      id: "vibe-plan-blocked",
      severity: "blocker",
      area: "task",
      message: "The current app-track plan is blocked.",
      next_action: currentPlan.next_action || "Resolve the app-track blockers."
    });
  }
  return blockers;
}

function buildPlannerVisualWarnings({ gateMatrix = {}, planningReadiness = {}, docsStatusReport = null, stateResync = null, currentPlan = null, risks = [] }) {
  const warnings = [];
  for (const gate of Object.values(gateMatrix)) {
    if (!gate || gate.status === "blocked" || !Array.isArray(gate.warnings)) continue;
    for (const warning of gate.warnings) warnings.push(String(warning));
  }
  if (planningReadiness && Array.isArray(planningReadiness.gate_warnings)) {
    for (const warning of planningReadiness.gate_warnings) warnings.push(String(warning));
  }
  if (stateResync && Array.isArray(stateResync.reasons)) {
    for (const reason of stateResync.reasons) warnings.push(String(reason));
  }
  if (docsStatusReport && docsStatusReport.status === "warning") warnings.push("Documentation status is warning.");
  if (currentPlan && String(currentPlan.status || "").toLowerCase() === "approved") warnings.push("Approved plans still need execution and validation.");
  if (Array.isArray(risks)) {
    for (const risk of risks) warnings.push(String(risk));
  }
  return Array.from(new Set(warnings)).filter(Boolean);
}

function buildPlannerVisualReadinessSummaryV2({ gateMatrix = {}, docsStatus = "planned", currentPlan = null, mode = "owner" }) {
  const docsGate = gateMatrix.docs || {};
  const evolutionGate = gateMatrix.evolution || {};
  const taskGate = gateMatrix.task || {};
  const validationGate = gateMatrix.validation || {};
  const securityGate = gateMatrix.security || {};
  const handoffGate = gateMatrix.handoff || {};
  const docsStatusValue = docsGate.status === "pass"
    ? "generated"
    : docsGate.status === "blocked"
      ? "missing"
      : docsStatus === "applied_to_stage"
        ? "applied_to_stage"
        : docsStatus === "generated"
          ? "generated"
          : "planned";
  const taskStatus = taskGate.status === "pass"
    ? "in_progress"
    : taskGate.status === "blocked"
      ? "pending"
      : currentPlan && String(currentPlan.status || "").toLowerCase() === "completed"
        ? "completed"
        : "pending";
  const evolutionStatus = evolutionGate.status === "pass"
    ? "active"
    : evolutionGate.status === "blocked"
      ? "blocked"
      : currentPlan && String(currentPlan.status || "").toLowerCase() === "completed"
        ? "completed"
        : "planned";
  const validationStatus = validationGate.status === "blocked" ? "blocked" : validationGate.status === "pass" ? "pass" : "warning";
  const securityStatus = securityGate.status === "blocked" ? "blocked" : securityGate.status === "pass" ? "pass" : "warning";
  const handoffStatus = handoffGate.status === "pass" ? "ready" : handoffGate.status === "blocked" ? "blocked" : "not_started";
  return {
    docs_status: docsStatusValue,
    task_status: taskStatus,
    evolution_status: evolutionStatus,
    validation_status: validationStatus,
    security_status: securityStatus,
    handoff_status: handoffStatus
  };
}

function buildPlannerVisualPublishReadiness({ publishGate = null, gateMatrix = {}, stateResync = null, mode = "owner" }) {
  const status = publishGate && publishGate.status === "blocked"
    ? "blocked"
    : publishGate && publishGate.status === "pass"
      ? "ready"
      : "warning";
  const blockers = Array.isArray(publishGate && publishGate.blockers) ? publishGate.blockers : [];
  const scoreBase = status === "ready" ? 100 : status === "warning" ? 60 : 0;
  const score = Math.max(0, Math.min(100, scoreBase - (blockers.length * 10)));
  const label = status === "ready"
    ? "Ready for Owner-approved publish or handoff"
    : status === "warning"
      ? "Publish requires review"
      : "Publish blocked";
  return {
    status,
    score,
    label,
    auto_publish: false,
    rule: "KVDF must not auto-publish. Owner approval or a configured delivery gate is required.",
    next_action: publishGate && publishGate.next_action ? publishGate.next_action : "Review the publish gates before continuing."
  };
}

function buildPlannerVisualExecutionFeedback({ planningReadiness = {}, versionControl = null, stateResync = null, currentPlan = null, evolutionPlan = null, validationGate = null }) {
  const latestFeedback = planningReadiness && planningReadiness.feedback ? planningReadiness.feedback : (versionControl && versionControl.latest_feedback ? versionControl.latest_feedback : null);
  if (!latestFeedback) {
    return {
      status: "none",
      executor: null,
      checks_run: [],
      changed_files: [],
      warnings: [],
      stop_condition: "No execution feedback exists yet.",
      updated_at: null
    };
  }
  const updatedAt = latestFeedback.updated_at || latestFeedback.generated_at || null;
  const isCurrent = stateResync && stateResync.state_freshness === "current";
  return {
    status: isCurrent ? "current" : "old",
    executor: latestFeedback.executor || null,
    checks_run: Array.isArray(latestFeedback.checks_run) ? latestFeedback.checks_run : [],
    changed_files: Array.isArray(latestFeedback.changed_files) ? latestFeedback.changed_files : [],
    warnings: Array.isArray(latestFeedback.warnings) ? latestFeedback.warnings : [],
    stop_condition: latestFeedback.stop_condition || (validationGate && validationGate.next_action) || "Review the latest execution feedback.",
    updated_at: updatedAt
  };
}

function buildPlannerVisualStageTimeline({ mode = "owner", goal = "", evolutionPlan = null, taskPunch = null, docsGate = null, evolutionGate = null, taskGate = null, validationGate = null, securityGate = null, handoffGate = null, publishGate = null, stateResyncGate = null, readinessSummary = null, publishReadiness = null, currentPlan = null, validationCommands = [] }) {
  const outputsByStage = {
    idea: [goal ? `Goal: ${goal}` : "Goal not specified.", `Track: ${mode}`],
    requirements: [docsGate ? docsGate.summary : "Requirements are not yet confirmed.", `Docs status: ${readinessSummary ? readinessSummary.docs_status : "unknown"}`],
    design: [evolutionGate ? evolutionGate.summary : "Design is not yet confirmed.", `Evolution: ${readinessSummary ? readinessSummary.evolution_status : "unknown"}`],
    implementation: [taskGate ? taskGate.summary : "Task execution is not yet confirmed.", ...(taskPunch && Array.isArray(taskPunch.tasks) ? taskPunch.tasks.map((task) => task.title || task.id || "task") : [])],
    validation: [validationGate ? validationGate.summary : "Validation is not yet confirmed.", ...validationCommands],
    handoff: [handoffGate ? handoffGate.summary : "Handoff is not yet confirmed.", publishReadiness ? publishReadiness.label : "Publish readiness is not yet confirmed."]
  };
  const stageStatus = {
    idea: "pass",
    requirements: docsGate && docsGate.status === "blocked" ? "blocked" : docsGate && docsGate.status === "warning" ? "warning" : "pass",
    design: evolutionGate && evolutionGate.status === "blocked" ? "blocked" : evolutionGate && evolutionGate.status === "warning" ? "warning" : "pass",
    implementation: taskGate && taskGate.status === "blocked" ? "blocked" : taskGate && taskGate.status === "warning" ? "warning" : "pass",
    validation: validationGate && validationGate.status === "blocked" ? "blocked" : validationGate && validationGate.status === "warning" ? "warning" : "pass",
    handoff: publishGate && publishGate.status === "blocked" ? "blocked" : publishGate && publishGate.status === "warning" ? "warning" : (publishReadiness && publishReadiness.status === "ready" ? "pass" : "warning")
  };
  const stages = ["idea", "requirements", "design", "implementation", "validation", "handoff"].map((stage) => ({
    stage,
    status: stageStatus[stage] || "unknown",
    outputs: outputsByStage[stage] || [],
    next_action: stage === "idea"
      ? "Confirm the current execution goal."
      : stage === "requirements"
        ? docsGate && docsGate.next_action ? docsGate.next_action : "Confirm the requirements and docs."
        : stage === "design"
          ? evolutionGate && evolutionGate.next_action ? evolutionGate.next_action : "Confirm the design and evolution slice."
          : stage === "implementation"
            ? taskGate && taskGate.next_action ? taskGate.next_action : "Create or update the task punch."
            : stage === "validation"
              ? validationGate && validationGate.next_action ? validationGate.next_action : "Run validation."
              : publishReadiness && publishReadiness.next_action ? publishReadiness.next_action : "Prepare the handoff."
  }));
  return stages;
}

function buildPlannerVisualDashboardSummary({ versionControl = null, publishReadiness = null, gateMatrix = {}, blockers = [], warnings = [] }) {
  return {
    version_to_publish_summary: {
      current_version: versionControl && versionControl.current_version ? versionControl.current_version.version_id || versionControl.current_version.title || null : null,
      next_version: versionControl && versionControl.next_version ? versionControl.next_version.version_id || versionControl.next_version.title || null : null,
      publish_status: publishReadiness ? publishReadiness.status : "unknown"
    },
    gate_summary: Object.fromEntries(Object.entries(gateMatrix).map(([gate, entry]) => [gate, entry ? entry.status : "unknown"])),
    readiness_label: publishReadiness ? publishReadiness.label : "Readiness unknown",
    blocked_total: Array.isArray(blockers) ? blockers.filter((item) => item && item.severity === "blocker").length : 0,
    warnings_total: Array.isArray(warnings) ? warnings.length : 0
  };
}

function determinePlannerVisualSourceOfTruth({ mode = "owner", stateResync = null, sourceControl = null, context = {}, pluginContext = null }) {
  if (sourceControl && sourceControl.remote_provider && sourceControl.remote_provider !== "none") return "remote_supported";
  if (stateResync && stateResync.state_freshness === "current") return "file_first";
  if (mode === "owner" || mode === "vibe" || mode === "plugin") return "file_first";
  if (sourceControl && sourceControl.mode && sourceControl.mode !== "local_only") return "git_supported";
  if (stateResync && stateResync.runtime_state && stateResync.runtime_state.supporting_only) return "file_first";
  return "unknown";
}

function buildPlannerVisualMarkdown({ goal, mode, deliveryMode, evolutionPlan, graph, board, scopeMap, validationCommands, stopCondition, sourceControl, planningMethod, methodReason, reviewStatus, docsStatus, docsCreatedTotal, docsStatusReport = null, versionControl, planningReadiness = {}, executionReadiness = {}, risks, currentGate, nextAction, roadmapTrain = null, viberPipeline = null }) {
  const title = mode === "vibe"
    ? "KVDF Planner Visual Execution Readiness - Vibe/App"
    : mode === "plugin"
      ? "KVDF Planner Visual Execution Readiness - Plugin"
      : "KVDF Planner Visual Execution Readiness - Owner";
  const boardSummary = board.columns.map((column) => `- ${column.title}: ${column.cards.length} card(s)`).join("\n");
  const allowedFiles = (scopeMap.allowed_files || []).map((item) => `- ${item}`).join("\n");
  const forbiddenFiles = (scopeMap.forbidden_files || []).map((item) => `- ${item}`).join("\n");
  const runtimeState = (scopeMap.runtime_state || []).map((item) => `- ${item}`).join("\n");
  const generatedArtifacts = (scopeMap.generated_artifacts || []).map((item) => `- ${item}`).join("\n");
  const docs = (scopeMap.docs || []).map((item) => `- ${item}`).join("\n");
  const tests = (scopeMap.tests || []).map((item) => `- ${item}`).join("\n");
  const gateRows = executionReadiness.gate_matrix ? Object.entries(executionReadiness.gate_matrix).map(([gate, item]) => `- ${gate}: ${item.status || "unknown"}${item.summary ? ` - ${item.summary}` : ""}`) : [];
  const blockerRows = Array.isArray(executionReadiness.blockers) ? executionReadiness.blockers.map((blocker) => `- [${blocker.severity}] ${blocker.area}: ${blocker.message} -> ${blocker.next_action}`) : [];
  const warningRows = Array.isArray(executionReadiness.warnings) ? executionReadiness.warnings.map((warning) => `- ${warning}`) : [];
  const stageRows = Array.isArray(executionReadiness.stage_timeline) ? executionReadiness.stage_timeline.map((stage) => `- ${stage.stage}: ${stage.status}${Array.isArray(stage.outputs) && stage.outputs.length ? ` (${stage.outputs.join("; ")})` : ""}`) : [];
  const sourceControlLines = sourceControl ? [
    `- Enabled: ${sourceControl.enabled ? "yes" : "no"}`,
    `- Provider: ${sourceControl.provider || "none"}`,
    `- Remote provider: ${sourceControl.remote_provider || "none"}`,
    `- Provider plugin: ${sourceControl.provider_plugin || "none"}`,
    `- Mode: ${sourceControl.mode || "local_only"}`,
    `- Branching enabled: ${sourceControl.branching_enabled ? "yes" : "no"}`,
    `- PR enabled: ${sourceControl.pr_enabled ? "yes" : "no"}`,
    `- Default branch: ${sourceControl.default_branch || "main"}`,
    `- Current branch: ${sourceControl.current_branch || "none"}`,
    `- Requires Owner approval: ${sourceControl.requires_owner_approval ? "yes" : "no"}`,
    `- Replaceable provider: ${sourceControl.replaceable_provider ? "yes" : "no"}`,
    "- GitHub is optional and not required for state authority.",
    mode === "vibe" ? "Current app files/docs/specs are primary for app-track planning." : null,
    "KVDF does not auto-publish.",
    "Publish or handoff requires Owner approval or a configured delivery gate.",
    ...(Array.isArray(sourceControl.notes) && sourceControl.notes.length ? ["- Notes:", ...sourceControl.notes.map((note) => `  - ${note}`)] : [])
  ].filter(Boolean).join("\n") : [
    "- GitHub is optional and not required for state authority.",
    "KVDF does not auto-publish.",
    "Publish or handoff requires Owner approval or a configured delivery gate."
  ].join("\n");
  const lifecycle = executionReadiness.planning_lifecycle || {};
  return [
    `# ${title}`,
    "",
    `- Track: ${evolutionPlan.track}`,
    `- Planner mode: ${mode}`,
    `- Delivery mode: ${deliveryMode}`,
    `- State freshness: ${lifecycle.state_freshness || "unknown"}`,
    `- Source control mode: ${sourceControl ? sourceControl.mode || "local_only" : "local_only"}`,
    planningMethod ? `- Planning Method: ${planningMethod}` : null,
    planningMethod ? `- Why this method: ${methodReason || ""}` : null,
    planningMethod ? `- Method confidence: ${planningReadiness.planning_method_confidence || "unknown"}` : null,
    reviewStatus ? `- Review status: ${reviewStatus}` : null,
    docsStatus ? `- Documentation status: ${docsStatus}` : null,
    `- Docs created total: ${docsCreatedTotal || 0}`,
    `- Stop condition note: ${executionReadiness.publish_readiness ? executionReadiness.publish_readiness.rule : "KVDF does not auto-publish."}`,
    versionControl && versionControl.current_version ? `- Current version: ${versionControl.current_version.version_id || versionControl.current_version.title || "unknown"}` : null,
    versionControl && versionControl.next_version ? `- Next version: ${versionControl.next_version.version_id || versionControl.next_version.title || "unknown"}` : null,
    versionControl && versionControl.publish_readiness ? `- Publish readiness: ${versionControl.publish_readiness.status || "unknown"}` : null,
    roadmapTrain ? `- Roadmap train: ${roadmapTrain.status || "unknown"}${roadmapTrain.next_evolution_id ? ` (next ${roadmapTrain.next_evolution_id})` : ""}` : null,
    currentGate ? `- Current gate: ${currentGate}` : null,
    risks && risks.length ? `- Risks: ${risks.join("; ")}` : null,
    executionReadiness.execution_feedback ? `- Latest feedback: ${executionReadiness.execution_feedback.status || "none"}${executionReadiness.execution_feedback.executor ? ` (${executionReadiness.execution_feedback.executor})` : ""}` : null,
    `- Proposed Evolution: ${evolutionPlan.title}`,
    "",
    "## State Freshness",
    `- State freshness: ${lifecycle.state_freshness || "unknown"}`,
    `- Source of truth: ${lifecycle.source_of_truth || "unknown"}`,
    `- Planning lifecycle method: ${lifecycle.method || "manual"}`,
    `- Planning lifecycle confidence: ${lifecycle.confidence || "low"}`,
    lifecycle.reason ? `- Planning lifecycle reason: ${lifecycle.reason}` : null,
    viberPipeline && mode === "vibe" ? "" : null,
    viberPipeline && mode === "vibe" ? "## Viber Pipeline" : null,
    viberPipeline && mode === "vibe" ? `- Execution allowed: ${viberPipeline.execution_allowed ? "yes" : "no"}` : null,
    viberPipeline && mode === "vibe" ? `- Next stage: ${viberPipeline.next_stage || "unknown"}` : null,
    viberPipeline && mode === "vibe" ? `- Next action: ${viberPipeline.readiness && viberPipeline.readiness.next_action ? viberPipeline.readiness.next_action : "Complete the next planning stage."}` : null,
    viberPipeline && mode === "vibe" && Array.isArray(viberPipeline.execution_blockers) && viberPipeline.execution_blockers.length ? "- Blockers:" : null,
    viberPipeline && mode === "vibe" && Array.isArray(viberPipeline.execution_blockers) && viberPipeline.execution_blockers.length ? viberPipeline.execution_blockers.map((blocker) => `  - ${blocker.message || blocker.id || "blocked"}`).join("\n") : null,
    "",
    "## Planning Lifecycle",
    `- Method: ${lifecycle.method || "manual"}`,
    `- Confidence: ${lifecycle.confidence || "low"}`,
    lifecycle.current_version ? `- Current version: ${lifecycle.current_version}` : null,
    lifecycle.next_version ? `- Next version: ${lifecycle.next_version}` : null,
    lifecycle.current_evolution ? `- Current evolution: ${lifecycle.current_evolution}` : null,
    lifecycle.next_evolution ? `- Next evolution: ${lifecycle.next_evolution}` : null,
    lifecycle.reason ? `- Reason: ${lifecycle.reason}` : null,
    mode === "vibe" ? "- Current app files/docs/specs are primary for app-track planning." : null,
    "",
    "## Gate Matrix",
    gateRows.length ? gateRows.join("\n") : "- Gate details not available",
    "",
    "## Blockers",
    blockerRows.length ? blockerRows.join("\n") : "- None",
    "",
    "## Warnings",
    warningRows.length ? warningRows.join("\n") : "- None",
    "",
    "## Docs / Task / Evolution Readiness",
    `- Docs status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.docs_status || "unknown" : docsStatus || "unknown"}`,
    `- Task status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.task_status || "unknown" : "unknown"}`,
    `- Evolution status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.evolution_status || "unknown" : "unknown"}`,
    `- Validation status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.validation_status || "unknown" : "unknown"}`,
    `- Security status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.security_status || "unknown" : "unknown"}`,
    `- Handoff status: ${executionReadiness.readiness_summary ? executionReadiness.readiness_summary.handoff_status || "unknown" : "unknown"}`,
    "",
    "## Publish Readiness",
    executionReadiness.publish_readiness ? `- Status: ${executionReadiness.publish_readiness.status || "warning"}` : "- Status: unknown",
    executionReadiness.publish_readiness ? `- Score: ${executionReadiness.publish_readiness.score}` : "- Score: 0",
    executionReadiness.publish_readiness ? `- Label: ${executionReadiness.publish_readiness.label}` : "- Label: unknown",
    `- Auto publish: ${executionReadiness.publish_readiness ? (executionReadiness.publish_readiness.auto_publish ? "true" : "false") : "false"}`,
    executionReadiness.publish_readiness ? `- Rule: ${executionReadiness.publish_readiness.rule}` : "- Rule: KVDF must not auto-publish. Owner approval or a configured delivery gate is required.",
    executionReadiness.publish_readiness ? `- Next action: ${executionReadiness.publish_readiness.next_action}` : "- Next action: Review the publish gates before continuing.",
    "",
    "## Execution Feedback",
    `- Status: ${executionReadiness.execution_feedback ? executionReadiness.execution_feedback.status : "none"}`,
    executionReadiness.execution_feedback && executionReadiness.execution_feedback.executor ? `- Executor: ${executionReadiness.execution_feedback.executor}` : "- Executor: none",
    executionReadiness.execution_feedback && Array.isArray(executionReadiness.execution_feedback.checks_run) && executionReadiness.execution_feedback.checks_run.length ? `- Checks run: ${executionReadiness.execution_feedback.checks_run.join("; ")}` : "- Checks run: none",
    executionReadiness.execution_feedback && Array.isArray(executionReadiness.execution_feedback.changed_files) && executionReadiness.execution_feedback.changed_files.length ? `- Changed files: ${executionReadiness.execution_feedback.changed_files.join("; ")}` : "- Changed files: none",
    executionReadiness.execution_feedback && Array.isArray(executionReadiness.execution_feedback.warnings) && executionReadiness.execution_feedback.warnings.length ? `- Warnings: ${executionReadiness.execution_feedback.warnings.join("; ")}` : "- Warnings: none",
    executionReadiness.execution_feedback ? `- Stop condition: ${executionReadiness.execution_feedback.stop_condition || "none"}` : "- Stop condition: none",
    executionReadiness.execution_feedback && executionReadiness.execution_feedback.updated_at ? `- Updated at: ${executionReadiness.execution_feedback.updated_at}` : "- Updated at: none",
    "",
    "## Stage Timeline",
    stageRows.length ? stageRows.join("\n") : "- Stage status not available",
    "",
    "## Mermaid Graph",
    "```mermaid",
    graph.diagram,
    "```",
    "",
    "## Planning Board",
    boardSummary,
    "",
    buildPlannerVisualQuestionsSection({
      mode,
      goal,
      planningMethod,
      methodReason
    }),
    "",
    "## Source Control",
    sourceControlLines || "- None",
    "",
    "## Version Control",
    ...renderIndentedObjectSection(versionControl || {}),
    "",
    roadmapTrain ? ["## Roadmap Train", ...renderIndentedObjectSection(roadmapTrain || {})].join("\n") : null,
    "",
    "## Scope Map",
    "### Allowed Files",
    allowedFiles || "- None",
    "### Forbidden Files",
    forbiddenFiles || "- None",
    "### Source Control",
    sourceControl ? [
      `- Enabled: ${sourceControl.enabled ? "yes" : "no"}`,
      `- Provider: ${sourceControl.provider || "none"}`,
      `- Remote provider: ${sourceControl.remote_provider || "none"}`,
      `- Provider plugin: ${sourceControl.provider_plugin || "none"}`,
      `- Mode: ${sourceControl.mode || "local_only"}`,
      `- Branching enabled: ${sourceControl.branching_enabled ? "yes" : "no"}`,
      `- PR enabled: ${sourceControl.pr_enabled ? "yes" : "no"}`
    ].join("\n") : "- None",
    "### Runtime State",
    runtimeState || "- None",
    "### Generated Artifacts",
    generatedArtifacts || "- None",
    "### Docs",
    docs || "- None",
    "### Tests",
    tests || "- None",
    "",
    "## Validation Commands",
    ...validationCommands.map((command) => `- ${command}`),
    "",
    `## Stop Condition`,
    stopCondition,
    "",
    "## Next Approved Action",
    nextAction || evolutionPlan.next_action || "",
    "",
    `## Goal`,
    goal
  ].filter(Boolean).join("\n");
}

function buildPlannerVisualReadinessSummary({ versionControl = null, docsStatus = "planned", docsStatusReport = null, review = null, currentPlan = null, mode = "owner", planningMethod = null, repoRoot = null }) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const latestFeedback = versionControl && versionControl.latest_feedback
    ? versionControl.latest_feedback
    : readPlannerLatestFeedback(repoRoot || process.cwd(), currentPlan && currentPlan.app_slug ? currentPlan.app_slug : "");
  const gates = {
    docs: currentVersion && currentVersion.docs_gate ? currentVersion.docs_gate : buildEmptyVersionGate("docs"),
    evolution: currentVersion && currentVersion.evolution_gate ? currentVersion.evolution_gate : buildEmptyVersionGate("evolution"),
    task: currentVersion && currentVersion.task_gate ? currentVersion.task_gate : buildEmptyVersionGate("task"),
    validation: currentVersion && currentVersion.validation_gate ? currentVersion.validation_gate : buildEmptyVersionGate("validation"),
    security: currentVersion && currentVersion.security_gate ? currentVersion.security_gate : buildEmptyVersionGate("security"),
    handoff: currentVersion && currentVersion.handoff_gate ? currentVersion.handoff_gate : buildEmptyVersionGate("handoff"),
    publish: currentVersion && currentVersion.publish_gate ? currentVersion.publish_gate : buildEmptyVersionGate("publish")
  };
  const gateStatus = {};
  const gateBlockers = [];
  const gateWarnings = [];
  for (const [key, value] of Object.entries(gates)) {
    gateStatus[key] = value.status || "unknown";
    if (Array.isArray(value.blockers)) gateBlockers.push(...value.blockers);
    if (Array.isArray(value.warnings)) gateWarnings.push(...value.warnings);
  }
  const docsSummary = docsStatusReport && docsStatusReport.stage_status ? docsStatusReport.stage_status : {};
  const stageStatus = {};
  for (const [stage, details] of Object.entries(docsSummary)) {
    stageStatus[stage] = {
      required: Number(details.required || 0),
      existing: Number(details.existing || 0),
      missing: Number(details.missing || 0),
      applied: Number(details.applied || 0),
      not_applied: Number(details.not_applied || 0),
      status: details.status || "missing"
    };
  }
  const modeLower = String(mode || "owner").toLowerCase();
  return {
    mode: modeLower,
    version_status: currentVersion && currentVersion.status ? currentVersion.status : "planned",
    planning_method: planningMethod || currentPlan && currentPlan.planning_method || null,
    planning_method_confidence: currentPlan && currentPlan.confidence ? currentPlan.confidence : "",
    method_rules_matched: Array.isArray(currentPlan && currentPlan.method_rules_matched) ? currentPlan.method_rules_matched : [],
    stage_status: stageStatus,
    gate_status: gateStatus,
    gate_blockers: gateBlockers,
    gate_warnings: gateWarnings,
    review_status: review ? review.status || "unknown" : "unknown",
    source_control_mode: versionControl && versionControl.source_control_mode ? versionControl.source_control_mode : null,
    docs_readiness: docsStatus,
    current_stage: determinePlannerReadinessStage(currentVersion, docsStatus, versionControl),
    blocked: gateBlockers.length > 0 || (currentVersion && currentVersion.status === "blocked"),
    feedback: latestFeedback ? {
      status: latestFeedback.status || "unknown",
      executor: latestFeedback.executor || "unknown",
      summary: latestFeedback.summary || "",
      changed_files: Array.isArray(latestFeedback.changed_files) ? latestFeedback.changed_files : []
    } : null,
    warnings: Array.from(new Set(gateWarnings)).slice(0, 20),
    next_action: currentVersion && currentVersion.next_action
      ? currentVersion.next_action
      : versionControl && versionControl.publish_readiness && versionControl.publish_readiness.next_action
        ? versionControl.publish_readiness.next_action
        : "Review and align gates before execution."
  };
}

function determinePlannerReadinessStage(currentVersion, docsStatus = "planned", versionControl = null) {
  if (docsStatus === "missing") return "documentation";
  if (versionControl && versionControl.publish_readiness && versionControl.publish_readiness.status === "ready") return "publish_ready";
  if (currentVersion && currentVersion.status === "blocked") return "blocked";
  if (currentVersion && currentVersion.status === "handoff_ready") return "handoff";
  if (currentVersion && currentVersion.status === "in_progress") return "in_progress";
  return "planning";
}

function buildIdeaToEvolutionPipelineReport(idea, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin"
    ? (request.pluginContext || (request.plugin_id || request.plugin ? buildPluginContext({ plugin_id: request.plugin_id || request.plugin }, context) : buildPluginContext(request, context)))
    : null;
  const sourceControl = request.source_control || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const stateResync = buildPlannerStateResyncSummary(context, request);
  const normalizedIdea = String(idea || request.idea || request.goal || "").trim() || "KVDF Planning Idea";
  const supportDocumentationFiles = buildIdeaToEvolutionDocumentationFiles(mode, pluginContext);
  const designArtifacts = buildIdeaToEvolutionDesignArtifacts(normalizedIdea, mode, context, pluginContext, sourceControl);
  const versionPlan = buildIdeaToEvolutionVersionPlan(normalizedIdea, mode, deliveryMode, context, pluginContext, sourceControl);
  const versionControl = buildPlannerVersionControlSummary({
    versionPlan,
    currentPlan: null,
    versionControlState: null,
    context,
    appSlug: normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || ""),
    track: getPlannerTrack(mode),
    plannerMode: mode,
    sourceControl
  });
  const evolutions = versionPlan.versions.map((version) => version.evolution);
  const taskPunches = versionPlan.versions.map((version) => version.task_punch);
  const firstEvolution = evolutions[0] || buildPlannerEvolutionPlan(normalizedIdea, { mode, deliveryMode, pluginContext, source_control: sourceControl }, context);
  const firstTaskPunch = taskPunches[0] || buildPlannerTaskPunch(firstEvolution, { mode, deliveryMode, pluginContext, source_control: sourceControl }, context);
  const docsPlan = buildPlannerDocsPlan({
    idea: normalizedIdea,
    goal: normalizedIdea,
    planner_mode: mode,
    track: firstEvolution.track || getPlannerTrack(mode),
    planning_method: request.method || request.planning_method || "auto",
    source_control: sourceControl,
    plugin_context: pluginContext,
    app_slug: request.app || request.app_slug || request["app-slug"],
    plugin_id: request.plugin || request.plugin_id || (pluginContext && pluginContext.plugin_id ? pluginContext.plugin_id : null)
  }, {
    repo_root: context.repo_root,
    plannerMode: mode,
    track: firstEvolution.track || getPlannerTrack(mode),
    method: request.method || request.planning_method || "auto",
    appSlug: request.app || request.app_slug || request["app-slug"],
    pluginId: request.plugin || request.plugin_id || (pluginContext && pluginContext.plugin_id ? pluginContext.plugin_id : null),
    idea: normalizedIdea
  });
  const docsStatus = buildPlannerDocsStatusSummaryFromPlan(docsPlan);
  const documentationFolders = Array.isArray(docsPlan.documentation_folders) ? docsPlan.documentation_folders : [];
  const documentationFiles = uniqueList([
    ...supportDocumentationFiles,
    ...(Array.isArray(docsPlan.documentation_files) ? docsPlan.documentation_files : [])
  ]);
  const visualPlanning = buildPlannerVisualPayload({
    goal: normalizedIdea,
    mode,
    deliveryMode,
    evolutionPlan: firstEvolution,
    taskPunch: firstTaskPunch,
    context,
    pluginContext,
    sourceControl,
    versionControl,
    roadmapTrain: null
  });
  const viberPipeline = mode === "vibe"
    ? buildViberPipelineState({
      idea: normalizedIdea,
      mode,
      deliveryMode,
      sourceControl,
      stateResync,
      docsPlan,
      docsStatus,
      designArtifacts,
      visualPlanning,
      versionPlan,
      versionControl,
      evolutions,
      taskPunches,
      taskPunch: firstTaskPunch,
      pluginContext,
      planningMethod: request.method || request.planning_method || "hybrid",
      appSlug: request.app || request.app_slug || request["app-slug"] || ""
    })
    : null;
  const visualRoadmap = buildIdeaToEvolutionVisualRoadmap(versionPlan, sourceControl, mode);
  const nextEvolution = visualRoadmap.next_evolution || null;
  const roadmapTrain = mode === "owner" || mode === "vibe"
    ? buildPlannerRoadmapTrainSummary({
      pipeline: {
        version_plan: versionPlan,
        version_control: versionControl,
        docs_plan: docsPlan,
        docs_status: docsStatus,
        validation_commands: firstEvolution.validation_commands || visualPlanning.validation_commands || DEFAULT_VALIDATION_COMMANDS,
        visual_planning: visualPlanning
      },
      context,
      profile: {
        train_type: mode === "vibe" ? "viber" : "owner",
        track: getPlannerTrack(mode),
        mode,
        planning_method: request.method || request.planning_method || "auto",
        app_slug: normalizeAppSlug(request.app || request.app_slug || request["app-slug"] || "")
      },
      planning: {
        planning_method: request.method || request.planning_method || "auto",
        source_control: sourceControl
      },
      goal: normalizedIdea,
      flags: request
    })
    : null;
  const report = {
    report_type: "kvdf_idea_to_evolution_pipeline",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: firstEvolution.track || getPlannerTrack(mode),
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    idea: normalizedIdea,
    documentation_files: documentationFiles,
    documentation_folders: documentationFolders,
    portable_docs_mapping: Array.isArray(docsPlan.portable_docs_mapping) ? docsPlan.portable_docs_mapping : [],
    docs_plan: docsPlan,
    docs_status: docsStatus,
    design_artifacts: designArtifacts,
    visual_planning: visualPlanning,
    version_plan: versionPlan,
    version_control: versionControl,
    roadmap_train: roadmapTrain,
    evolutions,
    task_punches: taskPunches,
    visual_roadmap: visualRoadmap,
    next_evolution: nextEvolution,
    publish_readiness: versionControl.publish_readiness || null,
    validation_commands: firstEvolution.validation_commands || visualPlanning.validation_commands || DEFAULT_VALIDATION_COMMANDS,
    stop_condition: firstEvolution.stop_condition || visualPlanning.stop_condition || "",
    next_action: "Review the pipeline plan, then approve/materialize the first Evolution.",
    state_resync: stateResync,
    state_resync_required: !stateResync.fresh
  };
  if (mode === "vibe") report.pipeline = [...VIBE_PIPELINE];
  if (viberPipeline) {
    report.viber_pipeline = viberPipeline;
    report.execution_allowed = viberPipeline.execution_allowed;
    report.execution_blockers = viberPipeline.execution_blockers;
    report.next_stage = viberPipeline.next_stage;
  }
  if (pluginContext) report.plugin_context = pluginContext;
  return attachPlannerCurrentStateSummary(report, context, {
    track: mode,
    app: request.app || request.app_slug || request["app-slug"] || "",
    plugin: pluginContext ? pluginContext.plugin_id : (request.plugin || request.plugin_id || "")
  });
}

function buildViberPipelineState({
  idea = "",
  mode = "vibe",
  deliveryMode = "local_first",
  sourceControl = null,
  stateResync = null,
  docsPlan = null,
  docsStatus = null,
  designArtifacts = null,
  visualPlanning = null,
  versionPlan = null,
  versionControl = null,
  evolutions = [],
  taskPunches = [],
  currentPlan = null,
  taskPunch = null,
  executionAllowedOverride = null,
  pluginContext = null,
  planningMethod = "hybrid",
  appSlug = "",
  currentState = null
} = {}) {
  const normalizedIdea = String(idea || "").trim() || "Viber Planning Idea";
  const docsStatusValue = String(docsStatus && typeof docsStatus === "object" ? docsStatus.status || "" : docsStatus || "unknown").trim().toLowerCase();
  const currentPlanStatus = String(currentPlan && currentPlan.status || "").trim().toLowerCase();
  const materializationStatus = String(currentPlan && (currentPlan.materialization_status || "") || "").trim().toLowerCase();
  const stageOrderState = buildViberPipelineStageOrderState({
    idea: normalizedIdea,
    mode,
    deliveryMode,
    sourceControl,
    stateResync,
    docsPlan,
    docsStatus,
    designArtifacts,
    visualPlanning,
    versionPlan,
    versionControl,
    evolutions,
    taskPunches,
    currentPlan,
    taskPunch,
    pluginContext,
    planningMethod,
    currentState,
    appSlug
  });
  const executionAllowed = executionAllowedOverride !== null
    ? Boolean(executionAllowedOverride)
    : Boolean(stageOrderState.execution_allowed);
  const sourceControlSummaryAdjusted = buildViberPipelineSourceControl(sourceControl, mode, deliveryMode, executionAllowed);
  const stages = Array.isArray(stageOrderState.stages) ? stageOrderState.stages.map((stage) => ({ ...stage })) : [];
  const blockers = Array.isArray(stageOrderState.execution_blockers) ? stageOrderState.execution_blockers.map((blocker) => ({ ...blocker })) : [];
  const warnings = stages.flatMap((stage) => Array.isArray(stage.warnings) ? stage.warnings : []);
  const nextStageName = stageOrderState.next_stage || null;
  const nextStage = nextStageName
    ? stages.find((stage) => stage.stage === nextStageName) || stages.find((stage) => !["complete", "ready", "approved", "materialized"].includes(stage.status)) || stages[stages.length - 1] || null
    : stages.find((stage) => !["complete", "ready", "approved", "materialized"].includes(stage.status)) || stages[stages.length - 1] || null;
  const readinessStatus = stageOrderState.readiness ? stageOrderState.readiness.status : (blockers.length ? "blocked" : warnings.length ? "warning" : executionAllowed ? "ready" : "warning");
  const readinessNextAction = stageOrderState.readiness && stageOrderState.readiness.next_action
    ? stageOrderState.readiness.next_action
    : blockers.length
      ? blockers[0].next_action
      : executionAllowed
        ? "Run kvdf planner prompt --from-current --json, then execute the approved task punch."
        : nextStage && nextStage.next_action
          ? nextStage.next_action
          : "Complete the current planning stage before execution.";
  const evolutionOrderValidation = stageOrderState.evolution_order_validation || buildViberPipelineStageOrderValidation(appSlug, { repo_root: repoRoot() ? repoRoot() : process.cwd() }, stateResync, stageOrderState.questionnaire, stageOrderState.brief, sourceControlSummaryAdjusted, currentState);
  return {
    report_type: "kvdf_viber_pipeline_stage_order",
    track: "vibe_app_developer",
    delivery_mode: deliveryMode,
    source_of_truth: "file_first",
    source_control: sourceControlSummaryAdjusted,
    planning_method: stageOrderState.planning_method || planningMethod || "hybrid",
    method_policy: stageOrderState.method_policy || buildViberPipelinePlanningMethodPolicy(planningMethod, stageOrderState.questionnaire, stageOrderState.brief, sourceControlSummaryAdjusted),
    planning_authority: stageOrderState.planning_authority || {
      level: "placeholder",
      reason: "Planning authority is not yet established.",
      current_version: null,
      next_version: null,
      current_evolution: null,
      next_evolution: null,
      state_freshness: stateResync && stateResync.state_freshness ? stateResync.state_freshness : "unknown",
      source_of_truth: "file_first"
    },
    questionnaire: stageOrderState.questionnaire || buildViberPipelineQuestionnaireSummary(),
    brief: stageOrderState.brief || buildViberPipelineBriefSummary(stageOrderState.questionnaire || buildViberPipelineQuestionnaireSummary(), stateResync, currentState),
    stage_order: stageOrderState.stage_order || [...VIBER_PIPELINE_STAGE_ORDER],
    stage_groups: stageOrderState.stage_groups || Object.fromEntries(Object.entries(VIBER_PIPELINE_STAGE_GROUPS).map(([group, items]) => [group, [...items]])),
    idea: normalizedIdea,
    stages,
    docs_design_gates: stageOrderState.docs_design_gates || null,
    version_evolution_gates: stageOrderState.version_evolution_gates || null,
    execution_gates: stageOrderState.execution_gates || null,
    readiness: {
      status: readinessStatus,
      blocked_total: Array.isArray(blockers) ? blockers.filter((item) => item.severity === "blocker").length : 0,
      warnings_total: warnings.length,
      next_action: readinessNextAction
    },
    execution_allowed: executionAllowed,
    execution_blockers: blockers,
    next_stage: nextStage ? nextStage.stage : "execution",
    state_resync: stateResync || null,
    forbidden_files: Array.isArray(currentPlan && currentPlan.forbidden_files) && currentPlan.forbidden_files.length
      ? [...currentPlan.forbidden_files]
      : [...VIBE_FORBIDDEN_FILES],
    allowed_files: Array.isArray(currentPlan && currentPlan.allowed_files) ? [...currentPlan.allowed_files] : [],
    docs_status: docsStatusValue,
    docs_plan: docsPlan || null,
    documentation_folders: Array.isArray(docsPlan && docsPlan.documentation_folders) ? docsPlan.documentation_folders.map((folder) => ({
      ...folder,
      files: Array.isArray(folder.files) ? folder.files.map((file) => ({ ...file })) : []
    })) : [],
    portable_docs_mapping: Array.isArray(docsPlan && docsPlan.portable_docs_mapping) ? docsPlan.portable_docs_mapping.map((mapping) => ({
      ...mapping,
      canonical_docs: Array.isArray(mapping.canonical_docs) ? [...mapping.canonical_docs] : []
    })) : [],
    design_artifacts: designArtifacts || null,
    visual_planning: visualPlanning || null,
    version_plan: versionPlan || null,
    version_control: versionControl || null,
    evolutions: Array.isArray(evolutions) ? evolutions : [],
    task_punches: Array.isArray(taskPunches) ? taskPunches : [],
    current_plan_status: currentPlanStatus || null,
    current_plan_materialization_status: materializationStatus || null,
    next_action: readinessNextAction,
    cloud_ready: false,
    consent_required: true,
    owner_approved_for_cloud: false,
    anonymized: true,
    sensitive_items_removed: 0,
    dataset_tags: [],
    training_eligible: false,
    plugin_context: pluginContext || null,
    evolution_order_validation: evolutionOrderValidation
  };
}

function buildViberPipelineSourceControl(sourceControl, mode, deliveryMode, executionAllowed) {
  const base = sourceControl || buildPlannerSourceControl({ flags: { "source-control": "none", "sc-mode": "none" } }, { git_state: { available: false, is_repo: false, root: null, current_branch: null } }, "vibe", "local_first", null);
  const normalizedMode = normalizeSourceControlMode(base.mode || (mode === "vibe" ? "local_only" : "direct_main")) || (mode === "vibe" ? "local_only" : "direct_main");
  const remoteProvider = String(base.remote_provider || "none");
  const provider = String(base.provider || "none");
  const branchingEnabled = Boolean(base.branching_enabled) && normalizedMode !== "local_only";
  const prEnabled = Boolean(base.pr_enabled) && normalizedMode === "branch_pr";
  let nextSourceControlAction = "Keep the pipeline file-first and local-first until approval and materialization are complete.";
  if (normalizedMode === "local_only") {
    nextSourceControlAction = "Keep the changes local; branch, PR, commit, and push are not required for this Viber pipeline.";
  } else if (normalizedMode === "direct_main") {
    nextSourceControlAction = executionAllowed
      ? "Validate, then commit and push to main only after the plan is approved and materialized."
      : "Validate first, then commit and push to main only after approval and materialization."
      ;
  } else if (normalizedMode === "branch_pr") {
    nextSourceControlAction = remoteProvider === "github"
      ? "Create a branch, push it, and prepare the GitHub PR only after approval and materialization."
      : "Create a branch, push it, and prepare the PR only after approval and materialization.";
  } else if (normalizedMode === "branch") {
    nextSourceControlAction = "Create a branch after approval and materialization; PR remains optional.";
  }
  return {
    enabled: Boolean(base.enabled) && normalizedMode !== "local_only" && provider !== "none",
    provider,
    remote_provider: remoteProvider,
    provider_plugin: remoteProvider === "github" ? "github" : (remoteProvider === "custom" ? base.provider_plugin || null : null),
    mode: normalizedMode,
    branching_enabled: branchingEnabled,
    pr_enabled: prEnabled,
    branch_name: base.branch_name || null,
    pr_title: base.pr_title || null,
    handoff_requires_pr: normalizedMode === "branch_pr",
    next_source_control_action: nextSourceControlAction,
    default_branch: base.default_branch || "main",
    current_branch: base.current_branch || null,
    requires_owner_approval: true,
    replaceable_provider: true,
    notes: Array.isArray(base.notes) ? [...base.notes] : []
  };
}

function buildViberPipelinePlanningMethodPolicy(planningMethod = "hybrid", questionnaire = null, brief = null, sourceControl = null) {
  const normalizedMethod = String(planningMethod || "hybrid").trim().toLowerCase();
  if (normalizedMethod === "structured") {
    return {
      method: "structured",
      foundation_depth: "full",
      execution_style: "gated_batch",
      required_stage_overrides: [
        "questionnaire_generation",
        "questionnaire_answers",
        "answer_completeness_check",
        "brief_generation",
        "brief_review",
        "brief_approval",
        "state_resync",
        "current_state_report",
        "app_boundary",
        "documentation_architecture",
        "documentation_folders",
        "documentation_files",
        "system_design",
        "database_design",
        "ui_ux_design",
        "source_control_plan",
        "security_plan",
        "version_plan",
        "evolutions",
        "evolution_order_validation",
        "task_punches"
      ],
      deferred_stage_rules: [
        "No stage may be skipped; any missing stage must remain blocked until approved.",
        "Execution begins only after task punch review, approval, materialization, and safety gates pass."
      ],
      reason: "Structured planning keeps enterprise, security-heavy, or integration-heavy Viber work fully ordered before execution."
    };
  }
  if (normalizedMethod === "agile") {
    return {
      method: "agile",
      foundation_depth: "lightweight",
      execution_style: "small_iteration",
      required_stage_overrides: [
        "questionnaire_generation",
        "questionnaire_answers",
        "answer_completeness_check",
        "brief_generation",
        "brief_review",
        "brief_approval",
        "state_resync",
        "current_state_report",
        "app_boundary",
        "approval",
        "materialization",
        "codex_prompt",
        "security_gate",
        "handoff_gate",
        "source_control_gate"
      ],
      deferred_stage_rules: [
        "Heavy docs may be deferred or marked not_applicable only when low-risk and explicit.",
        "Agile never removes the approval, materialization, security, validation, or handoff gates.",
        "Raw ideas still cannot go directly to code execution."
      ],
      reason: "Agile planning keeps small Viber iterations lightweight while preserving safety and approval gates."
    };
  }
  return {
    method: "hybrid",
    foundation_depth: "structured_then_iterative",
    execution_style: "evolution_slice",
    required_stage_overrides: [
      "questionnaire_generation",
      "questionnaire_answers",
      "answer_completeness_check",
      "brief_generation",
      "brief_review",
      "brief_approval",
      "state_resync",
      "current_state_report",
      "app_boundary",
      "documentation_architecture",
      "documentation_folders",
      "documentation_files",
      "system_design",
      "database_design",
      "ui_ux_design",
      "source_control_plan",
      "security_plan",
      "version_plan",
      "evolutions",
      "evolution_order_validation",
      "task_punches"
    ],
    deferred_stage_rules: [
      "Use a structured foundation first, then move into one approved/materialized evolution slice at a time.",
      "Do not mix future-only slices into the active release without explicit approval."
    ],
    reason: "Hybrid planning is the default for full Viber app development: structured foundation first, then agile execution slices."
  };
}

function buildViberPipelineQuestionnaireSummary() {
  const questionnairePath = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  const answersPath = ".kabeeri/questionnaires/answers.json";
  const questionnaireReport = fs.existsSync(questionnairePath) ? readJsonFileIfExists(questionnairePath) : null;
  const questionnairePlan = questionnaireReport && Array.isArray(questionnaireReport.plans) && questionnaireReport.plans.length
    ? questionnaireReport.current_plan_id
      ? questionnaireReport.plans.find((item) => item.plan_id === questionnaireReport.current_plan_id) || questionnaireReport.plans[questionnaireReport.plans.length - 1]
      : questionnaireReport.plans[questionnaireReport.plans.length - 1]
    : null;
  const answersReport = fs.existsSync(answersPath) ? readJsonFileIfExists(answersPath) : { answers: [] };
  const answers = Array.isArray(answersReport.answers) ? answersReport.answers : [];
  const generatedQuestions = Array.isArray(questionnairePlan && questionnairePlan.generated_questions) ? questionnairePlan.generated_questions : [];
  const answerMap = Object.fromEntries(answers.map((answer) => [String(answer.question_id || ""), answer]).filter(([key]) => key));
  const missingAnswers = generatedQuestions.filter((question) => !answerMap[String(question.question_id || "")]).map((question) => question.question_id).filter(Boolean);
  const answersTotal = answers.length;
  const questionsTotal = generatedQuestions.length;
  const complete = Boolean(questionnairePlan) && questionsTotal > 0 && missingAnswers.length === 0;
  const reviewed = Boolean(questionnairePlan && (questionnairePlan.reviewed_at || questionnairePlan.review_status === "reviewed" || questionnairePlan.review_status === "approved"));
  const approved = Boolean(questionnairePlan && questionnairePlan.approval_status === "approved");
  let status = "missing";
  if (questionnairePlan) {
    if (approved) status = "approved";
    else if (reviewed && complete) status = "reviewed";
    else if (complete) status = "complete";
    else if (answersTotal > 0) status = "answered";
    else status = "generated";
  }
  return {
    status,
    path: questionnairePath,
    questions_total: questionsTotal,
    answers_total: answersTotal,
    missing_answers: uniqueList(missingAnswers),
    reviewed,
    approved,
    complete,
    generated: Boolean(questionnairePlan),
    next_action: !questionnairePlan
      ? "Run kvdf questionnaire plan to generate the intake questions."
      : missingAnswers.length
        ? "Answer the remaining questionnaire items before approving the brief."
        : approved
          ? "The questionnaire is approved."
          : reviewed
            ? "Review and approve the questionnaire brief."
            : "Review the questionnaire before approval."
  };
}

function buildViberPipelineBriefSummary(questionnaire, stateResync, currentState = null) {
  const questionnaireApproved = Boolean(questionnaire && questionnaire.approved);
  const questionnaireComplete = Boolean(questionnaire && questionnaire.complete);
  let status = "missing";
  if (!questionnaire || !questionnaire.generated) {
    status = "missing";
  } else if (!questionnaireComplete) {
    status = "blocked";
  } else if (questionnaireApproved) {
    status = "approved";
  } else if (questionnaire.reviewed) {
    status = "reviewed";
  } else {
    status = "draft";
  }
  return {
    status,
    path: questionnaire && questionnaire.path ? questionnaire.path : null,
    reviewed: questionnaire ? Boolean(questionnaire.reviewed) : false,
    approved: questionnaireApproved,
    next_action: !questionnaire || !questionnaire.generated
      ? "Generate the questionnaire brief before planning further."
      : !questionnaireComplete
        ? "Complete the questionnaire answers before approving the brief."
        : questionnaireApproved
          ? "The brief is approved."
          : questionnaire.reviewed
            ? "Approve the brief with --confirm."
            : "Review the brief before approval."
  };
}

function formatViberPipelineStageTitle(stage) {
  return String(stage || "")
    .split("_")
    .map((item) => item ? `${item.charAt(0).toUpperCase()}${item.slice(1)}` : "")
    .join(" ");
}

function buildViberPipelineStageRecord(stage, status, group, order, outputs = [], blockers = [], warnings = [], nextAction = "", required = true) {
  return {
    stage,
    order,
    group,
    label: formatViberPipelineStageTitle(stage),
    status,
    required,
    outputs: Array.isArray(outputs) ? outputs : [],
    blockers: Array.isArray(blockers) ? uniqueList(blockers) : [],
    warnings: Array.isArray(warnings) ? uniqueList(warnings) : [],
    next_action: nextAction || ""
  };
}

function buildViberDocsDesignGateEntry({
  gate,
  status,
  required = true,
  source = "missing",
  requiredDocs = [],
  existingDocs = [],
  missingDocs = [],
  appliedDocs = [],
  nextAction = ""
} = {}) {
  return {
    gate,
    status,
    required: Boolean(required),
    source,
    required_docs: uniqueList(requiredDocs),
    existing_docs: uniqueList(existingDocs),
    missing_docs: uniqueList(missingDocs),
    applied_docs: uniqueList(appliedDocs),
    next_action: nextAction || ""
  };
}

function mapViberDocsDesignGateStatusToStageStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["generated", "reviewed", "approved", "applied_to_stage", "ready"].includes(normalized)) return "complete";
  if (["blocked", "missing"].includes(normalized)) return "blocked";
  if (normalized === "planned") return "planned";
  if (normalized === "deferred") return "deferred";
  if (normalized === "not_applicable") return "not_applicable";
  return "unknown";
}

function buildViberDocsDesignGates({
  docsPlan = null,
  docsStatus = null,
  planningMethod = "hybrid"
} = {}) {
  const docs = Array.isArray(docsPlan && docsPlan.docs) ? docsPlan.docs.map((doc) => ({ ...doc })) : [];
  const docsById = new Map(docs.map((doc) => [String(doc.doc_id || ""), doc]));
  const folders = Array.isArray(docsPlan && docsPlan.documentation_folders)
    ? docsPlan.documentation_folders.map((folder) => ({
      ...folder,
      files: Array.isArray(folder.files) ? folder.files.map((file) => ({ ...file })) : []
    }))
    : [];
  const readyStatuses = new Set(["generated", "reviewed", "approved", "applied_to_stage"]);
  const resolveDocPath = (docId) => {
    const doc = docsById.get(String(docId || ""));
    return doc && doc.path ? doc.path : String(docId || "");
  };
  const collectDocs = (docIds = []) => {
    const entries = [];
    for (const docId of Array.isArray(docIds) ? docIds : []) {
      const doc = docsById.get(String(docId || ""));
      if (doc) entries.push(doc);
    }
    return entries;
  };
  const summarizeDocGate = ({ gate, docIds, nextAction, allowNotApplicable = true, required = true, source = "planner_docs_status" }) => {
    const entries = collectDocs(docIds);
    const requiredEntries = entries.filter((doc) => doc.required !== false && String(doc.status || "").toLowerCase() !== "not_applicable");
    const requiredDocs = requiredEntries.map((doc) => resolveDocPath(doc.doc_id));
    const existingDocs = entries.filter((doc) => Boolean(doc.file_exists) || readyStatuses.has(String(doc.status || "").toLowerCase())).map((doc) => resolveDocPath(doc.doc_id));
    const appliedDocs = entries.filter((doc) => ["reviewed", "approved", "applied_to_stage"].includes(String(doc.status || "").toLowerCase())).map((doc) => resolveDocPath(doc.doc_id));
    const missingDocs = requiredDocs.filter((docPath) => !existingDocs.includes(docPath));
    const allNotApplicable = entries.length > 0 && entries.every((doc) => String(doc.status || "").toLowerCase() === "not_applicable");
    const anyDeferred = entries.some((doc) => String(doc.status || "").toLowerCase() === "deferred");
    const anyPlanned = entries.some((doc) => String(doc.status || "").toLowerCase() === "planned");
    const anyBlocked = entries.some((doc) => String(doc.status || "").toLowerCase() === "blocked");
    let status = "unknown";
    if (!entries.length || allNotApplicable) {
      status = allowNotApplicable ? "not_applicable" : "missing";
    } else if (missingDocs.length) {
      status = "blocked";
    } else if (appliedDocs.length && appliedDocs.length === requiredDocs.length && requiredDocs.length) {
      status = "approved";
    } else if (entries.some((doc) => readyStatuses.has(String(doc.status || "").toLowerCase()))) {
      status = "generated";
    } else if (anyPlanned) {
      status = "planned";
    } else if (anyDeferred) {
      status = "deferred";
    } else if (anyBlocked) {
      status = "blocked";
    } else {
      status = existingDocs.length ? "generated" : "missing";
    }
    return buildViberDocsDesignGateEntry({
      gate,
      status,
      required: Boolean(required && requiredDocs.length > 0),
      source: entries.length ? source : "missing",
      requiredDocs,
      existingDocs,
      missingDocs,
      appliedDocs,
      nextAction
    });
  };
  const summarizeFolderGate = ({ gate, nextAction, required = true, source = "planner_docs_status" }) => {
    const requiredFolders = folders.filter((folder) => folder.required !== false).map((folder) => folder.path || folder.folder_id).filter(Boolean);
    const existingFolders = folders.filter((folder) => ["generated", "reviewed", "approved"].includes(String(folder.status || "").toLowerCase())).map((folder) => folder.path || folder.folder_id).filter(Boolean);
    const appliedFolders = folders.filter((folder) => ["reviewed", "approved"].includes(String(folder.status || "").toLowerCase())).map((folder) => folder.path || folder.folder_id).filter(Boolean);
    const missingFolders = requiredFolders.filter((folderPath) => !existingFolders.includes(folderPath));
    let status = "unknown";
    if (!folders.length || (!requiredFolders.length && !existingFolders.length)) {
      status = "missing";
    } else if (missingFolders.length) {
      status = "blocked";
    } else if (appliedFolders.length && appliedFolders.length === requiredFolders.length && requiredFolders.length) {
      status = "approved";
    } else if (existingFolders.length) {
      status = "generated";
    } else {
      status = "planned";
    }
    return buildViberDocsDesignGateEntry({
      gate,
      status,
      required: Boolean(required && requiredFolders.length > 0),
      source: folders.length ? source : "missing",
      requiredDocs: requiredFolders,
      existingDocs: existingFolders,
      missingDocs: missingFolders,
      appliedDocs: appliedFolders,
      nextAction
    });
  };
  const architectureGate = summarizeFolderGate({
    gate: "documentation_architecture",
    nextAction: "Materialize the planner docs catalog and plan before progressing."
  });
  const foldersGate = summarizeFolderGate({
    gate: "documentation_folders",
    nextAction: "Materialize the foldered planner docs package."
  });
  const filesGate = summarizeDocGate({
    gate: "documentation_files",
    docIds: docs.map((doc) => doc.doc_id),
    nextAction: "Generate the planner documentation files from the foldered package."
  });
  const systemDesignGate = summarizeDocGate({
    gate: "system_design",
    docIds: ["system_design", "c4_context", "c4_container", "c4_component", "module_breakdown", "service_boundaries", "state_and_lifecycle", "integration_map"],
    nextAction: "Create or review the system design before version planning."
  });
  const databaseDesignGate = summarizeDocGate({
    gate: "database_design",
    docIds: ["erd", "data_model", "database_schema", "data_dictionary", "entities_and_relationships", "schema_rules", "migration_plan", "backup_and_recovery"],
    nextAction: "Create or review the database design before version planning."
  });
  const uiUxDesignGate = summarizeDocGate({
    gate: "ui_ux_design",
    docIds: ["ui_ux_design", "ux_principles", "information_architecture", "user_flows", "wireframes", "ui_specification", "content_and_tone", "accessibility"],
    nextAction: "Create or review the UI/UX design before version planning."
  });
  const versionPlanGate = summarizeDocGate({
    gate: "version_plan",
    docIds: ["version_plan", "evolutions", "task_punches", "implementation_order", "release_plan"],
    nextAction: "Create or review the version plan before evolution ordering."
  });
  const gates = {
    documentation_architecture: architectureGate,
    documentation_folders: foldersGate,
    documentation_files: filesGate,
    system_design: systemDesignGate,
    database_design: databaseDesignGate,
    ui_ux_design: uiUxDesignGate,
    version_plan: versionPlanGate
  };
  const gateList = Object.values(gates);
  const requiredReadyStatuses = new Set(["generated", "reviewed", "approved", "applied_to_stage"]);
  const blockerStatuses = new Set(["blocked", "missing"]);
  const blockers = [];
  const warnings = [];
  for (const gate of gateList) {
    const normalizedStatus = String(gate.status || "").trim().toLowerCase();
    if (blockerStatuses.has(normalizedStatus)) {
      blockers.push({
        id: `viber-docs-design-${gate.gate}`,
        severity: "blocker",
        area: "docs",
        gate: gate.gate,
        message: `${gate.gate.replace(/_/g, " ")} is not ready.`,
        next_action: gate.next_action
      });
    } else if (["planned", "deferred"].includes(normalizedStatus)) {
      warnings.push({
        id: `viber-docs-design-${gate.gate}-warning`,
        severity: "warning",
        area: "docs",
        gate: gate.gate,
        message: `${gate.gate.replace(/_/g, " ")} is planned or deferred.`,
        next_action: gate.next_action
      });
    }
  }
  const requiredGates = gateList.filter((gate) => gate.required);
  const readyRequiredGates = requiredGates.every((gate) => requiredReadyStatuses.has(String(gate.status || "").trim().toLowerCase()));
  const hasBlockingRequiredGate = requiredGates.some((gate) => blockerStatuses.has(String(gate.status || "").trim().toLowerCase()) || String(gate.status || "").trim().toLowerCase() === "planned");
  const status = hasBlockingRequiredGate ? "blocked" : warnings.length ? "warning" : readyRequiredGates ? "ready" : "warning";
  const firstBlockedGate = gateList.find((gate) => blockerStatuses.has(String(gate.status || "").trim().toLowerCase()) || String(gate.status || "").trim().toLowerCase() === "planned");
  const firstWarningGate = gateList.find((gate) => ["deferred"].includes(String(gate.status || "").trim().toLowerCase()));
  return {
    status,
    documentation_architecture: gates.documentation_architecture,
    documentation_folders: gates.documentation_folders,
    documentation_files: gates.documentation_files,
    system_design: gates.system_design,
    database_design: gates.database_design,
    ui_ux_design: gates.ui_ux_design,
    version_plan: gates.version_plan,
    blockers,
    warnings,
    next_action: firstBlockedGate
      ? firstBlockedGate.next_action
      : firstWarningGate
        ? firstWarningGate.next_action
        : "Review the next docs/design stage."
  };
}

function buildViberVersionEvolutionGateEntry({
  gate,
  status,
  required = true,
  source = "missing",
  itemsTotal = 0,
  approvedTotal = 0,
  blockedTotal = 0,
  missingItems = [],
  blockingErrors = [],
  warnings = [],
  nextAction = ""
} = {}) {
  return {
    gate,
    status,
    required: Boolean(required),
    source,
    items_total: Math.max(0, Number(itemsTotal) || 0),
    approved_total: Math.max(0, Number(approvedTotal) || 0),
    blocked_total: Math.max(0, Number(blockedTotal) || 0),
    missing_items: uniqueList(missingItems),
    blocking_errors: uniqueList(blockingErrors),
    warnings: uniqueList(warnings),
    next_action: nextAction || ""
  };
}

function buildViberExecutionGateEntry({
  gate,
  status,
  required = true,
  source = "missing",
  evidence = [],
  blockers = [],
  warnings = [],
  nextAction = ""
} = {}) {
  return {
    gate,
    status,
    required: Boolean(required),
    source,
    evidence: uniqueList(evidence),
    blockers: uniqueList(blockers),
    warnings: uniqueList(warnings),
    next_action: nextAction || ""
  };
}

function mapViberVersionEvolutionGateStatusToStageStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["approved"].includes(normalized)) return "approved";
  if (["reviewed", "generated", "planned"].includes(normalized)) return "ready";
  if (["materialized"].includes(normalized)) return "materialized";
  if (["blocked", "missing"].includes(normalized)) return "blocked";
  if (normalized === "deferred") return "deferred";
  if (normalized === "not_applicable") return "not_applicable";
  return "unknown";
}

function normalizeViberExecutionGateStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["passed", "pass", "ready"].includes(normalized)) return "passed";
  if (["warning", "blocked", "missing", "planned", "not_applicable", "unknown"].includes(normalized)) return normalized === "pass" ? "passed" : normalized;
  return "unknown";
}

function buildViberExecutionGates({
  sourceControl = null,
  versionControl = null,
  taskPunchReviewReady = false,
  evolutionValidation = null,
  validationCommands = DEFAULT_VALIDATION_COMMANDS,
  securityGateState = null,
  materialized = false,
  planningMethod = "hybrid"
} = {}) {
  const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
  const securityEvidence = [];
  if (currentVersion && currentVersion.security_gate) securityEvidence.push(`version_control:${currentVersion.security_gate.status || "unknown"}`);
  if (securityGateState && securityGateState.status) securityEvidence.push(`runtime:${securityGateState.status}`);
  const securitySource = currentVersion && currentVersion.security_gate ? "runtime" : (securityGateState ? "security_auditor" : "missing");
  const securityRawStatus = currentVersion && currentVersion.security_gate
    ? String(currentVersion.security_gate.status || "").toLowerCase()
    : securityGateState
      ? String(securityGateState.status || "").toLowerCase()
      : "";
  const securityWarnings = [];
  const securityBlockers = [];
  let securityStatus = "warning";
  if (securityRawStatus === "blocked") {
    securityStatus = "blocked";
    securityBlockers.push(currentVersion && currentVersion.security_gate && currentVersion.security_gate.next_action ? currentVersion.security_gate.next_action : (securityGateState && securityGateState.next_action ? securityGateState.next_action : "Resolve the security gate before execution."));
  } else if (securityRawStatus === "pass" || securityRawStatus === "ready") {
    securityStatus = "passed";
  } else if (securityGateState) {
    securityWarnings.push("Security gate evidence is present but not fully passing.");
  } else {
    securityWarnings.push("Security gate evidence is missing.");
  }
  const securityGate = buildViberExecutionGateEntry({
    gate: "security_gate",
    status: securityStatus,
    source: securitySource,
    evidence: securityEvidence.length ? securityEvidence : ["No security gate evidence found."],
    blockers: securityBlockers,
    warnings: securityWarnings,
    nextAction: securityStatus === "passed"
      ? "Security gate is ready."
      : securityStatus === "blocked"
        ? "Resolve the security gate before execution."
        : "Run the security gate and capture the result."
  });

  const sourceMode = normalizeSourceControlMode(sourceControl && sourceControl.mode ? sourceControl.mode : "local_only") || "local_only";
  const sourceControlEvidence = [];
  if (sourceControl && sourceControl.mode) sourceControlEvidence.push(`mode:${sourceMode}`);
  if (sourceControl && sourceControl.remote_provider) sourceControlEvidence.push(`remote:${sourceControl.remote_provider}`);
  if (sourceControl && sourceControl.provider_plugin) sourceControlEvidence.push(`provider_plugin:${sourceControl.provider_plugin}`);
  const sourceControlWarnings = [];
  const sourceControlBlockers = [];
  let sourceControlStatus = "warning";
  if (sourceMode === "local_only") {
    sourceControlStatus = "ready";
    sourceControlEvidence.push("local_only");
  } else if (sourceMode === "direct_main") {
    sourceControlStatus = "ready";
    sourceControlEvidence.push("validation_then_commit_push_main");
  } else if (sourceMode === "branch") {
    sourceControlStatus = sourceControl && sourceControl.branching_enabled ? "ready" : "warning";
    if (!sourceControl || !sourceControl.branching_enabled) sourceControlWarnings.push("Branching is not enabled for the selected source-control mode.");
  } else if (sourceMode === "branch_pr") {
    sourceControlStatus = sourceControl && sourceControl.branching_enabled && sourceControl.pr_enabled ? "ready" : "warning";
    if (!sourceControl || !sourceControl.branching_enabled) sourceControlWarnings.push("Branching is not enabled for the selected source-control mode.");
    if (!sourceControl || !sourceControl.pr_enabled) sourceControlWarnings.push("PR readiness is not enabled for the selected source-control mode.");
  } else {
    sourceControlWarnings.push("Source-control mode is not explicit.");
  }
  const sourceControlGate = buildViberExecutionGateEntry({
    gate: "source_control_gate",
    status: sourceControlStatus,
    source: "source_control",
    evidence: sourceControlEvidence.length ? sourceControlEvidence : ["No source-control plan found."],
    blockers: sourceControlBlockers,
    warnings: sourceControlWarnings,
    nextAction: sourceMode === "local_only"
      ? "Keep the changes local; commit, push, branch, and PR are not required."
      : sourceMode === "direct_main"
        ? "Validate, then commit and push to main after approval and materialization."
        : sourceMode === "branch"
          ? "Create the branch and push it after approval and materialization."
          : sourceMode === "branch_pr"
            ? "Create the branch, push it, and prepare the PR after approval and materialization."
            : "Choose a source-control mode before execution."
  });

  const handoffEvidence = [];
  if (taskPunchReviewReady) handoffEvidence.push("task_punch_review:ready");
  if (materialized) handoffEvidence.push("materialized:true");
  if (sourceMode) handoffEvidence.push(`source_control_mode:${sourceMode}`);
  const handoffWarnings = [];
  const handoffBlockers = [];
  let handoffStatus = "warning";
  if (!taskPunchReviewReady) {
    handoffStatus = "blocked";
    handoffBlockers.push("Task punch review must be approved before execution.");
  } else if (materialized) {
    handoffStatus = "passed";
  } else {
    handoffWarnings.push("Handoff requirements are present but not yet materialized.");
  }
  const handoffGate = buildViberExecutionGateEntry({
    gate: "handoff_gate",
    status: handoffStatus,
    source: "handoff",
    evidence: handoffEvidence.length ? handoffEvidence : ["Handoff evidence is missing."],
    blockers: handoffBlockers,
    warnings: handoffWarnings,
    nextAction: handoffStatus === "passed"
      ? "Handoff gate is ready."
      : taskPunchReviewReady
        ? "Materialize the approved plan and prepare the handoff."
        : "Review and approve the task punches before handoff."
  });

  const validationEvidence = Array.isArray(validationCommands) && validationCommands.length ? [...validationCommands] : [...DEFAULT_VALIDATION_COMMANDS];
  const validationWarnings = [];
  const validationBlockers = [];
  let validationStatus = "warning";
  if (materialized) {
    validationStatus = "planned";
  } else {
    validationWarnings.push("Validation cannot pass before execution.");
  }
  const validationGate = buildViberExecutionGateEntry({
    gate: "validation_gate",
    status: validationStatus,
    source: "validation",
    evidence: validationEvidence,
    blockers: validationBlockers,
    warnings: validationWarnings,
    nextAction: materialized
      ? "Run the validation commands after execution."
      : "Validation will run after execution."
  });

  const blockers = [];
  const warnings = [];
  [securityGate, handoffGate, sourceControlGate].forEach((gate) => {
    if (gate.status === "blocked" || gate.status === "missing") {
      blockers.push({
        id: `viber-execution-${gate.gate}`,
        severity: "blocker",
        area: gate.gate === "source_control_gate" ? "source_control" : gate.gate === "handoff_gate" ? "handoff" : "security",
        gate: gate.gate,
        message: gate.blockers[0] || `${gate.gate} is not ready.`,
        next_action: gate.next_action
      });
    } else if (gate.status === "warning") {
      warnings.push({
        id: `viber-execution-${gate.gate}-warning`,
        severity: "warning",
        area: gate.gate === "source_control_gate" ? "source_control" : gate.gate === "handoff_gate" ? "handoff" : "security",
        gate: gate.gate,
        message: gate.warnings[0] || `${gate.gate} needs review.`,
        next_action: gate.next_action
      });
    }
  });
  if (!taskPunchReviewReady) {
    blockers.push({
      id: "viber-execution-task-punch-review",
      severity: "blocker",
      area: "task",
      gate: "task_punch_review",
      message: "Task punch review is required before execution.",
      next_action: "Review and approve the task punches before execution."
    });
  }

  const status = blockers.length ? "blocked" : warnings.length ? "warning" : (securityGate.status === "passed" && handoffGate.status === "passed" && sourceControlGate.status === "ready" && taskPunchReviewReady ? "ready" : "warning");
  const nextGate = [securityGate, handoffGate, sourceControlGate].find((gate) => gate.status === "blocked" || gate.status === "missing")
    || (!taskPunchReviewReady ? { next_action: "Review and approve the task punches before execution." } : null);
  return {
    status,
    security_gate: securityGate,
    handoff_gate: handoffGate,
    source_control_gate: sourceControlGate,
    validation_gate: validationGate,
    blockers,
    warnings,
    next_action: nextGate ? nextGate.next_action : "Resolve the execution gates before prompting Codex."
  };
}

function buildViberVersionEvolutionGates({
  versionPlan = null,
  evolutions = [],
  evolutionValidation = null,
  taskPunches = [],
  currentPlan = null,
  planningMethod = "hybrid",
  docsDesignGates = null,
  questionnaire = null,
  brief = null,
  stateFresh = false,
  boundaryReady = false
} = {}) {
  const versionPlanVersions = Array.isArray(versionPlan && versionPlan.versions) ? versionPlan.versions.map((version) => ({ ...version })) : [];
  const normalizedVersionPlanStatus = String(versionPlan && versionPlan.status || "").trim().toLowerCase();
  const approvedCurrentPlan = Boolean(currentPlan && ["approved", "materialized", "completed"].includes(String(currentPlan.status || "").trim().toLowerCase()));
  const approvedVersionTotal = versionPlanVersions.filter((version) => ["approved", "reviewed", "generated", "applied_to_stage", "materialized"].includes(String(version.status || "").trim().toLowerCase())).length;
  const blockedVersionTotal = versionPlanVersions.filter((version) => ["blocked", "draft", "future_only"].includes(String(version.status || "").trim().toLowerCase())).length;
  const versionPlanHasContent = versionPlanVersions.length > 0;
  const versionPlanApproved = Boolean(approvedCurrentPlan || normalizedVersionPlanStatus === "approved" || (versionPlan && versionPlan.approval_status === "approved"));
  const versionPlanReviewed = Boolean(normalizedVersionPlanStatus === "reviewed" || (versionPlan && versionPlan.review_status === "reviewed"));
  const versionPlanGenerated = Boolean(versionPlanHasContent);
  const docsDesignReady = Boolean(docsDesignGates && docsDesignGates.status === "ready");
  const planningFoundationReady = Boolean(questionnaire && questionnaire.complete && brief && brief.approved && stateFresh && boundaryReady && docsDesignReady);
  const versionPlanWarnings = [];
  const versionPlanBlockingErrors = [];
  if (!versionPlan) {
    versionPlanBlockingErrors.push("Version plan is missing.");
  } else if (!versionPlanHasContent) {
    versionPlanBlockingErrors.push("Version plan has no version slices.");
  } else if (!planningFoundationReady) {
    versionPlanBlockingErrors.push("Docs/design foundation is not ready for version plan approval.");
  } else if (!versionPlanApproved) {
    versionPlanWarnings.push("Version plan is generated but not yet approved.");
  }
  const versionPlanStatus = !versionPlan
    ? "blocked"
    : !planningFoundationReady
      ? "blocked"
    : versionPlanApproved
      ? "approved"
      : versionPlanReviewed
        ? "reviewed"
        : versionPlanGenerated
          ? "generated"
          : "planned";
  const versionPlanGate = buildViberVersionEvolutionGateEntry({
    gate: "version_plan",
    status: versionPlanStatus,
    source: versionPlan ? "pipeline" : "missing",
    itemsTotal: versionPlanVersions.length,
    approvedTotal: versionPlanApproved ? versionPlanVersions.length : approvedVersionTotal,
    blockedTotal: blockedVersionTotal,
    missingItems: !versionPlan || !versionPlanHasContent ? ["version_plan"] : [],
    blockingErrors: versionPlanBlockingErrors,
    warnings: versionPlanWarnings,
    nextAction: !versionPlan
      ? "Create or review the version plan before evolution ordering."
      : versionPlanApproved
        ? "The version plan is approved."
        : "Review and approve the version plan before authorizing evolutions."
  });

  const normalizedEvolutionStatuses = new Set(["approved", "active", "completed", "materialized"]);
  const draftEvolutionStatuses = new Set(["draft", "proposed", "reviewed", "generated", "planned", "future_only", "blocked"]);
  const approvedEvolutions = Array.isArray(evolutions)
    ? evolutions.filter((evolution) => normalizedEvolutionStatuses.has(String(evolution && (evolution.status || evolution.approval_status || evolution.lifecycle_status) || "").trim().toLowerCase()))
    : [];
  const blockedEvolutions = Array.isArray(evolutions)
    ? evolutions.filter((evolution) => draftEvolutionStatuses.has(String(evolution && (evolution.status || evolution.approval_status || evolution.lifecycle_status) || "").trim().toLowerCase()))
    : [];
  const futureOnlyEvolutions = Array.isArray(evolutions)
    ? evolutions.filter((evolution) => String(evolution && (evolution.status || evolution.approval_status || evolution.lifecycle_status) || "").trim().toLowerCase() === "future_only")
    : [];
  const evolutionsBlockingErrors = [];
  const evolutionsWarnings = [];
  const evolutionsApproved = versionPlanApproved && approvedEvolutions.length > 0;
  let evolutionsStatus = "blocked";
  if (!planningFoundationReady) {
    evolutionsBlockingErrors.push("Docs/design foundation must be ready before evolutions are authoritative.");
  } else if (!versionPlanApproved) {
    evolutionsBlockingErrors.push("Version plan must be approved before evolutions become authoritative.");
  } else if (!Array.isArray(evolutions) || evolutions.length === 0) {
    evolutionsBlockingErrors.push("No evolutions are present.");
  } else if (blockedEvolutions.length && approvedEvolutions.length === 0) {
    evolutionsBlockingErrors.push("Evolution slices are draft or unapproved.");
  } else if (futureOnlyEvolutions.length) {
    evolutionsWarnings.push("Future-only evolution slices are present.");
    evolutionsStatus = approvedEvolutions.length ? "reviewed" : "blocked";
  } else if (approvedEvolutions.length) {
    evolutionsStatus = approvedEvolutions.length === evolutions.length ? "approved" : "reviewed";
  } else {
    evolutionsBlockingErrors.push("Evolution slices are not approved.");
  }
  if (evolutionsWarnings.length && evolutionsStatus !== "blocked" && evolutionsStatus !== "approved") {
    evolutionsStatus = "reviewed";
  }
  const evolutionsGate = buildViberVersionEvolutionGateEntry({
    gate: "evolutions",
    status: evolutionsStatus,
    source: Array.isArray(evolutions) && evolutions.length ? "pipeline" : "missing",
    itemsTotal: Array.isArray(evolutions) ? evolutions.length : 0,
    approvedTotal: approvedEvolutions.length,
    blockedTotal: blockedEvolutions.length,
    missingItems: !Array.isArray(evolutions) || evolutions.length === 0 ? ["evolutions"] : [],
    blockingErrors: evolutionsBlockingErrors,
    warnings: evolutionsWarnings,
    nextAction: !versionPlanApproved
      ? "Approve the version plan before authorizing evolutions."
      : !Array.isArray(evolutions) || evolutions.length === 0
        ? "Create the evolutions before generating task punches."
        : blockedEvolutions.length && approvedEvolutions.length === 0
          ? "Approve the evolution slices before generating task punches."
          : futureOnlyEvolutions.length
            ? "Review future-only slices before task generation."
            : "The evolutions are ready."
  });

  const evolutionOrderAllowed = Boolean(evolutionValidation && evolutionValidation.task_generation_allowed);
  const evolutionOrderValidationGate = buildViberVersionEvolutionGateEntry({
    gate: "evolution_order_validation",
    status: evolutionOrderAllowed ? "approved" : "blocked",
    source: evolutionValidation ? "derived" : "missing",
    itemsTotal: Array.isArray(evolutionValidation && evolutionValidation.current_order) ? evolutionValidation.current_order.length : (Array.isArray(evolutions) ? evolutions.length : 0),
    approvedTotal: evolutionOrderAllowed ? 1 : 0,
    blockedTotal: evolutionOrderAllowed ? 0 : 1,
    missingItems: !evolutionValidation ? ["evolution_order_validation"] : [],
    blockingErrors: evolutionOrderAllowed ? [] : uniqueList(Array.isArray(evolutionValidation && evolutionValidation.blocking_errors) && evolutionValidation.blocking_errors.length ? evolutionValidation.blocking_errors : ["Invalid evolution order."]),
    warnings: uniqueList(Array.isArray(evolutionValidation && evolutionValidation.warnings) ? evolutionValidation.warnings : []),
    nextAction: evolutionValidation && evolutionValidation.next_action ? evolutionValidation.next_action : "Validate the evolution order before creating task punches."
  });

  const taskPunchEntries = Array.isArray(taskPunches) ? taskPunches.map((taskPunch) => ({ ...taskPunch })) : [];
  const approvedTaskPunches = taskPunchEntries.filter((taskPunch) => Boolean(taskPunch && Array.isArray(taskPunch.tasks) && taskPunch.tasks.length) && !["draft", "proposed", "blocked"].includes(String(taskPunch.status || "").trim().toLowerCase()));
  const taskPunchesGate = buildViberVersionEvolutionGateEntry({
    gate: "task_punches",
    status: !versionPlanApproved
      ? "blocked"
      : !evolutionsApproved
        ? "blocked"
        : !evolutionOrderAllowed
          ? "blocked"
          : approvedTaskPunches.length
            ? "approved"
            : "blocked",
    source: taskPunchEntries.length ? "pipeline" : "missing",
    itemsTotal: taskPunchEntries.length,
    approvedTotal: approvedTaskPunches.length,
    blockedTotal: taskPunchEntries.length && approvedTaskPunches.length === 0 ? taskPunchEntries.length : 0,
    missingItems: taskPunchEntries.length ? [] : ["task_punches"],
    blockingErrors: !versionPlanApproved
      ? ["Version plan must be approved before task punches."]
      : !evolutionsApproved
        ? ["Approved evolutions are required before task punches."]
        : !evolutionOrderAllowed
          ? uniqueList(Array.isArray(evolutionValidation && evolutionValidation.blocking_errors) && evolutionValidation.blocking_errors.length ? evolutionValidation.blocking_errors : ["Invalid evolution order."])
        : taskPunchEntries.length && approvedTaskPunches.length === 0
          ? ["Task punches were generated from draft or unapproved evolutions."]
          : [],
    warnings: taskPunchEntries.length && approvedTaskPunches.length === 0 ? ["Task punches exist but still need review."] : [],
    nextAction: !versionPlanApproved
      ? "Approve the version plan before creating task punches."
      : !evolutionsApproved
        ? "Approve the evolution slices before creating task punches."
        : !evolutionOrderAllowed
          ? evolutionValidation && evolutionValidation.next_action ? evolutionValidation.next_action : "Validate the evolution order before creating task punches."
        : taskPunchEntries.length
          ? "Review the task punches before materialization."
          : "Create the task punches."
  });

  const taskPunchReviewStatus = (() => {
    const currentPlanStatus = String(currentPlan && currentPlan.status || "").trim().toLowerCase();
    const currentPlanMaterializationStatus = String(currentPlan && currentPlan.materialization_status || "").trim().toLowerCase();
    if (["approved", "materialized", "completed"].includes(currentPlanStatus) || currentPlanMaterializationStatus === "materialized") return "approved";
    if (taskPunchEntries.length) return "generated";
    return "missing";
  })();
  const taskPunchReviewGate = buildViberVersionEvolutionGateEntry({
    gate: "task_punch_review",
    status: taskPunchReviewStatus === "approved" ? "approved" : "blocked",
    source: currentPlan ? "pipeline" : "missing",
    itemsTotal: taskPunchEntries.length,
    approvedTotal: taskPunchReviewStatus === "approved" ? 1 : 0,
    blockedTotal: taskPunchReviewStatus === "approved" ? 0 : (taskPunchEntries.length ? 1 : 1),
    missingItems: taskPunchEntries.length ? [] : ["task_punch_review"],
    blockingErrors: taskPunchReviewStatus === "approved" ? [] : (!taskPunchEntries.length ? ["Task punch review is missing."] : ["Task punch review has not been approved."]),
    warnings: taskPunchEntries.length ? ["Task punch review is required before materialization."] : ["No task punches exist yet."],
    nextAction: taskPunchEntries.length
      ? "Review the task punches before materialization."
      : "Create the task punches before review."
  });

  const gateList = [versionPlanGate, evolutionsGate, evolutionOrderValidationGate, taskPunchesGate, taskPunchReviewGate];
  const hasBlockingGate = gateList.some((gate) => ["blocked", "missing"].includes(String(gate.status || "").trim().toLowerCase()));
  const hasWarningGate = gateList.some((gate) => ["generated", "reviewed", "planned", "deferred"].includes(String(gate.status || "").trim().toLowerCase()) || (Array.isArray(gate.warnings) && gate.warnings.length > 0));
  const ready = gateList.every((gate) => ["reviewed", "approved"].includes(String(gate.status || "").trim().toLowerCase()) || (gate.gate === "task_punch_review" && taskPunchReviewStatus === "approved"));
  const blockers = [];
  const warnings = [];
  for (const gate of gateList) {
    const normalizedStatus = String(gate.status || "").trim().toLowerCase();
    const firstError = Array.isArray(gate.blocking_errors) && gate.blocking_errors.length ? gate.blocking_errors[0] : null;
    if (["blocked", "missing"].includes(normalizedStatus)) {
      blockers.push({
        id: `viber-version-evolution-${gate.gate}`,
        severity: "blocker",
        area: "task",
        gate: gate.gate,
        message: firstError || `${gate.gate.replace(/_/g, " ")} is not ready.`,
        next_action: gate.next_action
      });
    } else if (["generated", "reviewed", "planned", "deferred"].includes(normalizedStatus) || (Array.isArray(gate.warnings) && gate.warnings.length)) {
      warnings.push({
        id: `viber-version-evolution-${gate.gate}-warning`,
        severity: "warning",
        area: "task",
        gate: gate.gate,
        message: Array.isArray(gate.warnings) && gate.warnings.length ? gate.warnings[0] : `${gate.gate.replace(/_/g, " ")} needs review.`,
        next_action: gate.next_action
      });
    }
  }
  const status = hasBlockingGate ? "blocked" : hasWarningGate ? "warning" : ready ? "ready" : "warning";
  const firstBlockedGate = gateList.find((gate) => ["blocked", "missing"].includes(String(gate.status || "").trim().toLowerCase()));
  const firstWarningGate = gateList.find((gate) => ["generated", "reviewed", "planned", "deferred"].includes(String(gate.status || "").trim().toLowerCase()) || (Array.isArray(gate.warnings) && gate.warnings.length));
  return {
    status,
    version_plan: versionPlanGate,
    evolutions: evolutionsGate,
    evolution_order_validation: evolutionOrderValidationGate,
    task_punches: taskPunchesGate,
    task_punch_review: taskPunchReviewGate,
    blockers,
    warnings,
    next_action: firstBlockedGate
      ? firstBlockedGate.next_action
      : firstWarningGate
        ? firstWarningGate.next_action
        : "Review the version and evolution gates."
  };
}

function buildViberPipelineStageOrderValidation(appSlug, context, stateResync, questionnaire, brief, sourceControl, currentState = null) {
  if (!appSlug) {
    const expectedOrder = [
      "boundary_stabilization",
      "local_ui_foundation",
      "runtime_state",
      "discovery_spec",
      "tasking_approval",
      "cloud_commercial_control",
      "local_license_gate",
      "release_access",
      "safety_quality",
      "execution_review",
      "release_packaging",
      "bridge_evolution"
    ];
    return {
      report_type: "kvdf_evolution_order_validation",
      app: "",
      track: "vibe_app_developer",
      source_files_inspected: [],
      detected_evolution_slices: [],
      detected_categories: [],
      current_order: [],
      expected_order: expectedOrder,
      approval_status: {
        questionnaire: questionnaire ? questionnaire.status : "missing",
        questionnaire_complete: questionnaire && questionnaire.complete ? "complete" : "incomplete",
        product_brief: brief ? brief.status : "missing",
        product_brief_source: questionnaire && questionnaire.path ? questionnaire.path : "missing",
        source_of_truth_map: "missing",
        evolution_slices: "missing",
        future_only: "none",
        task_generation: "blocked"
      },
      blocking_errors: ["Missing app boundary / app slug. Suggested fix: select or create the app workspace before task generation."],
      warnings: ["App-level evolution ordering cannot be validated without an app boundary."],
      suggested_corrected_order: [],
      task_generation_allowed: false,
      next_action: "Run kvdf state resync --track vibe --json, then select an app workspace before generating tasks.",
      policy: null
    };
  }
  return buildEvolutionOrderValidationReport(appSlug, { app: appSlug }, { cwd: context.repo_root });
}

function buildViberPipelineStageOrderState({
  idea = "",
  mode = "vibe",
  deliveryMode = "local_first",
  sourceControl = null,
  stateResync = null,
  docsPlan = null,
  docsStatus = null,
  designArtifacts = null,
  visualPlanning = null,
  versionPlan = null,
  versionControl = null,
  evolutions = [],
  taskPunches = [],
  currentPlan = null,
  taskPunch = null,
  pluginContext = null,
  planningMethod = "hybrid",
  currentState = null,
  appSlug = ""
} = {}) {
  const questionnaire = buildViberPipelineQuestionnaireSummary();
  const brief = buildViberPipelineBriefSummary(questionnaire, stateResync, currentState);
  const questionMissing = questionnaire.missing_answers.length > 0;
  const questionnaireComplete = questionnaire.complete;
  const briefApproved = brief.approved;
  const stateFresh = Boolean(stateResync && stateResync.fresh && String(stateResync.state_freshness || "").toLowerCase() === "current");
  const boundaryReady = Boolean(appSlug);
  const docsDesignGates = buildViberDocsDesignGates({
    docsPlan,
    docsStatus,
    planningMethod
  });
  const docsArchitectureReady = docsDesignGates.documentation_architecture.status === "generated" || docsDesignGates.documentation_architecture.status === "reviewed" || docsDesignGates.documentation_architecture.status === "approved" || docsDesignGates.documentation_architecture.status === "applied_to_stage";
  const docsFoldersReady = docsDesignGates.documentation_folders.status === "generated" || docsDesignGates.documentation_folders.status === "reviewed" || docsDesignGates.documentation_folders.status === "approved" || docsDesignGates.documentation_folders.status === "applied_to_stage";
  const docsFilesReady = docsDesignGates.documentation_files.status === "generated" || docsDesignGates.documentation_files.status === "reviewed" || docsDesignGates.documentation_files.status === "approved" || docsDesignGates.documentation_files.status === "applied_to_stage";
  const systemDesignReady = docsDesignGates.system_design.status === "generated" || docsDesignGates.system_design.status === "reviewed" || docsDesignGates.system_design.status === "approved" || docsDesignGates.system_design.status === "applied_to_stage";
  const databaseDesignReady = docsDesignGates.database_design.status === "generated" || docsDesignGates.database_design.status === "reviewed" || docsDesignGates.database_design.status === "approved" || docsDesignGates.database_design.status === "applied_to_stage";
  const uiUxDesignReady = docsDesignGates.ui_ux_design.status === "generated" || docsDesignGates.ui_ux_design.status === "reviewed" || docsDesignGates.ui_ux_design.status === "approved" || docsDesignGates.ui_ux_design.status === "applied_to_stage";
  const sourceControlPlanReady = Boolean(sourceControl && sourceControl.mode);
  const securityPlanReady = Boolean(designArtifacts && designArtifacts.security_design);
  const versionPlanReady = docsDesignGates.version_plan.status === "generated" || docsDesignGates.version_plan.status === "reviewed" || docsDesignGates.version_plan.status === "approved" || docsDesignGates.version_plan.status === "applied_to_stage";
  const evolutionsReady = Array.isArray(evolutions) && evolutions.length > 0;
  const sourceControlGateReady = Boolean(sourceControl && ["direct_main", "branch", "branch_pr", "local_only"].includes(sourceControl.mode));
  const securityGateReady = Boolean(versionControl && versionControl.current_version && versionControl.current_version.security_gate && versionControl.current_version.security_gate.status === "pass");
  const handoffGateReady = Boolean(sourceControlGateReady && (sourceControl.mode === "local_only" || sourceControl.mode === "direct_main" || sourceControl.mode === "branch" || sourceControl.mode === "branch_pr"));
  const currentPlanStatus = String(currentPlan && currentPlan.status || "").trim().toLowerCase();
  const currentPlanMaterializationStatus = String(currentPlan && currentPlan.materialization_status || "").trim().toLowerCase();
  const taskPunchesReady = Array.isArray(taskPunches) && taskPunches.length > 0;
  const taskPunchReviewReady = Boolean(currentPlan && ["approved", "materialized", "completed"].includes(currentPlanStatus));
  let approvalReady = false;
  const materialized = Boolean(currentPlanMaterializationStatus === "materialized" || currentPlanStatus === "materialized");
  const planningFoundationReady = Boolean(questionnaireComplete && briefApproved && stateFresh && boundaryReady);
  const docsDesignReady = Boolean(docsDesignGates.status === "ready");
  const versionEvolutionGates = buildViberVersionEvolutionGates({
    versionPlan,
    evolutions,
    evolutionValidation: buildViberPipelineStageOrderValidation(appSlug, { repo_root: repoRoot() ? repoRoot() : process.cwd() }, stateResync, questionnaire, brief, sourceControl, currentState),
    taskPunches,
    currentPlan,
    planningMethod,
    docsDesignGates,
    questionnaire,
    brief,
    stateFresh,
    boundaryReady
  });
  const appBoundaryStageStatus = boundaryReady ? "approved" : "blocked";
  const answerCompletenessStatus = questionnaireComplete ? "complete" : "blocked";
  const briefGenerationStatus = questionnaire.generated ? (questionnaireComplete ? "complete" : "blocked") : "planned";
  const briefReviewStatus = questionnaire.generated ? (questionnaire.reviewed ? "complete" : questionnaireComplete ? "ready" : "blocked") : "missing";
  const briefApprovalStatus = briefApproved ? "approved" : (questionnaireComplete ? "planned" : "blocked");
  const stateResyncStatus = stateFresh ? "complete" : "blocked";
  const currentStateReportStatus = stateResync && stateResync.report ? (stateFresh ? "complete" : "blocked") : "blocked";
  const documentationArchitectureStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.documentation_architecture.status);
  const documentationFoldersStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.documentation_folders.status);
  const documentationFilesStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.documentation_files.status);
  const systemDesignStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.system_design.status);
  const databaseDesignStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.database_design.status);
  const uiUxDesignStatus = mapViberDocsDesignGateStatusToStageStatus(docsDesignGates.ui_ux_design.status);
  const sourceControlPlanStatus = planningFoundationReady && sourceControlPlanReady ? "complete" : (planningFoundationReady ? "planned" : "blocked");
  const securityPlanStatus = planningFoundationReady && securityPlanReady ? "complete" : (planningFoundationReady ? "planned" : "blocked");
  const versionPlanStatus = mapViberVersionEvolutionGateStatusToStageStatus(versionEvolutionGates.version_plan.status);
  const evolutionsStatus = mapViberVersionEvolutionGateStatusToStageStatus(versionEvolutionGates.evolutions.status);
  const evolutionValidation = versionEvolutionGates.evolution_order_validation || buildViberPipelineStageOrderValidation(appSlug, { repo_root: repoRoot() ? repoRoot() : process.cwd() }, stateResync, questionnaire, brief, sourceControl, currentState);
  const evolutionOrderValidationStatus = mapViberVersionEvolutionGateStatusToStageStatus(versionEvolutionGates.evolution_order_validation.status);
  const taskPunchesStatus = mapViberVersionEvolutionGateStatusToStageStatus(versionEvolutionGates.task_punches.status);
  const taskPunchReviewStatus = mapViberVersionEvolutionGateStatusToStageStatus(versionEvolutionGates.task_punch_review.status);
  approvalReady = Boolean(briefApproved && questionnaireComplete && stateFresh && docsDesignReady && sourceControlPlanReady && securityPlanReady && versionEvolutionGates.status === "ready");
  const codexPromptStatus = Boolean(approvalReady && materialized && docsDesignReady && versionEvolutionGates.status === "ready" && executionReady) ? "ready" : "blocked";
  const executionAllowed = Boolean(planningFoundationReady && docsDesignReady && versionEvolutionGates.status === "ready" && approvalReady && materialized && executionReady && evolutionValidation.task_generation_allowed);
  const executionStatus = executionAllowed ? "ready" : "blocked";
  const validationStatus = executionAllowed ? "ready" : "planned";
  const securityScanStatus = executionAllowed ? "ready" : "planned";
  const handoffStatus = executionAllowed ? "ready" : "planned";
  const dashboardUpdateStatus = executionAllowed ? "ready" : "planned";
  const learningCaptureStatus = executionAllowed ? "ready" : "planned";
  const closeoutStatus = executionAllowed ? "ready" : "planned";
  const planningMethodPolicy = buildViberPipelinePlanningMethodPolicy(planningMethod, questionnaire, brief, sourceControl);
  const executionGates = buildViberExecutionGates({
    sourceControl,
    versionControl,
    taskPunchReviewReady,
    evolutionValidation,
    validationCommands: DEFAULT_VALIDATION_COMMANDS,
    securityGateState: readJsonFileIfExists(path.join(process.cwd(), ".kabeeri", "security", "security_gate_state.json")),
    materialized,
    planningMethod
  });
  const executionReady = executionGates.status === "ready";
  const blockers = [];
  const warnings = [];
  const appendBlocker = (id, area, message, nextAction) => blockers.push({ id, severity: "blocker", area, message, next_action: nextAction });
  const appendWarning = (id, area, message, nextAction) => warnings.push({ id, severity: "warning", area, message, next_action: nextAction });
  for (const blocker of Array.isArray(docsDesignGates.blockers) ? docsDesignGates.blockers : []) {
    appendBlocker(blocker.id || `docs-design-${blocker.gate || "unknown"}`, "docs", blocker.message || "Docs/design readiness is blocked.", blocker.next_action || "Resolve the blocked docs/design gate.");
  }
  for (const warning of Array.isArray(docsDesignGates.warnings) ? docsDesignGates.warnings : []) {
    appendWarning(warning.id || `docs-design-${warning.gate || "unknown"}-warning`, "docs", warning.message || "Docs/design readiness has a warning.", warning.next_action || "Review the docs/design gate.");
  }
  for (const blocker of Array.isArray(versionEvolutionGates.blockers) ? versionEvolutionGates.blockers : []) {
    appendBlocker(blocker.id || `version-evolution-${blocker.gate || "unknown"}`, blocker.area || "task", blocker.message || "Version/evolution readiness is blocked.", blocker.next_action || "Resolve the blocked version/evolution gate.");
  }
  for (const warning of Array.isArray(versionEvolutionGates.warnings) ? versionEvolutionGates.warnings : []) {
    appendWarning(warning.id || `version-evolution-${warning.gate || "unknown"}-warning`, warning.area || "task", warning.message || "Version/evolution readiness has a warning.", warning.next_action || "Review the version/evolution gate.");
  }
  for (const blocker of Array.isArray(executionGates.blockers) ? executionGates.blockers : []) {
    appendBlocker(blocker.id || `execution-${blocker.gate || "unknown"}`, blocker.area || "task", blocker.message || "Execution readiness is blocked.", blocker.next_action || "Resolve the blocked execution gate.");
  }
  for (const warning of Array.isArray(executionGates.warnings) ? executionGates.warnings : []) {
    appendWarning(warning.id || `execution-${warning.gate || "unknown"}-warning`, warning.area || "task", warning.message || "Execution readiness has a warning.", warning.next_action || "Review the execution gate.");
  }
  if (!questionnaire.generated) appendBlocker("questionnaire-generation-missing", "docs", "No questionnaire has been generated yet.", "Run kvdf questionnaire plan to generate the intake questions.");
  if (questionMissing) appendBlocker("questionnaire-answers-missing", "docs", "Questionnaire answers are incomplete.", "Answer the remaining questionnaire items before planning further.");
  if (!briefApproved) appendBlocker("brief-not-approved", "docs", "The product brief is not approved.", "Approve the brief before generating evolutions or tasks.");
  if (!stateFresh) appendBlocker("state-resync-stale", "state_resync", "State Resync is stale or missing.", "Run kvdf state resync --track vibe --json.");
  if (!boundaryReady) appendBlocker("app-boundary-missing", "state_resync", "The app boundary is not approved yet.", "Select the app workspace before generating app tasks.");
  if (!planningFoundationReady) appendBlocker("planning-foundation-missing", "docs", "The documentation and design foundation is not approved yet.", "Approve the brief before authorizing docs, design, and versions.");
  if (!sourceControlPlanReady) appendWarning("source-control-plan-missing", "source_control", "Source control plan is not explicit.", "Choose the local_only, direct_main, branch, or branch_pr mode.");
  if (!securityPlanReady) appendWarning("security-plan-missing", "security", "Security plan is not yet materialized.", "Add the security plan before execution.");
  if (!evolutionsReady) appendBlocker("evolutions-missing", "task", "No approved evolutions are present.", "Approve the version plan and evolution slices before task punches.");
  if (!evolutionValidation.task_generation_allowed) {
    const firstError = Array.isArray(evolutionValidation.blocking_errors) && evolutionValidation.blocking_errors.length ? evolutionValidation.blocking_errors[0] : "Evolution order validation failed.";
    appendBlocker("evolution-order-invalid", "task", firstError, evolutionValidation.next_action || "Validate the ordered evolutions before creating task punches.");
  }
  if (!taskPunchesReady) appendBlocker("task-punches-missing", "task", "Task punches are missing or unapproved.", "Create task punches after evolution order validation passes.");
  if (!taskPunchReviewReady) appendWarning("task-punch-review-pending", "task", "Task punch review is not yet complete.", "Review the task punches before approval.");
  if (!approvalReady) appendBlocker("approval-pending", "task", "The plan is not approved.", "Approve the brief, version plan, and ordered evolutions before materialization.");
  if (!materialized) appendBlocker("materialization-pending", "task", "The plan is not materialized.", "Materialize the approved plan before prompting Codex.");
  if (!codexPromptStatus) appendBlocker("codex-prompt-blocked", "validation", "Codex execution is not allowed yet.", "Complete the planning gates before generating the execution prompt.");
  if (!executionGates.security_gate || executionGates.security_gate.status !== "passed") appendBlocker("security-gate-blocked", "security", executionGates.security_gate && executionGates.security_gate.blockers.length ? executionGates.security_gate.blockers[0] : "Security gate is not passing.", executionGates.security_gate ? executionGates.security_gate.next_action : "Resolve the security gate before execution.");
  if (!executionGates.handoff_gate || executionGates.handoff_gate.status !== "passed") appendBlocker("handoff-gate-blocked", "handoff", executionGates.handoff_gate && executionGates.handoff_gate.blockers.length ? executionGates.handoff_gate.blockers[0] : "Handoff gate is not ready.", executionGates.handoff_gate ? executionGates.handoff_gate.next_action : "Prepare the handoff gate before execution.");
  if (!executionGates.source_control_gate || executionGates.source_control_gate.status !== "ready") appendBlocker("source-control-gate-blocked", "source_control", executionGates.source_control_gate && executionGates.source_control_gate.blockers.length ? executionGates.source_control_gate.blockers[0] : "Source control gate is not ready.", executionGates.source_control_gate ? executionGates.source_control_gate.next_action : "Confirm the source-control mode before execution.");
  if (!executionAllowed) appendBlocker("execution-blocked", "task", "Execution is blocked until the planning gates pass.", "Finish the next blocked stage before execution.");
  const stageOrder = [...VIBER_PIPELINE_STAGE_ORDER];
  const stageGroups = Object.fromEntries(Object.entries(VIBER_PIPELINE_STAGE_GROUPS).map(([group, items]) => [group, [...items]]));
  const stageIndex = (stage) => stageOrder.indexOf(stage);
  const stageGroupFor = (stage) => {
    const entry = Object.entries(stageGroups).find(([, items]) => Array.isArray(items) && items.includes(stage));
    return entry ? entry[0] : "planning";
  };
  const docsGateForStage = (stage) => docsDesignGates && docsDesignGates[stage] ? docsDesignGates[stage] : null;
  const docsGateStageOutput = (stage, readyText, blockedText, nextActionText) => {
    const gate = docsGateForStage(stage);
    const normalizedStatus = gate ? String(gate.status || "").trim().toLowerCase() : "unknown";
    const outputs = gate ? [normalizedStatus === "not_applicable" ? `${formatViberPipelineStageTitle(stage)} is not applicable for this method.` : `${formatViberPipelineStageTitle(stage)} status: ${gate.status}.`] : [blockedText];
    const blockersForStage = normalizedStatus === "blocked" || normalizedStatus === "missing" || normalizedStatus === "planned" ? [gate && gate.missing_docs && gate.missing_docs.length ? `Missing docs: ${gate.missing_docs.join(", ")}` : blockedText] : [];
    const warningsForStage = normalizedStatus === "deferred" || normalizedStatus === "not_applicable" ? [gate && gate.next_action ? gate.next_action : nextActionText] : [];
    const nextAction = gate && gate.next_action ? gate.next_action : nextActionText;
    return stageOutput(stage, outputs, blockersForStage, warningsForStage, nextAction);
  };
  const stageOutput = (stage, outputs, blockersForStage, warningsForStage, nextAction, required = true) => buildViberPipelineStageRecord(stage, stage === "idea"
    ? "complete"
    : stage === "questionnaire_generation"
      ? questionnaire.generated ? "complete" : "planned"
      : stage === "questionnaire_answers"
        ? questionnaireComplete ? "complete" : questionMissing ? "blocked" : "planned"
        : stage === "answer_completeness_check"
          ? answerCompletenessStatus
          : stage === "brief_generation"
            ? briefGenerationStatus
            : stage === "brief_review"
              ? briefReviewStatus
              : stage === "brief_approval"
                ? briefApprovalStatus
                : stage === "state_resync"
                  ? stateResyncStatus
                  : stage === "current_state_report"
                    ? currentStateReportStatus
                    : stage === "app_boundary"
                      ? appBoundaryStageStatus
                      : stage === "documentation_architecture"
                        ? documentationArchitectureStatus
                        : stage === "documentation_folders"
                          ? documentationFoldersStatus
                          : stage === "documentation_files"
                            ? documentationFilesStatus
                            : stage === "system_design"
                              ? systemDesignStatus
                              : stage === "database_design"
                                ? databaseDesignStatus
                                : stage === "ui_ux_design"
                                  ? uiUxDesignStatus
                                  : stage === "source_control_plan"
                                    ? sourceControlPlanStatus
                                    : stage === "security_plan"
                                      ? securityPlanStatus
                                      : stage === "version_plan"
                                        ? versionPlanStatus
                                        : stage === "evolutions"
                                          ? evolutionsStatus
                                          : stage === "evolution_order_validation"
                                            ? evolutionOrderValidationStatus
                                            : stage === "task_punches"
                                              ? taskPunchesStatus
                                              : stage === "task_punch_review"
                                                ? taskPunchReviewStatus
                                                : stage === "approval"
                                                  ? (approvalReady ? "approved" : "blocked")
                                                  : stage === "materialization"
                                                    ? (materialized ? "materialized" : "blocked")
                                                    : stage === "codex_prompt"
                                                      ? (codexPromptStatus ? "ready" : "blocked")
                                                      : stage === "security_gate"
                                                        ? (executionGates.security_gate.status === "passed" ? "complete" : "blocked")
                                                      : stage === "handoff_gate"
                                                          ? (executionGates.handoff_gate.status === "passed" ? "complete" : "blocked")
                                                      : stage === "source_control_gate"
                                                            ? (executionGates.source_control_gate.status === "ready" ? "complete" : "blocked")
                                                            : stage === "execution"
                                                              ? executionStatus
                                                              : stage === "validation"
                                                                ? (executionAllowed ? validationStatus : "blocked")
                                                              : stage === "security_scan"
                                                                  ? securityScanStatus
                                                                  : stage === "handoff"
                                                                    ? handoffStatus
                                                                    : stage === "dashboard_update"
                                                                      ? dashboardUpdateStatus
                                                                      : stage === "learning_capture"
                                                                        ? learningCaptureStatus
                                                                        : stage === "closeout"
                                                                          ? closeoutStatus
                                                                          : "unknown", stageGroupFor(stage), stageIndex(stage) + 1, outputs, blockersForStage, warningsForStage, nextAction, required);
  const stages = [
    stageOutput("idea", [idea || "Raw request captured."], [], [], "Confirm the raw idea before planning."),
    stageOutput("questionnaire_generation", [questionnaire.generated ? "Questionnaire generated." : "Questionnaire not generated yet."], questionnaire.generated ? [] : ["Generate the questionnaire before planning proceeds."], [], questionnaire.generated ? "Questionnaire generation is complete." : "Run kvdf questionnaire plan to generate the intake questions."),
    stageOutput("questionnaire_answers", [questionnaire.answers_total > 0 ? `${questionnaire.answers_total} answer(s) recorded.` : "No questionnaire answers recorded."], questionMissing ? ["Questionnaire answers are incomplete."] : [], questionMissing ? ["Answer the remaining questionnaire items."] : [], questionMissing ? "Answer the remaining questionnaire items." : "Questionnaire answers are recorded."),
    stageOutput("answer_completeness_check", [questionnaire.complete ? "All questionnaire answers are complete." : "Questionnaire answers still need completion."], questionnaire.complete ? [] : ["Answer completeness must pass before a brief can be approved."], [], questionnaire.complete ? "Answer completeness check passed." : "Complete the questionnaire answers before planning further."),
    stageOutput("brief_generation", [brief.status !== "missing" ? `Brief status: ${brief.status}.` : "Brief not generated yet."], brief.status === "missing" ? ["Generate the brief from the questionnaire."] : [], [], brief.next_action || "Generate the brief." , true),
    stageOutput("brief_review", [brief.status !== "missing" ? `Brief review status: ${brief.status}.` : "Brief review not started."], brief.status === "blocked" ? ["The brief cannot be reviewed until answers are complete."] : [], brief.status === "draft" ? ["Review the brief before approval."] : [], brief.next_action || "Review the brief before approval."),
    stageOutput("brief_approval", [brief.approved ? "Brief approved." : "Brief pending approval."], brief.approved ? [] : ["No approved brief means no evolutions."], [], brief.approved ? "Brief approval recorded." : "Approve the brief before evolutions."),
    stageOutput("state_resync", [stateFresh ? "State resync is current." : "State resync is stale or missing."], stateFresh ? [] : ["State Resync must be current before planning proceeds."], [], stateResync && stateResync.next_action ? stateResync.next_action : "Run kvdf state resync --track vibe --json."),
    stageOutput("current_state_report", [stateResync && stateResync.report_type ? stateResync.report_type : "Current-state report missing."], stateResync && stateResync.report ? [] : ["Current-state report is required before final planning."], [], stateResync && stateResync.reason ? stateResync.reason : "Generate the current-state report."),
    stageOutput("app_boundary", [boundaryReady ? `App boundary approved for ${appSlug}.` : "App boundary not approved."], boundaryReady ? [] : ["The app boundary must be approved before app-scoped docs or tasks are generated."], [], boundaryReady ? "App boundary is approved." : "Approve the app boundary first."),
    docsGateStageOutput("documentation_architecture", "Documentation architecture is available.", "Documentation architecture is missing.", "Define the documentation architecture."),
    docsGateStageOutput("documentation_folders", "Documentation folders are materialized.", "Documentation folders are missing.", "Materialize the foldered planner docs."),
    docsGateStageOutput("documentation_files", "Documentation files are mapped.", "Documentation files are missing.", "Derive the compatibility file list from the folders."),
    docsGateStageOutput("system_design", "System design is present.", "System design missing.", "Create the system design."),
    docsGateStageOutput("database_design", "Database design is present.", "Database design missing.", "Create the database design."),
    docsGateStageOutput("ui_ux_design", "UI/UX design is present.", "UI/UX design missing.", "Create the UI/UX design."),
    stageOutput("source_control_plan", [sourceControl && sourceControl.mode ? `Source control mode: ${sourceControl.mode}.` : "Source control plan missing."], sourceControlPlanReady ? [] : ["Source control mode must be explicit before execution."], [], sourceControlPlanReady ? "Source control plan is ready." : "Choose the source-control mode."),
    stageOutput("security_plan", [securityPlanReady ? "Security plan is present." : "Security plan missing."], securityPlanReady ? [] : ["Security planning must be explicit before execution."], [], securityPlanReady ? "Security plan is ready." : "Create the security plan."),
    stageOutput(
      "version_plan",
      [versionEvolutionGates.version_plan.status === "approved" ? "Version plan approved." : `Version plan status: ${versionEvolutionGates.version_plan.status}.`],
      ["blocked", "missing"].includes(String(versionEvolutionGates.version_plan.status || "").toLowerCase())
        ? [Array.isArray(versionEvolutionGates.version_plan.blocking_errors) && versionEvolutionGates.version_plan.blocking_errors.length ? versionEvolutionGates.version_plan.blocking_errors[0] : "Version plan is not ready."]
        : [],
      Array.isArray(versionEvolutionGates.version_plan.warnings) ? [...versionEvolutionGates.version_plan.warnings] : [],
      versionEvolutionGates.version_plan.next_action || "Create or review the version plan."
    ),
    stageOutput("evolutions", [evolutionsReady ? `${evolutions.length} evolution(s) prepared.` : "Evolutions missing."], evolutionsReady ? [] : ["Evolutions must be approved before task punches."], [], evolutionsReady ? "Evolutions are ready." : "Create the evolutions."),
    stageOutput("evolution_order_validation", [evolutionValidation.task_generation_allowed ? "Evolution order validation passed." : "Evolution order validation failed."], evolutionValidation.task_generation_allowed ? [] : uniqueList(evolutionValidation.blocking_errors || ["Invalid evolution order."]), evolutionValidation.warnings || [], evolutionValidation.next_action || "Validate the evolution order."),
    stageOutput("task_punches", [taskPunchesReady ? `${taskPunches.length} task punch(es) prepared.` : "Task punches missing."], taskPunchesReady ? [] : ["Task punches are blocked until evolution order validation passes."], [], taskPunchesReady ? "Task punches are ready." : "Create the task punches."),
    stageOutput("task_punch_review", [taskPunchReviewReady ? "Task punch review complete." : "Task punch review pending."], taskPunchReviewReady ? [] : ["Review the task punches before approval."], [], taskPunchReviewReady ? "Task punch review is complete." : "Review the task punches."),
    stageOutput("approval", [approvalReady ? "Plan approved." : "Plan pending approval."], approvalReady ? [] : ["Approval is required before materialization."], [], approvalReady ? "Approval is recorded." : "Approve the brief and ordered plan."),
    stageOutput("materialization", [materialized ? "Plan materialized." : "Plan not materialized."], materialized ? [] : ["Materialization must happen before the Codex prompt."] , [], materialized ? "Materialization is complete." : "Materialize the approved plan."),
    stageOutput("codex_prompt", [codexPromptStatus ? "Codex prompt can be generated." : "Codex prompt blocked."], codexPromptStatus ? [] : ["No materialized task punch means no Codex execution."], [], codexPromptStatus ? "Generate the Codex prompt." : "Do not prompt Codex for execution yet."),
    stageOutput("security_gate", [executionGates.security_gate.status === "passed" ? "Security gate passes." : "Security gate blocked or pending."], executionGates.security_gate.status === "passed" ? [] : (executionGates.security_gate.blockers.length ? [...executionGates.security_gate.blockers] : ["Security gate must pass before execution."]), executionGates.security_gate.warnings || [], executionGates.security_gate.next_action || "Resolve the security gate."),
    stageOutput("handoff_gate", [executionGates.handoff_gate.status === "passed" ? "Handoff gate passes." : "Handoff gate blocked or pending."], executionGates.handoff_gate.status === "passed" ? [] : (executionGates.handoff_gate.blockers.length ? [...executionGates.handoff_gate.blockers] : ["Handoff gate must pass before execution."]), executionGates.handoff_gate.warnings || [], executionGates.handoff_gate.next_action || "Prepare the handoff gate."),
    stageOutput("source_control_gate", [executionGates.source_control_gate.status === "ready" ? "Source control gate passes." : "Source control gate blocked or pending."], executionGates.source_control_gate.status === "ready" ? [] : (executionGates.source_control_gate.blockers.length ? [...executionGates.source_control_gate.blockers] : ["Source control mode must be explicit before execution."]), executionGates.source_control_gate.warnings || [], executionGates.source_control_gate.next_action || "Confirm the source-control mode."),
    stageOutput("execution", [executionAllowed ? "Task execution can start." : "Task execution is blocked."], executionAllowed ? [] : ["Execution cannot start from a raw idea."], [], executionAllowed ? "Execute the approved task punch." : "Complete the next planning stage only."),
    stageOutput("validation", [executionAllowed ? "Validation can run after execution." : "Validation is pending execution."], executionAllowed ? [] : ["Validation follows execution."], executionGates.validation_gate.warnings || [], executionGates.validation_gate.next_action || (executionAllowed ? "Run validation after execution." : "Complete execution first.")),
    stageOutput("security_scan", [executionAllowed ? "Security scan can run." : "Security scan is pending execution."], executionAllowed ? [] : ["Security scan follows execution."], [], executionAllowed ? "Run the security scan." : "Complete execution first."),
    stageOutput("handoff", [executionAllowed ? "Handoff can proceed." : "Handoff is pending execution."], executionAllowed ? [] : ["Handoff follows security and validation gates."], [], executionAllowed ? "Prepare the handoff." : "Complete execution first."),
    stageOutput("dashboard_update", [executionAllowed ? "Dashboards can be updated." : "Dashboard update is pending."], executionAllowed ? [] : ["Dashboard update follows handoff."], [], executionAllowed ? "Refresh the dashboards." : "Complete the handoff first."),
    stageOutput("learning_capture", [executionAllowed ? "AI learning capture can run." : "Learning capture is pending."], executionAllowed ? [] : ["Learning capture follows handoff."], [], executionAllowed ? "Capture the learning." : "Complete the handoff first."),
    stageOutput("closeout", [executionAllowed ? "Closeout can happen after learning capture." : "Closeout is pending."], executionAllowed ? [] : ["Closeout is the final stage."], [], executionAllowed ? "Close out the pipeline." : "Complete the earlier stages first.")
  ];
  const blockedStages = stages.filter((stage) => stage.status === "blocked");
  const warningStages = stages.flatMap((stage) => Array.isArray(stage.warnings) ? stage.warnings : []);
  const executionGateStages = new Set(["security_gate", "handoff_gate", "source_control_gate", "execution", "validation", "security_scan", "handoff"]);
  const firstBlockedExecutionStage = stages.find((stage) => executionGateStages.has(stage.stage) && stage.status === "blocked") || null;
  const nextStage = executionGates.status === "blocked"
    ? firstBlockedExecutionStage || stages.find((stage) => !["complete", "approved", "materialized", "ready"].includes(stage.status)) || stages[stages.length - 1]
    : stages.find((stage) => !["complete", "approved", "materialized", "ready"].includes(stage.status)) || stages[stages.length - 1];
  const readinessStatus = blockedStages.length || docsDesignGates.status === "blocked"
    ? "blocked"
    : warningStages.length || docsDesignGates.status === "warning"
      ? "warning"
      : executionAllowed
        ? "ready"
        : "warning";
  const readinessNextAction = blockedStages.length
    ? blockedStages[0].next_action || "Resolve the first blocked stage."
    : docsDesignGates.status === "blocked"
      ? docsDesignGates.next_action || "Resolve the first blocked docs/design gate."
      : docsDesignGates.status === "warning"
        ? docsDesignGates.next_action || "Review the docs/design gates before execution."
    : executionAllowed
      ? "Run kvdf planner prompt --from-current --json, then execute the approved task punch."
      : nextStage && nextStage.next_action
        ? nextStage.next_action
        : "Complete the next planning stage.";
  const planningAuthorityLevel = executionAllowed
    ? "approved"
    : questionnaireComplete && questionnaire.generated && stateFresh && !briefApproved
      ? "draft"
      : "placeholder";
  const planningAuthorityReason = executionAllowed
    ? "The Viber pipeline has an approved brief, a valid evolution order, materialized task punches, and passing execution gates."
    : planningAuthorityLevel === "draft"
      ? "Questionnaire answers exist and the brief is still draft or reviewed, so planning can continue but execution remains blocked."
      : "Raw idea planning is still waiting on questionnaire answers, brief approval, or state resync evidence.";
  return {
    questionnaire,
    brief,
    planning_method: planningMethodPolicy.method,
    method_policy: planningMethodPolicy,
    planning_authority: {
      level: planningAuthorityLevel,
      reason: planningAuthorityReason,
      current_version: versionControl && versionControl.current_version ? versionControl.current_version.version_id || versionControl.current_version.title || null : null,
      next_version: versionControl && versionControl.next_version ? versionControl.next_version.version_id || versionControl.next_version.title || null : null,
      current_evolution: evolutionsReady ? evolutions[0] && (evolutions[0].evolution_id || evolutions[0].title || null) : null,
      next_evolution: evolutionsReady && evolutions[1] ? evolutions[1].evolution_id || evolutions[1].title || null : null,
      state_freshness: stateResync && stateResync.state_freshness ? stateResync.state_freshness : "unknown",
      source_of_truth: "file_first"
    },
    stage_order: [...stageOrder],
    stage_groups: stageGroups,
    stages,
    docs_design_gates: docsDesignGates,
    version_evolution_gates: versionEvolutionGates,
    execution_gates: executionGates,
    readiness: {
      status: readinessStatus,
      blocked_total: blockedStages.length,
      warnings_total: warningStages.length,
      next_action: readinessNextAction
    },
    execution_allowed: executionAllowed,
    execution_blockers: blockers.map((blocker, index) => ({
      ...blocker,
      id: blocker.id || `viber-stage-blocker-${String(index + 1).padStart(2, "0")}`
    })),
    next_stage: nextStage ? nextStage.stage : "execution",
    evolution_order_validation: evolutionValidation,
    state_resync: stateResync || null,
    questionnaire_state: questionnaire,
    brief_state: brief
  };
}

function buildViberPipelineStages({
  idea = "",
  stateResync = null,
  deliveryMode = "local_first",
  docsPlan = null,
  docsStatusValue = "unknown",
  docsReady = false,
  designArtifacts = null,
  visualPlanning = null,
  versionPlan = null,
  versionControl = null,
  evolutions = [],
  taskPunches = [],
  currentPlan = null,
  taskPunch = null,
  sourceControl = null,
  pluginContext = null,
  executionAllowed = false,
  securityPass = false,
  securityBlocked = false
} = {}) {
  const currentPlanStatus = String(currentPlan && currentPlan.status || "").trim().toLowerCase();
  const materializationStatus = String(currentPlan && (currentPlan.materialization_status || "") || "").trim().toLowerCase();
  const approvalsStatus = ["approved", "materialized", "completed"].includes(currentPlanStatus) ? "approved" : "planned";
  const materializedStatus = materializationStatus === "materialized" ? "materialized" : approvalsStatus === "approved" ? "ready" : "planned";
  const completedState = stateResync && stateResync.fresh ? "complete" : "blocked";
  const currentStateReportStatus = stateResync && stateResync.report ? (stateResync.fresh ? "complete" : "warning") : "blocked";
  const docsStageStatus = docsReady ? "ready" : docsStatusValue === "missing" ? "blocked" : "planned";
  const designStatus = (item) => item ? "ready" : "planned";
  const executionStageStatus = executionAllowed ? "ready" : "blocked";
  const securityStageStatus = securityBlocked ? "blocked" : (securityPass ? "ready" : "planned");
  const stageState = (stage, status, outputs = [], blockers = [], warnings = [], nextAction = "", required = true) => ({
    stage,
    status,
    required,
    outputs: Array.isArray(outputs) ? outputs : [],
    blockers: Array.isArray(blockers) ? blockers : [],
    warnings: Array.isArray(warnings) ? warnings : [],
    next_action: nextAction || ""
  });
  const docsOutputs = [
    docsReady ? "Documentation files are available." : "Documentation files are pending.",
    stateResync && stateResync.report ? "Current-state report available." : "Current-state report missing."
  ];
  const systemDesignOutputs = designArtifacts && designArtifacts.system_design && Array.isArray(designArtifacts.system_design.architecture_overview)
    ? [...designArtifacts.system_design.architecture_overview]
    : ["System design pending."];
  const databaseOutputs = designArtifacts && designArtifacts.database_design && Array.isArray(designArtifacts.database_design.entities)
    ? [...designArtifacts.database_design.entities]
    : ["Database design pending."];
  const uiUxOutputs = designArtifacts && designArtifacts.ui_ux_design && Array.isArray(designArtifacts.ui_ux_design.surfaces)
    ? [...designArtifacts.ui_ux_design.surfaces]
    : ["UI/UX design pending."];
  const versionOutputs = Array.isArray(versionPlan && versionPlan.versions) && versionPlan.versions.length
    ? versionPlan.versions.map((version) => version.version_id || version.title || "version")
    : ["Version plan pending."];
  const evolutionOutputs = Array.isArray(evolutions) && evolutions.length
    ? evolutions.map((evolution) => evolution.evolution_id || evolution.title || "evolution")
    : ["Evolution slice pending."];
  const taskOutputs = Array.isArray(taskPunches) && taskPunches.length
    ? taskPunches.flatMap((item) => Array.isArray(item.tasks) ? item.tasks.map((task) => task.title || task.id || "task") : [])
    : Array.isArray(taskPunch && taskPunch.tasks) ? taskPunch.tasks.map((task) => task.title || task.id || "task") : ["Task punch pending."];
  const stages = [
    stageState("idea", "complete", [idea || "Raw request captured."], [], [], "Confirm the request before planning."),
    stageState("state_resync", completedState, [stateResync && stateResync.state_freshness ? `State freshness: ${stateResync.state_freshness}` : "State freshness unknown."], stateResync && stateResync.state_freshness === "current" ? [] : ["Run state resync before execution."], stateResync && stateResync.reasons ? stateResync.reasons.map((item) => String(item)) : [], stateResync && stateResync.fresh ? "Current-state evidence is fresh." : "Run kvdf state resync --track vibe --json."),
    stageState("current_state_report", currentStateReportStatus, [stateResync && stateResync.report_type ? stateResync.report_type : "kvdf_current_state_report"], stateResync && stateResync.report ? [] : ["Current-state report is missing."], stateResync && Array.isArray(stateResync.reasons) ? stateResync.reasons.map((item) => String(item)) : [], stateResync && stateResync.report ? "Review the current-state report before planning further." : "Generate the current-state report."),
    stageState("documentation_files", docsStageStatus, docsOutputs, docsReady ? [] : ["Documentation files are missing or unconfirmed."], docsReady ? [] : ["Current docs must be file-first and complete."], docsReady ? "Docs are ready for planning." : "Create or refresh the documentation file map."),
    stageState("system_design", designStatus(designArtifacts && designArtifacts.system_design), systemDesignOutputs, designArtifacts && designArtifacts.system_design ? [] : ["System design is missing."], [], designArtifacts && designArtifacts.system_design ? "System design is ready." : "Create the system design."),
    stageState("database_design", designStatus(designArtifacts && designArtifacts.database_design), databaseOutputs, designArtifacts && designArtifacts.database_design ? [] : ["Database design is missing."], [], designArtifacts && designArtifacts.database_design ? "Database design is ready." : "Create the database design."),
    stageState("ui_ux_design", designStatus(designArtifacts && designArtifacts.ui_ux_design), uiUxOutputs, designArtifacts && designArtifacts.ui_ux_design ? [] : ["UI/UX design is missing."], [], designArtifacts && designArtifacts.ui_ux_design ? "UI/UX design is ready." : "Create the UI/UX design."),
    stageState("visual_planning", visualPlanning ? "ready" : "planned", visualPlanning && visualPlanning.graph ? ["Mermaid visual model available."] : ["Visual planning pending."], visualPlanning ? [] : ["Visual planning is missing."], [], visualPlanning ? "Visual planning is ready." : "Create the visual planning model."),
    stageState("version_plan", versionPlan && Array.isArray(versionPlan.versions) && versionPlan.versions.length ? "ready" : "planned", versionOutputs, versionPlan && Array.isArray(versionPlan.versions) && versionPlan.versions.length ? [] : ["Version plan is missing."], [], versionPlan && Array.isArray(versionPlan.versions) && versionPlan.versions.length ? "Version plan is ready." : "Create the version plan."),
    stageState("evolutions", Array.isArray(evolutions) && evolutions.length ? "ready" : "planned", evolutionOutputs, Array.isArray(evolutions) && evolutions.length ? [] : ["Evolutions are missing."], [], Array.isArray(evolutions) && evolutions.length ? "Evolutions are ready." : "Create the governed evolutions."),
    stageState("task_punches", Array.isArray(taskPunches) && taskPunches.length ? "ready" : "planned", taskOutputs, Array.isArray(taskPunches) && taskPunches.length ? [] : ["Task punches are missing."], [], Array.isArray(taskPunches) && taskPunches.length ? "Task punches are ready." : "Create the Codex-ready task punches."),
    stageState("approval", approvalsStatus, [currentPlanStatus || "proposed"], approvalsStatus === "approved" ? [] : ["The plan is not approved yet."], [], approvalsStatus === "approved" ? "Approval is recorded." : "Approve the plan before execution."),
    stageState("materialization", materializedStatus, [materializationStatus || "not_materialized"], materializedStatus === "materialized" ? [] : ["The plan is not materialized yet."], [], materializedStatus === "materialized" ? "Materialization is complete." : "Materialize the approved plan."),
    stageState("codex_prompt", executionAllowed ? "ready" : "blocked", [executionAllowed ? "Codex execution can start." : "Codex execution remains blocked."], executionAllowed ? [] : ["Planning/design/materialization must happen before Codex execution."], executionAllowed ? [] : ["Use the next planning stage only."], executionAllowed ? "Generate the execution prompt." : "Do not prompt Codex for execution yet."),
    stageState("execution", executionAllowed ? "ready" : "blocked", [executionAllowed ? "Task execution can start." : "Task execution is blocked."], executionAllowed ? [] : ["Execution is not allowed yet."], executionAllowed ? [] : ["Keep the app implementation untouched for now."], executionAllowed ? "Execute the approved task punch." : "Complete the next planning stage only."),
    stageState("validation", executionAllowed ? "ready" : "planned", executionAllowed ? [...DEFAULT_VALIDATION_COMMANDS] : ["Validation waits for execution readiness."], executionAllowed ? [] : ["Validation follows execution readiness."], [], executionAllowed ? "Run validation after execution." : "Plan validation after execution readiness."),
    stageState("security", securityStageStatus, [securityPass ? "Security gate is passing." : securityBlocked ? "Security gate is blocked." : "Security gate is pending."], securityBlocked ? ["Security gate blocks execution."] : [], securityPass ? [] : ["Security readiness is not yet confirmed."], securityPass ? "Security is ready." : "Review the security gate."),
    stageState("handoff", executionAllowed ? "ready" : "planned", [sourceControl && sourceControl.mode ? `Source control mode: ${sourceControl.mode}` : "Source control mode not set."], executionAllowed ? [] : ["Handoff waits for execution readiness."], [], executionAllowed ? "Prepare the handoff." : "Prepare the handoff after execution readiness."),
    stageState("dashboard_update", executionAllowed ? "ready" : "planned", ["Owner and Viber dashboards should reflect the latest readiness state."], executionAllowed ? [] : ["Dashboard updates wait for execution readiness."], [], executionAllowed ? "Refresh the dashboards." : "Refresh dashboards after readiness is met."),
    stageState("learning_capture", executionAllowed ? "ready" : "planned", ["Capture AI learning from execution and handoff."], executionAllowed ? [] : ["Learning capture waits for execution and handoff."], [], executionAllowed ? "Capture the learning after handoff." : "Capture learning after the next safe execution stage.")
  ];
  const nextStage = stages.find((stage) => !["complete", "ready", "approved", "materialized"].includes(stage.status)) || stages[stages.length - 1] || { stage: "execution" };
  const blockedCount = stages.filter((stage) => stage.status === "blocked").length;
  const warningCount = stages.reduce((count, stage) => count + (Array.isArray(stage.warnings) ? stage.warnings.length : 0), 0);
  return {
    report_type: "kvdf_viber_planning_to_task_pipeline",
    track: "vibe_app_developer",
    delivery_mode: deliveryMode,
    source_of_truth: "file_first",
    source_control: sourceControl,
    stages,
    readiness: {
      status: blockedCount ? "blocked" : warningCount ? "warning" : executionAllowed ? "ready" : "warning",
      blocked_total: blockedCount,
      warnings_total: warningCount,
      next_action: blockedCount
        ? stages.find((stage) => stage.status === "blocked")?.next_action || "Resolve the first blocked stage."
        : executionAllowed
          ? "Run kvdf planner prompt --from-current --json, then execute the approved task punch."
          : nextStage.next_action || "Complete the next planning stage."
    },
    execution_allowed: executionAllowed,
    execution_blockers: stages.filter((stage) => stage.status === "blocked").map((stage) => ({
      id: `${stage.stage}-blocked`,
      severity: "blocker",
      area: pipelineStageToArea(stage.stage),
      message: stage.blockers && stage.blockers.length ? stage.blockers[0] : `${stage.stage} is blocked.`,
      next_action: stage.next_action || `Resolve the ${stage.stage} blocker.`
    })),
    next_stage: nextStage.stage || "execution",
    forbidden_files: [...VIBE_FORBIDDEN_FILES],
    allowed_files: [],
    docs_status: docsStatusValue,
    docs_plan: docsPlan || null,
    documentation_folders: Array.isArray(docsPlan && docsPlan.documentation_folders) ? docsPlan.documentation_folders.map((folder) => ({
      ...folder,
      files: Array.isArray(folder.files) ? folder.files.map((file) => ({ ...file })) : []
    })) : [],
    documentation_files: Array.isArray(docsPlan && docsPlan.documentation_files) ? [...docsPlan.documentation_files] : [],
    portable_docs_mapping: Array.isArray(docsPlan && docsPlan.portable_docs_mapping) ? docsPlan.portable_docs_mapping.map((mapping) => ({
      ...mapping,
      canonical_docs: Array.isArray(mapping.canonical_docs) ? [...mapping.canonical_docs] : []
    })) : [],
    design_artifacts: designArtifacts || null,
    visual_planning: visualPlanning || null,
    version_plan: versionPlan || null,
    version_control: versionControl || null,
    evolutions: Array.isArray(evolutions) ? evolutions : [],
    task_punches: Array.isArray(taskPunches) ? taskPunches : [],
    cloud_ready: false,
    consent_required: true,
    owner_approved_for_cloud: false,
    anonymized: true,
    sensitive_items_removed: 0,
    dataset_tags: [],
    training_eligible: false,
    plugin_context: pluginContext || null
  };
}

function pipelineStageToArea(stage) {
  if (stage === "state_resync" || stage === "current_state_report") return "state_resync";
  if ([
    "questionnaire_generation",
    "questionnaire_answers",
    "answer_completeness_check",
    "brief_generation",
    "brief_review",
    "brief_approval",
    "app_boundary",
    "documentation_architecture",
    "documentation_folders",
    "documentation_files",
    "system_design",
    "database_design",
    "ui_ux_design"
  ].includes(stage)) {
    return "docs";
  }
  if (["source_control_plan", "source_control_gate"].includes(stage)) return "source_control";
  if (["security_plan", "security_gate", "security_scan"].includes(stage)) return "security";
  if (["validation"].includes(stage)) return "validation";
  if (["handoff_gate", "handoff"].includes(stage)) return "handoff";
  if ([
    "version_plan",
    "evolutions",
    "evolution_order_validation",
    "task_punches",
    "task_punch_review",
    "approval",
    "materialization",
    "codex_prompt",
    "execution",
    "dashboard_update",
    "learning_capture",
    "closeout"
  ].includes(stage)) {
    return "task";
  }
  return "docs";
}

function buildIdeaToEvolutionDocumentationFiles(mode, pluginContext) {
  if (mode === "vibe") {
    return [
      "workspaces/apps/<app-slug>/docs/",
      "workspaces/apps/<app-slug>/requirements/",
      "workspaces/apps/<app-slug>/system-design/",
      "workspaces/apps/<app-slug>/database-design/",
      "workspaces/apps/<app-slug>/ui-ux-design/",
      "workspaces/apps/<app-slug>/handoff/",
      "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
      "docs/workflows/KVDF_LED_DELIVERY.md"
    ];
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    const pluginRoot = path.relative(repoRoot(), getPluginSourcePath(pluginId)).replace(/\\/g, "/");
    return [
      `${pluginRoot}/docs/`,
      `${pluginRoot}/schemas/`,
      `${pluginRoot}/tests/`,
      `${pluginRoot}/runtime/`,
      `${pluginRoot}/plugin.json`,
      "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
    ];
  }
  return [
    "docs/workflows/IDEA_TO_EVOLUTION_PIPELINE.md",
    "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
    "docs/workflows/PLANNER_SELF_PLANNING_ENGINE.md",
    "docs/workflows/SOURCE_CONTROL_PROVIDER_MODEL.md",
    "knowledge/governance/KVDF_PLANNER_LAYER.md",
    "docs/cli/CLI_COMMAND_REFERENCE.md",
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    "packs/planner/codex-execution.prompt.md",
    "packs/planner/evolution-planner.prompt.md",
    "packs/planner/idea-to-evolution.prompt.md",
    "schemas/planner/idea-to-evolution-pipeline.schema.json",
    "schemas/planner/design-artifacts.schema.json",
    "schemas/planner/version-plan.schema.json",
    "tests/cli.integration.test.js"
  ];
}

function buildIdeaToEvolutionDesignArtifacts(idea, mode, context, pluginContext, sourceControl) {
  return {
    system_design: {
      architecture_overview: mode === "vibe"
        ? [
          `Use local-first delivery for ${idea}.`,
          "Keep intake, design, evolution, and handoff artifacts in the app workspace.",
          "Use KVDF Core only when explicitly approved for framework work."
        ]
        : mode === "plugin"
          ? [
            `Use manifest-driven plugin delivery for ${pluginContext ? pluginContext.plugin_id : "plugin"}.`,
            "Keep runtime, docs, schemas, and tests in parity.",
            "Treat the plugin bundle as removable and isolated from unrelated plugins."
          ]
          : [
            `Use direct-to-main KVDF Core delivery for ${idea}.`,
            "Keep planner, evolution, task, docs, schemas, and validation surfaces aligned.",
            "Treat KVDOS and runtime state as forbidden unless explicitly required."
          ],
      modules: mode === "vibe"
        ? ["questionnaire", "blueprint", "system design", "database design", "ui/ux design", "handoff"]
        : mode === "plugin"
          ? ["plugin manifest", "runtime entrypoint", "docs", "schemas", "tests", "install/uninstall checks"]
          : ["planner", "evolution", "task punch", "visual planning", "source control", "validation"],
      boundaries: mode === "vibe"
        ? ["Do not edit KVDF Core by default.", "Do not cross into unrelated products or workspaces.", "GitHub remains optional."]
        : mode === "plugin"
          ? ["Do not touch unrelated plugins.", "Protect .kabeeri/plugin-links/.", "Keep mount and runtime state local."]
          : ["Do not touch KVDOS.", "Do not commit .kabeeri/ runtime state.", "Branch/PR stays optional."],
      integrations: mode === "vibe"
        ? ["App workspace docs", "Visual planning model", "Optional GitHub mirroring", "Dashboard/reporting later"]
        : mode === "plugin"
          ? ["Plugin loader", "Plugin mount state", "Optional provider plugins", "CLI docs and tests"]
          : ["Planner runtime", "Evolution runtime", "Task runtime", "Source control provider model", "Visual planner renderer plugin"],
      risks: mode === "vibe"
        ? ["Scope drift into owner-track work", "Branch/PR accidentally becoming mandatory", "Workspace boundary leakage"]
        : mode === "plugin"
          ? ["Unrelated plugin edits", "Plugin mount state drift", "Manifest/runtime/docs/test mismatch"]
          : ["KVDOS leakage", "Runtime state commits", "Branch/PR defaulting in KVDF Core"],
      source_control_assumptions: [
        `Planner source control mode: ${sourceControl.mode || "local_only"}.`,
        `Provider: ${sourceControl.provider || "none"}.`,
        `Remote provider: ${sourceControl.remote_provider || "none"}.`,
        `Default branch: ${sourceControl.default_branch || "main"}.`
      ],
      runtime_state_boundaries: mode === "plugin"
        ? [".kabeeri/", ".kabeeri/plugin-links/", ".kabeeri/plugins.json"]
        : mode === "vibe"
          ? [".kabeeri/", ".kabeeri/questionnaires/", ".kabeeri/interactions/", ".kabeeri/reports/"]
          : [".kabeeri/", ".kabeeri/planner.json", ".kabeeri/evolution.json", ".kabeeri/tasks.json"]
    },
    database_design: mode === "vibe"
      ? {
        entities: [
          { name: "idea", purpose: `Raw request or goal for ${idea}` },
          { name: "intake_plan", purpose: "Captured questionnaire and approved intake" },
          { name: "evolution", purpose: "Milestone slice and version alignment" },
          { name: "task", purpose: "Executable work item beneath the evolution" },
          { name: "handoff", purpose: "Delivery output and closeout record" }
        ],
        relationships: [
          "Idea produces one or more intake plans.",
          "An intake plan can produce multiple evolutions.",
          "Each evolution can produce multiple tasks.",
          "Completed tasks produce a handoff record."
        ],
        persistence_notes: [
          "Persist in the app workspace and local runtime reports.",
          "Keep GitHub sync optional and non-authoritative.",
          "Avoid writing owner-track runtime state unless explicitly approved."
        ],
        migrations_schemas: ["workspace app schemas", "questionnaire schemas", "handoff schemas"],
        not_applicable_reason: null
      }
      : {
        entities: [],
        relationships: [],
        persistence_notes: [
          "The current KVDF Core pipeline is governance and planning oriented.",
          "No new product database is required for the pipeline MVP."
        ],
        migrations_schemas: [],
        not_applicable_reason: "No new database is required for this pipeline MVP."
      },
    ui_ux_design: mode === "vibe"
      ? {
        surfaces: ["questionnaire", "blueprint", "evolution board", "task handoff", "optional dashboard"],
        pages_screens: ["Idea intake", "Design review", "Evolution plan", "Task punch", "Handoff summary"],
        dashboard_visual_needs: ["Track separation", "Milestone progress", "Source control mode", "Next action"],
        accessibility_notes: ["Keep the flow readable in Markdown and CLI output.", "Avoid hiding approval or handoff state."],
        cli_docs_notes: ["Make the app-track pipeline discoverable in CLI help and docs."]
      }
      : mode === "plugin"
        ? {
          surfaces: ["manifest view", "runtime view", "docs view", "schema view", "tests view"],
          pages_screens: ["Plugin goal", "Manifest parity", "Runtime parity", "Docs parity", "Install/uninstall check"],
          dashboard_visual_needs: ["Plugin isolation", "Mount safety", "Lifecycle parity"],
          accessibility_notes: ["Keep plugin scope obvious in Markdown reports."],
          cli_docs_notes: ["Explain that plugin rendering is optional and separate from planner logic."]
        }
        : {
          surfaces: ["CLI", "docs", "schemas", "planner visual model", "materialization report"],
          pages_screens: ["Idea to Evolution plan", "Visual roadmap", "Approval gate", "Materialization summary"],
          dashboard_visual_needs: ["Direct-to-main defaults", "Approval gate", "Source control mode", "Next Evolution"],
          accessibility_notes: ["Make owner-track versus app-track boundaries explicit."],
          cli_docs_notes: ["Document the deterministic owner-track pipeline in CLI help."]
        },
    api_design: {
      commands: mode === "vibe"
        ? ["kvdf vibe", "kvdf planner pipeline --track vibe", "kvdf planner propose --track vibe", "kvdf planner visual --track vibe"]
        : mode === "plugin"
          ? ["kvdf plugins install <plugin>", "kvdf planner pipeline --track plugin", "kvdf planner visual --track plugin"]
          : ["kvdf planner pipeline --track owner", "kvdf planner propose --track owner", "kvdf planner materialize --from-current"],
      integrations: mode === "vibe"
        ? ["questionnaire engine", "blueprint generation", "handoff reports"]
        : mode === "plugin"
          ? ["plugin loader", "plugin mount state", "plugin docs/tests/schema parity"]
          : ["planner runtime", "evolution runtime", "task runtime", "source control provider model"],
      contract_notes: [
        "The planner returns a structured idea-to-evolution pipeline report.",
        "The source control contract stays optional and provider-driven.",
        "Visual planning is reusable by later dashboards or IDE rendering."
      ]
    },
    security_design: {
      boundaries: mode === "vibe"
        ? ["Protect KVDF Core by default.", "Protect unrelated workspaces.", "Keep GitHub optional."]
        : mode === "plugin"
          ? ["Protect unrelated plugins.", "Protect .kabeeri/plugin-links/.", "Keep mount state local."]
          : ["Protect KVDOS.", "Protect .kabeeri/ runtime state.", "Keep branch/PR optional."],
      sensitive_state: mode === "plugin"
        ? [".kabeeri/plugin-links/", ".kabeeri/plugins.json"]
        : [".kabeeri/planner.json", ".kabeeri/evolution.json", ".kabeeri/tasks.json"],
      approval_notes: [
        "Planner proposals are not executable until approved.",
        "Materialization writes runtime records only after approval.",
        "Source control provider choice must remain explicit."
      ]
    }
  };
}

function buildIdeaToEvolutionVersionPlan(idea, mode, deliveryMode, context, pluginContext, sourceControl) {
  const versions = buildIdeaToEvolutionVersionTemplates(mode, idea, context, pluginContext).map((template) => {
    const evolutionPlan = buildPlannerEvolutionPlan(template.goal, { mode, deliveryMode, pluginContext, source_control: sourceControl }, context);
    const evolution = {
      ...evolutionPlan,
      version_id: template.version_id,
      readiness_gate: template.readiness_gate,
      excluded_scope: [...template.excluded_scope],
      source_control: sourceControl,
      source_control_mode: sourceControl.mode,
      next_action: template.next_action
    };
    const taskPunch = buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode, pluginContext, source_control: sourceControl }, context);
    return {
      version_id: template.version_id,
      title: template.title,
      goal: template.goal,
      included_evolutions: [evolution.evolution_id],
      excluded_scope: [...template.excluded_scope],
      readiness_gate: template.readiness_gate,
      source_control_mode: sourceControl.mode,
      evolution,
      task_punch: {
        version_id: template.version_id,
        evolution_id: evolution.evolution_id,
        title: `${template.title} Task Punch`,
        tasks: taskPunch.tasks,
        source_control: sourceControl,
        planner_mode: mode,
        track: evolution.track,
        delivery_mode: deliveryMode
      }
    };
  });
  return { versions };
}

function buildIdeaToEvolutionVersionTemplates(mode, idea, context, pluginContext) {
  if (mode === "vibe") {
    return [
      {
        version_id: "v0.1",
        title: "Vibe Intake Foundation",
        goal: `Document the intake foundation for ${idea}`,
        excluded_scope: ["KVDF Core edits by default", "branch/PR as the default path"],
        readiness_gate: "Request, questions, and answers are documented.",
        next_action: "Review the intake foundation and approve the first app evolution."
      },
      {
        version_id: "v0.2",
        title: "Vibe Design Foundation",
        goal: `Produce system, database, and UI/UX design artifacts for ${idea}`,
        excluded_scope: ["KVDF Core by default", "plugin runtime behavior"],
        readiness_gate: "Design artifacts are sufficient to start implementation.",
        next_action: "Review the design foundation and approve the design evolution."
      },
      {
        version_id: "v0.3",
        title: "Vibe Delivery Flow",
        goal: `Define the app evolution, task slicing, verify, and handoff flow for ${idea}`,
        excluded_scope: ["owner-track framework changes", "unrelated product workspaces"],
        readiness_gate: "Evolution slices and task punches are ready for local-first delivery.",
        next_action: "Review the delivery flow and approve the next app evolution."
      },
      {
        version_id: "v0.4",
        title: "Vibe Source Control Options",
        goal: `Document optional source-control handoff for ${idea}`,
        excluded_scope: ["branch/PR as mandatory", "KVDF Core direct edits"],
        readiness_gate: "Optional source control is documented but not required.",
        next_action: "Review the optional source-control slice and approve if needed."
      },
      {
        version_id: "v1.0",
        title: "Vibe Stable Delivery",
        goal: `Stabilize the local-first delivery workflow for ${idea}`,
        excluded_scope: ["KVDF Core by default", "mandatory branch/PR workflow"],
        readiness_gate: "The app track can repeat the pipeline safely.",
        next_action: "Review stability and approve the final app delivery evolution."
      }
    ];
  }

  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    const pluginName = pluginContext && pluginContext.name ? pluginContext.name : pluginId;
    return [
      {
        version_id: "v0.1",
        title: "Plugin Manifest Foundation",
        goal: `Align the manifest and command surface for ${pluginName}`,
        excluded_scope: ["unrelated plugins", ".kabeeri/plugin-links/"],
        readiness_gate: "The plugin manifest and CLI surface are aligned.",
        next_action: "Review the manifest foundation and approve the first plugin evolution."
      },
      {
        version_id: "v0.2",
        title: "Plugin Runtime Parity",
        goal: `Protect runtime entrypoint and mount state for ${pluginName}`,
        excluded_scope: ["unrelated plugins", "KVDOS files"],
        readiness_gate: "Runtime and mount boundaries are explicit.",
        next_action: "Review runtime parity and approve the runtime evolution."
      },
      {
        version_id: "v0.3",
        title: "Plugin Docs and Tests Parity",
        goal: `Keep docs, schemas, and tests in parity for ${pluginName}`,
        excluded_scope: ["unrelated plugins", ".kabeeri/plugin-links/"],
        readiness_gate: "Docs, schemas, and tests are consistent.",
        next_action: "Review docs/tests parity and approve the parity evolution."
      },
      {
        version_id: "v0.4",
        title: "Plugin Install / Uninstall Validation",
        goal: `Verify reversible lifecycle behavior for ${pluginName}`,
        excluded_scope: ["unrelated plugins", "dashboard rendering"],
        readiness_gate: "Install and uninstall checks pass.",
        next_action: "Review lifecycle validation and approve the lifecycle evolution."
      },
      {
        version_id: "v1.0",
        title: "Plugin Stable Delivery",
        goal: `Stabilize plugin delivery and optional provider flow for ${pluginName}`,
        excluded_scope: ["unrelated plugins", "plugin-link runtime drift"],
        readiness_gate: "The plugin can be delivered repeatedly and safely.",
        next_action: "Review stability and approve the final plugin delivery evolution."
      }
    ];
  }

  return [
    {
      version_id: "v0.1",
      title: "Foundation",
      goal: `Establish the KVDF planning foundation for ${idea}`,
      excluded_scope: ["KVDOS files", ".kabeeri/ runtime state", "branch/PR as default"],
      readiness_gate: "Planner governance and runtime boundaries are documented.",
      next_action: "Review the foundation and approve the first KVDF Core evolution."
    },
    {
      version_id: "v0.2",
      title: "Core Workflow",
      goal: `Define the governed KVDF Core workflow for ${idea}`,
      excluded_scope: ["KVDOS files", "plugin runtime behavior", "dashboard behavior"],
      readiness_gate: "Planner workflow, source control, and approval gates are aligned.",
      next_action: "Review the core workflow and approve the next KVDF Core evolution."
    },
    {
      version_id: "v0.3",
      title: "Visual Planning",
      goal: `Add visual planning and roadmap output for ${idea}`,
      excluded_scope: ["KVDOS files", "app-builder behavior", "dashboard rendering"],
      readiness_gate: "Mermaid, board, scope map, and markdown planning outputs exist.",
      next_action: "Review the visual planning slice and approve the next KVDF Core evolution."
    },
    {
      version_id: "v0.4",
      title: "Materialization",
      goal: `Link approved plans to Evolution and Task Punch runtime records for ${idea}`,
      excluded_scope: ["KVDOS files", ".kabeeri/ runtime state writes without approval"],
      readiness_gate: "Approved plans can become durable runtime records.",
      next_action: "Review materialization and approve the next KVDF Core evolution."
    },
    {
      version_id: "v1.0",
      title: "Stable Delivery",
      goal: `Stabilize direct-to-main KVDF Core delivery for ${idea}`,
      excluded_scope: ["KVDOS files", "mandatory branch/PR workflow", "runtime state commits"],
      readiness_gate: "The owner-track pipeline can be repeated safely.",
      next_action: "Review stability and approve the final KVDF Core evolution."
    }
  ];
}

function buildIdeaToEvolutionVisualRoadmap(versionPlan, sourceControl, mode) {
  const versions = Array.isArray(versionPlan.versions) ? versionPlan.versions : [];
  const [currentVersion, ...futureVersions] = versions;
  return {
    current_version: currentVersion ? {
      version_id: currentVersion.version_id,
      title: currentVersion.title,
      source_control_mode: currentVersion.source_control_mode,
      included_evolutions: currentVersion.included_evolutions
    } : null,
    next_evolution: currentVersion && currentVersion.evolution ? {
      evolution_id: currentVersion.evolution.evolution_id,
      title: currentVersion.evolution.title,
      version_id: currentVersion.version_id,
      source_control_mode: currentVersion.source_control_mode,
      source_control: currentVersion.evolution.source_control || sourceControl || null,
      next_action: currentVersion.next_action
    } : null,
    future_only_evolutions: futureVersions.map((version) => ({
      version_id: version.version_id,
      title: version.title,
      evolution_id: version.evolution && version.evolution.evolution_id ? version.evolution.evolution_id : null,
      source_control_mode: version.source_control_mode
    })),
    blocked_items: futureVersions.map((version) => ({
      version_id: version.version_id,
      title: version.title,
      reason: version.readiness_gate
    })),
    completed_placeholders: [],
    source_control_modes: versions.map((version) => ({
      version_id: version.version_id,
      mode: version.source_control_mode
    })),
    track: mode
  };
}

function renderPlannerPipelineReport(report, tableRenderer) {
  const sourceControl = report.source_control;
  const viberPipeline = report.viber_pipeline || null;
  const sourceControlLines = sourceControl ? [
    `- Enabled: ${sourceControl.enabled ? "yes" : "no"}`,
    `- Provider: ${sourceControl.provider || "none"}`,
    `- Remote provider: ${sourceControl.remote_provider || "none"}`,
    `- Provider plugin: ${sourceControl.provider_plugin || "none"}`,
    `- Mode: ${sourceControl.mode || "local_only"}`,
    `- Branching enabled: ${sourceControl.branching_enabled ? "yes" : "no"}`,
    `- PR enabled: ${sourceControl.pr_enabled ? "yes" : "no"}`,
    `- Default branch: ${sourceControl.default_branch || "main"}`,
    `- Current branch: ${sourceControl.current_branch || "none"}`
  ] : ["- None"];
  const versions = Array.isArray(report.version_plan && report.version_plan.versions) ? report.version_plan.versions : [];
  const versionRows = versions.map((version) => [
    version.version_id,
    version.title,
    version.readiness_gate || "",
    version.source_control_mode || ""
  ]);
  const evolutionRows = Array.isArray(report.evolutions) ? report.evolutions.map((evolution) => [
    evolution.evolution_id,
    evolution.title,
    evolution.version_id || "",
    evolution.source_control_mode || ""
  ]) : [];
  const taskPunchRows = Array.isArray(report.task_punches) ? report.task_punches.map((taskPunch) => [
    taskPunch.version_id || "",
    taskPunch.evolution_id || "",
    taskPunch.tasks ? String(taskPunch.tasks.length) : "0",
    taskPunch.source_control ? summarizeSourceControl(taskPunch.source_control) : "none"
  ]) : [];
  const designArtifacts = report.design_artifacts || {};
  const systemDesign = designArtifacts.system_design || {};
  const databaseDesign = designArtifacts.database_design || {};
  const uiUxDesign = designArtifacts.ui_ux_design || {};
  const apiDesign = designArtifacts.api_design || {};
  const securityDesign = designArtifacts.security_design || {};
  const versionControl = report.version_control || null;
  const viberStageRows = viberPipeline && Array.isArray(viberPipeline.stages)
    ? viberPipeline.stages.map((stage) => [
      stage.stage || "",
      stage.status || "unknown",
      Array.isArray(stage.blockers) && stage.blockers.length ? stage.blockers.join("; ") : "",
      Array.isArray(stage.warnings) && stage.warnings.length ? stage.warnings.join("; ") : "",
      stage.next_action || ""
    ])
    : [];
  return [
    "# KVDF Idea to Evolution Pipeline",
    "",
    `- Track: ${report.track || ""}`,
    `- Planner mode: ${report.planner_mode || ""}`,
    `- Delivery mode: ${report.delivery_mode || ""}`,
    `- Idea: ${report.idea || ""}`,
    "",
    viberPipeline ? "## Viber Planning-to-Task Pipeline" : null,
    viberPipeline ? `- Planning method: ${viberPipeline.planning_method || "hybrid"}` : null,
    viberPipeline ? `- Planning authority: ${viberPipeline.planning_authority ? viberPipeline.planning_authority.level || "placeholder" : "placeholder"}` : null,
    viberPipeline ? `- Questionnaire: ${viberPipeline.questionnaire ? viberPipeline.questionnaire.status || "missing" : "missing"}` : null,
    viberPipeline ? `- Brief: ${viberPipeline.brief ? viberPipeline.brief.status || "missing" : "missing"}` : null,
    viberPipeline ? `- Execution allowed: ${viberPipeline.execution_allowed ? "yes" : "no"}` : null,
    viberPipeline ? `- Next stage: ${viberPipeline.next_stage || "unknown"}` : null,
    viberPipeline ? `- Next action: ${viberPipeline.readiness && viberPipeline.readiness.next_action ? viberPipeline.readiness.next_action : "Complete the next planning stage."}` : null,
    viberPipeline && viberPipeline.version_evolution_gates ? `- Version/evolution gates: ${viberPipeline.version_evolution_gates.status || "unknown"}` : null,
    viberPipeline && viberPipeline.version_evolution_gates ? `- Version plan gate: ${viberPipeline.version_evolution_gates.version_plan ? viberPipeline.version_evolution_gates.version_plan.status || "unknown" : "unknown"}` : null,
    viberPipeline && Array.isArray(viberPipeline.stage_order) && viberPipeline.stage_order.length ? `- Stage order: ${viberPipeline.stage_order.join(" -> ")}` : null,
    viberPipeline ? tableRenderer(["Stage", "Status", "Blockers", "Warnings", "Next Action"], viberStageRows) : null,
    "",
    "## Documentation Files",
    ...(report.documentation_files || []).map((item) => `- ${item}`),
    "",
    "## System Design",
    ...renderIndentedObjectSection(systemDesign),
    "",
    "## Database Design",
    ...renderIndentedObjectSection(databaseDesign),
    "",
    "## UI/UX Design",
    ...renderIndentedObjectSection(uiUxDesign),
    "",
    "## Visual Planning",
    "### Mermaid Graph",
    "```mermaid",
    report.visual_planning && report.visual_planning.graph ? report.visual_planning.graph.diagram : "",
    "```",
    "### Planning Board",
    report.visual_planning && report.visual_planning.board ? (report.visual_planning.board.columns || []).map((column) => `- ${column.title}: ${(column.cards || []).length} card(s)`).join("\n") : "",
    "### Scope Map",
    ...renderIndentedObjectSection(report.visual_planning ? report.visual_planning.scope_map || {} : {}),
    "",
    "## Version Plan",
    tableRenderer(["Version", "Title", "Readiness Gate", "Source Control"], versionRows),
    "",
    "## Version Control",
    ...renderIndentedObjectSection(versionControl || {}),
    "",
    "## Evolutions",
    tableRenderer(["Evolution", "Title", "Version", "Source Control"], evolutionRows),
    "",
    "## Task Punches",
    tableRenderer(["Version", "Evolution", "Tasks", "Source Control"], taskPunchRows),
    "",
    "## Visual Roadmap",
    ...renderIndentedObjectSection(report.visual_roadmap || {}),
    "",
    "## Source Control",
    ...sourceControlLines,
    "",
    "## Next Evolution",
    ...renderIndentedObjectSection(report.next_evolution || {}),
    "",
    "## Validation Commands",
    ...(report.validation_commands || (report.visual_planning && report.visual_planning.validation_commands) || []).map((command) => `- ${command}`),
    "",
    `## Next Action`,
    report.next_action || ""
  ].join("\n").replace(/\n{3,}/g, "\n\n");
}

function renderIndentedObjectSection(value, indent = "- ", nestedIndent = "  - ") {
  if (!value || typeof value !== "object") return ["- None"];
  const lines = [];
  for (const [key, entry] of Object.entries(value)) {
    if (Array.isArray(entry)) {
      if (entry.length === 0) {
        lines.push(`- ${key}: []`);
      } else if (entry.every((item) => typeof item !== "object" || item === null)) {
        lines.push(`- ${key}:`);
        for (const item of entry) lines.push(`${nestedIndent}${String(item)}`);
      } else {
        lines.push(`- ${key}:`);
        for (const item of entry) lines.push(`${nestedIndent}${JSON.stringify(item)}`);
      }
    } else if (entry && typeof entry === "object") {
      lines.push(`- ${key}:`);
      for (const nested of renderIndentedObjectSection(entry, nestedIndent, `${nestedIndent}  - `)) {
        lines.push(`${nestedIndent}${nested.replace(/^- /, "")}`);
      }
    } else {
      lines.push(`- ${key}: ${entry === null || entry === undefined ? "none" : String(entry)}`);
    }
  }
  return lines.length ? lines : ["- None"];
}

function buildPlannerProposalReport(goal, request = {}, deps = {}) {
  const planning = buildPlannerPlanningContext(goal, request, deps);
  const context = planning.context;
  const stateResync = buildPlannerStateResyncSummary(context, request);
  const mode = planning.mode;
  const deliveryMode = planning.deliveryMode;
  const pluginContext = planning.plugin_context;
  const sourceControl = planning.source_control;
  const aiLearning = planning.ai_learning;
  const evolutionPlan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const taskPunch = buildPlannerTaskPunch(evolutionPlan, { ...request, mode, deliveryMode, pluginContext, sourceControl }, context);
  const visual = buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    context,
    pluginContext,
    sourceControl,
    planningMethod: planning.planning_method,
    methodReason: planning.method.reason,
    confidence: planning.method.confidence,
    review: planning.method.review || null,
    docsStatus: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status.status : "planned",
    docsStatusReport: planning.pipeline ? planning.pipeline.docs_status : null,
    docsCreatedTotal: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status.existing_total || 0 : 0,
    currentGate: planning.current_gate,
    roadmapTrain: planning.pipeline ? planning.pipeline.roadmap_train || null : null
  });
  const review = buildPlannerReviewSummary({
    goal,
    planner_mode: mode,
    track: evolutionPlan.track,
    planning_method: planning.planning_method,
    source_control: sourceControl,
    documentation_files: planning.pipeline ? planning.pipeline.documentation_files : [],
    docs_plan: planning.pipeline ? planning.pipeline.docs_plan : null,
    docs_status: planning.pipeline ? planning.pipeline.docs_status : null,
    visual_planning: visual,
    task_punches: [taskPunch],
    evolutions: [evolutionPlan],
    method: planning.method,
    plugin_context: pluginContext,
    delivery_mode: deliveryMode,
    roadmap_train: planning.pipeline ? planning.pipeline.roadmap_train || null : null
  });
  const codexPrompt = renderCodexPrompt({ goal, mode, plan: evolutionPlan, taskPunch, context, pluginContext, sourceControl, aiLearning, planningMethod: planning.planning_method, methodReason: planning.method.reason, review, docsStatus: planning.pipeline && planning.pipeline.docs_status ? planning.pipeline.docs_status.status : "planned", visualSummary: visual, currentGate: planning.current_gate, roadmapTrain: planning.pipeline ? planning.pipeline.roadmap_train || null : null });
  const state = loadPlannerState(context.repo_root);
  const planId = allocatePlannerPlanId(state);
  const plan = buildPlannerPlanRecord({
    planId,
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    visual,
    codexPrompt,
    pluginContext,
    sourceControl,
    createdAt: new Date().toISOString(),
    planningMethod: planning.planning_method,
    methodReason: planning.method.reason,
    confidence: planning.method.confidence,
    review,
    documentationFiles: planning.pipeline ? planning.pipeline.documentation_files : [],
    docsPlan: planning.pipeline ? planning.pipeline.docs_plan : null,
    docsStatus: planning.pipeline ? planning.pipeline.docs_status : null,
    designArtifacts: planning.pipeline ? planning.pipeline.design_artifacts : null,
    versionPlan: planning.pipeline ? planning.pipeline.version_plan : null,
    evolutions: planning.pipeline ? planning.pipeline.evolutions : [],
    taskPunches: planning.pipeline ? planning.pipeline.task_punches : [],
    visualPlanning: visual,
    sourcePipeline: planning.pipeline
  });
  state.plans.push(plan);
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_proposal",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "proposed",
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    state_resync: stateResync,
    state_resync_required: !stateResync.fresh,
    planning_method: planning.planning_method,
    method_reason: planning.method.reason,
    confidence: planning.method.confidence,
    review,
    documentation_files: planning.pipeline ? planning.pipeline.documentation_files : [],
    design_artifacts: planning.pipeline ? planning.pipeline.design_artifacts : null,
    version_plan: planning.pipeline ? planning.pipeline.version_plan : null,
    evolutions: planning.pipeline ? planning.pipeline.evolutions : [],
    task_punches: planning.pipeline ? planning.pipeline.task_punches : [],
    visual_planning: visual,
    visual,
    next_action: `Review and approve with kvdf planner approve ${planId}.`
  };
}

function approvePlannerPlan(planId, approvedBy, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  if (String(plan.status || "").toLowerCase() !== "proposed") {
    throw new Error(`Planner plan ${planId} must be proposed before approval.`);
  }
  const owner = String(approvedBy || "").trim();
  if (!owner) throw new Error("Missing owner for planner approve.");
  plan.status = "approved";
  plan.approved_at = new Date().toISOString();
  plan.approved_by = owner;
  plan.rejected_at = null;
  plan.rejection_reason = null;
  const pluginContext = String(plan.planner_mode || "").toLowerCase() === "plugin"
    ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  plan.visual = buildPlannerVisualPayload({
    goal: plan.goal || (plan.recommended_evolution && plan.recommended_evolution.title) || "Approved planner plan",
    mode: plan.planner_mode,
    deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode),
    evolutionPlan: plan.recommended_evolution && Object.keys(plan.recommended_evolution).length ? plan.recommended_evolution : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context),
    taskPunch: plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length ? plan.task_punch : buildPlannerTaskPunch(plan.recommended_evolution && Object.keys(plan.recommended_evolution).length ? plan.recommended_evolution : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context), { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context),
    context,
    pluginContext,
    currentPlan: plan,
    planningMethod: plan.planning_method || null,
    methodReason: plan.method_reason || "",
    confidence: plan.confidence || "",
    review: plan.review || null,
    docsStatusReport: plan.docs_status || null,
    docsStatus: plan.documentation_files && plan.documentation_files.length ? "draft" : "planned",
    docsCreatedTotal: Array.isArray(plan.documentation_files) ? plan.documentation_files.length : 0,
    risks: plan.review && Array.isArray(plan.review.risks) ? plan.review.risks : [],
    currentGate: plan.current_gate || buildPlannerCurrentGate(plan.planning_method || "structured", plan.source_control || null, plan.planner_mode)
  });
  state.current_plan_id = planId;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_approved",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "approved",
    current_plan_id: planId,
    next_action: "Generate the Codex prompt with kvdf planner prompt --from-current --json."
  };
}

function buildPlannerCurrentReport(deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    return attachPlannerCurrentStateSummary({
      report_type: "kvdf_planner_current",
      generated_at: new Date().toISOString(),
      status: "empty",
      current_plan: null,
      next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create a proposed plan."
    }, context, {});
  }
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_current",
    generated_at: new Date().toISOString(),
    status: "approved",
    current_plan_id: currentPlan.plan_id,
    current_plan: currentPlan,
    docs_plan: currentPlan.docs_plan || null,
    docs_status: currentPlan.docs_status || null,
    version_control: currentPlan.version_control || buildPlannerVersionControlSummary({
      versionPlan: currentPlan.version_plan || {},
      currentPlan,
      versionControlState: readPlannerVersionControlState(context.repo_root, normalizeAppSlug(currentPlan.app_slug || "")),
      context,
      appSlug: normalizeAppSlug(currentPlan.app_slug || ""),
      track: currentPlan.track || getPlannerTrack(normalizePlannerMode(currentPlan.planner_mode)),
      plannerMode: normalizePlannerMode(currentPlan.planner_mode),
      sourceControl: currentPlan.source_control || null
    }),
    latest_feedback: currentPlan.latest_feedback || readPlannerLatestFeedback(context.repo_root, normalizeAppSlug(currentPlan.app_slug || "")) || null,
    next_action: "Run kvdf planner prompt --from-current --json to generate the Codex prompt from the approved plan."
  }, context, { track: currentPlan.track || normalizePlannerMode(currentPlan.planner_mode), app: normalizeAppSlug(currentPlan.app_slug || "") });
}

function buildPlannerCurrentStateReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  return currentState;
}

function buildPlannerGuardReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const stateResync = buildPlannerStateResyncSummary(context, { ...flags, track: flags.track || value || rest[0] });
  return {
    report_type: "kvdf_planner_drift_guard",
    generated_at: new Date().toISOString(),
    status: stateResync.status === "current" ? "pass" : stateResync.status,
    state_resync_required: !stateResync.fresh,
    current_state_report_path: CURRENT_STATE_REPORT_PATH,
    reason: stateResync.reason,
    next_action: stateResync.next_action,
    state_resync: stateResync
  };
}

function buildPlannerWorkspaceBoundaryReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  return {
    report_type: "kvdf_workspace_boundary_report",
    generated_at: currentState.generated_at,
    status: currentState.write_policy && currentState.write_policy.can_write ? "pass" : "blocked",
    target_track: currentState.track ? currentState.track.target_track : normalizeTrackAlias(flags.track) || "unknown",
    target_workspace: currentState.workspace ? currentState.workspace.root || currentState.workspace.kind || "unknown" : "unknown",
    workspace: currentState.workspace || null,
    repo: currentState.repo || null,
    allowed_paths: currentState.allowed_paths || [],
    forbidden_paths: currentState.forbidden_paths || [],
    source_of_truth: currentState.source_of_truth || {},
    stale_state: currentState.stale_state || {},
    next_action: currentState.next_action || "Confirm the target workspace before planning or writing.",
    current_state_summary: currentState
  };
}

function buildPlannerStaleStateReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const cwd = context.execution_cwd || context.repo_root;
  const report = buildStaleStateReportService({ cwd });
  const runtimeRecon = reconcileRuntimeTruth(cwd);
  const runtimeEvolution = readJsonFileIfExists(path.join(cwd, ".kabeeri", "evolution.json"));
  const runtimePriorityItems = Array.isArray(runtimeEvolution && runtimeEvolution.development_priorities)
    ? runtimeEvolution.development_priorities
      .filter((item) => ["planned", "recommended", "future", "deferred", "suggested"].includes(String(item.status || "").toLowerCase()))
      .map((item) => ({
        id: item.id || item.priority || item.title || "priority",
        title: item.title || item.id || "priority",
        classification: "stale_planned",
        reason: "Runtime priority should not outrank source-level evidence."
      }))
    : [];
  const runtimeWarnings = [
    ...(runtimeRecon.stale_planned || []),
    ...(runtimeRecon.stale_recommended || []),
    ...(runtimeRecon.runtime_only_evolutions || [])
  ];
  if (report.status !== "warning" && (runtimeWarnings.length || runtimePriorityItems.length)) {
    return {
      report_type: "kvdf_stale_state_report",
      generated_at: report.generated_at || new Date().toISOString(),
      status: "warning",
      stale_plans: [
        ...(runtimeRecon.stale_planned || []),
        ...(runtimeRecon.stale_recommended || []),
        ...runtimePriorityItems
      ],
      stale_reports: report.stale_reports || [],
      stale_runtime_items: runtimeRecon.runtime_only_evolutions || [],
      superseded_items: [
        ...(runtimeRecon.stale_planned || []),
        ...(runtimeRecon.stale_recommended || []),
        ...runtimePriorityItems
      ],
      historical_items: report.historical_items || [],
      next_action: "Review the stale roadmap, runtime, and generated report items before trusting the next plan.",
      current_state_summary: buildPlannerCurrentStateSummary(context, flags)
    };
  }
  return {
    ...report,
    current_state_summary: buildPlannerCurrentStateSummary(context, flags)
  };
}

function buildPlannerCurrentStateSummary(context, flags = {}, options = {}) {
  const currentPlan = findCurrentPlannerPlan(loadPlannerState(context.repo_root));
  const cwd = options.cwd || context.execution_cwd || context.repo_root;
  const useRepoPlan = cwd === context.repo_root;
  const explicitAppSlug = String(flags.app || flags.app_slug || flags["app-slug"] || "").trim();
  const explicitPluginId = String(flags.plugin || flags.plugin_id || "").trim();
  const stateResync = buildPlannerStateResyncSummary(context, flags, { cwd, pluginId: explicitPluginId });
  const report = buildCurrentStateReportService({
    cwd,
    targetTrack: normalizeTrackAlias(flags.track) || (useRepoPlan && currentPlan ? currentPlan.track : null),
    appSlug: explicitAppSlug ? normalizeAppSlug(explicitAppSlug) : (useRepoPlan && currentPlan ? normalizeAppSlug(currentPlan.app_slug || "") : null),
    pluginId: explicitPluginId ? normalizePluginId(explicitPluginId) : (useRepoPlan && currentPlan && currentPlan.plugin_id ? normalizePluginId(currentPlan.plugin_id) : null)
  });
  return {
    ...report,
    current_plan_id: currentPlan ? currentPlan.plan_id || null : null,
    current_plan_status: currentPlan ? currentPlan.status || null : null,
    state_resync: stateResync,
    state_resync_required: !stateResync.fresh
  };
}

function attachPlannerCurrentStateSummary(report, context, flags = {}) {
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  return {
    ...report,
    current_state_summary: currentState,
    state_resync: report.state_resync || currentState.state_resync || null,
    state_resync_required: report.state_resync_required !== undefined ? report.state_resync_required : Boolean(currentState.state_resync_required)
  };
}

function buildPlannerStateResyncSummary(context, flags = {}, options = {}) {
  const cwd = options.cwd || context.execution_cwd || context.repo_root;
  const track = normalizeTrackAlias(flags.track) || normalizeTrackAlias(options.track) || detectPlannerMode(context, null);
  const pluginId = String(options.pluginId || flags.plugin || flags.plugin_id || "").trim() || null;
  const report = loadStateResyncReport(cwd);
  const gitRepository = readGitRepositoryState(cwd);
  const currentHead = readGitHeadCommit(cwd);
  const freshness = evaluateStateResyncFreshness(report, {
    cwd,
    current_branch: gitRepository.current_branch || null,
    head_commit: currentHead
  });
  if (!report) {
    return {
      report_type: "kvdf_current_state_report",
      current_state_report_path: CURRENT_STATE_REPORT_PATH,
      status: "blocked",
      fresh: false,
      state_freshness: "unknown",
      reason: "No current-state report exists yet.",
      next_action: `Run kvdf state resync --track ${track === "plugin" ? "plugin" : track === "vibe" ? "vibe" : "owner"} --json first.`,
      required: true,
      report: null,
      plugin_id: pluginId
    };
  }
  const status = freshness.fresh ? "current" : (freshness.state_freshness === "stale" ? "warning" : "blocked");
  return {
    report_type: report.report_type || "kvdf_current_state_report",
    current_state_report_path: CURRENT_STATE_REPORT_PATH,
    status,
    fresh: freshness.fresh,
    state_freshness: freshness.state_freshness,
    reason: freshness.reasons && freshness.reasons.length ? freshness.reasons[0] : "Current-state report is available.",
    reasons: freshness.reasons || [],
    next_action: freshness.fresh
      ? "State Resync is current; it is safe to recommend the next Evolution."
      : `Run kvdf state resync --track ${track === "plugin" ? "plugin" : track === "vibe" ? "vibe" : "owner"} --json before recommending the next Evolution.`,
    required: !freshness.fresh,
    report
  };
}

function assertPlannerWriteBoundary(context, flags = {}, options = {}) {
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  const plannerMode = normalizePlannerMode(flags.track || options.track || currentState.track && currentState.track.active_track);
  const targetWorkspace = currentState.workspace ? currentState.workspace.kind : "unknown";
  const appSlug = normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || options.appSlug || "");
  const pluginId = normalizePluginId(flags.plugin || flags.plugin_id || options.pluginId || "");
  const expectedWorkspace = plannerMode === "owner"
    ? "kvdf_core"
    : plannerMode === "plugin"
      ? "plugin"
      : "viber_app";
  const ambiguous = targetWorkspace === "unknown"
    || (plannerMode === "vibe" && !appSlug && !resolveBooleanFlag(flags.dry_run || flags["dry-run"]))
    || (plannerMode === "plugin" && !pluginId && !resolveBooleanFlag(flags.dry_run || flags["dry-run"]))
    || (expectedWorkspace !== "kvdf_core" && targetWorkspace !== expectedWorkspace);
  if (ambiguous && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const reason = targetWorkspace === "unknown"
      ? "Workspace identity is ambiguous."
      : plannerMode === "vibe" && !appSlug
        ? "Missing app slug for Viber/app workspace materialization."
        : plannerMode === "plugin" && !pluginId
          ? "Missing plugin id for plugin workspace materialization."
          : `Target workspace ${targetWorkspace} does not match the requested track ${plannerMode}.`;
    const error = new Error(reason);
    error.current_state = currentState;
    throw error;
  }
  return currentState;
}

function rejectPlannerPlan(planId, reason, flags = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  const force = resolveBooleanFlag(flags.force);
  const status = String(plan.status || "").toLowerCase();
  if (status === "completed" && !force) {
    throw new Error(`Planner plan ${planId} is completed. Use --force to reject it.`);
  }
  if (status !== "proposed" && !force) {
    throw new Error(`Planner plan ${planId} must be proposed before rejection.`);
  }
  const rejectionReason = String(reason || "").trim();
  if (!rejectionReason) throw new Error("Missing rejection reason for planner reject.");
  plan.status = "rejected";
  plan.rejected_at = new Date().toISOString();
  plan.rejection_reason = rejectionReason;
  plan.approved_at = null;
  plan.approved_by = null;
  plan.completed_at = null;
  plan.completion_note = null;
  plan.materialized_at = null;
  plan.materialization_status = null;
  plan.evolution_change_id = null;
  plan.materialized_task_ids = [];
  plan.materialization_report_path = null;
  if (state.current_plan_id === planId) state.current_plan_id = null;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_rejected",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "rejected",
    rejection_reason: rejectionReason,
    current_plan_id: state.current_plan_id || null,
    next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create a new proposed plan."
  };
}

function completePlannerPlan(planId, note, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  if (String(plan.status || "").toLowerCase() !== "approved") {
    throw new Error(`Planner plan ${planId} must be approved before completion.`);
  }
  const completionNote = String(note || "").trim();
  if (!completionNote) throw new Error("Missing completion note for planner complete.");
  plan.status = "completed";
  plan.completed_at = new Date().toISOString();
  plan.completion_note = completionNote;
  if (state.current_plan_id === planId) state.current_plan_id = null;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_completed",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "completed",
    current_plan_id: state.current_plan_id || null,
    completion_note: completionNote,
    next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create the next proposed plan."
  };
}

function materializePlannerPlan(planId, flags = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = resolveMaterializablePlannerPlan(state, planId, flags);
  const approvedPlan = normalizePlannerPlanRecord(plan);
  const materialization = buildPlannerMaterializationArtifact(approvedPlan, context);
  const evolutionState = loadPlannerEvolutionState(context.repo_root);
  const tasksState = loadPlannerTasksState(context.repo_root);
  const evolutionRecord = upsertPlannerEvolutionRecord(evolutionState, approvedPlan, materialization, context);
  const taskRecords = upsertPlannerMaterializationTasks(tasksState, evolutionState, approvedPlan, materialization, context, evolutionRecord.change_id);
  const materializedAt = new Date().toISOString();
  const reportPath = path.join(context.repo_root, ".kabeeri", "reports", `planner_materialization_${approvedPlan.plan_id}.json`);
  const report = buildPlannerMaterializationReport({
    plan: approvedPlan,
    materialization,
    evolutionRecord,
    taskRecords,
    reportPath,
    materializedAt
  });

  plan.materialized_at = materializedAt;
  plan.materialization_status = "materialized";
  plan.evolution_change_id = evolutionRecord.change_id;
  plan.materialized_task_ids = taskRecords.map((task) => task.id);
  plan.materialization_report_path = reportPath.replace(/\\/g, "/");

  evolutionState.current_change_id = evolutionRecord.change_id;
  savePlannerState(context.repo_root, state);
  savePlannerEvolutionState(context.repo_root, evolutionState);
  savePlannerTasksState(context.repo_root, tasksState);
  savePlannerMaterializationReport(reportPath, report);

  return {
    report_type: "kvdf_planner_materialization",
    generated_at: materializedAt,
    plan_id: approvedPlan.plan_id,
    planner_mode: approvedPlan.planner_mode,
    track: approvedPlan.track,
    delivery_mode: approvedPlan.delivery_mode,
    source_control: materialization.source_control || approvedPlan.source_control || null,
    status: "materialized",
    evolution: {
      change_id: evolutionRecord.change_id,
      title: evolutionRecord.title,
      status: evolutionRecord.status,
      planner_plan_id: approvedPlan.plan_id
    },
    task_punch: {
      tasks_created: taskRecords.length,
      task_ids: taskRecords.map((task) => task.id)
    },
    report_path: reportPath.replace(/\\/g, "/"),
    next_action: "Run kvdf planner prompt --from-current --json, then execute the first approved task slice.",
    plugin_context: approvedPlan.plugin_context || null
  };
}

function buildPlannerPromptFromCurrentPlan(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const sourceControl = currentPlan.source_control || buildPlannerSourceControl(
    { flags: {} },
    context,
    normalizePlannerMode(currentPlan.planner_mode),
    currentPlan.delivery_mode || getDeliveryMode(normalizePlannerMode(currentPlan.planner_mode)),
    normalizePlannerMode(currentPlan.planner_mode) === "plugin" ? currentPlan.plugin_context || null : null
  );
  const aiLearning = buildAiLearningPromptContext(normalizePlannerMode(currentPlan.track || currentPlan.planner_mode), { include_all: true });
  const review = currentPlan.review || buildPlannerReviewFromCurrentPlan(currentPlan, context);
  const roadmapTrain = currentPlan.version_plan
    ? buildPlannerRoadmapTrainSummary({
      pipeline: {
        version_plan: currentPlan.version_plan || {},
        version_control: currentPlan.version_control || buildPlannerVersionControlSummary({
          versionPlan: currentPlan.version_plan || {},
          currentPlan,
          versionControlState: readPlannerVersionControlState(context.repo_root, normalizeAppSlug(currentPlan.app_slug || "")),
          context,
          appSlug: normalizeAppSlug(currentPlan.app_slug || ""),
          track: currentPlan.track || getPlannerTrack(normalizePlannerMode(currentPlan.planner_mode)),
          plannerMode: normalizePlannerMode(currentPlan.planner_mode),
          sourceControl
        }),
        docs_plan: currentPlan.docs_plan || null,
        docs_status: currentPlan.docs_status || null,
        validation_commands: currentPlan.validation_commands || [],
        visual_planning: currentPlan.visual_planning || currentPlan.visual || null
      },
      context,
      profile: {
        train_type: normalizePlannerMode(currentPlan.planner_mode) === "vibe" ? "viber" : "owner",
        track: currentPlan.track || getPlannerTrack(normalizePlannerMode(currentPlan.planner_mode)),
        mode: normalizePlannerMode(currentPlan.planner_mode),
        planning_method: currentPlan.planning_method || review.planning_method || "auto",
        app_slug: normalizeAppSlug(currentPlan.app_slug || "")
      },
      planning: {
        planning_method: currentPlan.planning_method || review.planning_method || "auto",
        source_control: sourceControl
      },
      goal: currentPlan.goal || "",
      flags: {}
    })
    : null;
  const prompt = renderPlannerPromptFromPlan({
    ...currentPlan,
    planning_method: currentPlan.planning_method || review.planning_method || null,
    method_reason: currentPlan.method_reason || (review.method_review ? review.method_review.reason : ""),
    review,
    documentation_files: currentPlan.documentation_files || [],
    docs_plan: currentPlan.docs_plan || null,
    docs_status: currentPlan.docs_status || null,
    visual_planning: currentPlan.visual_planning || currentPlan.visual || null,
    current_gate: currentPlan.current_gate || buildPlannerCurrentGate(currentPlan.planning_method || review.planning_method || "structured", sourceControl, normalizePlannerMode(currentPlan.planner_mode))
  }, context, sourceControl, aiLearning);
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_planner_codex_prompt",
    generated_at: new Date().toISOString(),
    planner_mode: currentPlan.planner_mode,
    track: currentPlan.track,
    delivery_mode: currentPlan.delivery_mode,
    source_control: sourceControl,
    ai_learning: aiLearning,
    plan_id: currentPlan.plan_id,
    goal: currentPlan.goal,
    planning_method: currentPlan.planning_method || review.planning_method || null,
    method_reason: currentPlan.method_reason || "",
    allowed_files: currentPlan.allowed_files || [],
    forbidden_files: currentPlan.forbidden_files || [],
    validation_commands: currentPlan.validation_commands || [],
    stop_condition: currentPlan.stop_condition || "",
    docs_plan: currentPlan.docs_plan || null,
    docs_status: currentPlan.docs_status ? currentPlan.docs_status.status : (currentPlan.documentation_files && currentPlan.documentation_files.length ? "draft" : "planned"),
    review,
    task_punch: currentPlan.task_punch || null,
    prompt,
    roadmap_train: roadmapTrain
  }, context, {
    track: currentPlan.track || normalizePlannerMode(currentPlan.planner_mode),
    app: normalizeAppSlug(currentPlan.app_slug || ""),
    plugin: currentPlan.plugin_context && currentPlan.plugin_context.plugin_id ? currentPlan.plugin_context.plugin_id : ""
  });
}

function buildPlannerEvolutionPlan(goal, request = {}, context = {}) {
  const mode = request.mode || "owner";
  const deliveryMode = request.deliveryMode || getDeliveryMode(mode);
  const pluginContext = request.pluginContext || null;
  const sourceControl = request.source_control || request.sourceControl || buildPlannerSourceControl(request, context, mode, deliveryMode, pluginContext);
  const title = normalizeEvolutionTitle(goal, mode, context, pluginContext);
  const evolutionId = normalizeEvolutionId(title);
  const recommendationArea = getPlannerArea(mode);
  const nextAction = getPlannerNextAction(mode, title, pluginContext);
  const plan = {
    report_type: "kvdf_planner_evolution_plan",
    evolution_id: evolutionId,
    title,
    planner_mode: mode,
    track: getPlannerTrack(mode),
    area: recommendationArea,
    reason: buildPlannerReason(mode, context, pluginContext),
    in_scope: buildPlannerInScope(mode, context, pluginContext),
    out_of_scope: buildPlannerOutOfScope(mode, context, pluginContext),
    allowed_files: buildPlannerAllowedFiles(mode, context, pluginContext),
    forbidden_files: buildPlannerForbiddenFiles(mode, context, pluginContext),
    acceptance_criteria: buildPlannerAcceptanceCriteria(mode, context, pluginContext),
    validation_commands: buildPlannerValidationCommands(mode, context, pluginContext),
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    next_action: nextAction,
    stop_condition: buildPlannerStopCondition(mode, context, pluginContext)
  };
  if (mode === "vibe") plan.pipeline = [...VIBE_PIPELINE];
  if (mode === "plugin") plan.plugin_context = pluginContext;
  return plan;
}

function buildPlannerTaskPunch(plan, request = {}, context = {}) {
  const mode = request.mode || plan.planner_mode || "owner";
  const pluginContext = request.pluginContext || plan.plugin_context || null;
  const sourceControl = request.source_control || request.sourceControl || plan.source_control || buildPlannerSourceControl(request, context, mode, request.deliveryMode || plan.delivery_mode || getDeliveryMode(mode), pluginContext);
  const evolutionId = plan.evolution_id || normalizeEvolutionId(plan.title);
  const tasks = buildModeTaskPunchTasks(mode, plan, pluginContext, context, evolutionId);
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    evolution_id: evolutionId,
    title: `${plan.title} Task Punch`,
    planner_mode: mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    source_control: sourceControl,
    tasks
  };
}

function buildModeTaskPunchTasks(mode, plan, pluginContext, context, evolutionId) {
  if (mode === "vibe") {
    return [
      taskPunchItem(`${evolutionId}-intake`, "Define app-track intake and scope boundaries", [
        "workspaces/apps/<app-slug>/",
        ".kabeeri/questionnaires/",
        ".kabeeri/interactions/",
        "docs/workflows/KVDF_LED_DELIVERY.md"
      ], [
        "KVDOS/",
        "src/cli/",
        "plugins/*/runtime/",
        ".kabeeri/plugin-links/"
      ], [
        "The request is documented in a file-based intake flow.",
        "Owner-track files remain untouched unless explicitly requested.",
        "The output states whether GitHub handoff is optional or local-only."
      ], plan.validation_commands, "Stop if the request would turn into owner-track work by default."),
      taskPunchItem(`${evolutionId}-evolution`, "Draft the app evolution and task slicing guidance", [
        "workspaces/apps/<app-slug>/",
        ".kabeeri/reports/",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        "docs/workflows/PR_HANDOFF_TEMPLATE.md"
      ], [
        "KVDOS/",
        "src/cli/commands/evolution.js",
        "plugins/*/plugin.json",
        ".kabeeri/plugin-links/"
      ], [
        "The evolution slice is milestone-based and local-first by default.",
        "The task slice is small enough to finish without changing KVDF Core.",
        "Branch/PR appears only as an optional handoff path."
      ], plan.validation_commands, "Stop if the task slice drifts into KVDF Core implementation by default."),
      taskPunchItem(`${evolutionId}-handoff`, "Add handoff and validation guidance for app delivery", [
        "docs/workflows/KVDF_LED_DELIVERY.md",
        "docs/workflows/PR_HANDOFF_TEMPLATE.md",
        "docs/site/pages/en/vibe-developer.html",
        "docs/site/pages/ar/vibe-developer.html",
        "tests/cli.integration.test.js"
      ], [
        "KVDOS/",
        "src/cli/commands/planner.js",
        "src/cli/commands/dashboard_site.js",
        ".kabeeri/plugin-links/"
      ], [
        "The handoff flow remains valid even when GitHub is disabled.",
        "The final report names the app workspace and the next action.",
        "The output explains the direct-to-main KVDF Core exception separately."
      ], plan.validation_commands, "Stop if the handoff guidance starts redefining KVDF Core delivery as the default app path.")
    ];
  }

  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    const pluginRoot = path.relative(repoRoot(), getPluginSourcePath(pluginId)).replace(/\\/g, "/");
    return [
      taskPunchItem(`${evolutionId}-manifest`, "Align the plugin manifest and CLI contract", [
        `${pluginRoot}/plugin.json`,
        `${pluginRoot}/README.md`,
        `${pluginRoot}/docs/`,
        "src/cli/services/plugin_loader.js",
        "src/cli/services/plugin_mounts.js"
      ], [
        "KVDOS/",
        ".kabeeri/plugin-links/",
        "workspaces/apps/",
        "plugins/*/runtime/"
      ], [
        "The plugin manifest stays the source of truth.",
        "The plugin command surface, docs surface, and runtime entrypoint match the manifest.",
        "Install and uninstall behavior stays reversible and local."
      ], [...plan.validation_commands, "kvdf plugins status"], "Stop if the work would alter unrelated plugins."),
      taskPunchItem(`${evolutionId}-runtime`, "Protect plugin runtime and mount state boundaries", [
        `${pluginRoot}/runtime/`,
        `.kabeeri/plugins.json`,
        ".kabeeri/plugin-links/",
        `${pluginRoot}/tests/`
      ], [
        "KVDOS/",
        "workspaces/apps/",
        "plugins/*/plugin.json",
        "plugins/*/runtime/"
      ], [
        "Plugin runtime state and mount links are protected.",
        "Plugin install/uninstall lifecycle checks are included where relevant.",
        "The planner output explains the bundle contract parity."
      ], plan.validation_commands, "Stop if the runtime work would require changing unrelated plugin mounts."),
      taskPunchItem(`${evolutionId}-docs-tests`, "Add plugin docs, schema, and test parity guidance", [
        "docs/cli/CLI_COMMAND_REFERENCE.md",
        "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
        "knowledge/governance/KVDF_PLANNER_LAYER.md",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        `${pluginRoot}/tests/`
      ], [
        "KVDOS/",
        "plugins/*/runtime/",
        ".kabeeri/plugin-links/",
        "workspaces/apps/"
      ], [
        "The plugin docs mention manifest, docs, runtime, and tests parity.",
        "The planner prompt says plugin development explicitly.",
        "The output protects mount state and unrelated plugin bundles."
      ], plan.validation_commands, "Stop if the docs or tests would blur plugin scope across bundles.")
    ];
  }

  return [
    taskPunchItem(`${evolutionId}-docs`, "Document the planner layer and workflow contract", [
      "knowledge/governance/KVDF_PLANNER_LAYER.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
      "packs/planner/evolution-planner.prompt.md",
      "packs/planner/codex-execution.prompt.md",
      "schemas/planner/evolution-plan.schema.json",
      "schemas/planner/task-punch.schema.json"
    ], [...OWNER_FORBIDDEN_FILES], [
      "The planner layer governance document explains the roles and rules clearly.",
      "The workflow document shows Owner direction -> planner -> Codex execution -> validation -> review -> direct-to-main commit.",
      "The prompt templates exist and match the direct-to-main KVDF Core policy."
    ], plan.validation_commands, "Stop if the documentation would describe branch/PR as the default KVDF Core delivery path."),
    taskPunchItem(`${evolutionId}-cli`, "Wire the planner command into the KVDF Core CLI", [
      "src/cli/commands/planner.js",
      "src/cli/dispatchers/build.js",
      "src/cli/index.js",
      "src/cli/ui.js"
    ], [...OWNER_FORBIDDEN_FILES], [
      "kvdf planner next --json returns a deterministic recommendation.",
      "kvdf planner prompt --goal \"...\" --json returns a Codex-ready prompt.",
      "KVDF Core stays direct-to-main by default and branch/PR remains optional only."
    ], plan.validation_commands, "Stop if command wiring would make branch/PR the default KVDF Core path."),
    taskPunchItem(`${evolutionId}-tests`, "Add planner integration and documentation coverage", [
      "tests/cli.integration.test.js",
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md"
    ], [...OWNER_FORBIDDEN_FILES], [
      "The planner command has integration coverage for JSON and prompt output.",
      "The CLI command reference documents the planner command family.",
      "The system capabilities reference records the Planner Layer in the core area map."
    ], plan.validation_commands, "Stop if the test additions require runtime state edits or unrelated feature changes.")
  ];
}

function taskPunchItem(id, title, allowedFiles, forbiddenFiles, acceptanceCriteria, validationCommands, stopCondition) {
  return {
    id,
    title,
    status: "proposed",
    allowed_files: allowedFiles,
    forbidden_files: forbiddenFiles,
    acceptance_criteria: acceptanceCriteria,
    validation_commands: validationCommands,
    stop_condition: stopCondition
  };
}

function renderCodexPrompt({ goal, mode, plan, taskPunch, pluginContext, sourceControl, aiLearning = null, planningMethod = null, methodReason = "", review = null, docsStatus = null, visualSummary = null, currentGate = null, versionControl = null, latestFeedback = null, roadmapTrain = null, pipelineState = null }) {
  const heading = mode === "vibe"
    ? "CODEx PROMPT — KVDF Vibe/App Delivery"
    : mode === "plugin"
      ? "CODEx PROMPT — KVDF Plugin Development"
      : "CODEx PROMPT — KVDF Core";
  const allowedFiles = plan.allowed_files || [];
  const forbiddenFiles = plan.forbidden_files || [];
  const validationCommands = plan.validation_commands || [];
  const viberPipeline = mode === "vibe"
    ? pipelineState || (visualSummary && visualSummary.viber_pipeline ? visualSummary.viber_pipeline : null)
    : null;
  const docsDesignGate = viberPipeline && viberPipeline.docs_design_gates ? viberPipeline.docs_design_gates : null;
  const docsDesignBlockers = viberPipeline && Array.isArray(viberPipeline.execution_blockers)
    ? viberPipeline.execution_blockers.filter((blocker) => String(blocker && blocker.area || "").toLowerCase() === "docs")
    : [];
  const versionEvolutionGate = viberPipeline && viberPipeline.version_evolution_gates ? viberPipeline.version_evolution_gates : null;
  const executionGate = viberPipeline && viberPipeline.execution_gates ? viberPipeline.execution_gates : null;
  const versionEvolutionGateBlocked = Boolean(
    versionEvolutionGate && ["blocked", "warning"].includes(String(versionEvolutionGate.status || "").toLowerCase())
  ) || (versionEvolutionGate && Array.isArray(versionEvolutionGate.blockers) && versionEvolutionGate.blockers.length > 0);
  const executionGateBlocked = Boolean(
    executionGate && ["blocked", "warning"].includes(String(executionGate.status || "").toLowerCase())
  ) || (executionGate && Array.isArray(executionGate.blockers) && executionGate.blockers.length > 0);
  const docsDesignGateBlocked = Boolean(
    docsDesignGate && ["blocked", "warning"].includes(String(docsDesignGate.status || "").toLowerCase())
  ) || docsDesignBlockers.length > 0;
  const docsDesignNextAction = docsDesignGate && docsDesignGate.next_action
    ? docsDesignGate.next_action
    : docsDesignBlockers.length
      ? docsDesignBlockers[0].next_action || "Complete the next docs/design stage only."
      : "Complete the next docs/design stage only.";
  const versionEvolutionNextAction = versionEvolutionGate && versionEvolutionGate.next_action
    ? versionEvolutionGate.next_action
    : "Approve the version plan before generating task punches.";
  const executionNextAction = executionGate && executionGate.next_action
    ? executionGate.next_action
    : "Resolve the execution gates before prompting Codex.";
  const blockedPlanningAction = docsDesignGateBlocked
    ? docsDesignNextAction
    : versionEvolutionGateBlocked
      ? versionEvolutionNextAction
      : executionGateBlocked
        ? executionNextAction
        : "Complete the next planning stage only.";
  const executionReady = Boolean(viberPipeline && (viberPipeline.execution_allowed || String(viberPipeline.current_plan_materialization_status || "").toLowerCase() === "materialized" || String(viberPipeline.current_plan_status || "").toLowerCase() === "approved")) && !executionGateBlocked;
  const taskLines = viberPipeline && !executionReady
    ? [
      blockedPlanningAction === docsDesignNextAction
        ? "1. Complete the next docs/design stage only."
        : blockedPlanningAction === versionEvolutionNextAction
          ? "1. Complete the next version/evolution stage only."
          : blockedPlanningAction === executionNextAction
            ? "1. Complete the next execution gate only."
          : "1. Complete the next planning stage only.",
      `2. Next stage: ${viberPipeline.next_stage || "approval"}`,
      "3. Keep the app implementation untouched for now."
    ]
    : (taskPunch.tasks || []).map((task, index) => `${index + 1}. ${task.title}`);
  const contextLines = buildPromptContextLines(mode, pluginContext, sourceControl);
  const aiLearningLines = buildAiLearningPromptSection(aiLearning, {
    state_resync: buildPlannerStateResyncSummary({ repo_root: repoRoot() }, { track: mode, plugin: pluginContext ? pluginContext.plugin_id : null })
  });
  const commitLines = buildPromptCommitLines(mode, plan, pluginContext, sourceControl);
  const pipelineLines = mode === "vibe"
    ? ["", "Pipeline:", ...VIBE_PIPELINE.map((step) => `- ${step}`)]
    : [];
  const viberPipelineLines = viberPipeline
    ? [
      "",
      "Viber Pipeline Readiness:",
      "Viber Pipeline Stage Order:",
      `- Planning method: ${viberPipeline.planning_method || "hybrid"}`,
      `- Planning authority: ${viberPipeline.planning_authority ? viberPipeline.planning_authority.level || "placeholder" : "placeholder"}`,
      `- Questionnaire: ${viberPipeline.questionnaire ? viberPipeline.questionnaire.status || "missing" : "missing"}`,
      `- Brief: ${viberPipeline.brief ? viberPipeline.brief.status || "missing" : "missing"}`,
      `- Status: ${viberPipeline.readiness ? viberPipeline.readiness.status : "unknown"}`,
      `- Execution allowed: ${executionReady ? "yes" : "no"}`,
      docsDesignGate || docsDesignBlockers.length ? `- Docs/design gates: ${docsDesignGateBlocked ? "blocked" : (docsDesignGate ? docsDesignGate.status || "unknown" : "unknown")}` : null,
      docsDesignGate || docsDesignBlockers.length ? `- Next docs/design action: ${docsDesignNextAction}` : null,
      versionEvolutionGate ? `- Version/evolution gates: ${versionEvolutionGateBlocked ? "blocked" : versionEvolutionGate.status || "unknown"}` : null,
      versionEvolutionGate ? `- Next version/evolution action: ${versionEvolutionNextAction}` : null,
      executionGate ? `- Execution gates: ${executionGateBlocked ? "blocked" : executionGate.status || "unknown"}` : null,
      executionGate ? `- Security gate: ${executionGate.security_gate ? executionGate.security_gate.status || "unknown" : "unknown"}` : null,
      executionGate ? `- Handoff gate: ${executionGate.handoff_gate ? executionGate.handoff_gate.status || "unknown" : "unknown"}` : null,
      executionGate ? `- Source control gate: ${executionGate.source_control_gate ? executionGate.source_control_gate.status || "unknown" : "unknown"}` : null,
      executionGate ? `- Validation gate: ${executionGate.validation_gate ? executionGate.validation_gate.status || "unknown" : "unknown"}` : null,
      executionGate ? `- Next execution gate action: ${executionNextAction}` : null,
      ...(executionReady ? ["- Task execution can start."] : ["- Execution is blocked until the pipeline gates pass."]),
      `- Next stage: ${viberPipeline.next_stage || "unknown"}`,
      `- Next action: ${viberPipeline.readiness && viberPipeline.readiness.next_action ? viberPipeline.readiness.next_action : "Complete the next planning stage."}`,
      viberPipeline.stage_order && Array.isArray(viberPipeline.stage_order) && viberPipeline.stage_order.length
        ? `- Stage order: ${viberPipeline.stage_order.join(" -> ")}`
        : null,
      ...(Array.isArray(viberPipeline.execution_blockers) && viberPipeline.execution_blockers.length
        ? ["- Blockers:", ...viberPipeline.execution_blockers.map((blocker) => `  - ${blocker.message || blocker.id || "blocked"}`)]
        : [])
    ]
    : [];
  return [
    heading,
    "",
    "Context:",
    "- Repo: kabeeri.vdf",
    ...contextLines,
    ...(aiLearningLines.length ? ["", ...aiLearningLines] : []),
    "",
    "Goal:",
    goal,
    "",
    planningMethod ? "Planning method:" : null,
    planningMethod ? `- Selected: ${planningMethod}` : null,
    planningMethod ? `- Reason: ${methodReason || ""}` : null,
    planningMethod ? `- Current gate: ${currentGate || ""}` : null,
    planningMethod ? `- Docs status: ${docsStatus || "planned"}` : null,
    planningMethod && review ? `- Review status: ${review.status || "unknown"}` : null,
    planningMethod && review && Array.isArray(review.required_fixes) && review.required_fixes.length ? `- Review warnings: ${review.required_fixes.join("; ")}` : null,
    planningMethod && review && review.security_review ? `- Security gate: ${review.security_review.status || "unknown"}${review.security_review.next_action ? ` (${review.security_review.next_action})` : ""}` : null,
    versionControl ? `- Current version: ${versionControl.current_version ? versionControl.current_version.version_id || versionControl.current_version.title || "unknown" : "none"}` : null,
    versionControl ? `- Next version: ${versionControl.next_version ? versionControl.next_version.version_id || versionControl.next_version.title || "unknown" : "none"}` : null,
    versionControl && versionControl.publish_readiness ? `- Publish readiness: ${versionControl.publish_readiness.status || "unknown"}` : null,
    versionControl && versionControl.publish_readiness && Array.isArray(versionControl.publish_readiness.blockers) && versionControl.publish_readiness.blockers.length ? `- Gate blockers: ${versionControl.publish_readiness.blockers.join("; ")}` : null,
    roadmapTrain ? `- Roadmap train: ${roadmapTrain.status || "unknown"}${roadmapTrain.next_evolution_id ? ` (next ${roadmapTrain.next_evolution_id})` : ""}` : null,
    latestFeedback ? `- Latest feedback: ${latestFeedback.status || "unknown"}${latestFeedback.summary ? ` (${latestFeedback.summary})` : ""}` : null,
    planningMethod && visualSummary ? `- Visual summary: ${visualSummary.markdown_report ? visualSummary.markdown_report.split("\n")[0] : "available"}` : null,
    ...(viberPipelineLines.length ? viberPipelineLines : []),
    "",
    "Scope:",
    "Allowed files:",
    ...allowedFiles.map((item) => `- ${item}`),
    "Forbidden files:",
    ...forbiddenFiles.map((item) => `- ${item}`),
    ...pipelineLines,
    "",
    "Implementation tasks:",
    ...taskLines,
    "",
    "Validation:",
    "Run:",
    ...validationCommands.map((command) => `- ${command}`),
    "",
    "Commit:",
    ...commitLines,
    "",
    `Stop condition: ${plan.stop_condition}`
  ].filter(Boolean).join("\\n");
}

function buildPromptContextLines(mode, pluginContext, sourceControl) {
  const sourceControlLines = sourceControl ? [
    `- Source control: ${summarizeSourceControl(sourceControl)}`,
    `- Source control enabled: ${sourceControl.enabled ? "yes" : "no"}`,
    `- Source control provider: ${sourceControl.provider || "none"}`,
    `- Remote provider: ${sourceControl.remote_provider || "none"}`,
    `- Branching enabled: ${sourceControl.branching_enabled ? "yes" : "no"}`,
    `- PR enabled: ${sourceControl.pr_enabled ? "yes" : "no"}`
  ] : [];
  if (mode === "vibe") {
    return [
      "- Track: Vibe App Developer",
      "- Delivery mode: Local-first",
      ...sourceControlLines,
      "- No branch / no PR unless explicitly enabled",
      "- Do not touch KVDF Core unless the Owner explicitly asks for framework work",
      "- GitHub handoff is optional and never the default",
      "- The Owner is the only active KVDF Core developer for framework work"
    ];
  }
  if (mode === "plugin") {
    return [
      "- Track: Plugin Development",
      `- Plugin: ${pluginContext ? pluginContext.plugin_id : "unknown"}`,
      "- Delivery mode: Direct-to-main",
      ...sourceControlLines,
      "- Do not touch KVDOS",
      "- Protect .kabeeri/plugin-links/ runtime mount state",
      "- Plugin manifest, docs, runtime, and tests must stay in parity"
    ];
  }
  return [
    "- Track: Owner Track / KVDF Core only",
    "- Delivery mode: Direct-to-main",
    ...sourceControlLines,
    "- Do not touch KVDOS",
    "- Do not commit runtime state under .kabeeri/",
    "- The Owner is the only active KVDF Core developer",
    "- Codex is the executor, not the planner"
  ];
}

function buildPromptCommitLines(mode, plan, pluginContext, sourceControl) {
  const sc = sourceControl || {};
  const sourceControlMode = normalizeSourceControlMode(sc.mode) || (sc.enabled === false || sc.provider === "none" ? "local_only" : null);
  const remoteProvider = String(sc.remote_provider || "none");
  const deliveryMode = String(plan.delivery_mode || "").trim().toLowerCase();
  if (sourceControlMode === "local_only" || sourceControlMode === "none" || sc.enabled === false || sc.provider === "none") {
    return [
      "Run validation.",
      "Keep the changes local.",
      "Write the final handoff report.",
      "Do not create a branch, commit, or push unless a later Evolution explicitly enables source control."
    ];
  }
  if (sourceControlMode === "direct_main") {
    return [
      "git add -A",
      `git commit -m "feat: implement approved ${mode === "vibe" ? "vibe/app" : mode === "plugin" ? "plugin" : "direct-to-main"} delivery slice"`,
      "git push origin main"
    ];
  }
  if (sourceControlMode === "branch_pr") {
    return [
      "git checkout -b <approved-evolution-branch>",
      "git add -A",
      `git commit -m "feat: implement approved ${mode === "vibe" ? "vibe/app" : mode === "plugin" ? "plugin" : "delivery"} slice"`,
      "git push origin <approved-evolution-branch>",
      remoteProvider === "github"
        ? "Prepare or create the GitHub PR for Owner review."
        : "Prepare or create the PR if the selected source-control provider supports it.",
      "Request Owner review before merge.",
      "Merge only after approval.",
      "Pull the latest main and re-validate the workspace."
    ];
  }
  if (sourceControlMode === "branch") {
    return [
      "git checkout -b <approved-evolution-branch>",
      "git add -A",
      'git commit -m "feat: implement approved delivery slice"',
      "Push the branch to the selected source-control provider.",
      "Do not open a PR unless explicitly enabled.",
      "Validate the workspace before the next Evolution."
    ];
  }
  if (deliveryMode === "local_first" || mode === "vibe") {
    return [
      "Run validation.",
      "Keep the changes local.",
      "Write the final handoff report.",
      "Do not create a branch, commit, or push unless the selected source-control provider explicitly enables it."
    ];
  }
  if (mode === "plugin") {
    return [
      "git add -A",
      'git commit -m "feat: implement approved plugin delivery slice"',
      "git push origin main"
    ];
  }
  return [
    "git add -A",
    'git commit -m "feat: add KVDF planner layer MVP"',
    "git push origin main"
  ];
}

function printPlannerOutput(report, flags, deps, kind) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  let rendered;
  if (kind === "prompt") rendered = renderPlannerPromptReport(report);
  else if (kind === "method") rendered = renderPlannerMethodReport(report, deps.table);
  else if (kind === "auto") rendered = renderPlannerAutoPlanReport(report, deps.table);
  else if (kind === "review") rendered = renderPlannerReviewReport(report, deps.table);
  else if (kind === "resume") rendered = renderPlannerResumeReport(report, deps.table);
  else if (kind === "docs") rendered = renderPlannerDocsMaterializationReport(report, deps.table);
  else if (kind === "truth") rendered = JSON.stringify(report, null, 2);
  else if (kind === "train") rendered = renderPlannerRoadmapTrainReport(report, deps.table);
  else if (kind === "visual") rendered = renderPlannerVisualReport(report);
  else if (kind === "pipeline") rendered = renderPlannerPipelineReport(report, deps.table);
  else if (kind === "materialize") rendered = renderPlannerMaterializationReport(report, deps.table);
  else if (kind === "evolution") rendered = renderPlannerEvolutionPlan(report, deps.table);
  else if (kind === "task-punch") rendered = renderPlannerTaskPunchReport(report, deps.table);
  else if (["propose", "approve", "current", "reject"].includes(kind)) rendered = renderPlannerStateSummaryReport(report, deps.table);
  else if (["current-state", "boundary", "stale-state", "guard"].includes(kind)) rendered = JSON.stringify(report, null, 2);
  else rendered = renderPlannerNextReport(report, deps.table);
  if ((kind === "visual" || kind === "pipeline")) {
    openPlannerPreview(report, rendered, kind, flags, deps);
  }
  console.log(rendered);
}

function openPlannerPreview(report, rendered, kind, flags = {}, deps = {}) {
  const repoRootPath = typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd();
  const previewDir = path.join(repoRootPath, ".kabeeri", "reports");
  const previewFile = path.join(previewDir, kind === "pipeline" ? "planner_pipeline_preview.html" : "planner_visual_preview.html");
  fs.mkdirSync(previewDir, { recursive: true });
  const html = buildPlannerPreviewHtml(report, rendered, kind);
  const finalHtml = injectFullscreenShell(html, shouldLaunchFullscreen(flags) ? { fullscreen: true } : {});
  fs.writeFileSync(previewFile, finalHtml, "utf8");
  const previewUrl = pathToFileURL(previewFile).toString();
  if (shouldOpenPreviewBrowser(flags)) {
    const opener = typeof deps.openExternalUrl === "function" ? deps.openExternalUrl : openExternalUrl;
    opener(previewUrl);
  }
  return {
    report_type: "kvdf_planner_visual_preview",
    output_path: previewFile.replace(/\\/g, "/"),
    output_url: previewUrl
  };
}

function buildPlannerPreviewHtml(report, rendered, kind) {
  const title = kind === "pipeline" ? "KVDF Planner Pipeline Preview" : "KVDF Planner Visual Preview";
  const summary = [
    report.track ? `Track: ${report.track}` : null,
    report.planner_mode ? `Planner mode: ${report.planner_mode}` : null,
    report.delivery_mode ? `Delivery mode: ${report.delivery_mode}` : null,
    report.goal ? `Goal: ${report.goal}` : null,
    report.idea ? `Idea: ${report.idea}` : null
  ].filter(Boolean);
  const taskBreakdownHtml = buildPlannerTaskBreakdownHtml(report.task_punch);
  return buildMermaidPreviewHtml({
    title,
    summary,
    rendered,
    diagramSource: rendered,
    bodyHtml: taskBreakdownHtml,
    kind,
    fallbackLabel: "Planner markdown",
    diagramTitle: "Diagram Graph"
  });
}

function buildPlannerTaskBreakdownHtml(taskPunch) {
  const tasks = Array.isArray(taskPunch && taskPunch.tasks) ? taskPunch.tasks : [];
  if (!tasks.length) return "";
  const rows = tasks.map((task) => {
    const allowed = (task.allowed_files || []).slice(0, 6);
    const forbidden = (task.forbidden_files || []).slice(0, 6);
    const acceptance = (task.acceptance_criteria || []).slice(0, 4);
    const commands = (task.validation_commands || []).slice(0, 4);
    return `
      <tr>
        <td>
          <div class="task-meta">${escapeHtml(task.status || "proposed")} · ${escapeHtml(task.id || "")}</div>
          <div class="task-title">${escapeHtml(task.title || "Task")}</div>
        </td>
        <td>${allowed.length ? `<ul class="task-list">${allowed.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</td>
        <td>${forbidden.length ? `<ul class="task-list">${forbidden.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</td>
        <td>${acceptance.length ? `<ul class="task-list">${acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</td>
        <td>${commands.length ? `<ul class="task-list">${commands.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</td>
      </tr>`;
  }).join("");
  return `
    <section class="task-breakdown">
      <div class="diagram-title">Task Breakdown</div>
      <div class="task-table-wrap">
        <table class="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Allowed Files</th>
              <th>Forbidden Files</th>
              <th>Acceptance</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function buildPlannerPreviewScript() {
  return `<script>
(function () {
  var frame = document.querySelector('.diagram-frame');
  var svg = frame && frame.querySelector('svg');
  var label = document.querySelector('[data-zoom-label]');
  var range = document.querySelector('[data-zoom-range]');
  var zoomIn = document.querySelector('[data-zoom-in]');
  var zoomOut = document.querySelector('[data-zoom-out]');
  var zoomReset = document.querySelector('[data-zoom-reset]');
  if (!frame || !svg || !label || !range || !zoomIn || !zoomOut || !zoomReset) return;
  var minZoom = 0;
  var maxZoom = 1.8;
  var step = 0.08;
  var zoom = 1;
  var panX = 0;
  var panY = 0;
  var dragging = false;
  var origin = null;
  var autoFit = true;
  var fitScale = 1;
  var fitOffsetX = 0;
  var fitOffsetY = 0;
  var baseFrameHeight = Math.max(frame.getBoundingClientRect().height || 0, 560);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function apply() {
    svg.style.transformOrigin = '0 0';
    var effectiveZoom = autoFit ? fitScale * zoom : zoom;
    var offsetX = autoFit ? fitOffsetX : 0;
    var offsetY = autoFit ? fitOffsetY : 0;
    svg.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) translate(' + panX + 'px, ' + panY + 'px) scale(' + effectiveZoom + ')';
    label.textContent = Math.round(effectiveZoom * 100) + '%';
    range.value = String(Math.round(zoom * 100));
    var layoutZoom = autoFit ? fitScale * zoom : zoom;
    frame.style.height = Math.max(0, Math.round(baseFrameHeight * layoutZoom)) + 'px';
  }

  function setZoom(next) {
    autoFit = false;
    zoom = clamp(Number(next.toFixed(2)), minZoom, maxZoom);
    apply();
  }

  function zoomBy(delta) {
    setZoom(zoom + delta);
  }

  function fitToFrame() {
    var frameWidth = frame.clientWidth || 1;
    var frameHeight = Math.max(frame.clientHeight || 0, baseFrameHeight);
    var viewBox = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
    var svgWidth = viewBox && viewBox.width ? viewBox.width : svg.clientWidth || frameWidth;
    var svgHeight = viewBox && viewBox.height ? viewBox.height : svg.clientHeight || frameHeight;
    var fit = Math.min((frameWidth - 16) / svgWidth, (frameHeight - 16) / svgHeight);
    var presentationBoost = 1.35;
    fitScale = clamp(Number(((fit || 1) * presentationBoost).toFixed(2)), minZoom, maxZoom);
    fitOffsetX = 0;
    fitOffsetY = 0;
    zoom = 1;
    panX = 0;
    panY = 0;
    autoFit = true;
    apply();
  }

  zoomIn.addEventListener('click', function () { zoomBy(step); });
  zoomOut.addEventListener('click', function () { zoomBy(-step); });
  zoomReset.addEventListener('click', function () {
    fitToFrame();
  });
  range.addEventListener('input', function () {
    autoFit = false;
    zoom = clamp(Number(range.value) / 100, minZoom, maxZoom);
    apply();
  });
  frame.addEventListener('wheel', function (event) {
    event.preventDefault();
    autoFit = false;
    zoomBy(event.deltaY > 0 ? -step : step);
  }, { passive: false });
  frame.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    autoFit = false;
    dragging = true;
    frame.classList.add('is-dragging');
    origin = { x: event.clientX - panX, y: event.clientY - panY };
    frame.setPointerCapture(event.pointerId);
  });
  frame.addEventListener('pointermove', function (event) {
    if (!dragging || !origin) return;
    panX = event.clientX - origin.x;
    panY = event.clientY - origin.y;
    apply();
  });
  function stopDragging() {
    dragging = false;
    origin = null;
    frame.classList.remove('is-dragging');
  }
  frame.addEventListener('pointerup', stopDragging);
  frame.addEventListener('pointercancel', stopDragging);
  window.addEventListener('resize', function () {
    if (autoFit) fitToFrame();
  });

  fitToFrame();
})();
</script>`;
}

function extractMermaidBlock(rendered) {
  const match = String(rendered || "").match(/```mermaid\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

function renderFlowchartSvg(source) {
  const lines = String(source || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const edges = [];
  const nodes = new Map();
  let direction = "TD";
  for (const line of lines) {
    if (/^flowchart\s+/i.test(line)) {
      const parts = line.split(/\s+/);
      direction = (parts[1] || "TD").toUpperCase();
      continue;
    }
    if (line.startsWith("subgraph ") || line === "end" || line.startsWith("%%")) continue;
    const nodeDefMatch = line.match(/^([A-Za-z0-9_-]+)\[(.*)\]$/);
    if (nodeDefMatch && !line.includes("-->")) {
      const nodeId = nodeDefMatch[1];
      const nodeLabel = parseMermaidNodeLabel(nodeDefMatch[2]);
      if (!nodes.has(nodeId)) nodes.set(nodeId, { id: nodeId, label: nodeLabel });
      else nodes.get(nodeId).label = nodeLabel;
      continue;
    }
    const edgeMatch = line.match(/^([A-Za-z0-9_-]+)(?:\[(.*?)\])?\s*-\->\s*([A-Za-z0-9_-]+)(?:\[(.*?)\])?$/);
    if (!edgeMatch) continue;
    const from = edgeMatch[1];
    const fromLabel = edgeMatch[2] || from;
    const to = edgeMatch[3];
    const toLabel = edgeMatch[4] || to;
    edges.push([from, to]);
    if (!nodes.has(from)) nodes.set(from, { id: from, label: fromLabel });
    if (!nodes.has(to)) nodes.set(to, { id: to, label: toLabel });
  }
  if (!edges.length) return "";
  const ordered = buildNodeOrder(edges);
  const horizontal = direction === "LR" || direction === "RL";
  const nodeWidth = horizontal ? 220 : 280;
  const nodeHeight = horizontal ? 86 : 66;
  const gapX = horizontal ? 42 : 46;
  const gapY = horizontal ? 42 : 62;
  const padding = 24;
  const layout = ordered.map((id, index) => {
    const x = horizontal ? padding + index * (nodeWidth + gapX) : padding + (index % 2) * (nodeWidth + gapX);
    const y = horizontal ? padding + (index % 2) * (nodeHeight + gapY) : padding + index * (nodeHeight + gapY);
    return { id, x, y };
  });
  const maxX = Math.max(...layout.map((item) => item.x + nodeWidth));
  const maxY = Math.max(...layout.map((item) => item.y + nodeHeight));
  const svgWidth = horizontal ? maxX + padding : Math.max(nodeWidth + padding * 2, maxX + padding);
  const svgHeight = horizontal ? Math.max(nodeHeight * 2 + gapY + padding * 2, maxY + padding) : maxY + padding;
  const nodeById = new Map(layout.map((item) => [item.id, item]));
  const nodeMarkup = layout.map((item) => {
    const label = nodeLabel(nodes.get(item.id) ? nodes.get(item.id).label : item.id);
    return `
      <g transform="translate(${item.x}, ${item.y})">
        <rect rx="16" ry="16" width="${nodeWidth}" height="${nodeHeight}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6" vector-effect="non-scaling-stroke"></rect>
        <text x="${nodeWidth / 2}" y="${nodeHeight / 2 - 6}" text-anchor="middle" font-size="16" font-weight="650" fill="#0f172a">${escapeXml(label.line1)}</text>
        ${label.line2 ? `<text x="${nodeWidth / 2}" y="${nodeHeight / 2 + 16}" text-anchor="middle" font-size="13" fill="#475569">${escapeXml(label.line2)}</text>` : ""}
      </g>`;
  }).join("");
  const arrowMarkup = edges.map(([from, to]) => {
    const fromNode = nodeById.get(from);
    const toNode = nodeById.get(to);
    if (!fromNode || !toNode) return "";
    const x1 = horizontal ? fromNode.x + nodeWidth : fromNode.x + nodeWidth / 2;
    const y1 = horizontal ? fromNode.y + nodeHeight / 2 : fromNode.y + nodeHeight;
    const x2 = horizontal ? toNode.x : toNode.x + nodeWidth / 2;
    const y2 = horizontal ? toNode.y + nodeHeight / 2 : toNode.y;
    const marker = "url(#kvdf-arrow)";
    return horizontal
      ? `<path d="M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="2.2" marker-end="${marker}" vector-effect="non-scaling-stroke"></path>`
      : `<path d="M ${x1} ${y1} C ${x1} ${y1 + 24}, ${x2} ${y2 - 24}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="2.2" marker-end="${marker}" vector-effect="non-scaling-stroke"></path>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Planner visual diagram">
      <defs>
        <marker id="kvdf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"></path>
        </marker>
      </defs>
      <g>${arrowMarkup}</g>
      <g>${nodeMarkup}</g>
    </svg>`;
}

function buildNodeOrder(edges) {
  const order = [];
  const seen = new Set();
  for (const [from, to] of edges) {
    if (!seen.has(from)) {
      order.push(from);
      seen.add(from);
    }
    if (!seen.has(to)) {
      order.push(to);
      seen.add(to);
    }
  }
  return order;
}

function nodeLabel(id) {
  const label = String(id || "").replace(/\\n/g, "\n").replace(/_/g, " ");
  const splitLines = label.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (splitLines.length > 1) {
    return {
      line1: splitLines[0],
      line2: splitLines[1]
    };
  }
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return { line1: titleCase(label), line2: "" };
  return { line1: titleCase(parts.slice(0, 2).join(" ")), line2: titleCase(parts.slice(2).join(" ")) };
}

function parseMermaidNodeLabel(value) {
  const raw = String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .replace(/\\n/g, "\n");
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return "";
  if (lines.length === 1) return lines[0];
  return `${lines[0]}\n${lines[1]}`;
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .map((word) => word ? word[0].toUpperCase() + word.slice(1) : "")
    .join(" ");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPlannerContext(deps = {}) {
  const repoRootPath = typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd();
  const evolutionFile = path.join(repoRootPath, ".kabeeri", "evolution.json");
  const tasksFile = path.join(repoRootPath, ".kabeeri", "tasks.json");
  const projectFile = path.join(repoRootPath, ".kabeeri", "project.json");
  const plannerFile = path.join(repoRootPath, PLANNER_STATE_FILE);
  const capabilityRegistryFile = path.join(repoRootPath, "knowledge", "standard_systems", "KVDF_CANONICAL_CAPABILITY_REGISTRY.json");
  const evolutionState = fs.existsSync(evolutionFile) ? safeReadJson(evolutionFile) : { changes: [], development_priorities: [] };
  const taskState = fs.existsSync(tasksFile) ? safeReadJson(tasksFile) : { tasks: [] };
  const projectState = fs.existsSync(projectFile) ? safeReadJson(projectFile) : null;
  const plannerState = fs.existsSync(plannerFile) ? safeReadJson(plannerFile) : null;
  const capabilityRegistry = fs.existsSync(capabilityRegistryFile) ? safeReadJson(capabilityRegistryFile) : null;
  const resumeReport = safeBuild(() => (typeof deps.buildResumeReport === "function" ? deps.buildResumeReport({ scan: false }) : null));
  const pluginLoader = safeBuild(() => (typeof deps.buildPluginLoaderReport === "function" ? deps.buildPluginLoaderReport() : null));
  const gitState = safeBuild(() => readGitRepositoryState(repoRootPath));
  const openTasksTotal = Array.isArray(taskState.tasks)
    ? taskState.tasks.filter((task) => !["owner_verified", "done", "closed", "rejected"].includes(String(task.status || "").toLowerCase())).length
    : 0;
  const openPrioritiesTotal = Array.isArray(evolutionState.development_priorities)
    ? evolutionState.development_priorities.filter((item) => !["done", "deferred", "rejected"].includes(String(item.status || "").toLowerCase())).length
    : 0;
  const currentTrack = resumeReport && resumeReport.primary_track ? resumeReport.primary_track.id : inferTrackFromWorkspace(repoRootPath);
  return {
    repo_root: repoRootPath,
    execution_cwd: process.cwd(),
    current_track: currentTrack,
    source: {
      report_type: "kvdf_planner_context",
      track: currentTrack || "framework_owner",
      runtime_state_present: fs.existsSync(path.join(repoRootPath, ".kabeeri")),
      open_tasks_total: openTasksTotal,
      open_priorities_total: openPrioritiesTotal,
      evolution_summary: resumeReport && resumeReport.evolution ? {
        current_change_id: resumeReport.evolution.current_change_id || null,
        next_priority: resumeReport.evolution.next_priority ? {
          id: resumeReport.evolution.next_priority.id || null,
          title: resumeReport.evolution.next_priority.title || null,
          status: resumeReport.evolution.next_priority.status || null
        } : null
      } : null,
      capability_registry: capabilityRegistry ? {
        report_type: capabilityRegistry.report_type || "kvdf_canonical_capability_registry",
        registry_version: capabilityRegistry.registry_version || "1",
        area_count: Array.isArray(capabilityRegistry.areas) ? capabilityRegistry.areas.length : 0
      } : null,
      planner_state: plannerState ? {
        planner_version: plannerState.planner_version || "1",
        current_plan_id: plannerState.current_plan_id || null,
        proposed_plans_total: Array.isArray(plannerState.plans) ? plannerState.plans.length : 0,
        approved_plans_total: Array.isArray(plannerState.plans) ? plannerState.plans.filter((item) => String(item.status || "").toLowerCase() === "approved").length : 0
      } : null,
      plugin_loader: pluginLoader ? {
        total_plugins: pluginLoader.total_plugins || 0,
        active_plugins: pluginLoader.active_plugins || 0,
        plugin_ids: Array.isArray(pluginLoader.plugins) ? pluginLoader.plugins.map((item) => item.plugin_id) : []
      } : null,
      git: gitState ? {
        available: Boolean(gitState.available),
        is_repo: Boolean(gitState.is_repo),
        root: gitState.root || null,
        current_branch: gitState.current_branch || null
      } : null,
      project: projectState ? {
        product_name: projectState.product_name || "",
        profile: projectState.profile || null,
        delivery_mode: projectState.delivery_mode || null,
        slug: projectState.slug || null
      } : null,
      workspace_mode: resumeReport ? resumeReport.mode || null : null
    },
    resume_report: resumeReport,
    plugin_loader: pluginLoader,
    git_state: gitState,
    task_state: taskState,
    evolution_state: evolutionState,
    project_state: projectState
  };
}

function resolvePlannerRequest({ action, value, flags, rest }, deps = {}) {
  const explicitTrack = normalizeTrackAlias(flags.track);
  const explicitPlugin = normalizePluginId(flags.plugin);
  const planningMethod = normalizePlannerMethod(
    readPlannerFlag(flags, "method", "planning-method", "planning_method") ||
    flags.method ||
    flags.planning_method ||
    null
  );
  const goal = resolveGoal(value, flags, rest, "");
  const context = buildPlannerContext(deps);
  const mode = explicitPlugin ? "plugin" : (explicitTrack || detectPlannerMode(context, explicitTrack));
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext({ plugin_id: explicitPlugin }, context) : null;
  const sourceControl = buildPlannerSourceControl({ flags }, context, mode, deliveryMode, pluginContext);
  const recommendedEvolution = recommendNextEvolution(mode, context, pluginContext, { goal });
  return {
    action,
    goal,
    mode,
    deliveryMode,
    method: planningMethod || null,
    planning_method: planningMethod || null,
    plugin_id: pluginContext ? pluginContext.plugin_id : null,
    source_control: sourceControl,
    recommended_evolution: recommendedEvolution,
    context
  };
}

function detectPlannerMode(context, explicitTrack) {
  if (explicitTrack) return explicitTrack;
  if (context.resume_report && context.resume_report.primary_track && context.resume_report.primary_track.id === "vibe_app_developer") return "vibe";
  if (context.resume_report && context.resume_report.primary_track && context.resume_report.primary_track.id === "framework_owner") return "owner";
  if (context.current_track === "vibe_app_developer") return "vibe";
  return "owner";
}

function resolvePlannerMode(request, context) {
  if (request.plugin_id) return "plugin";
  if (request.mode) return request.mode;
  return detectPlannerMode(context, null);
}

function recommendNextEvolution(mode, context, pluginContext, request = {}) {
  if (mode === "vibe") {
    const openTask = Array.isArray(context.task_state.tasks)
      ? context.task_state.tasks.find((task) => !["done", "closed", "rejected", "owner_verified"].includes(String(task.status || "").toLowerCase()))
      : null;
    const productName = context.project_state && context.project_state.product_name ? context.project_state.product_name : "App Delivery";
    return {
      evolution_id: normalizeEvolutionId(`${productName} delivery slice`),
      title: request.goal || `${productName} Delivery Slice`,
      reason: openTask
        ? `The current app-track work can continue from the next open task: ${openTask.title}, keeping the delivery local-first.`
        : "The next app-track step is a local-first delivery slice that keeps intake, blueprinting, and handoff separated from KVDF Core work.",
      area: "vibe_development_pipeline_dev",
      risk: openTask ? "medium" : "low"
    };
  }

  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : normalizePluginId(request.plugin_id) || "plugin";
    const pluginName = pluginContext && pluginContext.name ? pluginContext.name : pluginId;
    return {
      evolution_id: normalizeEvolutionId(`${pluginId} plugin slice`),
      title: request.goal || `${pluginName} Plugin Delivery Slice`,
      reason: `The plugin track should keep manifest, docs, runtime, and tests in parity for ${pluginName}.`,
      area: "plugins_dev",
      risk: "medium"
    };
  }

  const summary = context.resume_report && context.resume_report.evolution ? context.resume_report.evolution : null;
  const nextPriority = summary && summary.next_priority ? summary.next_priority : null;
  if (nextPriority) {
    return {
      evolution_id: nextPriority.id || normalizeEvolutionId(nextPriority.title || "next kvdf evolution"),
      title: nextPriority.title || "Next KVDF Evolution",
      reason: "The current open framework priority is the next governed Evolution.",
      area: "kvdf_development_pipeline_dev",
      risk: String(nextPriority.risk || "medium").toLowerCase()
    };
  }
  return {
    evolution_id: "kvdf-planner-track-awareness",
    title: request.goal || "KVDF Planner Track Awareness",
    reason: "No open framework-owner priority or task punch remains, so the repository should keep the planner track-aware and deterministic from local context.",
    area: "kvdf_development_pipeline_dev",
    risk: "medium"
  };
}

function buildPlannerReason(mode, context, pluginContext) {
  if (mode === "vibe") {
    return "The app track needs a local-first planner that keeps intake, blueprints, task slicing, verification, and handoff separate from KVDF Core.";
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return `The plugin track needs manifest, docs, runtime, and tests in parity for ${pluginId}.`;
  }
  return context.source.open_tasks_total > 0
    ? "The repository still has active framework work that should be wrapped in a deterministic planner plan before execution."
    : "The repository needs the track-aware planner layer so Codex can recommend the next governed Evolution from local context.";
}

function buildPlannerInScope(mode, context, pluginContext) {
  if (mode === "vibe") {
    return [
      "File-based app intake and planning",
      "App-track evolution slices and task punch generation",
      "Local-first handoff with optional GitHub mirroring",
      "App workspace boundaries and app-facing docs"
    ];
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return [
      `Manifest and docs parity for ${pluginId}`,
      "Runtime and tests parity for the selected plugin",
      "Plugin install / enable / disable / uninstall lifecycle checks",
      "Plugin mount and plugin-link runtime safety"
    ];
  }
  return [
    "Planner governance docs and workflow docs",
    "Planner schemas, prompt templates, and CLI command wiring",
    "Deterministic next-Evolution recommendation from repo/runtime context",
    "Task Punch generation with allowed and forbidden file lists",
    "Codex-ready prompt generation for direct-to-main KVDF Core delivery"
  ];
}

function buildPlannerOutOfScope(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_OUT_OF_SCOPE];
  if (mode === "plugin") return [...PLUGIN_OUT_OF_SCOPE];
  return [...OWNER_OUT_OF_SCOPE];
}

function buildPlannerAllowedFiles(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_ALLOWED_FILES];
  if (mode === "plugin") return buildPluginAllowedFiles(pluginContext);
  return [...OWNER_ALLOWED_FILES];
}

function buildPlannerForbiddenFiles(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_FORBIDDEN_FILES];
  if (mode === "plugin") return [...PLUGIN_FORBIDDEN_FILES];
  return [...OWNER_FORBIDDEN_FILES];
}

function buildPlannerAcceptanceCriteria(mode, context, pluginContext) {
  if (mode === "vibe") {
    return [
      "The planner keeps app-track intake local-first by default.",
      "The planner separates app delivery from KVDF Core edits unless the Owner explicitly requests framework work.",
      "The generated prompt includes the file-based intake, evolution, task slicing, verify, and handoff pipeline."
    ];
  }
  if (mode === "plugin") {
    return [
      "The plugin manifest, docs, runtime, and tests remain in parity.",
      "The planner output protects plugin mount and plugin-link state.",
      "The generated prompt includes plugin lifecycle checks and parity guidance."
    ];
  }
  return [
    "The planner can recommend the next KVDF Core Evolution without relying on chat memory.",
    "The planner can emit a Task Punch with scoped tasks, allowed files, forbidden files, validation commands, and a stop condition.",
    "The planner can emit a Codex-ready execution prompt for KVDF Core direct-to-main delivery.",
    "The planner does not write runtime state under .kabeeri/ in the MVP.",
    "The planner keeps branch/PR optional and never treats it as the default KVDF Core path."
  ];
}

function buildPlannerValidationCommands(mode, context, pluginContext) {
  const commands = [...DEFAULT_VALIDATION_COMMANDS];
  if (mode === "plugin") commands.unshift("kvdf plugins status");
  if (mode === "vibe") commands.unshift("kvdf dashboard state --json");
  return commands;
}

function getPlannerNextAction(mode, title, pluginContext) {
  return buildPlannerNextAction(mode, title, pluginContext);
}

function buildPlannerStopCondition(mode, context, pluginContext) {
  if (mode === "vibe") {
    return "Stop if the requested change would touch KVDF Core by default, write runtime state outside the app-first flow, or treat branch/PR as mandatory for local-first app delivery.";
  }
  if (mode === "plugin") {
    return "Stop if the requested change would touch unrelated plugins, break plugin mount/runtime safety, or write plugin-link runtime state without an explicit plugin Evolution.";
  }
  return "Stop if the requested change would touch KVDOS, runtime state under .kabeeri/, plugin runtime behavior, dashboard behavior, or any file outside the allowed KVDF Core planner scope.";
}

function buildPlannerNextAction(mode, title, pluginContext) {
  if (mode === "vibe") {
    return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track vibe --json`;
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track plugin --plugin ${pluginId} --json`;
  }
  return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track owner --json`;
}

function buildPluginAllowedFiles(pluginContext) {
  const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
  const pluginRoot = path.relative(repoRoot(), getPluginSourcePath(pluginId)).replace(/\\/g, "/");
  return [
    `${pluginRoot}/plugin.json`,
    `${pluginRoot}/README.md`,
    `${pluginRoot}/docs/`,
    `${pluginRoot}/runtime/`,
    `${pluginRoot}/tests/`,
    `${pluginRoot}/schemas/`,
    "src/cli/commands/plugin.js",
    "src/cli/services/plugin_loader.js",
    "src/cli/services/plugin_mounts.js",
    "docs/cli/CLI_COMMAND_REFERENCE.md",
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    "knowledge/governance/KVDF_PLANNER_LAYER.md",
    "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
  ];
}

function buildPluginContext(request, context) {
  const pluginId = normalizePluginId(request.plugin_id) || "kvdf-dev";
  const plugin = context.plugin_loader && Array.isArray(context.plugin_loader.plugins)
    ? context.plugin_loader.plugins.find((item) => item.plugin_id === pluginId || item.name === pluginId)
    : null;
  return {
    plugin_id: pluginId,
    name: plugin ? plugin.name || pluginId : pluginId,
    track: "plugin",
    plugin_family: plugin ? plugin.plugin_family || null : null,
    plugin_type: plugin ? plugin.plugin_type || null : null,
    enabled_by_default: plugin ? Boolean(plugin.enabled_by_default) : true,
    removable: plugin ? Boolean(plugin.removable) : true,
    runtime_entrypoint: plugin ? plugin.runtime_entrypoint || null : null,
    command_surface: plugin ? plugin.command_surface || [] : [],
    docs_surface: plugin ? plugin.docs_surface || [] : [],
    manifest_path: plugin ? plugin.manifest_path || null : null
  };
}

function getPlannerTrack(mode) {
  if (mode === "vibe") return "vibe_app_developer";
  if (mode === "plugin") return "plugin";
  return "framework_owner";
}

function getPlannerArea(mode) {
  if (mode === "vibe") return "vibe_development_pipeline_dev";
  if (mode === "plugin") return "plugins_dev";
  return "kvdf_development_pipeline_dev";
}

function getDeliveryMode(mode) {
  return mode === "vibe" ? "local_first" : "direct_main";
}

function readPlannerFlag(flags = {}, ...names) {
  for (const name of names) {
    if (flags && Object.prototype.hasOwnProperty.call(flags, name)) return flags[name];
    const underscored = String(name).replace(/-/g, "_");
    if (flags && Object.prototype.hasOwnProperty.call(flags, underscored)) return flags[underscored];
  }
  return undefined;
}

function normalizeSourceControlProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "none") return "none";
  if (normalized === "git" || normalized === "custom") return normalized;
  return null;
}

function normalizeRemoteProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "none") return "none";
  if (normalized === "github" || normalized === "gitlab" || normalized === "bitbucket" || normalized === "custom") return normalized;
  return null;
}

function normalizeSourceControlMode(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return null;
  if (normalized === "local_only" || normalized === "direct_main" || normalized === "branch" || normalized === "branch_pr" || normalized === "none") return normalized;
  return null;
}

function buildPlannerSourceControl(request = {}, context = {}, mode = "owner", deliveryMode = getDeliveryMode(mode), pluginContext = null) {
  const gitState = context.git_state || { available: false, is_repo: false, root: null, current_branch: null };
  const gitRepoDetected = Boolean(gitState && gitState.is_repo);
  const requestedProvider = normalizeSourceControlProvider(readPlannerFlag(request.flags || {}, "source-control", "source_control"));
  const requestedMode = normalizeSourceControlMode(readPlannerFlag(request.flags || {}, "sc-mode", "sc_mode"));
  const requestedRemote = normalizeRemoteProvider(readPlannerFlag(request.flags || {}, "remote-provider", "remote_provider"));
  const explicitProviderPlugin = normalizePluginId(readPlannerFlag(request.flags || {}, "provider-plugin", "provider_plugin"));
  const defaultMode = mode === "vibe"
    ? "local_only"
    : "direct_main";
  const explicitLocalOnly = requestedMode === "none" || requestedProvider === "none";
  const sourceControlMode = gitRepoDetected
    ? (explicitLocalOnly ? "local_only" : (requestedMode || defaultMode))
    : "local_only";
  const wantsLocalOnly = !gitRepoDetected || sourceControlMode === "local_only" || explicitLocalOnly;
  const defaultProvider = wantsLocalOnly ? "none" : "git";
  const provider = wantsLocalOnly ? "none" : (requestedProvider || defaultProvider);
  const remoteProvider = wantsLocalOnly ? "none" : (requestedRemote || "none");
  const enabled = !wantsLocalOnly && provider !== "none" && gitRepoDetected;
  const branchingEnabled = enabled && (sourceControlMode === "branch" || sourceControlMode === "branch_pr");
  const prEnabled = enabled && sourceControlMode === "branch_pr" && remoteProvider !== "none";
  const providerPlugin = remoteProvider === "github"
    ? "github"
    : (remoteProvider === "custom" ? explicitProviderPlugin || null : null);
  const notes = [];
  if (!gitRepoDetected) {
    notes.push("No Git repository detected; source control is local-only for this plan.");
  } else {
    notes.push(`Git repository detected${gitState.current_branch ? ` on ${gitState.current_branch}` : ""}.`);
  }
  if (provider === "git" && sourceControlMode === "direct_main") {
    notes.push("Git direct-to-main is the default for KVDF Core owner-track planning.");
  }
  if (mode === "vibe") {
    notes.push("Vibe/App planning stays local-first unless source control is explicitly enabled.");
  }
  if (branchingEnabled && !prEnabled) {
    notes.push("Branch workflow is enabled without PR.");
  }
  if (prEnabled) {
    notes.push(`PR workflow is enabled through ${remoteProvider === "github" ? "GitHub" : remoteProvider}.`);
  }
  if (remoteProvider === "github") {
    notes.push("GitHub is an optional remote/provider plugin, not the same thing as Git.");
  }
  if (!enabled) {
    notes.push("Source control is disabled for this plan.");
  }
  return {
    enabled,
    provider,
    remote_provider: remoteProvider,
    provider_plugin: providerPlugin,
    mode: sourceControlMode,
    branching_enabled: branchingEnabled,
    pr_enabled: prEnabled,
    default_branch: "main",
    current_branch: enabled ? gitState.current_branch || null : null,
    requires_owner_approval: true,
    replaceable_provider: true,
    notes
  };
}

function summarizeSourceControl(sourceControl = {}) {
  const provider = String(sourceControl.provider || "none");
  const remoteProvider = String(sourceControl.remote_provider || "none");
  const mode = String(sourceControl.mode || "local_only");
  const parts = [provider, mode];
  if (remoteProvider && remoteProvider !== "none") parts.push(`remote:${remoteProvider}`);
  if (sourceControl.branching_enabled) parts.push("branching");
  if (sourceControl.pr_enabled) parts.push("pr");
  return parts.join(" / ");
}

function normalizePlannerAction(value) {
  return String(value || "next").trim().toLowerCase();
}

function normalizeTrackAlias(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase().replace(/[\s_-]+/g, "_");
  return MODE_ALIASES[normalized] || null;
}

function normalizePluginId(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function resolveGoal(value, flags = {}, rest = [], fallback = "") {
  const candidates = [value, flags.idea, flags.goal, flags.title, rest.filter(Boolean).join(" "), fallback];
  const goal = candidates.find((item) => typeof item === "string" && item.trim());
  return goal ? String(goal).trim() : "";
}

function normalizeEvolutionTitle(goal, mode, context, pluginContext) {
  const text = String(goal || "").trim();
  if (mode === "vibe") {
    if (text) return text;
    const projectName = context.project_state && context.project_state.product_name ? context.project_state.product_name : "App Delivery";
    return `${projectName} Delivery Slice`;
  }
  if (mode === "plugin") {
    const pluginName = pluginContext && pluginContext.name ? pluginContext.name : "Plugin";
    return text || `${pluginName} Plugin Delivery Slice`;
  }
  if (/planner/i.test(text)) return text || "KVDF Planner Track Awareness";
  if (/direct[- ]?to[- ]?main/i.test(text)) return "KVDF Core Direct-to-Main Delivery Guidance";
  if (/capability/i.test(text)) return "KVDF Canonical Capability Registry";
  return text ? `KVDF Core Evolution - ${text}` : "KVDF Core Evolution MVP";
}

function normalizeEvolutionId(title) {
  return String(title || "kvdf-evolution").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferTrackFromWorkspace(repoRootPath) {
  const packageFile = path.join(repoRootPath, "package.json");
  const workspaceFile = path.join(repoRootPath, ".kabeeri", "workspace.json");
  if (!fs.existsSync(path.join(repoRootPath, ".kabeeri"))) return "framework_owner";
  if (fs.existsSync(workspaceFile)) return "vibe";
  if (fs.existsSync(packageFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      if (String(pkg.name || "").toLowerCase() !== "kabeeri-vdf") return "vibe";
    } catch (_) {
      return "vibe";
    }
  }
  return "framework_owner";
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function safeBuild(factory) {
  try {
    return factory();
  } catch {
    return null;
  }
}

function loadPlannerState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), PLANNER_STATE_FILE);
  if (!fs.existsSync(filePath)) {
    return { planner_version: "1", current_plan_id: null, plans: [] };
  }
  const state = safeReadJson(filePath);
  return normalizePlannerState(state);
}

function savePlannerState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), PLANNER_STATE_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(normalizePlannerState(state), null, 2)}\n`, "utf8");
}

function loadPlannerEvolutionState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "evolution.json");
  if (!fs.existsSync(filePath)) {
    return { changes: [], impact_plans: [], current_change_id: null };
  }
  const state = safeReadJson(filePath);
  state.changes = Array.isArray(state.changes) ? state.changes : [];
  state.impact_plans = Array.isArray(state.impact_plans) ? state.impact_plans : [];
  state.current_change_id = state.current_change_id || null;
  return state;
}

function savePlannerEvolutionState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "evolution.json");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function loadPlannerTasksState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "tasks.json");
  if (!fs.existsSync(filePath)) {
    return { tasks: [] };
  }
  const state = safeReadJson(filePath);
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  return state;
}

function savePlannerTasksState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "tasks.json");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function savePlannerMaterializationReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function normalizePlannerState(state = {}) {
  const plans = Array.isArray(state.plans) ? state.plans.map(normalizePlannerPlanRecord).filter(Boolean) : [];
  return {
    planner_version: String(state.planner_version || "1"),
    current_plan_id: state.current_plan_id || null,
    plans,
    latest_feedback: state.latest_feedback || null
  };
}

function normalizePlannerPlanRecord(plan = {}) {
  if (!plan || typeof plan !== "object") return null;
  const planId = String(plan.plan_id || "").trim();
  if (!planId) return null;
  return {
    plan_id: planId,
    status: normalizePlannerStatus(plan.status),
    planner_mode: normalizePlannerMode(plan.planner_mode),
    track: normalizePlannerTrack(plan.track),
    delivery_mode: String(plan.delivery_mode || "direct_main"),
    goal: String(plan.goal || "").trim(),
    recommended_evolution: plan.recommended_evolution || {},
    task_punch: plan.task_punch || {},
    codex_prompt: String(plan.codex_prompt || ""),
    planning_method: String(plan.planning_method || ""),
    method_reason: String(plan.method_reason || ""),
    confidence: String(plan.confidence || ""),
    review: plan.review || null,
    documentation_files: Array.isArray(plan.documentation_files) ? [...plan.documentation_files] : [],
    docs_plan: plan.docs_plan || null,
    docs_status: plan.docs_status || null,
    design_artifacts: plan.design_artifacts || null,
    version_plan: plan.version_plan || null,
    evolutions: Array.isArray(plan.evolutions) ? [...plan.evolutions] : [],
    task_punches: Array.isArray(plan.task_punches) ? [...plan.task_punches] : [],
    visual_planning: plan.visual_planning || null,
    source_pipeline: plan.source_pipeline || null,
    allowed_files: Array.isArray(plan.allowed_files) ? [...plan.allowed_files] : [],
    forbidden_files: Array.isArray(plan.forbidden_files) ? [...plan.forbidden_files] : [],
    out_of_scope: Array.isArray(plan.out_of_scope) ? [...plan.out_of_scope] : [],
    validation_commands: Array.isArray(plan.validation_commands) ? [...plan.validation_commands] : [],
    stop_condition: String(plan.stop_condition || ""),
    visual: plan.visual || null,
    source_control: plan.source_control || null,
    created_at: plan.created_at || null,
    approved_at: plan.approved_at || null,
    approved_by: plan.approved_by || null,
    rejected_at: plan.rejected_at || null,
    rejection_reason: plan.rejection_reason || null,
    completed_at: plan.completed_at || null,
    completion_note: plan.completion_note || null,
    materialized_at: plan.materialized_at || null,
    materialization_status: plan.materialization_status || null,
    evolution_change_id: plan.evolution_change_id || null,
    materialized_task_ids: Array.isArray(plan.materialized_task_ids) ? [...plan.materialized_task_ids] : [],
    materialization_report_path: plan.materialization_report_path || null,
    plugin_context: plan.plugin_context || null,
    pipeline: Array.isArray(plan.pipeline) ? [...plan.pipeline] : undefined,
    latest_feedback: plan.latest_feedback || null
  };
}

function buildPlannerPlanRecord({
  planId,
  goal,
  mode,
  deliveryMode,
  evolutionPlan,
  taskPunch,
  visual,
  codexPrompt,
  pluginContext,
  sourceControl,
  createdAt,
  planningMethod,
  methodReason,
  confidence,
  review,
  documentationFiles,
  docsPlan,
  docsStatus,
  designArtifacts,
  versionPlan,
  evolutions,
  taskPunches,
  visualPlanning,
  sourcePipeline
}) {
  const plan = {
    plan_id: planId,
    status: "proposed",
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    goal,
    recommended_evolution: evolutionPlan,
    task_punch: taskPunch,
    codex_prompt: codexPrompt,
    planning_method: planningMethod || "",
    method_reason: methodReason || "",
    confidence: confidence || "",
    review: review || null,
    documentation_files: Array.isArray(documentationFiles) ? [...documentationFiles] : [],
    docs_plan: docsPlan || null,
    docs_status: docsStatus || null,
    design_artifacts: designArtifacts || null,
    version_plan: versionPlan || null,
    evolutions: Array.isArray(evolutions) ? [...evolutions] : [],
    task_punches: Array.isArray(taskPunches) ? [...taskPunches] : [],
    visual_planning: visualPlanning || null,
    source_pipeline: sourcePipeline || null,
    allowed_files: [...(evolutionPlan.allowed_files || [])],
    forbidden_files: [...(evolutionPlan.forbidden_files || [])],
    out_of_scope: [...(evolutionPlan.out_of_scope || [])],
    validation_commands: [...(evolutionPlan.validation_commands || [])],
    stop_condition: evolutionPlan.stop_condition || "",
    visual: visual || null,
    source_control: sourceControl || null,
    created_at: createdAt,
    approved_at: null,
    approved_by: null,
    rejected_at: null,
    rejection_reason: null,
    completed_at: null,
    completion_note: null,
    materialized_at: null,
    materialization_status: null,
    evolution_change_id: null,
    materialized_task_ids: [],
    materialization_report_path: null
  };
  if (pluginContext) plan.plugin_context = pluginContext;
  if (Array.isArray(evolutionPlan.pipeline)) plan.pipeline = [...evolutionPlan.pipeline];
  return plan;
}

function resolveMaterializablePlannerPlan(state = {}, planId, flags = {}) {
  const selectedPlanId = isFromCurrentPlan(flags) ? String(state.current_plan_id || "").trim() : String(planId || "").trim();
  if (!selectedPlanId) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const plan = findPlannerPlan(state, selectedPlanId);
  if (!plan) {
    throw new Error(`Planner plan not found: ${selectedPlanId}`);
  }
  const status = String(plan.status || "").toLowerCase();
  if (status !== "approved") {
    throw new Error(`Planner plan ${selectedPlanId} must be approved before materialization.`);
  }
  return plan;
}

function buildPlannerMaterializationArtifact(plan, context = {}) {
  const mode = normalizePlannerMode(plan.planner_mode);
  const deliveryMode = plan.delivery_mode || getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context)) : null;
  const sourceControl = plan.source_control || buildPlannerSourceControl(
    { flags: {} },
    context,
    mode,
    deliveryMode,
    pluginContext
  );
  const evolutionPlan = plan.recommended_evolution && Object.keys(plan.recommended_evolution).length
    ? plan.recommended_evolution
    : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode, deliveryMode, pluginContext }, context);
  const taskPunch = plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length
    ? plan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode, pluginContext }, context);
  return {
    report_type: "kvdf_planner_materialization_artifact",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track || getPlannerTrack(mode),
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    goal: plan.goal || evolutionPlan.title || "",
    evolution_plan: evolutionPlan,
    task_punch: taskPunch,
    plugin_context: pluginContext
  };
}

function upsertPlannerEvolutionRecord(evolutionState, plan, materialization, context = {}) {
  evolutionState.changes = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  evolutionState.impact_plans = Array.isArray(evolutionState.impact_plans) ? evolutionState.impact_plans : [];
  const changeId = plan.evolution_change_id || (plan.recommended_evolution && plan.recommended_evolution.evolution_id) || normalizeEvolutionId(plan.goal || "planner evolution");
  const evolutionPlan = materialization.evolution_plan || {};
  const existing = evolutionState.changes.find((item) => String(item.change_id || "") === changeId) || null;
  const now = new Date().toISOString();
  const change = existing || {
    change_id: changeId,
    title: evolutionPlan.title || plan.goal || "Planner Evolution",
    description: plan.goal || evolutionPlan.reason || evolutionPlan.title || "Planner Evolution",
    status: "planned",
    impacted_areas: [],
    task_ids: [],
    created_at: now
  };
  change.title = evolutionPlan.title || plan.goal || change.title;
  change.description = plan.goal || evolutionPlan.reason || change.description || change.title;
  change.status = "planned";
  change.source = "planner";
  change.planner_source = plan.planner_mode === "owner" ? "planner_owner" : plan.planner_mode === "vibe" ? "planner_vibe" : "planner_plugin";
  change.planner_plan_id = plan.plan_id;
  change.planner_mode = plan.planner_mode;
  change.track = plan.track;
  change.delivery_mode = plan.delivery_mode;
  change.impacted_areas = Array.isArray(evolutionPlan.impacted_areas)
    ? [...evolutionPlan.impacted_areas]
    : (Array.isArray(evolutionPlan.in_scope) ? [...evolutionPlan.in_scope] : []);
  change.in_scope = Array.isArray(evolutionPlan.in_scope) ? [...evolutionPlan.in_scope] : [];
  change.out_of_scope = Array.isArray(evolutionPlan.out_of_scope) ? [...evolutionPlan.out_of_scope] : [];
  change.allowed_files = Array.isArray(evolutionPlan.allowed_files) ? [...evolutionPlan.allowed_files] : [];
  change.forbidden_files = Array.isArray(evolutionPlan.forbidden_files) ? [...evolutionPlan.forbidden_files] : [];
  change.validation_commands = Array.isArray(evolutionPlan.validation_commands) ? [...evolutionPlan.validation_commands] : [];
  change.stop_condition = evolutionPlan.stop_condition || "";
  change.task_ids = [];
  change.updated_at = now;
  change.milestone_id = change.milestone_id || `planner-${changeId}`;
  change.milestone_title = evolutionPlan.title || change.title;
  change.milestone_summary = evolutionPlan.reason || plan.goal || change.description;
  change.milestone_status = "planned";
  change.local_first = plan.delivery_mode === "local_first";
  change.source_control = materialization.source_control || plan.source_control || null;
  change.sync_mode = change.source_control ? String(change.source_control.mode || plan.delivery_mode || "direct_main") : (plan.delivery_mode === "local_first" ? "local_first" : "direct_main");
  change.sync_policy = change.source_control
    ? (String(change.source_control.mode || "").toLowerCase() === "local_only" ? "local_only" : String(change.source_control.mode || plan.delivery_mode || "direct_main"))
    : (plan.delivery_mode === "local_first" ? "local_only" : "direct_main");
  change.github_sync_enabled = Boolean(change.source_control && change.source_control.remote_provider && change.source_control.remote_provider !== "none");
  change.branch_name = change.branch_name || (change.source_control && String(change.source_control.mode || "").toLowerCase() === "local_only" ? "local-first" : `evo/${changeId}`);
  change.merge_target_branch = change.merge_target_branch || (change.source_control && change.source_control.default_branch ? change.source_control.default_branch : "main");
  change.review_gate = change.review_gate || (plan.planner_mode === "owner" ? "owner_approval_required" : "planner_approval_required");
  change.review_required = true;
  change.review_status = change.review_status || "pending";
  change.branch_policy = change.branch_policy || {
    mode: change.source_control ? String(change.source_control.mode || "direct_main") : (plan.delivery_mode === "local_first" ? "local_only" : "direct_main")
  };
  change.task_trash_policy = change.task_trash_policy || {
    enabled: true,
    archive_status: "archived"
  };
  change.release_gate = change.release_gate || {
    enabled: plan.planner_mode === "owner",
    owner_required: true
  };
  change.planner_materialized_at = now;
  change.planner_materialization_status = "materialized";
  change.planner_materialization_report_path = `.kabeeri/reports/planner_materialization_${plan.plan_id}.json`;
  if (existing) {
    const index = evolutionState.changes.findIndex((item) => String(item.change_id || "") === changeId);
    evolutionState.changes[index] = change;
  } else {
    evolutionState.changes.push(change);
  }
  const impactPlan = {
    plan_id: `${changeId}-materialization`,
    change_id: changeId,
    title: change.title,
    status: "planned",
    planner_plan_id: plan.plan_id,
    planner_mode: plan.planner_mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    impacted_areas: [...change.impacted_areas],
    tasks: []
  };
  const impactIndex = evolutionState.impact_plans.findIndex((item) => String(item.change_id || "") === changeId);
  if (impactIndex >= 0) evolutionState.impact_plans[impactIndex] = impactPlan;
  else evolutionState.impact_plans.push(impactPlan);
  return change;
}

function upsertPlannerMaterializationTasks(tasksState, evolutionState, plan, materialization, context = {}, changeId) {
  tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const evolutionPlan = materialization.evolution_plan || {};
  const taskPunch = materialization.task_punch || { tasks: [] };
  const now = new Date().toISOString();
  const createdTasks = [];
  for (const task of taskPunch.tasks || []) {
    const taskId = String(task.id || "").trim();
    if (!taskId) continue;
    const record = {
      id: taskId,
      title: task.title || `Planner task for ${plan.plan_id}`,
      status: "proposed",
      source: `planner:${plan.plan_id}`,
      planner_source: plan.planner_mode === "owner" ? "planner_owner" : plan.planner_mode === "vibe" ? "planner_vibe" : "planner_plugin",
      planner_plan_id: plan.plan_id,
      evolution_change_id: changeId,
      evolution_milestone_id: evolutionState.changes.find((item) => String(item.change_id || "") === changeId)?.milestone_id || `planner-${changeId}`,
      evolution_milestone_title: evolutionState.changes.find((item) => String(item.change_id || "") === changeId)?.milestone_title || plan.goal || evolutionPlan.title || "Planner Evolution",
      track: plan.track,
      allowed_files: Array.isArray(task.allowed_files) ? [...task.allowed_files] : [],
      forbidden_files: Array.isArray(task.forbidden_files) ? [...task.forbidden_files] : [],
      acceptance_criteria: Array.isArray(task.acceptance_criteria) ? [...task.acceptance_criteria] : [],
      validation_commands: Array.isArray(task.validation_commands) ? [...task.validation_commands] : [],
      stop_condition: task.stop_condition || evolutionPlan.stop_condition || "",
      created_at: now,
      source_control: materialization.source_control || plan.source_control || null
    };
    if (task.workstream) record.workstream = task.workstream;
    if (Array.isArray(task.workstreams)) record.workstreams = [...task.workstreams];
    if (plan.planner_mode === "plugin" && plan.plugin_context) record.plugin_context = plan.plugin_context;
    if (plan.delivery_mode === "direct_main") {
      record.branch_name = `evo/${changeId}`;
      record.merge_target_branch = "main";
      record.sync_policy = "direct_main";
      record.github_sync_enabled = true;
    } else {
      record.branch_name = "local-first";
      record.merge_target_branch = "main";
      record.sync_policy = "local_only";
      record.github_sync_enabled = false;
    }
    const existingIndex = tasksState.tasks.findIndex((item) => String(item.id || "") === taskId || String(item.planner_plan_id || "") === plan.plan_id);
    if (existingIndex >= 0) tasksState.tasks[existingIndex] = { ...tasksState.tasks[existingIndex], ...record };
    else tasksState.tasks.push(record);
    createdTasks.push(record);
  }
  const existingTaskIds = new Set(createdTasks.map((task) => task.id));
  for (const task of tasksState.tasks) {
    if (String(task.planner_plan_id || "") === plan.plan_id && !existingTaskIds.has(task.id)) {
      task.evolution_change_id = changeId;
    }
  }
  if (changeId) {
    const evolutionStateTaskTargets = createdTasks.map((task) => task.id);
    const idx = Array.isArray(evolutionState.changes)
      ? evolutionState.changes.findIndex((item) => String(item.change_id || "") === changeId)
      : -1;
    if (idx >= 0) {
      evolutionState.changes[idx].task_ids = evolutionStateTaskTargets;
      evolutionState.changes[idx].updated_at = now;
    }
    const impactIdx = Array.isArray(evolutionState.impact_plans)
      ? evolutionState.impact_plans.findIndex((item) => String(item.change_id || "") === changeId)
      : -1;
    if (impactIdx >= 0) {
      evolutionState.impact_plans[impactIdx].tasks = createdTasks.map((task) => ({
        task_id: task.id,
        title: task.title,
        allowed_files: Array.isArray(task.allowed_files) ? [...task.allowed_files] : [],
        validation_commands: Array.isArray(task.validation_commands) ? [...task.validation_commands] : []
      }));
      evolutionState.impact_plans[impactIdx].updated_at = now;
    }
  }
  return createdTasks;
}

function buildPlannerMaterializationReport({ plan, materialization, evolutionRecord, taskRecords, reportPath, materializedAt }) {
  return {
    report_type: "kvdf_planner_materialization",
    generated_at: materializedAt,
    plan_id: plan.plan_id,
    planner_mode: plan.planner_mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    source_control: plan.source_control || null,
    status: "materialized",
    evolution: {
      change_id: evolutionRecord.change_id,
      title: evolutionRecord.title,
      status: evolutionRecord.status,
      planner_plan_id: plan.plan_id,
      area: evolutionRecord.impacted_areas && evolutionRecord.impacted_areas.length ? evolutionRecord.impacted_areas[0] : null
    },
    task_punch: {
      tasks_created: taskRecords.length,
      task_ids: taskRecords.map((task) => task.id)
    },
    report_path: reportPath.replace(/\\/g, "/"),
    next_action: "Run kvdf planner prompt --from-current --json, then execute the first approved task slice.",
    visual: plan.visual || null,
    allowed_files: materialization.evolution_plan ? materialization.evolution_plan.allowed_files || [] : [],
    forbidden_files: materialization.evolution_plan ? materialization.evolution_plan.forbidden_files || [] : [],
    validation_commands: materialization.evolution_plan ? materialization.evolution_plan.validation_commands || [] : [],
    stop_condition: materialization.evolution_plan ? materialization.evolution_plan.stop_condition || "" : ""
  };
}

function normalizePlannerStatus(value) {
  const status = String(value || "proposed").trim().toLowerCase();
  return PLANNER_STATUSES.has(status) ? status : "proposed";
}

function normalizePlannerMode(value) {
  const mode = String(value || "owner").trim().toLowerCase();
  if (mode === "vibe" || mode === "plugin") return mode;
  return "owner";
}

function normalizePlannerMethod(value) {
  const method = String(value || "auto").trim().toLowerCase();
  if (method === "structured" || method === "agile" || method === "hybrid") return method;
  return "auto";
}

function normalizePlannerTrack(value) {
  const track = String(value || "framework_owner").trim().toLowerCase();
  if (track === "vibe_app_developer" || track === "plugin") return track;
  return "framework_owner";
}

function allocatePlannerPlanId(state = {}) {
  const existingIds = Array.isArray(state.plans) ? state.plans.map((plan) => String(plan.plan_id || "")).filter(Boolean) : [];
  let maxIndex = 0;
  for (const id of existingIds) {
    const match = /^planner-plan-(\d{3,})$/i.exec(id);
    if (!match) continue;
    const index = Number(match[1]);
    if (Number.isFinite(index) && index > maxIndex) maxIndex = index;
  }
  return `planner-plan-${String(maxIndex + 1).padStart(3, "0")}`;
}

function findPlannerPlan(state = {}, planId = "") {
  const id = String(planId || "").trim();
  if (!id) return null;
  return Array.isArray(state.plans) ? state.plans.find((plan) => String(plan.plan_id || "") === id) || null : null;
}

function findCurrentPlannerPlan(state = {}) {
  if (!state || !Array.isArray(state.plans)) return null;
  const currentId = String(state.current_plan_id || "").trim();
  const currentPlan = currentId ? findPlannerPlan(state, currentId) : null;
  if (currentPlan && String(currentPlan.status || "").toLowerCase() === "approved") return currentPlan;
  return state.plans.find((plan) => String(plan.status || "").toLowerCase() === "approved") || null;
}

function resolvePlanId(value, flags = {}, rest = []) {
  const candidates = [value, flags.plan_id, flags.planId, flags.plan, rest.find((item) => !String(item || "").startsWith("--"))];
  const planId = candidates.find((item) => typeof item === "string" && item.trim());
  return planId ? String(planId).trim() : "";
}

function resolveApprovalOwner(flags = {}) {
  return String(flags.owner || flags.approver || flags.by || "").trim();
}

function resolveRejectReason(flags = {}, rest = []) {
  const candidates = [flags.reason, flags.message, rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")];
  const reason = candidates.find((item) => typeof item === "string" && item.trim());
  return reason ? String(reason).trim() : "";
}

function resolveCompleteNote(flags = {}, rest = []) {
  const candidates = [flags.note, flags.message, rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")];
  const note = candidates.find((item) => typeof item === "string" && item.trim());
  return note ? String(note).trim() : "";
}

function resolveBooleanFlag(value) {
  if (value === true) return true;
  if (value === false || value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function isFromCurrentPlan(flags = {}) {
  return Boolean(flags["from-current"] || flags.fromCurrent || flags.from_current);
}

function escapeQuotes(value) {
  return String(value || "").replace(/"/g, '\\"');
}

function renderPlannerNextReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode],
    ["Track", report.track],
    ["Delivery mode", report.delivery_mode],
    ["Source control", report.source_control ? summarizeSourceControl(report.source_control) : "none"],
    ["Recommended evolution", report.recommended_evolution.title],
    ["Area", report.recommended_evolution.area],
    ["Risk", report.recommended_evolution.risk],
    ["Next action", report.next_action]
  ];
  const lines = [
    "KVDF Planner Next",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Out of scope:",
    ...(report.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(report.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...(report.forbidden_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(report.validation_commands || []).map((item) => `- ${item}`),
    "",
    "Task Punch:",
    ...((report.task_punch && report.task_punch.tasks) || []).map((task) => `- ${task.id}: ${task.title} (${task.status})`),
    "",
    `Stop condition: ${report.stop_condition}`
  ];
  if (report.pipeline) {
    lines.splice(4, 0, "", "Pipeline:", ...report.pipeline.map((step) => `- ${step}`));
  }
  if (report.plugin_context) {
    lines.splice(4, 0, "", "Plugin context:", tableRenderer(["Field", "Value"], [
      ["Plugin", report.plugin_context.plugin_id || ""],
      ["Family", report.plugin_context.plugin_family || ""],
      ["Type", report.plugin_context.plugin_type || ""],
      ["Enabled by default", report.plugin_context.enabled_by_default ? "yes" : "no"],
      ["Removable", report.plugin_context.removable ? "yes" : "no"]
    ]));
  }
  return lines.join("\n");
}

function renderPlannerEvolutionPlan(report, tableRenderer) {
  const plan = report.evolution_plan || report;
  const rows = [
    ["Planner mode", plan.planner_mode],
    ["Evolution", plan.title],
    ["Track", plan.track],
    ["Delivery mode", plan.delivery_mode],
    ["Source control", plan.source_control ? summarizeSourceControl(plan.source_control) : "none"],
    ["Area", plan.area],
    ["Next action", plan.next_action]
  ];
  const lines = [
    "KVDF Planner Evolution Plan",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "In scope:",
    ...(plan.in_scope || []).map((item) => `- ${item}`),
    "",
    "Out of scope:",
    ...(plan.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(plan.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...(plan.forbidden_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(plan.validation_commands || []).map((item) => `- ${item}`),
    "",
    `Stop condition: ${plan.stop_condition}`
  ];
  if (plan.pipeline) {
    lines.splice(4, 0, "", "Pipeline:", ...plan.pipeline.map((step) => `- ${step}`));
  }
  if (plan.plugin_context) {
    lines.splice(4, 0, "", "Plugin context:", tableRenderer(["Field", "Value"], [
      ["Plugin", plan.plugin_context.plugin_id || ""],
      ["Family", plan.plugin_context.plugin_family || ""],
      ["Type", plan.plugin_context.plugin_type || ""],
      ["Enabled by default", plan.plugin_context.enabled_by_default ? "yes" : "no"],
      ["Removable", plan.plugin_context.removable ? "yes" : "no"]
    ]));
  }
  return lines.join("\n");
}

function renderPlannerPromptReport(report) {
  return report.prompt;
}

function renderPlannerMethodReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode || ""],
    ["Track", report.track || ""],
    ["Recommended method", report.recommended_method || ""],
    ["Confidence", report.confidence || ""],
    ["Next action", report.next_action || ""]
  ];
  return [
    "KVDF Planner Method Recommendation",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Method rules matched:",
    ...(report.method_rules_matched || []).map((item) => `- ${item}`),
    "",
    "Risks:",
    ...(report.risks || []).map((item) => `- ${item}`),
    "",
    "Delivery recommendation:",
    ...renderIndentedObjectSection(report.delivery_recommendation || {})
  ].join("\n");
}

function renderPlannerAutoPlanReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode || ""],
    ["Track", report.track || ""],
    ["Planning method", report.planning_method || ""],
    ["Confidence", report.confidence || ""],
    ["Approval required", report.approval_required ? "yes" : "no"],
    ["Next action", report.next_action || ""]
  ];
  return [
    "KVDF Planner Auto Plan",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Planning strategy:",
    ...renderIndentedObjectSection(report.planning_strategy || {}),
    "",
    "Documentation files:",
    ...(report.documentation_files || []).map((item) => `- ${item}`),
    "",
    "Review:",
    ...renderIndentedObjectSection(report.review || {}),
    "",
    "Visual planning:",
    ...renderIndentedObjectSection(report.visual_planning || {}),
    "",
    "Validation Commands:",
    ...(report.validation_commands || []).map((item) => `- ${item}`),
    "",
    "Stop Condition:",
    report.stop_condition || "",
    "",
    "Codex Prompt:",
    report.codex_prompt || ""
  ].join("\n");
}

function renderPlannerReviewReport(report, tableRenderer) {
  const rows = [
    ["Status", report.status || ""],
    ["Planner mode", report.planner_mode || ""],
    ["Planning method", report.planning_method || ""],
    ["Next action", report.next_action || ""]
  ];
  return [
    "KVDF Planner Review",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Scope review:",
    ...renderIndentedObjectSection(report.scope_review || {}),
    "",
    "Method review:",
    ...renderIndentedObjectSection(report.method_review || {}),
    "",
    "Docs review:",
    ...renderIndentedObjectSection(report.docs_review || {}),
    "",
    "Security review:",
    ...renderIndentedObjectSection(report.security_review || {}),
    "",
    "Source control review:",
    ...renderIndentedObjectSection(report.source_control_review || {}),
    "",
    "Task quality review:",
    ...renderIndentedObjectSection(report.task_quality_review || {}),
    "",
    "Visual review:",
    ...renderIndentedObjectSection(report.visual_review || {}),
    "",
    "Risks:",
    ...(report.risks || []).map((item) => `- ${item}`),
    "",
    "Required fixes:",
    ...(report.required_fixes || []).map((item) => `- ${item}`)
  ].join("\n");
}

function renderPlannerResumeReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode || ""],
    ["Planning method", report.planning_method || ""],
    ["Delivery mode", report.delivery_mode || ""],
    ["Review status", report.review_status || ""],
    ["Blocked", report.blocked ? "yes" : "no"],
    ["Next recommended action", report.next_recommended_action || ""]
  ];
  return [
    "KVDF Planner Resume",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Current plan:",
    ...renderIndentedObjectSection(report.current_plan || {}),
    "",
    "Current evolution:",
    ...renderIndentedObjectSection(report.current_evolution || {}),
    "",
    "Current task punch:",
    ...renderIndentedObjectSection(report.current_task_punch || {}),
    "",
    "Blockers:",
    ...(report.blockers || []).map((item) => `- ${item}`),
    "",
    "Security gate:",
    ...renderIndentedObjectSection(report.security_gate || {}),
    "",
    "Dashboard:",
    ...renderIndentedObjectSection(report.dashboard || {})
  ].join("\n");
}

function renderPlannerRoadmapTrainReport(report, tableRenderer) {
  const rows = [
    ["Train type", report.train_type || ""],
    ["Track", report.track || ""],
    ["Planning method", report.planning_method || ""],
    ["Status", report.status || ""],
    ["Next evolution", report.next_evolution_id || ""],
    ["Next action", report.next_action || ""]
  ];
  const majorRows = Array.isArray(report.major_versions)
    ? report.major_versions.map((major) => [
      major.major_version || "",
      major.target_version || "",
      major.title || "",
      major.status || ""
    ])
    : [];
  const queueRows = Array.isArray(report.fifo_queue)
    ? report.fifo_queue.map((item) => [
      item.position || "",
      item.major_version || "",
      item.version_id || "",
      item.evolution_id || "",
      item.status || "",
      item.blocked ? "yes" : "no"
    ])
    : [];
  return [
    "KVDF Roadmap Train",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Major versions:",
    ...majorRows.map((row) => `- ${row[0]} -> ${row[1]} :: ${row[2]} (${row[3]})`),
    "",
    "FIFO queue:",
    ...queueRows.map((row) => `- #${row[0]} ${row[1]} / ${row[2]} / ${row[3]} [${row[4]}${row[5] === "yes" ? ", blocked" : ""}]`),
    "",
    "Readiness:",
    ...renderIndentedObjectSection(report.readiness || {}),
    "",
    "Version control:",
    ...renderIndentedObjectSection(report.version_control || {}),
    "",
    "Current train:",
    ...renderIndentedObjectSection(report.current_train || {})
  ].join("\n");
}

function renderPlannerDocsMaterializationReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode || ""],
    ["Track", report.track || ""],
    ["Planning method", report.planning_method || ""],
    ["Status", report.status || ""]
  ];
  return [
    "KVDF Planner Docs Materialization",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Docs created:",
    ...(report.docs_created || []).map((item) => `- ${item}`),
    "",
    "Docs updated:",
    ...(report.docs_updated || []).map((item) => `- ${item}`),
    "",
    "Docs skipped:",
    ...(report.docs_skipped || []).map((item) => `- ${item}`),
    "",
    "Source pipeline:",
    ...renderIndentedObjectSection(report.source_pipeline || {}),
    "",
    `Next action: ${report.next_action || ""}`
  ].join("\n");
}

function renderPlannerVisualReport(report) {
  return report.markdown_report;
}

function renderPlannerMaterializationReport(report, tableRenderer) {
  const rows = [
    ["Plan ID", report.plan_id || ""],
    ["Planner mode", report.planner_mode || ""],
    ["Track", report.track || ""],
    ["Delivery mode", report.delivery_mode || ""],
    ["Status", report.status || ""],
    ["Evolution", report.evolution && report.evolution.change_id ? report.evolution.change_id : ""]
  ];
  const taskIds = Array.isArray(report.task_punch && report.task_punch.task_ids) ? report.task_punch.task_ids : [];
  return [
    "KVDF Planner Materialization",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Evolution:",
    `- Change ID: ${report.evolution && report.evolution.change_id ? report.evolution.change_id : ""}`,
    `- Title: ${report.evolution && report.evolution.title ? report.evolution.title : ""}`,
    `- Status: ${report.evolution && report.evolution.status ? report.evolution.status : ""}`,
    `- Planner plan: ${report.evolution && report.evolution.planner_plan_id ? report.evolution.planner_plan_id : ""}`,
    "",
    "Task Punch:",
    `- Tasks created: ${report.task_punch && typeof report.task_punch.tasks_created === "number" ? report.task_punch.tasks_created : 0}`,
    ...(taskIds.length ? taskIds.map((taskId) => `- ${taskId}`) : ["- None"]),
    "",
    "Validation commands:",
    ...(report.validation_commands || []).map((command) => `- ${command}`),
    "",
    `Stop condition: ${report.stop_condition || ""}`,
    "",
    `Report path: ${report.report_path || ""}`,
    "",
    `Next action: ${report.next_action || ""}`
  ].join("\n");
}

function renderPlannerStateSummaryReport(report, tableRenderer) {
  const rows = [];
  if (report.plan_id) rows.push(["Plan ID", report.plan_id]);
  if (report.status) rows.push(["Status", report.status]);
  if (report.planner_mode) rows.push(["Planner mode", report.planner_mode]);
  if (report.track) rows.push(["Track", report.track]);
  if (report.delivery_mode) rows.push(["Delivery mode", report.delivery_mode]);
  if (report.current_plan_id) rows.push(["Current plan", report.current_plan_id]);
  if (report.rejection_reason) rows.push(["Rejection reason", report.rejection_reason]);
  if (report.current_plan && report.current_plan.goal) rows.push(["Current goal", report.current_plan.goal]);
  if (report.next_action) rows.push(["Next action", report.next_action]);
  return [
    "KVDF Planner State",
    "",
    tableRenderer(["Field", "Value"], rows)
  ].join("\n");
}

function renderPlannerPromptFromPlan(plan, context, sourceControl = null, aiLearning = null) {
  const goal = plan.goal || (plan.recommended_evolution && plan.recommended_evolution.title) || "Approved planner plan";
  const mode = normalizePlannerMode(plan.planner_mode);
  const sourcePipeline = plan.source_pipeline || plan.sourcePipeline || null;
  const pluginContext = mode === "plugin"
    ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  const sourceControlState = sourceControl || plan.source_control || buildPlannerSourceControl(
    { flags: {} },
    context,
    mode,
    plan.delivery_mode || getDeliveryMode(mode),
    pluginContext
  );
  const evolutionPlan = plan.recommended_evolution && Object.keys(plan.recommended_evolution).length
    ? plan.recommended_evolution
    : buildPlannerEvolutionPlan(goal, { mode, deliveryMode: plan.delivery_mode, pluginContext }, context);
  const taskPunch = plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length
    ? plan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode: plan.delivery_mode, pluginContext }, context);
  const versionControl = buildPlannerVersionControlSummary({
    versionPlan: plan.version_plan || {},
    currentPlan: plan,
    versionControlState: readPlannerVersionControlState(context.repo_root, normalizeAppSlug(plan.app_slug || "")),
    context,
    appSlug: normalizeAppSlug(plan.app_slug || ""),
    track: plan.track || getPlannerTrack(mode),
    plannerMode: mode,
    sourceControl: sourceControlState
  });
  const roadmapTrain = plan.version_plan
    ? buildPlannerRoadmapTrainSummary({
      pipeline: {
        version_plan: plan.version_plan || {},
        version_control: versionControl,
        docs_plan: plan.docs_plan || null,
        docs_status: plan.docs_status || null,
        validation_commands: plan.validation_commands || [],
        visual_planning: plan.visual_planning || plan.visual || null
      },
      context,
      profile: {
        train_type: mode === "vibe" ? "viber" : "owner",
        track: plan.track || getPlannerTrack(mode),
        mode,
        planning_method: plan.planning_method || null,
        app_slug: normalizeAppSlug(plan.app_slug || "")
      },
      planning: {
        planning_method: plan.planning_method || null,
        source_control: sourceControlState
      },
      goal,
      flags: {}
    })
    : null;
  const pipelineState = mode === "vibe"
    ? buildViberPipelineState({
      idea: goal,
      mode,
      deliveryMode: plan.delivery_mode || getDeliveryMode(mode),
      sourceControl: sourceControlState,
      stateResync: buildPlannerStateResyncSummary(context, { track: mode, app: normalizeAppSlug(plan.app_slug || ""), plugin: pluginContext ? pluginContext.plugin_id : "" }),
      docsPlan: sourcePipeline && sourcePipeline.docs_plan ? sourcePipeline.docs_plan : (plan.docs_plan || null),
      docsStatus: sourcePipeline && sourcePipeline.docs_status ? sourcePipeline.docs_status : (plan.docs_status || (plan.documentation_files && plan.documentation_files.length ? "draft" : "planned")),
      designArtifacts: sourcePipeline && sourcePipeline.design_artifacts ? sourcePipeline.design_artifacts : (plan.pipeline && plan.pipeline.design_artifacts ? plan.pipeline.design_artifacts : (plan.design_artifacts || null)),
      visualPlanning: sourcePipeline && sourcePipeline.visual_planning ? sourcePipeline.visual_planning : (plan.visual_planning || plan.visual || (plan.pipeline && plan.pipeline.visual_planning ? plan.pipeline.visual_planning : null)),
      versionPlan: sourcePipeline && sourcePipeline.version_plan ? sourcePipeline.version_plan : (plan.version_plan || (plan.pipeline && plan.pipeline.version_plan ? plan.pipeline.version_plan : null)),
      versionControl,
      evolutions: sourcePipeline && Array.isArray(sourcePipeline.evolutions) ? sourcePipeline.evolutions : (plan.evolutions || (plan.pipeline && Array.isArray(plan.pipeline.evolutions) ? plan.pipeline.evolutions : [])),
      taskPunches: sourcePipeline && Array.isArray(sourcePipeline.task_punches) ? sourcePipeline.task_punches : (plan.task_punches || (plan.pipeline && Array.isArray(plan.pipeline.task_punches) ? plan.pipeline.task_punches : [])),
      currentPlan: plan,
      taskPunch,
      pluginContext,
      planningMethod: plan.planning_method || null,
      appSlug: normalizeAppSlug(plan.app_slug || ""),
      executionAllowedOverride: String(plan.materialization_status || plan.status || "").toLowerCase() === "materialized" || Boolean(plan.materialized_at)
    })
    : null;
  return renderCodexPrompt({
    goal,
    mode,
    plan: evolutionPlan,
    taskPunch,
    context,
    pluginContext,
    sourceControl: sourceControlState,
    aiLearning,
    planningMethod: plan.planning_method || null,
    methodReason: plan.method_reason || "",
    review: plan.review || null,
    docsStatus: sourcePipeline && sourcePipeline.docs_status ? sourcePipeline.docs_status : (plan.documentation_files && plan.documentation_files.length ? "draft" : "planned"),
    visualSummary: sourcePipeline && sourcePipeline.visual_planning ? sourcePipeline.visual_planning : (plan.visual_planning || plan.visual || null),
    currentGate: plan.current_gate || null,
    versionControl,
    latestFeedback: plan.latest_feedback || readPlannerLatestFeedback(context.repo_root, normalizeAppSlug(plan.app_slug || "")),
    roadmapTrain,
    pipelineState
  });
}

function renderPlannerTaskPunchReport(report, tableRenderer) {
  const rows = (report.tasks || []).map((task) => [
    task.id,
    task.title,
    task.status,
    String((task.allowed_files || []).length)
  ]);
  return [
    "KVDF Planner Task Punch",
    "",
    tableRenderer(["Task ID", "Title", "Status", "Allowed files"], rows),
    "",
    `Planner mode: ${report.planner_mode || ""}`,
    `Track: ${report.track || ""}`,
    `Delivery mode: ${report.delivery_mode || ""}`,
    `Source control: ${report.source_control ? summarizeSourceControl(report.source_control) : "none"}`,
    `Evolution: ${report.evolution_id || ""}`
  ].join("\n");
}

function buildPlannerPipelineMarkdown(report, tableRenderer) {
  const versionRows = Array.isArray(report.version_plan && report.version_plan.versions)
    ? report.version_plan.versions.map((version) => [
      version.version_id || "",
      version.title || "",
      version.readiness_gate || "",
      version.source_control_mode || ""
    ])
    : [];
  const evolutionRows = Array.isArray(report.evolutions)
    ? report.evolutions.map((evolution) => [
      evolution.evolution_id || "",
      evolution.title || "",
      evolution.version_id || "",
      evolution.source_control_mode || ""
    ])
    : [];
  const taskPunchRows = Array.isArray(report.task_punches)
    ? report.task_punches.map((taskPunch) => [
      taskPunch.version_id || "",
      taskPunch.evolution_id || "",
      taskPunch.tasks ? String(taskPunch.tasks.length) : "0",
      taskPunch.source_control ? summarizeSourceControl(taskPunch.source_control) : "none"
    ])
    : [];
  const sourceControl = report.source_control || null;
  const versionControl = report.version_control || null;
  const roadmapTrain = report.roadmap_train || null;
  const executionGates = report.execution_gates || null;
  const sourceControlLines = sourceControl ? [
    `- Enabled: ${sourceControl.enabled ? "yes" : "no"}`,
    `- Provider: ${sourceControl.provider || "none"}`,
    `- Remote provider: ${sourceControl.remote_provider || "none"}`,
    `- Provider plugin: ${sourceControl.provider_plugin || "none"}`,
    `- Mode: ${sourceControl.mode || "local_only"}`,
    `- Branching enabled: ${sourceControl.branching_enabled ? "yes" : "no"}`,
    `- PR enabled: ${sourceControl.pr_enabled ? "yes" : "no"}`,
    `- Default branch: ${sourceControl.default_branch || "main"}`,
    `- Current branch: ${sourceControl.current_branch || "none"}`,
    ...(Array.isArray(sourceControl.notes) && sourceControl.notes.length ? ["- Notes:", ...sourceControl.notes.map((note) => `  - ${note}`)] : [])
  ] : ["- None"];
  const executionGateLines = executionGates ? [
    `- Status: ${executionGates.status || "unknown"}`,
    `- Security gate: ${executionGates.security_gate ? executionGates.security_gate.status || "unknown" : "unknown"}`,
    `- Handoff gate: ${executionGates.handoff_gate ? executionGates.handoff_gate.status || "unknown" : "unknown"}`,
    `- Source control gate: ${executionGates.source_control_gate ? executionGates.source_control_gate.status || "unknown" : "unknown"}`,
    `- Validation gate: ${executionGates.validation_gate ? executionGates.validation_gate.status || "unknown" : "unknown"}`,
    ...(Array.isArray(executionGates.blockers) && executionGates.blockers.length ? ["- Blockers:", ...executionGates.blockers.map((item) => `  - ${item.message || item.id || "blocked"}`)] : []),
    ...(Array.isArray(executionGates.warnings) && executionGates.warnings.length ? ["- Warnings:", ...executionGates.warnings.map((item) => `  - ${item.message || item.id || "warning"}`)] : []),
    `- Next action: ${executionGates.next_action || "Resolve the execution gates."}`
  ] : [];
  return [
    "# KVDF Idea to Evolution Pipeline",
    "",
    `- Track: ${report.track || ""}`,
    `- Planner mode: ${report.planner_mode || ""}`,
    `- Delivery mode: ${report.delivery_mode || ""}`,
    `- Idea: ${report.idea || ""}`,
    "",
    "## Documentation Files",
    ...(report.documentation_files || []).map((item) => `- ${item}`),
    "",
    "## System Design",
    ...renderIndentedObjectSection(report.design_artifacts && report.design_artifacts.system_design || {}),
    "",
    "## Database Design",
    ...renderIndentedObjectSection(report.design_artifacts && report.design_artifacts.database_design || {}),
    "",
    "## UI/UX Design",
    ...renderIndentedObjectSection(report.design_artifacts && report.design_artifacts.ui_ux_design || {}),
    "",
    "## Visual Planning",
    "### Mermaid Graph",
    "```mermaid",
    report.visual_planning && report.visual_planning.graph ? report.visual_planning.graph.diagram : "",
    "```",
    "### Planning Board",
    ...(report.visual_planning && report.visual_planning.board && Array.isArray(report.visual_planning.board.columns)
      ? report.visual_planning.board.columns.map((column) => `- ${column.title}: ${(column.cards || []).length} card(s)`)
      : ["- None"]),
    "### Scope Map",
    ...renderIndentedObjectSection(report.visual_planning ? report.visual_planning.scope_map || {} : {}),
    "",
    "## Version Plan",
    tableRenderer(["Version", "Title", "Readiness Gate", "Source Control"], versionRows),
    "",
    "## Version Control",
    ...renderIndentedObjectSection(versionControl || {}),
    "",
    roadmapTrain ? "## Roadmap Train" : null,
    ...(roadmapTrain ? renderIndentedObjectSection(roadmapTrain || {}) : []),
    "",
    "## Evolutions",
    tableRenderer(["Evolution", "Title", "Version", "Source Control"], evolutionRows),
    "",
    "## Task Punches",
    tableRenderer(["Version", "Evolution", "Tasks", "Source Control"], taskPunchRows),
    "",
    "## Visual Roadmap",
    ...renderIndentedObjectSection(report.visual_roadmap || {}),
    "",
    "## Source Control",
    ...sourceControlLines,
    "",
    "## Execution Gates",
    ...executionGateLines,
    "",
    "## Next Evolution",
    ...renderIndentedObjectSection(report.next_evolution || {}),
    "",
    "## Validation Commands",
    ...(report.validation_commands || []).map((command) => `- ${command}`),
    "",
    "## Stop Condition",
    report.stop_condition || "",
    "",
    "## Next Action",
    report.next_action || ""
  ].join("\n");
}

function normalizePlannerVersionAction(value, rest = []) {
  const candidates = [value, ...rest];
  const action = candidates.find((item) => typeof item === "string" && item.trim() && !String(item).startsWith("--"));
  const normalized = String(action || "status").trim().toLowerCase();
  if (["status", "next", "gate", "publish-ready", "publish_ready", "mark-published", "mark_published"].includes(normalized)) {
    return normalized.replace(/_/g, "-");
  }
  return "status";
}

function buildPlannerVersionCommandReport(action, value = "", flags = {}, rest = [], deps = {}) {
  const versionId = normalizeVersionId(flags.version || flags.version_id || flags.id || value || "");
  if (action === "mark-published") {
    return buildPlannerVersionMarkPublishedReport(versionId, flags, rest, deps);
  }
  if (action === "publish-ready") {
    return buildPlannerVersionPublishReadyReport(versionId, flags, rest, deps);
  }
  if (action === "gate") {
    return buildPlannerVersionGateReport(versionId, flags, rest, deps);
  }
  if (action === "next") {
    return buildPlannerVersionNextReport(versionId, flags, rest, deps);
  }
  return buildPlannerVersionStatusReport(versionId, flags, rest, deps);
}

function buildPlannerVersionStatusReport(versionId, flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const appSlug = normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || "");
  const plannerState = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(plannerState);
  const sourcePipeline = currentPlan ? (currentPlan.source_pipeline || currentPlan) : null;
  const versionPlan = currentPlan && currentPlan.version_plan ? currentPlan.version_plan : (sourcePipeline && sourcePipeline.version_plan ? sourcePipeline.version_plan : null);
  const versionControlState = readPlannerVersionControlState(context.repo_root, appSlug);
  const control = buildPlannerVersionControlSummary({
    versionPlan,
    currentPlan,
    versionControlState,
    context,
    appSlug,
    versionId,
    track: normalizeTrackAlias(flags.track) || (currentPlan ? currentPlan.track : null) || (appSlug ? "vibe_app_developer" : "framework_owner"),
    plannerMode: normalizePlannerMode(normalizeTrackAlias(flags.track) || (currentPlan ? currentPlan.planner_mode : "vibe")),
    sourceControl: currentPlan ? currentPlan.source_control || null : null
  });
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_viber_version_status",
    generated_at: new Date().toISOString(),
    track: control.track,
    app: control.app,
    versions: control.versions,
    current_version: control.current_version || {},
    next_version: control.next_version || {},
    next_evolution: control.next_evolution || {},
    publish_readiness: control.publish_readiness || {},
    next_action: control.next_action || "Run kvdf planner pipeline --idea \"...\" --track vibe --json to generate a version plan."
  }, context, { track: flags.track || control.track || null, app: appSlug });
}

function buildPlannerVersionNextReport(versionId, flags = {}, rest = [], deps = {}) {
  const report = buildPlannerVersionStatusReport(versionId, flags, rest, deps);
  return {
    report_type: "kvdf_viber_next_version",
    generated_at: report.generated_at,
    app: report.app,
    current_version: report.current_version || {},
    next_version: report.next_version || {},
    next_evolution: report.next_evolution || {},
    next_task_punch: report.next_version && report.next_version.task_punch ? report.next_version.task_punch : {},
    blocked: Boolean(report.publish_readiness && report.publish_readiness.status === "blocked"),
    blockers: collectVersionBlockers(report.publish_readiness, report.current_version),
    next_action: report.next_action,
    current_state_summary: report.current_state_summary || null
  };
}

function buildPlannerVersionGateReport(versionId, flags = {}, rest = [], deps = {}) {
  const gate = String(flags.gate || flags["version-gate"] || "all").trim().toLowerCase();
  const statusReport = buildPlannerVersionStatusReport(versionId, flags, rest, deps);
  const currentVersion = findVersionEntry(statusReport, versionId);
  const gates = currentVersion ? {
    docs: currentVersion.docs_gate || buildEmptyVersionGate("docs"),
    evolution: currentVersion.evolution_gate || buildEmptyVersionGate("evolution"),
    task: currentVersion.task_gate || buildEmptyVersionGate("task"),
    validation: currentVersion.validation_gate || buildEmptyVersionGate("validation"),
    security: currentVersion.security_gate || buildEmptyVersionGate("security"),
    handoff: currentVersion.handoff_gate || buildEmptyVersionGate("handoff"),
    publish: currentVersion.publish_gate || buildEmptyVersionGate("publish")
  } : {
    docs: buildEmptyVersionGate("docs"),
    evolution: buildEmptyVersionGate("evolution"),
    task: buildEmptyVersionGate("task"),
    validation: buildEmptyVersionGate("validation"),
    security: buildEmptyVersionGate("security"),
    handoff: buildEmptyVersionGate("handoff"),
    publish: buildEmptyVersionGate("publish")
  };
  const selectedGate = gate === "all" ? aggregateVersionGateStatus(gates) : (gates[gate] || buildEmptyVersionGate(gate));
  return {
    report_type: "kvdf_viber_version_gate",
    generated_at: statusReport.generated_at,
    app: statusReport.app,
    version_id: versionId,
    gate,
    status: selectedGate.status || "unknown",
    gates,
    blockers: currentVersion ? [...(currentVersion.blockers || [])] : [],
    warnings: currentVersion ? [...(currentVersion.warnings || [])] : [],
    next_action: selectedGate.next_action || statusReport.next_action,
    current_state_summary: statusReport.current_state_summary || null
  };
}

function buildPlannerVersionPublishReadyReport(versionId, flags = {}, rest = [], deps = {}) {
  const statusReport = buildPlannerVersionStatusReport(versionId, flags, rest, deps);
  const currentVersion = findVersionEntry(statusReport, versionId);
  const publishReadiness = currentVersion ? (currentVersion.publish_gate || buildEmptyVersionGate("publish")) : buildEmptyVersionGate("publish");
  const status = publishReadiness.status === "blocked" ? "blocked" : publishReadiness.status === "pass" ? "ready" : "warning";
  return {
    report_type: "kvdf_viber_publish_readiness",
    generated_at: statusReport.generated_at,
    app: statusReport.app,
    version_id: versionId,
    status,
    gates: currentVersion ? currentVersion : {},
    blockers: collectVersionBlockers(publishReadiness, currentVersion),
    warnings: collectVersionWarnings(publishReadiness, currentVersion),
    publish_target: currentVersion && currentVersion.publish_target ? currentVersion.publish_target : inferPublishTarget(currentVersion, statusReport),
    next_action: status === "ready" ? "Publishing is ready. Use an explicit external publish command or mark it published manually." : "Resolve the blocked gates before publishing.",
    current_state_summary: statusReport.current_state_summary || null
  };
}

function buildPlannerVersionMarkPublishedReport(versionId, flags = {}, rest = [], deps = {}) {
  const note = String(flags.note || flags.message || rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")).trim();
  if (!note) throw new Error("Missing note for planner version mark-published.");
  const force = resolveBooleanFlag(flags.force);
  const context = buildPlannerContext(deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  if (currentState.write_policy && !currentState.write_policy.can_write && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error(currentState.write_policy.reason || "Workspace identity is ambiguous.");
    error.current_state = currentState;
    throw error;
  }
  const readiness = buildPlannerVersionPublishReadyReport(versionId, flags, rest, deps);
  if (readiness.status === "blocked" && !force) {
    throw new Error(`Version ${versionId} is not publish-ready. Use --force to record the published state anyway.`);
  }
  const appSlug = normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || readiness.app || "");
  const activeTrack = currentState.track && currentState.track.active_track ? currentState.track.active_track : normalizeTrackAlias(flags.track);
  if (!appSlug && (activeTrack === "vibe_app_developer" || activeTrack === "vibe") && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing app slug for planner version mark-published. Use --app or --app-slug.");
    error.current_state = currentState;
    throw error;
  }
  const current = readPlannerVersionControlState(context.repo_root, appSlug);
  const record = {
    report_type: "kvdf_viber_version_published",
    generated_at: new Date().toISOString(),
    app: appSlug || readiness.app || null,
    version_id: versionId,
    status: "published",
    published_at: new Date().toISOString(),
    note,
    force: Boolean(force),
    publish_target: readiness.publish_target || "unknown",
    next_action: "Update the dashboard and continue the next version."
  };
  current.app = record.app;
  current.version_id = versionId;
  current.status = "published";
  current.published_at = record.published_at;
  current.note = note;
  current.force = Boolean(force);
  current.publish_target = record.publish_target;
  current.latest_record = record;
  savePlannerVersionControlState(context.repo_root, appSlug, current);
  return attachPlannerCurrentStateSummary(record, context, { track: flags.track || "vibe", app: appSlug });
}

function buildPlannerVersionControlSummary({ versionPlan = {}, currentPlan = null, versionControlState = null, context = {}, appSlug = "", versionId = "", track = "vibe_app_developer", plannerMode = "vibe", sourceControl = null } = {}) {
  const versions = Array.isArray(versionPlan.versions) ? versionPlan.versions.map((version, index) => buildPlannerVersionEntry(version, {
    index,
    currentPlan,
    context,
    sourceControl,
    appSlug,
    versionControlState
  })) : [];
  const stateCurrentId = versionControlState && (versionControlState.version_id || versionControlState.current_version_id || versionControlState.current_version && versionControlState.current_version.version_id) || null;
  const currentVersion = stateCurrentId ? versions.find((item) => item.version_id === stateCurrentId) : versions[0] || null;
  const nextVersion = currentVersion ? versions[versions.findIndex((item) => item.version_id === currentVersion.version_id) + 1] || null : versions[0] || null;
  const nextEvolution = nextVersion && nextVersion.evolution ? nextVersion.evolution : (currentVersion && currentVersion.evolution ? currentVersion.evolution : null);
  const publishReadiness = currentVersion ? currentVersion.publish_gate || buildEmptyVersionGate("publish") : buildEmptyVersionGate("publish");
  const latestFeedback = readPlannerLatestFeedback(context.repo_root, appSlug);
  return {
    report_type: "kvdf_viber_version_control",
    generated_at: new Date().toISOString(),
    app: appSlug || versionControlState && versionControlState.app || null,
    track,
    planner_mode: plannerMode,
    planning_method: currentPlan ? currentPlan.planning_method || null : null,
    source_control_mode: sourceControl ? sourceControl.mode || null : null,
    versions,
    current_version: currentVersion || null,
    next_version: nextVersion || null,
    next_evolution: nextEvolution || null,
    publish_readiness: publishReadiness,
    latest_feedback: latestFeedback,
    next_action: currentVersion ? currentVersion.next_action || publishReadiness.next_action || "Review the current version gates." : "Create or approve a Viber app version plan."
  };
}

function normalizePlannerTrainAction(value, rest = []) {
  const candidates = [value, ...rest];
  const action = candidates.find((item) => typeof item === "string" && item.trim() && !String(item).startsWith("--"));
  const normalized = String(action || "build").trim().toLowerCase();
  if (["build", "status", "next", "advance", "visual", "readiness"].includes(normalized)) return normalized;
  return "build";
}

function resolvePlannerRoadmapTrainProfile(flags = {}, context = {}, explicitMode = null) {
  const trainType = normalizeRoadmapTrainType(flags.track || explicitMode || "owner");
  const mode = trainType === "viber" ? "vibe" : "owner";
  const appSlug = normalizeAppSlug(flags.app || flags.app_slug || flags["app-slug"] || "");
  const planningMethod = normalizePlannerMethod(flags.method || flags.planning_method || "auto");
  return {
    train_type: trainType,
    track: trainType === "viber" ? "vibe_app_developer" : "framework_owner",
    mode,
    app_slug: appSlug,
    planning_method: planningMethod,
    state_path: buildPlannerRoadmapTrainStatePath(context.repo_root, trainType, appSlug),
    default_goal: trainType === "viber" ? (flags.idea || flags.goal || "") : (flags.goal || flags.idea || "")
  };
}

function normalizeRoadmapTrainType(value) {
  const normalized = normalizeTrackAlias(value) || String(value || "").trim().toLowerCase();
  if (normalized === "vibe" || normalized === "viber" || normalized === "vibe_app_developer") return "viber";
  return "owner";
}

function normalizeRoadmapTrainStatus(value) {
  const normalized = String(value || "planned").trim().toLowerCase();
  if (["planned", "ready", "active", "completed", "blocked", "published"].includes(normalized)) return normalized;
  if (normalized === "done") return "completed";
  if (normalized === "in_progress") return "active";
  if (normalized === "warning") return "ready";
  return "planned";
}

function buildPlannerRoadmapTrainStatePath(repoRootPath, trainType, appSlug) {
  const root = repoRootPath || process.cwd();
  if (trainType === "viber") {
    const slug = normalizeAppSlug(appSlug || "");
    if (slug) {
      return path.join(root, "workspaces", "apps", slug, ".kabeeri", "release_train.json");
    }
    return path.join(root, VIBER_RELEASE_TRAIN_FALLBACK_FILE);
  }
  return path.join(root, OWNER_ROADMAP_TRAIN_STATE_FILE);
}

function readPlannerRoadmapTrainState(repoRootPath, trainType, appSlug) {
  const root = repoRootPath || process.cwd();
  const primaryPath = buildPlannerRoadmapTrainStatePath(root, trainType, appSlug);
  const fallbackPath = trainType === "viber" ? path.join(root, VIBER_RELEASE_TRAIN_FALLBACK_FILE) : null;
  const filePath = fs.existsSync(primaryPath) ? primaryPath : (fallbackPath && fs.existsSync(fallbackPath) ? fallbackPath : null);
  return filePath ? readJsonFileIfExists(filePath) : null;
}

function savePlannerRoadmapTrainState(repoRootPath, trainType, appSlug, state) {
  const root = repoRootPath || process.cwd();
  const filePath = buildPlannerRoadmapTrainStatePath(root, trainType, appSlug);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  if (trainType === "viber" && filePath.endsWith("release_train.json")) {
    const fallbackPath = path.join(root, VIBER_RELEASE_TRAIN_FALLBACK_FILE);
    fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
    fs.writeFileSync(fallbackPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }
}

function buildPlannerTrainCommandReport(action, value = "", flags = {}, rest = [], deps = {}) {
  if (action === "status") return buildPlannerRoadmapTrainStatusReport(value, flags, rest, deps);
  if (action === "next") return buildPlannerRoadmapTrainNextReport(value, flags, rest, deps);
  if (action === "advance") return buildPlannerRoadmapTrainAdvanceReport(value, flags, rest, deps);
  if (action === "visual") return buildPlannerRoadmapTrainVisualReport(value, flags, rest, deps);
  if (action === "readiness") return buildPlannerRoadmapTrainReadinessReport(value, flags, rest, deps);
  return buildPlannerRoadmapTrainBuildReport(value, flags, rest, deps);
}

function buildPlannerRoadmapTrainBuildReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const profile = resolvePlannerRoadmapTrainProfile(flags, context, flags.track);
  const subject = resolveGoal(value, flags, rest, profile.default_goal || "");
  const request = {
    ...flags,
    mode: profile.mode,
    track: profile.track,
    method: profile.planning_method,
    app: profile.app_slug,
    app_slug: profile.app_slug,
    idea: subject,
    goal: subject,
    source_control: flags.source_control || null
  };
  const planning = buildPlannerPlanningContext(subject, request, deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  if (currentState.write_policy && !currentState.write_policy.can_write && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error(currentState.write_policy.reason || "Workspace identity is ambiguous.");
    error.current_state = currentState;
    throw error;
  }
  if (profile.train_type === "viber" && !profile.app_slug && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing app slug for Viber roadmap train build. Use --app or --app-slug.");
    error.current_state = currentState;
    throw error;
  }
  const selectedMethod = planning.planning_method || planning.method && planning.method.recommended_method || profile.planning_method || "structured";
  const pipeline = buildIdeaToEvolutionPipelineReport(subject, {
    ...flags,
    mode: profile.mode,
    method: selectedMethod,
    deliveryMode: planning.delivery_mode,
    pluginContext: planning.plugin_context,
    source_control: planning.source_control,
    app: profile.app_slug,
    app_slug: profile.app_slug
  }, planning.context);
  const report = buildPlannerRoadmapTrainSummary({
    pipeline,
    context,
    profile: {
      ...profile,
      planning_method: selectedMethod
    },
    planning: {
      ...planning,
      planning_method: selectedMethod
    },
    goal: subject,
    flags
  });
  savePlannerRoadmapTrainState(context.repo_root, profile.train_type, profile.app_slug, report);
  return attachPlannerCurrentStateSummary(report, context, {
    track: profile.mode,
    app: profile.app_slug
  });
}

function buildPlannerRoadmapTrainStatusReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const profile = resolvePlannerRoadmapTrainProfile(flags, context, flags.track);
  const train = readPlannerRoadmapTrainState(context.repo_root, profile.train_type, profile.app_slug);
  if (!train) {
    return attachPlannerCurrentStateSummary(buildEmptyPlannerRoadmapTrainReport(profile, context, "Build the roadmap train first."), context, {
      track: profile.mode,
      app: profile.app_slug
    });
  }
  return attachPlannerCurrentStateSummary(refreshPlannerRoadmapTrainReport(train, profile, context), context, {
    track: profile.mode,
    app: profile.app_slug
  });
}

function buildPlannerRoadmapTrainNextReport(value = "", flags = {}, rest = [], deps = {}) {
  const report = buildPlannerRoadmapTrainStatusReport(value, flags, rest, deps);
  const nextEvolution = findNextRoadmapTrainEvolution(report);
  return {
    report_type: "kvdf_roadmap_train_next",
    generated_at: report.generated_at || new Date().toISOString(),
    train_type: report.train_type,
    track: report.track,
    planning_method: report.planning_method,
    current_train: report,
    next_evolution_id: nextEvolution ? nextEvolution.evolution_id || null : null,
    next_evolution: nextEvolution || null,
    next_task_punch: nextEvolution && nextEvolution.task_punch_id ? {
      task_punch_id: nextEvolution.task_punch_id,
      task_ids: [...(nextEvolution.task_ids || [])]
    } : null,
    blocked: Boolean(nextEvolution && nextEvolution.status === "blocked"),
    blockers: nextEvolution && Array.isArray(nextEvolution.blockers) ? [...nextEvolution.blockers] : [],
    next_action: nextEvolution ? nextEvolution.next_action || "Review the next unblocked evolution." : report.next_action || "Build the roadmap train first."
  };
}

function buildPlannerRoadmapTrainAdvanceReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const profile = resolvePlannerRoadmapTrainProfile(flags, context, flags.track);
  const evolutionId = String(flags.evolution || flags.id || value || "").trim();
  if (!evolutionId) throw new Error("Missing evolution id for planner train advance.");
  const nextStatus = String(flags.status || "completed").trim().toLowerCase();
  const train = readPlannerRoadmapTrainState(context.repo_root, profile.train_type, profile.app_slug);
  if (!train) {
    return attachPlannerCurrentStateSummary(buildEmptyPlannerRoadmapTrainReport(profile, context, "Build the roadmap train first."), context, {
      track: profile.mode,
      app: profile.app_slug
    });
  }
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  if (currentState.write_policy && !currentState.write_policy.can_write && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error(currentState.write_policy.reason || "Workspace identity is ambiguous.");
    error.current_state = currentState;
    throw error;
  }
  if (profile.train_type === "viber" && !profile.app_slug && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error("Missing app slug for Viber roadmap train advance. Use --app or --app-slug.");
    error.current_state = currentState;
    throw error;
  }
  const updated = advancePlannerRoadmapTrainState(train, evolutionId, nextStatus);
  updated.updated_at = new Date().toISOString();
  savePlannerRoadmapTrainState(context.repo_root, profile.train_type, profile.app_slug, updated);
  const refreshed = refreshPlannerRoadmapTrainReport(updated, profile, context);
  return attachPlannerCurrentStateSummary({
    report_type: "kvdf_roadmap_train_advanced",
    generated_at: refreshed.generated_at,
    train_type: refreshed.train_type,
    track: refreshed.track,
    planning_method: refreshed.planning_method,
    evolution_id: evolutionId,
    status: nextStatus,
    current_train: refreshed,
    next_evolution_id: refreshed.next_evolution_id,
    next_action: refreshed.next_action
  }, context, { track: profile.mode, app: profile.app_slug });
}

function buildPlannerRoadmapTrainVisualReport(value = "", flags = {}, rest = [], deps = {}) {
  const report = buildPlannerRoadmapTrainStatusReport(value, flags, rest, deps);
  return {
    report_type: "kvdf_roadmap_train_visual",
    generated_at: report.generated_at || new Date().toISOString(),
    train_type: report.train_type,
    track: report.track,
    planning_method: report.planning_method,
    diagram: buildPlannerRoadmapTrainMermaid(report),
    board: buildPlannerRoadmapTrainBoard(report),
    summary: buildPlannerRoadmapTrainSummaryLines(report),
    current_train: report,
    next_action: report.next_action
  };
}

function buildPlannerRoadmapTrainReadinessReport(value = "", flags = {}, rest = [], deps = {}) {
  const report = buildPlannerRoadmapTrainStatusReport(value, flags, rest, deps);
  return {
    report_type: "kvdf_roadmap_train_readiness",
    generated_at: report.generated_at || new Date().toISOString(),
    train_type: report.train_type,
    track: report.track,
    planning_method: report.planning_method,
    status: report.readiness ? report.readiness.status : "unknown",
    gates: report.readiness ? report.readiness.gates : {},
    blockers: report.readiness ? [...(report.readiness.blockers || [])] : [],
    warnings: report.readiness ? [...(report.readiness.warnings || [])] : [],
    next_action: report.readiness ? report.readiness.next_action : report.next_action,
    current_train: report,
    current_state_summary: report.current_state_summary || null
  };
}

function buildPlannerRoadmapTrainSummary({ pipeline, context, profile, planning, goal, flags = {} }) {
  const versionPlan = pipeline && pipeline.version_plan ? pipeline.version_plan : { versions: [] };
  const versionControl = pipeline && pipeline.version_control ? pipeline.version_control : buildPlannerVersionControlSummary({
    versionPlan,
    currentPlan: pipeline && pipeline.current_plan ? pipeline.current_plan : null,
    versionControlState: null,
    context,
    appSlug: profile.app_slug,
    track: profile.track,
    plannerMode: profile.mode,
    sourceControl: planning.source_control
  });
  const versions = Array.isArray(versionPlan.versions) ? versionPlan.versions : [];
  const trainVersions = versions.map((version, index) => buildPlannerRoadmapTrainVersion(version, index, {
    profile,
    planning,
    context,
    pipeline,
    versionControl
  }));
  const fifoQueue = flattenRoadmapTrainQueue(trainVersions);
  const nextEvolution = fifoQueue.find((item) => ["planned", "ready", "active"].includes(String(item.status || "").toLowerCase()) && !item.blocked) || null;
  const readiness = buildPlannerRoadmapTrainReadinessState({
    profile,
    planning,
    pipeline,
    versionControl,
    fifoQueue,
    trainVersions
  });
  const completedCount = fifoQueue.filter((item) => ["completed", "published"].includes(String(item.status || "").toLowerCase())).length;
  const allCompleted = fifoQueue.length > 0 && completedCount === fifoQueue.length;
  const hasBlocked = fifoQueue.some((item) => item.blocked || String(item.status || "").toLowerCase() === "blocked");
  const now = new Date().toISOString();
  return {
    report_type: "kvdf_roadmap_train",
    generated_at: now,
    train_id: buildPlannerRoadmapTrainId(profile, goal),
    train_type: profile.train_type,
    track: profile.track,
    planning_method: planning.planning_method || profile.planning_method || "auto",
    status: readiness.status === "blocked" || hasBlocked ? "blocked" : allCompleted ? "completed" : nextEvolution ? "active" : "planned",
    major_versions: trainVersions.map((item) => item.major_version_entry),
    fifo_queue: fifoQueue,
    next_evolution_id: nextEvolution ? nextEvolution.evolution_id : null,
    created_at: now,
    updated_at: now,
    source_control: planning.source_control,
    version_control: versionControl,
    readiness,
    next_action: nextEvolution ? nextEvolution.next_action || "Review the next unblocked evolution." : "Build the roadmap train first."
  };
}

function buildPlannerRoadmapTrainVersion(version, index, options = {}) {
  const profile = options.profile || {};
  const planning = options.planning || {};
  const pipeline = options.pipeline || {};
  const versionControl = options.versionControl || null;
  const versionId = String(version.version_id || `v${index + 1}`).trim();
  const stageVersionId = versionId.endsWith(".0") ? versionId : `${versionId}.0`;
  const evoSprintId = `evo-sprint-${String(index + 1).padStart(3, "0")}`;
  const evolution = version.evolution || {};
  const taskPunch = version.task_punch || {};
  const taskIds = Array.isArray(taskPunch.tasks) ? taskPunch.tasks.map((task) => task.id).filter(Boolean) : [];
  const stageMethod = profile.planning_method === "hybrid" && index > 0 ? "agile" : profile.planning_method || "structured";
  const docsRequired = collectRoadmapTrainDocsRequired(profile, pipeline, version, index);
  const evolutionStatus = normalizeRoadmapTrainStatus(evolution.status || version.status || "planned");
  const sprintStatus = normalizeRoadmapTrainStatus(version.task_punch && taskIds.length ? (evolutionStatus === "blocked" ? "blocked" : evolutionStatus === "completed" ? "completed" : "ready") : evolutionStatus);
  const stageStatus = normalizeRoadmapTrainStatus(evolutionStatus === "completed" && sprintStatus === "completed" ? "completed" : sprintStatus === "blocked" ? "blocked" : sprintStatus === "ready" ? "ready" : "planned");
  const gates = buildRoadmapTrainStageGates(profile, pipeline, version, index, versionControl);
  const evolutionEntry = {
    evolution_id: evolution.evolution_id || `evo-${String(index + 1).padStart(4, "0")}`,
    title: evolution.title || version.title || `Evolution ${index + 1}`,
    sequence: index + 1,
    version_id: stageVersionId,
    evo_sprint_id: evoSprintId,
    status: evolutionStatus,
    task_punch_id: taskPunch.task_punch_id || `task-punch-${String(index + 1).padStart(4, "0")}`,
    task_ids: [...taskIds],
    docs_required: [...docsRequired],
    validation_commands: Array.isArray(version.validation_commands) ? [...version.validation_commands] : [...(evolution.validation_commands || [])],
    stop_condition: evolution.stop_condition || version.readiness_gate || "Stop if blockers remain."
  };
  const sprintEntry = {
    evo_sprint_id: evoSprintId,
    title: `${version.title || versionId} Evo Sprint`,
    sequence: 1,
    status: sprintStatus,
    planning_method: stageMethod,
    evolution_ids: [evolutionEntry.evolution_id],
    task_ids: [...taskIds],
    depends_on: index > 0 ? [`evo-sprint-${String(index).padStart(3, "0")}`] : [],
    blockers: stageStatus === "blocked" ? [...gates.blockers] : [],
    next_action: version.next_action || evolutionEntry.stop_condition || "Review the next stage."
  };
  const stageEntry = {
    version_id: stageVersionId,
    title: version.title || versionId,
    sequence: index + 1,
    status: stageStatus,
    planning_method: stageMethod,
    evo_sprints: [sprintEntry],
    gates
  };
  const majorVersionEntry = {
    major_version: versionId,
    target_version: stageVersionId,
    title: version.title || versionId,
    track: profile.track,
    status: stageStatus === "completed" ? "completed" : stageStatus === "blocked" ? "blocked" : stageStatus === "ready" ? "ready" : "planned",
    stages: [stageEntry]
  };
  const queueEntry = {
    position: index + 1,
    major_version: majorVersionEntry.major_version,
    version_id: stageVersionId,
    evo_sprint_id: evoSprintId,
    evolution_id: evolutionEntry.evolution_id,
    title: evolutionEntry.title,
    status: evolutionStatus,
    blocked: stageStatus === "blocked",
    task_ids: [...taskIds],
    task_punch_id: evolutionEntry.task_punch_id,
    docs_required: [...docsRequired],
    validation_commands: [...evolutionEntry.validation_commands],
    stop_condition: evolutionEntry.stop_condition,
    next_action: sprintEntry.next_action
  };
  return {
    major_version_entry: majorVersionEntry,
    fifo_queue_entry: queueEntry,
    evolution: evolutionEntry,
    sprint: sprintEntry,
    stage: stageEntry
  };
}

function buildPlannerRoadmapTrainReadinessState({ profile, planning, pipeline, versionControl, fifoQueue, trainVersions }) {
  if (profile.train_type === "viber") {
    const currentVersion = versionControl && versionControl.current_version ? versionControl.current_version : null;
    const readiness = currentVersion && currentVersion.publish_gate ? currentVersion.publish_gate : (versionControl && versionControl.publish_readiness ? versionControl.publish_readiness : buildEmptyVersionGate("publish"));
    const gates = {
      docs: currentVersion ? currentVersion.docs_gate || buildEmptyVersionGate("docs") : buildEmptyVersionGate("docs"),
      evolution: currentVersion ? currentVersion.evolution_gate || buildEmptyVersionGate("evolution") : buildEmptyVersionGate("evolution"),
      task: currentVersion ? currentVersion.task_gate || buildEmptyVersionGate("task") : buildEmptyVersionGate("task"),
      validation: currentVersion ? currentVersion.validation_gate || buildEmptyVersionGate("validation") : buildEmptyVersionGate("validation"),
      security: currentVersion ? currentVersion.security_gate || buildEmptyVersionGate("security") : buildEmptyVersionGate("security"),
      handoff: currentVersion ? currentVersion.handoff_gate || buildEmptyVersionGate("handoff") : buildEmptyVersionGate("handoff"),
      publish: readiness
    };
    return {
      status: readiness.status === "blocked" ? "blocked" : readiness.status === "pass" ? "ready" : "warning",
      gates,
      blockers: collectRoadmapTrainBlockers(gates),
      warnings: collectRoadmapTrainWarnings(gates),
      next_action: readiness.next_action || "Review the version gates before publishing."
    };
  }
  const hasDocs = Boolean(Array.isArray(pipeline.documentation_files) && pipeline.documentation_files.length);
  const hasValidation = Boolean(Array.isArray(pipeline.validation_commands) && pipeline.validation_commands.length);
  const hasSecurity = Boolean(versionControl && versionControl.publish_readiness && versionControl.publish_readiness.status);
  const gates = {
    docs: buildVersionGateState("docs", { required: true, status: hasDocs ? "pass" : "warning", evidence: hasDocs ? pipeline.documentation_files : [], warnings: hasDocs ? [] : ["Docs are not yet recorded."], next_action: hasDocs ? "Docs gate passed." : "Generate the required docs." }),
    schemas: buildVersionGateState("schemas", { required: true, status: hasDocs ? "pass" : "warning", evidence: hasDocs ? pipeline.documentation_files.filter((item) => String(item).includes("schemas")) : [], warnings: hasDocs ? [] : ["Schema evidence is not yet recorded."], next_action: hasDocs ? "Schemas are present." : "Record schema coverage." }),
    tests: buildVersionGateState("tests", { required: true, status: hasValidation ? "pass" : "warning", evidence: hasValidation ? pipeline.validation_commands : [], warnings: hasValidation ? [] : ["Test commands are missing."], next_action: hasValidation ? "Tests are ready." : "Add validation commands." }),
    validation: buildVersionGateState("validation", { required: true, status: hasValidation ? "pass" : "warning", evidence: hasValidation ? pipeline.validation_commands : [], warnings: hasValidation ? [] : ["Validation evidence is missing."], next_action: hasValidation ? "Validation gate passed." : "Capture validation results." }),
    security: buildVersionGateState("security", { required: true, status: hasSecurity ? "pass" : "warning", evidence: hasSecurity ? [versionControl.publish_readiness.status] : [], warnings: hasSecurity ? [] : ["Security readiness is not recorded."], next_action: hasSecurity ? "Security readiness is present." : "Capture the security gate summary." }),
    source_control: buildVersionGateState("source_control", { required: true, status: planning.source_control && planning.source_control.mode ? "pass" : "warning", evidence: planning.source_control ? [summarizeSourceControl(planning.source_control)] : [], warnings: planning.source_control ? [] : ["Source control mode is not recorded."], next_action: planning.source_control ? "Source control is recorded." : "Choose a source control mode." }),
    generated_reports: buildVersionGateState("generated_reports", { required: true, status: pipeline.visual_planning ? "pass" : "warning", evidence: pipeline.visual_planning ? ["visual planning available"] : [], warnings: pipeline.visual_planning ? [] : ["Visual planning is missing."], next_action: pipeline.visual_planning ? "Generated reports are present." : "Generate the visual roadmap." }),
    direct_main: buildVersionGateState("direct_main", { required: true, status: planning.source_control && planning.source_control.mode === "direct_main" ? "pass" : "warning", evidence: planning.source_control ? [planning.source_control.mode || "local_only"] : [], warnings: planning.source_control && planning.source_control.mode === "direct_main" ? [] : ["Direct-to-main is not the active mode."], next_action: planning.source_control && planning.source_control.mode === "direct_main" ? "Direct-to-main readiness is present." : "Confirm the direct-main delivery mode." })
  };
  const status = gates.docs.status === "pass" && gates.schemas.status === "pass" && gates.tests.status === "pass" && gates.validation.status === "pass" && gates.security.status === "pass" && gates.source_control.status === "pass" && gates.generated_reports.status === "pass" && gates.direct_main.status === "pass"
    ? "ready"
    : [gates.docs, gates.schemas, gates.tests, gates.validation, gates.security, gates.source_control, gates.generated_reports, gates.direct_main].some((gate) => gate.status === "blocked")
      ? "blocked"
      : "warning";
  return {
    status,
    gates,
    blockers: collectRoadmapTrainBlockers(gates),
    warnings: collectRoadmapTrainWarnings(gates),
    next_action: status === "ready" ? "Owner roadmap train readiness is satisfied." : "Resolve the owner readiness gates."
  };
}

function collectRoadmapTrainBlockers(gates = {}) {
  return Object.values(gates).flatMap((gate) => gate && Array.isArray(gate.blockers) ? gate.blockers : []).filter(Boolean);
}

function collectRoadmapTrainWarnings(gates = {}) {
  return Object.values(gates).flatMap((gate) => gate && Array.isArray(gate.warnings) ? gate.warnings : []).filter(Boolean);
}

function collectRoadmapTrainDocsRequired(profile, pipeline, version, index) {
  if (profile.train_type === "owner") {
    return ["docs", "schemas", "tests", "validation"];
  }
  const docs = Array.isArray(pipeline && pipeline.documentation_files) ? pipeline.documentation_files : [];
  return docs.length ? docs.slice(0, Math.min(docs.length, index + 4)) : ["docs"];
}

function buildRoadmapTrainStageGates(profile, pipeline, version, index, versionControl) {
  if (profile.train_type === "viber") {
    const currentVersion = versionControl && versionControl.versions && versionControl.versions[index] ? versionControl.versions[index] : null;
    return currentVersion ? {
      docs: currentVersion.docs_gate || buildEmptyVersionGate("docs"),
      evolution: currentVersion.evolution_gate || buildEmptyVersionGate("evolution"),
      task: currentVersion.task_gate || buildEmptyVersionGate("task"),
      validation: currentVersion.validation_gate || buildEmptyVersionGate("validation"),
      security: currentVersion.security_gate || buildEmptyVersionGate("security"),
      handoff: currentVersion.handoff_gate || buildEmptyVersionGate("handoff"),
      publish: currentVersion.publish_gate || buildEmptyVersionGate("publish")
    } : {
      docs: buildEmptyVersionGate("docs"),
      evolution: buildEmptyVersionGate("evolution"),
      task: buildEmptyVersionGate("task"),
      validation: buildEmptyVersionGate("validation"),
      security: buildEmptyVersionGate("security"),
      handoff: buildEmptyVersionGate("handoff"),
      publish: buildEmptyVersionGate("publish")
    };
  }
  return {
    docs: buildVersionGateState("docs", { required: true, status: Array.isArray(pipeline.documentation_files) && pipeline.documentation_files.length ? "pass" : "warning", evidence: Array.isArray(pipeline.documentation_files) ? [...pipeline.documentation_files] : [], warnings: Array.isArray(pipeline.documentation_files) && pipeline.documentation_files.length ? [] : ["Documentation is not yet recorded."], next_action: "Generate the required docs." }),
    schemas: buildVersionGateState("schemas", { required: true, status: Array.isArray(pipeline.documentation_files) && pipeline.documentation_files.some((item) => String(item).includes("schemas")) ? "pass" : "warning", evidence: Array.isArray(pipeline.documentation_files) ? pipeline.documentation_files.filter((item) => String(item).includes("schemas")) : [], warnings: [], next_action: "Record schema coverage." }),
    tests: buildVersionGateState("tests", { required: true, status: Array.isArray(pipeline.validation_commands) && pipeline.validation_commands.length ? "pass" : "warning", evidence: Array.isArray(pipeline.validation_commands) ? [...pipeline.validation_commands] : [], warnings: [], next_action: "Add validation commands." }),
    validation: buildVersionGateState("validation", { required: true, status: Array.isArray(pipeline.validation_commands) && pipeline.validation_commands.length ? "pass" : "warning", evidence: Array.isArray(pipeline.validation_commands) ? [...pipeline.validation_commands] : [], warnings: [], next_action: "Run validation and capture the result." }),
    security: buildEmptyVersionGate("security"),
    handoff: buildEmptyVersionGate("handoff"),
    publish: buildEmptyVersionGate("publish")
  };
}

function flattenRoadmapTrainQueue(trainVersions = []) {
  return trainVersions.map((entry) => entry.fifo_queue_entry).filter(Boolean);
}

function buildPlannerRoadmapTrainId(profile, goal) {
  const base = profile.train_type === "viber" ? (profile.app_slug || "viber-release") : "owner-roadmap";
  const seed = String(goal || profile.default_goal || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return seed ? `${base}-${seed}` : `${base}-train`;
}

function advancePlannerRoadmapTrainState(train, evolutionId, nextStatus) {
  const updated = { ...train, fifo_queue: Array.isArray(train.fifo_queue) ? train.fifo_queue.map((item) => ({ ...item })) : [], major_versions: Array.isArray(train.major_versions) ? train.major_versions.map((item) => ({ ...item, stages: Array.isArray(item.stages) ? item.stages.map((stage) => ({ ...stage, evo_sprints: Array.isArray(stage.evo_sprints) ? stage.evo_sprints.map((sprint) => ({ ...sprint })) : [] })) : [] })) : [] };
  const queueItem = updated.fifo_queue.find((item) => String(item.evolution_id || "") === String(evolutionId));
  if (queueItem) {
    queueItem.status = nextStatus;
    queueItem.blocked = nextStatus === "blocked";
  }
  for (const major of updated.major_versions || []) {
    for (const stage of major.stages || []) {
      for (const sprint of stage.evo_sprints || []) {
        if (Array.isArray(sprint.evolution_ids) && sprint.evolution_ids.some((id) => String(id) === String(evolutionId))) {
          sprint.status = nextStatus;
          if (stage.status !== "blocked") stage.status = nextStatus === "completed" ? "completed" : nextStatus === "blocked" ? "blocked" : "active";
        }
      }
    }
  }
  const remaining = updated.fifo_queue.filter((item) => !["completed", "published"].includes(String(item.status || "").toLowerCase()));
  updated.status = remaining.length ? (remaining.some((item) => item.blocked) ? "blocked" : "active") : "completed";
  return updated;
}

function refreshPlannerRoadmapTrainReport(train, profile, context) {
  const updated = { ...train };
  updated.generated_at = updated.generated_at || new Date().toISOString();
  updated.updated_at = new Date().toISOString();
  updated.train_type = updated.train_type || profile.train_type;
  updated.track = updated.track || profile.track;
  updated.planning_method = updated.planning_method || profile.planning_method;
  updated.major_versions = Array.isArray(updated.major_versions) ? updated.major_versions : [];
  updated.fifo_queue = Array.isArray(updated.fifo_queue) ? updated.fifo_queue : [];
  const next = findNextRoadmapTrainEvolution(updated);
  updated.next_evolution_id = next ? next.evolution_id : null;
  updated.readiness = buildPlannerRoadmapTrainReadinessState({
    profile,
    planning: { source_control: updated.source_control || null },
    pipeline: updated.pipeline || {},
    versionControl: updated.version_control || null,
    fifoQueue: updated.fifo_queue,
      trainVersions: updated.major_versions || []
  });
  const queue = Array.isArray(updated.fifo_queue) ? updated.fifo_queue : [];
  const completedCount = queue.filter((item) => ["completed", "published"].includes(String(item.status || "").toLowerCase())).length;
  const allCompleted = queue.length > 0 && completedCount === queue.length;
  const blocked = queue.some((item) => item.blocked || String(item.status || "").toLowerCase() === "blocked") || (updated.readiness && updated.readiness.status === "blocked");
  updated.status = blocked ? "blocked" : allCompleted ? "completed" : next ? "active" : "planned";
  updated.next_action = updated.readiness.next_action || updated.next_action || "Review the train and continue.";
  return updated;
}

function buildEmptyPlannerRoadmapTrainReport(profile, context, nextAction) {
  const now = new Date().toISOString();
  return {
    report_type: "kvdf_roadmap_train",
    generated_at: now,
    train_id: buildPlannerRoadmapTrainId(profile, nextAction),
    train_type: profile.train_type,
    track: profile.track,
    planning_method: profile.planning_method || "auto",
    status: "planned",
    major_versions: [],
    fifo_queue: [],
    next_evolution_id: null,
    created_at: now,
    updated_at: now,
    readiness: {
      status: "unknown",
      gates: {},
      blockers: [],
      warnings: [nextAction],
      next_action: nextAction
    },
    next_action: nextAction
  };
}

function findNextRoadmapTrainEvolution(train) {
  if (!train || !Array.isArray(train.fifo_queue)) return null;
  return train.fifo_queue.find((item) => ["planned", "ready", "active"].includes(String(item.status || "").toLowerCase()) && !item.blocked) || null;
}

function buildPlannerRoadmapTrainMermaid(train) {
  const trainType = train.train_type === "viber" ? "Viber App Release Train" : "Owner Roadmap Train";
  const nodes = [
    "flowchart TD",
    `  Engine["Planning Engine"] --> Major["Major Versions"]`,
    `  Major["Major Versions"] --> Stages["Version Stages"]`,
    `  Stages["Version Stages"] --> Sprints["Evo Sprints"]`,
    `  Sprints["Evo Sprints"] --> Evolutions["Evolutions"]`,
    `  Evolutions["Evolutions"] --> Tasks["Tasks"]`,
    `  Tasks["Tasks"] --> Gates["Gates"]`
  ];
  const majors = Array.isArray(train.major_versions) ? train.major_versions : [];
  majors.forEach((major, majorIndex) => {
    const majorNode = `Major${majorIndex + 1}`;
    nodes.push(`  Major --> ${majorNode}["${escapeMermaidLabel(major.major_version || `v${majorIndex + 1}`)}"]`);
    (major.stages || []).forEach((stage, stageIndex) => {
      const stageNode = `Stage${majorIndex + 1}_${stageIndex + 1}`;
      nodes.push(`  ${majorNode} --> ${stageNode}["${escapeMermaidLabel(stage.version_id || `stage-${stageIndex + 1}`)}"]`);
      (stage.evo_sprints || []).forEach((sprint, sprintIndex) => {
        const sprintNode = `Sprint${majorIndex + 1}_${stageIndex + 1}_${sprintIndex + 1}`;
        nodes.push(`  ${stageNode} --> ${sprintNode}["${escapeMermaidLabel(sprint.evo_sprint_id || `sprint-${sprintIndex + 1}`)}"]`);
        (sprint.evolution_ids || []).forEach((evolutionId, evoIndex) => {
          const evoNode = `Evo${majorIndex + 1}_${stageIndex + 1}_${sprintIndex + 1}_${evoIndex + 1}`;
          nodes.push(`  ${sprintNode} --> ${evoNode}["${escapeMermaidLabel(evolutionId || `evo-${evoIndex + 1}`)}"]`);
        });
      });
    });
  });
  nodes.push(`  Gates --> Train["${escapeMermaidLabel(trainType)}"]`);
  return nodes.join("\n");
}

function escapeMermaidLabel(value) {
  return String(value || "").replace(/"/g, "'");
}

function buildPlannerRoadmapTrainBoard(train) {
  const majorVersions = Array.isArray(train.major_versions) ? train.major_versions : [];
  return {
    columns: [
      { title: "Major Versions", cards: majorVersions.map((major) => ({ id: major.major_version, title: major.title || major.major_version, status: major.status })) },
      { title: "FIFO Queue", cards: Array.isArray(train.fifo_queue) ? train.fifo_queue.map((item) => ({ id: item.evolution_id, title: item.title, status: item.status })) : [] },
      { title: "Readiness", cards: train.readiness ? Object.entries(train.readiness.gates || {}).map(([gate, state]) => ({ id: gate, title: gate, status: state.status })) : [] }
    ]
  };
}

function buildPlannerRoadmapTrainSummaryLines(train) {
  return [
    `- Train type: ${train.train_type || "owner"}`,
    `- Track: ${train.track || ""}`,
    `- Planning method: ${train.planning_method || "auto"}`,
    `- Status: ${train.status || "planned"}`,
    `- Next evolution: ${train.next_evolution_id || "none"}`
  ];
}

function buildPlannerVersionEntry(version = {}, options = {}) {
  const currentPlan = options.currentPlan || null;
  const context = options.context || {};
  const sourceControl = options.sourceControl || null;
  const versionControlState = options.versionControlState || null;
  const versionPlanItem = version || {};
  const docsStatus = currentPlan && currentPlan.docs_status ? currentPlan.docs_status : null;
  const tasks = versionPlanItem.task_punch && Array.isArray(versionPlanItem.task_punch.tasks) ? versionPlanItem.task_punch.tasks : [];
  const taskIds = tasks.map((task) => task.id).filter(Boolean);
  const evolution = versionPlanItem.evolution || (Array.isArray(versionPlanItem.included_evolutions) && versionPlanItem.included_evolutions.length ? { evolution_id: versionPlanItem.included_evolutions[0], title: versionPlanItem.title } : null);
  const docsGate = buildVersionGateState("docs", {
    required: true,
    evidence: docsStatus ? [docsStatus.status || "planned"] : [],
    blockers: docsStatus && docsStatus.status === "missing" ? ["documentation missing"] : [],
    warnings: docsStatus && ["planned", "generated"].includes(docsStatus.status) ? ["docs not yet applied"] : [],
    next_action: docsStatus && docsStatus.next_action ? docsStatus.next_action : "Generate and apply the required docs."
  });
  const evolutionGate = buildVersionGateState("evolution", {
    required: true,
    evidence: evolution ? [evolution.evolution_id || versionPlanItem.version_id] : [],
    blockers: evolution ? [] : ["missing evolution"],
    warnings: [],
    next_action: evolution ? "Keep the current evolution in sync with the version." : "Create the first evolution for this version."
  });
  const taskGate = buildVersionTaskGate(versionPlanItem, context, taskIds);
  const validationGate = buildVersionGateState("validation", {
    required: true,
    evidence: Array.isArray(versionPlanItem.validation_commands) ? versionPlanItem.validation_commands : [],
    blockers: [],
    warnings: Array.isArray(versionPlanItem.validation_commands) && versionPlanItem.validation_commands.length ? ["validation evidence not recorded yet"] : ["no validation commands recorded"],
    next_action: "Run the validation commands and capture the result."
  });
  const securityGate = buildVersionSecurityGate(versionPlanItem, options);
  const handoffGate = buildVersionHandoffGate(versionPlanItem, options);
  const publishGate = buildVersionPublishGate(versionPlanItem, { docsGate, evolutionGate, taskGate, validationGate, securityGate, handoffGate, sourceControl, versionControlState });
  const blockers = collectVersionBlockers(publishGate, { version_id: versionPlanItem.version_id, title: versionPlanItem.title });
  const warnings = collectVersionWarnings(publishGate, { version_id: versionPlanItem.version_id, title: versionPlanItem.title });
  const status = deriveVersionStatus({
    versionPlanItem,
    docsGate,
    evolutionGate,
    taskGate,
    validationGate,
    securityGate,
    handoffGate,
    publishGate,
    currentPlan,
    versionControlState
  });
  return {
    version_id: versionPlanItem.version_id || "",
    title: versionPlanItem.title || "",
    app: options.appSlug || null,
    track: currentPlan ? currentPlan.track || null : null,
    planning_method: currentPlan ? currentPlan.planning_method || null : null,
    status,
    source_control_mode: versionPlanItem.source_control_mode || sourceControl && sourceControl.mode || null,
    included_evolutions: Array.isArray(versionPlanItem.included_evolutions) ? [...versionPlanItem.included_evolutions] : [],
    task_ids: [...taskIds],
    docs_gate: docsGate,
    evolution_gate: evolutionGate,
    task_gate: taskGate,
    validation_gate: validationGate,
    security_gate: securityGate,
    handoff_gate: handoffGate,
    publish_gate: publishGate,
    blockers,
    warnings,
    next_action: versionPlanItem.next_action || publishGate.next_action || "Review the version gates and continue."
  };
}

function buildVersionGateState(name, data = {}) {
  const status = String(data.status || (data.blockers && data.blockers.length ? "blocked" : data.warnings && data.warnings.length ? "warning" : "unknown")).toLowerCase();
  return {
    gate: name,
    status,
    required: data.required !== false,
    evidence: Array.isArray(data.evidence) ? [...data.evidence] : [],
    blockers: Array.isArray(data.blockers) ? [...data.blockers] : [],
    warnings: Array.isArray(data.warnings) ? [...data.warnings] : [],
    next_action: data.next_action || "Review the gate."
  };
}

function buildVersionTaskGate(versionPlanItem, context, taskIds = []) {
  const tasks = Array.isArray(context.task_state && context.task_state.tasks) ? context.task_state.tasks : [];
  const relatedEvolutionId = versionPlanItem.evolution && versionPlanItem.evolution.evolution_id ? versionPlanItem.evolution.evolution_id : null;
  const related = taskIds.length ? tasks.filter((task) => taskIds.includes(task.id) || (relatedEvolutionId && task.evolution_change_id === relatedEvolutionId)) : [];
  if (!related.length) {
    return buildVersionGateState("task", {
      required: true,
      status: "warning",
      evidence: [],
      warnings: ["task punch has not been recorded yet"],
      next_action: "Create and execute the task punch for this version."
    });
  }
  const inProgress = related.filter((task) => ["assigned", "in_progress", "review"].includes(String(task.status || "").toLowerCase()));
  const complete = related.filter((task) => ["owner_verified", "done", "closed", "completed"].includes(String(task.status || "").toLowerCase()));
  if (inProgress.length) {
    return buildVersionGateState("task", {
      required: true,
      evidence: related.map((task) => `${task.id}:${task.status}`),
      warnings: inProgress.map((task) => `${task.id} is ${task.status}`),
      next_action: "Finish or verify the remaining task slices."
    });
  }
  if (complete.length === related.length) {
    return buildVersionGateState("task", {
      required: true,
      status: "pass",
      evidence: related.map((task) => `${task.id}:${task.status}`),
      next_action: "Task gate passed."
    });
  }
  return buildVersionGateState("task", {
    required: true,
    evidence: related.map((task) => `${task.id}:${task.status}`),
    warnings: ["task evidence exists but is not fully complete"],
    next_action: "Resolve the remaining task statuses."
  });
}

function buildVersionSecurityGate(versionPlanItem, options = {}) {
  const securityGateState = options.securityGateState || readJsonFileIfExists(path.join(options.context ? options.context.repo_root : process.cwd(), ".kabeeri", "security", "security_gate_state.json"));
  if (securityGateState && securityGateState.status) {
    return buildVersionGateState("security", {
      required: true,
      status: securityGateState.status,
      evidence: [securityGateState.next_action || securityGateState.status],
      blockers: securityGateState.status === "blocked" ? [securityGateState.next_action || "Security gate blocked"] : [],
      warnings: securityGateState.status === "warning" ? [securityGateState.next_action || "Security gate warning"] : [],
      next_action: securityGateState.next_action || "Review the security gate."
    });
  }
  return buildVersionGateState("security", {
    required: false,
    status: "not_applicable",
    evidence: ["No security gate state found."],
    next_action: "No security gate evidence is recorded."
  });
}

function buildVersionHandoffGate(versionPlanItem, options = {}) {
  const handoffState = options.handoffState || readJsonFileIfExists(path.join(options.context ? options.context.repo_root : process.cwd(), ".kabeeri", "handoff", "packages.json"));
  const hasEvidence = Boolean(handoffState && ((Array.isArray(handoffState.packages) && handoffState.packages.length) || (handoffState.current && handoffState.current.package_id)));
  if (hasEvidence || (versionPlanItem && versionPlanItem.version_id)) {
    return buildVersionGateState("handoff", {
      required: true,
      status: hasEvidence ? "pass" : "warning",
      evidence: hasEvidence ? ["handoff evidence available"] : ["handoff package not recorded"],
      warnings: hasEvidence ? [] : ["handoff readiness not yet recorded"],
      next_action: hasEvidence ? "Handoff gate passed." : "Prepare the handoff package."
    });
  }
  return buildVersionGateState("handoff", {
    required: true,
    status: "warning",
    evidence: [],
    warnings: ["handoff package missing"],
    next_action: "Create the handoff package before publishing."
  });
}

function buildVersionPublishGate(versionPlanItem, options = {}) {
  const gates = [options.docsGate, options.evolutionGate, options.taskGate, options.validationGate, options.securityGate, options.handoffGate].filter(Boolean);
  const blockers = gates.flatMap((gate) => gate.blockers || []);
  const warnings = gates.flatMap((gate) => gate.warnings || []);
  const mode = options.sourceControl ? String(options.sourceControl.mode || "").toLowerCase() : "";
  const publishTarget = mode === "direct_main" ? "github_release" : mode === "branch_pr" ? "custom" : "local_handoff";
  if (blockers.length) {
    return buildVersionGateState("publish", {
      required: true,
      status: "blocked",
      evidence: gates.map((gate) => `${gate.gate}:${gate.status}`),
      blockers,
      warnings,
      next_action: "Resolve the blocked gates before publishing."
    });
  }
  if (warnings.length) {
    return buildVersionGateState("publish", {
      required: true,
      status: "warning",
      evidence: gates.map((gate) => `${gate.gate}:${gate.status}`),
      blockers: [],
      warnings,
      next_action: "Review the warnings before publishing."
    });
  }
  return buildVersionGateState("publish", {
    required: true,
    status: "pass",
    evidence: gates.map((gate) => `${gate.gate}:${gate.status}`),
    next_action: publishTarget === "github_release" ? "Publish externally only when explicitly approved." : "Record the local handoff before the next version."
  });
}

function buildEmptyVersionGate(name) {
  return buildVersionGateState(name, { status: "unknown", required: true, evidence: [], blockers: [], warnings: [], next_action: "Review the gate." });
}

function deriveVersionStatus({ docsGate, evolutionGate, taskGate, validationGate, securityGate, handoffGate, publishGate, currentPlan, versionControlState }) {
  const explicit = versionControlState && String(versionControlState.status || "").toLowerCase();
  if (explicit === "published") return "published";
  const gates = [docsGate, evolutionGate, taskGate, validationGate, securityGate, handoffGate, publishGate];
  if (gates.some((gate) => gate && gate.status === "blocked")) return "blocked";
  if (publishGate && publishGate.status === "pass") return "publish_ready";
  if (handoffGate && handoffGate.status === "pass") return "handoff_ready";
  if (securityGate && securityGate.status === "pass") return "security_passed";
  if (validationGate && validationGate.status === "pass") return "validated";
  if (taskGate && taskGate.status === "pass") return "tasks_done";
  if (taskGate && ["warning", "pass"].includes(taskGate.status) && taskGate.evidence && taskGate.evidence.some((item) => /assigned|in_progress|review/.test(item))) return "in_progress";
  if (currentPlan && String(currentPlan.status || "").toLowerCase() === "approved") return "approved";
  if (docsGate && ["pass", "warning"].includes(docsGate.status)) return "docs_ready";
  return "planned";
}

function aggregateVersionGateStatus(gates = {}) {
  const values = Object.values(gates).filter(Boolean);
  if (values.some((gate) => gate.status === "blocked")) return buildVersionGateState("all", { status: "blocked", blockers: collectVersionBlockers(null, null, values) });
  if (values.some((gate) => gate.status === "warning")) return buildVersionGateState("all", { status: "warning", warnings: collectVersionWarnings(null, null, values) });
  if (values.every((gate) => gate.status === "pass")) return buildVersionGateState("all", { status: "pass", evidence: values.flatMap((gate) => gate.evidence || []) });
  return buildVersionGateState("all", { status: "unknown" });
}

function collectVersionBlockers(gate, currentVersion, gates = []) {
  if (Array.isArray(gates) && gates.length) return gates.flatMap((item) => item.blockers || []);
  return [...(gate && gate.blockers ? gate.blockers : []), ...(currentVersion && currentVersion.blockers ? currentVersion.blockers : [])];
}

function collectVersionWarnings(gate, currentVersion, gates = []) {
  if (Array.isArray(gates) && gates.length) return gates.flatMap((item) => item.warnings || []);
  return [...(gate && gate.warnings ? gate.warnings : []), ...(currentVersion && currentVersion.warnings ? currentVersion.warnings : [])];
}

function inferPublishTarget(currentVersion, report) {
  const mode = report && report.source_control_mode ? String(report.source_control_mode).toLowerCase() : "";
  if (mode === "direct_main") return "github_release";
  if (mode === "branch_pr") return "custom";
  return "local_handoff";
}

function findVersionEntry(report, versionId) {
  if (!report || !Array.isArray(report.versions)) return null;
  const id = normalizeVersionId(versionId);
  if (id) return report.versions.find((version) => normalizeVersionId(version.version_id) === id) || null;
  return report.current_version || report.versions[0] || null;
}

function normalizeVersionId(value) {
  return String(value || "").trim();
}

function buildPlannerVersionFilePath(repoRootPath, appSlug) {
  const slug = normalizeAppSlug(appSlug || "app-draft");
  return path.join(repoRootPath || process.cwd(), "workspaces", "apps", slug, ".kabeeri", "version_control.json");
}

function readPlannerVersionControlState(repoRootPath, appSlug) {
  const appPath = buildPlannerVersionFilePath(repoRootPath, appSlug);
  const rootPath = path.join(repoRootPath || process.cwd(), ".kabeeri", "version_control.json");
  const filePath = fs.existsSync(appPath) ? appPath : rootPath;
  return readJsonFileIfExists(filePath) || { report_type: "kvdf_viber_version_control", versions: [] };
}

function savePlannerVersionControlState(repoRootPath, appSlug, state) {
  const filePath = buildPlannerVersionFilePath(repoRootPath, appSlug);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  const rootPath = path.join(repoRootPath || process.cwd(), ".kabeeri", "version_control.json");
  fs.mkdirSync(path.dirname(rootPath), { recursive: true });
  fs.writeFileSync(rootPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function readPlannerLatestFeedback(repoRootPath, appSlug) {
  const feedbackDir = path.join(repoRootPath || process.cwd(), ".kabeeri", "reports");
  if (!fs.existsSync(feedbackDir)) return null;
  const files = fs.readdirSync(feedbackDir).filter((file) => /^planner_feedback_.+\.json$/i.test(file)).sort().reverse();
  if (!files.length) return null;
  return readJsonFileIfExists(path.join(feedbackDir, files[0]));
}

function buildPlannerFeedbackCommandReport(value = "", flags = {}, rest = [], deps = {}) {
  const context = buildPlannerContext(deps);
  const currentState = buildPlannerCurrentStateSummary(context, flags);
  if (currentState.write_policy && !currentState.write_policy.can_write && !resolveBooleanFlag(flags.dry_run || flags["dry-run"])) {
    const error = new Error(currentState.write_policy.reason || "Workspace identity is ambiguous.");
    error.current_state = currentState;
    throw error;
  }
  const plannerState = loadPlannerState(context.repo_root);
  const currentPlan = isFromCurrentPlan(flags) ? findCurrentPlannerPlan(plannerState) : findPlannerPlan(plannerState, flags.plan || flags.plan_id || value);
  const planId = currentPlan ? currentPlan.plan_id : normalizeVersionId(flags.plan || flags.plan_id || value || "feedback");
  const summary = String(flags.summary || flags.message || rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")).trim();
  const checks = String(flags.checks || flags["check"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  const status = String(flags.status || "warning").toLowerCase();
  const changedFiles = String(flags.changed_files || flags["changed-files"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  const docsUpdated = String(flags.docs_updated || flags["docs-updated"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  const tasksAffected = String(flags.tasks || flags["tasks-affected"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  const feedbackId = `planner-feedback-${Date.now()}`;
  const record = {
    report_type: "kvdf_planner_execution_feedback",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: ["pass", "warning", "blocked"].includes(status) ? status : "warning",
    executor: String(flags.executor || flags.by || "manual").trim().toLowerCase(),
    summary,
    checks,
    changed_files: changedFiles,
    check_results: Array.isArray(flags.check_results) ? flags.check_results : [],
    docs_updated: docsUpdated,
    tasks_affected: tasksAffected,
    evolution_affected: flags.evolution || flags.evolution_id || null,
    stop_condition_met: resolveBooleanFlag(flags["stop-condition-met"] || flags.stop_condition_met),
    next_action: flags.next_action || "Review the feedback and continue with the next governed action."
  };
  const reportPath = path.join(context.repo_root, ".kabeeri", "reports", `${feedbackId}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  if (plannerState) {
    plannerState.latest_feedback = record;
    if (currentPlan) currentPlan.latest_feedback = record;
    savePlannerState(context.repo_root, plannerState);
  }
  return attachPlannerCurrentStateSummary(record, context, {
    track: currentPlan ? currentPlan.track : normalizeTrackAlias(flags.track),
    app: currentPlan ? currentPlan.app_slug || "" : ""
  });
}
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  planner,
  buildPlannerNextReport,
  buildPlannerPromptReport,
  buildPlannerGuardReport,
  buildPlannerCurrentStateReport,
  buildPlannerWorkspaceBoundaryReport,
  buildPlannerStaleStateReport,
  buildPlannerEvolutionReport,
  buildPlannerTaskPunchReport,
  buildPlannerVisualReport,
  buildPlannerVisualFromCurrentReport,
  buildIdeaToEvolutionPipelineReport,
  buildPlannerEvolutionPlan,
  buildPlannerTruthReport,
  openPlannerPreview,
  buildPlannerPreviewHtml,
  renderPlannerNextReport,
  renderPlannerEvolutionPlan,
  renderPlannerPromptReport,
  renderPlannerTaskPunchReport,
  renderPlannerPipelineReport,
  renderPlannerVisualReport
};

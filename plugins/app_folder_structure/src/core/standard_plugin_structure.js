const path = require("path");
const {
  APP_AGENT_DIRS,
  APP_ARCHIVE_DIRS,
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
} = require("./constants");
const { normalizeCategory, slugify } = require("../utils/slugify");
const { resolveCategoryProfile } = require("./category_registry");

const APP_SOURCE_FILES = [
  "08_source/README.md",
  "08_source/source_manifest.json"
];

const CATEGORY_LAYOUT_TARGETS = {
  uiux: "01_uiux",
  system_design: "02_system_design",
  database: "03_database"
};

function buildStandardPackagePlan(appSlug, options = {}) {
  return buildAppWorkspacePlan(appSlug, options);
}

function buildWorkspacePlan(appSlug, options = {}) {
  return buildAppWorkspacePlan(appSlug, options);
}

function comparePackageStructure(ownerPlan, workspacePlan) {
  const normalize = (value) => String(value || "").replace(/\\/g, "/").toLowerCase();
  const relativePackagePath = (value) => {
    const normalized = normalize(value);
    const workspaceMatch = normalized.match(/^workspaces\/plugins\/[^/]+\/04_plugin_package\/(.+)$/);
    if (workspaceMatch) return workspaceMatch[1];
    const ownerMatch = normalized.match(/^plugins\/[^/]+\/(.+)$/);
    if (ownerMatch) return ownerMatch[1];
    const pluginDevMatch = normalized.match(/^workspaces\/plugins\/[^/]+\/(.+)$/);
    if (pluginDevMatch) return pluginDevMatch[1].replace(/^04_plugin_package\/?/, "");
    return normalized;
  };
  const ownerDirectories = new Set((ownerPlan.directories || []).map(relativePackagePath).filter(Boolean));
  const workspaceDirectories = new Set((workspacePlan.directories || []).map(relativePackagePath).filter(Boolean));
  const ownerFiles = new Set((ownerPlan.files || []).map(([filePath]) => relativePackagePath(filePath)).filter(Boolean));
  const workspaceFiles = new Set((workspacePlan.files || []).map(([filePath]) => relativePackagePath(filePath)).filter(Boolean));
  const same_directories = [...ownerDirectories].every((item) => workspaceDirectories.has(item));
  const same_files = [...ownerFiles].every((item) => workspaceFiles.has(item));
  return { same_directories, same_files };
}

function buildAppWorkspacePlan(appSlug, options = {}) {
  const normalizedSlug = normalizeWorkspaceSlug(appSlug);
  const workspaceRoot = path.resolve(options.repoRootPath || process.cwd(), APP_WORKSPACE_ROOT, normalizedSlug);
  const categoryProfile = resolveCategoryProfile(options.category || "generic");
  const appName = String(options.appName || options.name || normalizedSlug).trim() || normalizedSlug;
  const createdAt = options.createdAt || new Date().toISOString();
  const pipelineDirs = [
    ...APP_TOP_LEVEL_DIRS,
    ...APP_RUNTIME_DIRS,
    ...APP_INPUT_DIRS,
    ...APP_ROADMAP_DIRS,
    ...APP_VERSION_CONTROL_DIRS,
    ...APP_EVOLUTION_DIRS,
    ...APP_TASK_PUNCH_DIRS,
    ...APP_AGENT_DIRS,
    ...APP_TEST_DIRS,
    ...APP_EVIDENCE_DIRS,
    ...APP_REVIEW_DIRS,
    ...APP_RELEASE_DIRS,
    ...APP_ARCHIVE_DIRS
  ];
  const directories = [...new Set(pipelineDirs.map((relative) => path.join(workspaceRoot, relative)))];
  const files = [
    [path.join(workspaceRoot, "README.md"), buildWorkspaceReadme(appName, normalizedSlug, categoryProfile)],
    [path.join(workspaceRoot, "app.kvdos.yaml"), buildAppKvdosYaml(appName, normalizedSlug, categoryProfile, createdAt)],
    [path.join(workspaceRoot, ".kabeeri", "app_state.json"), buildAppStateJson(appName, normalizedSlug, categoryProfile, createdAt)],
    [path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json"), buildAppFolderManifestJson(appName, normalizedSlug, categoryProfile, createdAt)],
    [path.join(workspaceRoot, ".kabeeri", "locks", "README.md"), buildSimpleReadme("App Locks", "Lock files and serialized workspace locks live here.")],
    [path.join(workspaceRoot, ".kabeeri", "cache", "README.md"), buildSimpleReadme("App Cache", "Transient app cache can be stored here.")]
  ];
  files.push(...buildInputFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildCategoryFiles(workspaceRoot, appName, normalizedSlug, categoryProfile));
  files.push(...buildSpecFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildVersionControlFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildEvolutionFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildTaskPunchFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildAgentFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildTestFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildEvidenceFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildReviewFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildReleaseFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildPortalFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildArchiveFiles(workspaceRoot, appName, normalizedSlug));
  files.push(...buildRoadmapFiles(workspaceRoot, appName, normalizedSlug, categoryProfile));
  files.push(...buildSourceFiles(workspaceRoot, appName, normalizedSlug));

  return {
    root: workspaceRoot,
    workspace_root: workspaceRoot,
    slug: normalizedSlug,
    app_name: appName,
    category: categoryProfile.category_id,
    category_profile: categoryProfile,
    directories,
    files,
    top_level_dirs: [...APP_TOP_LEVEL_DIRS],
    package_root: workspaceRoot,
    actual_plugin_package: "04_plugin_package",
    source_tracking_folder: "08_source",
    manifest: buildAppFolderManifest(appName, normalizedSlug, categoryProfile, createdAt),
    app_kvdos_yaml: buildAppKvdosYaml(appName, normalizedSlug, categoryProfile, createdAt)
  };
}

function buildWorkspaceReadme(appName, appSlug, profile) {
  return [
    `# ${appName}`,
    "",
    "This workspace is governed by the `app_folder_structure` plugin.",
    "",
    `- App slug: \`${appSlug}\``,
    `- Category: \`${profile.category_id}\``,
    `- Platform: \`${profile.platform_type}\``,
    `- Profile version: \`${profile.profile_version}\``,
    "",
    "The top-level pipeline is fixed, but the roadmap internals come from the category profile.",
    ""
  ].join("\n");
}

function buildSimpleReadme(title, body) {
  return [`# ${title}`, "", body, ""].join("\n");
}

function buildAppKvdosYaml(appName, appSlug, profile, createdAt) {
  return [
    `version: ${PROFILE_VERSION}`,
    `app_slug: ${appSlug}`,
    `app_name: ${jsonSafeScalar(appName)}`,
    `category: ${profile.category_id}`,
    `platform_type: ${profile.platform_type}`,
    `profile_version: ${profile.profile_version}`,
    `source_plugin: ${SOURCE_PLUGIN}`,
    `workspace_root: workspaces/apps/${appSlug}`,
    `created_at: ${createdAt}`
  ].join("\n") + "\n";
}

function buildAppStateJson(appName, appSlug, profile, createdAt) {
  return JSON.stringify({
    version: PROFILE_VERSION,
    plugin_id: PLUGIN_ID,
    plugin_name: PLUGIN_NAME,
    plugin_track: PLUGIN_TRACK,
    workspace_kind: "app_folder_structure_workspace",
    app_slug: appSlug,
    app_name: appName,
    category: profile.category_id,
    platform_type: profile.platform_type,
    profile_version: profile.profile_version,
    source_plugin: SOURCE_PLUGIN,
    workspace_root: `workspaces/apps/${appSlug}`,
    created_at: createdAt,
    updated_at: createdAt
  }, null, 2) + "\n";
}

function buildAppFolderManifest(appName, appSlug, profile, createdAt) {
  return {
    version: PROFILE_VERSION,
    plugin_id: PLUGIN_ID,
    plugin_name: PLUGIN_NAME,
    app_slug: appSlug,
    app_name: appName,
    category: profile.category_id,
    platform_type: profile.platform_type,
    profile_version: profile.profile_version,
    source_plugin: SOURCE_PLUGIN,
    workspace_root: `workspaces/apps/${appSlug}`,
    pipeline: [...APP_TOP_LEVEL_DIRS],
    created_at: createdAt,
    updated_at: createdAt
  };
}

function buildAppFolderManifestJson(appName, appSlug, profile, createdAt) {
  return JSON.stringify(buildAppFolderManifest(appName, appSlug, profile, createdAt), null, 2) + "\n";
}

function buildCategoryFiles(workspaceRoot, appName, appSlug, profile) {
  return [
    [path.join(workspaceRoot, "01_category", "README.md"), buildSimpleReadme("Category", "Category selection and approved folder-structure profile live here.")],
    [path.join(workspaceRoot, "01_category", "selected_category.json"), JSON.stringify({
      selected_category: profile.category_id,
      title: profile.title,
      platform_type: profile.platform_type,
      profile_version: profile.profile_version,
      source_plugin: SOURCE_PLUGIN
    }, null, 2) + "\n"],
    [path.join(workspaceRoot, "01_category", "folder_structure_profile.json"), JSON.stringify(profile.folder_structure_profile, null, 2) + "\n"],
    [path.join(workspaceRoot, "01_category", "category_profile.md"), [
      `# ${profile.title}`,
      "",
      `- category_id: ${profile.category_id}`,
      `- platform_type: ${profile.platform_type}`,
      `- profile_version: ${profile.profile_version}`,
      `- source_plugin: ${SOURCE_PLUGIN}`,
      ""
    ].join("\n")]
  ];
}

function buildRoadmapFiles(workspaceRoot, appName, appSlug, profile) {
  const uiuxSections = profile.uiux_sections || [];
  const systemSections = profile.system_design_sections || [];
  const databaseSections = profile.database_sections || [];
  const uiuxDirs = uiuxSections.map((section) => path.join(workspaceRoot, "02_roadmaps_plans", "01_uiux", section));
  const systemDirs = systemSections.map((section) => path.join(workspaceRoot, "02_roadmaps_plans", "02_system_design", section));
  const databaseDirs = databaseSections.map((section) => path.join(workspaceRoot, "02_roadmaps_plans", "03_database", section));
  const files = [
    [path.join(workspaceRoot, "02_roadmaps_plans", "README.md"), buildSimpleReadme("Roadmaps And Plans", "The roadmap folders are governed by the selected category profile.")],
    [path.join(workspaceRoot, "02_roadmaps_plans", "01_uiux", "README.md"), buildSimpleReadme("UI/UX Roadmap", "UI/UX roadmap sections live here.")],
    [path.join(workspaceRoot, "02_roadmaps_plans", "02_system_design", "README.md"), buildSimpleReadme("System Design Roadmap", "System design roadmap sections live here.")],
    [path.join(workspaceRoot, "02_roadmaps_plans", "03_database", "README.md"), buildSimpleReadme("Database Roadmap", "Database / storage roadmap sections live here.")],
    [path.join(workspaceRoot, "02_roadmaps_plans", "roadmap_order.md"), [
      "# Roadmap Order",
      "",
      "1. UI/UX",
      "2. System Design",
      "3. Database / Storage",
      ""
    ].join("\n")],
    [path.join(workspaceRoot, "02_roadmaps_plans", "roadmap_status.json"), JSON.stringify({
      app_slug: appSlug,
      app_name: appName,
      selected_category: profile.category_id,
      platform_type: profile.platform_type,
      profile_version: profile.profile_version,
      required_sections: {
        uiux: uiuxSections,
        system_design: systemSections,
        database: databaseSections
      },
      optional_sections: profile.optional_docs || [],
      source_plugin: SOURCE_PLUGIN
    }, null, 2) + "\n"],
    [path.join(workspaceRoot, "02_roadmaps_plans", "01_uiux", "generated_uiux_structure.json"), JSON.stringify(buildGeneratedStructurePayload(appSlug, appName, profile, "uiux", uiuxSections), null, 2) + "\n"],
    [path.join(workspaceRoot, "02_roadmaps_plans", "02_system_design", "generated_system_structure.json"), JSON.stringify(buildGeneratedStructurePayload(appSlug, appName, profile, "system_design", systemSections), null, 2) + "\n"],
    [path.join(workspaceRoot, "02_roadmaps_plans", "03_database", "generated_database_structure.json"), JSON.stringify(buildGeneratedStructurePayload(appSlug, appName, profile, "database", databaseSections), null, 2) + "\n"]
  ];
  return [
    ...uiuxDirs,
    ...systemDirs,
    ...databaseDirs,
    ...files,
    ...uiuxSections.map((section) => [path.join(workspaceRoot, "02_roadmaps_plans", "01_uiux", section, "README.md"), buildSimpleReadme(section, `UI/UX roadmap section for ${profile.title}.`)]),
    ...systemSections.map((section) => [path.join(workspaceRoot, "02_roadmaps_plans", "02_system_design", section, "README.md"), buildSimpleReadme(section, `System design roadmap section for ${profile.title}.`)]),
    ...databaseSections.map((section) => [path.join(workspaceRoot, "02_roadmaps_plans", "03_database", section, "README.md"), buildSimpleReadme(section, `Database / storage roadmap section for ${profile.title}.`)])
  ];
}

function buildGeneratedStructurePayload(appSlug, appName, profile, sectionKind, sections) {
  return {
    app_slug: appSlug,
    app_name: appName,
    selected_category: profile.category_id,
    platform_type: profile.platform_type,
    profile_version: profile.profile_version,
    section_kind: sectionKind,
    created_folders: [...sections],
    required_sections: [...sections],
    optional_sections: profile.optional_docs || [],
    source_plugin: SOURCE_PLUGIN
  };
}

function buildSpecFiles(workspaceRoot, appName, appSlug) {
  const base = path.join(workspaceRoot, "03_full_specifications");
  return [
    [path.join(base, "README.md"), buildSimpleReadme("Full Specifications", "This folder contains the handoff-grade app specification set.")],
    ...APP_SPEC_FILES.map((relative) => [path.join(workspaceRoot, relative), buildDocTemplate(path.basename(relative, ".md").replace(/-/g, " "), appName, appSlug)])
  ];
}

function buildVersionControlFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "04_version_control", "README.md"), buildSimpleReadme("Version Control", "Git and version-control governance live here.")],
    [path.join(workspaceRoot, "04_version_control", "version_control_strategy.md"), buildDocTemplate("Version Control Strategy", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "git_strategy.md"), buildDocTemplate("Git Strategy", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "github_integration.md"), buildDocTemplate("GitHub Integration", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "branches", "branch_plan.md"), buildDocTemplate("Branch Plan", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "commits", "commit_rules.md"), buildDocTemplate("Commit Rules", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "issues", "github_issues_map.md"), buildDocTemplate("GitHub Issues Map", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "issues", "issue_templates.md"), buildDocTemplate("Issue Templates", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "pull_requests", "pr_rules.md"), buildDocTemplate("Pull Request Rules", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "pull_requests", "pr_review_checklist.md"), buildDocTemplate("Pull Request Review Checklist", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "releases", "versioning_strategy.md"), buildDocTemplate("Versioning Strategy", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "releases", "release_tags.md"), buildDocTemplate("Release Tags", appName, appSlug)],
    [path.join(workspaceRoot, "04_version_control", "releases", "changelog.md"), buildDocTemplate("Changelog", appName, appSlug)],
  ];
}

function buildEvolutionFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "05_evolutions", "README.md"), buildSimpleReadme("Evolutions", "Large feature changes are grouped here.")],
    [path.join(workspaceRoot, "05_evolutions", "evolution_index.md"), buildDocTemplate("Evolution Index", appName, appSlug)],
    [path.join(workspaceRoot, "05_evolutions", "evolution_status.json"), JSON.stringify({ app_slug: appSlug, app_name: appName, status: "draft", source_plugin: SOURCE_PLUGIN }, null, 2) + "\n"],
    [path.join(workspaceRoot, "05_evolutions", "active", "README.md"), buildSimpleReadme("Active Evolutions", "Active evolutions live here.")],
    [path.join(workspaceRoot, "05_evolutions", "completed", "README.md"), buildSimpleReadme("Completed Evolutions", "Completed evolutions live here.")],
    [path.join(workspaceRoot, "05_evolutions", "blocked", "README.md"), buildSimpleReadme("Blocked Evolutions", "Blocked evolutions live here.")],
    [path.join(workspaceRoot, "05_evolutions", "archived", "README.md"), buildSimpleReadme("Archived Evolutions", "Archived evolutions live here.")]
  ];
}

function buildTaskPunchFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "06_task_punches", "README.md"), buildSimpleReadme("Task Punches", "Small governed tasks live here.")],
    [path.join(workspaceRoot, "06_task_punches", "punch_backlog.yaml"), `app_slug: ${appSlug}\napp_name: ${jsonSafeScalar(appName)}\nsource_plugin: ${SOURCE_PLUGIN}\n`],
    [path.join(workspaceRoot, "06_task_punches", "punch_index.md"), buildDocTemplate("Punch Index", appName, appSlug)],
    [path.join(workspaceRoot, "06_task_punches", "ready", "README.md"), buildSimpleReadme("Ready Punches", "Ready task punches live here.")],
    [path.join(workspaceRoot, "06_task_punches", "active", "README.md"), buildSimpleReadme("Active Punches", "Active task punches live here.")],
    [path.join(workspaceRoot, "06_task_punches", "blocked", "README.md"), buildSimpleReadme("Blocked Punches", "Blocked task punches live here.")],
    [path.join(workspaceRoot, "06_task_punches", "completed", "README.md"), buildSimpleReadme("Completed Punches", "Completed task punches live here.")],
    [path.join(workspaceRoot, "06_task_punches", "reports", "README.md"), buildSimpleReadme("Punch Reports", "Punch reports live here.")]
  ];
}

function buildAgentFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "07_agents", "README.md"), buildSimpleReadme("Agents", "Agent policies and run contracts live here.")],
    [path.join(workspaceRoot, "07_agents", "agent_assignments.yaml"), `app_slug: ${appSlug}\napp_name: ${jsonSafeScalar(appName)}\n`],
    [path.join(workspaceRoot, "07_agents", "agent_policy.md"), buildDocTemplate("Agent Policy", appName, appSlug)],
    [path.join(workspaceRoot, "07_agents", "run_contracts", "README.md"), buildSimpleReadme("Run Contracts", "Run contracts live here.")],
    [path.join(workspaceRoot, "07_agents", "prompts", "README.md"), buildSimpleReadme("Agent Prompts", "Prompt templates live here.")],
    [path.join(workspaceRoot, "07_agents", "outputs", "README.md"), buildSimpleReadme("Agent Outputs", "Agent outputs live here.")],
    [path.join(workspaceRoot, "07_agents", "logs", "README.md"), buildSimpleReadme("Agent Logs", "Agent logs live here.")]
  ];
}

function buildSourceFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "08_source", "README.md"), buildSimpleReadme("Source Tracking", "Source tracking only; no default source layout is materialized here.")],
    [path.join(workspaceRoot, "08_source", "source_manifest.json"), JSON.stringify({
      source_layout_mode: "stack_adaptive",
      selected_stack: null,
      framework: null,
      structure_created_by: "app_folder_structure",
      source_root: "08_source",
      source_plugin: SOURCE_PLUGIN,
      actual_source_root: "../04_plugin_package/",
      notes: "The source folder layout is created by the selected stack/framework blueprint, not by app_folder_structure."
    }, null, 2) + "\n"]
  ];
}

function buildTestFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "09_tests_quality", "README.md"), buildSimpleReadme("Tests And Quality", "Tests and quality gates live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "test_plan.md"), buildDocTemplate("Test Plan", appName, appSlug)],
    [path.join(workspaceRoot, "09_tests_quality", "quality_plan.md"), buildDocTemplate("Quality Plan", appName, appSlug)],
    [path.join(workspaceRoot, "09_tests_quality", "unit", "README.md"), buildSimpleReadme("Unit Tests", "Unit tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "integration", "README.md"), buildSimpleReadme("Integration Tests", "Integration tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "e2e", "README.md"), buildSimpleReadme("End To End Tests", "E2E tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "security", "README.md"), buildSimpleReadme("Security Tests", "Security tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "performance", "README.md"), buildSimpleReadme("Performance Tests", "Performance tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "accessibility", "README.md"), buildSimpleReadme("Accessibility Tests", "Accessibility tests live here.")],
    [path.join(workspaceRoot, "09_tests_quality", "test_reports", "README.md"), buildSimpleReadme("Test Reports", "Test reports live here.")]
  ];
}

function buildEvidenceFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "10_evidence_audit", "README.md"), buildSimpleReadme("Evidence And Audit", "Evidence, audit, and structure records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "evidence_index.md"), buildDocTemplate("Evidence Index", appName, appSlug)],
    [path.join(workspaceRoot, "10_evidence_audit", "structure_evidence", "README.md"), buildSimpleReadme("Structure Evidence", "Structure evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "roadmap_evidence", "README.md"), buildSimpleReadme("Roadmap Evidence", "Roadmap evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "specification_evidence", "README.md"), buildSimpleReadme("Specification Evidence", "Specification evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "version_control_evidence", "README.md"), buildSimpleReadme("Version Control Evidence", "Version-control evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "evolution_evidence", "README.md"), buildSimpleReadme("Evolution Evidence", "Evolution evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "task_punch_evidence", "README.md"), buildSimpleReadme("Task Punch Evidence", "Task punch evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "agent_evidence", "README.md"), buildSimpleReadme("Agent Evidence", "Agent evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "patch_evidence", "README.md"), buildSimpleReadme("Patch Evidence", "Patch evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "test_evidence", "README.md"), buildSimpleReadme("Test Evidence", "Test evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "approval_evidence", "README.md"), buildSimpleReadme("Approval Evidence", "Approval evidence records live here.")],
    [path.join(workspaceRoot, "10_evidence_audit", "release_evidence", "README.md"), buildSimpleReadme("Release Evidence", "Release evidence records live here.")]
  ];
}

function buildReviewFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "11_reviews_approvals", "README.md"), buildSimpleReadme("Reviews And Approvals", "Reviews and approvals live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "review_index.md"), buildDocTemplate("Review Index", appName, appSlug)],
    [path.join(workspaceRoot, "11_reviews_approvals", "owner_reviews", "README.md"), buildSimpleReadme("Owner Reviews", "Owner reviews live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "viber_reviews", "README.md"), buildSimpleReadme("Viber Reviews", "Viber reviews live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "technical_reviews", "README.md"), buildSimpleReadme("Technical Reviews", "Technical reviews live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "security_reviews", "README.md"), buildSimpleReadme("Security Reviews", "Security reviews live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "qa_reviews", "README.md"), buildSimpleReadme("QA Reviews", "QA reviews live here.")],
    [path.join(workspaceRoot, "11_reviews_approvals", "approvals", "README.md"), buildSimpleReadme("Approvals", "Approval records live here.")]
  ];
}

function buildReleaseFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "12_releases_deployment", "README.md"), buildSimpleReadme("Releases And Deployment", "Release and deployment artifacts live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "release_index.md"), buildDocTemplate("Release Index", appName, appSlug)],
    [path.join(workspaceRoot, "12_releases_deployment", "readiness_reports", "README.md"), buildSimpleReadme("Readiness Reports", "Readiness reports live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "release_notes", "README.md"), buildSimpleReadme("Release Notes", "Release notes live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "deployment_reports", "README.md"), buildSimpleReadme("Deployment Reports", "Deployment reports live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "rollback_plans", "README.md"), buildSimpleReadme("Rollback Plans", "Rollback plans live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "environment_reports", "README.md"), buildSimpleReadme("Environment Reports", "Environment reports live here.")],
    [path.join(workspaceRoot, "12_releases_deployment", "changelogs", "README.md"), buildSimpleReadme("Changelogs", "Changelog files live here.")]
  ];
}

function buildPortalFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "13_owner_portal", "README.md"), buildSimpleReadme("Owner Portal", "Owner-facing summaries live here.")],
    [path.join(workspaceRoot, "13_owner_portal", "owner_summary.md"), buildDocTemplate("Owner Summary", appName, appSlug)],
    [path.join(workspaceRoot, "13_owner_portal", "progress_report.md"), buildDocTemplate("Progress Report", appName, appSlug)],
    [path.join(workspaceRoot, "13_owner_portal", "approval_requests.md"), buildDocTemplate("Approval Requests", appName, appSlug)],
    [path.join(workspaceRoot, "13_owner_portal", "risks_report.md"), buildDocTemplate("Risks Report", appName, appSlug)],
    [path.join(workspaceRoot, "13_owner_portal", "readiness_summary.md"), buildDocTemplate("Readiness Summary", appName, appSlug)],
    [path.join(workspaceRoot, "13_owner_portal", "delivery_report.md"), buildDocTemplate("Delivery Report", appName, appSlug)]
  ];
}

function buildArchiveFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "99_archive", "README.md"), buildSimpleReadme("Archive", "Deprecated, rejected, and old versions live here.")],
    [path.join(workspaceRoot, "99_archive", "compact_structure_mapping.md"), buildCompactStructureMapping()],
    [path.join(workspaceRoot, "99_archive", "archive_manifest.json"), JSON.stringify({
      app_slug: appSlug,
      app_name: appName,
      archive_status: "empty",
      source_plugin: SOURCE_PLUGIN
    }, null, 2) + "\n"],
    [path.join(workspaceRoot, "99_archive", "deprecated_docs", "README.md"), buildSimpleReadme("Deprecated Docs", "Deprecated docs live here.")],
    [path.join(workspaceRoot, "99_archive", "rejected_outputs", "README.md"), buildSimpleReadme("Rejected Outputs", "Rejected outputs live here.")],
    [path.join(workspaceRoot, "99_archive", "old_versions", "README.md"), buildSimpleReadme("Old Versions", "Old versions live here.")]
  ];
}

function buildCompactStructureMapping() {
  return [
    "# Compact Structure Mapping",
    "",
    "- `00_inputs/` -> `00_viber_inputs/`",
    "- `01_spec/` -> `01_category/`, `02_roadmaps_plans/`, `03_full_specifications/`",
    "- `02_tasks/` -> `05_evolutions/`, `06_task_punches/`",
    "- `04_evidence/` -> `09_tests_quality/`, `10_evidence_audit/`",
    "- `05_release/` -> `11_reviews_approvals/`, `12_releases_deployment/`",
    ""
  ].join("\n");
}

function buildDocTemplate(title, appName, appSlug) {
  return [
    `# ${title}`,
    "",
    `- App: ${appName}`,
    `- App slug: ${appSlug}`,
    `- Source plugin: ${SOURCE_PLUGIN}`,
    "",
    "## Notes",
    "- Fill this document with project-specific content.",
    "- Keep the final handoff version here.",
    ""
  ].join("\n");
}

function buildInputFiles(workspaceRoot, appName, appSlug) {
  return [
    [path.join(workspaceRoot, "00_viber_inputs", "README.md"), buildSimpleReadme("Viber Inputs", "All source inputs from Viber live here.")],
    [path.join(workspaceRoot, "00_viber_inputs", "app_brief.md"), buildDocTemplate("App Brief", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "viber_notes.md"), buildDocTemplate("Viber Notes", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "snapshots", "README.md"), buildSimpleReadme("Snapshots", "Uploaded screenshots and images live here.")],
    [path.join(workspaceRoot, "00_viber_inputs", "external_files", "README.md"), buildSimpleReadme("External Files", "Uploaded files live here.")],
    [path.join(workspaceRoot, "00_viber_inputs", "links", "links.md"), buildDocTemplate("Links", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "questions_answers", "questions_answers.md"), buildDocTemplate("Questions And Answers", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "questions_answers", "unanswered_questions.md"), buildDocTemplate("Unanswered Questions", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "questions_answers", "answered_questions.md"), buildDocTemplate("Answered Questions", appName, appSlug)],
    [path.join(workspaceRoot, "00_viber_inputs", "references", "README.md"), buildSimpleReadme("References", "Reference material lives here.")]
  ];
}

function buildFolderReadmes(workspaceRoot) {
  return APP_TOP_LEVEL_DIRS.map((folder) => [path.join(workspaceRoot, folder, "README.md"), buildSimpleReadme(path.basename(folder), TOP_LEVEL_READMES[folder] || "")]);
}

function normalizeWorkspaceSlug(value) {
  return slugify(value);
}

function jsonSafeScalar(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

module.exports = {
  APP_SOURCE_FILES,
  CATEGORY_LAYOUT_TARGETS,
  buildAppFolderManifest,
  buildAppFolderManifestJson,
  buildAppKvdosYaml,
  buildAppWorkspacePlan,
  buildAppStateJson,
  buildCategoryFiles,
  buildDocTemplate,
  buildFolderReadmes,
  buildGeneratedStructurePayload,
  buildSimpleReadme,
  buildStandardPackagePlan,
  buildWorkspacePlan,
  comparePackageStructure,
  normalizeWorkspaceSlug
};


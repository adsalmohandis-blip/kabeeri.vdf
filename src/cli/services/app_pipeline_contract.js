const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");

const PIPELINE_STAGE_ORDER = ["app_category_registry", "domain_plugin", "app_folder_structure"];

const DOMAIN_PLUGIN_MAP = {
  booking_scheduling_system: "booking_builder",
  crm_admin_system: "crm_builder",
  ecommerce_platform: "ecommerce_builder"
};

const WORKSPACE_CATEGORY_MAP = {
  api_only_backend: "generic",
  booking_scheduling_system: "web_app",
  crm_admin_system: "web_app",
  desktop_application: "desktop",
  ecommerce_platform: "web_app",
  marketplace_platform: "web_app",
  mobile_application: "mobile_app",
  saas_platform: "web_app",
  web_application: "web_app",
  data_analytics_dashboard: "web_app"
};

function normalizeWorkspaceCategoryAlias(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  if (!normalized) return "";
  if (normalized === "web_application") return "web_app";
  if (normalized === "mobile_application") return "mobile_app";
  if (normalized === "desktop_application") return "desktop";
  return WORKSPACE_CATEGORY_MAP[normalized] || normalized;
}

function resolvePipelineContractPath(root = process.cwd()) {
  return path.join(root, ".kabeeri", "app_pipeline_contract.json");
}

function resolveDomainPlugin(profile = {}, selection = {}) {
  const explicit = String(selection.domain_plugin || selection.target_plugin || selection.plugin || "").trim();
  if (explicit) {
    return {
      plugin_id: explicit,
      required: true,
      source: "explicit",
      mapped_from: null
    };
  }
  const selectedIds = Array.isArray(profile.selected_category_ids) ? profile.selected_category_ids.map((value) => String(value || "").trim()) : [];
  for (const categoryId of selectedIds) {
    if (DOMAIN_PLUGIN_MAP[categoryId]) {
      return {
        plugin_id: DOMAIN_PLUGIN_MAP[categoryId],
        required: true,
        source: "category_map",
        mapped_from: categoryId
      };
    }
  }
  return {
    plugin_id: null,
    required: false,
    source: "none",
    mapped_from: null
  };
}

function resolveWorkspaceCategory(profile = {}, selection = {}) {
  const explicit = String(selection.workspace_category || selection.app_workspace_category || "").trim();
  if (explicit) return explicit;
  const selectedIds = Array.isArray(profile.selected_category_ids) ? profile.selected_category_ids.map((value) => String(value || "").trim()) : [];
  for (const categoryId of selectedIds) {
    if (WORKSPACE_CATEGORY_MAP[categoryId]) return WORKSPACE_CATEGORY_MAP[categoryId];
  }
  return "generic";
}

function buildAppPipelineContract({ selection = {}, profile = {}, compatibility = null, source = null, questionnaire = null, spec = null, roadmap = null, workspace = null, evidence = null } = {}) {
  const appId = String(profile.app_id || selection.app_id || selection.app_slug || "").trim();
  const appName = String(profile.app_name || selection.app_name || "").trim();
  const selectedDomainPlugin = resolveDomainPlugin(profile, selection);
  const appSlug = appId || appName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  const now = new Date().toISOString();
  const stageOrder = [...PIPELINE_STAGE_ORDER];
  const workspaceCategory = resolveWorkspaceCategory(profile, selection);
  return {
    contract_id: "app_pipeline_contract",
    contract_type: "app_pipeline_contract",
    version: 1,
    status: "pending_handoff",
    strict: true,
    generated_at: now,
    updated_at: now,
    app: {
      app_id: appId || null,
      app_name: appName || null,
      app_slug: appSlug || null,
      selected_category_ids: Array.isArray(profile.selected_category_ids) ? profile.selected_category_ids : [],
      selected_category_versions: Array.isArray(profile.selected_category_versions) ? profile.selected_category_versions : [],
      selected_groups: Array.isArray(profile.selected_groups) ? profile.selected_groups : [],
      delivery_category: profile.delivery_category || null,
      domain_category: profile.domain_category || null,
      architecture_pattern: profile.architecture_pattern || null,
      governance_profile: profile.governance_profile || null,
      industry_category: profile.industry_category || null
    },
    selected_domain_plugin: selectedDomainPlugin.plugin_id,
    workspace_category: workspaceCategory,
    domain_plugin: selectedDomainPlugin,
    handoff: {
      from: "app_category_registry",
      through: selectedDomainPlugin.plugin_id || "none",
      to: "app_folder_structure",
      strict: true
    },
    stage_order: stageOrder,
    stages: [
      {
        id: "app_category_registry",
        status: "complete",
        required: true,
        outputs: [
          ".kabeeri/app_category_profile.yaml",
          ".kabeeri/source_inventory.yaml",
          ".kabeeri/source_map.yaml",
          ".kabeeri/questionnaire_profile.yaml",
          ".kabeeri/spec_profile.yaml",
          ".kabeeri/micro_doc_contract.yaml",
          ".kabeeri/roadmap_profile.yaml",
          ".kabeeri/roadmap_order.yaml",
          ".kabeeri/workspace_plan.yaml",
          ".kabeeri/category_evidence.json"
        ],
        next_action: "Run kvdf app-folder create --app <app-slug> --category <category>."
      },
      {
        id: "domain_plugin",
        status: selectedDomainPlugin.plugin_id ? "pending" : "not_required",
        required: selectedDomainPlugin.required,
        plugin_id: selectedDomainPlugin.plugin_id,
        source: selectedDomainPlugin.source,
        mapped_from: selectedDomainPlugin.mapped_from,
        next_action: selectedDomainPlugin.plugin_id
          ? `Load and validate the ${selectedDomainPlugin.plugin_id} plugin before workspace materialization.`
          : "No domain plugin is required for this category profile."
      },
      {
        id: "app_folder_structure",
        status: "pending",
        required: true,
        inputs: [
          ".kabeeri/app_pipeline_contract.json",
          ".kabeeri/app_category_profile.yaml",
          ".kabeeri/workspace_plan.yaml"
        ],
        outputs: [
          "workspaces/apps/<app-slug>/",
          "workspaces/apps/<app-slug>/.kabeeri/app_pipeline_contract.json",
          "workspaces/apps/<app-slug>/app.kvdos.yaml"
        ],
        next_action: "Run kvdf app-folder create --app <app-slug> --category <category>."
      }
    ],
    contract_inputs: {
      selection,
      compatibility,
      source,
      questionnaire,
      spec,
      roadmap,
      workspace,
      evidence
    },
    source_of_truth: "app_category_registry",
    pipeline_status: "waiting_for_app_folder_structure"
  };
}

function validateAppPipelineContract(contract, expectations = {}) {
  const issues = [];
  const warnings = [];
  if (!contract || typeof contract !== "object") {
    issues.push("App pipeline contract is missing.");
    return { ok: false, issues, warnings, status: "blocked" };
  }

  const app = contract.app || {};
  const appSlug = String(app.app_slug || "").trim();
  const workspaceCategory = String(contract.workspace_category || "").trim();
  const appCategory = normalizeWorkspaceCategoryAlias(expectations.category || expectations.selected_category || "");
  const expectedAppSlug = String(expectations.app_slug || expectations.app || "").trim();
  const expectedContractPath = expectations.contract_path ? path.resolve(expectations.contract_path) : null;

  if (!contract.strict) issues.push("Contract must be strict.");
  if (!workspaceCategory) issues.push("Workspace category is missing from the pipeline contract.");
  if (!Array.isArray(contract.stage_order) || contract.stage_order.join("|") !== PIPELINE_STAGE_ORDER.join("|")) {
    issues.push("Pipeline stage order must be app_category_registry -> domain_plugin -> app_folder_structure.");
  }
  if (!contract.handoff || contract.handoff.from !== "app_category_registry" || contract.handoff.to !== "app_folder_structure") {
    issues.push("Pipeline handoff must be from app_category_registry to app_folder_structure.");
  }
  if (!appSlug) issues.push("App slug is missing from the pipeline contract.");
  if (expectedAppSlug && appSlug && expectedAppSlug !== appSlug) issues.push(`App slug mismatch: expected ${expectedAppSlug}, got ${appSlug}.`);
  if (appCategory && normalizeWorkspaceCategoryAlias(workspaceCategory) !== appCategory) {
    issues.push(`Category mismatch: expected ${appCategory}, but the pipeline contract workspace category is ${workspaceCategory || "none"}.`);
  }
  if (expectedContractPath && !fs.existsSync(expectedContractPath)) {
    issues.push(`Pipeline contract file missing at ${path.relative(repoRoot(), expectedContractPath).replace(/\\/g, "/")}.`);
  }
  if (!contract.stages || !Array.isArray(contract.stages)) issues.push("Pipeline stages are missing.");
  else {
    const ids = contract.stages.map((stage) => stage && stage.id).filter(Boolean);
    for (const expectedId of PIPELINE_STAGE_ORDER) {
      if (!ids.includes(expectedId)) issues.push(`Missing pipeline stage: ${expectedId}.`);
    }
    const appCategoryStage = contract.stages.find((stage) => stage && stage.id === "app_category_registry");
    const appFolderStage = contract.stages.find((stage) => stage && stage.id === "app_folder_structure");
    if (!appCategoryStage || appCategoryStage.status !== "complete") issues.push("app_category_registry stage must be complete before app_folder_structure can proceed.");
    if (!appFolderStage || !["pending", "complete"].includes(appFolderStage.status)) issues.push("app_folder_structure stage is missing or invalid.");
    if (appFolderStage && appFolderStage.required !== true) issues.push("app_folder_structure stage must be required.");
    const domainStage = contract.stages.find((stage) => stage && stage.id === "domain_plugin");
    if (domainStage && domainStage.required && !String(domainStage.plugin_id || "").trim()) issues.push("Domain plugin stage must declare a plugin id when required.");
    if (domainStage && domainStage.required && String(domainStage.plugin_id || "").trim()) {
      const pluginId = String(domainStage.plugin_id).trim();
      const installedBundle = path.join(repoRoot(), "plugins", pluginId, "plugin.json");
      const installedWorkspace = path.join(repoRoot(), "workspaces", "plugins", pluginId, "plugin_workspace_manifest.json");
      if (!fs.existsSync(installedBundle) && !fs.existsSync(installedWorkspace)) {
        issues.push(`Required domain plugin ${pluginId} is missing. Install or promote it before proceeding.`);
      }
    }
  }

  const ok = issues.length === 0;
  return {
    ok,
    status: ok ? "ready" : "blocked",
    contract_id: contract.contract_id || null,
    app_slug: appSlug || null,
    issues,
    warnings,
    stage_order: contract.stage_order || []
  };
}

function readAppPipelineContract(root = process.cwd()) {
  const filePath = resolvePipelineContractPath(root);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeAppPipelineContract(root = process.cwd(), contract) {
  const filePath = resolvePipelineContractPath(root);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  return filePath;
}

function requireAppPipelineContract(root = process.cwd(), expectations = {}) {
  const contract = readAppPipelineContract(root);
  const validation = validateAppPipelineContract(contract, {
    ...expectations,
    contract_path: resolvePipelineContractPath(root)
  });
  if (!validation.ok) {
    const message = validation.issues.join(" ");
    const error = new Error(message || "App pipeline contract validation failed.");
    error.validation = validation;
    throw error;
  }
  return { contract, validation, contract_path: resolvePipelineContractPath(root) };
}

function finalizeAppPipelineContract(root = process.cwd(), contract, updates = {}) {
  const next = {
    ...contract,
    ...updates,
    updated_at: new Date().toISOString(),
    pipeline_status: updates.pipeline_status || "app_folder_structure_ready",
    stages: Array.isArray(contract.stages)
      ? contract.stages.map((stage) => {
          if (stage.id === "app_folder_structure") {
            return { ...stage, status: "complete", completed_at: new Date().toISOString() };
          }
          return stage;
        })
      : contract.stages
  };
  writeAppPipelineContract(root, next);
  return next;
}

module.exports = {
  PIPELINE_STAGE_ORDER,
  buildAppPipelineContract,
  finalizeAppPipelineContract,
  readAppPipelineContract,
  requireAppPipelineContract,
  resolveDomainPlugin,
  resolvePipelineContractPath,
  resolveWorkspaceCategory,
  normalizeWorkspaceCategoryAlias,
  validateAppPipelineContract,
  writeAppPipelineContract
};

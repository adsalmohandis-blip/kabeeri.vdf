const fs = require("fs");
const path = require("path");
const { buildAppWorkspacePlan, comparePackageStructure } = require("../core/standard_plugin_structure");
const { appFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing, writeFileIfEmpty, isNonEmptyFile } = require("../utils/fs_safe");
const { buildValidationReport, validateWorkspaceFiles } = require("./validation_service");
const { writeStructureEvidence } = require("./evidence_service");
const { ensureManifestFiles, readAppFolderManifest } = require("./manifest_service");
const {
  finalizeAppPipelineContract,
  readAppPipelineContract,
  resolvePipelineContractPath,
  normalizeWorkspaceCategoryAlias,
  validateAppPipelineContract,
  writeAppPipelineContract
} = require("../../../../src/cli/services/app_pipeline_contract");

function resolveWorkspaceRoot(slug, repoRootPath = process.cwd()) {
  const normalized = normalizeWorkspaceSlug(slug);
  if (!normalized) throw appFolderError("Missing app slug.");
  return path.resolve(repoRootPath, "workspaces", "apps", normalized);
}

function resolvePipelineContract(deps = {}, repoRootPath = process.cwd(), flags = {}) {
  const contract = deps.pipelineContract || readAppPipelineContract(repoRootPath);
  if (!contract) return null;
  const contractPathExists = !deps.pipelineContract;
  const expectedSlug = normalizeWorkspaceSlug(flags.app || flags.slug || flags.workspace || "");
  const expectedCategory = normalizeWorkspaceCategoryAlias(flags.category || flags.platform || flags.type || "");
  const validation = validateAppPipelineContract(contract, {
    app_slug: expectedSlug || contract.app && contract.app.app_slug || "",
    category: expectedCategory || contract.app && (contract.app.selected_category_ids && contract.app.selected_category_ids[0] || contract.app.domain_category || contract.app.category) || "",
    contract_path: contractPathExists ? resolvePipelineContractPath(repoRootPath) : null
  });
  if (!validation.ok) {
    const error = appFolderError(`App pipeline contract validation failed: ${validation.issues.join(" ")}`);
    error.validation = validation;
    throw error;
  }
  return contract;
}

function resolveWorkspaceTarget(context = {}, deps = {}) {
  const flags = context.flags || {};
  const repoRootPath = path.resolve(deps.repoRootPath || process.cwd());
  const pipelineContract = resolvePipelineContract(deps, repoRootPath, flags);
  const slug = normalizeWorkspaceSlug(
    pipelineContract && pipelineContract.app && pipelineContract.app.app_slug
      ? pipelineContract.app.app_slug
      : flags.app || flags.slug || flags.workspace || context.value || context.rest?.[0] || ""
  );
  const category = normalizeWorkspaceCategoryAlias(
    pipelineContract && pipelineContract.app
      ? pipelineContract.workspace_category || pipelineContract.app.selected_category_ids && pipelineContract.app.selected_category_ids[0] || pipelineContract.app.domain_category || pipelineContract.app.category || flags.category || flags.platform || flags.type || "generic"
      : flags.category || flags.platform || flags.type || "generic"
  );
  if (!slug) throw appFolderError("Missing app slug.");
  if (!pipelineContract) {
    throw appFolderError("Missing app pipeline contract. Run `kvdf app-category create <category>` before `kvdf app-folder create`.");
  }
  return {
    app_slug: slug,
    category,
    workspace_root: resolveWorkspaceRoot(slug, repoRootPath),
    repo_root: repoRootPath,
    pipeline_contract: pipelineContract,
    pipeline_contract_path: resolvePipelineContractPath(repoRootPath)
  };
}

function createTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const repoRootPath = target.repo_root;
  const pipelineContract = target.pipeline_contract;
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath,
    appName: pipelineContract.app && pipelineContract.app.app_name ? pipelineContract.app.app_name : context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const existedBefore = fs.existsSync(plan.root);
  const created = materializePlan(plan);
  const manifestResult = ensureManifestFiles(plan, { force: false });
  const finalizedContract = finalizeAppPipelineContract(repoRootPath, pipelineContract, {
    status: "app_folder_structure_complete",
    workspace_root: plan.root,
    pipeline_status: "handoff_ready"
  });
  writeAppPipelineContract(plan.root, finalizedContract);
  const validation = validateTargetStructure(context, { ...deps, _precomputedPlan: plan, _skipEvidence: true, pipelineContract: finalizedContract });
  const report = buildValidationReport(plan.root, validation, {
    app_slug: plan.slug,
    category: plan.category,
    created,
    manifestResult,
    pipeline_contract_path: target.pipeline_contract_path
  });
  writeStructureEvidence(plan.root, "create", report);
  return {
    report_type: "app_folder_structure_create",
    status: existedBefore ? "updated" : "created",
    message: existedBefore
      ? `Updated app workspace ${plan.slug} at ./workspaces/apps/${plan.slug}/`
      : `Created app workspace ${plan.slug} at ./workspaces/apps/${plan.slug}/`,
    app_slug: plan.slug,
    category: plan.category,
    workspace_root: plan.root,
    created_files: created.files,
    created_directories: created.directories,
    manifest: manifestResult.manifest,
    pipeline_contract: finalizedContract,
    validation
  };
}

function validateTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const repoRootPath = target.repo_root;
  const pipelineContract = deps.pipelineContract || target.pipeline_contract || readAppPipelineContract(repoRootPath);
  const plan = deps._precomputedPlan || buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath,
    appName: pipelineContract && pipelineContract.app && pipelineContract.app.app_name ? pipelineContract.app.app_name : context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const validation = validateWorkspaceFiles(plan.root, plan.category_profile);
  if (!pipelineContract) {
    return {
      ...validation,
      ok: false,
      status: "blocked",
      blockers: [...(validation.blockers || []), "Missing app pipeline contract."]
    };
  }
  const pipelineValidation = validateAppPipelineContract(pipelineContract, {
    app_slug: plan.slug,
    category: target.category,
    contract_path: resolvePipelineContractPath(repoRootPath)
  });
  return {
    ...validation,
    pipeline_contract: pipelineContract,
    pipeline_contract_validation: pipelineValidation,
    ok: Boolean(validation.ok && pipelineValidation.ok),
    status: validation.ok && pipelineValidation.ok ? "compliant" : "needs_attention",
    blockers: [
      ...(validation.blockers || []),
      ...(pipelineValidation.ok ? [] : pipelineValidation.issues)
    ]
  };
}

function repairTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const pipelineContract = deps.pipelineContract || target.pipeline_contract || readAppPipelineContract(target.repo_root);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: pipelineContract && pipelineContract.app && pipelineContract.app.app_name ? pipelineContract.app.app_name : context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const repaired = materializePlan(plan, { preserveExisting: true });
  const manifestResult = ensureManifestFiles(plan, { force: false });
  const finalizedContract = pipelineContract ? finalizeAppPipelineContract(target.repo_root, pipelineContract, {
    status: "app_folder_structure_complete",
    workspace_root: plan.root,
    pipeline_status: "handoff_ready"
  }) : null;
  if (finalizedContract) writeAppPipelineContract(plan.root, finalizedContract);
  const validation = validateWorkspaceFiles(plan.root, plan.category_profile);
  const report = buildValidationReport(plan.root, validation, {
    app_slug: plan.slug,
    category: plan.category,
    repaired,
    manifestResult,
    pipeline_contract: finalizedContract
  });
  writeStructureEvidence(plan.root, "repair", report);
  return {
    report_type: "app_folder_structure_repair",
    status: validation.ok ? "repaired" : "needs_attention",
    app_slug: plan.slug,
    category: plan.category,
    workspace_root: plan.root,
    repaired_files: repaired.files,
    repaired_directories: repaired.directories,
    manifest: manifestResult.manifest,
    pipeline_contract: finalizedContract,
    validation
  };
}

function materializePlan(plan, options = {}) {
  const created = { directories: [], files: [] };
  for (const directory of plan.directories || []) {
    if (!fs.existsSync(directory)) {
      ensureDir(directory);
      created.directories.push(directory);
    }
  }
  for (const [filePath, content] of plan.files || []) {
    const exists = fs.existsSync(filePath);
    const nonEmpty = isNonEmptyFile(filePath);
    if (options.preserveExisting && nonEmpty) continue;
    if (!exists || !nonEmpty) {
      const wrote = writeFileIfEmpty(filePath, content);
      if (wrote) created.files.push(filePath);
    }
  }
  return created;
}

function printCategoryProfile(category, deps = {}) {
  const plan = buildAppWorkspacePlan(normalizeWorkspaceSlug("profile"), {
    category,
    repoRootPath: deps.repoRootPath || process.cwd(),
    appName: "Category Profile Preview"
  });
  return {
    report_type: "app_folder_structure_category_profile",
    category: plan.category,
    profile: plan.category_profile,
    roadmap_sections: {
      uiux: plan.category_profile.uiux_sections,
      system_design: plan.category_profile.system_design_sections,
      database: plan.category_profile.database_sections
    }
  };
}

function inspectWorkspace(appSlug, deps = {}) {
  const target = resolveWorkspaceTarget({ flags: { app: appSlug, category: deps.category || "generic" } }, deps);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: deps.appName || appSlug
  });
  const manifest = readAppFolderManifest(plan.root);
  const validation = validateWorkspaceFiles(plan.root, plan.category_profile);
  return {
    plan,
    manifest,
    validation,
    comparison: comparePackageStructure(
      { directories: [], files: [] },
      { directories: [], files: [] }
    )
  };
}

function normalizeWorkspaceSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

module.exports = {
  createTargetStructure,
  inspectWorkspace,
  materializePlan,
  normalizeWorkspaceSlug,
  printCategoryProfile,
  resolveWorkspaceRoot,
  resolveWorkspaceTarget,
  repairTargetStructure,
  validateTargetStructure
};

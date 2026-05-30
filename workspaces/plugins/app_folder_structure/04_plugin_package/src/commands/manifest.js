const { resolveWorkspaceTarget } = require("../services/target_path_service");
const { ensureManifestFiles, readAppFolderManifest } = require("../services/manifest_service");
const { buildAppWorkspacePlan } = require("../core/standard_plugin_structure");

function runManifest(context, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const result = ensureManifestFiles(plan, { force: false });
  const manifest = readAppFolderManifest(plan.root) || result.manifest;
  const output = {
    report_type: "app_folder_structure_manifest",
    workspace_root: plan.root,
    app_slug: plan.slug,
    category: plan.category,
    manifest,
    manifest_files: {
      app_kvdos_yaml: result.yaml_path,
      app_state: result.state_path,
      app_folder_manifest: result.manifest_path
    }
  };
  if (context.flags && context.flags.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
  return output;
}

module.exports = { runManifest };

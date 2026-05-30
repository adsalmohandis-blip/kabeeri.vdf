const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  createTargetStructure,
  normalizeWorkspaceSlug,
  printCategoryProfile,
  resolveWorkspaceRoot,
  resolveWorkspaceTarget,
  repairTargetStructure,
  validateTargetStructure
} = require("../../src/services/target_path_service");
const { buildAppPipelineContract } = require("../../../../src/cli/services/app_pipeline_contract");

function test(label, fn) {
  try {
    fn();
    console.log(`OK ${label}`);
  } catch (error) {
    console.error(`FAIL ${label}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

function withTempRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-app-folder-target-"));
  const previous = process.cwd();
  process.chdir(dir);
  try {
    return fn(dir);
  } finally {
    process.chdir(previous);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function buildPipelineContract() {
  return buildAppPipelineContract({
    selection: {
      app_id: "clinic_basic",
      app_name: "Clinic Basic"
    },
    profile: {
      app_id: "clinic_basic",
      app_name: "Clinic Basic",
      selected_category_ids: ["web_application"],
      selected_category_versions: [{ id: "web_application", version: "1.0.0", schema_version: "1.0.0" }],
      selected_groups: ["delivery"],
      delivery_category: "web_application",
      workspace_category: "web_app"
    }
  });
}

test("workspace slug normalization uses underscores", () => {
  assert.strictEqual(normalizeWorkspaceSlug("Clinic Basic"), "clinic_basic");
  assert.strictEqual(normalizeWorkspaceSlug("clinic-basic"), "clinic_basic");
});

test("workspace target resolves to the canonical app workspace root", () => {
  withTempRepo((dir) => {
    const pipelineContract = buildPipelineContract();
    const target = resolveWorkspaceTarget({ flags: { app: "clinic-basic", category: "web_app" } }, { repoRootPath: dir, pipelineContract });
    assert.strictEqual(target.app_slug, "clinic_basic");
    assert.strictEqual(target.category, "web_app");
    assert.strictEqual(target.workspace_root, path.join(dir, "workspaces", "apps", "clinic_basic"));
    assert.strictEqual(resolveWorkspaceRoot("clinic-basic", dir), path.join(dir, "workspaces", "apps", "clinic_basic"));
  });
});

test("create and repair materialize the fixed app folder pipeline", () => {
  withTempRepo((dir) => {
    const pipelineContract = buildPipelineContract();
    const createReport = createTargetStructure({ flags: { app: "clinic-basic", category: "web_app" } }, { repoRootPath: dir, pipelineContract });
    const workspaceRoot = path.join(dir, "workspaces", "apps", "clinic_basic");
    assert.strictEqual(createReport.status, "created");
    assert.ok(fs.existsSync(path.join(workspaceRoot, "00_viber_inputs")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, "03_full_specifications")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, "08_source", "source_manifest.json")));
    assert.ok(fs.existsSync(path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json")));
    assert.ok(fs.existsSync(path.join(dir, ".kabeeri", "app_pipeline_contract.json")));

    fs.rmSync(path.join(workspaceRoot, "10_evidence_audit", "structure_evidence", "README.md"));
    const repaired = repairTargetStructure({ flags: { app: "clinic-basic", category: "web_app" } }, { repoRootPath: dir, pipelineContract });
    assert.strictEqual(repaired.status === "repaired" || repaired.status === "needs_attention", true);
    assert.ok(fs.existsSync(path.join(workspaceRoot, "10_evidence_audit", "structure_evidence", "README.md")));

    fs.writeFileSync(path.join(workspaceRoot, "13_owner_portal", "owner_summary.md"), "sentinel\n", "utf8");
    repairTargetStructure({ flags: { app: "clinic-basic", category: "web_app" } }, { repoRootPath: dir, pipelineContract });
    assert.strictEqual(fs.readFileSync(path.join(workspaceRoot, "13_owner_portal", "owner_summary.md"), "utf8"), "sentinel\n");

    const validation = validateTargetStructure({ flags: { app: "clinic-basic", category: "web_app" } }, { repoRootPath: dir, pipelineContract });
    assert.strictEqual(validation.ok, true);
  });
});

test("category preview exposes the approved sections", () => {
  const preview = printCategoryProfile("embedded_system");
  assert.strictEqual(preview.category, "embedded_system");
  assert.ok(preview.profile.uiux_sections.includes("device_interaction_flow"));
});

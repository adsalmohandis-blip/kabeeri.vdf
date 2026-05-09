const fs = require("fs");
const path = require("path");

function repoRoot() {
  return process.cwd();
}

function packageRoot() {
  return path.resolve(__dirname, "../..");
}

const assetAliases = {
  acceptance_checklists: "knowledge/acceptance_checklists",
  agile_delivery: "knowledge/agile_delivery",
  ai_cost_control: "knowledge/ai_cost_control",
  codex_context: "docs/codex_context",
  dashboard: "integrations/dashboard",
  delivery_modes: "knowledge/delivery_modes",
  design_sources: "knowledge/design_sources",
  design_system: "knowledge/design_system",
  docs_site: "docs/site",
  examples: "packs/examples",
  frontend_specs: "knowledge/frontend_specs",
  generators: "packs/generators",
  github: "integrations/github",
  github_sync: "integrations/github_sync",
  governance: "knowledge/governance",
  multi_ai_governance: "integrations/multi_ai_governance",
  platform_integration: "integrations/platform_integration",
  project_intake: "knowledge/project_intake",
  project_intelligence: "knowledge/project_intelligence",
  prompt_packs: "packs/prompt_packs",
  questionnaires: "knowledge/questionnaires",
  questionnaire_engine: "knowledge/questionnaire_engine",
  standard_systems: "knowledge/standard_systems",
  task_tracking: "knowledge/task_tracking",
  templates: "packs/templates",
  vibe_ux: "knowledge/vibe_ux",
  vscode_extension: "integrations/vscode_extension"
};

function resolveRepo(relativePath = "") {
  return path.join(repoRoot(), relativePath);
}

function aliasPath(relativePath = "") {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const [first, ...rest] = normalized.split("/");
  if (!assetAliases[first]) return null;
  return [assetAliases[first], ...rest].join("/");
}

function resolveAssetDetail(relativePath = "") {
  const local = resolveRepo(relativePath);
  if (fs.existsSync(local)) return { path: local, displayPrefix: relativePath };
  const packaged = path.join(packageRoot(), relativePath);
  if (fs.existsSync(packaged)) return { path: packaged, displayPrefix: relativePath };
  const alias = aliasPath(relativePath);
  if (alias) {
    const localAlias = resolveRepo(alias);
    if (fs.existsSync(localAlias)) return { path: localAlias, displayPrefix: relativePath };
    const packagedAlias = path.join(packageRoot(), alias);
    if (fs.existsSync(packagedAlias)) return { path: packagedAlias, displayPrefix: relativePath };
  }
  return { path: packaged, displayPrefix: relativePath };
}

function resolveAsset(relativePath = "") {
  return resolveAssetDetail(relativePath).path;
}

function fileExists(relativePath) {
  if (fs.existsSync(resolveRepo(relativePath)) || fs.existsSync(path.join(packageRoot(), relativePath))) return true;
  const alias = aliasPath(relativePath);
  return Boolean(alias && (fs.existsSync(resolveRepo(alias)) || fs.existsSync(path.join(packageRoot(), alias))));
}

function readTextFile(relativePath) {
  return fs.readFileSync(resolveAsset(relativePath), "utf8");
}

function writeTextFile(relativePath, content) {
  const fullPath = resolveRepo(relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

function readJsonFile(relativePath) {
  return JSON.parse(readTextFile(relativePath));
}

function writeJsonFile(relativePath, data) {
  writeTextFile(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function listDirectories(relativePath) {
  const fullPath = resolveAsset(relativePath);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listFiles(relativePath, extension, recursive = false) {
  const detail = resolveAssetDetail(relativePath);
  const root = detail.path;
  if (!fs.existsSync(root)) return [];
  const output = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory() && recursive) {
        walk(fullPath);
      } else if (entry.isFile() && (!extension || entry.name.endsWith(extension))) {
        const relativeToRoot = path.relative(root, fullPath).replace(/\\/g, "/");
        output.push(path.join(detail.displayPrefix, relativeToRoot).replace(/\\/g, "/"));
      }
    }
  }

  walk(root);
  return output.sort();
}

function assertSafeName(value) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
    throw new Error(`Unsafe name: ${value}`);
  }
}

module.exports = {
  repoRoot,
  packageRoot,
  resolveRepo,
  resolveAsset,
  fileExists,
  readTextFile,
  writeTextFile,
  readJsonFile,
  writeJsonFile,
  listDirectories,
  listFiles,
  assertSafeName
};

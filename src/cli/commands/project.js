const fs = require("fs");
const path = require("path");
const { uniqueList } = require("../services/collections");

function project(action, value, flags = {}, rest = [], deps = {}) {
  const ensureWorkspace = deps.ensureWorkspace || (() => {});
  const readJsonFile = deps.readJsonFile;
  const writeJsonFile = deps.writeJsonFile;
  const repoRoot = deps.repoRoot;
  const appendAudit = deps.appendAudit || (() => {});
  const table = deps.table || ((headers, rows) => [headers, ...(rows || [])].map((row) => row.join(" | ")).join("\n"));

  if (!action || ["help", "status", "list", "show"].includes(action)) {
    console.log("Project adoption commands");
    console.log(table(["Command", "Purpose"], [
      ["project analyze --path <folder>", "Inspect an existing application and write .kabeeri/project_analysis.json"],
      ["project profile route --goal <text>", "Route the project profile, delivery mode, and prompt packs into .kabeeri/project_profile.json"],
      ["project profile status", "Show the active project profile routing record"],
      ["adopt analyze --path <folder>", "Alias for project analyze"]
    ]));
    return;
  }

  if (action !== "analyze" && action !== "analyse") {
    throw new Error(`Unknown project action: ${action}`);
  }

  ensureWorkspace();
  const targetInput = flags.path || value || rest[0] || ".";
  const targetPath = path.resolve(repoRoot(), targetInput);
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`Project path not found or not a directory: ${targetInput}`);
  }

  const analysis = analyzeExistingProject(targetPath, flags, repoRoot);
  writeJsonFile(".kabeeri/project_analysis.json", analysis);
  appendAudit("project.analyzed", "project", analysis.analysis_id, `Existing project analyzed: ${analysis.relative_path}`);

  if (flags.json) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  console.log("Existing project analysis written to .kabeeri/project_analysis.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected stacks", analysis.detected_stacks.join(", ") || "unknown"],
    ["Potential apps", analysis.potential_apps.map((item) => `${item.type}:${item.path}`).join(", ") || "none"],
    ["Suggested delivery", analysis.suggested_delivery_mode],
    ["Risk level", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of analysis.next_actions) console.log(`- ${item}`);
}

function analyzeExistingProject(targetPath, flags = {}, repoRoot) {
  const root = repoRoot();
  const rel = path.relative(root, targetPath).replace(/\\/g, "/") || ".";
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const files = new Set(entries.filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(entries.filter((item) => item.isDirectory()).map((item) => item.name));
  const stacks = detectProjectStacks(targetPath, files, dirs);
  const potentialApps = detectPotentialApps(dirs, stacks);
  const riskSignals = [];
  if (!files.has("README.md")) riskSignals.push("missing_readme");
  if (!files.has("package.json") && !files.has("composer.json") && !files.has("pyproject.toml") && !files.has("requirements.txt") && !files.has("pubspec.yaml")) riskSignals.push("unknown_dependency_manifest");
  if (!dirs.has("tests") && !dirs.has("__tests__") && !dirs.has("spec") && !dirs.has("test")) riskSignals.push("missing_visible_tests");
  if (files.has(".env")) riskSignals.push("env_file_present_review_secrets");

  const riskLevel = riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low";
  return {
    analysis_id: `project-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf project analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_stacks: stacks,
    top_level_directories: Array.from(dirs).sort(),
    top_level_files: Array.from(files).sort(),
    potential_apps,
    recommended_workstreams: inferWorkstreamsFromStacks(stacks, potentialApps),
    suggested_delivery_mode: flags.mode || inferDeliveryModeFromStacks(stacks, potentialApps, riskSignals),
    risk_level: riskLevel,
    risk_signals: riskSignals,
    next_actions: [
      "Review detected stacks and app boundaries before changing code.",
      "Create app records with `kvdf app create` for each real app boundary.",
      "Create or update workstreams with `kvdf workstream add` if defaults are not enough.",
      "Run `kvdf blueprint recommend \"describe the existing product\"` to map product capabilities.",
      "Run `kvdf questionnaire plan \"describe the existing product\"` to generate adoption questions.",
      "Create adoption tasks before feature implementation."
    ]
  };
}

function detectProjectStacks(targetPath, files, dirs) {
  const stacks = [];
  if (files.has("artisan") && files.has("composer.json")) stacks.push("laravel");
  else if (files.has("composer.json")) stacks.push("php_composer");
  if (files.has("package.json")) {
    stacks.push("node");
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(targetPath, "package.json"), "utf8"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.next) stacks.push("nextjs");
      if (deps.react) stacks.push("react");
      if (deps.nuxt) stacks.push("nuxt_vue");
      else if (deps.vue) stacks.push("vue");
      if (deps["@angular/core"]) stacks.push("angular");
      if (deps["@sveltejs/kit"]) stacks.push("sveltekit");
      if (deps.expo) stacks.push("react_native_expo");
      if (deps.express) stacks.push("expressjs");
      if (deps["@nestjs/core"]) stacks.push("nestjs");
      if (deps.astro) stacks.push("astro");
    } catch (error) {
      stacks.push("package_json_unreadable");
    }
  }
  if (files.has("manage.py")) stacks.push("django_or_python");
  if (files.has("pyproject.toml") || files.has("requirements.txt")) stacks.push("python");
  if (files.has("Gemfile")) stacks.push("ruby_or_rails");
  if (files.has("pubspec.yaml")) stacks.push("flutter_or_dart");
  if (files.has("angular.json")) stacks.push("angular");
  if (files.has("next.config.js") || files.has("next.config.mjs")) stacks.push("nextjs");
  if (files.has("astro.config.mjs")) stacks.push("astro");
  if (dirs.has("wp-content")) stacks.push("wordpress");
  return uniqueList(stacks);
}

function detectPotentialApps(dirs, stacks) {
  const apps = [];
  const add = (type, appPath, reason) => apps.push({ type, path: appPath, reason });
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) add("backend", ".", "Backend framework detected at project root.");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) add("frontend", ".", "Frontend or web framework detected at project root.");
  if (stacks.some((item) => /expo|flutter|mobile/.test(item))) add("mobile", ".", "Mobile framework detected at project root.");
  for (const dir of ["apps", "packages", "frontend", "backend", "admin", "mobile", "api", "web"]) {
    if (dirs.has(dir)) add(inferAppTypeFromPath(dir), dir, `Common application folder detected: ${dir}.`);
  }
  return apps;
}

function inferAppTypeFromPath(value) {
  if (/api|backend/.test(value)) return "backend";
  if (/admin/.test(value)) return "admin_frontend";
  if (/mobile/.test(value)) return "mobile";
  return "frontend";
}

function inferWorkstreamsFromStacks(stacks, apps) {
  const workstreams = new Set();
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) workstreams.add("backend");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) workstreams.add("public_frontend");
  if (stacks.some((item) => /expo|flutter/.test(item))) workstreams.add("mobile");
  if (apps.some((item) => item.type === "admin_frontend")) workstreams.add("admin_frontend");
  workstreams.add("qa");
  workstreams.add("docs");
  return Array.from(workstreams);
}

function inferDeliveryModeFromStacks(stacks, apps, risks) {
  if (risks.length >= 3 || apps.length > 2) return "structured";
  return "agile";
}

module.exports = {
  project
};

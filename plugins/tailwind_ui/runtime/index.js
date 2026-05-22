const fs = require("fs");
const path = require("path");

const PLUGIN_ID = "tailwind_ui";
const PLUGIN_VERSION = "0.1.0";
const TAILWIND_VERSION = "4.3.0";
const ROOT = path.resolve(__dirname, "..", "..", "..");

function getPluginStatus() {
  const verification = verifyTailwindCoreDependencyRemoved();
  const status = verification.package_json_clean && verification.package_lock_clean ? "available" : "warning";
  return {
    report_type: "tailwind_ui_status",
    plugin_id: PLUGIN_ID,
    plugin_version: PLUGIN_VERSION,
    tailwind_version: TAILWIND_VERSION,
    status,
    enabled_by_default: false,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    standalone: true,
    external_github_dependency: false,
    next_action: "Use kvdf tailwind-ui snippet or utility-map when a generated UI surface explicitly needs Tailwind guidance."
  };
}

function buildTailwindStatus(options = {}) {
  void options;
  return getPluginStatus();
}

function buildTailwindHtmlSnippet(options = {}) {
  const title = String(options.title || "Tailwind UI").trim() || "Tailwind UI";
  return {
    report_type: "tailwind_ui_snippet",
    plugin_id: PLUGIN_ID,
    status: "available",
    mode: "guidance_only",
    note: "Tailwind is optional and not bundled as a KVDF Core dependency.",
    html: [
      "<!-- KVDF UI assets: tailwind_ui guidance only -->",
      `<section class="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">`,
      `  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tailwind UI</p>`,
      `  <h1 class="mt-2 text-2xl font-bold text-slate-900">${escapeHtml(title)}</h1>`,
      "  <p class=\"mt-2 text-slate-600\">Use this guidance-only snippet when a surface explicitly opts into Tailwind utility classes.</p>",
      '  <div class="mt-4 flex flex-wrap gap-3">',
      '    <button type="button" class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white">Primary action</button>',
      '    <button type="button" class="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-slate-700">Secondary action</button>',
      "  </div>",
      "</section>"
    ].join("\n"),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this snippet as reference only; Tailwind assets are not bundled by KVDF Core."
  };
}

function buildTailwindUtilityMap(options = {}) {
  void options;
  return {
    report_type: "tailwind_ui_utility_map",
    plugin_id: PLUGIN_ID,
    utilities: {
      layout: ["mx-auto", "max-w-7xl", "grid", "grid-cols-*", "flex", "items-center", "justify-between"],
      spacing: ["p-4", "px-6", "py-4", "m-0", "gap-4", "gap-6", "space-y-4"],
      typography: ["text-sm", "text-base", "text-lg", "font-medium", "font-semibold", "leading-relaxed"],
      color: ["bg-slate-900", "text-slate-700", "text-white", "border-slate-200", "bg-primary", "text-primary"],
      states: ["hover:", "focus-visible:", "disabled:", "aria-[busy=true]:", "data-[state=open]:", "motion-reduce:"],
      responsive: ["sm:", "md:", "lg:", "xl:", "2xl:", "max-md:"]
    },
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this utility map as guidance for UI docs or future plugin-based HTML generation."
  };
}

function verifyTailwindCoreDependencyRemoved(options = {}) {
  void options;
  const packageJson = readJson(path.join(ROOT, "package.json"));
  const packageLock = readJson(path.join(ROOT, "package-lock.json"));
  const devDependencies = packageJson.devDependencies || {};
  const rootLockDependencies = (packageLock.packages && packageLock.packages[""] && packageLock.packages[""].devDependencies) || {};
  const packageJsonClean = !Object.prototype.hasOwnProperty.call(devDependencies, "@tailwindcss/cli")
    && !Object.prototype.hasOwnProperty.call(devDependencies, "tailwindcss");
  const packageLockClean = !Object.prototype.hasOwnProperty.call(rootLockDependencies, "@tailwindcss/cli")
    && !Object.prototype.hasOwnProperty.call(rootLockDependencies, "tailwindcss")
    && !Object.keys(packageLock.packages || {}).some((key) => /node_modules\/(?:@tailwindcss\/|tailwindcss)/.test(key));
  const sourceRef = findCoreTailwindReferences();
  const nodeModulesDependency = sourceRef.length > 0;
  const status = packageJsonClean && packageLockClean && !nodeModulesDependency ? "pass" : "warning";
  const warnings = [];
  if (!packageJsonClean) warnings.push("Tailwind remains listed in package.json devDependencies.");
  if (!packageLockClean) warnings.push("Tailwind remains listed in package-lock.json.");
  if (nodeModulesDependency) warnings.push("Core source still contains a Tailwind hard reference.");
  return {
    report_type: "tailwind_ui_verify",
    plugin_id: PLUGIN_ID,
    status,
    core_dependency: false,
    core_dev_dependency: false,
    package_json_clean: packageJsonClean,
    package_lock_clean: packageLockClean,
    node_modules_dependency: nodeModulesDependency,
    fallback_safe: true,
    warnings,
    next_action: status === "pass"
      ? "Use kvdf tailwind-ui provider when a surface explicitly opts into Tailwind."
      : "Remove the remaining Tailwind dependency references or rely on the plugin's guidance-only mode."
  };
}

function findCoreTailwindReferences() {
  const matches = [];
  const searchRoots = [path.join(ROOT, "src"), path.join(ROOT, "bin")];
  for (const searchRoot of searchRoots) {
    if (!fs.existsSync(searchRoot)) continue;
    walkFiles(searchRoot, (filePath) => {
      if (!/\.(js|cjs|mjs|json)$/i.test(filePath)) return;
      const text = fs.readFileSync(filePath, "utf8");
      if (/require\((['"])(?:@tailwindcss\/cli|tailwindcss)\1\)/.test(text)) {
        matches.push(path.relative(ROOT, filePath).replace(/\\/g, "/"));
      }
      if (/node_modules\/tailwindcss/.test(text)) {
        matches.push(path.relative(ROOT, filePath).replace(/\\/g, "/"));
      }
    });
  }
  return Array.from(new Set(matches));
}

function walkFiles(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, visit);
    } else if (entry.isFile()) {
      visit(entryPath);
    }
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
  getPluginStatus,
  buildTailwindStatus,
  buildTailwindHtmlSnippet,
  buildTailwindUtilityMap,
  verifyTailwindCoreDependencyRemoved
};

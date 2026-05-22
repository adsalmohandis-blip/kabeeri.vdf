const fs = require("fs");
const path = require("path");

const PLUGIN_ID = "tailwind_ui";
const PLUGIN_VERSION = "0.1.0";
const TAILWIND_VERSION = "4.3.0";
const TAILWIND_GUIDANCE_TARGET_DOCS = [
  "docs/ui-ux/UI_SPECIFICATION.md",
  "docs/ui-ux/ACCESSIBILITY.md",
  "docs/delivery/QA_CHECKLIST.md"
];
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
    provider: "fallback",
    enabled_by_default: false,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "guidance_only",
    fallback_safe: true,
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

function buildTailwindProviderSummary(options = {}) {
  void options;
  const verification = verifyTailwindCoreDependencyRemoved();
  const status = verification.package_json_clean && verification.package_lock_clean && !verification.node_modules_dependency ? "available" : "warning";
  return {
    report_type: "tailwind_ui_provider_summary",
    plugin_id: PLUGIN_ID,
    available: status === "available",
    enabled_by_default: false,
    provider: "fallback",
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "guidance_only",
    supports: ["utility_map", "planner_guidance", "docs_guidance", "html_comment_marker"],
    status,
    fallback_used: true,
    notes: verification.warnings || [],
    next_action: status === "available"
      ? "Use kvdf tailwind-ui planner-guidance or docs-guidance only when a project explicitly chooses Tailwind."
      : "Remove the remaining Tailwind dependency references or rely on the guidance-only fallback mode."
  };
}

function buildTailwindPlannerGuidance(options = {}) {
  const provider = buildTailwindProviderSummary(options);
  const utilityMap = buildTailwindUtilityMap(options);
  const verification = verifyTailwindCoreDependencyRemoved(options);
  const status = provider.status === "available" && verification.package_json_clean && verification.package_lock_clean
    ? "available"
    : "warning";
  return {
    report_type: "tailwind_ui_planner_guidance",
    idea: String(options.idea || options.goal || "").trim(),
    plugin_id: PLUGIN_ID,
    status,
    provider: provider.provider,
    available: provider.available,
    runtime_mode: provider.runtime_mode,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    utility_guidance: utilityMap.utilities,
    constraints: [
      "Do not add Tailwind package dependency to KVDF Core.",
      "Do not use external CDN.",
      "Use Tailwind only when project/app explicitly chooses it."
    ],
    validation_notes: verification.warnings.length ? [...verification.warnings] : ["Tailwind is guidance-only and remains optional."],
    next_action: provider.next_action
  };
}

function buildTailwindDocsGuidance(options = {}) {
  const provider = buildTailwindProviderSummary(options);
  const utilityMap = buildTailwindUtilityMap(options);
  const idea = String(options.idea || options.goal || "Tailwind guidance").trim();
  const app = String(options.app || options.app_slug || "").trim();
  const track = String(options.track || "").trim();
  const sections = TAILWIND_GUIDANCE_TARGET_DOCS.map((targetDoc, index) => ({
    target_doc: targetDoc,
    section_title: targetDoc.split("/").pop().replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    source: PLUGIN_ID,
    applies_to_stage: "ui_ux_design",
    next_action: "Merge this guidance into the Viber docs pipeline if Tailwind is explicitly selected.",
    content: [
      `# ${targetDoc.split("/").pop().replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
      "",
      `Tailwind guidance for ${idea}.`,
      app ? `- App: ${app}` : null,
      track ? `- Track: ${track}` : null,
      `- Provider: ${provider.provider}`,
      `- Runtime mode: ${provider.runtime_mode}`,
      utilityMap.utilities.layout && utilityMap.utilities.layout.length ? `- Layout utilities: ${utilityMap.utilities.layout.slice(0, 4).join(", ")}` : null,
      utilityMap.utilities.spacing && utilityMap.utilities.spacing.length ? `- Spacing utilities: ${utilityMap.utilities.spacing.slice(0, 4).join(", ")}` : null,
      utilityMap.utilities.typography && utilityMap.utilities.typography.length ? `- Typography utilities: ${utilityMap.utilities.typography.slice(0, 4).join(", ")}` : null,
      utilityMap.utilities.states && utilityMap.utilities.states.length ? `- State variants: ${utilityMap.utilities.states.slice(0, 4).join(", ")}` : null,
      utilityMap.utilities.responsive && utilityMap.utilities.responsive.length ? `- Responsive variants: ${utilityMap.utilities.responsive.slice(0, 4).join(", ")}` : null,
      index === 0 ? "- Tailwind remains optional and is not a KVDF Core dependency." : null
    ].filter(Boolean).join("\n")
  }));
  return {
    report_type: "tailwind_ui_docs_guidance",
    idea,
    plugin_id: PLUGIN_ID,
    app,
    track,
    target_docs: [...TAILWIND_GUIDANCE_TARGET_DOCS],
    sections,
    provider: provider.provider,
    status: provider.status,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: provider.runtime_mode,
    next_action: "Use these guidance sections in the Viber docs pipeline only if the project explicitly chooses Tailwind."
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
  buildTailwindProviderSummary,
  buildTailwindPlannerGuidance,
  buildTailwindDocsGuidance,
  verifyTailwindCoreDependencyRemoved
};

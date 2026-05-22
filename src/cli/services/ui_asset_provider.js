const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");
const { getPluginRuntimeStatus } = require("./plugin_loader");

const BOOTSTRAP_PLUGIN_ID = "bootstrap_ui";
const TAILWIND_PLUGIN_ID = "tailwind_ui";
const BOOTSTRAP_CSS_PATH = "plugins/bootstrap_ui/assets/bootstrap.min.css";
const BOOTSTRAP_JS_PATH = "plugins/bootstrap_ui/assets/bootstrap.bundle.min.js";

function getOptionalUiAssets(options = {}) {
  const bootstrapAssets = getBootstrapUiAssets(options);
  const preferBootstrap = shouldPreferBootstrap(options);
  const provider = preferBootstrap && bootstrapAssets.enabled && bootstrapAssets.assets_available ? BOOTSTRAP_PLUGIN_ID : "fallback";
  const assets = provider === BOOTSTRAP_PLUGIN_ID ? bootstrapAssets.assets : [];
  return {
    provider,
    available: bootstrapAssets.available,
    enabled: provider === BOOTSTRAP_PLUGIN_ID,
    assets,
    fallback_used: provider !== BOOTSTRAP_PLUGIN_ID,
    assets_available: bootstrapAssets.assets_available,
    warnings: bootstrapAssets.warnings,
    next_action: provider === BOOTSTRAP_PLUGIN_ID
      ? "Use the local Bootstrap UI assets from the bootstrap_ui plugin."
      : bootstrapAssets.available
        ? "Enable bootstrap_ui and pass an explicit bootstrap provider flag when a surface needs Bootstrap."
        : "Install bootstrap_ui before opting into Bootstrap UI assets."
  };
}

function getOptionalUiProvider(options = {}) {
  const requested = normalizeUiProviderName(options.ui_provider || options.provider || "");
  if (requested === BOOTSTRAP_PLUGIN_ID || shouldPreferBootstrap(options)) {
    return summarizeBootstrapProvider(getBootstrapUiAssets(options));
  }
  if (requested === TAILWIND_PLUGIN_ID || shouldPreferTailwind(options)) {
    return getTailwindUiProvider(options);
  }
  return summarizeFallbackProvider(options);
}

function getTailwindUiProvider(options = {}) {
  const runtime = loadTailwindRuntime();
  const pluginStatus = getPluginRuntimeStatus(TAILWIND_PLUGIN_ID);
  const providerStatus = runtime && typeof runtime.buildTailwindProviderSummary === "function"
    ? runtime.buildTailwindProviderSummary(options)
    : null;
  const available = Boolean(pluginStatus && pluginStatus.available && providerStatus && providerStatus.status !== "unavailable");
  const provider = available && Boolean(options.force_tailwind_ui || options.forceTailwindUi || options.use_tailwind_ui || options.useTailwindUi) && pluginStatus.enabled
    ? TAILWIND_PLUGIN_ID
    : "fallback";
  const notes = [];
  if (providerStatus && Array.isArray(providerStatus.notes)) notes.push(...providerStatus.notes);
  if (!pluginStatus || !pluginStatus.available) notes.push("Tailwind UI plugin is unavailable.");
  if (provider !== TAILWIND_PLUGIN_ID) notes.push("Tailwind UI is guidance-only and falls back unless explicitly selected and enabled.");
  return {
    provider,
    available,
    enabled: provider === TAILWIND_PLUGIN_ID,
    assets: [],
    fallback_used: provider !== TAILWIND_PLUGIN_ID,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "guidance_only",
    notes,
    next_action: provider === TAILWIND_PLUGIN_ID
      ? "Use the local Tailwind UI guidance helper for docs or prompt enrichment."
      : available
        ? "Use kvdf tailwind-ui planner-guidance or docs-guidance when Tailwind is explicitly selected."
        : "Install tailwind_ui before opting into Tailwind guidance."
  };
}

function buildUiProviderSummary(options = {}) {
  const requested = normalizeUiProviderName(options.ui_provider || options.provider || "");
  if (requested === TAILWIND_PLUGIN_ID || shouldPreferTailwind(options)) {
    return getTailwindUiProvider(options);
  }
  if (requested === BOOTSTRAP_PLUGIN_ID || shouldPreferBootstrap(options)) {
    const bootstrap = getBootstrapUiAssets(options);
    return summarizeBootstrapProvider(bootstrap);
  }
  return summarizeFallbackProvider(options);
}

function buildTailwindGuidanceSummary(options = {}) {
  const runtime = loadTailwindRuntime();
  const provider = getTailwindUiProvider(options);
  if (!runtime) {
    return {
      provider: provider.provider,
      available: false,
      enabled: false,
      core_dependency: false,
      core_dev_dependency: false,
      external_cdn_dependency: false,
      runtime_mode: "guidance_only",
      fallback_used: true,
      notes: ["Tailwind UI runtime is unavailable."],
      next_action: "Install tailwind_ui before requesting Tailwind guidance."
    };
  }
  const plannerGuidance = runtime.buildTailwindPlannerGuidance ? runtime.buildTailwindPlannerGuidance(options) : null;
  const docsGuidance = runtime.buildTailwindDocsGuidance ? runtime.buildTailwindDocsGuidance(options) : null;
  return {
    provider: provider.provider,
    available: provider.available,
    enabled: provider.enabled,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "guidance_only",
    fallback_used: provider.fallback_used,
    notes: provider.notes,
    utility_guidance: plannerGuidance ? plannerGuidance.utility_guidance || {} : {},
    planner_guidance: plannerGuidance || null,
    docs_guidance: docsGuidance || null,
    target_docs: docsGuidance && Array.isArray(docsGuidance.target_docs) ? [...docsGuidance.target_docs] : [],
    next_action: plannerGuidance && plannerGuidance.next_action ? plannerGuidance.next_action : provider.next_action
  };
}

function buildOptionalProviderHtmlComment(provider, options = {}) {
  void options;
  const selected = provider && typeof provider === "object" ? provider : buildUiProviderSummary(provider || {});
  const providerId = normalizeUiProviderName(selected.provider || "");
  if (providerId === TAILWIND_PLUGIN_ID) return "<!-- KVDF UI provider: tailwind_ui guidance-only -->";
  if (providerId === BOOTSTRAP_PLUGIN_ID) return "<!-- KVDF UI provider: bootstrap_ui -->";
  return "<!-- KVDF UI provider: fallback -->";
}

function getBootstrapUiAssets() {
  const root = repoRoot();
  const manifestPath = path.join(root, "plugins", BOOTSTRAP_PLUGIN_ID, "plugin.json");
  const statePath = path.join(root, ".kabeeri", "plugins.json");
  const manifest = readJsonFileSafe(manifestPath);
  const available = Boolean(manifest && manifest.plugin_id === BOOTSTRAP_PLUGIN_ID);
  const state = readJsonFileSafe(statePath) || {};
  const enabledPlugins = Array.isArray(state.enabled_plugins) ? state.enabled_plugins : [];
  const disabledPlugins = Array.isArray(state.disabled_plugins) ? state.disabled_plugins : [];
  const enabledByDefault = Boolean(manifest && manifest.enabled_by_default);
  const explicitlyEnabled = enabledPlugins.includes(BOOTSTRAP_PLUGIN_ID);
  const explicitlyDisabled = disabledPlugins.includes(BOOTSTRAP_PLUGIN_ID);
  const cssAbs = path.join(root, "plugins", BOOTSTRAP_PLUGIN_ID, "assets", "bootstrap.min.css");
  const jsAbs = path.join(root, "plugins", BOOTSTRAP_PLUGIN_ID, "assets", "bootstrap.bundle.min.js");
  const cssExists = fs.existsSync(cssAbs);
  const jsExists = fs.existsSync(jsAbs);
  const assets_available = cssExists && jsExists;
  return {
    plugin_id: BOOTSTRAP_PLUGIN_ID,
    available,
    enabled: Boolean(available && assets_available && !explicitlyDisabled && (explicitlyEnabled || enabledByDefault)),
    assets_available,
    assets: assets_available
      ? [
          { type: "css", path: BOOTSTRAP_CSS_PATH, absolute_path: cssAbs, exists: true },
          { type: "js", path: BOOTSTRAP_JS_PATH, absolute_path: jsAbs, exists: true }
        ]
      : [
          { type: "css", path: BOOTSTRAP_CSS_PATH, absolute_path: cssAbs, exists: cssExists },
          { type: "js", path: BOOTSTRAP_JS_PATH, absolute_path: jsAbs, exists: jsExists }
        ],
    warnings: available && !assets_available ? ["Bootstrap UI plugin assets are missing from the local bundle."] : [],
    next_action: available
      ? (assets_available
        ? "Enable bootstrap_ui in plugin state when a surface explicitly opts into Bootstrap."
        : "Restore the copied Bootstrap assets before enabling bootstrap_ui.")
      : "Install bootstrap_ui before opting into Bootstrap UI assets."
  };
}

function buildOptionalAssetTags(assets = {}, options = {}) {
  const selectedProvider = String(assets.provider || (shouldPreferBootstrap(options) ? BOOTSTRAP_PLUGIN_ID : "fallback")).trim().toLowerCase();
  const comment = selectedProvider === BOOTSTRAP_PLUGIN_ID ? "<!-- KVDF UI assets: bootstrap_ui -->" : "<!-- KVDF UI assets: fallback -->";
  if (selectedProvider !== BOOTSTRAP_PLUGIN_ID) {
    return comment;
  }
  const selectedAssets = Array.isArray(assets.assets) && assets.assets.length ? assets.assets : getBootstrapUiAssets(options).assets;
  const cssAsset = selectedAssets.find((item) => item && item.type === "css" && item.path);
  const jsAsset = selectedAssets.find((item) => item && item.type === "js" && item.path);
  const tags = [comment];
  if (cssAsset) tags.push(`<link rel="stylesheet" href="${resolveDocumentRelativeAssetPath(cssAsset.path, options)}">`);
  if (jsAsset) tags.push(`<script src="${resolveDocumentRelativeAssetPath(jsAsset.path, options)}"></script>`);
  return tags.join("\n");
}

function summarizeUiAssetProvider(options = {}) {
  const selected = getOptionalUiAssets(options);
  return {
    provider: selected.provider,
    available: selected.available,
    enabled: selected.enabled,
    assets: selected.assets.map((item) => item.path),
    fallback_used: selected.fallback_used,
    next_action: selected.next_action
  };
}

function summarizeBootstrapProvider(bootstrapAssets = {}) {
  return {
    provider: bootstrapAssets.enabled ? BOOTSTRAP_PLUGIN_ID : "fallback",
    available: Boolean(bootstrapAssets.available),
    enabled: Boolean(bootstrapAssets.enabled),
    assets: Array.isArray(bootstrapAssets.assets) ? bootstrapAssets.assets.map((item) => item.path).filter(Boolean) : [],
    fallback_used: !bootstrapAssets.enabled,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "asset_provider",
    notes: Array.isArray(bootstrapAssets.warnings) ? [...bootstrapAssets.warnings] : [],
    next_action: bootstrapAssets.next_action || "Use kvdf bootstrap-ui snippet when a surface explicitly needs Bootstrap assets."
  };
}

function summarizeFallbackProvider(options = {}) {
  void options;
  return {
    provider: "fallback",
    available: true,
    enabled: false,
    assets: [],
    fallback_used: true,
    core_dependency: false,
    core_dev_dependency: false,
    external_cdn_dependency: false,
    runtime_mode: "guidance_only",
    notes: [],
    next_action: "Use the local fallback UI surface when no provider is explicitly selected."
  };
}

function shouldPreferBootstrap(options = {}) {
  const raw = String(options.ui_provider || options.provider || "").trim().toLowerCase();
  if (raw === "bootstrap" || raw === BOOTSTRAP_PLUGIN_ID) return true;
  if (raw === "fallback" || raw === "default" || raw === "none") return false;
  if (options.withBootstrap || options.with_bootstrap) return true;
  if (options.noBootstrap || options.no_bootstrap) return false;
  return false;
}

function shouldPreferTailwind(options = {}) {
  const raw = String(options.ui_provider || options.provider || "").trim().toLowerCase();
  if (raw === "tailwind" || raw === TAILWIND_PLUGIN_ID) return true;
  if (raw === "fallback" || raw === "default" || raw === "none" || raw === "") return false;
  if (options.withTailwind || options.with_tailwind) return true;
  if (options.noTailwind || options.no_tailwind) return false;
  return false;
}

function normalizeUiProviderName(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "bootstrap" || normalized === "bootstrap_ui") return BOOTSTRAP_PLUGIN_ID;
  if (normalized === "tailwind" || normalized === "tailwind_ui") return TAILWIND_PLUGIN_ID;
  if (normalized === "fallback" || normalized === "default" || normalized === "none") return "fallback";
  return normalized;
}

function readJsonFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function loadTailwindRuntime() {
  try {
    const runtimePath = path.join(repoRoot(), "plugins", TAILWIND_PLUGIN_ID, "runtime");
    if (!fs.existsSync(runtimePath)) return null;
    return require(runtimePath);
  } catch {
    return null;
  }
}

function resolveDocumentRelativeAssetPath(assetPath, options = {}) {
  const documentPath = options.document_path || options.documentPath || options.output_path || options.output || null;
  if (!documentPath) {
    return `./${assetPath}`;
  }
  const root = repoRoot();
  const absoluteDocumentPath = path.isAbsolute(documentPath) ? documentPath : path.join(root, documentPath);
  const absoluteAssetPath = path.join(root, assetPath);
  const relative = path.relative(path.dirname(absoluteDocumentPath), absoluteAssetPath).replace(/\\/g, "/");
  return relative || `./${assetPath}`;
}

module.exports = {
  buildOptionalProviderHtmlComment,
  buildOptionalAssetTags,
  buildTailwindGuidanceSummary,
  buildUiProviderSummary,
  getOptionalUiAssets,
  getOptionalUiProvider,
  getBootstrapUiAssets,
  getTailwindUiProvider,
  summarizeUiAssetProvider
};

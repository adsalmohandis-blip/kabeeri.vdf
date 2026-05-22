const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");

const BOOTSTRAP_PLUGIN_ID = "bootstrap_ui";
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

function shouldPreferBootstrap(options = {}) {
  const raw = String(options.ui_provider || options.provider || "").trim().toLowerCase();
  if (raw === "bootstrap" || raw === BOOTSTRAP_PLUGIN_ID) return true;
  if (raw === "fallback" || raw === "default" || raw === "none") return false;
  if (options.withBootstrap || options.with_bootstrap) return true;
  if (options.noBootstrap || options.no_bootstrap) return false;
  return false;
}

function readJsonFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
  buildOptionalAssetTags,
  getOptionalUiAssets,
  getBootstrapUiAssets,
  summarizeUiAssetProvider
};

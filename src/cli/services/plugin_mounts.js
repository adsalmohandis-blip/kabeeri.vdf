const fs = require("fs");
const path = require("path");
const { repoRoot, packageRoot } = require("../fs_utils");

const PLUGIN_MOUNT_ROOT = ".kabeeri/plugin-links";

const PLUGIN_BUNDLE_DIRS = {
  "ai-learning": "ai_learning",
  "booking-builder": "booking_builder",
  "company-profile": "company_profile",
  "ecommerce-builder": "ecommerce_builder",
  "ecommerce-mobile-app": "ecommerce_mobile_app",
  "kvdf-dev": "kvdf_dev",
  "news-website": "news_website",
  "planner-visual": "planner_visual",
  "security-auditor": "security_auditor",
  "vibe-maintainer": "vibe_maintainer"
};

function resolvePluginSourcePath(pluginId) {
  const bundleDir = PLUGIN_BUNDLE_DIRS[pluginId] || pluginId;
  return path.join(repoRoot(), "plugins", bundleDir);
}

function getPluginSourcePath(pluginId) {
  return resolvePluginSourcePath(pluginId);
}

function getPluginMountPath(pluginId) {
  return path.join(repoRoot(), PLUGIN_MOUNT_ROOT, pluginId);
}

function getPluginBootstrapPath(pluginId) {
  return path.join(getPluginMountPath(pluginId), "mount.json");
}

function isPluginMounted(pluginId) {
  return fs.existsSync(getPluginBootstrapPath(pluginId));
}

function mountPluginBundle(plugin) {
  const sourcePath = plugin && plugin.bundle_path ? path.join(repoRoot(), plugin.bundle_path) : getPluginSourcePath(plugin.plugin_id);
  const mountPath = getPluginMountPath(plugin.plugin_id);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Plugin bundle not found: ${sourcePath}`);
  }
  fs.mkdirSync(path.dirname(mountPath), { recursive: true });
  const mountRecord = {
    plugin_id: plugin.plugin_id,
    source_path: sourcePath,
    mounted_at: new Date().toISOString()
  };
  fs.mkdirSync(mountPath, { recursive: true });
  fs.writeFileSync(getPluginBootstrapPath(plugin.plugin_id), JSON.stringify(mountRecord, null, 2));
  return mountPath;
}

function unmountPluginBundle(pluginId) {
  const mountPath = getPluginMountPath(pluginId);
  if (fs.existsSync(mountPath)) {
    fs.rmSync(mountPath, { recursive: true, force: true });
  }
  return mountPath;
}

function loadPluginBootstrap(pluginId, { allowSourceFallback = false } = {}) {
  const mountedBootstrap = getPluginBootstrapPath(pluginId);
  if (fs.existsSync(mountedBootstrap)) {
    const sourceBootstrap = path.join(getPluginSourcePath(pluginId), "bootstrap.js");
    delete require.cache[require.resolve(sourceBootstrap)];
    return require(sourceBootstrap);
  }
  if (allowSourceFallback) {
    const sourceBootstrap = path.join(getPluginSourcePath(pluginId), "bootstrap.js");
    if (fs.existsSync(sourceBootstrap)) {
      delete require.cache[require.resolve(sourceBootstrap)];
      return require(sourceBootstrap);
    }
    const packagedBootstrap = path.join(packageRoot(), "plugins", PLUGIN_BUNDLE_DIRS[pluginId] || pluginId, "bootstrap.js");
    if (fs.existsSync(packagedBootstrap)) {
      delete require.cache[require.resolve(packagedBootstrap)];
      return require(packagedBootstrap);
    }
  }
  return null;
}

module.exports = {
  PLUGIN_MOUNT_ROOT,
  getPluginSourcePath,
  getPluginMountPath,
  getPluginBootstrapPath,
  isPluginMounted,
  mountPluginBundle,
  unmountPluginBundle,
  loadPluginBootstrap
};

const fs = require("fs");
const path = require("path");

const PLUGIN_ID = "bootstrap_ui";
const PLUGIN_VERSION = "0.1.0";
const BOOTSTRAP_VERSION = "5.3.8";
const PLUGIN_ROOT = path.resolve(__dirname, "..");
const ASSET_ROOT = path.join(PLUGIN_ROOT, "assets");
const THIRD_PARTY_NOTICE = "plugins/bootstrap_ui/THIRD_PARTY_NOTICES.md";

function getPluginStatus() {
  const assets = getBootstrapAssets();
  const status = assets.available ? "available" : "warning";
  return {
    report_type: "bootstrap_ui_status",
    plugin_id: PLUGIN_ID,
    plugin_version: PLUGIN_VERSION,
    bootstrap_version: BOOTSTRAP_VERSION,
    status,
    enabled_by_default: false,
    assets_available: assets.available,
    assets: {
      css: assets.css_path,
      js: assets.js_path
    },
    core_dependency: false,
    fallback_safe: true,
    standalone: true,
    external_github_dependency: false,
    next_action: assets.available
      ? "Use kvdf bootstrap-ui snippet when a dashboard or docs surface explicitly needs Bootstrap assets."
      : "Restore the optional asset bundle or use the plugin as a no-op provider until assets are added."
  };
}

function getBootstrapAssets() {
  const css_path = "plugins/bootstrap_ui/assets/bootstrap.min.css";
  const js_path = "plugins/bootstrap_ui/assets/bootstrap.bundle.min.js";
  const cssAbs = path.join(PLUGIN_ROOT, "assets", "bootstrap.min.css");
  const jsAbs = path.join(PLUGIN_ROOT, "assets", "bootstrap.bundle.min.js");
  const cssExists = fs.existsSync(cssAbs);
  const jsExists = fs.existsSync(jsAbs);
  return {
    available: cssExists && jsExists,
    css: cssAbs,
    js: jsAbs,
    css_path,
    js_path,
    css_size: cssExists ? fs.statSync(cssAbs).size : 0,
    js_size: jsExists ? fs.statSync(jsAbs).size : 0,
    bootstrap_version: BOOTSTRAP_VERSION,
    third_party_notice: THIRD_PARTY_NOTICE
  };
}

function buildBootstrapHtmlSnippet(options = {}) {
  const assets = getBootstrapAssets();
  const title = String(options.title || "Bootstrap UI").trim() || "Bootstrap UI";
  if (!assets.available) {
    return {
      report_type: "bootstrap_ui_snippet",
      plugin_id: PLUGIN_ID,
      status: "warning",
      warnings: ["Bootstrap assets are not present in the plugin bundle."],
      html: `<!-- Bootstrap UI assets are unavailable for ${escapeHtml(title)}. -->`,
      css_path: assets.css_path,
      js_path: assets.js_path,
      standalone: true,
      external_github_dependency: false,
      next_action: "Copy the Bootstrap dist assets into plugins/bootstrap_ui/assets/."
    };
  }

  const cssHref = `./${assets.css_path}`;
  const jsSrc = `./${assets.js_path}`;
  const html = [
    "<!-- Bootstrap UI optional asset snippet -->",
    `<link rel="stylesheet" href="${cssHref}">`,
    `<div class="container py-4">`,
    `  <div class="p-4 mb-4 bg-body-tertiary rounded-3">`,
    `    <h1 class="display-6">${escapeHtml(title)}</h1>`,
    `    <p class="lead mb-3">Use this optional Bootstrap UI asset provider when a dashboard or docs surface explicitly needs Bootstrap styles and behavior.</p>`,
    `    <button type="button" class="btn btn-primary">Primary action</button>`,
    `    <button type="button" class="btn btn-outline-secondary ms-2">Secondary action</button>`,
    "  </div>",
    "</div>",
    `<script src="${jsSrc}"></script>`
  ].join("\n");

  return {
    report_type: "bootstrap_ui_snippet",
    plugin_id: PLUGIN_ID,
    status: "available",
    html,
    css_path: assets.css_path,
    js_path: assets.js_path,
    bootstrap_version: assets.bootstrap_version,
    standalone: true,
    external_github_dependency: false,
    next_action: "Embed this snippet only on surfaces that explicitly opted into Bootstrap assets."
  };
}

function buildBootstrapAssetReport() {
  const assets = getBootstrapAssets();
  const report = {
    report_type: "bootstrap_ui_assets",
    plugin_id: PLUGIN_ID,
    status: assets.available ? "available" : "warning",
    assets: [
      {
        type: "css",
        path: assets.css_path,
        size: assets.css_size
      },
      {
        type: "js",
        path: assets.js_path,
        size: assets.js_size
      }
    ],
    third_party_notice: THIRD_PARTY_NOTICE,
    bootstrap_version: assets.bootstrap_version,
    core_dependency: false,
    standalone: true,
    external_github_dependency: false,
    next_action: assets.available
      ? "Use kvdf bootstrap-ui snippet when a dashboard or docs surface explicitly needs Bootstrap assets."
      : "Add the copied Bootstrap dist assets before using the snippet output."
  };
  if (!assets.available) {
    report.warnings = ["Bootstrap asset files are missing from plugins/bootstrap_ui/assets/."];
  }
  return report;
}

function verifyBootstrapAssets() {
  const assets = getBootstrapAssets();
  const cssExists = fs.existsSync(assets.css);
  const jsExists = fs.existsSync(assets.js);
  const status = cssExists && jsExists ? "pass" : "warning";
  const warnings = [];
  if (!cssExists) warnings.push("Missing plugins/bootstrap_ui/assets/bootstrap.min.css.");
  if (!jsExists) warnings.push("Missing plugins/bootstrap_ui/assets/bootstrap.bundle.min.js.");
  return {
    report_type: "bootstrap_ui_verify",
    plugin_id: PLUGIN_ID,
    status,
    assets: {
      css_exists: cssExists,
      js_exists: jsExists
    },
    core_dependency: false,
    node_modules_dependency: false,
    fallback_safe: true,
    warnings,
    next_action: cssExists && jsExists
      ? "Use kvdf bootstrap-ui provider when a surface explicitly opts into Bootstrap."
      : "Restore the copied Bootstrap dist assets or rely on fallback rendering."
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  getPluginStatus,
  getBootstrapAssets,
  buildBootstrapHtmlSnippet,
  buildBootstrapAssetReport,
  verifyBootstrapAssets
};

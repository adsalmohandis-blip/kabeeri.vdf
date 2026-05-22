const fs = require("fs");
const path = require("path");

function pluginRoot() {
  return path.resolve(__dirname, "..");
}

function listSnippets(options = {}) {
  void options;
  const folderPath = path.join(pluginRoot(), "snippets");
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter((entry) => fs.statSync(path.join(folderPath, entry)).isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const fullPath = path.join(folderPath, entry);
      const base = path.basename(entry, path.extname(entry));
      return {
        id: `snippet:${base}`,
        name: base.replace(/[-_]/g, " "),
        path: path.relative(pluginRoot(), fullPath).replace(/\\/g, "/")
      };
    });
}

function getSnippet(snippetId, options = {}) {
  void options;
  return listSnippets().find((item) => item.id === snippetId || item.name === snippetId) || null;
}

function summarizeSnippets(options = {}) {
  const snippets = listSnippets(options);
  return {
    report_type: "ui_dashboard_kits_snippets",
    snippets,
    count: snippets.length,
    next_action: snippets.length ? "Use these snippets as small dashboard kit guidance blocks." : "Add snippets to the plugin when needed."
  };
}

module.exports = {
  listSnippets,
  getSnippet,
  summarizeSnippets
};

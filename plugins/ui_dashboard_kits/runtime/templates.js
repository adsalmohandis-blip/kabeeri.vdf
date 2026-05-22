const fs = require("fs");
const path = require("path");

function pluginRoot() {
  return path.resolve(__dirname, "..");
}

function listTemplates(options = {}) {
  void options;
  const folderPath = path.join(pluginRoot(), "templates");
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter((entry) => fs.statSync(path.join(folderPath, entry)).isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const fullPath = path.join(folderPath, entry);
      const base = path.basename(entry, path.extname(entry));
      return {
        id: `template:${base}`,
        name: base.replace(/[-_]/g, " "),
        path: path.relative(pluginRoot(), fullPath).replace(/\\/g, "/")
      };
    });
}

function getTemplate(templateId, options = {}) {
  void options;
  return listTemplates().find((item) => item.id === templateId || item.name === templateId) || null;
}

function summarizeTemplates(options = {}) {
  const templates = listTemplates(options);
  return {
    report_type: "ui_dashboard_kits_templates",
    templates,
    count: templates.length,
    next_action: templates.length ? "Use these templates as dashboard kit starter surfaces." : "Add templates to the plugin when needed."
  };
}

module.exports = {
  listTemplates,
  getTemplate,
  summarizeTemplates
};

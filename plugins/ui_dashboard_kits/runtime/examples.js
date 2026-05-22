const fs = require("fs");
const path = require("path");

function pluginRoot() {
  return path.resolve(__dirname, "..");
}

function listEntries(folder, kind) {
  const folderPath = path.join(pluginRoot(), folder);
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter((entry) => fs.statSync(path.join(folderPath, entry)).isFile())
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => {
      const fullPath = path.join(folderPath, entry);
      const content = fs.readFileSync(fullPath, "utf8");
      const base = path.basename(entry, path.extname(entry));
      const title = String(content || "").match(/^#\s+(.+)$/m)?.[1]?.trim() || base.replace(/[-_]/g, " ");
      const summary = String(content || "").trim().split(/\n{2,}/).find((block) => !/^#/.test(block.trim())) || "";
      return {
        id: `${kind}:${base}`,
        name: base.replace(/[-_]/g, " "),
        title,
        path: path.relative(pluginRoot(), fullPath).replace(/\\/g, "/"),
        summary: summary.trim().slice(0, 220)
      };
    });
}

function listExamples(options = {}) {
  void options;
  return listEntries("examples", "example");
}

function getExample(exampleId, options = {}) {
  void options;
  return listExamples().find((item) => item.id === exampleId || item.name === exampleId) || null;
}

function summarizeExamples(options = {}) {
  const examples = listExamples(options);
  return {
    report_type: "ui_dashboard_kits_examples",
    examples,
    count: examples.length,
    next_action: examples.length ? "Use these examples as dashboard kit guidance." : "Add dashboard examples to the plugin when needed."
  };
}

module.exports = {
  listExamples,
  getExample,
  summarizeExamples
};

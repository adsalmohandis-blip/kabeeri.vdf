const { fileExists, readJsonFile } = require("../fs_utils");
const { table } = require("../ui");

function plan(action, name) {
  const plans = getPlanRegistry();

  if (!action || action === "list") {
    const rows = plans.map(([version, file]) => {
      const data = readJsonFile(file);
      return [version, data.totals.milestones, data.totals.issues, file];
    });
    console.log(table(["Version", "Milestones", "Issues", "File"], rows));
    return;
  }

  if (action === "show") {
    if (!name) throw new Error("Missing plan version.");
    const found = plans.find(([version]) => version === name || version.replace(/\./g, "_") === name);
    if (!found) throw new Error(`Plan not found: ${name}`);
    console.log(JSON.stringify(readJsonFile(found[1]), null, 2));
    return;
  }

  throw new Error(`Unknown plan action: ${action}`);
}

function getPlanRegistry() {
  return [
    ["v3.0.0", "platform_integration/milestones_and_issues.v3.0.0.json"],
    ["v4.0.0", "multi_ai_governance/milestones_and_issues.v4.0.0.json"],
    ["v5.0.0", "project_intelligence/milestones_and_issues.v5.0.0.json"]
  ].filter(([, file]) => fileExists(file));
}

function findPlan(version) {
  const requested = version || "v4.0.0";
  const found = getPlanRegistry().find(([itemVersion]) => itemVersion === requested || itemVersion.replace(/^v/, "") === requested || itemVersion.replace(/\./g, "_") === requested);
  if (!found) throw new Error(`Plan not found: ${requested}`);
  return { version: found[0], file: found[1], data: readJsonFile(found[1]) };
}

module.exports = {
  plan,
  getPlanRegistry,
  findPlan
};

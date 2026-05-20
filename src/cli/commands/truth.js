const { buildTruthAudit, buildTruthFeatureReport } = require("../services/truth_reconciler");

function truth(action, value, flags = {}, rest = [], deps = {}) {
  const selected = normalizeTruthAction(action, value, rest);
  if (selected === "feature") {
    const featureId = resolveTruthFeatureId(value, flags, rest);
    if (!featureId) throw new Error("Missing feature id for truth feature.");
    const report = buildTruthFeatureReport(featureId, deps);
    printTruthReport(report, flags);
    return report;
  }
  const report = buildTruthAudit(deps);
  printTruthReport(report, flags);
  return report;
}

function normalizeTruthAction(action, value, rest = []) {
  const candidates = [action, value, ...rest];
  const selected = candidates.find((item) => typeof item === "string" && item.trim() && !String(item).startsWith("--"));
  const normalized = String(selected || "audit").trim().toLowerCase();
  return normalized === "feature" ? "feature" : "audit";
}

function resolveTruthFeatureId(value, flags = {}, rest = []) {
  const candidates = [flags.feature, flags.feature_id, flags.id, value, ...rest];
  return candidates.find((item) => typeof item === "string" && item.trim() && !String(item).startsWith("--")) || "";
}

function printTruthReport(report, flags = {}) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(report.report_type || "kvdf_truth");
}

module.exports = {
  truth
};

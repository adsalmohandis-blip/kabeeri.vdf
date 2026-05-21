const fs = require("fs");
const path = require("path");

const REQUIRED_TERMS = [
  { term: "mobile", category: "responsive", label: "Mentions mobile/responsive support." },
  { term: "responsive", category: "responsive", label: "Mentions responsive behavior." },
  { term: "accessibility", category: "accessibility", label: "Mentions accessibility support." },
  { term: "empty state", category: "content", label: "Mentions empty states." },
  { term: "loading", category: "interaction", label: "Mentions loading states." },
  { term: "error", category: "interaction", label: "Mentions error states." },
  { term: "contrast", category: "accessibility", label: "Mentions contrast checks." },
  { term: "focus", category: "accessibility", label: "Mentions focus states." },
  { term: "validation", category: "forms", label: "Mentions validation messaging." }
];

function auditUiUx(target, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const resolvedTarget = target ? path.resolve(root, target) : null;
  const findings = [];
  if (!resolvedTarget || !fs.existsSync(resolvedTarget)) {
    findings.push({
      check_id: "target-missing",
      category: "layout",
      severity: "warning",
      message: "Target file is missing or was not provided."
    });
    return buildReport("warning", target || "", findings, "Provide an existing UI/UX file or generate the design file first.");
  }

  let text = "";
  try {
    const stats = fs.statSync(resolvedTarget);
    if (!stats.isFile()) {
      findings.push({
        check_id: "target-not-file",
        category: "layout",
        severity: "warning",
        message: "Target path is not a file."
      });
      return buildReport("warning", target, findings, "Provide a specific UI/UX text file to audit.");
    }
    text = fs.readFileSync(resolvedTarget, "utf8").toLowerCase();
  } catch (error) {
    findings.push({
      check_id: "target-unreadable",
      category: "layout",
      severity: "warning",
      message: `Target file could not be read: ${error.message}`
    });
    return buildReport("warning", target, findings, "Fix the target path and run the audit again.");
  }

  for (const item of REQUIRED_TERMS) {
    if (!text.includes(item.term)) {
      findings.push({
        check_id: `missing-${item.category}`,
        category: item.category,
        severity: "warning",
        message: `No clear mention of ${item.label.toLowerCase()}.`
      });
    }
  }

  const blockers = findings.filter((item) => item.severity === "blocker").length;
  const warnings = findings.filter((item) => item.severity === "warning").length;
  const status = blockers ? "blocked" : warnings ? "warning" : "pass";
  const nextAction = status === "pass"
    ? "Use this audit as a pre-delivery UI/UX quality check."
    : "Update the UI/UX file to cover the missing checks, then run the audit again.";
  return buildReport(status, target, findings, nextAction);
}

function buildReport(status, target, findings, nextAction) {
  const warnings = findings.filter((item) => item.severity === "warning").length;
  const blockers = findings.filter((item) => item.severity === "blocker").length;
  return {
    report_type: "ui_ux_intelligence_audit",
    status,
    target: String(target || ""),
    findings,
    summary: {
      warnings,
      blockers
    },
    next_action: nextAction
  };
}

module.exports = {
  auditUiUx
};

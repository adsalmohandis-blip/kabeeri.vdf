const fs = require("fs");
const path = require("path");

const AUDIT_CATEGORIES = [
  "accessibility",
  "responsive",
  "interaction",
  "content",
  "layout",
  "forms",
  "dashboard",
  "performance",
  "motion",
  "handoff"
];

const REQUIRED_SIGNALS = [
  { id: "responsive", category: "responsive", term: /responsive|mobile|tablet|desktop/i, message: "Responsive/mobile guidance is present.", recommendation: "Add responsive section guidance for mobile, tablet, and desktop behavior.", evidence: "responsive/mobile/desktop terms" },
  { id: "accessibility", category: "accessibility", term: /accessibility|a11y/i, message: "Accessibility guidance is present.", recommendation: "Add a dedicated accessibility section and explicit accessibility checks.", evidence: "accessibility terms" },
  { id: "empty-states", category: "interaction", term: /empty state|empty states/i, message: "Empty state guidance is present.", recommendation: "Document what the UI shows when there is no data or nothing to do yet.", evidence: "empty state terms" },
  { id: "loading-states", category: "interaction", term: /loading state|loading states|loading/i, message: "Loading state guidance is present.", recommendation: "Describe loading feedback for async actions and transitions.", evidence: "loading terms" },
  { id: "error-states", category: "interaction", term: /error state|error states|error/i, message: "Error state guidance is present.", recommendation: "Add clear recovery-oriented error states.", evidence: "error terms" },
  { id: "focus-states", category: "accessibility", term: /focus state|focus states|focus/i, message: "Focus state guidance is present.", recommendation: "Call out visible focus behavior for every interactive control.", evidence: "focus terms" },
  { id: "contrast", category: "accessibility", term: /contrast/i, message: "Contrast notes are present.", recommendation: "Document contrast expectations for text, icons, and important surfaces.", evidence: "contrast terms" },
  { id: "keyboard-navigation", category: "accessibility", term: /keyboard navigation|keyboard|tab order/i, message: "Keyboard navigation guidance is present.", recommendation: "Document keyboard navigation and tab order behavior.", evidence: "keyboard terms" },
  { id: "handoff-checklist", category: "handoff", term: /handoff checklist|qa checklist|acceptance criteria/i, message: "Handoff checklist guidance is present.", recommendation: "Add the QA checklist and acceptance criteria references.", evidence: "handoff checklist terms" },
  { id: "implementation-guidance", category: "handoff", term: /implementation|component|state|flow|wireframe|specification/i, message: "Implementation guidance is present.", recommendation: "Add enough state, flow, and component detail to make handoff actionable.", evidence: "implementation guidance terms" }
];

function auditUiUxTarget(targetPath, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const resolvedTarget = targetPath ? path.resolve(root, targetPath) : null;
  if (!resolvedTarget || !fs.existsSync(resolvedTarget)) {
    return buildReport("warning", targetPath || "", [
      createFinding("target-missing", "warning", "layout", "Target file is missing or was not provided.", String(targetPath || ""), "Provide an existing UI/UX target file or pass inline text.", "Use a concrete docs or UI file path.")
    ], "Provide an existing UI/UX file or generate the design file first.");
  }

  let text = "";
  try {
    const stats = fs.statSync(resolvedTarget);
    if (!stats.isFile()) {
      return buildReport("warning", targetPath, [
        createFinding("target-not-file", "warning", "layout", "Target path is not a file.", targetPath, "Provide a specific file path.", "Point the audit at a file, not a directory.")
      ], "Provide a specific UI/UX text file to audit.");
    }
    text = fs.readFileSync(resolvedTarget, "utf8");
  } catch (error) {
    return buildReport("warning", targetPath, [
      createFinding("target-unreadable", "warning", "layout", `Target file could not be read: ${error.message}`, targetPath, "Fix the file path or permissions.", "Use a readable local file.")
    ], "Fix the target path and run the audit again.");
  }

  return auditTextContent(text, { ...options, target: targetPath });
}

function auditTextContent(text, options = {}) {
  const strict = Boolean(options.strict);
  const content = String(text || "");
  const normalized = content.toLowerCase();
  const findings = [];

  for (const signal of REQUIRED_SIGNALS) {
    if (!signal.term.test(normalized)) {
      findings.push(createFinding(
        signal.id,
        strict && isCriticalSignal(signal.id) ? "blocker" : "warning",
        signal.category,
        `Missing: ${signal.message}`,
        signal.evidence,
        signal.recommendation,
        signal.evidence
      ));
    }
  }

  const formSignals = /(form|checkout|booking|signup|register|settings|profile|payment|payment method|submit)/i.test(content);
  if (formSignals && !/validation/i.test(normalized)) {
    findings.push(createFinding(
      "forms-validation",
      strict ? "blocker" : "warning",
      "forms",
      "Forms are likely but validation guidance is missing.",
      "form-like content present",
      "Document field validation, inline errors, and required field clarity.",
      "Search for validation messages and error handling in form flows."
    ));
  }

  const destructiveSignals = /(delete|remove|archive|destroy|cancel|purge)/i.test(content);
  if (destructiveSignals && !/confirm/i.test(normalized)) {
    findings.push(createFinding(
      "forms-destructive-confirmation",
      strict ? "blocker" : "warning",
      "forms",
      "Potential destructive actions are mentioned but confirmation guidance is missing.",
      "destructive-action terms present",
      "Document confirmation and recovery for destructive actions.",
      "Search for confirm dialogs or explicit safety steps."
    ));
  }

  const outputFeelsSparse = normalized.split(/\s+/).filter(Boolean).length < 120 || countOccurrences(normalized, "# ") < 4;
  if (outputFeelsSparse) {
    findings.push(createFinding(
      "implementation-depth",
      strict ? "blocker" : "warning",
      "handoff",
      "The UI/UX file is light on implementation guidance.",
      "few headings or short content",
      "Add more explicit state, flow, and component detail.",
      "Provide enough guidance for implementation without guessing."
    ));
  }

  const status = summarizeAudit(findings);
  return buildReport(status.blockers ? "blocked" : status.warnings ? "warning" : "pass", options.target || "", findings, nextActionForStatus(status, strict));
}

function summarizeAudit(findings = []) {
  const summary = {
    warnings: 0,
    blockers: 0,
    by_category: {}
  };
  for (const category of AUDIT_CATEGORIES) {
    summary.by_category[category] = { total: 0, warnings: 0, blockers: 0, info: 0 };
  }
  for (const finding of findings || []) {
    const category = AUDIT_CATEGORIES.includes(finding.category) ? finding.category : "content";
    if (!summary.by_category[category]) summary.by_category[category] = { total: 0, warnings: 0, blockers: 0, info: 0 };
    summary.by_category[category].total += 1;
    if (finding.severity === "warning") {
      summary.warnings += 1;
      summary.by_category[category].warnings += 1;
    } else if (finding.severity === "blocker") {
      summary.blockers += 1;
      summary.by_category[category].blockers += 1;
    } else {
      summary.by_category[category].info += 1;
    }
  }
  return summary;
}

function buildReport(status, target, findings, nextAction) {
  const summary = summarizeAudit(findings);
  return {
    report_type: "ui_ux_intelligence_audit",
    status,
    target: String(target || ""),
    findings,
    summary,
    standalone: true,
    external_github_dependency: false,
    next_action: nextAction
  };
}

function nextActionForStatus(summary, strict) {
  if (!summary.blockers && !summary.warnings) {
    return "Use this audit as a pre-delivery UI/UX quality check.";
  }
  if (strict && summary.blockers) {
    return "Fix the missing critical UI/UX sections before handoff.";
  }
  return "Update the UI/UX file to cover the missing checks, then run the audit again.";
}

function createFinding(findingId, severity, category, message, evidence, recommendation, hint) {
  return {
    finding_id: findingId,
    severity: ["info", "warning", "blocker"].includes(severity) ? severity : "warning",
    category: AUDIT_CATEGORIES.includes(category) ? category : "content",
    message,
    evidence: evidence || "",
    recommendation: recommendation || hint || ""
  };
}

function isCriticalSignal(signalId) {
  return [
    "responsive",
    "accessibility",
    "empty-states",
    "loading-states",
    "error-states",
    "focus-states",
    "contrast",
    "keyboard-navigation",
    "handoff-checklist"
  ].includes(signalId);
}

function countOccurrences(text, token) {
  const match = String(text || "").match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
  return match ? match.length : 0;
}

module.exports = {
  AUDIT_CATEGORIES,
  auditUiUxTarget,
  auditTextContent,
  summarizeAudit
};

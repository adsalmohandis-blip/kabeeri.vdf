const fs = require("fs");
const path = require("path");
const { auditTextContent } = require("./audit");
const { buildUiUxScorecard } = require("./scorecard");
const { buildUiUxGate } = require("./gate");

const EXPECTED_APP_DOCS = [
  "docs/ui-ux/UI_UX_DESIGN.md",
  "docs/ui-ux/UX_PRINCIPLES.md",
  "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
  "docs/ui-ux/USER_FLOWS.md",
  "docs/ui-ux/WIREFRAMES.md",
  "docs/ui-ux/UI_SPECIFICATION.md",
  "docs/ui-ux/ACCESSIBILITY.md",
  "docs/delivery/QA_CHECKLIST.md"
];

function buildViberUiUxReadiness(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || input && input.app || "");
  const stage = normalizeStage(options.stage || "handoff");
  const docs = readUiUxDocsFromApp(app, options);
  const corpus = docs.contents.join("\n\n");
  const audit = corpus ? auditTextContent(corpus, { strict: Boolean(options.strict), target: app }) : null;
  const scoringInput = String(input || app || corpus || "").trim();
  const scorecard = buildUiUxScorecard(scoringInput, {
    ...options,
    app,
    docsStatus: docs,
    audit,
    text: corpus
  });
  const gate = buildUiUxGate(scoringInput, {
    ...options,
    app,
    stage,
    scorecard
  });
  const status = gate.status === "blocked" ? "blocked" : (gate.status === "warning" || docs.missing_docs.length ? "warning" : "pass");
  return {
    report_type: "ui_ux_intelligence_viber_readiness",
    app,
    stage,
    status,
    scorecard,
    gate,
    docs_checked: docs.docs_checked,
    missing_docs: docs.missing_docs,
    standalone: true,
    external_github_dependency: false,
    next_action: docs.missing_docs.length
      ? `Create the missing UI/UX docs for ${app || "the app"} and rerun the readiness check.`
      : gate.next_action || "Use this readiness output in the Viber pipeline."
  };
}

function readUiUxDocsFromApp(appSlug, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const base = appSlug ? path.join(root, "workspaces", "apps", appSlug, "docs") : path.join(root, "workspaces", "apps");
  const checked = [];
  const missing = [];
  const contents = [];
  for (const rel of EXPECTED_APP_DOCS) {
    const filePath = appSlug ? path.join(root, "workspaces", "apps", appSlug, rel) : path.join(root, rel);
    checked.push(rel);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      try {
        contents.push(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        missing.push(rel);
      }
    } else {
      missing.push(rel);
    }
  }
  return {
    app: appSlug,
    base,
    docs_checked: checked,
    missing_docs: uniqueStrings(missing),
    contents,
    ready: missing.length === 0
  };
}

function summarizeUiUxReadiness(readiness = {}) {
  return {
    app: readiness.app || "",
    stage: readiness.stage || "",
    status: readiness.status || "warning",
    docs_checked_total: Array.isArray(readiness.docs_checked) ? readiness.docs_checked.length : 0,
    missing_docs_total: Array.isArray(readiness.missing_docs) ? readiness.missing_docs.length : 0,
    score: readiness.scorecard ? Number(readiness.scorecard.score || 0) : 0,
    grade: readiness.scorecard ? readiness.scorecard.grade || "F" : "F"
  };
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_/]+|[-_/]+$/g, "");
}

function normalizeStage(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  EXPECTED_APP_DOCS,
  buildViberUiUxReadiness,
  readUiUxDocsFromApp,
  summarizeUiUxReadiness
};

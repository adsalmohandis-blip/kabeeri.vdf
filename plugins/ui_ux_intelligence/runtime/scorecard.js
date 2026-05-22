const fs = require("fs");
const path = require("path");
const { generateChecklist, summarizeChecklist } = require("./checklist");
const { auditUiUxTarget, auditTextContent, summarizeAudit } = require("./audit");
const { generateDesignSystem } = require("./design_system");
const { recommendUiUx } = require("./recommender");

const SCORECARD_SECTIONS = [
  "accessibility",
  "responsive",
  "interaction_states",
  "content_and_tone",
  "layout",
  "forms",
  "dashboard",
  "performance",
  "handoff"
];

const CATEGORY_TO_SECTION = {
  accessibility: "accessibility",
  responsive: "responsive",
  interaction: "interaction_states",
  content: "content_and_tone",
  layout: "layout",
  forms: "forms",
  dashboard: "dashboard",
  performance: "performance",
  motion: "performance",
  handoff: "handoff"
};

function buildUiUxScorecard(input, options = {}) {
  const idea = String(input || options.idea || options.goal || "").trim();
  const recommendation = options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation"
    ? options.recommendation
    : recommendUiUx(idea, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(idea, { ...options, recommendation });
  const checklist = options.checklist && Array.isArray(options.checklist.checklist)
    ? options.checklist
    : generateChecklist(idea, { ...options, recommendation, designSystem });
  const docsStatus = normalizeDocsStatus(options.docsStatus || options.docs_status || null);
  const audit = resolveAudit(options, idea);
  const checklistSummary = summarizeChecklist(checklist.checklist || checklist);
  const auditSummary = audit ? summarizeAudit(audit.findings || []) : summarizeAudit([]);
  const sectionMap = buildSectionScores({
    recommendation,
    designSystem,
    checklistSummary,
    auditSummary,
    docsStatus
  });
  const score = calculateUiUxReadinessScore(sectionMap);
  const grade = gradeFromScore(score);
  const blockers = collectIssues(sectionMap, "blocker");
  const warnings = collectIssues(sectionMap, "warning");
  const status = determineStatus(score, blockers, options);

  return {
    report_type: "ui_ux_intelligence_scorecard",
    input: idea,
    status,
    score,
    grade,
    sections: sectionMap,
    blockers,
    warnings,
    standalone: true,
    external_github_dependency: false,
    next_action: nextActionForScorecard(score, blockers, warnings, docsStatus)
  };
}

function scoreChecklist(checklist, options = {}) {
  const items = Array.isArray(checklist) ? checklist : Array.isArray(checklist && checklist.checklist) ? checklist.checklist : [];
  const summary = summarizeChecklist(items);
  const sectionScores = {};
  for (const section of SCORECARD_SECTIONS) {
    sectionScores[section] = {
      score: scoreSectionFromChecklist(section, summary.by_category || {}),
      blockers: [],
      warnings: [],
      evidence: []
    };
  }
  return {
    score: calculateUiUxReadinessScore(sectionScores),
    sections: sectionScores,
    summary,
    warnings: options.strict && summary.blockers ? ["Checklist contains blockers."] : []
  };
}

function scoreAuditFindings(findings, options = {}) {
  const auditSummary = summarizeAudit(Array.isArray(findings) ? findings : []);
  const sectionScores = {};
  for (const section of SCORECARD_SECTIONS) {
    sectionScores[section] = {
      score: scoreSectionFromAudit(section, auditSummary.by_category || {}),
      blockers: [],
      warnings: [],
      evidence: []
    };
  }
  return {
    score: calculateUiUxReadinessScore(sectionScores),
    sections: sectionScores,
    summary: auditSummary,
    warnings: options.strict && auditSummary.blockers ? ["Audit contains blockers."] : []
  };
}

function scoreDocsCompleteness(docsStatus, options = {}) {
  const normalized = normalizeDocsStatus(docsStatus);
  const missing = Array.isArray(normalized.missing_docs) ? normalized.missing_docs.length : 0;
  const checked = Array.isArray(normalized.docs_checked) ? normalized.docs_checked.length : 0;
  const total = checked + missing;
  const ratio = total > 0 ? checked / total : (normalized.ready ? 1 : 0.25);
  const score = clamp(Math.round(ratio * 100) - (missing * 5), 0, 100);
  const blockers = missing > 0 && options.strict ? ["Missing UI/UX docs block strict handoff readiness."] : [];
  const warnings = missing > 0 ? [`${missing} UI/UX doc(s) are missing.`] : [];
  return {
    score,
    blockers,
    warnings,
    ready: missing === 0 && (normalized.ready !== false)
  };
}

function calculateUiUxReadinessScore(parts = {}) {
  const scores = SCORECARD_SECTIONS.map((section) => {
    const value = Number(parts && parts[section] && typeof parts[section].score === "number" ? parts[section].score : 0);
    return clamp(value, 0, 100);
  });
  if (!scores.length) return 0;
  const weights = {
    accessibility: 1.4,
    responsive: 1.2,
    interaction_states: 1.2,
    content_and_tone: 1,
    layout: 1,
    forms: 1,
    dashboard: 1,
    performance: 0.9,
    handoff: 1.1
  };
  let totalWeight = 0;
  let total = 0;
  for (const section of SCORECARD_SECTIONS) {
    const weight = weights[section] || 1;
    totalWeight += weight;
    total += (Number(parts && parts[section] && parts[section].score) || 0) * weight;
  }
  return clamp(Math.round(total / totalWeight), 0, 100);
}

function summarizeScorecard(scorecard = {}) {
  const sections = scorecard.sections || {};
  const blockers = Array.isArray(scorecard.blockers) ? scorecard.blockers.length : 0;
  const warnings = Array.isArray(scorecard.warnings) ? scorecard.warnings.length : 0;
  const by_section = {};
  for (const section of SCORECARD_SECTIONS) {
    const value = sections[section] || {};
    by_section[section] = {
      score: Number(value.score || 0),
      blockers: Array.isArray(value.blockers) ? value.blockers.length : 0,
      warnings: Array.isArray(value.warnings) ? value.warnings.length : 0
    };
  }
  return {
    score: Number(scorecard.score || 0),
    grade: scorecard.grade || gradeFromScore(Number(scorecard.score || 0)),
    status: scorecard.status || "warning",
    blockers,
    warnings,
    by_section
  };
}

function buildSectionScores({ recommendation, designSystem, checklistSummary, auditSummary, docsStatus }) {
  const sectionScores = {
    accessibility: scoreAccessibility(recommendation, checklistSummary, auditSummary, docsStatus),
    responsive: scoreResponsive(recommendation, checklistSummary, auditSummary, docsStatus),
    interaction_states: scoreInteraction(recommendation, checklistSummary, auditSummary, docsStatus),
    content_and_tone: scoreContent(recommendation, checklistSummary, auditSummary, docsStatus),
    layout: scoreLayout(recommendation, checklistSummary, auditSummary, docsStatus),
    forms: scoreForms(recommendation, checklistSummary, auditSummary, docsStatus),
    dashboard: scoreDashboard(recommendation, checklistSummary, auditSummary, docsStatus),
    performance: scorePerformance(recommendation, designSystem, checklistSummary, auditSummary, docsStatus),
    handoff: scoreHandoff(recommendation, checklistSummary, auditSummary, docsStatus)
  };
  return sectionScores;
}

function scoreAccessibility(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.accessibility ? checklistSummary.by_category.accessibility : {};
  const audit = auditSummary.by_category && auditSummary.by_category.accessibility ? auditSummary.by_category.accessibility : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 45 + (checklist.total || 0) * 3 + (audit.total || 0) * 2 + Math.round(docs * 0.2);
  const penalties = (checklist.blocker || 0) * 20 + (checklist.warning || 0) * 7 + (audit.blockers || 0) * 18 + (audit.warnings || 0) * 5;
  return sectionScore(base - penalties, [
    createEvidence(recommendation, "accessibility"),
    "Visible focus states",
    "Keyboard navigation",
    "Contrast notes",
    "Semantic structure"
  ], checklist, audit, "accessibility");
}

function scoreResponsive(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.responsive ? checklistSummary.by_category.responsive : {};
  const audit = auditSummary.by_category && auditSummary.by_category.responsive ? auditSummary.by_category.responsive : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 48 + (checklist.total || 0) * 3 + Math.round(docs * 0.15);
  const penalties = (checklist.blocker || 0) * 20 + (checklist.warning || 0) * 8 + (audit.blockers || 0) * 16 + (audit.warnings || 0) * 5;
  return sectionScore(base - penalties, [
    "Mobile layout",
    "Tablet layout",
    "Desktop layout",
    "Touch targets",
    createEvidence(recommendation, "responsive")
  ], checklist, audit, "responsive");
}

function scoreInteraction(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.interaction ? checklistSummary.by_category.interaction : {};
  const audit = auditSummary.by_category && auditSummary.by_category.interaction ? auditSummary.by_category.interaction : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 50 + (checklist.total || 0) * 3 + Math.round(docs * 0.1);
  const penalties = (checklist.blocker || 0) * 18 + (checklist.warning || 0) * 7 + (audit.blockers || 0) * 14 + (audit.warnings || 0) * 5;
  return sectionScore(base - penalties, [
    "Loading states",
    "Empty states",
    "Error states",
    "Success states",
    "Disabled states",
    createEvidence(recommendation, "interaction")
  ], checklist, audit, "interaction");
}

function scoreContent(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.content ? checklistSummary.by_category.content : {};
  const audit = auditSummary.by_category && auditSummary.by_category.content ? auditSummary.by_category.content : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 50 + (checklist.total || 0) * 3 + Math.round(docs * 0.1);
  const penalties = (checklist.blocker || 0) * 16 + (checklist.warning || 0) * 6 + (audit.blockers || 0) * 12 + (audit.warnings || 0) * 4;
  return sectionScore(base - penalties, [
    "Clear labels",
    "Concise helper copy",
    "Clear hierarchy",
    "Next-step guidance",
    createEvidence(recommendation, "content")
  ], checklist, audit, "content");
}

function scoreLayout(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.layout ? checklistSummary.by_category.layout : {};
  const audit = auditSummary.by_category && auditSummary.by_category.layout ? auditSummary.by_category.layout : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 52 + (checklist.total || 0) * 3 + Math.round(docs * 0.1);
  const penalties = (checklist.blocker || 0) * 15 + (checklist.warning || 0) * 6 + (audit.blockers || 0) * 12 + (audit.warnings || 0) * 4;
  return sectionScore(base - penalties, [
    "Primary flow clarity",
    "Spacing rhythm",
    "Summary surfaces",
    createEvidence(recommendation, "layout")
  ], checklist, audit, "layout");
}

function scoreForms(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.forms ? checklistSummary.by_category.forms : {};
  const audit = auditSummary.by_category && auditSummary.by_category.forms ? auditSummary.by_category.forms : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 50 + (checklist.total || 0) * 3 + Math.round(docs * 0.08);
  const penalties = (checklist.blocker || 0) * 22 + (checklist.warning || 0) * 7 + (audit.blockers || 0) * 18 + (audit.warnings || 0) * 5;
  return sectionScore(base - penalties, [
    "Validation messages",
    "Required field clarity",
    "Destructive confirmation",
    "Recovery path",
    createEvidence(recommendation, "forms")
  ], checklist, audit, "forms");
}

function scoreDashboard(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.dashboard ? checklistSummary.by_category.dashboard : {};
  const audit = auditSummary.by_category && auditSummary.by_category.dashboard ? auditSummary.by_category.dashboard : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 48 + (checklist.total || 0) * 3 + Math.round(docs * 0.1);
  const penalties = (checklist.blocker || 0) * 18 + (checklist.warning || 0) * 8 + (audit.blockers || 0) * 14 + (audit.warnings || 0) * 5;
  return sectionScore(base - penalties, [
    "Empty dashboard state",
    "Readable tables and cards",
    "Filters/search state",
    "KPI clarity",
    createEvidence(recommendation, "dashboard")
  ], checklist, audit, "dashboard");
}

function scorePerformance(recommendation, designSystem, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.performance ? checklistSummary.by_category.performance : {};
  const audit = auditSummary.by_category && auditSummary.by_category.performance ? auditSummary.by_category.performance : {};
  const docs = scoreDocsCompleteness(docsStatus).score;
  const base = 56 + (checklist.total || 0) * 3 + Math.round(docs * 0.08);
  const penalties = (checklist.blocker || 0) * 14 + (checklist.warning || 0) * 5 + (audit.blockers || 0) * 12 + (audit.warnings || 0) * 4;
  const designHints = designSystem && Array.isArray(designSystem.motion_rules) ? designSystem.motion_rules : [];
  return sectionScore(base - penalties + Math.min(designHints.length, 3), [
    "Loading budget",
    "Deferred assets",
    "Reduced motion",
    createEvidence(recommendation, "performance")
  ], checklist, audit, "performance");
}

function scoreHandoff(recommendation, checklistSummary, auditSummary, docsStatus) {
  const checklist = checklistSummary.by_category && checklistSummary.by_category.handoff ? checklistSummary.by_category.handoff : {};
  const audit = auditSummary.by_category && auditSummary.by_category.handoff ? auditSummary.by_category.handoff : {};
  const docs = scoreDocsCompleteness(docsStatus);
  const base = 54 + (checklist.total || 0) * 3 + Math.round(docs.score * 0.25);
  const penalties = (checklist.blocker || 0) * 22 + (checklist.warning || 0) * 8 + (audit.blockers || 0) * 18 + (audit.warnings || 0) * 5 + (docs.blockers || []).length * 16;
  return sectionScore(base - penalties, [
    "Docs existence",
    "QA checklist",
    "Acceptance criteria",
    "Known limitations",
    createEvidence(recommendation, "handoff")
  ], checklist, audit, "handoff");
}

function sectionScore(baseScore, evidence, checklistCategory, auditCategory, category) {
  const blockers = [];
  const warnings = [];
  if ((checklistCategory.blocker || 0) > 0) blockers.push(`${capitalize(category)} checklist contains blockers.`);
  if ((auditCategory.blockers || 0) > 0) blockers.push(`${capitalize(category)} audit contains blockers.`);
  if ((checklistCategory.warning || 0) > 0) warnings.push(`${capitalize(category)} checklist has warnings.`);
  if ((auditCategory.warnings || 0) > 0) warnings.push(`${capitalize(category)} audit has warnings.`);
  return {
    score: clamp(Math.round(baseScore), 0, 100),
    blockers: uniqueStrings(blockers),
    warnings: uniqueStrings(warnings),
    evidence: uniqueStrings(evidence)
  };
}

function collectIssues(sectionScores, severity) {
  const issues = [];
  for (const section of SCORECARD_SECTIONS) {
    const entry = sectionScores[section] || {};
    const list = severity === "blocker" ? entry.blockers : entry.warnings;
    for (const item of list || []) {
      issues.push(`${section}: ${item}`);
    }
  }
  return uniqueStrings(issues);
}

function determineStatus(score, blockers, options = {}) {
  const strict = Boolean(options.strict);
  if (score < 40) return "blocked";
  if (blockers.length && strict) return "blocked";
  if (score >= 75 && !blockers.length) return "pass";
  if (score >= 60) return "warning";
  return strict ? "blocked" : "warning";
}

function nextActionForScorecard(score, blockers, warnings, docsStatus) {
  if (blockers.length) {
    return "Fix the blocking UI/UX gaps, then rerun the scorecard.";
  }
  if (score >= 75 && !warnings.length && (!docsStatus || docsStatus.ready !== false)) {
    return "Use this scorecard as a go/no-go UI readiness check.";
  }
  if (warnings.length) {
    return "Address the warnings, then confirm the handoff pack and gate status.";
  }
  return "Review the UI/UX readiness before handoff.";
}

function scoreSectionFromChecklist(section, categorySummary = {}) {
  const data = categorySummary[sectionToCategory(section)] || {};
  const base = 60 + (data.total || 0) * 5;
  const penalties = (data.blocker || 0) * 20 + (data.warning || 0) * 7;
  return clamp(Math.round(base - penalties), 0, 100);
}

function scoreSectionFromAudit(section, categorySummary = {}) {
  const data = categorySummary[sectionToCategory(section)] || {};
  const base = 65 + (data.total || 0) * 4;
  const penalties = (data.blockers || 0) * 18 + (data.warnings || 0) * 6;
  return clamp(Math.round(base - penalties), 0, 100);
}

function sectionToCategory(section) {
  return Object.keys(CATEGORY_TO_SECTION).find((category) => CATEGORY_TO_SECTION[category] === section) || "content";
}

function normalizeDocsStatus(docsStatus) {
  if (!docsStatus) {
    return {
      ready: false,
      docs_checked: [],
      missing_docs: [],
      target_docs: [],
      warnings: []
    };
  }
  if (Array.isArray(docsStatus)) {
    return {
      ready: docsStatus.length > 0,
      docs_checked: docsStatus,
      missing_docs: [],
      target_docs: docsStatus,
      warnings: []
    };
  }
  return {
    ready: docsStatus.ready !== false && (Array.isArray(docsStatus.missing_docs) ? docsStatus.missing_docs.length === 0 : true),
    docs_checked: uniqueStrings(docsStatus.docs_checked || docsStatus.target_docs || []),
    missing_docs: uniqueStrings(docsStatus.missing_docs || []),
    target_docs: uniqueStrings(docsStatus.target_docs || docsStatus.docs_checked || []),
    warnings: uniqueStrings(docsStatus.warnings || [])
  };
}

function resolveAudit(options, input) {
  if (options.audit && Array.isArray(options.audit.findings)) {
    return options.audit;
  }
  if (options.target) {
    return auditUiUxTarget(options.target, options);
  }
  if (options.text) {
    return auditTextContent(String(options.text || ""), options);
  }
  if (options.app && options.appDocsText) {
    return auditTextContent(String(options.appDocsText || ""), options);
  }
  if (options.strict && input) {
    return auditTextContent(String(input || ""), options);
  }
  return null;
}

function createEvidence(recommendation, facet) {
  const values = [];
  const product = recommendation && recommendation.detected_product_type ? recommendation.detected_product_type : "";
  const style = recommendation && recommendation.recommended_style ? recommendation.recommended_style : "";
  const palette = recommendation && recommendation.recommended_palette ? recommendation.recommended_palette : "";
  const typography = recommendation && recommendation.recommended_typography ? recommendation.recommended_typography : "";
  if (facet === "accessibility") values.push("focus states", "keyboard navigation", "contrast");
  if (facet === "responsive") values.push("mobile", "tablet", "desktop");
  if (facet === "interaction") values.push("loading", "empty", "error", "success");
  if (facet === "content") values.push("labels", "helper text", "next step");
  if (facet === "layout") values.push("primary flow", "grid", "spacing");
  if (facet === "forms") values.push("validation", "required fields", "recovery");
  if (facet === "dashboard") values.push("charts", "cards", "tables");
  if (facet === "performance") values.push("loading budget", "deferred assets", "motion");
  if (facet === "handoff") values.push("docs", "QA checklist", "acceptance criteria");
  if (product) values.push(`product:${product}`);
  if (style) values.push(`style:${style}`);
  if (palette) values.push(`palette:${palette}`);
  if (typography) values.push(`typography:${typography}`);
  return values;
}

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

module.exports = {
  SCORECARD_SECTIONS,
  buildUiUxScorecard,
  scoreChecklist,
  scoreAuditFindings,
  scoreDocsCompleteness,
  calculateUiUxReadinessScore,
  summarizeScorecard
};

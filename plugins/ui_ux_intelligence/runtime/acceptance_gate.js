const { buildUiUxScorecard } = require("./scorecard");
const { buildUiUxEvidenceManifest } = require("./evidence");
const { buildVisualQaContract } = require("./visual_qa");
const { generateDesignSystem } = require("./design_system");
const { generateComponentBlueprint } = require("./components");
const { generateScreenBlueprint } = require("./screens");
const { generateChecklist } = require("./checklist");
const { generateUiUxHandoffPack } = require("./handoff_pack");
const { recommendUiUx } = require("./recommender");

function buildUiUxAcceptanceGate(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || options.appSlug || "");
  const recommendation = options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation"
    ? options.recommendation
    : recommendUiUx(input, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(input, { ...options, recommendation });
  const componentBlueprint = options.componentBlueprint && options.componentBlueprint.report_type === "ui_ux_intelligence_component_blueprint"
    ? options.componentBlueprint
    : generateComponentBlueprint(input, { ...options, recommendation, designSystem });
  const screenBlueprint = options.screenBlueprint && options.screenBlueprint.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screenBlueprint
    : generateScreenBlueprint(input, { ...options, recommendation, components: componentBlueprint });
  const checklist = options.checklist && options.checklist.report_type === "ui_ux_intelligence_checklist"
    ? options.checklist
    : generateChecklist(input, { ...options, recommendation, designSystem });
  const scorecard = options.scorecard && options.scorecard.report_type === "ui_ux_intelligence_scorecard"
    ? options.scorecard
    : buildUiUxScorecard(input, { ...options, recommendation, designSystem, checklist });
  const evidence = options.evidenceManifest && options.evidenceManifest.report_type === "ui_ux_intelligence_evidence_manifest"
    ? options.evidenceManifest
    : buildUiUxEvidenceManifest(input, { ...options, app, stage: options.stage || "handoff" });
  const visualQa = options.visualQa && options.visualQa.report_type === "ui_ux_intelligence_visual_qa_contract"
    ? options.visualQa
    : buildVisualQaContract(input, { ...options, app, recommendation, screenBlueprint, checklist, evidenceManifest: evidence });
  const handoffPack = options.handoffPack && options.handoffPack.report_type === "ui_ux_intelligence_handoff_pack"
    ? options.handoffPack
    : generateUiUxHandoffPack(input, { ...options, app, recommendation, designSystem, componentBlueprint, screenBlueprint, checklist, scorecard });
  const docsStatus = options.docsStatus || {
    ready: Array.isArray(handoffPack.target_docs) && handoffPack.target_docs.length > 0,
    docs_checked: Array.isArray(handoffPack.target_docs) ? [...handoffPack.target_docs] : [],
    missing_docs: []
  };
  const criteria = buildAcceptanceCriteria({
    scorecard,
    evidence,
    visualQa,
    docsStatus,
    designSystem,
    componentBlueprint,
    screenBlueprint,
    checklist,
    handoffPack,
    strict: Boolean(options.strict)
  });
  const blockers = uniqueStrings(criteria.filter((item) => item.status === "blocked").map((item) => item.title));
  const warnings = uniqueStrings(criteria.filter((item) => item.status === "warning").map((item) => item.title));
  const status = determineAcceptanceStatus({ scorecard, evidence, visualQa, criteria, strict: Boolean(options.strict) });

  return {
    report_type: "ui_ux_intelligence_acceptance_gate",
    app: app || null,
    status,
    required: true,
    score: Number(scorecard.score || 0),
    grade: scorecard.grade || gradeFromScore(Number(scorecard.score || 0)),
    criteria,
    blockers,
    warnings,
    standalone: true,
    external_github_dependency: false,
    next_action: blockers.length
      ? "Resolve the acceptance blockers before UI/UX handoff."
      : warnings.length
        ? "Address the warnings before final handoff."
        : "Proceed with the UI/UX handoff."
  };
}

function evaluateScorecardForAcceptance(scorecard, options = {}) {
  const score = Number(scorecard && typeof scorecard.score === "number" ? scorecard.score : 0);
  const blockers = Array.isArray(scorecard && scorecard.blockers) ? scorecard.blockers : [];
  const warnings = Array.isArray(scorecard && scorecard.warnings) ? scorecard.warnings : [];
  const accessibilityScore = Number(scorecard && scorecard.sections && scorecard.sections.accessibility ? scorecard.sections.accessibility.score : 0);
  const responsiveScore = Number(scorecard && scorecard.sections && scorecard.sections.responsive ? scorecard.sections.responsive.score : 0);
  if (blockers.length) return { status: "blocked", reason: "Scorecard contains blocker findings." };
  if (options.strict && (accessibilityScore < 75 || responsiveScore < 75)) {
    return { status: "blocked", reason: "Strict mode requires accessibility and responsive coverage." };
  }
  if (options.strict && score < 75) return { status: "blocked", reason: "Strict mode requires a score of at least 75." };
  if (score < 60) return { status: "blocked", reason: "Score is below the minimum non-strict threshold." };
  if (score < 75 || warnings.length) return { status: "warning", reason: "Scorecard needs more evidence before acceptance." };
  return { status: "pass", reason: "Scorecard meets acceptance requirements." };
}

function evaluateEvidenceForAcceptance(evidence, visualQa, options = {}) {
  const provided = Array.isArray(evidence && evidence.evidence_items) ? evidence.evidence_items.filter((item) => item.status === "provided") : [];
  const evidenceStatus = visualQa && visualQa.evidence_status ? visualQa.evidence_status : { status: "warning", missing: [], provided: [] };
  const hasAccessibility = provided.some((item) => /focus|keyboard|accessibility|contrast|semantic/i.test([item.notes, item.path_or_url, item.related_state, item.related_component].filter(Boolean).join(" ")));
  const hasResponsive = provided.some((item) => /mobile|tablet|desktop/i.test([item.notes, item.path_or_url, item.related_state].filter(Boolean).join(" ")));
  const hasCriticalStates = evidenceStatus.missing.length === 0 || evidenceStatus.provided.length > 0;
  const status = options.strict
    ? (!provided.length || !hasAccessibility || !hasResponsive || !hasCriticalStates ? "blocked" : "pass")
    : (!provided.length ? "warning" : (hasAccessibility && hasResponsive && hasCriticalStates ? "pass" : "warning"));
  return {
    status,
    hasAccessibility,
    hasResponsive,
    hasCriticalStates,
    missing: uniqueStrings([
      ...(!provided.length ? ["evidence"] : []),
      ...(!hasAccessibility ? ["accessibility"] : []),
      ...(!hasResponsive ? ["responsive"] : []),
      ...(!hasCriticalStates ? ["critical_states"] : [])
    ])
  };
}

function evaluateDocsForAcceptance(docsStatus, options = {}) {
  const checked = Array.isArray(docsStatus && docsStatus.docs_checked) ? docsStatus.docs_checked : [];
  const missing = Array.isArray(docsStatus && docsStatus.missing_docs) ? docsStatus.missing_docs : [];
  const ready = Boolean(docsStatus && docsStatus.ready !== false && checked.length && !missing.length);
  const status = options.strict
    ? (ready ? "pass" : "blocked")
    : (ready ? "pass" : "warning");
  return { status, ready, checked, missing };
}

function summarizeAcceptanceGate(gate = {}) {
  return {
    status: gate.status || "warning",
    score: Number(gate.score || 0),
    grade: gate.grade || gradeFromScore(Number(gate.score || 0)),
    blockers: Array.isArray(gate.blockers) ? gate.blockers.length : 0,
    warnings: Array.isArray(gate.warnings) ? gate.warnings.length : 0
  };
}

function buildAcceptanceCriteria({ scorecard, evidence, visualQa, docsStatus, designSystem, componentBlueprint, screenBlueprint, checklist, handoffPack, strict }) {
  const scoreEval = evaluateScorecardForAcceptance(scorecard, { strict });
  const evidenceEval = evaluateEvidenceForAcceptance(evidence, visualQa, { strict });
  const docsEval = evaluateDocsForAcceptance(docsStatus, { strict });
  const criteria = [
    createCriteria("docs_exist", "UI/UX docs exist or are planned", docsEval.status, docsEval.checked.length ? docsEval.checked : docsEval.missing, docsEval.ready ? "Docs are available or fully planned." : "Create or complete the required UI/UX docs."),
    createCriteria("design_system_exists", "Design system exists", hasReport(designSystem) ? "pass" : (strict ? "blocked" : "warning"), [hasReport(designSystem) ? "design_system" : "missing_design_system"], hasReport(designSystem) ? "Design system is available." : "Generate the UI/UX design system."),
    createCriteria("component_blueprint_exists", "Component blueprint exists", hasReport(componentBlueprint) ? "pass" : (strict ? "blocked" : "warning"), [hasReport(componentBlueprint) ? "component_blueprint" : "missing_component_blueprint"], hasReport(componentBlueprint) ? "Component blueprint is available." : "Generate the component blueprint."),
    createCriteria("screen_blueprint_exists", "Screen blueprint exists", hasReport(screenBlueprint) ? "pass" : (strict ? "blocked" : "warning"), [hasReport(screenBlueprint) ? "screen_blueprint" : "missing_screen_blueprint"], hasReport(screenBlueprint) ? "Screen blueprint is available." : "Generate the screen blueprint."),
    createCriteria("checklist_score", "Checklist score acceptable", scoreEval.status, [`${scorecard.score || 0}`], scoreEval.reason || "Review the checklist score."),
    createCriteria("visual_qa_manifest", "Visual QA evidence manifest exists", evidenceEval.status, evidence && Array.isArray(evidence.evidence_items) ? evidence.evidence_items.map((item) => item.evidence_id) : ["missing_evidence_manifest"], evidenceEval.status === "pass" ? "Evidence manifest is available." : "Capture the QA evidence manifest."),
    createCriteria("accessibility_evidence", "Accessibility evidence included", evidenceEval.hasAccessibility ? "pass" : (strict ? "blocked" : "warning"), evidenceEval.hasAccessibility ? ["accessibility"] : ["missing_accessibility_evidence"], evidenceEval.hasAccessibility ? "Accessibility evidence is present." : "Add focus, keyboard, contrast, and semantic evidence."),
    createCriteria("responsive_evidence", "Responsive evidence included", evidenceEval.hasResponsive ? "pass" : (strict ? "blocked" : "warning"), evidenceEval.hasResponsive ? ["responsive"] : ["missing_responsive_evidence"], evidenceEval.hasResponsive ? "Responsive evidence is present." : "Add mobile, tablet, and desktop evidence."),
    createCriteria("critical_states", "Critical states covered", evidenceEval.hasCriticalStates ? "pass" : (strict ? "blocked" : "warning"), evidenceEval.hasCriticalStates ? ["critical_states"] : ["missing_critical_states"], evidenceEval.hasCriticalStates ? "Critical states are covered." : "Capture loading, empty, error, and success states as relevant."),
    createCriteria("anti_patterns_reviewed", "Anti-patterns reviewed", hasReport(checklist) ? "pass" : "warning", ["anti_patterns"], "Review the anti-pattern list against the implementation."),
    createCriteria("handoff_pack_available", "Handoff pack available", hasReport(handoffPack) ? "pass" : (strict ? "blocked" : "warning"), hasReport(handoffPack) ? ["handoff_pack"] : ["missing_handoff_pack"], hasReport(handoffPack) ? "Handoff pack is available." : "Generate the UI/UX handoff pack."),
    createCriteria("scorecard_blockers", "No blocker scorecard findings", Array.isArray(scorecard && scorecard.blockers) && scorecard.blockers.length ? "blocked" : "pass", Array.isArray(scorecard && scorecard.blockers) ? scorecard.blockers : [], Array.isArray(scorecard && scorecard.blockers) && scorecard.blockers.length ? "Resolve the scorecard blockers." : "Scorecard blocker findings are clear.")
  ];
  return criteria;
}

function determineAcceptanceStatus({ scorecard, evidence, visualQa, criteria, strict }) {
  const blockers = criteria.filter((item) => item.status === "blocked");
  const warnings = criteria.filter((item) => item.status === "warning");
  if (blockers.length) return "blocked";
  const score = Number(scorecard && typeof scorecard.score === "number" ? scorecard.score : 0);
  if (strict && score < 75) return "blocked";
  if (!strict && score < 60) return "blocked";
  if (strict && ((visualQa && visualQa.evidence_status && visualQa.evidence_status.missing.length) || (evidence && Array.isArray(evidence.evidence_items) && !evidence.evidence_items.length))) return "blocked";
  if (warnings.length || score < 75) return "warning";
  return "pass";
}

function createCriteria(criteriaId, title, status, evidence, nextAction) {
  return {
    criteria_id: criteriaId,
    title,
    status,
    evidence: uniqueStrings(Array.isArray(evidence) ? evidence : [evidence]),
    next_action: nextAction
  };
}

function hasReport(value) {
  return Boolean(value && typeof value === "object" && String(value.report_type || "").startsWith("ui_ux_intelligence_"));
}

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_/]+|[-_/]+$/g, "");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxAcceptanceGate,
  evaluateScorecardForAcceptance,
  evaluateEvidenceForAcceptance,
  evaluateDocsForAcceptance,
  summarizeAcceptanceGate
};

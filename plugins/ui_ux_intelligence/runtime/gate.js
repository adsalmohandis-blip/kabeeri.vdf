const { buildUiUxScorecard, summarizeScorecard } = require("./scorecard");

const VALID_STAGES = new Set(["ui_ux_design", "validation", "handoff", "publish_readiness"]);

function buildUiUxGate(input, options = {}) {
  const stage = normalizeStage(options.stage || "ui_ux_design");
  const scorecard = options.scorecard && options.scorecard.report_type === "ui_ux_intelligence_scorecard"
    ? options.scorecard
    : buildUiUxScorecard(input, options);
  const gate = evaluateUiUxStageGate(stage, scorecard, options);
  return {
    report_type: "ui_ux_intelligence_gate",
    gate: stage,
    status: gate.status,
    required: true,
    score: scorecard.score || 0,
    grade: scorecard.grade || "F",
    blockers: gate.blockers,
    warnings: gate.warnings,
    evidence: gate.evidence,
    standalone: true,
    external_github_dependency: false,
    next_action: gate.next_action
  };
}

function evaluateUiUxStageGate(stage, scorecard, options = {}) {
  const normalizedStage = normalizeStage(stage);
  if (!VALID_STAGES.has(normalizedStage)) {
    return gateResult("not_applicable", [], [], [], "Unknown UI/UX gate stage.");
  }
  const blockers = [...(scorecard && scorecard.blockers ? scorecard.blockers : [])];
  const warnings = [...(scorecard && scorecard.warnings ? scorecard.warnings : [])];
  const evidence = collectEvidence(scorecard, normalizedStage);

  if (normalizedStage === "ui_ux_design") {
    const critical = ["accessibility", "responsive", "content_and_tone", "layout"];
    const missingCritical = critical.filter((section) => (scorecard.sections && Number(scorecard.sections[section] && scorecard.sections[section].score) || 0) < 60);
    if (missingCritical.length) blockers.push(`UI/UX design readiness is missing: ${missingCritical.join(", ")}.`);
    return finalizeGate(normalizedStage, scorecard, blockers, warnings, evidence, "Complete the UI/UX design foundations before implementation.", options);
  }
  if (normalizedStage === "validation") {
    const missing = [];
    if ((scorecard.sections && Number(scorecard.sections.accessibility && scorecard.sections.accessibility.score) || 0) < 60) missing.push("accessibility");
    if ((scorecard.sections && Number(scorecard.sections.responsive && scorecard.sections.responsive.score) || 0) < 60) missing.push("responsive");
    if ((scorecard.sections && Number(scorecard.sections.interaction_states && scorecard.sections.interaction_states.score) || 0) < 60) missing.push("interaction states");
    if ((scorecard.sections && Number(scorecard.sections.forms && scorecard.sections.forms.score) || 0) < 50) missing.push("forms");
    if (missing.length) warnings.push(`Validation coverage is thin for: ${missing.join(", ")}.`);
    if (scorecard.score < 60) blockers.push("Overall UI/UX readiness is below validation threshold.");
    return finalizeGate(normalizedStage, scorecard, blockers, warnings, evidence, "Finish the missing UI/UX checks before validation.", options);
  }
  if (normalizedStage === "handoff") {
    const required = ["accessibility", "handoff"];
    const missing = required.filter((section) => (scorecard.sections && Number(scorecard.sections[section] && scorecard.sections[section].score) || 0) < 65);
    if (missing.length) blockers.push(`Handoff readiness is missing: ${missing.join(", ")}.`);
    if (scorecard.score < 70) warnings.push("Handoff readiness is not yet strong enough for smooth review.");
    return finalizeGate(normalizedStage, scorecard, blockers, warnings, evidence, "Complete the docs, QA checklist, and acceptance criteria before handoff.", options);
  }
  if (normalizedStage === "publish_readiness") {
    const strict = Boolean(options.strict);
    if (scorecard.score < 75) blockers.push("Publish readiness requires a score of at least 75.");
    if (scorecard.blockers && scorecard.blockers.length) blockers.push(...scorecard.blockers);
    if (strict && (scorecard.sections.accessibility.score < 60 || scorecard.sections.responsive.score < 60)) blockers.push("Strict publish readiness requires accessibility and responsive coverage.");
    return finalizeGate(normalizedStage, scorecard, blockers, warnings, evidence, "Raise the score to 75+, remove blockers, then publish.", options);
  }
  return gateResult("not_applicable", [], [], evidence, "No UI/UX gate result available.");
}

function evaluateUiUxHandoffGate(scorecard, options = {}) {
  return evaluateUiUxStageGate("handoff", scorecard, options);
}

function evaluateUiUxPublishReadinessGate(scorecard, options = {}) {
  return evaluateUiUxStageGate("publish_readiness", scorecard, options);
}

function finalizeGate(stage, scorecard, blockers, warnings, evidence, nextAction, options = {}) {
  const uniqueBlockers = uniqueStrings(blockers);
  const uniqueWarnings = uniqueStrings(warnings);
  let status = "pass";
  if (uniqueBlockers.length) status = (options.strict || (!options.force && stage === "publish_readiness")) ? "blocked" : "warning";
  else if (uniqueWarnings.length || (scorecard && scorecard.status === "warning")) status = "warning";
  return gateResult(status, uniqueBlockers, uniqueWarnings, evidence, nextAction);
}

function gateResult(status, blockers, warnings, evidence, nextAction) {
  return {
    status,
    blockers: uniqueStrings(blockers),
    warnings: uniqueStrings(warnings),
    evidence: uniqueStrings(evidence),
    next_action: nextAction || ""
  };
}

function collectEvidence(scorecard, stage) {
  const evidence = [];
  const sections = scorecard && scorecard.sections ? scorecard.sections : {};
  for (const [name, data] of Object.entries(sections)) {
    if (data && Number(data.score || 0) > 0) evidence.push(`${name}:${data.score}`);
  }
  if (stage === "publish_readiness") evidence.push("score>=75");
  return uniqueStrings(evidence);
}

function normalizeStage(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxGate,
  evaluateUiUxStageGate,
  evaluateUiUxHandoffGate,
  evaluateUiUxPublishReadinessGate
};

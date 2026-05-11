const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists } = require("../fs_utils");
const { table } = require("../ui");

function deliveryMode(action, value, flags = {}, rest = [], deps = {}) {
  const appendAudit = deps.appendAudit || (() => {});
  const getEffectiveActor = deps.getEffectiveActor || (() => "local-cli");
  const verb = String(action || "recommend").toLowerCase();
  const known = new Set(["recommend", "advise", "advisor", "choose", "select", "decision", "history", "list", "show"]);
  const effective = known.has(verb) ? verb : "recommend";
  const description = flags.text || flags.description || flags.app || flags.project || (known.has(verb) ? [value, ...rest].filter(Boolean).join(" ") : [action, value, ...rest].filter(Boolean).join(" "));

  if (effective === "history" || effective === "list") {
    ensureWorkspace();
    const data = readDeliveryDecisionState();
    console.log(table(["ID", "Recommended", "Confidence", "Chosen", "Created"], (data.recommendations || []).map((item) => [item.recommendation_id, item.recommended_mode, item.confidence, item.chosen_mode || "", item.created_at])));
    return;
  }

  if (effective === "show") {
    ensureWorkspace();
    const data = readDeliveryDecisionState();
    const id = value || flags.id;
    const found = (data.recommendations || []).find((item) => item.recommendation_id === id);
    if (!found) throw new Error(`Delivery recommendation not found: ${id || ""}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (effective === "choose" || effective === "select" || effective === "decision") {
    ensureWorkspace();
    const mode = normalizeDeliveryMode(flags.mode || value || "structured");
    const data = readDeliveryDecisionState();
    const recommendationId = flags.recommendation || flags.id || null;
    const recommendation = recommendationId ? (data.recommendations || []).find((item) => item.recommendation_id === recommendationId) : null;
    const decision = {
      decision_id: `delivery-decision-${String((data.decisions || []).length + 1).padStart(3, "0")}`,
      recommendation_id: recommendationId,
      chosen_mode: mode,
      recommended_mode: recommendation ? recommendation.recommended_mode : null,
      reason: flags.reason || "",
      actor: getEffectiveActor(flags) || "local-cli",
      decided_at: new Date().toISOString()
    };
    data.decisions = data.decisions || [];
    data.decisions.push(decision);
    data.current_mode = mode;
    if (recommendation) {
      recommendation.chosen_mode = mode;
      recommendation.decision_id = decision.decision_id;
    }
    writeJsonFile(".kabeeri/delivery_decisions.json", data);
    updateProjectDeliveryMode(mode);
    appendAudit("delivery.mode_selected", "delivery", decision.decision_id, `Delivery mode selected: ${mode}`);
    console.log(JSON.stringify(decision, null, 2));
    return;
  }

  if (!description) throw new Error("Missing project/application description for delivery recommendation.");
  const recommendation = buildDeliveryModeRecommendation(description, flags);
  if (fileExists(".kabeeri")) {
    const data = readDeliveryDecisionState();
    data.recommendations = data.recommendations || [];
    data.recommendations.push(recommendation);
    writeJsonFile(".kabeeri/delivery_decisions.json", data);
    appendAudit("delivery.mode_recommended", "delivery", recommendation.recommendation_id, `Delivery mode recommended: ${recommendation.recommended_mode}`);
  }
  if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
  else console.log(renderDeliveryModeRecommendation(recommendation));
}

function readDeliveryDecisionState() {
  if (!fileExists(".kabeeri/delivery_decisions.json")) writeJsonFile(".kabeeri/delivery_decisions.json", { recommendations: [], decisions: [], current_mode: null });
  const data = readJsonFile(".kabeeri/delivery_decisions.json");
  data.recommendations = data.recommendations || [];
  data.decisions = data.decisions || [];
  return data;
}

function buildDeliveryModeRecommendation(description, flags = {}) {
  const text = String(description || "").toLowerCase();
  const signals = [];
  let structuredScore = 0;
  let agileScore = 0;
  const add = (mode, weight, signal, evidence) => {
    if (mode === "structured") structuredScore += weight;
    else agileScore += weight;
    signals.push({ mode, weight, signal, evidence });
  };
  const match = (pattern) => pattern.test(text);
  if (match(/health|medical|hospital|clinic|finance|bank|payment|government|gov|insurance|erp|enterprise|multi-tenant|tenant|compliance|regulatory|audit|security|sso|roles|permissions|marketplace|large|complex|migration|integration|integrations|known scope|fixed scope|waterfall|structured|Ù…Ø³ØªØ´ÙÙ‰|Ø·Ø¨ÙŠ|ØµØ­ÙŠ|Ø¨Ù†Ùƒ|Ù…Ø§Ù„ÙŠ|Ø­ÙƒÙˆÙ…ÙŠ|Ø§Ù…ØªØ«Ø§Ù„|ØªØ¯Ù‚ÙŠÙ‚|Ø£Ù…Ø§Ù†|ØµÙ„Ø§Ø­ÙŠØ§Øª|Ù…ØªØ¹Ø¯Ø¯|ÙƒØ¨ÙŠØ±|Ù…Ø¹Ù‚Ø¯|Ù†Ø·Ø§Ù‚ Ø«Ø§Ø¨Øª|Ù…ØªØ¬Ø± ÙƒØ¨ÙŠØ±/)) add("structured", 4, "complex_or_compliance_scope", "Large, regulated, integrated, or fixed-scope wording was detected.");
  if (match(/exact|clear requirements|complete spec|documentation|upfront|phase|milestone|handoff|client approval|Ø§Ø¹ØªÙ…Ø§Ø¯|Ù…ØªØ·Ù„Ø¨Ø§Øª ÙˆØ§Ø¶Ø­Ø©|ØªÙˆØ«ÙŠÙ‚|Ù…Ø±Ø§Ø­Ù„|Ø…Ø±Ø­Ù„Ø©|ØªØ³Ù„ÙŠÙ…|Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ø¹Ù…ÙŠÙ„/)) add("structured", 3, "upfront_planning_needed", "The request suggests approved documentation, phases, or formal handoff.");
  if (match(/mvp|prototype|startup|experiment|validate|feedback|iterate|pivot|quick|fast|2 weeks|4 weeks|social|fitness|landing|simple|dashboard|uncertain|idea|rough|agile|sprint|ØªØ¬Ø±Ø¨Ø©|Ù†Ø§Ø´Ø¦|ÙÙƒØ±Ø©|ØºÙŠØ± ÙˆØ§Ø¶Ø­|ØªØºØ°ÙŠØ© Ø±Ø§Ø¬Ø¹Ø©|Ø³Ø±ÙŠØ¹|Ø¨Ø±ÙˆØªÙˆØªØ§ÙŠØ¨|ØªØ·Ø¨ÙŠÙ‚ Ø¨Ø³ÙŠØ·|Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ø¨Ø³ÙŠØ·/)) add("agile", 4, "learning_or_mvp_scope", "The request suggests uncertainty, MVP speed, feedback, or iteration.");
  if (match(/limited budget|small team|solo|founder|learn|users will tell|budget-conscious|Ù…ÙŠØ²Ø§Ù†ÙŠØ© Ù…Ø­Ø¯ÙˆØ¯Ø©|ÙØ±ÙŠÙ‚ ØµØºÙŠØ±|Ù…Ø·ÙˆØ± ÙˆØ§Ø­Ø¯|Ù†ØªØ¹Ù„Ù…|Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†/)) add("agile", 2, "budget_or_small_team", "The request suggests smaller increments and budget-conscious delivery.");
  if (flags.compliance || flags.enterprise) add("structured", 4, "explicit_flag", "Compliance or enterprise flag was provided.");
  if (flags.mvp || flags.experimental) add("agile", 4, "explicit_flag", "MVP or experimental flag was provided.");
  if (!signals.length) {
    add("structured", 1, "safe_default", "When unclear, Structured is safer for complete planning.");
    add("agile", 1, "possible_if_uncertain", "Agile remains viable if discovery and feedback are more important.");
  }
  const recommendedMode = structuredScore >= agileScore ? "structured" : "agile";
  const total = structuredScore + agileScore || 1;
  const margin = Math.abs(structuredScore - agileScore);
  const confidence = margin >= 4 ? "high" : margin >= 2 ? "medium" : "low";
  return {
    recommendation_id: `delivery-recommendation-${Date.now()}`,
    created_at: new Date().toISOString(),
    description,
    recommended_mode: recommendedMode,
    confidence,
    scores: {
      structured: structuredScore,
      agile: agileScore,
      structured_percent: Math.round((structuredScore / total) * 100),
      agile_percent: Math.round((agileScore / total) * 100)
    },
    signals,
    rationale: recommendedMode === "structured" ? "Structured is recommended because the app appears to benefit from approved requirements, phase gates, traceability, and controlled changes." : "Agile is recommended because the app appears to benefit from fast iteration, feedback, smaller stories, and learning before full scope commitment.",
    developer_decision_required: true,
    next_actions: recommendedMode === "structured" ? ["Run `kvdf delivery choose structured` if the developer agrees.", "Create approved requirements with `kvdf structured requirement add`.", "Plan phases and gates before implementation."] : ["Run `kvdf delivery choose agile` if the developer agrees.", "Create epics/stories with `kvdf agile story create`.", "Plan the first sprint after Definition of Ready is satisfied."]
  };
}

function renderDeliveryModeRecommendation(recommendation) {
  const lines = ["# Kabeeri Delivery Mode Recommendation", "", `Recommended mode: ${recommendation.recommended_mode}`, `Confidence: ${recommendation.confidence}`, `Structured score: ${recommendation.scores.structured}`, `Agile score: ${recommendation.scores.agile}`, "", "## Rationale", "", recommendation.rationale, "", "## Signals", ""];
  for (const signal of recommendation.signals) lines.push(`- ${signal.mode}: ${signal.signal} (${signal.weight}) - ${signal.evidence}`);
  lines.push("", "## Developer Decision", "", "The developer/Owner still chooses the final mode. This recommendation is advisory.", "", "## Next Actions", "");
  for (const action of recommendation.next_actions) lines.push(`- ${action}`);
  return `${lines.join("\n")}\n`;
}

function normalizeDeliveryMode(mode) {
  const normalized = String(mode || "").toLowerCase();
  if (["structured", "waterfall"].includes(normalized)) return "structured";
  if (["agile", "scrum"].includes(normalized)) return "agile";
  throw new Error("Invalid delivery mode. Use structured or agile.");
}

function updateProjectDeliveryMode(mode) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  project.delivery_mode = mode;
  project.delivery_mode_updated_at = new Date().toISOString();
  writeJsonFile(".kabeeri/project.json", project);
}

module.exports = {
  deliveryMode,
  buildDeliveryModeRecommendation
};

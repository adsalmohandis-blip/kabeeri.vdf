const fs = require("fs");
const path = require("path");

const EVIDENCE_TYPES = ["screenshot", "video", "doc", "test_report", "storybook", "figma", "url", "manual_note", "other"];
const EVIDENCE_STAGES = ["ui_ux_design", "implementation", "validation", "handoff", "publish_readiness"];
const EVIDENCE_STATES = ["default", "loading", "empty", "error", "success", "disabled", "focused", "hover", "mobile", "tablet", "desktop", "other"];

function buildUiUxEvidenceManifest(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || options.appSlug || "");
  const evidenceValues = splitCsv(options.evidence || options.evidence_paths || options.evidencePaths || options.files || options.paths || "");
  const screens = splitCsv(options.screens || options.related_screens || options.relatedScreens || "");
  const states = splitCsv(options.states || options.related_states || options.relatedStates || "");
  const stage = normalizeStage(options.stage || options.phase || "validation");
  const strict = Boolean(options.strict);
  const evidence_items = evidenceValues.length
    ? evidenceValues.map((item, index) => normalizeEvidenceItem(item, {
      app,
      stage,
      strict,
      relatedScreen: screens[index] || screens[screens.length - 1] || inferScreenFromPath(item),
      relatedState: states[index] || states[states.length - 1] || inferStateFromPath(item)
    }))
    : [];
  const summary = summarizeEvidenceManifest({ evidence_items }, { app, stage, strict });
  return {
    report_type: "ui_ux_intelligence_evidence_manifest",
    app: app || null,
    input: String(input || ""),
    evidence_items,
    summary,
    warnings: buildEvidenceWarnings(evidence_items, strict),
    standalone: true,
    external_github_dependency: false,
    next_action: summary.missing_recommended_evidence.length ? "Provide the missing evidence before handoff." : "Attach the evidence manifest to the review or handoff gate."
  };
}

function normalizeEvidenceItem(item, options = {}) {
  const raw = String(item || "").trim();
  const stage = normalizeStage(options.stage || "validation");
  const pathOrUrl = raw;
  const exists = pathOrUrl ? fs.existsSync(path.resolve(pathOrUrl)) : false;
  const type = classifyEvidencePath(pathOrUrl, options);
  const relatedScreen = sanitizeToken(options.relatedScreen || inferScreenFromPath(pathOrUrl));
  const relatedComponent = sanitizeToken(options.relatedComponent || inferComponentFromPath(pathOrUrl));
  const relatedState = normalizeState(options.relatedState || inferStateFromPath(pathOrUrl));
  return {
    evidence_id: buildEvidenceId(pathOrUrl, relatedScreen, relatedState),
    type,
    path_or_url: pathOrUrl,
    related_screen: relatedScreen || null,
    related_component: relatedComponent || null,
    related_state: relatedState,
    stage,
    status: exists ? "provided" : (options.strict ? "missing" : "needs_review"),
    notes: buildEvidenceNotes(pathOrUrl, type, exists, options)
  };
}

function classifyEvidencePath(pathValue, options = {}) {
  const value = String(pathValue || "").trim().toLowerCase();
  if (!value) return "other";
  if (/^https?:\/\//.test(value)) {
    if (value.includes("figma")) return "figma";
    if (value.includes("storybook")) return "storybook";
    return "url";
  }
  if (/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(value)) return "screenshot";
  if (/\.(mp4|mov|webm|mkv)$/i.test(value)) return "video";
  if (/\.(md|markdown|txt|docx?|pdf)$/i.test(value)) return "doc";
  if (/\.(json|xml|yml|yaml|csv|log)$/i.test(value)) return "test_report";
  if (value.includes("storybook")) return "storybook";
  if (value.includes("figma")) return "figma";
  if (value.includes("note") || value.includes("manual")) return "manual_note";
  return EVIDENCE_TYPES.includes(value) ? value : "other";
}

function summarizeEvidenceManifest(manifest = {}, options = {}) {
  const items = Array.isArray(manifest.evidence_items) ? manifest.evidence_items : [];
  const screensCovered = new Set();
  const statesCovered = new Set();
  const docsCovered = new Set();
  const missingRecommendedEvidence = [];

  for (const item of items) {
    if (item.related_screen) screensCovered.add(item.related_screen);
    if (item.related_state) statesCovered.add(item.related_state);
    if (["doc", "test_report", "storybook", "figma", "url"].includes(item.type)) docsCovered.add(item.path_or_url);
  }

  const requiredScreens = splitCsv(options.requiredScreens || options.screens || "");
  const requiredStates = splitCsv(options.requiredStates || options.states || "");
  const defaultMissing = buildDefaultMissingEvidence(requiredScreens, requiredStates, items);
  missingRecommendedEvidence.push(...defaultMissing);
  if (!items.length) {
    missingRecommendedEvidence.push("screen_default_state", "loading_state", "mobile_view", "desktop_view", "accessibility_focus_evidence");
  }

  return {
    total: items.length,
    screens_covered: screensCovered.size,
    states_covered: statesCovered.size,
    docs_covered: docsCovered.size,
    missing_recommended_evidence: uniqueStrings(missingRecommendedEvidence)
  };
}

function renderEvidenceMarkdown(manifest, options = {}) {
  const lines = [
    "# UI/UX Evidence Manifest",
    "",
    `- App: ${manifest.app || "n/a"}`,
    `- Input: ${manifest.input || ""}`,
    `- Total evidence items: ${manifest.summary ? manifest.summary.total : 0}`,
    `- Screens covered: ${manifest.summary ? manifest.summary.screens_covered : 0}`,
    `- States covered: ${manifest.summary ? manifest.summary.states_covered : 0}`,
    `- Docs covered: ${manifest.summary ? manifest.summary.docs_covered : 0}`,
    `- Next action: ${manifest.next_action || "Attach the evidence manifest to the review or handoff gate."}`,
    "",
    "## Evidence Items",
    ...(Array.isArray(manifest.evidence_items) && manifest.evidence_items.length
      ? manifest.evidence_items.map((item) => [
        `### ${item.evidence_id}`,
        `- Type: ${item.type}`,
        `- Path/URL: ${item.path_or_url}`,
        `- Screen: ${item.related_screen || "n/a"}`,
        `- Component: ${item.related_component || "n/a"}`,
        `- State: ${item.related_state || "n/a"}`,
        `- Stage: ${item.stage}`,
        `- Status: ${item.status}`,
        `- Notes: ${item.notes || "n/a"}`,
        ""
      ]).flat()
      : ["- None"])
  ];
  return lines.join("\n").trimEnd() + "\n";
}

function buildDefaultMissingEvidence(requiredScreens, requiredStates, items) {
  const existingScreens = new Set(items.map((item) => item.related_screen).filter(Boolean));
  const existingStates = new Set(items.map((item) => item.related_state).filter(Boolean));
  const missing = [];
  for (const screen of requiredScreens) {
    if (!existingScreens.has(screen)) missing.push(`screen:${screen}`);
  }
  for (const state of requiredStates) {
    if (!existingStates.has(state)) missing.push(`state:${state}`);
  }
  if (!existingStates.has("mobile")) missing.push("mobile_view");
  if (!existingStates.has("desktop")) missing.push("desktop_view");
  return missing;
}

function buildEvidenceWarnings(items, strict) {
  const warnings = [];
  if (!items.length) warnings.push("No evidence items were provided.");
  if (strict && items.some((item) => item.status !== "provided")) warnings.push("Strict mode expects every referenced evidence item to exist.");
  return uniqueStrings(warnings);
}

function buildEvidenceId(pathOrUrl, screen, state) {
  const base = String(pathOrUrl || screen || state || "evidence").trim().toLowerCase();
  return base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^[-]+|[-]+$/g, "") || "evidence";
}

function buildEvidenceNotes(pathOrUrl, type, exists, options = {}) {
  const notes = [];
  if (exists) notes.push("Evidence file exists locally.");
  else notes.push(options.strict ? "Evidence file is missing in strict mode." : "Evidence file was referenced but not found locally.");
  if (type === "screenshot") notes.push("Metadata-only screenshot evidence accepted; no pixel inspection performed.");
  if (/^https?:\/\//.test(String(pathOrUrl || ""))) notes.push("URL evidence is recorded as metadata only.");
  return notes.join(" ");
}

function inferScreenFromPath(value) {
  const text = sanitizeToken(path.basename(String(value || "").replace(/\.[^.]+$/, "")));
  return text || "";
}

function inferComponentFromPath(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("booking")) return "booking_calendar";
  if (text.includes("checkout")) return "checkout_summary";
  if (text.includes("error")) return "state_feedback";
  if (text.includes("home")) return "layout_shell";
  return "";
}

function inferStateFromPath(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("loading")) return "loading";
  if (text.includes("empty")) return "empty";
  if (text.includes("error")) return "error";
  if (text.includes("success") || text.includes("confirm")) return "success";
  if (text.includes("mobile")) return "mobile";
  if (text.includes("tablet")) return "tablet";
  if (text.includes("desktop")) return "desktop";
  if (text.includes("focus")) return "focused";
  return "default";
}

function normalizeStage(value) {
  const stage = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "_");
  return EVIDENCE_STAGES.includes(stage) ? stage : "validation";
}

function normalizeState(value) {
  const state = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "_");
  return EVIDENCE_STATES.includes(state) ? state : "other";
}

function sanitizeToken(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9-_/]+/g, "-").replace(/-+/g, "-").replace(/^[-_/]+|[-_/]+$/g, "");
}

function normalizeAppSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_/]+|[-_/]+$/g, "");
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  buildUiUxEvidenceManifest,
  normalizeEvidenceItem,
  classifyEvidencePath,
  summarizeEvidenceManifest,
  renderEvidenceMarkdown
};

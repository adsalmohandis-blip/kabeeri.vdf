const fs = require("fs");
const path = require("path");
const { generateDesignTokens } = require("./tokens");
const { generateComponentBlueprint } = require("./components");
const { generateScreenBlueprint } = require("./screens");
const { generateChecklist } = require("./checklist");
const { buildUiUxScorecard } = require("./scorecard");
const { recommendUiUx } = require("./recommender");
const { generateDesignSystem } = require("./design_system");

function generateUiUxHandoffPack(input, options = {}) {
  const app = normalizeAppSlug(options.app || options.app_slug || "");
  const recommendation = options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation"
    ? options.recommendation
    : recommendUiUx(input, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(input, { ...options, recommendation });
  const tokens = options.tokens && options.tokens.report_type === "ui_ux_intelligence_tokens"
    ? options.tokens
    : generateDesignTokens(input, { ...options, recommendation, designSystem });
  const components = options.components && options.components.report_type === "ui_ux_intelligence_component_blueprint"
    ? options.components
    : generateComponentBlueprint(input, { ...options, recommendation, designSystem });
  const screens = options.screens && options.screens.report_type === "ui_ux_intelligence_screen_blueprint"
    ? options.screens
    : generateScreenBlueprint(input, { ...options, recommendation, components });
  const checklist = options.checklist && options.checklist.report_type === "ui_ux_intelligence_checklist"
    ? options.checklist
    : generateChecklist(input, { ...options, recommendation, designSystem });
  const scorecard = options.scorecard && options.scorecard.report_type === "ui_ux_intelligence_scorecard"
    ? options.scorecard
    : buildUiUxScorecard(input, { ...options, recommendation, designSystem, checklist });
  const targetDocs = mapHandoffToViberDocs({ tokens, components, screens, checklist, scorecard }, app);
  const markdownSections = buildMarkdownSections({ input, app, recommendation, designSystem, tokens, components, screens, checklist, scorecard, targetDocs });
  const handoffStatus = determineHandoffStatus(scorecard, checklist);
  return {
    report_type: "ui_ux_intelligence_handoff_pack",
    input: String(input || ""),
    app: app || null,
    recommendation,
    design_system: designSystem,
    tokens,
    components,
    screens,
    checklist,
    scorecard,
    target_docs: targetDocs,
    markdown_sections: markdownSections,
    handoff_status: handoffStatus,
    warnings: uniqueStrings([...(scorecard.warnings || []), ...(checklist.warnings || [])]),
    blockers: uniqueStrings([...(scorecard.blockers || [])]),
    standalone: true,
    external_github_dependency: false,
    next_action: "Review handoff pack, then merge sections into Viber UI/UX docs."
  };
}

function buildHandoffMarkdown(pack, options = {}) {
  const sections = Array.isArray(pack.markdown_sections) ? pack.markdown_sections : [];
  const parts = [
    `# UI/UX Handoff Pack`,
    "",
    `- App: ${pack.app || "n/a"}`,
    `- Status: ${pack.handoff_status || "warning"}`,
    `- Score: ${pack.scorecard && typeof pack.scorecard.score === "number" ? pack.scorecard.score : 0} (${pack.scorecard && pack.scorecard.grade ? pack.scorecard.grade : "F"})`,
    "",
    ...sections.map((section) => [
      `## ${section.section_title}`,
      "",
      section.content.trim(),
      ""
    ]).flat()
  ];
  return parts.join("\n").trim() + "\n";
}

function mapHandoffToViberDocs(pack, appSlug) {
  return [
    "docs/ui-ux/UI_UX_DESIGN.md",
    "docs/ui-ux/UX_PRINCIPLES.md",
    "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
    "docs/ui-ux/USER_FLOWS.md",
    "docs/ui-ux/WIREFRAMES.md",
    "docs/ui-ux/UI_SPECIFICATION.md",
    "docs/ui-ux/ACCESSIBILITY.md",
    "docs/delivery/QA_CHECKLIST.md"
  ];
}

function buildMarkdownSections(pack) {
  const scorecard = pack.scorecard || {};
  const tokens = pack.tokens || {};
  const components = pack.components || {};
  const screens = pack.screens || {};
  const checklist = pack.checklist || {};
  return [
    section("docs/ui-ux/UI_UX_DESIGN.md", "UI / UX Design", `# UI / UX Design\n\n- App: ${pack.app || "n/a"}\n- Style: ${pack.recommendation && pack.recommendation.recommended_style ? pack.recommendation.recommended_style : "n/a"}\n- Palette: ${pack.recommendation && pack.recommendation.recommended_palette ? pack.recommendation.recommended_palette : "n/a"}\n- Typography: ${pack.recommendation && pack.recommendation.recommended_typography ? pack.recommendation.recommended_typography : "n/a"}\n\n## Design Tokens\n- Primary color: ${tokens.tokens && tokens.tokens.color ? tokens.tokens.color.primary : "#1d4ed8"}\n- Heading font: ${tokens.tokens && tokens.tokens.typography ? tokens.tokens.typography.heading_font : "Inter"}\n- Body font: ${tokens.tokens && tokens.tokens.typography ? tokens.tokens.typography.body_font : "Inter"}`, "ui_ux_intelligence", "ui_ux_design", "Use the tokens and design system when materializing Viber docs."),
    section("docs/ui-ux/UX_PRINCIPLES.md", "UX Principles", formatListSection("Principles", pack.recommendation && Array.isArray(pack.recommendation.ux_rules) ? pack.recommendation.ux_rules : checklist.checklist ? checklist.checklist.map((item) => item.title).slice(0, 5) : []), "ui_ux_intelligence", "ui_ux_design", "Carry the guidance into the principles doc."),
    section("docs/ui-ux/INFORMATION_ARCHITECTURE.md", "Information Architecture", formatListSection("Screens", Array.isArray(screens.screens) ? screens.screens.map((screen) => `${screen.name} (${screen.route_hint})`) : []), "ui_ux_intelligence", "ui_ux_design", "Merge the screen map into IA."),
    section("docs/ui-ux/USER_FLOWS.md", "User Flows", formatListSection("Flows", Array.isArray(screens.user_flow_summary) ? screens.user_flow_summary : []), "ui_ux_intelligence", "ui_ux_design", "Use the flow summary to annotate the user journeys."),
    section("docs/ui-ux/WIREFRAMES.md", "Wireframes", formatListSection("Components", Array.isArray(components.components) ? components.components.map((component) => `${component.name} - ${component.purpose}`) : []), "ui_ux_intelligence", "ui_ux_design", "Turn component guidance into wireframe blocks."),
    section("docs/ui-ux/UI_SPECIFICATION.md", "UI Specification", `# UI Specification\n\n## Tokens\n${stringifyObject(tokens.tokens || {})}\n\n## Components\n${stringifyObject(components.components || [])}`, "ui_ux_intelligence", "ui_ux_design", "Use the specs as the implementation contract."),
    section("docs/ui-ux/ACCESSIBILITY.md", "Accessibility", formatListSection("Accessibility Notes", checklist.checklist ? checklist.checklist.filter((item) => item.category === "accessibility" || item.category === "motion").map((item) => `${item.title} - ${item.evidence_hint}`) : []), "ui_ux_intelligence", "validation", "Use the accessibility notes in the accessibility doc."),
    section("docs/delivery/QA_CHECKLIST.md", "QA Checklist", formatListSection("QA Checks", checklist.checklist ? checklist.checklist.map((item) => item.title) : []), "ui_ux_intelligence", "validation", "Use the checklist to drive QA and handoff.")
  ];
}

function section(targetDoc, sectionTitle, content, source, stage, nextAction) {
  return {
    target_doc: targetDoc,
    section_title: sectionTitle,
    content,
    source,
    applies_to_stage: stage,
    next_action: nextAction
  };
}

function formatListSection(title, items) {
  return `## ${title}\n\n${Array.isArray(items) && items.length ? items.map((item) => `- ${item}`).join("\n") : "- None"}`;
}

function stringifyObject(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${typeof item === "object" ? JSON.stringify(item) : String(item)}`).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => `- ${key}: ${typeof item === "object" ? JSON.stringify(item) : String(item)}`).join("\n");
  }
  return String(value || "");
}

function determineHandoffStatus(scorecard, checklist) {
  if ((scorecard.blockers && scorecard.blockers.length) || (checklist.summary && checklist.summary.blockers > 0)) {
    return "blocked";
  }
  if ((scorecard.warnings && scorecard.warnings.length) || (checklist.summary && checklist.summary.warnings > 0)) {
    return "warning";
  }
  return scorecard.score >= 75 ? "pass" : "warning";
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
  generateUiUxHandoffPack,
  buildHandoffMarkdown,
  mapHandoffToViberDocs
};

const { renderMermaidDiagram } = require("./mermaid_renderer");
const { renderPlanningBoard } = require("./board_renderer");
const { renderScopeMap } = require("./scope_map_renderer");

function renderMarkdownVisualReport(visual = {}) {
  const title = buildTitle(visual);
  const goal = visual.goal || (visual.recommended_evolution && visual.recommended_evolution.title) || "Planner Visual Model";
  const lines = [
    `# ${title}`,
    "",
    `- Track: ${visual.track || ""}`,
    `- Delivery mode: ${visual.delivery_mode || ""}`,
    `- Proposed Evolution: ${goal}`,
    "",
    "## Mermaid Graph",
    "",
    renderMermaidDiagram(visual),
    "",
    renderPlanningBoard(visual),
    "",
    renderScopeMap(visual),
    "",
    "## Validation Commands",
    ...(Array.isArray(visual.validation_commands) && visual.validation_commands.length ? visual.validation_commands.map((command) => `- ${command}`) : ["- node bin/kvdf.js validate", "- npm test", "- npm run check"]),
    "",
    `## Stop Condition`,
    "",
    visual.stop_condition || ""
  ];
  return lines.join("\n").trimEnd();
}

function buildPlannerVisualRenderArtifact(visual = {}, options = {}) {
  const pluginId = options.pluginId || "planner-visual";
  const renderedMarkdown = renderMarkdownVisualReport(visual);
  return {
    report_type: "planner_visual_plugin_render",
    plugin_id: pluginId,
    renderer: "mermaid_text",
    source_visual_report_type: visual.report_type || null,
    generated_at: new Date().toISOString(),
    rendered_markdown: renderedMarkdown
  };
}

function buildTitle(visual = {}) {
  const mode = String(visual.planner_mode || "owner").toLowerCase();
  if (mode === "vibe") return "KVDF Planner Visual Model - Vibe";
  if (mode === "plugin") return "KVDF Planner Visual Model - Plugin";
  return "KVDF Planner Visual Model - Owner";
}

module.exports = {
  renderMermaidDiagram,
  renderPlanningBoard,
  renderScopeMap,
  renderMarkdownVisualReport,
  buildPlannerVisualRenderArtifact
};

function renderMermaidDiagram(visual = {}) {
  const diagram = visual.graph && visual.graph.diagram ? String(visual.graph.diagram) : "flowchart TD\n  Start[Start] --> Stop[Stop]";
  return [
    "```mermaid",
    diagram,
    "```"
  ].join("\n");
}

module.exports = {
  renderMermaidDiagram
};

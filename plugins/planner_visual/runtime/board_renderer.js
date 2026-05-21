function renderPlanningBoard(visual = {}) {
  const columns = visual.board && Array.isArray(visual.board.columns) ? visual.board.columns : [];
  const lines = ["## Planning Board", ""];
  for (const column of columns) {
    lines.push(`### ${String(column.title || column.id || "Column")}`);
    const cards = Array.isArray(column.cards) ? column.cards : [];
    if (!cards.length) {
      lines.push("- None");
      lines.push("");
      continue;
    }
    for (const card of cards) {
      const label = card.type === "task" ? `Task ${card.id}` : card.id || "card";
      const title = card.title || "";
      const status = card.status ? ` (${card.status})` : "";
      lines.push(`- ${label}: ${title}${status}`.trim());
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

module.exports = {
  renderPlanningBoard
};

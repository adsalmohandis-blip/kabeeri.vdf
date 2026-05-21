const { listSearchEntries, normalizeText } = require("./catalog");

function searchCatalog(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  const entries = listSearchEntries();
  if (!normalizedQuery) {
    return buildSearchReport(query, entries.slice(0, Number(options.limit) || 8));
  }
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const scored = entries.map((entry) => {
    const normalizedText = normalizeText(entry.text);
    let score = 0;
    for (const token of tokens) {
      if (normalizedText.includes(token)) score += 2;
      if (entry.id === token) score += 3;
      if (entry.label && normalizeText(entry.label).includes(token)) score += 2;
    }
    return { ...entry, score };
  }).filter((entry) => entry.score > 0);
  scored.sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
  return buildSearchReport(query, scored.slice(0, Number(options.limit) || 8));
}

function buildSearchReport(query, results) {
  return {
    report_type: "ui_ux_intelligence_search",
    query: String(query || ""),
    total_matches: results.length,
    results: results.map((entry) => ({
      kind: entry.kind,
      id: entry.id,
      label: entry.label,
      score: entry.score || 1
    })),
    next_action: "Use a match to refine a UI/UX recommendation or design-system output."
  };
}

module.exports = {
  searchCatalog
};

const { normalizeText } = require("./catalog");

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (value == null) return [];
  return [String(value)];
}

function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scoreRecord(query, record) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = tokenize(query);
  const keywords = toList(record.keywords);
  const recordText = normalizeText([
    record.id,
    record.label,
    record.kind,
    record.domain,
    record.search_text,
    record.text,
    keywords.join(" "),
    record.source_file,
    record.stack_id
  ].filter(Boolean).join(" "));

  let score = 0;
  if (record.id && normalizeText(record.id) === normalizedQuery) score += 30;
  if (record.label && normalizeText(record.label) === normalizedQuery) score += 24;
  if (record.kind && normalizeText(record.kind) === normalizedQuery) score += 12;

  for (const token of tokens) {
    if (!token) continue;
    if (record.id && normalizeText(record.id).includes(token)) score += 12;
    if (record.label && normalizeText(record.label).includes(token)) score += 10;
    if (record.kind && normalizeText(record.kind).includes(token)) score += 4;
    if (record.domain && normalizeText(record.domain).includes(token)) score += 3;
    if (recordText.includes(token)) score += 4;
    if (keywords.some((keyword) => normalizeText(keyword).includes(token))) score += 8;
  }

  if (normalizedQuery && recordText.includes(normalizedQuery)) score += 10;
  if (tokens.length > 1 && tokens.every((token) => recordText.includes(token))) score += 6;
  return score;
}

function searchRecords(query, records, options = {}) {
  const limit = Number(options.limit || options.max_results || options.maxResults || 10);
  const normalizedQuery = normalizeText(query);
  const sourceRecords = Array.isArray(records) ? records : [];
  const scored = sourceRecords.map((record) => ({
    ...record,
    score: scoreRecord(normalizedQuery, record)
  }));

  const filtered = normalizedQuery
    ? scored.filter((record) => record.score > 0)
    : scored;

  filtered.sort((left, right) => right.score - left.score || String(left.label || "").localeCompare(String(right.label || "")));

  const results = filtered.slice(0, limit).map((record) => ({
    kind: record.kind || record.domain || "record",
    id: record.id,
    label: record.label,
    domain: record.domain,
    score: record.score
  }));

  const warnings = [];
  if (!sourceRecords.length) warnings.push("No records were available for the selected domain.");
  if (!normalizedQuery) warnings.push("Empty query returned the first available records.");
  return {
    query: String(query || ""),
    total_matches: results.length,
    results,
    warnings
  };
}

module.exports = {
  tokenize,
  scoreRecord,
  searchRecords
};

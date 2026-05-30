const { uniqueStrings } = require("./registry_loader");

const SOURCE_ROUTE_MAP = {
  screenshots: ["uiux", "evidence"],
  external_files: ["requirements", "uiux", "system_design", "database", "evidence"],
  external_links: ["requirements", "integrations", "evidence"],
  questionnaire_answers: ["requirements", "uiux", "system_design", "database", "testing"],
  existing_repo: ["system_design", "integrations", "testing", "evidence"],
  existing_database: ["database", "system_design", "evidence"],
  api_docs: ["api", "system_design", "integrations"],
  brand_guidelines: ["uiux", "docs", "evidence"],
  competitor_references: ["requirements", "uiux", "roadmap"],
  client_brief: ["requirements", "evidence"]
};

function normalizeSourceType(type) {
  return String(type || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_");
}

function routeSourceIntake(sources = [], profile = {}) {
  const sourceEntries = [];
  const conflicts = [];
  const targetTrackMap = {};
  const trackIds = [];

  for (const [index, source] of (Array.isArray(sources) ? sources : []).entries()) {
    const type = normalizeSourceType(source.type);
    const targetTracks = uniqueStrings([...(SOURCE_ROUTE_MAP[type] || []), ...(Array.isArray(source.target_tracks) ? source.target_tracks : [])]);
    const status = source.status || (SOURCE_ROUTE_MAP[type] ? "routed" : "unprocessed");
    const entry = {
      id: source.id || `source_${index + 1}`,
      type,
      original_location: source.original_location || source.path || source.url || null,
      target_tracks: targetTracks,
      description: source.description || source.summary || null,
      status,
      confidence: source.confidence === undefined ? (SOURCE_ROUTE_MAP[type] ? 0.75 : 0.25) : Number(source.confidence),
      extracted_details_placeholder: source.extracted_details_placeholder || {},
      evidence_required: source.evidence_required === undefined ? true : Boolean(source.evidence_required),
      processed_at: source.processed_at || new Date().toISOString()
    };

    if (source.question_ids) entry.question_ids = uniqueStrings(source.question_ids);
    if (source.answered_question_ids) entry.answered_question_ids = uniqueStrings(source.answered_question_ids);
    if (source.conflicting_with) {
      conflicts.push({ source_id: entry.id, reason: source.conflicting_with, severity: "conflicting" });
    }
    if (entry.status === "conflicting") {
      conflicts.push({ source_id: entry.id, reason: "Source marked conflicting", severity: "conflicting" });
    }

    sourceEntries.push(entry);
    for (const track of targetTracks) {
      targetTrackMap[track] = uniqueStrings([...(targetTrackMap[track] || []), entry.id]);
    }
    trackIds.push(...targetTracks);
  }

  return {
    sources: sourceEntries,
    source_map: {
      profile_app_id: profile.app_id || null,
      target_tracks: uniqueStrings(trackIds),
      track_to_source_ids: targetTrackMap,
      source_count: sourceEntries.length
    },
    conflicts,
    confidence_summary: {
      confirmed: sourceEntries.filter((entry) => entry.status === "confirmed").length,
      inferred: sourceEntries.filter((entry) => entry.status === "inferred").length,
      assumed: sourceEntries.filter((entry) => entry.status === "assumed").length,
      missing: sourceEntries.filter((entry) => entry.status === "missing").length,
      conflicting: sourceEntries.filter((entry) => entry.status === "conflicting").length
    }
  };
}

module.exports = { routeSourceIntake };

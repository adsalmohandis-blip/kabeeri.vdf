function normalizeVerificationText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toList(value) {
  if (Array.isArray(value)) return value.flatMap((item) => toList(item));
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(values) {
  return [...new Set((values || []).map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeRecordSubjects(record) {
  return uniqueList([
    record.task_id,
    record.subject_id,
    record.task
  ]);
}

function getReviewedAcceptanceRecords(task, acceptanceState = {}) {
  const records = Array.isArray(acceptanceState.records) ? acceptanceState.records : [];
  return records.filter((record) => {
    const subjects = normalizeRecordSubjects(record);
    const sameTask = subjects.includes(task.id);
    const reviewed = ["reviewed", "accepted"].includes(String(record.status || "draft").toLowerCase());
    const passed = !record.result || String(record.result).toLowerCase() === "pass";
    return sameTask && reviewed && passed;
  });
}

function collectRecordCoverage(record) {
  const criteria = toList(record.criteria || record.acceptance_criteria || []);
  const evidence = toList(record.evidence || record.review_evidence || []);
  const pairs = [];
  const pairCount = Math.max(criteria.length, evidence.length);
  for (let index = 0; index < pairCount; index += 1) {
    pairs.push({
      criterion: criteria[index] || "",
      evidence: evidence[index] || "",
      index
    });
  }
  return {
    record_id: record.id || record.acceptance_id || record.subject_id || record.task_id || null,
    status: String(record.status || "draft").toLowerCase(),
    result: String(record.result || "pass").toLowerCase(),
    criteria,
    evidence,
    pairs,
    review_notes: record.review_notes || "",
    summary: record.summary || ""
  };
}

function criterionSatisfied(criterion, recordCoverage) {
  const normalizedCriterion = normalizeVerificationText(criterion);
  if (!normalizedCriterion) return null;
  const pairs = Array.isArray(recordCoverage.pairs) ? recordCoverage.pairs : [];
  for (const pair of pairs) {
    const recordCriterion = normalizeVerificationText(pair.criterion);
    const recordEvidence = normalizeVerificationText(pair.evidence || recordCoverage.review_notes || recordCoverage.summary);
    if (!recordCriterion || !recordEvidence) continue;
    if (recordCriterion === normalizedCriterion && recordEvidence.includes(normalizedCriterion)) {
      return {
        record_id: recordCoverage.record_id,
        criterion: pair.criterion,
        evidence: pair.evidence,
        evidence_summary: pair.evidence || recordCoverage.review_notes || recordCoverage.summary || ""
      };
    }
  }
  return null;
}

function buildTaskVerificationCoverage(task, acceptanceState = {}) {
  const acceptanceCriteria = uniqueList(Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : []);
  const reviewedRecords = getReviewedAcceptanceRecords(task, acceptanceState);
  const recordCoverage = reviewedRecords.map(collectRecordCoverage);
  const coverage = [];
  const blockers = [];

  if (acceptanceCriteria.length === 0) {
    return {
      task_id: task.id,
      required: false,
      status: reviewedRecords.length > 0 ? "pass" : "missing",
      blockers: reviewedRecords.length > 0 ? [] : ["No reviewed acceptance record available."],
      criteria: [],
      records: recordCoverage,
      summary: reviewedRecords.length > 0
        ? "Task has no acceptance criteria, but reviewed acceptance evidence exists."
        : "Task has no acceptance criteria or reviewed acceptance evidence."
    };
  }

  if (reviewedRecords.length === 0) {
    blockers.push("No reviewed acceptance record exists for this task.");
  }

  for (const criterion of acceptanceCriteria) {
    let match = null;
    for (const record of recordCoverage) {
      match = criterionSatisfied(criterion, record);
      if (match) break;
    }
    if (match) coverage.push({ criterion, status: "pass", ...match });
    else {
      coverage.push({
        criterion,
        status: "fail",
        record_id: null,
        evidence: "",
        evidence_summary: ""
      });
      blockers.push(`Missing explicit evidence for criterion: ${criterion}`);
    }
  }

  return {
    task_id: task.id,
    required: true,
    status: blockers.length ? "fail" : "pass",
    blockers,
    criteria: coverage,
    records: recordCoverage,
    summary: blockers.length
      ? "One or more acceptance criteria lack explicit evidence."
      : "Every acceptance criterion has explicit reviewed evidence."
  };
}

function renderTaskVerificationCoverage(coverage) {
  const lines = [
    "## Acceptance Coverage",
    `Status: ${coverage.status || "unknown"}`,
    `Required: ${coverage.required ? "yes" : "no"}`,
    `Summary: ${coverage.summary || "n/a"}`,
    "",
    ...(Array.isArray(coverage.criteria) && coverage.criteria.length
      ? coverage.criteria.map((item) => `- ${item.status.toUpperCase()}: ${item.criterion}${item.evidence ? ` -> ${item.evidence}` : ""}`)
      : ["- No criteria coverage recorded."]),
    "",
    "## Reviewed Records",
    ...(Array.isArray(coverage.records) && coverage.records.length
      ? coverage.records.map((record) => `- ${record.record_id || "unknown"}: ${record.criteria.length} criterion item(s), ${record.evidence.length} evidence item(s)`)
      : ["- None"])
  ];
  if (Array.isArray(coverage.blockers) && coverage.blockers.length) {
    lines.push("", "## Blockers", ...coverage.blockers.map((item) => `- ${item}`));
  }
  return lines.join("\n");
}

module.exports = {
  buildTaskVerificationCoverage,
  collectRecordCoverage,
  criterionSatisfied,
  normalizeVerificationText,
  renderTaskVerificationCoverage
};

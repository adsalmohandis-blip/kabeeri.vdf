const { buildQuestionPackIndex, loadQuestionnairePacks, uniqueStrings } = require("./registry_loader");

function normalizeQuestion(question, packId, layer) {
  return {
    id: question.id || `${packId}_${question.question ? question.question.slice(0, 20).replace(/\W+/g, "_") : "question"}`,
    question: question.question || "",
    help_text: question.help_text || null,
    type: question.type || "text",
    options: Array.isArray(question.options) ? question.options : [],
    required: Boolean(question.required),
    priority: Number.isFinite(question.priority) ? Number(question.priority) : 50,
    category_layer: question.category_layer || layer,
    applies_to: Array.isArray(question.applies_to) ? question.applies_to : (question.applies_to ? [question.applies_to] : []),
    depends_on: Array.isArray(question.depends_on) ? question.depends_on : [],
    affects: Array.isArray(question.affects) ? question.affects : [],
    evidence_required: question.evidence_required === undefined ? false : Boolean(question.evidence_required),
    pack_id: packId,
    status: question.status || "pending"
  };
}

function collectAnsweredQuestionIds(sourceEntries = []) {
  const answered = [];
  for (const source of Array.isArray(sourceEntries) ? sourceEntries : []) {
    if (Array.isArray(source.answered_question_ids)) answered.push(...source.answered_question_ids);
    if (Array.isArray(source.question_ids) && (source.status === "confirmed" || source.status === "owner_approved")) answered.push(...source.question_ids);
  }
  return uniqueStrings(answered);
}

function buildQuestionnaireProfile(profile, sourceEntries = []) {
  const packs = loadQuestionnairePacks();
  const packIndex = buildQuestionPackIndex(packs);
  const selectedIds = uniqueStrings([
    ...(profile.selected_category_ids || []),
    profile.delivery_category,
    profile.domain_category,
    profile.architecture_pattern,
    profile.governance_profile,
    profile.industry_category
  ]);

  const selectedPacks = [];
  for (const pack of packIndex) {
    if (pack.layer === "base") selectedPacks.push(pack);
  }
  for (const pack of packIndex) {
    if (pack.layer !== "base" && selectedIds.some((id) => id === pack.id)) selectedPacks.push(pack);
  }

  const questions = selectedPacks.flatMap((pack) => pack.questions.map((question) => normalizeQuestion(question, pack.id, pack.layer)));
  const answeredQuestionIds = collectAnsweredQuestionIds(sourceEntries);
  const unansweredQuestions = questions.filter((question) => !answeredQuestionIds.includes(question.id));
  const prioritizedQuestions = [...unansweredQuestions].sort((a, b) => (a.required === b.required ? a.priority - b.priority : (a.required ? -1 : 1)));

  return {
    app_id: profile.app_id || null,
    selected_category_ids: profile.selected_category_ids || [],
    selected_packs: selectedPacks.map((pack) => ({ id: pack.id, layer: pack.layer, source_name: pack.source_name })),
    source_coverage: Array.isArray(sourceEntries) ? sourceEntries.length : 0,
    answered_question_ids: answeredQuestionIds,
    unanswered_question_ids: unansweredQuestions.map((question) => question.id),
    questions,
    prioritized_questions: prioritizedQuestions,
    status: unansweredQuestions.length ? "needs_answers" : "complete"
  };
}

module.exports = { buildQuestionnaireProfile };

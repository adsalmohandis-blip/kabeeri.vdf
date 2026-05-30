const assert = require("assert");
const { buildQuestionnaireProfile } = require("../../src/services/questionnaire_router");

const profile = {
  app_id: "shop_app",
  selected_category_ids: ["web_application", "ecommerce_platform"],
  delivery_category: "web_application",
  domain_category: "ecommerce_platform"
};

const sourceEntries = [
  { id: "src-1", status: "confirmed", question_ids: ["app_identity", "business_goals"] }
];

const questionnaire = buildQuestionnaireProfile(profile, sourceEntries);

assert.ok(questionnaire.selected_packs.some((pack) => pack.id === "app_identity" || pack.id === "business_goals"));
assert.ok(questionnaire.questions.length > 0);
assert.ok(questionnaire.answered_question_ids.includes("app_identity"));
assert.strictEqual(questionnaire.status, "needs_answers");

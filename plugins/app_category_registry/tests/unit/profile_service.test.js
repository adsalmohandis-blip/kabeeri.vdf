const assert = require("assert");
const { buildProfile } = require("../../src/services/profile_service");

const result = buildProfile({
  app_id: "shop_app",
  app_name: "Shop App",
  delivery_category: "ecommerce_platform",
  domain_category: "ecommerce_platform",
  architecture_pattern: "multi_tenant_saas",
  governance_profile: "payment_commerce_app",
  selected_category_ids: ["ecommerce_platform", "saas_platform"]
});

assert.strictEqual(result.profile.app_id, "shop_app");
assert.ok(Array.isArray(result.profile.selected_category_ids));
assert.ok(result.profile.selected_category_ids.includes("ecommerce_platform"));
assert.strictEqual(result.compatibility.blocking, false);
assert.ok(Array.isArray(result.compatibility.issues));
assert.ok(result.questionnaire.questions.length > 0);
assert.ok(result.spec.required_docs.includes("database"));
assert.ok(result.roadmap.order.length > 0);
assert.ok(result.workspace.folders.includes("docs/requirements"));

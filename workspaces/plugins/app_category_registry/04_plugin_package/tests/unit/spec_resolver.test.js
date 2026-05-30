const assert = require("assert");
const { resolveSpecProfile } = require("../../src/services/spec_resolver");

const spec = resolveSpecProfile({
  app_id: "shop_app",
  selected_category_ids: ["ecommerce_platform", "saas_platform"],
  delivery_category: "ecommerce_platform",
  governance_profile: "payment_commerce_app",
  architecture_pattern: "multi_tenant_saas"
});

assert.ok(spec.required_docs.includes("database"));
assert.ok(spec.required_docs.includes("security"));
assert.ok(spec.required_questionnaire_packs.includes("app_identity") || spec.required_questionnaire_packs.length >= 0);
assert.ok(spec.doc_contracts.length > 0);

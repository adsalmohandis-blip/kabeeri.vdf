const assert = require("assert");
const { validateRegistry } = require("../../src/services/validation_service");

const result = validateRegistry({
  app_id: "shop_app",
  selected_category_ids: ["ecommerce_platform", "saas_platform"],
  governance_profile: "payment_commerce_app",
  architecture_pattern: "multi_tenant_saas"
});

assert.strictEqual(result.ok, true);
assert.ok(result.category_count >= 3);
assert.ok(Array.isArray(result.visibility_report.default_category_ids));

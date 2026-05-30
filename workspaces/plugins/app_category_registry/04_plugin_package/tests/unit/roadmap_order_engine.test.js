const assert = require("assert");
const { buildRoadmapOrder } = require("../../src/services/roadmap_order_engine");

const roadmap = buildRoadmapOrder({
  app_id: "shop_app",
  selected_category_ids: ["ecommerce_platform", "saas_platform"],
  governance_profile: "payment_commerce_app",
  architecture_pattern: "multi_tenant_saas"
});

assert.strictEqual(roadmap.template_id, "ecommerce_platform");
assert.ok(Array.isArray(roadmap.order));
assert.strictEqual(roadmap.order[0], "app_category_setup");
assert.ok(roadmap.order.includes("deployment"));

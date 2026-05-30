const assert = require("assert");
const { buildWorkspacePlan } = require("../../src/services/workspace_planner");

const workspace = buildWorkspacePlan({
  app_id: "shop_app",
  selected_category_ids: ["ecommerce_platform", "saas_platform"],
  governance_profile: "payment_commerce_app",
  architecture_pattern: "multi_tenant_saas"
});

assert.ok(workspace.folders.includes("docs/requirements"));
assert.ok(workspace.folders.includes("docs/uiux/screen-specs"));
assert.ok(workspace.folders.includes("specs/cart"));
assert.ok(workspace.folders.includes("specs/billing"));

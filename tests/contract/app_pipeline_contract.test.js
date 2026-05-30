const assert = require("assert");

const {
  buildAppPipelineContract,
  validateAppPipelineContract,
  resolveWorkspaceCategory,
  resolveDomainPlugin
} = require("../../src/cli/services/app_pipeline_contract");

const contract = buildAppPipelineContract({
  selection: {
    app_id: "shop_basic",
    app_name: "Shop Basic"
  },
  profile: {
    app_id: "shop_basic",
    app_name: "Shop Basic",
    selected_category_ids: ["ecommerce_platform"],
    selected_category_versions: [{ id: "ecommerce_platform", version: "1.0.0", schema_version: "1.0.0" }],
    selected_groups: ["domain"],
    delivery_category: "web_application",
    domain_category: "ecommerce_platform",
    architecture_pattern: "multi_tenant_saas",
    governance_profile: "payment_commerce_app"
  }
});

assert.strictEqual(resolveWorkspaceCategory({ selected_category_ids: ["ecommerce_platform"] }), "web_app");
assert.strictEqual(resolveDomainPlugin({ selected_category_ids: ["ecommerce_platform"] }).plugin_id, "ecommerce_builder");
assert.strictEqual(contract.contract_id, "app_pipeline_contract");
assert.strictEqual(contract.app.app_slug, "shop_basic");
assert.strictEqual(contract.workspace_category, "web_app");
assert.strictEqual(contract.selected_domain_plugin, "ecommerce_builder");
assert.deepStrictEqual(contract.stage_order, ["app_category_registry", "domain_plugin", "app_folder_structure"]);

const validation = validateAppPipelineContract(contract, { app_slug: "shop_basic", category: "web_app" });
assert.strictEqual(validation.ok, true);

const mismatched = validateAppPipelineContract(contract, { app_slug: "other_app", category: "web_app" });
assert.strictEqual(mismatched.ok, false);
assert.ok(mismatched.issues.some((issue) => /slug mismatch/i.test(issue)));

console.log("app_pipeline_contract.test.js passed");

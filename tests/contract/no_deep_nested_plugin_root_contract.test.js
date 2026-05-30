const assert = require("assert");
const { buildWorkspaceStructurePlan } = require("../../plugins/plugin_folder_structure/src/services/target_path_service");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("plugin-dev workspace does not create deep nested plugin roots", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const deepNestedPath = "08_plugin_source/plugin_root";
  assert.ok(!plan.directories.some((item) => item.includes(deepNestedPath)));
  assert.ok(!plan.files.some(([item]) => item.includes(deepNestedPath)));
  assert.ok(!plan.directories.some((item) => item.includes("08_plugin_source")));
  assert.ok(!plan.files.some(([item]) => item.includes("08_plugin_source")));
});


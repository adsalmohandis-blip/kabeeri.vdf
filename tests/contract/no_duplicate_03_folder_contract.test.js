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

test("plugin-dev workspace does not generate duplicate 03 folders", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const allPaths = [
    ...plan.directories.map((item) => item.replace(/\\/g, "/")),
    ...plan.files.map(([item]) => item.replace(/\\/g, "/"))
  ];
  assert.ok(!allPaths.some((item) => item.includes("/03_plugin_package/")));
});

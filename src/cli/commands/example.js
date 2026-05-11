const { assertSafeName, fileExists, readJsonFile, readTextFile } = require("../fs_utils");
const { table } = require("../ui");

function example(action, name) {
  if (!action || action === "list") {
    const manifest = readJsonFile("examples/examples_manifest.json");
    console.log(table(["Profile"], (manifest.profiles || []).map((profile) => [profile])));
    return;
  }

  if (action === "show") {
    if (!name) throw new Error("Missing example profile.");
    assertSafeName(name);
    const file = `examples/${name}/README.md`;
    if (!fileExists(file)) throw new Error(`Example not found: ${name}`);
    console.log(readTextFile(file));
    return;
  }

  throw new Error(`Unknown example action: ${action}`);
}

module.exports = { example };

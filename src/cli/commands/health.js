const { getStateDir } = require("../workspace");
const { listDirectories, listFiles, fileExists, repoRoot } = require("../fs_utils");
const { validateRepository } = require("../validate");
const { table } = require("../ui");

function doctor() {
  const checks = [
    ["Repo root", repoRoot()],
    ["Node", process.version],
    [".kabeeri", fileExists(getStateDir()) ? "present" : "missing"],
    ["Generators", listFiles("generators", ".json").length.toString()],
    ["Prompt packs", listDirectories("prompt_packs").length.toString()],
    ["Examples", listDirectories("examples").filter((name) => name !== "README.md").length.toString()]
  ];

  console.log("Kabeeri VDF doctor");
  console.log(table(["Check", "Value"], checks));
}

function validateCommand(scope, flags = {}) {
  const result = validateRepository(scope || "all");
  if (flags.json) {
    console.log(JSON.stringify({
      ok: result.ok,
      scope: scope || "all",
      lines: result.lines
    }, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  for (const line of result.lines) console.log(line);
  if (!result.ok) process.exitCode = 1;
}

module.exports = {
  doctor,
  validateCommand
};

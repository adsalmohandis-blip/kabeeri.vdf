const { handled } = require("./shared");

function dispatchTruthCommands({ group, action, value, flags, rest, c }) {
  if (group !== "truth") return null;
  return handled(c.truthCommand(action, value, flags, rest, {}));
}

module.exports = {
  dispatchTruthCommands
};

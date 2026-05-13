function shouldStartLocalServer(options = {}) {
  if (isExplicitlyForced(options)) return true;
  if (process.env.CI === "true") return false;
  if (typeof process.stdout.isTTY === "boolean" && process.stdout.isTTY === false) return false;
  return true;
}

function isExplicitlyForced(options = {}) {
  return options.force === true
    || options.force === "true"
    || options["force-server"] === true
    || options["force-server"] === "true";
}

function buildLocalServerSkipMessage(kind = "local server") {
  return `${kind} skipped in non-interactive mode. Use --force-server to keep it running.`;
}

module.exports = {
  buildLocalServerSkipMessage,
  shouldStartLocalServer
};

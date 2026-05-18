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

function shouldOpenBrowser(options = {}) {
  if (isExplicitlyDisabled(options)) return false;
  return isExplicitlyEnabled(options);
}

function shouldLaunchFullscreen(options = {}) {
  return options.fullscreen === true
    || options.fullscreen === "true"
    || options["fullscreen"] === true
    || options["fullscreen"] === "true";
}

function buildFullscreenUrl(url, options = {}) {
  if (!shouldLaunchFullscreen(options)) return url;
  const target = new URL(url);
  target.searchParams.set("fullscreen", "1");
  return target.toString();
}

function injectFullscreenShell(html, options = {}) {
  if (!shouldLaunchFullscreen(options) || typeof html !== "string") return html;
  const script = `
<style>
  html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
  body { overscroll-behavior: none; }
</style>
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  if (!params.has("fullscreen")) return;
  var enable = function () {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    } catch (error) {}
  };
  if (document.readyState === "complete") enable();
  else window.addEventListener("load", enable, { once: true });
})();
</script>`;
  if (html.includes("</body>")) return html.replace("</body>", `${script}\n</body>`);
  if (html.includes("</html>")) return html.replace("</html>", `${script}\n</html>`);
  return `${html}${script}`;
}

function isExplicitlyEnabled(options = {}) {
  return options.open === true
    || options.open === "true"
    || options["open"] === true
    || options["open"] === "true";
}

function isExplicitlyDisabled(options = {}) {
  return options.open === false
    || options.open === "false"
    || options["open"] === false
    || options["open"] === "false"
    || options["no-open"] === true
    || options["no-open"] === "true"
    || options.no_open === true
    || options.no_open === "true";
}

function openExternalUrl(url) {
  const { spawn } = require("child_process");
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

module.exports = {
  buildLocalServerSkipMessage,
  buildFullscreenUrl,
  injectFullscreenShell,
  openExternalUrl,
  shouldLaunchFullscreen,
  shouldOpenBrowser,
  shouldStartLocalServer
};

const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { fileExists, repoRoot, resolveAsset } = require("../fs_utils");

function docsSite(action, value, flags = {}) {
  const mode = action || "open";
  if (mode === "path") {
    console.log(resolveAsset("docs/site/index.html"));
    return;
  }

  if (mode === "code" || mode === "vscode") {
    const target = value || "docs/site";
    openInVsCode(target);
    console.log(`Opening in VS Code: ${target}`);
    return;
  }

  if (mode === "generate" || mode === "build") {
    generateDocsSite();
    console.log("Generated documentation site pages.");
    return;
  }

  if (mode === "open" || mode === "serve" || mode === "live") {
    generateDocsSite();
    const shouldOpen = mode === "open" || flags.open === true || flags.open === "true";
    return serveDocsSite(flags.port || 4188, { ...flags, open: shouldOpen });
  }

  throw new Error(`Unknown docs action: ${action}`);
}

function generateDocsSite() {
  const script = path.join(repoRoot(), "docs", "site", "generate-pages.js");
  if (!fileExists("docs/site/generate-pages.js")) throw new Error("Docs site generator not found: docs/site/generate-pages.js");
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot(),
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Docs site generation failed.${output ? `\n${output}` : ""}`);
  }
}

function serveDocsSite(port, options = {}) {
  const siteRoot = path.join(repoRoot(), "docs", "site");
  const autoPort = String(port).toLowerCase() === "auto" || options["auto-port"] === true || options["auto-port"] === "true";
  const startPort = autoPort ? Number(options.start || options["start-port"] || 4188) : Number(port || 4188);

  function start(currentPort) {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, `http://127.0.0.1:${currentPort}`);
      const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const safePath = path.normalize(requestPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
      const filePath = path.join(siteRoot, safePath);
      if (!filePath.startsWith(siteRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type": docsMimeType(filePath),
        "cache-control": "no-store"
      });
      response.end(fs.readFileSync(filePath));
    });
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE" && autoPort && currentPort < startPort + 100) {
        server.close();
        start(currentPort + 1);
        return;
      }
      throw error;
    });
    server.listen(currentPort, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${currentPort}/`;
      console.log(`Kabeeri docs site running at ${url}`);
      console.log(`English docs: ${url}pages/en/what-is.html`);
      console.log(`Arabic docs: ${url}pages/ar/what-is.html`);
      if (options.open) openExternalUrl(url);
    });
  }

  start(startPort);
}

function docsMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  };
  return types[ext] || "application/octet-stream";
}

function openExternalUrl(url) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

function openInVsCode(target) {
  const targetPath = path.resolve(repoRoot(), target);
  const child = spawn("code", [targetPath], { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

module.exports = {
  docsSite
};

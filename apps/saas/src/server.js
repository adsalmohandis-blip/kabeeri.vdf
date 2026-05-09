const fs = require("fs");
const http = require("http");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const seedFile = path.join(appRoot, "data", "seed.json");
const publicDir = path.join(appRoot, "public");
const port = Number(process.env.KABEERI_SAAS_PORT || process.env.PORT || 4290);

function readSeed() {
  return JSON.parse(fs.readFileSync(seedFile, "utf8"));
}

function htmlPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - Kabeeri Cloud</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/">Kabeeri Cloud</a>
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/api/health">API Health</a>
    </nav>
  </header>
  ${body}
</body>
</html>`;
}

function homePage() {
  const state = readSeed();
  return htmlPage("Hosted AI Development Governance", `
    <main class="hero">
      <section class="hero-copy">
        <p class="eyebrow">SaaS branch preview</p>
        <h1>${escapeHtml(state.product.name)}</h1>
        <p class="lead">${escapeHtml(state.product.tagline)}</p>
        <div class="actions">
          <a class="button primary" href="/dashboard">Open Dashboard</a>
          <a class="button" href="/api/workspaces">View API</a>
        </div>
      </section>
      <section class="signal-grid" aria-label="Core SaaS capabilities">
        ${[
          ["Hosted Workspaces", "Create cloud Kabeeri spaces instead of only local folders."],
          ["AI Team Control", "Coordinate human owners, AI agents, workstreams, locks, and task tokens."],
          ["Live Governance", "Expose readiness, policy, cost, and release status in one product surface."],
          ["Repository Sync", "Prepare GitHub-backed project state and future bidirectional sync."]
        ].map(([name, detail]) => `<article><h2>${name}</h2><p>${detail}</p></article>`).join("")}
      </section>
    </main>
  `);
}

function dashboardPage() {
  const state = readSeed();
  return htmlPage("Dashboard", `
    <main class="page">
      <div class="page-title">
        <p class="eyebrow">Workspace Control Center</p>
        <h1>Hosted Kabeeri Workspaces</h1>
        <p>Preview of the SaaS dashboard layer. The local CLI remains the engine; this app becomes the hosted operating surface.</p>
      </div>
      <section class="workspace-grid">
        ${state.workspaces.map((workspace) => `
          <article class="workspace-card">
            <div class="card-head">
              <h2>${escapeHtml(workspace.name)}</h2>
              <span class="status ${escapeHtml(workspace.readiness)}">${escapeHtml(workspace.readiness)}</span>
            </div>
            <dl>
              <div><dt>Owner</dt><dd>${escapeHtml(workspace.owner)}</dd></div>
              <div><dt>Plan</dt><dd>${escapeHtml(workspace.plan)}</dd></div>
              <div><dt>Apps</dt><dd>${workspace.apps.map(escapeHtml).join(", ")}</dd></div>
              <div><dt>Open Tasks</dt><dd>${workspace.open_tasks}</dd></div>
              <div><dt>Monthly AI Cost</dt><dd>$${workspace.monthly_ai_cost.toFixed(2)}</dd></div>
            </dl>
          </article>
        `).join("")}
      </section>
    </main>
  `);
}

function serveStatic(urlPath, response) {
  const safePath = path.normalize(urlPath.replace(/^\/assets\//, "")).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  response.writeHead(200, { "content-type": contentType(filePath), "cache-control": "no-store" });
  response.end(fs.readFileSync(filePath));
  return true;
}

function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith("/assets/") && serveStatic(url.pathname, response)) return;

    if (url.pathname === "/api/health") return json(response, {
      status: "ok",
      service: "kabeeri-saas",
      mode: "branch-preview",
      timestamp: new Date().toISOString()
    });

    if (url.pathname === "/api/workspaces") return json(response, readSeed().workspaces);

    if (url.pathname === "/" || url.pathname === "/index.html") return html(response, homePage());
    if (url.pathname === "/dashboard") return html(response, dashboardPage());

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });
}

function html(response, content) {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  response.end(content);
}

function json(response, value) {
  response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value, null, 2));
}

function contentType(filePath) {
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  return "application/octet-stream";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function check() {
  const state = readSeed();
  const required = [seedFile, path.join(publicDir, "styles.css")];
  const missing = required.filter((file) => !fs.existsSync(file));
  if (missing.length) {
    console.error(`Missing SaaS files: ${missing.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  if (!Array.isArray(state.workspaces) || state.workspaces.length === 0) {
    console.error("SaaS seed must include at least one workspace.");
    process.exitCode = 1;
    return;
  }
  console.log(`Kabeeri SaaS scaffold OK (${state.workspaces.length} demo workspaces).`);
}

if (process.argv.includes("--check")) {
  check();
} else if (require.main === module) {
  createServer().listen(port, "127.0.0.1", () => {
    console.log(`Kabeeri SaaS preview running at http://127.0.0.1:${port}`);
  });
}

module.exports = { createServer, readSeed };

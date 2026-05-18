const { buildFullscreenUrl, buildLocalServerSkipMessage, injectFullscreenShell, openExternalUrl, shouldLaunchFullscreen, shouldOpenBrowser, shouldStartLocalServer } = require("../services/local_server");
const { collectDashboardStateForCurrentTrack, writeDashboardStateFilesForCurrentTrack } = require("./dashboard_state");

function resolveDashboardScope(pathname) {
  const normalized = String(pathname || "").replace(/\/$/, "") || "/";
  if (
    normalized === "/__kvdf/dashboard/owner" ||
    normalized === "/__kvdf/dashboard/owner/index.html" ||
    normalized === "/__kvdf/dashboard/framework" ||
    normalized === "/__kvdf/dashboard/framework/index.html" ||
    normalized === "/__kvdf/dashboard/framework-owner" ||
    normalized === "/__kvdf/dashboard/framework-owner/index.html"
  ) {
    return "owner";
  }
  if (
    normalized === "/__kvdf/dashboard/viber" ||
    normalized === "/__kvdf/dashboard/viber/index.html" ||
    normalized === "/__kvdf/dashboard/vibe" ||
    normalized === "/__kvdf/dashboard/vibe/index.html" ||
    normalized === "/__kvdf/dashboard/app" ||
    normalized === "/__kvdf/dashboard/app/index.html"
  ) {
    return "viber";
  }
  if (normalized === "/__kvdf/dashboard" || normalized === "/__kvdf/dashboard/index.html") {
    return "current";
  }
  return null;
}

function serveSite(port, options = {}, deps = {}) {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const {
    repoRoot,
    collectDashboardState: collectDashboardState = collectDashboardStateForCurrentTrack,
    writeDashboardStateFiles: writeDashboardStateFiles = writeDashboardStateFilesForCurrentTrack,
      buildDashboardHtml,
    refreshLiveReportsState,
    refreshAgileDashboardState,
    refreshStructuredDashboardState,
    normalizePublicUsername
  } = deps;
  const homeFile = path.join(repoRoot(), ".kabeeri", "site", "index.html");
  const autoPort = String(port).toLowerCase() === "auto" || options["auto-port"] === true || options["auto-port"] === "true";
  const startPort = autoPort ? Number(options.start || options["start-port"] || 4177) : Number(port || 4177);
  if (!shouldStartLocalServer(options)) {
    const message = buildLocalServerSkipMessage("Kabeeri customer page server");
    console.log(message);
    return {
      report_type: "local_server_skipped",
      server: "customer_page",
      skipped: true,
      message
    };
  }

  function start(currentPort) {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, `http://127.0.0.1:${currentPort}`);
      const pathname = url.pathname.replace(/\/$/, "") || "/";
      const fullscreen = shouldLaunchFullscreen(options) || url.searchParams.has("fullscreen");
      let file = null;
      if (pathname === "/" || pathname === "/index.html") {
        file = homeFile;
      } else {
        const dashboardScope = resolveDashboardScope(pathname);
        if (dashboardScope) {
          const state = collectDashboardState(options);
          writeDashboardStateFiles(state);
          response.writeHead(200, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store"
          });
          const dashboardOptions = dashboardScope === "current" ? options : { ...options, scope: dashboardScope };
          response.end(injectFullscreenShell(buildDashboardHtml(dashboardOptions), fullscreen ? { fullscreen: true } : {}));
          return;
        }
      }
      if (pathname === "/__kvdf/api/state") {
        const state = collectDashboardState(options);
        writeDashboardStateFiles(state);
        response.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(JSON.stringify(state, null, 2));
        return;
      } else if (pathname === "/__kvdf/api/tasks" || pathname === "/__kvdf/api/task-tracker") {
        const state = collectDashboardState(options);
        writeDashboardStateFiles(state);
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(JSON.stringify(state.task_tracker, null, 2));
        return;
      } else if (pathname === "/__kvdf/api/reports" || pathname === "/__kvdf/api/live-reports") {
        const state = refreshLiveReportsState();
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(JSON.stringify(state, null, 2));
        return;
      } else if (pathname === "/__kvdf/api/agile") {
        const state = refreshAgileDashboardState();
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(JSON.stringify(state, null, 2));
        return;
      } else if (pathname === "/__kvdf/api/structured") {
        const state = refreshStructuredDashboardState();
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(JSON.stringify(state, null, 2));
        return;
      } else {
        const match = pathname.match(/^\/customer\/apps\/([^/]+)$/);
        if (match) {
          const username = match[1];
          try {
            normalizePublicUsername(username);
            const appFile = path.join(repoRoot(), ".kabeeri", "site", "customer", "apps", username, "index.html");
            if (fs.existsSync(appFile)) file = appFile;
          } catch (_) {
            file = null;
          }
        }
      }
      if (!file || !fs.existsSync(file)) {
        response.writeHead(404, { "content-type": "text/plain" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(injectFullscreenShell(fs.readFileSync(file, "utf8"), fullscreen ? { fullscreen: true } : {}));
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
      const baseUrl = `http://127.0.0.1:${currentPort}/`;
      const dashboardUrl = buildFullscreenUrl(`http://127.0.0.1:${currentPort}/__kvdf/dashboard`, options);
      console.log(`Kabeeri customer page running at ${baseUrl}`);
      console.log(`Private dashboard running at ${dashboardUrl}`);
      console.log(`Live state API running at http://127.0.0.1:${currentPort}/__kvdf/api/state`);
      if (shouldOpenBrowser(options)) openExternalUrl(dashboardUrl);
    });
  }

  start(startPort);
}

module.exports = {
  serveSite,
  resolveDashboardScope
};

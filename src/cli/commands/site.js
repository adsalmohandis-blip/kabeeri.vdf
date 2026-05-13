const { buildLocalServerSkipMessage, shouldStartLocalServer } = require("../services/local_server");

function serveSite(port, options = {}, deps = {}) {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const {
    repoRoot,
    collectDashboardState,
    writeDashboardStateFiles,
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
      let file = null;
      if (pathname === "/" || pathname === "/index.html") {
        file = homeFile;
      } else if (pathname === "/__kvdf/dashboard" || pathname === "/__kvdf/dashboard/index.html") {
        const state = collectDashboardState(options);
        writeDashboardStateFiles(state);
        response.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store"
        });
        response.end(buildDashboardHtml());
        return;
      } else if (pathname === "/__kvdf/api/state") {
        const state = collectDashboardState(options);
        writeDashboardStateFiles(state);
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
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
      response.end(fs.readFileSync(file, "utf8"));
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
      console.log(`Kabeeri customer page running at http://127.0.0.1:${currentPort}/`);
      console.log(`Private dashboard running at http://127.0.0.1:${currentPort}/__kvdf/dashboard`);
      console.log(`Live state API running at http://127.0.0.1:${currentPort}/__kvdf/api/state`);
    });
  }

  start(startPort);
}

module.exports = {
  serveSite
};

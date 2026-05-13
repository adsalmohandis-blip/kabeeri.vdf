const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { fileExists, repoRoot, resolveAsset } = require("../fs_utils");
const { readJsonFile } = require("../workspace");
const { buildLocalServerSkipMessage, shouldStartLocalServer } = require("../services/local_server");

const DOCS_SITE_COVERAGE_FILE = "docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json";
const DOCS_SITE_SYNC_REPORT_FILE = "docs/reports/DOCS_SITE_SYNC_REPORT.json";
const DOCS_SITE_WORKFLOW_REPORT_FILE = "docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json";
const DOCS_SITE_TEMPLATE_CATALOG_FILE = "docs/site/page-templates.json";
const DOCS_SITE_PAGE_FAMILIES = [
  {
    family_id: "orientation",
    title: "Orientation and start-up",
    pages: ["what-is", "start-here", "install-profiles", "ai-with-kabeeri", "developer-onboarding"],
    command_focus: ["kvdf start", "kvdf entry", "kvdf resume"]
  },
  {
    family_id: "capability-foundation",
    title: "Capability and repository foundation",
    pages: ["capabilities", "repository-layout"],
    command_focus: ["kvdf capability", "kvdf validate", "kvdf docs"]
  },
  {
    family_id: "project-intake",
    title: "Project intake and delivery mode",
    pages: ["new-project", "existing-kabeeri-project", "existing-non-kabeeri-project", "delivery-mode", "agile-delivery", "structured-delivery", "questionnaire-engine", "product-blueprints", "data-design"],
    command_focus: ["kvdf project", "kvdf questionnaire", "kvdf blueprint", "kvdf data-design"]
  },
  {
    family_id: "design-guidance",
    title: "Design and prompt guidance",
    pages: ["ui-ux-advisor", "ui-ux-reference-library", "vibe-first", "prompt-packs"],
    command_focus: ["kvdf design", "kvdf vibe", "kvdf prompt-pack"]
  },
  {
    family_id: "governance",
    title: "Task, workstream, and boundary governance",
    pages: ["task-governance", "app-boundary", "workstreams-scope"],
    command_focus: ["kvdf task", "kvdf workstream", "kvdf app"]
  },
  {
    family_id: "platform-operations",
    title: "Platform operations and collaboration",
    pages: ["wordpress-development", "wordpress-plugins", "dashboard-monitoring", "ai-cost-control", "multi-ai-governance", "github-release"],
    command_focus: ["kvdf wordpress", "kvdf dashboard", "kvdf usage", "kvdf multi-ai", "kvdf github", "kvdf release"]
  },
  {
    family_id: "examples",
    title: "Practical builds and examples",
    pages: ["practical-examples", "example-ecommerce", "example-ai-team-ecommerce", "example-blog", "example-wordpress-digital-agency", "example-dental-clinic", "example-crm", "example-mobile-commerce", "example-pos"],
    command_focus: ["kvdf example", "kvdf project route"]
  },
  {
    family_id: "support",
    title: "Troubleshooting and support",
    pages: ["troubleshooting"],
    command_focus: ["kvdf validate", "kvdf doctor", "kvdf conflict scan"]
  }
];

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
    validateDocsSiteArtifacts();
    writeDocsSiteCoverageReport();
    writeDocsSiteWorkflowReport();
    console.log("Generated documentation site templates, pages, manifest, contracts, coverage, and workflow report.");
    return;
  }

  if (mode === "workflow" || mode === "generation") {
    generateDocsSite();
    validateDocsSiteArtifacts();
    writeDocsSiteCoverageReport();
    const report = writeDocsSiteWorkflowReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Docs site generation workflow: ${report.template_count} templates, ${report.page_count} pages, ${report.contract_count} contracts`);
    return report;
  }

  if (mode === "sync") {
    generateDocsSite();
    const validation = validateDocsSiteArtifacts();
    const coverage = writeDocsSiteCoverageReport();
    const workflow = writeDocsSiteWorkflowReport();
    const report = buildDocsSiteSyncReport(validation, coverage, workflow);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Docs site sync complete: ${report.page_count} pages, ${report.coverage.complete_families}/${report.coverage.total_families} families complete`);
    return;
  }

  if (mode === "manifest" || mode === "summary") {
    const manifest = readDocsSiteManifest();
    if (flags.json) console.log(JSON.stringify(manifest, null, 2));
    else console.log(`Docs site manifest: ${manifest.site_name} (${manifest.page_count} pages, ${manifest.languages.join(", ")})`);
    return;
  }

  if (mode === "contracts" || mode === "pages") {
    const contracts = readDocsSiteContracts();
    if (flags.json) console.log(JSON.stringify(contracts, null, 2));
    else console.log(`Docs site page contracts: ${contracts.page_count} page outputs across ${contracts.contracts.length} contracts`);
    return;
  }

  if (mode === "validate" || mode === "check") {
    const result = validateDocsSiteArtifacts();
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`Docs site artifacts valid: ${result.page_count} pages, ${result.contract_count} contracts`);
    return;
  }

  if (mode === "coverage" || mode === "publish") {
    const report = writeDocsSiteCoverageReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Docs site deep publishing coverage: ${report.coverage.complete_families}/${report.coverage.total_families} families complete, ${report.page_count} pages published`);
    return;
  }

  if (mode === "preview" || mode === "open" || mode === "serve" || mode === "live") {
    generateDocsSite();
    validateDocsSiteArtifacts();
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
  if (result.error && result.error.code === "EPERM") {
    try {
      delete require.cache[require.resolve(script)];
      require(script);
      return;
    } catch (error) {
      throw new Error(`Docs site generation failed.\n${error.message}`);
    }
  }
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    if (result.error) {
      const details = `${result.error.code || "spawn_error"}: ${result.error.message}`;
      throw new Error(`Docs site generation failed.\n${details}${output ? `\n${output}` : ""}`);
    }
    throw new Error(`Docs site generation failed.${output ? `\n${output}` : ""}`);
  }
}

function readDocsSiteManifest() {
  const manifestPath = "docs/site/site-manifest.json";
  if (!fileExists(manifestPath)) throw new Error("Docs site manifest not found. Run `kvdf docs generate` first.");
  return readJsonFile(manifestPath);
}

function readDocsSiteContracts() {
  const contractsPath = "docs/site/page-contracts.json";
  if (!fileExists(contractsPath)) throw new Error("Docs site page contracts not found. Run `kvdf docs generate` first.");
  return readJsonFile(contractsPath);
}

function readDocsSiteTemplates() {
  const templatesPath = DOCS_SITE_TEMPLATE_CATALOG_FILE;
  if (!fileExists(templatesPath)) throw new Error("Docs site page templates not found. Run `kvdf docs generate` first.");
  return readJsonFile(templatesPath);
}

function validateDocsSiteArtifacts() {
  const manifest = readDocsSiteManifest();
  const contracts = readDocsSiteContracts();
  const templates = readDocsSiteTemplates();
  const coverage = readDocsSiteCoverage(true);
  const pageCount = manifest.page_count || (manifest.pages || []).length;
  const contractCount = contracts.page_count || (contracts.contracts || []).length;
  const templateCount = templates.template_count || (templates.templates || []).length;
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    throw new Error("Docs site manifest has no pages.");
  }
  if (!Array.isArray(templates.templates) || templates.templates.length < 2) {
    throw new Error("Docs site template catalog is incomplete.");
  }
  if (!Array.isArray(contracts.contracts) || contracts.contracts.length !== pageCount * 2) {
    throw new Error("Docs site page contracts are out of sync with the manifest.");
  }
  for (const page of manifest.pages) {
    const enContract = contracts.contracts.find((item) => item.slug === page.slug && item.language === "en");
    const arContract = contracts.contracts.find((item) => item.slug === page.slug && item.language === "ar");
    if (!enContract || !arContract) {
      throw new Error(`Docs site page contract missing for ${page.slug}.`);
    }
  }
  return {
    manifest_version: manifest.manifest_version || 1,
    contract_version: contracts.contract_version || 1,
    template_version: templates.template_version || 1,
    site_name: manifest.site_name || contracts.site_name || "Kabeeri VDF Docs",
    page_count: pageCount,
    contract_count: contractCount,
    template_count: templateCount,
    coverage_report_path: coverage.report_path,
    coverage_complete_families: coverage.coverage.complete_families,
    coverage_total_families: coverage.coverage.total_families
  };
}

function readDocsSiteCoverage(allowMissing = false) {
  if (!fileExists(DOCS_SITE_COVERAGE_FILE)) {
    if (allowMissing) {
      return buildDocsSiteCoverageReport({ persist: false });
    }
    throw new Error("Docs site coverage report not found. Run `kvdf docs coverage` first.");
  }
  return readJsonFile(DOCS_SITE_COVERAGE_FILE);
}

function buildDocsSiteCoverageReport(options = {}) {
  const manifest = readDocsSiteManifest();
  const contracts = readDocsSiteContracts();
  const templates = readDocsSiteTemplates();
  const pageSlugs = new Set((manifest.pages || []).map((page) => page.slug));
  const contractCount = contracts.page_count || (contracts.contracts || []).length;
  const families = DOCS_SITE_PAGE_FAMILIES.map((family) => {
    const pages = family.pages.filter((slug) => pageSlugs.has(slug));
    const missing_pages = family.pages.filter((slug) => !pageSlugs.has(slug));
    return {
      family_id: family.family_id,
      title: family.title,
      command_focus: family.command_focus,
      page_slugs: family.pages,
      published_pages: pages,
      missing_pages,
      coverage_status: missing_pages.length === 0 ? "complete" : "partial"
    };
  });
  const completeFamilies = families.filter((family) => family.coverage_status === "complete").length;
  const missingFamilies = families.filter((family) => family.coverage_status !== "complete").map((family) => family.family_id);
  const report = {
    report_type: "docs_site_deep_publishing_coverage",
    generated_at: new Date().toISOString(),
    site_name: manifest.site_name || "Kabeeri VDF Docs",
    report_path: DOCS_SITE_COVERAGE_FILE,
    page_count: manifest.page_count || (manifest.pages || []).length,
    contract_count: contractCount,
    template_count: templates.template_count || (templates.templates || []).length,
    coverage: {
      total_families: families.length,
      complete_families: completeFamilies,
      partial_families: families.length - completeFamilies,
      missing_families: missingFamilies
    },
    families
  };
  if (options.persist !== false) {
    fs.mkdirSync(path.dirname(path.join(repoRoot(), DOCS_SITE_COVERAGE_FILE)), { recursive: true });
    fs.writeFileSync(path.join(repoRoot(), DOCS_SITE_COVERAGE_FILE), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  return report;
}

function writeDocsSiteCoverageReport() {
  return buildDocsSiteCoverageReport({ persist: true });
}

function buildDocsSiteWorkflowReport(options = {}) {
  const manifest = readDocsSiteManifest();
  const contracts = readDocsSiteContracts();
  const templates = readDocsSiteTemplates();
  const coverage = readDocsSiteCoverage(true);
  const validation = validateDocsSiteArtifacts();
  const report = {
    report_type: "docs_site_generation_workflow",
    generated_at: new Date().toISOString(),
    site_name: manifest.site_name || "Kabeeri VDF Docs",
    report_path: DOCS_SITE_WORKFLOW_REPORT_FILE,
    template_count: templates.template_count || (templates.templates || []).length,
    page_count: validation.page_count,
    contract_count: validation.contract_count,
    workflow_steps: [
      "Load the docs site template catalog.",
      "Render the site manifest from the generated pages.",
      "Render localized page contracts for English and Arabic.",
      "Write the localized HTML pages from the shared site shell.",
      "Validate manifest, contracts, and templates for alignment.",
      "Publish deep coverage so each family stays visible."
    ],
    templates: templates.templates || [],
    manifest: {
      manifest_version: manifest.manifest_version || 1,
      path: "docs/site/site-manifest.json",
      page_count: validation.page_count
    },
    page_contracts: {
      contract_version: contracts.contract_version || 1,
      path: "docs/site/page-contracts.json",
      page_count: validation.contract_count
    },
    coverage: {
      report_path: coverage.report_path,
      complete_families: coverage.coverage.complete_families,
      total_families: coverage.coverage.total_families
    },
    source_of_truth: {
      template_catalog: true,
      manifest: true,
      contracts: true,
      coverage: true
    },
    next_actions: [
      "Run `kvdf docs generate` to refresh all docs-site artifacts.",
      "Run `kvdf docs sync` to generate the sync report after validation.",
      "Use `kvdf docs coverage` to inspect family coverage without opening the browser."
    ]
  };
  if (options.persist !== false) {
    fs.mkdirSync(path.dirname(path.join(repoRoot(), DOCS_SITE_WORKFLOW_REPORT_FILE)), { recursive: true });
    fs.writeFileSync(path.join(repoRoot(), DOCS_SITE_WORKFLOW_REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  return report;
}

function writeDocsSiteWorkflowReport() {
  return buildDocsSiteWorkflowReport({ persist: true });
}

function buildDocsSiteSyncReport(validation, coverage, workflow = null) {
  const manifest = readDocsSiteManifest();
  const report = {
    report_type: "docs_site_sync_report",
    generated_at: new Date().toISOString(),
    site_name: manifest.site_name || "Kabeeri VDF Docs",
    report_path: DOCS_SITE_SYNC_REPORT_FILE,
    page_count: validation.page_count,
    contract_count: validation.contract_count,
    coverage: {
      total_families: coverage.coverage.total_families,
      complete_families: coverage.coverage.complete_families,
      partial_families: coverage.coverage.partial_families
    },
    workflow_report_path: workflow ? workflow.report_path : DOCS_SITE_WORKFLOW_REPORT_FILE,
    source_of_truth: {
      manifest: true,
      contracts: true,
      templates: true,
      coverage: true,
      workflow: Boolean(workflow)
    },
    next_actions: coverage.coverage.partial_families === 0 ? ["docs site deep publishing is synchronized"] : ["close remaining docs site coverage gaps"]
  };
  fs.mkdirSync(path.dirname(path.join(repoRoot(), DOCS_SITE_SYNC_REPORT_FILE)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), DOCS_SITE_SYNC_REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

function serveDocsSite(port, options = {}) {
  const siteRoot = path.join(repoRoot(), "docs", "site");
  const autoPort = String(port).toLowerCase() === "auto" || options["auto-port"] === true || options["auto-port"] === "true";
  const startPort = autoPort ? Number(options.start || options["start-port"] || 4188) : Number(port || 4188);
  if (!shouldStartLocalServer(options)) {
    const message = buildLocalServerSkipMessage("Kabeeri docs site server");
    console.log(message);
    return {
      report_type: "local_server_skipped",
      server: "docs_site",
      skipped: true,
      message
    };
  }

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

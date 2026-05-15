const fs = require("fs");
const path = require("path");
const { table } = require("../ui");
const { repoRoot } = require("../fs_utils");
const { buildKVDFFeatureRestructureRoadmap } = require("../services/evolution");

const CAPABILITY_SURFACE_REPORT = "docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json";
const CAPABILITY_DOC_MATRIX_REPORT = "docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json";
const CAPABILITY_SEARCH_INDEX_REPORT = "docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json";

function capability(action, value, flags = {}) {
  const areas = getSystemAreas();
  const registry = buildCapabilityRegistry(areas);
  if (!action || action === "list") {
    console.log(table(["ID", "Area", "Group"], areas.map((area) => [area.id, area.name, area.group])));
    return;
  }

  if (action === "show") {
    const key = String(value || "").toLowerCase();
    if (!key) throw new Error("Missing capability id or name.");
    const area = areas.find((item) => String(item.id) === key || item.key === key || item.name.toLowerCase() === key);
    if (!area) throw new Error(`Capability area not found: ${value}`);
    console.log(JSON.stringify(area, null, 2));
    return;
  }

  if (action === "map") {
    console.log(JSON.stringify({ areas, groups: buildCapabilityGroups(), registry }, null, 2));
    return;
  }

  if (action === "surface") {
    const report = buildCapabilitySurfaceReport(registry);
    writeCapabilitySurfaceReport(report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Capability CLI surface: ${report.coverage.complete_capabilities}/${report.coverage.total_capabilities} capabilities mapped`);
    return;
  }

  if (action === "matrix") {
    const report = buildCapabilityDocMatrix(registry);
    writeCapabilityDocMatrixReport(report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`Capability documentation matrix: ${report.coverage.complete_capabilities}/${report.coverage.total_capabilities} capabilities mapped`);
    return;
  }

  if (action === "search") {
    const query = [value, flags.q, flags.query].find((item) => typeof item === "string" && item.trim()) || "";
    const report = buildCapabilitySearchReport(registry, query, flags);
    writeCapabilitySearchReport(report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderCapabilitySearchReport(report, table));
    return;
  }

  if (action === "registry") {
    const subaction = String(value || "").trim().toLowerCase();
    if (!subaction || subaction === "list") {
      if (flags.json) {
        console.log(JSON.stringify(registry, null, 2));
      } else {
        console.log(table(["ID", "Capability", "Owner", "Source"], registry.map((item) => [
          item.id,
          item.name,
          item.owner,
          item.source_reference.join(", ")
        ])));
      }
      return;
    }

    if (subaction === "map") {
      console.log(JSON.stringify(buildCapabilityRegistryMap(registry), null, 2));
      return;
    }

    const key = String(flags.id || flags.key || flags.name || value || "").trim().toLowerCase();
    if (!key) throw new Error("Missing capability registry id or key.");
    if (subaction === "show") {
      const item = registry.find((entry) => String(entry.id) === key || entry.key === key || entry.name.toLowerCase() === key);
      if (!item) throw new Error(`Capability registry entry not found: ${value || key}`);
      console.log(JSON.stringify(item, null, 2));
      return;
    }
    const item = registry.find((entry) => String(entry.id) === key || entry.key === key || entry.name.toLowerCase() === key);
    if (!item) throw new Error(`Capability registry entry not found: ${value || key}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown capability action: ${action}`);
}

function getSuggestedQuestionsForArea(areaKey) {
  const area = getSystemAreas().find((item) => item.key === areaKey);
  if (!area) return [];
  const examples = {
    theme_branding: ["Do you need colors controlled from admin?", "Do you need dark mode?", "Should low-contrast colors be blocked?"],
    dashboard_customization: ["Which dashboards are required?", "Do widgets differ by role?", "Do reports need export?"],
    users_roles: ["What user types exist?", "Is there exactly one Owner?", "Who approves, publishes, and deletes?"],
    multi_tenancy: ["Will multiple companies use the system?", "Is tenant data separated?", "Does each tenant need settings, colors, or billing?"],
    payments_billing: ["Are payments required in V1?", "Are subscriptions or invoices needed?", "Who can refund or cancel?"]
  };
  return examples[areaKey] || [`What is required for ${area.name} in V1?`, `Should ${area.name} be deferred or not applicable?`];
}

function mapAreaToWorkstream(areaKey) {
  if (areaKey.includes("frontend") || ["theme_branding", "accessibility", "seo", "navigation"].includes(areaKey)) return "public_frontend";
  if (areaKey.includes("admin") || areaKey === "settings_system") return "admin_frontend";
  if (["backend_apis", "business_logic", "database", "integrations", "payments_billing", "webhooks"].includes(areaKey)) return "backend";
  if (["testing_qa", "security", "performance", "monitoring", "deployment"].includes(areaKey)) return "qa";
  return "docs";
}

function buildCapabilityGroups() {
  return {
    "A. Product & Business": ["Product vision", "Target users", "Business goals", "Core value proposition", "Use cases", "Pricing/revenue model", "MVP scope", "Future scope", "Out of scope", "KPIs"],
    "B. Users, Access, and Journeys": ["User roles", "Permissions", "Role hierarchy", "User journey", "Onboarding", "Offboarding", "Authentication", "Authorization"],
    "C. Frontend Experience": ["Public frontend", "User portal", "Admin frontend", "Internal operations frontend", "Responsive UI", "Accessibility", "RTL/LTR", "Navigation", "Forms"],
    "D. Backend, Data, and APIs": ["Backend APIs", "Business logic", "Services", "Jobs/queues", "Database", "Migrations", "Data model", "API access", "Webhooks"],
    "E. Admin, Settings, and Customization": ["Admin panel", "Settings system", "Theme/colors/branding", "Dashboard customization", "Feature flags", "Custom fields", "Email templates"],
    "F. Engagement, Content, and Growth": ["Notifications", "Search/filtering", "Files/media", "Content management", "SEO", "Localization", "Support/help center", "Feedback"],
    "G. Commerce and Plugins": ["Payments", "Billing", "Subscriptions", "Invoices", "Coupons", "Plugins", "CRM/ERP", "Email/SMS providers", "Maps/calendar"],
    "H. Quality, Security, and Compliance": ["Security", "Audit logs", "Data governance", "Privacy/legal", "Testing/QA", "Error handling", "Performance", "Secrets policy"],
    "I. Operations and Release": ["Deployment", "Production vs publish", "Backup/recovery", "Monitoring", "Maintenance mode", "Import/export", "Scheduling/automation", "Versioning"],
    "J. Kabeeri Control Layer": ["Delivery mode", "Intake mode", "Task creation rules", "Task provenance", "AI token usage", "Owner verify", "Locks", "Prompt runs", "Cost calculator", "Dashboard state"]
  };
}

function buildCapabilityRegistry(areas = getSystemAreas()) {
  const sourceReferences = ["knowledge/standard_systems/SYSTEM_AREAS_INDEX.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"];
  return areas.map((area) => ({
    id: area.id,
    key: area.key,
    name: area.name,
    group: area.group,
    owner: mapAreaToWorkstream(area.key),
    activation_states: area.activation_states,
    question_group: area.question_group,
    source_reference: sourceReferences,
    source_type: "system_area",
    traceability: {
      capability_map: "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
      system_areas_index: "knowledge/standard_systems/SYSTEM_AREAS_INDEX.md"
    }
  }));
}

function buildCapabilityRegistryMap(registry) {
  const byGroup = {};
  const byOwner = {};
  for (const item of registry) {
    byGroup[item.group] = byGroup[item.group] || [];
    byGroup[item.group].push(item.key);
    byOwner[item.owner] = byOwner[item.owner] || [];
    byOwner[item.owner].push(item.key);
  }
  return {
    report_type: "kvdf_capability_registry",
    generated_at: new Date().toISOString(),
    total_capabilities: registry.length,
    registry,
    by_group: byGroup,
    by_owner: byOwner,
    source: "knowledge/standard_systems/SYSTEM_AREAS_INDEX.md"
  };
}

function buildCapabilitySurfaceReport(registry) {
  const commandFamilies = {
    "A. Product & Business": ["kvdf project route", "kvdf questionnaire plan", "kvdf blueprint"],
    "B. Users, Access, and Journeys": ["kvdf owner", "kvdf developer", "kvdf task assessment"],
    "C. Frontend Experience": ["kvdf design", "kvdf vibe", "kvdf prompt-pack"],
    "D. Backend, Data, and APIs": ["kvdf data-design", "kvdf migration", "kvdf release"],
    "E. Admin, Settings, and Customization": ["kvdf dashboard", "kvdf task", "kvdf policy"],
    "F. Engagement, Content, and Growth": ["kvdf docs", "kvdf prompt-pack", "kvdf example"],
    "G. Commerce and Plugins": ["kvdf github", "kvdf sync", "kvdf release"],
    "H. Quality, Security, and Compliance": ["kvdf validate", "kvdf security", "kvdf policy"],
    "I. Operations and Release": ["kvdf release", "kvdf dashboard", "kvdf handoff"],
    "J. Kabeeri Control Layer": ["kvdf task", "kvdf change report", "kvdf trace report"]
  };
  const docsSurface = [
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    "docs/site/pages/en/capabilities.html",
    "docs/site/pages/ar/capabilities.html",
    "docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json"
  ];
  const capabilities = registry.map((item) => ({
    id: item.id,
    key: item.key,
    name: item.name,
    group: item.group,
    owner: item.owner,
    cli_surface: commandFamilies[item.group] || ["kvdf capability"],
    docs_surface: docsSurface,
    source_reference: item.source_reference
  }));
  return {
    report_type: "kvdf_capability_cli_surface",
    generated_at: new Date().toISOString(),
    total_capabilities: registry.length,
    coverage: {
      total_capabilities: capabilities.length,
      complete_capabilities: capabilities.length,
      partial_capabilities: 0
    },
    capabilities
  };
}

function buildCapabilityDocMatrix(registry) {
  const rows = registry.map((item) => {
    const links = buildCapabilityDocMatrixLinks(item);
    return {
      id: item.id,
      key: item.key,
      name: item.name,
      group: item.group,
      owner: item.owner,
      docs_links: links.docs_links,
      cli_links: links.cli_links,
      runtime_links: links.runtime_links,
      test_links: links.test_links,
      report_links: links.report_links,
      coverage: {
        docs: links.docs_links.length > 0,
        cli: links.cli_links.length > 0,
        runtime: links.runtime_links.length > 0,
        tests: links.test_links.length > 0,
        reports: links.report_links.length > 0,
        complete: links.docs_links.length > 0 && links.cli_links.length > 0 && links.runtime_links.length > 0 && links.test_links.length > 0 && links.report_links.length > 0
      }
    };
  });

  const byGroup = {};
  const byOwner = {};
  for (const row of rows) {
    byGroup[row.group] = byGroup[row.group] || [];
    byGroup[row.group].push(row.key);
    byOwner[row.owner] = byOwner[row.owner] || [];
    byOwner[row.owner].push(row.key);
  }

  const completeCapabilities = rows.filter((row) => row.coverage.complete).length;
  return {
    report_type: "kvdf_capability_doc_matrix",
    generated_at: new Date().toISOString(),
    report_path: CAPABILITY_DOC_MATRIX_REPORT,
    source: "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    source_reference: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "knowledge/standard_systems/SYSTEM_AREAS_INDEX.md"],
    total_capabilities: rows.length,
    coverage: {
      total_capabilities: rows.length,
      complete_capabilities: completeCapabilities,
      partial_capabilities: rows.length - completeCapabilities
    },
    required_surfaces: ["docs", "cli", "runtime", "tests", "reports"],
    rows,
    by_group: byGroup,
    by_owner: byOwner
  };
}

function buildCapabilityDocMatrixLinks(item) {
  const docsByGroup = {
    "A. Product & Business": ["knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json", "knowledge/project_intake/README.md"],
    "B. Users, Access, and Journeys": ["knowledge/governance/TRACK_ROUTING_GOVERNANCE.md", "knowledge/task_tracking/TASK_GOVERNANCE.md"],
    "C. Frontend Experience": ["knowledge/design_system/ui_ux_reference/", "docs/site/"],
    "D. Backend, Data, and APIs": ["knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json", "knowledge/delivery_modes/"],
    "E. Admin, Settings, and Customization": ["knowledge/governance/APP_BOUNDARY_GOVERNANCE.md", "knowledge/governance/WORKSTREAM_GOVERNANCE.md"],
    "F. Engagement, Content, and Growth": ["knowledge/questionnaires/", "docs/site/"],
    "G. Commerce and Plugins": ["plugins/github_sync/", "knowledge/governance/MULTI_AI_GOVERNANCE.md"],
    "H. Quality, Security, and Compliance": ["knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md", "knowledge/task_tracking/TRACEABILITY.md"],
    "I. Operations and Release": ["docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md", "docs/reports/DOCS_SITE_SYNC_REPORT.json"],
    "J. Kabeeri Control Layer": ["knowledge/governance/EVOLUTION_STEWARD.md", "docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md"]
  };

  const cliByGroup = {
    "A. Product & Business": ["kvdf project route", "kvdf questionnaire plan", "kvdf blueprint"],
    "B. Users, Access, and Journeys": ["kvdf resume", "kvdf track status", "kvdf owner"],
    "C. Frontend Experience": ["kvdf design", "kvdf vibe", "kvdf prompt-pack"],
    "D. Backend, Data, and APIs": ["kvdf data-design", "kvdf structured", "kvdf agile"],
    "E. Admin, Settings, and Customization": ["kvdf dashboard", "kvdf policy", "kvdf task"],
    "F. Engagement, Content, and Growth": ["kvdf docs", "kvdf capture", "kvdf questionnaire"],
    "G. Commerce and Plugins": ["kvdf github", "kvdf sync", "kvdf multi-ai"],
    "H. Quality, Security, and Compliance": ["kvdf validate", "kvdf security", "kvdf policy"],
    "I. Operations and Release": ["kvdf release", "kvdf handoff", "kvdf reports"],
    "J. Kabeeri Control Layer": ["kvdf evolution", "kvdf capability", "kvdf trace"]
  };

  const runtimeByGroup = {
    "A. Product & Business": [".kabeeri/questionnaires/adaptive_intake_plan.json", ".kabeeri/project_profile.json"],
    "B. Users, Access, and Journeys": [".kabeeri/session_track.json", ".kabeeri/tasks.json"],
    "C. Frontend Experience": [".kabeeri/design_sources/", ".kabeeri/dashboard/ux_audits.json"],
    "D. Backend, Data, and APIs": [".kabeeri/data_design.json", ".kabeeri/structured.json", ".kabeeri/agile.json"],
    "E. Admin, Settings, and Customization": [".kabeeri/dashboard/", ".kabeeri/workstreams.json"],
    "F. Engagement, Content, and Growth": [".kabeeri/questionnaires/answers.json", ".kabeeri/interactions/post_work_captures.json"],
    "G. Commerce and Plugins": [".kabeeri/multi_ai_governance.json", ".kabeeri/github/team_feedback.json"],
    "H. Quality, Security, and Compliance": [".kabeeri/policies/policy_results.json", ".kabeeri/access_tokens/", ".kabeeri/locks.json"],
    "I. Operations and Release": [".kabeeri/reports/", ".kabeeri/handoff/", ".kabeeri/migrations/"],
    "J. Kabeeri Control Layer": [".kabeeri/evolution.json", ".kabeeri/reports/live_reports_state.json", ".kabeeri/task_assessments.json"]
  };

  const testLinks = [
    "tests/cli.integration.test.js",
    "tests/service.unit.test.js",
    "npm test"
  ];

  const reportLinks = [
    CAPABILITY_DOC_MATRIX_REPORT,
    "docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json",
    "docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md"
  ];

  const docsLinks = uniqueStrings([
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    ...(docsByGroup[item.group] || [])
  ]);
  const cliLinks = uniqueStrings(cliByGroup[item.group] || ["kvdf capability"]);
  const runtimeLinks = uniqueStrings(runtimeByGroup[item.group] || [".kabeeri/"]);

  return {
    docs_links: docsLinks,
    cli_links: cliLinks,
    runtime_links: runtimeLinks,
    test_links: uniqueStrings(testLinks),
    report_links: uniqueStrings(reportLinks)
  };
}

function buildCapabilitySearchReport(registry, query = "", flags = {}) {
  const surface = buildCapabilitySurfaceReport(registry);
  const matrix = buildCapabilityDocMatrix(registry);
  const roadmap = buildKVDFFeatureRestructureRoadmap({ appMode: false });
  const entries = buildCapabilitySearchEntries(registry, surface, matrix, roadmap);
  const filters = normalizeCapabilitySearchFilters(flags);
  const queryText = normalizeSearchText(query);
  const matches = entries.filter((entry) => capabilitySearchEntryMatches(entry, queryText, filters));
  const facets = summarizeCapabilitySearchFacets(matches);
  return {
    report_type: "kvdf_capability_search_index",
    generated_at: new Date().toISOString(),
    query: queryText,
    filters,
    sources: {
      capability_registry: "knowledge/standard_systems/SYSTEM_AREAS_INDEX.md",
      capability_surface: CAPABILITY_SURFACE_REPORT,
      capability_doc_matrix: CAPABILITY_DOC_MATRIX_REPORT,
      evolution_roadmap: "docs/reports/EVOLUTION_PRIORITIES_SUMMARY.md"
    },
    total_entries: entries.length,
    total_matches: matches.length,
    index: {
      total_entries: entries.length,
      facets: summarizeCapabilitySearchFacets(entries),
      entries
    },
    facets,
    results: matches
  };
}

function buildCapabilitySearchEntries(registry, surface, matrix, roadmap) {
  const surfaceByKey = new Map(surface.capabilities.map((item) => [item.key, item]));
  const matrixByKey = new Map(matrix.rows.map((item) => [item.key, item]));
  const entries = [];

  for (const item of registry) {
    const surfaceRow = surfaceByKey.get(item.key) || null;
    const matrixRow = matrixByKey.get(item.key) || null;
    const cliSurface = surfaceRow ? surfaceRow.cli_surface : [];
    const cliLinks = matrixRow ? matrixRow.cli_links : [];
    entries.push({
      kind: "capability",
      report_type: "kvdf_capability_registry",
      track: deriveCapabilitySearchTrack(cliSurface.length ? cliSurface : cliLinks),
      phase: item.group,
      capability: item.key,
      capability_name: item.name,
      command: uniqueStrings([...(cliSurface || []), ...(cliLinks || [])]).join(", "),
      summary: `Capability registry entry for ${item.name}`,
      owner: item.owner,
      source: item.source_reference.join(", "),
      search_text: normalizeSearchText([
        item.key,
        item.name,
        item.group,
        item.owner,
        ...(cliSurface || []),
        ...(cliLinks || []),
        "kvdf capability registry"
      ].join(" "))
    });
  }

  for (const item of surface.capabilities) {
    entries.push({
      kind: "surface",
      report_type: "kvdf_capability_cli_surface",
      track: deriveCapabilitySearchTrack(item.cli_surface),
      phase: item.group,
      capability: item.key,
      capability_name: item.name,
      command: uniqueStrings(item.cli_surface || []).join(", "),
      summary: `Capability CLI surface for ${item.name}`,
      owner: item.owner,
      source: item.source_reference.join(", "),
      search_text: normalizeSearchText([
        item.key,
        item.name,
        item.group,
        item.owner,
        ...(item.cli_surface || []),
        ...(item.docs_surface || []),
        "kvdf capability surface"
      ].join(" "))
    });
  }

  for (const item of matrix.rows) {
    entries.push({
      kind: "matrix",
      report_type: "kvdf_capability_doc_matrix",
      track: deriveCapabilitySearchTrack(item.cli_links),
      phase: item.coverage.complete ? "complete" : "partial",
      capability: item.key,
      capability_name: item.name,
      command: uniqueStrings(item.cli_links || []).join(", "),
      summary: `Capability documentation matrix for ${item.name}`,
      owner: item.owner,
      source: uniqueStrings([...(item.docs_links || []), ...(item.report_links || [])]).join(", "),
      search_text: normalizeSearchText([
        item.key,
        item.name,
        item.group,
        item.owner,
        ...(item.docs_links || []),
        ...(item.cli_links || []),
        ...(item.runtime_links || []),
        ...(item.test_links || []),
        ...(item.report_links || []),
        item.coverage.complete ? "complete" : "partial",
        "kvdf capability matrix"
      ].join(" "))
    });
  }

  for (const item of roadmap.roadmap || []) {
    entries.push({
      kind: "roadmap",
      report_type: "kvdf_feature_restructure_roadmap",
      track: "framework_owner",
      phase: `phase-${item.order}`,
      capability: item.id,
      capability_name: item.title,
      command: uniqueStrings(item.cli_surface || []).join(", "),
      summary: item.purpose,
      owner: "framework_owner",
      source: uniqueStrings(item.docs_surface || []).join(", "),
      search_text: normalizeSearchText([
        item.id,
        item.title,
        item.purpose,
        item.done_definition,
        ...(item.cli_surface || []),
        ...(item.docs_surface || []),
        `phase-${item.order}`,
        "kvdf evolution roadmap"
      ].join(" "))
    });
  }

  return entries;
}

function capabilitySearchEntryMatches(entry, queryText, filters = {}) {
  if (filters.track && !normalizeSearchText(entry.track).includes(filters.track)) return false;
  if (filters.capability && !entry.search_text.includes(filters.capability)) return false;
  if (filters.command && !entry.search_text.includes(filters.command)) return false;
  if (filters.phase && !normalizeSearchText(entry.phase).includes(filters.phase)) return false;
  if (filters.report_type && !normalizeSearchText(entry.report_type).includes(filters.report_type)) return false;
  if (queryText && !entry.search_text.includes(queryText)) return false;
  return true;
}

function normalizeCapabilitySearchFilters(flags = {}) {
  return {
    track: normalizeSearchText(flags.track || flags.surface || ""),
    capability: normalizeSearchText(flags.capability || flags.key || flags.name || ""),
    command: normalizeSearchText(flags.command || flags.cli || ""),
    phase: normalizeSearchText(flags.phase || ""),
    report_type: normalizeSearchText(flags["report-type"] || flags.reportType || flags.report || "")
  };
}

function summarizeCapabilitySearchFacets(entries) {
  return {
    track: summarizeBy(entries, "track"),
    phase: summarizeBy(entries, "phase"),
    report_type: summarizeBy(entries, "report_type"),
    kind: summarizeBy(entries, "kind")
  };
}

function renderCapabilitySearchReport(report, tableRenderer) {
  const lines = [
    "Capability Search Index",
    "",
    `Query: ${report.query || "(none)"}`,
    `Filters: ${Object.entries(report.filters).filter(([, value]) => value).map(([key, value]) => `${key}=${value}`).join(", ") || "none"}`,
    `Matches: ${report.total_matches}/${report.total_entries}`,
    ""
  ];

  if (report.total_matches === 0) {
    lines.push("No matching capability records found.");
    return lines.join("\n");
  }

  lines.push("Top matches:");
  const rows = report.results.slice(0, 20).map((item, index) => [
    String(index + 1),
    item.kind,
    item.track,
    item.capability,
    item.phase,
    item.report_type,
    item.command || item.summary
  ]);
  lines.push(tableRenderer(["#", "Kind", "Track", "Capability", "Phase", "Report Type", "Command / Summary"], rows));
  lines.push("");
  lines.push(`Track facets: ${Object.entries(report.facets.track || {}).map(([key, value]) => `${key}:${value}`).join(", ") || "none"}`);
  lines.push(`Phase facets: ${Object.entries(report.facets.phase || {}).map(([key, value]) => `${key}:${value}`).join(", ") || "none"}`);
  lines.push(`Report type facets: ${Object.entries(report.facets.report_type || {}).map(([key, value]) => `${key}:${value}`).join(", ") || "none"}`);
  return lines.join("\n");
}

function writeCapabilitySearchReport(report) {
  fs.mkdirSync(path.dirname(path.join(repoRoot(), CAPABILITY_SEARCH_INDEX_REPORT)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), CAPABILITY_SEARCH_INDEX_REPORT), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function deriveCapabilitySearchTrack(commands = []) {
  const commandList = (Array.isArray(commands) ? commands : [commands]).map((item) => normalizeSearchText(item));
  if (commandList.some((item) => item.includes("kvdf evolution") || item.includes("kvdf owner") || item.includes("kvdf plugins"))) return "framework_owner";
  if (commandList.some((item) => item.includes("kvdf vibe") || item.includes("kvdf questionnaire") || item.includes("kvdf blueprint") || item.includes("kvdf data design") || item.includes("kvdf design") || item.includes("kvdf prompt pack"))) return "app_developer";
  if (commandList.some((item) => item.includes("kvdf resume") || item.includes("kvdf validate") || item.includes("kvdf sync") || item.includes("kvdf dashboard") || item.includes("kvdf capability"))) return "shared";
  return "shared";
}

function uniqueStrings(values) {
  return [...new Set((values || []).map((item) => String(item).trim()).filter(Boolean))];
}

function summarizeBy(items, key) {
  return (items || []).reduce((summary, item) => {
    const value = item && item[key] ? item[key] : "unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function writeCapabilitySurfaceReport(report) {
  fs.mkdirSync(path.dirname(path.join(repoRoot(), CAPABILITY_SURFACE_REPORT)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), CAPABILITY_SURFACE_REPORT), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function writeCapabilityDocMatrixReport(report) {
  fs.mkdirSync(path.dirname(path.join(repoRoot(), CAPABILITY_DOC_MATRIX_REPORT)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), CAPABILITY_DOC_MATRIX_REPORT), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function getSystemAreas() {
  const names = [
    ["product_business", "Product & Business", "A. Product & Business"],
    ["users_roles", "Users & Roles", "B. Users, Access, and Journeys"],
    ["permissions", "Permissions", "B. Users, Access, and Journeys"],
    ["user_journeys", "User Journeys", "B. Users, Access, and Journeys"],
    ["onboarding", "Onboarding", "B. Users, Access, and Journeys"],
    ["offboarding", "Offboarding", "B. Users, Access, and Journeys"],
    ["public_frontend", "Public Frontend", "C. Frontend Experience"],
    ["user_frontend", "User Frontend", "C. Frontend Experience"],
    ["admin_frontend", "Admin Frontend", "C. Frontend Experience"],
    ["internal_operations_frontend", "Internal Operations Frontend", "C. Frontend Experience"],
    ["backend_apis", "Backend APIs", "D. Backend, Data, and APIs"],
    ["business_logic", "Business Logic", "D. Backend, Data, and APIs"],
    ["database", "Database", "D. Backend, Data, and APIs"],
    ["authentication", "Authentication", "B. Users, Access, and Journeys"],
    ["authorization", "Authorization", "B. Users, Access, and Journeys"],
    ["admin_panel", "Admin Panel", "E. Admin, Settings, and Customization"],
    ["settings_system", "Settings System", "E. Admin, Settings, and Customization"],
    ["theme_branding", "Theme / Colors / Branding / Design Tokens", "E. Admin, Settings, and Customization"],
    ["dashboard_customization", "Dashboard Customization", "E. Admin, Settings, and Customization"],
    ["notifications", "Notifications", "F. Engagement, Content, and Growth"],
    ["search_filtering", "Search & Filtering", "F. Engagement, Content, and Growth"],
    ["files_media", "Files & Media", "F. Engagement, Content, and Growth"],
    ["reports_analytics", "Reports & Analytics", "F. Engagement, Content, and Growth"],
    ["audit_logs", "Audit Logs", "H. Quality, Security, and Compliance"],
    ["security", "Security", "H. Quality, Security, and Compliance"],
    ["integrations", "Plugins", "G. Commerce and Plugins"],
    ["payments_billing", "Payments / Billing", "G. Commerce and Plugins"],
    ["seo", "SEO", "F. Engagement, Content, and Growth"],
    ["localization_languages", "Localization / Languages", "F. Engagement, Content, and Growth"],
    ["accessibility", "Accessibility", "C. Frontend Experience"],
    ["performance", "Performance", "H. Quality, Security, and Compliance"],
    ["error_handling", "Error Handling", "H. Quality, Security, and Compliance"],
    ["testing_qa", "Testing / QA", "H. Quality, Security, and Compliance"],
    ["deployment", "Deployment", "I. Operations and Release"],
    ["production_publish", "Production vs Publish", "I. Operations and Release"],
    ["backup_recovery", "Backup / Recovery", "I. Operations and Release"],
    ["monitoring", "Monitoring", "I. Operations and Release"],
    ["documentation", "Documentation", "I. Operations and Release"],
    ["support_help_center", "Support / Help Center", "F. Engagement, Content, and Growth"],
    ["legal_compliance", "Legal / Compliance", "H. Quality, Security, and Compliance"],
    ["content_management", "Content Management", "F. Engagement, Content, and Growth"],
    ["workflows_approvals", "Workflows / Approvals", "I. Operations and Release"],
    ["multi_tenancy", "Multi-Tenancy", "G. Commerce and Plugins"],
    ["feature_flags", "Feature Flags", "E. Admin, Settings, and Customization"],
    ["data_import_export", "Data Import / Export", "I. Operations and Release"],
    ["scheduling_automation", "Scheduling / Automation", "I. Operations and Release"],
    ["ai_product_features", "AI Product Features", "F. Engagement, Content, and Growth"],
    ["data_governance", "Data Governance", "H. Quality, Security, and Compliance"],
    ["tenant_admin_customization", "Tenant / Admin Customization", "E. Admin, Settings, and Customization"],
    ["email_notification_templates", "Email / Notification Templates", "E. Admin, Settings, and Customization"],
    ["dynamic_forms_custom_fields", "Dynamic Forms / Custom Fields", "E. Admin, Settings, and Customization"],
    ["versioning_api_versioning", "Versioning / API Versioning", "I. Operations and Release"],
    ["kabeeri_control_layer", "Kabeeri Development Control Layer", "J. Kabeeri Control Layer"]
  ];
  return names.map(([key, name, group], index) => ({
    id: index + 1,
    key,
    name,
    group,
    activation_states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    question_group: group.replace(/^[A-J]\. /, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  }));
}

module.exports = {
  capability,
  getSuggestedQuestionsForArea,
  mapAreaToWorkstream,
  buildCapabilityGroups,
  buildCapabilityRegistry,
  buildCapabilityDocMatrix,
  buildCapabilitySearchReport,
  getSystemAreas
};

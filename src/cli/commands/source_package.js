const fs = require("fs");
const path = require("path");

const { fileExists, repoRoot } = require("../fs_utils");
const { readJsonFile } = require("../workspace");
const { table } = require("../ui");
const { getSystemAreas, buildCapabilityRegistry } = require("./capability");

function sourcePackage(action, value, flags = {}) {
  const mode = normalizeSourcePackageAction(action);

  if (!mode || mode === "status" || mode === "help" || mode === "list" || mode === "summary") {
    const report = buildSourcePackageSummary();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderSourcePackageSummary(report);
    return;
  }

  if (mode === "study" || mode === "report") {
    const study = withMarkdownReport(buildSourcePackageStudy(), "docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md");
    if (flags.json) console.log(JSON.stringify(study, null, 2));
    else renderSourcePackageStudy(study);
    return;
  }

  if (mode === "inventory" || mode === "scan") {
    const inventory = withMarkdownReport(buildSourcePackageInventory(), "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md");
    if (flags.json) console.log(JSON.stringify(inventory, null, 2));
    else renderSourcePackageInventory(inventory);
    return;
  }

  if (mode === "map" || mode === "destination" || mode === "destinations") {
    const destinationMap = withMarkdownReport(buildSourcePackageDestinationMap(), "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md");
    if (flags.json) console.log(JSON.stringify(destinationMap, null, 2));
    else renderSourcePackageDestinationMap(destinationMap);
    return;
  }

  if (mode === "source-map" || mode === "source-capability-mapping" || mode === "source-capability-map") {
    const mapping = withMarkdownReport(buildSourcePackageCapabilityMapping(), "docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md");
    if (flags.json) console.log(JSON.stringify(mapping, null, 2));
    else renderSourcePackageCapabilityMapping(mapping);
    return;
  }

  if (mode === "placement" || mode === "crosswalk-plan") {
    const placement = buildSourcePackagePlacementPlan();
    if (flags.json) console.log(JSON.stringify(placement, null, 2));
    else renderSourcePackagePlacementPlan(placement);
    return;
  }

  if (mode === "normalize" || mode === "normalization" || mode === "normalize-map" || mode === "source-normalization") {
    const normalization = buildSourcePackageNormalizationPlan();
    if (flags.json) console.log(JSON.stringify(normalization, null, 2));
    else renderSourcePackageNormalizationPlan(normalization);
    return;
  }

  if (mode === "compare" || mode === "duplicates" || mode === "analysis" || mode === "analyze") {
    const comparison = buildSourcePackageDuplicateAnalysis();
    if (flags.json) console.log(JSON.stringify(comparison, null, 2));
    else renderSourcePackageDuplicateAnalysis(comparison);
    return;
  }

  if (mode === "verify" || mode === "validate" || mode === "check") {
    const verification = buildSourcePackageVerification();
    if (flags.json) console.log(JSON.stringify(verification, null, 2));
    else renderSourcePackageVerification(verification);
    if (verification.status === "fail") process.exitCode = 1;
    return;
  }

  if (mode === "migration" || mode === "state" || mode === "redistribution") {
    const migration = buildSourcePackageMigrationState();
    if (flags.json) console.log(JSON.stringify(migration, null, 2));
    else renderSourcePackageMigrationState(migration);
    if (migration.status === "fail") process.exitCode = 1;
    return;
  }

  if (mode === "manifest" || mode === "relocation" || mode === "crosswalk") {
    const manifest = buildSourcePackageRelocationManifest();
    if (flags.json) console.log(JSON.stringify(manifest, null, 2));
    else renderSourcePackageRelocationManifest(manifest);
    return;
  }

  if (mode === "cleanup") {
    const cleanup = buildSourcePackageCleanupPlan();
    if (flags.json) console.log(JSON.stringify(cleanup, null, 2));
    else renderSourcePackageCleanupPlan(cleanup);
    return;
  }

  if (mode === "decommission" || mode === "remove") {
    const cleanup = buildSourcePackageCleanupPlan();
    const decommission = buildSourcePackageDecommissionRequest(cleanup, flags);
    if (flags.json) console.log(JSON.stringify(decommission, null, 2));
    else renderSourcePackageDecommissionRequest(decommission);
    return;
  }

  if (mode === "path") {
    console.log([
      "docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md",
      "docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_PLACEMENT_PLAN.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_CLEANUP_PLAN.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_DECOMMISSION_REQUEST.md"
    ].join("\n"));
    return;
  }

  throw new Error(`Unknown source-package action: ${action}`);
}

function normalizeSourcePackageAction(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function buildSourcePackageSummary() {
  const inventory = buildSourcePackageInventory();
  const destinationMap = buildSourcePackageDestinationMap();
  const study = buildSourcePackageStudy();
  const verification = buildSourcePackageVerification();
  const normalization = buildSourcePackageNormalizationPlan();
  const migration = buildSourcePackageMigrationState();
  const manifest = buildSourcePackageRelocationManifest();
  const placement = buildSourcePackagePlacementPlan();
  return {
    report_type: "kvdf_source_package_summary",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    source_folder_exists: inventory.source_folder_exists,
    status: verification.status,
    systems: inventory.systems,
    file_total: inventory.file_total,
    branch_total: inventory.branch_total,
    study_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md",
    inventory_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md",
    destination_map_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md",
    capability_mapping_report: "docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md",
    placement_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_PLACEMENT_PLAN.md",
    normalization_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md",
    migration_report: "docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md",
    relocation_manifest: "docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json",
    destination_targets: destinationMap.destinations.length,
    next_actions: verification.next_actions,
    source_package_roles: study.source_package_roles,
    normalization_report: normalization.report_path,
    normalized_root_total: normalization.summary.normalized_roots,
    migration_status: migration.status,
    permanent_targets: migration.permanent_targets.length,
    relocation_sections: manifest.sections.length,
    placement_routes: placement.routes.length
  };
}

function buildSourcePackageStudy() {
  return {
    report_type: "kvdf_source_package_study",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    source_package_roles: [
      "Software Design System reference library",
      "Project documentation generator system"
    ],
    CLI_learning_modes: [
      "extract reusable patterns into permanent Kabeeri knowledge",
      "keep all learning flows CLI-driven",
      "treat the source as temporary until redistribution is complete"
    ],
    source_reports: {
      study: "docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md",
      inventory: "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md",
      destination_map: "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md"
    }
  };
}

function buildSourcePackageInventory() {
  const root = path.join(repoRoot(), "KVDF_New_Features_Docs");
  const source_folder_exists = fs.existsSync(root);
  const items = source_folder_exists ? collectFiles(root) : [];
  const file_total = items.length;
  const branchTotals = {
    software_design_system: 0,
    project_docs_generator: 0,
    other: 0
  };
  const extensionTotals = {};
  for (const item of items) {
    const branch = classifySourceBranch(item.relative_path);
    branchTotals[branch] = (branchTotals[branch] || 0) + 1;
    const ext = path.extname(item.relative_path).toLowerCase() || "[none]";
    extensionTotals[ext] = (extensionTotals[ext] || 0) + 1;
  }
  const topLevel = collectTopLevelCounts(items);
  const systems = [
    {
      system_id: "software_design_system",
      title: "Software Design System",
      count: branchTotals.software_design_system,
      top_level: topLevel["software design system to follow"] || 0
    },
    {
      system_id: "project_docs_generator",
      title: "Project Documentation Generator System",
      count: branchTotals.project_docs_generator,
      top_level: topLevel["software project docs sys to generate"] || 0
    }
  ];
  return {
    report_type: "kvdf_source_package_inventory",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    source_folder_exists,
    file_total,
    branch_total: Object.values(branchTotals).reduce((sum, value) => sum + value, 0),
    systems,
    branch_totals: branchTotals,
    extension_totals: extensionTotals,
    top_level_folders: topLevel,
    inventory_reports: [
      "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md"
    ]
  };
}

function buildSourcePackageDestinationMap() {
  return {
    report_type: "kvdf_source_package_destination_map",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    destinations: [
      {
        stream: "software_design_system",
        destinations: [
          "knowledge/design_system/software_design_reference/",
          "knowledge/governance/",
          "knowledge/standard_systems/",
          "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
          "docs/site/",
          "docs/reports/"
        ]
      },
      {
        stream: "project_docs_generator",
        destinations: [
          "knowledge/documentation_generator/",
          "docs/site/",
          "docs/cli/CLI_COMMAND_REFERENCE.md",
          "knowledge/task_tracking/",
          "knowledge/governance/",
          "docs/reports/"
        ]
      }
    ],
    supporting_reports: [
      "docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md",
      "docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md"
    ]
  };
}

function buildSourcePackageCapabilityMapping() {
  const registry = buildCapabilityRegistry(getSystemAreas());
  const sourceMap = [
    {
      source_package: "KVDF_New_Features_Docs/software design system to follow",
      source_classes: ["00_START", "01_CORE", "02_PACKS", "99_ARCH"],
      capability_surface: [
        "kvdf capability registry",
        "kvdf capability map",
        "kvdf software-design compare"
      ],
      runtime_target: [
        "knowledge/design_system/software_design_reference/",
        "knowledge/governance/",
        "knowledge/standard_systems/",
        "docs/SYSTEM_CAPABILITIES_REFERENCE.md"
      ],
      docs_page: [
        "knowledge/design_system/software_design_reference/README.md",
        "docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md",
        "docs/reports/KVDF_NEW_FEATURES_DOCS_PLACEMENT_PLAN.md"
      ],
      cli_command: [
        "kvdf source-package study",
        "kvdf source-package map",
        "kvdf source-package compare",
        "kvdf capability registry",
        "kvdf capability registry map"
      ],
      capability_ownership: summarizeBy(registry, "owner")
    },
    {
      source_package: "KVDF_New_Features_Docs/software project docs sys to generate",
      source_classes: ["r001.md-r015.md", "r006.csv-r010.json", "p00-p28"],
      capability_surface: [
        "kvdf source-package study",
        "kvdf docs-generator compare",
        "kvdf validate docs-source-truth"
      ],
      runtime_target: [
        "knowledge/documentation_generator/",
        "knowledge/task_tracking/",
        "knowledge/governance/",
        "docs/cli/CLI_COMMAND_REFERENCE.md",
        "docs/site/"
      ],
      docs_page: [
        "knowledge/documentation_generator/README.md",
        "docs/reports/KVDF_NEW_FEATURES_DOCS_PLACEMENT_PLAN.md",
        "docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md"
      ],
      cli_command: [
        "kvdf source-package inventory",
        "kvdf source-package verify",
        "kvdf docs-generator compare",
        "kvdf validate docs-source-truth"
      ],
      capability_ownership: summarizeBy(registry, "group")
    }
  ];
  const report = {
    report_type: "kvdf_source_capability_mapping",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    mappings: sourceMap,
    registry_total: registry.length,
    registry_source: "knowledge/standard_systems/CAPABILITY_REGISTRY.md"
  };
  const reportPath = "docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md";
  const reportMarkdown = renderSourcePackageCapabilityMappingMarkdown(report);
  fs.mkdirSync(path.dirname(path.join(repoRoot(), reportPath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: reportMarkdown
  };
}

function buildSourcePackagePlacementPlan() {
  const routes = [
    {
      route_id: "software_design_core",
      stream: "software_design_system",
      source_class: "00_START",
      destination: "knowledge/governance/",
      note: "Keep routing, manifest, and intake rules in governance."
    },
    {
      route_id: "software_design_policy",
      stream: "software_design_system",
      source_class: "01_CORE",
      destination: "knowledge/governance/",
      note: "Core operating rules belong in governance."
    },
    {
      route_id: "software_design_patterns",
      stream: "software_design_system",
      source_class: "02_PACKS",
      destination: "knowledge/design_system/software_design_reference/",
      note: "Reusable analyzed design patterns belong in the permanent reference."
    },
    {
      route_id: "software_design_catalogs",
      stream: "software_design_system",
      source_class: "02_PACKS",
      destination: "knowledge/standard_systems/",
      note: "Normalized maps and stable catalogs belong in standard systems."
    },
    {
      route_id: "software_design_traceability",
      stream: "software_design_system",
      source_class: "99_ARCH",
      destination: "docs/reports/",
      note: "Archive evidence and traceability belong in reports."
    },
    {
      route_id: "docs_generator_lifecycle",
      stream: "project_docs_generator",
      source_class: "r001.md-r015.md",
      destination: "knowledge/documentation_generator/",
      note: "Reusable lifecycle guidance belongs in the permanent documentation generator reference."
    },
    {
      route_id: "docs_generator_tasks",
      stream: "project_docs_generator",
      source_class: "r001.md-r015.md",
      destination: "knowledge/task_tracking/",
      note: "Lifecycle and coverage behavior belong in task tracking."
    },
    {
      route_id: "docs_generator_governance",
      stream: "project_docs_generator",
      source_class: "r001.md-r015.md",
      destination: "knowledge/governance/",
      note: "Phase gates and policy rules belong in governance."
    },
    {
      route_id: "docs_generator_site",
      stream: "project_docs_generator",
      source_class: "p00-p28",
      destination: "docs/site/",
      note: "Rendered docs pages and navigation belong in the docs site."
    },
    {
      route_id: "docs_generator_reports",
      stream: "project_docs_generator",
      source_class: "r006.csv-r010.json",
      destination: "docs/reports/",
      note: "Machine-readable mapping and traceability data belong in reports."
    }
  ];
  const report = {
    report_type: "kvdf_source_package_placement_plan",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    routes,
    summary: {
      software_design_routes: routes.filter((item) => item.stream === "software_design_system").length,
      documentation_routes: routes.filter((item) => item.stream === "project_docs_generator").length,
      destinations: [...new Set(routes.map((item) => item.destination))].length
    }
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_PLACEMENT_PLAN.md";
  const reportMarkdown = renderSourcePackagePlacementPlanMarkdown(report);
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: reportMarkdown
  };
}

function buildSourcePackageNormalizationPlan() {
  const inventory = buildSourcePackageInventory();
  const manifest = buildSourcePackageRelocationManifest();
  const normalizedRoots = Object.keys(inventory.top_level_folders || {}).sort().map((item) => ({
    source_root: item,
    normalized_root: normalizeSourcePackageSlug(item),
    file_count: inventory.top_level_folders[item]
  }));
  const sections = (manifest.sections || []).map((section) => {
    const normalizedTargets = (section.targets || []).map((target) => ({
      ...target,
      normalized_source_class: normalizeSourcePackageSlug(target.source_class),
      normalized_destination: normalizeSourcePackagePath(target.destination)
    }));
    return {
      section_id: section.section_id,
      title: section.title,
      source_root: section.source_root,
      normalized_source_root: normalizeSourcePackageSlug(section.source_root),
      normalized_section_slug: normalizeSourcePackageSlug(section.section_id || section.title),
      targets: normalizedTargets
    };
  });
  const preservedMappings = [
    ...normalizedRoots.map((item) => ({
      source: item.source_root,
      normalized: item.normalized_root,
      kind: "root"
    })),
    ...sections.flatMap((section) => (section.targets || []).map((target) => ({
      source: target.source_class,
      normalized: target.normalized_source_class,
      kind: "source_class"
    })))
  ];
  const report = {
    report_type: "kvdf_source_package_normalization_map",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    source_folder_exists: inventory.source_folder_exists,
    normalized_roots: normalizedRoots,
    sections,
    preserved_mappings: preservedMappings,
    summary: {
      normalized_roots: normalizedRoots.length,
      normalized_sections: sections.length,
      preserved_mappings: preservedMappings.length
    },
    next_actions: inventory.source_folder_exists ? [
      "Use the normalized root and section aliases when moving content into permanent Kabeeri folders.",
      "Keep the original source folder names in the mapping until all references are updated.",
      "Re-run source-package verify before scheduling decommissioning."
    ] : [
      "Capture the source folder inventory before normalization.",
      "Preserve the mapping report so the lowercase structure can be reconstructed later."
    ]
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md";
  const reportMarkdown = renderSourcePackageNormalizationPlanMarkdown(report);
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: reportMarkdown
  };
}

function buildSourcePackageDuplicateAnalysis() {
  const study = buildSourcePackageStudy();
  const inventory = buildSourcePackageInventory();
  const destinationMap = buildSourcePackageDestinationMap();
  const corpus = collectSourcePackageCorpus(study, inventory, destinationMap);
  const areas = getSystemAreas();
  const matches = areas.map((area) => {
    const signal = scoreAreaAgainstCorpus(area, corpus);
    return {
      area_id: area.id,
      area_key: area.key,
      area_name: area.name,
      group: area.group,
      score: signal.score,
      matched_terms: signal.matched_terms,
      duplicate_risk: signal.score >= 4 ? "high" : signal.score >= 2 ? "medium" : signal.score > 0 ? "low" : "none"
    };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.area_name.localeCompare(b.area_name));
  const topMatches = matches.slice(0, 12);
  const duplicateCandidates = matches.filter((item) => item.score >= 2);
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md";
  const reportMarkdown = renderSourcePackageDuplicateAnalysisMarkdown({
    topMatches,
    duplicateCandidates,
    sourcePackage: "KVDF_New_Features_Docs"
  });
  fs.mkdirSync(path.dirname(path.join(repoRoot(), reportPath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    report_type: "kvdf_source_package_duplicate_analysis",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    source_streams: [
      "Software Design System reference library",
      "Project documentation generator system"
    ],
    duplicate_risk: duplicateCandidates.length ? "review_required" : "low",
    top_matches: topMatches,
    duplicate_candidates: duplicateCandidates,
    report_path: reportPath,
    report_markdown: reportMarkdown,
    corpus_signals: {
      study_keywords: corpus.study_keywords.length,
      inventory_paths: corpus.inventory_paths.length,
      destination_targets: corpus.destination_targets.length
    },
    next_actions: duplicateCandidates.length ? [
      "Reuse the existing Kabeeri capability names instead of creating a new duplicate surface.",
      "Move only the missing gaps into permanent folders.",
      "Update the source-package redistribution map before adding new runtime behavior."
    ] : [
      "No strong capability duplicates found.",
      "Proceed with extracting the non-duplicate parts into permanent Kabeeri folders."
    ]
  };
}

function renderSourcePackageDuplicateAnalysisMarkdown(report) {
  const topRows = (report.topMatches || []).map((item) => `| ${item.area_name} | ${item.duplicate_risk} | ${item.score} | ${(item.matched_terms || []).join(", ")} |`).join("\n");
  const candidateRows = (report.duplicateCandidates || []).map((item) => `| ${item.area_name} | ${item.duplicate_risk} | ${item.score} |`).join("\n");
  return [
    "# KVDF New Features Docs Duplicate Analysis",
    "",
    "## Purpose",
    "",
    "Compare the Software Design System source package against the current Kabeeri capability map so we avoid recreating existing capabilities under new names.",
    "",
    "## Top Matches",
    "",
    "| Area | Risk | Score | Matched Terms |",
    "| --- | --- | ---: | --- |",
    topRows || "| No matches found | none | 0 | |",
    "",
    "## Duplicate Candidates",
    "",
    "| Area | Risk | Score |",
    "| --- | --- | ---: |",
    candidateRows || "| None | none | 0 |",
    "",
    "## Bottom Line",
    "",
    report.duplicateCandidates && report.duplicateCandidates.length
      ? "The source package overlaps with multiple existing capability areas, so the missing work should be extracted without inventing duplicate capability names."
      : "No strong overlap found. Proceed with extraction while keeping the existing capability names as the source of truth."
  ].join("\n");
}

function collectSourcePackageCorpus(study, inventory, destinationMap) {
  const studyText = [
    study.source_package,
    ...(study.source_package_roles || []),
    ...(study.CLI_learning_modes || []),
    JSON.stringify(study.source_reports || {}),
    readReportMarkdown(study.source_reports && study.source_reports.study),
    readReportMarkdown(study.source_reports && study.source_reports.inventory),
    readReportMarkdown(study.source_reports && study.source_reports.destination_map)
  ].filter(Boolean).join("\n").toLowerCase();
  const inventoryPaths = [];
  for (const item of Object.keys(inventory.top_level_folders || {})) inventoryPaths.push(item);
  for (const system of inventory.systems || []) inventoryPaths.push(system.title);
  const destinationTargets = (destinationMap.destinations || []).flatMap((item) => item.destinations || []);
  return {
    study_keywords: tokenize(studyText),
    inventory_paths: tokenize(inventoryPaths.join("\n")),
    destination_targets: tokenize(destinationTargets.join("\n")),
    raw_text: studyText
  };
}

function readReportMarkdown(reportPath) {
  if (!reportPath) return "";
  if (!fileExists(reportPath)) return "";
  return fs.readFileSync(path.join(repoRoot(), reportPath), "utf8");
}

function scoreAreaAgainstCorpus(area, corpus) {
  const keywords = new Set(tokenize([area.key, area.name, area.group].join(" ")));
  const extraKeywords = getAreaAliasKeywords(area.key);
  for (const keyword of extraKeywords) keywords.add(keyword);
  const matchedTerms = [];
  let score = 0;
  for (const keyword of keywords) {
    if (keyword.length < 3) continue;
    const hit =
      corpus.raw_text.includes(keyword) ||
      corpus.study_keywords.includes(keyword) ||
      corpus.inventory_paths.includes(keyword) ||
      corpus.destination_targets.includes(keyword);
    if (hit) {
      matchedTerms.push(keyword);
      score += 1;
    }
  }
  return { score, matched_terms: [...new Set(matchedTerms)].slice(0, 12) };
}

function getAreaAliasKeywords(areaKey) {
  const aliases = {
    documentation: ["docs", "document", "documentation", "doc", "readme", "site"],
    testing_qa: ["tests", "qa", "test", "verify", "validation"],
    security: ["security", "safe", "secrets", "privacy", "governance"],
    business_logic: ["logic", "workflow", "rules", "flows"],
    backend_apis: ["api", "backend", "service", "runtime"],
    admin_panel: ["admin", "owner", "panel", "governance"],
    settings_system: ["settings", "config", "preferences"],
    product_business: ["product", "market", "domain", "blueprint"],
    reports_analytics: ["report", "reports", "analytics", "summary"],
    multi_tenancy: ["tenant", "workspace", "isolation", "multi", "company"],
    integrations: ["integration", "sync", "github", "vscode", "wordpress"],
    content_management: ["content", "page", "pages", "docs"],
    workflows_approvals: ["workflow", "approvals", "lifecycle", "governance"],
    data_governance: ["schema", "data", "validation", "traceability"],
    ai_product_features: ["ai", "prompt", "llm", "agent", "codex"],
    kabeeri_control_layer: ["kabeeri", "cli", "task", "evolution", "owner", "budget"]
  };
  return aliases[areaKey] || [];
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[`"'()[\]{}<>.,:;!?/\\|-]+/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.length >= 3);
}

function summarizeBy(items, key) {
  return (items || []).reduce((summary, item) => {
    const value = item && item[key] ? item[key] : "unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function buildSourcePackageVerification() {
  const inventory = buildSourcePackageInventory();
  const destinationMap = buildSourcePackageDestinationMap();
  const migration = buildSourcePackageMigrationState();
  const decommissionRecordExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_DECOMMISSION_RECORD.md");
  const studyExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md");
  const inventoryExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md");
  const destinationMapExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md");
  const normalizationExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md");
  const migrationExists = fileExists("docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md");
  const redistributionComplete = studyExists && inventoryExists && destinationMapExists && normalizationExists && migrationExists;
  const ready = redistributionComplete && (inventory.source_folder_exists || decommissionRecordExists);
  const decommissioned = redistributionComplete && decommissionRecordExists && !inventory.source_folder_exists;
  return {
    report_type: "kvdf_source_package_verification",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    status: decommissioned ? "decommissioned" : ready ? "migration_in_progress" : "fail",
    reports_present: {
      study: studyExists,
      inventory: inventoryExists,
      destination_map: destinationMapExists,
      normalization_map: normalizationExists,
      migration_state: migrationExists,
      decommission_record: decommissionRecordExists
    },
    source_folder_exists: inventory.source_folder_exists,
    decommission_record_exists: decommissionRecordExists,
    branch_totals: inventory.branch_totals,
    next_actions: decommissioned
      ? [
        "No further source-package cleanup is required.",
        "Keep the decommission record and redistributed reports as the permanent audit trail.",
        "Continue using the permanent Kabeeri folders instead of the removed source package."
      ]
      : ready
      ? [
          "Continue extracting the Software Design System into permanent Kabeeri knowledge folders.",
          "Continue extracting the project documentation generator into docs, task-tracking, and governance surfaces.",
          "Preserve the lowercase normalization map while moving the source package into the permanent folders.",
          "Run kabeeri-077 only after redistribution is complete."
        ]
      : [
          "Create the study, inventory, and destination map reports first.",
          "Then extract the two streams into permanent Kabeeri folders."
        ],
    destination_targets: destinationMap.destinations
  };
}

function buildSourcePackageMigrationState() {
  const permanentTargets = [
    {
      title: "Software Design System Reference",
      folder: "knowledge/design_system/software_design_reference/",
      files: [
        "knowledge/design_system/software_design_reference/README.md",
        "knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_REFERENCE_INDEX.md",
        "knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_SYSTEM_PATTERNS.md",
        "knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_SYSTEM_CATALOG.json"
      ]
    },
    {
      title: "Documentation Generator Reference",
      folder: "knowledge/documentation_generator/",
      files: [
        "knowledge/documentation_generator/README.md",
        "knowledge/documentation_generator/DOCS_GENERATION_LIFECYCLE.md",
        "knowledge/documentation_generator/DOCS_GENERATION_REFERENCE.md",
        "knowledge/documentation_generator/DOCS_GENERATION_CATALOG.json"
      ]
    }
  ];
  const targets = permanentTargets.map((target) => {
    const present = target.files.every((file) => fileExists(file));
    return {
      ...target,
      present,
      file_count: target.files.filter((file) => fileExists(file)).length
    };
  });
  const ready = targets.every((item) => item.present);
  const report = {
    report_type: "kvdf_source_package_migration_state",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    status: ready ? "migration_progressed" : "partial",
    permanent_targets: targets,
    next_actions: ready
      ? [
          "Continue copying any remaining reusable source-package knowledge into the permanent targets.",
          "Run source-package verify again before decommissioning the source folder.",
          "Keep the source folder until no useful content remains stranded there."
        ]
      : [
          "Complete the permanent reference files first.",
          "Then update the destination map and verify the migration."
        ]
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md";
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${renderSourcePackageMigrationStateMarkdown(report)}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: renderSourcePackageMigrationStateMarkdown(report)
  };
}

function buildSourcePackageRelocationManifest() {
  const manifest = {
    report_type: "kvdf_source_package_relocation_manifest",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    sections: [
      {
        section_id: "software_design_system",
        title: "Software Design System",
        source_root: "software design system to follow",
        targets: [
          { source_class: "00_START", destination: "knowledge/governance/", note: "routing, manifest, and intake rules" },
          { source_class: "01_CORE", destination: "knowledge/governance/", note: "core policy and operating rules" },
          { source_class: "02_PACKS", destination: "knowledge/design_system/software_design_reference/", note: "analyzed design patterns and reusable reference knowledge" },
          { source_class: "02_PACKS", destination: "knowledge/standard_systems/", note: "normalized reference maps and stable catalog data" },
          { source_class: "99_ARCH", destination: "docs/reports/", note: "traceability and archive evidence" }
        ]
      },
      {
        section_id: "project_docs_generator",
        title: "Project Documentation Generator",
        source_root: "software project docs sys to generate",
        targets: [
          { source_class: "r001.md-r015.md", destination: "knowledge/documentation_generator/", note: "reusable lifecycle rules and generator guidance" },
          { source_class: "r001.md-r015.md", destination: "knowledge/task_tracking/", note: "task lifecycle and coverage behavior" },
          { source_class: "r001.md-r015.md", destination: "knowledge/governance/", note: "phase gates and policy rules" },
          { source_class: "p00-p28", destination: "docs/site/", note: "rendered docs pages and navigation" },
          { source_class: "r006.csv-r010.json", destination: "docs/reports/", note: "machine-readable mapping and traceability data" }
        ]
      }
    ],
    permanent_targets: [
      "knowledge/design_system/software_design_reference/",
      "knowledge/documentation_generator/"
    ]
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json";
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return {
    ...manifest,
    report_path: reportPath
  };
}

function buildSourcePackageCleanupPlan() {
  const verification = buildSourcePackageVerification();
  const migration = buildSourcePackageMigrationState();
  const manifest = buildSourcePackageRelocationManifest();
  const alreadyDecommissioned = verification.status === "decommissioned";
  const ready = verification.status !== "fail"
    && migration.permanent_targets.every((item) => item.present)
    && (verification.source_folder_exists || alreadyDecommissioned);
  const report = {
    report_type: "kvdf_source_package_cleanup_plan",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    status: alreadyDecommissioned ? "completed" : ready ? "ready_for_decommission" : "blocked",
    source_folder_exists: verification.source_folder_exists,
    decommission_record_exists: verification.decommission_record_exists,
    redistribution_ready: ready,
    permanent_targets: migration.permanent_targets,
    relocation_sections: manifest.sections.length,
    verification_status: verification.status,
    next_actions: alreadyDecommissioned ? [
      "No additional cleanup is required because the source folder has already been decommissioned.",
      "Keep the decommission record and redistribution reports as the permanent audit trail.",
      "Treat the permanent Kabeeri folders as the new source of truth."
    ] : ready ? [
      "Confirm the final removal of KVDF_New_Features_Docs after a last human review.",
      "Archive or back up the cleanup report if you need historical traceability.",
      "Only delete the source folder after the owner explicitly approves decommissioning."
    ] : [
      "Finish the missing permanent targets first.",
      "Keep the source package until every reusable item is represented in the permanent folders.",
      "Run source-package verify again before scheduling removal."
    ]
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_CLEANUP_PLAN.md";
  const reportMarkdown = renderSourcePackageCleanupPlanMarkdown(report);
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: reportMarkdown
  };
}

function buildSourcePackageDecommissionRequest(cleanup, flags = {}) {
  const confirm = Boolean(flags["confirm-remove"] || flags["confirm-decommission"] || flags.confirm);
  const alreadyDecommissioned = cleanup.decommission_record_exists || (!cleanup.source_folder_exists && cleanup.cleanup_ready);
  const report = {
    report_type: "kvdf_source_package_decommission_request",
    generated_at: new Date().toISOString(),
    source_package: "KVDF_New_Features_Docs",
    cleanup_ready: cleanup.redistribution_ready || alreadyDecommissioned,
    confirmation_required: true,
    confirmed: confirm,
    status: alreadyDecommissioned ? "recorded" : confirm ? "pending_manual_removal" : "confirmation_required",
    source_folder_exists: cleanup.source_folder_exists,
    decommission_record_exists: cleanup.decommission_record_exists || alreadyDecommissioned,
    next_actions: alreadyDecommissioned ? [
      "The source package has already been decommissioned and recorded.",
      "Keep the final record and redistribution reports as the permanent audit trail.",
      "Do not recreate the source folder unless a new approved migration starts."
    ] : confirm
      ? [
          "Proceed with the human-approved removal of KVDF_New_Features_Docs outside the safe preview flow.",
          "Take a backup if needed before deleting the folder.",
          "Record the removal in the owner state after the operation is complete."
        ]
      : [
          "Review the cleanup plan first.",
          "Run again with an explicit confirm flag only after the owner approves removal.",
          "Do not delete the folder until the removal is approved."
        ]
  };
  const reportPath = "docs/reports/KVDF_NEW_FEATURES_DOCS_DECOMMISSION_REQUEST.md";
  const reportMarkdown = renderSourcePackageDecommissionRequestMarkdown(report, cleanup);
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    ...report,
    report_path: reportPath,
    report_markdown: reportMarkdown
  };
}

function renderSourcePackageMigrationStateMarkdown(report) {
  const rows = (report.permanent_targets || []).map((item) => `| ${item.title} | ${item.present ? "yes" : "no"} | ${item.file_count} | ${item.folder} |`).join("\n");
  return [
    "# KVDF New Features Docs Migration State",
    "",
    "## Purpose",
    "",
    "Track which permanent Kabeeri folders already contain the extracted software-design and documentation-generator knowledge.",
    "",
    "## Permanent Targets",
    "",
    "| Target | Present | Files | Folder |",
    "| --- | --- | ---: | --- |",
    rows || "| None | no | 0 | |",
    "",
    "## Bottom Line",
    "",
    report.status === "migration_progressed"
      ? "The permanent reference folders are in place and the source package can continue toward final cleanup."
      : "Some permanent reference files are still missing, so the migration should stay open."
  ].join("\n");
}

function renderSourcePackageMigrationState(report) {
  console.log("KVDF Source Package Migration State");
  console.log(table(["Target", "Present", "Files"], (report.permanent_targets || []).map((item) => [item.title, item.present ? "yes" : "no", item.file_count])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageRelocationManifest(report) {
  console.log("KVDF Source Package Relocation Manifest");
  console.log(table(["Section", "Targets"], (report.sections || []).map((item) => [item.title, String((item.targets || []).length)])));
  console.log("");
  console.log(JSON.stringify(report, null, 2));
}

function renderSourcePackageCleanupPlanMarkdown(report) {
  const targetRows = (report.permanent_targets || []).map((item) => `| ${item.title} | ${item.present ? "yes" : "no"} | ${item.file_count} | ${item.folder} |`).join("\n");
  return [
    "# KVDF New Features Docs Cleanup Plan",
    "",
    "## Purpose",
    "",
    "Prepare a safe, non-destructive decommission path for `KVDF_New_Features_Docs` after its reusable content has been redistributed into permanent Kabeeri folders.",
    "",
    "## Status",
    "",
    `- Redistribution ready: ${report.redistribution_ready ? "yes" : "no"}`,
    `- Source folder exists: ${report.source_folder_exists ? "yes" : "no"}`,
    `- Decommission record exists: ${report.decommission_record_exists ? "yes" : "no"}`,
    `- Verification status: ${report.verification_status}`,
    "",
    "## Permanent Targets",
    "",
    "| Target | Present | Files | Folder |",
    "| --- | --- | ---: | --- |",
    targetRows || "| None | no | 0 | |",
    "",
    "## Next Actions",
    "",
    (report.next_actions || []).map((item) => `- ${item}`).join("\n")
  ].join("\n");
}

function renderSourcePackageCleanupPlan(report) {
  console.log("KVDF Source Package Cleanup Plan");
  console.log(table(["Item", "Value"], [
    ["Status", report.status],
    ["Redistribution ready", report.redistribution_ready ? "yes" : "no"],
    ["Source folder exists", report.source_folder_exists ? "yes" : "no"]
  ]));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageDecommissionRequestMarkdown(report, cleanup) {
  const targetRows = (cleanup.permanent_targets || []).map((item) => `| ${item.title} | ${item.present ? "yes" : "no"} | ${item.file_count} |`).join("\n");
  return [
    "# KVDF New Features Docs Decommission Request",
    "",
    "## Purpose",
    "",
    "Request human approval before the source folder is actually removed.",
    "",
    "## Status",
    "",
    `- Confirmation required: ${report.confirmation_required ? "yes" : "no"}`,
    `- Confirmed: ${report.confirmed ? "yes" : "no"}`,
    `- Cleanup ready: ${report.cleanup_ready ? "yes" : "no"}`,
    `- Decommission record exists: ${report.decommission_record_exists ? "yes" : "no"}`,
    "",
    "## Permanent Targets",
    "",
    "| Target | Present | Files |",
    "| --- | --- | ---: |",
    targetRows || "| None | no | 0 |",
    "",
    "## Next Actions",
    "",
    (report.next_actions || []).map((item) => `- ${item}`).join("\n")
  ].join("\n");
}

function renderSourcePackageDecommissionRequest(report) {
  console.log("KVDF Source Package Decommission Request");
  console.log(table(["Item", "Value"], [
    ["Status", report.status],
    ["Cleanup ready", report.cleanup_ready ? "yes" : "no"],
    ["Confirmed", report.confirmed ? "yes" : "no"]
  ]));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function collectFiles(root) {
  const results = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(root, absolute).replace(/\\/g, "/");
      if (entry.isDirectory()) walk(absolute);
      else results.push({ absolute, relative_path: relative });
    }
  }
  walk(root);
  return results;
}

function collectTopLevelCounts(items) {
  const counts = {};
  for (const item of items) {
    const [top] = item.relative_path.split("/");
    counts[top] = (counts[top] || 0) + 1;
  }
  return counts;
}

function classifySourceBranch(relativePath) {
  if (relativePath.startsWith("software design system to follow/")) return "software_design_system";
  if (relativePath.startsWith("software project docs sys to generate/")) return "project_docs_generator";
  return "other";
}

function withMarkdownReport(report, reportPath) {
  if (!fileExists(reportPath)) return report;
  return {
    ...report,
    report_path: reportPath,
    report_markdown: fs.readFileSync(path.join(repoRoot(), reportPath), "utf8")
  };
}

function renderSourcePackageSummary(report) {
  console.log("KVDF Source Package");
  console.log(table(["Item", "Value"], [
    ["Source package", report.source_package],
    ["Status", report.status],
    ["Source folder exists", report.source_folder_exists ? "yes" : "no"],
    ["Files", report.file_total],
    ["Branches", report.branch_total],
    ["Study report", report.study_report],
    ["Inventory report", report.inventory_report],
    ["Destination map", report.destination_map_report],
    ["Normalization map", report.normalization_report]
  ]));
  console.log("");
  console.log(table(["Stream", "Count"], (report.systems || []).map((item) => [item.title, item.count])));
  if (report.next_actions && report.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    report.next_actions.forEach((item) => console.log(`- ${item}`));
  }
}

function renderSourcePackageStudy(report) {
  console.log("KVDF Source Package Study");
  console.log(table(["Item", "Value"], [
    ["Source package", report.source_package],
    ["Role 1", report.source_package_roles[0] || ""],
    ["Role 2", report.source_package_roles[1] || ""],
    ["Study report", report.source_reports.study],
    ["Inventory report", report.source_reports.inventory],
    ["Destination map", report.source_reports.destination_map]
  ]));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageInventory(report) {
  console.log("KVDF Source Package Inventory");
  console.log(table(["System", "Count", "Top Level"], (report.systems || []).map((item) => [item.title, item.count, item.top_level])));
  console.log("");
  console.log(table(["Extension", "Count"], Object.entries(report.extension_totals || {}).map(([ext, count]) => [ext, count])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageDestinationMap(report) {
  console.log("KVDF Source Package Destination Map");
  console.log(table(["Stream", "Destinations"], (report.destinations || []).map((item) => [item.stream, item.destinations.join(", ")])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageCapabilityMapping(report) {
  console.log("KVDF Source Capability Mapping");
  console.log(table(["Source package", "Capability surface", "Runtime target", "CLI command"], (report.mappings || []).map((item) => [
    item.source_package,
    (item.capability_surface || []).join(", "),
    (item.runtime_target || []).join(", "),
    (item.cli_command || []).join(", ")
  ])));
  console.log("");
  console.log(`Registry total: ${report.registry_total}`);
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageCapabilityMappingMarkdown(report) {
  const rows = (report.mappings || []).map((item) => `| ${item.source_package} | ${(item.capability_surface || []).join(", ")} | ${(item.runtime_target || []).join(", ")} | ${(item.docs_page || []).join(", ")} | ${(item.cli_command || []).join(", ")} |`).join("\n");
  return [
    "# KVDF Source Capability Mapping",
    "",
    "## Purpose",
    "",
    "Map source-study branches to the exact capability surface, runtime target, docs page, and CLI command so the imported knowledge can be redistributed without losing traceability.",
    "",
    "## Mappings",
    "",
    "| Source package | Capability surface | Runtime target | Docs page | CLI command |",
    "| --- | --- | --- | --- | --- |",
    rows || "| None | none | none | none | none |",
    "",
    "## Registry Link",
    "",
    `- Registry total: ${report.registry_total}`,
    `- Registry source: ${report.registry_source}`
  ].join("\n");
}

function renderSourcePackagePlacementPlanMarkdown(report) {
  const rows = (report.routes || []).map((item) => `| ${item.route_id} | ${item.stream} | ${item.source_class} | ${item.destination} | ${item.note} |`).join("\n");
  return [
    "# KVDF New Features Docs Placement Plan",
    "",
    "## Purpose",
    "",
    "Map the source package branches to the exact permanent Kabeeri target folders so redistribution can be executed consistently.",
    "",
    "## Routes",
    "",
    "| Route | Stream | Source Class | Destination | Note |",
    "| --- | --- | --- | --- | --- |",
    rows || "| None | none | none | none | |",
    "",
    "## Summary",
    "",
    `- Software design routes: ${report.summary.software_design_routes}`,
    `- Documentation routes: ${report.summary.documentation_routes}`,
    `- Destinations covered: ${report.summary.destinations}`
  ].join("\n");
}

function renderSourcePackagePlacementPlan(report) {
  console.log("KVDF Source Package Placement Plan");
  console.log(table(["Route", "Destination"], (report.routes || []).map((item) => [item.route_id, item.destination])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageNormalizationPlanMarkdown(report) {
  const rootRows = (report.normalized_roots || []).map((item) => `| ${item.source_root} | ${item.normalized_root} | ${item.file_count} |`).join("\n");
  const sectionRows = (report.sections || []).map((section) => `| ${section.section_id} | ${section.title} | ${section.normalized_source_root} |`).join("\n");
  return [
    "# KVDF New Features Docs Normalization Map",
    "",
    "## Purpose",
    "",
    "Normalize the imported source package into safe lowercase aliases while preserving the original source mapping for later redistribution and decommissioning.",
    "",
    "## Normalized Roots",
    "",
    "| Source Root | Normalized Root | Files |",
    "| --- | --- | ---: |",
    rootRows || "| None | none | 0 |",
    "",
    "## Normalized Sections",
    "",
    "| Section | Title | Normalized Source Root |",
    "| --- | --- | --- |",
    sectionRows || "| None | none | none |",
    "",
    "## Preserved Mappings",
    "",
    `- Root aliases: ${report.normalized_roots ? report.normalized_roots.length : 0}`,
    `- Total mappings: ${report.summary ? report.summary.preserved_mappings : 0}`
  ].join("\n");
}

function renderSourcePackageNormalizationPlan(report) {
  console.log("KVDF Source Package Normalization Map");
  console.log(table(["Source Root", "Normalized Root", "Files"], (report.normalized_roots || []).map((item) => [item.source_root, item.normalized_root, item.file_count])));
  console.log("");
  console.log(table(["Section", "Normalized Root"], (report.sections || []).map((item) => [item.title, item.normalized_source_root])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

function renderSourcePackageDuplicateAnalysis(report) {
  console.log("KVDF Source Package Duplicate Analysis");
  console.log(table(["Area", "Risk", "Score", "Matched Terms"], (report.top_matches || []).map((item) => [
    item.area_name,
    item.duplicate_risk,
    item.score,
    (item.matched_terms || []).join(", ")
  ])));
  if (report.duplicate_candidates && report.duplicate_candidates.length) {
    console.log("");
    console.log("Duplicate candidates:");
    console.log(table(["Area", "Risk", "Score"], report.duplicate_candidates.map((item) => [
      item.area_name,
      item.duplicate_risk,
      item.score
    ])));
  }
  if (report.next_actions && report.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    report.next_actions.forEach((item) => console.log(`- ${item}`));
  }
}

function renderSourcePackageVerification(report) {
  console.log("KVDF Source Package Verification");
  console.log(table(["Item", "Value"], [
    ["Status", report.status],
    ["Study report", report.reports_present.study ? "present" : "missing"],
    ["Inventory report", report.reports_present.inventory ? "present" : "missing"],
    ["Destination map", report.reports_present.destination_map ? "present" : "missing"],
    ["Source folder exists", report.source_folder_exists ? "yes" : "no"],
    ["Decommission record", report.decommission_record_exists ? "present" : "missing"]
  ]));
  if (report.next_actions && report.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    report.next_actions.forEach((item) => console.log(`- ${item}`));
  }
}

function normalizeSourcePackageSlug(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSourcePackagePath(input) {
  return String(input || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => normalizeSourcePackageSlug(part))
    .filter(Boolean)
    .join("/");
}

module.exports = {
  sourcePackage,
  buildSourcePackageSummary,
  buildSourcePackageStudy,
  buildSourcePackageInventory,
  buildSourcePackageDestinationMap,
  buildSourcePackageCapabilityMapping,
  buildSourcePackagePlacementPlan,
  buildSourcePackageNormalizationPlan,
  buildSourcePackageDuplicateAnalysis,
  buildSourcePackageVerification,
  buildSourcePackageMigrationState,
  buildSourcePackageRelocationManifest,
  buildSourcePackageCleanupPlan,
  buildSourcePackageDecommissionRequest
};

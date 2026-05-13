const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { getSystemAreas } = require("./capability");

function softwareDesignReference(action, value, flags = {}) {
  return handleReferenceFolder({
    action,
    value,
    flags,
    folder: "knowledge/design_system/software_design_reference",
    reference_type: "software_design_reference",
    title: "Software Design System Reference",
    description: "Permanent Kabeeri reference home for analyzed software design system knowledge.",
    defaultPath: "knowledge/design_system/software_design_reference",
    catalogFile: "knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_SYSTEM_CATALOG.json",
    defaultShow: "SOFTWARE_DESIGN_SYSTEM_PATTERNS.md"
  });
}

function documentationGenerator(action, value, flags = {}) {
  return handleReferenceFolder({
    action,
    value,
    flags,
    folder: "knowledge/documentation_generator",
    reference_type: "documentation_generator_reference",
    title: "Documentation Generator Reference",
    description: "Permanent Kabeeri reference home for reusable project documentation lifecycle knowledge.",
    defaultPath: "knowledge/documentation_generator",
    catalogFile: "knowledge/documentation_generator/DOCS_GENERATION_CATALOG.json",
    defaultShow: "DOCS_GENERATION_REFERENCE.md"
  });
}

function handleReferenceFolder(config) {
  const mode = String(config.action || "list").trim().toLowerCase();
  const root = path.join(repoRoot(), config.folder);
  const exists = fs.existsSync(root);
  const catalog = exists ? collectReferenceFiles(root, config.folder) : [];

  if (mode === "path") {
    console.log(config.defaultPath);
    return;
  }

  if (mode === "index" || mode === "summary" || mode === "map") {
    const report = {
      reference_type: config.reference_type,
      title: config.title,
      description: config.description,
      folder: config.folder,
      exists,
      file_count: catalog.length,
      files: catalog,
      catalog: readCatalog(config.catalogFile)
    };
    if (config.flags && config.flags.json) console.log(JSON.stringify(report, null, 2));
    else if (mode === "map") {
      console.log(table(["Section", "Items"], report.catalog.sections.map((section) => [
        section.title,
        String((section.items || []).length)
      ])));
    } else {
      console.log(`${config.title}: ${report.file_count} files`);
    }
    return;
  }

  if (mode === "list" || !mode) {
    if (!exists) throw new Error(`Reference folder not found: ${config.folder}`);
    console.log(table(["ID", "Type", "Path", "Summary"], catalog.map((item) => [
      item.id,
      item.kind,
      item.path,
      item.summary
    ])));
    return;
  }

  if (mode === "show") {
    if (!exists) throw new Error(`Reference folder not found: ${config.folder}`);
    const target = resolveReferenceFile(catalog, value || config.defaultShow);
    if (!target) throw new Error(`Reference file not found: ${value || config.defaultShow}`);
    const content = fs.readFileSync(path.join(repoRoot(), target.path), "utf8");
    if (config.flags && config.flags.json) {
      console.log(JSON.stringify({
        reference_type: config.reference_type,
        title: config.title,
        path: target.path,
        summary: target.summary,
        content
      }, null, 2));
    } else {
      console.log(content);
    }
    return;
  }

  if (mode === "compare" || mode === "duplicates" || mode === "analysis" || mode === "analyze") {
    const report = buildReferenceFolderDuplicateAnalysis({
      folder: config.folder,
      title: config.title,
      reference_type: config.reference_type,
      catalogFile: config.catalogFile
    });
    if (config.flags && config.flags.json) console.log(JSON.stringify(report, null, 2));
    else renderSoftwareDesignDuplicateAnalysis(report);
    return;
  }

  throw new Error(`Unknown reference action: ${config.action}`);
}

function collectReferenceFiles(root, folder) {
  const files = [];
  walk(root);
  return files.sort((a, b) => a.path.localeCompare(b.path));

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      const relative = path.relative(repoRoot(), absolute).replace(/\\/g, "/");
      if (!relative.startsWith(folder.replace(/\\/g, "/"))) continue;
      if (!/\.(md|json|csv|yaml|yml|txt)$/i.test(entry.name)) continue;
      files.push({
        id: String(files.length + 1).padStart(3, "0"),
        kind: path.extname(entry.name).slice(1).toUpperCase() || "FILE",
        path: relative,
        summary: summarizeReferenceFile(absolute)
      });
    }
  }
}

function summarizeReferenceFile(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const text = fs.readFileSync(filePath, "utf8").split(/\r?\n/).map((line) => line.trim());
  const heading = text.find((line) => /^#\s+/.test(line));
  if (heading) return heading.replace(/^#\s+/, "");
  const first = text.find((line) => line && !/^```/.test(line));
  return first ? first.slice(0, 100) : "";
}

function resolveReferenceFile(catalog, value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  const byPath = catalog.find((item) => item.path.toLowerCase() === normalized || item.path.toLowerCase().endsWith(`/${normalized}`));
  if (byPath) return byPath;
  const byName = catalog.find((item) => path.basename(item.path, path.extname(item.path)).toLowerCase() === normalized);
  if (byName) return byName;
  return null;
}

function readCatalog(catalogFile) {
  const file = path.join(repoRoot(), catalogFile || "");
  if (!catalogFile || !fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function tokenize(text) {
  const stopwords = new Set(["and", "the", "for", "with", "from", "into", "this", "that", "are", "was", "were", "has", "have", "had", "not", "only", "keep"]);
  return String(text || "")
    .toLowerCase()
    .replace(/[`"'()[\]{}<>.,:;!?/\\|-]+/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.length >= 3)
    .filter((item) => !stopwords.has(item));
}

function buildReferenceFolderDuplicateAnalysis(config) {
  const catalog = readCatalog(config.catalogFile) || { sections: [] };
  const corpus = buildReferenceFolderCorpus(catalog);
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
  const reportPath = getDuplicateAnalysisReportPath(config.folder);
  const reportMarkdown = renderSoftwareDesignDuplicateAnalysisMarkdown({
    topMatches,
    duplicateCandidates,
    catalog,
    title: config.title,
    reference_type: config.reference_type
  });
  fs.writeFileSync(path.join(repoRoot(), reportPath), `${reportMarkdown}\n`, "utf8");
  return {
    report_type: `${config.reference_type}_duplicate_analysis`,
    generated_at: new Date().toISOString(),
    reference_type: config.reference_type,
    title: config.title,
    duplicate_risk: duplicateCandidates.length ? "review_required" : "low",
    top_matches: topMatches,
    duplicate_candidates: duplicateCandidates,
    report_path: reportPath,
    report_markdown: reportMarkdown,
    next_actions: duplicateCandidates.length ? [
      "Reuse the existing Kabeeri capability names instead of introducing duplicate software-design terms.",
    "Map only the missing knowledge gaps into permanent folders.",
    "Keep the source package temporary until the redistribution map is complete."
    ] : [
      "No strong overlap found against the capability map.",
      "Proceed with extraction while keeping the existing capability names as the source of truth."
    ]
  };
}

function buildReferenceFolderCorpus(catalog) {
  const text = [
    catalog.title,
    catalog.source_package,
    JSON.stringify(catalog.sections || []),
    ...(catalog.sections || []).flatMap((section) => [
      section.title,
      ...(section.items || [])
    ])
  ].filter(Boolean).join("\n").toLowerCase();
  return tokenize(text);
}

function getDuplicateAnalysisReportPath(folder) {
  const normalized = String(folder || "").replace(/\\/g, "/");
  if (normalized === "knowledge/design_system/software_design_reference") {
    return "knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_DUPLICATE_ANALYSIS.md";
  }
  if (normalized === "knowledge/documentation_generator") {
    return "knowledge/documentation_generator/DOCS_GENERATION_DUPLICATE_ANALYSIS.md";
  }
  return `${normalized}/DUPLICATE_ANALYSIS.md`;
}

function scoreAreaAgainstCorpus(area, corpusTokens) {
  const keywords = new Set(tokenize([area.key, area.name, area.group].join(" ")));
  const extraKeywords = getSoftwareDesignAliasKeywords(area.key);
  for (const keyword of extraKeywords) keywords.add(keyword);
  const matchedTerms = [];
  let score = 0;
  for (const keyword of keywords) {
    if (keyword.length < 3) continue;
    if (corpusTokens.includes(keyword)) {
      matchedTerms.push(keyword);
      score += 1;
    }
  }
  return { score, matched_terms: [...new Set(matchedTerms)].slice(0, 12) };
}

function getSoftwareDesignAliasKeywords(areaKey) {
  const aliases = {
    documentation: ["docs", "document", "documentation", "readme", "reference"],
    testing_qa: ["test", "tests", "verify", "validation", "coverage"],
    security: ["security", "governance", "safe", "guardrail"],
    business_logic: ["logic", "workflow", "rules", "pattern"],
    backend_apis: ["runtime", "service", "cli", "command"],
    admin_panel: ["owner", "governance", "control", "routing"],
    settings_system: ["config", "catalog", "index", "manifest"],
    product_business: ["product", "design", "reference", "system"],
    reports_analytics: ["report", "reports", "summary", "analysis"],
    multi_tenancy: ["workspace", "boundary", "folder", "package"],
    integrations: ["sync", "github", "vscode", "cli"],
    content_management: ["page", "pages", "site", "generator"],
    workflows_approvals: ["lifecycle", "placement", "migration", "verification"],
    data_governance: ["catalog", "schema", "json", "traceability"],
    ai_product_features: ["ai", "prompt", "agent", "evolution"],
    kabeeri_control_layer: ["kabeeri", "cli", "task", "evolution", "source-package"]
  };
  return aliases[areaKey] || [];
}

function renderSoftwareDesignDuplicateAnalysisMarkdown(report) {
  const topRows = (report.topMatches || []).map((item) => `| ${item.area_name} | ${item.duplicate_risk} | ${item.score} | ${(item.matched_terms || []).join(", ")} |`).join("\n");
  const candidateRows = (report.duplicateCandidates || []).map((item) => `| ${item.area_name} | ${item.duplicate_risk} | ${item.score} |`).join("\n");
  const sectionRows = (report.catalog.sections || []).map((section) => `| ${section.title} | ${(section.items || []).length} |`).join("\n");
  const referenceTitle = report.title || "Reference";
  const referenceNoun = report.reference_type === "documentation_generator_reference"
    ? "documentation generator reference"
    : "software design reference";
  return [
    `# ${referenceTitle} Duplicate Analysis`,
    "",
    "## Purpose",
    "",
    `Compare the permanent ${referenceNoun} against Kabeeri's central capability map so we avoid recreating existing capabilities under new names.`,
    "",
    "## Catalog Sections",
    "",
    "| Section | Items |",
    "| --- | ---: |",
    sectionRows || "| No sections found | 0 |",
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
      ? "The reference overlaps with existing capability areas, so future extraction should reuse the current Kabeeri capability names and only add missing gaps."
      : `No strong overlap found. Keep extracting the ${referenceNoun}, but preserve the existing capability names as the source of truth.`
  ].join("\n");
}

function renderSoftwareDesignDuplicateAnalysis(report) {
  console.log(report.title ? `${report.title} Duplicate Analysis` : "Reference Duplicate Analysis");
  console.log(table(["Area", "Risk", "Score"], (report.top_matches || []).map((item) => [item.area_name, item.duplicate_risk, String(item.score)])));
  if (report.report_markdown) {
    console.log("");
    console.log(report.report_markdown);
  }
}

module.exports = {
  softwareDesignReference,
  documentationGenerator,
  buildSoftwareDesignDuplicateAnalysis: buildReferenceFolderDuplicateAnalysis,
  buildReferenceFolderDuplicateAnalysis
};

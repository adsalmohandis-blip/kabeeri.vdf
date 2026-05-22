const fs = require("fs");
const path = require("path");

const CHECK_RULES = [
  "raw_hex_color",
  "inline_color_style",
  "bootstrap_button_accessibility",
  "data_surface_states"
];

function isUiFile(file) {
  return /\.(html|jsx|tsx|vue|svelte|blade\.php|php|css|scss)$/i.test(String(file || ""));
}

function hasRawHex(content) {
  return /(^|[^A-Za-z0-9_-])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/.test(String(content || ""));
}

function checkBootstrapButtons(file, content, problems) {
  const buttonRegex = /<button\b[\s\S]*?<\/button>/gi;
  const buttons = String(content || "").match(buttonRegex) || [];
  buttons.forEach((button, index) => {
    if (/\bbtn\b/.test(button) && !/\bbi\s+bi-/.test(button) && !/aria-label=/.test(button)) {
      problems.push(`${file}: Bootstrap button ${index + 1} may be missing an icon or aria-label.`);
    }
    if (/\bbtn-danger\b/.test(button) && !/bi-trash|bi-exclamation-triangle|bi-x-circle/.test(button)) {
      problems.push(`${file}: danger button ${index + 1} should use a destructive or warning icon.`);
    }
  });
}

function checkInlineStyle(file, content, problems) {
  const styleColor = /style=["'][^"']*(color|background|border-color)\s*:/i;
  if (styleColor.test(String(content || ""))) {
    problems.push(`${file}: inline color styles found; use design tokens or framework classes.`);
  }
}

function checkStateHints(file, content, problems) {
  const lower = String(content || "").toLowerCase();
  const dataSurface = /\b(table|grid|list|fetch|query|items|records|orders|users|products|cards)\b/i.test(String(content || ""));
  if (!dataSurface) return;
  const missing = [];
  if (!/(loading|spinner|skeleton|aria-busy)/.test(lower)) missing.push("loading");
  if (!/(empty|no items|no results|inbox|zero)/.test(lower)) missing.push("empty");
  if (!/(error|failed|alert-danger|destructive|retry)/.test(lower)) missing.push("error");
  if (missing.length) {
    problems.push(`${file}: data-driven surface may be missing states: ${missing.join(", ")}.`);
  }
}

function analyzeFile(file, options = {}) {
  const problems = [];
  if (!isUiFile(file)) {
    return { checked: false, problems };
  }
  if (!fs.existsSync(file)) {
    problems.push(`${file}: file not found.`);
    return { checked: true, problems };
  }
  const content = fs.readFileSync(file, "utf8");
  if (hasRawHex(content)) problems.push(`${file}: raw hex color found; use central design tokens.`);
  checkInlineStyle(file, content, problems);
  checkBootstrapButtons(file, content, problems);
  checkStateHints(file, content, problems);
  if (options.strict && problems.length) {
    problems.push(`${file}: strict mode requires all UI guidance checks to pass.`);
  }
  return { checked: true, problems };
}

function checkUiFiles(files = [], options = {}) {
  const normalizedFiles = Array.from(new Set((Array.isArray(files) ? files : [files]).flat().filter(Boolean).map((item) => String(item))));
  const filesChecked = [];
  const problems = [];

  for (const file of normalizedFiles) {
    const result = analyzeFile(file, options);
    if (result.checked) filesChecked.push(file);
    problems.push(...result.problems);
  }

  const status = problems.length ? "blocked" : "pass";
  return {
    report_type: "ui_dashboard_kits_check",
    status,
    files_checked: filesChecked,
    problems,
    next_action: problems.length ? "Fix the listed UI dashboard kit issues and re-run the check." : "No UI dashboard kit issues were detected."
  };
}

function renderUsage() {
  return "Usage: kvdf ui-dashboard-kits check <changed-ui-files>";
}

function renderCheckText(report) {
  if (!report.files_checked || report.files_checked.length === 0) {
    return `${renderUsage()}\n`;
  }
  if (report.problems.length) {
    return [
      "Kabeeri UI check failed:",
      ...report.problems.map((problem) => `- ${problem}`)
    ].join("\n") + "\n";
  }
  return "Kabeeri UI check passed.\n";
}

function parseCheckArgs(argv = []) {
  const files = [];
  let json = false;
  for (const item of argv) {
    if (item === "--json") {
      json = true;
      continue;
    }
    if (item.startsWith("--")) continue;
    files.push(item);
  }
  return { files, json };
}

function runCheckUiCli(argv = process.argv.slice(2)) {
  const { files, json } = parseCheckArgs(argv);
  if (!files.length && !json) {
    process.stdout.write(`${renderUsage()}\n`);
    process.exitCode = 0;
    return checkUiFiles([], {});
  }
  const report = checkUiFiles(files, {});
  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(renderCheckText(report));
  }
  process.exitCode = report.status === "pass" ? 0 : 1;
  return report;
}

module.exports = {
  CHECK_RULES,
  isUiFile,
  hasRawHex,
  analyzeFile,
  checkUiFiles,
  renderUsage,
  renderCheckText,
  parseCheckArgs,
  runCheckUiCli
};

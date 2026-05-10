#!/usr/bin/env node
"use strict";

const fs = require("fs");

const files = process.argv.slice(2);
const problems = [];

if (!files.length) {
  console.log("Usage: node knowledge/design_system/ui_execution_kit/scripts/check-ui.js <changed-ui-files>");
  process.exit(0);
}

function isUiFile(file) {
  return /\.(html|jsx|tsx|vue|svelte|blade\.php|php|css|scss)$/i.test(file);
}

function hasRawHex(content) {
  return /(^|[^A-Za-z0-9_-])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/.test(content);
}

function checkBootstrapButtons(file, content) {
  const buttonRegex = /<button\b[\s\S]*?<\/button>/gi;
  const buttons = content.match(buttonRegex) || [];
  buttons.forEach((button, index) => {
    if (/\bbtn\b/.test(button) && !/\bbi\s+bi-/.test(button) && !/aria-label=/.test(button)) {
      problems.push(`${file}: Bootstrap button ${index + 1} may be missing an icon or aria-label.`);
    }
    if (/\bbtn-danger\b/.test(button) && !/bi-trash|bi-exclamation-triangle|bi-x-circle/.test(button)) {
      problems.push(`${file}: danger button ${index + 1} should use a destructive/warning icon.`);
    }
  });
}

function checkInlineStyle(file, content) {
  const styleColor = /style=["'][^"']*(color|background|border-color)\s*:/i;
  if (styleColor.test(content)) {
    problems.push(`${file}: inline color styles found; use design tokens or framework classes.`);
  }
}

function checkStateHints(file, content) {
  const lower = content.toLowerCase();
  const dataSurface = /\b(table|grid|list|fetch|query|items|records|orders|users|products)\b/i.test(content);
  if (!dataSurface) return;
  const missing = [];
  if (!/(loading|spinner|skeleton|aria-busy)/.test(lower)) missing.push("loading");
  if (!/(empty|no items|no results|inbox|zero)/.test(lower)) missing.push("empty");
  if (!/(error|failed|alert-danger|destructive|retry)/.test(lower)) missing.push("error");
  if (missing.length) {
    problems.push(`${file}: data-driven surface may be missing states: ${missing.join(", ")}.`);
  }
}

for (const file of files) {
  if (!isUiFile(file)) continue;
  if (!fs.existsSync(file)) {
    problems.push(`${file}: file not found.`);
    continue;
  }
  const content = fs.readFileSync(file, "utf8");
  if (hasRawHex(content)) problems.push(`${file}: raw hex color found; use central design tokens.`);
  checkInlineStyle(file, content);
  checkBootstrapButtons(file, content);
  checkStateHints(file, content);
}

if (problems.length) {
  console.error("Kabeeri UI check failed:");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}

console.log("Kabeeri UI check passed.");

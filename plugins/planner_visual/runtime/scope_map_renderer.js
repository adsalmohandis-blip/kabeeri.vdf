function renderScopeMap(visual = {}) {
  const scopeMap = visual.scope_map || {};
  const lines = ["## Scope Map", ""];
  lines.push("### Allowed Files");
  for (const item of scopeMap.allowed_files || []) lines.push(`- ${item}`);
  lines.push("");
  lines.push("### Forbidden Files");
  for (const item of scopeMap.forbidden_files || []) lines.push(`- ${item}`);
  lines.push("");
  lines.push("### Runtime State");
  for (const item of scopeMap.runtime_state || []) lines.push(`- ${item}`);
  lines.push("");
  lines.push("### Generated Artifacts");
  for (const item of scopeMap.generated_artifacts || []) lines.push(`- ${item}`);
  lines.push("");
  lines.push("### Docs");
  for (const item of scopeMap.docs || []) lines.push(`- ${item}`);
  lines.push("");
  lines.push("### Tests");
  for (const item of scopeMap.tests || []) lines.push(`- ${item}`);
  return lines.join("\n").trimEnd();
}

module.exports = {
  renderScopeMap
};

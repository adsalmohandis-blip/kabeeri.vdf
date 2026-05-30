const fs = require("fs");
const path = require("path");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");

function writeStructureEvidence(workspaceRoot, operation, report) {
  const evidenceDir = path.join(workspaceRoot, "10_evidence_audit", "structure_evidence");
  ensureDir(evidenceDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(evidenceDir, `${operation}-${timestamp}.json`);
  const mdPath = path.join(evidenceDir, `${operation}-${timestamp}.md`);
  const payload = {
    operation,
    generated_at: new Date().toISOString(),
    report
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const lines = [
    `# ${operation[0].toUpperCase()}${operation.slice(1)} Evidence`,
    "",
    `- Generated at: ${payload.generated_at}`,
    `- Workspace root: ${workspaceRoot}`,
    `- Result: ${report && report.ok ? "ok" : "needs_attention"}`,
    "",
    "## Summary",
    JSON.stringify(report && report.summary ? report.summary : {}, null, 2),
    ""
  ];
  writeFileIfMissing(mdPath, lines.join("\n"));
  return { jsonPath, mdPath, payload };
}

module.exports = {
  writeStructureEvidence
};

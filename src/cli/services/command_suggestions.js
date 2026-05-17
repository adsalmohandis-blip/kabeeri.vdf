function suggestCommand(command) {
  const known = ["init", "doctor", "resume", "start", "start-here", "entry", "track", "onboarding", "guard", "boundary", "conflict", "conflicts", "scan", "validate", "generator", "generate", "create", "prompt-pack", "temp", "schedule", "scheduler", "wordpress", "wp", "example", "questionnaire", "vibe", "ask", "capture", "capability", "structure", "foldering", "blueprint", "data-design", "evolution", "plan", "project", "adopt", "task", "workstream", "app", "feature", "journey", "structured", "waterfall", "delivery", "agile", "sprint", "session", "multi-ai", "acceptance", "audit", "memory", "adr", "ai-run", "developer", "owner", "agent", "lock", "vscode", "docs", "doc", "source-package", "source_package", "sourcepackage", "dashboard", "report", "reports", "readiness", "governance", "release", "github", "sync", "team-sync", "package", "packaging", "upgrade", "cleaner", "cleanup", "hygiene", "token", "budget", "pricing", "usage", "design", "policy", "context-pack", "context", "preflight", "model-route", "routing", "handoff", "security", "migration", "migrate", "pipeline"];
  const best = known
    .map((item) => ({ item, distance: levenshtein(command, item) }))
    .sort((a, b) => a.distance - b.distance)[0];
  return best && best.distance <= 3 ? `. Did you mean "${best.item}"?` : "";
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

module.exports = { suggestCommand };

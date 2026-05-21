const SECURITY_AUDIT_RULES = [
  {
    rule_id: "private_key",
    category: "secrets",
    severity: "critical",
    pattern: /-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
    message: "Private key material appears in the file.",
    next_action: "Remove the secret, rotate the credential, and keep the key out of source control."
  },
  {
    rule_id: "api_key",
    category: "secrets",
    severity: "critical",
    pattern: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|gho_[A-Za-z0-9_]{20,}|ghu_[A-Za-z0-9_]{20,}|ghs_[A-Za-z0-9_]{20,}|ghr_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})\b/i,
    message: "A likely API token or secret key appears in the file.",
    next_action: "Move the secret to a secure environment store and rotate the exposed credential."
  },
  {
    rule_id: "env_file",
    category: "secrets",
    severity: "high",
    pattern: /\.(?:env|env\.[^.\/\\]+)$/i,
    path_only: true,
    message: "A real .env-style file is present in the workspace.",
    next_action: "Remove the file from source control and keep placeholder values in .env.example only."
  },
  {
    rule_id: "hardcoded_password",
    category: "secrets",
    severity: "critical",
    pattern: /\b(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|db[_-]?password)\b\s*[:=]\s*['"]?[^'"\s]{8,}/i,
    message: "A hardcoded secret assignment was detected.",
    next_action: "Replace the hardcoded value with an environment-backed secret."
  },
  {
    rule_id: "eval_execution",
    category: "injection",
    severity: "critical",
    pattern: /\b(eval|Function)\s*\(/,
    message: "Dynamic code execution can turn data into code.",
    next_action: "Remove the dynamic evaluator and replace it with explicit parsing or a safe dispatcher."
  },
  {
    rule_id: "shell_exec",
    category: "command_execution",
    severity: "critical",
    pattern: /\b(child_process\.(?:exec|execSync|execFile|execFileSync|spawn|spawnSync)|require\s*\(\s*["']child_process["']\s*\)\s*\.\s*(?:exec|execSync|execFile|execFileSync|spawn|spawnSync))\s*\(/i,
    message: "Shell or process execution is present.",
    next_action: "Use a safer API or validate all inputs before invoking a subprocess."
  },
  {
    rule_id: "insecure_cors",
    category: "cross_origin",
    severity: "high",
    pattern: /(cors\s*\(\s*\)|origin\s*:\s*true|Access-Control-Allow-Origin\s*:\s*\*|allowOrigin\s*:\s*["']\*["'])/i,
    message: "CORS configuration looks overly permissive.",
    next_action: "Restrict allowed origins and avoid wildcard CORS in release paths."
  },
  {
    rule_id: "unsafe_upload",
    category: "file_upload",
    severity: "high",
    pattern: /\b(multer|formidable|busboy|express-fileupload|upload\.(?:single|array|fields)|req\.files|req\.file)\b/i,
    message: "File upload handling should be reviewed for validation and storage safety.",
    next_action: "Confirm file type, size, storage path, and authentication before accepting uploads."
  },
  {
    rule_id: "sql_injection",
    category: "database",
    severity: "critical",
    pattern: /(\b(query|execute|raw)\s*\(.*(\+|\$\{)|\b(SELECT|INSERT|UPDATE|DELETE|ALTER|DROP)\b.*\$\{)/i,
    message: "A SQL statement appears to be built from interpolated values.",
    next_action: "Use parameterized queries or query builders instead of string concatenation."
  },
  {
    rule_id: "xss_injection",
    category: "xss",
    severity: "high",
    pattern: /(dangerouslySetInnerHTML|innerHTML\s*=|outerHTML\s*=|document\.write\s*\(|res\.send\s*\(\s*`[^`]*\$\{)/i,
    message: "HTML injection or unsafe DOM rendering may be present.",
    next_action: "Escape or sanitize dynamic content before rendering it into HTML."
  },
  {
    rule_id: "missing_auth_route",
    category: "auth",
    severity: "high",
    pattern: /(app|router)\.(get|post|put|delete|patch)\s*\(\s*["'][^"']*(admin|internal|backdoor|hidden)["']/i,
    message: "An admin or hidden route is exposed and should be checked for auth gating.",
    next_action: "Verify that role checks and authentication middleware protect the route."
  },
  {
    rule_id: "backdoor_comment",
    category: "security",
    severity: "critical",
    pattern: /(backdoor|temporary bypass|disable security|skip auth|hidden admin|secret admin|debug only)/i,
    message: "Suspicious backdoor-like wording appears in the file.",
    next_action: "Remove the bypass path and document the intended secure alternative."
  }
];

function getSecurityAuditRules() {
  return SECURITY_AUDIT_RULES.map((rule) => ({ ...rule }));
}

module.exports = {
  SECURITY_AUDIT_RULES,
  getSecurityAuditRules
};

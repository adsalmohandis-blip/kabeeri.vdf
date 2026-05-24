const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  ensureWifiDataSharingState,
  readWifiDataSharingState,
  appendWifiTransferPolicyResult,
  readWifiTransferPolicyResultsState,
  findWifiDataQuarantineRecord,
  upsertWifiDataQuarantineRecord
} = require("./state");
const transfer = require("./transfer");
const { findTrustedNodeRecord } = require("./trusted_nodes");

const POLICY_TEMPLATE_FILE = path.join(__dirname, "..", "runtime", "wifi_transfer_policy.template.json");
const BLOCKED_EXECUTABLE_EXTENSIONS = [".exe", ".bat", ".cmd", ".ps1", ".sh", ".msi", ".dll"];
const SUSPICIOUS_MARKERS = [
  "rm -rf",
  "powershell",
  "Invoke-WebRequest",
  "curl | sh",
  "wget | sh",
  "eval(",
  "base64 -d",
  "chmod +x"
];

function wifiDataSecurityGate(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized !== "security") {
    return buildUnavailableSecurityReport(action);
  }
  if (!verb || verb === "check") {
    return checkPackageSecurity({
      packageId: flags.package || flags.package_id || rest[0] || null
    });
  }
  if (verb === "results") {
    return buildSecurityResultsReport({
      packageId: flags.package || flags.package_id || rest[0] || null
    });
  }
  return buildUnavailableSecurityReport(`${normalized} ${verb}`);
}

function checkPackageSecurity({ packageId } = {}) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  const normalizedPackageId = String(packageId || "").trim();
  if (!normalizedPackageId) {
    return buildBlockedSecurityResult("Package id is required.", null, null);
  }
  const packageRecord = transfer.getPackage(normalizedPackageId);
  const inboxRecord = transfer.getInboxRecord(normalizedPackageId);
  const transferSummary = findTransferSummary(state, normalizedPackageId);
  if (!packageRecord) {
    return buildBlockedSecurityResult("Package not found.", normalizedPackageId, null);
  }

  const senderNodeId = packageRecord.created_by_node_id || (transferSummary && transferSummary.source_node_id) || null;
  const senderNode = senderNodeId ? findTrustedNodeRecord(state, senderNodeId) : null;
  const policyTemplate = readPolicyTemplate();
  const maxPackageAgeMs = Number(policyTemplate.max_package_age_ms || 7 * 24 * 60 * 60 * 1000);
  const allowedTypes = new Set(Array.isArray(policyTemplate.allowed_package_types) && policyTemplate.allowed_package_types.length
    ? policyTemplate.allowed_package_types.map((item) => String(item || "").toLowerCase())
    : Array.from(transfer.ALLOWED_PACKAGE_TYPES));
  const payloadText = stringifyPayload(packageRecord.payload);
  const checks = [];
  const blockers = [];
  const warnings = [];

  pushCheck(checks, "sender_node_trusted", Boolean(senderNode && senderNode.trust_status === "trusted"), senderNode && senderNode.trust_status === "trusted"
    ? "Sender node is trusted."
    : senderNode && senderNode.trust_status === "revoked"
      ? "Sender node is revoked."
      : "Sender node is not trusted.", blockers);
  pushCheck(checks, "sender_node_not_revoked", Boolean(!senderNode || senderNode.trust_status !== "revoked"), senderNode && senderNode.trust_status === "revoked"
    ? "Sender node is revoked."
    : "Sender node is not revoked.", blockers);
  pushCheck(checks, "package_type_allowed", allowedTypes.has(normalizePackageType(packageRecord.package_type)), allowedTypes.has(normalizePackageType(packageRecord.package_type))
    ? "Package type is allowed."
    : `Unsupported package type: ${packageRecord.package_type || "unknown"}.`, blockers);
  pushCheck(checks, "payload_size_within_limit", Number(packageRecord.payload_size_bytes || 0) <= Number(state.policies && state.policies.max_package_bytes ? state.policies.max_package_bytes : transfer.PACKAGE_SIZE_LIMIT), Number(packageRecord.payload_size_bytes || 0) <= Number(state.policies && state.policies.max_package_bytes ? state.policies.max_package_bytes : transfer.PACKAGE_SIZE_LIMIT)
    ? "Payload is within the configured size limit."
    : "Payload exceeds the configured size limit.", blockers);
  pushCheck(checks, "sha256_valid", transfer.verifyPackageHash(packageRecord), transfer.verifyPackageHash(packageRecord)
    ? "Package hash validates."
    : "Package hash validation failed.", blockers);
  pushCheck(checks, "package_not_executable", !looksExecutable(packageRecord), !looksExecutable(packageRecord)
    ? "Package does not look executable."
    : "Package looks executable or script-like.", blockers);
  pushCheck(checks, "path_safe", isPathSafe(packageRecord), isPathSafe(packageRecord)
    ? "Package path is safe."
    : "Package path is unsafe.", blockers);
  pushCheck(checks, "no_secret_like_payload", !containsSecretLikePayload(payloadText), !containsSecretLikePayload(payloadText)
    ? "Payload does not contain obvious secret-like markers."
    : "Payload contains secret-like markers.", blockers);
  pushCheck(checks, "no_auto_apply", true, "No auto-apply is permitted for wifi_data_sharing packages.");
  pushCheck(checks, "inbox_review_required", Boolean(inboxRecord && inboxRecord.review_required !== false), inboxRecord && inboxRecord.review_required !== false
    ? "Inbox review is still required."
    : "Inbox review is not marked as required.", blockers);
  pushCheck(checks, "transfer_confirmed", Boolean(transferSummary && transferSummary.transfer_id), transferSummary && transferSummary.transfer_id
    ? "Transfer was recorded before policy evaluation."
    : "No transfer record was found for this package.", blockers);
  pushCheck(checks, "source_node_matches_manifest", Boolean(transferSummary && senderNodeId && transferSummary.source_node_id === senderNodeId), transferSummary && senderNodeId && transferSummary.source_node_id === senderNodeId
    ? "Transfer source matches the package sender manifest."
    : "Transfer source does not match the package sender manifest.", blockers);
  pushCheck(checks, "package_schema_valid", validatePackageSchema(packageRecord), validatePackageSchema(packageRecord)
    ? "Package schema is valid."
    : "Package schema is invalid.", blockers);
  pushCheck(checks, "max_package_age_not_expired", isWithinAgeLimit(packageRecord, inboxRecord, maxPackageAgeMs), isWithinAgeLimit(packageRecord, inboxRecord, maxPackageAgeMs)
    ? "Package age is within policy."
    : "Package age exceeds the allowed policy window.", blockers);

  const status = blockers.length ? "blocked" : warnings.length ? "warn" : "pass";
  const generatedAt = new Date().toISOString();
  const policyResult = {
    policy_result_id: buildNextPolicyResultId(),
    package_id: normalizedPackageId,
    sender_node_id: senderNodeId,
    status,
    checks,
    blockers,
    warnings,
    generated_at: generatedAt,
    next_action: buildSecurityNextAction(status, blockers, warnings, normalizedPackageId)
  };
  appendWifiTransferPolicyResult(policyResult);
  upsertWifiDataQuarantineRecord({
    package_id: normalizedPackageId,
    transfer_id: transferSummary ? transferSummary.transfer_id : inboxRecord && inboxRecord.transfer_id ? inboxRecord.transfer_id : null,
    source_node_id: senderNodeId,
    target_node_id: (inboxRecord && inboxRecord.target_node_id) || packageRecord.target_node_id || null,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    status: "quarantined",
    quarantined_at: (inboxRecord && inboxRecord.received_at) || packageRecord.created_at || generatedAt,
    updated_at: generatedAt,
    review_required: true,
    security_result_id: policyResult.policy_result_id,
    security_status: policyResult.status,
    policy_checked_at: generatedAt,
    released_at: null,
    rejected_at: null,
    rejection_reason: null
  });
  return {
    report_type: "wifi_data_sharing_security_result",
    plugin_id: "wifi_data_sharing",
    status: policyResult.status,
    policy_result: policyResult,
    next_action: policyResult.next_action
  };
}

function buildSecurityResultsReport({ packageId = null } = {}) {
  const current = readWifiTransferPolicyResultsState();
  const policy_results = Array.isArray(current.policy_results) ? current.policy_results.slice() : [];
  const filtered = packageId ? policy_results.filter((item) => item.package_id === packageId) : policy_results;
  return {
    report_type: "wifi_data_sharing_security_results",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    policy_results: filtered,
    counts: {
      total: filtered.length,
      pass: filtered.filter((item) => item.status === "pass").length,
      warn: filtered.filter((item) => item.status === "warn").length,
      blocked: filtered.filter((item) => item.status === "blocked").length
    },
    latest: filtered.length ? filtered[filtered.length - 1] : null
  };
}

function getLatestPolicyResultForPackage(packageId) {
  if (!packageId) return null;
  const current = readWifiTransferPolicyResultsState();
  const policy_results = Array.isArray(current.policy_results) ? current.policy_results : [];
  return [...policy_results].reverse().find((item) => item.package_id === packageId) || null;
}

function buildUnavailableSecurityReport(action) {
  return {
    report_type: "wifi_data_sharing_security_results",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    requested_action: action || null,
    next_action: "Use `kvdf wifi-data-sharing security check --package <package-id>` after initialization."
  };
}

function buildBlockedSecurityResult(message, packageId, senderNodeId) {
  return {
    report_type: "wifi_data_sharing_security_result",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    policy_result: {
      policy_result_id: buildNextPolicyResultId(),
      package_id: packageId || null,
      sender_node_id: senderNodeId || null,
      status: "blocked",
      checks: [],
      blockers: [message],
      warnings: [],
      generated_at: new Date().toISOString(),
      next_action: message
    },
    next_action: message
  };
}

function buildNextPolicyResultId() {
  const current = readWifiTransferPolicyResultsState();
  const count = Array.isArray(current.policy_results) ? current.policy_results.length + 1 : 1;
  return `wifi-policy-${String(count).padStart(3, "0")}`;
}

function buildSecurityNextAction(status, blockers, warnings, packageId) {
  if (status === "blocked") return blockers[0] || "Review the quarantined package before release.";
  if (status === "warn") return warnings[0] || `Review ${packageId} manually before release.`;
  return `Run \`kvdf wifi-data-sharing quarantine release ${packageId} --confirm\` or \`kvdf wifi-data-sharing inbox accept ${packageId} --confirm\` when you are ready.`;
}

function readPolicyTemplate() {
  try {
    if (!fs.existsSync(POLICY_TEMPLATE_FILE)) {
      return defaultPolicyTemplate();
    }
    return {
      ...defaultPolicyTemplate(),
      ...JSON.parse(fs.readFileSync(POLICY_TEMPLATE_FILE, "utf8"))
    };
  } catch (error) {
    return defaultPolicyTemplate();
  }
}

function defaultPolicyTemplate() {
  return {
    version: "v1",
    plugin_id: "wifi_data_sharing",
    max_package_age_ms: 7 * 24 * 60 * 60 * 1000,
    allowed_package_types: Array.from(transfer.ALLOWED_PACKAGE_TYPES),
    blocked_executable_extensions: BLOCKED_EXECUTABLE_EXTENSIONS.slice(),
    suspicious_markers: SUSPICIOUS_MARKERS.slice(),
    secret_markers: [
      "ghp_",
      "xoxb-",
      "xoxp-",
      "AKIA",
      "-----BEGIN PRIVATE KEY-----",
      "-----BEGIN OPENSSH PRIVATE KEY-----"
    ]
  };
}

function validatePackageSchema(packageRecord) {
  if (!packageRecord || typeof packageRecord !== "object") return false;
  const required = [
    "package_id",
    "package_type",
    "title",
    "created_by_node_id",
    "payload",
    "payload_encoding",
    "payload_size_bytes",
    "sha256",
    "created_at",
    "status"
  ];
  if (!required.every((key) => Object.prototype.hasOwnProperty.call(packageRecord, key))) return false;
  if (!packageRecord.package_id || !packageRecord.package_type || !packageRecord.created_by_node_id) return false;
  if (!["created", "sent", "received", "accepted", "rejected"].includes(String(packageRecord.status || "").toLowerCase())) return false;
  if (!["json", "text", "base64"].includes(String(packageRecord.payload_encoding || "").toLowerCase())) return false;
  if (!Number.isFinite(Number(packageRecord.payload_size_bytes))) return false;
  return true;
}

function looksExecutable(packageRecord) {
  const descriptor = [
    packageRecord.package_type,
    packageRecord.title,
    packageRecord.source_path ? path.basename(String(packageRecord.source_path)) : "",
    stringifyPayload(packageRecord.payload)
  ].join(" ").toLowerCase();
  return BLOCKED_EXECUTABLE_EXTENSIONS.some((ext) => descriptor.includes(ext)) || SUSPICIOUS_MARKERS.some((marker) => descriptor.includes(marker.toLowerCase()));
}

function isPathSafe(packageRecord) {
  const sourcePath = String(packageRecord.source_path || "").trim();
  if (!sourcePath) return true;
  if (sourcePath.includes("\0")) return false;
  if (sourcePath.includes("..")) return false;
  if (/[\r\n]/.test(sourcePath)) return false;
  return true;
}

function containsSecretLikePayload(payloadText) {
  if (!payloadText) return false;
  const text = String(payloadText);
  const secretPatterns = [
    /ghp_[A-Za-z0-9_]{20,}/i,
    /xox[baprs]-[A-Za-z0-9-]+/i,
    /AKIA[0-9A-Z]{12,}/,
    /-----BEGIN (?:OPENSSH |EC |RSA )?PRIVATE KEY-----/,
    /\b(secret|token|password)\s*[:=]\s*[^\s]+/i
  ];
  return secretPatterns.some((pattern) => pattern.test(text));
}

function stringifyPayload(payload) {
  if (payload === null || payload === undefined) return "";
  if (typeof payload === "string") return payload;
  if (Buffer.isBuffer(payload)) return payload.toString("utf8");
  try {
    return JSON.stringify(payload);
  } catch (error) {
    return String(payload);
  }
}

function isWithinAgeLimit(packageRecord, inboxRecord, maxPackageAgeMs) {
  const createdAt = inboxRecord && inboxRecord.received_at ? inboxRecord.received_at : packageRecord.created_at;
  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return false;
  return Date.now() - createdTime <= Number(maxPackageAgeMs || 0);
}

function findTransferSummary(state, packageId) {
  const transfers = Array.isArray(state.transfers) ? state.transfers : [];
  return [...transfers].reverse().find((item) => item.package_id === packageId) || null;
}

function pushCheck(checks, checkId, passed, message, blockers) {
  const status = passed ? "pass" : "blocked";
  checks.push({
    check_id: checkId,
    status,
    message
  });
  if (!passed) blockers.push(message);
}

function normalizePackageType(packageType) {
  return String(packageType || "").trim().toLowerCase();
}

function assertInitialized(state) {
  if (!state || !state.local_node || !state.local_node.node_id) {
    throw new Error("Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.");
  }
}

module.exports = {
  wifiDataSecurityGate,
  checkPackageSecurity,
  buildSecurityResultsReport,
  getLatestPolicyResultForPackage,
  buildUnavailableSecurityReport,
  buildBlockedSecurityResult,
  readPolicyTemplate,
  defaultPolicyTemplate,
  validatePackageSchema,
  containsSecretLikePayload,
  looksExecutable,
  isPathSafe,
  isWithinAgeLimit
};

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const state = require("./state");
const release = require("./release");

function wifiDataSharingBackup(action, value, flags = {}, rest = []) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const normalizedValue = String(value || "").trim().toLowerCase();
  void rest;

  if (normalizedAction !== "backup") {
    throw new Error(`Unknown wifi-data-sharing backup action: ${action}`);
  }

  if (normalizedValue === "create" || !normalizedValue) {
    const report = createBackup({ label: flags.label || flags.title || null });
    outputReport(report, flags);
    return report;
  }

  if (normalizedValue === "restore") {
    const report = require("./restore").buildRestoreReport({
      backupId: flags.backup || flags.backup_id || rest[0] || null,
      confirm: Boolean(flags.confirm)
    });
    outputReport(report, flags);
    return report;
  }

  const report = buildBackupReport();
  outputReport(report, flags);
  return report;
}

function buildBackupReport() {
  const backups = state.listWifiDataBackups();
  return {
    report_type: "wifi_data_sharing_backup",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: backups.length ? "available" : "empty",
    backups: backups.slice(0, 20),
    summary: {
      backup_count: backups.length
    },
    next_action: backups.length
      ? "Use `kvdf wifi-data-sharing backup restore <id> --confirm` to restore from a backup."
      : "Use `kvdf wifi-data-sharing backup create` to snapshot the current plugin state."
  };
}

function createBackup({ label = null } = {}) {
  const integrity = release.buildIntegrityReport({ persist: false });
  const now = new Date();
  const backupId = buildBackupId(now);
  const backupRoot = state.getBackupsDir();
  const backupDir = path.join(backupRoot, backupId);
  ensureSafeBackupDir(backupDir, backupRoot);
  fs.mkdirSync(backupDir, { recursive: true });

  const files = collectBackupFiles();
  const manifestFiles = [];
  for (const item of files) {
    if (!fs.existsSync(item.path)) {
      manifestFiles.push({
        label: item.label,
        path: item.relativePath,
        filename: item.filename,
        exists: false,
        bytes: 0,
        sha256: null
      });
      continue;
    }
    const raw = fs.readFileSync(item.path);
    const target = path.join(backupDir, item.filename);
    fs.writeFileSync(target, raw);
    manifestFiles.push({
      label: item.label,
      path: item.relativePath,
      filename: item.filename,
      exists: true,
      bytes: raw.length,
      sha256: sha256(raw)
    });
  }

  const manifest = {
    backup_id: backupId,
    plugin_id: "wifi_data_sharing",
    created_at: now.toISOString(),
    label: label || null,
    source_root: state.repoRoot(),
    files: manifestFiles,
    integrity_status: integrity.status,
    notes: "Backup created by wifi_data_sharing Phase 13 hardening."
  };
  fs.writeFileSync(path.join(backupDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return {
    report_type: "wifi_data_sharing_backup",
    plugin_id: "wifi_data_sharing",
    generated_at: now.toISOString(),
    status: "ok",
    backup: manifest,
    backup_dir: backupDir,
    next_action: "Use restore with --confirm only if you need to recover this snapshot."
  };
}

function collectBackupFiles() {
  const wifiRoot = path.join(state.repoRoot(), ".kabeeri");
  return [
    { label: "wifi_data_sharing state", path: state.getStateFile(), relativePath: ".kabeeri/wifi_data_sharing.json", filename: "wifi_data_sharing.json" },
    { label: "packages", path: state.getPackagesFile(), relativePath: ".kabeeri/wifi_data_packages.json", filename: "wifi_data_packages.json" },
    { label: "inbox", path: state.getInboxFile(), relativePath: ".kabeeri/wifi_data_inbox.json", filename: "wifi_data_inbox.json" },
    { label: "outbox", path: state.getOutboxFile(), relativePath: ".kabeeri/wifi_data_outbox.json", filename: "wifi_data_outbox.json" },
    { label: "transfer sessions", path: state.getTransferSessionsFile(), relativePath: ".kabeeri/wifi_transfer_sessions.json", filename: "wifi_transfer_sessions.json" },
    { label: "transfer policy results", path: state.getTransferPolicyResultsFile(), relativePath: ".kabeeri/wifi_transfer_policy_results.json", filename: "wifi_transfer_policy_results.json" },
    { label: "quarantine", path: state.getQuarantineFile(), relativePath: ".kabeeri/wifi_data_quarantine.json", filename: "wifi_data_quarantine.json" },
    { label: "applied bridge", path: state.getAppliedFile(), relativePath: ".kabeeri/wifi_data_applied.json", filename: "wifi_data_applied.json" },
    { label: "apply events", path: state.getApplyEventsFile(), relativePath: ".kabeeri/wifi_data_apply_events.jsonl", filename: "wifi_data_apply_events.jsonl" },
    { label: "discovery log", path: state.getDiscoveryLogFile(), relativePath: ".kabeeri/wifi_data_discovery.jsonl", filename: "wifi_data_discovery.jsonl" },
    { label: "pairing log", path: state.getPairingLogFile(), relativePath: ".kabeeri/wifi_data_pairing.jsonl", filename: "wifi_data_pairing.jsonl" },
    { label: "transfer log", path: state.getTransferLogFile(), relativePath: ".kabeeri/wifi_data_transfers.jsonl", filename: "wifi_data_transfers.jsonl" },
    { label: "release report", path: state.getReleaseReportFile(), relativePath: ".kabeeri/wifi_data_release_report.json", filename: "wifi_data_release_report.json" },
    { label: "integrity report", path: state.getIntegrityFile(), relativePath: ".kabeeri/wifi_data_integrity.json", filename: "wifi_data_integrity.json" },
    { label: "multi_ai wifi packets", path: path.join(state.repoRoot(), ".kabeeri", "multi_ai_wifi_packets.json"), relativePath: ".kabeeri/multi_ai_wifi_packets.json", filename: "multi_ai_wifi_packets.json" }
  ].filter((item) => fs.existsSync(item.path));
}

function ensureSafeBackupDir(backupDir, backupRoot = state.getBackupsDir()) {
  const resolved = path.resolve(backupDir);
  const root = path.resolve(backupRoot);
  if (!resolved.startsWith(root)) {
    throw new Error("Unsafe backup path.");
  }
}

function buildBackupId(date) {
  const timestamp = date.toISOString().replace(/[:.]/g, "-");
  const random = crypto.randomBytes(3).toString("hex");
  return `wifi-backup-${timestamp}-${random}`;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderBackupText(report));
}

function renderBackupText(report) {
  const backups = Array.isArray(report.backups) ? report.backups : [];
  return [
    "Wi-Fi Data Sharing Backup",
    `Status: ${report.status}`,
    `Backups: ${backups.length}`,
    ...(backups.length ? backups.slice(0, 5).map((item) => `- ${item.backup_id}`) : ["- none"]),
    report.next_action ? `Next: ${report.next_action}` : null
  ].filter(Boolean).join("\n");
}

module.exports = {
  wifiDataSharingBackup,
  buildBackupReport,
  createBackup,
  collectBackupFiles,
  renderBackupText,
  ensureSafeBackupDir
};

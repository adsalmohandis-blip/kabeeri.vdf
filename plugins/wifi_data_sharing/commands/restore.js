const fs = require("fs");
const path = require("path");

const state = require("./state");
const backup = require("./backup");

function wifiDataSharingRestore(action, value, flags = {}, rest = []) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const normalizedValue = String(value || "").trim().toLowerCase();
  void rest;

  if (!["restore", "backup"].includes(normalizedAction)) {
    throw new Error(`Unknown wifi-data-sharing restore action: ${action}`);
  }

  if (normalizedAction === "backup" && normalizedValue !== "restore") {
    const report = backup.buildBackupReport();
    outputReport(report, flags);
    return report;
  }

  const report = buildRestoreReport({
    backupId: flags.backup || flags.backup_id || rest[0] || null,
    confirm: Boolean(flags.confirm)
  });
  outputReport(report, flags);
  return report;
}

function buildRestoreReport({ backupId, confirm = false } = {}) {
  if (!confirm) {
    return buildBlockedReport("Backup restore requires --confirm.", "restore", "Use `--confirm` to overwrite the current wifi_data_sharing runtime state from a backup.");
  }
  const normalizedId = normalizeBackupId(backupId);
  if (!normalizedId) {
    return buildBlockedReport("Missing backup id.", "restore", "Use `kvdf wifi-data-sharing backup create` to create a backup id, then restore that id.");
  }
  const backupIndex = state.listWifiDataBackups().find((item) => item.backup_id === normalizedId);
  if (!backupIndex) {
    return buildBlockedReport(`Backup not found: ${normalizedId}`, "restore", "List backups with `kvdf wifi-data-sharing backup` first.");
  }
  const backupDir = path.join(state.getBackupsDir(), normalizedId);
  const manifestFile = path.join(backupDir, "manifest.json");
  if (!fs.existsSync(manifestFile)) {
    return buildBlockedReport(`Backup manifest missing: ${normalizedId}`, "restore", "Restore can only use backups with a manifest.");
  }
  let manifest = null;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  } catch (error) {
    return buildBlockedReport(`Backup manifest is invalid: ${error.message}`, "restore", "Create a new backup and retry restoration.");
  }
  const restoredFiles = [];
  for (const file of Array.isArray(manifest.files) ? manifest.files : []) {
    const source = path.join(backupDir, file.filename || path.basename(file.path || file.label || ""));
    if (!fs.existsSync(source)) continue;
    const destination = path.join(state.repoRoot(), file.path);
    ensureSafeRestorePath(destination);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    restoredFiles.push({
      path: file.path,
      exists: true
    });
  }
  const report = {
    report_type: "wifi_data_sharing_restore",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: "ok",
    backup_id: normalizedId,
    manifest,
    restored_files: restoredFiles,
    next_action: "Run health or integrity after restore to confirm the runtime state is healthy."
  };
  return report;
}

function ensureSafeRestorePath(destination) {
  const resolved = path.resolve(destination);
  const root = path.resolve(state.repoRoot(), ".kabeeri");
  if (!resolved.startsWith(root)) {
    throw new Error("Unsafe restore path.");
  }
}

function normalizeBackupId(backupId) {
  const value = String(backupId || "").trim();
  if (!value) return null;
  return /^[A-Za-z0-9._-]+$/.test(value) ? value : null;
}

function buildBlockedReport(message, action, nextAction) {
  return {
    report_type: "wifi_data_sharing_restore_blocked",
    plugin_id: "wifi_data_sharing",
    generated_at: new Date().toISOString(),
    status: "blocked",
    action,
    message,
    next_action: nextAction
  };
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderRestoreText(report));
}

function renderRestoreText(report) {
  if (!report) return "";
  if (report.report_type === "wifi_data_sharing_restore_blocked") {
    return [
      "Wi-Fi Data Sharing Restore",
      `Status: ${report.status}`,
      report.message ? `Message: ${report.message}` : null,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  return [
    "Wi-Fi Data Sharing Restore",
    `Status: ${report.status}`,
    `Backup: ${report.backup_id}`,
    `Restored files: ${Array.isArray(report.restored_files) ? report.restored_files.length : 0}`,
    report.next_action ? `Next: ${report.next_action}` : null
  ].filter(Boolean).join("\n");
}

module.exports = {
  wifiDataSharingRestore,
  buildRestoreReport,
  renderRestoreText
};

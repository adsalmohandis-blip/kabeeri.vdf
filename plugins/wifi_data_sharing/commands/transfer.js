const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  ensureWifiDataSharingState,
  readWifiDataSharingState,
  writeWifiDataSharingState,
  readWifiDataPackagesState,
  writeWifiDataPackagesState,
  readWifiDataInboxState,
  writeWifiDataInboxState,
  readWifiDataOutboxState,
  writeWifiDataOutboxState,
  upsertWifiDataOutboxRecord,
  findWifiDataOutboxRecord,
  readWifiTransferSessionsState,
  writeWifiTransferSessionsState,
  upsertWifiTransferSessionRecord,
  findWifiTransferSessionRecord,
  appendWifiDataTransferEvent,
  upsertWifiDataQuarantineRecord,
  getPackagesFile,
  getInboxFile,
  getOutboxFile,
  getTransferSessionsFile,
  getTransferLogFile
} = require("./state");
const { findTrustedNodeRecord } = require("./trusted_nodes");
const {
  buildChunkManifest,
  createChunkedTransferSession,
  packageRequiresChunking,
  DEFAULT_CHUNK_THRESHOLD_BYTES
} = require("../transport/chunked_transfer");
const { DEFAULT_DISCOVERY_PORT, sendTransportPacket } = require("../transport/udp_discovery");

const ALLOWED_PACKAGE_TYPES = new Set([
  "generic_json",
  "assignment_packet",
  "worker_join_request",
  "worker_heartbeat",
  "worker_result",
  "evidence_packet",
  "state_snapshot",
  "text_note",
  "file_blob"
]);

const BOOTSTRAP_PACKAGE_TYPES = new Set([
  "worker_join_request",
  "worker_heartbeat",
  "worker_result"
]);

const DEFAULT_TCP_PORT = 47633;
const PACKAGE_SIZE_LIMIT = 10 * 1024 * 1024;

function wifiDataTransfer(action, value, flags = {}, rest = []) {
  const normalized = String(action || "").trim().toLowerCase();
  const verb = String(value || "").trim().toLowerCase();
  if (normalized === "server") {
    if (verb === "start") return startTransferServer({ port: Number(flags.port || rest[1] || DEFAULT_TCP_PORT) });
    if (verb === "status" || !verb) return buildServerReport();
    return buildUnavailableTransferReport(action);
  }
  if (normalized === "package") {
    if (verb === "create") {
      return createPackage({
        packageType: flags.type || flags.package_type || rest[1] || null,
        inputPath: flags.input || flags.path || rest[2] || null,
        title: flags.title || rest[3] || null,
        payload: flags.payload || flags.data || null,
        payloadEncoding: flags.payload_encoding || flags.payloadEncoding || null
      });
    }
    return buildPackagesReport();
  }
  if (normalized === "send") {
    return sendPackage({
      packageId: flags.package || flags.package_id || value || rest[0] || null,
      targetNodeId: flags.to || flags.node || flags.node_id || rest[1] || null,
      confirm: Boolean(flags.confirm)
    });
  }
  if (normalized === "transfers") {
    return buildTransfersReport();
  }
  if (normalized === "transfer") {
    if (verb === "show") {
      return buildTransferReport(flags.transfer || flags.transfer_id || rest[0] || null);
    }
    if (verb === "resume" || verb === "clean" || verb === "sessions") return buildUnavailableTransferReport(`${normalized} ${verb}`);
    return buildTransfersReport();
  }
  return buildUnavailableTransferReport(action);
}

function createPackage({ packageType, inputPath, title, payload = null, payloadEncoding = null }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  const normalizedType = normalizePackageType(packageType);
  if (!ALLOWED_PACKAGE_TYPES.has(normalizedType)) {
    return buildBlockedPackageReport(`Unsupported package type: ${packageType || "unknown"}`);
  }
  const resolvedInputPath = resolveInputPath(inputPath);
  let payloadRecord = null;
  if (payload !== null && payload !== undefined) {
    payloadRecord = normalizeInlinePackagePayload(normalizedType, payload, payloadEncoding);
  } else {
    if (!resolvedInputPath || !fs.existsSync(resolvedInputPath)) {
      return buildBlockedPackageReport("Package input file not found.");
    }
    payloadRecord = readPackagePayload(normalizedType, resolvedInputPath);
  }
  const payloadBuffer = Buffer.isBuffer(payloadRecord.raw) ? payloadRecord.raw : Buffer.from(String(payloadRecord.raw || ""), payloadRecord.encoding === "base64" ? "base64" : "utf8");
  const payloadSize = payloadBuffer.length;
  if (payloadSize > state.policies.max_package_bytes) {
    return buildBlockedPackageReport(`Package exceeds the max size of ${state.policies.max_package_bytes} bytes.`);
  }
  const packageId = buildNextPackageId();
  const createdAt = new Date().toISOString();
  const record = {
    package_id: packageId,
    package_type: normalizedType,
    title: String(title || (resolvedInputPath ? path.basename(resolvedInputPath) : normalizedType)).trim(),
    created_by_node_id: state.local_node.node_id,
    target_node_id: null,
    source_path: resolvedInputPath || null,
    payload: payloadRecord.value,
    payload_encoding: payloadRecord.encoding,
    payload_size_bytes: payloadSize,
    sha256: crypto.createHash("sha256").update(payloadBuffer).digest("hex"),
    created_at: createdAt,
    status: "created"
  };
  const packagesState = readWifiDataPackagesState();
  const nextPackages = Array.isArray(packagesState.packages) ? packagesState.packages.slice() : [];
  nextPackages.push(record);
  writeWifiDataPackagesState({
    ...packagesState,
    created_at: packagesState.created_at || createdAt,
    updated_at: createdAt,
    packages: nextPackages
  });
  appendWifiDataTransferEvent({
    event_type: "package_created",
    package_id: packageId,
    package_type: normalizedType,
    created_by_node_id: state.local_node.node_id,
    created_at: createdAt
  });
  return {
    report_type: "wifi_data_sharing_package",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    package: record,
    next_action: `Run \`kvdf wifi-data-sharing send --package ${packageId} --to <node-id> --confirm\` to deliver it to a trusted node.`
  };
}

function sendPackage({ packageId, targetNodeId, confirm = false, bootstrap = false, loopback = false }) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!confirm) {
    return buildBlockedSendReport("Send requires --confirm.", packageId, targetNodeId);
  }
  const packageRecord = findPackage(packageId);
  if (!packageRecord) {
    return buildBlockedSendReport("Package not found.", packageId, targetNodeId);
  }
  if (!ALLOWED_PACKAGE_TYPES.has(packageRecord.package_type)) {
    return buildBlockedSendReport("Unsupported package type.", packageId, targetNodeId);
  }
  if (Number(packageRecord.payload_size_bytes || 0) > state.policies.max_package_bytes) {
    return buildBlockedSendReport("Package exceeds the allowed size limit.", packageId, targetNodeId);
  }
  if (!verifyPackageHash(packageRecord)) {
    return buildBlockedSendReport("Package hash validation failed.", packageId, targetNodeId);
  }
  const trustedTargetNode = findTrustedNodeRecord(state, targetNodeId);
  const candidateTargetNode = Array.isArray(state.discovery && state.discovery.known_candidates)
    ? state.discovery.known_candidates.find((item) => item && item.node_id === targetNodeId)
    : null;
  const targetNode = trustedTargetNode || candidateTargetNode || null;
  const allowBootstrap = Boolean(bootstrap) && BOOTSTRAP_PACKAGE_TYPES.has(packageRecord.package_type);
  if (allowBootstrap && !targetNode) {
    return sendBootstrapPacket({
      packageId,
      targetNodeId,
      confirm,
      loopback
    });
  }
  if (!targetNode && !allowBootstrap) {
    return buildBlockedSendReport(
      "Target node is not trusted.",
      packageId,
      targetNodeId
    );
  }
  if (targetNode && targetNode.trust_status === "revoked") {
    return buildBlockedSendReport("Target node is revoked.", packageId, targetNodeId);
  }
  if (targetNode && targetNode.trust_status !== "trusted" && !allowBootstrap) {
    return buildBlockedSendReport("Target node is not trusted.", packageId, targetNodeId);
  }
  const now = new Date().toISOString();
  const transferId = buildNextTransferId();
  const transferMode = packageRequiresChunking(packageRecord) ? "chunked" : "single_frame";
  const existingOutbox = findWifiDataOutboxRecord(packageId);
  const outboxId = existingOutbox && existingOutbox.outbox_id ? existingOutbox.outbox_id : buildNextOutboxId();
  const sessionId = transferMode === "chunked"
    ? (existingOutbox && existingOutbox.session_id ? existingOutbox.session_id : buildNextTransferSessionId())
    : null;
  const existingSession = sessionId ? findWifiTransferSessionRecord(sessionId) : null;
  const transferRecord = {
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    payload_size_bytes: packageRecord.payload_size_bytes,
    sha256: packageRecord.sha256,
    status: "sent",
    created_at: packageRecord.created_at || now,
    sent_at: now,
    received_at: now,
    transport: "local_transfer",
    confirm_required: true,
    bootstrap_packet: allowBootstrap,
    transfer_mode: transferMode,
    outbox_id: outboxId,
    session_id: sessionId
  };
  const outboxRecord = upsertWifiDataOutboxRecord({
    outbox_id: outboxId,
    package_id: packageId,
    transfer_id: transferId,
    session_id: sessionId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    payload_size_bytes: packageRecord.payload_size_bytes,
    sha256: packageRecord.sha256,
    transfer_mode: transferMode,
    status: "sent",
    retry_count: existingOutbox ? Number(existingOutbox.retry_count || 0) : 0,
    created_at: now,
    updated_at: now,
    last_attempt_at: now,
    last_error: null
  });
  let transferSession = null;
  if (transferMode === "chunked") {
    transferSession = createChunkedTransferSession(packageRecord, targetNodeId, {
      session_id: sessionId,
      source_node_id: state.local_node.node_id,
      retry_count: existingSession ? Number(existingSession.retry_count || 0) : 0
    });
    transferSession = upsertWifiTransferSessionRecord({
      ...transferSession,
      session_id: sessionId,
      source_node_id: state.local_node.node_id,
      target_node_id: targetNodeId,
      status: "sent",
      completed_chunks: Array.isArray(transferSession.chunk_manifest && transferSession.chunk_manifest.chunk_indexes)
        ? transferSession.chunk_manifest.chunk_indexes.slice()
        : [],
      completed_at: now,
      updated_at: now
    });
  }
  updatePackageStatus(packageId, "sent", { target_node_id: targetNodeId });
  appendWifiDataTransferEvent({
    event_type: "package_sent",
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    package_type: packageRecord.package_type,
    sent_at: now
  });
  const inboxRecord = storeInboxRecord({
    ...packageRecord,
    target_node_id: targetNodeId,
    status: "received",
    received_at: now,
    transfer_id: transferId,
    received_by_node_id: targetNodeId
  });
  upsertWifiDataQuarantineRecord({
    package_id: packageId,
    transfer_id: transferId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    status: "quarantined",
    quarantined_at: now,
    updated_at: now,
    review_required: true,
    security_status: "pending",
    inbox_status: "received"
  });
  appendWifiDataTransferEvent({
    event_type: "package_received",
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    package_type: packageRecord.package_type,
    received_at: now
  });
  appendWifiDataTransferEvent({
    event_type: "transfer_session_sent",
    transfer_id: transferId,
    package_id: packageId,
    package_type: packageRecord.package_type,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId,
    created_at: now,
    sent_at: now,
    transport: transferMode
  });
  writeTransferSummary(transferRecord);
  void sendTransportPacket({
    protocol: "kvdf-wifi-data-sharing",
    protocol_version: "v1",
    service_name: "wifi_data_sharing",
    message_type: "package",
    packet_type: packageRecord.package_type,
    package_id: packageRecord.package_id,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    payload: packageRecord.payload,
    payload_encoding: packageRecord.payload_encoding,
    sha256: packageRecord.sha256,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    bootstrap: allowBootstrap,
    sent_at: now
  }, targetNode && targetNode.address ? {
    loopback: Boolean(loopback),
    targetHost: targetNode.address,
    targetPort: Number(targetNode.port || DEFAULT_DISCOVERY_PORT)
  } : {
    loopback: Boolean(loopback),
    port: DEFAULT_DISCOVERY_PORT
  }).catch(() => {});
  return {
    report_type: "wifi_data_sharing_send",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer: transferRecord,
    outbox: outboxRecord,
    transfer_session: transferSession,
    inbox_record: inboxRecord,
    next_action: `Run \`kvdf wifi-data-sharing inbox show ${packageId}\` to review the received package.`
  };
}

function sendBootstrapPacket({
  packageId,
  targetNodeId,
  confirm = false,
  loopback = false,
  port = DEFAULT_DISCOVERY_PORT,
  targetHost = null,
  targetPort = null,
  transport = sendTransportPacket
} = {}) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  if (!confirm) {
    return buildBlockedSendReport("Send requires --confirm.", packageId, targetNodeId);
  }
  const packageRecord = findPackage(packageId);
  if (!packageRecord) {
    return buildBlockedSendReport("Package not found.", packageId, targetNodeId);
  }
  if (!ALLOWED_PACKAGE_TYPES.has(packageRecord.package_type)) {
    return buildBlockedSendReport("Unsupported package type.", packageId, targetNodeId);
  }
  if (!BOOTSTRAP_PACKAGE_TYPES.has(packageRecord.package_type)) {
    return buildBlockedSendReport("Package type is not bootstrap eligible.", packageId, targetNodeId);
  }
  if (Number(packageRecord.payload_size_bytes || 0) > state.policies.max_package_bytes) {
    return buildBlockedSendReport("Package exceeds the allowed size limit.", packageId, targetNodeId);
  }
  if (!verifyPackageHash(packageRecord)) {
    return buildBlockedSendReport("Package hash validation failed.", packageId, targetNodeId);
  }
  const now = new Date().toISOString();
  const transferId = buildNextTransferId();
  const outboxId = buildNextOutboxId();
  const transferRecord = {
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    payload_size_bytes: packageRecord.payload_size_bytes,
    sha256: packageRecord.sha256,
    status: "sent",
    created_at: packageRecord.created_at || now,
    sent_at: now,
    received_at: now,
    transport: "bootstrap_lan_transport",
    confirm_required: true,
    bootstrap_packet: true,
    transfer_mode: "bootstrap_direct",
    outbox_id: outboxId,
    session_id: null
  };
  const outboxRecord = upsertWifiDataOutboxRecord({
    outbox_id: outboxId,
    package_id: packageId,
    transfer_id: transferId,
    session_id: null,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    package_type: packageRecord.package_type,
    title: packageRecord.title,
    payload_size_bytes: packageRecord.payload_size_bytes,
    sha256: packageRecord.sha256,
    transfer_mode: "bootstrap_direct",
    status: "sent",
    retry_count: 0,
    created_at: now,
    updated_at: now,
    last_attempt_at: now,
    last_error: null
  });
  const directPacket = {
    protocol: "kvdf-wifi-data-sharing",
    protocol_version: "v1",
    service_name: "wifi_data_sharing",
    message_type: packageRecord.package_type,
    packet_type: packageRecord.package_type,
    package_id: packageRecord.package_id,
    package_type: packageRecord.package_type,
    node_id: state.local_node.node_id,
    sender_node_id: state.local_node.node_id,
    title: packageRecord.title,
    payload: packageRecord.payload,
    payload_encoding: packageRecord.payload_encoding,
    sha256: packageRecord.sha256,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    display_name: state.local_node.display_name || null,
    hostname: state.local_node.hostname || null,
    platform: state.local_node.platform || null,
    trust_role: state.local_node.trust_role || null,
    capabilities: Array.isArray(state.local_node.capabilities) ? state.local_node.capabilities.slice() : [],
    bootstrap: true,
    sent_at: now
  };
  appendWifiDataTransferEvent({
    event_type: "bootstrap_packet_sent",
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    package_type: packageRecord.package_type,
    sent_at: now
  });
  updatePackageStatus(packageId, "sent", { target_node_id: targetNodeId || null });
  const bootstrapTarget = resolveBootstrapTransportTarget(state, {
    targetNodeId,
    targetHost,
    targetPort,
    fallbackPort: port,
    loopback: Boolean(loopback)
  });
  void transport(directPacket, bootstrapTarget).catch(() => {});
  appendWifiDataTransferEvent({
    event_type: "bootstrap_packet_dispatched",
    transfer_id: transferId,
    package_id: packageId,
    source_node_id: state.local_node.node_id,
    target_node_id: targetNodeId || null,
    package_type: packageRecord.package_type,
    sent_at: now
  });
  writeTransferSummary(transferRecord);
  return {
    report_type: "wifi_data_sharing_send",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer: transferRecord,
    outbox: outboxRecord,
    inbox_record: null,
    next_action: `Run \`kvdf wifi-data-sharing inbox show ${packageId}\` to review the received package.`
  };
}

function resolveBootstrapTransportTarget(state, {
  targetNodeId = null,
  targetHost = null,
  targetPort = null,
  fallbackPort = DEFAULT_DISCOVERY_PORT,
  loopback = false
} = {}) {
  const explicitHost = String(targetHost || "").trim();
  const explicitPort = Number(targetPort || 0);
  if (explicitHost) {
    return {
      loopback: false,
      targetHost: explicitHost,
      targetPort: Number.isFinite(explicitPort) && explicitPort > 0 ? explicitPort : Number(fallbackPort || DEFAULT_DISCOVERY_PORT)
    };
  }
  const trusted = targetNodeId ? findTrustedNodeRecord(state, targetNodeId) : null;
  const candidate = targetNodeId && state.discovery && Array.isArray(state.discovery.known_candidates)
    ? state.discovery.known_candidates.find((item) => item && item.node_id === targetNodeId)
    : null;
  const bootstrapPeers = state.discovery && Array.isArray(state.discovery.bootstrap_peers)
    ? state.discovery.bootstrap_peers
    : [];
  const peerByNode = targetNodeId
    ? bootstrapPeers.find((item) => item && item.enabled !== false && item.node_id === targetNodeId)
    : null;
  const ownerPeer = bootstrapPeers.find((item) => item && item.enabled !== false && String(item.trust_role || "").toLowerCase() === "owner");
  const fallbackPeer = bootstrapPeers.find((item) => item && item.enabled !== false);
  const resolved = trusted || candidate || peerByNode || ownerPeer || fallbackPeer || null;
  if (resolved && resolved.address) {
    return {
      loopback: false,
      targetHost: resolved.address,
      targetPort: Number(resolved.port || fallbackPort || DEFAULT_DISCOVERY_PORT)
    };
  }
  if (resolved && resolved.host) {
    return {
      loopback: false,
      targetHost: resolved.host,
      targetPort: Number(resolved.port || fallbackPort || DEFAULT_DISCOVERY_PORT)
    };
  }
  return {
    loopback: Boolean(loopback),
    port: Number(fallbackPort || DEFAULT_DISCOVERY_PORT)
  };
}

function updatePackageStatus(packageId, status, extra = {}) {
  const packagesState = readWifiDataPackagesState();
  const nextPackages = Array.isArray(packagesState.packages) ? packagesState.packages.slice() : [];
  const index = nextPackages.findIndex((item) => item.package_id === packageId);
  if (index < 0) return null;
  nextPackages[index] = {
    ...nextPackages[index],
    status,
    ...extra
  };
  writeWifiDataPackagesState({
    ...packagesState,
    updated_at: new Date().toISOString(),
    packages: nextPackages
  });
  return nextPackages[index];
}

function listPackages() {
  const packagesState = readWifiDataPackagesState();
  return {
    report_type: "wifi_data_sharing_packages",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    packages: Array.isArray(packagesState.packages) ? packagesState.packages : [],
    counts: {
      total: Array.isArray(packagesState.packages) ? packagesState.packages.length : 0,
      created: countByStatus(packagesState.packages, "created"),
      sent: countByStatus(packagesState.packages, "sent")
    }
  };
}

function listTransfers() {
  return {
    report_type: "wifi_data_sharing_transfers",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfers: readTransferEvents(),
    log_file: getTransferLogFile()
  };
}

function buildTransfersReport() {
  return listTransfers();
}

function listOutboxRecords() {
  const outbox = readWifiDataOutboxState();
  return Array.isArray(outbox.outbox) ? outbox.outbox : [];
}

function listTransferSessionsRecords() {
  const sessions = readWifiTransferSessionsState();
  return Array.isArray(sessions.transfer_sessions) ? sessions.transfer_sessions : [];
}

function buildOutboxReport() {
  const outbox = listOutboxRecords();
  return {
    report_type: "wifi_data_sharing_outbox",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    outbox,
    counts: {
      total: outbox.length,
      created: countByStatus(outbox, "created"),
      queued: countByStatus(outbox, "queued"),
      sending: countByStatus(outbox, "sending"),
      partially_sent: countByStatus(outbox, "partially_sent"),
      sent: countByStatus(outbox, "sent"),
      failed: countByStatus(outbox, "failed"),
      cancelled: countByStatus(outbox, "cancelled"),
      expired: countByStatus(outbox, "expired")
    }
  };
}

function buildOutboxItemReport(packageId) {
  const item = findWifiDataOutboxRecord(packageId);
  if (!item) {
    return buildBlockedTransferReport("Outbox package not found.", packageId);
  }
  return {
    report_type: "wifi_data_sharing_outbox_item",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    outbox_item: item,
    package_id: packageId,
    next_action: "Use retry or cancel to manage the transfer lifecycle."
  };
}

function buildTransferSessionsReport() {
  const transfer_sessions = listTransferSessionsRecords();
  return {
    report_type: "wifi_data_sharing_transfer_sessions",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer_sessions,
    counts: {
      total: transfer_sessions.length,
      queued: countByStatus(transfer_sessions, "queued"),
      sending: countByStatus(transfer_sessions, "sending"),
      partially_sent: countByStatus(transfer_sessions, "partially_sent"),
      sent: countByStatus(transfer_sessions, "sent"),
      failed: countByStatus(transfer_sessions, "failed"),
      cancelled: countByStatus(transfer_sessions, "cancelled")
    }
  };
}

function buildTransferSessionReport(sessionId) {
  const item = findWifiTransferSessionRecord(sessionId);
  if (!item) {
    return buildBlockedTransferReport("Transfer session not found.", sessionId);
  }
  return {
    report_type: "wifi_data_sharing_transfer_session",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer_session: item,
    session_id: sessionId,
    next_action: "Use transfer resume or transfer clean to manage session lifecycle."
  };
}

function buildPackagesReport() {
  return listPackages();
}

function buildTransferReport(transferId) {
  const transfers = readTransferEvents();
  const transfer = transfers.find((item) => item.transfer_id === transferId) || null;
  if (!transfer) {
    return buildBlockedTransferReport("Transfer not found.", transferId);
  }
  return {
    report_type: "wifi_data_sharing_transfer",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer
  };
}

function startTransferServer({ port = DEFAULT_TCP_PORT } = {}) {
  const state = ensureWifiDataSharingState();
  assertInitialized(state);
  const now = new Date().toISOString();
  const transfer_server = {
    status: "running",
    port: Number(port) || DEFAULT_TCP_PORT,
    started_at: state.transfer_server && state.transfer_server.started_at ? state.transfer_server.started_at : now,
    updated_at: now
  };
  writeWifiDataSharingState({
    ...state,
    transfer_server
  });
  appendWifiDataTransferEvent({
    event_type: "server_started",
    transfer_id: null,
    package_id: null,
    source_node_id: state.local_node.node_id,
    target_node_id: null,
    created_at: now,
    sent_at: now
  });
  return {
    report_type: "wifi_data_sharing_server",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer_server,
    next_action: "Phase 4 records server availability locally; future revisions can keep a persistent TCP listener alive."
  };
}

function buildServerReport() {
  const state = ensureWifiDataSharingState();
  return {
    report_type: "wifi_data_sharing_server",
    plugin_id: "wifi_data_sharing",
    status: "ok",
    transfer_server: state.transfer_server || {
      status: "stopped",
      port: null,
      started_at: null,
      updated_at: null
    }
  };
}

function getPackage(packageId) {
  return findPackage(packageId);
}

function getInboxRecord(packageId) {
  const inbox = readWifiDataInboxState();
  return (Array.isArray(inbox.inbox) ? inbox.inbox : []).find((item) => item.package_id === packageId) || null;
}

function listInboxRecords() {
  const inbox = readWifiDataInboxState();
  return Array.isArray(inbox.inbox) ? inbox.inbox : [];
}

function buildBlockedSendReport(message, packageId, targetNodeId) {
  return {
    report_type: "wifi_data_sharing_send",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    package_id: packageId || null,
    target_node_id: targetNodeId || null,
    next_action: message
  };
}

function buildBlockedTransferReport(message, transferId) {
  return {
    report_type: "wifi_data_sharing_transfer",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    transfer_id: transferId || null,
    next_action: message
  };
}

function buildBlockedPackageReport(message) {
  return {
    report_type: "wifi_data_sharing_package",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    next_action: message
  };
}

function buildUnavailableTransferReport(action) {
  return {
    report_type: "wifi_data_sharing_unavailable",
    plugin_id: "wifi_data_sharing",
    status: "blocked",
    requested_action: action || null,
    next_action: "Initialize the Wi-Fi Data Sharing plugin first."
  };
}

function resolveInputPath(inputPath) {
  if (!inputPath) return null;
  return path.resolve(String(inputPath));
}

function readPackagePayload(packageType, sourcePath) {
  if (packageType === "file_blob") {
    const raw = fs.readFileSync(sourcePath);
    return {
      encoding: "base64",
      raw,
      value: raw.toString("base64")
    };
  }
  const text = fs.readFileSync(sourcePath, "utf8");
  if (packageType === "text_note") {
    return { encoding: "text", raw: text, value: text };
  }
  try {
    const parsed = JSON.parse(text);
    return { encoding: "json", raw: Buffer.from(JSON.stringify(parsed)), value: parsed };
  } catch (error) {
    return { encoding: "text", raw: text, value: text };
  }
}

function normalizeInlinePackagePayload(packageType, payload, payloadEncoding = null) {
  if (packageType === "file_blob") {
    const raw = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload || ""), payloadEncoding === "base64" ? "base64" : "utf8");
    return {
      encoding: "base64",
      raw,
      value: raw.toString("base64")
    };
  }
  if (packageType === "text_note") {
    const text = String(payload ?? "");
    return {
      encoding: "text",
      raw: text,
      value: text
    };
  }
  if (payloadEncoding === "text") {
    const text = String(payload ?? "");
    return {
      encoding: "text",
      raw: text,
      value: text
    };
  }
  if (payloadEncoding === "base64" && typeof payload === "string") {
    const raw = Buffer.from(payload, "base64");
    return {
      encoding: "base64",
      raw,
      value: payload
    };
  }
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return {
        encoding: "json",
        raw: Buffer.from(JSON.stringify(parsed)),
        value: parsed
      };
    } catch (error) {
      return {
        encoding: "text",
        raw: payload,
        value: payload
      };
    }
  }
  const jsonValue = payload && typeof payload === "object" ? payload : { value: payload };
  return {
    encoding: "json",
    raw: Buffer.from(JSON.stringify(jsonValue)),
    value: jsonValue
  };
}

function verifyPackageHash(packageRecord) {
  if (!packageRecord) return false;
  const payload = packageRecord.payload;
  const payloadBuffer = Buffer.isBuffer(payload)
    ? payload
    : packageRecord.payload_encoding === "base64"
      ? Buffer.from(String(payload || ""), "base64")
      : packageRecord.payload_encoding === "json"
        ? Buffer.from(JSON.stringify(payload))
        : Buffer.from(String(payload || ""), "utf8");
  const digest = crypto.createHash("sha256").update(payloadBuffer).digest("hex");
  return digest === packageRecord.sha256;
}

function storeInboxRecord(record) {
  const inboxState = readWifiDataInboxState();
  const nextInbox = Array.isArray(inboxState.inbox) ? inboxState.inbox.slice() : [];
  const index = nextInbox.findIndex((item) => item.package_id === record.package_id);
  const normalized = {
    ...record,
    status: record.status || "received",
    quarantined: record.quarantined !== false,
    review_required: true,
    received_at: record.received_at || new Date().toISOString()
  };
  if (index >= 0) nextInbox[index] = { ...nextInbox[index], ...normalized };
  else nextInbox.push(normalized);
  writeWifiDataInboxState({
    ...inboxState,
    created_at: inboxState.created_at || normalized.received_at,
    updated_at: normalized.received_at,
    inbox: nextInbox
  });
  return normalized;
}

function ingestTransportPacket(packet, remote = {}, options = {}) {
  const now = new Date().toISOString();
  const packageId = packet && (packet.package_id || packet.packet_id) ? String(packet.package_id || packet.packet_id) : buildNextPackageId();
  const inboxRecord = storeInboxRecord({
    package_id: packageId,
    package_type: packet && packet.package_type ? packet.package_type : packet && packet.packet_type ? packet.packet_type : "generic_json",
    title: packet && packet.title ? packet.title : packet && packet.message_type ? packet.message_type : "network packet",
    payload: packet && Object.prototype.hasOwnProperty.call(packet, "payload") ? packet.payload : packet || {},
    payload_encoding: packet && packet.payload_encoding ? packet.payload_encoding : "json",
    sha256: packet && packet.sha256 ? packet.sha256 : null,
    source_node_id: packet && packet.source_node_id ? packet.source_node_id : null,
    target_node_id: packet && packet.target_node_id ? packet.target_node_id : (options.localNodeId || null),
    transfer_id: packet && packet.transfer_id ? packet.transfer_id : null,
    received_at: now,
    status: "received",
    quarantined: true,
    review_required: true,
    bootstrap: Boolean(packet && packet.bootstrap),
    received_from_address: remote && remote.address ? remote.address : null,
    received_from_port: remote && remote.port ? remote.port : null
  });
  appendWifiDataTransferEvent({
    event_type: "packet_received",
    transfer_id: packet && packet.transfer_id ? packet.transfer_id : null,
    package_id: packageId,
    source_node_id: packet && packet.source_node_id ? packet.source_node_id : null,
    target_node_id: inboxRecord.target_node_id || options.localNodeId || null,
    package_type: inboxRecord.package_type,
    received_at: now
  });
  return inboxRecord;
}

function writeTransferSummary(record) {
  const state = readWifiDataSharingState();
  const transfers = Array.isArray(state.transfers) ? state.transfers.slice() : [];
  const index = transfers.findIndex((item) => item.transfer_id === record.transfer_id);
  if (index >= 0) transfers[index] = record;
  else transfers.push(record);
  writeWifiDataSharingState({
    ...state,
    transfers,
    updated_at: new Date().toISOString()
  });
  return record;
}

function readTransferEvents() {
  const logFile = getTransferLogFile();
  if (!fs.existsSync(logFile)) return [];
  return fs.readFileSync(logFile, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findPackage(packageId) {
  if (!packageId) return null;
  const packagesState = readWifiDataPackagesState();
  return (Array.isArray(packagesState.packages) ? packagesState.packages : []).find((item) => item.package_id === packageId) || null;
}

function countByStatus(records, status) {
  return (Array.isArray(records) ? records : []).filter((item) => item.status === status).length;
}

function normalizePackageType(packageType) {
  return String(packageType || "").trim().toLowerCase();
}

function buildNextPackageId() {
  const packagesState = readWifiDataPackagesState();
  return `wifi-pkg-${String((Array.isArray(packagesState.packages) ? packagesState.packages.length : 0) + 1).padStart(3, "0")}`;
}

function buildNextOutboxId() {
  const outboxState = readWifiDataOutboxState();
  return `wifi-outbox-${String((Array.isArray(outboxState.outbox) ? outboxState.outbox.length : 0) + 1).padStart(3, "0")}`;
}

function buildNextTransferSessionId() {
  const sessionsState = readWifiTransferSessionsState();
  return `wifi-transfer-session-${String((Array.isArray(sessionsState.transfer_sessions) ? sessionsState.transfer_sessions.length : 0) + 1).padStart(3, "0")}`;
}

function buildNextTransferId() {
  const transfers = readTransferEvents();
  return `wifi-transfer-${String(transfers.length + 1).padStart(3, "0")}`;
}

function assertInitialized(state) {
  if (!state || !state.local_node || !state.local_node.node_id) {
    throw new Error("Run `kvdf wifi-data-sharing init --name <name> --role owner|worker` first.");
  }
}

module.exports = {
  wifiDataTransfer,
  createPackage,
  sendPackage,
  listPackages,
  listTransfers,
  buildTransfersReport,
  buildOutboxReport,
  buildOutboxItemReport,
  buildTransferSessionsReport,
  buildTransferSessionReport,
  buildPackagesReport,
  buildTransferReport,
  buildServerReport,
  startTransferServer,
  sendBootstrapPacket,
  getPackage,
  getInboxRecord,
  listInboxRecords,
  verifyPackageHash,
  storeInboxRecord,
  ingestTransportPacket,
  updatePackageStatus,
  writeTransferSummary,
  buildBlockedSendReport,
  buildBlockedTransferReport,
  buildBlockedPackageReport,
  buildUnavailableTransferReport,
  readTransferEvents,
  readPackagePayload,
  normalizeInlinePackagePayload,
  resolveBootstrapTransportTarget,
  normalizePackageType,
  ALLOWED_PACKAGE_TYPES,
  PACKAGE_SIZE_LIMIT,
  DEFAULT_TCP_PORT,
  getPackagesFile,
  getInboxFile,
  getOutboxFile,
  getTransferSessionsFile,
  getTransferLogFile
};

const fs = require("fs");
const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../../../src/cli/workspace");
const { repoRoot } = require("../../../src/cli/fs_utils");
const wifiClientModule = require("../integrations/wifi_data_sharing_client");

const PACKET_STATE_FILE = ".kabeeri/multi_ai_wifi_packets.json";
const WIFI_PACKET_TYPES = new Set([
  "assignment_packet",
  "queue_status_packet",
  "evidence_packet",
  "merge_preview_packet",
  "owner_decision_packet",
  "heartbeat_packet"
]);

function multiAiWifiPackets(action, value, flags = {}, rest = [], deps = {}) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  if (!["wifi", "wifi_packets", "wifi-packets"].includes(normalizedAction)) {
    throw new Error(`Unknown multi-ai wifi action: ${action}`);
  }

  const wifiClient = resolveWifiClient(deps);
  const governanceState = normalizeGovernanceState(deps.governanceState || readGovernanceState());
  const packetState = ensureWifiPacketState();
  const valueText = String(value || "").trim().toLowerCase();

  if (!valueText || ["status", "summary", "show", "report"].includes(valueText)) {
    return buildWifiStatusReport({ wifiClient, governanceState, packetState });
  }

  if (valueText === "nodes") {
    return buildWifiNodesReport({ wifiClient, governanceState });
  }

  if (valueText === "packet") {
    const packetAction = String(rest[0] || flags.action || flags.cmd || "").trim().toLowerCase();
    const packetRest = rest.length > 0 ? rest.slice(1) : [];
    return routePacketAction(packetAction, flags, packetRest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }

  if (["packet-create", "packet_create"].includes(valueText)) {
    return routePacketAction("create", flags, rest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }
  if (["packet-send", "packet_send"].includes(valueText)) {
    return routePacketAction("send", flags, rest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }
  if (["packet-inbox", "packet_inbox"].includes(valueText)) {
    return routePacketAction("inbox", flags, rest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }
  if (["packet-inspect", "packet_inspect"].includes(valueText)) {
    return routePacketAction("inspect", flags, rest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }
  if (["packet-consume", "packet_consume"].includes(valueText)) {
    return routePacketAction("consume", flags, rest, { wifiClient, governanceState, packetState, appendAudit: deps.appendAudit });
  }

  return buildBlockedWifiReport(`Unknown multi-ai wifi action: ${valueText}`, {
    report_type: "multi_ai_wifi_blocked",
    status: "blocked",
    next_action: "Use `kvdf multi-ai wifi status`, `kvdf multi-ai wifi nodes`, or `kvdf multi-ai wifi packet <create|send|inbox|inspect|consume>`."
  });
}

function routePacketAction(packetAction, flags, rest, deps) {
  const normalized = String(packetAction || "").trim().toLowerCase();
  if (!normalized || normalized === "status" || normalized === "summary" || normalized === "list") {
    return buildWifiStatusReport(deps);
  }
  if (normalized === "create") {
    return buildWifiPacketCreateReport({
      packetType: flags.type || flags.packet_type || flags.packetType || flags.kind || null,
      queueId: flags.queue || flags.queue_id || rest[0] || null,
      flags,
      ...deps
    });
  }
  if (normalized === "send") {
    return buildWifiPacketSendReport({
      packetId: flags.packet || flags.packet_id || flags.packetId || rest[0] || null,
      targetNodeId: flags.to || flags.node || flags.node_id || rest[1] || null,
      confirm: Boolean(flags.confirm),
      flags,
      ...deps
    });
  }
  if (normalized === "inbox") {
    return buildWifiPacketInboxReport({
      packetState: deps.packetState,
      wifiClient: deps.wifiClient,
      governanceState: deps.governanceState
    });
  }
  if (normalized === "inspect") {
    return buildWifiPacketInspectReport({
      identifier: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      packetState: deps.packetState,
      wifiClient: deps.wifiClient,
      governanceState: deps.governanceState
    });
  }
  if (normalized === "consume") {
    return buildWifiPacketConsumeReport({
      identifier: flags.package || flags.package_id || flags.packet || flags.packet_id || rest[0] || null,
      confirm: Boolean(flags.confirm),
      packetState: deps.packetState,
      wifiClient: deps.wifiClient,
      governanceState: deps.governanceState,
      appendAudit: deps.appendAudit
    });
  }
  return buildBlockedWifiReport(`Unknown multi-ai wifi packet action: ${normalized}`, {
    report_type: "multi_ai_wifi_packet_blocked",
    status: "blocked",
    next_action: "Use `kvdf multi-ai wifi packet create|send|inbox|inspect|consume`."
  });
}

function buildWifiStatusReport({ wifiClient = wifiClientModule, governanceState = normalizeGovernanceState(), packetState = readPacketState() } = {}) {
  const integrationStatus = buildIntegrationStatus(wifiClient);
  const provider = resolveWifiProvider(wifiClient);
  const trustedNodes = provider && typeof provider.listTrustedNodes === "function" ? safeCall(() => provider.listTrustedNodes(), []) : [];
  const candidates = provider && typeof provider.listCandidates === "function" ? safeCall(() => provider.listCandidates(), []) : [];
  const localNode = provider && typeof provider.getLocalNode === "function"
    ? safeCall(() => provider.getLocalNode(), null)
    : null;
  const localNodeInitialized = Boolean(localNode && localNode.node_id);
  const latestPackets = getLatestPackets(packetState, 5);
  const transferReadiness = computeTransferReadiness({
    providerAvailable: Boolean(provider),
    localNodeInitialized,
    trustedNodesCount: Array.isArray(trustedNodes) ? trustedNodes.length : 0,
    packetCount: Array.isArray(packetState.packets) ? packetState.packets.length : 0
  });

  return {
    report_type: "multi_ai_wifi_status",
    generated_at: new Date().toISOString(),
    status: integrationStatus.available
      ? (transferReadiness === "ready" ? "ready" : "partial")
      : "unavailable",
    wifi_data_sharing: {
      available: Boolean(integrationStatus.available),
      status: integrationStatus.status || (integrationStatus.available ? "available" : "unavailable"),
      provider: integrationStatus.provider || null,
      local_node: integrationStatus.local_node || localNode,
      trusted_nodes_count: Array.isArray(trustedNodes) ? trustedNodes.length : 0,
      next_action: integrationStatus.next_action || "Enable wifi_data_sharing to use LAN packets."
    },
    local_node_initialized: localNodeInitialized,
    trusted_nodes_count: Array.isArray(trustedNodes) ? trustedNodes.length : 0,
    candidate_nodes_count: Array.isArray(candidates) ? candidates.length : 0,
    transfer_readiness: transferReadiness,
    latest_governance_packets: latestPackets,
    latest_governance_packets_count: latestPackets.length,
    governance_summary: summarizeGovernanceState(governanceState),
    packet_state_file: PACKET_STATE_FILE,
    next_action: buildWifiStatusNextAction(integrationStatus, transferReadiness, localNodeInitialized)
  };
}

function buildWifiNodesReport({ wifiClient = wifiClientModule } = {}) {
  const integrationStatus = buildIntegrationStatus(wifiClient);
  const provider = resolveWifiProvider(wifiClient);
  const trustedNodes = provider && typeof provider.listTrustedNodes === "function" ? safeCall(() => provider.listTrustedNodes(), []) : [];
  const candidateNodes = provider && typeof provider.listCandidates === "function" ? safeCall(() => provider.listCandidates(), []) : [];
  const localNode = provider && typeof provider.getLocalNode === "function"
    ? safeCall(() => provider.getLocalNode(), null)
    : null;
  return {
    report_type: "multi_ai_wifi_nodes",
    generated_at: new Date().toISOString(),
    status: integrationStatus.available ? "available" : "unavailable",
    wifi_data_sharing: integrationStatus,
    local_node_initialized: Boolean(localNode && localNode.node_id),
    trusted_nodes_count: Array.isArray(trustedNodes) ? trustedNodes.length : 0,
    candidate_nodes_count: Array.isArray(candidateNodes) ? candidateNodes.length : 0,
    trusted_nodes: trustedNodes,
    candidate_nodes: candidateNodes,
    next_action: integrationStatus.available
      ? "Use `kvdf multi-ai wifi packet create` to build a governance packet for a trusted node."
      : "Install or enable wifi_data_sharing before using LAN packet transport."
  };
}

function buildWifiPacketCreateReport({ packetType, queueId, flags = {}, governanceState = normalizeGovernanceState(), packetState = ensurePacketState(), appendAudit = null } = {}) {
  const normalizedType = normalizePacketType(packetType);
  if (!normalizedType) {
    return buildBlockedPacketReport("Missing --type.", "create");
  }
  if (!WIFI_PACKET_TYPES.has(normalizedType)) {
    return buildBlockedPacketReport(`Unsupported packet type: ${normalizedType}.`, "create");
  }
  const queue = findGovernanceQueue(governanceState, queueId);
  if (!queue) {
    return buildBlockedPacketReport("Missing or unknown --queue.", "create");
  }
  const leaderSession = getActiveLeaderSession(governanceState);
  const now = new Date().toISOString();
  const packetId = buildNextPacketId(packetState);
  const packet = {
    packet_id: packetId,
    packet_type: normalizedType,
    source: "multi_ai_governance",
    target_plugin: "multi_ai_governance",
    queue_id: queue.queue_id || queueId || null,
    assignment_id: queue.assignment_id || queue.queue_id || queueId || null,
    leader_session_id: leaderSession ? leaderSession.session_id : null,
    created_by_node_id: leaderSession ? leaderSession.leader_ai_id : null,
    title: buildPacketTitle(normalizedType, queue, leaderSession),
    payload: buildGovernancePacketPayload(normalizedType, queue, leaderSession, governanceState, { flags, now }),
    created_at: now,
    status: "created",
    package_id: null,
    target_node_id: null,
    sent_at: null,
    received_at: null,
    inspected_at: null,
    consumed_at: null,
    rejected_at: null
  };
  upsertPacketRecord(packetState, packet);
  if (appendAudit) {
    appendAudit("multi_ai.wifi_packet_created", "multi_ai", packet.packet_id, `Wi-Fi governance packet created for ${packet.queue_id || "queue"}`);
  }
  return {
    report_type: "multi_ai_wifi_packet_created",
    generated_at: now,
    status: "ok",
    packet,
    governance_queue: summarizeQueue(queue),
    leader_session: summarizeLeaderSession(leaderSession),
    next_action: `Run \`kvdf multi-ai wifi packet send --packet ${packetId} --to <node-id> --confirm\` to send it through wifi_data_sharing.`
  };
}

function buildWifiPacketSendReport({ packetId, targetNodeId, confirm = false, flags = {}, wifiClient = wifiClientModule, governanceState = normalizeGovernanceState(), packetState = ensurePacketState(), appendAudit = null } = {}) {
  if (!confirm) {
    return buildBlockedPacketReport("Packet send requires --confirm.", "send");
  }
  const packetRecord = resolvePacketRecord(packetId, { packetState, wifiClient, governanceState });
  if (!packetRecord.packet) {
    return buildBlockedPacketReport("Packet not found.", "send");
  }
  const packet = packetRecord.packet;
  const provider = resolveWifiProvider(wifiClient);
  const integrationAvailability = buildIntegrationStatus(wifiClient);
  if (!integrationAvailability.available || !provider) {
    return {
      report_type: "multi_ai_wifi_packet_send",
      generated_at: new Date().toISOString(),
      status: "blocked",
      packet,
      next_action: integrationAvailability.next_action || "Enable wifi_data_sharing first."
    };
  }
  const targetNode = String(targetNodeId || "").trim();
  if (!targetNode) {
    return buildBlockedPacketReport("Missing --to target node.", "send");
  }
  const canSend = typeof wifiClient.canSendGovernancePacket === "function"
    ? wifiClient.canSendGovernancePacket(packet, targetNode, { confirm: true })
    : provider && typeof provider.canSendPackage === "function"
      ? provider.canSendPackage(packet, targetNode, { confirm: true })
      : { status: "blocked", can_send: false, next_action: "wifi_data_sharing is unavailable." };
  if (!canSend || canSend.status === "blocked" || canSend.can_send === false) {
    return {
      report_type: "multi_ai_wifi_packet_send",
      generated_at: new Date().toISOString(),
      status: "blocked",
      packet,
      wifi_check: canSend || null,
      next_action: canSend && canSend.next_action ? canSend.next_action : "The target node or package is not eligible for sending."
    };
  }
  const sent = typeof wifiClient.sendGovernancePacket === "function"
    ? wifiClient.sendGovernancePacket(packet, targetNode, { confirm: true })
    : provider.sendPackage(packet.packet_id, targetNode, { confirm: true });
  if (!sent || sent.status === "blocked") {
    return {
      report_type: "multi_ai_wifi_packet_send",
      generated_at: new Date().toISOString(),
      status: "blocked",
      packet,
      wifi_result: sent || null,
      next_action: sent && sent.next_action ? sent.next_action : "The wifi provider blocked the transfer."
    };
  }
  const now = new Date().toISOString();
  const updatedPacket = upsertPacketRecord(packetState, {
    ...packet,
    status: "sent",
    target_node_id: targetNode,
    package_id: sent && sent.transfer ? sent.transfer.package_id || null : null,
    sent_at: sent && sent.transfer ? sent.transfer.sent_at || now : now,
    updated_at: now
  });
  recordPacketReceipt(packetState, {
    packet_id: updatedPacket.packet_id,
    package_id: updatedPacket.package_id || null,
    action: "sent",
    created_at: now,
    status: "sent",
    target_node_id: targetNode,
    source: "multi_ai_governance"
  });
  if (appendAudit) {
    appendAudit("multi_ai.wifi_packet_sent", "multi_ai", updatedPacket.packet_id, `Wi-Fi governance packet sent to ${targetNode}`);
  }
  return {
    report_type: "multi_ai_wifi_packet_sent",
    generated_at: now,
    status: "ok",
    packet: updatedPacket,
    wifi_result: sent,
    package_id: sent && sent.transfer ? sent.transfer.package_id || null : updatedPacket.package_id || null,
    transfer: sent ? sent.transfer || null : null,
    outbox: sent ? sent.outbox || null : null,
    inbox_record: sent ? sent.inbox_record || null : null,
    next_action: "The packet was delivered through wifi_data_sharing. It still does not auto-apply to multi_ai_governance."
  };
}

function buildWifiPacketInboxReport({ packetState = readPacketState(), wifiClient = wifiClientModule } = {}) {
  const provider = resolveWifiProvider(wifiClient);
  if (!provider || typeof provider.listInbox !== "function") {
    return {
      report_type: "multi_ai_wifi_packet_inbox",
      generated_at: new Date().toISOString(),
      status: "unavailable",
      packets: [],
      counts: {
        total: 0,
        received: 0,
        accepted: 0,
        rejected: 0
      },
      next_action: "Enable wifi_data_sharing before reading inbox packets."
    };
  }
  const inbox = provider.listInbox({ limit: 200 }) || [];
  const packets = inbox
    .filter((item) => WIFI_PACKET_TYPES.has(String(item.package_type || "").trim().toLowerCase()))
    .map((item) => {
      const mapped = resolvePacketRecord(item.package_id, { packetState, wifiClient, packageRecord: item }).packet || null;
      const packet = mapped || buildPacketRecordFromInboxItem(item);
      const updated = upsertPacketRecord(packetState, {
        ...packet,
        status: packet.status === "consumed" ? packet.status : "received",
        package_id: item.package_id,
        target_node_id: item.target_node_id || null,
        received_at: item.received_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return {
        packet_id: updated.packet_id,
        package_id: item.package_id,
        packet_type: updated.packet_type,
        title: item.title || updated.title || null,
        status: item.status || updated.status || "received",
        source_node_id: item.source_node_id || null,
        target_node_id: item.target_node_id || null,
        quarantined: item.quarantined !== false,
        received_at: item.received_at || null,
        accepted_at: item.accepted_at || null,
        rejected_at: item.rejected_at || null
      };
    });
  return {
    report_type: "multi_ai_wifi_packet_inbox",
    generated_at: new Date().toISOString(),
    status: "ok",
    packets,
    counts: {
      total: packets.length,
      received: packets.filter((item) => item.status === "received").length,
      accepted: packets.filter((item) => item.status === "accepted").length,
      rejected: packets.filter((item) => item.status === "rejected").length
    },
    next_action: "Use inspect to view a packet and consume to record a receipt without auto-applying governance state."
  };
}

function buildWifiPacketInspectReport({ identifier, packetState = readPacketState(), wifiClient = wifiClientModule, governanceState = normalizeGovernanceState() } = {}) {
  const resolved = resolvePacketRecord(identifier, { packetState, wifiClient, governanceState });
  if (!resolved.packet) {
    return buildBlockedPacketReport("Packet not found.", "inspect");
  }
  const packet = resolved.packet;
  const now = new Date().toISOString();
  return {
    report_type: "multi_ai_wifi_packet_inspected",
    generated_at: now,
    status: "ok",
    packet,
    package: resolved.packageRecord || null,
    payload: packet.payload || null,
    next_action: "Inspection is read-only. Use consume with --confirm if you want to record a receipt."
  };
}

function buildWifiPacketConsumeReport({ identifier, confirm = false, packetState = ensurePacketState(), wifiClient = wifiClientModule, governanceState = normalizeGovernanceState(), appendAudit = null } = {}) {
  if (!confirm) {
    return buildBlockedPacketReport("Packet consume requires --confirm.", "consume");
  }
  const resolved = resolvePacketRecord(identifier, { packetState, wifiClient, governanceState });
  if (!resolved.packet) {
    return buildBlockedPacketReport("Packet not found.", "consume");
  }
  const packet = resolved.packet;
  if (String(packet.target_plugin || "").trim() !== "multi_ai_governance") {
    return buildBlockedPacketReport("Only packets targeting multi_ai_governance can be consumed here.", "consume");
  }
  const now = new Date().toISOString();
  const updated = upsertPacketRecord(packetState, {
    ...packet,
    status: "consumed",
    consumed_at: now,
    updated_at: now
  });
  const receipt = recordPacketReceipt(packetState, {
    packet_id: updated.packet_id,
    package_id: updated.package_id || resolved.packageRecord && resolved.packageRecord.package_id || null,
    action: "consume",
    created_at: now,
    status: "recorded",
    target_plugin: updated.target_plugin,
    target_node_id: updated.target_node_id || null,
    source: "multi_ai_governance"
  });
  if (appendAudit) {
    appendAudit("multi_ai.wifi_packet_consumed", "multi_ai", updated.packet_id, `Receipt recorded for governance packet ${updated.packet_id}`);
  }
  return {
    report_type: "multi_ai_wifi_packet_consumed",
    generated_at: now,
    status: "ok",
    packet: updated,
    receipt,
    next_action: "Receipt recorded only. The packet did not auto-apply to multi_ai_governance state."
  };
}

function buildWifiPacketWorkflowReport({ packetState = readPacketState() } = {}) {
  const packets = Array.isArray(packetState.packets) ? packetState.packets.slice() : [];
  return {
    report_type: "multi_ai_wifi_packet_workflow",
    generated_at: new Date().toISOString(),
    status: packets.length ? "available" : "empty",
    packets: packets.slice(-10).reverse(),
    counts: {
      total: packets.length,
      created: packets.filter((item) => item.status === "created").length,
      sent: packets.filter((item) => item.status === "sent").length,
      received: packets.filter((item) => item.status === "received").length,
      inspected: packets.filter((item) => item.status === "inspected").length,
      consumed: packets.filter((item) => item.status === "consumed").length,
      rejected: packets.filter((item) => item.status === "rejected").length
    },
    next_action: packets.length
      ? "Use `kvdf multi-ai wifi packet inspect <package-id>` or `consume --confirm` to review a packet."
      : "Create a governance packet with `kvdf multi-ai wifi packet create --type <type> --queue <queue-id>`."
  };
}

function renderWifiPacketsReport(report) {
  if (!report) return "";
  if (report.report_type === "multi_ai_wifi_status") {
    return [
      "Multi-AI Wi-Fi Status",
      `Status: ${report.status}`,
      `Wifi sharing: ${report.wifi_data_sharing && report.wifi_data_sharing.available ? "available" : "missing"}`,
      `Local node initialized: ${report.local_node_initialized ? "yes" : "no"}`,
      `Trusted nodes: ${report.trusted_nodes_count}`,
      `Transfer readiness: ${report.transfer_readiness}`,
      `Governance packets: ${report.latest_governance_packets_count}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  if (report.report_type === "multi_ai_wifi_nodes") {
    const nodes = Array.isArray(report.trusted_nodes) ? report.trusted_nodes : [];
    const lines = [
      "Multi-AI Wi-Fi Nodes",
      `Status: ${report.status}`,
      `Trusted nodes: ${report.trusted_nodes_count}`,
      `Candidate nodes: ${report.candidate_nodes_count}`,
      "",
      "Trusted node list:"
    ];
    if (!nodes.length) {
      lines.push("- none");
    } else {
      for (const node of nodes) {
        lines.push(`- ${node.node_id} (${node.trust_status || "trusted"}) ${node.display_name || ""}`.trim());
      }
    }
    return lines.join("\n");
  }
  if (report.report_type === "multi_ai_wifi_packet_created") {
    return `Wi-Fi governance packet created: ${report.packet && report.packet.packet_id ? report.packet.packet_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_wifi_packet_sent") {
    return `Wi-Fi governance packet sent: ${report.packet && report.packet.packet_id ? report.packet.packet_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_wifi_packet_inbox") {
    const packets = Array.isArray(report.packets) ? report.packets : [];
    const lines = [
      "Multi-AI Wi-Fi Packet Inbox",
      `Packets: ${packets.length}`
    ];
    for (const packet of packets) {
      lines.push(`- ${packet.package_id || packet.packet_id} (${packet.status}) ${packet.packet_type || ""}`.trim());
    }
    return lines.join("\n");
  }
  if (report.report_type === "multi_ai_wifi_packet_inspected") {
    return `Inspected packet: ${report.packet && report.packet.packet_id ? report.packet.packet_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_wifi_packet_consumed") {
    return `Consumed packet receipt recorded: ${report.packet && report.packet.packet_id ? report.packet.packet_id : "unknown"}`;
  }
  if (report.report_type === "multi_ai_wifi_packet_workflow") {
    const packets = Array.isArray(report.packets) ? report.packets : [];
    const lines = [
      "Multi-AI Wi-Fi Packet Workflow",
      `Packets: ${report.counts.total}`
    ];
    for (const packet of packets) {
      lines.push(`- ${packet.packet_id} (${packet.status}) ${packet.packet_type}`);
    }
    return lines.join("\n");
  }
  if (report.report_type === "multi_ai_wifi_packet_blocked") {
    return [
      "Multi-AI Wi-Fi Packet",
      `Status: ${report.status}`,
      report.next_action ? `Next: ${report.next_action}` : null
    ].filter(Boolean).join("\n");
  }
  return JSON.stringify(report, null, 2);
}

function resolveWifiClient(deps = {}) {
  if (deps && deps.wifiClient) return deps.wifiClient;
  return wifiClientModule;
}

function resolveWifiProvider(wifiClient) {
  if (!wifiClient) return null;
  if (typeof wifiClient.getWifiDataSharingProvider === "function") {
    return wifiClient.getWifiDataSharingProvider();
  }
  return null;
}

function buildIntegrationStatus(wifiClient) {
  if (!wifiClient || typeof wifiClient.buildWifiDataSharingIntegrationStatus !== "function") {
    return {
      report_type: "multi_ai_wifi_integration",
      available: false,
      status: "unavailable",
      next_action: "Install or enable wifi_data_sharing to use LAN packet transport."
    };
  }
  return wifiClient.buildWifiDataSharingIntegrationStatus();
}

function normalizeGovernanceState(state = null) {
  const next = state && typeof state === "object" ? { ...state } : defaultGovernanceState();
  next.leader_sessions = Array.isArray(next.leader_sessions) ? next.leader_sessions : [];
  next.worker_queues = Array.isArray(next.worker_queues) ? next.worker_queues : [];
  next.merge_bundles = Array.isArray(next.merge_bundles) ? next.merge_bundles : [];
  next.agent_entries = Array.isArray(next.agent_entries) ? next.agent_entries : [];
  next.call_inbox = Array.isArray(next.call_inbox) ? next.call_inbox : [];
  next.evolution_governor = next.evolution_governor && typeof next.evolution_governor === "object" ? next.evolution_governor : {};
  return next;
}

function defaultGovernanceState() {
  return {
    version: "v1",
    active_leader_session_id: null,
    leader_sessions: [],
    worker_queues: [],
    merge_bundles: [],
    agent_entries: [],
    call_inbox: [],
    evolution_governor: {},
    updated_at: null
  };
}

function readGovernanceState() {
  const file = path.join(repoRoot(), ".kabeeri", "multi_ai_governance.json");
  if (!fs.existsSync(file)) {
    return defaultGovernanceState();
  }
  return readJsonFile(".kabeeri/multi_ai_governance.json", defaultGovernanceState());
}

function ensurePacketState() {
  ensureWorkspace();
  const file = getPacketStateFile();
  if (!fs.existsSync(file)) {
    writePacketState(defaultPacketState());
  }
  return readPacketState();
}

function ensureWifiPacketState() {
  return ensurePacketState();
}

function readPacketState() {
  return readJsonFile(PACKET_STATE_FILE, defaultPacketState());
}

function writePacketState(state) {
  const next = {
    ...defaultPacketState(),
    ...(state || {}),
    packets: Array.isArray(state && state.packets) ? state.packets : [],
    receipts: Array.isArray(state && state.receipts) ? state.receipts : []
  };
  return writeJsonFile(PACKET_STATE_FILE, next);
}

function defaultPacketState() {
  return {
    version: "v1",
    plugin_id: "multi_ai_governance",
    created_at: null,
    updated_at: null,
    packets: [],
    receipts: []
  };
}

function getPacketStateFile() {
  return path.join(repoRoot(), PACKET_STATE_FILE);
}

function getLatestPackets(packetState, limit = 5) {
  const packets = Array.isArray(packetState && packetState.packets) ? packetState.packets : [];
  return packets.slice(-Math.max(0, Number(limit) || 5)).reverse();
}

function computeTransferReadiness({ providerAvailable, localNodeInitialized, trustedNodesCount, packetCount }) {
  if (!providerAvailable) return "missing";
  if (!localNodeInitialized) return "blocked";
  if (!trustedNodesCount) return "blocked";
  return packetCount >= 0 ? "ready" : "partial";
}

function buildWifiStatusNextAction(integrationStatus, transferReadiness, localNodeInitialized) {
  if (!integrationStatus.available) return integrationStatus.next_action || "Enable wifi_data_sharing to use LAN packet transport.";
  if (!localNodeInitialized) return "Initialize the wifi_data_sharing local node before sending packets.";
  if (transferReadiness !== "ready") return "Pair and trust at least one LAN node before sending governance packets.";
  return "Create a governance packet or inspect the latest packet workflow.";
}

function summarizeGovernanceState(governanceState) {
  const queues = Array.isArray(governanceState.worker_queues) ? governanceState.worker_queues : [];
  const activeQueues = queues.filter((queue) => queue.status === "active");
  return {
    leader_sessions: Array.isArray(governanceState.leader_sessions) ? governanceState.leader_sessions.length : 0,
    active_leader_session_id: governanceState.active_leader_session_id || null,
    active_queues: activeQueues.length,
    merge_bundles: Array.isArray(governanceState.merge_bundles) ? governanceState.merge_bundles.length : 0
  };
}

function summarizeQueue(queue) {
  if (!queue) return null;
  return {
    queue_id: queue.queue_id || null,
    ai_id: queue.ai_id || null,
    status: queue.status || null,
    title: queue.title || queue.name || null,
    current_slice_id: queue.current_slice_id || null,
    assignment_mode: queue.assignment_mode || null
  };
}

function summarizeLeaderSession(leaderSession) {
  if (!leaderSession) return null;
  return {
    session_id: leaderSession.session_id || null,
    leader_ai_id: leaderSession.leader_ai_id || null,
    leader_name: leaderSession.leader_name || null,
    status: leaderSession.status || null,
    current_priority_id: leaderSession.current_priority_id || null,
    current_temporary_queue_id: leaderSession.current_temporary_queue_id || null
  };
}

function buildPacketTitle(packetType, queue, leaderSession) {
  const queueLabel = queue && (queue.title || queue.name || queue.queue_id || queue.ai_id) ? (queue.title || queue.name || queue.queue_id || queue.ai_id) : "queue";
  const leaderLabel = leaderSession && leaderSession.leader_ai_id ? leaderSession.leader_ai_id : "multi-ai";
  return `${packetType.replace(/_/g, " ")} :: ${queueLabel} :: ${leaderLabel}`;
}

function buildGovernancePacketPayload(packetType, queue, leaderSession, governanceState, { flags = {}, now = new Date().toISOString() } = {}) {
  const currentSlice = queue && Array.isArray(queue.slices) ? queue.slices.find((slice) => slice.slice_id === queue.current_slice_id) || queue.slices.find((slice) => slice.state === "active") || queue.slices[0] || null : null;
  return {
    packet_id: buildPreviewPacketId(packetType, queue),
    packet_type: packetType,
    source: "multi_ai_governance",
    target_plugin: "multi_ai_governance",
    queue_id: queue ? queue.queue_id || null : null,
    assignment_id: queue ? queue.assignment_id || queue.queue_id || null : null,
    leader_session_id: leaderSession ? leaderSession.session_id || null : null,
    created_by_node_id: leaderSession ? leaderSession.leader_ai_id || null : null,
    packet_title: buildPacketTitle(packetType, queue, leaderSession),
    governance_summary: summarizeGovernanceState(governanceState),
    queue: summarizeQueue(queue),
    leader_session: summarizeLeaderSession(leaderSession),
    packet_shape: {
      kind: packetType,
      queue_id: queue ? queue.queue_id || null : null,
      current_slice_id: currentSlice ? currentSlice.slice_id || null : null,
      current_slice_title: currentSlice ? currentSlice.title || null : null
    },
    request: buildPacketRequestSummary(packetType, queue, currentSlice, flags),
    created_at: now
  };
}

function buildPacketRequestSummary(packetType, queue, currentSlice, flags) {
  return {
    packet_type: packetType,
    queue_id: queue ? queue.queue_id || null : null,
    ai_id: queue ? queue.ai_id || null : null,
    title: queue ? queue.title || queue.name || null : null,
    current_slice_id: currentSlice ? currentSlice.slice_id || null : null,
    current_slice_title: currentSlice ? currentSlice.title || null : null,
    flags: {
      scope: flags && flags.scope ? flags.scope : null,
      reason: flags && flags.reason ? flags.reason : null
    }
  };
}

function buildPreviewPacketId(packetType, queue) {
  const queuePart = queue && queue.queue_id ? queue.queue_id : "queue";
  return `multi-ai-wifi-${packetType}-${queuePart}`.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
}

function findGovernanceQueue(governanceState, queueId) {
  const normalized = String(queueId || "").trim();
  if (!normalized) return null;
  const queues = Array.isArray(governanceState.worker_queues) ? governanceState.worker_queues : [];
  return queues.find((queue) => queue.queue_id === normalized || queue.ai_id === normalized) || null;
}

function getActiveLeaderSession(governanceState) {
  const sessions = Array.isArray(governanceState.leader_sessions) ? governanceState.leader_sessions : [];
  if (governanceState.active_leader_session_id) {
    const active = sessions.find((session) => session.session_id === governanceState.active_leader_session_id && session.status === "active");
    if (active) return active;
  }
  return [...sessions].reverse().find((session) => session.status === "active") || null;
}

function normalizePacketType(packetType) {
  return String(packetType || "").trim().toLowerCase();
}

function buildNextPacketId(packetState) {
  const packets = Array.isArray(packetState && packetState.packets) ? packetState.packets : [];
  return `multi-ai-wifi-packet-${String(packets.length + 1).padStart(3, "0")}`;
}

function buildBlockedPacketReport(message, action) {
  return {
    report_type: "multi_ai_wifi_packet_blocked",
    generated_at: new Date().toISOString(),
    status: "blocked",
    action: action || null,
    next_action: message
  };
}

function buildBlockedWifiReport(message, extras = {}) {
  return {
    report_type: extras.report_type || "multi_ai_wifi_blocked",
    generated_at: new Date().toISOString(),
    status: "blocked",
    next_action: message,
    ...extras
  };
}

function resolvePacketRecord(identifier, { packetState = readPacketState(), wifiClient = wifiClientModule, governanceState = normalizeGovernanceState(), packageRecord = null } = {}) {
  const lookup = String(identifier || "").trim();
  if (!lookup) {
    return { packet: null, packageRecord: null };
  }
  const packets = Array.isArray(packetState.packets) ? packetState.packets : [];
  const packet = packets.find((item) => item.packet_id === lookup || item.package_id === lookup) || null;
  if (packet) {
    return { packet: { ...packet }, packageRecord: null };
  }
  const wifiProvider = resolveWifiProvider(wifiClient);
  const providerPackage = packageRecord || (wifiProvider && typeof wifiProvider.getPackage === "function" ? safeCall(() => wifiProvider.getPackage(lookup), null) : null);
  if (!providerPackage) {
    return { packet: null, packageRecord: null };
  }
  const payload = providerPackage.payload && typeof providerPackage.payload === "object" ? providerPackage.payload : {};
  const reconstructed = {
    packet_id: payload.packet_id || providerPackage.package_id || lookup,
    packet_type: normalizePacketType(providerPackage.package_type || payload.packet_type || payload.packetType || "generic_json"),
    source: payload.source || "multi_ai_governance",
    target_plugin: payload.target_plugin || "multi_ai_governance",
    queue_id: payload.queue_id || null,
    assignment_id: payload.assignment_id || null,
    leader_session_id: payload.leader_session_id || null,
    created_by_node_id: payload.created_by_node_id || null,
    title: payload.packet_title || providerPackage.title || null,
    payload,
    created_at: payload.created_at || providerPackage.created_at || null,
    status: payload.status || providerPackage.status || "received",
    package_id: providerPackage.package_id || null,
    target_node_id: providerPackage.target_node_id || null,
    sent_at: providerPackage.sent_at || null,
    received_at: providerPackage.received_at || null,
    inspected_at: null,
    consumed_at: null,
    rejected_at: null
  };
  // Avoid unused parameter linting by touching governance state for future-safe parity.
  void governanceState;
  return { packet: reconstructed, packageRecord: providerPackage };
}

function upsertPacketRecord(packetState, record) {
  const current = ensurePacketStateWith(packetState);
  const packets = Array.isArray(current.packets) ? current.packets.slice() : [];
  const index = packets.findIndex((item) => item.packet_id === record.packet_id || (record.package_id && item.package_id === record.package_id));
  if (index >= 0) {
    packets[index] = { ...packets[index], ...record };
  } else {
    packets.push({ ...record });
  }
  const next = {
    ...current,
    created_at: current.created_at || record.created_at || new Date().toISOString(),
    updated_at: record.updated_at || new Date().toISOString(),
    packets
  };
  writePacketState(next);
  return packets[index >= 0 ? index : packets.length - 1];
}

function recordPacketReceipt(packetState, receipt) {
  const current = ensurePacketStateWith(packetState);
  const receipts = Array.isArray(current.receipts) ? current.receipts.slice() : [];
  const receiptRecord = {
    receipt_id: receipt.receipt_id || nextReceiptId(receipts),
    packet_id: receipt.packet_id || null,
    package_id: receipt.package_id || null,
    action: receipt.action || "consume",
    status: receipt.status || "recorded",
    source: receipt.source || "multi_ai_governance",
    target_plugin: receipt.target_plugin || "multi_ai_governance",
    target_node_id: receipt.target_node_id || null,
    created_at: receipt.created_at || new Date().toISOString(),
    updated_at: receipt.updated_at || receipt.created_at || new Date().toISOString()
  };
  receipts.push(receiptRecord);
  writePacketState({
    ...current,
    created_at: current.created_at || receiptRecord.created_at,
    updated_at: receiptRecord.updated_at,
    receipts
  });
  return receiptRecord;
}

function ensurePacketStateWith(packetState) {
  if (packetState && packetState.version) {
    return {
      ...defaultPacketState(),
      ...packetState,
      packets: Array.isArray(packetState.packets) ? packetState.packets : [],
      receipts: Array.isArray(packetState.receipts) ? packetState.receipts : []
    };
  }
  return ensurePacketState();
}

function nextReceiptId(receipts) {
  return `multi-ai-wifi-receipt-${String((Array.isArray(receipts) ? receipts.length : 0) + 1).padStart(3, "0")}`;
}

function buildPacketRecordFromInboxItem(item) {
  const payload = item && item.payload && typeof item.payload === "object" ? item.payload : {};
  return {
    packet_id: payload.packet_id || item.package_id || null,
    packet_type: normalizePacketType(item.package_type || payload.packet_type || "generic_json"),
    source: payload.source || "multi_ai_governance",
    target_plugin: payload.target_plugin || "multi_ai_governance",
    queue_id: payload.queue_id || null,
    assignment_id: payload.assignment_id || null,
    leader_session_id: payload.leader_session_id || null,
    created_by_node_id: payload.created_by_node_id || null,
    title: payload.packet_title || item.title || null,
    payload,
    created_at: payload.created_at || item.received_at || null,
    status: item.status || "received",
    package_id: item.package_id || null,
    target_node_id: item.target_node_id || null,
    received_at: item.received_at || null,
    sent_at: item.sent_at || null,
    inspected_at: null,
    consumed_at: null,
    rejected_at: null
  };
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

module.exports = {
  multiAiWifiPackets,
  buildWifiStatusReport,
  buildWifiNodesReport,
  buildWifiPacketCreateReport,
  buildWifiPacketSendReport,
  buildWifiPacketInboxReport,
  buildWifiPacketInspectReport,
  buildWifiPacketConsumeReport,
  buildWifiPacketWorkflowReport,
  renderWifiPacketsReport,
  defaultPacketState,
  readPacketState,
  writePacketState,
  ensurePacketState
};

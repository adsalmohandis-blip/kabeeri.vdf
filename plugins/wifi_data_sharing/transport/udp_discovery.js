const dgram = require("dgram");
const os = require("os");

const DEFAULT_DISCOVERY_PORT = 47632;
const PROTOCOL = "kvdf-wifi-data-sharing";
const PROTOCOL_VERSION = "v1";
const DEFAULT_SERVICE_NAME = "wifi_data_sharing";

function buildDiscoveryMessage({ state, message_type, capabilities = ["discovery"], sent_at, transfer_enabled = false, pairing_required = true, service_name = DEFAULT_SERVICE_NAME, port = DEFAULT_DISCOVERY_PORT } = {}) {
  const local = state && state.local_node ? state.local_node : {};
  return {
    protocol: PROTOCOL,
    protocol_version: PROTOCOL_VERSION,
    message_type: message_type || "announce",
    service_name,
    node_id: local.node_id || null,
    display_name: local.display_name || os.hostname(),
    hostname: local.hostname || os.hostname(),
    platform: local.platform || process.platform,
    kvdf_version: local.kvdf_version || null,
    trust_role: local.trust_role || "unknown",
    plugin_version: "0.1.0",
    capabilities,
    pairing_required,
    transfer_enabled,
    port,
    sent_at: sent_at || new Date().toISOString()
  };
}

function buildQueryMessage(options = {}) {
  return buildDiscoveryMessage({
    ...options,
    message_type: "query",
    capabilities: ["discovery"],
    transfer_enabled: false,
    pairing_required: true
  });
}

function buildAnnounceMessage(options = {}) {
  return buildDiscoveryMessage({
    ...options,
    message_type: "announce",
    capabilities: ["discovery"],
    transfer_enabled: false,
    pairing_required: true
  });
}

function buildResponseMessage(options = {}) {
  return buildDiscoveryMessage({
    ...options,
    message_type: "response",
    capabilities: ["discovery"],
    transfer_enabled: false,
    pairing_required: true
  });
}

function serializeDiscoveryMessage(message) {
  return Buffer.from(`${JSON.stringify(message)}\n`, "utf8");
}

function parseDiscoveryMessage(input) {
  try {
    const raw = Buffer.isBuffer(input) ? input.toString("utf8") : String(input || "");
    const text = raw.trim();
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (!parsed || parsed.protocol !== PROTOCOL || parsed.protocol_version !== PROTOCOL_VERSION) return null;
    if (!["announce", "query", "response"].includes(parsed.message_type)) return null;
    if (parsed.service_name !== DEFAULT_SERVICE_NAME) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function normalizeCandidate(message, remote, now = new Date().toISOString()) {
  return {
    node_id: message.node_id,
    display_name: message.display_name || null,
    hostname: message.hostname || null,
    address: remote.address || null,
    port: Number(remote.port || message.port || DEFAULT_DISCOVERY_PORT),
    platform: message.platform || null,
    trust_role: message.trust_role || "unknown",
    first_seen_at: now,
    last_seen_at: now,
    trust_status: "candidate",
    pairing_required: Boolean(message.pairing_required),
    transfer_enabled: Boolean(message.transfer_enabled),
    kvdf_version: message.kvdf_version || null,
    plugin_version: message.plugin_version || "0.1.0",
    capabilities: Array.isArray(message.capabilities) ? message.capabilities.slice() : ["discovery"]
  };
}

function createSocket({ loopback = false, port = DEFAULT_DISCOVERY_PORT } = {}) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  socket.on("error", () => {});
  socket.bind(Number(port) || DEFAULT_DISCOVERY_PORT);
  return { socket, loopback };
}

function sendMessage(socket, message, { loopback = false, port = DEFAULT_DISCOVERY_PORT, targetHost = null, targetPort = null } = {}) {
  const payload = serializeDiscoveryMessage(message);
  const targets = resolveDiscoveryTargets({ loopback, port, targetHost, targetPort });
  return new Promise((resolve, reject) => {
    try {
      socket.setBroadcast(!loopback);
      if (!targets.length) {
        resolve();
        return;
      }
      let pending = targets.length;
      let done = false;
      const finish = (error) => {
        if (done) return;
        if (error) {
          done = true;
          reject(error);
          return;
        }
        pending -= 1;
        if (pending <= 0) {
          done = true;
          resolve();
        }
      };
      for (const target of targets) {
        socket.send(payload, 0, payload.length, target.port, target.host, (error) => finish(error));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function resolveDiscoveryTargets({ loopback = false, port = DEFAULT_DISCOVERY_PORT, targetHost = null, targetPort = null } = {}) {
  if (targetHost) {
    return [{
      host: targetHost,
      port: Number(targetPort || port || DEFAULT_DISCOVERY_PORT)
    }];
  }
  if (loopback) {
    return [{
      host: "127.0.0.1",
      port: Number(port || DEFAULT_DISCOVERY_PORT)
    }];
  }
  const broadcasts = new Set();
  const probes = new Set();
  for (const interfaces of Object.values(os.networkInterfaces() || {})) {
    for (const item of Array.isArray(interfaces) ? interfaces : []) {
      if (!item || item.internal) continue;
      if (String(item.family || "").toLowerCase() !== "ipv4" && item.family !== 4) continue;
      const computedBroadcast = computeIpv4BroadcastAddress(item.address, item.netmask);
      if (item.broadcast) broadcasts.add(String(item.broadcast));
      if (computedBroadcast) broadcasts.add(computedBroadcast);
      for (const target of computeIpv4SubnetProbeAddresses(item.address, item.netmask)) {
        probes.add(target);
      }
    }
  }
  if (!broadcasts.size) {
    broadcasts.add("255.255.255.255");
  }
  const targets = [
    ...Array.from(broadcasts),
    ...Array.from(probes)
  ];
  return targets.map((host) => ({
    host,
    port: Number(port || DEFAULT_DISCOVERY_PORT)
  }));
}

function computeIpv4BroadcastAddress(address, netmask) {
  const ipParts = parseIpv4Address(address);
  const maskParts = parseIpv4Address(netmask);
  if (!ipParts || !maskParts) return null;
  const broadcastParts = ipParts.map((part, index) => ((part & maskParts[index]) | (~maskParts[index] & 255)) & 255);
  return broadcastParts.join(".");
}

function parseIpv4Address(value) {
  const parts = String(value || "")
    .trim()
    .split(".")
    .map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return parts;
}

function ipv4PartsToNumber(parts) {
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

function ipv4NumberToParts(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ];
}

function computeIpv4SubnetProbeAddresses(address, netmask) {
  const ipParts = parseIpv4Address(address);
  const maskParts = parseIpv4Address(netmask);
  if (!ipParts || !maskParts) return [];
  const ipNumber = ipv4PartsToNumber(ipParts);
  const maskNumber = ipv4PartsToNumber(maskParts);
  const hostMask = (~maskNumber) >>> 0;
  if (!hostMask) return [];
  const hostBits = Math.round(Math.log2(hostMask + 1));
  if (!Number.isFinite(hostBits) || hostBits <= 0 || hostBits > 8) return [];
  const networkNumber = ipNumber & maskNumber;
  const broadcastNumber = (networkNumber | hostMask) >>> 0;
  const targets = [];
  const maxHosts = Math.min(254, Math.max(0, (1 << hostBits) - 2));
  for (let offset = 1; offset <= maxHosts; offset += 1) {
    const candidate = (networkNumber + offset) >>> 0;
    if (candidate === ipNumber || candidate === broadcastNumber) continue;
    targets.push(ipv4NumberToParts(candidate).join("."));
  }
  return targets;
}

function closeSocket(socket) {
  return new Promise((resolve) => {
    try {
      socket.close(() => resolve());
    } catch (error) {
      resolve();
    }
  });
}

function listenForCandidates(socket, { state, timeoutMs, loopback = false, onCandidate } = {}) {
  const candidates = [];
  const start = Date.now();
  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      socket.removeAllListeners("message");
      await closeSocket(socket);
      resolve({ candidates, elapsed_ms: Date.now() - start, loopback, warnings: [] });
    }, Math.max(1, Number(timeoutMs) || 5000));

    socket.on("message", (buffer, remote) => {
      const parsed = parseDiscoveryMessage(buffer);
      if (!parsed) return;
      if (state && state.local_node && parsed.node_id && parsed.node_id === state.local_node.node_id) return;
      if (parsed.message_type === "query") return;
      const candidate = normalizeCandidate(parsed, remote);
      const index = candidates.findIndex((item) => item.node_id === candidate.node_id);
      if (index >= 0) {
        candidates[index] = {
          ...candidates[index],
          ...candidate,
          first_seen_at: candidates[index].first_seen_at || candidate.first_seen_at
        };
      } else {
        candidates.push(candidate);
      }
      if (typeof onCandidate === "function") onCandidate(candidate, parsed, remote);
    });
    socket.on("error", async () => {
      clearTimeout(timer);
      socket.removeAllListeners("message");
      await closeSocket(socket);
      resolve({ candidates, elapsed_ms: Date.now() - start, loopback, warnings: ["UDP discovery was blocked or unavailable."] });
    });
  });
}

async function discoverCandidates({ state, timeoutMs = 5000, loopback = false, port = DEFAULT_DISCOVERY_PORT, onCandidate } = {}) {
  const { socket } = createSocket({ loopback, port });
  const query = buildQueryMessage({ state, port });
  const listenPromise = listenForCandidates(socket, { state, timeoutMs, loopback, onCandidate });
  await sendMessage(socket, query, { loopback, port }).catch(() => {});
  return listenPromise;
}

async function advertisePresence({ state, durationMs = 10000, loopback = false, port = DEFAULT_DISCOVERY_PORT, intervalMs = 1000, onCandidate } = {}) {
  const { socket } = createSocket({ loopback, port });
  const announce = buildAnnounceMessage({ state, port });
  const startedAt = Date.now();
  const candidates = [];
  const warnings = [];
  let closed = false;

  const finish = async () => {
    if (closed) return;
    closed = true;
    await closeSocket(socket);
  };

  socket.on("message", (buffer, remote) => {
    const parsed = parseDiscoveryMessage(buffer);
    if (!parsed || parsed.message_type !== "query") return;
    if (state && state.local_node && parsed.node_id && parsed.node_id === state.local_node.node_id) return;
    const response = buildResponseMessage({ state, port });
    sendMessage(socket, response, { loopback, port, targetHost: remote.address, targetPort: remote.port }).catch(() => {});
    const candidate = normalizeCandidate(parsed, remote);
    const index = candidates.findIndex((item) => item.node_id === candidate.node_id);
    if (index >= 0) {
      candidates[index] = {
        ...candidates[index],
        ...candidate,
        first_seen_at: candidates[index].first_seen_at || candidate.first_seen_at
      };
    } else {
      candidates.push(candidate);
    }
    if (typeof onCandidate === "function") onCandidate(candidate, parsed, remote);
  });

  socket.on("error", () => {
    warnings.push("UDP advertisement was blocked or unavailable.");
  });

  const timer = setInterval(() => {
    sendMessage(socket, announce, { loopback, port }).catch(() => {});
  }, Math.max(250, Number(intervalMs) || 1000));

  await sendMessage(socket, announce, { loopback, port }).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, Math.max(1, Number(durationMs) || 10000)));
  clearInterval(timer);
  await finish();
  return {
    candidates,
    warnings,
    elapsed_ms: Date.now() - startedAt,
    loopback,
    advertised: true
  };
}

module.exports = {
  DEFAULT_DISCOVERY_PORT,
  PROTOCOL,
  PROTOCOL_VERSION,
  DEFAULT_SERVICE_NAME,
  buildDiscoveryMessage,
  buildQueryMessage,
  buildAnnounceMessage,
  buildResponseMessage,
  serializeDiscoveryMessage,
  parseDiscoveryMessage,
  normalizeCandidate,
  computeIpv4BroadcastAddress,
  computeIpv4SubnetProbeAddresses,
  resolveDiscoveryTargets,
  discoverCandidates,
  advertisePresence
};

const crypto = require("crypto");
const net = require("net");

const DEFAULT_CHUNK_SIZE_BYTES = 64 * 1024;
const DEFAULT_CHUNK_THRESHOLD_BYTES = 256 * 1024;

function buildChunkManifest(packageRecord, options = {}) {
  const payloadBuffer = getPackageBuffer(packageRecord);
  const chunkSizeBytes = Math.max(1, Number(options.chunk_size_bytes || options.chunkSizeBytes || DEFAULT_CHUNK_SIZE_BYTES));
  const thresholdBytes = Math.max(1, Number(options.chunk_threshold_bytes || options.chunkThresholdBytes || DEFAULT_CHUNK_THRESHOLD_BYTES));
  const transferMode = payloadBuffer.length > thresholdBytes ? "chunked" : "single_frame";
  const chunks = [];
  for (let offset = 0, index = 0; offset < payloadBuffer.length; offset += chunkSizeBytes, index += 1) {
    const slice = payloadBuffer.slice(offset, Math.min(offset + chunkSizeBytes, payloadBuffer.length));
    chunks.push({
      index,
      size: slice.length,
      sha256: crypto.createHash("sha256").update(slice).digest("hex")
    });
  }
  return {
    package_id: packageRecord && packageRecord.package_id ? packageRecord.package_id : null,
    transfer_mode: transferMode,
    chunk_size_bytes: chunkSizeBytes,
    threshold_bytes: thresholdBytes,
    total_bytes: payloadBuffer.length,
    total_chunks: chunks.length,
    chunks,
    chunk_indexes: chunks.map((chunk) => chunk.index),
    sha256: crypto.createHash("sha256").update(payloadBuffer).digest("hex")
  };
}

function validateChunkHash(packageRecord, chunkIndex, chunkSizeBytes = DEFAULT_CHUNK_SIZE_BYTES) {
  const payloadBuffer = getPackageBuffer(packageRecord);
  const index = Number(chunkIndex);
  if (!Number.isFinite(index) || index < 0) return false;
  const offset = index * Number(chunkSizeBytes || DEFAULT_CHUNK_SIZE_BYTES);
  if (offset >= payloadBuffer.length) return false;
  const slice = payloadBuffer.slice(offset, Math.min(offset + Number(chunkSizeBytes || DEFAULT_CHUNK_SIZE_BYTES), payloadBuffer.length));
  return crypto.createHash("sha256").update(slice).digest("hex") === getChunkHash(packageRecord, index, chunkSizeBytes);
}

function getChunkHash(packageRecord, chunkIndex, chunkSizeBytes = DEFAULT_CHUNK_SIZE_BYTES) {
  const manifest = buildChunkManifest(packageRecord, { chunkSizeBytes });
  const chunk = manifest.chunks.find((item) => item.index === Number(chunkIndex));
  return chunk ? chunk.sha256 : null;
}

function getMissingChunkIndexes(session, manifest) {
  const completed = new Set(Array.isArray(session && session.completed_chunks) ? session.completed_chunks.map((item) => Number(item)).filter(Number.isFinite) : []);
  const total = Number((manifest && manifest.total_chunks) || (session && session.total_chunks) || 0);
  const missing = [];
  for (let index = 0; index < total; index += 1) {
    if (!completed.has(index)) missing.push(index);
  }
  return missing;
}

function buildResumePlan(session, manifest) {
  const missingIndexes = getMissingChunkIndexes(session, manifest);
  const chunks = Array.isArray(manifest && manifest.chunks)
    ? manifest.chunks.filter((chunk) => missingIndexes.includes(chunk.index))
    : [];
  return {
    session_id: session && session.session_id ? session.session_id : null,
    package_id: session && session.package_id ? session.package_id : manifest && manifest.package_id ? manifest.package_id : null,
    transfer_mode: manifest && manifest.transfer_mode ? manifest.transfer_mode : "chunked",
    missing_chunk_indexes: missingIndexes,
    missing_chunks: chunks,
    is_complete: missingIndexes.length === 0
  };
}

function createChunkedTransferSession(packageRecord, targetNodeId, options = {}) {
  const manifest = buildChunkManifest(packageRecord, options);
  const now = new Date().toISOString();
  const chunkIndexes = manifest.chunk_indexes.slice();
  const completedChunks = Array.isArray(options.completed_chunks) ? options.completed_chunks.slice() : chunkIndexes.slice();
  const status = completedChunks.length >= chunkIndexes.length ? "sent" : completedChunks.length > 0 ? "partially_sent" : "queued";
  return {
    session_id: options.session_id || null,
    package_id: packageRecord && packageRecord.package_id ? packageRecord.package_id : null,
    source_node_id: options.source_node_id || null,
    target_node_id: targetNodeId || null,
    status,
    chunk_size_bytes: manifest.chunk_size_bytes,
    total_chunks: manifest.total_chunks,
    completed_chunks: completedChunks,
    sha256: manifest.sha256,
    started_at: options.started_at || now,
    updated_at: now,
    completed_at: status === "sent" ? now : null,
    retry_count: Number(options.retry_count || 0),
    last_error: options.last_error || null,
    chunk_manifest: manifest
  };
}

function packageRequiresChunking(packageRecord, options = {}) {
  const manifest = buildChunkManifest(packageRecord, options);
  return manifest.transfer_mode === "chunked";
}

function getPackageBuffer(packageRecord) {
  if (!packageRecord) return Buffer.alloc(0);
  if (Buffer.isBuffer(packageRecord.payload)) return packageRecord.payload;
  const encoding = String(packageRecord.payload_encoding || "utf8").toLowerCase();
  if (encoding === "base64") return Buffer.from(String(packageRecord.payload || ""), "base64");
  if (encoding === "json") return Buffer.from(JSON.stringify(packageRecord.payload));
  if (encoding === "text") return Buffer.from(String(packageRecord.payload || ""), "utf8");
  if (typeof packageRecord.payload === "string") return Buffer.from(packageRecord.payload, "utf8");
  try {
    return Buffer.from(JSON.stringify(packageRecord.payload || {}));
  } catch (error) {
    return Buffer.from(String(packageRecord.payload || ""), "utf8");
  }
}

function normalizeTransferEndpoint(targetNode) {
  if (!targetNode) return null;
  const address = String(targetNode.address || targetNode.hostname || "").trim();
  const port = Number(targetNode.port || targetNode.transfer_port || 47633);
  if (!address) return null;
  if (net.isIP(address) === 0 && address !== "localhost") return null;
  return {
    host: address === "localhost" ? "127.0.0.1" : address,
    port
  };
}

module.exports = {
  DEFAULT_CHUNK_SIZE_BYTES,
  DEFAULT_CHUNK_THRESHOLD_BYTES,
  buildChunkManifest,
  validateChunkHash,
  getChunkHash,
  getMissingChunkIndexes,
  buildResumePlan,
  createChunkedTransferSession,
  packageRequiresChunking,
  getPackageBuffer,
  normalizeTransferEndpoint
};

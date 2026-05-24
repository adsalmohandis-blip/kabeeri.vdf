const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const state = require("../commands/state");
const transfer = require("../commands/transfer");
const outbox = require("../commands/outbox");
const retry = require("../commands/retry");
const chunked = require("../transport/chunked_transfer");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

function withTempRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kvdf-wifi-resumable-"));
  const previousRoot = process.env.KVDF_REPO_ROOT;
  process.env.KVDF_REPO_ROOT = dir;
  try {
    return fn(dir);
  } finally {
    if (previousRoot === undefined) delete process.env.KVDF_REPO_ROOT;
    else process.env.KVDF_REPO_ROOT = previousRoot;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function seedState() {
  const current = state.initWifiDataSharingState({ name: "Owner Laptop", role: "owner" });
  state.writeWifiDataSharingState({
    ...current,
    trusted_nodes: [
      {
        node_id: "wifi-node-target-001",
        display_name: "Trusted Target",
        hostname: "REMOTE",
        address: "127.0.0.1",
        platform: "linux",
        trust_status: "trusted",
        trusted_at: new Date().toISOString(),
        revoked_at: null,
        revocation_reason: null,
        capabilities: ["discovery"],
        transfer_allowed: false
      }
    ]
  });
  return state.readWifiDataSharingState();
}

function writeLargePayload(dir, name, sizeBytes) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, Buffer.alloc(sizeBytes, "a"));
  return file;
}

test("chunk manifest generation works", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  assert.strictEqual(created.status, "ok");
  const manifest = chunked.buildChunkManifest(created.package);
  assert.strictEqual(manifest.transfer_mode, "chunked");
  assert.ok(manifest.total_chunks > 1);
  assert.strictEqual(chunked.packageRequiresChunking(created.package), true);
}));

test("chunk hash validates", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  const manifest = chunked.buildChunkManifest(created.package);
  assert.ok(manifest.chunks.length > 1);
  for (const chunk of manifest.chunks) {
    assert.strictEqual(chunked.validateChunkHash(created.package, chunk.index, manifest.chunk_size_bytes), true);
  }
}));

test("missing chunks are detected", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  const manifest = chunked.buildChunkManifest(created.package);
  const session = chunked.createChunkedTransferSession(created.package, "wifi-node-target-001", {
    session_id: "wifi-transfer-session-001",
    source_node_id: state.readWifiDataSharingState().local_node.node_id,
    completed_chunks: [0, 2]
  });
  const plan = chunked.buildResumePlan(session, manifest);
  assert.ok(plan.missing_chunk_indexes.length > 0);
  assert.ok(plan.missing_chunk_indexes.includes(1));
  assert.ok(plan.missing_chunks.every((chunk) => plan.missing_chunk_indexes.includes(chunk.index)));
}));

test("resume plan includes only missing chunks", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  const manifest = chunked.buildChunkManifest(created.package);
  const completed = [0, 1];
  const session = chunked.createChunkedTransferSession(created.package, "wifi-node-target-001", {
    session_id: "wifi-transfer-session-002",
    source_node_id: state.readWifiDataSharingState().local_node.node_id,
    completed_chunks: completed
  });
  const plan = chunked.buildResumePlan(session, manifest);
  assert.ok(plan.missing_chunk_indexes.every((index) => !completed.includes(index)));
  assert.strictEqual(plan.missing_chunks.length, plan.missing_chunk_indexes.length);
}));

test("sendPackage creates outbox and transfer session records", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  const sent = transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-target-001", confirm: true });
  assert.strictEqual(sent.status, "ok");
  const outboxState = state.readWifiDataOutboxState();
  assert.ok(outboxState.outbox.some((item) => item.package_id === created.package.package_id));
  const sessionsState = state.readWifiTransferSessionsState();
  assert.ok(sessionsState.transfer_sessions.some((item) => item.package_id === created.package.package_id));
}));

test("retry requires --confirm", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-target-001", confirm: true });
  const outboxState = state.readWifiDataOutboxState();
  state.writeWifiDataOutboxState({
    ...outboxState,
    outbox: outboxState.outbox.map((item) => item.package_id === created.package.package_id
      ? { ...item, status: "failed", last_error: "simulated failure" }
      : item)
  });
  const report = outbox.wifiDataOutbox("outbox", "retry", { confirm: false }, [created.package.package_id]);
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /confirm/i);
}));

test("cancel requires reason", () => withTempRepo((dir) => {
  seedState();
  const input = writeLargePayload(dir, "large.bin", 300 * 1024);
  const created = transfer.createPackage({ packageType: "file_blob", inputPath: input, title: "Large Blob" });
  transfer.sendPackage({ packageId: created.package.package_id, targetNodeId: "wifi-node-target-001", confirm: true });
  const report = outbox.cancelOutboxPackage({ packageId: created.package.package_id, reason: null });
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /reason/i);
}));

test("clean requires --confirm", () => withTempRepo(() => {
  seedState();
  const current = state.readWifiTransferSessionsState();
  state.writeWifiTransferSessionsState({
    ...current,
    transfer_sessions: [
      {
        session_id: "wifi-transfer-session-001",
        package_id: "wifi-pkg-001",
        source_node_id: "wifi-node-source-001",
        target_node_id: "wifi-node-target-001",
        status: "sent",
        chunk_size_bytes: 65536,
        total_chunks: 4,
        completed_chunks: [0, 1, 2, 3],
        sha256: "deadbeef",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        retry_count: 0,
        last_error: null
      }
    ]
  });
  const report = retry.cleanTransferSessions({ confirm: false });
  assert.strictEqual(report.status, "blocked");
  assert.match(report.next_action, /confirm/i);
}));

test("no dependency added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});

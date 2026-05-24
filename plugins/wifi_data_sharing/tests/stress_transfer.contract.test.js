const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { buildTransferStressReport } = require("../commands/simulate");
const { buildChunkManifest, buildResumePlan, createChunkedTransferSession, getMissingChunkIndexes, validateChunkHash } = require("../transport/chunked_transfer");

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

test("stress simulations build chunk manifests across supported sizes", () => {
  const sizes = [1024, 64 * 1024, 256 * 1024, 1024 * 1024];
  for (const size of sizes) {
    const report = buildTransferStressReport({ sizeBytes: size, keep: false });
    assert.strictEqual(report.report_type, "wifi_data_sharing_transfer_stress");
    assert.ok(["pass", "warn"].includes(report.status));
    assert.strictEqual(report.size_bytes, size);
    assert.ok(report.package && report.package.sha256);
    assert.ok(report.manifest && typeof report.manifest.total_chunks === "number");
    assert.ok(Array.isArray(report.resume_plan.missing_chunk_indexes));
    const rebuiltManifest = buildChunkManifest(report.package);
    assert.strictEqual(rebuiltManifest.total_chunks, report.manifest.total_chunks);
  }
});

test("chunk hash validates and resume plans cover only missing chunks", () => {
  const report = buildTransferStressReport({ sizeBytes: 1024 * 1024, keep: false });
  assert.ok(report.manifest.total_chunks > 1);
  assert.strictEqual(report.manifest.transfer_mode, "chunked");
  assert.strictEqual(validateChunkHash(report.package, 0, report.manifest.chunk_size_bytes), true);
  const missingIndexes = getMissingChunkIndexes(report.session, report.manifest);
  assert.deepStrictEqual(report.resume_plan.missing_chunk_indexes, missingIndexes);
  const resumePlan = buildResumePlan(report.session, report.manifest);
  assert.deepStrictEqual(resumePlan.missing_chunk_indexes, missingIndexes);
  assert.ok(missingIndexes.length > 0);
});

test("resume session can be rebuilt from manifest and session data", () => {
  const report = buildTransferStressReport({ sizeBytes: 256 * 1024, keep: false });
  const rebuiltManifest = buildChunkManifest(report.package);
  const rebuiltSession = createChunkedTransferSession(report.package, "wifi-node-target", {
    source_node_id: report.session.source_node_id,
    completed_chunks: report.session.completed_chunks
  });
  const resumePlan = buildResumePlan(rebuiltSession, rebuiltManifest);
  assert.ok(Array.isArray(resumePlan.missing_chunk_indexes));
  assert.strictEqual(rebuiltSession.package_id, report.package.package_id);
});

test("wifi data sharing package dependency is not added", () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "..", "package.json"), "utf8"));
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.dependencies || {}, "wifi_data_sharing"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(pkg.devDependencies || {}, "wifi_data_sharing"), false);
});

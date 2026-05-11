const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function acceptance(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit } = deps;
  ensureWorkspace();
  const file = ".kabeeri/acceptance.json";
  const data = readJsonFile(file);
  data.records = data.records || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Subject", "Status"], data.records.map((item) => [item.id, item.task_id || item.version || item.subject_id || "", item.status || "draft"])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer", "Business Analyst"], "create acceptance");
    const taskId = flags.task || value;
    const type = flags.type || (flags.version ? "release" : "task");
    const issueId = flags.issue || null;
    if (!taskId && !issueId && type !== "release") throw new Error("Missing task id.");
    if (type === "release" && !flags.version) throw new Error("Missing --version for release acceptance.");
    const id = `acceptance-${String(data.records.length + 1).padStart(3, "0")}`;
    data.records.push({
      id,
      type,
      task_id: taskId || null,
      issue_id: issueId,
      version: flags.version || null,
      subject_id: taskId || issueId || flags.version || null,
      status: "draft",
      criteria: flags.criteria ? [flags.criteria] : [],
      created_at: new Date().toISOString()
    });
    writeJsonFile(file, data);
    appendAudit("acceptance.created", "acceptance", id, `Acceptance created for ${taskId || issueId || flags.version}`);
    console.log(`Created acceptance record ${id}`);
    return;
  }

  if (action === "review") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "review acceptance");
    const id = flags.id || value;
    if (!id) throw new Error("Missing acceptance id.");
    const record = data.records.find((item) => item.id === id || item.task_id === id);
    if (!record) throw new Error(`Acceptance record not found: ${id}`);
    record.status = flags.status || (flags.reject ? "rejected" : "reviewed");
    record.result = flags.result || (flags.reject ? "fail" : "pass");
    record.reviewer_id = flags.reviewer || flags.actor || "local-cli";
    record.review_notes = flags.notes || flags.reason || "";
    record.reviewed_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("acceptance.reviewed", "acceptance", record.id, `Acceptance reviewed for ${record.task_id || record.version || record.id}`);
    console.log(`Reviewed acceptance record ${record.id}: ${record.result}`);
    return;
  }

  throw new Error(`Unknown acceptance action: ${action}`);
}

module.exports = {
  acceptance
};

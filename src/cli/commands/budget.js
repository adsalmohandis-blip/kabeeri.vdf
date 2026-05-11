const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists } = require("../fs_utils");
const { table } = require("../ui");

function budget(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  const requireAnyRole = deps.requireAnyRole || (() => {});
  const appendAudit = deps.appendAudit || (() => {});
  const getEffectiveActor = deps.getEffectiveActor || (() => null);
  const getOwnerActor = deps.getOwnerActor || (() => "owner");
  const file = ".kabeeri/ai_usage/budget_approvals.json";
  if (!fileExists(file)) writeJsonFile(file, { approvals: [] });
  const data = readJsonFile(file);
  data.approvals = data.approvals || [];

  if (!action || action === "list") {
    console.log(table(["Approval", "Task", "Status", "Tokens", "Cost", "Expires"], data.approvals.map((item) => [
      item.approval_id,
      item.task_id,
      item.status,
      item.extra_tokens || "",
      item.extra_cost || "",
      item.expires_at || ""
    ])));
    return;
  }

  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve budget overrun");
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const approval = {
      approval_id: `budget-approval-${String(data.approvals.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      status: "active",
      extra_tokens: flags.tokens ? Number(flags.tokens) : null,
      extra_cost: flags.cost ? Number(flags.cost) : null,
      reason: flags.reason || "",
      approved_by: getEffectiveActor(flags) || getOwnerActor(flags),
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null
    };
    data.approvals.push(approval);
    writeJsonFile(file, data);
    appendAudit("budget.approved", "task", taskId, `Budget overrun approved: ${approval.approval_id}`);
    console.log(`Approved budget overrun ${approval.approval_id}`);
    return;
  }

  if (action === "revoke") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "revoke budget approval");
    const id = flags.id || value;
    if (!id) throw new Error("Missing approval id.");
    const approval = data.approvals.find((item) => item.approval_id === id);
    if (!approval) throw new Error(`Budget approval not found: ${id}`);
    approval.status = "revoked";
    approval.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("budget.revoked", "task", approval.task_id, `Budget approval revoked: ${id}`);
    console.log(`Revoked budget approval ${id}`);
    return;
  }

  throw new Error(`Unknown budget action: ${action}`);
}

module.exports = {
  budget
};

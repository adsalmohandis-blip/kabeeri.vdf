const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");
const { parseCsv } = require("../services/collections");

function acceptance(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit } = deps;
  ensureWorkspace();
  const file = ".kabeeri/acceptance.json";
  const data = readJsonFile(file);
  data.records = data.records || [];
  data.checklists = data.checklists || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Subject", "Status"], data.records.map((item) => [item.id, item.task_id || item.version || item.subject_id || "", item.status || "draft"])));
    return;
  }

  if (action === "create-checklist") {
    if (requireAnyRole) requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer", "Business Analyst"], "create checklist");
    const taskId = flags.task;
    if (!taskId) throw new Error("Missing --task.");
    
    if (data.checklists.some(c => c.task_id === taskId)) {
      throw new Error("Checklist already exists for this task.");
    }

    data.checklists.push({
      task_id: taskId,
      items: [
        { question: "هل الناتج يطابق المطلوب؟", checked: false },
        { question: "هل أضاف AI أشياء غير مطلوبة؟", checked: false },
        { question: "هل يمكن لمبتدئ فهم الناتج؟ (Understandable by a beginner)", checked: false },
        { question: "هل توجد خطوات اختبار؟ (Test steps provided)", checked: false },
        { question: "هل توجد صلاحيات واضحة؟", checked: false },
        { question: "هل لا توجد أسرار أو بيانات حساسة؟ (No secrets/sensitive data)", checked: false },
        { question: "هل هناك قسم للنواقص أو الافتراضات؟", checked: false }
      ]
    });
    writeJsonFile(file, data);
    console.log(`Created acceptance checklist for task: ${taskId}`);
    return;
  }

  if (action === "show-checklist") {
    const taskId = value;
    if (!taskId) throw new Error("Missing task id.");
    const checklist = data.checklists.find(c => c.task_id === taskId);
    if (!checklist) throw new Error(`No checklist found for task ${taskId}`);
    
    if (flags.json) {
      console.log(JSON.stringify(checklist, null, 2));
    } else {
      checklist.items.forEach(item => console.log(`[${item.checked ? 'x' : ' '}] ${item.question}`));
    }
    return;
  }

  if (action === "check-item" || action === "uncheck-item") {
    if (requireAnyRole) requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "modify checklist");
    const taskId = flags.task;
    if (!taskId) throw new Error("Missing --task.");
    const index = parseInt(flags.index, 10);
    if (isNaN(index)) throw new Error("Missing or invalid --index.");
    
    const checklist = data.checklists.find(c => c.task_id === taskId);
    if (!checklist) throw new Error(`No checklist found for task ${taskId}`);
    
    if (index < 0 || index >= checklist.items.length) throw new Error("Item index out of range.");
    
    checklist.items[index].checked = (action === "check-item");
    writeJsonFile(file, data);
    console.log(`Item ${index} marked as ${checklist.items[index].checked ? 'checked' : 'unchecked'} for task ${taskId}`);
    return;
  }

  if (action === "verify-checklist") {
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing task id.");
    const checklist = data.checklists.find(c => c.task_id === taskId);
    if (!checklist || checklist.items.some(item => !item.checked)) {
      throw new Error(`Checklist incomplete for task ${taskId}. Please complete all checklist items first.`);
    }
    console.log(`Checklist verified complete for task ${taskId}.`);
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer", "Business Analyst"], "create acceptance");
    const taskId = flags.task || value;
    const type = flags.type || (flags.version ? "release" : "task");
    const issueId = flags.issue || null;
    if (!taskId && !issueId && type !== "release") throw new Error("Missing task id.");
    if (type === "release" && !flags.version) throw new Error("Missing --version for release acceptance.");
    const task = taskId ? (readJsonFile(".kabeeri/tasks.json").tasks || []).find((item) => item.id === taskId) : null;
    const criteria = parseCsv(flags.criteria || flags.acceptance || (task && task.acceptance_criteria) || []);
    const evidence = parseCsv(flags.evidence || flags.review_evidence || []);
    const id = `acceptance-${String(data.records.length + 1).padStart(3, "0")}`;
    data.records.push({
      id,
      type,
      task_id: taskId || null,
      issue_id: issueId,
      version: flags.version || null,
      subject_id: taskId || issueId || flags.version || null,
      status: "draft",
      criteria,
      evidence,
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
    const evidence = parseCsv(flags.evidence || flags.review_evidence || []);
    record.status = flags.status || (flags.reject ? "rejected" : "reviewed");
    record.result = flags.result || (flags.reject ? "fail" : "pass");
    record.reviewer_id = flags.reviewer || flags.actor || "local-cli";
    record.review_notes = flags.notes || flags.reason || "";
    if (evidence.length) record.evidence = evidence;
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

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function sprint(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, appendAudit, buildSprintSummary } = deps;
  ensureWorkspace();
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Status", "Start", "End"], data.sprints.map((item) => [
      item.id,
      item.name,
      item.status,
      item.start_date || "",
      item.end_date || ""
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create sprint");
    const id = flags.id || value || `sprint-${String(data.sprints.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      name: flags.name || id,
      status: flags.status || "planned",
      start_date: flags.start || null,
      end_date: flags.end || null,
      goal: flags.goal || "",
      created_at: new Date().toISOString()
    };
    data.sprints.push(item);
    writeJsonFile(file, data);
    appendAudit("sprint.created", "sprint", id, `Sprint created: ${item.name}`);
    console.log(`Created sprint ${id}`);
    return;
  }

  if (action === "summary") {
    const sprintId = flags.id || value;
    if (!sprintId) throw new Error("Missing sprint id.");
    console.log(JSON.stringify(buildSprintSummary(sprintId), null, 2));
    return;
  }

  throw new Error(`Unknown sprint action: ${action}`);
}

module.exports = {
  sprint
};

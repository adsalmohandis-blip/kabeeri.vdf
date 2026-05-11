const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { table } = require("../ui");

function identity(kind, action, value, flags = {}, deps = {}) {
  const { requireAnyRole, parseCsv, validateKnownWorkstreams, appendAudit } = deps;
  ensureWorkspace();
  if (kind === "developers" && ["solo", "fullstack", "full-stack", "owner-developer"].includes(String(action || "").toLowerCase())) {
    return configureSoloDeveloper(action, value, flags, deps);
  }
  const file = `.kabeeri/${kind}.json`;
  const key = kind;
  const data = readJsonFile(file);
  data[key] = data[key] || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Role", "Status"], data[key].map((item) => [item.id, item.display_name, item.role, item.status])));
    return;
  }

  if (action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer"], `add ${kind.slice(0, -1)}`);
    const id = flags.id || `${kind === "developers" ? "dev" : "agent"}-${String(data[key].length + 1).padStart(3, "0")}`;
    if (!flags.name) throw new Error("Missing --name.");
    const role = flags.role || (kind === "agents" ? "AI Developer" : "Viewer");
    if (role === "Owner") ensureNoOtherOwner(id);
    const workstreams = parseCsv(flags.workstreams || flags.workstream);
    validateKnownWorkstreams(workstreams);
    const item = {
      id,
      type: kind === "agents" ? "ai_developer" : "human",
      display_name: flags.name,
      role,
      workstreams,
      status: "active",
      created_at: new Date().toISOString()
    };
    data[key].push(item);
    writeJsonFile(file, data);
    appendAudit(`${kind}.added`, kind.slice(0, -1), id, `${kind.slice(0, -1)} added: ${item.display_name}`);
    console.log(`Added ${kind.slice(0, -1)} ${id}`);
    return;
  }

  throw new Error(`Unknown ${kind.slice(0, -1)} action: ${action}`);
}

function configureSoloDeveloper(action, value, flags = {}, deps = {}) {
  const { requireAnyRole, parseCsv, validateKnownWorkstreams, appendAudit } = deps;
  requireAnyRole(flags, ["Owner", "Maintainer"], "configure solo developer mode");
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  const id = flags.id || value || "dev-main";
  const name = flags.name || "Main Developer";
  const role = String(action || "").toLowerCase() === "owner-developer" ? "Owner-Developer" : "Full-stack Developer";
  if (role === "Owner-Developer") ensureNoOtherOwner(id);
  const workstreams = parseCsv(flags.workstreams || "backend,public_frontend,admin_frontend,database,devops,qa,docs,integrations,security");
  validateKnownWorkstreams(workstreams);
  let item = data.developers.find((developer) => developer.id === id);
  if (!item) {
    item = {
      id,
      type: "human",
      display_name: name,
      role,
      workstreams,
      status: "active",
      solo_mode: true,
      created_at: new Date().toISOString()
    };
    data.developers.push(item);
  } else {
    item.display_name = flags.name || item.display_name || name;
    item.role = role;
    item.workstreams = workstreams;
    item.status = "active";
    item.solo_mode = true;
    item.updated_at = new Date().toISOString();
  }
  writeJsonFile(file, data);
  writeJsonFile(".kabeeri/developer_mode.json", {
    mode: "solo",
    solo_developer_id: id,
    role,
    workstreams,
    configured_at: new Date().toISOString()
  });
  appendAudit("developer.solo_configured", "developer", id, `Solo developer mode configured: ${id}`);
  console.log(`Configured solo developer mode for ${id}`);
}

function ensureNoOtherOwner(newId) {
  for (const file of [".kabeeri/developers.json", ".kabeeri/agents.json"]) {
    const data = readJsonFile(file);
    const entries = data.developers || data.agents || [];
    const owner = entries.find((item) => item.role === "Owner" && item.id !== newId && item.status === "active");
    if (owner) throw new Error(`Single Owner rule violation: ${owner.id} is already Owner.`);
  }
}

module.exports = {
  identity,
  configureSoloDeveloper,
  ensureNoOtherOwner
};

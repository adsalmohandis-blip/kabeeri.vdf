function compileTaskExecutorContract(options = {}, deps = {}) {
  const {
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    fileExists = () => false,
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    renderTaskControlPlanePacket = null
  } = deps;

  const packetPath = options.packetPath || "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json";
  const contractJsonPath = "docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json";
  const contractMdPath = "docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.md";
  const tasksFile = ".kabeeri/tasks.json";
  const packet = fileExists(packetPath) ? readJsonFile(packetPath) : null;
  const tasksState = fileExists(tasksFile) ? readJsonFile(tasksFile) : { tasks: [] };
  const tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const executionQueue = packet && Array.isArray(packet.execution_queue) ? packet.execution_queue : [];
  const currentTaskId = options.taskId || (executionQueue[0] ? executionQueue[0].id : null);
  const currentTask = tasks.find((item) => item.id === currentTaskId) || null;
  const allowedFiles = normalizeFiles(currentTask && currentTask.allowed_files);
  const packetHints = {
    packet_id: packet ? packet.packet_id || null : null,
    packet_state_path: packetPath,
    next_action: packet ? packet.next_action || null : null,
    next_command: packet ? packet.next_command || null : null,
    recommended_assignee_id: packet ? packet.recommended_assignee_id || null : null
  };
  const contract = {
    report_type: "task_executor_contract",
    generated_at: new Date().toISOString(),
    audience: "framework_owner",
    command_prefix: "kvdf task",
    surface_role: "executor",
    contract_id: `task-executor-contract-${Date.now()}`,
    packet_id: packetHints.packet_id,
    packet_state_path: packetHints.packet_state_path,
    current_task_id: currentTask ? currentTask.id : null,
    current_task_title: currentTask ? currentTask.title || null : null,
    executor_role: "implementation_worker",
    planner_role: "control_plane",
    assignment_rule: "The executor may only act on tasks supplied by the control plane packet or current task state.",
    allowed_files: allowedFiles,
    allowed_actions: [
      "read packet",
      "inspect allowed files",
      "edit allowed files",
      "record evidence",
      "return next action"
    ],
    forbidden_actions: [
      "change task priority",
      "invent new task scopes",
      "edit files outside the allowed list",
      "bypass tokens or locks",
      "replan the workflow"
    ],
    packet_hints: packetHints,
    execution_queue: executionQueue.slice(0, 12).map((item) => ({
      id: item.id || null,
      title: item.title || "",
      status: item.status || "",
      assignee_id: item.assignee_id || "",
      next_action: item.next_action || "",
      allowed_files: Array.isArray(item.allowed_files) ? item.allowed_files.slice() : [],
      acceptance_criteria_count: item.acceptance_criteria_count || 0
    })),
    contract_points: [
      "The AI executor is a worker that consumes a packet.",
      "The control plane owns planning, packet creation, and task ordering.",
      "The executor only acts inside approved task boundaries and allowed files.",
      "The executor returns evidence and the next action instead of inventing new scope."
    ],
    status: packet && packet.status === "ready" ? "ready" : "empty",
    message: packet && packet.status === "ready"
      ? `Executor contract compiled for packet ${packet.packet_id || "unknown"}.`
      : "No packet was found to bind to an executor contract."
  };

  writeJsonFile(contractJsonPath, contract);
  writeTextFile(contractMdPath, renderTaskExecutorContract(contract, renderTaskControlPlanePacket, packet));
  if (appendAudit) {
    appendAudit("task.executor_contract_compiled", "task", contract.contract_id, "Executor contract compiled from the control-plane packet", {
      contract_id: contract.contract_id,
      packet_id: contract.packet_id,
      current_task_id: contract.current_task_id
    });
  }
  if (refreshDashboardArtifacts) refreshDashboardArtifacts();
  return contract;
}

function renderTaskExecutorContract(contract, renderTaskControlPlanePacket = null, packet = null) {
  const lines = [
    "# Task Executor Contract",
    "",
    `Contract ID: ${contract.contract_id || "n/a"}`,
    `Generated at: ${contract.generated_at || "n/a"}`,
    `Surface role: ${contract.surface_role || "executor"}`,
    `Status: ${contract.status || "unknown"}`,
    `Message: ${contract.message || ""}`,
    `Packet ID: ${contract.packet_id || "none"}`,
    `Packet state path: ${contract.packet_state_path || "n/a"}`,
    `Current task: ${contract.current_task_id || "none"}`,
    `Executor role: ${contract.executor_role || "worker"}`,
    `Planner role: ${contract.planner_role || "control-plane"}`,
    "",
    "Allowed actions:",
    ...(Array.isArray(contract.allowed_actions) && contract.allowed_actions.length ? contract.allowed_actions.map((item) => `- ${item}`) : ["- None recorded."]),
    "",
    "Forbidden actions:",
    ...(Array.isArray(contract.forbidden_actions) && contract.forbidden_actions.length ? contract.forbidden_actions.map((item) => `- ${item}`) : ["- None recorded."]),
    "",
    "Packet hints:",
    `- Recommended assignee: ${contract.packet_hints && contract.packet_hints.recommended_assignee_id ? contract.packet_hints.recommended_assignee_id : "none"}`,
    `- Next action: ${contract.packet_hints && contract.packet_hints.next_action ? contract.packet_hints.next_action : "none"}`,
    `- Next command: ${contract.packet_hints && contract.packet_hints.next_command ? contract.packet_hints.next_command : "none"}`,
    "",
    "Allowed files:",
    ...(Array.isArray(contract.allowed_files) && contract.allowed_files.length ? contract.allowed_files.map((item) => `- ${item}`) : ["- None recorded."]),
    "",
    "Contract points:",
    ...(Array.isArray(contract.contract_points) && contract.contract_points.length ? contract.contract_points.map((item) => `- ${item}`) : ["- None recorded."])
  ];

  if (packet) {
    lines.push("", "Control-plane packet summary:");
    if (renderTaskControlPlanePacket) {
      const packetText = renderTaskControlPlanePacket(packet).trimEnd().split("\n");
      lines.push(...packetText.slice(0, 40).map((line) => `  ${line}`));
    } else {
      lines.push(`- Packet status: ${packet.status || "unknown"}`);
      lines.push(`- Packet message: ${packet.message || ""}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function normalizeFiles(files) {
  if (!Array.isArray(files)) return [];
  return files.map((item) => String(item || "").trim()).filter(Boolean);
}

module.exports = {
  compileTaskExecutorContract,
  renderTaskExecutorContract
};

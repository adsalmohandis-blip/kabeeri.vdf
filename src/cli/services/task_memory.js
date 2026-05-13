const { PROTECTED_FEATURE_DOCS_RULE, isProtectedFeatureDocsPath } = require("./manual_feature_docs");

function buildTaskMemory(task, options = {}) {
  const now = new Date().toISOString();
  const workstreams = uniqueStrings(
    normalizeList(options.workstreams || task.workstreams || task.workstream || [])
      .filter((item) => item && item !== "unassigned")
  );
  const appUsernames = uniqueStrings(
    normalizeList(options.app_usernames || task.app_usernames || task.app_username || [])
      .filter(Boolean)
  );
  const appPaths = uniqueStrings(normalizeList(options.app_paths || task.app_paths || []));
  const allowedFiles = uniqueStrings(normalizeList(options.allowed_files || task.allowed_files || []));
  const acceptanceCriteria = uniqueStrings(normalizeList(options.acceptance_criteria || task.acceptance_criteria || []));
  const requiredInputs = uniqueStrings(normalizeList(options.required_inputs || task.required_inputs || []));
  const expectedOutputs = uniqueStrings(normalizeList(options.expected_outputs || task.expected_outputs || []));
  const doNotChange = uniqueStrings([
    ...normalizeList(options.do_not_change || task.do_not_change || []),
    PROTECTED_FEATURE_DOCS_RULE,
    isProtectedFeatureDocsPath(options.allowed_files || task.allowed_files || []) ? PROTECTED_FEATURE_DOCS_RULE : null
  ]);
  const verificationCommands = uniqueStrings(normalizeList(options.verification_commands || task.verification_commands || []));
  const resumeSteps = uniqueStrings(normalizeList(options.resume_steps || task.resume_steps || []));
  const source = options.source || task.source || "manual";
  const taskId = task.id || options.id || "task-unknown";
  const title = task.title || options.title || "Untitled task";
  const summary = options.summary || task.execution_summary || `Task ${taskId}: ${title}`;
  const purpose = options.purpose || task.purpose || task.objective || title;
  const scope = options.scope || buildTaskMemoryScope({
    workstreams,
    appUsernames,
    appPaths,
    allowedFiles,
    source,
    sprintId: options.sprint_id || task.sprint_id || null,
    type: options.type || task.type || "general"
  });

  return {
    memory_type: "task_memory",
    version: 1,
    task_id: taskId,
    title,
    status: task.status || options.status || "proposed",
    purpose,
    summary,
    scope,
    source_of_truth: {
      source,
      workstreams,
      app_usernames: appUsernames,
      app_paths: appPaths,
      allowed_files: allowedFiles
    },
    acceptance_criteria: acceptanceCriteria,
    required_inputs: requiredInputs.length ? requiredInputs : defaultRequiredInputs(taskId, title, workstreams, appUsernames, source, acceptanceCriteria, allowedFiles),
    expected_outputs: expectedOutputs.length ? expectedOutputs : defaultExpectedOutputs(title, allowedFiles, acceptanceCriteria),
    do_not_change: doNotChange.length ? doNotChange : defaultDoNotChange(workstreams, appUsernames, allowedFiles),
    resume_steps: resumeSteps.length ? resumeSteps : defaultResumeSteps(taskId, allowedFiles, acceptanceCriteria, workstreams),
    verification_commands: verificationCommands.length ? verificationCommands : defaultVerificationCommands(workstreams, allowedFiles),
    handoff_note: options.handoff_note || task.handoff_note || `Resume ${taskId} from this memory block, keep the scope inside the listed boundaries, and preserve the task source of truth.`,
    generated_at: options.generated_at || now,
    updated_at: now
  };
}

function buildTaskMemoryScope(details) {
  const parts = [];
  if (details.type) parts.push(`Type: ${details.type}`);
  if (details.sprintId) parts.push(`Sprint: ${details.sprintId}`);
  if (details.workstreams && details.workstreams.length) parts.push(`Workstreams: ${details.workstreams.join(", ")}`);
  if (details.appUsernames && details.appUsernames.length) parts.push(`Apps: ${details.appUsernames.join(", ")}`);
  if (details.appPaths && details.appPaths.length) parts.push(`App paths: ${details.appPaths.join(", ")}`);
  if (details.allowedFiles && details.allowedFiles.length) parts.push(`Allowed files: ${details.allowedFiles.join(", ")}`);
  if (details.source) parts.push(`Source: ${details.source}`);
  return parts.join(". ");
}

function defaultRequiredInputs(taskId, title, workstreams, appUsernames, source, acceptanceCriteria, allowedFiles) {
  return uniqueStrings([
    `Task id: ${taskId}`,
    `Task title: ${title}`,
    workstreams.length ? `Workstreams: ${workstreams.join(", ")}` : null,
    appUsernames.length ? `Apps: ${appUsernames.join(", ")}` : null,
    source ? `Source: ${source}` : null,
    acceptanceCriteria.length ? `Acceptance criteria: ${acceptanceCriteria.join(" | ")}` : null,
    allowedFiles.length ? `Allowed files: ${allowedFiles.join(", ")}` : null
  ].filter(Boolean));
}

function defaultExpectedOutputs(title, allowedFiles, acceptanceCriteria) {
  return uniqueStrings([
    `The task ${title} is resumable from this memory block.`,
    allowedFiles.length ? `Changes remain inside ${allowedFiles.join(", ")}` : null,
    acceptanceCriteria.length ? `Acceptance criteria are satisfied: ${acceptanceCriteria.join(" | ")}` : null
  ].filter(Boolean));
}

function defaultDoNotChange(workstreams, appUsernames, allowedFiles) {
  return uniqueStrings([
    workstreams.length ? `Do not expand beyond workstreams: ${workstreams.join(", ")}` : null,
    appUsernames.length ? `Do not touch other apps: ${appUsernames.join(", ")}` : null,
    allowedFiles.length ? `Do not edit files outside allowed_files: ${allowedFiles.join(", ")}` : null,
    PROTECTED_FEATURE_DOCS_RULE,
    "Do not treat chat history as a substitute for this task memory."
  ].filter(Boolean));
}

function defaultResumeSteps(taskId, allowedFiles, acceptanceCriteria, workstreams) {
  return uniqueStrings([
    `Read the task memory for ${taskId} before editing anything.`,
    allowedFiles.length ? `Inspect only the allowed files: ${allowedFiles.join(", ")}` : "Inspect only the files that are necessary for the task.",
    workstreams.length ? `Keep work inside the declared workstreams: ${workstreams.join(", ")}` : null,
    acceptanceCriteria.length ? `Verify the acceptance criteria: ${acceptanceCriteria.join(" | ")}` : "Verify the task outcome against the source of truth.",
    "Update the task record and hand off with a short summary of what changed."
  ].filter(Boolean));
}

function defaultVerificationCommands(workstreams, allowedFiles) {
  const commands = ["npm test"];
  if (workstreams.includes("docs") || allowedFiles.some((item) => String(item).includes("docs"))) commands.push("node bin/kvdf.js validate");
  return uniqueStrings(commands);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.flatMap((item) => normalizeList(item));
  if (value === null || value === undefined) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((item) => String(item).trim()).filter(Boolean)));
}

function ensureTaskMemory(task, options = {}) {
  if (!task) return null;
  const memory = task.memory && typeof task.memory === "object" && task.memory.memory_type === "task_memory"
    ? task.memory
    : buildTaskMemory(task, options);
  task.memory = memory;
  task.execution_summary = task.execution_summary || memory.summary;
  task.resume_steps = Array.isArray(task.resume_steps) && task.resume_steps.length ? task.resume_steps : memory.resume_steps;
  task.required_inputs = Array.isArray(task.required_inputs) && task.required_inputs.length ? task.required_inputs : memory.required_inputs;
  task.expected_outputs = Array.isArray(task.expected_outputs) && task.expected_outputs.length ? task.expected_outputs : memory.expected_outputs;
  task.do_not_change = Array.isArray(task.do_not_change) && task.do_not_change.length ? task.do_not_change : memory.do_not_change;
  task.verification_commands = Array.isArray(task.verification_commands) && task.verification_commands.length ? task.verification_commands : memory.verification_commands;
  return memory;
}

module.exports = { buildTaskMemory, ensureTaskMemory };

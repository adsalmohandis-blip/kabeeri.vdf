const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");

const TASKS_FILE = ".kabeeri/tasks.json";
const TRASH_FILE = ".kabeeri/task_trash.json";
const DEFAULT_RETENTION_DAYS = 30;

function ensureTaskTrashState() {
  if (!fileExists(TRASH_FILE)) {
    writeJsonFile(TRASH_FILE, {
      trash: [],
      retention_days: DEFAULT_RETENTION_DAYS,
      last_sweep_at: null
    });
  }
  const state = readJsonFile(TRASH_FILE);
  state.trash = Array.isArray(state.trash) ? state.trash : [];
  state.retention_days = Number(state.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
  state.last_sweep_at = state.last_sweep_at || null;
  return state;
}

function writeTaskTrashState(state) {
  writeJsonFile(TRASH_FILE, {
    trash: Array.isArray(state.trash) ? state.trash : [],
    retention_days: Number(state.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS,
    last_sweep_at: state.last_sweep_at || null
  });
}

function purgeExpiredTaskTrash() {
  const state = ensureTaskTrashState();
  const now = new Date();
  const retentionDays = Number(state.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
  const remaining = [];
  const purged = [];
  for (const item of state.trash) {
    const trashedAt = parseDate(item.trashed_at);
    const expiresAt = parseDate(item.trash_expires_at);
    const isExpired = expiresAt ? expiresAt <= now : trashedAt ? addDays(trashedAt, retentionDays) <= now : false;
    if (isExpired) purged.push(item);
    else remaining.push(item);
  }
  state.trash = remaining;
  state.last_sweep_at = now.toISOString();
  writeTaskTrashState(state);
  return {
    report_type: "task_trash_sweep",
    generated_at: now.toISOString(),
    retention_days: retentionDays,
    purged_tasks: purged.map(taskTrashSummary),
    purged_count: purged.length,
    remaining_count: remaining.length,
    status: purged.length ? "purged" : "clean"
  };
}

function listTaskTrash() {
  const state = ensureTaskTrashState();
  const items = [...state.trash].sort((a, b) => compareDates(b.trashed_at, a.trashed_at));
  return {
    report_type: "task_trash_list",
    generated_at: new Date().toISOString(),
    retention_days: Number(state.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS,
    last_sweep_at: state.last_sweep_at || null,
    total: items.length,
    items: items.map(taskTrashSummary)
  };
}

function showTaskTrash(taskId) {
  if (!taskId) throw new Error("Missing task id.");
  const state = ensureTaskTrashState();
  const item = state.trash.find((task) => task.id === taskId);
  if (!item) throw new Error(`Task not found in trash: ${taskId}`);
  return {
    report_type: "task_trash_item",
    generated_at: new Date().toISOString(),
    item: clone(item)
  };
}

function moveTaskToTrash(taskId, options = {}) {
  if (!taskId) throw new Error("Missing task id.");
  const tasksState = readJsonFile(TASKS_FILE);
  tasksState.tasks = tasksState.tasks || [];
  const index = tasksState.tasks.findIndex((item) => item.id === taskId);
  if (index === -1) throw new Error(`Task not found: ${taskId}`);

  const task = clone(tasksState.tasks[index]);
  const trashState = ensureTaskTrashState();
  if (trashState.trash.some((item) => item.id === taskId)) {
    throw new Error(`Task already exists in trash: ${taskId}`);
  }

  const now = new Date();
  const retentionDays = Number(trashState.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
  const record = {
    ...task,
    trashed_at: now.toISOString(),
    trash_expires_at: addDays(now, retentionDays).toISOString(),
    trashed_reason: options.reason || "completed",
    trashed_by: options.actor || options.by || options.trashed_by || null,
    original_position: index,
    original_status: task.status || "proposed",
    source_collection: "tasks.json",
    trash_retention_days: retentionDays
  };

  tasksState.tasks.splice(index, 1);
  if (tasksState.temporary_queue && tasksState.temporary_queue.source_task_id === taskId) {
    tasksState.temporary_queue = null;
  }
  writeJsonFile(TASKS_FILE, tasksState);

  trashState.trash.push(record);
  writeTaskTrashState(trashState);

  return {
    report_type: "task_trashed",
    generated_at: now.toISOString(),
    status: "trashed",
    task: taskTrashSummary(record),
    trashed_task: clone(record),
    original_task: taskTrashSummary(task)
  };
}

function restoreTaskFromTrash(taskId, options = {}) {
  if (!taskId) throw new Error("Missing task id.");
  const trashState = ensureTaskTrashState();
  const index = trashState.trash.findIndex((item) => item.id === taskId);
  if (index === -1) throw new Error(`Task not found in trash: ${taskId}`);

  const record = trashState.trash[index];
  const tasksState = readJsonFile(TASKS_FILE);
  tasksState.tasks = tasksState.tasks || [];
  if (tasksState.tasks.some((item) => item.id === taskId)) {
    throw new Error(`Task already exists outside trash: ${taskId}`);
  }

  const restoredAt = new Date().toISOString();
  const restored = clone(record);
  delete restored.trashed_at;
  delete restored.trash_expires_at;
  delete restored.trashed_reason;
  delete restored.trashed_by;
  delete restored.original_position;
  delete restored.source_collection;
  delete restored.trash_retention_days;
  restored.restored_at = restoredAt;
  restored.restored_from_trash_at = record.trashed_at || null;
  restored.restored_from_trash_reason = record.trashed_reason || null;
  restored.updated_at = restoredAt;

  const insertAt = Number.isInteger(record.original_position) && record.original_position >= 0
    ? Math.min(record.original_position, tasksState.tasks.length)
    : tasksState.tasks.length;
  tasksState.tasks.splice(insertAt, 0, restored);
  trashState.trash.splice(index, 1);
  writeJsonFile(TASKS_FILE, tasksState);
  writeTaskTrashState(trashState);

  return {
    report_type: "task_restored_from_trash",
    generated_at: restoredAt,
    status: "restored",
    task: taskTrashSummary(restored),
    restored_task: clone(restored),
    trash_record: taskTrashSummary(record)
  };
}

function taskTrashSummary(item) {
  return {
    id: item.id || item.task_id || null,
    title: item.title || "",
    status: item.status || "unknown",
    trashed_at: item.trashed_at || null,
    trash_expires_at: item.trash_expires_at || null,
    trashed_reason: item.trashed_reason || null,
    original_position: Number.isInteger(item.original_position) ? item.original_position : null,
    original_status: item.original_status || null
  };
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + Number(days || 0));
  return result;
}

function compareDates(left, right) {
  const a = parseDate(left);
  const b = parseDate(right);
  return (a ? a.getTime() : 0) - (b ? b.getTime() : 0);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  DEFAULT_RETENTION_DAYS,
  ensureTaskTrashState,
  listTaskTrash,
  moveTaskToTrash,
  purgeExpiredTaskTrash,
  restoreTaskFromTrash,
  showTaskTrash,
  taskTrashSummary
};

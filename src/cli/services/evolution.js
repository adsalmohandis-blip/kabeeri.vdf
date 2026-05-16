const { fileExists } = require("../fs_utils");
const { readJsonFile } = require("../workspace");
const { readStateArray, summarizeBy } = require("./state_utils");

function buildEvolutionSummary(state) {
  ensureEvolutionDevelopmentPriorities(state);
  ensureEvolutionTemporaryPriorities(state);
  const changes = state.changes || [];
  const scorecards = Array.isArray(state.scorecards) ? state.scorecards : [];
  const deferredIdeas = getOpenDeferredIdeas(state);
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id);
  const openTasks = tasks.filter((taskItem) => !["owner_verified", "done", "closed", "rejected"].includes(taskItem.status));
  const openPriorities = state.development_priorities.filter((item) => !["done", "deferred", "rejected"].includes(item.status));
  const temporaryReport = buildEvolutionTemporaryPrioritiesReport(state);
  const temporary = temporaryReport.status === "empty" ? null : temporaryReport.queue;
  const roadmap = buildKVDFFeatureRestructureRoadmap();
  const capabilityPartitionMatrix = buildKVDFFeaturePartitionMatrix();
  const pluginLoaderState = fileExists(".kabeeri/plugins.json") ? readJsonFile(".kabeeri/plugins.json") : null;
  const activePlugins = pluginLoaderState && Array.isArray(pluginLoaderState.enabled_plugins) ? pluginLoaderState.enabled_plugins.length : 0;
  const multiAiState = fileExists(".kabeeri/multi_ai_governance.json") ? readJsonFile(".kabeeri/multi_ai_governance.json") : null;
  const multiAiCommunicationsState = fileExists(".kabeeri/multi_ai_communications.json") ? readJsonFile(".kabeeri/multi_ai_communications.json") : null;
  const multiAiActiveLeader = multiAiState && Array.isArray(multiAiState.leader_sessions)
    ? multiAiState.leader_sessions.find((item) => item.session_id === multiAiState.active_leader_session_id) || multiAiState.leader_sessions.find((item) => item.status === "active") || null
    : null;
  const multiAiActiveQueues = multiAiState && Array.isArray(multiAiState.worker_queues)
    ? multiAiState.worker_queues.filter((item) => item.status === "active")
    : [];
  const multiAiConversationThreads = multiAiCommunicationsState && Array.isArray(multiAiCommunicationsState.conversations)
    ? multiAiCommunicationsState.conversations
    : [];
  const multiAiConversationMessages = multiAiConversationThreads.flatMap((conversation) => Array.isArray(conversation.messages) ? conversation.messages : []);
  return {
    report_type: "evolution_steward_summary",
    generated_at: new Date().toISOString(),
    status: openTasks.length ? "needs_follow_up" : changes.length ? "ready" : "empty",
    changes_total: changes.length,
    active_changes: changes.filter((item) => !["verified", "closed"].includes(item.status)).length,
    follow_up_tasks_total: tasks.length,
    open_follow_up_tasks: openTasks.length,
    priorities_total: state.development_priorities.length,
    open_priorities: openPriorities.length,
    deferred_ideas_total: Array.isArray(state.deferred_ideas) ? state.deferred_ideas.length : 0,
    open_deferred_ideas: deferredIdeas.length,
    scorecards_total: scorecards.length,
    scorecards_open: scorecards.filter((item) => !["done", "closed"].includes(String(item.status || "").toLowerCase())).length,
    temporary_priority_queue: temporary ? {
      queue_id: temporary.queue_id,
      source_priority_id: temporary.source_priority_id,
      source_priority_title: temporary.source_priority_title,
      total_slices: temporary.slices.length,
      open_slices: temporary.slices.filter((slice) => !["done", "cancelled"].includes(slice.state)).length,
      current_slice: temporary.current_slice ? temporary.current_slice.title : null,
      status: temporary.status
    } : null,
    feature_restructure_work_order: {
      report_type: roadmap.report_type,
      total_steps: roadmap.roadmap.length,
      first_step: roadmap.roadmap[0] || null,
      last_step: roadmap.roadmap[roadmap.roadmap.length - 1] || null
    },
    capability_partition_matrix: {
      report_type: capabilityPartitionMatrix.report_type,
      total_capabilities: capabilityPartitionMatrix.total_capabilities,
      core_capabilities: capabilityPartitionMatrix.bucket_totals.core,
      owner_plugin_capabilities: capabilityPartitionMatrix.bucket_totals.owner_plugin,
      app_workspace_capabilities: capabilityPartitionMatrix.bucket_totals.app_workspace
    },
    plugin_loader: pluginLoaderState ? {
      state_file: ".kabeeri/plugins.json",
      active_plugins: activePlugins,
      disabled_plugins: Array.isArray(pluginLoaderState.disabled_plugins) ? pluginLoaderState.disabled_plugins.length : 0
    } : null,
    multi_ai: multiAiState ? {
      status: multiAiActiveLeader ? "active" : "idle",
      active_leader_session_id: multiAiActiveLeader ? multiAiActiveLeader.session_id : null,
      active_leader_ai_id: multiAiActiveLeader ? multiAiActiveLeader.leader_ai_id : null,
      active_queues: multiAiActiveQueues.length,
      merge_bundles: Array.isArray(multiAiState.merge_bundles) ? multiAiState.merge_bundles.length : 0,
      conversation_threads: multiAiConversationThreads.length,
      open_conversation_threads: multiAiConversationThreads.filter((item) => item.status === "open").length,
      pending_conversation_messages: multiAiConversationMessages.filter((item) => item.status === "pending").length
    } : null,
    next_priority: openPriorities[0] || null,
    current_change_id: state.current_change_id || null,
    by_status: summarizeBy(changes, "status"),
    latest_change: changes.length ? changes[changes.length - 1] : null
  };
}

function buildEvolutionScorecards(state, options = {}) {
  ensureEvolutionDevelopmentPriorities(state);
  ensureEvolutionTemporaryPriorities(state);
  state.scorecards = Array.isArray(state.scorecards) ? state.scorecards : [];
  const generatedAt = new Date().toISOString();
  const scorecards = [
    {
      card_id: "architecture",
      title: "Architecture and track boundaries",
      score: 4.6,
      strength: "The two-track model, foldering contract, pipeline guards, and task-control surfaces already make Kabeeri structurally strong.",
      weakness: "Compatibility aliases, legacy paths, and many report surfaces still make the architecture harder to read than it should be.",
      risk: "medium",
      evidence: [
        "docs/SYSTEM_CAPABILITIES_REFERENCE.md documents the track split and shared platform layer.",
        "docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md defines the repository foldering contract.",
        "src/cli/services/pipeline_guard.js enforces the fail-closed pipeline."
      ],
      impacted_areas: ["cli", "docs", "schemas", "tests"],
      evolution_plan_title: "Tighten Kabeeri architecture and reduce track drift",
      evolution_plan_summary: "Reduce alias drift, keep the command registry authoritative, and make the track boundaries more obvious for AI and maintainers.",
      next_action: "Create a follow-up plan that trims legacy aliases and keeps the contract layer as the source of truth."
    },
    {
      card_id: "ai_usability",
      title: "AI usability and next-action clarity",
      score: 4.4,
      strength: "The CLI already gives the AI a command contract, `next_exact_action` fields, and JSON outputs that are easy to consume.",
      weakness: "Some commands still expose different phrasing or multiple aliases, which makes the AI loop less uniform than it could be.",
      risk: "medium",
      evidence: [
        "src/cli/services/command_registry.js defines the shared operating contract.",
        "src/cli/commands/contract.js and src/cli/commands/resume.js already publish next action guidance.",
        "src/cli/services/pipeline_guard.js renders fail-closed blockers."
      ],
      impacted_areas: ["cli", "reports", "ai_context"],
      evolution_plan_title: "Make the AI/CLI operating contract more explicit and uniform",
      evolution_plan_summary: "Standardize the next-action vocabulary, keep JSON outputs consistent, and reduce command drift so AI tools stay inside the governed loop.",
      next_action: "Expand machine-readable next-action fields and keep the contract registry aligned with command behavior."
    },
    {
      card_id: "plugin_system",
      title: "Standalone plugin system",
      score: 4.5,
      strength: "The plugin loader can install, enable, disable, and uninstall removable bundles while keeping plugin state persisted.",
      weakness: "The app-builder plugins still need occasional parity work so every bundle feels equally mature and contract-complete.",
      risk: "low",
      evidence: [
        "src/cli/services/plugin_loader.js owns the canonical reversible plugin state.",
        "plugins/booking-builder/ and plugins/ecommerce-builder/ provide mature domain packs.",
        "The newer app-builder plugins now have mode packs, schemas, and smoke tests."
      ],
      impacted_areas: ["implementation", "docs", "tests"],
      evolution_plan_title: "Keep all standalone plugins on the same bundle contract",
      evolution_plan_summary: "Keep install/uninstall semantics stable while tightening the bundle folder contract, business-type packs, and plugin-specific runtime parity.",
      next_action: "Review plugin bundles for any missing business-type, schema, or test coverage."
    },
    {
      card_id: "task_governance",
      title: "Task governance and execution control",
      score: 4.7,
      strength: "Task packet, executor contract, coverage, lifecycle, and batch execution give Kabeeri a strong governed execution path.",
      weakness: "The task model is rich enough that the system must keep state, verification, and archive trails perfectly synchronized to avoid drift.",
      risk: "low",
      evidence: [
        "plugins/kvdf-dev/runtime/task_packet.js compiles the control-plane packet.",
        "src/cli/services/pipeline_guard.js blocks packet and execution paths when prerequisites are missing.",
        "src/cli/services/task_coverage.js and src/cli/commands/task_lifecycle.js keep task state visible."
      ],
      impacted_areas: ["tasks", "schemas", "reports", "tests"],
      evolution_plan_title: "Keep task packet, executor contract, and coverage strictly aligned",
      evolution_plan_summary: "Preserve the fail-closed task pipeline by keeping packet compilation, execution boundaries, verification, and archive trails synchronized.",
      next_action: "Re-check packet, contract, coverage, and completion reports after any task-system change."
    },
    {
      card_id: "docs_consistency",
      title: "Documentation consistency and source-of-truth alignment",
      score: 3.6,
      strength: "The docs system is broad, and the CLI/docs split is now visible in reports, command reference pages, and capability maps.",
      weakness: "The large number of docs layers, historical reports, and compatibility aliases can still drift if they are not generated from shared metadata.",
      risk: "medium",
      evidence: [
        "docs/cli/CLI_COMMAND_REFERENCE.md documents the command surface.",
        "docs/SYSTEM_CAPABILITIES_REFERENCE.md acts as the high-level capability map.",
        "docs/reports/ holds historical and execution reports."
      ],
      impacted_areas: ["docs", "capabilities", "reports"],
      evolution_plan_title: "Generate docs from command metadata and reduce CLI/docs drift",
      evolution_plan_summary: "Keep the documentation surface aligned with runtime behavior by driving help, references, and reports from one shared command registry.",
      next_action: "Treat docs generation as a governed output of the CLI contract rather than a separate copy-paste surface."
    },
    {
      card_id: "maintainability",
      title: "Maintainability and shared service extraction",
      score: 3.8,
      strength: "A lot of reusable behavior has already been pushed into services, which makes the CLI less monolithic than it used to be.",
      weakness: "The command layer is still fairly large, and some ownership boundaries are spread across multiple helper files and reports.",
      risk: "medium",
      evidence: [
        "src/cli/services/ contains shared orchestration logic.",
        "src/cli/commands/ still holds a large command surface.",
        "src/core/bootstrap.js and the plugin loader keep the runtime split explicit."
      ],
      impacted_areas: ["implementation", "tests", "docs"],
      evolution_plan_title: "Extract remaining command helpers into smaller shared services",
      evolution_plan_summary: "Keep shrinking the command layer by moving repeated logic into shared services and keeping command files focused on orchestration.",
      next_action: "Continue extracting repeated command logic into service modules before adding more surface area."
    }
  ].map((card, index) => {
    const band = scorecardBand(card.score);
    const existing = state.scorecards.find((item) => item.card_id === card.card_id) || null;
    return {
      ...card,
      order: index + 1,
      band,
      status: existing ? existing.status || "planned" : "planned",
      created_at: existing ? existing.created_at || generatedAt : generatedAt,
      updated_at: generatedAt,
      evolution_change_id: existing && existing.evolution_change_id ? existing.evolution_change_id : `evo-scorecard-${card.card_id}`,
      evolution_plan_status: existing ? existing.evolution_plan_status || null : null
    };
  });

  const summary = summarizeScorecards(scorecards);
  state.scorecards = scorecards;
  return {
    report_type: "kabeeri_scorecards",
    generated_at: generatedAt,
    report_path: "docs/reports/KVDF_SCORECARDS.md",
    status: summary.needs_attention > 0 ? "needs_attention" : "ready",
    summary,
    scorecards,
    scorecard_plans: [],
    scorecard_tasks: [],
    next_actions: [
      "Review each scorecard as a standalone evaluation artifact.",
      "Use `kvdf contract` or `kvdf pipeline strict` to inspect the current operating state.",
      "Re-run `kvdf evolution scorecards` after a major system change to refresh the assessment.",
      "If you later want to materialize Evolution work from these cards, rerun with `--materialize`."
    ]
  };
}

function summarizeScorecards(scorecards) {
  const summary = {
    total: scorecards.length,
    strong: 0,
    watch: 0,
    needs_attention: 0,
    average_score: 0
  };
  let total = 0;
  for (const card of scorecards) {
    total += Number(card.score || 0);
    if (card.band === "strong") summary.strong += 1;
    else if (card.band === "watch") summary.watch += 1;
    else summary.needs_attention += 1;
  }
  summary.average_score = scorecards.length ? Number((total / scorecards.length).toFixed(2)) : 0;
  return summary;
}

function scorecardBand(score) {
  const value = Number(score || 0);
  if (value >= 4.5) return "strong";
  if (value >= 3.5) return "watch";
  return "needs_attention";
}

function buildEvolutionTemporaryPrioritiesReport(state) {
  ensureEvolutionDevelopmentPriorities(state);
  ensureEvolutionTemporaryPriorities(state);
  const currentPriority = getCurrentEvolutionPriority(state);
  if (!currentPriority) {
    if (state.temporary_priorities && state.temporary_priorities.source_priority_id) state.temporary_priorities = null;
    return {
      report_type: "evolution_temporary_priorities",
      generated_at: new Date().toISOString(),
      status: "empty",
      active_priority: null,
      queue: null
    };
  }

  const sourceSignature = [currentPriority.id, currentPriority.status, currentPriority.updated_at || currentPriority.created_at || ""].join("|");
  const existing = state.temporary_priorities && state.temporary_priorities.source_priority_id === currentPriority.id && state.temporary_priorities.source_signature === sourceSignature
    ? state.temporary_priorities
    : null;
  const generatedAt = new Date().toISOString();
  const queue = existing || {
    queue_id: `${currentPriority.id}-temp`,
    source_priority_id: currentPriority.id,
    source_priority_title: currentPriority.title,
    source_priority_summary: currentPriority.summary,
    source_signature: sourceSignature,
    generated_at: generatedAt,
    expires_when_priority_changes: true,
    status: "active",
    current_slice_index: 0,
    coverage_policy: "full_task_coverage",
    slices: buildEvolutionTemporaryPrioritySlices(currentPriority).map((slice, index) => ({
      ...slice,
      state: index === 0 ? "active" : "pending",
      completed_at: null
    }))
  };

  if (existing && Array.isArray(existing.slices)) {
    queue.slices = existing.slices.map((slice, index) => ({
      ...slice,
      order: slice.order || index + 1,
      state: slice.state || (index === existing.current_slice_index ? "active" : "pending")
    }));
    queue.current_slice_index = Math.min(Math.max(Number(existing.current_slice_index || 0), 0), Math.max(queue.slices.length - 1, 0));
  }

  queue.current_slice = queue.slices[queue.current_slice_index] || null;
  queue.coverage_policy = queue.coverage_policy || "full_task_coverage";
  queue.updated_at = generatedAt;
  queue.expires_at = null;
  queue.status = queue.slices.some((slice) => slice.state === "blocked")
    ? "blocked"
    : queue.slices.every((slice) => slice.state === "done")
      ? "completed"
      : "active";
  if (queue.status === "completed") queue.current_slice = null;
  state.temporary_priorities = queue;
  return {
    report_type: "evolution_temporary_priorities",
    generated_at: generatedAt,
    status: queue.status,
    active_priority: {
      id: currentPriority.id,
      title: currentPriority.title,
      summary: currentPriority.summary,
      status: currentPriority.status
    },
    queue
  };
}

function advanceEvolutionTemporaryPriorities(state, flags = {}) {
  const report = buildEvolutionTemporaryPrioritiesReport(state);
  const queue = state.temporary_priorities;
  if (!queue) {
    return {
      ...report,
      action: "advance",
      message: "No active temporary priorities queue exists."
    };
  }
  const currentSlice = queue.slices[queue.current_slice_index] || null;
  if (!currentSlice) {
    return {
      ...report,
      action: "advance",
      message: "Temporary priorities queue has no current slice."
    };
  }
  currentSlice.state = "done";
  currentSlice.completed_at = new Date().toISOString();
  const nextIndex = queue.slices.findIndex((slice, index) => index > queue.current_slice_index && slice.state !== "done");
  if (nextIndex >= 0) {
    queue.current_slice_index = nextIndex;
    queue.slices[nextIndex].state = "active";
    queue.current_slice = queue.slices[nextIndex];
    queue.status = "active";
  } else {
    queue.current_slice = null;
    queue.status = "completed";
    queue.completed_at = new Date().toISOString();
  }
  queue.updated_at = new Date().toISOString();
  return {
    report_type: "evolution_temporary_priorities_advanced",
    generated_at: new Date().toISOString(),
    active_priority: report.active_priority,
    queue,
    completed_slice: currentSlice,
    next_slice: queue.current_slice || null,
    status: queue.status
  };
}

function completeEvolutionTemporaryPriorities(state) {
  const report = buildEvolutionTemporaryPrioritiesReport(state);
  const queue = state.temporary_priorities;
  if (!queue) {
    return {
      ...report,
      action: "complete",
      message: "No active temporary priorities queue exists."
    };
  }
  const completedAt = new Date().toISOString();
  for (const slice of queue.slices) {
    if (slice.state !== "done") {
      slice.state = "done";
      slice.completed_at = slice.completed_at || completedAt;
    }
  }
  queue.status = "completed";
  queue.completed_at = completedAt;
  queue.current_slice = null;
  queue.updated_at = completedAt;
  state.temporary_priorities = queue;
  return {
    report_type: "evolution_temporary_priorities_completed",
    generated_at: completedAt,
    active_priority: report.active_priority,
    queue,
    status: "completed"
  };
}

function handleEvolutionTemporaryPriorities(state, action, flags = {}) {
  const subaction = String(action || "show").toLowerCase();
  if (["show", "list", "status", "temp", "temporary", "temp-priorities", "temporary-priorities"].includes(subaction)) return buildEvolutionTemporaryPrioritiesReport(state);
  if (["advance", "next"].includes(subaction)) return advanceEvolutionTemporaryPriorities(state, flags);
  if (["complete", "close", "finish"].includes(subaction)) return completeEvolutionTemporaryPriorities(state);
  if (subaction === "clear") {
    const queue = state.temporary_priorities;
    state.temporary_priorities = null;
    return {
      report_type: "evolution_temporary_priorities_cleared",
      generated_at: new Date().toISOString(),
      queue,
      status: "cleared"
    };
  }
  throw new Error(`Unknown temporary priorities action: ${subaction}`);
}

function renderEvolutionTemporaryPrioritiesReport(report, table) {
  if (report.report_type === "evolution_temporary_priorities_advanced") {
    return `Temporary priorities advanced: ${report.completed_slice.title} -> ${report.next_slice ? report.next_slice.title : "complete"}`;
  }
  if (report.report_type === "evolution_temporary_priorities_completed") {
    return `Temporary priorities completed for ${report.active_priority ? report.active_priority.id : "none"}`;
  }
  if (report.report_type === "evolution_temporary_priorities_cleared") {
    return "Temporary priorities queue cleared.";
  }
  if (report.report_type === "evolution_temporary_priorities") {
    if (report.status === "empty") return report.audience === "app_developer" ? "No active app temporary priorities queue." : "No active temporary priorities queue.";
    const queue = report.queue;
    const lines = [
      report.audience === "app_developer" ? "App Temporary Execution Priorities" : "Temporary Execution Priorities",
      "",
      `Active priority: ${report.active_priority.id} - ${report.active_priority.title}`,
      `Queue status: ${report.status}`,
      `Current slice: ${queue.current_slice ? `${queue.current_slice.order}. ${queue.current_slice.title}` : "none"}`,
      `Expires with: ${queue.source_priority_id}`,
      "",
      "Slices:"
    ];
    for (const slice of queue.slices) {
      lines.push(`- [${slice.state}] ${slice.order}. ${slice.title}: ${slice.description}`);
    }
    return lines.join("\n");
  }
  return JSON.stringify(report, null, 2);
}

function ensureEvolutionTemporaryPriorities(state) {
  state.temporary_priorities = state.temporary_priorities && typeof state.temporary_priorities === "object" ? state.temporary_priorities : null;
}

function getCurrentTemporaryPriorities(state) {
  ensureEvolutionTemporaryPriorities(state);
  return state.temporary_priorities;
}

function getCurrentEvolutionPriority(state) {
  ensureEvolutionDevelopmentPriorities(state);
  return state.development_priorities.find((item) => item.status === "in_progress") || null;
}

function buildEvolutionTemporaryPrioritySlices(priority) {
  const title = priority ? priority.title : "Temporary execution priorities";
  const summary = priority ? priority.summary : "";
  return [
    {
      slice_id: "scope",
      order: 1,
      title: `Lock full task coverage for ${title}`,
      description: `Restate the active priority in execution terms, enumerate every required step from start to finish, and write down what must not change while the queue is in progress so nothing is left outside the queue. ${summary ? `Source summary: ${summary}` : ""}`.trim(),
      done_definition: "The owner can read a complete execution statement with no leftover work hidden outside the queue.",
      owner_confirmation_required: false
    },
    {
      slice_id: "map",
      order: 2,
      title: "Map every dependent surface",
      description: "Identify the files, runtime state, docs, schemas, tests, reports, and handoff surfaces that must move together so the priority stays completely covered.",
      done_definition: "All dependent surfaces are named before implementation starts and no known part is left unaccounted for.",
      owner_confirmation_required: false
    },
    {
      slice_id: "implement",
      order: 3,
      title: "Implement the complete task path",
      description: "Make the smallest code and state change that still covers the entire current task path from entry to finish with no leftover execution remainder.",
      done_definition: "The main change is implemented with no leftover execution remainder outside the queue.",
      owner_confirmation_required: false
    },
    {
      slice_id: "sync",
      order: 4,
      title: "Sync docs, state, and reports",
      description: "Update the source-of-truth docs, runtime state, and any dashboards or reports so the full task coverage is visible everywhere.",
      done_definition: "Documentation, live state, and reports all reflect the complete task path with no stray remainder.",
      owner_confirmation_required: false
    },
    {
      slice_id: "validate",
      order: 5,
      title: "Validate and close the queue",
      description: "Run the relevant checks, confirm there are no conflicts, and close the queue only when the entire current task has been covered from start to finish.",
      done_definition: "Validation passes and no uncovered part of the active task remains.",
      owner_confirmation_required: false
    }
  ];
}

function ensureEvolutionDevelopmentPriorities(state) {
  state.development_priorities = state.development_priorities || [];
  const existing = new Map(state.development_priorities.map((item) => [item.id, item]));
  const ordered = [];
  const defaults = [...defaultEvolutionDevelopmentPriorities()].sort((a, b) => {
    const priorityDelta = (a.priority || 0) - (b.priority || 0);
    if (priorityDelta !== 0) return priorityDelta;
    return (a.id || "").localeCompare(b.id || "");
  });
  defaults.forEach((item, index) => {
    const executionDetails = buildEvolutionPriorityExecutionDetails(item);
    const current = existing.get(item.id);
    const priority = index + 1;
    if (!current) {
      ordered.push({ ...item, priority, status: item.status || "planned", execution_details: executionDetails });
      return;
    }
    ordered.push({
      ...item,
      ...current,
      priority,
      title: item.title,
      summary: item.summary,
      source: item.source,
      execution_details: current.execution_details || executionDetails,
      status: current.status || item.status || "planned"
    });
  });
  state.development_priorities = ordered;
}

function buildEvolutionPriorityExecutionDetails(priority, options = {}) {
  const appMode = Boolean(options.appMode);
  const commandPrefix = options.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  const extraDetails = {};
  if (Array.isArray(priority.included_surfaces) && priority.included_surfaces.length) extraDetails.included_surfaces = priority.included_surfaces;
  if (Array.isArray(priority.excluded_surfaces) && priority.excluded_surfaces.length) extraDetails.excluded_surfaces = priority.excluded_surfaces;
  if (Array.isArray(priority.acceptance_criteria) && priority.acceptance_criteria.length) extraDetails.acceptance_criteria = priority.acceptance_criteria;
  if (Array.isArray(priority.implementation_notes) && priority.implementation_notes.length) extraDetails.implementation_notes = priority.implementation_notes;
  if (priority.tree_view) extraDetails.tree_view = priority.tree_view;
  if (Array.isArray(priority.partition_rules) && priority.partition_rules.length) extraDetails.partition_rules = priority.partition_rules;
  if (priority.id === "evo-auto-008") {
    Object.assign(extraDetails, {
      execution_context:
        "This priority finishes the manual source-package migration only after the design-system and project-documentation-generator material has been copied into permanent Kabeeri homes, represented in Evolution Steward, and verified with the source-package tooling. It exists to make cleanup safe, explicit, and resumable instead of turning deletion into an implicit side effect.",
      source_package: "KVDF_New_Features_Docs",
      source_package_roles: [
        "Software Design System reference library",
        "Project documentation generator system"
      ],
      cleanup_prerequisites: [
        "evo-auto-006 has analyzed overlap and duplicate risk.",
        "evo-auto-007 has imported the reusable documentation generator flow, templates, and catalog entries.",
        "The destination map lists the permanent Kabeeri folders for every meaningful asset.",
        "The source-package verify command passes before any removal request is made.",
        "The owner explicitly approves the final decommission request."
      ],
      cleanup_checklist: [
        "Confirm the current workspace is framework_owner_development and the source package is the active manual migration target.",
        "Review the destination map and make sure every meaningful asset has a named permanent home.",
        "Check that copied content is represented in Evolution Steward, documentation, and the correct Kabeeri folders.",
        "Run the cleanup preview to confirm the removal plan is safe and no uncovered material remains.",
        "Record any unresolved duplicates or missing destinations as blockers instead of forcing cleanup.",
        "Request owner approval for the folder removal step only after verification passes.",
        "Remove the source folder only after the approval trail, destination map, and verification evidence all agree."
      ],
      guardrails: [
        "Do not delete the source folder while any meaningful asset still lacks a destination.",
        "Do not treat a preview or dry-run as actual decommission approval.",
        "Do not skip the overlap analysis or the destination-map verification step.",
        "Do not close the priority if tests, source-package verification, or conflict scan fail.",
        "Do not rely on chat memory as the migration record; keep the state file and reports updated."
      ],
      validation_flow: [
        "kvdf source-package map",
        "kvdf source-package verify",
        "kvdf source-package cleanup",
        "npm test",
        "kvdf conflict scan"
      ],
      rollback_plan: [
        "If verification fails, stop before removal and repair the missing destination, duplicate mapping, or documentation gap.",
        "If the owner does not approve decommissioning, keep the source folder intact and continue using the cleanup preview only.",
        "If a file is missing after a partial move, restore it from the source package backup or the generated destination report before retrying cleanup."
      ],
      expected_artifacts: [
        "A complete destination map for the source package.",
        "Updated Evolution Steward entries for the imported design and docs systems.",
        "A cleanup preview report showing the safe removal plan.",
        "A decommission request trail with explicit owner approval.",
        "A final report or note confirming that the source folder was retired only after verification."
      ],
      explanation:
        "The priority is not just about deleting a folder. It is about proving that the temporary import source has been fully decomposed into permanent Kabeeri surfaces, then using explicit verification and approval to make the final cleanup safe."
    });
  }
  return {
    execution_summary: `Execute priority ${priority.id}: ${priority.summary}`,
    resume_steps: [
      "Run `kvdf resume` and confirm the workspace is framework_owner_development.",
      `Run \`kvdf evolution priority ${priority.id} --status in_progress\` if the priority is not active yet.`,
      `Run \`${commandPrefix} temp\` first and follow the current temporary slice before any implementation, docs, or tests.`,
      "Create or update scoped tasks before handing execution to another tool.",
      "Run `npm test` and `kvdf conflict scan` before closing the priority."
    ],
    required_inputs: [
      `Priority id: ${priority.id}`,
      `Priority title: ${priority.title}`,
      `Source: ${priority.source || "unknown"}`
    ],
    expected_outputs: [
      "The priority has concrete tasks or slices with allowed files and acceptance criteria.",
      "Runtime state and documentation agree about the completed behavior.",
      "The owner can resume from Evolution state without chat history."
    ],
    do_not_change: [
      "Do not skip earlier open priorities without Owner confirmation.",
      "Do not start a broad feature outside the active priority.",
      "Do not close the priority while tests or conflict scan are failing."
    ],
    verification_commands: ["npm test", "npm run kvdf -- conflict scan"],
    ...extraDetails
  };
}

function defaultEvolutionDevelopmentPriorities() {
  return [
    {
      id: "evo-auto-044-task-trash-system",
      priority: 1,
      title: "Task Trash System",
      summary: "Move completed tasks into a recoverable trash bucket with a 30-day retention policy, restore support, and session-start cleanup.",
      source: "owner_conversation",
      status: "done"
    },
    {
      id: "evo-auto-045-ai-agent-hub",
      priority: 2,
      title: "AI Agent Hub and Leader Lease",
      summary: "Record agent entry times, elect the first entrant as leader, manage leader handoff, and track unanswered calls before forcing a release.",
      source: "owner_conversation",
      status: "done"
    },
    {
      id: "evo-auto-046-task-scheduler",
      priority: 3,
      title: "Task Scheduler System",
      summary: "Schedule task movement across priorities, temp, deferred, trash, and AI agent workflows using one explicit orchestration layer.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-047-owner-developer-cli-separation",
      priority: 8,
      title: "Owner and Developer CLI Separation",
      summary: "Split the CLI surfaces so owner workflows and developer workflows expose only the commands, help, and guards that belong to their track.",
      source: "owner_conversation",
      status: "done",
      included_surfaces: [
        "Owner-only commands, help entries, and prompts",
        "Developer-only commands, help entries, and prompts",
        "Track-specific guards, routing, and blocked-feature messages",
        "Track-specific docs site navigation and examples"
      ],
      excluded_surfaces: [
        "Shared task engine commands such as temp, resume, conflict, sync, validate",
        "Generic workspace discovery and file utilities",
        "Common bootstrap, config, and session plumbing"
      ],
      acceptance_criteria: [
        "Owner commands do not appear in developer mode help or routing.",
        "Developer commands do not appear in owner-only help or routing.",
        "Shared commands continue to work for both tracks without duplication.",
        "Blocked commands explain the missing track or plugin clearly."
      ],
      implementation_notes: [
        "The CLI registry should load track-specific command modules only after the session track is known.",
        "Help output should render only commands available to the active track.",
        "Track guards should fail closed rather than falling back to a mixed surface."
      ]
    },
    {
      id: "evo-auto-050-core-shared-layer-and-plugin-loader",
      priority: 5,
      title: "Core Shared Layer and Plugin Loader",
      summary: "Keep kvdf-core minimal and shared, load owner features through a removable plugin bundle, and keep developer apps in isolated workspaces with explicit boundaries.",
      source: "owner_conversation",
      status: "planned",
      tree_view: [
        "kabeeri-core/ - shared runtime, guards, task engine, session routing, and loader",
        "plugins/kvdf-dev/ - removable framework-development bundle with owner-only commands and docs",
        "workspaces/apps/<app-slug>/ - isolated developer applications with local state"
      ],
      included_surfaces: [
        "Shared CLI bootstrap and command registry",
        "Plugin loader and enable/disable configuration",
        "Core guard and boundary enforcement",
        "Workspace detection and session state resolution"
      ],
      excluded_surfaces: [
        "Owner-specific docs, priorities, and plugin-only rules inside core",
        "Developer application source files inside core",
        "Hard-coded mixed owner/developer command tables"
      ],
      acceptance_criteria: [
        "Core starts without loading the owner bundle when it is disabled.",
        "Core can load the owner bundle without changing developer workspace files.",
        "Developer app workspaces can be discovered without loading owner-only files.",
        "The loader reports exactly which bundles are active and why."
      ],
      implementation_notes: [
        "Keep loader responsibilities separate from business logic.",
        "Core must stay usable when no optional owner plugin is installed.",
        "Store plugin state in explicit enablement metadata instead of implicit path checks."
      ]
    },
    {
      id: "evo-auto-048-developer-app-workspace-layout",
      priority: 7,
      title: "Developer App Workspace Layout",
      summary: "Standardize application projects under workspaces/apps/<app-slug>/ with their own app root, local .kabeeri state, and isolated runtime files.",
      source: "owner_conversation",
      status: "done",
      included_surfaces: [
        "workspaces/apps/<app-slug>/ root folder",
        ".kabeeri state local to each application",
        "App-local src/, tests/, docs/, and package.json",
        "Per-app task, temp, and resume state"
      ],
      excluded_surfaces: [
        "kvdf-core source tree",
        "Owner plugin bundle files",
        "Shared platform metadata that belongs only to the core"
      ],
      acceptance_criteria: [
        "A new app can be created without touching core files.",
        "Each app can carry its own .kabeeri state and tests.",
        "App workspaces remain isolated from the owner plugin tree.",
        "Paths and guards resolve app workspaces deterministically."
      ],
      implementation_notes: [
        "The workspace layout should be the default target for developer projects.",
        "App identification should come from the workspace root, not the current chat text.",
        "Core commands must be able to open app state without loading owner-only files."
      ]
    },
    {
      id: "evo-auto-049-owner-plugin-packaging",
      priority: 6,
      title: "Owner Plugin Packaging and Load Control",
      summary: "Package the owner track as an optional plugin-like bundle that can be enabled or removed so owner-specific files, commands, docs, and rules stay fully isolated from developer mode.",
      source: "owner_conversation",
      status: "planned",
      included_surfaces: [
        "Owner-only CLI modules and command aliases",
        "Owner-only docs pages and reports",
        "Owner-specific governance rules and prompts",
        "Owner bundle manifest, loader metadata, and enable/disable state"
      ],
      excluded_surfaces: [
        "Developer workspace source files",
        "Shared task engine primitives",
        "Generic utility modules that must remain in core"
      ],
      acceptance_criteria: [
        "Owner bundle can be enabled or removed without breaking developer mode.",
        "When disabled, owner commands and docs are hidden or blocked.",
        "When enabled, owner-specific surfaces load only through manifest-driven registration.",
        "Removal leaves developer workspaces and shared runtime intact."
      ],
      implementation_notes: [
        "Treat the owner surface like an installable bundle with explicit metadata.",
        "Do not hardcode owner files directly into the shared CLI registry.",
        "Bundle loading should be deterministic and reversible."
      ]
    },
    {
      id: "evo-auto-051-capability-partition-matrix",
      priority: 4,
      title: "Capability Partition Matrix",
      summary: "Classify every current Kabeeri capability into either the shared core or a removable plugin bundle, then publish the resulting ownership matrix, boundaries, and load rules as the authoritative source of truth.",
      source: "owner_conversation",
      status: "planned",
      tree_view: [
        "kabeeri-core/ - shared runtime, guards, task engine, session routing, and loader",
        "plugins/kvdf-dev/ - removable framework-development bundle with owner-only commands, docs, and governance",
        "workspaces/apps/<app-slug>/ - isolated developer applications with local state and app-only commands",
        "docs/reports/ - the study and decision reports that record the split",
        "docs/site/ - developer-facing capability documentation that mirrors the split"
      ],
      included_surfaces: [
        "All CLI-visible capabilities and commands",
        "All runtime state files and schemas tied to shared platform behavior",
        "All owner-only capabilities that should live in removable bundles",
        "All developer-facing application capabilities that should remain in workspaces/apps/<app-slug>/",
        "All docs pages, reports, and diagrams that explain the split"
      ],
      excluded_surfaces: [
        "Any mixed capability that cannot be assigned to core or plugin with a clear boundary",
        "Any direct owner-only implementation that bypasses the plugin loader",
        "Any application capability that writes into kvdf-core source folders",
        "Any capability surface that would make owner and developer behavior indistinguishable"
      ],
      acceptance_criteria: [
        "Every current capability appears in one of two buckets: core or plugin.",
        "The matrix explains why each capability belongs where it does.",
        "The classification matches the folder structure, CLI surface, and docs surface.",
        "No capability remains ambiguous or duplicated across the split.",
        "The classification is written down in a report that can be read without chat history."
      ],
      implementation_notes: [
        "Use the current capability reference as the master inventory.",
        "Translate each capability into a concrete destination: core file, plugin bundle, or app workspace.",
        "Keep the classification authoritative so later plugin extraction can follow it exactly.",
        "Treat the matrix as the contract for future command loading and docs publishing.",
        "Fail closed if a capability cannot be classified cleanly; do not leave it mixed just to make the split easier."
      ],
      partition_rules: [
        "Shared runtime, session routing, validation, guard, task engine, trash, scheduler, and telemetry belong to kabeeri-core.",
        "Framework-development governance, dev docs, dev routing, owner tokens, and removable owner commands belong to plugins/kvdf-dev/.",
        "Developer-facing app workflows, blueprints, questionnaire flows, and app-local state belong to workspaces/apps/<app-slug>/.",
        "If a capability touches more than one boundary, split it into a core primitive plus a plugin or app wrapper instead of keeping it mixed."
      ]
    },
    {
      id: "evo-auto-042-owner-docs-token-gate",
      priority: 9,
      title: "Owner docs token gate",
      summary: "Generate a fresh 50-character mixed token in chat whenever the owner opens the owner docs site, keep it valid for one minute, and expire it with the session.",
      source: "owner_conversation",
      status: "done"
    },
    {
      id: "evo-auto-043-owner-session-close",
      priority: 10,
      title: "Owner session auto-close",
      summary: "End the owner track session when the AI chat session ends so the next session always starts with a new token and fresh access.",
      source: "owner_conversation",
      status: "done"
    },
    {
      id: "evo-auto-004",
      priority: 11,
      title: "Runtime services layer",
      summary: "Move reusable runtime logic out of command handlers into services after command extraction pattern stabilizes.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-005",
      priority: 12,
      title: "Manual source package intake",
      summary: "Treat KVDF_New_Features_Docs as a manually requested source package that contains reference system designs and project-documentation generators, keep it out of automatic scans, and extract its contents before the folder is removed.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-006",
      priority: 13,
      title: "Reference design duplicate analysis",
      summary: "Analyze the Software Design System inside KVDF_New_Features_Docs only when requested, compare it against the central capability map, and avoid recreating existing capabilities under new names.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-007",
      priority: 14,
      title: "Project documentation generator import",
      summary: "Review the project documentation generator system inside KVDF_New_Features_Docs and import the reusable docs flow, templates, and catalog entries into the proper Kabeeri systems.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-008",
      priority: 15,
      title: "Source package cleanup and removal workflow",
      summary: "After both the Software Design System and the project documentation generator system from KVDF_New_Features_Docs are represented in Evolution Steward and the correct Kabeeri folders, clear the source package contents and remove the folder.",
      source: "manual_source_package",
      status: "planned"
    },
    {
      id: "evo-auto-009",
      priority: 16,
      title: "UI/UX questionnaire linkage",
      summary: "Make missing UI decisions explicit in questionnaire, resume output, and frontend task generation.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-010",
      priority: 17,
      title: "Low-cost project start mode",
      summary: "Add compact context, focused packs, and model-routing defaults for cheaper Kabeeri app development.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-011",
      priority: 18,
      title: "Runtime schema registry enforcement",
      summary: "Block or warn on new runtime state files without schema coverage or explicit exemption.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-012",
      priority: 19,
      title: "Docs source-of-truth checks",
      summary: "Detect commands/capabilities that exist in CLI but are missing from canonical docs.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-013",
      priority: 20,
      title: "Team GitHub sync deepening",
      summary: "Add issue/PR/status/comment integration and action-triggered feedback only for team mode.",
      source: "owner_conversation",
      status: "planned"
    },
    {
      id: "evo-auto-014",
      priority: 21,
      title: "Dashboard separation",
      summary: "Separate dashboard generation/state builders from CLI core and strengthen JSON contract tests.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-015",
      priority: 22,
      title: "Fast test layers",
      summary: "Add faster unit/service tests beside integration tests as runtime services are extracted.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-016",
      priority: 23,
      title: "Historical folder/version clarity",
      summary: "Mark historical folders and reports clearly so runtime never treats archived planning as current truth.",
      source: "technical_debt_review",
      status: "planned"
    },
    {
      id: "evo-auto-018-capability-registry",
      priority: 24,
      title: "Capability Registry",
      summary: "Register every imported capability as a named, traceable unit with clear ownership and source mapping.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-019-source-capability-mapping",
      priority: 25,
      title: "Source-to-Capability Mapping",
      summary: "Map source-study files to the exact capability surface, runtime target, docs page, and CLI command.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-020-two-track-entry",
      priority: 26,
      title: "Two-Track Entry System",
      summary: "Route sessions into Framework Owner Track or Vibe App Developer Track from the first entry point.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-021-role-track-enforcement",
      priority: 27,
      title: "Role and Track Enforcement",
      summary: "Block cross-track work and keep sessions locked to the correct role, track, and workspace context.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-022-pack-router",
      priority: 28,
      title: "Pack Router and Project Profile System",
      summary: "Route each project to the right pack set and profile before any broad generation or implementation starts.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-023-lifecycle-engine",
      priority: 29,
      title: "Lifecycle Engine",
      summary: "Track tasks through intake, readiness, execution, validation, and closure as a visible lifecycle.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-024-quality-gates",
      priority: 30,
      title: "Quality Gates",
      summary: "Require explicit readiness and done gates before advancing implementation or closing a task.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-025-task-assessment",
      priority: 31,
      title: "Task Assessment System",
      summary: "Generate a structured assessment before large work starts so scope, blockers, and dependencies are visible.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-026-traceability-layer",
      priority: 32,
      title: "Traceability Layer",
      summary: "Link features, tasks, decisions, docs, and tests so every change can be traced end to end.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-027-risk-change-control",
      priority: 33,
      title: "Risk and Change Management",
      summary: "Record change requests, impacts, risk register entries, and mitigation notes for large improvements.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-028-docs-site-publishing",
      priority: 34,
      title: "Docs Site Deep Publishing",
      summary: "Publish deep developer-facing documentation pages for every capability, command, and workflow family.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-029-cli-surface",
      priority: 35,
      title: "CLI Capability Surface",
      summary: "Make the CLI the clear operational surface for each new capability with discoverable commands.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-030-docs-cli-sync",
      priority: 36,
      title: "Docs-to-CLI Synchronization",
      summary: "Keep docs, CLI help, and runtime behavior aligned so no capability is documented without being real.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-031-project-profiles",
      priority: 37,
      title: "Project Profile System",
      summary: "Let profiles shape the depth, speed, and governance footprint of the current project.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-032-scale-packs",
      priority: 38,
      title: "Scale-Specific Packs",
      summary: "Add packs for very large systems so KVDF can scale without forcing every project through the same context.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-033-doc-generation",
      priority: 39,
      title: "Documentation Generation Flow",
      summary: "Treat docs generation as a workflow with templates, manifests, and page contracts rather than loose files.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-034-developer-onboarding",
      priority: 40,
      title: "Developer Onboarding Flow",
      summary: "Give new developers a guided first-session path that explains how to enter, route, and resume work safely.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-035-governance-expansion",
      priority: 41,
      title: "Governance Expansion",
      summary: "Extend governance coverage to trust, safety, privacy, compliance, and extensibility topics.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-036-capability-doc-matrix",
      priority: 42,
      title: "Capability-to-Documentation Matrix",
      summary: "Require every capability to have docs, CLI, runtime, tests, and report links in one matrix.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-037-source-normalization",
      priority: 43,
      title: "Source Folder Normalization",
      summary: "Normalize the imported source folders into safe lowercase structure with preserved mappings.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-038-full-task-coverage",
      priority: 44,
      title: "Full Task Coverage Workflow",
      summary: "Ensure each task is broken into complete execution slices with no remainder outside the queue.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-039-blocked-scenarios",
      priority: 45,
      title: "Blocked Scenario Reporting",
      summary: "Report blocked or invalid scenarios clearly so the developer knows what cannot proceed and why.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-040-searchable-reference",
      priority: 46,
      title: "Searchable Reference Surface",
      summary: "Make the new capability map searchable by track, capability, command, phase, and report type.",
      source: "new_features_docs_study",
      status: "planned"
    },
    {
      id: "evo-auto-041-execution-reports",
      priority: 47,
      title: "Execution Reports",
      summary: "Generate clear execution reports for each improvement so the next session can resume quickly.",
      source: "new_features_docs_study",
      status: "planned"
    }
  ];
}

function getOpenDeferredIdeas(state) {
  return (state.deferred_ideas || []).filter((item) => item.status === "deferred");
}

function buildKVDFFeatureRestructureRoadmap(options = {}) {
  const appMode = Boolean(options.appMode);
  const audience = appMode ? "app_developer" : "framework_owner";
  const roadmap = [
    {
      order: 1,
      id: "capability-registry-source-mapping",
      title: "Capability Registry and Source Mapping",
      purpose: "Convert the source study into a searchable capability registry with traceable origins, ownership, and downstream runtime surfaces.",
      cli_surface: ["kvdf capability map", "kvdf capability list", "kvdf questionnaire coverage"],
      docs_surface: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/site/pages/en/capabilities.html", "docs/site/pages/ar/capabilities.html"],
      deliverables: [
        "A canonical source-to-capability map.",
        "One explicit owner per capability family.",
        "Trace links from study file to implementation targets."
      ],
      done_definition: "Every imported capability can be traced from source study to CLI help, docs site, and runtime state."
    },
    {
      order: 2,
      id: "entry-track-role-enforcement",
      title: "Entry / Track / Role Enforcement",
      purpose: "Lock the session into the correct owner or vibe track from the first command and block accidental cross-track work.",
      cli_surface: ["kvdf start", "kvdf entry", "kvdf resume", "kvdf track status"],
      docs_surface: ["knowledge/governance/TRACK_ROUTING_GOVERNANCE.md", "docs/cli/CLI_COMMAND_REFERENCE.md"],
      deliverables: [
        "Track detection from workspace context.",
        "Blocked cross-track access rules.",
        "Persistent track state for resume."
      ],
      done_definition: "The session enters the right track automatically and rejects the wrong one with a clear reason."
    },
    {
      order: 3,
      id: "pack-router-project-profile",
      title: "Pack Router and Project Profile System",
      purpose: "Route each project to the smallest correct pack set and profile before any large generation or implementation starts.",
      cli_surface: ["kvdf blueprint", "kvdf data-design", "kvdf questionnaire plan", "kvdf prompt-pack"],
      docs_surface: ["docs/site/pages/en/product-blueprints.html", "docs/site/pages/en/questionnaire-engine.html"],
      deliverables: [
        "Primary pack choice.",
        "Supporting pack choice.",
        "Project profile selection and routing rules."
      ],
      done_definition: "Each project can be assigned the right pack/profile combination without reading every pack."
    },
    {
      order: 4,
      id: "lifecycle-quality-gates",
      title: "Lifecycle Engine and Quality Gates",
      purpose: "Make every capability move through readiness, implementation, validation, and closure gates with a visible lifecycle.",
      cli_surface: ["kvdf task status", "kvdf task start", "kvdf validate", "kvdf release"],
      docs_surface: ["knowledge/task_tracking/TASK_GOVERNANCE.md", "docs/site/pages/en/task-governance.html"],
      deliverables: [
        "Definition of ready and done.",
        "Lifecycle steps from intake to close.",
        "Gate checks that stop premature execution."
      ],
      done_definition: "No task moves forward without an explicit readiness gate and a valid close gate."
    },
    {
      order: 5,
      id: "traceability-risk-change-control",
      title: "Traceability, Risk, and Change Control",
      purpose: "Record the impact path, the risk posture, and the change history so decisions stay explainable and auditable.",
      cli_surface: ["kvdf trace", "kvdf impact", "kvdf change", "kvdf risk"],
      docs_surface: ["docs/reports/", "knowledge/governance/EVOLUTION_STEWARD.md"],
      deliverables: [
        "Impact matrix and decision log.",
        "Risk register with mitigations.",
        "Feature-to-test traceability."
      ],
      done_definition: "Every major change has a visible trace, a risk note, and a change record."
    },
    {
      order: 6,
      id: "docs-site-deep-publishing",
      title: "Docs Site Deep Publishing",
      purpose: "Publish a full human-readable explanation for every major capability in the docs site, in Arabic and English.",
      cli_surface: ["kvdf docs build", "kvdf docs preview", "kvdf docs sync"],
      docs_surface: ["docs/site/pages/en/", "docs/site/pages/ar/"],
      deliverables: [
        "One deep docs page per new capability family.",
        "Matched EN/AR pages.",
        "CLI examples and troubleshooting notes."
      ],
      done_definition: "The docs site explains each new capability deeply enough for a developer to use it without chat history."
    },
    {
      order: 7,
      id: "source-folder-normalization",
      title: "Source Folder Normalization and Preservation",
      purpose: "Normalize the source intake folders without losing traceability, history, or the mapping to the imported capabilities.",
      cli_surface: ["kvdf normalize preview", "kvdf normalize apply", "kvdf normalize report"],
      docs_surface: ["docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md"],
      deliverables: [
        "Lowercase folder naming plan.",
        "Safe rename preview and report.",
        "Path preservation for every moved source."
      ],
      done_definition: "The source intake folder is normalized safely and every original path remains traceable."
    }
  ];
  return {
    report_type: "kvdf_feature_restructure_roadmap",
    generated_at: new Date().toISOString(),
    audience,
    status: "ready",
    source: "KVDF_New_Features_Docs",
    coverage_policy: "full_task_coverage",
    roadmap
  };
}

function buildKVDFFeaturePartitionMatrix(options = {}) {
  const appMode = Boolean(options.appMode);
  const audience = appMode ? "app_developer" : "framework_owner";
  const source = "docs/SYSTEM_CAPABILITIES_REFERENCE.md";
  const studySource = "docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md";

  const coreCapabilities = [
    ["cli-engine", "CLI Engine", "The command dispatcher must exist before track detection, so it stays in shared bootstrap code.", ["bin/kvdf.js", "src/cli/index.js"], ["docs/cli/CLI_COMMAND_REFERENCE.md", "src/cli/ui.js"]],
    ["workspace-state", "Workspace State", "Both tracks read and write .kabeeri state, so the storage format must remain shared.", ["src/cli/workspace.js", ".kabeeri/"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/cli/CLI_COMMAND_REFERENCE.md"]],
    ["session-entry-router", "Session Entry Router", "Track routing must happen before optional bundles load.", ["kvdf start", "kvdf entry", "src/cli/commands/resume.js"], ["knowledge/governance/TRACK_ROUTING_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["session-resume-guard", "Session Resume Guard", "Resume needs safe context detection regardless of track.", ["kvdf resume"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/cli/CLI_COMMAND_REFERENCE.md"]],
    ["framework-boundary-guard", "Framework Boundary Guard", "Boundary enforcement must be shared so it can block mixed-track drift.", ["kvdf guard", "kvdf boundary"], ["knowledge/governance/APP_BOUNDARY_GOVERNANCE.md", "knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md"]],
    ["conflict-scan", "Conflict Scan", "Conflict checking is a platform safety check for every track.", ["kvdf conflict scan"], ["docs/cli/CLI_COMMAND_REFERENCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["task-tracking-and-governance", "Task Tracking And Governance", "Task storage, durable memory, trash, and lifecycle rules are shared execution primitives.", ["kvdf task", "kvdf task memory", "kvdf task trash"], ["knowledge/task_tracking/TASK_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["task-scheduler-system", "Task Scheduler System", "Movement across temp, trash, deferred, and agents is shared orchestration.", ["kvdf schedule"], ["knowledge/task_tracking/TASK_SCHEDULER_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["workstream-governance", "Workstream Governance", "Workstreams are common file and capability boundaries.", ["kvdf workstream"], ["knowledge/governance/WORKSTREAM_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["app-boundary-governance", "App Boundary Governance", "App boundaries protect both tracks from unrelated products.", ["kvdf app"], ["knowledge/governance/APP_BOUNDARY_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["execution-scope-governance", "Execution Scope Governance", "Allowed files and scope tokens are shared enforcement primitives.", ["kvdf token"], ["knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["multi-ai-governance", "Multi-AI Governance", "Agent entry, leader leases, and queue coordination are shared collaboration primitives.", ["kvdf multi-ai"], ["knowledge/governance/MULTI_AI_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["policy-gates", "Policy Gates", "Safety gates for verification and writing operations must be available to the shared runtime.", ["kvdf policy"], ["schemas/policy*.json", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["runtime-schema-registry", "Runtime Schema Registry", "Schema coverage is a platform contract and belongs in core.", ["kvdf validate runtime-schemas"], ["schemas/runtime/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["live-dashboard", "Live Dashboard", "Dashboard state is shared output for both tracks.", ["kvdf dashboard"], ["docs/reports/dashboard/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["github-team-sync-preflight", "GitHub Team Sync Preflight", "Sync readiness is a shared release safety check.", ["kvdf sync"], ["plugins/github_sync/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["security-governance", "Security Governance", "Secret scanning and secure release checks guard every track.", ["kvdf security"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", ".kabeeri/security/"]],
    ["migration-safety", "Migration Safety", "Migration and rollback records are shared runtime safety behavior.", ["kvdf migration"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", ".kabeeri/migrations/"]],
    ["validation-and-doctor", "Validation And Doctor", "Repository health and runtime integrity checks belong in the shared core.", ["kvdf doctor", "kvdf validate"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/cli/CLI_COMMAND_REFERENCE.md"]],
    ["independent-reports", "Independent Reports", "Readiness and governance reports are shared observability outputs.", ["kvdf readiness report", "kvdf governance report", "kvdf reports live"], ["docs/reports/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["reports-and-traceability", "Reports And Traceability", "Traceability records are shared evidence, not track-specific product logic.", ["docs/reports/"], ["docs/reports/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["repository-governance", "Repository Governance", "Contribution, security, and license rules live at repository level for everyone.", ["GOVERNANCE.md", "CONTRIBUTING.md", "SECURITY.md"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["product-packaging-and-upgrade", "Product Packaging And Upgrade", "Packaging checks protect the shared runtime and stay in core.", ["kvdf package", "kvdf upgrade"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/production/"]],
    ["release-readiness", "Release Readiness", "Release gating is a shared checkpoint before either track can ship work.", ["kvdf release"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/production/"]],
    ["handoff-packages", "Handoff Packages", "Handoff reporting is shared evidence generation from local state.", ["kvdf handoff"], ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", ".kabeeri/handoff/"]]
  ];

  const ownerPluginCapabilities = [
    ["kvdf-dev-system", "KVDF Dev System / Evolution Steward", "This capability changes Kabeeri itself and must remain removable as a framework-development bundle.", ["kvdf evolution", "kvdf evolution roadmap", "kvdf evolution priorities"], ["knowledge/governance/EVOLUTION_STEWARD.md", "docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md"]],
    ["owner-cli-separation", "Owner and Developer CLI Separation", "Track-specific command visibility belongs to the owner/developer split.", ["kvdf evolution app", "owner-only command surfaces"], ["docs/cli/CLI_COMMAND_REFERENCE.md", "knowledge/governance/TRACK_ROUTING_GOVERNANCE.md"]],
    ["owner-plugin-packaging", "KVDF Dev Plugin Packaging and Load Control", "The framework-development surface must be installable and removable as a bundle.", ["plugins/kvdf-dev/"], ["docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md", "knowledge/governance/TRACK_ROUTING_GOVERNANCE.md"]],
    ["owner-docs-token-gate", "Owner docs token gate", "The owner docs gate is a framework-maintenance control and should not live in core.", ["owner docs entry flow"], ["knowledge/governance/TRACK_ROUTING_GOVERNANCE.md", "docs/reports/"]],
    ["owner-session-auto-close", "Owner session auto-close", "Owner-session lifecycle is a framework-development policy.", ["owner session lifecycle"], ["knowledge/governance/TRACK_ROUTING_GOVERNANCE.md", "docs/reports/"]],
    ["capability-partition-matrix", "Capability Partition Matrix", "The split contract itself belongs with the owner stewardship layer because it defines how bundles load.", ["kvdf evolution partition"], ["docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["owner-governance-rules", "Owner-only Governance Rules", "Owner governance lives in the removable framework-maintenance bundle.", ["owner governance rules"], ["knowledge/governance/EVOLUTION_STEWARD.md", "knowledge/governance/MULTI_AI_GOVERNANCE.md"]],
    ["owner-ai-coordination", "Owner-only AI Coordination Rules", "Owner-specific multi-AI policy should not leak into app workspaces.", ["owner-only multi-ai policy"], ["knowledge/governance/MULTI_AI_GOVERNANCE.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]]
  ];

  const appWorkspaceCapabilities = [
    ["vibe-app-track", "Vibe App Developer Track", "This track builds customer applications, so it belongs in app workspace loading.", ["kvdf vibe", "kvdf ask", "kvdf capture"], ["knowledge/vibe_ux/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["delivery-mode-advisor", "Delivery Mode Advisor", "Delivery choice is part of app project setup.", ["kvdf delivery"], ["knowledge/delivery_modes/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["project-blueprint-catalog", "Product Blueprint Catalog", "Blueprint selection belongs to application scoping.", ["kvdf blueprint"], ["knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["data-design-blueprint", "Data Design Blueprint", "Database and entity planning are app implementation concerns.", ["kvdf data-design"], ["knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["agile-templates-runtime", "Agile Templates Runtime", "Agile workflows are app project planning surfaces.", ["kvdf agile", "kvdf sprint"], ["knowledge/agile_delivery/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["structured-delivery-runtime", "Structured Delivery Runtime", "Structured delivery is a project execution surface for applications.", ["kvdf structured", "kvdf waterfall"], ["knowledge/delivery_modes/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["project-intake", "Project Intake", "Project start and onboarding live in developer workspaces.", ["kvdf init", "kvdf questionnaire", "kvdf blueprint"], ["knowledge/project_intake/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["generators", "Generators", "Project skeleton generation is app setup logic.", ["kvdf generate", "kvdf create"], ["packs/generators/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["examples-library", "Examples Library", "Examples are developer onboarding content for application workspaces.", ["kvdf example"], ["packs/examples/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["questionnaires", "Questionnaires", "Adaptive intake and blueprint questions are developer-facing app setup tools.", ["kvdf questionnaire"], ["knowledge/questionnaires/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["capability-map", "Capability Map", "Capability mapping is used to scope application work.", ["kvdf capability"], ["knowledge/standard_systems/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["prompt-packs", "Prompt Packs And Common Prompt Layer", "Prompt packs are app-development guidance artifacts.", ["kvdf prompt-pack"], ["packs/prompt_packs/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["design-governance", "Design Governance", "Design source conversion is a frontend/app workflow.", ["kvdf design"], ["knowledge/design_sources/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["ui-ux-advisor", "UI/UX Advisor", "UI advice belongs to the app delivery track.", ["kvdf design recommend"], ["knowledge/design_system/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["ui-ux-reference-library", "UI/UX Reference Library", "Reference rules for frontend patterns belong with app delivery workflows.", ["kvdf design reference-*"], ["knowledge/design_system/ui_ux_reference/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["adr-ai-run-history", "ADR And AI Run History", "Architecture decisions and AI runs support app/project delivery.", ["kvdf adr", "kvdf ai-run"], ["knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["ai-cost-control", "AI Cost Control", "Model routing and budgets are app/project execution controls.", ["kvdf usage", "kvdf preflight"], ["knowledge/ai_cost_control/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["vscode-integration", "VS Code Integration", "Workspace scaffolding and command helpers are app developer conveniences.", ["kvdf vscode"], ["plugins/vscode_extension/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["github-sync", "GitHub Sync", "Issue and release syncing supports application delivery workflows.", ["kvdf github"], ["plugins/github_sync/", "docs/SYSTEM_CAPABILITIES_REFERENCE.md"]],
    ["roadmap-plan-inspection", "Roadmap And Plan Inspection", "Plan inspection helps app delivery sessions understand imported milestones.", ["kvdf plan"], ["docs/reports/platform_integration/", "docs/codex_context/"]]
  ];

  const bucketDefs = [
    {
      bucket_id: "kabeeri-core",
      bucket_name: "kabeeri-core",
      load_rule: "Load at bootstrap for every session, regardless of track.",
      capabilities: coreCapabilities.map(([id, title, reason, cli_surface, docs_surface]) => ({ id, title, reason, cli_surface, docs_surface }))
    },
    {
      bucket_id: "plugins/kvdf-dev",
      bucket_name: "plugins/kvdf-dev",
      load_rule: "Load only when the framework-owner track is active and the kvdf-dev bundle is enabled.",
      capabilities: ownerPluginCapabilities.map(([id, title, reason, cli_surface, docs_surface]) => ({ id, title, reason, cli_surface, docs_surface }))
    },
    {
      bucket_id: "workspaces/apps/<app-slug>",
      bucket_name: "workspaces/apps/<app-slug>",
      load_rule: "Load only after the workspace resolves to a developer app root and the app track is active.",
      capabilities: appWorkspaceCapabilities.map(([id, title, reason, cli_surface, docs_surface]) => ({ id, title, reason, cli_surface, docs_surface }))
    }
  ];

  const boundary_rules = [
    "Shared runtime, session routing, validation, guard, task engine, trash, scheduler, and telemetry belong in kabeeri-core.",
    "Framework-development governance, dev docs, dev routing, owner tokens, and removable owner commands belong in plugins/kvdf-dev.",
    "Developer-facing app workflows, blueprints, questionnaire flows, and app-local state belong in workspaces/apps/<app-slug>.",
    "If a capability crosses a boundary, split it into a core primitive plus a plugin or workspace wrapper instead of keeping it mixed.",
    "Developer docs may explain the split, but the docs site and runtime behavior must remain track-safe."
  ];

  return {
    report_type: "kvdf_capability_partition_matrix",
    generated_at: new Date().toISOString(),
    audience,
    source,
    study_source: studySource,
    boundary_rules,
    load_rules: bucketDefs.map((bucket) => bucket.load_rule),
    bucket_totals: {
      core: bucketDefs[0].capabilities.length,
      owner_plugin: bucketDefs[1].capabilities.length,
      app_workspace: bucketDefs[2].capabilities.length
    },
    total_capabilities: bucketDefs.reduce((total, bucket) => total + bucket.capabilities.length, 0),
    buckets: bucketDefs
  };
}

function renderKVDFFeaturePartitionMatrix(report, table) {
  const bucketTables = (report.buckets || []).map((bucket) => {
    const rows = (bucket.capabilities || []).map((capability) => [
      capability.title,
      capability.reason,
      (capability.cli_surface || []).join(", "),
      (capability.docs_surface || []).join(", ")
    ]);
    return [
      `${bucket.bucket_name} (${bucket.capabilities.length})`,
      `Load rule: ${bucket.load_rule}`,
      table(["Capability", "Why it belongs here", "CLI surface", "Docs surface"], rows.length ? rows : [["", "", "None.", ""]])
    ].join("\n");
  });

  return [
    report.audience === "app_developer" ? "Kabeeri App Capability Partition Matrix" : "KVDF Capability Partition Matrix",
    `Source: ${report.source}`,
    `Study: ${report.study_source}`,
    `Total capabilities: ${report.total_capabilities}`,
    `Core: ${report.bucket_totals.core} | Owner plugin: ${report.bucket_totals.owner_plugin} | App workspace: ${report.bucket_totals.app_workspace}`,
    "",
    "Boundary rules:",
    ...report.boundary_rules.map((rule) => `- ${rule}`),
    "",
    "Load rules:",
    ...report.load_rules.map((rule) => `- ${rule}`),
    "",
    bucketTables.join("\n\n")
  ].join("\n");
}

module.exports = {
  buildEvolutionSummary,
  buildEvolutionScorecards,
  ensureEvolutionDevelopmentPriorities,
  ensureEvolutionTemporaryPriorities,
  getCurrentTemporaryPriorities,
  getCurrentEvolutionPriority,
  buildEvolutionTemporaryPrioritySlices,
  buildEvolutionTemporaryPrioritiesReport,
  advanceEvolutionTemporaryPriorities,
  completeEvolutionTemporaryPriorities,
  buildEvolutionPriorityExecutionDetails,
  buildKVDFFeatureRestructureRoadmap,
  buildKVDFFeaturePartitionMatrix,
  renderKVDFFeaturePartitionMatrix,
  handleEvolutionTemporaryPriorities,
  renderEvolutionTemporaryPrioritiesReport
};


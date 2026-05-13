const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { packageRoot, repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { purgeExpiredTaskTrash } = require("../services/task_trash");
const { readGitStatus: readGitStatusService } = require("../services/git_snapshot");
const ONBOARDING_REPORT_FILE = ".kabeeri/reports/session_onboarding.json";

function resume(action, value, flags = {}) {
  const report = buildResumeReport({ scan: Boolean(flags.scan || flags.check || action === "scan") });
  persistSessionTrack(buildSessionEntryRoute(report), report, "resume");
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  renderResumeReport(report);
}

function entry(action, value, flags = {}) {
  const report = buildResumeReport({ scan: Boolean(flags.scan || flags.check || action === "scan") });
  const route = buildSessionEntryRoute(report);
  persistSessionTrack(route, report, "entry");
  const payload = {
    ...report,
    report_type: "session_entry_route",
    generated_at: new Date().toISOString(),
    entry_route: route
  };
  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  renderEntryReport(payload);
}

function onboarding(action, value, flags = {}) {
  const report = buildResumeReport({ scan: Boolean(flags.scan || flags.check || action === "scan") });
  const route = buildSessionEntryRoute(report);
  const guide = buildOnboardingGuide(report, route);
  const payload = buildOnboardingPayload(report, route, guide);
  if (action === "report") {
    const existing = readOnboardingReport();
    const persisted = existing || writeOnboardingReport(payload);
    if (flags.json) {
      console.log(JSON.stringify(persisted, null, 2));
      return;
    }
    renderOnboardingReport(persisted, report);
    return;
  }
  persistSessionTrack(route, report, "onboarding");
  writeOnboardingReport(payload);
  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  renderOnboardingReport(payload, report);
}

function buildOnboardingPayload(report, route, guide) {
  return {
    report_type: "session_onboarding",
    generated_at: new Date().toISOString(),
    report_path: ONBOARDING_REPORT_FILE,
    mode: report.mode,
    primary_track: report.primary_track,
    entry_route: route,
    guide,
    recommended_commands: guide.recommended_commands,
    enter_command: guide.enter_command,
    route_command: guide.route_command,
    resume_command: guide.resume_command
  };
}

function buildResumeReport(options = {}) {
  const cwd = repoRoot();
  const engineRoot = packageRoot();
  const localPackage = readLocalJson(path.join(cwd, "package.json"));
  const workspaceProject = readLocalJson(path.join(cwd, ".kabeeri", "project.json"));
  const hasWorkspace = fs.existsSync(path.join(cwd, ".kabeeri"));
  const taskTrashSweep = hasWorkspace ? purgeExpiredTaskTrash() : null;
  const hasOwnerState = fs.existsSync(path.join(cwd, "OWNER_DEVELOPMENT_STATE.md"));
  const isFrameworkSource = Boolean(
    localPackage &&
    localPackage.name === "kabeeri-vdf" &&
    fs.existsSync(path.join(cwd, "bin", "kvdf.js")) &&
    fs.existsSync(path.join(cwd, "src", "cli", "index.js"))
  );
  const appStack = detectAppStack(localPackage);
  const git = readGitStatusService(cwd);
  const mode = detectSessionMode({ isFrameworkSource, hasOwnerState, hasWorkspace, appStack });
  const primaryTrack = buildPrimaryTrack({ mode, hasWorkspace, appStack });
  const trackContext = buildTrackContext({
    cwd,
    mode,
    hasWorkspace,
    appStack,
    hasOwnerState
  });
  const rootRoles = buildRootRoles({ cwd, engineRoot, mode, appStack });
  const warnings = buildResumeWarnings({ mode, isFrameworkSource, hasWorkspace, appStack, git });
  const checks = options.scan ? buildResumeScan({ cwd, mode, hasWorkspace }) : [];
  const evolution = mode === "framework_owner_development" ? readEvolutionSnapshot(cwd) : null;
  const ownerCheckpoint = mode === "framework_owner_development" ? readOwnerCheckpoint(cwd) : null;
  const questionnaireUiDecisions = readQuestionnaireUiDecisionSummary(cwd);
  const sessionTrack = readSessionTrack(cwd);
  const gitSummary = summarizeGitStatus(git);
  const nextExactAction = buildNextExactAction({ mode, evolution, ownerCheckpoint, questionnaireUiDecisions, hasWorkspace, appStack, git });

  return {
    report_type: "session_resume",
    generated_at: new Date().toISOString(),
    mode,
    current_root: cwd,
    kabeeri_engine_root: engineRoot,
    has_kabeeri_workspace: hasWorkspace,
    has_owner_development_state: hasOwnerState,
    detected_app_stack: appStack,
    package_name: localPackage ? localPackage.name || null : null,
    workspace_project: workspaceProject ? {
      product_name: workspaceProject.product_name || "",
      profile: workspaceProject.profile || null,
      delivery_mode: workspaceProject.delivery_mode || null,
      language: workspaceProject.language || null
    } : null,
    git,
    git_summary: gitSummary,
    primary_track: primaryTrack,
    track_context: trackContext,
    session_track: sessionTrack,
    task_trash_sweep: taskTrashSweep,
    root_roles: rootRoles,
    warnings,
    evolution,
    owner_checkpoint: ownerCheckpoint,
    questionnaire_ui_decisions: questionnaireUiDecisions,
    next_exact_action: nextExactAction,
    next_actions: buildResumeNextActions({ mode, hasWorkspace, git, appStack, questionnaireUiDecisions }),
    recommended_commands: buildResumeCommands({ mode, hasWorkspace, appStack }),
    scan: checks
  };
}

function buildSessionEntryRoute(report) {
  const trackId = report.primary_track ? report.primary_track.id : "unclassified";
  if (trackId === "framework_owner") {
    return {
      track_id: "framework_owner",
      track_label: "Framework Owner Track",
      role_gate: "owner_only",
      route_command: "kvdf evolution priorities",
      follow_up_command: "kvdf evolution temp",
      activated_features: ["evolution", "evolution priorities", "evolution temp", "sync", "validate", "verify"],
      blocked_features: ["vibe", "ask", "capture", "task tracker", "app creation"],
      reason: "Show the ordered framework backlog first, then enter the active temporary queue for the current priority."
    };
  }
  if (trackId === "vibe_app_developer") {
    return {
      track_id: "vibe_app_developer",
      track_label: "Vibe App Developer Track",
      role_gate: "app_only",
      route_command: "kvdf vibe brief",
      follow_up_command: "kvdf task tracker",
      activated_features: ["vibe", "ask", "capture", "temp", "task tracker", "blueprint"],
      blocked_features: ["evolution", "deferred restore", "framework edit surfaces", "owner-only verification"],
      reason: "Show the app context brief first, then move directly into governed application task execution."
    };
  }
  return {
    track_id: "unclassified",
    track_label: "Unclassified Track",
    role_gate: "setup_required",
    route_command: "kvdf init",
    follow_up_command: "kvdf resume",
    activated_features: [],
    blocked_features: ["framework-owner track", "vibe app-developer track"],
    reason: "Initialize the workspace before choosing a framework-owner or app-developer path."
  };
}

function buildTrackContext({ cwd, mode, hasWorkspace, appStack, hasOwnerState }) {
  const sessionTrack = readSessionTrack(cwd);
  const sessionTrackSurface = getSessionTrackSurface(sessionTrack);
  const derivedTrackSurface = deriveTrackSurfaceFromContext({ mode, hasWorkspace, appStack, hasOwnerState });
  const effectiveTrackSurface = derivedTrackSurface || sessionTrackSurface || null;
  const mismatch = Boolean(
    derivedTrackSurface &&
    sessionTrackSurface &&
    derivedTrackSurface !== sessionTrackSurface
  );
  return {
    mode,
    has_workspace: hasWorkspace,
    has_owner_state: hasOwnerState,
    session_track_active: Boolean(sessionTrack && sessionTrack.active),
    session_track_surface: sessionTrackSurface,
    derived_track_surface: derivedTrackSurface,
    effective_track_surface: effectiveTrackSurface,
    lock_source: derivedTrackSurface ? "workspace_context" : (sessionTrackSurface ? "session_track" : "none"),
    mismatch,
    session_track_label: sessionTrack && sessionTrack.track_label ? sessionTrack.track_label : null,
    session_role_gate: sessionTrack && sessionTrack.role_gate ? sessionTrack.role_gate : null
  };
}

function deriveTrackSurfaceFromContext({ mode, hasWorkspace, appStack, hasOwnerState }) {
  if (mode === "framework_owner_development" || hasOwnerState) return "owner";
  if (mode === "kabeeri_user_app_workspace" || mode === "application_without_kabeeri_workspace" || appStack.length) return "developer";
  return null;
}

function getSessionTrackSurface(sessionTrack) {
  if (!sessionTrack || !sessionTrack.active) return null;
  if (sessionTrack.active_track === "framework_owner") return "owner";
  if (sessionTrack.active_track === "vibe_app_developer") return "developer";
  return null;
}

function persistSessionTrack(route, report, source = "entry") {
  const cwd = repoRoot();
  const filePath = path.join(cwd, ".kabeeri", "session_track.json");
  const now = new Date().toISOString();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const payload = {
    active: route.track_id !== "unclassified",
    active_track: route.track_id !== "unclassified" ? route.track_id : null,
    track_label: route.track_label,
    role_gate: route.role_gate,
    route_command: route.route_command,
    follow_up_command: route.follow_up_command,
    activated_features: route.activated_features || [],
    blocked_features: route.blocked_features || [],
    started_from_mode: report.mode,
    decision_source: source,
    active_root: report.current_root,
    activated_at: now,
    updated_at: now
  };
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function readSessionTrack(cwd) {
  const filePath = path.join(cwd, ".kabeeri", "session_track.json");
  return readLocalJson(filePath);
}

function buildPrimaryTrack({ mode, hasWorkspace, appStack }) {
  if (mode === "framework_owner_development") {
    return {
      id: "framework_owner",
      label: "Framework Owner Track",
      audience: "framework_owner",
      role_gate: "owner_only",
      starting_command: "kvdf resume",
      cycle: [
        "resume",
        "evolution priorities",
        "evolution temp",
        "implement",
        "sync",
        "validate",
        "verify"
      ],
      activated_features: ["evolution", "evolution priorities", "evolution temp", "sync", "validate", "verify"],
      blocked_features: ["vibe", "ask", "capture", "task tracker", "app creation"],
      summary: "Manage Kabeeri itself through ordered priorities, placement confirmation, and full temporary execution queues."
    };
  }
  if (hasWorkspace || appStack.length) {
    return {
      id: "vibe_app_developer",
      label: "Vibe App Developer Track",
      audience: "app_developer",
      role_gate: "app_only",
      starting_command: "kvdf resume",
      cycle: [
        "resume",
        "vibe or ask",
        "blueprint or questionnaire",
        "temp or task tracker",
        "capture",
        "validate",
        "handoff"
      ],
      activated_features: ["vibe", "ask", "capture", "temp", "task tracker", "blueprint", "questionnaire"],
      blocked_features: ["evolution", "deferred restore", "framework edit surfaces", "owner-only verification"],
      summary: "Develop application work with vibe-first intake, governed tasks, and a temporary queue tied to the current app task."
    };
  }
  return {
    id: "unclassified",
    label: "Unclassified Track",
    audience: "unknown",
    role_gate: "setup_required",
    starting_command: "kvdf init",
    cycle: ["init", "resume", "choose track"],
    activated_features: [],
    blocked_features: ["framework-owner track", "vibe app-developer track"],
    summary: "Initialize Kabeeri or declare whether the folder is a framework or app workspace."
  };
}

function detectSessionMode({ isFrameworkSource, hasOwnerState, hasWorkspace, appStack }) {
  if (isFrameworkSource && hasOwnerState) return "framework_owner_development";
  if (hasWorkspace && appStack.length) return "kabeeri_user_app_workspace";
  if (hasWorkspace) return "kabeeri_user_workspace";
  if (appStack.length) return "application_without_kabeeri_workspace";
  return "unknown_folder";
}

function detectAppStack(packageData) {
  if (!packageData) return [];
  const deps = { ...(packageData.dependencies || {}), ...(packageData.devDependencies || {}) };
  const stacks = [];
  if (deps.next) stacks.push("nextjs");
  if (deps.react) stacks.push("react");
  if (deps.vue) stacks.push("vue");
  if (deps["@angular/core"]) stacks.push("angular");
  if (deps.expo) stacks.push("react_native_expo");
  if (deps.vite) stacks.push("vite");
  if (deps.express) stacks.push("express");
  if (packageData.scripts && packageData.scripts.dev) stacks.push("npm_app");
  return Array.from(new Set(stacks));
}

function buildRootRoles({ cwd, engineRoot, mode, appStack }) {
  const roles = [
    { role: "current_root", path: cwd, meaning: "The folder this command is running in." },
    { role: "kabeeri_engine_root", path: engineRoot, meaning: "Where the kvdf engine code is loaded from." }
  ];
  if (mode === "framework_owner_development") {
    roles.push({ role: "npm_root", path: cwd, meaning: "Run Kabeeri framework npm commands here." });
  } else if (appStack.length) {
    roles.push({ role: "app_npm_root", path: cwd, meaning: "Run the user's application npm commands here; do not treat this as Kabeeri framework source." });
  }
  return roles;
}

function buildResumeWarnings({ mode, isFrameworkSource, hasWorkspace, appStack, git }) {
  const warnings = [];
  if (mode === "framework_owner_development") {
    warnings.push("This is Kabeeri framework source. Natural phrases like 'start development' should mean framework development only after reading OWNER_DEVELOPMENT_STATE.md.");
  }
  if (mode === "kabeeri_user_app_workspace" || mode === "kabeeri_user_workspace") {
    warnings.push("This is a user workspace. Do not edit Kabeeri framework internals unless the owner explicitly says this is framework development.");
  }
  if (!isFrameworkSource && appStack.includes("nextjs")) {
    warnings.push("Next.js app detected. npm commands belong to the app root; Kabeeri should be used as a CLI engine, not as the app source root.");
  }
  if (!hasWorkspace && mode !== "framework_owner_development") {
    warnings.push("No .kabeeri workspace found. Run kvdf init before governed project development.");
  }
  if (git.changed_files > 0) {
    warnings.push(`Working tree has ${git.changed_files} changed file(s). Review before starting new work.`);
  }
  return warnings;
}

function buildResumeNextActions({ mode, hasWorkspace, git, appStack, questionnaireUiDecisions }) {
  if (mode === "framework_owner_development") {
    const actions = [
      "Read OWNER_DEVELOPMENT_STATE.md.",
      "Review git status and current uncommitted changes.",
      "Run npm test before behavior changes.",
      "Continue the first relevant item in Next Actions or record a new framework development task."
    ];
    if (questionnaireUiDecisions && questionnaireUiDecisions.pending_count > 0) {
      actions.push(`Resolve ${questionnaireUiDecisions.pending_count} pending UI/UX decision(s) from the questionnaire if they affect frontend work.`);
    }
    return actions;
  }
  if (hasWorkspace) {
    const actions = [
      "Run kvdf reports live --json or kvdf vibe brief to understand the project state.",
      "Continue an approved task or ask the missing product questions before implementation.",
      "Keep application npm commands inside the app root."
    ];
    if (questionnaireUiDecisions && questionnaireUiDecisions.pending_count > 0) {
      actions.unshift(`Resolve ${questionnaireUiDecisions.pending_count} pending UI/UX decision(s) before generating frontend tasks.`);
    }
    if (appStack.includes("nextjs")) actions.push("For Next.js work, run npm install/dev/build only in this application root.");
    if (git.changed_files > 0) actions.push("Use kvdf capture before continuing if changed files are not linked to a governed task.");
    return actions;
  }
  return [
    "Decide whether this folder should become a Kabeeri workspace.",
    "If yes, run kvdf init with the appropriate profile and goal.",
    "If this is only an app folder, avoid editing Kabeeri framework files here."
  ];
}

function buildResumeCommands({ mode, hasWorkspace, appStack }) {
  if (mode === "framework_owner_development") {
    return ["git status --short", "npm test", "npm run test:smoke", "kvdf validate", "kvdf reports live --json"];
  }
  if (hasWorkspace) {
    const commands = ["kvdf reports live --json", "kvdf task tracker", "kvdf vibe brief", "kvdf vibe next", "kvdf validate workspace"];
    if (appStack.includes("nextjs")) commands.push("npm run dev");
    return commands;
  }
  return ["kvdf init --profile standard --goal \"Describe the application\"", "kvdf doctor"];
}

function buildResumeScan({ cwd, mode, hasWorkspace }) {
  const checks = [];
  checks.push(runCheck("git status --short", ["git", "status", "--short"], cwd));
  if (mode === "framework_owner_development") {
    checks.push(runCheck("kvdf evolution priorities --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "evolution", "priorities", "--json"], cwd));
    checks.push(runCheck("kvdf conflict scan --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "conflict", "scan", "--json"], cwd));
    checks.push(runCheck("npm test", [process.execPath, path.join(cwd, "tests", "cli.integration.test.js")], cwd));
  }
  if (hasWorkspace) {
    checks.push(runCheck("kvdf validate workspace", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "validate", "workspace"], cwd));
    checks.push(runCheck("kvdf reports live --json", [process.execPath, path.join(packageRoot(), "bin", "kvdf.js"), "reports", "live", "--json"], cwd));
  }
  return checks;
}

function readEvolutionSnapshot(cwd) {
  const state = readLocalJson(path.join(cwd, ".kabeeri", "evolution.json"));
  if (!state) return null;
  const priorities = Array.isArray(state.development_priorities) ? state.development_priorities : [];
  const openPriorities = priorities.filter((item) => !["done", "deferred", "rejected"].includes(item.status));
  return {
    changes_total: Array.isArray(state.changes) ? state.changes.length : 0,
    priorities_total: priorities.length,
    open_priorities: openPriorities.length,
    top_priorities: openPriorities.slice(0, 5),
    next_priority: openPriorities[0] || null,
    current_change_id: state.current_change_id || null,
    priorities_last_reviewed_at: state.priorities_last_reviewed_at || null
  };
}

function readOwnerCheckpoint(cwd) {
  const filePath = path.join(cwd, "OWNER_DEVELOPMENT_STATE.md");
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  return {
    path: "OWNER_DEVELOPMENT_STATE.md",
    current_state: parseOwnerCurrentState(text),
    next_actions: parseMarkdownListAfterHeading(text, "Next Actions").slice(0, 12),
    recent_notes: parseRecentOwnerNotes(text).slice(0, 8)
  };
}

function parseOwnerCurrentState(text) {
  const lines = sectionLines(text, "Current State");
  const state = {};
  for (const line of lines) {
    const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
    if (match) state[slugKey(match[1])] = match[2].trim();
  }
  return state;
}

function parseMarkdownListAfterHeading(text, heading) {
  return sectionLines(text, heading)
    .map((line) => line.trim())
    .filter((line) => /^(\d+\.|-)\s+/.test(line))
    .map((line) => line.replace(/^(\d+\.|-)\s+/, "").trim())
    .filter(Boolean);
}

function parseRecentOwnerNotes(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s*20\d\d-\d\d-\d\d:/.test(line))
    .map((line) => line.replace(/^-\s*/, ""))
    .slice(-12)
    .reverse();
}

function sectionLines(text, heading) {
  const lines = String(text || "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return [];
  const output = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    output.push(lines[index]);
  }
  return output;
}

function slugKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function summarizeGitStatus(git) {
  const entries = git.entries || [];
  const summary = {
    changed_files: git.changed_files || 0,
    modified: 0,
    added: 0,
    deleted: 0,
    untracked: 0,
    renamed: 0,
    entries_preview: entries.slice(0, 8)
  };
  for (const entry of entries) {
    const code = entry.slice(0, 2);
    if (code.includes("M")) summary.modified += 1;
    if (code.includes("A")) summary.added += 1;
    if (code.includes("D")) summary.deleted += 1;
    if (code.includes("R")) summary.renamed += 1;
    if (code === "??") summary.untracked += 1;
  }
  return summary;
}

function buildNextExactAction({ mode, evolution, ownerCheckpoint, questionnaireUiDecisions, hasWorkspace, appStack, git }) {
  if (mode === "framework_owner_development") {
    if (evolution && evolution.next_priority) {
      return `Continue ${evolution.next_priority.id}: ${evolution.next_priority.title}.`;
    }
    if (questionnaireUiDecisions && questionnaireUiDecisions.pending_count > 0) {
      const preview = questionnaireUiDecisions.pending_titles.slice(0, 3).join(", ");
      return `Resolve pending UI/UX decisions: ${preview}${questionnaireUiDecisions.pending_count > 3 ? ", ..." : ""}.`;
    }
    if (ownerCheckpoint && ownerCheckpoint.next_actions.length) return ownerCheckpoint.next_actions[0];
    return git.changed_files ? "Review current diff, then run npm test." : "Pick the next Evolution Steward priority.";
  }
  if (questionnaireUiDecisions && questionnaireUiDecisions.pending_count > 0) {
    const preview = questionnaireUiDecisions.pending_titles.slice(0, 3).join(", ");
    return `Resolve pending UI/UX decisions: ${preview}${questionnaireUiDecisions.pending_count > 3 ? ", ..." : ""}.`;
  }
  if (hasWorkspace) {
    if (git.changed_files > 0) return "Run kvdf capture or link changed files to a governed task before new implementation.";
    return appStack.length ? "Open the current task context, then run app commands in the app root." : "Run kvdf reports live --json and continue the next governed task.";
  }
  return "Run kvdf init if this folder should become a Kabeeri workspace.";
}

function readQuestionnaireUiDecisionSummary(cwd) {
  const filePath = path.join(cwd, ".kabeeri", "questionnaires", "missing_answers_report.json");
  if (!fs.existsSync(filePath)) return null;
  const report = readLocalJson(filePath);
  if (!report) return null;
  const uiAreas = new Set(["ui_ux_design", "public_frontend", "admin_frontend", "internal_operations_frontend", "theme_branding", "dashboard_customization", "accessibility"]);
  const pending = [...(report.missing || []), ...(report.follow_up || [])].filter((item) => uiAreas.has(item.area_key));
  if (!pending.length) return null;
  return {
    report_path: ".kabeeri/questionnaires/missing_answers_report.json",
    pending_count: pending.length,
    pending_titles: pending.map((item) => item.area).filter(Boolean),
    pending: pending.map((item) => ({
      area_key: item.area_key,
      area: item.area,
      status: item.status,
      required_action: item.required_action,
      suggested_questions: item.suggested_questions || []
    }))
  };
}

function buildOnboardingGuide(report, route) {
  if (report.mode === "framework_owner_development") {
    return {
      title: "Framework Owner Onboarding",
      summary: "Start here when you are resuming development on Kabeeri itself.",
      enter_command: "kvdf resume --json",
      route_command: "kvdf entry",
      resume_command: "kvdf resume",
      first_steps: [
        "Enter with kvdf resume --json to confirm the current workspace mode and root.",
        "Route with kvdf entry so Kabeeri activates the framework-owner track and persists it.",
        "Read OWNER_DEVELOPMENT_STATE.md and confirm the current priority.",
        "Run kvdf evolution priorities and confirm the active temporary queue.",
        "Run kvdf docs manifest and kvdf docs validate to confirm docs truth.",
        "Run npm test before you edit behavior."
      ],
      recommended_commands: [
        "kvdf resume --json",
        "kvdf entry",
        "kvdf evolution priorities --json",
        "kvdf evolution temp",
        "kvdf resume",
        "kvdf docs validate",
        "npm test"
      ],
      guardrails: route.blocked_features || []
    };
  }
  if (report.has_kabeeri_workspace) {
    return {
      title: "App Workspace Onboarding",
      summary: "Start here when you are inside a governed application workspace.",
      enter_command: "kvdf resume --json",
      route_command: "kvdf entry",
      resume_command: "kvdf resume",
      first_steps: [
        "Enter with kvdf resume --json to identify the active track and current root.",
        "Route with kvdf entry so the developer track is persisted for later sessions.",
        "Open kvdf vibe brief or kvdf task tracker before implementation.",
        "Check the current task scope and allowed files.",
        "Use kvdf validate workspace before release or handoff."
      ],
      recommended_commands: [
        "kvdf resume --json",
        "kvdf entry",
        "kvdf vibe brief",
        "kvdf task tracker",
        "kvdf resume",
        "kvdf validate workspace"
      ],
      guardrails: route.blocked_features || []
    };
  }
  return {
    title: "New Workspace Onboarding",
    summary: "Start here when this folder is not yet initialized with Kabeeri.",
    enter_command: "kvdf init --profile standard --goal \"Describe the application\"",
    route_command: "kvdf entry",
    resume_command: "kvdf resume",
    first_steps: [
      "Decide whether this folder should become a Kabeeri workspace.",
      "Run kvdf init with the right profile and goal.",
      "Use kvdf entry to let Kabeeri choose the right track after initialization.",
      "Then run kvdf resume to confirm the track and current root.",
      "Open the docs site or structure map if you need orientation."
    ],
    recommended_commands: [
      "kvdf init --profile standard --goal \"Describe the application\"",
      "kvdf entry",
      "kvdf resume --json",
      "kvdf resume",
      "kvdf docs manifest",
      "kvdf structure map"
    ],
    guardrails: route.blocked_features || []
  };
}

function writeOnboardingReport(payload) {
  const cwd = repoRoot();
  const filePath = path.join(cwd, ONBOARDING_REPORT_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function readOnboardingReport() {
  const filePath = path.join(repoRoot(), ONBOARDING_REPORT_FILE);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function runCheck(label, command, cwd) {
  const [exe, ...args] = command;
  const result = spawnSync(exe, args, { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 16 });
  return {
    label,
    status: result.status === 0 ? "pass" : "fail",
    exit_code: result.status,
    stdout_summary: summarizeOutput(result.stdout),
    stderr_summary: summarizeOutput(result.stderr)
  };
}

function summarizeOutput(value) {
  return String(value || "").split(/\r?\n/).filter(Boolean).slice(0, 8);
}

function readLocalJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return null;
  }
}

function renderResumeReport(report) {
  console.log("Kabeeri Session Resume");
  console.log(table(["Field", "Value"], [
    ["Mode", report.mode],
    ["Current root", report.current_root],
    ["Kabeeri engine root", report.kabeeri_engine_root],
    [".kabeeri workspace", report.has_kabeeri_workspace ? "present" : "missing"],
    ["Owner state", report.has_owner_development_state ? "present" : "missing"],
    ["App stack", report.detected_app_stack.length ? report.detected_app_stack.join(", ") : "none"],
    ["Git changed files", report.git.changed_files]
  ]));
  if (report.primary_track) {
    console.log("");
    console.log("Primary track:");
    console.log(table(["Field", "Value"], [
      ["Track", report.primary_track.label],
      ["Audience", report.primary_track.audience],
      ["Starting command", report.primary_track.starting_command],
      ["Summary", report.primary_track.summary]
    ]));
    console.log("");
    console.log("Track cycle:");
    for (const step of report.primary_track.cycle || []) console.log(`- ${step}`);
  }
  console.log("");
  console.log("Root roles:");
  console.log(table(["Role", "Path", "Meaning"], report.root_roles.map((item) => [item.role, item.path, item.meaning])));
  if (report.session_track) {
    console.log("");
    console.log("Session track:");
    console.log(table(["Field", "Value"], [
      ["Active", report.session_track.active ? "yes" : "no"],
      ["Track", report.session_track.track_label || report.session_track.active_track || "none"],
      ["Role gate", report.session_track.role_gate || "unknown"],
      ["Route command", report.session_track.route_command || ""],
      ["Follow-up", report.session_track.follow_up_command || ""]
    ]));
  }
  if (report.track_context) {
    console.log("");
    console.log("Track lock:");
    console.log(table(["Field", "Value"], [
      ["Effective surface", report.track_context.effective_track_surface || "none"],
      ["Derived surface", report.track_context.derived_track_surface || "none"],
      ["Session surface", report.track_context.session_track_surface || "none"],
      ["Lock source", report.track_context.lock_source || "none"],
      ["Mismatch", report.track_context.mismatch ? "yes" : "no"]
    ]));
  }
  if (report.task_trash_sweep && typeof report.task_trash_sweep.purged_count === "number") {
    console.log("");
    console.log("Task trash sweep:");
    console.log(table(["Field", "Value"], [
      ["Status", report.task_trash_sweep.status || "unknown"],
      ["Purged", String(report.task_trash_sweep.purged_count)],
      ["Remaining", String(report.task_trash_sweep.remaining_count)],
      ["Retention days", String(report.task_trash_sweep.retention_days || 0)]
    ]));
  }
  console.log("");
  console.log("Warnings:");
  for (const item of report.warnings.length ? report.warnings : ["None."]) console.log(`- ${item}`);
  console.log("");
  console.log(`Next exact action: ${report.next_exact_action}`);
  console.log("");
  console.log("Next actions:");
  for (const item of report.next_actions) console.log(`- ${item}`);
  if (report.owner_checkpoint) {
    console.log("");
    console.log("Owner checkpoint:");
    console.log(table(["Field", "Value"], [
      ["Date", report.owner_checkpoint.current_state.date || ""],
      ["Branch", report.owner_checkpoint.current_state.branch || ""],
      ["Latest commit", report.owner_checkpoint.current_state.latest_known_commit || ""],
      ["Checkpoint next", report.owner_checkpoint.next_actions[0] || "none"]
    ]));
  }
  if (report.questionnaire_ui_decisions && report.questionnaire_ui_decisions.pending_count) {
    console.log("");
    console.log("Pending UI/UX decisions:");
    console.log(table(["Field", "Value"], [
      ["Pending", String(report.questionnaire_ui_decisions.pending_count)],
      ["Report", report.questionnaire_ui_decisions.report_path || ""]
    ]));
    for (const item of report.questionnaire_ui_decisions.pending.slice(0, 8)) {
      console.log(`- ${item.area}: ${item.required_action}`);
    }
  }
  if (report.track_context && report.track_context.mismatch) {
    console.log("");
    console.log("Track lock warning:");
    console.log("- The persisted session track does not match the current workspace context.");
    console.log("- Workspace context wins so wrong-track commands cannot override the current root.");
  }
  if (report.evolution) {
    console.log("");
    console.log("Evolution Steward:");
    console.log(table(["Field", "Value"], [
      ["Changes", report.evolution.changes_total],
      ["Open priorities", `${report.evolution.open_priorities}/${report.evolution.priorities_total}`],
      ["Next priority", report.evolution.next_priority ? report.evolution.next_priority.title : "none"],
      ["Current change", report.evolution.current_change_id || "none"]
    ]));
    if (report.evolution.top_priorities && report.evolution.top_priorities.length) {
      console.log("");
      console.log("Top development priorities:");
      console.log(table(["#", "ID", "Status", "Title"], report.evolution.top_priorities.map((item) => [
        item.priority,
        item.id,
        item.status,
        item.title
      ])));
    }
  }
  console.log("");
  console.log("Recommended commands:");
  for (const item of report.recommended_commands) console.log(`- ${item}`);
  if (report.scan.length) {
    console.log("");
    console.log("Scan:");
    console.log(table(["Check", "Status", "Exit"], report.scan.map((item) => [item.label, item.status, item.exit_code])));
  }
}

function renderEntryReport(report) {
  console.log("Kabeeri Session Entry");
  console.log(table(["Field", "Value"], [
    ["Mode", report.mode],
    ["Primary track", report.primary_track ? report.primary_track.label : "unknown"],
    ["Role gate", report.entry_route.role_gate],
    ["Route command", report.entry_route.route_command],
    ["Follow-up command", report.entry_route.follow_up_command]
  ]));
  console.log("");
  if (report.entry_route.activated_features && report.entry_route.activated_features.length) {
    console.log("Activated features:");
    for (const item of report.entry_route.activated_features) console.log(`- ${item}`);
    console.log("");
  }
  if (report.entry_route.blocked_features && report.entry_route.blocked_features.length) {
    console.log("Blocked on this track:");
    for (const item of report.entry_route.blocked_features) console.log(`- ${item}`);
    console.log("");
  }
  console.log(`Reason: ${report.entry_route.reason}`);
  console.log("");
  console.log("Track cycle:");
  for (const item of report.primary_track && report.primary_track.cycle ? report.primary_track.cycle : []) console.log(`- ${item}`);
  console.log("");
  console.log("Resume details:");
  renderResumeReport(report);
}

function renderOnboardingReport(payload, report) {
  console.log("Kabeeri Onboarding");
  console.log(table(["Field", "Value"], [
    ["Mode", payload.mode],
    ["Track", payload.primary_track ? payload.primary_track.label : "unknown"],
    ["Next command after route", payload.entry_route.route_command],
    ["Follow-up command", payload.entry_route.follow_up_command],
    ["Enter command", payload.enter_command || ""],
    ["Route step", payload.route_command || ""],
    ["Resume command", payload.resume_command || ""],
    ["Onboarding title", payload.guide.title]
  ]));
  console.log("");
  console.log(payload.guide.summary);
  console.log("");
  console.log("Enter / route / resume:");
  console.log(`- Enter: ${payload.enter_command || "kvdf resume --json"}`);
  console.log(`- Route: ${payload.route_command || "kvdf entry"}`);
  console.log(`- Resume: ${payload.resume_command || "kvdf resume"}`);
  console.log("");
  console.log("First steps:");
  for (const item of payload.guide.first_steps || []) console.log(`- ${item}`);
  if ((payload.guide.guardrails || []).length) {
    console.log("");
    console.log("Guardrails:");
    for (const item of payload.guide.guardrails) console.log(`- ${item}`);
  }
  console.log("");
  console.log("Recommended commands:");
  for (const item of payload.recommended_commands || []) console.log(`- ${item}`);
  console.log("");
  console.log(`Report path: ${payload.report_path || ONBOARDING_REPORT_FILE}`);
  console.log("");
  console.log("Resume snapshot:");
  renderResumeReport(report);
}

module.exports = {
  resume,
  entry,
  onboarding,
  buildResumeReport,
  buildSessionEntryRoute,
  buildTrackContext,
  readOnboardingReport
};

const { fileExists } = require("../fs_utils");
const { readJsonFile } = require("../workspace");
const { taskWorkstreams } = require("./dashboard_state");
const { locksOverlap } = require("./lock");

function release(action, value, flags = {}, deps = {}) {
  const {
    findPlan,
    validateRepository,
    countIssues,
    outputLines,
    buildReadinessReport,
    buildReleaseChecklist,
    buildReleaseNotes,
    buildScenarioReview,
    previewPolicyGate,
    runPolicyGate,
    runReleasePublishGates,
    publishGithubRelease
  } = deps;
  const version = flags.version || value || "v4.0.0";
  const plan = findPlan(version);

  if (!action || action === "check") {
    const validation = validateRepository("all");
    const readiness = buildReadinessReport ? buildReadinessReport({ target: "release" }) : null;
    const releaseGate = previewPolicyGate("release", { version: plan.version, confirm: false }, flags);
    const releaseBlocked = releaseGate.status === "blocked";
    const validationBlocked = !validation.ok;
    const validationWarnings = validation.lines.some((line) => line.startsWith("WARN"));
    const releaseWarnings = releaseGate.status === "warning";
    const readinessBlocked = readiness ? readiness.status === "blocked" : false;
    const readinessWarnings = readiness ? readiness.status === "warning" : false;
    const needsAttention = validationWarnings || releaseWarnings || readinessWarnings;
    const readinessLabel = readiness ? (readiness.blockers.length ? readiness.status.toUpperCase() : "READY") : "UNAVAILABLE";
    const releaseGateLabel = releaseGate.status === "warning" ? "PASS" : releaseGate.status.toUpperCase();
    const lines = [
      `Release check for ${plan.version}`,
      `Source: ${plan.file}`,
      `Milestones: ${plan.data.milestones.length}/${plan.data.totals.milestones}`,
      `Issues: ${countIssues(plan.data)}/${plan.data.totals.issues}`,
      `Validation: ${validation.ok ? "OK" : "FAILED"}`,
      `Readiness: ${readinessLabel}`,
      `Release gate: ${releaseGateLabel}`,
      "",
      "## Readiness",
      ...(readiness ? [
        `Status: ${readiness.status}`,
        ...(readiness.blockers.length
          ? ["", "### Blockers", ...readiness.blockers.map((item) => `- ${item}`)]
          : []),
        ...(readiness.warnings.length
          ? ["", "### Warnings", ...readiness.warnings.map((item) => `- ${item}`)]
          : [])
      ] : ["Readiness report unavailable."]),
      "",
      "## Validation",
      ...validation.lines,
      "",
      "## Release Gate",
      `Policy: ${releaseGate.policy_id}`,
      `Subject: ${releaseGate.subject_id}`,
      `Status: ${releaseGate.status}`,
      ...(releaseGate.blockers.length
        ? ["", "### Blockers", ...releaseGate.blockers.map((item) => `- ${formatPolicyGateFinding(item)}`)]
        : []),
      ...(releaseGate.warnings.length
        ? ["", "### Warnings", ...releaseGate.warnings.map((item) => `- ${formatPolicyGateFinding(item)}`)]
        : []),
      "",
      `Status: ${validationBlocked || readinessBlocked || releaseBlocked ? "blocked by validation, readiness, or release policy failures" : needsAttention ? "needs attention before release" : "ready for release review"}`
    ];
    if (flags.strict && (validationBlocked || readinessBlocked || releaseBlocked || needsAttention)) process.exitCode = 1;
    return outputLines(lines, flags.output);
  }

  if (action === "checklist") {
    return outputLines(buildReleaseChecklist(plan), flags.output);
  }

  if (action === "notes") {
    return outputLines(buildReleaseNotes(plan), flags.output);
  }

  if (action === "scenario" || action === "scenario-review") {
    return outputLines(buildScenarioReview(plan), flags.output);
  }

  if (action === "gate") {
    const result = runPolicyGate("release", { version: plan.version, confirm: true }, flags);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "publish-gate" || action === "publish-gates") {
    const result = runReleasePublishGates(plan, flags);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "publish") {
    if (!flags.confirm) {
      const lines = [
        `Release publish dry-run for ${plan.version}`,
        `Would run: gh release create ${plan.version} --title "Kabeeri VDF ${plan.version}" --notes-file <generated-notes>`,
        "",
        "No remote GitHub changes were made. Add --confirm to publish."
      ];
      return outputLines(lines, flags.output);
    }
    return publishGithubRelease(plan, flags);
  }

  throw new Error(`Unknown release action: ${action}`);
}

function formatPolicyGateFinding(item) {
  const detail = item.evidence || item.description || item.result || "";
  return detail ? `${item.check_id}: ${detail}` : item.check_id;
}

function buildReleaseChecklist(plan) {
  const lines = [
    `# ${plan.version} Release Checklist`,
    "",
    `Source: ${plan.file}`,
    "",
    "## Milestones"
  ];

  for (const milestone of plan.data.milestones) {
    lines.push("", `- [ ] ${milestone.title}`, `  Goal: ${milestone.goal}`);
    for (const issue of milestone.issues || []) {
      lines.push(`  - [ ] ${issue.title}`);
    }
  }

  lines.push("", "## Final Gate", "", "- [ ] Owner verified release readiness", "- [ ] Release readiness report is clear", "- [ ] Release policy gate passes without blockers", "- [ ] Security and migration blockers are clear", "- [ ] GitHub dry-run reviewed", "- [ ] Release notes reviewed", "- [ ] Tag and release approved");
  return lines;
}

function buildReleaseNotes(plan) {
  const lines = [
    `# Kabeeri VDF ${plan.version} Release Notes`,
    "",
    "## Summary",
    "",
    `${plan.version} includes ${plan.data.totals.milestones} planned milestones and ${plan.data.totals.issues} planned issues.`,
    "",
    "## Highlights"
  ];

  for (const rule of plan.data.rules || []) {
    lines.push(`- ${rule}`);
  }

  lines.push("", "## Milestones");
  for (const milestone of plan.data.milestones) {
    lines.push("", `### ${milestone.title}`, "", milestone.goal, "");
    for (const issue of milestone.issues || []) {
      lines.push(`- ${issue.title}`);
    }
  }

  lines.push("", "## Limitations", "", "- Runtime enforcement may still require future CLI, dashboard, VS Code, or GitHub write integration work.", "- GitHub write operations must remain dry-run until explicit confirmation support is implemented.", "- Owner approval is required before publishing the official release.");
  return lines;
}

function buildScenarioReview(plan) {
  const hasWorkspace = fileExists(".kabeeri");
  const tasks = hasWorkspace && fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const locks = hasWorkspace && fileExists(".kabeeri/locks.json") ? readJsonFile(".kabeeri/locks.json").locks || [] : [];
  const agents = hasWorkspace && fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  const developers = hasWorkspace && fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const activeOwners = developers.filter((item) => item.role === "Owner" && item.status !== "inactive");
  const workstreams = ["backend", "public_frontend", "admin_frontend"];
  const lines = [
    `# ${plan.version} Multi-AI Collaboration Scenario Review`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Scenario",
    "",
    "- Backend developer/agent works on backend tasks.",
    "- Public frontend developer/agent works on public frontend tasks.",
    "- Admin frontend developer/agent works on admin frontend tasks.",
    "- Owner performs final verification.",
    "",
    "## Workspace Findings"
  ];

  if (!hasWorkspace) {
    lines.push("", "No `.kabeeri` workspace found. Run `kvdf init` to review a real local scenario.");
    return lines;
  }

  lines.push(
    "",
    `Owners: ${activeOwners.length}`,
    `Agents: ${agents.length}`,
    `Tasks: ${tasks.length}`,
    `Active locks: ${locks.filter((lockItem) => lockItem.status === "active").length}`,
    ""
  );

  for (const stream of workstreams) {
    const streamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).includes(stream));
    const streamAgents = agents.filter((agent) => (agent.workstreams || []).map((item) => String(item).toLowerCase()).includes(stream));
    lines.push(`- ${stream}: ${streamTasks.length} tasks, ${streamAgents.length} agents`);
  }

  const risks = [];
  if (activeOwners.length !== 1) risks.push(`Expected exactly one active Owner, found ${activeOwners.length}.`);
  for (const taskItem of tasks.filter((item) => ["assigned", "in_progress", "review"].includes(item.status))) {
    if (!taskItem.assignee_id) risks.push(`Task ${taskItem.id} is ${taskItem.status} without assignee.`);
    const hasLock = locks.some((lockItem) => lockItem.task_id === taskItem.id && lockItem.status === "active");
    if (!hasLock && taskItem.status === "in_progress") risks.push(`Task ${taskItem.id} is in progress without active lock.`);
  }
  for (let index = 0; index < locks.length; index += 1) {
    for (let other = index + 1; other < locks.length; other += 1) {
      if (locks[index].status === "active" && locks[other].status === "active" && locksOverlap(locks[index], locks[other])) {
        risks.push(`Lock overlap: ${locks[index].lock_id} overlaps ${locks[other].lock_id}.`);
      }
    }
  }

  lines.push("", "## Risks", "");
  if (risks.length === 0) lines.push("No scenario risks detected.");
  else lines.push(...risks.map((risk) => `- ${risk}`));
  return lines;
}

function countIssues(planData) {
  return (planData.milestones || []).reduce((sum, milestone) => sum + (milestone.issues || []).length, 0);
}

module.exports = {
  release,
  buildReleaseChecklist,
  buildReleaseNotes,
  buildScenarioReview,
  countIssues
};

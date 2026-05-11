function github(action, value, flags = {}, deps = {}) {
  const {
    githubConfig,
    findPlan,
    printGithubDryRun,
    printGithubLabels,
    printGithubMilestones,
    printGithubIssues,
    releaseCommand,
    getReleaseCommandDeps,
    runGithubWriteGate,
    syncGithubLabels,
    syncGithubMilestones,
    syncGithubIssues,
    runReleasePublishGates,
    publishGithubRelease
  } = deps;

  if (action === "config") {
    return githubConfig(value, flags);
  }
  const subaction = value;
  const version = flags.version || "v4.0.0";
  const plan = findPlan(version);
  const confirmed = Boolean(flags.confirm);

  if (!confirmed || flags["dry-run"]) {
    if (!action || action === "plan") {
      return printGithubDryRun(plan, flags);
    }

    if (action === "label" && (!subaction || subaction === "sync")) {
      return printGithubLabels(plan, flags);
    }

    if (action === "milestone" && (!subaction || subaction === "sync")) {
      return printGithubMilestones(plan, flags);
    }

    if (action === "issue" && (!subaction || subaction === "sync")) {
      return printGithubIssues(plan, flags);
    }

    if (action === "release" && (!subaction || subaction === "prepare")) {
      return releaseCommand("notes", version, { ...flags, stdout: true }, getReleaseCommandDeps());
    }

    throw new Error(`Unknown GitHub dry-run command: github ${action} ${subaction || ""}`.trim());
  }

  if (action === "label" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubLabels(plan);
  }

  if (action === "milestone" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubMilestones(plan);
  }

  if (action === "issue" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubIssues(plan);
  }

  if (action === "release" && subaction === "publish") {
    runReleasePublishGates(plan, flags);
    return publishGithubRelease(plan, { ...flags, publishGatesPassed: true });
  }

  throw new Error(`Unknown confirmed GitHub command: github ${action} ${subaction || ""}`.trim());
}

module.exports = {
  github
};

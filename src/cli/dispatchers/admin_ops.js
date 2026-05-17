const { handled } = require("./shared");

function dispatchAdminOpsCommands({ group, action, value, flags, rest, c }) {
  if (group === "acceptance") return handled(c.acceptance(action, value, flags, { requireAnyRole: c.requireAnyRole, appendAudit: c.appendAudit }));
  if (group === "vscode") return handled(c.vscode(action, value, flags));
  if (group === "docs" || group === "doc") return handled(c.docsSite(action, value, flags));
  if (group === "source-package" || group === "source_package" || group === "sourcepackage") return handled(c.sourcePackage(action, value, flags, rest));
  if (group === "software-design") return handled(c.softwareDesignReference(action, value, flags));
  if (group === "docs-generator") return handled(c.documentationGenerator(action, value, flags));
  if (group === "release") return handled(c.release(action, value, flags, c.getReleaseCommandDeps()));
  if (group === "github") return handled(c.github(action, value, flags, {
    githubConfig: c.githubConfig,
    findPlan: c.findPlan,
    printGithubDryRun: c.printGithubDryRun,
    printGithubLabels: c.printGithubLabels,
    printGithubMilestones: c.printGithubMilestones,
    printGithubIssues: c.printGithubIssues,
    releaseCommand: c.release,
    getReleaseCommandDeps: c.getReleaseCommandDeps,
    runGithubWriteGate: c.runGithubWriteGate,
    syncGithubLabels: c.syncGithubLabels,
    syncGithubMilestones: c.syncGithubMilestones,
    syncGithubIssues: c.syncGithubIssues,
    runReleasePublishGates: c.runReleasePublishGates,
    publishGithubRelease: c.publishGithubRelease,
    appendAudit: c.appendAudit
  }));
  if (group === "sync" || group === "team-sync") return handled(c.sync(action, value, flags));
  if (group === "package" || group === "packaging") return handled(c.productPackage(action, value, flags));
  if (group === "upgrade") return handled(c.upgrade(action, value, flags));
  return null;
}

module.exports = {
  dispatchAdminOpsCommands
};

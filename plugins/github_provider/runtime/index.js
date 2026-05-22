const provider = require("./provider");
const readiness = require("./readiness");
const syncPlan = require("./sync_plan");
const issues = require("./issues");
const pullRequests = require("./pull_requests");
const releases = require("./releases");
const handoff = require("./handoff");
const plannerAdapter = require("./planner_adapter");

module.exports = {
  getPluginStatus: provider.getPluginStatus,
  runGithubProvider: provider.runGithubProvider,
  buildGithubProviderStatus: provider.buildGithubProviderStatus,
  buildGithubProviderReadiness: readiness.buildGithubProviderReadiness,
  buildGithubSyncPlan: syncPlan.buildGithubSyncPlan,
  buildGithubIssuePlan: issues.buildGithubIssuePlan,
  buildGithubPrPlan: pullRequests.buildGithubPrPlan,
  buildGithubReleasePlan: releases.buildGithubReleasePlan,
  buildGithubHandoffPlan: handoff.buildGithubHandoffPlan,
  buildGithubPlannerProviderSummary: plannerAdapter.buildGithubPlannerProviderSummary,
  buildGithubTeamStatus: provider.buildGithubTeamStatus,
  buildGithubIntegrationReport: provider.buildGithubIntegrationReport,
  buildGithubTeamFeedbackReport: provider.buildGithubTeamFeedbackReport,
  buildGithubIntegrationActions: provider.buildGithubIntegrationActions,
  buildGithubTeamStatusActions: provider.buildGithubTeamStatusActions,
  buildGithubIssueBody: provider.buildGithubIssueBody,
  buildGithubReleaseNotes: provider.buildGithubReleaseNotes,
  githubConfig: provider.githubConfig,
  printGithubDryRun: provider.printGithubDryRun,
  printGithubLabels: provider.printGithubLabels,
  printGithubMilestones: provider.printGithubMilestones,
  printGithubIssues: provider.printGithubIssues,
  syncGithubLabels: provider.syncGithubLabels,
  syncGithubMilestones: provider.syncGithubMilestones,
  syncGithubIssues: provider.syncGithubIssues,
  publishGithubRelease: provider.publishGithubRelease,
  recordGithubTeamFeedback: provider.recordGithubTeamFeedback,
  readGithubSyncConfig: provider.readGithubSyncConfig,
  readGithubIssueMap: provider.readGithubIssueMap,
  readGithubTeamFeedback: provider.readGithubTeamFeedback,
  readGitRemoteUrls: provider.readGitRemoteUrls,
  isGithubRemoteUrl: provider.isGithubRemoteUrl,
  hasGhCli: provider.hasGhCli,
  ensureGithubWorkspace: provider.ensureGithubWorkspace,
  isTeamGithubMode: provider.isTeamGithubMode,
  normalizeFeedbackType: provider.normalizeFeedbackType
};

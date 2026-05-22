const { githubProvider, loadGithubProviderRuntime, buildUnavailableGithubProviderReport } = require("./github_provider");

function github(action, value, flags = {}, rest = [], deps = {}) {
  const runtime = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadGithubProviderRuntime();
  if (!runtime || typeof runtime.runGithubProvider !== "function") {
    const report = buildUnavailableGithubProviderReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  return runtime.runGithubProvider(action, value, { ...flags, compatibility_surface: true }, rest, {
    ...deps,
    runGithubWriteGate: deps.runGithubWriteGate,
    runReleasePublishGates: deps.runReleasePublishGates
  });
}

module.exports = {
  github
};

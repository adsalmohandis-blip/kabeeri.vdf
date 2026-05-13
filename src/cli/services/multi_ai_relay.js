const fs = require("fs");
const path = require("path");

function watchMultiAiRelay(stateFile, options = {}, deps = {}) {
  const emit = typeof deps.emit === "function" ? deps.emit : console.log;
  const clear = typeof deps.clear === "function" ? deps.clear : (typeof console.clear === "function" ? console.clear.bind(console) : null);
  const sleep = typeof deps.sleep === "function" ? deps.sleep : (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy wait fallback for terminal usage when no sleep helper is injected.
    }
  };
  const renderReport = typeof deps.renderReport === "function"
    ? deps.renderReport
    : defaultRenderReport;
  const readReport = typeof deps.readReport === "function"
    ? deps.readReport
    : () => {
        const buildReport = typeof deps.buildReport === "function" ? deps.buildReport : null;
        if (buildReport) {
          const readJsonFile = typeof deps.readJsonFile === "function" ? deps.readJsonFile : defaultReadJsonFile;
          const state = readJsonFile(stateFile);
          return buildReport(state);
        }
        return {};
      };

  const iterations = options.iterations === undefined || options.iterations === null || options.iterations === ""
    ? Infinity
    : Math.max(1, Number(options.iterations) || 1);
  const interval = options.interval === undefined || options.interval === null || options.interval === ""
    ? 2000
    : Math.max(0, Number(options.interval) || 0);

  let renderCount = 0;
  let lastSnapshot = null;

  for (let index = 0; index < iterations; index += 1) {
    const report = readReport();
    const snapshot = JSON.stringify({
      inbox: report.inbox || [],
      dispatch_board: report.dispatch_board || []
    });

    if (renderCount === 0 || snapshot !== lastSnapshot) {
      if (renderCount > 0 && clear) clear();
      emit(renderReport({ ...report, render_mode: "watch" }));
      renderCount += 1;
      lastSnapshot = snapshot;
    }

    if (index + 1 < iterations && interval > 0) {
      sleep(interval);
    }
  }

  return {
    report_type: "multi_ai_relay_watch",
    render_count: renderCount
  };
}

function defaultReadJsonFile(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function defaultRenderReport(report) {
  const lines = [
    report && report.render_mode === "watch" ? "Multi-AI Relay Watch" : "Multi-AI Relay",
    "",
    `Pending inbox messages: ${report.counts && typeof report.counts.inbox_messages === "number" ? report.counts.inbox_messages : 0}`,
    `Dispatch threads: ${report.counts && typeof report.counts.dispatch_threads === "number" ? report.counts.dispatch_threads : 0}`,
    `Open conversations: ${Array.isArray(report.open_threads) ? report.open_threads.length : 0}`,
    "",
    "Inbox:"
  ];
  for (const message of Array.isArray(report.inbox) ? report.inbox : []) {
    lines.push(`- [${message.conversation_id}] ${message.to_agent_id} <- ${message.from_agent_id}: ${message.body}`);
  }
  if (!Array.isArray(report.inbox) || !report.inbox.length) lines.push("- none");
  lines.push("", "Dispatch board:");
  for (const thread of Array.isArray(report.dispatch_board) ? report.dispatch_board : []) {
    lines.push(`- [${thread.conversation_id}] ${thread.topic} (${thread.pending_messages} pending)`);
  }
  if (!Array.isArray(report.dispatch_board) || !report.dispatch_board.length) lines.push("- none");
  return lines.join("\n");
}

module.exports = {
  watchMultiAiRelay
};

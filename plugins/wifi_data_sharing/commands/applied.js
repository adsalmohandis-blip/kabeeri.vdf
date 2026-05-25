const apply = require("./apply");

function wifiDataSharingApplied(action, value, flags = {}, rest = []) {
  void action;
  void value;
  void rest;
  const report = apply.buildAppliedReport();
  outputReport(report, flags);
  return report;
}

function buildAppliedReport(options = {}) {
  void options;
  return apply.buildAppliedReport(options);
}

function outputReport(report, flags) {
  if (flags && flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(apply.renderApplyText(report));
}

module.exports = {
  wifiDataSharingApplied,
  buildAppliedReport
};

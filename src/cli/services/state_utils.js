const { fileExists } = require("../fs_utils");
const { readJsonFile } = require("../workspace");

function readStateArray(file, key) {
  if (!fileExists(file)) return [];
  return readJsonFile(file)[key] || [];
}

function summarizeBy(items, key) {
  return (items || []).reduce((summary, item) => {
    const value = item && item[key] ? item[key] : "unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

module.exports = {
  readStateArray,
  summarizeBy
};

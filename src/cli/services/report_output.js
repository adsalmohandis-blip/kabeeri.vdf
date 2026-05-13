const { writeTextFile } = require("../fs_utils");

function objectLines(object) {
  return Object.entries(object || {}).map(([key, value]) => `- ${key}: ${value}`);
}

function recordLines(records, formatter) {
  return records.length ? records.map((item) => `- ${formatter(item)}`) : ["None."];
}

function outputLines(lines, outputPath) {
  const content = `${lines.join("\n")}\n`;
  if (outputPath && outputPath !== true) {
    writeTextFile(outputPath, content);
    console.log(`Wrote ${outputPath}`);
    return;
  }
  console.log(content.trimEnd());
}

module.exports = {
  objectLines,
  outputLines,
  recordLines
};

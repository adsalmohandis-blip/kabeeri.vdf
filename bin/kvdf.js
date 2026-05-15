#!/usr/bin/env node

const { createCliRunner } = require("../src/core/bootstrap");

try {
  const { run } = createCliRunner();
  const result = run(process.argv.slice(2));
  if (result && typeof result.then === "function") {
    result.catch((error) => {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    });
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}

const command = require("../../src/cli/commands/ai_learning");
const runtime = require("./runtime");

module.exports = {
  plugin_id: "ai-learning",
  name: "AI Learning",
  command_entrypoint: "plugins/ai_learning/bootstrap.js",
  runtime_entrypoint: "plugins/ai_learning/runtime/index.js",
  aiLearning: command.aiLearning,
  command: command.aiLearning,
  runtime,
  readAiLearningState: runtime.readAiLearningState,
  writeAiLearningState: runtime.writeAiLearningState,
  summarizeAiLearningState: runtime.summarizeAiLearningState,
  buildAiLearningPromptContext: runtime.buildAiLearningPromptContext,
  exportLearningState: runtime.exportLearningState,
  importLearningState: runtime.importLearningState,
  promoteLearningEntry: runtime.promoteLearningEntry,
  reviewLearningCandidates: runtime.reviewLearningCandidates,
  rejectLearningCandidate: runtime.rejectLearningCandidate,
  handleLearningCache: runtime.handleLearningCache,
  buildSharedLearningPayload: runtime.buildSharedLearningPayload,
  buildCloudReadyMetadata: runtime.buildCloudReadyMetadata
};

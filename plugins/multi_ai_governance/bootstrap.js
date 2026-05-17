const governance = require("./commands/multi_ai_governance");
const communications = require("./commands/multi_ai_communications");

module.exports = {
  plugin_id: "multi_ai_governance",
  name: "Multi-AI Governance Bundle",
  command_entrypoint: "plugins/multi_ai_governance/bootstrap.js",
  runtime_entrypoint: null,
  multiAiGovernance: governance.multiAiGovernance,
  multiAiCommunications: communications.multiAiCommunications,
  governance,
  communications
};

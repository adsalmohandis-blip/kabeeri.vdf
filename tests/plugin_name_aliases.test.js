const assert = require("assert");
const { normalizeCommandName } = require("../src/cli/ui");
const { findPluginById } = require("../src/cli/services/plugin_loader");

const commandAliases = {
  blog_builder: "blog",
  crm_builder: "crm",
  company_profile_builder: "company-profile",
  news_website_builder: "news-website",
  pos_builder: "pos"
};

for (const [alias, canonical] of Object.entries(commandAliases)) {
  assert.strictEqual(normalizeCommandName(alias), canonical, `Expected ${alias} to normalize to ${canonical}`);
  const plugin = findPluginById(alias);
  assert.strictEqual(plugin.plugin_id, canonical, `Expected ${alias} to resolve to plugin ${canonical}`);
}

console.log("plugin_name_aliases.test.js passed");

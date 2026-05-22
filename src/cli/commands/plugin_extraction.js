function pluginExtraction(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const mode = normalizeAction(action);
  if (!mode || mode === "audit") {
    const report = buildCorePluginExtractionAudit();
    outputReport(report, flags);
    return;
  }
  throw new Error(`Unknown plugin-extraction action: ${action}`);
}

function buildCorePluginExtractionAudit() {
  const coreKeep = [
    coreItem("planner", "Planner contracts", "Keep the orchestrator, proposal, approval, prompt, visual, review, and materialize contracts in Core.", "keep_core", "foundation"),
    coreItem("task", "Task lifecycle", "Keep task lifecycle governance in Core because tasks are the unit of execution and validation.", "keep_core", "foundation"),
    coreItem("evolution", "Evolution lifecycle", "Keep evolution lifecycle governance in Core because it links roadmap, approval, and delivery sequencing.", "keep_core", "foundation"),
    coreItem("truth", "Truth policy", "Keep truth policy in Core so file-first state remains the source of truth.", "keep_core", "foundation"),
    coreItem("current-state", "Current-state policy", "Keep current-state policy in Core so the planner always reads the live workspace.", "keep_core", "foundation"),
    coreItem("boundary-policy", "Boundary policy", "Keep boundary policy in Core so Core and plugin responsibilities stay separated.", "keep_core", "foundation"),
    coreItem("validation", "Validation", "Keep the validation runner and schema checks in Core so every plugin stays governed.", "keep_core", "foundation"),
    coreItem("plugin-loader", "Plugin loader", "Keep plugin discovery, enablement, and manifest loading in Core.", "keep_core", "foundation"),
    coreItem("runtime-schemas", "Runtime schemas", "Keep runtime schemas in Core so plugin outputs stay contract-driven.", "keep_core", "foundation"),
    coreItem("source-control-abstraction", "Source-control abstraction", "Keep source-control abstraction in Core so plugins do not own repository mutation behavior.", "keep_core", "foundation"),
    coreItem("security-gate-contract", "Security gate contract", "Keep security gate contracts in Core to preserve safety and policy ordering.", "keep_core", "foundation"),
    coreItem("dashboard-state-contracts", "Dashboard state contracts", "Keep dashboard state contracts in Core because they anchor owner and Viber surfaces.", "keep_core", "foundation"),
    coreItem("handoff-release-contracts", "Handoff/release contracts", "Keep handoff and release contracts in Core so delivery governance remains central.", "keep_core", "foundation"),
    coreItem("policy-gate-contracts", "Policy gate contracts", "Keep policy gate contracts in Core to preserve owner-track decisioning.", "keep_core", "foundation"),
    coreItem("repository-structure", "Repository structure", "Keep repository structure and folder governance in Core as the repo-wide layout contract.", "keep_core", "foundation")
  ];

  const doNotMove = [
    doNotMoveItem("planner", "Planner contracts", "These are the orchestrator contracts that all plugin extraction phases depend on."),
    doNotMoveItem("validation", "Validation", "Validation must remain in Core because it protects every downstream plugin."),
    doNotMoveItem("plugin-loader", "Plugin loader", "Plugin loading is the Core control plane for optional bundles."),
    doNotMoveItem("runtime-schemas", "Runtime schemas", "Core schemas are the contract boundary for plugin outputs."),
    doNotMoveItem("source-control-abstraction", "Source-control abstraction", "Repo mutation belongs in the Core abstraction layer."),
    doNotMoveItem("security-gate-contract", "Security gate contract", "Security policy must remain Core-owned."),
    doNotMoveItem("dashboard-state-contracts", "Dashboard state contracts", "Dashboard state contracts must remain governed by Core."),
    doNotMoveItem("handoff-release-contracts", "Handoff/release contracts", "Release and handoff gates are part of Core governance."),
    doNotMoveItem("policy-gate-contracts", "Policy gate contracts", "Policy gates must stay Core-owned."),
    doNotMoveItem("repository-structure", "Repository structure", "Repo layout governance is a Core concern.")
  ];

  const pluginCandidates = [
    candidate("bootstrap_ui", "package dependency", "bootstrap_ui", "high", "Bootstrap is a Core package dependency today and should become a removable local asset provider plugin.", "Leaving Bootstrap hard-wired in Core keeps dashboard rendering coupled to a UI library.", 1, "provider_plugin_candidate", "bootstrap_ui"),
    candidate("tailwind_ui", "package devDependency", "tailwind_ui", "high", "Tailwind devDependencies should move into a removable guidance-only plugin so Core stays framework-neutral.", "Keeping Tailwind in Core preserves a build-time UI dependency that is not required for Core governance.", 2, "provider_plugin_candidate", "tailwind_ui"),
    candidate("ui_dashboard_kits", "knowledge/design_system/ui_execution_kit", "ui_dashboard_kits", "high", "The UI execution kit owns active dashboard examples, templates, snippets, and check rules that should be plugin-owned.", "Leaving dashboard examples and checkers inside Core keeps UI surfaces tied to internal knowledge folders.", 3, "ui_plugin_candidate", "ui_dashboard_kits"),
    candidate("viber_app_builders", "core app-builder bundle", "viber_app_builders", "medium", "Group the Viber-facing app builders so product-specific scaffolds can move out of Core together.", "Splitting app builders too early can fragment shared planning vocabulary if the migration is not sequenced.", 4, "domain_builder_plugin_candidate", "company_profile, news_website, blog, ecommerce_mobile_app, crm, pos, ecommerce, booking"),
    candidate("company_profile", "existing plugin bundle", "company_profile", "low", "Company profile builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "company_profile"),
    candidate("news_website", "existing plugin bundle", "news_website", "low", "News website builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "news_website"),
    candidate("blog", "existing plugin bundle", "blog", "low", "Blog builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "blog"),
    candidate("ecommerce_mobile_app", "existing plugin bundle", "ecommerce_mobile_app", "low", "Mobile ecommerce builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "ecommerce_mobile_app"),
    candidate("crm", "existing plugin bundle", "crm", "low", "CRM builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "crm"),
    candidate("pos", "existing plugin bundle", "pos", "low", "POS builders are already separable and can remain on the plugin track.", "This surface already has a plugin bundle, so the audit should only verify that Core no longer depends on it.", 4, "already_plugin", "pos"),
    candidate("ecommerce", "existing plugin bundle", "ecommerce", "medium", "Ecommerce builders should be normalized into a plugin-owned domain builder surface.", "Core-facing ecommerce scaffolding can become a duplicated implementation surface if it stays in Core too long.", 4, "move_to_plugin_later", "ecommerce_builder"),
    candidate("booking", "existing plugin bundle", "booking", "medium", "Booking builders should remain plugin-owned and isolated from the Core orchestrator.", "Booking-specific UI and workflow scaffolds should not drift back into Core.", 4, "already_plugin", "booking_builder"),
    candidate("wordpress_builder", "Core wordpress command surface", "wordpress", "high", "WordPress capability surfaces should be isolated into a removable builder plugin.", "WordPress support is a platform builder concern and should not remain a direct Core responsibility.", 5, "domain_builder_plugin_candidate", "wordpress"),
    candidate("github_provider", "Core provider integration surface", "github", "high", "GitHub provider logic belongs in a removable provider plugin so Core keeps source-control abstraction only.", "Provider-specific integration logic can increase risk if it remains embedded in Core command flow.", 6, "provider_plugin_candidate", "github"),
    candidate("docs_site", "Core docs/site tooling", "docs_site", "medium", "Docs site publishing tools should become a plugin or optional tooling layer.", "Docs-site publishing can be heavyweight and should not be required for Core validation.", 7, "docs_tool_plugin_candidate", "docs_site"),
    candidate("source_package", "Core docs/site tooling", "source_package", "medium", "Source-package tooling should remain auditable but move toward a plugin or documentation utility surface.", "Large documentation packaging logic can balloon Core if it stays tightly coupled.", 7, "docs_tool_plugin_candidate", "source_package"),
    candidate("multi_ai_governance", "Core multi-AI governance surface", "multi_ai_governance", "medium", "Multi-AI governance implementation should become an optional plugin-backed implementation layer.", "Governance implementation logic can stay in Core as a policy contract while the concrete surface moves out.", 8, "provider_plugin_candidate", "multi_ai_governance"),
    candidate("multi_ai_communications", "Core multi-AI communication surface", "multi_ai_communications", "medium", "Multi-AI communications should move into an optional plugin so messaging transport stays removable.", "Communication orchestration can become unnecessary Core complexity if kept inline.", 8, "move_to_plugin_later", "multi_ai_communications"),
    candidate("vscode", "Core editor bridge surface", "vscode", "medium", "VS Code helpers should become a plugin so editor integration remains optional.", "Editor-specific scaffolding can be removed without affecting Core planning and validation.", 9, "docs_tool_plugin_candidate", "vscode"),
    candidate("generator", "Core scaffold surface", "generator", "medium", "Generator behavior should be plugin-bound so scaffold choices are opt-in rather than Core mandatory.", "Scaffold generation in Core can blur the distinction between orchestration and asset creation.", 10, "domain_builder_plugin_candidate", "generator")
  ];

  const recommendedOrder = pluginCandidates
    .filter((item) => typeof item.phase === "number")
    .sort((left, right) => left.phase - right.phase || left.candidate_id.localeCompare(right.candidate_id))
    .map((item) => ({
      phase: item.phase,
      candidate_id: item.candidate_id,
      recommended_plugin: item.recommended_plugin,
      classification: item.classification
    }));

  return {
    report_type: "kvdf_core_plugin_extraction_audit",
    status: "warning",
    core_keep: coreKeep,
    plugin_candidates: pluginCandidates,
    do_not_move: doNotMove,
    recommended_order: recommendedOrder,
    next_action: "Start Phase 1: bootstrap_ui extraction."
  };
}

function coreItem(itemId, title, reason, classification, category) {
  return {
    item_id: itemId,
    title,
    reason,
    category,
    classification
  };
}

function doNotMoveItem(itemId, title, reason) {
  return {
    item_id: itemId,
    title,
    reason,
    classification: "keep_core"
  };
}

function candidate(candidateId, currentSurface, recommendedPlugin, priority, reason, risk, phase, classification, surfaces = recommendedPlugin) {
  return {
    candidate_id: candidateId,
    current_surface: currentSurface,
    recommended_plugin: recommendedPlugin,
    priority,
    reason,
    risk,
    phase,
    classification,
    surfaces
  };
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (!value || value === "audit") return "audit";
  return value;
}

function outputReport(report, flags) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderAuditText(report));
}

function renderAuditText(report) {
  const lines = [
    "KVDF Core Plugin Extraction Audit",
    `Status: ${report.status}`,
    `Next action: ${report.next_action}`,
    "",
    "Core keep:",
    ...report.core_keep.map((item) => `- ${item.item_id}: ${item.title}`),
    "",
    "Plugin candidates:",
    ...report.plugin_candidates.map((item) => `- ${item.candidate_id} (${item.classification}) -> ${item.recommended_plugin}`)
  ];
  return lines.join("\n");
}

module.exports = {
  pluginExtraction,
  buildCorePluginExtractionAudit
};

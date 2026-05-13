const fs = require("fs");
const path = require("path");
const { repoRoot, fileExists, readJsonFile, writeJsonFile, assertSafeName } = require("./fs_utils");
const { DEFAULT_RETENTION_DAYS } = require("./services/task_trash");

function getStateDir() {
  return ".kabeeri";
}

function ensureWorkspace() {
  if (!fileExists(getStateDir())) {
    throw new Error("No .kabeeri workspace found. Run `kvdf init` first.");
  }
}

function createWorkspace({ profile, mode, lang }) {
  const root = repoRoot();
  const stateDir = path.join(root, getStateDir());
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(path.join(stateDir, "dashboard"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "github"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_usage"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "questionnaires"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "memory"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "adr"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_runs"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "policies"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "events"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "approvals"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "migrations"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "security"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "handoff"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "design_sources"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "interactions"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "reports"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "prompt_layer"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "plugins"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "metadata"), { recursive: true });
  fs.mkdirSync(path.join(root, "workspaces"), { recursive: true });
  fs.mkdirSync(path.join(root, "workspaces", "apps"), { recursive: true });
  fs.mkdirSync(path.join(root, "plugins", "owner-track"), { recursive: true });
  fs.mkdirSync(path.join(root, "plugins", "owner-track", "docs"), { recursive: true });

  const files = [
    ["project.json", {
      framework: "Kabeeri VDF",
      project_scope: "single_product_multi_app",
      product_name: "",
      forbid_unrelated_apps: true,
      profile,
      delivery_mode: mode,
      language: lang,
      version: "0.1.0",
      created_at: new Date().toISOString()
    }],
    ["project_profile.json", {
      version: "v1",
      recommendations: [],
      current_recommendation_id: null,
      current_profile: profile,
      current_delivery_mode: mode,
      selected_prompt_packs: [],
      intake_groups: [],
      updated_at: new Date().toISOString()
    }],
    ["delivery_mode.json", {
      mode,
      enabled_agile_features: mode === "agile",
      version: "1.1.0"
    }],
    ["tasks.json", { tasks: [] }],
    ["task_assessments.json", { version: "v1", assessments: [], updated_at: null }],
    ["task_trash.json", { trash: [], retention_days: DEFAULT_RETENTION_DAYS, last_sweep_at: null }],
    ["customer_apps.json", { apps: [] }],
    ["features.json", { features: [] }],
    ["journeys.json", { journeys: [] }],
    ["version_compatibility.json", { created_with_version: "0.1.0", current_engine_version: "0.1.0", compatibility_status: "current", migration_required: false, last_migration: null }],
    ["migration_state.json", { phase: "none", pending_migration: null, last_migration: null, rollback_available: false, migration_risks: [] }],
    ["sprints.json", { sprints: [] }],
    ["delivery_decisions.json", { recommendations: [], decisions: [], current_mode: mode || "structured" }],
    ["product_blueprints.json", { selected_blueprints: [], recommendations: [], current_blueprint: null }],
    ["data_design.json", { contexts: [], reviews: [], current_context: null }],
    ["wordpress.json", { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null }],
    ["evolution.json", { changes: [], impact_plans: [], current_change_id: null }],
    ["agile.json", { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] }],
    ["structured.json", { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] }],
    ["sessions.json", { sessions: [] }],
    ["developers.json", { developers: [] }],
    ["agents.json", { agents: [] }],
    ["developer_mode.json", { mode: "unset", solo_developer_id: null, workstreams: [] }],
    ["workstreams.json", { workstreams: defaultWorkstreams() }],
    ["owner_auth.json", { configured: false }],
    ["owner_docs_tokens.json", { version: "v1", tokens: [], updated_at: null }],
    ["owner_transfer_tokens.json", { tokens: [] }],
    ["session.json", { active: false }],
    ["session_track.json", { active: false, active_track: null, role_gate: "setup_required", activated_features: [], blocked_features: [], activated_at: null, updated_at: null }],
    ["multi_ai_communications.json", { version: "v1", relay_policy: { response_deadline_seconds: 300, ack_required: true, visible_to_owner: false }, conversations: [], audit_trail: [], updated_at: null }],
    ["locks.json", { locks: [] }],
    ["acceptance.json", { records: [] }],
    ["tokens.json", { tokens: [] }],
    ["questionnaires/answers.json", { answers: [] }],
    ["questionnaires/answer_sources.json", { sources: [] }],
    ["questionnaires/completion_state.json", { groups: {}, areas: {} }],
    ["questionnaires/adaptive_intake_plan.json", { plans: [], current_plan_id: null }],
    ["questionnaires/coverage_matrix.json", { generated_at: null, areas: [] }],
    ["questionnaires/missing_answers_report.json", { generated_at: null, missing: [] }],
    ["plugins.json", { plugin_loader_version: 1, enabled_plugins: ["owner-track"], disabled_plugins: [], updated_at: null }],
    ["app_workspaces.json", { version: "v1", workspaces: [], updated_at: null }],
    ["metadata/milestones.json", { milestones: [] }],
    ["metadata/team.json", { team_members: [] }],
    ["metadata/decisions.json", { decisions: [] }],
    ["metadata/changelog.json", { changes: [] }],
    ["dashboard/technical_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["dashboard/business_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["dashboard/task_tracker_state.json", { generated_at: null, source: ".kabeeri/tasks.json", summary: {}, board: {}, tasks: [], action_items: [] }],
    ["dashboard/agile_state.json", { generated_at: null, source: ".kabeeri/agile.json", summary: {}, active_sprints: [], velocity: {}, impediments: [], action_items: [] }],
    ["dashboard/structured_state.json", { generated_at: null, source: ".kabeeri/structured.json", summary: {}, phases: [], traceability: {}, gates: [], action_items: [] }],
    ["dashboard/ux_audits.json", { audits: [] }],
    ["reports/live_reports_state.json", { generated_at: null, source: ".kabeeri", summary: {}, reports: {}, action_items: [] }],
    ["github/sync_config.json", { dry_run_default: true, write_requires_confirmation: true }],
    ["github/issue_map.json", { tasks: [], conflicts: [] }],
    ["policies/policy_results.json", { results: [] }],
    ["policies/task_verification_policy.json", {
      policy_id: "task_verification_policy",
      version: "1.0.0",
      subject_type: "task",
      required_checks: [
        { check_id: "source_reference_present", severity: "fail", description: "Task must include source provenance." },
        { check_id: "acceptance_criteria_present", severity: "fail", description: "Task must include acceptance criteria or an acceptance checklist." },
        { check_id: "owner_only_final_verify", severity: "fail", description: "Only the active Owner can final-verify the task." },
        { check_id: "output_contract_complete", severity: "fail", description: "AI Developer output must include summary, files changed, checks, risks, limitations, review needs, and next task." },
        { check_id: "access_token_revoked_after_verify", severity: "fail", description: "Task access token must be revoked or archived after Owner verification." },
        { check_id: "token_usage_recorded", severity: "warn", description: "AI token usage should be traceable by task, workstream, developer, provider, and model." }
      ],
      manual_override: {
        allowed: true,
        requires_owner: true,
        requires_reason: true,
        audit_event_required: true
      }
    }],
    ["policies/release_policy.json", {
      policy_id: "release_policy",
      version: "1.0.0",
      subject_type: "release",
      required_checks: [
        { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed release publishing." },
        { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed release publishing." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings." },
        { check_id: "latest_migration_checks_not_blocked", severity: "fail", description: "Latest migration checks must not be blocked." },
        { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Latest governed policy results must not contain unresolved blockers." },
        { check_id: "owner_actor_for_confirmed_publish", severity: "fail", description: "Confirmed publish must be performed by an Owner actor." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/handoff_policy.json", {
      policy_id: "handoff_policy",
      version: "1.0.0",
      subject_type: "handoff",
      required_checks: [
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Client or Owner handoff must not include unresolved blocker security findings." },
        { check_id: "latest_policy_results_not_blocked", severity: "warn", description: "Handoff should call out unresolved policy blockers." },
        { check_id: "open_work_is_disclosed", severity: "warn", description: "Open tasks should be visible in the package roadmap and readiness reports." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/security_policy.json", {
      policy_id: "security_policy",
      version: "1.0.0",
      subject_type: "security",
      required_checks: [
        { check_id: "latest_security_scan_exists", severity: "warn", description: "Security governance should be based on a recorded scan." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have critical or high findings." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/migration_policy.json", {
      policy_id: "migration_policy",
      version: "1.0.0",
      subject_type: "migration",
      required_checks: [
        { check_id: "migration_plan_exists", severity: "fail", description: "A migration gate must target an existing migration plan." },
        { check_id: "rollback_plan_present", severity: "fail", description: "Migration must have a rollback plan." },
        { check_id: "backup_reference_present", severity: "fail", description: "Migration must record a backup reference." },
        { check_id: "latest_migration_check_not_blocked", severity: "fail", description: "Latest migration safety check for the plan must not be blocked." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["policies/github_write_policy.json", {
      policy_id: "github_write_policy",
      version: "1.0.0",
      subject_type: "github_write",
      required_checks: [
        { check_id: "github_write_confirmation_present", severity: "fail", description: "GitHub writes must be explicitly confirmed." },
        { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed GitHub writes." },
        { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed GitHub writes." },
        { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings before GitHub writes." },
        { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Confirmed GitHub writes must not proceed with unresolved policy blockers." },
        { check_id: "owner_actor_for_github_write", severity: "warn", description: "Confirmed GitHub writes should be performed by an Owner actor." }
      ],
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
    }],
    ["ai_usage/usage_summary.json", { total_events: 0, total_tokens: 0, total_cost: 0 }],
    ["ai_usage/pricing_rules.json", { currency: "USD", providers: [] }],
    ["ai_usage/budget_approvals.json", { approvals: [] }],
    ["ai_usage/cost_breakdown.json", { by_task: {}, by_developer: {}, by_workstream: {}, by_provider: {} }],
    ["ai_usage/context_packs.json", { context_packs: [] }],
    ["ai_usage/cost_preflights.json", { preflights: [] }],
    ["ai_usage/model_routing.json", {
      routes: [
        { task_kind: "intent_classification", recommended_model_class: "cheap", reason: "Short classification can use low-cost models or local rules." },
        { task_kind: "context_pack_generation", recommended_model_class: "cheap", reason: "File lists, summaries, and acceptance extraction should be inexpensive." },
        { task_kind: "standard_docs_spec", recommended_model_class: "balanced", reason: "Documentation synthesis needs quality but usually does not require premium reasoning." },
        { task_kind: "implementation", recommended_model_class: "balanced", reason: "Production code changes usually need stronger reasoning than simple classification." },
        { task_kind: "security_review", recommended_model_class: "premium", reason: "Security review has higher risk and benefits from stronger reasoning." },
        { task_kind: "owner_verify", recommended_model_class: "human_only", reason: "Final verification is Owner-only." }
      ]
    }],
    ["handoff/packages.json", { packages: [] }],
    ["security/security_scans.json", { scans: [] }],
    ["security/security_readiness.json", { checks: [] }],
    ["migrations/migration_plans.json", { plans: [] }],
    ["migrations/rollback_plans.json", { rollback_plans: [] }],
    ["migrations/migration_checks.json", { checks: [] }],
    ["migrations/migration_audit.json", { events: [] }],
    ["design_sources/sources.json", { sources: [] }],
    ["design_sources/text_specs.json", { specs: [] }],
    ["design_sources/page_specs.json", { pages: [] }],
    ["design_sources/component_contracts.json", { components: [] }],
    ["design_sources/missing_reports.json", { reports: [] }],
    ["design_sources/visual_reviews.json", { reviews: [] }],
    ["design_sources/audit_reports.json", { reports: [] }],
    ["design_sources/governance_reports.json", { reports: [] }],
    ["design_sources/ui_advisor.json", { recommendations: [], reviews: [], current_recommendation: null }],
    ["design_sources/ui_ux_reference.json", { selections: [], generated_questions: [], generated_tasks: [], current_selection: null }],
    ["adr/records.json", { adrs: [] }],
    ["prompt_layer/compositions.json", { compositions: [] }],
    ["interactions/suggested_tasks.json", { suggested_tasks: [] }],
    ["interactions/post_work_captures.json", { captures: [] }],
    ["interactions/vibe_sessions.json", { sessions: [], current_session_id: null }],
    ["interactions/context_briefs.json", { briefs: [] }]
  ];

  const created = [];
  for (const [relative, data] of files) {
    const target = path.join(getStateDir(), relative).replace(/\\/g, "/");
    if (fs.existsSync(path.join(root, target))) {
      created.push({ path: target, status: "exists" });
      continue;
    }
    writeJsonFile(target, data);
    created.push({ path: target, status: "created" });
  }

  const handoffTemplate = path.join(stateDir, "handoff", "CLIENT_HANDOFF_PACKAGE_TEMPLATE.md");
  if (!fs.existsSync(handoffTemplate)) {
    fs.writeFileSync(handoffTemplate, `# Client Handoff Package Template

## Project Summary

- Project name:
- Owner:
- Delivery mode:
- Intake mode:
- Current version:
- Handoff date:

## Business Summary

Describe the product goal, target audience, user value, and what is ready to show.

## Technical Summary

Describe architecture, stack, backend/frontend/admin split, database, integrations, deployment state, and known technical limits.

## Feature Readiness

| Feature | Status | Evidence | Notes |
|---|---|---|---|

## Production Vs Publish

State whether the project is local, development, staging, production-ready, published, or maintenance.

## AI Token Cost Summary

Summarize cost by task, sprint, workstream, developer or AI agent, provider, model, accepted output, rejected output, rework, and untracked usage.

## Known Risks And Limitations

List open risks, deferred features, and operational constraints.

## Next Roadmap

List recommended next tasks, next sprint candidates, and future version priorities.

## Owner Verification

Owner approval is required before final delivery, release, publish, or scope closure.
`, "utf8");
    created.push({ path: ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md", status: "created" });
  } else {
    created.push({ path: ".kabeeri/handoff/CLIENT_HANDOFF_PACKAGE_TEMPLATE.md", status: "exists" });
  }

  const auditFile = path.join(stateDir, "audit_log.jsonl");
  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(auditFile, "", "utf8");
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "exists" });
  }

  const usageEventsFile = path.join(stateDir, "ai_usage", "usage_events.jsonl");
  if (!fs.existsSync(usageEventsFile)) {
    fs.writeFileSync(usageEventsFile, "", "utf8");
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "exists" });
  }

  for (const relative of [
    "memory/decisions.jsonl",
    "memory/assumptions.jsonl",
    "memory/constraints.jsonl",
    "memory/risks.jsonl",
    "memory/deferred_features.jsonl",
    "ai_runs/prompt_runs.jsonl",
    "ai_runs/accepted_runs.jsonl",
    "ai_runs/rejected_runs.jsonl",
    "events/event_log.jsonl",
    "approvals/approval_log.jsonl"
  ]) {
    const target = path.join(stateDir, relative);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, "", "utf8");
      created.push({ path: `.kabeeri/${relative}`, status: "created" });
    } else {
      created.push({ path: `.kabeeri/${relative}`, status: "exists" });
    }
  }

  const userIntents = path.join(stateDir, "interactions", "user_intents.jsonl");
  if (!fs.existsSync(userIntents)) {
    fs.writeFileSync(userIntents, "", "utf8");
    created.push({ path: ".kabeeri/interactions/user_intents.jsonl", status: "created" });
  }

  const ownerPluginManifest = path.join(root, "plugins", "owner-track", "plugin.json");
  if (!fs.existsSync(ownerPluginManifest)) {
    fs.writeFileSync(ownerPluginManifest, JSON.stringify({
      plugin_id: "owner-track",
      name: "Owner Track Bundle",
      track: "framework_owner",
      enabled_by_default: true,
      description: "Removable owner-track bundle that exposes framework stewardship surfaces.",
      command_surface: ["kvdf evolution", "kvdf evolution roadmap", "kvdf evolution priorities", "kvdf evolution partition"],
      docs_surface: ["plugins/owner-track/docs/index.md", "knowledge/governance/EVOLUTION_STEWARD.md", "docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md"]
    }, null, 2) + "\n", "utf8");
    created.push({ path: "plugins/owner-track/plugin.json", status: "created" });
  } else {
    created.push({ path: "plugins/owner-track/plugin.json", status: "exists" });
  }

  const ownerDocsIndex = path.join(root, "plugins", "owner-track", "docs", "index.md");
  if (!fs.existsSync(ownerDocsIndex)) {
    fs.writeFileSync(ownerDocsIndex, [
      "# Owner Docs",
      "",
      "This bundle is protected by an owner docs token gate.",
      "",
      "- Open with `kvdf owner docs open`.",
      "- Tokens expire after one minute.",
      "- Closing the owner session revokes the active token.",
      ""
    ].join("\n"), "utf8");
    created.push({ path: "plugins/owner-track/docs/index.md", status: "created" });
  } else {
    created.push({ path: "plugins/owner-track/docs/index.md", status: "exists" });
  }

  const workspacesRoot = path.join(root, "workspaces", "apps");
  if (!fs.existsSync(workspacesRoot)) {
    fs.mkdirSync(workspacesRoot, { recursive: true });
    created.push({ path: "workspaces/apps", status: "created" });
  } else {
    created.push({ path: "workspaces/apps", status: "exists" });
  }

  return created;
}

function seedDeveloperAppWorkspace(workspaceSlug, options = {}) {
  const root = repoRoot();
  const slug = String(workspaceSlug || "").trim().toLowerCase();
  if (!slug) throw new Error("Missing app workspace slug.");
  assertSafeName(slug);
  const workspaceRoot = path.join(root, "workspaces", "apps", slug);
  const rootProject = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const productName = String(options.productName || rootProject.product_name || rootProject.name || "").trim();
  const forbidUnrelatedApps = rootProject.forbid_unrelated_apps !== false;
  fs.mkdirSync(workspaceRoot, { recursive: true });
  const created = [];
  for (const dir of [".kabeeri", "src", "tests", "docs"]) {
    const target = path.join(workspaceRoot, dir);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
      created.push({ path: `workspaces/apps/${slug}/${dir}`, status: "created" });
    } else {
      created.push({ path: `workspaces/apps/${slug}/${dir}`, status: "exists" });
    }
  }
  const localState = [
    [".kabeeri/project.json", {
      framework: "Kabeeri VDF",
      workspace_kind: "developer_app",
      app_slug: slug,
      app_name: options.name || slug,
      app_type: options.appType || "application",
      product_name: productName,
      forbid_unrelated_apps: forbidUnrelatedApps,
      version: "0.1.0",
      created_at: new Date().toISOString()
    }],
    [".kabeeri/tasks.json", { tasks: [] }],
    [".kabeeri/task_trash.json", { trash: [], retention_days: DEFAULT_RETENTION_DAYS, last_sweep_at: null }],
    [".kabeeri/session.json", { active: false }],
    [".kabeeri/session_track.json", { active: false, active_track: "vibe_app_developer", role_gate: "app_workspace", activated_features: [], blocked_features: [], activated_at: null, updated_at: null }],
    [".kabeeri/workspace.json", {
      workspace_kind: "developer_app",
      app_slug: slug,
      app_name: options.name || slug,
      app_type: options.appType || "application",
      product_name: productName,
      forbid_unrelated_apps: forbidUnrelatedApps,
      root: `workspaces/apps/${slug}`,
      created_at: new Date().toISOString()
    }]
  ];
  for (const [relative, data] of localState) {
    const target = path.join(workspaceRoot, relative);
    if (!fs.existsSync(target)) {
      writeJsonFile(path.join(`workspaces/apps/${slug}`, relative).replace(/\\/g, "/"), data);
      created.push({ path: `workspaces/apps/${slug}/${relative}`, status: "created" });
    } else {
      created.push({ path: `workspaces/apps/${slug}/${relative}`, status: "exists" });
    }
  }
  const packageJson = path.join(workspaceRoot, "package.json");
  if (!fs.existsSync(packageJson)) {
    fs.writeFileSync(packageJson, `${JSON.stringify({
      name: slug,
      private: true,
      version: "0.1.0",
      scripts: { test: "echo \"No app tests configured yet\"" }
    }, null, 2)}\n`, "utf8");
    created.push({ path: `workspaces/apps/${slug}/package.json`, status: "created" });
  } else {
    created.push({ path: `workspaces/apps/${slug}/package.json`, status: "exists" });
  }
  const readme = path.join(workspaceRoot, "README.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, `# ${options.name || slug}\n\nDeveloper app workspace scaffolded by KVDF.\n`, "utf8");
    created.push({ path: `workspaces/apps/${slug}/README.md`, status: "created" });
  } else {
    created.push({ path: `workspaces/apps/${slug}/README.md`, status: "exists" });
  }
  return { workspace_root: `workspaces/apps/${slug}`, workspace_slug: slug, created };
}

function defaultWorkstreams() {
  return [
    { id: "backend", name: "Backend", description: "Server-side application code, APIs, jobs, and backend services.", path_rules: ["app/Http/", "app/Models/", "app/Services/", "routes/api.php", "src/api/", "src/server/", "server/", "backend/", "api/"], required_review: ["api_contract", "security"] },
    { id: "public_frontend", name: "Public Frontend", description: "Customer-facing web or mobile UI.", path_rules: ["src/", "resources/js/", "resources/views/", "frontend/", "web/", "client/", "apps/storefront", "apps/public"], required_review: ["ux", "accessibility"] },
    { id: "admin_frontend", name: "Admin Frontend", description: "Backoffice, dashboard, and internal operations UI.", path_rules: ["admin/", "dashboard/", "resources/admin/", "apps/admin", "src/admin/"], required_review: ["permissions", "operator_flow"] },
    { id: "mobile", name: "Mobile", description: "iOS/Android app code, Expo/React Native apps, Flutter apps, mobile navigation, and device integrations.", path_rules: ["mobile/", "apps/mobile/", "apps/app/", "app/", "src/mobile/", "android/", "ios/"], required_review: ["device_check", "permissions", "accessibility"] },
    { id: "database", name: "Database", description: "Migrations, schema, seeders, and database scripts.", path_rules: ["database/", "migrations/", "prisma/", "schema/", "db/"], required_review: ["migration_safety", "rollback"] },
    { id: "devops", name: "DevOps", description: "Deployment, CI, infrastructure, containers, and runtime configuration.", path_rules: [".github/", "Dockerfile", "docker-compose.yml", "deploy/", "infra/", "k8s/", "terraform/"], required_review: ["deployment_safety"] },
    { id: "qa", name: "QA", description: "Automated tests, QA plans, fixtures, and verification artifacts.", path_rules: ["tests/", "test/", "spec/", "cypress/", "playwright/", "qa/"], required_review: ["test_coverage"] },
    { id: "docs", name: "Documentation", description: "Project documentation, handoff notes, and operating guides.", path_rules: ["docs/", "README.md", "CHANGELOG.md", "governance/", "cli/", "dashboard/"], required_review: ["clarity"] },
    { id: "integrations", name: "Integrations", description: "Third-party integrations, webhooks, provider adapters, and external APIs.", path_rules: ["integrations/", "webhooks/", "providers/", "src/integrations/", "app/Integrations/"], required_review: ["contract_safety"] },
    { id: "security", name: "Security", description: "Security scans, auth-sensitive code, secrets rules, and hardening work.", path_rules: ["security/", ".kabeeri/security/", "auth/", "src/auth/", "app/Auth/"], required_review: ["security_review"] }
  ];
}

module.exports = {
  createWorkspace,
  defaultWorkstreams,
  ensureWorkspace,
  getStateDir,
  seedDeveloperAppWorkspace,
  readJsonFile,
  writeJsonFile
};

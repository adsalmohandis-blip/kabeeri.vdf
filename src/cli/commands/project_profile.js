const fs = require("fs");
const path = require("path");
const { repoRoot, fileExists, readJsonFile, writeJsonFile, assertSafeName } = require("../fs_utils");
const { table } = require("../ui");
const { uniqueList } = require("../services/collections");
const { buildDeliveryModeRecommendation } = require("./delivery");
const { getPromptPackCatalog, detectFrameworkPacks, recommendFrameworkPacksForBlueprint, buildScaleSpecificPackReport } = require("./prompt_pack");

const PROJECT_PROFILE_REPORT_FILE = ".kabeeri/reports/project_profile_report.json";

function projectProfile(action, value, flags = {}, rest = [], deps = {}) {
  const verb = normalizeProjectProfileAction(action, value, rest);
  const text = collectProjectProfileText(action, value, rest, flags);
  const ensureWorkspace = deps.ensureWorkspace || (() => {});
  const appendAudit = deps.appendAudit || (() => {});

  if (["status", "list", "show"].includes(verb)) {
    ensureWorkspace();
    const state = readProjectProfileState();
    if (!state) throw new Error("No project profile record found. Run `kvdf init` or `kvdf project profile route` first.");
    if (flags.json) console.log(JSON.stringify(state, null, 2));
    else renderProjectProfileState(state);
    return state;
  }

  if (verb === "report") {
    ensureWorkspace();
    const state = readProjectProfileState();
    const report = buildProjectProfileReport(state, flags, deps);
    persistProjectProfileReport(report, deps);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderProjectProfileReport(report);
    return report;
  }

  if (["route", "recommend", "map", "apply", "choose", "select", "set"].includes(verb)) {
    const recommendation = buildProjectProfileRecommendation(text, flags, deps);
    persistProjectProfileRecommendation(recommendation, deps);
    if (fileExists(".kabeeri")) {
      appendAudit("project.profile_routed", "project_profile", recommendation.recommendation_id, `Project profile routed: ${recommendation.selected_profile}`);
    }
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderProjectProfileRecommendation(recommendation);
    return recommendation;
  }

  if (verb === "help") {
    console.log(renderProjectProfileHelp());
    return;
  }

  throw new Error(`Unknown project profile action: ${action}`);
}

function buildProjectProfileRecommendation(input, flags = {}, deps = {}) {
  const targetPath = resolveTargetPath(flags.path);
  const signal = inspectProjectSignals(targetPath);
  const description = String(input || flags.goal || flags.description || flags.text || flags.project || flags.app || "").trim();
  const combinedText = [
    description,
    signal.detected_stacks.join(" "),
    signal.top_level_directories.join(" "),
    signal.top_level_files.join(" "),
    signal.risk_signals.join(" "),
    flags.blueprint || "",
    flags.profile || ""
  ].join(" ").toLowerCase();

  const buildBlueprintRecommendation = deps.buildBlueprintRecommendation;
  const findProductBlueprint = deps.findProductBlueprint;
  const getPromptPackCatalogFn = deps.getPromptPackCatalog || getPromptPackCatalog;
  const detectFrameworkPacksFn = deps.detectFrameworkPacks || detectFrameworkPacks;
  const recommendFrameworkPacksForBlueprintFn = deps.recommendFrameworkPacksForBlueprint || recommendFrameworkPacksForBlueprint;
  const resolveQuestionnaireGroups = deps.resolveQuestionnaireGroups || defaultResolveQuestionnaireGroups;
  const tableFn = deps.table || table;
  const promptPacks = getPromptPackCatalogFn ? getPromptPackCatalogFn() : [];
  const availablePackNames = new Set(promptPacks.map((pack) => pack.pack));

  const blueprintRecommendation = buildBlueprintRecommendation ? buildBlueprintRecommendation(description || combinedText, flags) : null;
  const topBlueprintKey = flags.blueprint || (blueprintRecommendation && blueprintRecommendation.matches && blueprintRecommendation.matches[0] ? blueprintRecommendation.matches[0].blueprint_key : null);
  const blueprint = topBlueprintKey && findProductBlueprint ? findProductBlueprint(topBlueprintKey) : null;
  const delivery = buildDeliveryModeRecommendation(description || combinedText, flags);

  const explicitPromptPacks = detectFrameworkPacksFn ? detectFrameworkPacksFn([description, combinedText].filter(Boolean).join(" "), promptPacks) : [];
  const blueprintPromptPacks = blueprint ? recommendFrameworkPacksForBlueprintFn(blueprint, promptPacks) : [];
  const signalPromptPacks = detectPromptPacksFromSignals(signal.detected_stacks, availablePackNames);
  const selectedPromptPacks = uniqueList([...explicitPromptPacks, ...signalPromptPacks, ...blueprintPromptPacks]).slice(0, 6);
  const selectedProfile = normalizeProjectProfileChoice(flags.profile || inferProjectProfileChoice({
    text: combinedText,
    signal,
    blueprint,
    delivery,
    explicitProfile: flags.profile
  }));
  const intakeGroups = resolveQuestionnaireGroups(selectedProfile);

  const recommendation = {
    recommendation_id: flags.id || `project-profile-${Date.now()}`,
    created_at: new Date().toISOString(),
    input: description,
    target_path: targetPath,
    detected_stacks: signal.detected_stacks,
    risk_signals: signal.risk_signals,
    risk_level: signal.risk_level,
    selected_profile: selectedProfile,
    profile_reason: inferProfileReason(selectedProfile, { signal, delivery, blueprint, text: combinedText }),
    delivery_mode_recommendation: {
      recommended_mode: delivery.recommended_mode,
      confidence: delivery.confidence,
      scores: delivery.scores,
      rationale: delivery.rationale,
      developer_decision_required: true
    },
    blueprint: blueprint ? {
      key: blueprint.key,
      name: blueprint.name,
      category: blueprint.category,
      recommended_delivery: blueprint.recommended_delivery
    } : null,
    pack_router: {
      available_prompt_packs: promptPacks.map((pack) => ({
        pack: pack.pack,
        display_name: pack.display_name || pack.pack
      })),
      detected_prompt_packs: explicitPromptPacks,
      signal_prompt_packs: signalPromptPacks,
      blueprint_prompt_packs: blueprintPromptPacks,
      selected_prompt_packs: selectedPromptPacks
    },
    scale_pack_router: buildScaleSpecificPackReport(description || combinedText, {
      profile: selectedProfile,
      risk: signal.risk_level,
      goal: description,
      blueprint: blueprint ? blueprint.key : "",
      path: targetPath
    }),
    intake_groups: intakeGroups,
    generator_profile: selectedProfile,
    project_summary: {
      project_name: signal.project_name || null,
      package_manager: signal.package_manager || null,
      app_hints: signal.app_hints,
      top_level_directories: signal.top_level_directories,
      top_level_files: signal.top_level_files
    },
    next_actions: [
      "Use this profile when creating the initial Kabeeri workspace.",
      "Use `kvdf questionnaire plan` to generate focused intake questions for the selected blueprint.",
      "Use `kvdf prompt-pack compose` to bind the recommended pack to a governed task.",
      "If the selection looks wrong, rerun `kvdf project profile route --profile <lite|standard|enterprise>`."
    ]
  };

  recommendation.project_summary.risk_signals = signal.risk_signals;
  recommendation.project_summary.risk_level = signal.risk_level;
  recommendation.project_summary.detected_stacks = signal.detected_stacks;
  recommendation.project_summary.blueprint_key = blueprint ? blueprint.key : null;
  recommendation.project_summary.delivery_mode = delivery.recommended_mode;
  recommendation.project_summary.route_reason = recommendation.profile_reason;
  return recommendation;
}

function persistProjectProfileRecommendation(recommendation, deps = {}) {
  if (!recommendation) return null;
  if (!fileExists(".kabeeri")) return null;
  const appendAudit = deps.appendAudit || (() => {});
  const state = readProjectProfileState();
  state.recommendations = state.recommendations || [];
  const existingIndex = state.recommendations.findIndex((item) => item.recommendation_id === recommendation.recommendation_id);
  if (existingIndex >= 0) state.recommendations[existingIndex] = recommendation;
  else state.recommendations.push(recommendation);
  state.current_recommendation_id = recommendation.recommendation_id;
  state.current_profile = recommendation.selected_profile;
  state.current_delivery_mode = recommendation.delivery_mode_recommendation ? recommendation.delivery_mode_recommendation.recommended_mode : null;
  state.selected_prompt_packs = recommendation.pack_router ? recommendation.pack_router.selected_prompt_packs || [] : [];
  state.current_scale_prompt_packs = recommendation.scale_pack_router ? recommendation.scale_pack_router.selected_prompt_packs || [] : [];
  state.intake_groups = recommendation.intake_groups || [];
  state.updated_at = new Date().toISOString();
  writeJsonFile(".kabeeri/project_profile.json", state);

  if (fileExists(".kabeeri/project.json")) {
    const project = readJsonFile(".kabeeri/project.json");
    project.profile = recommendation.selected_profile;
    project.delivery_mode = recommendation.delivery_mode_recommendation ? recommendation.delivery_mode_recommendation.recommended_mode : project.delivery_mode;
    project.profile_route_id = recommendation.recommendation_id;
    project.prompt_packs = recommendation.pack_router ? recommendation.pack_router.selected_prompt_packs || [] : [];
    project.scale_prompt_packs = recommendation.scale_pack_router ? recommendation.scale_pack_router.selected_prompt_packs || [] : [];
    project.intake_groups = recommendation.intake_groups || [];
    project.updated_at = new Date().toISOString();
    writeJsonFile(".kabeeri/project.json", project);
  }

  appendAudit("project.profile_persisted", "project_profile", recommendation.recommendation_id, `Project profile persisted: ${recommendation.selected_profile}`);
  return state;
}

function buildProjectProfileReport(state, flags = {}, deps = {}) {
  const current = state.recommendations && state.recommendations.length
    ? state.recommendations.find((item) => item.recommendation_id === state.current_recommendation_id) || state.recommendations[state.recommendations.length - 1]
    : null;
  const profile = state.current_profile || (current && current.selected_profile) || "unset";
  const delivery = state.current_delivery_mode || (current && current.delivery_mode_recommendation ? current.delivery_mode_recommendation.recommended_mode : "unset");
  const recommendationCount = (state.recommendations || []).length;
  const derivedScalePackRouter = current && current.scale_pack_router
    ? current.scale_pack_router
    : current
      ? buildScaleSpecificPackReport(current.input || profile, {
        profile,
        risk: current.risk_level || "low",
        goal: current.input || "",
        blueprint: current.blueprint ? current.blueprint.key : "",
        path: current.target_path || ""
      })
      : null;
  return {
    report_type: "project_profile_report",
    generated_at: new Date().toISOString(),
    report_path: PROJECT_PROFILE_REPORT_FILE,
    current_profile: profile,
    current_delivery_mode: delivery,
    current_recommendation_id: state.current_recommendation_id || (current ? current.recommendation_id : null),
    recommendation_count: recommendationCount,
    selected_prompt_packs: state.selected_prompt_packs || [],
    current_scale_prompt_packs: state.current_scale_prompt_packs && state.current_scale_prompt_packs.length
      ? state.current_scale_prompt_packs
      : derivedScalePackRouter ? derivedScalePackRouter.selected_prompt_packs || [] : [],
    scale_pack_router: derivedScalePackRouter,
    intake_groups: state.intake_groups || [],
    latest_recommendation: current,
    source_of_truth: {
      project_profile_json: fileExists(".kabeeri/project_profile.json"),
      project_json: fileExists(".kabeeri/project.json")
    },
    next_actions: buildProjectProfileNextActions({ state, current, profile, delivery, recommendationCount, flags, deps, scalePackRouter: derivedScalePackRouter })
  };
}

function persistProjectProfileReport(report, deps = {}) {
  if (!fileExists(".kabeeri")) return null;
  fs.mkdirSync(path.dirname(path.join(repoRoot(), PROJECT_PROFILE_REPORT_FILE)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), PROJECT_PROFILE_REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const appendAudit = deps.appendAudit || (() => {});
  appendAudit("project.profile_reported", "project_profile", report.current_recommendation_id || "unset", `Project profile report generated: ${report.current_profile}`);
  return report;
}

function renderProjectProfileReport(report) {
  console.log(`Project profile report: ${report.current_profile}`);
  console.log(table(["Field", "Value"], [
    ["Current profile", report.current_profile || ""],
    ["Current delivery", report.current_delivery_mode || ""],
    ["Recommendation count", String(report.recommendation_count || 0)],
    ["Prompt packs", (report.selected_prompt_packs || []).join(", ") || "none"],
    ["Scale packs", (report.current_scale_prompt_packs || []).join(", ") || "none"],
    ["Intake groups", (report.intake_groups || []).join(", ") || "none"]
  ]));
  if (Array.isArray(report.next_actions) && report.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    for (const action of report.next_actions) console.log(`- ${action}`);
  }
}

function readProjectProfileState() {
  if (!fileExists(".kabeeri/project_profile.json")) {
    return {
      version: "v1",
      recommendations: [],
      current_recommendation_id: null,
      current_profile: null,
      current_delivery_mode: null,
      selected_prompt_packs: [],
      current_scale_prompt_packs: [],
      intake_groups: [],
      updated_at: null
    };
  }
  const state = readJsonFile(".kabeeri/project_profile.json");
  state.recommendations = state.recommendations || [];
  state.selected_prompt_packs = state.selected_prompt_packs || [];
  state.current_scale_prompt_packs = state.current_scale_prompt_packs || [];
  state.intake_groups = state.intake_groups || [];
  if ((!state.current_scale_prompt_packs || state.current_scale_prompt_packs.length === 0) && state.recommendations.length) {
    const current = state.recommendations.find((item) => item.recommendation_id === state.current_recommendation_id) || state.recommendations[state.recommendations.length - 1];
    if (current) {
      const derived = current.scale_pack_router || buildScaleSpecificPackReport(current.input || state.current_profile || "", {
        profile: state.current_profile || current.selected_profile || "standard",
        risk: current.risk_level || "low",
        goal: current.input || "",
        blueprint: current.blueprint ? current.blueprint.key : "",
        path: current.target_path || ""
      });
      state.current_scale_prompt_packs = derived.selected_prompt_packs || [];
      state.scale_pack_router = derived;
    }
  }
  return state;
}

function renderProjectProfileState(state) {
  const current = state.recommendations && state.recommendations.length
    ? state.recommendations.find((item) => item.recommendation_id === state.current_recommendation_id) || state.recommendations[state.recommendations.length - 1]
    : null;
  console.log(`Project profile state: ${state.current_profile || "unset"}`);
  console.log(table(["Field", "Value"], [
    ["Current profile", state.current_profile || ""],
    ["Current delivery", state.current_delivery_mode || ""],
    ["Prompt packs", (state.selected_prompt_packs || []).join(", ") || "none"],
    ["Scale packs", (state.current_scale_prompt_packs || []).join(", ") || "none"],
    ["Intake groups", (state.intake_groups || []).join(", ") || "none"],
    ["Recommendations", String((state.recommendations || []).length)],
    ["Latest recommendation", current ? current.recommendation_id : ""]
  ]));
  if (current) {
    console.log("");
    console.log(`Reason: ${current.profile_reason || "No routing reason recorded."}`);
  }
}

function renderProjectProfileRecommendation(recommendation) {
  console.log(`Project profile recommendation: ${recommendation.recommendation_id}`);
  console.log(table(["Field", "Value"], [
    ["Profile", recommendation.selected_profile],
    ["Delivery", recommendation.delivery_mode_recommendation.recommended_mode],
    ["Confidence", recommendation.delivery_mode_recommendation.confidence],
    ["Blueprint", recommendation.blueprint ? `${recommendation.blueprint.name} (${recommendation.blueprint.key})` : ""],
    ["Prompt packs", recommendation.pack_router.selected_prompt_packs.join(", ") || "none"],
    ["Scale packs", recommendation.scale_pack_router ? recommendation.scale_pack_router.selected_prompt_packs.join(", ") || "none" : "none"],
    ["Intake groups", recommendation.intake_groups.join(", ") || "none"],
    ["Risk level", recommendation.risk_level]
  ]));
  console.log("");
  console.log(`Reason: ${recommendation.profile_reason || "No routing reason recorded."}`);
}

function renderProjectProfileHelp() {
  return `Usage:
  kvdf project profile
  kvdf project profile route --goal "Build a SaaS product"
  kvdf project profile route --profile enterprise --goal "Build a hospital ERP"
  kvdf project profile status
  kvdf project profile report
  kvdf prompt-pack scale --profile enterprise --goal "Build a hospital ERP"
  kvdf project profile --json

Notes:
  Project profile routing turns a project goal or existing codebase signals into one durable project profile record. It chooses Lite, Standard, or Enterprise, recommends a delivery mode, and suggests prompt packs and intake groups before Kabeeri starts generating work.
`;
}

function buildProjectProfileNextActions({ state, current, profile, delivery, recommendationCount, scalePackRouter }) {
  const actions = [];
  if (!profile || profile === "unset") actions.push("Route a project profile with `kvdf project profile route` or `kvdf init --goal <goal>`.");
  if (recommendationCount === 0) actions.push("Create the first recommendation from a project goal or current repository signals.");
  if (current && current.pack_router && (!current.pack_router.selected_prompt_packs || current.pack_router.selected_prompt_packs.length === 0)) {
    actions.push("Select prompt packs before project start so the AI gets a governed pack.");
  }
  const resolvedScalePackRouter = scalePackRouter || (current ? current.scale_pack_router : null);
  if (current && resolvedScalePackRouter && (!resolvedScalePackRouter.selected_prompt_packs || resolvedScalePackRouter.selected_prompt_packs.length === 0)) {
    actions.push("Run `kvdf prompt-pack scale` to derive the large-system prompt bundle.");
  }
  if (delivery === "structured" && profile !== "enterprise") {
    actions.push("Recheck whether a structured enterprise profile would better match risk and governance needs.");
  }
  if (actions.length === 0) actions.push("Profile is synchronized with the current workspace state.");
  return actions;
}

function resolveTargetPath(pathInput) {
  const target = pathInput ? path.resolve(repoRoot(), pathInput) : repoRoot();
  if (pathInput && !fs.existsSync(target)) {
    throw new Error(`Project path not found: ${pathInput}`);
  }
  return target;
}

function inspectProjectSignals(targetPath) {
  const entries = fs.existsSync(targetPath) ? fs.readdirSync(targetPath, { withFileTypes: true }) : [];
  const files = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
  const dirs = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  const detectedStacks = detectStacksFromRoot(targetPath, files, dirs);
  const appHints = detectAppHints(detectedStacks, dirs);
  const riskSignals = detectProjectRiskSignals(files, dirs);
  const riskLevel = riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low";
  const packageJson = files.has("package.json") ? safeReadJson(path.join(targetPath, "package.json")) : null;
  const projectName = packageJson && packageJson.name ? packageJson.name : null;
  return {
    project_name: projectName,
    package_manager: packageJson ? inferPackageManager(packageJson) : null,
    detected_stacks: detectedStacks,
    app_hints: appHints,
    risk_signals: riskSignals,
    risk_level: riskLevel,
    top_level_directories: Array.from(dirs).sort(),
    top_level_files: Array.from(files).sort()
  };
}

function detectStacksFromRoot(targetPath, files, dirs) {
  const stacks = [];
  if (files.has("package.json")) {
    stacks.push("node");
    const pkg = safeReadJson(path.join(targetPath, "package.json"));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (deps.next) stacks.push("nextjs");
    if (deps.react) stacks.push("react");
    if (deps.vue) stacks.push("vue");
    if (deps.nuxt) stacks.push("nuxt_vue");
    if (deps["@angular/core"]) stacks.push("angular");
    if (deps["@sveltejs/kit"]) stacks.push("sveltekit");
    if (deps.expo) stacks.push("react_native_expo");
    if (deps.express) stacks.push("expressjs");
    if (deps["@nestjs/core"]) stacks.push("nestjs");
    if (deps.astro) stacks.push("astro");
  }
  if (files.has("composer.json")) {
    stacks.push("php");
    const composer = safeReadJson(path.join(targetPath, "composer.json"));
    const requires = { ...(composer.require || {}), ...(composer["require-dev"] || {}) };
    if (requires.laravel || requires["laravel/framework"]) stacks.push("laravel");
  }
  if (files.has("artisan")) stacks.push("laravel");
  if (files.has("pyproject.toml") || files.has("requirements.txt")) stacks.push("python");
  if (files.has("manage.py")) stacks.push("django");
  if (files.has("pubspec.yaml")) stacks.push("flutter");
  if (files.has("angular.json")) stacks.push("angular");
  if (files.has("next.config.js") || files.has("next.config.mjs")) stacks.push("nextjs");
  if (dirs.has("wp-content")) stacks.push("wordpress");
  return uniqueList(stacks);
}

function detectAppHints(stacks, dirs) {
  const hints = [];
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) hints.push("backend");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) hints.push("frontend");
  if (stacks.some((item) => /expo|flutter|mobile/.test(item))) hints.push("mobile");
  for (const dir of ["apps", "packages", "frontend", "backend", "admin", "mobile", "api", "web"]) {
    if (dirs.has(dir)) hints.push(dir);
  }
  return uniqueList(hints);
}

function detectProjectRiskSignals(files, dirs) {
  const signals = [];
  if (!files.has("README.md")) signals.push("missing_readme");
  if (!files.has("package.json") && !files.has("composer.json") && !files.has("pyproject.toml") && !files.has("requirements.txt") && !files.has("pubspec.yaml")) signals.push("unknown_dependency_manifest");
  if (!dirs.has("tests") && !dirs.has("__tests__") && !dirs.has("spec") && !dirs.has("test")) signals.push("missing_visible_tests");
  if (files.has(".env")) signals.push("env_file_present_review_secrets");
  return signals;
}

function inferPackageManager(packageJson) {
  if (!packageJson || typeof packageJson !== "object") return null;
  if (packageJson.packageManager) return String(packageJson.packageManager).split("@")[0];
  return "npm";
}

function detectPromptPacksFromSignals(stacks, availableNames) {
  const aliases = {
    nextjs: ["nextjs"],
    react: ["react"],
    vue: ["vue"],
    nuxt_vue: ["nuxt-vue", "vue"],
    angular: ["angular"],
    sveltekit: ["svelte"],
    react_native_expo: ["react-native-expo"],
    flutter: ["flutter"],
    wordpress: ["wordpress"],
    laravel: ["laravel"],
    nestjs: ["nestjs"],
    django: ["django"],
    python: ["python"],
    php: ["php"],
    rails: ["ruby", "rails"]
  };
  const selected = [];
  for (const stack of stacks || []) {
    for (const pack of aliases[stack] || []) {
      if (availableNames.has(pack)) selected.push(pack);
    }
  }
  return uniqueList(selected);
}

function inferProjectProfileChoice({ text, signal, blueprint, delivery, explicitProfile }) {
  const lower = String(text || "").toLowerCase();
  const enterpriseSignals = [
    "enterprise", "compliance", "audit", "regulatory", "multi-tenant", "multi tenant", "tenant",
    "hospital", "clinic", "bank", "finance", "government", "gov", "erp", "billing", "payments",
    "payment", "sso", "roles", "permissions", "security", "migration", "integration", "integrations"
  ];
  const liteSignals = [
    "lite", "mvp", "prototype", "quick", "simple", "small", "landing", "portfolio", "blog",
    "demo", "proof of concept", "poc", "experiment", "one page", "one-page"
  ];
  if (explicitProfile && ["lite", "standard", "enterprise"].includes(String(explicitProfile).toLowerCase())) {
    return String(explicitProfile).toLowerCase();
  }
  if (signal && signal.risk_level === "high") return "enterprise";
  if (blueprint && ["business_operations", "regulated"].includes(blueprint.category)) return "enterprise";
  if (enterpriseSignals.some((keyword) => lower.includes(keyword))) return "enterprise";
  if (delivery && delivery.recommended_mode === "structured" && (signal?.risk_signals || []).length >= 2) return "enterprise";
  if (liteSignals.some((keyword) => lower.includes(keyword)) && (signal?.risk_signals || []).length <= 1) return "lite";
  if ((signal?.detected_stacks || []).length <= 1 && !blueprint && liteSignals.some((keyword) => lower.includes(keyword))) return "lite";
  return "standard";
}

function inferProfileReason(profile, context = {}) {
  const { signal = {}, delivery = {}, blueprint = null, text = "" } = context;
  const lower = String(text || "").toLowerCase();
  if (profile === "enterprise") {
    if (signal.risk_level === "high") return "High-risk or high-complexity project signals were detected.";
    if (blueprint && ["business_operations", "regulated"].includes(blueprint.category)) return `Blueprint ${blueprint.key} is treated as enterprise-class work.`;
    if (/enterprise|compliance|audit|regulatory|multi-tenant|multi tenant|bank|finance|hospital|gov|government|erp|billing|payments/.test(lower)) return "The requested project description suggests enterprise scope, compliance, or regulated operations.";
    if (delivery.recommended_mode === "structured") return "Structured delivery and multiple risk signals point to enterprise planning.";
  }
  if (profile === "lite") {
    if (/mvp|prototype|quick|simple|small|landing|portfolio|blog|demo|poc|experiment/.test(lower)) return "The project description suggests a lightweight or discovery-oriented build.";
    return "The project appears small enough for a lite profile.";
  }
  if (blueprint) return `Blueprint ${blueprint.key} does not require enterprise routing, so the standard profile balances planning and delivery.`;
  return "No strong enterprise or lite signal was detected, so the standard profile is the safest default.";
}

function normalizeProjectProfileAction(action, value, rest = []) {
  const verb = String(action || "route").toLowerCase();
  if (verb === "profile") {
    const nested = String(value || rest[0] || "").toLowerCase();
    if (["status", "list", "show", "route", "recommend", "map", "apply", "choose", "select", "set", "report"].includes(nested)) return nested;
    return "route";
  }
  if (["status", "list", "show", "route", "recommend", "map", "apply", "choose", "select", "set", "report", "help"].includes(verb)) return verb;
  return "route";
}

function collectProjectProfileText(action, value, rest = [], flags = {}) {
  const verb = String(action || "").toLowerCase();
  const knownNested = verb === "profile" && ["status", "list", "show", "route", "recommend", "map", "apply", "choose", "select", "set", "report"].includes(String(value || rest[0] || "").toLowerCase());
  const items = knownNested ? rest : [value, ...rest];
  return [
    flags.goal,
    flags.description,
    flags.text,
    flags.project,
    flags.app,
    flags.path,
    ...items
  ].filter(Boolean).join(" ").trim();
}

function renderProjectProfileState(state) {
  const current = state.recommendations && state.recommendations.length
    ? state.recommendations.find((item) => item.recommendation_id === state.current_recommendation_id) || state.recommendations[state.recommendations.length - 1]
    : null;
  console.log(`Project profile state: ${state.current_profile || "unset"}`);
  console.log(table(["Field", "Value"], [
    ["Current profile", state.current_profile || ""],
    ["Current delivery", state.current_delivery_mode || ""],
    ["Prompt packs", (state.selected_prompt_packs || []).join(", ") || "none"],
    ["Intake groups", (state.intake_groups || []).join(", ") || "none"],
    ["Recommendations", String((state.recommendations || []).length)],
    ["Latest recommendation", current ? current.recommendation_id : ""]
  ]));
  if (current) {
    console.log("");
    console.log(`Reason: ${current.profile_reason || "No routing reason recorded."}`);
  }
}

function renderProjectProfileRecommendation(recommendation) {
  console.log(`Project profile recommendation: ${recommendation.recommendation_id}`);
  console.log(table(["Field", "Value"], [
    ["Profile", recommendation.selected_profile],
    ["Delivery", recommendation.delivery_mode_recommendation.recommended_mode],
    ["Confidence", recommendation.delivery_mode_recommendation.confidence],
    ["Blueprint", recommendation.blueprint ? `${recommendation.blueprint.name} (${recommendation.blueprint.key})` : ""],
    ["Prompt packs", recommendation.pack_router.selected_prompt_packs.join(", ") || "none"],
    ["Intake groups", recommendation.intake_groups.join(", ") || "none"],
    ["Risk level", recommendation.risk_level]
  ]));
  console.log("");
  console.log(`Reason: ${recommendation.profile_reason || "No routing reason recorded."}`);
}

function renderProjectProfileHelp() {
  return `Usage:
  kvdf project profile
  kvdf project profile route --goal "Build a SaaS product"
  kvdf project profile route --profile enterprise --goal "Build a hospital ERP"
  kvdf project profile status
  kvdf project profile report
  kvdf project profile --json

Notes:
  Project profile routing turns a project goal or existing codebase signals into one durable project profile record. It chooses Lite, Standard, or Enterprise, recommends a delivery mode, and suggests prompt packs and intake groups before Kabeeri starts generating work.
`;
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return {};
  }
}

function defaultResolveQuestionnaireGroups(profile) {
  const normalized = String(profile || "standard").toLowerCase();
  if (normalized === "lite") return ["core"];
  if (normalized === "enterprise") return ["core", "production", "extension"];
  return ["core", "production"];
}

module.exports = {
  projectProfile,
  buildProjectProfileRecommendation,
  persistProjectProfileRecommendation,
  readProjectProfileState,
  renderProjectProfileRecommendation,
  renderProjectProfileState,
  normalizeProjectProfileAction,
  normalizeProjectProfileChoice: normalizeProjectProfileChoice,
  collectProjectProfileText
};

function normalizeProjectProfileChoice(value) {
  const normalized = String(value || "").toLowerCase();
  if (["lite", "standard", "enterprise"].includes(normalized)) return normalized;
  if (!normalized) return "standard";
  throw new Error("Invalid project profile. Use lite, standard, or enterprise.");
}

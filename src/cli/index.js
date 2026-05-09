const { createWorkspace, defaultWorkstreams, ensureWorkspace, getStateDir, readJsonFile, writeJsonFile } = require("./workspace");
const { listDirectories, listFiles, readTextFile, writeTextFile, fileExists, repoRoot, resolveAsset, assertSafeName } = require("./fs_utils");
const { validateRepository } = require("./validate");
const { parseArgs, printHelp, printCommandHelp, table, normalizeCommandName } = require("./ui");

const VERSION = require("../../package.json").version;

async function run(argv) {
  const args = parseArgs(argv);

  if (args.flags.version && args.positionals.length === 0) {
    console.log(`kvdf ${VERSION}`);
    return;
  }

  if (args.flags.help && args.positionals.length > 0) {
    printCommandHelp(normalizeCommandName(args.positionals[0]));
    return;
  }

  if (args.flags.help || args.positionals.length === 0) {
    printHelp();
    return;
  }

  const [rawGroup, action, value, ...rest] = args.positionals;
  const group = normalizeCommandName(rawGroup);

  if (group === "doctor") return doctor();
  if (group === "validate") return validate(action);
  if (group === "init") return init(args.flags);
  if (group === "generator" || group === "generate") return generator(action, value, args.flags);
  if (group === "create") return generator("create", action, args.flags);
  if (group === "prompt-pack") return promptPack(action, value, args.flags);
  if (group === "wordpress" || group === "wp") return wordpress(action, value, args.flags, rest);
  if (group === "example") return example(action, value);
  if (group === "questionnaire") return questionnaire(action, value, args.flags);
  if (group === "vibe") return vibe(action, value, args.flags, rest);
  if (group === "ask") return vibe("ask", [action, value, ...rest].filter(Boolean).join(" "), args.flags);
  if (group === "capture") return vibe("capture", [action, value, ...rest].filter(Boolean).join(" "), args.flags);
  if (group === "capability") return capability(action, value, args.flags);
  if (group === "structure" || group === "foldering") return repositoryStructure(action, value, args.flags);
  if (group === "blueprint") return blueprint(action, value, args.flags, rest);
  if (group === "data-design") return dataDesign(action, value, args.flags, rest);
  if (group === "evolution") return evolution(action, value, args.flags, rest);
  if (group === "plan") return plan(action, value);
  if (group === "project" || group === "adopt") return projectAnalysis(action, value, args.flags, rest);
  if (group === "task") return task(action, value, args.flags);
  if (group === "workstream") return workstream(action, value, args.flags);
  if (group === "app") return customerApp(action, value, args.flags);
  if (group === "feature") return feature(action, value, args.flags);
  if (group === "journey") return journey(action, value, args.flags);
  if (group === "delivery") return deliveryMode(action, value, args.flags, rest);
  if (group === "structured" || group === "waterfall") return structured(action, value, args.flags, rest);
  if (group === "agile") return agile(action, value, args.flags, rest);
  if (group === "sprint") return sprint(action, value, args.flags);
  if (group === "session") return session(action, value, args.flags);
  if (group === "acceptance") return acceptance(action, value, args.flags);
  if (group === "audit") return audit(action, value, args.flags);
  if (group === "memory") return memory(action, value, args.flags);
  if (group === "adr") return adr(action, value, args.flags);
  if (group === "ai-run" || group === "airun") return aiRun(action, value, args.flags);
  if (group === "developer") return identity("developers", action, value, args.flags);
  if (group === "owner") return owner(action, value, args.flags);
  if (group === "agent") return identity("agents", action, value, args.flags);
  if (group === "lock") return lock(action, value, args.flags);
  if (group === "vscode") return vscode(action, value, args.flags);
  if (group === "docs" || group === "doc") return docsSite(action, value, args.flags);
  if (group === "dashboard") return dashboard(action, value, args.flags);
  if (group === "report" || group === "reports") return reports(action, value, args.flags);
  if (group === "readiness") return runtimeReport("readiness", action, value, args.flags);
  if (group === "governance") return runtimeReport("governance", action, value, args.flags);
  if (group === "release") return release(action, value, args.flags);
  if (group === "github") return github(action, value, args.flags);
  if (group === "package" || group === "packaging") return productPackage(action, value, args.flags);
  if (group === "upgrade") return upgrade(action, value, args.flags);
  if (group === "token") return token(action, value, args.flags);
  if (group === "budget") return budget(action, value, args.flags);
  if (group === "pricing") return pricing(action, value, args.flags);
  if (group === "usage") return usage(action, value, args.flags);
  if (group === "design") return design(action, value, args.flags);
  if (group === "policy") return policy(action, value, args.flags);
  if (group === "context-pack" || group === "context") return contextPack(action, value, args.flags);
  if (group === "preflight") return preflight(action, value, args.flags);
  if (group === "model-route" || group === "routing") return modelRoute(action, value, args.flags);
  if (group === "handoff") return handoff(action, value, args.flags);
  if (group === "security" || group === "secret" || group === "secrets") return security(action, value, args.flags);
  if (group === "migration" || group === "migrate") return migration(action, value, args.flags);

  throw new Error(`Unknown command: ${rawGroup}${suggestCommand(rawGroup)}`);
}

function suggestCommand(command) {
  const known = ["init", "doctor", "validate", "generator", "generate", "create", "prompt-pack", "wordpress", "wp", "example", "questionnaire", "vibe", "ask", "capture", "capability", "structure", "foldering", "blueprint", "data-design", "evolution", "plan", "project", "adopt", "task", "workstream", "app", "feature", "journey", "structured", "waterfall", "delivery", "agile", "sprint", "session", "acceptance", "audit", "memory", "adr", "ai-run", "developer", "owner", "agent", "lock", "vscode", "docs", "doc", "dashboard", "report", "reports", "readiness", "governance", "release", "github", "package", "packaging", "upgrade", "token", "budget", "pricing", "usage", "design", "policy", "context-pack", "context", "preflight", "model-route", "routing", "handoff", "security", "secret", "secrets", "migration", "migrate"];
  const best = known
    .map((item) => ({ item, distance: levenshtein(command, item) }))
    .sort((a, b) => a.distance - b.distance)[0];
  return best && best.distance <= 3 ? `. Did you mean "${best.item}"?` : "";
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

function doctor() {
  const checks = [
    ["Repo root", repoRoot()],
    ["Node", process.version],
    [".kabeeri", fileExists(getStateDir()) ? "present" : "missing"],
    ["Generators", listFiles("generators", ".json").length.toString()],
    ["Prompt packs", listDirectories("prompt_packs").length.toString()],
    ["Examples", listDirectories("examples").filter((name) => name !== "README.md").length.toString()]
  ];

  console.log("Kabeeri VDF doctor");
  console.log(table(["Check", "Value"], checks));
}

function validate(scope) {
  const result = validateRepository(scope || "all");
  for (const line of result.lines) console.log(line);
  if (!result.ok) process.exitCode = 1;
}

async function init(flags) {
  const profile = flags.profile || "standard";
  const mode = flags.mode || "structured";
  const lang = flags.lang || flags.language || "user";
  const created = createWorkspace({ profile, mode, lang });

  console.log("Initialized Kabeeri workspace state.");
  console.log(table(["File", "Status"], created.map((item) => [item.path, item.status])));
  const intake = await runInitIntake(flags);
  refreshDashboardArtifacts();
  if (!intake) {
    console.log("");
    console.log("Next: tell your AI assistant what you want to build, or run:");
    console.log('kvdf init --goal "Build ecommerce store with Laravel backend and Next.js frontend"');
  }
}

async function runInitIntake(flags = {}) {
  if (flags["no-intake"] || flags.skipIntake) return null;
  const goal = flags.goal || flags.app || flags.description || flags.project || flags.text || await promptForInitialProjectGoal(flags);
  if (!goal) return null;
  const plan = questionnaireIntakePlan(goal, {
    ...flags,
    description: goal,
    source: "init_intake",
    silent: true,
    json: false
  });
  const docsTasks = createDocsFirstTasksFromIntakePlan(plan, flags);
  console.log("");
  console.log("Initial project intake created.");
  console.log(table(["Item", "Value"], [
    ["Goal", goal],
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Questions", plan.generated_questions.length],
    ["Docs-first tasks", docsTasks.length]
  ]));
  console.log("");
  console.log("Ask the developer only these generated questions first. Do not start implementation until docs-first tasks are reviewed.");
  return { plan, docsTasks };
}

async function promptForInitialProjectGoal(flags = {}) {
  if (flags.yes || flags.nonInteractive || flags["non-interactive"]) return "";
  if (!process.stdin.isTTY || !process.stdout.isTTY) return "";
  const readline = require("readline/promises");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question("What software application do you want to build? Write one short sentence: ");
    return String(answer || "").trim();
  } finally {
    rl.close();
  }
}

function createDocsFirstTasksFromIntakePlan(plan, flags = {}) {
  if (!plan || flags["no-doc-tasks"]) return [];
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const alreadyCreated = data.tasks.some((taskItem) => taskItem.source === `init_intake:${plan.plan_id}`);
  if (alreadyCreated) return [];
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const createdAt = new Date().toISOString();
  const seeds = [
    ["Project intake answers", "Record the developer/client answers for the generated intake questions."],
    ["Product scope document", "Document product goal, app boundaries, users, modules, and out-of-scope items."],
    ["Architecture and stack decision", "Document backend, frontend, mobile, database, integrations, and delivery mode decisions."],
    ["Data design document", "Document core entities, relationships, snapshots, indexes, constraints, audit, and migration safety."],
    ["UI/UX direction document", "Document user journeys, key pages, design source, accessibility, responsive rules, and dashboard expectations."],
    ["Implementation task backlog", "Convert approved documentation into implementation tasks only after the docs-first gate is reviewed."]
  ];
  const tasks = seeds.map(([title, acceptance]) => ({
    id: nextId(),
    title,
    status: "proposed",
    type: "documentation",
    workstream: "docs",
    workstreams: ["docs"],
    source: `init_intake:${plan.plan_id}`,
    intake_plan_id: plan.plan_id,
    phase: "docs_first",
    docs_first_gate: true,
    implementation_blocker: title !== "Implementation task backlog",
    acceptance_criteria: [acceptance],
    created_at: createdAt
  }));
  data.tasks.push(...tasks);
  writeJsonFile(file, data);
  for (const taskItem of tasks) {
    appendAudit("task.created", "task", taskItem.id, `Docs-first task created: ${taskItem.title}`);
  }
  return tasks;
}

function generator(action, value, flags) {
  if (!action && flags.profile) {
    assertSafeName(flags.profile);
    const file = `generators/${flags.profile}.json`;
    if (!fileExists(file)) throw new Error(`Generator not found: ${flags.profile}`);
    return createProjectSkeleton(readJsonFile(file), flags);
  }

  if (!action || action === "list") {
    const rows = listFiles("generators", ".json").map((file) => {
      const data = readJsonFile(file);
      return [data.profile || file.replace(/\.json$/, ""), data.folder_count || "", data.description || ""];
    });
    console.log(table(["Profile", "Folders", "Description"], rows));
    return;
  }

  const profile = value || flags.profile || action;
  assertSafeName(profile);
  const file = `generators/${profile}.json`;
  if (!fileExists(file)) throw new Error(`Generator not found: ${profile}`);
  const data = readJsonFile(file);

  if (action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "create" || action === "scaffold" || flags.output) {
    return createProjectSkeleton(data, flags);
  }

  if (value || flags.profile) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  throw new Error(`Unknown generator action: ${action}`);
}

function createProjectSkeleton(generatorData, flags) {
  const fs = require("fs");
  const path = require("path");
  const output = flags.output || `${generatorData.profile || "kabeeri"}-project`;
  const outputPath = path.resolve(repoRoot(), output);
  const force = Boolean(flags.force);

  if (fs.existsSync(outputPath) && !force) {
    const existing = fs.readdirSync(outputPath);
    if (existing.length > 0) {
      throw new Error(`Output directory is not empty: ${output}. Use --force to write into it.`);
    }
  }

  fs.mkdirSync(outputPath, { recursive: true });
  const created = [];
  const folders = generatorData.folders || [];

  for (const folder of folders) {
    const folderPath = path.join(outputPath, folder.path);
    fs.mkdirSync(folderPath, { recursive: true });
    created.push(path.relative(outputPath, folderPath).replace(/\\/g, "/"));
    const readmePath = path.join(folderPath, "README.md");
    writeIfAllowed(readmePath, buildFolderReadme(generatorData, folder), force);
    created.push(path.relative(outputPath, readmePath).replace(/\\/g, "/"));
  }

  const manifest = {
    framework: "Kabeeri VDF",
    generated_at: new Date().toISOString(),
    profile: generatorData.profile,
    generator_version: generatorData.generator_version,
    folder_count: folders.length,
    generation_mode: generatorData.generation_mode,
    output,
    files: created
  };

  writeIfAllowed(path.join(outputPath, "kabeeri.generated.json"), `${JSON.stringify(manifest, null, 2)}\n`, force);
  writeIfAllowed(path.join(outputPath, "README.md"), buildProjectReadme(generatorData), force);
  const createdTasks = createGeneratorGovernanceTasks(generatorData, output, flags);
  refreshDashboardArtifacts();
  console.log(`Generated ${folders.length} folders in ${output}`);
  if (createdTasks.length) console.log(`Created ${createdTasks.length} governance task(s) for ${output}.`);
}

function createGeneratorGovernanceTasks(generatorData, output, flags = {}) {
  if (flags["no-tasks"] || flags.noTasks || !localFileExists(".kabeeri/tasks.json")) return [];
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const profile = generatorData.profile || "generated";
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const createdAt = new Date().toISOString();
  const taskSeeds = [
    {
      title: `Review generated ${profile} project skeleton`,
      workstream: "docs",
      acceptance: `Generated folder map for ${output} is reviewed and matches the intended application boundary.`
    },
    {
      title: `Implement ${profile} foundation from approved tasks`,
      workstream: inferGeneratorWorkstream(profile),
      acceptance: "No implementation work starts until the owner approves the scoped task list."
    },
    {
      title: `Validate ${profile} generated project and dashboard state`,
      workstream: "qa",
      acceptance: "Dashboard, task tracker, readiness, and usage summaries refresh after generation."
    }
  ];
  const created = taskSeeds.map((seed) => ({
    id: nextId(),
    title: seed.title,
    status: "proposed",
    type: "project_setup",
    workstream: seed.workstream,
    workstreams: [seed.workstream],
    app_username: null,
    app_usernames: [],
    app_paths: [output],
    sprint_id: flags.sprint || null,
    source: "generator",
    generator_profile: profile,
    generated_output: output,
    acceptance_criteria: [seed.acceptance],
    created_at: createdAt
  }));
  data.tasks.push(...created);
  writeJsonFile(file, data);
  for (const taskItem of created) {
    appendAudit("task.created", "task", taskItem.id, `Generator task created: ${taskItem.title}`);
  }
  return created;
}

function inferGeneratorWorkstream(profile) {
  const value = String(profile || "").toLowerCase();
  if (/laravel|api|backend|server/.test(value)) return "backend";
  if (/next|react|vue|angular|frontend|website|web/.test(value)) return "public_frontend";
  if (/mobile|expo|native|flutter/.test(value)) return "mobile";
  if (/database|sql|data/.test(value)) return "database";
  return "unassigned";
}

function writeIfAllowed(filePath, content, force) {
  const fs = require("fs");
  const path = require("path");
  if (fs.existsSync(filePath) && !force) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function buildProjectReadme(generatorData) {
  return `# Kabeeri Project Skeleton

Profile: ${generatorData.profile}

${generatorData.description || ""}

## Generation Rule

${generatorData.core_rule || "Use this skeleton as a planning workspace before implementation."}

## Next Steps

1. Answer folder questionnaires or notes for each folder.
2. Create tasks in \`.kabeeri/tasks.json\` with \`kvdf task create\`.
3. Track AI usage with \`kvdf usage record\`.
4. Verify completed work with Owner approval.
`;
}

function buildFolderReadme(generatorData, folder) {
  return `# ${folder.path}

Layer: ${folder.layer || "unspecified"}

## Purpose

${folder.purpose || "No purpose documented."}

## Policy

${folder.detailed_documents_policy || generatorData.core_rule || "Do not generate detailed documents until inputs are reviewed."}
`;
}

function promptPack(action, name, flags = {}) {
  if (!action || action === "list") {
    const rows = listDirectories("prompt_packs")
      .map((pack) => {
        const manifest = `prompt_packs/${pack}/prompt_pack_manifest.json`;
        if (!fileExists(manifest)) return [pack, "", "missing manifest"];
        const data = readJsonFile(manifest);
        return [pack, data.display_name || data.pack || pack, data.version || ""];
      });
    console.log(table(["Pack", "Display", "Version"], rows));
    return;
  }

  if (action === "common") {
    const manifest = readJsonFile("prompt_packs/common/prompt_pack_manifest.json");
    if (flags.json) console.log(JSON.stringify(manifest, null, 2));
    else console.log(table(["Layer", "Version", "Files"], [[manifest.display_name || manifest.pack, manifest.version || "", (manifest.files || []).length]]));
    return;
  }

  if (action === "compose" || action === "build") {
    if (!name) throw new Error("Missing prompt pack name.");
    return composePromptPack(name, flags);
  }

  if (["composition-list", "compositions", "compiled", "history"].includes(action)) {
    const data = readJsonFile(".kabeeri/prompt_layer/compositions.json");
    const rows = (data.compositions || []).map((item) => [
      item.composition_id,
      item.pack,
      item.task_id || "",
      item.context_pack_id || "",
      item.output_path || "",
      item.estimated_tokens || 0
    ]);
    console.log(table(["Composition", "Pack", "Task", "Context", "Output", "Tokens"], rows));
    return;
  }

  if (action === "composition-show") {
    const id = flags.id || name;
    const data = readJsonFile(".kabeeri/prompt_layer/compositions.json");
    const item = (data.compositions || []).find((entry) => entry.composition_id === id);
    if (!item) throw new Error(`Prompt composition not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "show" || action === "validate") {
    if (!name) throw new Error(`Missing prompt pack name.`);
    assertSafeName(name);
    const manifest = `prompt_packs/${name}/prompt_pack_manifest.json`;
    if (!fileExists(manifest)) throw new Error(`Prompt pack not found: ${name}`);
    const data = readJsonFile(manifest);
    if (action === "show") console.log(JSON.stringify(data, null, 2));
    else console.log(`Prompt pack "${name}" is valid.`);
    return;
  }

  if (action === "export" || action === "use") {
    if (!name) throw new Error("Missing prompt pack name.");
    assertSafeName(name);
    const source = `prompt_packs/${name}`;
    if (!fileExists(`${source}/prompt_pack_manifest.json`)) throw new Error(`Prompt pack not found: ${name}`);
    const output = flags.output || (action === "use" ? `07_AI_CODE_PROMPTS/${name}` : `exported-${name}-prompt-pack`);
    exportDirectory(source, output, Boolean(flags.force));
    console.log(`${action === "use" ? "Installed" : "Exported"} prompt pack ${name} to ${output}`);
    return;
  }

  throw new Error(`Unknown prompt-pack action: ${action}`);
}

function wordpress(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureWordPressState();

  if (!action || action === "help" || action === "status" || action === "list") {
    const state = readJsonFile(".kabeeri/wordpress.json");
    console.log("WordPress capability");
    console.log(table(["Area", "Value"], [
      ["Analyses", state.analyses.length],
      ["Plans", state.plans.length],
      ["Scaffolds", state.scaffolds.length],
      ["Current plan", state.current_plan_id || "none"]
    ]));
    console.log("");
    console.log(table(["Command", "Purpose"], [
      ["wordpress analyze --path <folder>", "Analyze an existing WordPress site before changes."],
      ["wordpress plan \"site description\"", "Create a WordPress build/adoption plan."],
      ["wordpress tasks --plan <id>", "Create governed tasks from the latest or selected WordPress plan."],
      ["wordpress plugin plan \"plugin description\" --name <Name>", "Create a governed WordPress plugin development plan."],
      ["wordpress plugin tasks --plan <id>", "Create governed tasks from the latest or selected plugin plan."],
      ["wordpress scaffold plugin --name <Name>", "Create a safe starter plugin skeleton."],
      ["wordpress scaffold theme --name <Name>", "Create a safe starter theme skeleton."],
      ["wordpress scaffold child-theme --name <Name> --parent <theme>", "Create a child theme skeleton."]
    ]));
    return;
  }

  if (action === "analyze" || action === "analyse") {
    const targetPath = resolveWordPressTargetPath(flags.path || value || rest[0] || ".");
    const analysis = analyzeWordPressProject(targetPath, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.analyses.push(analysis);
    state.current_analysis_id = analysis.analysis_id;
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.analyzed", "wordpress", analysis.analysis_id, `WordPress project analyzed: ${analysis.relative_path}`);
    if (flags.json) console.log(JSON.stringify(analysis, null, 2));
    else renderWordPressAnalysis(analysis);
    return;
  }

  if (action === "plan") {
    const description = [value, ...rest].filter(Boolean).join(" ") || flags.description || flags.type || "WordPress website";
    const plan = buildWordPressPlan(description, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.plans.push(plan);
    state.current_plan_id = plan.plan_id;
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.plan_created", "wordpress_plan", plan.plan_id, `WordPress plan created for ${plan.site_type}`);
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderWordPressPlan(plan);
    return;
  }

  if (action === "tasks" || action === "create-tasks") {
    const plan = findWordPressPlan(flags.plan || value);
    const tasks = createTasksFromWordPressPlan(plan, flags);
    appendAudit("wordpress.tasks_created", "wordpress_plan", plan.plan_id, `Created ${tasks.length} WordPress tasks`);
    if (flags.json) console.log(JSON.stringify({ plan_id: plan.plan_id, tasks }, null, 2));
    else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
    return;
  }

  if (action === "plugin" || action === "plugins") {
    const pluginAction = value || "status";
    if (pluginAction === "plan") {
      const description = rest.filter(Boolean).join(" ") || flags.description || flags.name || "WordPress plugin";
      const plan = buildWordPressPluginPlan(description, flags);
      const state = readJsonFile(".kabeeri/wordpress.json");
      state.plugin_plans = state.plugin_plans || [];
      state.plugin_plans.push(plan);
      state.current_plugin_plan_id = plan.plugin_plan_id;
      writeJsonFile(".kabeeri/wordpress.json", state);
      appendAudit("wordpress.plugin_plan_created", "wordpress_plugin_plan", plan.plugin_plan_id, `WordPress plugin plan created: ${plan.slug}`);
      if (flags.json) console.log(JSON.stringify(plan, null, 2));
      else renderWordPressPluginPlan(plan);
      return;
    }
    if (pluginAction === "tasks" || pluginAction === "create-tasks") {
      const plan = findWordPressPluginPlan(flags.plan || rest[0]);
      const tasks = createTasksFromWordPressPluginPlan(plan, flags);
      appendAudit("wordpress.plugin_tasks_created", "wordpress_plugin_plan", plan.plugin_plan_id, `Created ${tasks.length} WordPress plugin tasks`);
      if (flags.json) console.log(JSON.stringify({ plugin_plan_id: plan.plugin_plan_id, tasks }, null, 2));
      else console.log(table(["Task", "Title", "Workstream"], tasks.map((item) => [item.id, item.title, item.workstream || ""])));
      return;
    }
    if (pluginAction === "scaffold") {
      const result = scaffoldWordPress("plugin", flags);
      const state = readJsonFile(".kabeeri/wordpress.json");
      state.scaffolds.push(result);
      writeJsonFile(".kabeeri/wordpress.json", state);
      appendAudit("wordpress.plugin_scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress plugin scaffold created: ${result.slug}`);
      if (flags.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`Created WordPress plugin scaffold at ${result.path}`);
        console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
      }
      return;
    }
    if (pluginAction === "checklist") {
      const checklist = buildWordPressPluginAcceptanceChecklist(flags.type || rest[0] || "general");
      if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
      else checklist.forEach((item) => console.log(`- ${item}`));
      return;
    }
    throw new Error(`Unknown wordpress plugin action: ${pluginAction}`);
  }

  if (action === "scaffold") {
    const scaffoldType = value || flags.type || rest[0] || "plugin";
    const result = scaffoldWordPress(scaffoldType, flags);
    const state = readJsonFile(".kabeeri/wordpress.json");
    state.scaffolds.push(result);
    writeJsonFile(".kabeeri/wordpress.json", state);
    appendAudit("wordpress.scaffold_created", "wordpress_scaffold", result.scaffold_id, `WordPress ${result.type} scaffold created: ${result.slug}`);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`Created WordPress ${result.type} scaffold at ${result.path}`);
      console.log(table(["File", "Status"], result.files.map((file) => [file, "created"])));
    }
    return;
  }

  if (action === "checklist") {
    const checklist = buildWordPressAcceptanceChecklist(flags.type || value || "general");
    if (flags.json) console.log(JSON.stringify({ checklist }, null, 2));
    else checklist.forEach((item) => console.log(`- ${item}`));
    return;
  }

  throw new Error(`Unknown wordpress action: ${action}`);
}

function ensureWordPressState() {
  if (!fileExists(".kabeeri/wordpress.json")) {
    writeJsonFile(".kabeeri/wordpress.json", { analyses: [], plans: [], plugin_plans: [], scaffolds: [], current_analysis_id: null, current_plan_id: null, current_plugin_plan_id: null });
  }
}

function resolveWordPressTargetPath(input) {
  const fs = require("fs");
  const path = require("path");
  const targetPath = path.resolve(repoRoot(), input || ".");
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`WordPress path not found or not a directory: ${input}`);
  }
  return targetPath;
}

function analyzeWordPressProject(targetPath, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const rel = path.relative(repoRoot(), targetPath).replace(/\\/g, "/") || ".";
  const files = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(fs.readdirSync(targetPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name));
  const contentPath = path.join(targetPath, "wp-content");
  const pluginPath = path.join(contentPath, "plugins");
  const themePath = path.join(contentPath, "themes");
  const plugins = fs.existsSync(pluginPath) ? fs.readdirSync(pluginPath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const themes = fs.existsSync(themePath) ? fs.readdirSync(themePath, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort() : [];
  const features = [];
  if (dirs.has("wp-content")) features.push("wp_content");
  if (files.has("wp-config.php")) features.push("wp_config");
  if (dirs.has("wp-admin") || dirs.has("wp-includes")) features.push("wordpress_core_present");
  if (plugins.includes("woocommerce")) features.push("woocommerce");
  if (plugins.includes("advanced-custom-fields") || plugins.includes("advanced-custom-fields-pro")) features.push("acf");
  if (plugins.includes("elementor") || plugins.includes("elementor-pro")) features.push("page_builder");
  if (plugins.includes("wordpress-seo") || plugins.includes("rank-math")) features.push("seo_plugin");
  const riskSignals = [];
  if (!dirs.has("wp-content") && !files.has("wp-config.php")) riskSignals.push("not_wordpress_root_or_missing_wp_content");
  if (files.has("wp-config.php")) riskSignals.push("wp_config_present_review_secrets");
  if (!flags.staging) riskSignals.push("staging_not_confirmed");
  if (!flags.backup) riskSignals.push("backup_not_confirmed");
  if (!plugins.length && dirs.has("wp-content")) riskSignals.push("plugins_not_detected_or_empty");
  const detectedType = features.includes("woocommerce") ? "woocommerce" : features.includes("wp_content") || features.includes("wp_config") ? "wordpress_site" : "unknown";
  const blueprint = features.includes("woocommerce") ? "ecommerce" : inferWordPressBlueprint(flags.type || flags.description || rel);
  return {
    analysis_id: `wordpress-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf wordpress analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_type: detectedType,
    detected_features: features,
    plugins,
    themes,
    recommended_blueprint: blueprint,
    recommended_prompt_pack: "wordpress",
    risk_level: riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low",
    risk_signals: riskSignals,
    forbidden_paths: ["wp-admin/", "wp-includes/", "wp-config.php", ".env", "uploads/"],
    allowed_change_zones: ["wp-content/plugins/<custom-plugin>/", "wp-content/themes/<child-or-custom-theme>/", "wp-content/mu-plugins/<custom-mu-plugin>/"],
    next_actions: [
      "Confirm staging and backup before editing.",
      `Run \`kvdf wordpress plan --mode existing --type ${detectedType === "woocommerce" ? "woocommerce" : blueprint}\`.`,
      "Use `kvdf prompt-pack compose wordpress --task <task-id>` for implementation tasks.",
      "Do not modify WordPress core files or production secrets.",
      "Create governed tasks with explicit plugin/theme scope before code changes."
    ]
  };
}

function buildWordPressPlan(description, flags = {}) {
  const mode = flags.mode || (flags.existing ? "existing" : "new");
  const siteType = flags.type || inferWordPressSiteType(description);
  const blueprintKey = flags.blueprint || inferWordPressBlueprint(siteType || description);
  const isExisting = mode === "existing" || mode === "adoption";
  const isWoo = siteType === "woocommerce" || blueprintKey === "ecommerce";
  const plan = {
    plan_id: flags.id || `wordpress-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plan",
    description,
    mode,
    site_type: siteType,
    blueprint_key: blueprintKey,
    delivery_mode: flags.delivery || (isExisting || isWoo ? "structured" : "agile"),
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      isExisting ? "kvdf wordpress analyze --path . --staging --backup" : "kvdf init --profile standard --mode agile",
      `kvdf blueprint recommend "${description}"`,
      `kvdf questionnaire plan "${description}" --framework wordpress --blueprint ${blueprintKey}`,
      `kvdf data-design context ${blueprintKey}`,
      `kvdf design recommend ${blueprintKey}`,
      "kvdf wordpress tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf handoff package --id wordpress-handoff --audience owner"
    ],
    phases: buildWordPressPhases(mode, siteType, blueprintKey),
    task_templates: buildWordPressTaskTemplates(mode, siteType, blueprintKey),
    acceptance_checklist: buildWordPressAcceptanceChecklist(siteType),
    safety_rules: [
      "Never edit wp-admin or wp-includes.",
      "Never commit wp-config.php secrets.",
      "Use a child theme or custom plugin for changes unless the Owner approves another route.",
      "Use staging and backup for existing sites.",
      "Keep WooCommerce order, payment, tax, and stock changes behind explicit tasks and review."
    ]
  };
  if (flags.analysis) plan.analysis_id = flags.analysis;
  return plan;
}

function buildWordPressPhases(mode, siteType, blueprintKey) {
  const base = mode === "existing"
    ? ["Analyze existing site", "Confirm staging backup and rollback", "Map plugins themes content and risks", "Plan controlled changes"]
    : ["Define site purpose and blueprint", "Choose theme/plugin strategy", "Plan content model and pages", "Scaffold safe extension layer"];
  const implementation = [
    "Build custom plugin/theme or child theme in scoped files",
    "Configure SEO accessibility performance and security",
    "Test forms content flows permissions and responsive behavior",
    "Prepare handoff rollback notes and Owner verification"
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    implementation.splice(1, 0, "Validate WooCommerce catalog checkout payments shipping tax stock and emails");
  }
  return [...base, ...implementation].map((title, index) => ({
    phase_id: `wp-phase-${String(index + 1).padStart(2, "0")}`,
    title,
    status: "planned"
  }));
}

function buildWordPressTaskTemplates(mode, siteType, blueprintKey) {
  const tasks = [
    ["WordPress discovery and scope confirmation", "docs", ["Staging and backup status recorded.", "Forbidden paths listed.", "Implementation route selected."]],
    ["WordPress content model and page map", "public_frontend", ["Pages, CPTs, taxonomies, menus, and forms are documented.", "SEO/GEO requirements are listed."]],
    ["WordPress safe extension scaffold", "backend", ["Custom plugin, theme, or child theme scaffold exists.", "No WordPress core files changed."]],
    ["WordPress UI implementation and responsive review", "public_frontend", ["Desktop/mobile states reviewed.", "Accessibility and semantic HTML considered."]],
    ["WordPress security performance and release review", "security", ["Security scan executed.", "Caching/performance risks reviewed.", "Rollback and handoff notes prepared."]]
  ];
  if (siteType === "woocommerce" || blueprintKey === "ecommerce") {
    tasks.splice(2, 0, ["WooCommerce catalog checkout and order flow", "backend", ["Products, cart, checkout, payment, shipping, tax, stock, and emails are covered.", "No live payment changes without sandbox evidence."]]);
  }
  if (mode === "existing") {
    tasks.unshift(["Existing WordPress site analysis", "docs", ["Plugins and themes detected.", "Risks and next actions recorded.", "Owner approves scope before changes."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressAcceptanceChecklist(siteType) {
  const checklist = [
    "WordPress core paths are not modified directly.",
    "Existing sites have staging and backup confirmed before changes.",
    "wp-config.php secrets are not copied into prompts or commits.",
    "Implementation scope chooses custom plugin, custom theme, or child theme explicitly.",
    "CPTs, taxonomies, shortcodes, admin settings, REST routes, and templates are documented when used.",
    "Nonces, capabilities, sanitization, escaping, and validation are reviewed.",
    "Responsive, accessibility, SEO/GEO, sitemap/schema, forms, and error states are reviewed.",
    "Handoff includes changed files, plugin/theme activation notes, rollback notes, and tests."
  ];
  if (siteType === "woocommerce") {
    checklist.push("WooCommerce checkout, payment sandbox, tax, shipping, stock, emails, refunds, and order statuses are reviewed.");
  }
  return checklist;
}

function buildWordPressPluginPlan(description, flags = {}) {
  const name = flags.name || inferWordPressPluginName(description);
  const slug = slugifyWordPressName(flags.slug || name);
  const pluginType = flags.type || inferWordPressPluginType(description);
  const plan = {
    plugin_plan_id: flags.id || `wordpress-plugin-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    source: "kvdf wordpress plugin plan",
    name,
    slug,
    description,
    plugin_type: pluginType,
    target_path: `wp-content/plugins/${slug}/`,
    delivery_mode: flags.delivery || "structured",
    recommended_prompt_pack: "wordpress",
    recommended_commands: [
      `kvdf wordpress plugin scaffold --name "${name}"`,
      "kvdf wordpress plugin tasks",
      "kvdf prompt-pack compose wordpress --task <task-id>",
      "kvdf security scan",
      "kvdf validate"
    ],
    architecture: buildWordPressPluginArchitecture(slug, pluginType),
    task_templates: buildWordPressPluginTaskTemplates(pluginType),
    acceptance_checklist: buildWordPressPluginAcceptanceChecklist(pluginType),
    safety_rules: [
      "Plugin code must live under wp-content/plugins/<plugin-slug>/ only.",
      "Use hooks, filters, CPTs, taxonomies, REST routes, shortcodes, blocks, or admin settings instead of editing WordPress core.",
      "Every form or state-changing request needs nonce and capability checks.",
      "Every input must be sanitized and every output escaped.",
      "Activation, deactivation, uninstall, migration, and rollback behavior must be documented before release."
    ]
  };
  return plan;
}

function buildWordPressPluginArchitecture(slug, pluginType) {
  const architecture = [
    { path: `${slug}.php`, purpose: "Plugin header, ABSPATH guard, constants, loader require, activation/deactivation hooks." },
    { path: "includes/class-plugin.php", purpose: "Central boot class that registers hooks and composes admin/public modules." },
    { path: "admin/class-admin.php", purpose: "Admin menus, settings pages, capability checks, settings validation." },
    { path: "public/class-public.php", purpose: "Shortcodes, frontend assets, public rendering, safe form handlers." },
    { path: "uninstall.php", purpose: "Explicit cleanup policy for options, custom tables, scheduled hooks, and plugin-owned data." },
    { path: "assets/css/ and assets/js/", purpose: "Scoped admin/public assets registered with WordPress enqueue APIs." },
    { path: "languages/", purpose: "Translation-ready text domain files." }
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    architecture.push({ path: "includes/class-content-types.php", purpose: "Custom post types, taxonomies, rewrite labels, and capability mapping." });
  }
  if (pluginType === "woocommerce") {
    architecture.push({ path: "includes/class-woocommerce.php", purpose: "WooCommerce hooks for checkout, products, orders, stock, emails, and refunds." });
  }
  if (pluginType === "integration") {
    architecture.push({ path: "includes/class-integration.php", purpose: "External API client, webhook verification, retries, and integration logs." });
  }
  return architecture;
}

function buildWordPressPluginTaskTemplates(pluginType) {
  const tasks = [
    ["Plugin requirements and boundaries", "docs", ["Plugin purpose, users, permissions, data ownership, and forbidden paths are documented.", "Activation, deactivation, uninstall, and rollback policy is clear."]],
    ["Plugin scaffold and bootstrapping", "backend", ["Plugin scaffold exists under wp-content/plugins only.", "ABSPATH guard, constants, loader, activation, deactivation, and uninstall files exist."]],
    ["Plugin security and permissions", "security", ["Nonces, capabilities, sanitization, escaping, validation, and direct access protection are reviewed.", "No secrets or production credentials are committed."]],
    ["Plugin admin and settings UX", "backend", ["Admin menus/settings use proper capabilities.", "Settings validation and error messages are implemented."]],
    ["Plugin public surface", "public_frontend", ["Shortcodes, blocks, templates, or frontend assets are scoped and accessible.", "Responsive, accessibility, and empty/error states are reviewed."]],
    ["Plugin testing and handoff", "qa", ["Activation/deactivation tested.", "Acceptance checklist completed.", "Handoff includes install, activation, rollback, changed files, and known risks."]]
  ];
  if (pluginType === "cpt" || pluginType === "booking" || pluginType === "business") {
    tasks.splice(3, 0, ["Custom post types and taxonomies", "backend", ["CPT labels, supports, capabilities, rewrite rules, and taxonomies are registered.", "Admin columns and content editing flow are reviewed."]]);
  }
  if (pluginType === "woocommerce") {
    tasks.splice(3, 0, ["WooCommerce extension flow", "backend", ["Checkout, products, orders, payment/shipping/tax/stock touchpoints are explicit.", "Sandbox evidence exists before payment or order lifecycle changes."]]);
  }
  if (pluginType === "integration") {
    tasks.splice(3, 0, ["External integration and webhooks", "backend", ["API credentials are stored safely.", "Webhook signatures, retries, logs, and failure states are handled."]]);
  }
  return tasks.map(([title, workstream, acceptance], index) => ({
    template_id: `wp-plugin-task-template-${String(index + 1).padStart(2, "0")}`,
    title,
    workstream,
    type: workstream === "docs" ? "planning" : workstream === "qa" || workstream === "security" ? "review" : "implementation",
    acceptance_criteria: acceptance
  }));
}

function buildWordPressPluginAcceptanceChecklist(pluginType) {
  const checklist = [
    "Plugin lives under wp-content/plugins/<plugin-slug>/ only.",
    "Plugin header, text domain, version, ABSPATH guard, and bootstrap are present.",
    "Activation and deactivation hooks are defined when needed.",
    "Uninstall behavior is explicit and does not delete customer data unexpectedly.",
    "Admin settings use capability checks and settings validation.",
    "All state-changing requests use nonces.",
    "All user input is sanitized and validated.",
    "All output is escaped for the correct context.",
    "REST routes define permissions callbacks.",
    "Shortcodes/blocks avoid unsafe HTML and handle empty/error states.",
    "Assets are enqueued through WordPress APIs and scoped to plugin screens where possible.",
    "No WordPress core, wp-config.php, uploads, or third-party plugin files are modified.",
    "Install, activation, rollback, and handoff notes are written."
  ];
  if (pluginType === "woocommerce") {
    checklist.push("WooCommerce checkout, order, stock, refund, tax, shipping, and email changes have sandbox evidence.");
  }
  if (pluginType === "integration") {
    checklist.push("External API failures, retries, webhook verification, and logs are covered.");
  }
  return checklist;
}

function findWordPressPluginPlan(planId) {
  const state = readJsonFile(".kabeeri/wordpress.json");
  const plans = state.plugin_plans || [];
  const id = planId || state.current_plugin_plan_id;
  const plan = plans.find((item) => item.plugin_plan_id === id) || plans[plans.length - 1];
  if (!plan) throw new Error("No WordPress plugin plan found. Run `kvdf wordpress plugin plan \"...\" --name <Name>` first.");
  return plan;
}

function createTasksFromWordPressPluginPlan(plan, flags = {}) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp-plugin";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: `${plan.name}: ${template.title}`,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plugin_plan",
      source_id: plan.plugin_plan_id,
      app_id: plan.slug,
      workstream: template.workstream || "backend",
      workstreams: [template.workstream || "backend"],
      allowed_files: [`wp-content/plugins/${plan.slug}/**`],
      forbidden_files: ["wp-admin/**", "wp-includes/**", "wp-config.php", "wp-content/uploads/**"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.plugin_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

function findWordPressPlan(planId) {
  const state = readJsonFile(".kabeeri/wordpress.json");
  const id = planId || state.current_plan_id;
  const plan = (state.plans || []).find((item) => item.plan_id === id) || (state.plans || [])[state.plans.length - 1];
  if (!plan) throw new Error("No WordPress plan found. Run `kvdf wordpress plan \"...\"` first.");
  return plan;
}

function createTasksFromWordPressPlan(plan, flags = {}) {
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const created = [];
  const prefix = flags.prefix || "wp";
  for (const template of plan.task_templates || []) {
    const id = `${prefix}-task-${String(data.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: template.title,
      type: template.type || "implementation",
      status: "proposed",
      source: "wordpress_plan",
      source_id: plan.plan_id,
      workstream: template.workstream || "public_frontend",
      workstreams: [template.workstream || "public_frontend"],
      acceptance_criteria: template.acceptance_criteria || [],
      risk_level: template.workstream === "security" || plan.site_type === "woocommerce" ? "medium" : "low",
      created_at: new Date().toISOString()
    };
    data.tasks.push(taskItem);
    created.push(taskItem);
  }
  writeJsonFile(file, data);
  return created;
}

function scaffoldWordPress(type, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const name = flags.name || flags.slug || `kabeeri-${type}`;
  const slug = slugifyWordPressName(name);
  assertSafeName(slug);
  const root = path.resolve(repoRoot(), flags.path || ".");
  const force = Boolean(flags.force);
  const normalizedType = String(type || "plugin").toLowerCase();
  if (!["plugin", "theme", "child-theme", "child"].includes(normalizedType)) throw new Error(`Unknown WordPress scaffold type: ${type}`);
  const isTheme = normalizedType === "theme" || normalizedType === "child-theme" || normalizedType === "child";
  const base = isTheme ? path.join(root, "wp-content", "themes", slug) : path.join(root, "wp-content", "plugins", slug);
  if (fs.existsSync(base) && fs.readdirSync(base).length && !force) throw new Error(`Scaffold path is not empty: ${path.relative(repoRoot(), base).replace(/\\/g, "/")}. Use --force to write into it.`);
  fs.mkdirSync(base, { recursive: true });
  const files = [];
  const write = (relative, content) => {
    const target = path.join(base, relative);
    if (fs.existsSync(target) && !force) return;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
    files.push(path.relative(repoRoot(), target).replace(/\\/g, "/"));
  };
  if (!isTheme) {
    write(`${slug}.php`, buildWordPressPluginMain(slug, name));
    write("includes/class-plugin.php", buildWordPressPluginClass(slug));
    write("admin/class-admin.php", buildWordPressPluginAdminClass(slug));
    write("public/class-public.php", buildWordPressPluginPublicClass(slug));
    write("uninstall.php", buildWordPressPluginUninstall(slug));
    write("assets/css/admin.css", "");
    write("assets/css/public.css", "");
    write("assets/js/admin.js", "");
    write("assets/js/public.js", "");
    write("languages/.gitkeep", "");
    write("README.md", buildWordPressScaffoldReadme("plugin", slug));
  } else {
    const parent = flags.parent || "twentytwentyfour";
    write("style.css", buildWordPressThemeStyle(slug, name, normalizedType === "child-theme" || normalizedType === "child" ? parent : null));
    write("functions.php", buildWordPressThemeFunctions(slug, Boolean(normalizedType === "child-theme" || normalizedType === "child")));
    write("README.md", buildWordPressScaffoldReadme(normalizedType === "theme" ? "theme" : "child-theme", slug));
  }
  return {
    scaffold_id: `wordpress-scaffold-${Date.now()}`,
    created_at: new Date().toISOString(),
    type: normalizedType === "child" ? "child-theme" : normalizedType,
    slug,
    path: path.relative(repoRoot(), base).replace(/\\/g, "/"),
    files
  };
}

function slugifyWordPressName(value) {
  return String(value || "kabeeri-wordpress").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kabeeri-wordpress";
}

function inferWordPressPluginName(text) {
  const value = String(text || "").trim();
  if (!value) return "Kabeeri WordPress Plugin";
  return value.split(/\s+/).slice(0, 5).join(" ").replace(/^build\s+/i, "").replace(/^create\s+/i, "") || "Kabeeri WordPress Plugin";
}

function inferWordPressPluginType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|checkout|cart|order|payment|shipping|stock|refund/.test(value)) return "woocommerce";
  if (/booking|appointment|clinic|reservation|حجز|عيادة/.test(value)) return "booking";
  if (/api|webhook|integration|sync|crm|erp|gateway/.test(value)) return "integration";
  if (/cpt|post type|taxonomy|directory|listing|portfolio|content/.test(value)) return "cpt";
  return "business";
}

function buildWordPressPluginMain(slug, name) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
/**
 * Plugin Name: ${name}
 * Description: Kabeeri-scaffolded WordPress plugin. Keep custom behavior here instead of editing WordPress core.
 * Version: 0.1.0
 * Author: Kabeeri VDF
 * Text Domain: ${slug}
 */

if (!defined('ABSPATH')) {
    exit;
}

define('${constantPrefix}_VERSION', '0.1.0');
define('${constantPrefix}_FILE', __FILE__);
define('${constantPrefix}_PATH', plugin_dir_path(__FILE__));
define('${constantPrefix}_URL', plugin_dir_url(__FILE__));

require_once ${constantPrefix}_PATH . 'includes/class-plugin.php';

register_activation_hook(__FILE__, ['${className}_Plugin', 'activate']);
register_deactivation_hook(__FILE__, ['${className}_Plugin', 'deactivate']);

add_action('plugins_loaded', ['${className}_Plugin', 'boot']);
`;
}

function buildWordPressPluginClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  const constantPrefix = slug.replace(/-/g, "_").toUpperCase();
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Plugin {
    public static function boot(): void {
        require_once ${constantPrefix}_PATH . 'admin/class-admin.php';
        require_once ${constantPrefix}_PATH . 'public/class-public.php';

        ${className}_Admin::boot();
        ${className}_Public::boot();
    }

    public static function activate(): void {
        flush_rewrite_rules();
    }

    public static function deactivate(): void {
        flush_rewrite_rules();
    }
}
`;
}

function buildWordPressPluginAdminClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Admin {
    public static function boot(): void {
        add_action('admin_menu', [__CLASS__, 'register_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    public static function register_menu(): void {
        add_options_page(
            __('${slug}', '${slug}'),
            __('${slug}', '${slug}'),
            'manage_options',
            '${slug}',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function register_settings(): void {
        register_setting('${slug}', '${slug}_settings', [
            'type' => 'array',
            'sanitize_callback' => [__CLASS__, 'sanitize_settings'],
            'default' => [],
        ]);
    }

    public static function sanitize_settings(array $settings): array {
        return array_map('sanitize_text_field', $settings);
    }

    public static function render_settings_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', '${slug}'));
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('${slug}', '${slug}'); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields('${slug}'); ?>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
`;
}

function buildWordPressPluginPublicClass(slug) {
  const className = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("_");
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

final class ${className}_Public {
    public static function boot(): void {
        add_shortcode('${slug}', [__CLASS__, 'render_shortcode']);
    }

    public static function render_shortcode(array $atts = []): string {
        $atts = shortcode_atts([], $atts, '${slug}');
        return '<div class="${slug}">' . esc_html__('${slug} is ready.', '${slug}') . '</div>';
    }
}
`;
}

function buildWordPressPluginUninstall(slug) {
  return `<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Keep customer data by default. Add explicit cleanup here only when the Owner approves data removal.
delete_option('${slug}_settings');
`;
}

function buildWordPressThemeStyle(slug, name, parent) {
  return `/*
Theme Name: ${name}
${parent ? `Template: ${parent}\n` : ""}Theme URI: https://example.com/
Author: Kabeeri VDF
Description: Kabeeri-scaffolded ${parent ? "child" : "custom"} theme. Keep edits scoped and review responsive/accessibility states.
Version: 0.1.0
Text Domain: ${slug}
*/
`;
}

function buildWordPressThemeFunctions(slug, isChild) {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_enqueue_scripts', function (): void {
    ${isChild ? "wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');\n    " : ""}wp_enqueue_style('${slug}-style', get_stylesheet_uri(), [], '0.1.0');
});
`;
}

function buildWordPressScaffoldReadme(type, slug) {
  return `# ${slug}

Type: WordPress ${type}

Generated by Kabeeri VDF.

## Safety

- Do not edit WordPress core files.
- Keep each change attached to a governed Kabeeri task.
- Use \`kvdf prompt-pack compose wordpress --task <task-id>\` before implementation.
- Run security, accessibility, responsive, and handoff checks before delivery.
`;
}

function inferWordPressSiteType(text) {
  const value = String(text || "").toLowerCase();
  if (/woo|woocommerce|store|shop|ecommerce|checkout|cart|product|متجر/.test(value)) return "woocommerce";
  if (/blog|article|personal|مدونة|مقالات/.test(value)) return "blog";
  if (/news|magazine|أخبار/.test(value)) return "news";
  if (/booking|appointment|clinic|حجز|عيادة/.test(value)) return "booking";
  return "corporate";
}

function inferWordPressBlueprint(text) {
  const type = inferWordPressSiteType(text);
  if (type === "woocommerce") return "ecommerce";
  if (type === "blog") return "blog";
  if (type === "news") return "news_website";
  if (type === "booking") return "booking";
  return "corporate_website";
}

function renderWordPressAnalysis(analysis) {
  console.log("WordPress analysis written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected type", analysis.detected_type],
    ["Features", analysis.detected_features.join(", ") || "none"],
    ["Plugins", analysis.plugins.slice(0, 8).join(", ") || "none"],
    ["Themes", analysis.themes.slice(0, 8).join(", ") || "none"],
    ["Blueprint", analysis.recommended_blueprint],
    ["Risk", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  analysis.next_actions.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPlan(plan) {
  console.log("WordPress plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plan_id],
    ["Mode", plan.mode],
    ["Site type", plan.site_type],
    ["Blueprint", plan.blueprint_key],
    ["Delivery", plan.delivery_mode],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Phases:");
  plan.phases.forEach((item) => console.log(`- ${item.phase_id}: ${item.title}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

function renderWordPressPluginPlan(plan) {
  console.log("WordPress plugin plan written to .kabeeri/wordpress.json");
  console.log(table(["Field", "Value"], [
    ["Plan", plan.plugin_plan_id],
    ["Name", plan.name],
    ["Slug", plan.slug],
    ["Type", plan.plugin_type],
    ["Path", plan.target_path],
    ["Prompt pack", plan.recommended_prompt_pack]
  ]));
  console.log("");
  console.log("Architecture:");
  plan.architecture.forEach((item) => console.log(`- ${item.path}: ${item.purpose}`));
  console.log("");
  console.log("Recommended commands:");
  plan.recommended_commands.forEach((item) => console.log(`- ${item}`));
}

function ensurePromptLayerState() {
  const fs = require("fs");
  const path = require("path");
  if (fileExists(".kabeeri")) {
    fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "prompt_layer"), { recursive: true });
    if (!fileExists(".kabeeri/prompt_layer/compositions.json")) writeJsonFile(".kabeeri/prompt_layer/compositions.json", { compositions: [] });
  }
}

function composePromptPack(packName, flags = {}) {
  ensureWorkspace();
  ensurePromptLayerState();
  assertSafeName(packName);
  const manifestPath = `prompt_packs/${packName}/prompt_pack_manifest.json`;
  if (!fileExists(manifestPath)) throw new Error(`Prompt pack not found: ${packName}`);
  const commonManifest = readJsonFile("prompt_packs/common/prompt_pack_manifest.json");
  const packManifest = readJsonFile(manifestPath);
  const taskId = flags.task || null;
  const taskItem = taskId ? getTaskById(taskId) : null;
  if (taskId && !taskItem) throw new Error(`Task not found: ${taskId}`);
  const contextPackId = flags.context || flags["context-pack"] || (taskId ? findLatestContextPackForTask(taskId) : null);
  const context = contextPackId ? getContextPack(contextPackId) : null;
  const selectedPrompt = flags.prompt || selectPromptFileForTask(packManifest, taskItem);
  const promptPath = `prompt_packs/${packName}/${selectedPrompt}`;
  if (!fileExists(promptPath)) throw new Error(`Prompt file not found in ${packName}: ${selectedPrompt}`);
  const commonFiles = (commonManifest.files || []).filter((file) => file.endsWith(".md") && file !== "README.md" && file !== "00_COMMON_PROMPT_LAYER_INDEX.md");
  const commonSections = commonFiles.map((file) => ({
    file,
    content: readTextFile(`prompt_packs/common/${file}`).trim()
  }));
  const stackPrompt = readTextFile(promptPath).trim();
  const idData = readJsonFile(".kabeeri/prompt_layer/compositions.json");
  idData.compositions = idData.compositions || [];
  const id = flags.id || `prompt-composition-${String(idData.compositions.length + 1).padStart(3, "0")}`;
  if (idData.compositions.some((item) => item.composition_id === id)) throw new Error(`Prompt composition already exists: ${id}`);
  const outputPath = flags.output || `.kabeeri/prompt_layer/${id}.md`;
  const composition = {
    composition_id: id,
    pack: packName,
    display_name: packManifest.display_name || packName,
    task_id: taskId,
    context_pack_id: contextPackId || null,
    selected_prompt: selectedPrompt,
    common_layer_version: commonManifest.version || "",
    common_files: commonSections.map((item) => item.file),
    output_path: outputPath,
    allowed_files: context ? context.allowed_files || [] : parseCsv(flags["allowed-files"]),
    forbidden_files: context ? context.forbidden_files || [] : parseCsv(flags["forbidden-files"] || ".env,secrets/,.git/"),
    acceptance_criteria: taskItem ? taskItem.acceptance_criteria || [] : [],
    estimated_tokens: estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem),
    created_at: new Date().toISOString()
  };
  writeTextFile(outputPath, buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context));
  idData.compositions.push(composition);
  writeJsonFile(".kabeeri/prompt_layer/compositions.json", idData);
  appendAudit("prompt_layer.composed", "prompt_composition", id, `Composed ${packName} prompt for ${taskId || "manual use"}`);
  console.log(JSON.stringify(composition, null, 2));
}

function selectPromptFileForTask(manifest, taskItem) {
  const files = manifest.files || [];
  const title = `${taskItem ? taskItem.title || "" : ""} ${taskItem ? taskItem.type || "" : ""} ${taskItem ? taskItem.workstream || "" : ""}`.toLowerCase();
  const candidates = [
    [/test|qa|review|verify/, /test|review/i],
    [/permission|notification|camera|location|media|device|push/, /permission|notification|device/i],
    [/offline|cache|storage|local/, /offline|storage|cache/i],
    [/auth|user|login|permission|role/, /auth|user|role|permission/i],
    [/form|validation/, /form|validation/i],
    [/env|config|secret|api url|base url/, /env|config|api/i],
    [/route|routing|layout|page/, /routing|layout|page/i],
    [/component|design|ui|frontend/, /component|design|ui/i],
    [/api|data|fetch|http|controller/, /api|data|http|controller|route/i],
    [/release|handoff/, /release|handoff/i]
  ];
  for (const [need, filePattern] of candidates) {
    if (need.test(title)) {
      const found = files.find((file) => filePattern.test(file) && file.endsWith(".md"));
      if (found) return found;
    }
  }
  return files.find((file) => /^01_.*\.md$/.test(file)) || files.find((file) => file.endsWith(".md") && !file.includes("README")) || "README.md";
}

function estimatePromptCompositionTokens(commonSections, stackPrompt, context, taskItem) {
  const chars = commonSections.reduce((sum, item) => sum + item.content.length, 0)
    + stackPrompt.length
    + JSON.stringify(context || {}).length
    + JSON.stringify(taskItem || {}).length;
  return Math.ceil(chars / 4);
}

function buildComposedPromptMarkdown(composition, commonSections, stackPrompt, taskItem, context) {
  return `# Composed Kabeeri Prompt - ${composition.composition_id}

Pack: ${composition.display_name}
Task: ${composition.task_id || "manual"}
Context pack: ${composition.context_pack_id || "none"}
Selected stack prompt: ${composition.selected_prompt}

## Execution Contract

- Work only on the task described below.
- Use the allowed files and forbidden files as hard scope boundaries.
- Follow the common prompt layer before the stack-specific prompt.
- Record AI run history after execution with \`kvdf ai-run record\`.
- If the output is useful, review it with \`kvdf ai-run accept\`; otherwise use \`kvdf ai-run reject\`.

## Task

${taskItem ? `Title: ${taskItem.title}
Status: ${taskItem.status}
Workstreams: ${taskWorkstreams(taskItem).join(", ")}
Source: ${taskItem.source || ""}
Acceptance:
${(taskItem.acceptance_criteria || []).length ? taskItem.acceptance_criteria.map((item) => `- ${item}`).join("\n") : "- None listed."}` : "No task was attached. Use this only for planning or a manually reviewed action."}

## Scope

Allowed files:
${composition.allowed_files.length ? composition.allowed_files.map((item) => `- ${item}`).join("\n") : "- None listed. Ask before editing broad areas."}

Forbidden files:
${composition.forbidden_files.length ? composition.forbidden_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Context Pack

${context ? `Goal: ${context.goal || ""}
Required specs:
${(context.required_specs || []).length ? context.required_specs.map((item) => `- ${item}`).join("\n") : "- None listed."}

Open questions:
${(context.open_questions || []).length ? context.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

Memory summary:
${context.memory_summary || "No memory summary."}` : "No context pack attached."}

## Common Prompt Layer

${commonSections.map((section) => `### ${section.file}\n\n${section.content}`).join("\n\n")}

## Stack-specific Prompt

${stackPrompt}
`;
}

function exportDirectory(sourceRelative, outputRelative, force) {
  const fs = require("fs");
  const path = require("path");
  const actualSource = resolveAsset(sourceRelative);
  const outputRoot = path.resolve(repoRoot(), outputRelative);
  if (!fs.existsSync(actualSource)) throw new Error(`Source directory not found: ${sourceRelative}`);

  if (fs.existsSync(outputRoot) && fs.readdirSync(outputRoot).length > 0 && !force) {
    throw new Error(`Output directory is not empty: ${outputRelative}. Use --force to overwrite files.`);
  }

  function copy(currentSource, currentOutput) {
    fs.mkdirSync(currentOutput, { recursive: true });
    for (const entry of fs.readdirSync(currentSource, { withFileTypes: true })) {
      const sourcePath = path.join(currentSource, entry.name);
      const outputPath = path.join(currentOutput, entry.name);
      if (entry.isDirectory()) {
        copy(sourcePath, outputPath);
      } else if (!fs.existsSync(outputPath) || force) {
        fs.copyFileSync(sourcePath, outputPath);
      }
    }
  }

  copy(actualSource, outputRoot);
}

function example(action, name) {
  if (!action || action === "list") {
    const manifest = readJsonFile("examples/examples_manifest.json");
    console.log(table(["Profile"], (manifest.profiles || []).map((profile) => [profile])));
    return;
  }

  if (action === "show") {
    if (!name) throw new Error("Missing example profile.");
    assertSafeName(name);
    const file = `examples/${name}/README.md`;
    if (!fileExists(file)) throw new Error(`Example not found: ${name}`);
    console.log(readTextFile(file));
    return;
  }

  throw new Error(`Unknown example action: ${action}`);
}

function questionnaire(action, value, flags = {}) {
  const files = listFiles("questionnaires", ".docx", true);
  if (!action || action === "list") {
    const rows = files.map((file) => [file]);
    console.log(table(["Questionnaire"], rows));
    return;
  }

  if (action === "status") {
    console.log(`${files.length} questionnaire files found.`);
    return;
  }

  if (action === "entry" || action === "answer") {
    return questionnaireAnswer(value, flags);
  }

  if (action === "coverage" || action === "matrix") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix();
    writeQuestionnaireReports(matrix);
    console.log(JSON.stringify(matrix, null, 2));
    return;
  }

  if (action === "missing") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix();
    writeQuestionnaireReports(matrix);
    const report = buildMissingAnswersReport(matrix);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "flow") {
    console.log(JSON.stringify(buildQuestionnaireFlow(), null, 2));
    return;
  }

  if (action === "plan" || action === "intake-plan" || action === "recommend") {
    return questionnaireIntakePlan(value, flags);
  }

  if (action === "generate-tasks" || action === "tasks") {
    return generateTasksFromCoverage(flags);
  }

  if (action === "create" || action === "export") {
    const groups = resolveQuestionnaireGroups(flags.profile, flags.group || value);
    const output = flags.output || "questionnaires";
    const selected = files.filter((file) => groups.some((group) => file.startsWith(`questionnaires/${group}/`)));
    if (selected.length === 0) throw new Error(`No questionnaire files found for: ${groups.join(", ")}`);
    copyQuestionnaireFiles(selected, output, Boolean(flags.force));
    console.log(`Exported ${selected.length} questionnaire files to ${output}`);
    return;
  }

  throw new Error(`Unknown questionnaire action: ${action}`);
}

function questionnaireAnswer(questionId, flags = {}) {
  ensureWorkspace();
  const id = flags.question || questionId;
  if (!id) throw new Error("Missing question id.");
  if (flags.value === undefined && flags.answer === undefined) throw new Error("Missing --value.");
  const value = String(flags.value !== undefined ? flags.value : flags.answer);
  const answersFile = ".kabeeri/questionnaires/answers.json";
  const sourcesFile = ".kabeeri/questionnaires/answer_sources.json";
  const data = readJsonFile(answersFile);
  data.answers = data.answers || [];
  const existing = data.answers.find((answer) => answer.question_id === id);
  const areaIds = parseCsv(flags.areas || inferQuestionAreas(id).join(","));
  const item = {
    answer_id: existing ? existing.answer_id : `answer-${String(data.answers.length + 1).padStart(3, "0")}`,
    question_id: id,
    value,
    area_ids: areaIds,
    answered_by: flags.by || flags.actor || "local-user",
    answered_at: new Date().toISOString(),
    confidence: flags.confidence || inferAnswerConfidence(value),
    source: flags.source || "questionnaire",
    source_mode: flags["source-mode"] || "direct",
    delivery_mode: flags["delivery-mode"] || null,
    intake_mode: flags["intake-mode"] || "adaptive"
  };
  if (existing) Object.assign(existing, item);
  else data.answers.push(item);
  writeJsonFile(answersFile, data);

  const sources = readJsonFile(sourcesFile);
  sources.sources = sources.sources || [];
  sources.sources.push({
    source_id: `source-${String(sources.sources.length + 1).padStart(3, "0")}`,
    answer_id: item.answer_id,
    question_id: id,
    source_mode: item.source_mode,
    recorded_at: item.answered_at,
    summary: `Answer recorded for ${id}`
  });
  writeJsonFile(sourcesFile, sources);

  const matrix = buildCoverageMatrix();
  writeQuestionnaireReports(matrix);
  appendAudit("questionnaire.answer_recorded", "questionnaire", item.answer_id, `Answer recorded for ${id}`);
  console.log(`Recorded answer ${item.answer_id} for ${id}`);
}

function questionnaireIntakePlan(value, flags = {}) {
  ensureWorkspace();
  const description = flags.description || flags.text || flags.project || value || "";
  const blueprintKey = flags.blueprint || getCurrentBlueprintKey() || inferQuestionnaireBlueprint(description, flags);
  if (!blueprintKey) throw new Error("Missing project description or selected blueprint. Use `kvdf questionnaire plan \"Build ecommerce store...\"` or `--blueprint ecommerce`.");
  const plan = buildQuestionnaireIntakePlan(description || blueprintKey, blueprintKey, flags);
  const file = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  if (!fileExists(file)) writeJsonFile(file, { plans: [], current_plan_id: null });
  const state = readJsonFile(file);
  state.plans = state.plans || [];
  state.plans.push(plan);
  state.current_plan_id = plan.plan_id;
  writeJsonFile(file, state);
  appendAudit("questionnaire.intake_plan_created", "questionnaire", plan.plan_id, `Questionnaire intake plan created for ${blueprintKey}`);
  if (!flags.silent) {
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderQuestionnaireIntakePlan(plan);
  }
  return plan;
}

function vibe(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureInteractionsState();
  const verb = String(action || "suggest").toLowerCase();
  const knownActions = new Set(["suggest", "ask", "capture", "list", "show", "convert", "approve", "reject", "plan", "brief", "next", "session"]);
  const message = knownActions.has(verb)
    ? [value, ...rest].filter(Boolean).join(" ").trim()
    : [action, value, ...rest].filter(Boolean).join(" ").trim();
  const effectiveAction = knownActions.has(verb) ? verb : "suggest";

  if (effectiveAction === "list") {
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    console.log(table(["Suggestion", "Title", "Workstream", "Risk", "Status"], suggestions.map((item) => [
      item.suggestion_id,
      item.title,
      item.workstream,
      item.risk_level,
      item.status
    ])));
    return;
  }

  if (effectiveAction === "brief") {
    return vibeBrief(flags);
  }

  if (effectiveAction === "next") {
    return vibeNext(flags);
  }

  if (effectiveAction === "session") {
    return vibeSession(value, flags, rest);
  }

  if (effectiveAction === "show") {
    const id = value || flags.id;
    if (!id) throw new Error("Missing suggestion id.");
    const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
    const found = suggestions.find((item) => item.suggestion_id === id);
    if (!found) throw new Error(`Suggested task not found: ${id}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (effectiveAction === "convert" || effectiveAction === "approve") {
    return convertVibeSuggestion(value || flags.id, flags);
  }

  if (effectiveAction === "reject") {
    return updateVibeSuggestionStatus(value || flags.id, "rejected", flags.reason || "");
  }

  if (effectiveAction === "capture") {
    return capturePostWork(message, flags);
  }

  if (!message) throw new Error("Missing natural language request.");
  const intent = classifyVibeIntent(message, flags);
  attachIntentToVibeSession(intent, flags);
  appendJsonLine(".kabeeri/interactions/user_intents.jsonl", intent);
  appendAudit("vibe.intent_classified", "intent", intent.intent_id, `Vibe intent classified: ${intent.intent_type}`);

  if (effectiveAction === "ask" || intent.intent_type === "ask_question" || (intent.is_vague && effectiveAction !== "plan")) {
    const response = buildVibeAskResponse(intent);
    if (!flags.json) {
      console.log(response.lines.join("\n"));
      return;
    }
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  const createdSuggestions = effectiveAction === "plan"
    ? buildVibePlanSuggestions(intent, flags)
    : [buildSuggestedTaskCard(intent, flags)];
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  data.suggested_tasks = data.suggested_tasks || [];
  data.suggested_tasks.push(...createdSuggestions);
  writeJsonFile(file, data);
  attachSuggestionsToVibeSession(createdSuggestions, flags);
  refreshDashboardArtifacts();
  for (const suggestion of createdSuggestions) {
    appendAudit("vibe.task_suggested", "suggestion", suggestion.suggestion_id, `Suggested task: ${suggestion.title}`);
  }
  console.log(JSON.stringify(createdSuggestions.length === 1 ? createdSuggestions[0] : { suggestions: createdSuggestions }, null, 2));
}

function ensureInteractionsState() {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(repoRoot(), ".kabeeri", "interactions");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/interactions/suggested_tasks.json")) writeJsonFile(".kabeeri/interactions/suggested_tasks.json", { suggested_tasks: [] });
  if (!fileExists(".kabeeri/interactions/post_work_captures.json")) writeJsonFile(".kabeeri/interactions/post_work_captures.json", { captures: [] });
  if (!fileExists(".kabeeri/interactions/vibe_sessions.json")) writeJsonFile(".kabeeri/interactions/vibe_sessions.json", { sessions: [], current_session_id: null });
  if (!fileExists(".kabeeri/interactions/context_briefs.json")) writeJsonFile(".kabeeri/interactions/context_briefs.json", { briefs: [] });
  if (!fs.existsSync(path.join(dir, "user_intents.jsonl"))) fs.writeFileSync(path.join(dir, "user_intents.jsonl"), "", "utf8");
}

function classifyVibeIntent(text, flags = {}) {
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const normalized = String(text || "").toLowerCase();
  const detectedWorkstreams = detectVibeWorkstreams(normalized);
  const riskLevel = detectVibeRisk(normalized, detectedWorkstreams);
  const intentType = flags.type || detectVibeIntentType(normalized);
  const missingDetails = detectVibeMissingDetails(normalized, intentType, detectedWorkstreams);
  const isVague = missingDetails.length > 0 || detectVagueIntent(normalized);
  return {
    intent_id: `intent-${String(intents.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    actor_id: flags.actor || "local-user",
    language: detectLanguage(text),
    text,
    intent_type: intentType,
    confidence: isVague ? 0.62 : 0.86,
    risk_level: riskLevel,
    detected_workstreams: detectedWorkstreams,
    missing_details: missingDetails,
    is_vague: isVague,
    suggested_next_action: isVague ? "ask_clarifying_question" : "create_suggested_task_card",
    status: "classified"
  };
}

function detectVibeIntentType(text) {
  if (matchesWords(text, ["?", "ازاي", "كيف", "what", "how", "هل"])) return "ask_question";
  if (matchesWords(text, ["capture", "سجل", "لخص اللي اتعمل", "post-work"])) return "capture_work";
  if (matchesWords(text, ["review", "راجع", "مراجعة"])) return "review_work";
  if (matchesWords(text, ["verify", "تحقق", "اعتماد"])) return "verify_task";
  if (matchesWords(text, ["cost", "تكلفة", "tokens", "budget"])) return "estimate_cost";
  if (matchesWords(text, ["github", "issue", "sync"])) return "sync_github";
  if (matchesWords(text, ["release", "publish", "نشر", "إصدار"])) return "publish_or_release";
  if (matchesWords(text, ["docs", "وثائق", "documentation"])) return "generate_docs";
  if (matchesWords(text, ["test", "validate", "check", "اختبار", "تشيك"])) return "run_check";
  return "create_task";
}

function detectVibeWorkstreams(text) {
  const matches = [];
  const rules = [
    ["backend", ["api", "backend", "server", "controller", "service", "laravel", "باك", "سيرفر"]],
    ["public_frontend", ["public", "frontend", "react", "vue", "angular", "page", "landing", "visitor", "فرونت", "واجهة", "صفحة"]],
    ["admin_frontend", ["admin", "dashboard", "settings", "backoffice", "أدمن", "داشبورد", "إعدادات"]],
    ["mobile", ["mobile", "ios", "android", "expo", "react native", "flutter", "device", "notification", "camera", "موبايل", "تطبيق موبايل"]],
    ["database", ["database", "migration", "schema", "table", "db", "داتابيز", "قاعدة", "جدول"]],
    ["qa", ["test", "tests", "qa", "acceptance", "اختبار", "تست"]],
    ["devops", ["deploy", "hosting", "ci", "docker", "github actions", "نشر", "استضافة"]],
    ["security", ["auth", "login", "permission", "secret", "secrets", "privacy", "صلاحيات", "أمان", "تسجيل دخول"]],
    ["docs", ["docs", "readme", "guide", "handoff", "وثائق", "دليل"]]
  ];
  for (const [stream, words] of rules) {
    if (matchesWords(text, words)) matches.push(stream);
  }
  return matches.length ? [...new Set(matches)] : ["docs"];
}

function detectVibeRisk(text, workstreams) {
  if (matchesWords(text, ["production", "publish", "migration", "auth", "payments", "secrets", "owner transfer", "delete", "overwrite", "نشر", "حذف", "مدفوعات", "صلاحيات"])) return "high";
  if ((workstreams || []).length > 1) return "medium";
  if (matchesWords(text, ["dashboard", "api", "database", "admin", "داشبورد", "داتابيز"])) return "medium";
  return "low";
}

function detectVibeMissingDetails(text, intentType, workstreams) {
  const missing = [];
  if (intentType === "create_task") {
    if (text.length < 18) missing.push("clear target surface");
    if (!matchesWords(text, ["user", "admin", "owner", "developer", "client", "مستخدم", "أدمن", "عميل", "مالك"])) missing.push("target user or actor");
    if (!matchesWords(text, ["when", "must", "should", "can", "save", "accept", "ready", "لازم", "يقدر", "يظهر", "يمنع"])) missing.push("acceptance criteria");
  }
  if ((workstreams || []).length > 1 && !matchesWords(text, ["integration", "ربط", "connect", "wire"])) missing.push("split or integration decision");
  return missing;
}

function detectVagueIntent(text) {
  return matchesWords(text, ["make it better", "fix everything", "improve ui", "clean the project", "production ready", "add dashboard", "connect payments", "حسن", "ظبط", "نضف", "طور الموضوع"]);
}

function buildSuggestedTaskCard(intent, flags = {}) {
  const suggestions = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
  const workstream = flags.workstream || intent.detected_workstreams[0] || "docs";
  const taskType = intent.detected_workstreams.length > 1 ? "integration" : "feature";
  const title = flags.title || titleFromIntent(intent.text, workstream);
  return {
    suggestion_id: `suggestion-${String(suggestions.length + 1).padStart(3, "0")}`,
    source_intent_id: intent.intent_id,
    title,
    workstream,
    workstreams: intent.detected_workstreams,
    task_type: taskType,
    summary: intent.text,
    allowed_files: getWorkstreamPathRules(workstream),
    forbidden_files: defaultForbiddenFiles(),
    acceptance_criteria: buildVibeAcceptanceCriteria(intent, workstream),
    risk_level: intent.risk_level,
    estimated_cost_level: intent.risk_level === "high" ? "high" : intent.risk_level === "medium" ? "medium" : "low",
    approval_required: intent.risk_level !== "low" || taskType === "integration",
    suggested_assignee_role: workstream === "docs" ? "Maintainer" : "AI Developer",
    missing_details: intent.missing_details,
    status: "suggested",
    created_at: new Date().toISOString()
  };
}

function buildVibePlanSuggestions(intent, flags = {}) {
  const base = readJsonFile(".kabeeri/interactions/suggested_tasks.json").suggested_tasks || [];
  const text = String(intent.text || "").toLowerCase();
  const templates = detectVibePlanTemplates(text);
  const workItems = templates.length ? templates : intent.detected_workstreams.map((stream) => ({
    title: titleFromIntent(intent.text, stream),
    workstream: stream,
    summary: intent.text,
    acceptance: [`${stream} scope is defined before implementation.`]
  }));
  return workItems.map((item, index) => {
    const stream = item.workstream || "docs";
    return {
      suggestion_id: `suggestion-${String(base.length + index + 1).padStart(3, "0")}`,
      source_intent_id: intent.intent_id,
      title: item.title,
      workstream: stream,
      workstreams: [stream],
      task_type: item.type || "feature",
      summary: item.summary || intent.text,
      allowed_files: getWorkstreamPathRules(stream),
      forbidden_files: defaultForbiddenFiles(),
      acceptance_criteria: item.acceptance || buildVibeAcceptanceCriteria(intent, stream),
      risk_level: item.risk || intent.risk_level,
      estimated_cost_level: item.cost || (intent.risk_level === "high" ? "high" : "medium"),
      approval_required: item.risk === "high" || intent.risk_level === "high",
      suggested_assignee_role: stream === "docs" ? "Maintainer" : "AI Developer",
      missing_details: [],
      status: "suggested",
      plan_group_id: intent.intent_id,
      created_at: new Date().toISOString()
    };
  });
}

function detectVibePlanTemplates(text) {
  if (!matchesWords(text, ["ecommerce", "e-commerce", "store", "shop", "checkout", "cart", "متجر", "سلة", "منتجات", "دفع"])) return [];
  return [
    {
      title: "Design ecommerce data model for products carts and orders",
      workstream: "database",
      type: "foundation",
      summary: "Create the database model for products, carts, orders, order items, and customer ownership.",
      acceptance: ["Product, cart, and order entities are listed.", "Required indexes and relationships are documented.", "Migration risks and rollback notes are captured."]
    },
    {
      title: "Build product catalog API",
      workstream: "backend",
      summary: "Expose product listing and detail endpoints for the storefront.",
      acceptance: ["Customers can list published products.", "Product detail endpoint returns price, stock, and media fields.", "Unauthorized admin-only fields are not exposed."]
    },
    {
      title: "Build public storefront product browsing",
      workstream: "public_frontend",
      summary: "Create the customer-facing product grid and product detail experience.",
      acceptance: ["Customers can browse product cards.", "Product detail page shows price and availability.", "Empty and loading states are handled."]
    },
    {
      title: "Build cart and checkout workflow",
      workstream: "backend",
      risk: "high",
      summary: "Implement cart mutation and checkout preparation workflow.",
      acceptance: ["Customers can add, update, and remove cart items.", "Checkout validates totals server-side.", "Payment integration boundaries are documented before live payment."]
    },
    {
      title: "Build admin product management screen",
      workstream: "admin_frontend",
      summary: "Create admin UI for creating and updating products.",
      acceptance: ["Owner can create and edit products.", "Validation errors are visible.", "Draft/published status is clear."]
    },
    {
      title: "Add ecommerce acceptance tests",
      workstream: "qa",
      type: "qa",
      summary: "Cover catalog, cart, checkout, and admin product management flows.",
      acceptance: ["Catalog happy path is tested.", "Cart mutation edge cases are tested.", "Admin product permissions are tested."]
    }
  ];
}

function titleFromIntent(text, workstream) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const prefix = workstream === "docs" ? "Document" : "Implement";
  if (!clean) return `${prefix} ${workstream} task`;
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}

function buildVibeAcceptanceCriteria(intent, workstream) {
  const base = [
    `Scope is limited to ${workstream}.`,
    "Changed files stay inside the suggested execution scope.",
    "Owner or reviewer can verify the result from the task summary."
  ];
  if (intent.risk_level === "high") base.push("High-risk behavior is covered by an explicit check or approval note.");
  if (intent.detected_workstreams.length > 1) base.push("Cross-workstream integration points are listed before implementation.");
  return base;
}

function buildVibeAskResponse(intent) {
  const questions = intent.missing_details.slice(0, 3).map((item) => `- Clarify ${item}.`);
  if (questions.length === 0) questions.push("- Confirm whether you want a suggested task card or only an explanation.");
  return {
    intent,
    lines: [
      `Intent: ${intent.intent_type}`,
      `Likely workstream: ${intent.detected_workstreams.join(", ")}`,
      `Risk: ${intent.risk_level}`,
      "",
      "Before creating a governed task:",
      ...questions,
      "",
      "Safe next step: run `kvdf vibe suggest \"...\"` with the clarified request."
    ]
  };
}

function convertVibeSuggestion(id, flags = {}) {
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "convert vibe suggestion");
  if (!id) throw new Error("Missing suggestion id.");
  const suggestionsFile = ".kabeeri/interactions/suggested_tasks.json";
  const suggestions = readJsonFile(suggestionsFile);
  const item = (suggestions.suggested_tasks || []).find((entry) => entry.suggestion_id === id);
  if (!item) throw new Error(`Suggested task not found: ${id}`);
  if (item.status === "converted_to_task") throw new Error(`Suggested task already converted: ${id}`);
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  const workstreams = item.workstreams && item.workstreams.length ? item.workstreams : [item.workstream || "docs"];
  validateTaskBoundaryCreation(item.task_type || "general", workstreams, []);
  const taskItem = {
    id: taskId,
    title: item.title,
    status: "proposed",
    type: item.task_type || "general",
    workstream: workstreams[0],
    workstreams,
    source: `vibe:${item.source_intent_id}`,
    acceptance_criteria: item.acceptance_criteria || [],
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  item.status = "converted_to_task";
  item.task_id = taskId;
  item.converted_at = new Date().toISOString();
  writeJsonFile(tasksFile, data);
  writeJsonFile(suggestionsFile, suggestions);
  refreshDashboardArtifacts();
  appendAudit("vibe.suggestion_converted", "task", taskId, `Vibe suggestion converted: ${id}`);
  console.log(`Converted ${id} to ${taskId}`);
}

function updateVibeSuggestionStatus(id, status, reason) {
  if (!id) throw new Error("Missing suggestion id.");
  const file = ".kabeeri/interactions/suggested_tasks.json";
  const data = readJsonFile(file);
  const item = (data.suggested_tasks || []).find((entry) => entry.suggestion_id === id);
  if (!item) throw new Error(`Suggested task not found: ${id}`);
  item.status = status;
  item.status_reason = reason;
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
  refreshDashboardArtifacts();
  appendAudit(`vibe.suggestion_${status}`, "suggestion", id, `Vibe suggestion ${status}`);
  console.log(`Suggestion ${id} is ${status}`);
}

function capturePostWork(message, flags = {}) {
  const parts = String(message || "").trim().split(/\s+/).filter(Boolean);
  const captureActions = new Set(["list", "show", "scan", "detect", "evidence", "reject", "link", "convert", "resolve"]);
  if (parts.length > 0 && captureActions.has(parts[0]) && (["scan", "detect"].includes(parts[0]) || !flags.summary)) {
    return capturePostWorkAction(parts[0], parts[1] || flags.id, flags);
  }
  const analysis = analyzePostWorkCapture(message || flags.summary, flags);
  if (flags.task && !analysis.matchedTask) throw new Error(`Task not found: ${flags.task}`);
  const file = ".kabeeri/interactions/post_work_captures.json";
  const data = readJsonFile(file);
  data.captures = data.captures || [];
  const capture = {
    capture_id: `capture-${String(data.captures.length + 1).padStart(3, "0")}`,
    captured_at: new Date().toISOString(),
    task_id: analysis.matchedTask ? analysis.matchedTask.id : null,
    summary: analysis.text,
    files_changed: analysis.changedFiles,
    file_details: analysis.changedFileDetails,
    detected_workstreams: analysis.intent.detected_workstreams,
    app_usernames: analysis.appUsernames,
    risk_level: analysis.intent.risk_level,
    classification: analysis.classification,
    task_matches: analysis.taskMatches,
    checks_run: parseCsv(flags.checks),
    risks: parseCsv(flags.risks),
    acceptance_evidence: parseCsv(flags.evidence || flags.acceptance),
    missing_evidence: buildCaptureMissingEvidence(flags, analysis.changedFiles),
    owner_verify_required: captureOwnerVerifyRequired(analysis.classification, analysis.intent.risk_level),
    recommended_next_action: captureNextAction(analysis.classification, analysis.matchedTask),
    status: analysis.classification === "matches_existing_task" ? "linked" : "captured"
  };
  data.captures.push(capture);
  writeJsonFile(file, data);
  attachCaptureToVibeSession(capture, flags);
  appendJsonLine(".kabeeri/interactions/user_intents.jsonl", analysis.intent);
  refreshDashboardArtifacts();
  appendAudit("vibe.post_work_captured", "capture", capture.capture_id, `Post-work capture recorded`);
  console.log(JSON.stringify(capture, null, 2));
}

function analyzePostWorkCapture(message, flags = {}) {
  const changedFileDetails = flags.files
    ? parseCsv(flags.files).map((file) => ({ file, status: "manual", raw: file }))
    : getGitChangedFileDetails();
  const changedFiles = changedFileDetails.map((item) => item.file);
  const text = message || flags.summary || "Post-work capture";
  const intent = classifyVibeIntent(`${text} ${changedFiles.join(" ")}`, { ...flags, type: "capture_work" });
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const matchedTask = flags.task ? getTaskById(flags.task) : inferCaptureTaskMatch(text, changedFiles, intent.detected_workstreams, tasks);
  const appUsernames = inferCaptureApps(changedFiles);
  const classification = classifyCapture(flags, matchedTask, changedFiles, appUsernames);
  const taskMatches = buildCaptureTaskMatches(text, changedFiles, intent.detected_workstreams, tasks).slice(0, 5);
  return {
    scan_id: `capture-scan-${Date.now()}`,
    generated_at: new Date().toISOString(),
    text,
    changedFileDetails,
    changedFiles,
    intent,
    matchedTask,
    appUsernames,
    classification,
    taskMatches,
    missing_evidence: buildCaptureMissingEvidence(flags, changedFiles),
    owner_verify_required: captureOwnerVerifyRequired(classification, intent.risk_level),
    recommended_next_action: captureNextAction(classification, matchedTask),
    would_create_capture: true
  };
}

function capturePostWorkAction(action, id, flags = {}) {
  const file = ".kabeeri/interactions/post_work_captures.json";
  const data = readJsonFile(file);
  data.captures = data.captures || [];

  if (action === "scan" || action === "detect") {
    const analysis = analyzePostWorkCapture(flags.summary || "", flags);
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  if (action === "list") {
    const rows = data.captures.map((item) => [
      item.capture_id,
      item.task_id || "",
      item.classification || "",
      item.status || "",
      (item.detected_workstreams || []).join(","),
      item.summary || ""
    ]);
    console.log(table(["Capture", "Task", "Classification", "Status", "Workstreams", "Summary"], rows));
    return;
  }

  const capture = data.captures.find((item) => item.capture_id === id);
  if (!capture) throw new Error(`Capture not found: ${id || ""}`);

  if (action === "show") {
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "evidence") {
    capture.checks_run = uniqueList([...(capture.checks_run || []), ...parseCsv(flags.checks)]);
    capture.acceptance_evidence = uniqueList([...(capture.acceptance_evidence || []), ...parseCsv(flags.evidence || flags.acceptance)]);
    capture.risks = uniqueList([...(capture.risks || []), ...parseCsv(flags.risks)]);
    capture.missing_evidence = buildCaptureMissingEvidenceFromRecord(capture);
    capture.updated_at = new Date().toISOString();
    capture.recommended_next_action = capture.missing_evidence.length
      ? "add missing capture evidence before resolving"
      : captureNextAction(capture.classification, capture.task_id ? getTaskById(capture.task_id) : null);
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_evidence_added", "capture", capture.capture_id, `Capture evidence updated`);
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "reject") {
    capture.status = "rejected";
    capture.rejected_at = new Date().toISOString();
    capture.rejection_reason = flags.reason || "rejected";
    capture.recommended_next_action = "no further action unless work should be recaptured";
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_rejected", "capture", capture.capture_id, `Capture rejected`);
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "link") {
    const taskId = flags.task || flags.to || flags.id;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    capture.task_id = taskId;
    capture.classification = "matches_existing_task";
    capture.status = "linked";
    capture.linked_at = new Date().toISOString();
    capture.recommended_next_action = `review task ${taskId} and attach capture evidence`;
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_linked", "capture", capture.capture_id, `Capture linked to ${taskId}`);
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "convert") {
    const taskId = convertCaptureToTask(capture, flags);
    capture.task_id = taskId;
    capture.classification = "converted_to_task";
    capture.status = "converted_to_task";
    capture.converted_at = new Date().toISOString();
    capture.recommended_next_action = `review and approve ${taskId}`;
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_converted", "task", taskId, `Capture converted to task`);
    console.log(JSON.stringify(capture, null, 2));
    return;
  }

  if (action === "resolve") {
    if ((capture.missing_evidence || []).length && flags.force !== true && flags.force !== "true") {
      throw new Error(`Capture still has missing evidence: ${capture.missing_evidence.join(", ")}. Add evidence or use --force true.`);
    }
    capture.status = "resolved";
    capture.resolved_at = new Date().toISOString();
    capture.resolution = flags.reason || flags.summary || "resolved";
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("vibe.capture_resolved", "capture", capture.capture_id, `Capture resolved`);
    console.log(JSON.stringify(capture, null, 2));
  }
}

function convertCaptureToTask(capture, flags = {}) {
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  if (data.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = capture.detected_workstreams && capture.detected_workstreams.length ? capture.detected_workstreams : ["docs"];
  const appUsernames = capture.app_usernames || [];
  const taskType = flags.type || (workstreams.length > 1 || appUsernames.length > 1 ? "integration" : "general");
  validateTaskBoundaryCreation(taskType, workstreams, appUsernames);
  const taskItem = {
    id: taskId,
    title: flags.title || capture.summary || `Review ${capture.capture_id}`,
    status: "proposed",
    type: taskType,
    workstream: workstreams[0],
    workstreams,
    app_usernames: appUsernames,
    source: `capture:${capture.capture_id}`,
    acceptance_criteria: buildCaptureAcceptanceCriteria(capture),
    capture_id: capture.capture_id,
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  writeJsonFile(tasksFile, data);
  return taskId;
}

function buildCaptureAcceptanceCriteria(capture) {
  const criteria = [];
  if ((capture.files_changed || []).length) criteria.push(`Review changed files: ${(capture.files_changed || []).join(", ")}`);
  if ((capture.checks_run || []).length) criteria.push(`Confirm checks passed: ${(capture.checks_run || []).join(", ")}`);
  else criteria.push("Add or run appropriate checks before Owner verification.");
  if ((capture.risks || []).length) criteria.push(`Resolve captured risks: ${(capture.risks || []).join(", ")}`);
  criteria.push("Attach capture evidence to task review.");
  return criteria;
}

function classifyCapture(flags, matchedTask, changedFiles, appUsernames) {
  if (flags.classification) return flags.classification;
  if (matchedTask) return "matches_existing_task";
  if (flags.exploration) return "exploration";
  if (flags.urgent || flags.hotfix) return "urgent_fix";
  if (changedFiles.length > 0 && changedFiles.every((file) => /\.(md|mdx|txt|html)$/i.test(file))) return "documentation_only";
  if (appUsernames.length > 1) return "unapproved_scope";
  return "needs_new_task";
}

function captureOwnerVerifyRequired(classification, riskLevel) {
  return ["matches_existing_task", "converted_to_task", "urgent_fix", "unapproved_scope"].includes(classification) || ["high", "critical"].includes(riskLevel);
}

function captureNextAction(classification, matchedTask) {
  if (classification === "matches_existing_task" && matchedTask) return `review task ${matchedTask.id} and attach capture evidence`;
  if (classification === "documentation_only") return "review docs diff and resolve capture";
  if (classification === "exploration") return "decide whether exploration should become a governed task";
  if (classification === "urgent_fix") return "create or link an urgent governed task and run policy checks";
  if (classification === "unapproved_scope") return "split or convert into an integration task before more work";
  return "convert capture into a governed task or link it to an existing task";
}

function buildCaptureMissingEvidence(flags, changedFiles) {
  const missing = [];
  if (!parseCsv(flags.checks).length) missing.push("checks_run");
  if (!parseCsv(flags.evidence || flags.acceptance).length) missing.push("acceptance_evidence");
  if (!changedFiles.length) missing.push("files_changed");
  return missing;
}

function buildCaptureMissingEvidenceFromRecord(capture) {
  const missing = [];
  if (!(capture.checks_run || []).length) missing.push("checks_run");
  if (!(capture.acceptance_evidence || []).length) missing.push("acceptance_evidence");
  if (!(capture.files_changed || []).length) missing.push("files_changed");
  return missing;
}

function inferCaptureTaskMatch(text, changedFiles, workstreams, tasks) {
  const matches = buildCaptureTaskMatches(text, changedFiles, workstreams, tasks);
  return matches.length && matches[0].score >= 3 ? tasks.find((item) => item.id === matches[0].task_id) : null;
}

function buildCaptureTaskMatches(text, changedFiles, workstreams, tasks) {
  const normalizedText = String(text || "").toLowerCase();
  const files = (changedFiles || []).map((item) => normalizeLockScope(item));
  const streams = new Set((workstreams || []).map((item) => normalizeWorkstreamId(item)));
  return (tasks || [])
    .filter((taskItem) => !["owner_verified", "rejected"].includes(taskItem.status))
    .map((taskItem) => {
      let score = 0;
      const title = String(taskItem.title || "").toLowerCase();
      const taskStreams = taskWorkstreams(taskItem);
      if (taskStreams.some((stream) => streams.has(stream))) score += 2;
      if (title && normalizedText && title.split(/\s+/).filter((word) => word.length > 3).some((word) => normalizedText.includes(word))) score += 1;
      const allowed = (taskItem.allowed_files || (taskItem.scope && taskItem.scope.allowed_files) || []).map((item) => normalizeLockScope(item));
      if (allowed.length && files.some((file) => allowed.some((scope) => pathScopeContains(scope, file)))) score += 2;
      return { task_id: taskItem.id, title: taskItem.title, status: taskItem.status, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

function inferCaptureApps(changedFiles) {
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const matched = [];
  for (const appItem of apps) {
    const appPath = normalizeAppPath(appItem.path || `apps/${appItem.username}`);
    if (!appPath) continue;
    if ((changedFiles || []).some((file) => pathScopeContains(appPath, normalizeLockScope(file)))) matched.push(appItem.username);
  }
  return uniqueList(matched);
}

function vibeSession(action, flags = {}, rest = []) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];
  const verb = String(action || "status").toLowerCase();
  if (verb === "start") {
    const id = flags.id || `vibe-session-${String(data.sessions.length + 1).padStart(3, "0")}`;
    const item = {
      session_id: id,
      title: flags.title || rest.join(" ") || "Vibe session",
      actor_id: flags.actor || "local-user",
      status: "active",
      intent_ids: [],
      suggestion_ids: [],
      capture_ids: [],
      started_at: new Date().toISOString()
    };
    data.sessions.push(item);
    data.current_session_id = id;
    writeJsonFile(file, data);
    appendAudit("vibe.session_started", "vibe_session", id, `Vibe session started`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (verb === "end") {
    const id = flags.id || data.current_session_id;
    if (!id) throw new Error("Missing vibe session id.");
    const item = data.sessions.find((sessionItem) => sessionItem.session_id === id);
    if (!item) throw new Error(`Vibe session not found: ${id}`);
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.summary = flags.summary || item.summary || "";
    if (data.current_session_id === id) data.current_session_id = null;
    writeJsonFile(file, data);
    appendAudit("vibe.session_completed", "vibe_session", id, `Vibe session completed`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  const current = data.sessions.find((item) => item.session_id === data.current_session_id) || null;
  console.log(JSON.stringify({ current_session_id: data.current_session_id || null, current, sessions_total: data.sessions.length }, null, 2));
}

function attachIntentToVibeSession(intent, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.intent_ids = uniqueList([...(item.intent_ids || []), intent.intent_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachSuggestionsToVibeSession(suggestions, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.suggestion_ids = uniqueList([...(item.suggestion_ids || []), ...(suggestions || []).map((suggestion) => suggestion.suggestion_id)]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachCaptureToVibeSession(capture, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.capture_ids = uniqueList([...(item.capture_ids || []), capture.capture_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function vibeBrief(flags = {}) {
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = fileExists(".kabeeri/interactions/vibe_sessions.json") ? readJsonFile(".kabeeri/interactions/vibe_sessions.json") : { current_session_id: null, sessions: [] };
  const openSuggestions = suggestions.filter((item) => ["suggested", "edited", "approved"].includes(item.status));
  const openTasks = tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const brief = {
    brief_id: `brief-${Date.now()}`,
    generated_at: new Date().toISOString(),
    current_vibe_session: sessions.current_session_id || null,
    latest_intent: intents[intents.length - 1] || null,
    open_suggestions: openSuggestions.slice(-8).map((item) => ({
      id: item.suggestion_id,
      title: item.title,
      workstream: item.workstream,
      risk: item.risk_level,
      status: item.status
    })),
    open_tasks: openTasks.slice(-10).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      workstream: item.workstream,
      assignee: item.assignee_id || null
    })),
    recent_captures: captures.slice(-5).map((item) => ({
      id: item.capture_id,
      summary: item.summary,
      files: item.files_changed || [],
      classification: item.classification
    })),
    token_saving_hint: "Use this brief as the next-session context instead of rereading the whole repository or chat history."
  };
  const file = ".kabeeri/interactions/context_briefs.json";
  const data = readJsonFile(file);
  data.briefs = data.briefs || [];
  data.briefs.push(brief);
  writeJsonFile(file, data);
  if (flags.json) console.log(JSON.stringify(brief, null, 2));
  else console.log(formatVibeBrief(brief));
}

function formatVibeBrief(brief) {
  const lines = [
    `Vibe brief: ${brief.brief_id}`,
    `Current session: ${brief.current_vibe_session || "none"}`,
    brief.latest_intent ? `Latest intent: ${brief.latest_intent.text}` : "Latest intent: none",
    "",
    "Open suggestions:",
    ...(brief.open_suggestions.length ? brief.open_suggestions.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Open tasks:",
    ...(brief.open_tasks.length ? brief.open_tasks.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Recent captures:",
    ...(brief.recent_captures.length ? brief.recent_captures.map((item) => `- ${item.id}: ${item.summary}`) : ["- none"]),
    "",
    brief.token_saving_hint
  ];
  return lines.join("\n");
}

function vibeNext(flags = {}) {
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const actions = [];
  const suggested = suggestions.find((item) => item.status === "suggested");
  if (suggested) actions.push({ action: "review_suggestion", command: `kvdf vibe show ${suggested.suggestion_id}`, reason: `Review ${suggested.title}` });
  const converted = suggestions.find((item) => item.status === "converted_to_task" && item.task_id && tasks.some((taskItem) => taskItem.id === item.task_id && taskItem.status === "proposed"));
  if (converted) actions.push({ action: "approve_or_refine_task", command: `kvdf task status ${converted.task_id}`, reason: "Converted Vibe task is still proposed." });
  const unassigned = tasks.find((item) => ["approved", "ready"].includes(item.status) && !item.assignee_id);
  if (unassigned) actions.push({ action: "assign_task", command: `kvdf task assign ${unassigned.id} --assignee <id>`, reason: "Approved task needs an assignee." });
  const uncaptured = captures.find((item) => item.classification === "needs_new_task" && item.status === "captured");
  if (uncaptured) actions.push({ action: "create_task_from_capture", command: `kvdf capture convert ${uncaptured.capture_id}`, reason: "Captured work has not been converted into governed work." });
  if (actions.length === 0) actions.push({ action: "create_or_capture_intent", command: `kvdf vibe "Describe the next change"`, reason: "No pending Vibe action found." });
  const result = { generated_at: new Date().toISOString(), actions: actions.slice(0, Number(flags.limit || 5)) };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  else console.log(table(["Action", "Command", "Reason"], result.actions.map((item) => [item.action, item.command, item.reason])));
}

function getGitChangedFiles() {
  return getGitChangedFileDetails().map((item) => item.file);
}

function getGitChangedFileDetails() {
  const { spawnSync } = require("child_process");
  const result = spawnSync("git", ["status", "--short"], { cwd: repoRoot(), encoding: "utf8" });
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => {
      const raw = line.trim();
      if (!raw) return null;
      const status = raw.slice(0, 2).trim() || "changed";
      const file = raw.replace(/^..?\s+/, "").replace(/^.* -> /, "");
      if (!file || file.startsWith(".kabeeri/interactions/")) return null;
      return { file, status, raw };
    })
    .filter(Boolean)
    .filter((item) => item.file && !item.file.startsWith(".kabeeri/interactions/"));
}

function matchesWords(text, words) {
  return (words || []).some((word) => String(text || "").includes(String(word).toLowerCase()));
}

function detectLanguage(text) {
  return /[\u0600-\u06ff]/.test(String(text || "")) ? "ar" : "en";
}

function resolveOutputLanguage(flags = {}, text = "") {
  const requested = flags.lang || flags.language || flags["output-language"];
  if (requested && !["auto", "user", "same"].includes(String(requested).toLowerCase())) {
    return String(requested).toLowerCase();
  }
  const project = localFileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const projectLanguage = String(project.language || "").toLowerCase();
  if (projectLanguage && !["both", "auto", "user"].includes(projectLanguage)) return projectLanguage;
  return detectLanguage(text);
}

function localFileExists(relativePath) {
  const fs = require("fs");
  const path = require("path");
  return fs.existsSync(path.join(repoRoot(), relativePath));
}

function capability(action, value) {
  const areas = getSystemAreas();
  if (!action || action === "list") {
    console.log(table(["ID", "Area", "Group"], areas.map((area) => [area.id, area.name, area.group])));
    return;
  }

  if (action === "show") {
    const key = String(value || "").toLowerCase();
    if (!key) throw new Error("Missing capability id or name.");
    const area = areas.find((item) => String(item.id) === key || item.key === key || item.name.toLowerCase() === key);
    if (!area) throw new Error(`Capability area not found: ${value}`);
    console.log(JSON.stringify(area, null, 2));
    return;
  }

  if (action === "map") {
    console.log(JSON.stringify({ areas, groups: buildCapabilityGroups() }, null, 2));
    return;
  }

  throw new Error(`Unknown capability action: ${action}`);
}

function repositoryStructure(action, value, flags = {}) {
  const map = getRepositoryFolderingMap();

  if (!action || action === "map" || action === "list") {
    const report = buildRepositoryStructureReport(map);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderRepositoryStructureMap(report);
    return;
  }

  if (action === "show") {
    const key = normalizeFolderPath(value);
    if (!key) throw new Error("Missing folder name. Example: kvdf structure show standard_systems");
    const entry = (map.current_to_target || []).find((item) => normalizeFolderPath(item.path) === key);
    const group = (map.target_root_groups || []).find((item) => item.group === key || normalizeFolderPath(item.target_path) === key);
    const legacy = map.legacy_aliases && map.legacy_aliases[`${key}/`];
    if (!entry && !group && !legacy) throw new Error(`Foldering entry not found: ${value}`);
    console.log(JSON.stringify(entry ? { type: "current_path", ...entry } : group ? { type: "target_group", ...group } : { type: "legacy_alias", path: `${key}/`, target_path: legacy }, null, 2));
    return;
  }

  if (action === "validate" || action === "check") {
    const report = buildRepositoryStructureReport(map);
    if (flags.json) console.log(JSON.stringify(report.validation, null, 2));
    else renderRepositoryStructureValidation(report.validation);
    if (report.validation.status === "fail") process.exitCode = 1;
    return;
  }

  if (action === "guide" || action === "docs") {
    const guide = {
      source_of_truth: "knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json",
      documentation: "docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md",
      recommended_commands: [
        "kvdf structure map",
        "kvdf structure validate",
        "kvdf structure show standard_systems",
        "kvdf validate foldering"
      ],
      ai_usage: map.ai_usage || {}
    };
    if (flags.json) console.log(JSON.stringify(guide, null, 2));
    else {
      console.log("Kabeeri Repository Foldering Guide");
      console.log(table(["Item", "Path"], [
        ["Source of truth", guide.source_of_truth],
        ["Documentation", guide.documentation],
        ["AI rule", guide.ai_usage.context_summary || ""]
      ]));
    }
    return;
  }

  throw new Error(`Unknown structure action: ${action}`);
}

function getRepositoryFolderingMap() {
  return readJsonFile("standard_systems/REPOSITORY_FOLDERING_MAP.json");
}

function buildRepositoryStructureReport(map = getRepositoryFolderingMap()) {
  const rootFolders = listDirectories(".").filter((name) => !["node_modules", ".next", "dist", "coverage"].includes(name));
  const allowed = new Set((map.allowed_top_level || []).map(normalizeFolderPath));
  const mapped = new Map((map.current_to_target || []).map((item) => [normalizeFolderPath(item.path), item]));
  const targetGroups = new Map((map.target_root_groups || []).map((item) => [item.group, item]));
  const unknown_folders = rootFolders.filter((name) => !allowed.has(normalizeFolderPath(name)));
  const missing_mapped_paths = (map.current_to_target || [])
    .map((item) => normalizeFolderPath(item.path))
    .filter((pathName) => pathName && !pathName.includes(".") && !rootFolders.includes(pathName) && pathName !== ".kabeeri")
    .filter((pathName) => pathName !== "github" || !rootFolders.includes("github"));
  const rows = (map.current_to_target || []).map((entry) => {
    const folder = normalizeFolderPath(entry.path);
    const group = targetGroups.get(entry.target_group) || {};
    return {
      path: entry.path,
      target_group: entry.target_group,
      target_path: group.target_path || "",
      role: entry.role,
      migration_status: entry.migration_status,
      exists: rootFolders.includes(folder) || folder === ".kabeeri" || fileExists(folder)
    };
  });

  const validation = {
    report_type: "repository_foldering_validation",
    generated_at: new Date().toISOString(),
    status: unknown_folders.length === 0 ? "pass" : "needs_attention",
    unknown_folders,
    missing_mapped_paths,
    mapped_paths: rows.length,
    target_groups: (map.target_root_groups || []).length,
    next_actions: unknown_folders.length === 0
      ? ["Continue routing new features through the foldering map before adding top-level folders."]
      : unknown_folders.map((folder) => `Classify ${folder}/ into an existing target group or document a new-folder exception.`)
  };

  return {
    report_type: "repository_foldering_map",
    generated_at: new Date().toISOString(),
    map_version: map.map_version,
    status: map.status,
    principles: map.principles || [],
    target_root_groups: map.target_root_groups || [],
    current_to_target: rows,
    validation,
    ai_usage: map.ai_usage || {}
  };
}

function normalizeFolderPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/\/$/, "");
}

function renderRepositoryStructureMap(report) {
  console.log(`Kabeeri Repository Foldering Map v${report.map_version}`);
  console.log(table(["Current path", "Target group", "Target path", "Status"], report.current_to_target.map((item) => [
    item.path,
    item.target_group,
    item.target_path,
    item.migration_status
  ])));
  console.log("");
  renderRepositoryStructureValidation(report.validation);
}

function renderRepositoryStructureValidation(validation) {
  console.log(`Foldering validation: ${validation.status}`);
  console.log(table(["Check", "Value"], [
    ["Target groups", validation.target_groups],
    ["Mapped paths", validation.mapped_paths],
    ["Unknown folders", validation.unknown_folders.length ? validation.unknown_folders.join(", ") : "none"],
    ["Missing mapped paths", validation.missing_mapped_paths.length ? validation.missing_mapped_paths.join(", ") : "none"]
  ]));
  if (validation.next_actions && validation.next_actions.length) {
    console.log("");
    console.log("Next actions:");
    validation.next_actions.forEach((item) => console.log(`- ${item}`));
  }
}

function blueprint(action, value, flags = {}, rest = []) {
  const catalog = getProductBlueprintCatalog();
  const blueprints = catalog.blueprints || [];

  if (!action || action === "list") {
    const rows = blueprints.map((item) => [item.key, item.name, item.category, item.recommended_delivery, (item.channels || []).join(",")]);
    console.log(table(["Key", "Blueprint", "Category", "Delivery", "Channels"], rows));
    return;
  }

  if (action === "show") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const result = buildBlueprintContext(item, catalog.core_platform);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "recommend" || action === "detect" || action === "map") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product description.");
    const recommendation = buildBlueprintRecommendation(input, flags);
    if (fileExists(".kabeeri")) {
      const state = readProductBlueprintState();
      state.recommendations.push(recommendation);
      writeJsonFile(".kabeeri/product_blueprints.json", state);
    }
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderBlueprintRecommendation(recommendation);
    return;
  }

  if (action === "select" || action === "choose") {
    ensureWorkspace();
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const state = readProductBlueprintState();
    const selection = buildBlueprintSelection(item, flags);
    state.selected_blueprints.push(selection);
    state.current_blueprint = item.key;
    writeJsonFile(".kabeeri/product_blueprints.json", state);
    if (fileExists(".kabeeri/project.json")) {
      const project = readJsonFile(".kabeeri/project.json");
      project.product_blueprint = item.key;
      if (flags.delivery) project.delivery_mode = flags.delivery;
      writeJsonFile(".kabeeri/project.json", project);
    }
    console.log(JSON.stringify(selection, null, 2));
    return;
  }

  if (action === "context") {
    const item = findProductBlueprint(value);
    if (!item) throw new Error(`Product blueprint not found: ${value || ""}`);
    const context = buildAiBlueprintContext(item, catalog.core_platform);
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else {
      console.log(`AI Context: ${item.name}`);
      console.log(table(["Surface", "Items"], [
        ["Channels", context.channels.join(", ")],
        ["Backend modules", context.backend_modules.join(", ")],
        ["Frontend pages", context.frontend_pages.join(", ")],
        ["Database entities", context.database_entities.join(", ")],
        ["Workstreams", context.workstreams.join(", ")],
        ["Governance", context.governance_links.join(", ")]
      ]));
    }
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readProductBlueprintState();
    const rows = state.recommendations.map((item) => [
      item.recommendation_id,
      item.matches[0] ? item.matches[0].blueprint_key : "",
      item.matches[0] ? item.matches[0].score : 0,
      item.input
    ]);
    console.log(table(["ID", "Top match", "Score", "Input"], rows));
    return;
  }

  throw new Error(`Unknown blueprint action: ${action}`);
}

function getProductBlueprintCatalog() {
  return readJsonFile("standard_systems/PRODUCT_BLUEPRINT_CATALOG.json");
}

function findProductBlueprint(keyOrName) {
  const lookup = String(keyOrName || "").toLowerCase();
  if (!lookup) return null;
  return getProductBlueprintCatalog().blueprints.find((item) => {
    const names = [item.key, item.name, ...(item.aliases || [])].map((entry) => String(entry).toLowerCase());
    return names.includes(lookup);
  }) || null;
}

function readProductBlueprintState() {
  if (!fileExists(".kabeeri/product_blueprints.json")) {
    return { selected_blueprints: [], recommendations: [], current_blueprint: null };
  }
  const state = readJsonFile(".kabeeri/product_blueprints.json");
  return {
    selected_blueprints: state.selected_blueprints || [],
    recommendations: state.recommendations || [],
    current_blueprint: state.current_blueprint || null
  };
}

function buildBlueprintRecommendation(input, flags = {}) {
  const catalog = getProductBlueprintCatalog();
  const text = String(input || "").toLowerCase();
  const tokens = tokenizeBlueprintText(text);
  const matches = (catalog.blueprints || [])
    .map((item) => scoreBlueprint(item, text, tokens, flags))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(flags.limit || 5));
  const top = matches[0] ? findProductBlueprint(matches[0].blueprint_key) : null;
  return {
    recommendation_id: `blueprint-recommendation-${Date.now()}`,
    created_at: new Date().toISOString(),
    input,
    matches,
    suggested_delivery_mode: top ? top.recommended_delivery : "structured",
    developer_decision_required: true,
    ai_context_summary: top ? buildAiBlueprintContext(top, catalog.core_platform) : null,
    next_actions: top ? [
      `Review blueprint: kvdf blueprint show ${top.key}`,
      `Record choice: kvdf blueprint select ${top.key} --delivery ${top.recommended_delivery === "hybrid" ? "agile|structured" : top.recommended_delivery}`,
      "Use the AI context summary before creating tasks to reduce repeated discovery."
    ] : ["Clarify project type, main users, channels, payments/content/mobile needs."]
  };
}

function tokenizeBlueprintText(text) {
  return String(text || "")
    .split(/[^\p{L}\p{N}_]+/u)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function scoreBlueprint(item, text, tokens, flags = {}) {
  const reasons = [];
  let score = 0;
  const terms = uniqueList([item.key, item.name, ...(item.aliases || [])].map((entry) => String(entry).toLowerCase()));
  for (const term of terms) {
    if (!term) continue;
    if (text.includes(term)) {
      score += term === item.key ? 8 : 6;
      reasons.push(`matched term: ${term}`);
    }
  }
  for (const moduleName of [...(item.backend_modules || []), ...(item.frontend_pages || []), ...(item.database_entities || []), ...(item.channels || [])]) {
    const normalized = String(moduleName).toLowerCase().replace(/_/g, " ");
    if (text.includes(normalized) || tokens.includes(String(moduleName).toLowerCase())) score += 1;
  }
  if (flags.channel && (item.channels || []).includes(flags.channel)) {
    score += 3;
    reasons.push(`requested channel: ${flags.channel}`);
  }
  if (flags.category && item.category === flags.category) {
    score += 3;
    reasons.push(`requested category: ${flags.category}`);
  }
  if (flags.delivery && item.recommended_delivery === flags.delivery) {
    score += 2;
    reasons.push(`delivery fit: ${flags.delivery}`);
  }
  return {
    blueprint_key: item.key,
    name: item.name,
    category: item.category,
    score,
    recommended_delivery: item.recommended_delivery,
    reasons: reasons.slice(0, 5)
  };
}

function buildBlueprintContext(item, corePlatform) {
  return {
    ...item,
    core_platform: corePlatform,
    ai_context_summary: buildAiBlueprintContext(item, corePlatform)
  };
}

function buildAiBlueprintContext(item, corePlatform) {
  return {
    blueprint_key: item.key,
    name: item.name,
    category: item.category,
    recommended_delivery: item.recommended_delivery,
    channels: uniqueList([...(item.channels || [])]),
    backend_modules: uniqueList([...(corePlatform.backend_modules || []), ...(item.backend_modules || [])]),
    frontend_pages: uniqueList([...(item.frontend_pages || [])]),
    database_entities: uniqueList([...(corePlatform.database_entities || []), ...(item.database_entities || [])]),
    workstreams: uniqueList([...(item.workstreams || [])]),
    governance_links: uniqueList([...(corePlatform.governance_links || []), "capability_map", "runtime_schemas"]),
    risk_flags: uniqueList([...(item.risk_flags || [])])
  };
}

function buildBlueprintSelection(item, flags = {}) {
  const catalog = getProductBlueprintCatalog();
  const context = buildAiBlueprintContext(item, catalog.core_platform);
  return {
    selection_id: `blueprint-selection-${Date.now()}`,
    blueprint_key: item.key,
    selected_at: new Date().toISOString(),
    delivery_mode: flags.delivery || item.recommended_delivery,
    reason: flags.reason || "Selected by developer",
    channels: context.channels,
    backend_modules: context.backend_modules,
    frontend_pages: context.frontend_pages,
    database_entities: context.database_entities,
    workstreams: context.workstreams
  };
}

function renderBlueprintRecommendation(recommendation) {
  console.log(`Blueprint recommendation: ${recommendation.recommendation_id}`);
  console.log(table(["Blueprint", "Score", "Delivery", "Reasons"], recommendation.matches.map((item) => [
    `${item.name} (${item.blueprint_key})`,
    item.score,
    item.recommended_delivery,
    (item.reasons || []).join("; ")
  ])));
  if (recommendation.ai_context_summary) {
    const summary = recommendation.ai_context_summary;
    console.log("");
    console.log(`Top context: ${summary.name}`);
    console.log(table(["Surface", "Items"], [
      ["Channels", summary.channels.join(", ")],
      ["Backend modules", summary.backend_modules.slice(0, 12).join(", ")],
      ["Frontend pages", summary.frontend_pages.slice(0, 12).join(", ")],
      ["Database entities", summary.database_entities.slice(0, 12).join(", ")]
    ]));
  }
}

function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function dataDesign(action, value, flags = {}, rest = []) {
  const catalog = getDataDesignCatalog();

  if (!action || action === "principles" || action === "list") {
    const rows = catalog.universal_principles.map((item) => [item.key, item.title, item.why]);
    console.log(table(["Key", "Principle", "Why"], rows));
    return;
  }

  if (action === "principle" || action === "show") {
    const key = String(value || "").toLowerCase();
    const principle = catalog.universal_principles.find((item) => item.key === key);
    if (!principle) throw new Error(`Data design principle not found: ${value || ""}`);
    console.log(JSON.stringify(principle, null, 2));
    return;
  }

  if (action === "modules") {
    const rows = Object.entries(catalog.module_patterns).map(([key, item]) => [key, (item.entities || []).slice(0, 8).join(", "), (item.must_have || []).slice(0, 6).join(", ")]);
    console.log(table(["Module", "Entities", "Must have"], rows));
    return;
  }

  if (action === "module") {
    const key = String(value || "").toLowerCase();
    const module = catalog.module_patterns[key];
    if (!module) throw new Error(`Data design module not found: ${value || ""}`);
    console.log(JSON.stringify({ module_key: key, ...module }, null, 2));
    return;
  }

  if (action === "context" || action === "blueprint") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf data-design context ecommerce` or select a product blueprint first.");
    const context = buildDataDesignContext(blueprintKey, flags);
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context);
    return;
  }

  if (action === "recommend") {
    const input = [value, ...rest].filter(Boolean).join(" ");
    if (!input) throw new Error("Missing product or database description.");
    const blueprintRecommendation = buildBlueprintRecommendation(input, { limit: 1 });
    const top = blueprintRecommendation.matches[0] ? blueprintRecommendation.matches[0].blueprint_key : flags.blueprint;
    if (!top) throw new Error("Could not detect a product blueprint. Use --blueprint <key>.");
    const context = buildDataDesignContext(top, { ...flags, input });
    if (fileExists(".kabeeri")) {
      const state = readDataDesignState();
      state.contexts.push(context);
      state.current_context = context.context_id;
      writeJsonFile(".kabeeri/data_design.json", state);
    }
    if (flags.json) console.log(JSON.stringify(context, null, 2));
    else renderDataDesignContext(context);
    return;
  }

  if (action === "review") {
    ensureWorkspace();
    const target = value || flags.file || flags.target || "database_design";
    const review = buildDataDesignReview(target, flags);
    const state = readDataDesignState();
    state.reviews.push(review);
    writeJsonFile(".kabeeri/data_design.json", state);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "checklist") {
    if (flags.json) console.log(JSON.stringify({ checklist: catalog.approval_checklist }, null, 2));
    else console.log(table(["#", "Check"], catalog.approval_checklist.map((item, index) => [index + 1, item])));
    return;
  }

  if (action === "history") {
    ensureWorkspace();
    const state = readDataDesignState();
    console.log(table(["Context", "Blueprint", "Modules", "Entities"], state.contexts.map((item) => [
      item.context_id,
      item.blueprint_key,
      item.modules.join(","),
      String((item.entities || []).length)
    ])));
    return;
  }

  throw new Error(`Unknown data-design action: ${action}`);
}

function getDataDesignCatalog() {
  return readJsonFile("standard_systems/DATA_DESIGN_BLUEPRINT.json");
}

function readDataDesignState() {
  if (!fileExists(".kabeeri/data_design.json")) return { contexts: [], reviews: [], current_context: null };
  const state = readJsonFile(".kabeeri/data_design.json");
  return {
    contexts: state.contexts || [],
    reviews: state.reviews || [],
    current_context: state.current_context || null
  };
}

function getCurrentBlueprintKey() {
  if (!fileExists(".kabeeri/product_blueprints.json")) return null;
  const state = readProductBlueprintState();
  return state.current_blueprint;
}

function buildDataDesignContext(blueprintKey, flags = {}) {
  const dataCatalog = getDataDesignCatalog();
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const modules = uniqueList(dataCatalog.blueprint_module_map[product.key] || ["core"]);
  const patterns = modules.map((key) => ({ key, ...(dataCatalog.module_patterns[key] || {}) }));
  const entities = uniqueList(patterns.flatMap((item) => item.entities || []));
  const mustHave = uniqueList(patterns.flatMap((item) => item.must_have || []));
  const indexes = uniqueList(patterns.flatMap((item) => item.indexes || []));
  const principles = dataCatalog.universal_principles.map((item) => item.key);
  return {
    context_id: `data-context-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    input: flags.input || null,
    modules,
    entities,
    must_have: mustHave,
    indexes,
    risk_flags: uniqueList([...(product.risk_flags || []), ...inferDataRiskFlags(modules)]),
    principles,
    checklist: dataCatalog.approval_checklist,
    ai_instructions: [
      "Design from business workflow before screens.",
      "Use normalized master data and snapshots for historical operations.",
      "Use primary keys, foreign keys, constraints, indexes, migrations, transactions, and idempotency where relevant.",
      "Do not implement database changes without migration and rollback planning for production systems.",
      "Use this context as a starting point; confirm requirements and acceptance criteria before coding."
    ]
  };
}

function inferDataRiskFlags(modules) {
  const risks = [];
  if (modules.includes("commerce")) risks.push("money_precision", "order_snapshots", "payment_idempotency");
  if (modules.includes("inventory")) risks.push("stock_movements", "concurrency");
  if (modules.includes("accounting")) risks.push("balanced_ledgers", "no_destructive_delete");
  if (modules.includes("cms_news")) risks.push("slug_redirects", "content_revisions");
  if (modules.includes("mobile")) risks.push("mobile_retries", "push_tokens", "offline_sync");
  if (modules.includes("booking")) risks.push("appointment_overlap", "timezone");
  if (modules.includes("delivery")) risks.push("tracking_events", "cod_reconciliation");
  if (modules.includes("integration")) risks.push("outbox_events", "provider_logs");
  return risks;
}

function buildDataDesignReview(target, flags = {}) {
  const text = [target, flags.notes || "", flags.entities || ""].join(" ").toLowerCase();
  const findings = [];
  const requiredSignals = [
    ["primary key", "Primary keys not mentioned."],
    ["foreign key", "Foreign keys not mentioned."],
    ["created_at", "created_at timestamps not mentioned."],
    ["updated_at", "updated_at timestamps not mentioned."],
    ["audit", "Audit logs not mentioned."],
    ["index", "Indexes not mentioned."],
    ["migration", "Migrations not mentioned."]
  ];
  for (const [needle, finding] of requiredSignals) {
    if (!text.includes(needle)) findings.push(finding);
  }
  if (text.includes("price float") || text.includes("amount float")) findings.push("Money appears to use float; use decimal or integer minor units.");
  if (text.includes("items json")) findings.push("Order/items appear stored as JSON; use child tables for reportable relationships.");
  if (text.includes("stock_quantity") && !text.includes("stock_movements")) findings.push("Inventory quantity appears direct-only; use stock_movements as source of truth.");
  return {
    review_id: `data-review-${Date.now()}`,
    created_at: new Date().toISOString(),
    target,
    status: findings.length ? "needs_attention" : "pass",
    findings,
    checked_rules: ["keys", "timestamps", "audit", "indexes", "migrations", "money", "json_overuse", "inventory_movements"]
  };
}

function renderDataDesignContext(context) {
  console.log(`Data design context: ${context.context_id}`);
  console.log(`Blueprint: ${context.blueprint_name} (${context.blueprint_key})`);
  console.log(table(["Surface", "Items"], [
    ["Modules", context.modules.join(", ")],
    ["Entities", context.entities.slice(0, 24).join(", ")],
    ["Must have", context.must_have.slice(0, 18).join(", ")],
    ["Indexes", context.indexes.slice(0, 12).join(", ")],
    ["Risks", context.risk_flags.join(", ")]
  ]));
}

function resolveQuestionnaireGroups(profile, group) {
  if (group) {
    assertSafeName(group);
    if (!["core", "production", "extension"].includes(group)) throw new Error("Invalid questionnaire group. Use core, production, or extension.");
    return [group];
  }
  const profileGroups = {
    lite: ["core"],
    standard: ["core", "production"],
    enterprise: ["core", "production", "extension"]
  };
  const normalized = profile || "lite";
  assertSafeName(normalized);
  if (!profileGroups[normalized]) throw new Error("Invalid questionnaire profile. Use lite, standard, or enterprise.");
  return profileGroups[normalized];
}

function copyQuestionnaireFiles(files, output, force) {
  const fs = require("fs");
  const path = require("path");
  const outputRoot = path.resolve(repoRoot(), output);
  for (const file of files) {
    const relative = file.replace(/^questionnaires\//, "");
    const target = path.join(outputRoot, relative);
    if (fs.existsSync(target) && !force) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(resolveAsset(file), target);
  }
}

function buildQuestionnaireFlow() {
  return {
    version: "v5.0.0",
    flow: [
      "entry_questions",
      "project_type_detection",
      "system_area_activation",
      "grouped_questionnaires",
      "conditional_deep_questions",
      "coverage_review",
      "missing_answers_only",
      "generated_docs_tasks"
    ],
    states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    rule_keys: ["question_minimization", "progressive_expansion", "unknown_follow_up", "no_silent_skip", "traceability"],
    rules: [
      "Question Minimization",
      "Progressive Expansion",
      "Unknown Follow-up",
      "No Silent Skip",
      "Traceability"
    ],
    entry_questions: getEntryQuestions()
  };
}

function getEntryQuestions() {
  return [
    { question_id: "entry.project_type", text: "What type of project is this?", choices: ["saas", "ecommerce", "booking", "content", "landing_page", "internal_tool", "api", "mobile_app"] },
    { question_id: "entry.complexity", text: "How complex is the first release?", choices: ["small", "medium", "large", "unknown"] },
    { question_id: "entry.has_users", text: "Will people sign in?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_admin", text: "Does it need an admin panel?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_payments", text: "Are payments or billing required in V1?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_multi_tenancy", text: "Will multiple companies/tenants use separated spaces?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_public_frontend", text: "Does it have public pages?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.needs_integrations", text: "Does it integrate with external systems?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.needs_ai_features", text: "Does the product itself include AI features?", choices: ["yes", "no", "later", "unknown"] }
  ];
}

function inferQuestionnaireBlueprint(description, flags = {}) {
  if (flags.blueprint) return flags.blueprint;
  const input = String(description || "").trim();
  if (!input) return null;
  const recommendation = buildBlueprintRecommendation(input, { limit: 1 });
  return recommendation.matches[0] ? recommendation.matches[0].blueprint_key : null;
}

function buildQuestionnaireIntakePlan(description, blueprintKey, flags = {}) {
  const blueprint = findProductBlueprint(blueprintKey);
  if (!blueprint) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const outputLanguage = resolveOutputLanguage(flags, description);
  const blueprintContext = buildBlueprintContext(blueprint, getProductBlueprintCatalog().core_platform);
  const dataContext = buildDataDesignContext(blueprint.key, flags);
  const uiContext = buildUiDesignRecommendation(blueprint.key, flags);
  const delivery = buildDeliveryModeRecommendation(description, {
    ...flags,
    enterprise: flags.enterprise || /erp|enterprise|compliance|audit|large/i.test(description)
  });
  const frameworks = buildQuestionnaireFrameworkContext(description, blueprint, flags);
  const questions = buildAdaptiveIntakeQuestions({
    blueprint,
    blueprintContext,
    dataContext,
    uiContext,
    delivery,
    frameworks,
    flags
  });

  return {
    plan_id: `questionnaire-intake-${Date.now()}`,
    created_at: new Date().toISOString(),
    description,
    input_language: detectLanguage(description),
    output_language: outputLanguage,
    language_policy: "follow_user_language_unless_overridden",
    goal: "Generate focused developer questions that identify product type, framework stack, database model, UI approach, and delivery methodology before task generation.",
    blueprint: {
      key: blueprint.key,
      name: blueprint.name,
      category: blueprint.category,
      recommended_delivery: blueprint.recommended_delivery,
      channels: blueprint.channels || [],
      backend_modules: blueprint.backend_modules || [],
      frontend_pages: blueprint.frontend_pages || [],
      database_entities: blueprint.database_entities || [],
      risk_flags: blueprint.risk_flags || []
    },
    delivery_mode_recommendation: {
      recommended_mode: delivery.recommended_mode,
      confidence: delivery.confidence,
      scores: delivery.scores,
      developer_decision_required: true
    },
    framework_context: frameworks,
    data_design_context: {
      modules: dataContext.modules,
      entities: dataContext.entities,
      must_have: dataContext.must_have,
      risk_flags: dataContext.risk_flags
    },
    ui_ux_context: {
      experience_pattern: uiContext.experience_pattern,
      recommended_stacks: uiContext.recommended_stacks,
      component_groups: uiContext.component_groups,
      page_templates: uiContext.page_templates,
      layout_priorities: uiContext.layout_priorities,
      seo_geo: uiContext.seo_geo
    },
    generated_questions: questions,
    answer_commands: questions.slice(0, 8).map((question) => `kvdf questionnaire answer ${question.question_id} --value "<answer>" --areas ${question.area_ids.join(",")}`),
    next_actions: [
      `Answer and documentation language should be ${outputLanguage === "ar" ? "Arabic" : outputLanguage === "en" ? "English" : "the user's language"}.`,
      "Ask only the generated questions that are not already known from the developer's natural-language request.",
      "Record confirmed answers with `kvdf questionnaire answer` so coverage and missing-answer reports update.",
      "Use `kvdf delivery choose <mode>` after the developer approves Agile or Structured.",
      "Use Product Blueprint, Data Design, UI/UX Advisor, and Prompt Pack context before generating tasks."
    ]
  };
}

function buildQuestionnaireFrameworkContext(description, blueprint, flags = {}) {
  const packs = getPromptPackCatalog();
  const explicit = uniqueList(parseCsv([flags.framework, flags.backend, flags.frontend, flags.mobile, flags.stack].filter(Boolean).join(",")));
  const detected = detectFrameworkPacks(description, packs);
  const recommended = recommendFrameworkPacksForBlueprint(blueprint, packs);
  const selected = uniqueList([...explicit, ...detected, ...recommended].filter((item) => packs.some((pack) => pack.pack === item))).slice(0, 6);
  return {
    selected_packs: selected,
    explicit_packs: explicit,
    detected_packs: detected,
    recommended_packs: recommended,
    available_packs: packs.map((pack) => ({ pack: pack.pack, display_name: pack.display_name || pack.pack })),
    required_decisions: [
      "Confirm backend framework.",
      "Confirm frontend framework or UI library.",
      "Confirm mobile framework if mobile_app is in scope.",
      "Confirm database engine and ORM/migration approach.",
      "Confirm whether stack choice is fixed by the developer/client or open to recommendation."
    ]
  };
}

function getPromptPackCatalog() {
  return listFiles("prompt_packs", "prompt_pack_manifest.json", true)
    .map((file) => {
      const data = readJsonFile(file);
      const pack = data.pack || file.split("/")[1];
      return { pack, display_name: data.display_name || pack, files: data.files || [], rule: data.rule || "" };
    })
    .filter((item) => item.pack && item.pack !== "common")
    .sort((a, b) => a.pack.localeCompare(b.pack));
}

function detectFrameworkPacks(description, packs) {
  const text = String(description || "").toLowerCase();
  return packs
    .filter((pack) => {
      const names = [pack.pack, pack.display_name].filter(Boolean).map((item) => String(item).toLowerCase());
      return names.some((name) => text.includes(name));
    })
    .map((pack) => pack.pack);
}

function recommendFrameworkPacksForBlueprint(blueprint, packs) {
  const available = new Set(packs.map((pack) => pack.pack));
  const recommended = [];
  const channels = blueprint.channels || [];
  const category = blueprint.category || "";
  if (channels.includes("website") || channels.includes("customer_portal") || category.includes("content") || category.includes("commerce")) {
    if (available.has("nextjs")) recommended.push("nextjs");
    if (available.has("laravel")) recommended.push("laravel");
  }
  if (channels.includes("admin_panel") || (blueprint.frontend_pages || []).some((page) => String(page).startsWith("admin"))) {
    if (available.has("react")) recommended.push("react");
  }
  if (channels.some((item) => String(item).includes("mobile"))) {
    if (available.has("react-native-expo")) recommended.push("react-native-expo");
    if (available.has("flutter")) recommended.push("flutter");
  }
  if (category.includes("business_operations") || ["erp", "crm", "inventory_wms", "accounting_billing"].includes(blueprint.key)) {
    if (available.has("laravel")) recommended.push("laravel");
    if (available.has("nestjs")) recommended.push("nestjs");
    if (available.has("dotnet")) recommended.push("dotnet");
  }
  return uniqueList(recommended).slice(0, 4);
}

function buildAdaptiveIntakeQuestions(context) {
  const { blueprint, dataContext, uiContext, delivery, frameworks } = context;
  const questions = [];
  const add = (question) => questions.push({
    priority: question.priority || "medium",
    source_systems: question.source_systems || [],
    area_ids: question.area_ids || [],
    question_id: question.question_id,
    text: question.text,
    why: question.why,
    answer_type: question.answer_type || "text",
    choices: question.choices || []
  });

  add({
    priority: "high",
    question_id: "adaptive.product.blueprint_confirmation",
    text: `Is this project best described as ${blueprint.name}, or should Kabeeri use a different product blueprint?`,
    why: "The product blueprint determines modules, pages, database entities, workstreams, and risks.",
    answer_type: "choice",
    choices: [blueprint.key, "different_blueprint", "hybrid"],
    area_ids: ["product_business", "mvp_scope"],
    source_systems: ["product_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.delivery.mode_confirmation",
    text: `Should delivery use ${delivery.recommended_mode}, or does the developer prefer Agile/Structured differently?`,
    why: "The delivery mode changes planning depth, approval gates, sprint/phase records, and task slicing.",
    answer_type: "choice",
    choices: ["agile", "structured", "hybrid", "undecided"],
    area_ids: ["kabeeri_control_layer", "mvp_scope"],
    source_systems: ["delivery_mode_advisor"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.backend",
    text: "Which backend framework should own APIs, auth, business rules, migrations, and integrations?",
    why: "Framework choice selects prompt packs, folder rules, migrations, testing style, and execution scope.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "laravel", "nestjs", "django", "dotnet", "fastapi", "expressjs", "not_decided"]),
    area_ids: ["backend", "api_layer", "technology_governance"],
    source_systems: ["prompt_packs", "framework_context"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.frontend",
    text: "Which frontend framework/library should own the public/admin UI?",
    why: "Frontend stack affects routing, components, state, SEO/GEO, visual QA, and prompt pack selection.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "react", "nextjs", "vue", "nuxt-vue", "angular", "astro", "not_decided"]),
    area_ids: ["public_frontend", "admin_frontend", "technology_governance"],
    source_systems: ["prompt_packs", "ui_ux_advisor"]
  });
  if ((blueprint.channels || []).some((item) => String(item).includes("mobile"))) {
    add({
      priority: "high",
      question_id: "adaptive.framework.mobile",
      text: "Will the mobile channel use React Native Expo, Flutter, native apps, or be deferred?",
      why: "Mobile stack affects offline state, push notifications, app versions, deep links, permissions, and release handoff.",
      answer_type: "choice",
      choices: ["react-native-expo", "flutter", "native_ios_android", "deferred", "not_needed"],
      area_ids: ["mobile", "technology_governance"],
      source_systems: ["prompt_packs", "ui_ux_advisor"]
    });
  }
  add({
    priority: "high",
    question_id: "adaptive.database.engine",
    text: "Which database engine should be used, and is multi-tenancy required from day one?",
    why: "Database engine and tenancy shape migrations, constraints, indexing, data isolation, backups, and reporting.",
    answer_type: "text",
    choices: ["postgresql", "mysql", "sqlite_for_mvp", "mongodb", "not_decided"],
    area_ids: ["database", "multi_tenancy"],
    source_systems: ["data_design_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.database.workflow_entities",
    text: `Are these core entities correct for V1: ${dataContext.entities.slice(0, 12).join(", ")}?`,
    why: "Confirmed entities reduce database redesign and keep tasks aligned with the real business workflow.",
    answer_type: "confirm_or_edit",
    area_ids: ["database", "product_business"],
    source_systems: ["data_design_blueprint", "product_blueprint"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.experience_pattern",
    text: `Should the UI follow the ${uiContext.experience_pattern} pattern with pages like ${uiContext.page_templates.slice(0, 8).join(", ")}?`,
    why: "The UI pattern controls component groups, page templates, SEO/GEO needs, dashboard density, and mobile ergonomics.",
    answer_type: "confirm_or_edit",
    area_ids: ["ui_ux_design", "public_frontend", "admin_frontend"],
    source_systems: ["ui_ux_advisor"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.design_source",
    text: "Is there an approved design source, brand guide, reference website, Figma, or should Kabeeri propose a UI direction?",
    why: "Design governance blocks frontend implementation until design source, text spec, and visual expectations are clear.",
    answer_type: "choice",
    choices: ["figma_available", "brand_guide_available", "reference_sites", "kabeeri_suggests", "not_decided"],
    area_ids: ["ui_ux_design", "design_governance"],
    source_systems: ["ui_ux_advisor", "design_governance"]
  });
  for (const risk of (blueprint.risk_flags || []).slice(0, 4)) {
    add({
      priority: "medium",
      question_id: `adaptive.risk.${risk}`,
      text: `How should the project handle this risk: ${risk}?`,
      why: "Blueprint risks should become acceptance criteria, policy checks, or explicit deferrals.",
      answer_type: "text",
      area_ids: ["security", "qa", "product_business"],
      source_systems: ["product_blueprint", "policy_gates"]
    });
  }
  return questions;
}

function renderQuestionnaireIntakePlan(plan) {
  console.log(`Questionnaire intake plan: ${plan.plan_id}`);
  console.log(table(["Surface", "Value"], [
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Delivery", `${plan.delivery_mode_recommendation.recommended_mode} (${plan.delivery_mode_recommendation.confidence})`],
    ["Framework packs", plan.framework_context.selected_packs.join(", ") || "needs decision"],
    ["Data modules", plan.data_design_context.modules.join(", ")],
    ["UI pattern", plan.ui_ux_context.experience_pattern],
    ["Questions", plan.generated_questions.length]
  ]));
  console.log("");
  console.log(table(["Priority", "Question ID", "Question"], plan.generated_questions.map((item) => [
    item.priority,
    item.question_id,
    item.text
  ])));
}

function buildCoverageMatrix() {
  const answers = fileExists(".kabeeri/questionnaires/answers.json") ? readJsonFile(".kabeeri/questionnaires/answers.json").answers || [] : [];
  const answerMap = Object.fromEntries(answers.map((answer) => [answer.question_id, answer]));
  const projectType = normalizeAnswerValue(answerMap["entry.project_type"] && answerMap["entry.project_type"].value);
  const complexity = normalizeAnswerValue(answerMap["entry.complexity"] && answerMap["entry.complexity"].value);
  const areas = getSystemAreas().map((area) => {
    const activation = activateSystemArea(area, answerMap, projectType, complexity);
    const relatedAnswers = answers.filter((answer) => (answer.area_ids || []).includes(area.key));
    const status = relatedAnswers.some((answer) => ["unknown", "unsure", "not sure", "maybe"].includes(normalizeAnswerValue(answer.value)))
      ? "needs_follow_up"
      : activation.status;
    return {
      area_id: area.id,
      area_key: area.key,
      area: area.name,
      group: area.group,
      status,
      reason: status === "needs_follow_up" ? "Answer is uncertain and needs follow-up." : activation.reason,
      required_action: getCoverageAction(status, area),
      question_group: area.question_group,
      answered: relatedAnswers.length > 0,
      answers: relatedAnswers.map((answer) => ({
        answer_id: answer.answer_id,
        question_id: answer.question_id,
        source_mode: answer.source_mode
      }))
    };
  });
  return {
    generated_at: new Date().toISOString(),
    source: ".kabeeri/questionnaires/answers.json",
    project_type: projectType || "unknown",
    complexity: complexity || "unknown",
    areas,
    summary: summarizeBy(areas, "status")
  };
}

function writeQuestionnaireReports(matrix) {
  writeJsonFile(".kabeeri/questionnaires/coverage_matrix.json", matrix);
  writeJsonFile(".kabeeri/questionnaires/missing_answers_report.json", buildMissingAnswersReport(matrix));
}

function buildMissingAnswersReport(matrix) {
  const missing = (matrix.areas || [])
    .filter((area) => ["required", "unknown", "needs_follow_up"].includes(area.status) && !area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      status: area.status,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  const followUp = (matrix.areas || [])
    .filter((area) => area.status === "needs_follow_up" && area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  return {
    generated_at: new Date().toISOString(),
    project_type: matrix.project_type,
    missing,
    follow_up: followUp,
    totals: {
      missing: missing.length,
      follow_up: followUp.length
    }
  };
}

function generateTasksFromCoverage(flags = {}) {
  ensureWorkspace();
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "generate questionnaire tasks");
  const matrix = buildCoverageMatrix();
  writeQuestionnaireReports(matrix);
  const tasksFile = ".kabeeri/tasks.json";
  const tasksData = readJsonFile(tasksFile);
  tasksData.tasks = tasksData.tasks || [];
  const existingSources = new Set(tasksData.tasks.map((taskItem) => taskItem.source_reference).filter(Boolean));
  const targetStatuses = new Set(parseCsv(flags.statuses || "required,needs_follow_up"));
  const selected = matrix.areas.filter((area) => targetStatuses.has(area.status));
  const created = [];
  for (const area of selected) {
    const sourceReference = `coverage:${area.area_key}`;
    if (existingSources.has(sourceReference)) continue;
    const id = `task-${String(tasksData.tasks.length + 1).padStart(3, "0")}`;
    const taskItem = {
      id,
      title: `${area.status === "needs_follow_up" ? "Clarify" : "Define"} ${area.area}`,
      status: "proposed",
      type: area.status === "needs_follow_up" ? "questionnaire-follow-up" : "capability-coverage",
      workstream: mapAreaToWorkstream(area.area_key),
      workstreams: [mapAreaToWorkstream(area.area_key)],
      sprint_id: flags.sprint || null,
      source: "questionnaire_coverage",
      source_reference: sourceReference,
      source_mode: area.status === "needs_follow_up" ? "required" : "derived",
      provenance: {
        system_area_id: area.area_id,
        system_area_key: area.area_key,
        question_ids: (area.answers || []).map((answer) => answer.question_id),
        answer_ids: (area.answers || []).map((answer) => answer.answer_id),
        source_mode: area.status === "needs_follow_up" ? "required" : "derived",
        source_reason: area.reason
      },
      acceptance_criteria: [
        `${area.area} is answered, deferred, or marked not_applicable with a reason.`,
        "Coverage matrix is regenerated after the answer is recorded.",
        "Task provenance includes system area, question_id, answer_id, and source_mode when available."
      ],
      created_at: new Date().toISOString()
    };
    tasksData.tasks.push(taskItem);
    existingSources.add(sourceReference);
    created.push(taskItem);
  }
  writeJsonFile(tasksFile, tasksData);
  for (const taskItem of created) {
    appendAudit("task.generated_from_questionnaire", "task", taskItem.id, `Generated from ${taskItem.source_reference}`);
  }
  console.log(`Generated ${created.length} questionnaire coverage tasks.`);
}

function normalizeAnswerValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function inferAnswerConfidence(value) {
  return ["unknown", "unsure", "not_sure", "maybe"].includes(normalizeAnswerValue(value)) ? "low" : "confirmed";
}

function inferQuestionAreas(questionId) {
  const map = {
    "entry.project_type": ["product_business", "kabeeri_control_layer"],
    "entry.complexity": ["mvp_scope", "kabeeri_control_layer"],
    "entry.has_users": ["users_roles", "authentication", "authorization"],
    "entry.has_admin": ["admin_frontend", "admin_panel"],
    "entry.has_payments": ["payments_billing"],
    "entry.has_multi_tenancy": ["multi_tenancy", "tenant_admin_customization"],
    "entry.has_public_frontend": ["public_frontend", "seo", "accessibility"],
    "entry.needs_integrations": ["integrations"],
    "entry.needs_ai_features": ["ai_product_features"]
  };
  return map[questionId] || [];
}

function activateSystemArea(area, answers, projectType, complexity) {
  const value = (questionId) => normalizeAnswerValue(answers[questionId] && answers[questionId].value);
  const yes = (questionId) => value(questionId) === "yes";
  const no = (questionId) => value(questionId) === "no";
  const later = (questionId) => ["later", "deferred", "future"].includes(value(questionId));
  const unknown = (questionId) => !value(questionId) || value(questionId) === "unknown";
  const requiredBase = new Set(["product_business", "mvp_scope", "documentation", "kabeeri_control_layer", "security", "testing_qa", "error_handling"]);
  const backendProjects = new Set(["saas", "ecommerce", "booking", "internal_tool", "api", "mobile_app"]);
  const publicProjects = new Set(["saas", "ecommerce", "booking", "content", "landing_page"]);
  const commerceProjects = new Set(["ecommerce"]);

  if (requiredBase.has(area.key)) return { status: "required", reason: "Core Kabeeri project coverage area." };
  if (["backend_apis", "business_logic", "database"].includes(area.key) && backendProjects.has(projectType)) return { status: "required", reason: `${projectType} needs backend/data coverage.` };
  if (["public_frontend", "seo"].includes(area.key) && (publicProjects.has(projectType) || yes("entry.has_public_frontend"))) return { status: "required", reason: "Public pages exist." };
  if (["users_roles", "authentication", "authorization", "user_journeys", "onboarding"].includes(area.key)) {
    if (yes("entry.has_users") || ["saas", "ecommerce", "booking", "internal_tool", "mobile_app"].includes(projectType)) return { status: "required", reason: "Users need access and journeys." };
    if (unknown("entry.has_users")) return { status: "unknown", reason: "User access is not confirmed." };
    return { status: "not_applicable", reason: "No user sign-in in current scope." };
  }
  if (["admin_frontend", "admin_panel", "settings_system", "dashboard_customization"].includes(area.key)) {
    if (yes("entry.has_admin")) return { status: "required", reason: "Admin panel is required." };
    if (unknown("entry.has_admin")) return { status: "unknown", reason: "Admin need is not confirmed." };
    return { status: "not_applicable", reason: "No admin panel in current scope." };
  }
  if (area.key === "payments_billing") {
    if (yes("entry.has_payments") || commerceProjects.has(projectType)) return { status: "required", reason: "Payments or billing are in scope." };
    if (later("entry.has_payments")) return { status: "deferred", reason: "Payments are planned later." };
    if (unknown("entry.has_payments")) return { status: "unknown", reason: "Payments are not confirmed." };
    return { status: "not_applicable", reason: "Payments are not needed." };
  }
  if (["multi_tenancy", "tenant_admin_customization"].includes(area.key)) {
    if (yes("entry.has_multi_tenancy")) return { status: "required", reason: "Tenant separation is required." };
    if (later("entry.has_multi_tenancy")) return { status: "deferred", reason: "Multi-tenancy is planned later." };
    if (unknown("entry.has_multi_tenancy") && projectType === "saas") return { status: "unknown", reason: "SaaS tenancy model needs confirmation." };
    return { status: "not_applicable", reason: "Single organization/project scope." };
  }
  if (area.key === "integrations") {
    if (yes("entry.needs_integrations")) return { status: "required", reason: "External integrations are needed." };
    if (later("entry.needs_integrations")) return { status: "deferred", reason: "Integrations are planned later." };
    if (unknown("entry.needs_integrations")) return { status: "unknown", reason: "Integration need is not confirmed." };
  }
  if (area.key === "ai_product_features") {
    if (yes("entry.needs_ai_features")) return { status: "required", reason: "AI product features are in scope." };
    if (later("entry.needs_ai_features")) return { status: "deferred", reason: "AI features are planned later." };
    if (unknown("entry.needs_ai_features")) return { status: "unknown", reason: "AI product feature need is not confirmed." };
  }
  if (["monitoring", "backup_recovery", "deployment", "production_publish", "performance", "audit_logs", "legal_compliance", "data_governance"].includes(area.key)) {
    if (complexity === "large" || ["saas", "ecommerce", "booking"].includes(projectType)) return { status: "required", reason: "Operational readiness is important for this project type." };
    return { status: "optional", reason: "Useful for production hardening." };
  }
  if (no("entry.has_public_frontend") && ["seo", "accessibility", "public_frontend"].includes(area.key)) return { status: "not_applicable", reason: "No public frontend." };
  return { status: "optional", reason: "Useful capability, not confirmed for V1." };
}

function getCoverageAction(status, area) {
  const actions = {
    required: `Ask ${area.question_group} questions and generate tasks if unanswered.`,
    optional: "Keep available without blocking V1.",
    deferred: "Add to future roadmap and prevent accidental implementation now.",
    not_applicable: "No tasks required.",
    unknown: "Ask entry or follow-up questions before skipping.",
    needs_follow_up: "Ask small helper questions and resolve contradictions."
  };
  return actions[status] || "Review manually.";
}

function getSuggestedQuestionsForArea(areaKey) {
  const area = getSystemAreas().find((item) => item.key === areaKey);
  if (!area) return [];
  const examples = {
    theme_branding: ["Do you need colors controlled from admin?", "Do you need dark mode?", "Should low-contrast colors be blocked?"],
    dashboard_customization: ["Which dashboards are required?", "Do widgets differ by role?", "Do reports need export?"],
    users_roles: ["What user types exist?", "Is there exactly one Owner?", "Who approves, publishes, and deletes?"],
    multi_tenancy: ["Will multiple companies use the system?", "Is tenant data separated?", "Does each tenant need settings, colors, or billing?"],
    payments_billing: ["Are payments required in V1?", "Are subscriptions or invoices needed?", "Who can refund or cancel?"]
  };
  return examples[areaKey] || [`What is required for ${area.name} in V1?`, `Should ${area.name} be deferred or not applicable?`];
}

function mapAreaToWorkstream(areaKey) {
  if (areaKey.includes("frontend") || ["theme_branding", "accessibility", "seo", "navigation"].includes(areaKey)) return "public_frontend";
  if (areaKey.includes("admin") || areaKey === "settings_system") return "admin_frontend";
  if (["backend_apis", "business_logic", "database", "integrations", "payments_billing", "webhooks"].includes(areaKey)) return "backend";
  if (["testing_qa", "security", "performance", "monitoring", "deployment"].includes(areaKey)) return "qa";
  return "docs";
}

function buildCapabilityGroups() {
  return {
    "A. Product & Business": ["Product vision", "Target users", "Business goals", "Core value proposition", "Use cases", "Pricing/revenue model", "MVP scope", "Future scope", "Out of scope", "KPIs"],
    "B. Users, Access, and Journeys": ["User roles", "Permissions", "Role hierarchy", "User journey", "Onboarding", "Offboarding", "Authentication", "Authorization"],
    "C. Frontend Experience": ["Public frontend", "User portal", "Admin frontend", "Internal operations frontend", "Responsive UI", "Accessibility", "RTL/LTR", "Navigation", "Forms"],
    "D. Backend, Data, and APIs": ["Backend APIs", "Business logic", "Services", "Jobs/queues", "Database", "Migrations", "Data model", "API access", "Webhooks"],
    "E. Admin, Settings, and Customization": ["Admin panel", "Settings system", "Theme/colors/branding", "Dashboard customization", "Feature flags", "Custom fields", "Email templates"],
    "F. Engagement, Content, and Growth": ["Notifications", "Search/filtering", "Files/media", "Content management", "SEO", "Localization", "Support/help center", "Feedback"],
    "G. Commerce and Integrations": ["Payments", "Billing", "Subscriptions", "Invoices", "Coupons", "Integrations", "CRM/ERP", "Email/SMS providers", "Maps/calendar"],
    "H. Quality, Security, and Compliance": ["Security", "Audit logs", "Data governance", "Privacy/legal", "Testing/QA", "Error handling", "Performance", "Secrets policy"],
    "I. Operations and Release": ["Deployment", "Production vs publish", "Backup/recovery", "Monitoring", "Maintenance mode", "Import/export", "Scheduling/automation", "Versioning"],
    "J. Kabeeri Control Layer": ["Delivery mode", "Intake mode", "Task creation rules", "Task provenance", "AI token usage", "Owner verify", "Locks", "Prompt runs", "Cost calculator", "Dashboard state"]
  };
}

function getSystemAreas() {
  const names = [
    ["product_business", "Product & Business", "A. Product & Business"],
    ["users_roles", "Users & Roles", "B. Users, Access, and Journeys"],
    ["permissions", "Permissions", "B. Users, Access, and Journeys"],
    ["user_journeys", "User Journeys", "B. Users, Access, and Journeys"],
    ["onboarding", "Onboarding", "B. Users, Access, and Journeys"],
    ["offboarding", "Offboarding", "B. Users, Access, and Journeys"],
    ["public_frontend", "Public Frontend", "C. Frontend Experience"],
    ["user_frontend", "User Frontend", "C. Frontend Experience"],
    ["admin_frontend", "Admin Frontend", "C. Frontend Experience"],
    ["internal_operations_frontend", "Internal Operations Frontend", "C. Frontend Experience"],
    ["backend_apis", "Backend APIs", "D. Backend, Data, and APIs"],
    ["business_logic", "Business Logic", "D. Backend, Data, and APIs"],
    ["database", "Database", "D. Backend, Data, and APIs"],
    ["authentication", "Authentication", "B. Users, Access, and Journeys"],
    ["authorization", "Authorization", "B. Users, Access, and Journeys"],
    ["admin_panel", "Admin Panel", "E. Admin, Settings, and Customization"],
    ["settings_system", "Settings System", "E. Admin, Settings, and Customization"],
    ["theme_branding", "Theme / Colors / Branding / Design Tokens", "E. Admin, Settings, and Customization"],
    ["dashboard_customization", "Dashboard Customization", "E. Admin, Settings, and Customization"],
    ["notifications", "Notifications", "F. Engagement, Content, and Growth"],
    ["search_filtering", "Search & Filtering", "F. Engagement, Content, and Growth"],
    ["files_media", "Files & Media", "F. Engagement, Content, and Growth"],
    ["reports_analytics", "Reports & Analytics", "F. Engagement, Content, and Growth"],
    ["audit_logs", "Audit Logs", "H. Quality, Security, and Compliance"],
    ["security", "Security", "H. Quality, Security, and Compliance"],
    ["integrations", "Integrations", "G. Commerce and Integrations"],
    ["payments_billing", "Payments / Billing", "G. Commerce and Integrations"],
    ["seo", "SEO", "F. Engagement, Content, and Growth"],
    ["localization_languages", "Localization / Languages", "F. Engagement, Content, and Growth"],
    ["accessibility", "Accessibility", "C. Frontend Experience"],
    ["performance", "Performance", "H. Quality, Security, and Compliance"],
    ["error_handling", "Error Handling", "H. Quality, Security, and Compliance"],
    ["testing_qa", "Testing / QA", "H. Quality, Security, and Compliance"],
    ["deployment", "Deployment", "I. Operations and Release"],
    ["production_publish", "Production vs Publish", "I. Operations and Release"],
    ["backup_recovery", "Backup / Recovery", "I. Operations and Release"],
    ["monitoring", "Monitoring", "I. Operations and Release"],
    ["documentation", "Documentation", "I. Operations and Release"],
    ["support_help_center", "Support / Help Center", "F. Engagement, Content, and Growth"],
    ["legal_compliance", "Legal / Compliance", "H. Quality, Security, and Compliance"],
    ["content_management", "Content Management", "F. Engagement, Content, and Growth"],
    ["workflows_approvals", "Workflows / Approvals", "I. Operations and Release"],
    ["multi_tenancy", "Multi-Tenancy", "G. Commerce and Integrations"],
    ["feature_flags", "Feature Flags", "E. Admin, Settings, and Customization"],
    ["data_import_export", "Data Import / Export", "I. Operations and Release"],
    ["scheduling_automation", "Scheduling / Automation", "I. Operations and Release"],
    ["ai_product_features", "AI Product Features", "F. Engagement, Content, and Growth"],
    ["data_governance", "Data Governance", "H. Quality, Security, and Compliance"],
    ["tenant_admin_customization", "Tenant / Admin Customization", "E. Admin, Settings, and Customization"],
    ["email_notification_templates", "Email / Notification Templates", "E. Admin, Settings, and Customization"],
    ["dynamic_forms_custom_fields", "Dynamic Forms / Custom Fields", "E. Admin, Settings, and Customization"],
    ["versioning_api_versioning", "Versioning / API Versioning", "I. Operations and Release"],
    ["kabeeri_control_layer", "Kabeeri Development Control Layer", "J. Kabeeri Control Layer"]
  ];
  return names.map(([key, name, group], index) => ({
    id: index + 1,
    key,
    name,
    group,
    activation_states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    question_group: group.replace(/^[A-J]\. /, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  }));
}

function plan(action, name) {
  const plans = getPlanRegistry();

  if (!action || action === "list") {
    const rows = plans.map(([version, file]) => {
      const data = readJsonFile(file);
      return [version, data.totals.milestones, data.totals.issues, file];
    });
    console.log(table(["Version", "Milestones", "Issues", "File"], rows));
    return;
  }

  if (action === "show") {
    if (!name) throw new Error("Missing plan version.");
    const found = plans.find(([version]) => version === name || version.replace(/\./g, "_") === name);
    if (!found) throw new Error(`Plan not found: ${name}`);
    console.log(JSON.stringify(readJsonFile(found[1]), null, 2));
    return;
  }

  throw new Error(`Unknown plan action: ${action}`);
}

function getPlanRegistry() {
  return [
    ["v3.0.0", "platform_integration/milestones_and_issues.v3.0.0.json"],
    ["v4.0.0", "multi_ai_governance/milestones_and_issues.v4.0.0.json"],
    ["v5.0.0", "project_intelligence/milestones_and_issues.v5.0.0.json"]
  ].filter(([, file]) => fileExists(file));
}

function projectAnalysis(action, value, flags = {}, rest = []) {
  if (!action || ["help", "status"].includes(action)) {
    console.log("Project adoption commands");
    console.log(table(["Command", "Purpose"], [
      ["project analyze --path <folder>", "Inspect an existing application and write .kabeeri/project_analysis.json"],
      ["adopt analyze --path <folder>", "Alias for project analyze"]
    ]));
    return;
  }

  if (action !== "analyze" && action !== "analyse") {
    throw new Error(`Unknown project action: ${action}`);
  }

  const fs = require("fs");
  const path = require("path");
  ensureWorkspace();
  const targetInput = flags.path || value || rest[0] || ".";
  const targetPath = path.resolve(repoRoot(), targetInput);
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`Project path not found or not a directory: ${targetInput}`);
  }

  const analysis = analyzeExistingProject(targetPath, flags);
  writeJsonFile(".kabeeri/project_analysis.json", analysis);
  appendAudit("project.analyzed", "project", analysis.analysis_id, `Existing project analyzed: ${analysis.relative_path}`);

  if (flags.json) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  console.log("Existing project analysis written to .kabeeri/project_analysis.json");
  console.log(table(["Field", "Value"], [
    ["Path", analysis.relative_path],
    ["Detected stacks", analysis.detected_stacks.join(", ") || "unknown"],
    ["Potential apps", analysis.potential_apps.map((item) => `${item.type}:${item.path}`).join(", ") || "none"],
    ["Suggested delivery", analysis.suggested_delivery_mode],
    ["Risk level", analysis.risk_level]
  ]));
  console.log("");
  console.log("Next actions:");
  for (const item of analysis.next_actions) console.log(`- ${item}`);
}

function analyzeExistingProject(targetPath, flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const root = repoRoot();
  const rel = path.relative(root, targetPath).replace(/\\/g, "/") || ".";
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const files = new Set(entries.filter((item) => item.isFile()).map((item) => item.name));
  const dirs = new Set(entries.filter((item) => item.isDirectory()).map((item) => item.name));
  const stacks = detectProjectStacks(targetPath, files, dirs);
  const potentialApps = detectPotentialApps(targetPath, dirs, stacks);
  const riskSignals = [];
  if (!files.has("README.md")) riskSignals.push("missing_readme");
  if (!files.has("package.json") && !files.has("composer.json") && !files.has("pyproject.toml") && !files.has("requirements.txt") && !files.has("pubspec.yaml")) riskSignals.push("unknown_dependency_manifest");
  if (!dirs.has("tests") && !dirs.has("__tests__") && !dirs.has("spec") && !dirs.has("test")) riskSignals.push("missing_visible_tests");
  if (files.has(".env")) riskSignals.push("env_file_present_review_secrets");

  const riskLevel = riskSignals.length >= 3 ? "high" : riskSignals.length ? "medium" : "low";
  return {
    analysis_id: `project-analysis-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source: "kvdf project analyze",
    absolute_path: targetPath,
    relative_path: rel,
    detected_stacks: stacks,
    top_level_directories: Array.from(dirs).sort(),
    top_level_files: Array.from(files).sort(),
    potential_apps: potentialApps,
    recommended_workstreams: inferWorkstreamsFromStacks(stacks, potentialApps),
    suggested_delivery_mode: flags.mode || inferDeliveryModeFromStacks(stacks, potentialApps, riskSignals),
    risk_level: riskLevel,
    risk_signals: riskSignals,
    next_actions: [
      "Review detected stacks and app boundaries before changing code.",
      "Create app records with `kvdf app create` for each real app boundary.",
      "Create or update workstreams with `kvdf workstream add` if defaults are not enough.",
      "Run `kvdf blueprint recommend \"describe the existing product\"` to map product capabilities.",
      "Run `kvdf questionnaire plan \"describe the existing product\"` to generate adoption questions.",
      "Create adoption tasks before feature implementation."
    ]
  };
}

function detectProjectStacks(targetPath, files, dirs) {
  const fs = require("fs");
  const path = require("path");
  const stacks = [];
  if (files.has("artisan") && files.has("composer.json")) stacks.push("laravel");
  else if (files.has("composer.json")) stacks.push("php_composer");
  if (files.has("package.json")) {
    stacks.push("node");
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(targetPath, "package.json"), "utf8"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.next) stacks.push("nextjs");
      if (deps.react) stacks.push("react");
      if (deps.nuxt) stacks.push("nuxt_vue");
      else if (deps.vue) stacks.push("vue");
      if (deps["@angular/core"]) stacks.push("angular");
      if (deps["@sveltejs/kit"]) stacks.push("sveltekit");
      if (deps.expo) stacks.push("react_native_expo");
      if (deps.express) stacks.push("expressjs");
      if (deps["@nestjs/core"]) stacks.push("nestjs");
      if (deps.astro) stacks.push("astro");
    } catch (error) {
      stacks.push("package_json_unreadable");
    }
  }
  if (files.has("manage.py")) stacks.push("django_or_python");
  if (files.has("pyproject.toml") || files.has("requirements.txt")) stacks.push("python");
  if (files.has("Gemfile")) stacks.push("ruby_or_rails");
  if (files.has("pubspec.yaml")) stacks.push("flutter_or_dart");
  if (files.has("angular.json")) stacks.push("angular");
  if (files.has("next.config.js") || files.has("next.config.mjs")) stacks.push("nextjs");
  if (files.has("astro.config.mjs")) stacks.push("astro");
  if (dirs.has("wp-content")) stacks.push("wordpress");
  return uniqueList(stacks);
}

function detectPotentialApps(targetPath, dirs, stacks) {
  const apps = [];
  const add = (type, appPath, reason) => apps.push({ type, path: appPath, reason });
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) add("backend", ".", "Backend framework detected at project root.");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) add("frontend", ".", "Frontend or web framework detected at project root.");
  if (stacks.some((item) => /expo|flutter|mobile/.test(item))) add("mobile", ".", "Mobile framework detected at project root.");
  for (const dir of ["apps", "packages", "frontend", "backend", "admin", "mobile", "api", "web"]) {
    if (dirs.has(dir)) add(inferAppTypeFromPath(dir), dir, `Common application folder detected: ${dir}.`);
  }
  return apps;
}

function inferAppTypeFromPath(value) {
  if (/api|backend/.test(value)) return "backend";
  if (/admin/.test(value)) return "admin_frontend";
  if (/mobile/.test(value)) return "mobile";
  return "frontend";
}

function inferWorkstreamsFromStacks(stacks, apps) {
  const workstreams = new Set();
  if (stacks.some((item) => /laravel|django|python|express|nestjs|php|rails/.test(item))) workstreams.add("backend");
  if (stacks.some((item) => /react|next|vue|nuxt|angular|svelte|astro|wordpress/.test(item))) workstreams.add("public_frontend");
  if (stacks.some((item) => /expo|flutter/.test(item))) workstreams.add("mobile");
  if (apps.some((item) => item.type === "admin_frontend")) workstreams.add("admin_frontend");
  workstreams.add("qa");
  workstreams.add("docs");
  return Array.from(workstreams);
}

function inferDeliveryModeFromStacks(stacks, apps, risks) {
  if (risks.length >= 3 || apps.length > 2) return "structured";
  return "agile";
}

function findPlan(version) {
  const requested = version || "v4.0.0";
  const found = getPlanRegistry().find(([itemVersion]) => itemVersion === requested || itemVersion.replace(/^v/, "") === requested || itemVersion.replace(/\./g, "_") === requested);
  if (!found) throw new Error(`Plan not found: ${requested}`);
  return { version: found[0], file: found[1], data: readJsonFile(found[1]) };
}

function evolution(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  const file = ".kabeeri/evolution.json";
  if (!fileExists(file)) writeJsonFile(file, { changes: [], impact_plans: [], current_change_id: null });
  const state = readJsonFile(file);
  state.changes = state.changes || [];
  state.impact_plans = state.impact_plans || [];

  if (!action || action === "status" || action === "summary") {
    const summary = buildEvolutionSummary(state);
    if (flags.json) console.log(JSON.stringify(summary, null, 2));
    else console.log(renderEvolutionSummary(summary));
    return;
  }

  if (action === "list") {
    const rows = state.changes.map((item) => [
      item.change_id,
      item.title,
      item.status,
      (item.impacted_areas || []).join(",")
    ]);
    console.log(table(["Change", "Title", "Status", "Impacted Areas"], rows));
    return;
  }

  if (action === "show" || action === "impact" || action === "tasks") {
    const changeId = flags.id || value || state.current_change_id;
    if (!changeId) throw new Error("Missing evolution change id.");
    const change = state.changes.find((item) => item.change_id === changeId);
    if (!change) throw new Error(`Evolution change not found: ${changeId}`);
    const plan = state.impact_plans.find((item) => item.change_id === changeId) || null;
    if (action === "tasks") {
      const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id === changeId);
      console.log(JSON.stringify({ change_id: changeId, tasks }, null, 2));
      return;
    }
    if (action === "impact") {
      console.log(JSON.stringify(plan || change.impact_plan || {}, null, 2));
      return;
    }
    console.log(JSON.stringify({ change, impact_plan: plan }, null, 2));
    return;
  }

  if (action === "plan" || action === "request" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create evolution plan");
    const description = [value, ...rest].filter(Boolean).join(" ").trim() || flags.title || flags.description || flags.summary;
    if (!description) throw new Error("Missing evolution description.");
    const change = createEvolutionChange(state, description, flags);
    writeJsonFile(file, state);
    const tasks = createEvolutionTasks(change, flags);
    change.task_ids = tasks.map((item) => item.id);
    const plan = buildEvolutionImpactPlan(change, tasks);
    change.impact_plan_id = plan.plan_id;
    state.impact_plans.push(plan);
    state.current_change_id = change.change_id;
    writeJsonFile(file, state);
    refreshDashboardArtifacts();
    appendAudit("evolution.planned", "evolution", change.change_id, `Evolution planned: ${change.title}`);
    if (flags.json) {
      console.log(JSON.stringify({ change, impact_plan: plan, tasks }, null, 2));
      return;
    }
    console.log(`Evolution Steward plan created: ${change.change_id}`);
    console.log(table(["Item", "Value"], [
      ["Title", change.title],
      ["Impacted areas", change.impacted_areas.join(", ")],
      ["Tasks", String(tasks.length)],
      ["Impact plan", plan.plan_id]
    ]));
    return;
  }

  if (action === "verify" || action === "close" || action === "complete") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "verify evolution plan");
    const changeId = flags.id || value || state.current_change_id;
    if (!changeId) throw new Error("Missing evolution change id.");
    const change = state.changes.find((item) => item.change_id === changeId);
    if (!change) throw new Error(`Evolution change not found: ${changeId}`);
    const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id === changeId);
    const openTasks = tasks.filter((taskItem) => !["owner_verified", "done", "closed", "rejected"].includes(taskItem.status));
    change.status = openTasks.length ? "needs_follow_up" : "verified";
    change.verified_at = openTasks.length ? null : new Date().toISOString();
    change.open_task_ids = openTasks.map((taskItem) => taskItem.id);
    writeJsonFile(file, state);
    refreshDashboardArtifacts();
    appendAudit("evolution.verified", "evolution", change.change_id, `Evolution verification: ${change.status}`);
    console.log(`Evolution change ${change.change_id}: ${change.status}`);
    if (openTasks.length) console.log(`Open follow-up tasks: ${openTasks.map((item) => item.id).join(", ")}`);
    return;
  }

  throw new Error(`Unknown evolution action: ${action}`);
}

function createEvolutionChange(state, description, flags = {}) {
  const changeId = flags.id || nextRecordId(state.changes, "change_id", "evo");
  const impactedAreas = inferEvolutionImpactedAreas(description, flags);
  const title = flags.title && flags.title !== true ? flags.title : compactTitle(description);
  const createdAt = new Date().toISOString();
  const change = {
    change_id: changeId,
    title,
    description,
    status: "planned",
    requested_by: flags.requestedBy || flags.actor || "local-owner",
    source: flags.source || "owner_request",
    impacted_areas: impactedAreas,
    required_updates: impactedAreas.map((area) => evolutionAreaDefinition(area)),
    created_at: createdAt,
    task_ids: []
  };
  state.changes.push(change);
  return change;
}

function createEvolutionTasks(change, flags = {}) {
  if (flags["no-tasks"]) return [];
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextTaskId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const createdAt = new Date().toISOString();
  const selectedAreas = orderEvolutionAreas(change.impacted_areas);
  const tasks = selectedAreas.map((area) => {
    const definition = evolutionAreaDefinition(area);
    return {
      id: nextTaskId(),
      title: `Evolution Steward: update ${definition.label}`,
      status: "proposed",
      type: "framework_update",
      workstream: definition.workstream,
      workstreams: [definition.workstream],
      source: `evolution:${change.change_id}`,
      evolution_change_id: change.change_id,
      evolution_area: area,
      allowed_files: definition.files,
      acceptance_criteria: definition.acceptance,
      created_at: createdAt
    };
  });
  data.tasks.push(...tasks);
  writeJsonFile(tasksFile, data);
  for (const taskItem of tasks) {
    appendAudit("task.created", "task", taskItem.id, `Evolution follow-up task created: ${taskItem.title}`);
  }
  return tasks;
}

function buildEvolutionImpactPlan(change, tasks) {
  return {
    plan_id: `${change.change_id}-impact`,
    change_id: change.change_id,
    generated_at: new Date().toISOString(),
    title: change.title,
    status: "planned",
    impacted_areas: change.impacted_areas,
    dependency_rule: "When a Kabeeri framework capability changes, update every dependent runtime, schema, dashboard, report, documentation, and test surface before treating the change as done.",
    update_order: orderEvolutionAreas(change.impacted_areas),
    tasks: tasks.map((taskItem) => ({
      task_id: taskItem.id,
      area: taskItem.evolution_area,
      title: taskItem.title,
      workstream: taskItem.workstream,
      allowed_files: taskItem.allowed_files
    }))
  };
}

function inferEvolutionImpactedAreas(description, flags = {}) {
  const explicit = parseCsv(flags.areas || flags.area || "");
  if (explicit.length) return orderEvolutionAreas(explicit.map(normalizeEvolutionArea).filter(Boolean));
  const text = String(description || "").toLowerCase();
  const areas = new Set(["implementation", "tasks", "tests", "docs", "capabilities", "changelog"]);
  if (/cli|command|kvdf|help|terminal/.test(text)) areas.add("cli");
  if (/dashboard|live|json|monitor|state/.test(text)) areas.add("dashboard");
  if (/schema|contract|json state|validation|validate/.test(text)) areas.add("schemas");
  if (/report|readiness|governance/.test(text)) areas.add("reports");
  if (/github|release|publish/.test(text)) areas.add("release");
  if (/prompt|ai|vibe|question|intake|token|cost/.test(text)) areas.add("ai_context");
  return orderEvolutionAreas(Array.from(areas));
}

function normalizeEvolutionArea(area) {
  const value = String(area || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const aliases = {
    runtime: "implementation",
    code: "implementation",
    source: "implementation",
    task: "tasks",
    tracking: "tasks",
    doc: "docs",
    documentation: "docs",
    capability: "capabilities",
    capabilitymap: "capabilities",
    schema: "schemas",
    validation: "schemas",
    report: "reports",
    "live-report": "reports",
    "live-reports": "reports",
    "ai-context": "ai_context",
    ai: "ai_context",
    prompts: "ai_context",
    releases: "release"
  };
  return aliases[value] || value;
}

function orderEvolutionAreas(areas) {
  const order = ["implementation", "cli", "tasks", "schemas", "dashboard", "reports", "ai_context", "docs", "capabilities", "tests", "changelog", "release"];
  const normalized = [...new Set((areas || []).map(normalizeEvolutionArea).filter((area) => evolutionAreaDefinition(area, false)))];
  return normalized.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function evolutionAreaDefinition(area, required = true) {
  const definitions = {
    implementation: {
      label: "runtime implementation",
      workstream: "backend",
      files: ["src/cli/", "src/cli/workspace.js"],
      acceptance: ["Runtime behavior implements the requested Kabeeri capability.", "The implementation updates live state instead of relying on chat memory."]
    },
    cli: {
      label: "CLI surface and help",
      workstream: "docs",
      files: ["src/cli/index.js", "src/cli/ui.js", "cli/CLI_COMMAND_REFERENCE.md"],
      acceptance: ["The kvdf command surface is documented.", "Command help explains when and why to use the capability."]
    },
    tasks: {
      label: "task tracking integration",
      workstream: "docs",
      files: [".kabeeri/tasks.json", "knowledge/task_tracking/", "knowledge/governance/TASK_GOVERNANCE.md"],
      acceptance: ["The update creates or links follow-up tasks.", "Task source and acceptance criteria identify the framework change."]
    },
    schemas: {
      label: "runtime schemas and validation",
      workstream: "qa",
      files: ["schemas/runtime/", "schemas/runtime/schema_registry.json", "src/cli/validate.js"],
      acceptance: ["New or changed runtime state has schema coverage.", "`kvdf validate runtime-schemas` can validate the state."]
    },
    dashboard: {
      label: "dashboard and live JSON surfaces",
      workstream: "admin_frontend",
      files: ["integrations/dashboard/", "src/cli/index.js", ".kabeeri/dashboard/"],
      acceptance: ["Dashboard state includes the update where operationally useful.", "The state can be refreshed after the change."]
    },
    reports: {
      label: "readiness/governance reports",
      workstream: "qa",
      files: [".kabeeri/reports/", "src/cli/index.js", "docs/internal/LIVE_JSON_REPORTS.md"],
      acceptance: ["Live reports summarize the update state.", "Action items show unfinished dependent work."]
    },
    ai_context: {
      label: "AI context and prompt guidance",
      workstream: "docs",
      files: ["knowledge/vibe_ux/", "packs/prompt_packs/", "README.md", "README_AR.md"],
      acceptance: ["AI assistants know how the capability affects their workflow.", "Prompt/context guidance avoids bypassing Kabeeri governance."]
    },
    docs: {
      label: "human documentation",
      workstream: "docs",
      files: ["docs/", "knowledge/"],
      acceptance: ["Human docs explain the capability, purpose, workflow, and source of truth.", "Arabic/English documentation is updated where the site exposes the capability."]
    },
    capabilities: {
      label: "capabilities reference",
      workstream: "docs",
      files: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/site/assets/js/app.js"],
      acceptance: ["The central capability map lists the new or changed capability.", "Docs site capability pages expose the capability to developers."]
    },
    tests: {
      label: "automated tests",
      workstream: "qa",
      files: ["tests/"],
      acceptance: ["Integration tests cover the new command/state behavior.", "`npm test` passes."]
    },
    changelog: {
      label: "changelog and owner state",
      workstream: "docs",
      files: ["CHANGELOG.md", "OWNER_DEVELOPMENT_STATE.md"],
      acceptance: ["CHANGELOG records the framework change.", "Owner development state is updated when the change affects future continuation."]
    },
    release: {
      label: "release and publishing guidance",
      workstream: "qa",
      files: ["docs/production/", "CHANGELOG.md"],
      acceptance: ["Release notes/gates mention any publishing impact.", "No release/publish step proceeds before validation."]
    }
  };
  const definition = definitions[area];
  if (!definition && required) throw new Error(`Unknown evolution area: ${area}`);
  return definition || null;
}

function buildEvolutionSummary(state) {
  const changes = state.changes || [];
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id);
  const openTasks = tasks.filter((taskItem) => !["owner_verified", "done", "closed", "rejected"].includes(taskItem.status));
  return {
    report_type: "evolution_steward_summary",
    generated_at: new Date().toISOString(),
    status: openTasks.length ? "needs_follow_up" : changes.length ? "ready" : "empty",
    changes_total: changes.length,
    active_changes: changes.filter((item) => !["verified", "closed"].includes(item.status)).length,
    follow_up_tasks_total: tasks.length,
    open_follow_up_tasks: openTasks.length,
    current_change_id: state.current_change_id || null,
    by_status: summarizeBy(changes, "status"),
    latest_change: changes.length ? changes[changes.length - 1] : null
  };
}

function renderEvolutionSummary(summary) {
  return [
    "# Evolution Steward",
    "",
    `Status: ${summary.status}`,
    `Changes: ${summary.changes_total}`,
    `Active changes: ${summary.active_changes}`,
    `Follow-up tasks: ${summary.follow_up_tasks_total}`,
    `Open follow-up tasks: ${summary.open_follow_up_tasks}`,
    `Current change: ${summary.current_change_id || "none"}`
  ].join("\n");
}

function nextRecordId(items, field, prefix) {
  const existing = new Set((items || []).map((item) => item[field]));
  let index = (items || []).length + 1;
  let id = `${prefix}-${String(index).padStart(3, "0")}`;
  while (existing.has(id)) {
    index += 1;
    id = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return id;
}

function compactTitle(text) {
  const value = String(text || "").trim().replace(/\s+/g, " ");
  return value.length <= 76 ? value : `${value.slice(0, 73)}...`;
}

function task(action, id, flags) {
  ensureWorkspace();
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];

  if (!action || action === "list") {
    const rows = data.tasks.map((item) => [item.id, item.title, item.status, item.assignee_id || ""]);
    console.log(table(["ID", "Title", "Status", "Assignee"], rows));
    return;
  }

  if (["tracker", "track", "dashboard", "live", "live-json"].includes(action)) {
    const tracker = refreshTaskTrackerState();
    if (flags.json || action === "live-json") console.log(JSON.stringify(tracker, null, 2));
    else console.log(renderTaskTrackerSummary(tracker));
    return;
  }

  if (action === "status") {
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) throw new Error(`Task not found: ${taskId}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create task");
    const title = flags.title;
    if (!title) throw new Error("Missing --title.");
    const next = data.tasks.length + 1;
    const workstreams = parseCsv(flags.workstreams || flags.workstream || "unassigned");
    const appRefs = parseCsv(flags.apps || flags.app || flags["app-username"]);
    const appLinks = resolveTaskApps(appRefs);
    validateTaskBoundaryCreation(flags.type || "general", workstreams, appLinks);
    const item = {
      id: flags.id || `task-${String(next).padStart(3, "0")}`,
      title,
      status: "proposed",
      type: flags.type || "general",
      workstream: workstreams[0] || "unassigned",
      workstreams,
      app_username: appLinks[0] ? appLinks[0].username : null,
      app_usernames: appLinks.map((appItem) => appItem.username),
      app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
      sprint_id: flags.sprint || null,
      source: flags.source || "manual",
      acceptance_criteria: flags.acceptance ? [flags.acceptance] : [],
      created_at: new Date().toISOString()
    };
    data.tasks.push(item);
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit("task.created", "task", item.id, `Task created: ${item.title}`);
    console.log(`Created task ${item.id}`);
    return;
  }

  if (["approve", "assign", "start", "review", "verify", "reject", "reopen"].includes(action)) {
    const taskId = flags.id || id;
    if (!taskId) throw new Error("Missing task id.");
    const found = data.tasks.find((item) => item.id === taskId);
    if (!found) throw new Error(`Task not found: ${taskId}`);

    if (action === "approve") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "approve task");
      found.status = "approved";
    } else if (action === "assign") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "assign task");
      if (!flags.assignee) throw new Error("Missing --assignee.");
      assertAssigneeCanTakeTask(flags.assignee, found);
      found.status = "assigned";
      found.assignee_id = flags.assignee;
    } else if (action === "start") {
      requireTaskExecutor(flags, found);
      assertTaskCanStart(found);
      assertDocsFirstGateAllowsTaskStart(found);
      found.status = "in_progress";
    } else if (action === "review") {
      if (flags.actor && found.assignee_id && flags.actor === found.assignee_id) {
        throw new Error("Reviewer independence violation: assignee cannot review their own task.");
      }
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "review task");
      found.status = "review";
      found.reviewer_id = flags.reviewer || flags.actor || null;
    } else if (action === "verify") {
      requireOwnerAuthority(flags);
      requireAcceptanceForVerify(found);
      found.status = "owner_verified";
      found.verified_by = getOwnerActor(flags);
      found.verified_at = new Date().toISOString();
      revokeTaskTokens(taskId, "owner verify");
      releaseTaskLocks(taskId, "owner verify");
      generateVerificationReport(found);
    } else if (action === "reject") {
      requireAnyRole(flags, ["Owner"], "reject task");
      if (!flags.reason) throw new Error("Missing --reason.");
      found.status = "rejected";
      found.rejection_reason = flags.reason;
      found.rejected_at = new Date().toISOString();
      revokeTaskTokens(taskId, "owner reject");
    } else if (action === "reopen") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "reopen task");
      found.status = "ready";
      found.reopened_at = new Date().toISOString();
    }

    found.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    refreshDashboardArtifacts();
    appendAudit(`task.${action}`, "task", found.id, `Task ${action}: ${found.title}`);
    console.log(`Task ${found.id} is now ${found.status}`);
    return;
  }

  throw new Error(`Unknown task action: ${action}`);
}

function assertDocsFirstGateAllowsTaskStart(taskItem) {
  if (isDocsFirstTask(taskItem)) return;
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const openDocsFirst = tasks.filter((item) => isDocsFirstTask(item) && !["owner_verified", "done", "closed"].includes(item.status));
  if (openDocsFirst.length === 0) return;
  throw new Error(`Docs-first gate blocks implementation. Complete or verify ${openDocsFirst.length} documentation task(s) before starting ${taskItem.id}.`);
}

function isDocsFirstTask(taskItem) {
  return Boolean(
    taskItem &&
    (taskItem.docs_first_gate || taskItem.phase === "docs_first" || taskItem.type === "documentation" || taskItem.workstream === "docs") &&
    String(taskItem.source || "").startsWith("init_intake:")
  );
}

function validateTaskWorkstreamCreation(type, workstreams) {
  const active = (workstreams || []).filter((item) => item && item !== "unassigned");
  const normalizedType = String(type || "general").toLowerCase();
  validateKnownWorkstreams(active);
  if (active.length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
    throw new Error("Task touches multiple workstreams. Use --type integration for approved integration tasks.");
  }
}

function validateTaskBoundaryCreation(type, workstreams, apps) {
  validateTaskWorkstreamCreation(type, workstreams);
  const normalizedType = String(type || "general").toLowerCase();
  if ((apps || []).length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
    throw new Error("Task touches multiple apps. Use --type integration for approved cross-app tasks.");
  }
}

function resolveTaskApps(appRefs) {
  if (!appRefs || appRefs.length === 0) return [];
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  return appRefs.map((ref) => {
    const normalized = normalizePublicUsername(ref);
    const appItem = apps.find((item) => item.username === normalized || item.app_id === ref);
    if (!appItem) throw new Error(`Customer app not found: ${ref}`);
    return appItem;
  });
}

function assertAssigneeCanTakeTask(assigneeId, task) {
  const identity = getIdentity(assigneeId);
  if (!identity) {
    if (hasConfiguredIdentities()) throw new Error(`Unknown assignee: ${assigneeId}`);
    return;
  }
  if (["Owner", "Maintainer"].includes(identity.role)) return;
  const allowed = (identity.workstreams || []).map((item) => String(item).toLowerCase());
  if (allowed.length === 0) return;
  const taskStreams = taskWorkstreams(task).filter((item) => item !== "unassigned");
  const denied = taskStreams.filter((stream) => !allowed.includes(stream));
  if (denied.length > 0) {
    throw new Error(`Workstream assignment denied: ${assigneeId} cannot take ${denied.join(", ")} task workstream.`);
  }
}

function taskWorkstreams(task) {
  const values = Array.isArray(task.workstreams) && task.workstreams.length ? task.workstreams : [task.workstream || "unassigned"];
  return values.map((item) => normalizeWorkstreamId(item)).filter(Boolean);
}

function workstream(action, value, flags = {}) {
  ensureWorkspace();
  const file = ".kabeeri/workstreams.json";
  if (!fileExists(file)) writeJsonFile(file, { workstreams: defaultWorkstreams() });
  const data = readJsonFile(file);
  data.workstreams = data.workstreams && data.workstreams.length ? data.workstreams : defaultWorkstreams();

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Paths", "Required Review"], data.workstreams.map((item) => [
      item.id,
      item.name || "",
      (item.path_rules || []).join(","),
      (item.required_review || []).join(",")
    ])));
    return;
  }

  if (action === "show" || action === "status") {
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing workstream id.");
    const item = data.workstreams.find((entry) => normalizeWorkstreamId(entry.id) === id);
    if (!item) throw new Error(`Workstream not found: ${id}`);
    const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskWorkstreams(taskItem).includes(id));
    const sessions = readStateArray(".kabeeri/sessions.json", "sessions").filter((sessionItem) => getTaskWorkstreamsById(sessionItem.task_id).includes(id));
    console.log(JSON.stringify({
      ...item,
      tasks_total: tasks.length,
      open_tasks: tasks.filter((taskItem) => !["owner_verified", "rejected", "done"].includes(taskItem.status)).length,
      sessions_total: sessions.length,
      active_sessions: sessions.filter((sessionItem) => sessionItem.status === "active").length
    }, null, 2));
    return;
  }

  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create workstream");
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing --id.");
    if (data.workstreams.some((item) => normalizeWorkstreamId(item.id) === id)) {
      throw new Error(`Workstream already exists: ${id}`);
    }
    const item = {
      id,
      name: flags.name || id,
      description: flags.description || "",
      path_rules: parsePathRules(flags.paths || flags.path || flags["path-rules"]),
      required_review: parseCsv(flags.review || flags["required-review"]),
      status: flags.status || "active",
      created_at: new Date().toISOString()
    };
    data.workstreams.push(item);
    writeJsonFile(file, data);
    appendAudit("workstream.created", "workstream", id, `Workstream created: ${item.name}`);
    console.log(`Created workstream ${id}`);
    return;
  }

  if (action === "update") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "update workstream");
    const id = normalizeWorkstreamId(flags.id || value);
    if (!id) throw new Error("Missing workstream id.");
    const item = data.workstreams.find((entry) => normalizeWorkstreamId(entry.id) === id);
    if (!item) throw new Error(`Workstream not found: ${id}`);
    if (flags.name) item.name = flags.name;
    if (flags.description) item.description = flags.description;
    if (flags.paths || flags.path || flags["path-rules"]) item.path_rules = parsePathRules(flags.paths || flags.path || flags["path-rules"]);
    if (flags.review || flags["required-review"]) item.required_review = parseCsv(flags.review || flags["required-review"]);
    if (flags.status) item.status = flags.status;
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("workstream.updated", "workstream", id, `Workstream updated: ${item.name || id}`);
    console.log(`Updated workstream ${id}`);
    return;
  }

  if (action === "validate") {
    const issues = collectWorkstreamRuntimeIssues();
    if (issues.length === 0) {
      console.log("Workstream governance valid.");
      return;
    }
    for (const issue of issues) console.log(`FAIL ${issue}`);
    process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown workstream action: ${action}`);
}

function normalizeWorkstreamId(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function parsePathRules(value) {
  return parseCsv(value).map((item) => normalizePathRule(item)).filter(Boolean);
}

function normalizePathRule(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function getWorkstreamRegistry() {
  if (!fileExists(".kabeeri/workstreams.json")) return defaultWorkstreams();
  const data = readJsonFile(".kabeeri/workstreams.json");
  return (data.workstreams && data.workstreams.length ? data.workstreams : defaultWorkstreams()).filter((item) => item.status !== "inactive");
}

function validateKnownWorkstreams(workstreams) {
  const registry = getWorkstreamRegistry();
  if (registry.length === 0) return;
  const known = new Set(registry.map((item) => normalizeWorkstreamId(item.id)));
  const unknown = (workstreams || []).map((item) => normalizeWorkstreamId(item)).filter((item) => item && item !== "unassigned" && !known.has(item));
  if (unknown.length > 0) throw new Error(`Unknown workstream: ${unknown.join(", ")}`);
}

function getWorkstreamPathRules(id) {
  const item = getWorkstreamRegistry().find((entry) => normalizeWorkstreamId(entry.id) === normalizeWorkstreamId(id));
  return item ? (item.path_rules || []).map((rule) => normalizePathRule(rule)).filter(Boolean) : [];
}

function getTaskWorkstreamsById(taskId) {
  const taskItem = getTaskById(taskId);
  return taskItem ? taskWorkstreams(taskItem).filter((item) => item !== "unassigned") : [];
}

function collectWorkstreamRuntimeIssues() {
  const issues = [];
  const registry = getWorkstreamRegistry();
  const known = new Set(registry.map((item) => normalizeWorkstreamId(item.id)));
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = readStateArray(".kabeeri/sessions.json", "sessions");
  for (const item of registry) {
    if (!item.id) issues.push("workstream missing id");
    if (!item.name) issues.push(`workstream missing name: ${item.id || "unknown"}`);
    if (!Array.isArray(item.path_rules) || item.path_rules.length === 0) issues.push(`workstream missing path rules: ${item.id || "unknown"}`);
  }
  for (const taskItem of tasks) {
    for (const stream of taskWorkstreams(taskItem).filter((entry) => entry !== "unassigned")) {
      if (!known.has(stream)) issues.push(`task references unknown workstream: ${taskItem.id || "unknown"} -> ${stream}`);
    }
  }
  for (const sessionItem of sessions.filter((entry) => entry.status === "completed")) {
    const taskStreams = getTaskWorkstreamsById(sessionItem.task_id);
    if (taskStreams.length === 0) continue;
    const files = sessionItem.files_touched || [];
    for (const file of files) {
      if (!fileAllowedByWorkstreams(file, taskStreams)) {
        issues.push(`session file outside workstream boundary: ${sessionItem.session_id} -> ${file}`);
      }
    }
  }
  return issues;
}

function getTaskById(taskId) {
  if (!fileExists(".kabeeri/tasks.json")) return null;
  const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
  return tasks.find((taskItem) => taskItem.id === taskId) || null;
}

function customerApp(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/customer_apps.json";
  if (!fileExists(file)) writeJsonFile(file, { apps: [] });
  const data = readJsonFile(file);
  data.apps = data.apps || [];

  if (!action || action === "list") {
    console.log(table(["Username", "Name", "Type", "Path", "Status", "Public URL"], data.apps.map((item) => [
      item.username,
      item.name,
      item.app_type || item.type || "",
      item.path || "",
      item.status,
      publicCustomerAppUrl(item.username)
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create customer app");
    if (flags["separate-product"] === true || flags["separate-product"] === "true") {
      throw new Error("Separate products must use a separate KVDF workspace. Do not add unrelated apps to this folder.");
    }
    const username = normalizePublicUsername(flags.username || value);
    const name = flags.name || username;
    if (data.apps.some((item) => item.username === username)) {
      throw new Error(`Customer app username already exists: ${username}`);
    }
    const project = readJsonFile(".kabeeri/project.json");
    const productName = flags.product || flags["product-name"] || project.product_name || project.name || "";
    enforceSameProductBoundary(data.apps, productName, project);
    const workstreams = parseCsv(flags.workstreams || flags.workstream);
    validateKnownWorkstreams(workstreams);
    const item = {
      app_id: flags["app-id"] || `app-${String(data.apps.length + 1).padStart(3, "0")}`,
      username,
      name,
      app_type: normalizeAppType(flags.type || flags["app-type"] || "application"),
      path: normalizeAppPath(flags.path || `apps/${username}`),
      product_name: productName,
      boundary: "same_product",
      status: normalizeCustomerAppStatus(flags.status || "draft"),
      audience: flags.audience || "",
      workstreams,
      feature_ids: parseCsv(flags.features),
      journey_ids: parseCsv(flags.journeys),
      public_url: publicCustomerAppUrl(username),
      created_at: new Date().toISOString()
    };
    data.apps.push(item);
    writeJsonFile(file, data);
    appendAudit("customer_app.created", "customer_app", username, `Customer app created: ${name}`);
    console.log(`Created customer app ${username}`);
    console.log(`Public URL: ${item.public_url}`);
    return;
  }

  if (action === "status") {
    const username = normalizePublicUsername(flags.username || value);
    const item = data.apps.find((appItem) => appItem.username === username);
    if (!item) throw new Error(`Customer app not found: ${username}`);
    if (flags.status) item.status = normalizeCustomerAppStatus(flags.status);
    if (flags.name) item.name = flags.name;
    if (flags.type || flags["app-type"]) item.app_type = normalizeAppType(flags.type || flags["app-type"]);
    if (flags.path) item.path = normalizeAppPath(flags.path);
    if (flags.product || flags["product-name"]) {
      const project = readJsonFile(".kabeeri/project.json");
      const productName = flags.product || flags["product-name"];
      enforceSameProductBoundary(data.apps.filter((appItem) => appItem.username !== username), productName, project);
      item.product_name = productName;
    }
    if (flags.workstreams || flags.workstream) {
      const workstreams = parseCsv(flags.workstreams || flags.workstream);
      validateKnownWorkstreams(workstreams);
      item.workstreams = workstreams;
    }
    if (flags.audience) item.audience = flags.audience;
    if (flags.features) item.feature_ids = parseCsv(flags.features);
    if (flags.journeys) item.journey_ids = parseCsv(flags.journeys);
    item.public_url = publicCustomerAppUrl(item.username);
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("customer_app.status", "customer_app", username, `Customer app status updated: ${item.status}`);
    console.log(`Customer app ${username} is ${item.status}`);
    return;
  }

  if (action === "show") {
    const username = normalizePublicUsername(flags.username || value);
    const item = data.apps.find((appItem) => appItem.username === username);
    if (!item) throw new Error(`Customer app not found: ${username}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown app action: ${action}`);
}

function normalizePublicUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  if (!username) throw new Error("Missing --username.");
  if (/^\d+$/.test(username)) {
    throw new Error("Invalid username. Public customer app routes cannot be numeric IDs.");
  }
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(username)) {
    throw new Error("Invalid username. Use 2-63 lowercase letters, numbers, or hyphens, starting with a letter or number.");
  }
  const reserved = new Set(["__kvdf", "dashboard", "admin", "api", "public", "static", "assets", "customer"]);
  if (reserved.has(username)) throw new Error(`Reserved username: ${username}`);
  return username;
}

function normalizeCustomerAppStatus(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["draft", "needs_review", "ready_to_demo", "ready_to_publish", "published", "archived"]);
  if (!allowed.has(normalized)) throw new Error("Invalid app status. Use draft, needs_review, ready_to_demo, ready_to_publish, published, or archived.");
  return normalized;
}

function normalizeAppType(value) {
  const normalized = String(value || "application").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["application", "backend", "frontend", "admin_frontend", "mobile", "api", "service", "worker"]);
  if (!allowed.has(normalized)) throw new Error("Invalid app type. Use application, backend, frontend, admin_frontend, mobile, api, service, or worker.");
  return normalized;
}

function normalizeAppPath(value) {
  const normalized = String(value || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "");
  if (!normalized) throw new Error("Missing app path.");
  if (normalized.startsWith("../") || normalized === ".." || normalized.includes("/../")) {
    throw new Error("Invalid app path. App paths must stay inside the KVDF workspace.");
  }
  if (normalized === ".kabeeri" || normalized.startsWith(".kabeeri/")) {
    throw new Error("Invalid app path. .kabeeri is reserved for KVDF state.");
  }
  return normalized;
}

function enforceSameProductBoundary(existingApps, productName, project) {
  if (project.forbid_unrelated_apps === false) return;
  const existingProducts = new Set((existingApps || []).map((item) => item.product_name).filter(Boolean));
  if (existingProducts.size === 0 || !productName) return;
  if (!existingProducts.has(productName)) {
    throw new Error("App boundary denied: this appears to be a separate product. Create a separate KVDF workspace.");
  }
}

function publicCustomerAppUrl(username) {
  return `/customer/apps/${username}`;
}

function feature(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/features.json";
  if (!fileExists(file)) writeJsonFile(file, { features: [] });
  const data = readJsonFile(file);
  data.features = data.features || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Title", "Readiness", "Tasks"], data.features.map((item) => [
      item.id,
      item.title,
      item.readiness,
      (item.task_ids || []).join(",")
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create feature");
    const title = flags.title || value;
    if (!title) throw new Error("Missing --title.");
    const id = flags.id || `feature-${String(data.features.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      title,
      readiness: normalizeFeatureReadiness(flags.readiness || "future"),
      audience: flags.audience || "",
      journey: flags.journey || "",
      task_ids: parseCsv(flags.tasks),
      created_at: new Date().toISOString()
    };
    data.features.push(item);
    writeJsonFile(file, data);
    appendAudit("feature.created", "feature", id, `Feature created: ${title}`);
    console.log(`Created feature ${id}`);
    return;
  }

  if (action === "status") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing feature id.");
    const item = data.features.find((featureItem) => featureItem.id === id);
    if (!item) throw new Error(`Feature not found: ${id}`);
    if (flags.readiness) item.readiness = normalizeFeatureReadiness(flags.readiness);
    if (flags.tasks) item.task_ids = parseCsv(flags.tasks);
    if (flags.audience) item.audience = flags.audience;
    if (flags.journey) item.journey = flags.journey;
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("feature.status", "feature", id, `Feature status updated: ${item.readiness}`);
    console.log(`Feature ${id} is ${item.readiness}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing feature id.");
    const item = data.features.find((featureItem) => featureItem.id === id);
    if (!item) throw new Error(`Feature not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown feature action: ${action}`);
}

function normalizeFeatureReadiness(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["ready_to_demo", "ready_to_publish", "needs_review", "future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid feature readiness. Use ready_to_demo, ready_to_publish, needs_review, or future.");
  return normalized;
}

function journey(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/journeys.json";
  if (!fileExists(file)) writeJsonFile(file, { journeys: [] });
  const data = readJsonFile(file);
  data.journeys = data.journeys || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Status", "Steps"], data.journeys.map((item) => [
      item.id,
      item.name,
      item.status,
      (item.steps || []).length
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create journey");
    const name = flags.name || value;
    if (!name) throw new Error("Missing --name.");
    const id = flags.id || `journey-${String(data.journeys.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      name,
      audience: flags.audience || "",
      status: normalizeJourneyStatus(flags.status || "draft"),
      steps: parseCsv(flags.steps),
      ready_to_show: flags["ready-to-show"] === true,
      created_at: new Date().toISOString()
    };
    data.journeys.push(item);
    writeJsonFile(file, data);
    appendAudit("journey.created", "journey", id, `Journey created: ${name}`);
    console.log(`Created journey ${id}`);
    return;
  }

  if (action === "status") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing journey id.");
    const item = data.journeys.find((journeyItem) => journeyItem.id === id);
    if (!item) throw new Error(`Journey not found: ${id}`);
    if (flags.status) item.status = normalizeJourneyStatus(flags.status);
    if (flags.steps) item.steps = parseCsv(flags.steps);
    if (flags["ready-to-show"] !== undefined) item.ready_to_show = flags["ready-to-show"] !== "false";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("journey.status", "journey", id, `Journey status updated: ${item.status}`);
    console.log(`Journey ${id} is ${item.status}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing journey id.");
    const item = data.journeys.find((journeyItem) => journeyItem.id === id);
    if (!item) throw new Error(`Journey not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown journey action: ${action}`);
}

function normalizeJourneyStatus(value) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["draft", "needs_review", "ready_to_show", "future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid journey status. Use draft, needs_review, ready_to_show, or future.");
  return normalized;
}

function design(action, value, flags) {
  ensureWorkspace();
  ensureDesignState();
  const file = ".kabeeri/design_sources/sources.json";
  const data = readJsonFile(file);
  data.sources = data.sources || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Type", "Status", "Use", "Location"], data.sources.map((item) => [
      item.id,
      item.source_type,
      item.approval_status,
      item.intended_use || "",
      item.source_location || ""
    ])));
    return;
  }

  if (action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "add design source");
    const id = flags.id || value || `design-source-${String(data.sources.length + 1).padStart(3, "0")}`;
    if (data.sources.some((item) => item.id === id)) throw new Error(`Design source already exists: ${id}`);
    const sourceType = normalizeDesignSourceType(flags.type || flags.sourceType || flags["source-type"]);
    if (!sourceType) throw new Error("Missing --type.");
    if (!flags.location) throw new Error("Missing --location.");
    const item = {
      id,
      source_type: sourceType,
      source_location: flags.location,
      owner_client: flags.owner || flags.client || "",
      intended_use: flags.use || flags["intended-use"] || "",
      approval_status: "submitted",
      snapshot_reference: null,
      extraction_mode: normalizeExtractionMode(flags.mode || flags["extraction-mode"] || "manual"),
      missing_information: parseCsv(flags.missing || flags["missing-information"]),
      notes: flags.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.sources.push(item);
    writeJsonFile(file, data);
    appendAudit("design_source.added", "design_source", id, `Design source added: ${sourceType}`);
    console.log(`Added design source ${id}`);
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    console.log(JSON.stringify(getDesignSource(data, id), null, 2));
    return;
  }

  if (action === "snapshot") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "snapshot design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    item.snapshot_reference = {
      reference: flags.reference || flags.ref || item.source_location,
      captured_by: flags.by || flags["captured-by"] || getEffectiveActor(flags) || "local-cli",
      captured_at: new Date().toISOString(),
      checksum: flags.checksum || "",
      notes: flags.notes || ""
    };
    item.approval_status = "snapshot_taken";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.snapshot_taken", "design_source", id, `Design source snapshot taken: ${id}`);
    console.log(`Snapshot recorded for ${id}`);
    return;
  }

  if (action === "spec-list") {
    const specsData = readJsonFile(".kabeeri/design_sources/text_specs.json");
    specsData.specs = specsData.specs || [];
    console.log(table(["ID", "Source", "Status", "Scope", "Output"], specsData.specs.map((item) => [
      item.id,
      item.source_id,
      item.status,
      item.scope || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "spec-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create design text spec");
    const sourceId = flags.source || flags["source-id"] || value;
    if (!sourceId) throw new Error("Missing --source.");
    const source = getDesignSource(data, sourceId);
    if (!source.snapshot_reference) throw new Error(`Design source ${sourceId} needs a snapshot before text spec creation.`);
    const specsFile = ".kabeeri/design_sources/text_specs.json";
    const specsData = readJsonFile(specsFile);
    specsData.specs = specsData.specs || [];
    const id = flags.id || `text-spec-${String(specsData.specs.length + 1).padStart(3, "0")}`;
    if (specsData.specs.some((item) => item.id === id)) throw new Error(`Text spec already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const spec = {
      id,
      source_id: sourceId,
      snapshot_reference: source.snapshot_reference.reference || "",
      source_type: source.source_type,
      extraction_mode: normalizeExtractionMode(flags.mode || source.extraction_mode || "manual"),
      title: flags.title || source.intended_use || id,
      scope: flags.scope || source.intended_use || "",
      status: "draft",
      output_path: outputPath,
      open_questions: parseCsv(flags.questions || flags["open-questions"]),
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    specsData.specs.push(spec);
    writeJsonFile(specsFile, specsData);
    writeTextFile(outputPath, buildDesignTextSpecMarkdown(source, spec));
    appendAudit("design_text_spec.created", "design_text_spec", id, `Design text spec created for ${sourceId}`);
    console.log(`Created design text spec ${id}`);
    return;
  }

  if (action === "spec-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve design text spec");
    const specId = flags.id || value;
    if (!specId) throw new Error("Missing text spec id.");
    const specsFile = ".kabeeri/design_sources/text_specs.json";
    const specsData = readJsonFile(specsFile);
    const spec = getDesignTextSpec(specsData, specId);
    spec.status = "approved";
    spec.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    spec.approved_at = new Date().toISOString();
    spec.updated_at = new Date().toISOString();
    const source = getDesignSource(data, spec.source_id);
    source.approved_text_spec = spec.output_path;
    source.approval_status = "approved";
    source.design_tokens = flags.tokens || source.design_tokens || "";
    source.approved_by = spec.approved_by;
    source.approved_at = spec.approved_at;
    source.updated_at = new Date().toISOString();
    writeJsonFile(specsFile, specsData);
    writeJsonFile(file, data);
    appendAudit("design_text_spec.approved", "design_text_spec", specId, `Design text spec approved: ${spec.output_path}`);
    console.log(`Approved design text spec ${specId}`);
    return;
  }

  if (action === "missing-report") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create missing design report");
    const sourceId = flags.source || flags["source-id"] || value;
    if (!sourceId) throw new Error("Missing --source.");
    const source = getDesignSource(data, sourceId);
    const reportsFile = ".kabeeri/design_sources/missing_reports.json";
    const reportsData = readJsonFile(reportsFile);
    reportsData.reports = reportsData.reports || [];
    const id = flags.id || `missing-design-${String(reportsData.reports.length + 1).padStart(3, "0")}`;
    const report = {
      id,
      source_id: sourceId,
      affected_scope: flags.scope || source.intended_use || "",
      missing_items: parseCsv(flags.items || flags.missing || source.missing_information.join(",")),
      risk: flags.risk || "medium",
      required_decision: flags.decision || flags["required-decision"] || "",
      status: "open",
      created_at: new Date().toISOString()
    };
    reportsData.reports.push(report);
    writeJsonFile(reportsFile, reportsData);
    appendAudit("design_missing_report.created", "design_missing_report", id, `Missing design report created for ${sourceId}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "recommend" || action === "advisor" || action === "context") {
    const blueprintKey = value || flags.blueprint || getCurrentBlueprintKey();
    if (!blueprintKey) throw new Error("Missing blueprint key. Use `kvdf design recommend ecommerce` or select a product blueprint first.");
    const recommendation = buildUiDesignRecommendation(blueprintKey, flags);
    const advisorFile = ".kabeeri/design_sources/ui_advisor.json";
    const advisorData = readJsonFile(advisorFile);
    advisorData.recommendations = advisorData.recommendations || [];
    advisorData.reviews = advisorData.reviews || [];
    advisorData.recommendations.push(recommendation);
    advisorData.current_recommendation = recommendation.recommendation_id;
    writeJsonFile(advisorFile, advisorData);
    appendAudit("design_ui_advisor.recommended", "ui_design", recommendation.recommendation_id, `UI design recommendation for ${blueprintKey}`);
    if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
    else renderUiDesignRecommendation(recommendation);
    return;
  }

  if (action === "ui-review" || action === "review-ui") {
    const target = value || flags.target || flags.file || "ui_design";
    const review = buildUiDesignReview(target, flags);
    const advisorFile = ".kabeeri/design_sources/ui_advisor.json";
    const advisorData = readJsonFile(advisorFile);
    advisorData.recommendations = advisorData.recommendations || [];
    advisorData.reviews = advisorData.reviews || [];
    advisorData.reviews.push(review);
    writeJsonFile(advisorFile, advisorData);
    appendAudit("design_ui_advisor.reviewed", "ui_design", review.review_id, `UI design review: ${review.status}`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "ui-checklist") {
    const catalog = getUiDesignCatalog();
    if (flags.json) console.log(JSON.stringify({ checklist: catalog.approval_checklist }, null, 2));
    else console.log(table(["#", "Check"], catalog.approval_checklist.map((item, index) => [index + 1, item])));
    return;
  }

  if (action === "ui-history") {
    const advisorData = readJsonFile(".kabeeri/design_sources/ui_advisor.json");
    console.log(table(["Recommendation", "Blueprint", "Pattern", "Components"], (advisorData.recommendations || []).map((item) => [
      item.recommendation_id,
      item.blueprint_key,
      item.experience_pattern,
      String((item.components || []).length)
    ])));
    return;
  }

  if (action === "page-list") {
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    pagesData.pages = pagesData.pages || [];
    console.log(table(["ID", "Text Spec", "Status", "Name", "Output"], pagesData.pages.map((item) => [
      item.id,
      item.text_spec_id,
      item.status,
      item.page_name || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "page-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create page spec");
    const specId = flags.spec || flags["text-spec"] || value;
    if (!specId) throw new Error("Missing --spec.");
    const specsData = readJsonFile(".kabeeri/design_sources/text_specs.json");
    const spec = getDesignTextSpec(specsData, specId);
    if (spec.status !== "approved") throw new Error(`Text spec ${specId} must be approved before page specs are created.`);
    const pagesFile = ".kabeeri/design_sources/page_specs.json";
    const pagesData = readJsonFile(pagesFile);
    pagesData.pages = pagesData.pages || [];
    const id = flags.id || `page-spec-${String(pagesData.pages.length + 1).padStart(3, "0")}`;
    if (pagesData.pages.some((item) => item.id === id)) throw new Error(`Page spec already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const page = {
      id,
      text_spec_id: specId,
      source_id: spec.source_id,
      page_name: flags.name || flags.title || spec.title || id,
      purpose: flags.purpose || "",
      audience: flags.audience || "",
      required_states: parseCsv(flags.states || "loading,empty,error,success,disabled"),
      status: "draft",
      output_path: outputPath,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    pagesData.pages.push(page);
    writeJsonFile(pagesFile, pagesData);
    writeTextFile(outputPath, buildPageSpecMarkdown(spec, page));
    appendAudit("design_page_spec.created", "design_page_spec", id, `Page spec created from ${specId}`);
    console.log(`Created page spec ${id}`);
    return;
  }

  if (action === "page-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve page spec");
    const pageId = flags.id || value;
    if (!pageId) throw new Error("Missing page spec id.");
    const pagesFile = ".kabeeri/design_sources/page_specs.json";
    const pagesData = readJsonFile(pagesFile);
    const page = getDesignPageSpec(pagesData, pageId);
    page.status = "approved";
    page.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    page.approved_at = new Date().toISOString();
    page.updated_at = new Date().toISOString();
    writeJsonFile(pagesFile, pagesData);
    appendAudit("design_page_spec.approved", "design_page_spec", pageId, `Page spec approved: ${page.output_path}`);
    console.log(`Approved page spec ${pageId}`);
    return;
  }

  if (action === "component-list") {
    const componentsData = readJsonFile(".kabeeri/design_sources/component_contracts.json");
    componentsData.components = componentsData.components || [];
    console.log(table(["ID", "Page", "Status", "Name", "Output"], componentsData.components.map((item) => [
      item.id,
      item.page_spec_id,
      item.status,
      item.component_name || "",
      item.output_path || ""
    ])));
    return;
  }

  if (action === "component-create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Business Analyst"], "create component contract");
    const pageId = flags.page || flags["page-spec"] || value;
    if (!pageId) throw new Error("Missing --page.");
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    const page = getDesignPageSpec(pagesData, pageId);
    if (page.status !== "approved") throw new Error(`Page spec ${pageId} must be approved before component contracts are created.`);
    const componentsFile = ".kabeeri/design_sources/component_contracts.json";
    const componentsData = readJsonFile(componentsFile);
    componentsData.components = componentsData.components || [];
    const id = flags.id || `component-contract-${String(componentsData.components.length + 1).padStart(3, "0")}`;
    if (componentsData.components.some((item) => item.id === id)) throw new Error(`Component contract already exists: ${id}`);
    const outputPath = flags.output || `frontend_specs/${id}.md`;
    const component = {
      id,
      page_spec_id: pageId,
      text_spec_id: page.text_spec_id,
      source_id: page.source_id,
      component_name: flags.name || flags.title || id,
      variants: parseCsv(flags.variants || "default"),
      states: parseCsv(flags.states || "default,hover,focus,disabled,loading,error"),
      status: "draft",
      output_path: outputPath,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    componentsData.components.push(component);
    writeJsonFile(componentsFile, componentsData);
    writeTextFile(outputPath, buildComponentContractMarkdown(page, component));
    appendAudit("design_component_contract.created", "design_component_contract", id, `Component contract created from ${pageId}`);
    console.log(`Created component contract ${id}`);
    return;
  }

  if (action === "component-approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve component contract");
    const componentId = flags.id || value;
    if (!componentId) throw new Error("Missing component contract id.");
    const componentsFile = ".kabeeri/design_sources/component_contracts.json";
    const componentsData = readJsonFile(componentsFile);
    const component = getDesignComponentContract(componentsData, componentId);
    component.status = "approved";
    component.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    component.approved_at = new Date().toISOString();
    component.updated_at = new Date().toISOString();
    writeJsonFile(componentsFile, componentsData);
    appendAudit("design_component_contract.approved", "design_component_contract", componentId, `Component contract approved: ${component.output_path}`);
    console.log(`Approved component contract ${componentId}`);
    return;
  }

  if (action === "visual-review-list" || action === "visual-list") {
    const reviewsData = readJsonFile(".kabeeri/design_sources/visual_reviews.json");
    reviewsData.reviews = reviewsData.reviews || [];
    console.log(table(["Review", "Task", "Page", "Decision", "Screenshots", "Reviewer"], reviewsData.reviews.map((item) => [
      item.review_id,
      item.task_id || "",
      item.page_spec_id || "",
      item.decision,
      (item.screenshots || []).length,
      item.reviewer || ""
    ])));
    return;
  }

  if (action === "visual-review" || action === "visual") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer", "Frontend Developer", "Admin Frontend Developer"], "record visual review");
    const pageId = flags.page || flags["page-spec"] || value;
    if (!pageId) throw new Error("Missing --page.");
    const pagesData = readJsonFile(".kabeeri/design_sources/page_specs.json");
    const page = getDesignPageSpec(pagesData, pageId);
    if (page.status !== "approved") throw new Error(`Page spec ${pageId} must be approved before visual review.`);
    const taskId = flags.task || "";
    if (taskId && !getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
    const reviewsFile = ".kabeeri/design_sources/visual_reviews.json";
    const reviewsData = readJsonFile(reviewsFile);
    reviewsData.reviews = reviewsData.reviews || [];
    const review = {
      review_id: flags.id || `visual-review-${String(reviewsData.reviews.length + 1).padStart(3, "0")}`,
      task_id: taskId || null,
      page_spec_id: pageId,
      source_id: page.source_id,
      screenshots: parseCsv(flags.screenshots || flags.screenshot),
      viewport_checks: parseCsv(flags.viewports || "mobile,desktop"),
      checks: parseCsv(flags.checks || "responsive,states,accessibility,visual-match"),
      deviations: parseCsv(flags.deviations),
      decision: flags.decision || "pass",
      reviewer: flags.reviewer || getEffectiveActor(flags) || "local-cli",
      notes: flags.notes || "",
      reviewed_at: new Date().toISOString()
    };
    if (!["pass", "needs_rework", "blocked"].includes(review.decision)) throw new Error("Invalid --decision. Use pass, needs_rework, or blocked.");
    if (!review.screenshots.length) throw new Error("Missing --screenshots.");
    reviewsData.reviews.push(review);
    writeJsonFile(reviewsFile, reviewsData);
    appendAudit("design_visual_review.recorded", "visual_review", review.review_id, `Visual review ${review.decision} for ${pageId}`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }

  if (action === "gate" || action === "visual-gate") {
    const result = buildDesignGate(flags.task || value, flags);
    appendAudit("design_gate.evaluated", "design_gate", result.task_id || result.page_spec_id || "design", `Design gate: ${result.status}`);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`Design gate ${result.status}: ${(result.blockers || []).join("; ") || "ready"}`);
    if (result.status === "blocked" && (flags.strict === true || flags.strict === "true")) throw new Error(`Design gate blocked: ${result.blockers.join("; ")}`);
    return;
  }

  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "approve design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    const approvedTextSpec = flags.spec || flags["text-spec"] || flags["approved-text-spec"];
    if (!approvedTextSpec) throw new Error("Missing --spec. Approved text spec is required before frontend implementation.");
    item.approval_status = "approved";
    item.approved_text_spec = approvedTextSpec;
    item.design_tokens = flags.tokens || "";
    item.approved_by = getEffectiveActor(flags) || flags.by || "local-cli";
    item.approved_at = new Date().toISOString();
    item.notes = flags.notes || item.notes || "";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.approved", "design_source", id, `Design source approved with text spec: ${approvedTextSpec}`);
    console.log(`Approved design source ${id}`);
    return;
  }

  if (action === "reject") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Designer"], "reject design source");
    const id = flags.id || value;
    if (!id) throw new Error("Missing design source id.");
    const item = getDesignSource(data, id);
    item.approval_status = "rejected";
    item.rejection_reason = flags.reason || "";
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("design_source.rejected", "design_source", id, `Design source rejected: ${id}`);
    console.log(`Rejected design source ${id}`);
    return;
  }

  if (action === "audit") {
    const id = flags.id || value;
    const selected = id ? [getDesignSource(data, id)] : data.sources;
    const report = buildDesignAudit(selected);
    const reportsFile = ".kabeeri/design_sources/audit_reports.json";
    const reportsData = readJsonFile(reportsFile);
    reportsData.reports = reportsData.reports || [];
    reportsData.reports.push(report);
    writeJsonFile(reportsFile, reportsData);
    appendAudit("design_source.audit", "design_source", id || "all", `Design source audit: ${report.status}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  throw new Error(`Unknown design action: ${action}`);
}

function ensureDesignState() {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(repoRoot(), ".kabeeri", "design_sources");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/design_sources/sources.json")) writeJsonFile(".kabeeri/design_sources/sources.json", { sources: [] });
  if (!fileExists(".kabeeri/design_sources/text_specs.json")) writeJsonFile(".kabeeri/design_sources/text_specs.json", { specs: [] });
  if (!fileExists(".kabeeri/design_sources/page_specs.json")) writeJsonFile(".kabeeri/design_sources/page_specs.json", { pages: [] });
  if (!fileExists(".kabeeri/design_sources/component_contracts.json")) writeJsonFile(".kabeeri/design_sources/component_contracts.json", { components: [] });
  if (!fileExists(".kabeeri/design_sources/missing_reports.json")) writeJsonFile(".kabeeri/design_sources/missing_reports.json", { reports: [] });
  if (!fileExists(".kabeeri/design_sources/visual_reviews.json")) writeJsonFile(".kabeeri/design_sources/visual_reviews.json", { reviews: [] });
  if (!fileExists(".kabeeri/design_sources/audit_reports.json")) writeJsonFile(".kabeeri/design_sources/audit_reports.json", { reports: [] });
  if (!fileExists(".kabeeri/design_sources/ui_advisor.json")) writeJsonFile(".kabeeri/design_sources/ui_advisor.json", { recommendations: [], reviews: [], current_recommendation: null });
}

function getUiDesignCatalog() {
  return readJsonFile("standard_systems/UI_UX_DESIGN_BLUEPRINT.json");
}

function buildUiDesignRecommendation(blueprintKey, flags = {}) {
  const catalog = getUiDesignCatalog();
  const product = findProductBlueprint(blueprintKey);
  if (!product) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const patternKey = flags.pattern || catalog.blueprint_experience_map[product.key] || inferUiPatternFromBlueprint(product);
  const pattern = catalog.experience_patterns[patternKey];
  if (!pattern) throw new Error(`UI experience pattern not found: ${patternKey}`);
  const componentGroups = inferUiComponentGroups(patternKey, product);
  const components = uniqueList(componentGroups.flatMap((group) => catalog.component_sets[group] || []));
  return {
    recommendation_id: `ui-design-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: product.key,
    blueprint_name: product.name,
    experience_pattern: patternKey,
    recommended_stacks: pattern.recommended_stacks || [],
    foundations: catalog.foundations || [],
    components,
    component_groups: componentGroups,
    page_templates: inferUiPageTemplates(product, patternKey),
    layout_priorities: pattern.layout_priorities || [],
    seo_geo: pattern.seo_geo || [],
    avoid: pattern.avoid || [],
    checklist: catalog.approval_checklist || [],
    ai_instructions: [
      "Start with approved design tokens and page specs before frontend implementation.",
      "Choose components from the recommended component groups instead of inventing one-off UI.",
      "For SEO/GEO surfaces, use semantic HTML, structured data, breadcrumbs, clear headings, and fast pages.",
      "For dashboards, prioritize data density, filters, tables, keyboard navigation, permissions, and empty/error states.",
      "For mobile, prioritize touch targets, offline/error states, navigation clarity, push permission UX, and deep links."
    ]
  };
}

function inferUiPatternFromBlueprint(product) {
  if ((product.channels || []).includes("mobile_app")) return "mobile_app";
  if ((product.channels || []).includes("pos_terminal")) return "pos_operations";
  if ((product.category || "").includes("content")) return "seo_content_site";
  if ((product.category || "").includes("commerce")) return "commerce_storefront";
  return "data_heavy_web_app";
}

function inferUiComponentGroups(patternKey, product) {
  const groups = ["core"];
  if (patternKey === "seo_content_site") groups.push("content");
  if (patternKey === "commerce_storefront") groups.push("commerce", "content");
  if (patternKey === "data_heavy_web_app") groups.push("dashboard");
  if (patternKey === "pos_operations") groups.push("dashboard", "commerce");
  if (patternKey === "mobile_app") groups.push("mobile");
  if ((product.channels || []).some((item) => String(item).includes("admin"))) groups.push("dashboard");
  return uniqueList(groups);
}

function inferUiPageTemplates(product, patternKey) {
  const base = product.frontend_pages || [];
  const extras = {
    seo_content_site: ["home", "listing_page", "detail_page", "search_results", "faq_section", "contact_or_subscribe"],
    commerce_storefront: ["home", "category", "product_details", "cart", "checkout", "order_tracking", "account"],
    data_heavy_web_app: ["dashboard", "list_table", "detail_drawer", "create_edit_form", "reports", "settings"],
    pos_operations: ["sales_screen", "shift_open_close", "orders", "cash_drawer", "reports"],
    mobile_app: ["onboarding", "login", "home", "list", "detail", "profile", "settings", "offline_state"]
  };
  return uniqueList([...base, ...(extras[patternKey] || [])]);
}

function buildUiDesignReview(target, flags = {}) {
  const text = [target, flags.notes || ""].join(" ").toLowerCase();
  const findings = [];
  const required = [
    ["tokens", "Design tokens not mentioned."],
    ["responsive", "Responsive behavior not mentioned."],
    ["accessibility", "Accessibility not mentioned."],
    ["loading", "Loading state not mentioned."],
    ["empty", "Empty state not mentioned."],
    ["error", "Error state not mentioned."]
  ];
  for (const [needle, finding] of required) {
    if (!text.includes(needle)) findings.push(finding);
  }
  if (/seo|news|blog|article|product|landing/.test(text)) {
    if (!text.includes("schema") && !text.includes("structured data")) findings.push("SEO/GEO surface does not mention structured data.");
    if (!text.includes("semantic")) findings.push("SEO/GEO surface does not mention semantic HTML.");
    if (!text.includes("breadcrumb")) findings.push("SEO/GEO surface does not mention breadcrumbs.");
  }
  if (/dashboard|erp|crm|table|admin/.test(text)) {
    if (!text.includes("filter")) findings.push("Dashboard/data-heavy UI does not mention filters.");
    if (!text.includes("pagination") && !text.includes("virtual")) findings.push("Dashboard/data-heavy UI does not mention pagination or virtualization.");
  }
  return {
    review_id: `ui-review-${Date.now()}`,
    created_at: new Date().toISOString(),
    target,
    status: findings.length ? "needs_attention" : "pass",
    findings,
    checked_rules: ["tokens", "responsive", "accessibility", "states", "seo_geo", "dashboard_ergonomics"]
  };
}

function renderUiDesignRecommendation(recommendation) {
  console.log(`UI design recommendation: ${recommendation.recommendation_id}`);
  console.log(`Blueprint: ${recommendation.blueprint_name} (${recommendation.blueprint_key})`);
  console.log(table(["Surface", "Items"], [
    ["Pattern", recommendation.experience_pattern],
    ["Stacks", recommendation.recommended_stacks.join(", ")],
    ["Component groups", (recommendation.component_groups || []).join(", ")],
    ["Components", recommendation.components.slice(0, 24).join(", ")],
    ["Page templates", recommendation.page_templates.slice(0, 18).join(", ")],
    ["SEO/GEO", recommendation.seo_geo.join(", ")]
  ]));
}

function getDesignSource(data, id) {
  const item = (data.sources || []).find((source) => source.id === id);
  if (!item) throw new Error(`Design source not found: ${id}`);
  return item;
}

function normalizeDesignSourceType(value) {
  if (!value) return "";
  const normalized = String(value).trim().toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["figma", "pdf", "image", "screenshot", "google_drive_file", "adobe_xd", "sketch", "penpot", "canva", "framer", "webflow", "reference_website", "wireframe", "hand_drawn_sketch", "text_brief", "other"]);
  if (!allowed.has(normalized)) throw new Error(`Invalid design source type: ${value}`);
  return normalized;
}

function normalizeExtractionMode(value) {
  const normalized = String(value || "manual").trim().toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["manual", "assisted", "automated_future"]);
  if (!allowed.has(normalized)) throw new Error("Invalid extraction mode. Use manual, assisted, or automated_future.");
  return normalized;
}

function getDesignTextSpec(data, id) {
  const item = (data.specs || []).find((spec) => spec.id === id);
  if (!item) throw new Error(`Design text spec not found: ${id}`);
  return item;
}

function getDesignPageSpec(data, id) {
  const item = (data.pages || []).find((page) => page.id === id);
  if (!item) throw new Error(`Design page spec not found: ${id}`);
  return item;
}

function getDesignComponentContract(data, id) {
  const item = (data.components || []).find((component) => component.id === id);
  if (!item) throw new Error(`Design component contract not found: ${id}`);
  return item;
}

function buildDesignTextSpecMarkdown(source, spec) {
  return `# Design Text Spec - ${spec.title}

## Status

${spec.status}

## Source

- Source ID: ${source.id}
- Source type: ${source.source_type}
- Snapshot: ${spec.snapshot_reference}
- Extraction mode: ${spec.extraction_mode}
- Original location: ${source.source_location}

## Scope

${spec.scope || "TBD"}

## Layout Structure

TBD. Describe sections, hierarchy, density, and responsive order.

## Content Requirements

TBD. List visible text, labels, imagery rules, and tone.

## Design Tokens

TBD. Link color, typography, spacing, radius, and motion tokens.

## Responsive Behavior

TBD. Define mobile, tablet, desktop, RTL, and LTR behavior.

## Component States

- loading: TBD
- empty: TBD
- error: TBD
- success: TBD
- disabled: TBD

## Data Requirements

TBD. Define required API/data fields, permissions, and empty data handling.

## Accessibility Notes

TBD. Define keyboard, focus, labels, contrast, motion, and screen reader requirements.

## Open Questions

${spec.open_questions.length > 0 ? spec.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

## Approval

- Status: ${spec.status}
- Approver:
- Approval date:
`;
}

function buildPageSpecMarkdown(spec, page) {
  return `# Page Spec - ${page.page_name}

## Page ID

${page.id}

## Source References

- Design source: ${page.source_id}
- Approved text spec: ${spec.output_path}
- Text spec ID: ${page.text_spec_id}

## Purpose

${page.purpose || "TBD"}

## Audience

${page.audience || "TBD"}

## Layout

TBD. Describe sections, order, density, and hierarchy.

## Data Requirements

TBD. Inputs, API data, states, permissions, and empty data rules.

## Required States

${page.required_states.map((state) => `- ${state}: TBD`).join("\n")}

## Responsive Behavior

TBD. Mobile, tablet, desktop, and RTL/LTR notes.

## Accessibility

TBD. Keyboard, focus, labels, contrast, motion, and screen reader notes.

## Acceptance Criteria

- Page follows the approved text spec.
- Required states are represented.
- Responsive behavior is reviewed.
- Accessibility requirements are reviewed.

## Approval

- Status: ${page.status}
- Approver:
- Approval date:
`;
}

function buildComponentContractMarkdown(page, component) {
  return `# Component Contract - ${component.component_name}

## Component ID

${component.id}

## Source References

- Design source: ${component.source_id}
- Page spec: ${page.output_path}
- Page spec ID: ${component.page_spec_id}
- Text spec ID: ${component.text_spec_id}

## Purpose

TBD. What the component is for.

## Variants

${component.variants.map((variant) => `- ${variant}`).join("\n")}

## States

${component.states.map((state) => `- ${state}: TBD`).join("\n")}

## Props / Inputs

TBD. Expected data, labels, icons, callbacks, and constraints.

## Design Tokens

TBD. Colors, typography, spacing, radius, shadows, and breakpoints.

## Accessibility

TBD. ARIA labels, keyboard behavior, focus order, contrast, and reduced motion.

## Forbidden Variations

TBD. Styles or behaviors the component must not introduce.

## Acceptance Criteria

- Component follows the approved page spec.
- All required states are represented.
- Props and data constraints are clear.
- Accessibility behavior is reviewable.

## Approval

- Status: ${component.status}
- Approver:
- Approval date:
`;
}

function buildDesignAudit(sources) {
  const pagesData = fileExists(".kabeeri/design_sources/page_specs.json") ? readJsonFile(".kabeeri/design_sources/page_specs.json") : { pages: [] };
  const componentsData = fileExists(".kabeeri/design_sources/component_contracts.json") ? readJsonFile(".kabeeri/design_sources/component_contracts.json") : { components: [] };
  const visualData = fileExists(".kabeeri/design_sources/visual_reviews.json") ? readJsonFile(".kabeeri/design_sources/visual_reviews.json") : { reviews: [] };
  const blockers = [];
  const warnings = [];
  for (const source of sources) {
    if (!source.snapshot_reference) blockers.push(`${source.id}: snapshot is missing.`);
    if (source.approval_status !== "approved") blockers.push(`${source.id}: design source is not approved.`);
    if (!source.approved_text_spec) blockers.push(`${source.id}: approved text spec is missing.`);
    if (!source.design_tokens) warnings.push(`${source.id}: design tokens are not linked.`);
    if ((source.missing_information || []).length > 0) warnings.push(`${source.id}: missing information remains: ${source.missing_information.join(", ")}.`);
    if (source.source_type === "reference_website") warnings.push(`${source.id}: reference website is inspiration only and must not be copied.`);
    const approvedPages = (pagesData.pages || []).filter((page) => page.source_id === source.id && page.status === "approved");
    if (source.approval_status === "approved" && approvedPages.length === 0) warnings.push(`${source.id}: no approved page spec is linked yet.`);
    const approvedComponents = (componentsData.components || []).filter((component) => component.source_id === source.id && component.status === "approved");
    if (approvedPages.length > 0 && approvedComponents.length === 0) warnings.push(`${source.id}: no approved component contracts are linked yet.`);
    const passingVisualReviews = (visualData.reviews || []).filter((review) => review.source_id === source.id && review.decision === "pass");
    if (approvedPages.length > 0 && passingVisualReviews.length === 0) warnings.push(`${source.id}: no passing visual review has been recorded yet.`);
  }
  return {
    report_id: `design-audit-${Date.now()}`,
    generated_at: new Date().toISOString(),
    source_ids: sources.map((source) => source.id),
    status: blockers.length === 0 ? "pass" : "blocked",
    blockers,
    warnings,
    rule: "Frontend implementation is blocked until every raw design source has a snapshot and approved text spec."
  };
}

function buildDesignGate(taskId, flags = {}) {
  const pagesData = fileExists(".kabeeri/design_sources/page_specs.json") ? readJsonFile(".kabeeri/design_sources/page_specs.json") : { pages: [] };
  const componentsData = fileExists(".kabeeri/design_sources/component_contracts.json") ? readJsonFile(".kabeeri/design_sources/component_contracts.json") : { components: [] };
  const reviewsData = fileExists(".kabeeri/design_sources/visual_reviews.json") ? readJsonFile(".kabeeri/design_sources/visual_reviews.json") : { reviews: [] };
  const pageId = flags.page || flags["page-spec"];
  const blockers = [];
  const warnings = [];
  const taskItem = taskId ? getTaskById(taskId) : null;
  const frontendStreams = new Set(["public_frontend", "admin_frontend", "user_frontend", "internal_operations_frontend"]);
  const taskNeedsDesign = taskItem ? taskWorkstreams(taskItem).some((stream) => frontendStreams.has(stream)) : true;
  if (!taskNeedsDesign && !pageId) warnings.push(`${taskId}: task is not in a known frontend workstream.`);
  if (!pageId) blockers.push("page spec is required. Use --page page-spec-001.");
  const page = pageId ? (pagesData.pages || []).find((item) => item.id === pageId) : null;
  if (pageId && !page) blockers.push(`page spec not found: ${pageId}`);
  if (page && page.status !== "approved") blockers.push(`${pageId}: page spec is not approved.`);
  if (page) {
    const approvedComponents = (componentsData.components || []).filter((component) => component.page_spec_id === page.id && component.status === "approved");
    if (!approvedComponents.length) warnings.push(`${page.id}: no approved component contract is linked.`);
  }
  const matchingReviews = (reviewsData.reviews || []).filter((review) => {
    if (pageId && review.page_spec_id !== pageId) return false;
    if (taskId && review.task_id && review.task_id !== taskId) return false;
    return review.decision === "pass";
  });
  if (!matchingReviews.length) blockers.push("passing visual review is missing.");
  return {
    gate_id: `design-gate-${Date.now()}`,
    evaluated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : "pass",
    task_id: taskId || null,
    page_spec_id: pageId || null,
    blockers,
    warnings,
    visual_review_ids: matchingReviews.map((review) => review.review_id)
  };
}

function policy(action, value, flags = {}) {
  ensureWorkspace();
  ensurePolicyState();

  if (!action || action === "list") {
    const policies = listPolicyFiles().map((file) => readJsonFile(file));
    console.log(table(["Policy", "Version", "Subject", "Checks"], policies.map((item) => [
      item.policy_id,
      item.version || "",
      item.subject_type || "",
      (item.required_checks || []).length
    ])));
    return;
  }

  if (action === "show") {
    const policyId = flags.id || value || "task_verification_policy";
    console.log(JSON.stringify(getPolicyDefinition(policyId), null, 2));
    return;
  }

  if (action === "evaluate" || action === "gate") {
    const valueLooksLikePolicy = value && String(value).endsWith("_policy");
    const policyId = flags.policy || flags.id || (valueLooksLikePolicy ? value : null) || policyIdForScope(flags.scope || (flags.task || value ? "task" : ""));
    const result = evaluatePolicy(policyId, {
      taskId: flags.task || (valueLooksLikePolicy ? null : value),
      planId: flags.plan,
      version: flags.version || value,
      audience: flags.audience,
      scope: flags.scope,
      stage: flags.stage || (action === "gate" ? "gate" : "evaluate"),
      actor: getEffectiveActor(flags) || flags.owner || flags.actor || ""
    });
    savePolicyResult(result);
    appendAudit(`policy.${action}`, "policy", result.policy_id, `Policy ${action}: ${result.status}`);

    if (action === "gate" && result.status === "blocked") {
      if (flags.override === "true" || flags.override === true) {
        applyPolicyOverride(result, flags);
        console.log(`Policy gate overridden for ${result.subject_id}`);
        return;
      }
      throw new Error(`Policy gate blocked: ${result.blockers.map((item) => item.check_id).join(", ")}`);
    }

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "status") {
    const latest = latestPolicyResults();
    if (flags.json) {
      console.log(JSON.stringify({ results: latest }, null, 2));
      return;
    }
    console.log(table(["Policy", "Subject", "Stage", "Status", "Blockers", "Evaluated"], latest.map((item) => [
      item.policy_id,
      item.subject_id,
      item.stage || "",
      item.status,
      (item.blockers || []).map((blocker) => blocker.check_id).join(", ") || "-",
      item.evaluated_at || ""
    ])));
    return;
  }

  if (action === "report") {
    const results = readJsonFile(".kabeeri/policies/policy_results.json").results || [];
    const output = flags.output || ".kabeeri/reports/policy_report.md";
    writeTextFile(output, buildPolicyReport(results));
    appendAudit("policy.report", "policy", "all", `Policy report written: ${output}`);
    console.log(`Wrote policy report: ${output}`);
    return;
  }

  throw new Error(`Unknown policy action: ${action}`);
}

function ensurePolicyState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "policies"), { recursive: true });
  if (!fileExists(".kabeeri/policies/policy_results.json")) writeJsonFile(".kabeeri/policies/policy_results.json", { results: [] });
  writeDefaultPolicy("task_verification_policy", {
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
      manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("release_policy", {
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
  });
  writeDefaultPolicy("handoff_policy", {
    policy_id: "handoff_policy",
    version: "1.0.0",
    subject_type: "handoff",
    required_checks: [
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Client or Owner handoff must not include unresolved blocker security findings." },
      { check_id: "latest_policy_results_not_blocked", severity: "warn", description: "Handoff should call out unresolved policy blockers." },
      { check_id: "open_work_is_disclosed", severity: "warn", description: "Open tasks should be visible in the package roadmap and readiness reports." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("security_policy", {
    policy_id: "security_policy",
    version: "1.0.0",
    subject_type: "security",
    required_checks: [
      { check_id: "latest_security_scan_exists", severity: "warn", description: "Security governance should be based on a recorded scan." },
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have critical or high findings." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
  writeDefaultPolicy("migration_policy", {
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
  });
  writeDefaultPolicy("github_write_policy", {
    policy_id: "github_write_policy",
    version: "1.0.0",
    subject_type: "github_write",
    required_checks: [
      { check_id: "github_write_confirmation_present", severity: "fail", description: "GitHub writes must be explicitly confirmed." },
      { check_id: "repository_validation_passes", severity: "fail", description: "Repository validation must pass before confirmed GitHub writes." },
      { check_id: "latest_security_scan_exists", severity: "fail", description: "A security scan must exist before confirmed GitHub writes." },
      { check_id: "latest_security_scan_not_blocked", severity: "fail", description: "Latest security scan must not have blocker findings before GitHub writes." },
      { check_id: "latest_policy_results_not_blocked", severity: "fail", description: "Confirmed GitHub writes must not proceed with unresolved policy blockers." },
      { check_id: "owner_actor_for_github_write", severity: "fail", description: "Confirmed GitHub writes must be performed by an Owner actor." }
    ],
    manual_override: { allowed: true, requires_owner: true, requires_reason: true, audit_event_required: true }
  });
}

function writeDefaultPolicy(policyId, definition) {
  const file = `.kabeeri/policies/${policyId}.json`;
  if (!fileExists(file)) writeJsonFile(file, definition);
}

function listPolicyFiles() {
  return [
    ".kabeeri/policies/task_verification_policy.json",
    ".kabeeri/policies/release_policy.json",
    ".kabeeri/policies/handoff_policy.json",
    ".kabeeri/policies/security_policy.json",
    ".kabeeri/policies/migration_policy.json",
    ".kabeeri/policies/github_write_policy.json"
  ].filter((file) => fileExists(file));
}

function policyIdForScope(scope) {
  const normalized = String(scope || "").toLowerCase().replace(/-/g, "_");
  if (!normalized || normalized === "task" || normalized === "verify" || normalized === "verification") return "task_verification_policy";
  if (["release", "publish"].includes(normalized)) return "release_policy";
  if (["handoff", "delivery"].includes(normalized)) return "handoff_policy";
  if (["security", "secret", "secrets"].includes(normalized)) return "security_policy";
  if (["migration", "migrate"].includes(normalized)) return "migration_policy";
  if (["github", "github_write", "github-write", "remote_write", "remote-write"].includes(normalized)) return "github_write_policy";
  return normalized.endsWith("_policy") ? normalized : `${normalized}_policy`;
}

function getPolicyDefinition(policyId) {
  const file = `.kabeeri/policies/${policyId}.json`;
  if (!fileExists(file)) throw new Error(`Policy not found: ${policyId}`);
  return readJsonFile(file);
}

function evaluatePolicy(policyId, context) {
  const definition = getPolicyDefinition(policyId);
  if (policyId !== "task_verification_policy") return evaluateGovernancePolicy(definition, context);
  const taskId = context.taskId;
  if (!taskId) throw new Error("Missing --task.");
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  const checks = (definition.required_checks || []).map((check) => evaluateTaskPolicyCheck(check, taskItem, context));
  const blockers = checks.filter((check) => check.result === "fail" && check.severity === "fail");
  const warnings = checks.filter((check) => check.result === "warn" || (check.result === "fail" && check.severity === "warn"));
  return {
    result_id: `policy-result-${Date.now()}`,
    policy_id: definition.policy_id,
    policy_version: definition.version,
    subject_type: definition.subject_type,
    subject_id: taskId,
    stage: context.stage || "evaluate",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    evaluated_at: new Date().toISOString(),
    evaluated_by: context.actor || "local-cli",
    blockers,
    warnings,
    checks
  };
}

function evaluateGovernancePolicy(definition, context = {}) {
  const checks = (definition.required_checks || []).map((check) => evaluateGovernancePolicyCheck(definition, check, context));
  const blockers = checks.filter((check) => check.result === "fail" && check.severity === "fail");
  const warnings = checks.filter((check) => check.result === "warn" || (check.result === "fail" && check.severity === "warn"));
  const subjectId = policySubjectId(definition, context);
  return {
    result_id: `policy-result-${Date.now()}`,
    policy_id: definition.policy_id,
    policy_version: definition.version,
    subject_type: definition.subject_type,
    subject_id: subjectId,
    stage: context.stage || "evaluate",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    evaluated_at: new Date().toISOString(),
    evaluated_by: context.actor || "local-cli",
    blockers,
    warnings,
    checks
  };
}

function policySubjectId(definition, context) {
  if (definition.subject_type === "release") return context.version || "current-release";
  if (definition.subject_type === "handoff") return context.packageId || context.audience || "handoff";
  if (definition.subject_type === "migration") return context.planId || "migration";
  if (definition.subject_type === "security") return "latest-security-scan";
  if (definition.subject_type === "github_write") return context.operation || context.version || "github-write";
  return context.subjectId || definition.subject_type || definition.policy_id;
}

function evaluateGovernancePolicyCheck(definition, check, context) {
  const base = {
    check_id: check.check_id,
    severity: check.severity || "fail",
    description: check.description || ""
  };
  const pass = (evidence) => ({ ...base, result: "pass", evidence });
  const fail = (evidence) => ({ ...base, result: base.severity === "warn" ? "warn" : "fail", evidence });
  const warn = (evidence) => ({ ...base, result: "warn", evidence });

  if (check.check_id === "repository_validation_passes") {
    const validation = validateRepository("all");
    return validation.ok ? pass("kvdf validate all passed.") : fail(validation.lines.filter((line) => line.includes("missing") || line.includes("Invalid")).join(" | ") || "Repository validation failed.");
  }
  if (check.check_id === "latest_security_scan_exists") {
    const scan = getLatestSecurityScan();
    return scan ? pass(`${scan.scan_id}: ${scan.status}`) : fail("No security scan recorded. Run `kvdf security scan` first.");
  }
  if (check.check_id === "latest_security_scan_not_blocked") {
    const scan = getLatestSecurityScan();
    if (!scan) return warn("No security scan recorded yet.");
    return scan.status === "blocked" ? fail(`${scan.scan_id} has ${scan.blockers.length} blocker finding(s).`) : pass(`${scan.scan_id}: ${scan.status}`);
  }
  if (check.check_id === "latest_migration_checks_not_blocked") {
    const blocked = latestMigrationChecks().filter((item) => item.status === "blocked");
    return blocked.length ? fail(`${blocked.length} migration check(s) are blocked: ${blocked.map((item) => item.plan_id).join(", ")}`) : pass("No latest migration checks are blocked.");
  }
  if (check.check_id === "latest_policy_results_not_blocked") {
    const blocked = latestPolicyResults().filter((item) => item.status === "blocked" && item.policy_id !== definition.policy_id);
    return blocked.length ? fail(`${blocked.length} governed subject(s) have latest blocked policy results.`) : pass("No latest governed policy blockers found.");
  }
  if (check.check_id === "owner_actor_for_confirmed_publish") {
    if (!context.confirm) return pass("Not a confirmed publish operation.");
    const identity = getIdentity(context.actor);
    return identity && identity.role === "Owner" ? pass(`Owner actor=${context.actor}`) : fail("Confirmed publish has no Owner actor evidence.");
  }
  if (check.check_id === "github_write_confirmation_present") {
    return context.confirm ? pass(`Confirmed GitHub write: ${context.operation || "unknown"}`) : fail("Missing --confirm for GitHub write operation.");
  }
  if (check.check_id === "owner_actor_for_github_write") {
    const identity = getIdentity(context.actor);
    return identity && identity.role === "Owner" ? pass(`Owner actor=${context.actor}`) : fail("Confirmed GitHub write has no Owner actor evidence.");
  }
  if (check.check_id === "open_work_is_disclosed") {
    const openTasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
    return openTasks.length ? warn(`${openTasks.length} open task(s) will be disclosed in handoff reports.`) : pass("No open tasks recorded.");
  }
  if (check.check_id === "migration_plan_exists") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    return getMigrationPlan(context.planId) ? pass(`Migration plan exists: ${context.planId}`) : fail(`Migration plan not found: ${context.planId}`);
  }
  if (check.check_id === "rollback_plan_present") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const plan = getMigrationPlan(context.planId);
    return plan.rollback_plan_id ? pass(`Rollback plan: ${plan.rollback_plan_id}`) : fail(`Migration plan ${context.planId} has no rollback plan.`);
  }
  if (check.check_id === "backup_reference_present") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const plan = getMigrationPlan(context.planId);
    return plan.backup_reference ? pass(`Backup reference: ${plan.backup_reference}`) : fail(`Migration plan ${context.planId} has no backup reference.`);
  }
  if (check.check_id === "latest_migration_check_not_blocked") {
    if (!context.planId) return fail("Missing --plan for migration policy.");
    const latest = latestMigrationChecks().find((item) => item.plan_id === context.planId);
    if (!latest) return fail(`No migration check recorded for ${context.planId}. Run kvdf migration check --plan ${context.planId}.`);
    return latest.status === "blocked" ? fail(`${latest.check_id} is blocked.`) : pass(`${latest.check_id}: ${latest.status}`);
  }
  return fail(`Unknown check: ${check.check_id}`);
}

function getLatestSecurityScan() {
  const scans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  return scans.length ? scans[scans.length - 1] : null;
}

function latestPolicyResults() {
  const results = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const latest = new Map();
  for (const item of results) {
    latest.set(`${item.policy_id}|${item.subject_type}|${item.subject_id}`, item);
  }
  return [...latest.values()];
}

function latestMigrationChecks() {
  const checks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const latest = new Map();
  for (const item of checks) latest.set(item.plan_id, item);
  return [...latest.values()];
}

function runPolicyGate(scope, context = {}, flags = {}) {
  if (flags["skip-policy-gate"] === true || flags["skip-policy-gate"] === "true") {
    appendAudit("policy.gate.skipped", "policy", scope, `Policy gate skipped for ${scope}`);
    return null;
  }
  ensurePolicyState();
  const result = evaluatePolicy(policyIdForScope(scope), {
    ...context,
    scope,
    stage: "gate",
    actor: getEffectiveActor(flags) || flags.owner || flags.actor || ""
  });
  savePolicyResult(result);
  appendAudit("policy.gate", "policy", result.policy_id, `Policy gate ${scope}: ${result.status}`);
  if (result.status === "blocked") {
    if (flags.override === "true" || flags.override === true) {
      applyPolicyOverride(result, flags);
      return result;
    }
    throw new Error(`Policy gate blocked: ${result.blockers.map((item) => item.check_id).join(", ")}`);
  }
  return result;
}

function evaluateTaskPolicyCheck(check, taskItem, context) {
  const base = {
    check_id: check.check_id,
    severity: check.severity || "fail",
    description: check.description || ""
  };
  const pass = (evidence) => ({ ...base, result: "pass", evidence });
  const fail = (evidence) => ({ ...base, result: base.severity === "warn" ? "warn" : "fail", evidence });

  if (check.check_id === "source_reference_present") {
    return taskItem.source || taskItem.provenance ? pass(`source=${taskItem.source || "provenance"}`) : fail("Task has no source or provenance field.");
  }
  if (check.check_id === "acceptance_criteria_present") {
    const records = readStateArray(".kabeeri/acceptance.json", "records").filter((item) => item.task_id === taskItem.id || item.task === taskItem.id);
    return (taskItem.acceptance_criteria || []).length > 0 || records.length > 0 ? pass("Acceptance evidence exists.") : fail("No task acceptance criteria or linked acceptance record.");
  }
  if (check.check_id === "owner_only_final_verify") {
    if (taskItem.status === "owner_verified") return taskItem.verified_by ? pass(`verified_by=${taskItem.verified_by}`) : fail("Task is verified but verified_by is missing.");
    return context.stage === "gate" && !context.actor ? fail("Gate requires an Owner actor for final verification.") : pass("Task is not final-verified yet.");
  }
  if (check.check_id === "output_contract_complete") {
    const sessions = readStateArray(".kabeeri/sessions.json", "sessions").filter((item) => item.task_id === taskItem.id && item.status === "completed");
    const complete = sessions.some((item) =>
      item.summary &&
      (item.files_touched || []).length > 0 &&
      (item.checks_run || []).length > 0 &&
      (item.risks || []).length > 0 &&
      (item.known_limitations || []).length > 0 &&
      item.needs_review &&
      item.next_suggested_task
    );
    return complete ? pass("At least one completed AI session has a complete output contract.") : fail("No completed AI session has the full output contract.");
  }
  if (check.check_id === "access_token_revoked_after_verify") {
    if (taskItem.status !== "owner_verified") return pass("Task is not owner-verified yet.");
    const active = readStateArray(".kabeeri/tokens.json", "tokens").filter((tokenItem) => tokenItem.task_id === taskItem.id && tokenItem.status === "active");
    return active.length === 0 ? pass("No active task tokens remain.") : fail(`${active.length} active token(s) remain after verification.`);
  }
  if (check.check_id === "token_usage_recorded") {
    const events = readUsageEvents().filter((event) => event.task_id === taskItem.id);
    return events.length > 0 ? pass(`${events.length} usage event(s) recorded.`) : fail("No AI usage event is linked to this task.");
  }
  return fail(`Unknown check: ${check.check_id}`);
}

function savePolicyResult(result) {
  const file = ".kabeeri/policies/policy_results.json";
  const data = readJsonFile(file);
  data.results = data.results || [];
  data.results.push(result);
  writeJsonFile(file, data);
}

function applyPolicyOverride(result, flags) {
  if (!flags.reason) throw new Error("Policy override requires --reason.");
  requireOwnerAuthority(flags);
  appendJsonLine(".kabeeri/approvals/approval_log.jsonl", {
    approval_id: `policy-override-${Date.now()}`,
    type: "policy_override",
    policy_id: result.policy_id,
    subject_id: result.subject_id,
    reason: flags.reason,
    approved_by: getOwnerActor(flags),
    approved_at: new Date().toISOString(),
    blockers: result.blockers.map((item) => item.check_id)
  });
  appendAudit("policy.override", "policy", result.policy_id, `Policy override for ${result.subject_id}: ${flags.reason}`);
}

function buildPolicyReport(results) {
  const latest = [...results].reverse();
  const lines = [
    "# Kabeeri Policy Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Results: ${results.length}`,
    `- Blocked: ${results.filter((item) => item.status === "blocked").length}`,
    `- Warning: ${results.filter((item) => item.status === "warning").length}`,
    `- Pass: ${results.filter((item) => item.status === "pass").length}`,
    "",
    "## Recent Results",
    "",
    "| Time | Policy | Subject | Stage | Status | Blockers |",
    "| --- | --- | --- | --- | --- | --- |"
  ];
  for (const item of latest.slice(0, 30)) {
    lines.push(`| ${item.evaluated_at} | ${item.policy_id} | ${item.subject_id} | ${item.stage} | ${item.status} | ${(item.blockers || []).map((blocker) => blocker.check_id).join(", ") || "-"} |`);
  }
  return `${lines.join("\n")}\n`;
}

function deliveryMode(action, value, flags = {}, rest = []) {
  const verb = String(action || "recommend").toLowerCase();
  const known = new Set(["recommend", "advise", "advisor", "choose", "select", "decision", "history", "list", "show"]);
  const effective = known.has(verb) ? verb : "recommend";
  const description = flags.text || flags.description || flags.app || flags.project || (known.has(verb) ? [value, ...rest].filter(Boolean).join(" ") : [action, value, ...rest].filter(Boolean).join(" "));

  if (effective === "history" || effective === "list") {
    ensureWorkspace();
    const data = readDeliveryDecisionState();
    console.log(table(["ID", "Recommended", "Confidence", "Chosen", "Created"], (data.recommendations || []).map((item) => [item.recommendation_id, item.recommended_mode, item.confidence, item.chosen_mode || "", item.created_at])));
    return;
  }

  if (effective === "show") {
    ensureWorkspace();
    const data = readDeliveryDecisionState();
    const id = value || flags.id;
    const found = (data.recommendations || []).find((item) => item.recommendation_id === id);
    if (!found) throw new Error(`Delivery recommendation not found: ${id || ""}`);
    console.log(JSON.stringify(found, null, 2));
    return;
  }

  if (effective === "choose" || effective === "select" || effective === "decision") {
    ensureWorkspace();
    const mode = normalizeDeliveryMode(flags.mode || value || "structured");
    const data = readDeliveryDecisionState();
    const recommendationId = flags.recommendation || flags.id || null;
    const recommendation = recommendationId ? (data.recommendations || []).find((item) => item.recommendation_id === recommendationId) : null;
    const decision = {
      decision_id: `delivery-decision-${String((data.decisions || []).length + 1).padStart(3, "0")}`,
      recommendation_id: recommendationId,
      chosen_mode: mode,
      recommended_mode: recommendation ? recommendation.recommended_mode : null,
      reason: flags.reason || "",
      actor: getEffectiveActor(flags) || "local-cli",
      decided_at: new Date().toISOString()
    };
    data.decisions = data.decisions || [];
    data.decisions.push(decision);
    data.current_mode = mode;
    if (recommendation) {
      recommendation.chosen_mode = mode;
      recommendation.decision_id = decision.decision_id;
    }
    writeJsonFile(".kabeeri/delivery_decisions.json", data);
    updateProjectDeliveryMode(mode);
    appendAudit("delivery.mode_selected", "delivery", decision.decision_id, `Delivery mode selected: ${mode}`);
    console.log(JSON.stringify(decision, null, 2));
    return;
  }

  if (!description) throw new Error("Missing project/application description for delivery recommendation.");
  const recommendation = buildDeliveryModeRecommendation(description, flags);
  if (fileExists(".kabeeri")) {
    const data = readDeliveryDecisionState();
    data.recommendations = data.recommendations || [];
    data.recommendations.push(recommendation);
    writeJsonFile(".kabeeri/delivery_decisions.json", data);
    appendAudit("delivery.mode_recommended", "delivery", recommendation.recommendation_id, `Delivery mode recommended: ${recommendation.recommended_mode}`);
  }
  if (flags.json) console.log(JSON.stringify(recommendation, null, 2));
  else console.log(renderDeliveryModeRecommendation(recommendation));
}

function readDeliveryDecisionState() {
  if (!fileExists(".kabeeri/delivery_decisions.json")) writeJsonFile(".kabeeri/delivery_decisions.json", { recommendations: [], decisions: [], current_mode: null });
  const data = readJsonFile(".kabeeri/delivery_decisions.json");
  data.recommendations = data.recommendations || [];
  data.decisions = data.decisions || [];
  return data;
}

function buildDeliveryModeRecommendation(description, flags = {}) {
  const text = String(description || "").toLowerCase();
  const signals = [];
  let structuredScore = 0;
  let agileScore = 0;
  const add = (mode, weight, signal, evidence) => {
    if (mode === "structured") structuredScore += weight;
    else agileScore += weight;
    signals.push({ mode, weight, signal, evidence });
  };
  const match = (pattern) => pattern.test(text);
  if (match(/health|medical|hospital|clinic|finance|bank|payment|government|gov|insurance|erp|enterprise|multi-tenant|tenant|compliance|regulatory|audit|security|sso|roles|permissions|marketplace|large|complex|migration|integration|integrations|known scope|fixed scope|waterfall|structured|مستشفى|طبي|صحي|بنك|مالي|حكومي|امتثال|تدقيق|أمان|صلاحيات|متعدد|كبير|معقد|نطاق ثابت|متجر كبير/)) add("structured", 4, "complex_or_compliance_scope", "Large, regulated, integrated, or fixed-scope wording was detected.");
  if (match(/exact|clear requirements|complete spec|documentation|upfront|phase|milestone|handoff|client approval|اعتماد|متطلبات واضحة|توثيق|مراحل|مرحلة|تسليم|موافقة العميل/)) add("structured", 3, "upfront_planning_needed", "The request suggests approved documentation, phases, or formal handoff.");
  if (match(/mvp|prototype|startup|experiment|validate|feedback|iterate|pivot|quick|fast|2 weeks|4 weeks|social|fitness|landing|simple|dashboard|uncertain|idea|rough|agile|sprint|تجربة|ناشئ|فكرة|غير واضح|تغذية راجعة|سريع|بروتوتايب|تطبيق بسيط|داشبورد بسيط/)) add("agile", 4, "learning_or_mvp_scope", "The request suggests uncertainty, MVP speed, feedback, or iteration.");
  if (match(/limited budget|small team|solo|founder|learn|users will tell|budget-conscious|ميزانية محدودة|فريق صغير|مطور واحد|نتعلم|المستخدمين/)) add("agile", 2, "budget_or_small_team", "The request suggests smaller increments and budget-conscious delivery.");
  if (flags.compliance || flags.enterprise) add("structured", 4, "explicit_flag", "Compliance or enterprise flag was provided.");
  if (flags.mvp || flags.experimental) add("agile", 4, "explicit_flag", "MVP or experimental flag was provided.");
  if (!signals.length) {
    add("structured", 1, "safe_default", "When unclear, Structured is safer for complete planning.");
    add("agile", 1, "possible_if_uncertain", "Agile remains viable if discovery and feedback are more important.");
  }
  const recommendedMode = structuredScore >= agileScore ? "structured" : "agile";
  const total = structuredScore + agileScore || 1;
  const margin = Math.abs(structuredScore - agileScore);
  const confidence = margin >= 4 ? "high" : margin >= 2 ? "medium" : "low";
  return {
    recommendation_id: `delivery-recommendation-${Date.now()}`,
    created_at: new Date().toISOString(),
    description,
    recommended_mode: recommendedMode,
    confidence,
    scores: {
      structured: structuredScore,
      agile: agileScore,
      structured_percent: Math.round((structuredScore / total) * 100),
      agile_percent: Math.round((agileScore / total) * 100)
    },
    signals,
    rationale: recommendedMode === "structured" ? "Structured is recommended because the app appears to benefit from approved requirements, phase gates, traceability, and controlled changes." : "Agile is recommended because the app appears to benefit from fast iteration, feedback, smaller stories, and learning before full scope commitment.",
    developer_decision_required: true,
    next_actions: recommendedMode === "structured" ? ["Run `kvdf delivery choose structured` if the developer agrees.", "Create approved requirements with `kvdf structured requirement add`.", "Plan phases and gates before implementation."] : ["Run `kvdf delivery choose agile` if the developer agrees.", "Create epics/stories with `kvdf agile story create`.", "Plan the first sprint after Definition of Ready is satisfied."]
  };
}

function renderDeliveryModeRecommendation(recommendation) {
  const lines = ["# Kabeeri Delivery Mode Recommendation", "", `Recommended mode: ${recommendation.recommended_mode}`, `Confidence: ${recommendation.confidence}`, `Structured score: ${recommendation.scores.structured}`, `Agile score: ${recommendation.scores.agile}`, "", "## Rationale", "", recommendation.rationale, "", "## Signals", ""];
  for (const signal of recommendation.signals) lines.push(`- ${signal.mode}: ${signal.signal} (${signal.weight}) - ${signal.evidence}`);
  lines.push("", "## Developer Decision", "", "The developer/Owner still chooses the final mode. This recommendation is advisory.", "", "## Next Actions", "");
  for (const action of recommendation.next_actions) lines.push(`- ${action}`);
  return `${lines.join("\n")}\n`;
}

function normalizeDeliveryMode(mode) {
  const normalized = String(mode || "").toLowerCase();
  if (["structured", "waterfall"].includes(normalized)) return "structured";
  if (["agile", "scrum"].includes(normalized)) return "agile";
  throw new Error("Invalid delivery mode. Use structured or agile.");
}

function updateProjectDeliveryMode(mode) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  project.delivery_mode = mode;
  project.delivery_mode_updated_at = new Date().toISOString();
  writeJsonFile(".kabeeri/project.json", project);
}

function structured(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureStructuredState();
  const section = String(action || "summary").toLowerCase();
  const rawCommand = value || "";
  const command = String(rawCommand).toLowerCase();

  if (["summary", "status", "health", "state"].includes(section)) {
    const state = refreshStructuredDashboardState();
    if (flags.json || section === "state") console.log(JSON.stringify(state, null, 2));
    else console.log(renderStructuredHealth(state));
    return;
  }
  if (["requirement", "requirements", "req"].includes(section)) return structuredRequirement(command || "list", rest[0], flags);
  if (["phase", "phases"].includes(section)) return structuredPhase(command || "list", rest[0], flags);
  if (["milestone", "milestones"].includes(section)) return structuredMilestone(command || "list", rest[0], flags);
  if (["deliverable", "deliverables"].includes(section)) return structuredDeliverable(command || "list", rest[0], flags);
  if (["change", "changes", "change-request"].includes(section)) return structuredChange(command || "list", rest[0], flags);
  if (["risk", "risks"].includes(section)) return structuredRisk(command || "list", rest[0], flags);
  if (["gate", "gates"].includes(section)) return structuredGate(command || "list", rest[0], flags);
  if (section === "task" || section === "convert") return structuredRequirementTask(rawCommand, flags);

  throw new Error(`Unknown structured section: ${section}`);
}

function ensureStructuredState() {
  if (!fileExists(".kabeeri/structured.json")) {
    writeJsonFile(".kabeeri/structured.json", { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] });
  }
}

function readStructuredState() {
  ensureStructuredState();
  const data = readJsonFile(".kabeeri/structured.json");
  data.requirements = data.requirements || [];
  data.phases = data.phases || [];
  data.milestones = data.milestones || [];
  data.deliverables = data.deliverables || [];
  data.approvals = data.approvals || [];
  data.change_requests = data.change_requests || [];
  data.risks = data.risks || [];
  data.gates = data.gates || [];
  return data;
}

function writeStructuredState(data) {
  writeJsonFile(".kabeeri/structured.json", {
    requirements: data.requirements || [],
    phases: data.phases || [],
    milestones: data.milestones || [],
    deliverables: data.deliverables || [],
    approvals: data.approvals || [],
    change_requests: data.change_requests || [],
    risks: data.risks || [],
    gates: data.gates || []
  });
  refreshStructuredDashboardState(data);
}

function structuredRequirement(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Requirement", "Type", "Priority", "Status", "Phase", "Owner", "Title"], data.requirements.map((item) => [item.requirement_id, item.type, item.priority, item.status, item.phase_id || "", item.owner_id || "", item.title])));
    return;
  }
  if (action === "show") {
    console.log(JSON.stringify(findStructuredRequirement(data, id || flags.id), null, 2));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured requirement");
    const item = {
      requirement_id: flags.id || id || `REQ-${String(data.requirements.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled requirement",
      type: flags.type || "functional",
      priority: flags.priority || "medium",
      status: flags.status || "draft",
      source: flags.source || "manual",
      phase_id: flags.phase || null,
      owner_id: flags.owner || null,
      workstreams: parseCsv(flags.workstreams || flags.workstream),
      app_usernames: parseCsv(flags.apps || flags.app || flags["app-username"]),
      description: flags.description || "",
      acceptance_criteria: parseCsv(flags.acceptance || flags.criteria),
      non_functional_requirements: parseCsv(flags.nfr || flags["non-functional"]),
      dependencies: parseCsv(flags.dependencies),
      risks: parseCsv(flags.risks),
      task_ids: parseCsv(flags.tasks),
      approval_status: "pending",
      created_at: new Date().toISOString()
    };
    if (data.requirements.some((entry) => entry.requirement_id === item.requirement_id)) throw new Error(`Requirement already exists: ${item.requirement_id}`);
    data.requirements.push(item);
    writeStructuredState(data);
    appendAudit("structured.requirement_created", "requirement", item.requirement_id, `Requirement created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured requirement");
    const item = findStructuredRequirement(data, id || flags.id);
    item.approval_status = "approved";
    item.status = flags.status || "approved";
    item.approved_by = getEffectiveActor(flags) || flags.owner || "local-cli";
    item.approved_at = new Date().toISOString();
    addStructuredApproval(data, "requirement", item.requirement_id, item.approved_by, flags.reason || "Requirement approved.");
    writeStructuredState(data);
    appendAudit("structured.requirement_approved", "requirement", item.requirement_id, `Requirement approved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured requirement action: ${action}`);
}

function structuredPhase(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Phase", "Status", "Requirements", "Tasks", "Gate", "Title"], data.phases.map((item) => [item.phase_id, item.status, (item.requirement_ids || []).length, (item.task_ids || []).length, item.gate_status || "", item.title])));
    return;
  }
  if (action === "show") {
    console.log(JSON.stringify(findStructuredPhase(data, id || flags.id), null, 2));
    return;
  }
  if (action === "plan" || action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "plan structured phase");
    const phaseId = flags.id || id || `phase-${String(data.phases.length + 1).padStart(3, "0")}`;
    const requirementIds = parseCsv(flags.requirements || flags.reqs);
    const requirements = requirementIds.map((reqId) => findStructuredRequirement(data, reqId));
    const unapproved = requirements.filter((item) => item.approval_status !== "approved");
    if (unapproved.length && !flags.force) throw new Error(`Phase contains unapproved requirements: ${unapproved.map((item) => item.requirement_id).join(", ")}`);
    const phase = {
      phase_id: phaseId,
      title: flags.title || phaseId,
      objective: flags.objective || flags.goal || "",
      status: "planned",
      requirement_ids: requirementIds,
      task_ids: parseCsv(flags.tasks),
      deliverable_ids: parseCsv(flags.deliverables),
      entry_criteria: parseCsv(flags.entry || flags["entry-criteria"]),
      exit_criteria: parseCsv(flags.exit || flags["exit-criteria"]),
      owner_id: flags.owner || null,
      start_date: flags.start || null,
      end_date: flags.end || null,
      gate_status: "pending",
      risks: parseCsv(flags.risks),
      dependencies: parseCsv(flags.dependencies),
      created_at: new Date().toISOString()
    };
    if (data.phases.some((item) => item.phase_id === phase.phase_id)) throw new Error(`Phase already exists: ${phase.phase_id}`);
    data.phases.push(phase);
    for (const req of requirements) req.phase_id = phase.phase_id;
    writeStructuredState(data);
    appendAudit("structured.phase_planned", "phase", phase.phase_id, `Structured phase planned: ${phase.title}`);
    console.log(JSON.stringify(phase, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured phase");
    const phase = findStructuredPhase(data, id || flags.id);
    phase.status = "approved";
    phase.approved_by = getEffectiveActor(flags) || "local-cli";
    phase.approved_at = new Date().toISOString();
    addStructuredApproval(data, "phase", phase.phase_id, phase.approved_by, flags.reason || "Phase approved.");
    writeStructuredState(data);
    appendAudit("structured.phase_approved", "phase", phase.phase_id, `Structured phase approved: ${phase.title}`);
    console.log(JSON.stringify(phase, null, 2));
    return;
  }
  if (action === "complete") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "complete structured phase");
    const phase = findStructuredPhase(data, id || flags.id);
    const gate = evaluateStructuredPhaseGate(data, phase, flags);
    data.gates.push(gate);
    if (gate.status === "blocked" && !flags.force) {
      writeStructuredState(data);
      throw new Error(`Structured phase gate blocked: ${gate.blockers.map((item) => item.check_id).join(", ")}`);
    }
    phase.status = "completed";
    phase.gate_status = gate.status;
    phase.completed_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit("structured.phase_completed", "phase", phase.phase_id, `Structured phase completed: ${phase.title}`);
    console.log(JSON.stringify({ phase, gate }, null, 2));
    return;
  }
  throw new Error(`Unknown structured phase action: ${action}`);
}

function structuredMilestone(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Milestone", "Phase", "Status", "Due", "Title"], data.milestones.map((item) => [item.milestone_id, item.phase_id || "", item.status, item.due_date || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured milestone");
    const item = { milestone_id: flags.id || id || `milestone-${String(data.milestones.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled milestone", phase_id: flags.phase || null, status: flags.status || "planned", due_date: flags.due || null, exit_criteria: parseCsv(flags.exit || flags["exit-criteria"]), created_at: new Date().toISOString() };
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.milestones.push(item);
    writeStructuredState(data);
    appendAudit("structured.milestone_created", "milestone", item.milestone_id, `Milestone created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured milestone action: ${action}`);
}

function structuredDeliverable(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Deliverable", "Phase", "Status", "Owner", "Title"], data.deliverables.map((item) => [item.deliverable_id, item.phase_id || "", item.status, item.owner_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured deliverable");
    const item = { deliverable_id: flags.id || id || `deliverable-${String(data.deliverables.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled deliverable", phase_id: flags.phase || null, type: flags.type || "document", status: flags.status || "draft", owner_id: flags.owner || null, acceptance_criteria: parseCsv(flags.acceptance || flags.criteria), evidence: parseCsv(flags.evidence), created_at: new Date().toISOString() };
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.deliverables.push(item);
    writeStructuredState(data);
    appendAudit("structured.deliverable_created", "deliverable", item.deliverable_id, `Deliverable created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve structured deliverable");
    const item = data.deliverables.find((entry) => entry.deliverable_id === (id || flags.id));
    if (!item) throw new Error(`Deliverable not found: ${id || flags.id || ""}`);
    item.status = "approved";
    item.approved_by = getEffectiveActor(flags) || "local-cli";
    item.approved_at = new Date().toISOString();
    addStructuredApproval(data, "deliverable", item.deliverable_id, item.approved_by, flags.reason || "Deliverable approved.");
    writeStructuredState(data);
    appendAudit("structured.deliverable_approved", "deliverable", item.deliverable_id, `Deliverable approved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured deliverable action: ${action}`);
}

function structuredChange(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Change", "Impact", "Status", "Requirement", "Title"], data.change_requests.map((item) => [item.change_id, item.impact, item.status, item.requirement_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create structured change request");
    const item = { change_id: flags.id || id || `change-${String(data.change_requests.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled change request", requirement_id: flags.requirement || flags.req || null, phase_id: flags.phase || null, impact: flags.impact || "medium", status: "proposed", reason: flags.reason || "", scope_delta: parseCsv(flags.scope || flags["scope-delta"]), decision: null, created_at: new Date().toISOString() };
    if (item.requirement_id) findStructuredRequirement(data, item.requirement_id);
    if (item.phase_id) findStructuredPhase(data, item.phase_id);
    data.change_requests.push(item);
    writeStructuredState(data);
    appendAudit("structured.change_created", "change", item.change_id, `Change request created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "approve" || action === "reject") {
    requireAnyRole(flags, ["Owner", "Maintainer"], `${action} structured change request`);
    const item = data.change_requests.find((entry) => entry.change_id === (id || flags.id));
    if (!item) throw new Error(`Change request not found: ${id || flags.id || ""}`);
    item.status = action === "approve" ? "approved" : "rejected";
    item.decision = flags.reason || item.status;
    item.decided_by = getEffectiveActor(flags) || "local-cli";
    item.decided_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit(`structured.change_${item.status}`, "change", item.change_id, `Change request ${item.status}: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured change action: ${action}`);
}

function structuredRisk(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Risk", "Severity", "Status", "Owner", "Title"], data.risks.map((item) => [item.risk_id, item.severity, item.status, item.owner_id || "", item.title])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "create structured risk");
    const item = { risk_id: flags.id || id || `risk-${String(data.risks.length + 1).padStart(3, "0")}`, title: flags.title || "Untitled risk", severity: normalizeStructuredSeverity(flags.severity || "medium"), status: "open", owner_id: flags.owner || null, mitigation: flags.mitigation || "", phase_id: flags.phase || null, requirement_id: flags.requirement || flags.req || null, created_at: new Date().toISOString() };
    data.risks.push(item);
    writeStructuredState(data);
    appendAudit("structured.risk_created", "risk", item.risk_id, `Risk created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (["mitigate", "close", "resolve"].includes(action)) {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "mitigate structured risk");
    const item = data.risks.find((entry) => entry.risk_id === (id || flags.id));
    if (!item) throw new Error(`Risk not found: ${id || flags.id || ""}`);
    item.status = "mitigated";
    item.mitigation = flags.mitigation || flags.reason || item.mitigation || "";
    item.mitigated_at = new Date().toISOString();
    writeStructuredState(data);
    appendAudit("structured.risk_mitigated", "risk", item.risk_id, `Risk mitigated: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown structured risk action: ${action}`);
}

function structuredGate(action, id, flags = {}) {
  const data = readStructuredState();
  if (action === "list") {
    console.log(table(["Gate", "Phase", "Status", "Blockers", "Generated"], data.gates.map((item) => [item.gate_id, item.phase_id, item.status, (item.blockers || []).length, item.generated_at])));
    return;
  }
  if (action === "check") {
    const phase = findStructuredPhase(data, id || flags.phase || flags.id);
    const gate = evaluateStructuredPhaseGate(data, phase, flags);
    data.gates.push(gate);
    phase.gate_status = gate.status;
    writeStructuredState(data);
    appendAudit("structured.gate_checked", "phase", phase.phase_id, `Structured gate checked: ${gate.status}`);
    console.log(JSON.stringify(gate, null, 2));
    return;
  }
  throw new Error(`Unknown structured gate action: ${action}`);
}

function structuredRequirementTask(requirementId, flags = {}) {
  const data = readStructuredState();
  const requirement = findStructuredRequirement(data, flags.requirement || flags.req || requirementId);
  if (requirement.approval_status !== "approved" && !flags.force) throw new Error(`Requirement is not approved: ${requirement.requirement_id}`);
  const tasksFile = ".kabeeri/tasks.json";
  const taskData = readJsonFile(tasksFile);
  taskData.tasks = taskData.tasks || [];
  const taskId = flags.task || `task-${String(taskData.tasks.length + 1).padStart(3, "0")}`;
  if (taskData.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = parseCsv(flags.workstreams || flags.workstream || (requirement.workstreams || []).join(",") || "unassigned");
  const appRefs = parseCsv(flags.apps || flags.app || (requirement.app_usernames || []).join(","));
  const appLinks = resolveTaskApps(appRefs);
  validateTaskBoundaryCreation(flags.type || "structured_requirement", workstreams, appLinks);
  const taskItem = { id: taskId, title: flags.title || requirement.title, status: "proposed", type: flags.type || "structured_requirement", workstream: workstreams[0] || "unassigned", workstreams, app_username: appLinks[0] ? appLinks[0].username : null, app_usernames: appLinks.map((appItem) => appItem.username), app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean), source: "structured_requirement", source_reference: `requirement:${requirement.requirement_id}`, requirement_id: requirement.requirement_id, phase_id: requirement.phase_id || null, acceptance_criteria: requirement.acceptance_criteria || [], created_at: new Date().toISOString() };
  taskData.tasks.push(taskItem);
  writeJsonFile(tasksFile, taskData);
  requirement.task_ids = uniqueList([...(requirement.task_ids || []), taskId]);
  writeStructuredState(data);
  appendAudit("structured.requirement_converted", "task", taskId, `Requirement converted to task: ${requirement.requirement_id}`);
  console.log(JSON.stringify(taskItem, null, 2));
}

function findStructuredRequirement(data, id) {
  if (!id) throw new Error("Missing requirement id.");
  const item = data.requirements.find((entry) => entry.requirement_id === id);
  if (!item) throw new Error(`Requirement not found: ${id}`);
  return item;
}

function findStructuredPhase(data, id) {
  if (!id) throw new Error("Missing phase id.");
  const item = data.phases.find((entry) => entry.phase_id === id);
  if (!item) throw new Error(`Phase not found: ${id}`);
  return item;
}

function addStructuredApproval(data, subjectType, subjectId, actor, reason) {
  data.approvals.push({ approval_id: `structured-approval-${String(data.approvals.length + 1).padStart(3, "0")}`, subject_type: subjectType, subject_id: subjectId, actor, reason, approved_at: new Date().toISOString() });
}

function evaluateStructuredPhaseGate(data, phase, flags = {}) {
  const blockers = [];
  const warnings = [];
  const add = (target, check_id, message) => target.push({ check_id, message });
  const phaseRequirements = (phase.requirement_ids || []).map((reqId) => findStructuredRequirement(data, reqId));
  if (!phase.objective) add(warnings, "phase_objective_missing", "Structured phase should have a clear objective.");
  if (!phaseRequirements.length) add(blockers, "phase_requirements_missing", "Structured phase must include requirements.");
  for (const req of phaseRequirements) {
    if (req.approval_status !== "approved") add(blockers, "requirement_not_approved", `Requirement is not approved: ${req.requirement_id}`);
    if (!(req.acceptance_criteria || []).length) add(blockers, "requirement_acceptance_missing", `Requirement has no acceptance criteria: ${req.requirement_id}`);
    if (!(req.task_ids || []).length) add(warnings, "requirement_not_converted", `Requirement has no governed task yet: ${req.requirement_id}`);
  }
  const phaseDeliverables = (data.deliverables || []).filter((item) => item.phase_id === phase.phase_id || (phase.deliverable_ids || []).includes(item.deliverable_id));
  const unapprovedDeliverables = phaseDeliverables.filter((item) => item.status !== "approved");
  if (phaseDeliverables.length && unapprovedDeliverables.length) add(blockers, "deliverables_not_approved", `${unapprovedDeliverables.length} deliverable(s) are not approved.`);
  const openHighRisks = (data.risks || []).filter((item) => item.status === "open" && ["high", "critical"].includes(item.severity) && (!item.phase_id || item.phase_id === phase.phase_id));
  if (openHighRisks.length) add(blockers, "open_high_risks", `${openHighRisks.length} high/critical risk(s) remain open.`);
  const openChanges = (data.change_requests || []).filter((item) => item.status === "proposed" && (!item.phase_id || item.phase_id === phase.phase_id));
  if (openChanges.length) add(warnings, "open_change_requests", `${openChanges.length} change request(s) are still proposed.`);
  return { gate_id: flags.id || `structured-gate-${String((data.gates || []).length + 1).padStart(3, "0")}`, phase_id: phase.phase_id, generated_at: new Date().toISOString(), status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass", blockers, warnings, checks: [{ check_id: "phase_requirements", result: phaseRequirements.length ? "pass" : "fail" }, { check_id: "requirements_approved", result: phaseRequirements.every((req) => req.approval_status === "approved") ? "pass" : "fail" }, { check_id: "acceptance_criteria", result: phaseRequirements.every((req) => (req.acceptance_criteria || []).length) ? "pass" : "fail" }, { check_id: "deliverables_approved", result: unapprovedDeliverables.length ? "fail" : "pass" }, { check_id: "high_risks_mitigated", result: openHighRisks.length ? "fail" : "pass" }] };
}

function refreshStructuredDashboardState(existingData = null) {
  const data = existingData || readStructuredState();
  const tasks = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const approvedRequirements = data.requirements.filter((item) => item.approval_status === "approved");
  const requirementsWithTasks = data.requirements.filter((item) => (item.task_ids || []).length || tasks.some((task) => task.source_reference === `requirement:${item.requirement_id}`));
  const openRisks = data.risks.filter((item) => item.status === "open");
  const blockedGates = data.gates.filter((item) => item.status === "blocked");
  const actionItems = buildStructuredActionItems(data, openRisks, blockedGates, requirementsWithTasks);
  const state = { generated_at: new Date().toISOString(), source: ".kabeeri/structured.json", live_json_path: ".kabeeri/dashboard/structured_state.json", live_api_path: "/__kvdf/api/structured", summary: { requirements: data.requirements.length, approved_requirements: approvedRequirements.length, requirements_with_tasks: requirementsWithTasks.length, phases: data.phases.length, completed_phases: data.phases.filter((item) => item.status === "completed").length, milestones: data.milestones.length, approved_deliverables: data.deliverables.filter((item) => item.status === "approved").length, open_change_requests: data.change_requests.filter((item) => item.status === "proposed").length, open_high_risks: openRisks.filter((item) => ["high", "critical"].includes(item.severity)).length, blocked_gates: blockedGates.length, health: actionItems.some((item) => item.severity === "blocker") ? "blocked" : actionItems.length ? "needs_attention" : "healthy" }, phases: data.phases.map((phase) => ({ phase_id: phase.phase_id, title: phase.title, status: phase.status, gate_status: phase.gate_status || "pending", requirements: (phase.requirement_ids || []).length, tasks: (phase.task_ids || []).length })), traceability: { requirements_total: data.requirements.length, approved_requirements: approvedRequirements.length, requirements_with_tasks: requirementsWithTasks.length, orphan_tasks: tasks.filter((task) => task.source === "structured_requirement" && !data.requirements.some((req) => `requirement:${req.requirement_id}` === task.source_reference)).map((task) => task.id) }, gates: data.gates.slice(-10), risks: openRisks, change_requests: data.change_requests.filter((item) => item.status === "proposed"), action_items: actionItems };
  if (fileExists(".kabeeri/dashboard")) writeJsonFile(".kabeeri/dashboard/structured_state.json", state);
  return state;
}

function buildStructuredActionItems(data, openRisks, blockedGates, requirementsWithTasks) {
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const unapprovedRequirements = data.requirements.filter((item) => item.approval_status !== "approved");
  if (unapprovedRequirements.length) add("warning", "requirements", `${unapprovedRequirements.length} requirement(s) are not approved.`, "Run `kvdf structured requirement approve <id>` after review.");
  const noAcceptance = data.requirements.filter((item) => !(item.acceptance_criteria || []).length);
  if (noAcceptance.length) add("blocker", "requirements", `${noAcceptance.length} requirement(s) lack acceptance criteria.`, "Add measurable acceptance criteria before planning phases.");
  const unconverted = data.requirements.filter((item) => item.approval_status === "approved" && !requirementsWithTasks.includes(item));
  if (unconverted.length) add("info", "traceability", `${unconverted.length} approved requirement(s) have no governed task.`, "Run `kvdf structured task <requirement-id>` for implementation work.");
  const severeRisks = openRisks.filter((item) => ["high", "critical"].includes(item.severity));
  if (severeRisks.length) add("blocker", "risks", `${severeRisks.length} high/critical risk(s) are open.`, "Mitigate risks before phase closure or release.");
  if (blockedGates.length) add("blocker", "gates", `${blockedGates.length} structured gate(s) are blocked.`, "Run `kvdf structured gate check <phase-id>` and resolve blockers.");
  const proposedChanges = data.change_requests.filter((item) => item.status === "proposed");
  if (proposedChanges.length) add("warning", "change_control", `${proposedChanges.length} change request(s) need a decision.`, "Approve, reject, or defer change requests before scope closure.");
  return items;
}

function renderStructuredHealth(state) {
  const lines = ["# Kabeeri Structured Delivery Health", "", `Generated at: ${state.generated_at}`, `Health: ${state.summary.health}`, `Live JSON: ${state.live_json_path}`, "", "## Summary", ""];
  for (const [key, value] of Object.entries(state.summary || {})) lines.push(`- ${key}: ${value}`);
  lines.push("", "## Action Items", "");
  if (!(state.action_items || []).length) lines.push("- None.");
  for (const item of state.action_items || []) lines.push(`- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`);
  return `${lines.join("\n")}\n`;
}

function normalizeStructuredSeverity(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid structured severity. Use low, medium, high, or critical.");
  return normalized;
}

function agile(action, value, flags = {}, rest = []) {
  ensureWorkspace();
  ensureAgileState();
  const section = String(action || "summary").toLowerCase();
  const command = String(value || "").toLowerCase();

  if (section === "summary" || section === "status" || section === "list") {
    const result = refreshAgileDashboardState();
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(table(["Metric", "Value"], Object.entries(result.summary || {}).map(([key, val]) => [key, typeof val === "object" ? JSON.stringify(val) : val])));
    return;
  }

  if (section === "health" || section === "dashboard" || section === "state") {
    const result = refreshAgileDashboardState();
    if (flags.json || section === "state") console.log(JSON.stringify(result, null, 2));
    else console.log(renderAgileHealth(result));
    return;
  }

  if (section === "forecast") {
    const result = refreshAgileDashboardState();
    console.log(JSON.stringify(result.forecast || {}, null, 2));
    return;
  }

  if (section === "backlog") return agileBacklog(command || "list", rest[0], flags);
  if (section === "epic" || section === "epics") return agileEpic(command || "list", rest[0], flags);
  if (section === "story" || section === "stories") return agileStory(command || "list", rest[0], flags);
  if (section === "sprint") return agileSprint(command || "plan", rest[0], flags);
  if (section === "impediment" || section === "impediments") return agileImpediment(command || "list", rest[0], flags);
  if (section === "retro" || section === "retrospective" || section === "retrospectives") return agileRetrospective(command || "list", rest[0], flags);

  throw new Error(`Unknown agile section: ${section}`);
}

function ensureAgileState() {
  if (!fileExists(".kabeeri/agile.json")) {
    writeJsonFile(".kabeeri/agile.json", { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] });
  }
}

function readAgileState() {
  ensureAgileState();
  const data = readJsonFile(".kabeeri/agile.json");
  data.backlog = data.backlog || [];
  data.epics = data.epics || [];
  data.stories = data.stories || [];
  data.sprint_reviews = data.sprint_reviews || [];
  data.impediments = data.impediments || [];
  data.retrospectives = data.retrospectives || [];
  data.releases = data.releases || [];
  return data;
}

function writeAgileState(data) {
  writeJsonFile(".kabeeri/agile.json", {
    backlog: data.backlog || [],
    epics: data.epics || [],
    stories: data.stories || [],
    sprint_reviews: data.sprint_reviews || [],
    impediments: data.impediments || [],
    retrospectives: data.retrospectives || [],
    releases: data.releases || []
  });
  refreshAgileDashboardState(data);
}

function agileBacklog(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["ID", "Type", "Priority", "Status", "Title", "Source"], data.backlog.map((item) => [item.id, item.type, item.priority, item.status, item.title, item.source])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile backlog item");
    const item = {
      id: flags.id || id || `BL-${String(data.backlog.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled backlog item",
      type: flags.type || "story",
      priority: flags.priority || "medium",
      source: flags.source || "manual",
      status: flags.status || "proposed",
      notes: flags.notes || "",
      created_at: new Date().toISOString()
    };
    if (data.backlog.some((entry) => entry.id === item.id)) throw new Error(`Backlog item already exists: ${item.id}`);
    data.backlog.push(item);
    writeAgileState(data);
    appendAudit("agile.backlog_created", "backlog", item.id, `Backlog item created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile backlog action: ${action}`);
}

function agileEpic(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Epic", "Priority", "Status", "Stories", "Title"], data.epics.map((item) => [item.epic_id, item.priority, item.status, (item.story_ids || []).length, item.title])));
    return;
  }
  if (action === "show") {
    const epic = data.epics.find((item) => item.epic_id === (id || flags.id));
    if (!epic) throw new Error(`Epic not found: ${id || flags.id || ""}`);
    console.log(JSON.stringify(epic, null, 2));
    return;
  }
  if (action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile epic");
    const epic = {
      epic_id: flags.id || id || `epic-${String(data.epics.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled epic",
      business_goal: flags.goal || flags["business-goal"] || "",
      target_users: parseCsv(flags.users || flags["target-users"]),
      source: flags.source || "manual",
      priority: flags.priority || "medium",
      story_ids: parseCsv(flags.stories),
      acceptance_summary: flags.acceptance || "",
      out_of_scope: parseCsv(flags["out-of-scope"]),
      risks: parseCsv(flags.risks),
      target_release: flags.release || null,
      status: flags.status || "proposed",
      created_at: new Date().toISOString()
    };
    if (data.epics.some((item) => item.epic_id === epic.epic_id)) throw new Error(`Epic already exists: ${epic.epic_id}`);
    data.epics.push(epic);
    ensureBacklogItem(data, { id: epic.epic_id, title: epic.title, type: "epic", priority: epic.priority, source: epic.source, status: "proposed" });
    writeAgileState(data);
    appendAudit("agile.epic_created", "epic", epic.epic_id, `Epic created: ${epic.title}`);
    console.log(JSON.stringify(epic, null, 2));
    return;
  }
  throw new Error(`Unknown agile epic action: ${action}`);
}

function agileStory(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Story", "Epic", "Sprint", "Points", "Ready", "Status", "Title"], data.stories.map((item) => [item.story_id, item.epic_id || "", item.sprint_id || "", item.estimate_points || 0, item.ready_status || "not_ready", item.status, item.title])));
    return;
  }
  if (action === "show") {
    const story = findAgileStory(data, id || flags.id);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "create" || action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create agile story");
    const story = {
      story_id: flags.id || id || `story-${String(data.stories.length + 1).padStart(3, "0")}`,
      epic_id: flags.epic || null,
      title: flags.title || "Untitled story",
      user_role: flags.role || "user",
      want: flags.want || "",
      value: flags.value || "",
      story_text: flags.text || buildStoryText(flags.role || "user", flags.want || "", flags.value || ""),
      source: flags.source || "manual",
      priority: flags.priority || "medium",
      estimate_points: Number(flags.points || flags.estimate || 0),
      workstream: flags.workstream || "unassigned",
      sprint_id: flags.sprint || null,
      assignee_id: flags.assignee || null,
      reviewer_id: flags.reviewer || null,
      acceptance_criteria: parseCsv(flags.acceptance || flags.criteria),
      dependencies: parseCsv(flags.dependencies),
      risks: parseCsv(flags.risks),
      non_functional_requirements: parseCsv(flags.nfr || flags["non-functional"]),
      test_notes: flags.tests || flags["test-notes"] || "",
      tasks: parseCsv(flags.tasks),
      task_id: flags.task || null,
      definition_of_ready: {},
      definition_of_done: {},
      ready_status: "not_ready",
      status: flags.status || "backlog",
      created_at: new Date().toISOString()
    };
    story.definition_of_ready = computeStoryReady(story);
    story.ready_status = storyReadyStatus(story.definition_of_ready);
    if (data.stories.some((item) => item.story_id === story.story_id)) throw new Error(`Story already exists: ${story.story_id}`);
    if (story.epic_id && !data.epics.some((item) => item.epic_id === story.epic_id)) throw new Error(`Epic not found: ${story.epic_id}`);
    data.stories.push(story);
    if (story.epic_id) {
      const epic = data.epics.find((item) => item.epic_id === story.epic_id);
      epic.story_ids = uniqueList([...(epic.story_ids || []), story.story_id]);
    }
    ensureBacklogItem(data, { id: story.story_id, title: story.title, type: "story", priority: story.priority, source: story.source, status: story.status });
    writeAgileState(data);
    appendAudit("agile.story_created", "story", story.story_id, `Story created: ${story.title}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "ready") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "mark agile story ready");
    const story = findAgileStory(data, id || flags.id);
    if (flags.reviewer) story.reviewer_id = flags.reviewer;
    if (flags.acceptance) story.acceptance_criteria = uniqueList([...(story.acceptance_criteria || []), ...parseCsv(flags.acceptance)]);
    if (flags.dependencies) story.dependencies = uniqueList([...(story.dependencies || []), ...parseCsv(flags.dependencies)]);
    if (flags.risks) story.risks = uniqueList([...(story.risks || []), ...parseCsv(flags.risks)]);
    if (flags.nfr || flags["non-functional"]) story.non_functional_requirements = uniqueList([...(story.non_functional_requirements || []), ...parseCsv(flags.nfr || flags["non-functional"])]);
    if (flags.tests || flags["test-notes"]) story.test_notes = flags.tests || flags["test-notes"];
    if (flags.points) story.estimate_points = Number(flags.points);
    story.definition_of_ready = computeStoryReady(story);
    story.ready_status = storyReadyStatus(story.definition_of_ready);
    story.updated_at = new Date().toISOString();
    writeAgileState(data);
    appendAudit("agile.story_ready_checked", "story", story.story_id, `Story ready status: ${story.ready_status}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  if (action === "task" || action === "convert") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "convert agile story to task");
    const story = findAgileStory(data, id || flags.id);
    const taskId = convertAgileStoryToTask(story, flags);
    story.task_id = taskId;
    story.status = story.sprint_id ? "selected_for_sprint" : "backlog";
    story.updated_at = new Date().toISOString();
    writeAgileState(data);
    appendAudit("agile.story_converted", "task", taskId, `Story converted to task: ${story.story_id}`);
    console.log(JSON.stringify(story, null, 2));
    return;
  }
  throw new Error(`Unknown agile story action: ${action}`);
}

function agileSprint(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "plan") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "plan agile sprint");
    const sprintId = flags.id || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const storyIds = parseCsv(flags.stories);
    const stories = storyIds.map((storyId) => findAgileStory(data, storyId));
    const notReady = stories.filter((story) => story.ready_status !== "ready");
    if (notReady.length && !flags.force) throw new Error(`Sprint contains not-ready stories: ${notReady.map((story) => story.story_id).join(", ")}`);
    const blockedByImpediments = stories.filter((story) => hasOpenStoryImpediment(data, story.story_id));
    if (blockedByImpediments.length && !flags.force) throw new Error(`Sprint contains stories with open impediments: ${blockedByImpediments.map((story) => story.story_id).join(", ")}`);
    const capacityPoints = Number(flags["capacity-points"] || flags.capacity || 0);
    const committedPoints = stories.reduce((sum, story) => sum + Number(story.estimate_points || 0), 0);
    if (capacityPoints > 0 && committedPoints > capacityPoints) throw new Error(`Sprint commitment exceeds capacity: ${committedPoints}/${capacityPoints} points`);
    upsertSprintRecord(sprintId, {
      name: flags.name || sprintId,
      goal: flags.goal || "",
      start_date: flags.start || null,
      end_date: flags.end || null,
      capacity_points: capacityPoints,
      capacity_hours: Number(flags["capacity-hours"] || 0),
      token_budget: Number(flags["token-budget"] || 0),
      committed_story_ids: storyIds,
      committed_points: committedPoints,
      planning_confidence: flags.confidence || inferSprintPlanningConfidence(capacityPoints, committedPoints, stories),
      risks: parseCsv(flags.risks),
      dependencies: parseCsv(flags.dependencies),
      scrum_master: flags["scrum-master"] || flags.facilitator || null
    });
    for (const story of stories) {
      story.sprint_id = sprintId;
      story.status = "selected_for_sprint";
      story.updated_at = new Date().toISOString();
    }
    writeAgileState(data);
    appendAudit("agile.sprint_planned", "sprint", sprintId, `Sprint planned with ${storyIds.length} stories`);
    console.log(JSON.stringify({ sprint_id: sprintId, committed_story_ids: storyIds, committed_points: committedPoints, capacity_points: capacityPoints, planning_confidence: flags.confidence || inferSprintPlanningConfidence(capacityPoints, committedPoints, stories) }, null, 2));
    return;
  }
  if (action === "review") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "record agile sprint review");
    const sprintId = flags.id || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const accepted = parseCsv(flags.accepted);
    const rework = parseCsv(flags.rework);
    const review = {
      review_id: flags.review || `sprint-review-${String(data.sprint_reviews.length + 1).padStart(3, "0")}`,
      sprint_id: sprintId,
      review_date: flags.date || new Date().toISOString(),
      goal_met: flags["goal-met"] || "partial",
      accepted_story_ids: accepted,
      rework_story_ids: rework,
      accepted_points: pointsForStories(data, accepted),
      rework_points: pointsForStories(data, rework),
      token_cost: Number(flags.cost || 0),
      reviewer: flags.reviewer || null,
      owner_decision: flags.decision || "reviewed",
      feedback: flags.feedback || "",
      next_backlog_changes: parseCsv(flags.next || flags["next-backlog"]),
      demo_notes: flags.demo || "",
      stakeholder_feedback: parseCsv(flags["stakeholder-feedback"]),
      action_items: parseCsv(flags.actions || flags["action-items"])
    };
    data.sprint_reviews.push(review);
    for (const story of data.stories) {
      if (accepted.includes(story.story_id)) story.status = "accepted";
      if (rework.includes(story.story_id)) story.status = "needs_rework";
    }
    updateSprintStatus(sprintId, review.goal_met === "yes" ? "reviewed" : "reviewed_with_followup");
    writeAgileState(data);
    appendAudit("agile.sprint_reviewed", "sprint", sprintId, `Sprint review recorded`);
    console.log(JSON.stringify(review, null, 2));
    return;
  }
  throw new Error(`Unknown agile sprint action: ${action}`);
}

function agileImpediment(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Impediment", "Severity", "Status", "Sprint", "Story", "Owner", "Title"], data.impediments.map((item) => [
      item.impediment_id,
      item.severity,
      item.status,
      item.sprint_id || "",
      item.story_id || "",
      item.owner_id || "",
      item.title
    ])));
    return;
  }
  if (action === "add" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "create agile impediment");
    const item = {
      impediment_id: flags.id || id || `impediment-${String(data.impediments.length + 1).padStart(3, "0")}`,
      title: flags.title || "Untitled impediment",
      description: flags.description || flags.notes || "",
      severity: normalizeAgileSeverity(flags.severity || "medium"),
      status: "open",
      sprint_id: flags.sprint || null,
      story_id: flags.story || null,
      owner_id: flags.owner || null,
      target_resolution: flags.target || flags["target-resolution"] || null,
      created_at: new Date().toISOString()
    };
    if (item.story_id) findAgileStory(data, item.story_id);
    if (data.impediments.some((entry) => entry.impediment_id === item.impediment_id)) throw new Error(`Impediment already exists: ${item.impediment_id}`);
    data.impediments.push(item);
    if (item.story_id) {
      const story = findAgileStory(data, item.story_id);
      story.status = "blocked";
      story.updated_at = new Date().toISOString();
    }
    writeAgileState(data);
    appendAudit("agile.impediment_created", "impediment", item.impediment_id, `Impediment created: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (action === "resolve" || action === "close") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Developer"], "resolve agile impediment");
    const item = data.impediments.find((entry) => entry.impediment_id === (id || flags.id));
    if (!item) throw new Error(`Impediment not found: ${id || flags.id || ""}`);
    item.status = "resolved";
    item.resolution = flags.resolution || flags.notes || "";
    item.resolved_at = new Date().toISOString();
    if (item.story_id) {
      const story = data.stories.find((entry) => entry.story_id === item.story_id);
      if (story && !hasOpenStoryImpediment(data, story.story_id, item.impediment_id)) {
        story.status = story.sprint_id ? "selected_for_sprint" : "backlog";
        story.updated_at = new Date().toISOString();
      }
    }
    writeAgileState(data);
    appendAudit("agile.impediment_resolved", "impediment", item.impediment_id, `Impediment resolved: ${item.title}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile impediment action: ${action}`);
}

function agileRetrospective(action, id, flags = {}) {
  const data = readAgileState();
  if (action === "list") {
    console.log(table(["Retro", "Sprint", "Decision", "Actions", "Date"], data.retrospectives.map((item) => [
      item.retro_id,
      item.sprint_id,
      item.decision || "",
      (item.action_items || []).length,
      item.recorded_at
    ])));
    return;
  }
  if (action === "add" || action === "record" || action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "record agile retrospective");
    const sprintId = flags.sprint || id;
    if (!sprintId) throw new Error("Missing sprint id.");
    const item = {
      retro_id: flags.id || `retro-${String(data.retrospectives.length + 1).padStart(3, "0")}`,
      sprint_id: sprintId,
      recorded_at: flags.date || new Date().toISOString(),
      went_well: parseCsv(flags.good || flags["went-well"]),
      improve: parseCsv(flags.improve || flags["to-improve"]),
      action_items: parseCsv(flags.actions || flags["action-items"]),
      decision: flags.decision || "continue",
      facilitator: flags.facilitator || flags["scrum-master"] || null
    };
    data.retrospectives.push(item);
    writeAgileState(data);
    appendAudit("agile.retrospective_recorded", "sprint", sprintId, `Retrospective recorded: ${item.retro_id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  throw new Error(`Unknown agile retrospective action: ${action}`);
}

function ensureBacklogItem(data, item) {
  if (data.backlog.some((entry) => entry.id === item.id)) return;
  data.backlog.push({
    id: item.id,
    title: item.title,
    type: item.type,
    priority: item.priority || "medium",
    source: item.source || "manual",
    status: item.status || "proposed",
    notes: "",
    created_at: new Date().toISOString()
  });
}

function findAgileStory(data, storyId) {
  if (!storyId) throw new Error("Missing story id.");
  const story = data.stories.find((item) => item.story_id === storyId);
  if (!story) throw new Error(`Story not found: ${storyId}`);
  return story;
}

function buildStoryText(role, want, value) {
  return `As a ${role}, I want to ${want || "[action]"}, so that ${value || "[value]"}.`;
}

function computeStoryReady(story) {
  return {
    source: Boolean(story.source),
    acceptance_criteria: (story.acceptance_criteria || []).length > 0,
    estimate: Number(story.estimate_points || 0) > 0,
    reviewer: Boolean(story.reviewer_id),
    test_notes: Boolean(story.test_notes || (story.definition_of_done && story.definition_of_done.tests_defined)),
    value: Boolean(story.value || story.business_value)
  };
}

function storyReadyStatus(ready) {
  return Object.values(ready).every(Boolean) ? "ready" : "not_ready";
}

function convertAgileStoryToTask(story, flags = {}) {
  if (story.task_id && !flags.force) return story.task_id;
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const taskId = flags.task || `task-${String(data.tasks.length + 1).padStart(3, "0")}`;
  if (data.tasks.some((item) => item.id === taskId)) throw new Error(`Task already exists: ${taskId}`);
  const workstreams = parseCsv(flags.workstreams || flags.workstream || story.workstream || "unassigned");
  const appRefs = parseCsv(flags.apps || flags.app || flags["app-username"]);
  const appLinks = resolveTaskApps(appRefs);
  validateTaskBoundaryCreation(flags.type || "story", workstreams, appLinks);
  const taskItem = {
    id: taskId,
    title: flags.title || story.title,
    status: "proposed",
    type: flags.type || "story",
    workstream: workstreams[0] || "unassigned",
    workstreams,
    app_username: appLinks[0] ? appLinks[0].username : null,
    app_usernames: appLinks.map((appItem) => appItem.username),
    app_paths: appLinks.map((appItem) => appItem.path).filter(Boolean),
    sprint_id: flags.sprint || story.sprint_id || null,
    source: "user_story",
    source_reference: `story:${story.story_id}`,
    story_id: story.story_id,
    epic_id: story.epic_id || null,
    acceptance_criteria: story.acceptance_criteria || [],
    created_at: new Date().toISOString()
  };
  data.tasks.push(taskItem);
  writeJsonFile(tasksFile, data);
  return taskId;
}

function upsertSprintRecord(sprintId, fields) {
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];
  let sprintItem = data.sprints.find((item) => item.id === sprintId);
  if (!sprintItem) {
    sprintItem = { id: sprintId, name: fields.name || sprintId, status: "planned", created_at: new Date().toISOString() };
    data.sprints.push(sprintItem);
  }
  Object.assign(sprintItem, fields, { updated_at: new Date().toISOString() });
  writeJsonFile(file, data);
}

function updateSprintStatus(sprintId, status) {
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];
  const sprintItem = data.sprints.find((item) => item.id === sprintId);
  if (sprintItem) {
    sprintItem.status = status;
    sprintItem.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
  }
}

function pointsForStories(data, storyIds) {
  return storyIds.reduce((sum, storyId) => {
    const story = data.stories.find((item) => item.story_id === storyId);
    return sum + Number(story ? story.estimate_points || 0 : 0);
  }, 0);
}

function refreshAgileDashboardState(existingData = null) {
  const data = existingData || readAgileState();
  const sprints = fileExists(".kabeeri/sprints.json") ? readJsonFile(".kabeeri/sprints.json").sprints || [] : [];
  const reviews = data.sprint_reviews || [];
  const activeSprints = sprints.filter((item) => ["planned", "active", "in_progress"].includes(item.status || "planned"));
  const openImpediments = (data.impediments || []).filter((item) => item.status !== "resolved");
  const acceptedReviews = reviews.filter((item) => Number(item.accepted_points || 0) > 0 || Number(item.rework_points || 0) > 0);
  const lastFive = acceptedReviews.slice(-5);
  const averageVelocity = lastFive.length
    ? Math.round((lastFive.reduce((sum, item) => sum + Number(item.accepted_points || 0), 0) / lastFive.length) * 10) / 10
    : 0;
  const remainingPoints = (data.stories || [])
    .filter((item) => !["accepted", "deferred"].includes(item.status || "backlog"))
    .reduce((sum, item) => sum + Number(item.estimate_points || 0), 0);
  const actionItems = buildAgileActionItems(data, activeSprints, openImpediments, averageVelocity);
  const state = {
    generated_at: new Date().toISOString(),
    source: ".kabeeri/agile.json",
    live_json_path: ".kabeeri/dashboard/agile_state.json",
    live_api_path: "/__kvdf/api/agile",
    summary: {
      backlog_items: data.backlog.length,
      epics: data.epics.length,
      stories: data.stories.length,
      ready_stories: data.stories.filter((item) => item.ready_status === "ready").length,
      not_ready_stories: data.stories.filter((item) => item.ready_status !== "ready").length,
      committed_stories: data.stories.filter((item) => item.status === "selected_for_sprint").length,
      sprint_reviews: reviews.length,
      open_impediments: openImpediments.length,
      retrospectives: (data.retrospectives || []).length,
      health: actionItems.some((item) => item.severity === "blocker") ? "blocked" : actionItems.length ? "needs_attention" : "healthy"
    },
    active_sprints: activeSprints.map((sprintItem) => ({
      id: sprintItem.id,
      goal: sprintItem.goal || "",
      status: sprintItem.status || "planned",
      committed_points: Number(sprintItem.committed_points || 0),
      capacity_points: Number(sprintItem.capacity_points || 0),
      planning_confidence: sprintItem.planning_confidence || ""
    })),
    velocity: {
      average_last_5_sprints: averageVelocity,
      reviewed_sprints: acceptedReviews.length,
      latest_accepted_points: acceptedReviews.length ? Number(acceptedReviews[acceptedReviews.length - 1].accepted_points || 0) : 0
    },
    forecast: {
      remaining_points: remainingPoints,
      average_velocity: averageVelocity,
      estimated_sprints_remaining: averageVelocity > 0 ? Math.ceil(remainingPoints / averageVelocity) : null
    },
    impediments: openImpediments,
    retrospectives: (data.retrospectives || []).slice(-5),
    action_items: actionItems
  };
  if (fileExists(".kabeeri/dashboard")) writeJsonFile(".kabeeri/dashboard/agile_state.json", state);
  return state;
}

function buildAgileActionItems(data, activeSprints, openImpediments, averageVelocity) {
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const notReady = (data.stories || []).filter((item) => item.ready_status !== "ready" && !["accepted", "deferred"].includes(item.status || "backlog"));
  if (notReady.length) add("warning", "readiness", `${notReady.length} stor(ies) are not Definition-of-Ready compliant.`, "Run `kvdf agile story ready <story-id>` after adding acceptance, points, reviewer, value, and test notes.");
  const readyUnconverted = (data.stories || []).filter((item) => item.ready_status === "ready" && !item.task_id);
  if (readyUnconverted.length) add("info", "task_conversion", `${readyUnconverted.length} ready stor(ies) are not governed tasks yet.`, "Run `kvdf agile story task <story-id>` before execution.");
  const severeImpediments = openImpediments.filter((item) => ["high", "critical"].includes(item.severity));
  if (severeImpediments.length) add("blocker", "impediments", `${severeImpediments.length} high/critical impediment(s) are open.`, "Resolve or explicitly re-plan the affected sprint/story.");
  for (const sprintItem of activeSprints) {
    if (!sprintItem.goal) add("warning", "sprint_goal", `Sprint ${sprintItem.id} has no sprint goal.`, "Add `--goal` during sprint planning.");
    if (Number(sprintItem.capacity_points || 0) && Number(sprintItem.committed_points || 0) > Number(sprintItem.capacity_points || 0) * 0.9) {
      add("warning", "capacity", `Sprint ${sprintItem.id} is committed above 90% of point capacity.`, "Review capacity buffer for bugs, review, and unplanned support.");
    }
  }
  if ((data.sprint_reviews || []).length >= 2 && averageVelocity === 0) add("warning", "velocity", "Reviewed sprints have zero accepted velocity.", "Review acceptance criteria, story slicing, and sprint commitment quality.");
  return items;
}

function renderAgileHealth(state) {
  const lines = [
    "# Kabeeri Agile Health",
    "",
    `Generated at: ${state.generated_at}`,
    `Health: ${state.summary.health}`,
    `Live JSON: ${state.live_json_path}`,
    "",
    "## Summary",
    ""
  ];
  for (const [key, value] of Object.entries(state.summary || {})) lines.push(`- ${key}: ${value}`);
  lines.push("", "## Forecast", "", `- remaining_points: ${state.forecast.remaining_points}`, `- average_velocity: ${state.forecast.average_velocity}`, `- estimated_sprints_remaining: ${state.forecast.estimated_sprints_remaining === null ? "unknown" : state.forecast.estimated_sprints_remaining}`);
  lines.push("", "## Action Items", "");
  if (!(state.action_items || []).length) lines.push("- None.");
  for (const item of state.action_items || []) lines.push(`- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`);
  return `${lines.join("\n")}\n`;
}

function hasOpenStoryImpediment(data, storyId, exceptId = null) {
  return (data.impediments || []).some((item) => item.story_id === storyId && item.impediment_id !== exceptId && item.status !== "resolved");
}

function inferSprintPlanningConfidence(capacityPoints, committedPoints, stories) {
  if (!capacityPoints) return "unknown";
  if (committedPoints > capacityPoints) return "overcommitted";
  if (committedPoints > capacityPoints * 0.9) return "low";
  if (stories.some((story) => story.ready_status !== "ready")) return "low";
  return "good";
}

function normalizeAgileSeverity(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid agile severity. Use low, medium, high, or critical.");
  return normalized;
}

function sprint(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/sprints.json";
  const data = readJsonFile(file);
  data.sprints = data.sprints || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Status", "Start", "End"], data.sprints.map((item) => [
      item.id,
      item.name,
      item.status,
      item.start_date || "",
      item.end_date || ""
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create sprint");
    const id = flags.id || value || `sprint-${String(data.sprints.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      name: flags.name || id,
      status: flags.status || "planned",
      start_date: flags.start || null,
      end_date: flags.end || null,
      goal: flags.goal || "",
      created_at: new Date().toISOString()
    };
    data.sprints.push(item);
    writeJsonFile(file, data);
    appendAudit("sprint.created", "sprint", id, `Sprint created: ${item.name}`);
    console.log(`Created sprint ${id}`);
    return;
  }

  if (action === "summary") {
    const sprintId = flags.id || value;
    if (!sprintId) throw new Error("Missing sprint id.");
    console.log(JSON.stringify(buildSprintSummary(sprintId), null, 2));
    return;
  }

  throw new Error(`Unknown sprint action: ${action}`);
}

function session(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Task", "Developer", "Status", "Model"], data.sessions.map((item) => [
      item.session_id,
      item.task_id,
      item.developer_id,
      item.status,
      `${item.provider || ""}/${item.model || ""}`
    ])));
    return;
  }

  if (action === "start") {
    const taskId = flags.task || value;
    const developerId = flags.developer || flags.assignee;
    if (!taskId) throw new Error("Missing --task.");
    if (!developerId) throw new Error("Missing --developer.");
    if (flags.actor && flags.actor !== developerId) throw new Error("Actor must match session developer.");
    const taskItem = getTaskById(taskId);
    if (taskItem) {
      requireTaskExecutor({ ...flags, actor: developerId }, taskItem);
      if (hasConfiguredIdentities()) assertTaskCanStart(taskItem);
    } else if (hasConfiguredIdentities()) {
      throw new Error(`Task not found: ${taskId}`);
    }
    const token = findActiveTaskToken(taskId, developerId);
    if (!token) throw new Error("Active task token required to start AI session.");
    if (isExpired(token.expires_at)) throw new Error(`Task access token expired: ${token.token_id}`);
    const item = {
      session_id: flags.id || `session-${String(data.sessions.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      sprint_id: getTaskSprint(taskId),
      developer_id: developerId,
      token_id: token ? token.token_id : null,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      status: "active",
      started_at: new Date().toISOString(),
      files_touched: []
    };
    data.sessions.push(item);
    writeJsonFile(file, data);
    appendAudit("ai_session.started", "session", item.session_id, `AI session started for ${taskId}`);
    console.log(`Started session ${item.session_id}`);
    return;
  }

  if (action === "end") {
    const sessionId = flags.id || value;
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    if (flags.actor && flags.actor !== item.developer_id) throw new Error("Only the session developer can end this session.");
    const inputTokens = Number(flags["input-tokens"] || 0);
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const calculated = calculateUsageCost({
      provider: item.provider || flags.provider || "unknown",
      model: item.model || flags.model || "unknown",
      inputTokens,
      outputTokens,
      cachedTokens
    });
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.input_tokens = inputTokens;
    item.output_tokens = outputTokens;
    item.cached_tokens = cachedTokens;
    item.total_tokens = inputTokens + outputTokens + cachedTokens;
    item.cost = flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost;
    item.cost_source = flags.cost !== undefined ? "manual" : calculated.source;
    item.files_touched = parseCsv(flags.files);
    enforceSessionAppBoundary(item);
    enforceTokenFileScope(item);
    enforceSessionLockCoverage(item);
    enforceSessionWorkstreamBoundary(item);
    item.summary = flags.summary || "";
    item.checks_run = parseCsv(flags.checks);
    item.risks = parseCsv(flags.risks);
    item.known_limitations = parseCsv(flags.limitations);
    item.needs_review = flags["needs-review"] || "";
    item.next_suggested_task = flags.next || "";
    writeJsonFile(file, data);
    appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", {
      event_id: `usage-${Date.now()}`,
      timestamp: item.ended_at,
      session_id: item.session_id,
      task_id: item.task_id,
      sprint_id: item.sprint_id || getTaskSprint(item.task_id),
      developer_id: item.developer_id,
      workstream: flags.workstream || "untracked",
      provider: item.provider,
      model: item.model,
      input_tokens: item.input_tokens,
      output_tokens: item.output_tokens,
      cached_tokens: item.cached_tokens,
      total_tokens: item.total_tokens,
      cost: item.cost,
      currency: flags.currency || "USD",
      cost_source: item.cost_source,
      source: "ai_session",
      tracked: flags.tracked !== "false"
    });
    writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summarizeUsage());
    writeTextFile(`.kabeeri/reports/${item.session_id}.handoff.md`, buildSessionHandoff(item));
    appendAudit("ai_session.completed", "session", item.session_id, `AI session completed for ${item.task_id}`);
    console.log(`Completed session ${item.session_id}`);
    return;
  }

  if (action === "show") {
    const sessionId = flags.id || value;
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown session action: ${action}`);
}

function findActiveTaskToken(taskId, developerId) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  return tokens.find((token) => token.task_id === taskId && token.assignee_id === developerId && token.status === "active") || null;
}

function enforceTokenFileScope(sessionItem) {
  const token = sessionItem.token_id ? (readJsonFile(".kabeeri/tokens.json").tokens || []).find((item) => item.token_id === sessionItem.token_id) : null;
  if (!token) return;
  for (const file of sessionItem.files_touched || []) {
    if (matchesAny(file, token.forbidden_files || [])) {
      throw new Error(`File is forbidden by token ${token.token_id}: ${file}`);
    }
    if ((token.allowed_files || []).length > 0 && !matchesAny(file, token.allowed_files)) {
      throw new Error(`File is outside token scope ${token.token_id}: ${file}`);
    }
  }
}

function enforceSessionAppBoundary(sessionItem) {
  const taskItem = getTaskById(sessionItem.task_id);
  if (!taskItem) return;
  const appPaths = getTaskAppPaths(taskItem);
  if (appPaths.length === 0) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  for (const file of files) {
    const target = normalizeLockScope(file);
    if (!appPaths.some((appPath) => pathScopeContains(normalizeLockScope(appPath), target))) {
      throw new Error(`File is outside task app boundary: ${file}`);
    }
  }
}

function enforceSessionWorkstreamBoundary(sessionItem) {
  const taskStreams = getTaskWorkstreamsById(sessionItem.task_id);
  if (taskStreams.length === 0) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  for (const file of files) {
    if (!fileAllowedByWorkstreams(file, taskStreams)) {
      throw new Error(`File is outside task workstream boundary: ${file}`);
    }
  }
}

function fileAllowedByWorkstreams(file, workstreams) {
  const target = normalizeLockScope(file);
  const rules = (workstreams || []).flatMap((stream) => getWorkstreamPathRules(stream));
  if (rules.length === 0) return true;
  return rules.some((rule) => {
    const normalized = normalizeLockScope(rule);
    if (!normalized) return false;
    if (normalized.includes("*")) {
      const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(target);
    }
    return target === normalized || target.startsWith(`${normalized}/`) || target.startsWith(normalized);
  });
}

function getTaskAppPaths(taskItem) {
  const direct = Array.isArray(taskItem.app_paths) ? taskItem.app_paths : [];
  if (direct.length > 0) return direct;
  const appNames = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
  if (appNames.length === 0) return [];
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  return apps
    .filter((appItem) => appNames.includes(appItem.username))
    .map((appItem) => appItem.path)
    .filter(Boolean);
}

function enforceSessionLockCoverage(sessionItem) {
  if (!hasConfiguredIdentities()) return;
  const files = sessionItem.files_touched || [];
  if (files.length === 0) return;
  const locks = readJsonFile(".kabeeri/locks.json").locks || [];
  const activeTaskLocks = locks.filter((lockItem) => lockItem.status === "active" && lockItem.task_id === sessionItem.task_id);
  for (const file of files) {
    if (!activeTaskLocks.some((lockItem) => lockCoversFile(lockItem, file))) {
      throw new Error(`File is not covered by an active task lock: ${file}`);
    }
  }
}

function lockCoversFile(lockItem, file) {
  const type = normalizeLockType(lockItem.type);
  const scope = normalizeLockScope(lockItem.scope);
  const target = normalizeLockScope(file);
  if (type === "file") return scope === target;
  if (type === "folder") return pathScopeContains(scope, target);
  return false;
}

function matchesAny(file, patterns) {
  return (patterns || []).some((pattern) => {
    if (!pattern) return false;
    if (pattern.endsWith("/")) return file.startsWith(pattern);
    if (pattern.includes("*")) {
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`^${escaped}$`).test(file);
    }
    return file === pattern || file.startsWith(`${pattern}/`);
  });
}

function parseCsv(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function buildSessionHandoff(item) {
  const lines = [
    `# AI Session Handoff - ${item.session_id}`,
    "",
    `Task: ${item.task_id}`,
    `Developer: ${item.developer_id}`,
    `Provider/Model: ${item.provider}/${item.model}`,
    `Started: ${item.started_at}`,
    `Ended: ${item.ended_at || ""}`,
    "",
    "## Summary",
    item.summary || "No summary provided.",
    "",
    "## Files Changed",
    ...(item.files_touched || []).map((file) => `- ${file}`),
    "",
    "## Checks Run",
    ...(item.checks_run || []).map((check) => `- ${check}`),
    "",
    "## Risks",
    ...(item.risks || []).map((risk) => `- ${risk}`),
    "",
    "## Known Limitations",
    ...(item.known_limitations || []).map((limitation) => `- ${limitation}`),
    "",
    "## Needs Review",
    item.needs_review || "Not specified.",
    "",
    "## Next Suggested Task",
    item.next_suggested_task || "None.",
    "",
    "## Usage",
    `Input tokens: ${item.input_tokens || 0}`,
    `Output tokens: ${item.output_tokens || 0}`,
    `Cached tokens: ${item.cached_tokens || 0}`,
    `Total tokens: ${item.total_tokens || 0}`,
    `Cost: ${item.cost || 0}`
  ];
  return `${lines.join("\n")}\n`;
}

function assertTaskCanStart(task) {
  if (!task.assignee_id) throw new Error("Task cannot start without assignee.");
  const tokenData = readJsonFile(".kabeeri/tokens.json");
  const token = (tokenData.tokens || []).find((item) => item.task_id === task.id && item.assignee_id === task.assignee_id && item.status === "active");
  if (!token) throw new Error("Task cannot start without active access token for assignee.");
  if (isExpired(token.expires_at)) throw new Error(`Task access token expired: ${token.token_id}`);
  const lockData = readJsonFile(".kabeeri/locks.json");
  const hasLock = (lockData.locks || []).some((item) => item.task_id === task.id && item.status === "active");
  if (!hasLock) throw new Error("Task cannot start without at least one active lock.");
}

function requireAcceptanceForVerify(task) {
  const criteria = task.acceptance_criteria || [];
  if (criteria.length > 0) return;
  if (!fileExists(".kabeeri/acceptance.json")) throw new Error(`Task ${task.id} cannot be verified without acceptance criteria or reviewed acceptance record.`);
  const records = readJsonFile(".kabeeri/acceptance.json").records || [];
  const accepted = records.some((record) => {
    const sameTask = record.task_id === task.id || record.subject_id === task.id;
    const reviewed = ["reviewed", "accepted"].includes(record.status);
    const passed = !record.result || record.result === "pass";
    return sameTask && reviewed && passed;
  });
  if (!accepted) throw new Error(`Task ${task.id} cannot be verified without acceptance criteria or reviewed acceptance record.`);
}

function isExpired(value) {
  return Boolean(value && Date.parse(value) <= Date.now());
}

function acceptance(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/acceptance.json";
  const data = readJsonFile(file);
  data.records = data.records || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Subject", "Status"], data.records.map((item) => [item.id, item.task_id || item.version || item.subject_id || "", item.status || "draft"])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer", "Business Analyst"], "create acceptance");
    const taskId = flags.task || value;
    const type = flags.type || (flags.version ? "release" : "task");
    const issueId = flags.issue || null;
    if (!taskId && !issueId && type !== "release") throw new Error("Missing task id.");
    if (type === "release" && !flags.version) throw new Error("Missing --version for release acceptance.");
    const id = `acceptance-${String(data.records.length + 1).padStart(3, "0")}`;
    data.records.push({
      id,
      type,
      task_id: taskId || null,
      issue_id: issueId,
      version: flags.version || null,
      subject_id: taskId || issueId || flags.version || null,
      status: "draft",
      criteria: flags.criteria ? [flags.criteria] : [],
      created_at: new Date().toISOString()
    });
    writeJsonFile(file, data);
    appendAudit("acceptance.created", "acceptance", id, `Acceptance created for ${taskId || issueId || flags.version}`);
    console.log(`Created acceptance record ${id}`);
    return;
  }

  if (action === "review") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "review acceptance");
    const id = flags.id || value;
    if (!id) throw new Error("Missing acceptance id.");
    const record = data.records.find((item) => item.id === id || item.task_id === id);
    if (!record) throw new Error(`Acceptance record not found: ${id}`);
    record.status = flags.status || (flags.reject ? "rejected" : "reviewed");
    record.result = flags.result || (flags.reject ? "fail" : "pass");
    record.reviewer_id = flags.reviewer || flags.actor || "local-cli";
    record.review_notes = flags.notes || flags.reason || "";
    record.reviewed_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("acceptance.reviewed", "acceptance", record.id, `Acceptance reviewed for ${record.task_id || record.version || record.id}`);
    console.log(`Reviewed acceptance record ${record.id}: ${record.result}`);
    return;
  }

  throw new Error(`Unknown acceptance action: ${action}`);
}

function audit(action, value, flags = {}) {
  ensureWorkspace();
  const events = readAuditEvents();

  if (!action || action === "list") {
    const limit = flags.limit ? Number(flags.limit) : 20;
    const rows = events.slice(-limit).map((event) => [
      event.event_id || "",
      event.timestamp || "",
      event.event_type || "",
      event.entity_type || "",
      event.entity_id || ""
    ]);
    console.log(table(["Event", "Timestamp", "Type", "Entity", "ID"], rows));
    return;
  }

  if (action === "report") {
    const entityId = flags.task || flags.entity || value || null;
    const filtered = entityId ? events.filter((event) => event.entity_id === entityId || event.metadata && event.metadata.task_id === entityId) : events;
    const lines = buildAuditReport(filtered, entityId);
    return outputLines(lines, flags.output);
  }

  throw new Error(`Unknown audit action: ${action}`);
}

function readAuditEvents() {
  const fs = require("fs");
  const path = require("path");
  const file = path.join(repoRoot(), ".kabeeri", "audit_log.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function buildAuditReport(events, entityId) {
  const lines = [
    `# Kabeeri Audit Report${entityId ? ` - ${entityId}` : ""}`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Events: ${events.length}`,
    "",
    "## Event Timeline"
  ];
  if (events.length === 0) {
    lines.push("", "No audit events found.");
    return lines;
  }
  for (const event of events) {
    lines.push(
      "",
      `- ${event.timestamp || ""} ${event.event_type || ""}`,
      `  Entity: ${event.entity_type || ""}/${event.entity_id || ""}`,
      `  Actor: ${event.actor_id || ""} (${event.actor_role || ""})`,
      `  Summary: ${event.summary || ""}`
    );
  }
  return lines;
}

function memory(action, value, flags = {}) {
  ensureWorkspace();
  if (!action || action === "summary") {
    const summary = buildMemorySummary();
    writeJsonFile(".kabeeri/memory/memory_summary.json", summary);
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (action === "list") {
    const type = normalizeMemoryType(flags.type || value || "decision");
    const rows = readJsonLines(memoryFileForType(type)).map((item) => [
      item.memory_id,
      item.type,
      item.status,
      item.text
    ]);
    console.log(table(["ID", "Type", "Status", "Text"], rows));
    return;
  }

  if (action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "add project memory");
    const type = normalizeMemoryType(flags.type || value || "decision");
    if (!flags.text) throw new Error("Missing --text.");
    const existing = readJsonLines(memoryFileForType(type));
    const record = {
      memory_id: `${type}-${String(existing.length + 1).padStart(3, "0")}`,
      type,
      text: flags.text,
      source: flags.source || "manual",
      status: flags.status || "active",
      owner: flags.owner || getEffectiveActor(flags) || "local-cli",
      review_date: flags.review || null,
      created_at: new Date().toISOString()
    };
    appendJsonLine(memoryFileForType(type), record);
    writeJsonFile(".kabeeri/memory/memory_summary.json", buildMemorySummary());
    appendAudit("memory.added", "memory", record.memory_id, `Memory added: ${type}`);
    console.log(`Added memory ${record.memory_id}`);
    return;
  }

  throw new Error(`Unknown memory action: ${action}`);
}

function normalizeMemoryType(type) {
  const normalized = String(type || "").toLowerCase().replace(/-/g, "_");
  const aliases = {
    decision: "decisions",
    assumption: "assumptions",
    constraint: "constraints",
    risk: "risks",
    deferred: "deferred_features",
    deferred_feature: "deferred_features"
  };
  const value = aliases[normalized] || normalized;
  if (!["decisions", "assumptions", "constraints", "risks", "deferred_features"].includes(value)) {
    throw new Error("Invalid memory type. Use decision, assumption, constraint, risk, or deferred_feature.");
  }
  return value;
}

function memoryFileForType(type) {
  return `.kabeeri/memory/${normalizeMemoryType(type)}.jsonl`;
}

function buildMemorySummary() {
  const types = ["decisions", "assumptions", "constraints", "risks", "deferred_features"];
  const summary = { generated_at: new Date().toISOString(), totals: {}, open_items: [] };
  for (const type of types) {
    const records = readJsonLines(memoryFileForType(type));
    summary.totals[type] = records.length;
    summary.open_items.push(...records.filter((item) => !["closed", "rejected", "resolved"].includes(item.status)).map((item) => ({
      memory_id: item.memory_id,
      type: item.type,
      status: item.status,
      text: item.text
    })));
  }
  return summary;
}

function adr(action, value, flags = {}) {
  ensureWorkspace();
  ensureDecisionHistoryState();
  const file = ".kabeeri/adr/records.json";
  const data = readJsonFile(file);
  data.adrs = data.adrs || [];

  if (!action || action === "list") {
    const rows = data.adrs.map((item) => [
      item.adr_id,
      item.status,
      item.title,
      (item.related_tasks || []).join(","),
      item.owner || ""
    ]);
    console.log(table(["ADR", "Status", "Title", "Tasks", "Owner"], rows));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    const item = findAdr(data.adrs, id);
    if (!item) throw new Error(`ADR not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create ADR");
    if (!flags.title) throw new Error("Missing --title.");
    if (!flags.context) throw new Error("Missing --context.");
    if (!flags.decision) throw new Error("Missing --decision.");
    const status = normalizeAdrStatus(flags.status || "proposed");
    const taskIds = parseCsv(flags.tasks || flags.task);
    assertKnownTasks(taskIds);
    const aiRunIds = parseCsv(flags["ai-runs"] || flags["ai-run"]);
    assertKnownAiRuns(aiRunIds);
    const id = flags.id || `adr-${String(data.adrs.length + 1).padStart(3, "0")}`;
    if (data.adrs.some((item) => item.adr_id === id)) throw new Error(`ADR already exists: ${id}`);
    const record = {
      adr_id: id,
      title: flags.title,
      status,
      date: flags.date || new Date().toISOString().slice(0, 10),
      owner: flags.owner || getEffectiveActor(flags) || "local-cli",
      context: flags.context,
      options: parseCsv(flags.options),
      decision: flags.decision,
      why: flags.why || "",
      risks: parseCsv(flags.risks || flags.risk),
      consequences: parseCsv(flags.consequences),
      impact: flags.impact || inferAdrImpact(flags),
      related_tasks: taskIds,
      related_ai_runs: aiRunIds,
      related_policies: parseCsv(flags.policies || flags.policy),
      supersedes: flags.supersedes || null,
      approved_by: status === "approved" ? (flags.approvedBy || flags["approved-by"] || flags.owner || getEffectiveActor(flags) || "local-cli") : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };
    data.adrs.push(record);
    if (record.supersedes) markAdrSuperseded(data.adrs, record.supersedes, record.adr_id);
    writeJsonFile(file, data);
    appendJsonLine(".kabeeri/memory/decisions.jsonl", {
      memory_id: `decision-${String(readJsonLines(".kabeeri/memory/decisions.jsonl").length + 1).padStart(3, "0")}`,
      type: "decisions",
      text: `${record.title}: ${record.decision}`,
      source: `adr:${record.adr_id}`,
      status: record.status,
      owner: record.owner,
      links: [record.adr_id, ...record.related_tasks],
      created_at: record.created_at
    });
    writeJsonFile(".kabeeri/memory/memory_summary.json", buildMemorySummary());
    appendAudit("adr.created", "adr", record.adr_id, `ADR created: ${record.title}`);
    console.log(JSON.stringify(record, null, 2));
    return;
  }

  if (["approve", "reject", "supersede"].includes(action)) {
    const id = flags.id || value;
    const item = findAdr(data.adrs, id);
    if (!item) throw new Error(`ADR not found: ${id}`);
    if (action === "approve") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "approve ADR");
      item.status = "approved";
      item.approved_by = flags.owner || getEffectiveActor(flags) || "local-cli";
      item.approved_at = new Date().toISOString();
      if (flags.notes) item.approval_notes = flags.notes;
    } else if (action === "reject") {
      requireAnyRole(flags, ["Owner", "Maintainer"], "reject ADR");
      if (!flags.reason) throw new Error("Missing --reason.");
      item.status = "rejected";
      item.rejection_reason = flags.reason;
      item.rejected_at = new Date().toISOString();
    } else {
      requireAnyRole(flags, ["Owner", "Maintainer"], "supersede ADR");
      if (!flags.by && !flags["superseded-by"]) throw new Error("Missing --by.");
      item.status = "superseded";
      item.superseded_by = flags.by || flags["superseded-by"];
      item.superseded_reason = flags.reason || "";
      item.superseded_at = new Date().toISOString();
    }
    item.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit(`adr.${action}`, "adr", item.adr_id, `ADR ${action}: ${item.title}`);
    console.log(`ADR ${item.adr_id} is now ${item.status}`);
    return;
  }

  if (action === "report") {
    return outputLines(buildAdrReport(data.adrs), flags.output);
  }

  throw new Error(`Unknown ADR action: ${action}`);
}

function aiRun(action, value, flags = {}) {
  ensureWorkspace();
  ensureDecisionHistoryState();

  if (!action || action === "list") {
    const runs = readAiRuns();
    const rows = runs.map((item) => [
      item.run_id,
      item.status || "recorded",
      item.task_id || "",
      item.developer_id || item.agent_id || "",
      `${item.provider || ""}/${item.model || ""}`,
      item.total_tokens || 0
    ]);
    console.log(table(["Run", "Status", "Task", "Developer", "Model", "Tokens"], rows));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    const item = readAiRuns().find((run) => run.run_id === id);
    if (!item) throw new Error(`AI run not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "record") {
    const taskId = flags.task || value || null;
    if (taskId && !getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
    const developerId = flags.developer || flags.agent || flags.actor || "local-ai";
    const inputTokens = Number(flags["input-tokens"] || 0);
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const calculated = calculateUsageCost({
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      inputTokens,
      outputTokens,
      cachedTokens
    });
    const run = {
      run_id: flags.id || `ai-run-${String(readAiRuns().length + 1).padStart(3, "0")}`,
      task_id: taskId,
      sprint_id: flags.sprint || getTaskSprint(taskId),
      developer_id: developerId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      prompt_id: flags.prompt || flags["prompt-id"] || null,
      source_reference: flags.source || "manual",
      workstream: flags.workstream || (taskId ? getTaskWorkstreamsById(taskId)[0] || "untracked" : "untracked"),
      files_changed: parseCsv(flags.files),
      summary: flags.summary || flags.result || "",
      result: flags.result || "recorded",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cached_tokens: cachedTokens,
      total_tokens: inputTokens + outputTokens + cachedTokens,
      cost: flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost,
      currency: flags.currency || getPricingCurrency(),
      cost_source: flags.cost !== undefined ? "manual" : calculated.source,
      status: "recorded",
      started_at: flags.started || new Date().toISOString(),
      ended_at: flags.ended || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    if (readAiRuns().some((item) => item.run_id === run.run_id)) throw new Error(`AI run already exists: ${run.run_id}`);
    appendJsonLine(".kabeeri/ai_runs/prompt_runs.jsonl", run);
    if (run.total_tokens > 0 && flags["record-usage"] !== "false" && flags.usage !== "false") {
      appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", {
        event_id: `usage-${Date.now()}`,
        timestamp: run.ended_at,
        run_id: run.run_id,
        task_id: run.task_id || "untracked",
        sprint_id: run.sprint_id,
        developer_id: run.developer_id,
        workstream: run.workstream,
        provider: run.provider,
        model: run.model,
        input_tokens: run.input_tokens,
        output_tokens: run.output_tokens,
        cached_tokens: run.cached_tokens,
        total_tokens: run.total_tokens,
        cost: run.cost,
        currency: run.currency,
        cost_source: run.cost_source,
        source: "ai_run_history",
        tracked: Boolean(run.task_id)
      });
      writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summarizeUsage());
    }
    appendAudit("ai_run.recorded", "ai_run", run.run_id, `AI run recorded for ${run.task_id || "untracked"}`);
    console.log(JSON.stringify(run, null, 2));
    return;
  }

  if (action === "accept" || action === "reject") {
    const id = flags.id || value;
    const runs = readAiRuns();
    const item = runs.find((run) => run.run_id === id);
    if (!item) throw new Error(`AI run not found: ${id}`);
    if (action === "accept") {
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "accept AI run");
      item.status = "accepted";
      item.accepted_by = flags.reviewer || flags.actor || getEffectiveActor(flags) || "local-cli";
      item.acceptance_evidence = parseCsv(flags.evidence);
      item.review_notes = flags.notes || "";
      item.reviewed_at = new Date().toISOString();
      appendJsonLine(".kabeeri/ai_runs/accepted_runs.jsonl", buildAiRunReviewRecord(item, "accepted"));
    } else {
      requireAnyRole(flags, ["Owner", "Maintainer", "Reviewer"], "reject AI run");
      if (!flags.reason) throw new Error("Missing --reason.");
      item.status = "rejected";
      item.rejected_by = flags.reviewer || flags.actor || getEffectiveActor(flags) || "local-cli";
      item.rejection_reason = flags.reason;
      item.partially_reused = flags.reused === true || flags.reused === "true";
      item.reviewed_at = new Date().toISOString();
      appendJsonLine(".kabeeri/ai_runs/rejected_runs.jsonl", buildAiRunReviewRecord(item, "rejected"));
    }
    writeAiRuns(runs);
    appendAudit(`ai_run.${action}ed`, "ai_run", item.run_id, `AI run ${action}ed`);
    console.log(`AI run ${item.run_id} is now ${item.status}`);
    return;
  }

  if (action === "report" || action === "waste") {
    const report = buildAiRunHistoryReport();
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else return outputLines(buildAiRunReportMarkdown(report), flags.output);
    return;
  }

  throw new Error(`Unknown AI run action: ${action}`);
}

function ensureDecisionHistoryState() {
  const fs = require("fs");
  const path = require("path");
  const root = repoRoot();
  fs.mkdirSync(path.join(root, ".kabeeri", "adr"), { recursive: true });
  fs.mkdirSync(path.join(root, ".kabeeri", "ai_runs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".kabeeri", "memory"), { recursive: true });
  if (!fileExists(".kabeeri/adr/records.json")) writeJsonFile(".kabeeri/adr/records.json", { adrs: [] });
  for (const file of [
    ".kabeeri/ai_runs/prompt_runs.jsonl",
    ".kabeeri/ai_runs/accepted_runs.jsonl",
    ".kabeeri/ai_runs/rejected_runs.jsonl",
    ".kabeeri/memory/decisions.jsonl"
  ]) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, "", "utf8");
  }
}

function normalizeAdrStatus(value) {
  const status = String(value || "proposed").toLowerCase();
  if (!["proposed", "approved", "superseded", "rejected"].includes(status)) {
    throw new Error("Invalid ADR status. Use proposed, approved, superseded, or rejected.");
  }
  return status;
}

function inferAdrImpact(flags) {
  const text = `${flags.title || ""} ${flags.context || ""} ${flags.decision || ""}`.toLowerCase();
  if (/security|auth|migration|database|release|deploy|architecture|payment/.test(text)) return "high";
  return "medium";
}

function findAdr(records, id) {
  if (!id) return null;
  return records.find((item) => item.adr_id === id);
}

function markAdrSuperseded(records, id, byId) {
  const item = findAdr(records, id);
  if (!item) throw new Error(`Superseded ADR not found: ${id}`);
  item.status = "superseded";
  item.superseded_by = byId;
  item.superseded_at = new Date().toISOString();
}

function assertKnownTasks(taskIds) {
  for (const taskId of taskIds || []) {
    if (!getTaskById(taskId)) throw new Error(`Task not found: ${taskId}`);
  }
}

function assertKnownAiRuns(runIds) {
  if (!runIds || runIds.length === 0) return;
  const known = new Set(readAiRuns().map((item) => item.run_id));
  for (const runId of runIds) {
    if (!known.has(runId)) throw new Error(`AI run not found: ${runId}`);
  }
}

function buildAdrReport(records) {
  const byStatus = summarizeBy(records, "status");
  const highImpactOpen = records.filter((item) => ["critical", "high"].includes(item.impact) && item.status === "proposed");
  return [
    "# Kabeeri ADR Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Total ADRs: ${records.length}`,
    "",
    "## Status",
    ...Object.entries(byStatus).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Open High-impact Decisions",
    ...(highImpactOpen.length ? highImpactOpen.map((item) => `- ${item.adr_id}: ${item.title}`) : ["- none"]),
    "",
    "## ADR Index",
    "",
    "| ADR | Status | Impact | Title | Tasks |",
    "| --- | --- | --- | --- | --- |",
    ...(records.length ? records.map((item) => `| ${item.adr_id} | ${item.status} | ${item.impact || ""} | ${item.title} | ${(item.related_tasks || []).join(",")} |`) : ["| none |  |  |  |  |"])
  ];
}

function readAiRuns() {
  return readJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl");
}

function writeAiRuns(runs) {
  writeJsonLines(".kabeeri/ai_runs/prompt_runs.jsonl", runs);
}

function buildAiRunReviewRecord(item, decision) {
  return {
    review_id: `${decision}-${item.run_id}-${Date.now()}`,
    run_id: item.run_id,
    task_id: item.task_id || null,
    decision,
    reviewer_id: item.accepted_by || item.rejected_by || "local-cli",
    reason: item.rejection_reason || null,
    evidence: item.acceptance_evidence || [],
    partially_reused: Boolean(item.partially_reused),
    reviewed_at: item.reviewed_at || new Date().toISOString()
  };
}

function buildAiRunHistoryReport() {
  const runs = readAiRuns();
  const accepted = runs.filter((item) => item.status === "accepted");
  const rejected = runs.filter((item) => item.status === "rejected");
  const unreviewed = runs.filter((item) => !["accepted", "rejected"].includes(item.status));
  const missingTask = runs.filter((item) => !item.task_id || item.task_id === "untracked");
  const missingTokenData = runs.filter((item) => Number(item.total_tokens || 0) === 0);
  const rejectedCost = rejected.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const unreviewedCost = unreviewed.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const wasteSignals = [];
  if (unreviewed.length) wasteSignals.push({ severity: "warning", signal: "unreviewed_runs", count: unreviewed.length, next_action: "Accept or reject AI runs after review." });
  if (missingTask.length) wasteSignals.push({ severity: "warning", signal: "missing_task_links", count: missingTask.length, next_action: "Link runs to governed tasks or mark them untracked intentionally." });
  if (missingTokenData.length) wasteSignals.push({ severity: "info", signal: "missing_token_data", count: missingTokenData.length, next_action: "Record token and cost data for pricing and efficiency reports." });
  if (rejectedCost > 0) wasteSignals.push({ severity: "warning", signal: "rejected_output_cost", count: rejected.length, cost: rejectedCost, next_action: "Review rejected outputs and improve prompts or context packs." });
  return {
    generated_at: new Date().toISOString(),
    totals: {
      runs: runs.length,
      accepted: accepted.length,
      rejected: rejected.length,
      unreviewed: unreviewed.length,
      total_tokens: runs.reduce((sum, item) => sum + Number(item.total_tokens || 0), 0),
      total_cost: runs.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      accepted_cost: accepted.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      rejected_cost: rejectedCost,
      unreviewed_cost: unreviewedCost
    },
    by_task: summarizeAiRunsBy(runs, "task_id"),
    by_developer: summarizeAiRunsBy(runs, "developer_id"),
    waste_signals: wasteSignals,
    unreviewed_run_ids: unreviewed.map((item) => item.run_id)
  };
}

function summarizeAiRunsBy(runs, key) {
  const output = {};
  for (const item of runs) {
    const id = item[key] || "untracked";
    output[id] = output[id] || { runs: 0, accepted: 0, rejected: 0, unreviewed: 0, tokens: 0, cost: 0 };
    output[id].runs += 1;
    output[id].tokens += Number(item.total_tokens || 0);
    output[id].cost += Number(item.cost || 0);
    if (item.status === "accepted") output[id].accepted += 1;
    else if (item.status === "rejected") output[id].rejected += 1;
    else output[id].unreviewed += 1;
  }
  return output;
}

function buildAiRunReportMarkdown(report) {
  return [
    "# Kabeeri AI Run History Report",
    "",
    `Generated at: ${report.generated_at}`,
    `Runs: ${report.totals.runs}`,
    `Accepted: ${report.totals.accepted}`,
    `Rejected: ${report.totals.rejected}`,
    `Unreviewed: ${report.totals.unreviewed}`,
    `Total tokens: ${report.totals.total_tokens}`,
    `Total cost: ${report.totals.total_cost}`,
    "",
    "## Waste Signals",
    "",
    "| Severity | Signal | Count | Next Action |",
    "| --- | --- | ---: | --- |",
    ...(report.waste_signals.length ? report.waste_signals.map((item) => `| ${item.severity} | ${item.signal} | ${item.count || 0} | ${item.next_action} |`) : ["| info | none | 0 | Continue normal review. |"]),
    "",
    "## By Task",
    ...aiRunSummaryRows(report.by_task, "Task"),
    "",
    "## By Developer",
    ...aiRunSummaryRows(report.by_developer, "Developer")
  ];
}

function aiRunSummaryRows(buckets, label) {
  const rows = [`| ${label} | Runs | Accepted | Rejected | Unreviewed | Tokens | Cost |`, "| --- | ---: | ---: | ---: | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.runs || 0} | ${item.accepted || 0} | ${item.rejected || 0} | ${item.unreviewed || 0} | ${item.tokens || 0} | ${item.cost || 0} |`);
  }
  if (rows.length === 2) rows.push(`| none | 0 | 0 | 0 | 0 | 0 | 0 |`);
  return rows;
}

function github(action, value, flags) {
  if (action === "config") {
    return githubConfig(value, flags);
  }
  const subaction = value;
  const version = flags.version || "v4.0.0";
  const plan = findPlan(version);
  const confirmed = Boolean(flags.confirm);

  if (!confirmed || flags["dry-run"]) {
    if (!action || action === "plan") {
      return printGithubDryRun(plan, flags);
    }

    if (action === "label" && (!subaction || subaction === "sync")) {
      return printGithubLabels(plan, flags);
    }

    if (action === "milestone" && (!subaction || subaction === "sync")) {
      return printGithubMilestones(plan, flags);
    }

    if (action === "issue" && (!subaction || subaction === "sync")) {
      return printGithubIssues(plan, flags);
    }

  if (action === "release" && (!subaction || subaction === "prepare")) {
      return release("notes", version, { ...flags, stdout: true });
    }

    throw new Error(`Unknown GitHub dry-run command: github ${action} ${subaction || ""}`.trim());
  }

  if (action === "label" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubLabels(plan);
  }

  if (action === "milestone" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubMilestones(plan);
  }

  if (action === "issue" && (!subaction || subaction === "sync")) {
    runGithubWriteGate(action, subaction, plan, flags);
    return syncGithubIssues(plan);
  }

  if (action === "release" && subaction === "publish") {
    runReleasePublishGates(plan, flags);
    return publishGithubRelease(plan, { ...flags, publishGatesPassed: true });
  }

  throw new Error(`Unknown confirmed GitHub command: github ${action} ${subaction || ""}`.trim());
}

function runGithubWriteGate(action, subaction, plan, flags) {
  ensureWorkspace();
  const operation = `github ${action || "plan"} ${subaction || ""}`.trim();
  return runPolicyGate("github_write", {
    operation,
    version: plan.version,
    confirm: true
  }, flags);
}

function runReleasePublishGates(plan, flags = {}) {
  ensureWorkspace();
  const releaseGate = runPolicyGate("release", {
    version: plan.version,
    confirm: true
  }, flags);
  const githubGate = runGithubWriteGate("release", "publish", plan, flags);
  return { releaseGate, githubGate };
}

function githubConfig(action, flags = {}) {
  ensureWorkspace();
  const file = ".kabeeri/github/sync_config.json";
  const data = fileExists(file) ? readJsonFile(file) : { dry_run_default: true, write_requires_confirmation: true };

  if (!action || action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "set") {
    if (flags.repo) data.repo = flags.repo;
    if (flags.branch) data.branch = flags.branch;
    if (flags["default-version"]) data.default_version = flags["default-version"];
    if (flags.version) data.default_version = flags.version;
    if (flags["dry-run-default"] !== undefined) data.dry_run_default = flags["dry-run-default"] !== "false";
    data.write_requires_confirmation = true;
    data.updated_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("github.config.updated", "github", "sync_config", "GitHub sync config updated");
    console.log("GitHub sync config updated.");
    return;
  }

  throw new Error(`Unknown GitHub config action: ${action}`);
}

function printGithubDryRun(plan, flags) {
  const lines = [
    `GitHub dry-run for ${plan.version}`,
    `Source: ${plan.file}`,
    "",
    `Labels: ${plan.data.labels.length}`,
    `Milestones: ${plan.data.milestones.length}`,
    `Issues: ${countIssues(plan.data)}`,
    "",
    "No remote GitHub changes were made."
  ];
  return outputLines(lines, flags.output);
}

function printGithubLabels(plan, flags) {
  const lines = [
    `GitHub label sync dry-run for ${plan.version}`,
    "",
    ...plan.data.labels.map((label) => `gh label create "${label.name}" --color "${label.color}" --description "${label.description}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubMilestones(plan, flags) {
  const lines = [
    `GitHub milestone sync dry-run for ${plan.version}`,
    "",
    ...plan.data.milestones.map((milestone) => `gh api repos/:owner/:repo/milestones -f title="${milestone.title}" -f description="${milestone.goal}"`)
  ];
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function printGithubIssues(plan, flags) {
  const lines = [`GitHub issue sync dry-run for ${plan.version}`, ""];
  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const labels = (issue.labels || []).join(",");
      lines.push(`gh issue create --title "${escapeShellText(issue.title)}" --milestone "${escapeShellText(milestone.title)}" --label "${escapeShellText(labels)}"`);
    }
  }
  lines.push("", "No remote GitHub changes were made.");
  return outputLines(lines, flags.output);
}

function syncGithubLabels(plan) {
  ensureGhAvailable();
  let created = 0;
  let updated = 0;
  for (const label of plan.data.labels) {
    const create = runGh(["label", "create", label.name, "--color", label.color, "--description", label.description], { allowFailure: true });
    if (create.ok) {
      created += 1;
    } else {
      runGh(["label", "edit", label.name, "--color", label.color, "--description", label.description]);
      updated += 1;
    }
  }
  console.log(`GitHub labels synced for ${plan.version}: ${created} created, ${updated} updated.`);
}

function syncGithubMilestones(plan) {
  ensureGhAvailable();
  const existing = getGithubMilestoneTitles();
  let created = 0;
  let skipped = 0;
  for (const milestone of plan.data.milestones) {
    if (existing.has(milestone.title)) {
      skipped += 1;
      continue;
    }
    runGh(["api", "repos/:owner/:repo/milestones", "-f", `title=${milestone.title}`, "-f", `description=${milestone.goal}`]);
    created += 1;
  }
  console.log(`GitHub milestones synced for ${plan.version}: ${created} created, ${skipped} existing.`);
}

function syncGithubIssues(plan) {
  ensureGhAvailable();
  const issueMap = loadIssueMap();
  let created = 0;
  let skipped = 0;

  for (const milestone of plan.data.milestones) {
    for (const issue of milestone.issues || []) {
      const issueKey = makePlanIssueKey(plan.version, milestone.title, issue.title);
      if (issueMap.items.some((item) => item.issue_key === issueKey && item.issue_number)) {
        skipped += 1;
        continue;
      }
      const labels = (issue.labels || []).join(",");
      const body = buildGithubIssueBody(plan, milestone, issue, issueKey);
      const args = ["issue", "create", "--title", issue.title, "--body", body, "--milestone", milestone.title];
      if (labels) args.push("--label", labels);
      const result = runGh(args);
      const issueNumber = parseIssueNumber(result.stdout);
      issueMap.items.push({
        issue_key: issueKey,
        issue_number: issueNumber,
        title: issue.title,
        milestone: milestone.title,
        labels: issue.labels || [],
        synced_at: new Date().toISOString()
      });
      created += 1;
    }
  }

  saveIssueMap(issueMap);
  console.log(`GitHub issues synced for ${plan.version}: ${created} created, ${skipped} existing.`);
}

function publishGithubRelease(plan, flags) {
  if (!flags.publishGatesPassed) runReleasePublishGates(plan, flags);
  ensureGhAvailable();
  const notesFile = flags.notes || `.kabeeri/releases/${plan.version}.notes.md`;
  writeTextFile(notesFile, `${buildReleaseNotes(plan).join("\n")}\n`);
  runGh(["release", "create", plan.version, "--title", `Kabeeri VDF ${plan.version}`, "--notes-file", notesFile]);
  console.log(`Published GitHub release ${plan.version}.`);
}

function ensureGhAvailable() {
  runGh(["--version"]);
}

function runGh(args, options = {}) {
  const { execFileSync } = require("child_process");
  try {
    const stdout = execFileSync("gh", args, { cwd: repoRoot(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, stdout: stdout.trim() };
  } catch (error) {
    if (options.allowFailure) {
      return { ok: false, stdout: error.stdout ? String(error.stdout) : "", stderr: error.stderr ? String(error.stderr) : error.message };
    }
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`gh ${args.join(" ")} failed: ${stderr}`);
  }
}

function getGithubMilestoneTitles() {
  const result = runGh(["api", "repos/:owner/:repo/milestones", "--paginate", "--jq", ".[].title"]);
  return new Set(result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

function loadIssueMap() {
  if (!fileExists(".kabeeri")) return { items: [], workspace: false };
  const file = ".kabeeri/github/issue_map.json";
  const data = fileExists(file) ? readJsonFile(file) : {};
  return {
    workspace: true,
    tasks: data.tasks || [],
    conflicts: data.conflicts || [],
    items: data.items || []
  };
}

function saveIssueMap(issueMap) {
  if (!issueMap.workspace) return;
  writeJsonFile(".kabeeri/github/issue_map.json", {
    tasks: issueMap.tasks || [],
    conflicts: issueMap.conflicts || [],
    items: issueMap.items || []
  });
}

function makePlanIssueKey(version, milestoneTitle, issueTitle) {
  return `${version}:${milestoneTitle}:${issueTitle}`;
}

function buildGithubIssueBody(plan, milestone, issue, issueKey) {
  return [
    "<!-- kabeeri-task-sync -->",
    `Plan: ${plan.version}`,
    `Issue key: ${issueKey}`,
    `Milestone goal: ${milestone.goal}`,
    "",
    "Labels:",
    ...(issue.labels || []).map((label) => `- ${label}`),
    "",
    "Generated by Kabeeri VDF CLI."
  ].join("\n");
}

function parseIssueNumber(output) {
  const match = String(output || "").match(/\/issues\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function release(action, value, flags) {
  const version = flags.version || value || "v4.0.0";
  const plan = findPlan(version);

  if (!action || action === "check") {
    const validation = validateRepository("all");
    const lines = [
      `Release check for ${plan.version}`,
      `Source: ${plan.file}`,
      `Milestones: ${plan.data.milestones.length}/${plan.data.totals.milestones}`,
      `Issues: ${countIssues(plan.data)}/${plan.data.totals.issues}`,
      `Validation: ${validation.ok ? "OK" : "FAILED"}`,
      "",
      "## Validation",
      ...validation.lines,
      "",
      `Status: ${validation.ok ? "ready for release review" : "blocked by validation failures"}`
    ];
    if (flags.strict && !validation.ok) process.exitCode = 1;
    return outputLines(lines, flags.output);
  }

  if (action === "checklist") {
    return outputLines(buildReleaseChecklist(plan), flags.output);
  }

  if (action === "notes") {
    return outputLines(buildReleaseNotes(plan), flags.output);
  }

  if (action === "scenario" || action === "scenario-review") {
    return outputLines(buildScenarioReview(plan), flags.output);
  }

  if (action === "gate") {
    const result = runPolicyGate("release", { version: plan.version, confirm: true }, flags);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "publish-gate" || action === "publish-gates") {
    const result = runReleasePublishGates(plan, flags);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "publish") {
    if (!flags.confirm) {
      const lines = [
        `Release publish dry-run for ${plan.version}`,
        `Would run: gh release create ${plan.version} --title "Kabeeri VDF ${plan.version}" --notes-file <generated-notes>`,
        "",
        "No remote GitHub changes were made. Add --confirm to publish."
      ];
      return outputLines(lines, flags.output);
    }
    return publishGithubRelease(plan, flags);
  }

  throw new Error(`Unknown release action: ${action}`);
}

function productPackage(action, value, flags = {}) {
  const selected = action || "check";
  if (selected === "check" || selected === "status") {
    const report = buildPackageCheck();
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    const lines = renderPackageCheck(report);
    return outputLines(lines, flags.output);
  }
  if (selected === "guide") {
    return outputLines(readGuideLines("docs/production/PACKAGING_GUIDE.md"), flags.output);
  }
  throw new Error(`Unknown package action: ${selected}`);
}

function upgrade(action, value, flags = {}) {
  const selected = action || "guide";
  if (selected === "guide") {
    return outputLines(readGuideLines("docs/production/UPGRADE_GUIDE.md"), flags.output);
  }
  if (selected === "check" || selected === "status") {
    const report = buildUpgradeCheck();
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    return outputLines(renderUpgradeCheck(report), flags.output);
  }
  throw new Error(`Unknown upgrade action: ${selected}`);
}

function buildPackageCheck() {
  const packageData = readJsonFile("package.json");
  const requiredFiles = [
    "bin/kvdf.js",
    "src/cli/index.js",
    "src/cli/workspace.js",
    "src/cli/validate.js",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "docs/production/PACKAGING_GUIDE.md",
    "docs/production/UPGRADE_GUIDE.md"
  ];
  const requiredPackageFields = ["name", "version", "description", "license", "bin", "files"];
  const checks = [];
  const add = (id, ok, detail) => checks.push({ check_id: id, status: ok ? "pass" : "fail", detail });
  for (const field of requiredPackageFields) add(`package_field_${field}`, packageData[field] !== undefined, `${field} ${packageData[field] === undefined ? "missing" : "present"}`);
  add("bin_kvdf_configured", packageData.bin && packageData.bin.kvdf === "bin/kvdf.js", "bin.kvdf should point to bin/kvdf.js");
  add("node_engine_declared", packageData.engines && packageData.engines.node, "Node engine should be declared");
  add("pack_check_script", packageData.scripts && packageData.scripts["pack:check"], "npm run pack:check should exist");
  for (const file of requiredFiles) add(`file_${file.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`, fileExists(file), `${file} ${fileExists(file) ? "present" : "missing"}`);
  const fileList = packageData.files || [];
  for (const folder of ["bin/", "src/", "knowledge/", "packs/", "integrations/", "schemas/", "docs/", "cli/"]) {
    add(`package_files_${folder.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`, fileList.includes(folder), `${folder} ${fileList.includes(folder) ? "included" : "missing from package files"}`);
  }
  const blockers = checks.filter((item) => item.status === "fail");
  return {
    report_type: "package_check",
    generated_at: new Date().toISOString(),
    package: {
      name: packageData.name,
      version: packageData.version,
      bin: packageData.bin || {},
      files_count: fileList.length
    },
    status: blockers.length ? "blocked" : "ready",
    blockers,
    checks
  };
}

function buildUpgradeCheck() {
  const compatibility = fileExists(".kabeeri/version_compatibility.json") ? readJsonFile(".kabeeri/version_compatibility.json") : null;
  const migrationState = fileExists(".kabeeri/migration_state.json") ? readJsonFile(".kabeeri/migration_state.json") : null;
  const workspaceVersion = compatibility && (compatibility.current_engine_version || compatibility.created_with_version);
  const migrationRequired = workspaceVersion ? compareSemver(workspaceVersion, VERSION) < 0 : false;
  const blockers = [];
  const warnings = [];
  if (!fileExists(".kabeeri")) warnings.push("No local .kabeeri workspace found; upgrade check is package-only.");
  if (migrationRequired) warnings.push(`Workspace engine version ${workspaceVersion} is older than CLI ${VERSION}.`);
  if (migrationState && migrationState.pending_migration) blockers.push(`Pending migration: ${migrationState.pending_migration}`);
  return {
    report_type: "upgrade_check",
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "current",
    current_cli_version: VERSION,
    workspace_version: workspaceVersion || null,
    migration_required: migrationRequired,
    blockers,
    warnings,
    compatibility,
    migration_state: migrationState
  };
}

function renderPackageCheck(report) {
  return [
    "# Kabeeri Product Packaging Check",
    "",
    `Generated at: ${report.generated_at}`,
    `Package: ${report.package.name}@${report.package.version}`,
    `Status: ${report.status}`,
    `Interpretation: ${report.status === "warning" && report.blockers.length === 0 ? "Warning means open work or missing checks, not a hard blocker." : report.status === "blocked" ? "Blocked means release or handoff should stop until blockers are resolved." : "Ready means no blockers or warnings were detected."}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item.check_id}: ${item.detail}`) : ["No packaging blockers detected."]),
    "",
    "## Checks",
    "",
    ...report.checks.map((item) => `- ${item.status}: ${item.check_id} - ${item.detail}`)
  ];
}

function renderUpgradeCheck(report) {
  return [
    "# Kabeeri Upgrade Check",
    "",
    `Generated at: ${report.generated_at}`,
    `CLI version: ${report.current_cli_version}`,
    `Workspace version: ${report.workspace_version || "none"}`,
    `Migration required: ${report.migration_required ? "yes" : "no"}`,
    `Status: ${report.status}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No upgrade blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No upgrade warnings detected."])
  ];
}

function readGuideLines(file) {
  if (!fileExists(file)) throw new Error(`Guide not found: ${file}`);
  return readTextFile(file).replace(/\r\n/g, "\n").split("\n");
}

function compareSemver(left, right) {
  const a = String(left || "0.0.0").split(".").map((item) => Number.parseInt(item, 10) || 0);
  const b = String(right || "0.0.0").split(".").map((item) => Number.parseInt(item, 10) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function runtimeReport(type, action, value, flags) {
  ensureWorkspace();
  const selected = value || action || "report";
  if (!["report", "show", "status"].includes(selected)) throw new Error(`Unknown ${type} action: ${selected}`);
  const report = type === "readiness" ? buildReadinessReport() : buildGovernanceReport();
  refreshLiveReportsState({ [type]: report });
  if (flags.json) {
    const content = `${JSON.stringify(report, null, 2)}\n`;
    if (flags.output && flags.output !== true) writeTextFile(flags.output, content);
    else console.log(content.trimEnd());
    return;
  }
  const lines = type === "readiness" ? renderReadinessReport(report) : renderGovernanceReport(report);
  outputLines(lines, flags.output);
}

function reports(action, value, flags = {}) {
  ensureWorkspace();
  const selected = action || "live";
  if (["live", "refresh", "state", "status"].includes(selected)) {
    const state = refreshLiveReportsState();
    if (flags.json || selected === "state") {
      console.log(JSON.stringify(state, null, 2));
      return;
    }
    return outputLines(renderLiveReportsState(state), flags.output);
  }
  if (selected === "show") {
    const state = refreshLiveReportsState();
    const reportName = value || flags.report;
    if (!reportName) throw new Error("Missing report name. Use readiness, governance, package, upgrade, task_tracker, dashboard_ux, evolution, security, or migration.");
    const report = state.reports[reportName];
    if (!report) throw new Error(`Unknown live report: ${reportName}`);
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  throw new Error(`Unknown reports action: ${selected}`);
}

function refreshLiveReportsState(overrides = {}) {
  ensureWorkspace();
  const state = buildLiveReportsState(overrides);
  writeJsonFile(".kabeeri/reports/live_reports_state.json", state);
  return state;
}

function buildLiveReportsState(overrides = {}) {
  const taskTracker = overrides.task_tracker || refreshTaskTrackerState();
  const readiness = overrides.readiness || buildReadinessReport();
  const governance = overrides.governance || buildGovernanceReport();
  const packageCheck = overrides.package || buildPackageCheck();
  const upgradeCheck = overrides.upgrade || buildUpgradeCheck();
  const structuredDelivery = overrides.structured || refreshStructuredDashboardState();
  const dashboardUxAudits = readStateArray(".kabeeri/dashboard/ux_audits.json", "audits");
  const latestDashboardUx = dashboardUxAudits.length ? dashboardUxAudits[dashboardUxAudits.length - 1] : null;
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], current_change_id: null };
  const evolutionSummary = buildEvolutionSummary(evolutionState);
  const securityScan = getLatestSecurityScan();
  const migrationChecks = latestMigrationChecks();
  const generatedAt = new Date().toISOString();
  const reports = {
    readiness,
    governance,
    package: packageCheck,
    upgrade: upgradeCheck,
    structured: structuredDelivery,
    task_tracker: taskTracker,
    dashboard_ux: latestDashboardUx ? {
      report_type: "dashboard_ux_latest",
      status: latestDashboardUx.status,
      audit_id: latestDashboardUx.audit_id,
      audited_at: latestDashboardUx.audited_at,
      score: latestDashboardUx.score,
      max_score: latestDashboardUx.max_score,
      blockers: latestDashboardUx.blockers || 0,
      warnings: latestDashboardUx.warnings || 0
    } : {
      report_type: "dashboard_ux_latest",
      status: "missing",
      audit_id: null,
      blockers: 0,
      warnings: 1
    },
    evolution: evolutionSummary,
    security: securityScan ? {
      report_type: "security_latest",
      status: securityScan.status,
      scan_id: securityScan.scan_id,
      scanned_at: securityScan.scanned_at || securityScan.generated_at || null,
      findings_total: securityScan.findings_total || 0,
      blocker_findings: securityScan.blocker_findings || 0
    } : {
      report_type: "security_latest",
      status: "missing",
      scan_id: null,
      findings_total: 0,
      blocker_findings: 0
    },
    migration: {
      report_type: "migration_latest",
      status: migrationChecks.some((item) => item.status === "blocked") ? "blocked" : migrationChecks.length ? "checked" : "missing",
      checks_total: migrationChecks.length,
      blocked_checks: migrationChecks.filter((item) => item.status === "blocked").length,
      latest_check_id: migrationChecks.length ? migrationChecks[migrationChecks.length - 1].check_id : null
    }
  };
  const actionItems = buildLiveReportActionItems(reports);
  return {
    generated_at: generatedAt,
    source: ".kabeeri",
    live_json_path: ".kabeeri/reports/live_reports_state.json",
    live_api_path: "/__kvdf/api/reports",
    update_policy: {
      markdown_reports: "Human-readable snapshots. Regenerate only for review, handoff, or release.",
      live_json: "Derived runtime status. Refresh after task, dashboard, policy, security, migration, readiness, or governance changes.",
      source_of_truth: ".kabeeri state files remain canonical; live reports are derived summaries."
    },
    summary: {
      status: reports.readiness.status === "blocked" || reports.governance.status === "blocked" || reports.package.status === "blocked" || reports.migration.status === "blocked" || reports.structured.summary.health === "blocked" ? "blocked" : actionItems.some((item) => item.severity === "warning") ? "warning" : "ready",
      readiness: reports.readiness.status,
      governance: reports.governance.status,
      package: reports.package.status,
      upgrade: reports.upgrade.status,
      structured: reports.structured.summary.health,
      task_tracker_open: reports.task_tracker.summary.open || 0,
      task_tracker_blocked: reports.task_tracker.summary.blocked || 0,
      dashboard_ux: reports.dashboard_ux.status,
      evolution: reports.evolution.status,
      security: reports.security.status,
      migration: reports.migration.status,
      action_items: actionItems.length
    },
    reports,
    action_items: actionItems
  };
}

function buildLiveReportActionItems(reports) {
  const items = [];
  const push = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  if (reports.readiness.status === "blocked") push("blocker", "readiness", "Readiness report is blocked.", "Run `kvdf readiness report --json` and resolve blockers.");
  if (reports.governance.status === "blocked") push("blocker", "governance", "Governance report is blocked.", "Run `kvdf governance report --json` and resolve blockers.");
  if (reports.package.status === "blocked") push("blocker", "package", "Package check is blocked.", "Run `kvdf package check` and fix package contract blockers.");
  if (reports.structured && reports.structured.summary && reports.structured.summary.health === "blocked") push("blocker", "structured", "Structured delivery health is blocked.", "Run `kvdf structured health --json` and resolve phase, requirement, risk, or gate blockers.");
  if (reports.migration.status === "blocked") push("blocker", "migration", "Latest migration checks include blockers.", "Run `kvdf migration audit` and resolve blocked checks.");
  if (reports.security.status === "missing") push("warning", "security", "No security scan is recorded.", "Run `kvdf security scan` before release or handoff.");
  if (reports.dashboard_ux.status === "missing") push("warning", "dashboard", "No dashboard UX audit is recorded.", "Run `kvdf dashboard ux` after dashboard changes.");
  if (reports.evolution && reports.evolution.open_follow_up_tasks > 0) push("warning", "evolution", `${reports.evolution.open_follow_up_tasks} Evolution Steward follow-up task(s) are still open.`, "Run `kvdf evolution status` and finish dependent docs/runtime/test updates.");
  if ((reports.task_tracker.summary.open || 0) > 0) push("info", "tasks", `${reports.task_tracker.summary.open} task(s) are open.`, "Run `kvdf task tracker` for next actions.");
  return items;
}

function renderLiveReportsState(state) {
  return [
    "# Kabeeri Live Reports State",
    "",
    `Generated at: ${state.generated_at}`,
    `Status: ${state.summary.status}`,
    `Live JSON: ${state.live_json_path}`,
    `Live API: ${state.live_api_path}`,
    "",
    "## Summary",
    "",
    ...objectLines(state.summary),
    "",
    "## Action Items",
    "",
    ...(state.action_items.length ? state.action_items.map((item) => `- ${item.severity}: ${item.area} - ${item.message} Next: ${item.next_action}`) : ["No live report action items."])
  ];
}

function buildReadinessReport() {
  const state = collectDashboardState();
  const validation = validateRepository("all");
  const tasks = state.records.tasks;
  const features = state.records.features;
  const journeys = state.records.journeys;
  const latestPolicies = latestPolicyResults();
  const securityScan = getLatestSecurityScan();
  const migrationChecks = latestMigrationChecks();
  const policyBlockers = latestPolicies.filter((item) => item.status === "blocked");
  const migrationBlockers = migrationChecks.filter((item) => item.status === "blocked");
  const openTasks = tasks.filter((item) => !["owner_verified", "done", "closed", "rejected"].includes(item.status));
  const reviewTasks = tasks.filter((item) => ["review", "needs_review"].includes(item.status));
  const unreadyFeatures = features.filter((item) => !["ready_to_demo", "ready_to_publish"].includes(item.readiness || "future"));
  const unreadyJourneys = journeys.filter((item) => !(item.ready_to_show || item.status === "ready_to_show"));
  const unreviewedAiRuns = state.records.ai_run_report.totals.unreviewed || 0;
  const unresolvedCaptures = state.records.vibe_captures.filter((item) => !["resolved", "converted_to_task", "linked"].includes(item.status));
  const ungovernedCaptures = state.records.vibe_captures.filter((item) => !item.task_id && !["resolved", "converted_to_task", "linked"].includes(item.status));
  const activeUngovernedCaptures = state.records.vibe_captures.filter((item) => !item.task_id && (item.files_changed || []).length && !["resolved", "converted_to_task", "linked", "rejected"].includes(item.status));
  const blockers = [];
  const warnings = [];

  if (!validation.ok) blockers.push("Repository validation has failures.");
  if (policyBlockers.length) blockers.push(`${policyBlockers.length} latest policy result(s) are blocked.`);
  if (securityScan && securityScan.status === "blocked") blockers.push(`Latest security scan is blocked: ${securityScan.scan_id}.`);
  if (!securityScan) warnings.push("No security scan has been recorded.");
  if (migrationBlockers.length) blockers.push(`${migrationBlockers.length} latest migration check(s) are blocked.`);
  if (openTasks.length) warnings.push(`${openTasks.length} task(s) are still open.`);
  if (reviewTasks.length) warnings.push(`${reviewTasks.length} task(s) are waiting for review.`);
  if (unreadyFeatures.length) warnings.push(`${unreadyFeatures.length} feature(s) are not demo/publish ready.`);
  if (unreadyJourneys.length) warnings.push(`${unreadyJourneys.length} journey record(s) are not ready to show.`);
  if (unreviewedAiRuns) warnings.push(`${unreviewedAiRuns} AI run(s) are unreviewed.`);
  if (unresolvedCaptures.length) warnings.push(`${unresolvedCaptures.length} post-work capture(s) still need resolution.`);
  if (activeUngovernedCaptures.length) blockers.push(`${activeUngovernedCaptures.length} post-work capture(s) changed files without a linked task.`);
  else if (ungovernedCaptures.length) warnings.push(`${ungovernedCaptures.length} post-work capture(s) are not linked to tasks.`);

  return {
    report_type: "readiness",
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "ready",
    blockers,
    warnings,
    summary: {
      tasks_total: tasks.length,
      open_tasks: openTasks.length,
      verified_tasks: tasks.filter((item) => item.status === "owner_verified").length,
      features_total: features.length,
      features_ready_to_demo: features.filter((item) => item.readiness === "ready_to_demo").length,
      features_ready_to_publish: features.filter((item) => item.readiness === "ready_to_publish").length,
      journeys_total: journeys.length,
      journeys_ready_to_show: journeys.filter((item) => item.ready_to_show || item.status === "ready_to_show").length,
      policy_blockers: policyBlockers.length,
      migration_blockers: migrationBlockers.length,
      security_status: securityScan ? securityScan.status : "missing",
      handoff_packages: state.records.handoff_packages.length,
      unreviewed_ai_runs: unreviewedAiRuns,
      unresolved_captures: unresolvedCaptures.length,
      ungoverned_captures: ungovernedCaptures.length
    },
    validation: {
      ok: validation.ok,
      failures: validation.lines.filter((line) => line.startsWith("FAIL"))
    },
    records: {
      open_tasks: openTasks.map(taskReportItem),
      unready_features: unreadyFeatures.map((item) => ({ id: item.id, title: item.title, readiness: item.readiness || "future" })),
      unready_journeys: unreadyJourneys.map((item) => ({ id: item.id, name: item.name, status: item.status || "draft" })),
      policy_blockers: policyBlockers.map(policyReportItem),
      migration_blockers: migrationBlockers.map((item) => ({ check_id: item.check_id, plan_id: item.plan_id, status: item.status })),
      latest_security_scan: securityScan ? { scan_id: securityScan.scan_id, status: securityScan.status, findings_total: securityScan.findings_total || 0 } : null,
      ungoverned_captures: ungovernedCaptures.map((item) => ({ capture_id: item.capture_id, classification: item.classification, files_changed: item.files_changed || [], status: item.status }))
    }
  };
}

function buildGovernanceReport() {
  const state = collectDashboardState();
  const validation = validateRepository("workspace");
  const tasks = state.records.tasks;
  const developers = state.technical.developers || [];
  const agents = state.technical.agents || [];
  const tokens = state.records.tokens;
  const locks = state.records.locks;
  const policies = latestPolicyResults();
  const activeOwners = developers.filter((item) => item.role === "Owner" && item.status !== "inactive");
  const activeLocks = locks.filter((item) => item.status === "active");
  const activeTokens = tokens.filter((item) => item.status === "active");
  const expiredActiveTokens = activeTokens.filter((item) => item.expires_at && new Date(item.expires_at).getTime() < Date.now());
  const lockConflicts = findLockConflicts(activeLocks);
  const knownWorkstreams = new Set(state.records.workstreams.map((item) => normalizeWorkstreamId(item.id)));
  const unknownWorkstreamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).some((stream) => !knownWorkstreams.has(stream)));
  const missingAssigneeTasks = tasks.filter((item) => ["assigned", "in_progress", "review"].includes(item.status) && !item.assignee_id);
  const policyBlockers = policies.filter((item) => item.status === "blocked");
  const blockers = [];
  const warnings = [];

  if (!validation.ok) blockers.push("Workspace governance validation has failures.");
  if (activeOwners.length > 1) blockers.push(`Multiple active Owners detected: ${activeOwners.length}.`);
  if (lockConflicts.length) blockers.push(`${lockConflicts.length} active lock conflict(s) detected.`);
  if (expiredActiveTokens.length) blockers.push(`${expiredActiveTokens.length} active token(s) are expired.`);
  if (unknownWorkstreamTasks.length) blockers.push(`${unknownWorkstreamTasks.length} task(s) reference unknown workstreams.`);
  if (policyBlockers.length) blockers.push(`${policyBlockers.length} latest policy result(s) are blocked.`);
  if (activeOwners.length === 0) warnings.push("No active Owner identity is configured.");
  if (missingAssigneeTasks.length) warnings.push(`${missingAssigneeTasks.length} active task(s) have no assignee.`);
  if (!state.records.workstreams.length) warnings.push("No workstream registry is configured.");

  return {
    report_type: "governance",
    generated_at: new Date().toISOString(),
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    blockers,
    warnings,
    summary: {
      owners_active: activeOwners.length,
      developers: developers.length,
      agents: agents.length,
      workstreams: state.records.workstreams.length,
      tasks: tasks.length,
      active_locks: activeLocks.length,
      lock_conflicts: lockConflicts.length,
      active_tokens: activeTokens.length,
      expired_active_tokens: expiredActiveTokens.length,
      policy_blockers: policyBlockers.length,
      missing_assignee_tasks: missingAssigneeTasks.length,
      unknown_workstream_tasks: unknownWorkstreamTasks.length
    },
    validation: {
      ok: validation.ok,
      failures: validation.lines.filter((line) => line.startsWith("FAIL"))
    },
    records: {
      owners: activeOwners.map((item) => ({ id: item.id, name: item.name, role: item.role })),
      lock_conflicts: lockConflicts,
      expired_active_tokens: expiredActiveTokens.map((item) => ({ token_id: item.token_id, task_id: item.task_id, assignee_id: item.assignee_id, expires_at: item.expires_at })),
      unknown_workstream_tasks: unknownWorkstreamTasks.map(taskReportItem),
      missing_assignee_tasks: missingAssigneeTasks.map(taskReportItem),
      policy_blockers: policyBlockers.map(policyReportItem)
    }
  };
}

function renderReadinessReport(report) {
  return [
    "# Kabeeri Readiness Report",
    "",
    `Generated at: ${report.generated_at}`,
    `Status: ${report.status}`,
    `Interpretation: ${report.status === "warning" && report.blockers.length === 0 ? "Warning means open work or missing checks, not a hard blocker." : report.status === "blocked" ? "Blocked means release or handoff should stop until blockers are resolved." : "Ready means no blockers or warnings were detected."}`,
    "",
    "## Summary",
    "",
    ...objectLines(report.summary),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No readiness blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No readiness warnings detected."]),
    "",
    "## Open Tasks",
    "",
    ...recordLines(report.records.open_tasks, (item) => `${item.id}: ${item.title} (${item.status})`),
    "",
    "## Policy Blockers",
    "",
    ...recordLines(report.records.policy_blockers, (item) => `${item.policy_id}: ${item.subject_id} (${item.status})`)
  ];
}

function renderGovernanceReport(report) {
  return [
    "# Kabeeri Governance Report",
    "",
    `Generated at: ${report.generated_at}`,
    `Status: ${report.status}`,
    "",
    "## Summary",
    "",
    ...objectLines(report.summary),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["No governance blockers detected."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["No governance warnings detected."]),
    "",
    "## Lock Conflicts",
    "",
    ...recordLines(report.records.lock_conflicts, (item) => `${item.left} overlaps ${item.right}`),
    "",
    "## Policy Blockers",
    "",
    ...recordLines(report.records.policy_blockers, (item) => `${item.policy_id}: ${item.subject_id} (${item.status})`)
  ];
}

function findLockConflicts(activeLocks) {
  const conflicts = [];
  for (let index = 0; index < activeLocks.length; index += 1) {
    for (let other = index + 1; other < activeLocks.length; other += 1) {
      if (locksOverlap(activeLocks[index], activeLocks[other])) {
        conflicts.push({ left: activeLocks[index].lock_id, right: activeLocks[other].lock_id, scope_left: activeLocks[index].scope, scope_right: activeLocks[other].scope });
      }
    }
  }
  return conflicts;
}

function taskReportItem(taskItem) {
  return { id: taskItem.id, title: taskItem.title, status: taskItem.status, workstreams: taskWorkstreams(taskItem), assignee_id: taskItem.assignee_id || "" };
}

function policyReportItem(item) {
  return { policy_id: item.policy_id, subject_type: item.subject_type, subject_id: item.subject_id, status: item.status, evaluated_at: item.evaluated_at };
}

function objectLines(object) {
  return Object.entries(object).map(([key, value]) => `- ${key}: ${value}`);
}

function recordLines(records, formatter) {
  return records.length ? records.map((item) => `- ${formatter(item)}`) : ["None."];
}

function buildReleaseChecklist(plan) {
  const lines = [
    `# ${plan.version} Release Checklist`,
    "",
    `Source: ${plan.file}`,
    "",
    "## Milestones"
  ];

  for (const milestone of plan.data.milestones) {
    lines.push("", `- [ ] ${milestone.title}`, `  Goal: ${milestone.goal}`);
    for (const issue of milestone.issues || []) {
      lines.push(`  - [ ] ${issue.title}`);
    }
  }

  lines.push("", "## Final Gate", "", "- [ ] Owner verified release readiness", "- [ ] GitHub dry-run reviewed", "- [ ] Release notes reviewed", "- [ ] Tag and release approved");
  return lines;
}

function buildReleaseNotes(plan) {
  const lines = [
    `# Kabeeri VDF ${plan.version} Release Notes`,
    "",
    "## Summary",
    "",
    `${plan.version} includes ${plan.data.totals.milestones} planned milestones and ${plan.data.totals.issues} planned issues.`,
    "",
    "## Highlights"
  ];

  for (const rule of plan.data.rules || []) {
    lines.push(`- ${rule}`);
  }

  lines.push("", "## Milestones");
  for (const milestone of plan.data.milestones) {
    lines.push("", `### ${milestone.title}`, "", milestone.goal, "");
    for (const issue of milestone.issues || []) {
      lines.push(`- ${issue.title}`);
    }
  }

  lines.push("", "## Limitations", "", "- Runtime enforcement may still require future CLI, dashboard, VS Code, or GitHub write integration work.", "- GitHub write operations must remain dry-run until explicit confirmation support is implemented.", "- Owner approval is required before publishing the official release.");
  return lines;
}

function buildScenarioReview(plan) {
  const hasWorkspace = fileExists(".kabeeri");
  const tasks = hasWorkspace && fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const locks = hasWorkspace && fileExists(".kabeeri/locks.json") ? readJsonFile(".kabeeri/locks.json").locks || [] : [];
  const agents = hasWorkspace && fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  const developers = hasWorkspace && fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const activeOwners = developers.filter((item) => item.role === "Owner" && item.status !== "inactive");
  const workstreams = ["backend", "public_frontend", "admin_frontend"];
  const lines = [
    `# ${plan.version} Multi-AI Collaboration Scenario Review`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Scenario",
    "",
    "- Backend developer/agent works on backend tasks.",
    "- Public frontend developer/agent works on public frontend tasks.",
    "- Admin frontend developer/agent works on admin frontend tasks.",
    "- Owner performs final verification.",
    "",
    "## Workspace Findings"
  ];

  if (!hasWorkspace) {
    lines.push("", "No `.kabeeri` workspace found. Run `kvdf init` to review a real local scenario.");
    return lines;
  }

  lines.push(
    "",
    `Owners: ${activeOwners.length}`,
    `Agents: ${agents.length}`,
    `Tasks: ${tasks.length}`,
    `Active locks: ${locks.filter((lockItem) => lockItem.status === "active").length}`,
    ""
  );

  for (const stream of workstreams) {
    const streamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).includes(stream));
    const streamAgents = agents.filter((agent) => (agent.workstreams || []).map((item) => String(item).toLowerCase()).includes(stream));
    lines.push(`- ${stream}: ${streamTasks.length} tasks, ${streamAgents.length} agents`);
  }

  const risks = [];
  if (activeOwners.length !== 1) risks.push(`Expected exactly one active Owner, found ${activeOwners.length}.`);
  for (const taskItem of tasks.filter((item) => ["assigned", "in_progress", "review"].includes(item.status))) {
    if (!taskItem.assignee_id) risks.push(`Task ${taskItem.id} is ${taskItem.status} without assignee.`);
    const hasLock = locks.some((lockItem) => lockItem.task_id === taskItem.id && lockItem.status === "active");
    if (!hasLock && taskItem.status === "in_progress") risks.push(`Task ${taskItem.id} is in progress without active lock.`);
  }
  for (let index = 0; index < locks.length; index += 1) {
    for (let other = index + 1; other < locks.length; other += 1) {
      if (locks[index].status === "active" && locks[other].status === "active" && locksOverlap(locks[index], locks[other])) {
        risks.push(`Lock overlap: ${locks[index].lock_id} overlaps ${locks[other].lock_id}.`);
      }
    }
  }

  lines.push("", "## Risks", "");
  if (risks.length === 0) lines.push("No scenario risks detected.");
  else lines.push(...risks.map((risk) => `- ${risk}`));
  return lines;
}

function countIssues(planData) {
  return (planData.milestones || []).reduce((sum, milestone) => sum + (milestone.issues || []).length, 0);
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

function escapeShellText(value) {
  return String(value || "").replace(/"/g, '\\"');
}

function identity(kind, action, value, flags) {
  ensureWorkspace();
  if (kind === "developers" && ["solo", "fullstack", "full-stack", "owner-developer"].includes(String(action || "").toLowerCase())) {
    return configureSoloDeveloper(action, value, flags);
  }
  const file = `.kabeeri/${kind}.json`;
  const key = kind;
  const data = readJsonFile(file);
  data[key] = data[key] || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Name", "Role", "Status"], data[key].map((item) => [item.id, item.display_name, item.role, item.status])));
    return;
  }

  if (action === "add") {
    requireAnyRole(flags, ["Owner", "Maintainer"], `add ${kind.slice(0, -1)}`);
    const id = flags.id || `${kind === "developers" ? "dev" : "agent"}-${String(data[key].length + 1).padStart(3, "0")}`;
    if (!flags.name) throw new Error("Missing --name.");
    const role = flags.role || (kind === "agents" ? "AI Developer" : "Viewer");
    if (role === "Owner") ensureNoOtherOwner(id);
    const workstreams = parseCsv(flags.workstreams || flags.workstream);
    validateKnownWorkstreams(workstreams);
    const item = {
      id,
      type: kind === "agents" ? "ai_developer" : "human",
      display_name: flags.name,
      role,
      workstreams,
      status: "active",
      created_at: new Date().toISOString()
    };
    data[key].push(item);
    writeJsonFile(file, data);
    appendAudit(`${kind}.added`, kind.slice(0, -1), id, `${kind.slice(0, -1)} added: ${item.display_name}`);
    console.log(`Added ${kind.slice(0, -1)} ${id}`);
    return;
  }

  throw new Error(`Unknown ${kind.slice(0, -1)} action: ${action}`);
}

function configureSoloDeveloper(action, value, flags = {}) {
  requireAnyRole(flags, ["Owner", "Maintainer"], "configure solo developer mode");
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  const id = flags.id || value || "dev-main";
  const name = flags.name || "Main Developer";
  const role = String(action || "").toLowerCase() === "owner-developer" ? "Owner-Developer" : "Full-stack Developer";
  if (role === "Owner-Developer") ensureNoOtherOwner(id);
  const workstreams = parseCsv(flags.workstreams || "backend,public_frontend,admin_frontend,database,devops,qa,docs,integrations,security");
  validateKnownWorkstreams(workstreams);
  let item = data.developers.find((developer) => developer.id === id);
  if (!item) {
    item = {
      id,
      type: "human",
      display_name: name,
      role,
      workstreams,
      status: "active",
      solo_mode: true,
      created_at: new Date().toISOString()
    };
    data.developers.push(item);
  } else {
    item.display_name = flags.name || item.display_name || name;
    item.role = role;
    item.workstreams = workstreams;
    item.status = "active";
    item.solo_mode = true;
    item.updated_at = new Date().toISOString();
  }
  writeJsonFile(file, data);
  writeJsonFile(".kabeeri/developer_mode.json", {
    mode: "solo",
    solo_developer_id: id,
    role,
    workstreams,
    configured_at: new Date().toISOString()
  });
  appendAudit("developer.solo_configured", "developer", id, `Solo developer mode configured: ${id}`);
  console.log(`Configured solo developer mode for ${id}`);
}

function ensureNoOtherOwner(newId) {
  for (const file of [".kabeeri/developers.json", ".kabeeri/agents.json"]) {
    const data = readJsonFile(file);
    const entries = data.developers || data.agents || [];
    const owner = entries.find((item) => item.role === "Owner" && item.id !== newId && item.status === "active");
    if (owner) throw new Error(`Single Owner rule violation: ${owner.id} is already Owner.`);
  }
}

function owner(action, value, flags) {
  ensureWorkspace();

  if (action === "transfer") {
    return ownerTransfer(value, flags);
  }

  if (!action || action === "status") {
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    const session = readJsonFile(".kabeeri/session.json");
    const active = isOwnerSessionActive(session);
    console.log(table(["Field", "Value"], [
      ["Auth configured", auth.configured ? "yes" : "no"],
      ["Owner ID", auth.owner_id || ""],
      ["Session active", active ? "yes" : "no"],
      ["Session expires", session.expires_at || ""]
    ]));
    return;
  }

  if (action === "init") {
    const ownerId = flags.id || value;
    const name = flags.name || "Project Owner";
    const passphrase = getPassphrase(flags);
    if (!ownerId) throw new Error("Missing owner id.");
    if (!passphrase) throw new Error("Missing passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    ensureNoOtherOwner(ownerId);
    upsertOwnerDeveloper(ownerId, name);
    const auth = createOwnerAuth(ownerId, passphrase);
    writeJsonFile(".kabeeri/owner_auth.json", auth);
    writeJsonFile(".kabeeri/session.json", createOwnerSession(ownerId));
    appendAudit("owner_auth.configured", "owner", ownerId, "Owner auth configured");
    console.log(`Owner auth configured for ${ownerId}. Session started.`);
    return;
  }

  if (action === "login") {
    const ownerId = flags.id || value;
    const passphrase = getPassphrase(flags);
    if (!ownerId) throw new Error("Missing owner id.");
    if (!passphrase) throw new Error("Missing passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    if (!auth.configured) throw new Error("Owner auth is not configured. Run `kvdf owner init` first.");
    if (auth.owner_id !== ownerId) throw new Error("Owner id does not match configured owner.");
    if (!verifyPassphrase(passphrase, auth)) throw new Error("Invalid owner passphrase.");
    writeJsonFile(".kabeeri/session.json", createOwnerSession(ownerId));
    appendAudit("owner_auth.login", "owner", ownerId, "Owner session started");
    console.log(`Owner session started for ${ownerId}.`);
    return;
  }

  if (action === "logout") {
    const session = readJsonFile(".kabeeri/session.json");
    writeJsonFile(".kabeeri/session.json", { active: false, owner_id: session.owner_id || null, logged_out_at: new Date().toISOString() });
    appendAudit("owner_auth.logout", "owner", session.owner_id || "owner", "Owner session ended");
    console.log("Owner session ended.");
    return;
  }

  throw new Error(`Unknown owner action: ${action}`);
}

function ownerTransfer(action, flags) {
  const file = ".kabeeri/owner_transfer_tokens.json";
  if (!fileExists(file)) writeJsonFile(file, { tokens: [] });
  const data = readJsonFile(file);
  data.tokens = data.tokens || [];

  if (!action || action === "list") {
    console.log(table(["Token", "From", "To", "Status", "Expires"], data.tokens.map((token) => [
      token.token_id,
      token.from_owner_id,
      token.to_owner_id,
      token.status,
      token.expires_at || ""
    ])));
    return;
  }

  if (action === "issue") {
    requireOwnerAuthority(flags);
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    const toOwnerId = flags.to || flags["to-owner"];
    if (!toOwnerId) throw new Error("Missing --to.");
    const secret = flags.token || createSecretToken();
    const tokenId = `owner-transfer-${String(data.tokens.length + 1).padStart(3, "0")}`;
    const expiresAt = flags.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    data.tokens.push({
      token_id: tokenId,
      from_owner_id: auth.owner_id,
      to_owner_id: toOwnerId,
      to_owner_name: flags.name || toOwnerId,
      status: "issued",
      token_hash: hashTransferToken(secret),
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    });
    writeJsonFile(file, data);
    appendAudit("owner_transfer.issued", "owner_transfer", tokenId, `Owner transfer issued to ${toOwnerId}`);
    console.log(`Issued owner transfer token ${tokenId}`);
    console.log(`Transfer secret: ${secret}`);
    return;
  }

  if (action === "accept") {
    const tokenId = flags.id || flags.tokenId || flags["token-id"];
    const secret = flags.token || flags.secret;
    const passphrase = getPassphrase(flags);
    if (!tokenId) throw new Error("Missing --id.");
    if (!secret) throw new Error("Missing --token.");
    if (!passphrase) throw new Error("Missing new owner passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    const token = data.tokens.find((item) => item.token_id === tokenId);
    if (!token) throw new Error(`Owner transfer token not found: ${tokenId}`);
    if (token.status !== "issued") throw new Error(`Owner transfer token is not usable: ${token.status}`);
    if (isExpired(token.expires_at)) {
      token.status = "expired";
      token.expired_at = new Date().toISOString();
      writeJsonFile(file, data);
      throw new Error(`Owner transfer token expired: ${tokenId}`);
    }
    if (token.token_hash !== hashTransferToken(secret)) throw new Error("Invalid owner transfer token.");
    transferOwnerRole(token.from_owner_id, token.to_owner_id, token.to_owner_name);
    writeJsonFile(".kabeeri/owner_auth.json", createOwnerAuth(token.to_owner_id, passphrase));
    writeJsonFile(".kabeeri/session.json", createOwnerSession(token.to_owner_id));
    token.status = "used";
    token.used_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("owner_transfer.accepted", "owner_transfer", tokenId, `Owner transferred from ${token.from_owner_id} to ${token.to_owner_id}`);
    console.log(`Owner transferred to ${token.to_owner_id}. Session started.`);
    return;
  }

  if (action === "revoke") {
    requireOwnerAuthority(flags);
    const tokenId = flags.id || flags.tokenId || flags["token-id"];
    if (!tokenId) throw new Error("Missing --id.");
    const token = data.tokens.find((item) => item.token_id === tokenId);
    if (!token) throw new Error(`Owner transfer token not found: ${tokenId}`);
    token.status = "revoked";
    token.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("owner_transfer.revoked", "owner_transfer", tokenId, "Owner transfer token revoked");
    console.log(`Revoked owner transfer token ${tokenId}`);
    return;
  }

  throw new Error(`Unknown owner transfer action: ${action}`);
}

function createSecretToken() {
  const crypto = require("crypto");
  return crypto.randomBytes(24).toString("base64url");
}

function hashTransferToken(token) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function transferOwnerRole(fromOwnerId, toOwnerId, toOwnerName) {
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  for (const developer of data.developers) {
    if (developer.role === "Owner") {
      developer.role = developer.id === fromOwnerId ? "Maintainer" : developer.role;
    }
  }
  let nextOwner = data.developers.find((developer) => developer.id === toOwnerId);
  if (!nextOwner) {
    nextOwner = {
      id: toOwnerId,
      type: "human",
      display_name: toOwnerName || toOwnerId,
      role: "Owner",
      workstreams: [],
      status: "active",
      created_at: new Date().toISOString()
    };
    data.developers.push(nextOwner);
  }
  nextOwner.role = "Owner";
  nextOwner.status = "active";
  nextOwner.display_name = nextOwner.display_name || toOwnerName || toOwnerId;
  writeJsonFile(file, data);
}

function getPassphrase(flags) {
  return flags.passphrase || process.env.KVDF_OWNER_PASSPHRASE || "";
}

function createOwnerAuth(ownerId, passphrase) {
  const crypto = require("crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    configured: true,
    owner_id: ownerId,
    algorithm: "scrypt-sha256",
    salt,
    passphrase_hash: hashPassphrase(passphrase, salt),
    created_at: new Date().toISOString()
  };
}

function hashPassphrase(passphrase, salt) {
  const crypto = require("crypto");
  return crypto.scryptSync(passphrase, salt, 32).toString("hex");
}

function verifyPassphrase(passphrase, auth) {
  const crypto = require("crypto");
  const expected = Buffer.from(auth.passphrase_hash, "hex");
  const actual = Buffer.from(hashPassphrase(passphrase, auth.salt), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createOwnerSession(ownerId) {
  const now = Date.now();
  return {
    active: true,
    owner_id: ownerId,
    started_at: new Date(now).toISOString(),
    expires_at: new Date(now + 8 * 60 * 60 * 1000).toISOString()
  };
}

function isOwnerSessionActive(session) {
  return Boolean(session && session.active && session.expires_at && Date.parse(session.expires_at) > Date.now());
}

function requireOwnerAuthority(flags) {
  if (!fileExists(".kabeeri/owner_auth.json")) return;
  const auth = readJsonFile(".kabeeri/owner_auth.json");
  if (!auth.configured) return;
  const session = readJsonFile(".kabeeri/session.json");
  if (!isOwnerSessionActive(session)) {
    throw new Error("Owner session required. Run `kvdf owner login --id OWNER-ID` first.");
  }
  if (session.owner_id !== auth.owner_id) {
    throw new Error("Owner session does not match configured Owner.");
  }
  if (flags.owner && flags.owner !== session.owner_id) {
    throw new Error("Provided --owner does not match active Owner session.");
  }
}

function getOwnerActor(flags) {
  if (fileExists(".kabeeri/session.json")) {
    const session = readJsonFile(".kabeeri/session.json");
    if (isOwnerSessionActive(session)) return session.owner_id;
  }
  return flags.owner || "owner";
}

function getIdentity(actorId) {
  if (!actorId || !fileExists(".kabeeri")) return null;
  const developers = fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const agents = fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  return [...developers, ...agents].find((item) => item.id === actorId && item.status !== "inactive") || null;
}

function getEffectiveActor(flags = {}) {
  if (flags.actor) return flags.actor;
  if (fileExists(".kabeeri/session.json")) {
    const session = readJsonFile(".kabeeri/session.json");
    if (isOwnerSessionActive(session)) return session.owner_id;
  }
  return null;
}

function hasConfiguredIdentities() {
  if (!fileExists(".kabeeri")) return false;
  const developers = fileExists(".kabeeri/developers.json") ? readJsonFile(".kabeeri/developers.json").developers || [] : [];
  const agents = fileExists(".kabeeri/agents.json") ? readJsonFile(".kabeeri/agents.json").agents || [] : [];
  const auth = fileExists(".kabeeri/owner_auth.json") ? readJsonFile(".kabeeri/owner_auth.json") : { configured: false };
  return auth.configured || [...developers, ...agents].some((item) => item.role === "Owner" && item.status !== "inactive");
}

function requireAnyRole(flags, roles, actionName) {
  if (!hasConfiguredIdentities()) return;
  const actorId = getEffectiveActor(flags);
  if (!actorId) throw new Error(`Actor required to ${actionName}. Use --actor ACTOR-ID or active Owner session.`);
  const identity = getIdentity(actorId);
  if (!identity) throw new Error(`Unknown actor: ${actorId}`);
  if (!roles.includes(identity.role)) {
    throw new Error(`Permission denied: ${identity.role} cannot ${actionName}. Required: ${roles.join(", ")}.`);
  }
}

function requireTaskExecutor(flags, task) {
  if (!hasConfiguredIdentities()) return;
  const actorId = getEffectiveActor(flags);
  if (!actorId) throw new Error("Actor required to execute task. Use --actor ACTOR-ID.");
  if (!task.assignee_id) {
    throw new Error(`Task ${task.id} is not assigned.`);
  }
  if (task.assignee_id && actorId !== task.assignee_id) {
    throw new Error(`Permission denied: ${actorId} is not assigned to ${task.id}.`);
  }
  const identity = getIdentity(actorId);
  if (!identity) throw new Error(`Unknown actor: ${actorId}`);
  const allowed = ["Owner", "Maintainer", "Owner-Developer", "Full-stack Developer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"];
  if (!allowed.includes(identity.role)) {
    throw new Error(`Permission denied: ${identity.role} cannot execute tasks.`);
  }
}

function upsertOwnerDeveloper(ownerId, name) {
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  const existing = data.developers.find((developer) => developer.id === ownerId);
  if (existing) {
    existing.role = "Owner";
    existing.display_name = existing.display_name || name;
    existing.status = "active";
  } else {
    data.developers.push({
      id: ownerId,
      type: "human",
      display_name: name,
      role: "Owner",
      workstreams: [],
      status: "active",
      created_at: new Date().toISOString()
    });
  }
  writeJsonFile(file, data);
}

function lock(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/locks.json";
  const data = readJsonFile(file);
  data.locks = data.locks || [];

  if (!action || action === "list") {
    console.log(table(["Lock", "Type", "Scope", "Task", "Owner", "Status"], data.locks.map((item) => [item.lock_id, item.type, item.scope, item.task_id, item.owner_id, item.status])));
    return;
  }

  if (action === "create") {
    if (!flags.type) throw new Error("Missing --type.");
    if (!flags.scope) throw new Error("Missing --scope.");
    if (!flags.task) throw new Error("Missing --task.");
    if (!flags.owner) throw new Error("Missing --owner.");
    if (flags.actor && flags.actor !== flags.owner) {
      requireAnyRole(flags, ["Owner", "Maintainer"], "create lock for another actor");
    } else {
      requireAnyRole({ ...flags, actor: flags.owner }, ["Owner", "Maintainer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"], "create lock");
    }
    const activeConflict = findLockConflict(data.locks, { type: flags.type, scope: flags.scope, task_id: flags.task });
    if (activeConflict) throw new Error(`Active lock conflict: ${activeConflict.lock_id} (${activeConflict.type}:${activeConflict.scope})`);
    const item = {
      lock_id: `lock-${String(data.locks.length + 1).padStart(3, "0")}`,
      type: flags.type,
      scope: flags.scope,
      task_id: flags.task,
      owner_id: flags.owner,
      reason: flags.reason || "",
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null
    };
    data.locks.push(item);
    writeJsonFile(file, data);
    appendAudit("lock.created", "lock", item.lock_id, `Lock created for ${item.scope}`);
    console.log(`Created lock ${item.lock_id}`);
    return;
  }

  if (action === "release") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "release lock");
    const lockId = value || flags.id;
    if (!lockId) throw new Error("Missing lock id.");
    const item = data.locks.find((entry) => entry.lock_id === lockId);
    if (!item) throw new Error(`Lock not found: ${lockId}`);
    item.status = "released";
    item.released_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("lock.released", "lock", item.lock_id, `Lock released for ${item.scope}`);
    console.log(`Released lock ${item.lock_id}`);
    return;
  }

  throw new Error(`Unknown lock action: ${action}`);
}

function vscode(action, value, flags = {}) {
  if (!action || action === "status") {
    const files = [
      ".vscode/tasks.json",
      ".vscode/extensions.json",
      ".vscode/kvdf.commands.json",
      ".vscode/kvdf-extension/package.json",
      ".vscode/kvdf-extension/extension.js"
    ];
    console.log(table(["File", "Status"], files.map((file) => [file, fileExists(file) ? "present" : "missing"])));
    return;
  }

  if (action === "scaffold" || action === "init") {
    const force = Boolean(flags.force);
    writeJsonIfAllowed(".vscode/tasks.json", buildVscodeTasks(), force);
    writeJsonIfAllowed(".vscode/extensions.json", {
      recommendations: [],
      unwantedRecommendations: []
    }, force);
    writeJsonIfAllowed(".vscode/kvdf.commands.json", {
      version: 1,
      source: "kvdf vscode scaffold",
      commands: [
        { title: "KVDF: Help", command: "kvdf --help" },
        { title: "KVDF: Doctor", command: "kvdf doctor" },
        { title: "KVDF: Validate", command: "kvdf validate" },
        { title: "KVDF: Dashboard Export", command: "kvdf dashboard export" },
        { title: "KVDF: GitHub Dry Run", command: "kvdf github issue sync --version v4.0.0 --dry-run" }
      ]
    }, force);
    writeJsonIfAllowed(".vscode/kvdf-extension/package.json", buildVscodeExtensionPackage(), force);
    writeIfAllowed(".vscode/kvdf-extension/extension.js", buildVscodeExtensionJs(), force);
    writeIfAllowed(".vscode/kvdf-extension/README.md", buildVscodeExtensionReadme(), force);
    console.log("VS Code KVDF workspace files generated.");
    return;
  }

  throw new Error(`Unknown vscode action: ${action}`);
}

function buildVscodeExtensionPackage() {
  return {
    name: "kabeeri-vdf-local",
    displayName: "Kabeeri VDF Local",
    description: "Local VS Code panels for Kabeeri VDF workspace state.",
    version: "0.1.0",
    publisher: "kabeeri-local",
    engines: { vscode: "^1.80.0" },
    activationEvents: [
      "onCommand:kvdf.openDashboard",
      "onCommand:kvdf.openTasks",
      "onCommand:kvdf.openUsage",
      "onCommand:kvdf.syncGithub"
    ],
    main: "./extension.js",
    contributes: {
      commands: [
        { command: "kvdf.openDashboard", title: "KVDF: Open Dashboard" },
        { command: "kvdf.openTasks", title: "KVDF: Open Tasks" },
        { command: "kvdf.openUsage", title: "KVDF: Show Token Usage" },
        { command: "kvdf.syncGithub", title: "KVDF: GitHub Dry Run" }
      ]
    }
  };
}

function buildVscodeExtensionJs() {
  return `"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const vscode = require("vscode");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("kvdf.openDashboard", () => showPanel("dashboard")),
    vscode.commands.registerCommand("kvdf.openTasks", () => showPanel("tasks")),
    vscode.commands.registerCommand("kvdf.openUsage", () => showPanel("usage")),
    vscode.commands.registerCommand("kvdf.syncGithub", () => runKvdf("github issue sync --version v4.0.0 --dry-run"))
  );
}

function workspaceRoot() {
  const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
  return folder ? folder.uri.fsPath : process.cwd();
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(workspaceRoot(), relativePath), "utf8"));
  } catch (_) {
    return fallback;
  }
}

function showPanel(kind) {
  const panel = vscode.window.createWebviewPanel("kvdf." + kind, "KVDF " + kind, vscode.ViewColumn.One, { enableScripts: false });
  panel.webview.html = buildHtml(kind);
}

function buildHtml(kind) {
  const tasks = readJson(".kabeeri/tasks.json", { tasks: [] }).tasks || [];
  const usage = readJson(".kabeeri/ai_usage/usage_summary.json", { total_tokens: 0, total_cost: 0 });
  const technical = readJson(".kabeeri/dashboard/technical_state.json", {});
  const apps = readJson(".kabeeri/customer_apps.json", { apps: [] }).apps || [];
  const rows = kind === "tasks"
    ? tasks.map((item) => [item.id, item.title, item.status, item.assignee_id || ""])
    : kind === "usage"
      ? [["total", usage.total_tokens || 0, usage.total_cost || 0, usage.currency || "USD"]]
      : apps.map((item) => [item.username, item.name, item.status, "/customer/apps/" + item.username]);
  return "<!doctype html><html><head><meta charset=\\"utf-8\\"><style>body{font-family:Arial,sans-serif;padding:18px;color:#1f2933}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d9dee7;padding:8px;text-align:left}th{background:#eef2f7}code{background:#eef2f7;padding:2px 4px}</style></head><body>"
    + "<h1>KVDF " + escape(kind) + "</h1>"
    + "<p>Generated from local <code>.kabeeri</code> state. Dashboard generated at " + escape(technical.generated_at || "not generated") + ".</p>"
    + table(rows)
    + "</body></html>";
}

function table(rows) {
  if (!rows.length) return "<p>No records.</p>";
  return "<table><tbody>" + rows.map((row) => "<tr>" + row.map((cell) => "<td>" + escape(cell) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
}

function escape(value) {
  return String(value == null ? "" : value).replace(/[&<>\\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\"": "&quot;" }[char]));
}

function runKvdf(command) {
  const terminal = vscode.window.createTerminal("KVDF");
  terminal.show();
  terminal.sendText("kvdf " + command);
}

function deactivate() {}

module.exports = { activate, deactivate };
`;
}

function buildVscodeExtensionReadme() {
  return `# Kabeeri VDF Local VS Code Extension

This scaffold provides local VS Code command-palette panels for the current workspace:

- KVDF: Open Dashboard
- KVDF: Open Tasks
- KVDF: Show Token Usage
- KVDF: GitHub Dry Run

It reads from local \`.kabeeri\` state files and does not become the source of truth.
`;
}

function buildVscodeTasks() {
  return {
    version: "2.0.0",
    tasks: [
      vscodeShellTask("KVDF: Help", "kvdf --help"),
      vscodeShellTask("KVDF: Doctor", "kvdf doctor"),
      vscodeShellTask("KVDF: Validate", "kvdf validate"),
      vscodeShellTask("KVDF: Dashboard Export", "kvdf dashboard export"),
      vscodeShellTask("KVDF: GitHub Issue Dry Run", "kvdf github issue sync --version v4.0.0 --dry-run")
    ]
  };
}

function vscodeShellTask(label, command) {
  return {
    label,
    type: "shell",
    command,
    group: "build",
    problemMatcher: []
  };
}

function docsSite(action, value, flags = {}) {
  const mode = action || "open";
  if (mode === "path") {
    console.log(resolveAsset("docs/site/index.html"));
    return;
  }

  if (mode === "code" || mode === "vscode") {
    const target = value || "docs/site";
    openInVsCode(target);
    console.log(`Opening in VS Code: ${target}`);
    return;
  }

  if (mode === "generate" || mode === "build") {
    generateDocsSite();
    console.log("Generated documentation site pages.");
    return;
  }

  if (mode === "open" || mode === "serve" || mode === "live") {
    generateDocsSite();
    const shouldOpen = mode === "open" || flags.open === true || flags.open === "true";
    return serveDocsSite(flags.port || 4188, { ...flags, open: shouldOpen });
  }

  throw new Error(`Unknown docs action: ${action}`);
}

function generateDocsSite() {
  const { spawnSync } = require("child_process");
  const path = require("path");
  const script = path.join(repoRoot(), "docs", "site", "generate-pages.js");
  if (!fileExists("docs/site/generate-pages.js")) throw new Error("Docs site generator not found: docs/site/generate-pages.js");
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot(),
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Docs site generation failed.${output ? `\n${output}` : ""}`);
  }
}

function serveDocsSite(port, options = {}) {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const siteRoot = path.join(repoRoot(), "docs", "site");
  const autoPort = String(port).toLowerCase() === "auto" || options["auto-port"] === true || options["auto-port"] === "true";
  const startPort = autoPort ? Number(options.start || options["start-port"] || 4188) : Number(port || 4188);

  function start(currentPort) {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, `http://127.0.0.1:${currentPort}`);
      const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const safePath = path.normalize(requestPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
      const filePath = path.join(siteRoot, safePath);
      if (!filePath.startsWith(siteRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "content-type": docsMimeType(filePath),
        "cache-control": "no-store"
      });
      response.end(fs.readFileSync(filePath));
    });
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE" && autoPort && currentPort < startPort + 100) {
        server.close();
        start(currentPort + 1);
        return;
      }
      throw error;
    });
    server.listen(currentPort, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${currentPort}/`;
      console.log(`Kabeeri docs site running at ${url}`);
      console.log(`English docs: ${url}pages/en/what-is.html`);
      console.log(`Arabic docs: ${url}pages/ar/what-is.html`);
      if (options.open) openExternalUrl(url);
    });
  }

  start(startPort);
}

function docsMimeType(filePath) {
  const ext = require("path").extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  };
  return types[ext] || "application/octet-stream";
}

function openExternalUrl(url) {
  const { spawn } = require("child_process");
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

function openInVsCode(target) {
  const { spawn } = require("child_process");
  const path = require("path");
  const targetPath = path.resolve(repoRoot(), target);
  const child = spawn("code", [targetPath], { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

function writeJsonIfAllowed(relativePath, data, force) {
  if (fileExists(relativePath) && !force) return;
  writeJsonFile(relativePath, data);
}

function findLockConflict(locks, requested) {
  return (locks || []).find((lockItem) => {
    if (lockItem.status !== "active") return false;
    if (lockItem.lock_id === requested.lock_id) return false;
    return locksOverlap(lockItem, requested);
  });
}

function locksOverlap(existing, requested) {
  const existingType = normalizeLockType(existing.type);
  const requestedType = normalizeLockType(requested.type);
  const existingScope = normalizeLockScope(existing.scope);
  const requestedScope = normalizeLockScope(requested.scope);

  if (!existingScope || !requestedScope) return false;
  if (existingType === requestedType && existingScope === requestedScope) return true;

  if (existingType === "workstream" || requestedType === "workstream") {
    return existingType === "workstream" && requestedType === "workstream" && existingScope === requestedScope;
  }

  if (existingType === "folder" && ["folder", "file"].includes(requestedType)) {
    return pathScopeContains(existingScope, requestedScope);
  }

  if (requestedType === "folder" && ["folder", "file"].includes(existingType)) {
    return pathScopeContains(requestedScope, existingScope);
  }

  return false;
}

function normalizeLockType(type) {
  const value = String(type || "").toLowerCase().replace(/[_-]/g, "");
  const aliases = {
    directory: "folder",
    dir: "folder",
    folder: "folder",
    file: "file",
    task: "task",
    workstream: "workstream",
    databasetable: "database_table",
    table: "database_table",
    promptpack: "prompt_pack"
  };
  return aliases[value] || String(type || "").toLowerCase();
}

function normalizeLockScope(scope) {
  return String(scope || "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function pathScopeContains(parent, child) {
  return child === parent || child.startsWith(`${parent}/`);
}

function dashboard(action, value, flags = {}) {
  ensureWorkspace();
  if (action === "workspace" || action === "workspaces") {
    return dashboardWorkspace(value, flags);
  }
  if (action === "ux" || action === "ux-audit" || action === "audit-ux") {
    return dashboardUxAudit(flags);
  }

  if (!action || action === "generate") {
    writeDashboardStateFiles(collectDashboardState(flags));
    appendAudit("dashboard.generated", "dashboard", "local", "Dashboard state generated");
    console.log("Generated dashboard state files.");
    return;
  }

  if (action === "export") {
    writeDashboardStateFiles(collectDashboardState(flags));
    appendAudit("dashboard.generated", "dashboard", "local", "Dashboard state generated");
    const output = flags.output || ".kabeeri/site/index.html";
    const dashboardOutput = flags["dashboard-output"] || ".kabeeri/site/__kvdf/dashboard/index.html";
    writeTextFile(output, buildClientHomeHtml());
    writeTextFile(dashboardOutput, buildDashboardHtml());
    exportCustomerAppPages();
    console.log(`Wrote customer page: ${output}`);
    console.log(`Wrote private dashboard: ${dashboardOutput}`);
    return;
  }

  if (action === "state" || action === "api") {
    const state = collectDashboardState(flags);
    writeDashboardStateFiles(state);
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  if (["task-tracker", "tasks", "tracker", "task-state"].includes(action)) {
    const state = collectDashboardState(flags);
    writeDashboardStateFiles(state);
    console.log(JSON.stringify(state.task_tracker, null, 2));
    return;
  }

  if (action === "serve") {
    dashboard("export", null, flags);
    return serveSite(flags.port || 4177, flags);
  }

  throw new Error(`Unknown dashboard action: ${action}`);
}

function dashboardUxAudit(flags = {}) {
  const state = collectDashboardState(flags);
  writeDashboardStateFiles(state);
  const html = buildDashboardHtml();
  const audit = evaluateDashboardUx(state, html);
  const file = ".kabeeri/dashboard/ux_audits.json";
  if (!fileExists(file)) writeJsonFile(file, { audits: [] });
  const data = readJsonFile(file);
  data.audits = data.audits || [];
  data.audits.push(audit);
  writeJsonFile(file, data);
  const output = flags.output || ".kabeeri/reports/dashboard_ux_report.md";
  writeTextFile(output, buildDashboardUxReport(audit));
  appendAudit("dashboard.ux_audited", "dashboard", audit.audit_id, `Dashboard UX audit: ${audit.status}`);
  if (flags.json) console.log(JSON.stringify(audit, null, 2));
  else console.log(`Dashboard UX audit ${audit.audit_id}: ${audit.status} (${audit.score}/${audit.max_score})`);
}

function evaluateDashboardUx(state, html) {
  const checks = [];
  const push = (id, status, message, weight = 1) => checks.push({ id, status, message, weight });
  const technical = state.technical || {};
  const business = state.business || {};
  const records = state.records || {};
  const blockers = buildDashboardActionItems(state).filter((item) => item.severity === "blocker");
  const warnings = buildDashboardActionItems(state).filter((item) => item.severity === "warning");

  push("source_of_truth_notice", html.includes(".kabeeri is the source of truth"), "Dashboard states that .kabeeri remains the source of truth.");
  push("action_center", html.includes("Action Center") && html.includes("Next Action"), "Dashboard has a top action center for resume decisions.", 2);
  push("live_status", html.includes("/__kvdf/api/state") && html.includes("live-status"), "Dashboard exposes live API status.");
  push("responsive_tables", html.includes("table-wrap") && html.includes("overflow-x: auto"), "Tables are wrapped for small screens.");
  push("empty_states", html.includes("empty-state"), "Empty tables render a readable empty state.");
  push("workspace_boundary", html.includes("App Boundary Governance") && html.includes("KVDF Workspaces"), "Dashboard separates app boundaries from linked workspaces.");
  push("governance_visibility", html.includes("Policy Results") && html.includes("Security Scans") && html.includes("Migration Safety"), "Dashboard shows key governance blockers.", 2);
  push("cost_visibility", html.includes("AI Usage by Task") && html.includes("Tracked vs Untracked AI Usage"), "Dashboard shows tracked and untracked AI usage.");
  push("vibe_visibility", html.includes("Vibe-first Suggestions") && html.includes("Post-work Captures"), "Dashboard shows Vibe suggestions and post-work captures.");
  push("agile_visibility", html.includes("Agile Backlog and Stories"), "Dashboard shows Agile stories and reviews.");
  push("no_common_secret_patterns", !/(sk_live_|sk_test_|ghp_|BEGIN PRIVATE KEY|AWS_SECRET_ACCESS_KEY)/.test(html), "Dashboard HTML does not contain common secret patterns.", 2);
  push("business_summary", Number(business.tasks_total || 0) >= 0 && Array.isArray(records.tasks || []), "Dashboard state includes business task summary.");
  push("technical_summary", Boolean(technical.ai_usage && technical.tasks), "Dashboard state includes technical task and AI usage summaries.");

  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
  const score = checks.filter((check) => check.status).reduce((sum, check) => sum + check.weight, 0);
  const failed = checks.filter((check) => !check.status);
  return {
    audit_id: `dashboard-ux-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    audited_at: new Date().toISOString(),
    status: failed.some((check) => check.weight >= 2) || blockers.length ? "needs_attention" : "pass",
    score,
    max_score: maxScore,
    action_items: buildDashboardActionItems(state),
    blockers: blockers.length,
    warnings: warnings.length,
    checks
  };
}

function buildDashboardUxReport(audit) {
  const lines = [
    `# Dashboard UX Governance Report - ${audit.audit_id}`,
    "",
    `- Status: ${audit.status}`,
    `- Score: ${audit.score}/${audit.max_score}`,
    `- Audited at: ${audit.audited_at}`,
    "",
    "## Action Items",
    "",
    "| Severity | Area | Message | Next Action |",
    "| --- | --- | --- | --- |",
    ...(audit.action_items.length ? audit.action_items.map((item) => `| ${item.severity} | ${item.area} | ${item.message} | ${item.next_action} |`) : ["| info | dashboard | No immediate dashboard actions found. | Continue normal validation. |"]),
    "",
    "## Checks",
    "",
    "| Check | Status | Message |",
    "| --- | --- | --- |",
    ...audit.checks.map((check) => `| ${check.id} | ${check.status ? "pass" : "fail"} | ${check.message} |`)
  ];
  return `${lines.join("\n")}\n`;
}

function buildDashboardActionItems(state) {
  const technical = state.technical || {};
  const business = state.business || {};
  const records = state.records || {};
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const activeLocks = technical.active_locks || [];
  const activeTokens = technical.active_tokens || [];
  const policyBlocks = Object.entries(technical.policies || {}).filter(([status]) => status === "blocked").reduce((sum, [, count]) => sum + count, 0);
  const securityBlocks = Object.entries(technical.security_scans || {}).filter(([status]) => status === "blocked").reduce((sum, [, count]) => sum + count, 0);
  const migrationBlocks = business.migration_blocks || 0;
  const untracked = technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.untracked : null;
  const openCaptures = (records.vibe_captures || []).filter((item) => ["captured", "linked", "converted_to_task"].includes(item.status || ""));
  const readyStories = ((records.agile && records.agile.stories) || []).filter((item) => item.ready_status === "ready" && !item.task_id);
  const proposedHighImpactAdrs = (records.adrs || []).filter((item) => item.status === "proposed" && ["critical", "high"].includes(item.impact || ""));
  const aiRunWasteSignals = records.ai_run_report && records.ai_run_report.waste_signals ? records.ai_run_report.waste_signals : [];
  const evolutionOpen = records.evolution_summary ? records.evolution_summary.open_follow_up_tasks || 0 : 0;

  if (policyBlocks) add("blocker", "policy", `${policyBlocks} policy result(s) are blocked.`, "Run `kvdf policy status` and resolve or record an Owner override.");
  if (securityBlocks) add("blocker", "security", `${securityBlocks} security scan(s) are blocked.`, "Run `kvdf security report` and remove high-risk findings.");
  if (migrationBlocks) add("blocker", "migration", `${migrationBlocks} migration safety check(s) are blocked.`, "Run `kvdf migration audit` before release or publish.");
  if (proposedHighImpactAdrs.length) add("warning", "ADR", `${proposedHighImpactAdrs.length} high-impact ADR(s) still need approval.`, "Run `kvdf adr list` and approve, reject, or supersede the decision.");
  if (aiRunWasteSignals.length) add("warning", "AI run history", `${aiRunWasteSignals.length} AI run waste signal(s) need review.`, "Run `kvdf ai-run report` and accept or reject unreviewed runs.");
  if (openCaptures.length) add("warning", "post-work capture", `${openCaptures.length} capture(s) need review.`, "Run `kvdf capture list` and link, convert, or resolve captures.");
  if (evolutionOpen) add("warning", "Evolution Steward", `${evolutionOpen} framework update follow-up task(s) are still open.`, "Run `kvdf evolution status` before treating the Kabeeri update as complete.");
  if (readyStories.length) add("info", "agile", `${readyStories.length} ready Agile stor(ies) are not tasks yet.`, "Run `kvdf agile story task <story-id>` for committed work.");
  if (activeLocks.length) add("info", "locks", `${activeLocks.length} active lock(s).`, "Review `kvdf lock list` before assigning overlapping work.");
  if (activeTokens.length) add("info", "tokens", `${activeTokens.length} active task token(s).`, "Review token scope and expiry before continuing AI sessions.");
  if (untracked && untracked.cost > 0) add("warning", "ai cost", `Untracked AI cost is ${untracked.cost}.`, "Run `kvdf usage summary` and attach usage to tasks where possible.");
  if (!items.length) add("info", "dashboard", "No immediate blockers found.", "Continue with the next governed task.");
  return items;
}

function dashboardWorkspace(action, flags = {}) {
  const path = require("path");
  const file = ".kabeeri/dashboard/workspaces.json";
  if (!fileExists(file)) writeJsonFile(file, { workspaces: [] });
  const data = readJsonFile(file);
  data.workspaces = data.workspaces || [];

  if (!action || action === "list") {
    console.log(table(["Name", "Path", "Status"], data.workspaces.map((item) => [
      item.name || path.basename(item.path || ""),
      item.path,
      summarizeWorkspaceRoot(item.path, false) ? "ok" : "missing"
    ])));
    return;
  }

  if (action === "add" || action === "link") {
    const workspacePath = flags.path || flags.root || flags.workspace;
    if (!workspacePath) throw new Error("Missing --path.");
    const resolved = path.resolve(repoRoot(), workspacePath);
    if (resolved === repoRoot()) throw new Error("Current workspace is already included.");
    if (!summarizeWorkspaceRoot(resolved, false)) throw new Error(`Linked path is not a KVDF workspace: ${resolved}`);
    if (data.workspaces.some((item) => path.resolve(repoRoot(), item.path) === resolved)) {
      throw new Error(`Dashboard workspace already linked: ${resolved}`);
    }
    data.workspaces.push({
      name: flags.name || path.basename(resolved),
      path: resolved,
      linked_at: new Date().toISOString()
    });
    writeJsonFile(file, data);
    appendAudit("dashboard.workspace.linked", "dashboard", resolved, `Linked dashboard workspace: ${resolved}`);
    console.log(`Linked dashboard workspace: ${resolved}`);
    return;
  }

  if (action === "remove" || action === "unlink") {
    const workspacePath = flags.path || flags.root || flags.workspace || flags.name;
    if (!workspacePath) throw new Error("Missing --path.");
    const resolved = path.resolve(repoRoot(), workspacePath);
    const before = data.workspaces.length;
    data.workspaces = data.workspaces.filter((item) => path.resolve(repoRoot(), item.path) !== resolved && item.name !== workspacePath);
    writeJsonFile(file, data);
    console.log(before === data.workspaces.length ? "No dashboard workspace removed." : `Unlinked dashboard workspace: ${workspacePath}`);
    return;
  }

  throw new Error(`Unknown dashboard workspace action: ${action}`);
}

function collectDashboardState(options = {}) {
  const path = require("path");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens");
  const locks = readStateArray(".kabeeri/locks.json", "locks");
  const usageSummary = summarizeUsage();
  const sprints = readStateArray(".kabeeri/sprints.json", "sprints");
  const sessions = readStateArray(".kabeeri/sessions.json", "sessions");
  const developers = readStateArray(".kabeeri/developers.json", "developers");
  const agents = readStateArray(".kabeeri/agents.json", "agents");
  const developerMode = fileExists(".kabeeri/developer_mode.json") ? readJsonFile(".kabeeri/developer_mode.json") : { mode: "unset" };
  const workstreams = getWorkstreamRegistry();
  const policyResults = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const contextPacks = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs");
  const preflights = readStateArray(".kabeeri/ai_usage/cost_preflights.json", "preflights");
  const handoffPackages = readStateArray(".kabeeri/handoff/packages.json", "packages");
  const securityScans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  const migrationPlans = readStateArray(".kabeeri/migrations/migration_plans.json", "plans");
  const migrationChecks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const vibeIntents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const vibeSuggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const vibeCaptures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const vibeSessions = readStateArray(".kabeeri/interactions/vibe_sessions.json", "sessions");
  const contextBriefs = readStateArray(".kabeeri/interactions/context_briefs.json", "briefs");
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], current_change_id: null };
  const evolutionSummary = buildEvolutionSummary(evolutionState);
  const agileState = fileExists(".kabeeri/agile.json") ? readAgileState() : { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] };
  const agileLiveState = refreshAgileDashboardState(agileState);
  const structuredState = fileExists(".kabeeri/structured.json") ? readStructuredState() : { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] };
  const structuredLiveState = refreshStructuredDashboardState(structuredState);
  const adrRecords = readStateArray(".kabeeri/adr/records.json", "adrs");
  const aiRuns = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? readAiRuns() : [];
  const aiRunReport = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? buildAiRunHistoryReport() : { totals: { runs: 0, unreviewed: 0 }, waste_signals: [] };
  const promptCompositions = readStateArray(".kabeeri/prompt_layer/compositions.json", "compositions");
  const liveReports = fileExists(".kabeeri/reports/live_reports_state.json") ? readJsonFile(".kabeeri/reports/live_reports_state.json") : null;
  const developerEfficiency = buildDeveloperEfficiency();
  const generatedAt = new Date().toISOString();
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const appSummaries = buildCustomerAppSummaries(apps, features, journeys, tasks, usageSummary);
  const workstreamSummaries = buildWorkstreamSummaries(workstreams, tasks, sessions, usageSummary);
  const workspaceSummaries = collectWorkspaceDashboardSummaries(options);
  const taskTracker = buildTaskTrackerState({
    generatedAt,
    tasks,
    apps,
    tokens,
    locks,
    sessions,
    sprints,
    acceptanceRecords: readStateArray(".kabeeri/acceptance.json", "records"),
    usageSummary,
    vibeSuggestions,
    vibeCaptures
  });

  return {
    generated_at: generatedAt,
    workspace: {
      name: project.name || project.framework || path.basename(repoRoot()),
      repo_root: repoRoot(),
      product_name: project.product_name || project.name || "",
      project_scope: project.project_scope || "single_product_multi_app",
      forbid_unrelated_apps: project.forbid_unrelated_apps !== false,
      profile: project.profile || "",
      delivery_mode: project.delivery_mode || "",
      language: project.language || "",
      app_count: apps.length,
      mode: apps.length > 1 ? "multi_app_workspace" : apps.length === 1 ? "single_app_workspace" : "project_workspace",
      live_dashboard: {
        customer_home: "/",
        private_dashboard: "/__kvdf/dashboard",
        api_state: "/__kvdf/api/state",
        task_tracker_state: "/__kvdf/api/tasks",
        agile_state: "/__kvdf/api/agile",
        structured_state: "/__kvdf/api/structured",
        live_reports_state: "/__kvdf/api/reports"
      }
    },
    workspaces: workspaceSummaries,
    technical: {
      generated_at: generatedAt,
      tasks: summarizeBy(tasks, "status"),
      active_locks: locks.filter((item) => item.status === "active"),
      active_tokens: tokens.filter((item) => item.status === "active"),
      ai_usage: usageSummary,
      sprints: sprints.map((item) => buildSprintSummary(item.id)),
      sessions: summarizeBy(sessions, "status"),
      developer_mode: developerMode,
      workstreams: workstreamSummaries,
      developers,
      agents,
      policies: summarizeBy(policyResults, "status"),
      context_packs: contextPacks.length,
      cost_preflights: summarizeBy(preflights, "budget_status"),
      handoff_packages: handoffPackages.length,
      security_scans: summarizeBy(securityScans, "status"),
      migration_plans: summarizeBy(migrationPlans, "status"),
      migration_checks: summarizeBy(migrationChecks, "status"),
      vibe_intents: summarizeBy(vibeIntents, "intent_type"),
      vibe_suggestions: summarizeBy(vibeSuggestions, "status"),
      vibe_captures: summarizeBy(vibeCaptures, "classification"),
      vibe_sessions: summarizeBy(vibeSessions, "status"),
      context_briefs: contextBriefs.length,
      evolution: evolutionSummary,
      agile_backlog: summarizeBy(agileState.backlog, "status"),
      agile_stories: summarizeBy(agileState.stories, "status"),
      agile_sprint_reviews: agileState.sprint_reviews.length,
      agile_health: agileLiveState.summary ? agileLiveState.summary.health : "unknown",
      structured_requirements: summarizeBy(structuredState.requirements, "status"),
      structured_phases: summarizeBy(structuredState.phases, "status"),
      structured_health: structuredLiveState.summary ? structuredLiveState.summary.health : "unknown",
      adrs: summarizeBy(adrRecords, "status"),
      ai_runs: summarizeBy(aiRuns, "status"),
      ai_run_waste_signals: aiRunReport.waste_signals.length,
      prompt_compositions: promptCompositions.length,
      live_reports_status: liveReports && liveReports.summary ? liveReports.summary.status : "missing",
      developer_efficiency: developerEfficiency,
      app_summaries: appSummaries,
      workspace_count: workspaceSummaries.length
    },
    business: {
      generated_at: generatedAt,
      customer_apps: apps,
      app_summaries: appSummaries,
      task_tracker: taskTracker,
      workspaces: workspaceSummaries,
      task_status: summarizeBy(tasks, "status"),
      task_tracker_status: taskTracker.summary.by_status,
      tasks_total: tasks.length,
      verified_tasks: tasks.filter((item) => item.status === "owner_verified").length,
      ai_usage_cost: usageSummary.total_cost,
      ai_usage_tokens: usageSummary.total_tokens,
      features,
      feature_readiness: summarizeBy(features, "readiness"),
      journeys,
      journey_status: summarizeBy(journeys, "status"),
      policy_status: summarizeBy(policyResults, "status"),
      context_packs_total: contextPacks.length,
      cost_preflight_status: summarizeBy(preflights, "budget_status"),
      cost_preflight_approvals_required: preflights.filter((item) => item.approval_required).length,
      handoff_packages_total: handoffPackages.length,
      security_status: summarizeBy(securityScans, "status"),
      migration_status: summarizeBy(migrationPlans, "status"),
      migration_blocks: migrationChecks.filter((item) => item.status === "blocked").length,
      vibe_suggestions_total: vibeSuggestions.length,
      vibe_captures_total: vibeCaptures.length,
      vibe_sessions_total: vibeSessions.length,
      context_briefs_total: contextBriefs.length,
      evolution_status: evolutionSummary.status,
      evolution_changes_total: evolutionSummary.changes_total,
      evolution_open_follow_up_tasks: evolutionSummary.open_follow_up_tasks,
      agile_backlog_total: agileState.backlog.length,
      agile_epics_total: agileState.epics.length,
      agile_stories_total: agileState.stories.length,
      agile_ready_stories_total: agileState.stories.filter((item) => item.ready_status === "ready").length,
      agile_health: agileLiveState.summary ? agileLiveState.summary.health : "unknown",
      structured_requirements_total: structuredState.requirements.length,
      structured_approved_requirements_total: structuredState.requirements.filter((item) => item.approval_status === "approved").length,
      structured_phases_total: structuredState.phases.length,
      structured_health: structuredLiveState.summary ? structuredLiveState.summary.health : "unknown",
      adrs_total: adrRecords.length,
      adrs_approved_total: adrRecords.filter((item) => item.status === "approved").length,
      ai_runs_total: aiRunReport.totals.runs || 0,
      ai_runs_unreviewed_total: aiRunReport.totals.unreviewed || 0,
      prompt_compositions_total: promptCompositions.length,
      live_reports_status: liveReports && liveReports.summary ? liveReports.summary.status : "missing",
      developer_efficiency: developerEfficiency,
      developer_mode: developerMode,
      workstreams: workstreamSummaries,
      sprints: sprints.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        cost: buildSprintSummary(item.id).total_cost
      }))
    },
    records: {
      tasks,
      task_tracker: taskTracker,
      apps,
      features,
      journeys,
      tokens,
      locks,
      policy_results: policyResults,
      context_packs: contextPacks,
      cost_preflights: preflights,
      handoff_packages: handoffPackages,
      security_scans: securityScans,
      migration_plans: migrationPlans,
      migration_checks: migrationChecks,
      vibe_intents: vibeIntents,
      vibe_suggestions: vibeSuggestions,
      vibe_captures: vibeCaptures,
      vibe_sessions: vibeSessions,
      context_briefs: contextBriefs,
      evolution: evolutionState,
      evolution_summary: evolutionSummary,
      agile: agileState,
      agile_live: agileLiveState,
      structured: structuredState,
      structured_live: structuredLiveState,
      adrs: adrRecords,
      ai_runs: aiRuns,
      ai_run_report: aiRunReport,
      prompt_compositions: promptCompositions,
      live_reports: liveReports,
      app_summaries: appSummaries,
      workspaces: workspaceSummaries,
      developer_mode: developerMode,
      workstreams: workstreamSummaries,
      usage: usageSummary
    },
    task_tracker: taskTracker
  };
}

function refreshTaskTrackerState() {
  ensureWorkspace();
  const tracker = buildTaskTrackerStateFromFiles();
  writeJsonFile(".kabeeri/dashboard/task_tracker_state.json", tracker);
  return tracker;
}

function buildTaskTrackerStateFromFiles() {
  return buildTaskTrackerState({
    generatedAt: new Date().toISOString(),
    tasks: readStateArray(".kabeeri/tasks.json", "tasks"),
    apps: readStateArray(".kabeeri/customer_apps.json", "apps"),
    tokens: readStateArray(".kabeeri/tokens.json", "tokens"),
    locks: readStateArray(".kabeeri/locks.json", "locks"),
    sessions: readStateArray(".kabeeri/sessions.json", "sessions"),
    sprints: readStateArray(".kabeeri/sprints.json", "sprints"),
    acceptanceRecords: readStateArray(".kabeeri/acceptance.json", "records"),
    usageSummary: summarizeUsage(),
    vibeSuggestions: readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks"),
    vibeCaptures: readStateArray(".kabeeri/interactions/post_work_captures.json", "captures")
  });
}

function buildTaskTrackerState(input = {}) {
  const tasks = input.tasks || [];
  const tokens = input.tokens || [];
  const locks = input.locks || [];
  const sessions = input.sessions || [];
  const apps = input.apps || [];
  const sprints = input.sprints || [];
  const acceptanceRecords = input.acceptanceRecords || [];
  const usageSummary = input.usageSummary || { by_task: {} };
  const suggestions = input.vibeSuggestions || [];
  const captures = input.vibeCaptures || [];
  const appByUsername = Object.fromEntries(apps.map((item) => [item.username, item]));
  const sprintById = Object.fromEntries(sprints.map((item) => [item.id, item]));
  const usageByTask = usageSummary.by_task || {};
  const activeTokensByTask = groupBy(tokens.filter((item) => item.status === "active"), "task_id");
  const activeLocksByTask = groupBy(locks.filter((item) => item.status === "active"), "task_id");
  const sessionsByTask = groupBy(sessions, "task_id");
  const acceptanceByTask = groupBy(acceptanceRecords, "task_id");
  const capturesByTask = groupBy(captures.filter((item) => item.task_id), "task_id");
  const suggestionsByTask = groupBy(suggestions.filter((item) => item.task_id), "task_id");
  const rows = tasks.map((taskItem) => {
    const taskApps = taskAppUsernames(taskItem);
    const taskTokens = activeTokensByTask[taskItem.id] || [];
    const taskLocks = activeLocksByTask[taskItem.id] || [];
    const taskSessions = sessionsByTask[taskItem.id] || [];
    const taskAcceptance = acceptanceByTask[taskItem.id] || [];
    const usage = usageByTask[taskItem.id] || { events: 0, tokens: 0, cost: 0 };
    return {
      id: taskItem.id,
      title: taskItem.title,
      status: taskItem.status,
      type: taskItem.type || "general",
      source: taskItem.source || "",
      workstream: taskItem.workstream || "",
      workstreams: taskWorkstreams(taskItem),
      app_usernames: taskApps,
      apps: taskApps.map((username) => {
        const app = appByUsername[username] || {};
        return { username, name: app.name || username, path: app.path || "" };
      }),
      sprint_id: taskItem.sprint_id || null,
      sprint_name: taskItem.sprint_id && sprintById[taskItem.sprint_id] ? sprintById[taskItem.sprint_id].name || taskItem.sprint_id : "",
      assignee_id: taskItem.assignee_id || "",
      reviewer_id: taskItem.reviewer_id || "",
      acceptance_criteria_count: (taskItem.acceptance_criteria || []).length,
      acceptance_records: taskAcceptance.length,
      active_tokens: taskTokens.map((item) => item.token_id),
      active_locks: taskLocks.map((item) => item.lock_id),
      active_sessions: taskSessions.filter((item) => item.status === "active").map((item) => item.session_id),
      usage,
      linked_suggestions: (suggestionsByTask[taskItem.id] || []).map((item) => item.suggestion_id),
      linked_captures: (capturesByTask[taskItem.id] || []).map((item) => item.capture_id),
      created_at: taskItem.created_at || null,
      updated_at: taskItem.updated_at || taskItem.verified_at || taskItem.rejected_at || taskItem.reopened_at || taskItem.created_at || null,
      blockers: buildTaskTrackerBlockers(taskItem, taskTokens, taskLocks, taskSessions, taskAcceptance),
      next_action: inferTaskTrackerNextAction(taskItem)
    };
  });
  const board = {};
  for (const taskItem of rows) {
    const status = taskItem.status || "unknown";
    board[status] = board[status] || [];
    board[status].push({
      id: taskItem.id,
      title: taskItem.title,
      assignee_id: taskItem.assignee_id,
      workstreams: taskItem.workstreams,
      apps: taskItem.app_usernames,
      blockers: taskItem.blockers.length,
      next_action: taskItem.next_action
    });
  }
  const openTasks = rows.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const blockedTasks = rows.filter((item) => item.blockers.length > 0);
  const generatedAt = input.generatedAt || new Date().toISOString();
  return {
    generated_at: generatedAt,
    source: ".kabeeri/tasks.json",
    live_json_path: ".kabeeri/dashboard/task_tracker_state.json",
    live_api_path: "/__kvdf/api/tasks",
    summary: {
      total: rows.length,
      open: openTasks.length,
      verified: rows.filter((item) => item.status === "owner_verified").length,
      rejected: rows.filter((item) => item.status === "rejected").length,
      blocked: blockedTasks.length,
      by_status: summarizeBy(rows, "status"),
      by_workstream: summarizeTaskRowsByList(rows, "workstreams"),
      by_app: summarizeTaskRowsByList(rows, "app_usernames"),
      active_tokens: tokens.filter((item) => item.status === "active").length,
      active_locks: locks.filter((item) => item.status === "active").length
    },
    board,
    tasks: rows,
    action_items: buildTaskTrackerActionItems(rows),
    recently_updated: rows
      .filter((item) => item.updated_at)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .slice(0, 10)
      .map((item) => ({ id: item.id, title: item.title, status: item.status, updated_at: item.updated_at, next_action: item.next_action }))
  };
}

function groupBy(items, key) {
  return (items || []).reduce((groups, item) => {
    const value = item[key] || "unassigned";
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function taskAppUsernames(taskItem) {
  return Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
}

function summarizeTaskRowsByList(rows, key) {
  return rows.reduce((summary, item) => {
    const values = item[key] && item[key].length ? item[key] : ["unassigned"];
    for (const value of values) summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function buildTaskTrackerBlockers(taskItem, activeTokens, activeLocks, sessions, acceptanceRecords) {
  const blockers = [];
  if (["approved", "ready"].includes(taskItem.status) && !taskItem.assignee_id) blockers.push("missing_assignee");
  if (taskItem.status === "assigned" && activeTokens.length === 0) blockers.push("missing_active_task_token");
  if (taskItem.status === "in_progress" && activeLocks.length === 0) blockers.push("missing_active_lock");
  if (taskItem.status === "review" && !taskItem.reviewer_id) blockers.push("missing_reviewer");
  if (taskItem.status === "review" && (taskItem.acceptance_criteria || []).length === 0 && acceptanceRecords.length === 0) blockers.push("missing_acceptance_evidence");
  if (taskItem.status === "in_progress" && sessions.filter((item) => item.status === "active").length === 0) blockers.push("no_active_session_recorded");
  return blockers;
}

function inferTaskTrackerNextAction(taskItem) {
  if (taskItem.status === "proposed") return "approve or refine task scope";
  if (taskItem.status === "approved" || taskItem.status === "ready") return "assign task to a developer or AI agent";
  if (taskItem.status === "assigned") return "issue/verify task token and start execution";
  if (taskItem.status === "in_progress") return "continue execution or move to review with evidence";
  if (taskItem.status === "review") return "review acceptance evidence and Owner verify or reject";
  if (taskItem.status === "owner_verified") return "archive tokens/locks and include in handoff or release notes";
  if (taskItem.status === "rejected") return "reopen with reason or replace with a clearer task";
  return "inspect task status and choose next governed action";
}

function buildTaskTrackerActionItems(rows) {
  const items = [];
  const push = (severity, task, message, nextAction) => items.push({ severity, task_id: task.id, title: task.title, message, next_action: nextAction });
  for (const task of rows) {
    for (const blocker of task.blockers) {
      const next = blocker === "missing_assignee" ? "run `kvdf task assign`"
        : blocker === "missing_active_task_token" ? "run `kvdf token issue`"
        : blocker === "missing_active_lock" ? "run `kvdf lock create`"
        : blocker === "missing_reviewer" ? "run `kvdf task review --reviewer <id>`"
        : blocker === "missing_acceptance_evidence" ? "run `kvdf acceptance create` and review it"
        : blocker === "no_active_session_recorded" ? "run `kvdf session start` or capture post-work"
        : task.next_action;
      push(["missing_acceptance_evidence", "missing_active_task_token", "missing_active_lock"].includes(blocker) ? "warning" : "info", task, blocker, next);
    }
  }
  return items;
}

function renderTaskTrackerSummary(tracker) {
  const rows = Object.entries(tracker.summary.by_status || {}).map(([status, count]) => [status, count]);
  return [
    "# Task Tracker Live State",
    "",
    `Generated at: ${tracker.generated_at}`,
    `Live JSON: ${tracker.live_json_path}`,
    `Live API: ${tracker.live_api_path}`,
    "",
    `Total: ${tracker.summary.total}`,
    `Open: ${tracker.summary.open}`,
    `Blocked: ${tracker.summary.blocked}`,
    "",
    table(["Status", "Count"], rows)
  ].join("\n");
}

function buildWorkstreamSummaries(workstreams, tasks, sessions, usageSummary) {
  const usageByWorkstream = usageSummary.by_workstream || {};
  return workstreams.map((stream) => {
    const id = normalizeWorkstreamId(stream.id);
    const streamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).includes(id));
    const streamSessions = sessions.filter((sessionItem) => getTaskWorkstreamsById(sessionItem.task_id).includes(id));
    const usage = usageByWorkstream[id] || { events: 0, tokens: 0, cost: 0 };
    return {
      id,
      name: stream.name || id,
      status: stream.status || "active",
      path_rules: stream.path_rules || [],
      required_review: stream.required_review || [],
      tasks_total: streamTasks.length,
      open_tasks: streamTasks.filter((taskItem) => !["owner_verified", "rejected", "done"].includes(taskItem.status)).length,
      verified_tasks: streamTasks.filter((taskItem) => taskItem.status === "owner_verified").length,
      sessions_total: streamSessions.length,
      active_sessions: streamSessions.filter((sessionItem) => sessionItem.status === "active").length,
      ai_usage: usage
    };
  });
}

function buildCustomerAppSummaries(apps, features, journeys, tasks, usageSummary) {
  const featureMap = Object.fromEntries(features.map((item) => [item.id, item]));
  const journeyMap = Object.fromEntries(journeys.map((item) => [item.id, item]));
  const usageByTask = usageSummary.by_task || {};
  return apps.map((appItem) => {
    const appFeatures = (appItem.feature_ids || []).map((id) => featureMap[id]).filter(Boolean);
    const appJourneys = (appItem.journey_ids || []).map((id) => journeyMap[id]).filter(Boolean);
    const taskIds = new Set(appFeatures.flatMap((featureItem) => featureItem.task_ids || []));
    for (const taskItem of tasks) {
      const taskApps = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
        ? taskItem.app_usernames
        : taskItem.app_username ? [taskItem.app_username] : [];
      if (taskApps.includes(appItem.username)) taskIds.add(taskItem.id);
    }
    const appTasks = tasks.filter((taskItem) => taskIds.has(taskItem.id));
    const usage = [...taskIds].reduce((summary, taskId) => {
      const item = usageByTask[taskId] || {};
      summary.events += Number(item.events || 0);
      summary.tokens += Number(item.tokens || 0);
      summary.cost += Number(item.cost || 0);
      return summary;
    }, { events: 0, tokens: 0, cost: 0 });
    return {
      username: appItem.username,
      name: appItem.name,
      app_type: appItem.app_type || appItem.type || "",
      path: appItem.path || "",
      product_name: appItem.product_name || "",
      workstreams: appItem.workstreams || [],
      status: appItem.status || "draft",
      audience: appItem.audience || "",
      public_url: publicCustomerAppUrl(appItem.username),
      features_total: appFeatures.length,
      ready_features: appFeatures.filter((item) => ["ready_to_demo", "ready_to_publish", "published"].includes(item.readiness)).length,
      journeys_total: appJourneys.length,
      ready_journeys: appJourneys.filter((item) => item.ready_to_show || ["ready_to_show", "published"].includes(item.status)).length,
      tasks_total: appTasks.length,
      verified_tasks: appTasks.filter((item) => item.status === "owner_verified").length,
      open_tasks: appTasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status)).length,
      ai_usage: usage
    };
  });
}

function collectWorkspaceDashboardSummaries(options = {}) {
  const roots = getDashboardWorkspaceRoots(options);
  const current = summarizeWorkspaceRoot(repoRoot(), true);
  const external = roots
    .map((root) => summarizeWorkspaceRoot(root, false))
    .filter(Boolean)
    .filter((item) => item.root !== current.root);
  return [current, ...external];
}

function getDashboardWorkspaceRoots(options = {}) {
  const roots = [];
  const explicit = options.workspaces || options["workspace-roots"] || options.workspace || "";
  if (explicit && String(explicit).toLowerCase() !== "auto") roots.push(...parseWorkspaceRoots(explicit));
  if (process.env.KVDF_WORKSPACES) roots.push(...parseWorkspaceRoots(process.env.KVDF_WORKSPACES));
  if (fileExists(".kabeeri/dashboard/workspaces.json")) {
    const configured = readJsonFile(".kabeeri/dashboard/workspaces.json").workspaces || [];
    roots.push(...configured.map((item) => item.path).filter(Boolean));
  }
  return [...new Set(roots)];
}

function parseWorkspaceRoots(value) {
  const path = require("path");
  return parseCsv(value).map((item) => path.resolve(repoRoot(), item));
}

function summarizeWorkspaceRoot(root, current) {
  const fs = require("fs");
  const path = require("path");
  const stateDir = path.join(root, ".kabeeri");
  if (!fs.existsSync(stateDir)) {
    if (current) {
      return { root, current: true, status: "missing_workspace", name: path.basename(root), apps_total: 0, tasks_total: 0 };
    }
    return null;
  }
  const read = (relative, fallback) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(stateDir, relative), "utf8"));
    } catch (_) {
      return fallback;
    }
  };
  const project = read("project.json", {});
  const apps = read("customer_apps.json", { apps: [] }).apps || [];
  const tasks = read("tasks.json", { tasks: [] }).tasks || [];
  const features = read("features.json", { features: [] }).features || [];
  const policyResults = read("policies/policy_results.json", { results: [] }).results || [];
  const securityScans = read("security/security_scans.json", { scans: [] }).scans || [];
  const migrationChecks = read("migrations/migration_checks.json", { checks: [] }).checks || [];
  return {
    root,
    current,
    status: "ok",
    name: project.name || project.framework || path.basename(root),
    product_name: project.product_name || project.name || "",
    project_scope: project.project_scope || "single_product_multi_app",
    boundary_mode: apps.length > 1 ? "same_product_multi_app" : apps.length === 1 ? "single_app" : "workspace",
    profile: project.profile || "",
    delivery_mode: project.delivery_mode || "",
    apps_total: apps.length,
    tasks_total: tasks.length,
    open_tasks: tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status)).length,
    features_total: features.length,
    policy_blocks: policyResults.filter((item) => item.status === "blocked").length,
    security_blocks: securityScans.filter((item) => item.status === "blocked").length,
    migration_blocks: migrationChecks.filter((item) => item.status === "blocked").length,
    dashboard_command: `kvdf dashboard serve --port auto`,
    apps: apps.map((item) => ({
      username: item.username,
      name: item.name,
      app_type: item.app_type || item.type || "",
      path: item.path || "",
      product_name: item.product_name || project.product_name || ""
    }))
  };
}

function readStateArray(file, key) {
  if (!fileExists(file)) return [];
  return readJsonFile(file)[key] || [];
}

function writeDashboardStateFiles(state) {
  const usageSummary = state && state.records && state.records.usage ? state.records.usage : summarizeUsage();
  writeJsonFile(".kabeeri/dashboard/technical_state.json", state.technical);
  writeJsonFile(".kabeeri/dashboard/business_state.json", state.business);
  writeJsonFile(".kabeeri/dashboard/task_tracker_state.json", state.task_tracker || buildTaskTrackerStateFromFiles());
  writeJsonFile(".kabeeri/dashboard/agile_state.json", state.records && state.records.agile_live ? state.records.agile_live : refreshAgileDashboardState());
  writeJsonFile(".kabeeri/dashboard/structured_state.json", state.records && state.records.structured_live ? state.records.structured_live : refreshStructuredDashboardState());
  writeJsonFile(".kabeeri/ai_usage/usage_summary.json", usageSummary);
  writeJsonFile(".kabeeri/ai_usage/cost_breakdown.json", {
    by_task: usageSummary.by_task || {},
    by_developer: usageSummary.by_developer || {},
    by_workstream: usageSummary.by_workstream || {},
    by_provider: usageSummary.by_provider || {},
    by_sprint: usageSummary.by_sprint || {},
    tracked_vs_untracked: usageSummary.tracked_vs_untracked || {}
  });
}

function refreshDashboardArtifacts(options = {}) {
  if (!localFileExists(".kabeeri/project.json")) return null;
  const state = collectDashboardState(options);
  writeDashboardStateFiles(state);
  return state;
}

function buildClientHomeHtml() {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  const features = fileExists(".kabeeri/features.json") ? readJsonFile(".kabeeri/features.json").features || [] : [];
  const journeys = fileExists(".kabeeri/journeys.json") ? readJsonFile(".kabeeri/journeys.json").journeys || [] : [];
  const visibleFeatures = features.filter((item) => ["ready_to_demo", "ready_to_publish"].includes(item.readiness));
  const visibleJourneys = journeys.filter((item) => item.ready_to_show || item.status === "ready_to_show");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.name || "Kabeeri Client Portal")}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: #f7f8fb; }
    header { background: #ffffff; border-bottom: 1px solid #d9dee7; padding: 28px; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    p { margin: 0 0 16px; color: #52606d; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; }
    .status { display: inline-block; margin-top: 8px; font-size: 12px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 4px 8px; }
    a { color: #0b5cad; text-decoration: none; font-weight: 700; }
    ul { background: white; border: 1px solid #d9dee7; border-radius: 8px; margin: 0 0 24px; padding: 16px 16px 16px 34px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(project.name || "Kabeeri Client Portal")}</h1>
    <p>Customer-facing project page. Internal governance and dashboard data are kept on the private dashboard route.</p>
  </header>
  <main>
    <section>
      <h2>Apps</h2>
      <div class="grid">
        ${(apps.length ? apps : [{ username: "demo", name: "Demo App", status: "draft", public_url: "/customer/apps/demo" }]).map((appItem) => `
          <article class="card">
            <h3>${escapeHtml(appItem.name)}</h3>
            <a href="${escapeHtml(publicCustomerAppUrl(appItem.username))}">${escapeHtml(publicCustomerAppUrl(appItem.username))}</a>
            <div class="status">${escapeHtml(appItem.status || "draft")}</div>
          </article>
        `).join("")}
      </div>
    </section>
    <section>
      <h2>Ready Features</h2>
      <ul>
        ${(visibleFeatures.length ? visibleFeatures : [{ title: "No ready features yet", readiness: "needs_review" }]).map((featureItem) => `<li>${escapeHtml(featureItem.title)} <span class="status">${escapeHtml(featureItem.readiness || "")}</span></li>`).join("")}
      </ul>
    </section>
    <section>
      <h2>Ready Journeys</h2>
      <ul>
        ${(visibleJourneys.length ? visibleJourneys : [{ name: "No ready journeys yet", status: "draft" }]).map((journeyItem) => `<li>${escapeHtml(journeyItem.name)} <span class="status">${escapeHtml(journeyItem.status || "")}</span></li>`).join("")}
      </ul>
    </section>
  </main>
</body>
</html>
`;
}

function buildCustomerAppHtml(appItem) {
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const summary = buildCustomerAppSummaries([appItem], features, journeys, tasks, summarizeUsage())[0];
  const linkedFeatures = features.filter((featureItem) => (appItem.feature_ids || []).includes(featureItem.id));
  const linkedJourneys = journeys.filter((journeyItem) => (appItem.journey_ids || []).includes(journeyItem.id));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(appItem.name)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: #ffffff; }
    main { max-width: 860px; margin: 0 auto; padding: 42px 24px; }
    h1 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 18px 0; }
    .card { border: 1px solid #d9dee7; border-radius: 8px; padding: 14px; }
    .metric { display: block; font-size: 24px; font-weight: 700; margin-top: 4px; }
    .status { display: inline-block; margin-top: 12px; font-size: 13px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 5px 9px; }
    a { color: #0b5cad; text-decoration: none; font-weight: 700; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <main>
    <a href="/">Back to apps</a>
    <h1>${escapeHtml(appItem.name)}</h1>
    <p>Public username: <strong>${escapeHtml(appItem.username)}</strong></p>
    <p>Public route: <strong>${escapeHtml(publicCustomerAppUrl(appItem.username))}</strong></p>
    <div class="status">${escapeHtml(appItem.status || "draft")}</div>
    <section class="grid">
      ${metricCard("Features", summary.features_total)}
      ${metricCard("Ready Features", summary.ready_features)}
      ${metricCard("Journeys", summary.journeys_total)}
      ${metricCard("Open Tasks", summary.open_tasks)}
    </section>
    <section>
      <h2>Linked Features</h2>
      <ul>${(linkedFeatures.length ? linkedFeatures : [{ title: "No linked features yet", readiness: "draft" }]).map((featureItem) => `<li>${escapeHtml(featureItem.title)} <span class="status">${escapeHtml(featureItem.readiness || "")}</span></li>`).join("")}</ul>
    </section>
    <section>
      <h2>Linked Journeys</h2>
      <ul>${(linkedJourneys.length ? linkedJourneys : [{ name: "No linked journeys yet", status: "draft" }]).map((journeyItem) => `<li>${escapeHtml(journeyItem.name)} <span class="status">${escapeHtml(journeyItem.status || "")}</span></li>`).join("")}</ul>
    </section>
  </main>
</body>
</html>
`;
}

function buildDashboardHtml() {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const technical = readJsonFile(".kabeeri/dashboard/technical_state.json");
  const business = readJsonFile(".kabeeri/dashboard/business_state.json");
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens");
  const locks = readStateArray(".kabeeri/locks.json", "locks");
  const policyResults = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const contextPacks = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs");
  const preflights = readStateArray(".kabeeri/ai_usage/cost_preflights.json", "preflights");
  const handoffPackages = readStateArray(".kabeeri/handoff/packages.json", "packages");
  const securityScans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  const migrationPlans = readStateArray(".kabeeri/migrations/migration_plans.json", "plans");
  const migrationChecks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const vibeSuggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const vibeCaptures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const vibeSessions = readStateArray(".kabeeri/interactions/vibe_sessions.json", "sessions");
  const contextBriefs = readStateArray(".kabeeri/interactions/context_briefs.json", "briefs");
  const agileState = fileExists(".kabeeri/agile.json") ? readAgileState() : { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] };
  const agileLiveState = refreshAgileDashboardState(agileState);
  const structuredState = fileExists(".kabeeri/structured.json") ? readStructuredState() : { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] };
  const structuredLiveState = refreshStructuredDashboardState(structuredState);
  const adrRecords = readStateArray(".kabeeri/adr/records.json", "adrs");
  const aiRuns = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? readAiRuns() : [];
  const aiRunReport = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? buildAiRunHistoryReport() : { totals: { runs: 0, unreviewed: 0 }, waste_signals: [] };
  const promptCompositions = readStateArray(".kabeeri/prompt_layer/compositions.json", "compositions");
  const liveReports = fileExists(".kabeeri/reports/live_reports_state.json") ? readJsonFile(".kabeeri/reports/live_reports_state.json") : null;
  const usage = summarizeUsage();
  const appSummaries = business.app_summaries || buildCustomerAppSummaries(apps, features, journeys, tasks, usage);
  const workspaceSummaries = business.workspaces || [];
  const workstreamSummaries = business.workstreams || [];
  const dashboardActionItems = buildDashboardActionItems({
    technical,
    business,
    records: {
      vibe_captures: vibeCaptures,
      agile: agileState,
      structured: structuredState,
      adrs: adrRecords,
      ai_run_report: aiRunReport
      , agile_live: agileLiveState
      , structured_live: structuredLiveState
    }
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kabeeri VDF Dashboard</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #202124; background: #f6f7f9; }
    header { background: #1f2937; color: white; padding: 20px 28px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; }
    .metric { font-size: 30px; font-weight: 700; }
    .muted { color: #5f6b7a; font-size: 13px; }
    .source-note { margin-top: 8px; font-size: 13px; color: #d7e8ff; }
    .section-help { margin: -6px 0 12px; color: #5f6b7a; font-size: 13px; max-width: 920px; }
    .table-wrap { width: 100%; overflow-x: auto; margin-bottom: 24px; }
    .empty-state { color: #5f6b7a; font-style: italic; }
    .severity-blocker { color: #991b1b; font-weight: 700; }
    .severity-warning { color: #92400e; font-weight: 700; }
    .severity-info { color: #1d4ed8; font-weight: 700; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 18px 0 0; }
    select { min-width: 220px; border: 1px solid #9aa7b6; border-radius: 6px; padding: 8px 10px; background: white; color: #202124; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9dee7; margin-bottom: 24px; }
    th, td { text-align: left; border-bottom: 1px solid #e7ebf0; padding: 10px; font-size: 14px; }
    th { background: #eef2f7; }
    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
    .live { display: inline-block; margin-top: 8px; font-size: 13px; color: #c7f9cc; }
  </style>
</head>
<body>
  <header>
    <h1>Kabeeri VDF Dashboard</h1>
    <div>Generated at ${escapeHtml(technical.generated_at || new Date().toISOString())}</div>
    <div class="live">Live endpoint: <code>/__kvdf/api/state</code> · Task tracker: <code>/__kvdf/api/tasks</code> · Agile: <code>/__kvdf/api/agile</code> · Reports: <code>/__kvdf/api/reports</code> · <span id="live-status">checking...</span></div>
    <div class="source-note">Derived view; .kabeeri is the source of truth.</div>
    <div class="toolbar">
      <label for="app-filter">App</label>
      <select id="app-filter">
        <option value="">All apps in this KVDF workspace</option>
        ${appSummaries.map((appItem) => `<option value="${escapeHtml(appItem.username)}">${escapeHtml(appItem.name || appItem.username)} (${escapeHtml(appItem.username)})</option>`).join("")}
      </select>
      <span class="muted">Same-product apps share this workspace. Separate products should be linked as KVDF workspaces or served on their own port.</span>
    </div>
  </header>
  <main>
    <section class="grid">
      ${metricCard("Tasks", tasks.length)}
      ${metricCard("Verified", business.verified_tasks || 0)}
      ${metricCard("Active Tokens", tokens.filter((item) => item.status === "active").length)}
      ${metricCard("Active Locks", locks.filter((item) => item.status === "active").length)}
      ${metricCard("Policy Blocks", policyResults.filter((item) => item.status === "blocked").length)}
      ${metricCard("Context Packs", contextPacks.length)}
      ${metricCard("Preflight Approvals", preflights.filter((item) => item.approval_required).length)}
      ${metricCard("Handoff Packages", handoffPackages.length)}
      ${metricCard("Security Blocks", securityScans.filter((item) => item.status === "blocked").length)}
      ${metricCard("Migration Blocks", migrationChecks.filter((item) => item.status === "blocked").length)}
      ${metricCard("Vibe Suggestions", vibeSuggestions.length)}
      ${metricCard("Vibe Sessions", vibeSessions.length)}
      ${metricCard("Agile Stories", agileState.stories.length)}
      ${metricCard("Ready Stories", agileState.stories.filter((item) => item.ready_status === "ready").length)}
      ${metricCard("Agile Health", agileLiveState.summary ? agileLiveState.summary.health : "unknown")}
      ${metricCard("Structured Reqs", structuredState.requirements.length)}
      ${metricCard("Structured Health", structuredLiveState.summary ? structuredLiveState.summary.health : "unknown")}
      ${metricCard("ADRs", adrRecords.length)}
      ${metricCard("AI Runs", aiRuns.length)}
      ${metricCard("Unreviewed Runs", aiRunReport.totals.unreviewed || 0)}
      ${metricCard("Composed Prompts", promptCompositions.length)}
      ${metricCard("AI Tokens", usage.total_tokens)}
      ${metricCard("AI Cost", `${usage.total_cost} ${usage.currency}`)}
      ${metricCard("Untracked Cost", `${usage.tracked_vs_untracked && usage.tracked_vs_untracked.untracked ? usage.tracked_vs_untracked.untracked.cost : 0} ${usage.currency}`)}
      ${metricCard("Apps", appSummaries.length)}
      ${metricCard("Workstreams", workstreamSummaries.length)}
      ${metricCard("KVDF Workspaces", workspaceSummaries.length || 1)}
      ${metricCard("Developer Mode", business.developer_mode ? business.developer_mode.mode || "unset" : "unset")}
    </section>
    <section>
      <h2>Action Center</h2>
      ${htmlTable(["Severity", "Area", "Message", "Next Action"], dashboardActionItems.map((item) => [`<span class="severity-${item.severity}">${item.severity}</span>`, item.area, item.message, item.next_action]), { trustedHtmlColumns: [0] })}
    </section>
    <section>
      <h2>Task Tracker Live Board</h2>
      ${htmlTable(["Status", "Count"], Object.entries((business.task_tracker_status || {})).map(([status, count]) => [status, count]))}
      ${htmlTable(["Task", "Status", "Apps", "Workstreams", "Assignee", "Tokens", "Locks", "Usage Cost", "Blockers", "Next Action"], (business.task_tracker && business.task_tracker.tasks ? business.task_tracker.tasks : tasks).map((task) => [
        task.id,
        task.status,
        ((task.app_usernames || []).join(",") || task.app_username || ""),
        ((task.workstreams || (task.workstream ? [task.workstream] : [])).join(",")),
        task.assignee_id || "",
        (task.active_tokens || []).length || 0,
        (task.active_locks || []).length || 0,
        task.usage ? task.usage.cost || 0 : 0,
        (task.blockers || []).join(","),
        task.next_action || ""
      ]))}
    </section>
    <section>
      <h2>Live Reports</h2>
      ${renderLiveReportsDashboard(liveReports)}
    </section>
    <section>
      <h2>Applications</h2>
      ${htmlTable(["App", "Type", "Product", "Path", "Status", "Features", "Journeys", "Tasks", "Open", "Route"], appSummaries.map((item) => [item.name || item.username, item.app_type, item.product_name, item.path, item.status, `${item.ready_features}/${item.features_total}`, `${item.ready_journeys}/${item.journeys_total}`, item.tasks_total, item.open_tasks, item.public_url]))}
    </section>
    <section>
      <h2>App Boundary Governance</h2>
      ${htmlTable(["Boundary", "Product", "Apps", "Rule", "Evidence"], [[project.project_scope || "single_product_multi_app", project.product_name || project.name || "", appSummaries.length, project.forbid_unrelated_apps === false ? "unrelated apps allowed" : "unrelated apps blocked", "tasks and AI sessions are checked against registered app paths"]])}
    </section>
    <section>
      <h2>Workstream Governance</h2>
      ${htmlTable(["Workstream", "Status", "Paths", "Tasks", "Open", "Sessions", "Tokens", "Cost"], workstreamSummaries.map((item) => [item.name || item.id, item.status, (item.path_rules || []).join(", "), item.tasks_total, item.open_tasks, item.sessions_total, item.ai_usage ? item.ai_usage.tokens || 0 : 0, item.ai_usage ? item.ai_usage.cost || 0 : 0]))}
    </section>
    <section>
      <h2>Execution Scopes</h2>
      ${htmlTable(["Token", "Task", "Assignee", "Mode", "Workstreams", "Apps", "Allowed Files", "Warnings"], tokens.map((item) => [item.token_id, item.task_id, item.assignee_id, item.scope_mode || "manual", (item.workstreams || []).join(","), (item.app_usernames || []).join(","), (item.allowed_files || []).join(","), (item.scope_warnings || []).join("; ")]))}
    </section>
    <section>
      <h2>Vibe-first Suggestions</h2>
      ${htmlTable(["Suggestion", "Title", "Workstream", "Risk", "Status", "Task"], vibeSuggestions.map((item) => [item.suggestion_id, item.title, item.workstream, item.risk_level, item.status, item.task_id || ""]))}
    </section>
    <section>
      <h2>Post-work Captures</h2>
      ${htmlTable(["Capture", "Task", "Classification", "Workstreams", "Files", "Missing Evidence", "Status", "Next Action"], vibeCaptures.slice(-20).reverse().map((item) => [item.capture_id, item.task_id || "", item.classification, (item.detected_workstreams || []).join(","), (item.files_changed || []).join(","), (item.missing_evidence || []).join(","), item.status, item.recommended_next_action || ""]))}
    </section>
    <section>
      <h2>Vibe Sessions and Briefs</h2>
      ${htmlTable(["Session", "Title", "Status", "Intents", "Suggestions", "Captures"], vibeSessions.map((item) => [item.session_id, item.title || "", item.status, (item.intent_ids || []).length, (item.suggestion_ids || []).length, (item.capture_ids || []).length]))}
      ${htmlTable(["Brief", "Generated", "Current Session", "Open Suggestions", "Open Tasks"], contextBriefs.slice(-10).reverse().map((item) => [item.brief_id, item.generated_at, item.current_vibe_session || "", (item.open_suggestions || []).length, (item.open_tasks || []).length]))}
    </section>
    <section>
      <h2>Agile Backlog and Stories</h2>
      <p>Live JSON: <code>.kabeeri/dashboard/agile_state.json</code> · API: <code>/__kvdf/api/agile</code></p>
      ${htmlTable(["Severity", "Area", "Message", "Next Action"], (agileLiveState.action_items || []).map((item) => [item.severity, item.area, item.message, item.next_action]))}
      ${htmlTable(["Story", "Epic", "Sprint", "Points", "Ready", "Status", "Task", "Title"], agileState.stories.map((item) => [item.story_id, item.epic_id || "", item.sprint_id || "", item.estimate_points || 0, item.ready_status || "not_ready", item.status || "", item.task_id || "", item.title || ""]))}
      ${htmlTable(["Review", "Sprint", "Accepted Points", "Rework Points", "Decision"], agileState.sprint_reviews.slice(-10).reverse().map((item) => [item.review_id, item.sprint_id, item.accepted_points || 0, item.rework_points || 0, item.owner_decision || ""]))}
      ${htmlTable(["Impediment", "Severity", "Status", "Sprint", "Story", "Owner", "Title"], (agileState.impediments || []).filter((item) => item.status !== "resolved").map((item) => [item.impediment_id, item.severity, item.status, item.sprint_id || "", item.story_id || "", item.owner_id || "", item.title]))}
    </section>
    <section>
      <h2>Structured Delivery</h2>
      <p>Live JSON: <code>.kabeeri/dashboard/structured_state.json</code> - API: <code>/__kvdf/api/structured</code></p>
      ${htmlTable(["Severity", "Area", "Message", "Next Action"], (structuredLiveState.action_items || []).map((item) => [item.severity, item.area, item.message, item.next_action]))}
      ${htmlTable(["Requirement", "Type", "Priority", "Approval", "Phase", "Tasks", "Title"], structuredState.requirements.map((item) => [item.requirement_id, item.type, item.priority, item.approval_status || "", item.phase_id || "", (item.task_ids || []).join(","), item.title]))}
      ${htmlTable(["Phase", "Status", "Gate", "Requirements", "Tasks", "Title"], structuredState.phases.map((item) => [item.phase_id, item.status, item.gate_status || "", (item.requirement_ids || []).length, (item.task_ids || []).length, item.title]))}
      ${htmlTable(["Risk", "Severity", "Status", "Owner", "Title"], structuredState.risks.filter((item) => item.status === "open").map((item) => [item.risk_id, item.severity, item.status, item.owner_id || "", item.title]))}
    </section>
    <section>
      <h2>ADR and AI Run History</h2>
      ${htmlTable(["ADR", "Status", "Impact", "Title", "Tasks"], adrRecords.map((item) => [item.adr_id, item.status, item.impact || "", item.title || "", (item.related_tasks || []).join(",")]))}
      ${htmlTable(["Run", "Status", "Task", "Developer", "Model", "Tokens", "Cost"], aiRuns.slice(-20).reverse().map((item) => [item.run_id, item.status || "recorded", item.task_id || "", item.developer_id || "", `${item.provider || ""}/${item.model || ""}`, item.total_tokens || 0, item.cost || 0]))}
      ${htmlTable(["Severity", "Signal", "Count", "Next Action"], (aiRunReport.waste_signals || []).map((item) => [item.severity, item.signal, item.count || 0, item.next_action]))}
    </section>
    <section>
      <h2>Common Prompt Layer</h2>
      ${htmlTable(["Composition", "Pack", "Task", "Context", "Prompt", "Tokens", "Output"], promptCompositions.slice(-20).reverse().map((item) => [item.composition_id, item.pack, item.task_id || "", item.context_pack_id || "", item.selected_prompt || "", item.estimated_tokens || 0, item.output_path || ""]))}
    </section>
    <section>
      <h2>KVDF Workspaces</h2>
      ${htmlTable(["Workspace", "Mode", "Boundary", "Product", "Apps", "Tasks", "Open", "Policy Blocks", "Security Blocks", "Root"], workspaceSummaries.map((item) => [item.name, item.current ? "current" : "linked", item.boundary_mode || "", item.product_name || "", item.apps_total, item.tasks_total, item.open_tasks, item.policy_blocks, item.security_blocks, item.root]))}
    </section>
    <section>
      <h2>Feature Readiness</h2>
      ${htmlTable(["ID", "Title", "Readiness", "Audience", "Tasks"], features.map((featureItem) => [featureItem.id, featureItem.title, featureItem.readiness, featureItem.audience || "", (featureItem.task_ids || []).join(",")]))}
    </section>
    <section>
      <h2>User Journeys</h2>
      ${htmlTable(["ID", "Name", "Status", "Audience", "Steps"], journeys.map((journeyItem) => [journeyItem.id, journeyItem.name, journeyItem.status, journeyItem.audience || "", (journeyItem.steps || []).join(" -> ")]))}
    </section>
    <section>
      <h2>Tasks</h2>
      ${htmlTable(["ID", "Title", "App", "Status", "Assignee", "Workstream"], tasks.map((task) => [task.id, task.title, (task.app_usernames || []).join(",") || task.app_username || "", task.status, task.assignee_id || "", task.workstream || ""]))}
    </section>
    <section>
      <h2>Active Locks</h2>
      ${htmlTable(["Lock", "Type", "Scope", "Task", "Owner"], locks.filter((item) => item.status === "active").map((item) => [item.lock_id, item.type, item.scope, item.task_id, item.owner_id]))}
    </section>
    <section>
      <h2>AI Usage by Task</h2>
      ${htmlTable(["Task", "Events", "Tokens", "Cost"], Object.entries(usage.by_task).map(([task, item]) => [task, item.events, item.tokens, item.cost]))}
    </section>
    <section>
      <h2>Tracked vs Untracked AI Usage</h2>
      ${htmlTable(["Type", "Events", "Tokens", "Cost"], Object.entries(usage.tracked_vs_untracked || {}).map(([type, item]) => [type, item.events, item.tokens, item.cost]))}
    </section>
    <section>
      <h2>Policy Results</h2>
      ${htmlTable(["Time", "Policy", "Subject", "Stage", "Status", "Blockers"], policyResults.slice(-20).reverse().map((item) => [item.evaluated_at, item.policy_id, item.subject_id, item.stage, item.status, (item.blockers || []).map((blocker) => blocker.check_id).join(", ")]))}
    </section>
    <section>
      <h2>Cost Preflights</h2>
      ${htmlTable(["Time", "Task", "Risk", "Budget", "Model", "Approval"], preflights.slice(-20).reverse().map((item) => [item.created_at, item.task_id, item.risk_level, item.budget_status, item.recommended_model_class, item.approval_required]))}
    </section>
    <section>
      <h2>Handoff Packages</h2>
      ${htmlTable(["Package", "Audience", "Status", "Output", "Created"], handoffPackages.slice(-20).reverse().map((item) => [item.package_id, item.audience, item.status, item.output_dir, item.created_at]))}
    </section>
    <section>
      <h2>Security Scans</h2>
      ${htmlTable(["Scan", "Status", "Findings", "Critical", "High", "Generated"], securityScans.slice(-20).reverse().map((item) => [item.scan_id, item.status, item.findings_total, item.severity_counts.critical || 0, item.severity_counts.high || 0, item.generated_at]))}
    </section>
    <section>
      <h2>Migration Safety</h2>
      ${htmlTable(["Plan", "Status", "From", "To", "Risk", "Rollback"], migrationPlans.slice(-20).reverse().map((item) => [item.plan_id, item.status, item.from_version || "", item.to_version || "", item.risk_level, item.rollback_plan_id || ""]))}
    </section>
    <section>
      <h2>Developer Token Efficiency</h2>
      ${htmlTable(["Developer", "Events", "Tokens", "Cost", "Accepted", "Rejected", "Rework"], Object.entries(buildDeveloperEfficiency().by_developer).map(([developer, item]) => [developer, item.events, item.tokens, item.cost, item.accepted_cost, item.rejected_cost, item.rework_cost]))}
    </section>
    <section>
      <h2>Developer Mode</h2>
      ${htmlTable(["Mode", "Developer", "Role", "Workstreams"], [[business.developer_mode ? business.developer_mode.mode || "unset" : "unset", business.developer_mode ? business.developer_mode.solo_developer_id || "" : "", business.developer_mode ? business.developer_mode.role || "" : "", business.developer_mode ? (business.developer_mode.workstreams || []).join(", ") : ""]])}
    </section>
  </main>
  <script>
    let dashboardFingerprint = null;

    const appFilter = document.getElementById("app-filter");
    if (appFilter) {
      appFilter.addEventListener("change", () => {
        if (appFilter.value) window.location.href = "/customer/apps/" + encodeURIComponent(appFilter.value);
      });
    }

    const dashboardDescriptions = {
      "Action Center": "The first place to look. It explains blockers, warnings, and next actions derived from readiness, governance, reports, and task state.",
      "Task Tracker Live Board": "Shows every governed task, its current status, assignee, active tokens, locks, usage, blockers, and the next recommended move.",
      "Live Reports": "Summarizes readiness, governance, package, security, migration, Agile, Structured, and dashboard UX state from live JSON files.",
      "Applications": "Lists registered apps inside this KVDF workspace so same-product apps stay connected while unrelated products remain separate.",
      "App Boundary Governance": "Explains whether this workspace is single-app, same-product multi-app, or blocked from unrelated app work.",
      "Workstream Governance": "Connects tasks, sessions, token usage, and folders to backend, frontend, mobile, QA, docs, and other workstreams.",
      "Execution Scopes": "Shows task access tokens and the file boundaries each AI assistant or developer is allowed to touch.",
      "Vibe-first Suggestions": "Natural-language requests that became reviewable task cards instead of immediate implementation.",
      "Post-work Captures": "Detects work done outside the normal task flow and shows whether it was linked, converted, resolved, or still ungoverned.",
      "Vibe Sessions and Briefs": "Groups natural-language intents, suggestions, captures, and context briefs so a resumed AI session knows where to continue.",
      "Agile Backlog and Stories": "Scrum-style backlog, stories, reviews, and impediments for iterative delivery.",
      "Structured Delivery": "Waterfall-style requirements, phases, gates, risks, and approvals for predictable enterprise delivery.",
      "ADR and AI Run History": "Records architectural decisions and AI runs so reasoning, cost, and review status stay auditable.",
      "Common Prompt Layer": "Tracks composed prompt packs and task-specific context to reduce repeated tokens and inconsistent instructions.",
      "KVDF Workspaces": "Shows the current workspace and any linked KVDF workspaces for developers running multiple products side by side.",
      "Feature Readiness": "Maps user-visible features to readiness states so demos and releases do not depend on vague progress claims.",
      "User Journeys": "Shows end-user flows and whether they are ready to show, test, or hand off.",
      "Tasks": "Raw task list from .kabeeri/tasks.json, useful when checking the source records behind the live board.",
      "Active Locks": "Files or scopes currently reserved by a task to prevent developers or AI tools from overwriting each other.",
      "AI Usage by Task": "Token and cost totals grouped by task, including admin operation buckets when no task exists.",
      "Tracked vs Untracked AI Usage": "Separates governed task usage from admin, inquiry, planning, or other non-task AI usage.",
      "Policy Results": "Latest policy gate evaluations that can block unsafe execution, review, release, or publishing.",
      "Cost Preflights": "AI cost estimates and approval requirements before expensive work begins.",
      "Handoff Packages": "Delivery bundles prepared for owners, reviewers, developers, or clients.",
      "Security Scans": "Security checks and severity counts that affect readiness and release confidence.",
      "Migration Safety": "Database or system migration plans, risk levels, and rollback visibility.",
      "Developer Token Efficiency": "Token cost and accepted/rejected/rework signals by developer or AI assistant.",
      "Developer Mode": "Shows whether the workspace is solo or team mode and which workstreams are owned."
    };

    document.querySelectorAll("main section > h2").forEach((heading) => {
      const text = heading.textContent.trim();
      if (!dashboardDescriptions[text] || heading.nextElementSibling?.classList?.contains("section-help")) return;
      const help = document.createElement("p");
      help.className = "section-help";
      help.textContent = dashboardDescriptions[text];
      heading.insertAdjacentElement("afterend", help);
    });

    function stableDashboardFingerprint(state) {
      return JSON.stringify(state, (key, value) => key === "generated_at" ? undefined : value);
    }

    async function refreshLiveMetrics() {
      try {
        const response = await fetch("/__kvdf/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const state = await response.json();
        document.title = "Kabeeri VDF Dashboard - " + state.generated_at;
        const nextFingerprint = stableDashboardFingerprint(state);
        const status = document.getElementById("live-status");
        if (status) status.textContent = "live, last checked " + new Date().toLocaleTimeString();
        if (dashboardFingerprint && dashboardFingerprint !== nextFingerprint) {
          window.location.reload();
          return;
        }
        dashboardFingerprint = nextFingerprint;
      } catch (_) {
        /* Static exports keep working without the local live API. */
      }
    }
    refreshLiveMetrics();
    setInterval(refreshLiveMetrics, 3000);
  </script>
</body>
</html>
`;
}

function metricCard(label, value) {
  return `<div class="card"><div>${escapeHtml(label)}</div><div class="metric">${escapeHtml(value)}</div></div>`;
}

function renderLiveReportsDashboard(liveReports) {
  if (!liveReports || !liveReports.summary) {
    return `<p class="empty-state">No live reports state yet. Run <code>kvdf reports live</code> to generate <code>.kabeeri/reports/live_reports_state.json</code>.</p>`;
  }
  const summary = liveReports.summary || {};
  const actionItems = liveReports.action_items || [];
  return `
    <section class="grid">
      ${metricCard("Status", summary.status || "unknown")}
      ${metricCard("Readiness", summary.readiness || "unknown")}
      ${metricCard("Governance", summary.governance || "unknown")}
      ${metricCard("Package", summary.package || "unknown")}
      ${metricCard("Security", summary.security || "unknown")}
      ${metricCard("Migration", summary.migration || "unknown")}
    </section>
    <p>Live JSON: <code>${escapeHtml(liveReports.live_json_path || ".kabeeri/reports/live_reports_state.json")}</code></p>
    ${htmlTable(["Severity", "Area", "Message", "Next Action"], actionItems.map((item) => [
      item.severity,
      item.area,
      item.message,
      item.next_action
    ]))}
  `;
}

function htmlTable(headers, rows, options = {}) {
  const trusted = new Set(options.trustedHtmlColumns || []);
  if (!rows.length) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody><tr><td class="empty-state" colspan="${headers.length}">No records</td></tr></tbody></table></div>`;
  }
  return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, index) => `<td>${trusted.has(index) ? String(row[index] || "") : escapeHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportCustomerAppPages() {
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  for (const appItem of apps) {
    writeTextFile(`.kabeeri/site/customer/apps/${appItem.username}/index.html`, buildCustomerAppHtml(appItem));
  }
}

function serveSite(port, options = {}) {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const homeFile = path.join(repoRoot(), ".kabeeri", "site", "index.html");
  const dashboardFile = path.join(repoRoot(), ".kabeeri", "site", "__kvdf", "dashboard", "index.html");
  const autoPort = String(port).toLowerCase() === "auto" || options["auto-port"] === true || options["auto-port"] === "true";
  const startPort = autoPort ? Number(options.start || options["start-port"] || 4177) : Number(port || 4177);

  function start(currentPort) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${currentPort}`);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    let file = null;
    if (pathname === "/" || pathname === "/index.html") {
      file = homeFile;
    } else if (pathname === "/__kvdf/dashboard" || pathname === "/__kvdf/dashboard/index.html") {
      const state = collectDashboardState(options);
      writeDashboardStateFiles(state);
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(buildDashboardHtml());
      return;
    } else if (pathname === "/__kvdf/api/state") {
      const state = collectDashboardState(options);
      writeDashboardStateFiles(state);
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(state, null, 2));
      return;
    } else if (pathname === "/__kvdf/api/tasks" || pathname === "/__kvdf/api/task-tracker") {
      const state = collectDashboardState(options);
      writeDashboardStateFiles(state);
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(state.task_tracker, null, 2));
      return;
    } else if (pathname === "/__kvdf/api/reports" || pathname === "/__kvdf/api/live-reports") {
      const state = refreshLiveReportsState();
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(state, null, 2));
      return;
    } else if (pathname === "/__kvdf/api/agile") {
      const state = refreshAgileDashboardState();
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(state, null, 2));
      return;
    } else if (pathname === "/__kvdf/api/structured") {
      const state = refreshStructuredDashboardState();
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify(state, null, 2));
      return;
    } else {
      const match = pathname.match(/^\/customer\/apps\/([^/]+)$/);
      if (match) {
        const username = match[1];
        try {
          normalizePublicUsername(username);
          const appFile = path.join(repoRoot(), ".kabeeri", "site", "customer", "apps", username, "index.html");
          if (fs.existsSync(appFile)) file = appFile;
        } catch (_) {
          file = null;
        }
      }
    }
    if (!file || !fs.existsSync(file)) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(file, "utf8"));
  });
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && autoPort && currentPort < startPort + 100) {
      server.close();
      start(currentPort + 1);
      return;
    }
    throw error;
  });
  server.listen(currentPort, "127.0.0.1", () => {
    console.log(`Kabeeri customer page running at http://127.0.0.1:${currentPort}/`);
    console.log(`Private dashboard running at http://127.0.0.1:${currentPort}/__kvdf/dashboard`);
    console.log(`Live state API running at http://127.0.0.1:${currentPort}/__kvdf/api/state`);
  });
  }

  start(startPort);
}

function generateVerificationReport(task) {
  const tokens = (readJsonFile(".kabeeri/tokens.json").tokens || []).filter((token) => token.task_id === task.id);
  const locks = (readJsonFile(".kabeeri/locks.json").locks || []).filter((lockItem) => lockItem.task_id === task.id);
  const usage = summarizeUsage().by_task[task.id] || { events: 0, tokens: 0, cost: 0 };
  const lines = [
    `# Final Verification Report - ${task.id}`,
    "",
    `Task: ${task.title}`,
    `Status: ${task.status}`,
    `Assignee: ${task.assignee_id || ""}`,
    `Reviewer: ${task.reviewer_id || ""}`,
    `Owner: ${task.verified_by || ""}`,
    `Verified at: ${task.verified_at || ""}`,
    "",
    "## Acceptance Criteria",
    ...(task.acceptance_criteria || []).map((item) => `- ${item}`),
    "",
    "## Tokens",
    ...tokens.map((token) => `- ${token.token_id}: ${token.status}`),
    "",
    "## Locks",
    ...locks.map((lockItem) => `- ${lockItem.lock_id}: ${lockItem.status} (${lockItem.scope})`),
    "",
    "## AI Usage",
    `Events: ${usage.events}`,
    `Tokens: ${usage.tokens}`,
    `Cost: ${usage.cost}`
  ];
  writeTextFile(`.kabeeri/reports/${task.id}.verification.md`, `${lines.join("\n")}\n`);
}

function summarizeBy(items, key) {
  return items.reduce((summary, item) => {
    const value = item[key] || "unknown";
    summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function revokeTaskTokens(taskId, reason) {
  const file = ".kabeeri/tokens.json";
  const data = readJsonFile(file);
  let changed = false;
  for (const token of data.tokens || []) {
    if (token.task_id === taskId && token.status === "active") {
      token.status = "revoked";
      token.revoked_at = new Date().toISOString();
      token.revocation_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function releaseTaskLocks(taskId, reason) {
  const file = ".kabeeri/locks.json";
  const data = readJsonFile(file);
  let changed = false;
  for (const item of data.locks || []) {
    if (item.task_id === taskId && item.status === "active") {
      item.status = "released";
      item.released_at = new Date().toISOString();
      item.release_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function token(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/tokens.json";
  const data = readJsonFile(file);
  data.tokens = data.tokens || [];

  if (!action || action === "list") {
    console.log(table(["Token", "Task", "Assignee", "Scope", "Status"], data.tokens.map((item) => [item.token_id, item.task_id, item.assignee_id, item.scope_mode || "manual", item.status])));
    return;
  }

  if (action === "show" || action === "status") {
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const tokenItem = data.tokens.find((item) => item.token_id === tokenId);
    if (!tokenItem) throw new Error(`Token not found: ${tokenId}`);
    console.log(JSON.stringify(tokenItem, null, 2));
    return;
  }

  if (action === "issue") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "issue token");
    const taskId = flags.task || value;
    const assignee = flags.assignee;
    if (!taskId) throw new Error("Missing --task.");
    if (!assignee) throw new Error("Missing --assignee.");
    assertTokenCanBeIssued(taskId, assignee);
    const scope = buildExecutionScope(taskId, flags);
    const token = {
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null,
      workstreams: scope.workstreams,
      app_usernames: scope.app_usernames,
      allowed_files: scope.allowed_files,
      forbidden_files: scope.forbidden_files,
      scope_mode: scope.scope_mode,
      scope_source: scope.scope_source,
      scope_warnings: scope.scope_warnings,
      max_usage_tokens: flags["max-usage-tokens"] ? Number(flags["max-usage-tokens"]) : null,
      max_cost: flags["max-cost"] ? Number(flags["max-cost"]) : null,
      budget_approval_required: Boolean(flags["budget-approval-required"])
    };
    data.tokens.push(token);
    writeJsonFile(file, data);
    appendAudit("access_token.issued", "token", token.token_id, `Token issued for ${taskId}`);
    console.log(`Issued token ${token.token_id}`);
    return;
  }

  if (action === "revoke") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "revoke token");
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const token = data.tokens.find((item) => item.token_id === tokenId);
    if (!token) throw new Error(`Token not found: ${tokenId}`);
    token.status = "revoked";
    token.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("access_token.revoked", "token", token.token_id, `Token revoked`);
    console.log(`Revoked token ${token.token_id}`);
    return;
  }

  if (action === "reissue") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "reissue token");
    const tokenId = value || flags.id;
    if (!tokenId) throw new Error("Missing token id.");
    const previous = data.tokens.find((item) => item.token_id === tokenId);
    if (!previous) throw new Error(`Token not found: ${tokenId}`);
    if (previous.status === "active" && !flags.force) {
      throw new Error("Cannot reissue an active token without --force.");
    }
    const taskId = flags.task || previous.task_id;
    const assignee = flags.assignee || previous.assignee_id;
    assertTokenCanBeIssued(taskId, assignee);
    const scope = buildExecutionScope(taskId, flags, previous);
    const token = {
      ...previous,
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || previous.expires_at || null,
      workstreams: scope.workstreams,
      app_usernames: scope.app_usernames,
      allowed_files: scope.allowed_files,
      forbidden_files: scope.forbidden_files,
      scope_mode: scope.scope_mode,
      scope_source: scope.scope_source,
      scope_warnings: scope.scope_warnings,
      max_usage_tokens: flags["max-usage-tokens"] ? Number(flags["max-usage-tokens"]) : previous.max_usage_tokens || null,
      max_cost: flags["max-cost"] ? Number(flags["max-cost"]) : previous.max_cost || null,
      budget_approval_required: flags["budget-approval-required"] !== undefined ? Boolean(flags["budget-approval-required"]) : Boolean(previous.budget_approval_required),
      reissued_from: previous.token_id,
      reissue_reason: flags.reason || "",
      revoked_at: undefined,
      revocation_reason: undefined
    };
    data.tokens.push(token);
    writeJsonFile(file, data);
    appendAudit("access_token.reissued", "token", token.token_id, `Token reissued from ${previous.token_id}`);
    console.log(`Reissued token ${token.token_id} from ${previous.token_id}`);
    return;
  }

  throw new Error(`Unknown token action: ${action}`);
}

function buildExecutionScope(taskId, flags = {}, previous = null) {
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  const workstreams = taskWorkstreams(taskItem).filter((item) => item !== "unassigned");
  validateKnownWorkstreams(workstreams);
  const appUsernames = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
  const explicitAllowed = flags["allowed-files"] ? parseCsv(flags["allowed-files"]) : null;
  const explicitForbidden = flags["forbidden-files"] ? parseCsv(flags["forbidden-files"]) : null;
  const autoAllowed = deriveExecutionAllowedFiles(taskItem, workstreams);
  const allowedFiles = explicitAllowed || (previous && !flags["auto-scope"] ? previous.allowed_files || [] : autoAllowed);
  const forbiddenFiles = explicitForbidden || (previous && !flags["forbidden-files"] ? previous.forbidden_files || [] : defaultForbiddenFiles());
  const scopeMode = explicitAllowed ? "manual" : "auto";
  const warnings = [];
  if (allowedFiles.length === 0) warnings.push("token has no allowed_files; execution falls back to app/workstream/session gates");
  if (explicitAllowed) {
    const broad = findPathsOutsideDerivedScope(explicitAllowed, autoAllowed);
    if (broad.length > 0 && !flags["allow-broad-scope"]) {
      throw new Error(`Token scope is broader than task app/workstream boundaries: ${broad.join(", ")}. Use --allow-broad-scope for an audited override.`);
    }
    if (broad.length > 0) warnings.push(`broad scope override: ${broad.join(", ")}`);
  }
  return {
    workstreams,
    app_usernames: appUsernames,
    allowed_files: allowedFiles,
    forbidden_files: forbiddenFiles,
    scope_mode: scopeMode,
    scope_source: explicitAllowed && warnings.some((item) => item.startsWith("broad scope override"))
      ? "manual_allowed_files_override"
      : explicitAllowed ? "manual_allowed_files" : "task_app_and_workstream_boundaries",
    scope_warnings: warnings
  };
}

function deriveExecutionAllowedFiles(taskItem, workstreams) {
  const appPaths = getTaskAppPaths(taskItem);
  const workstreamPaths = workstreams.flatMap((stream) => getWorkstreamPathRules(stream));
  if (appPaths.length > 0 && workstreamPaths.length > 0) {
    const scoped = [];
    for (const appPath of appPaths) {
      const appScope = normalizeLockScope(appPath);
      for (const streamPath of workstreamPaths) {
        const streamScope = normalizeLockScope(streamPath);
        if (!streamScope) continue;
        if (pathScopeContains(appScope, streamScope)) scoped.push(streamScope);
        else if (pathScopeContains(streamScope, appScope)) scoped.push(appScope);
      }
    }
    if (scoped.length > 0) return uniqueList(scoped);
  }
  return uniqueList([...appPaths, ...workstreamPaths].map((item) => normalizePathRule(item)).filter(Boolean));
}

function defaultForbiddenFiles() {
  return [".env", ".env.*", "secrets/", ".kabeeri/owner_auth.json", ".kabeeri/session.json"];
}

function findPathsOutsideDerivedScope(requested, derived) {
  if (!derived || derived.length === 0) return [];
  return requested.filter((item) => {
    const target = normalizeLockScope(item);
    return !derived.some((scope) => {
      const normalized = normalizeLockScope(scope);
      return target === normalized || pathScopeContains(normalized, target) || pathScopeContains(target, normalized);
    });
  });
}

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function assertTokenCanBeIssued(taskId, assigneeId) {
  const taskItem = getTaskById(taskId);
  if (!taskItem) throw new Error(`Task not found: ${taskId}`);
  assertAssigneeCanTakeTask(assigneeId, taskItem);
  if (hasConfiguredIdentities()) {
    const identity = getIdentity(assigneeId);
    if (!identity) throw new Error(`Unknown assignee: ${assigneeId}`);
    if (taskItem.assignee_id && taskItem.assignee_id !== assigneeId) {
      throw new Error(`Token assignee mismatch: ${taskId} is assigned to ${taskItem.assignee_id}.`);
    }
  }
}

function budget(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/ai_usage/budget_approvals.json";
  if (!fileExists(file)) writeJsonFile(file, { approvals: [] });
  const data = readJsonFile(file);
  data.approvals = data.approvals || [];

  if (!action || action === "list") {
    console.log(table(["Approval", "Task", "Status", "Tokens", "Cost", "Expires"], data.approvals.map((item) => [
      item.approval_id,
      item.task_id,
      item.status,
      item.extra_tokens || "",
      item.extra_cost || "",
      item.expires_at || ""
    ])));
    return;
  }

  if (action === "approve") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "approve budget overrun");
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const approval = {
      approval_id: `budget-approval-${String(data.approvals.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      status: "active",
      extra_tokens: flags.tokens ? Number(flags.tokens) : null,
      extra_cost: flags.cost ? Number(flags.cost) : null,
      reason: flags.reason || "",
      approved_by: getEffectiveActor(flags) || getOwnerActor(flags),
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null
    };
    data.approvals.push(approval);
    writeJsonFile(file, data);
    appendAudit("budget.approved", "task", taskId, `Budget overrun approved: ${approval.approval_id}`);
    console.log(`Approved budget overrun ${approval.approval_id}`);
    return;
  }

  if (action === "revoke") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "revoke budget approval");
    const id = flags.id || value;
    if (!id) throw new Error("Missing approval id.");
    const approval = data.approvals.find((item) => item.approval_id === id);
    if (!approval) throw new Error(`Budget approval not found: ${id}`);
    approval.status = "revoked";
    approval.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("budget.revoked", "task", approval.task_id, `Budget approval revoked: ${id}`);
    console.log(`Revoked budget approval ${id}`);
    return;
  }

  throw new Error(`Unknown budget action: ${action}`);
}

function contextPack(action, value, flags = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const file = ".kabeeri/ai_usage/context_packs.json";
  const data = readJsonFile(file);
  data.context_packs = data.context_packs || [];

  if (!action || action === "list") {
    console.log(table(["Context Pack", "Task", "Workstream", "Tokens", "Cost"], data.context_packs.map((item) => [
      item.context_pack_id,
      item.task_id,
      item.workstream || "",
      item.estimated_tokens || 0,
      item.estimated_cost || 0
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing context pack id.");
    const item = data.context_packs.find((entry) => entry.context_pack_id === id);
    if (!item) throw new Error(`Context pack not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "create") {
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    const allowedFiles = parseCsv(flags["allowed-files"]);
    const forbiddenFiles = parseCsv(flags["forbidden-files"] || ".env,secrets/,.git/");
    const inputTokens = Number(flags["input-tokens"] || flags.tokens || estimateContextPackTokens(taskItem, allowedFiles));
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const provider = flags.provider || "unknown";
    const model = flags.model || "unknown";
    const cost = calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens });
    const id = flags.id || `ctx-${String(data.context_packs.length + 1).padStart(3, "0")}`;
    if (data.context_packs.some((entry) => entry.context_pack_id === id)) throw new Error(`Context pack already exists: ${id}`);
    const pack = {
      context_pack_id: id,
      task_id: taskId,
      source_reference: taskItem.source || flags.source || "manual",
      workstream: taskItem.workstream || "unassigned",
      goal: flags.goal || taskItem.title,
      allowed_files: allowedFiles,
      forbidden_files: forbiddenFiles,
      required_specs: parseCsv(flags.specs),
      acceptance_criteria: taskItem.acceptance_criteria || [],
      memory_summary: getMemorySummaryText(),
      open_questions: parseCsv(flags.questions || flags["open-questions"]),
      estimated_tokens: inputTokens + outputTokens + cachedTokens,
      estimated_input_tokens: inputTokens,
      estimated_output_tokens: outputTokens,
      estimated_cached_tokens: cachedTokens,
      estimated_cost: flags.cost !== undefined ? Number(flags.cost || 0) : cost.cost,
      cost_source: flags.cost !== undefined ? "manual" : cost.source,
      currency: flags.currency || getPricingCurrency() || "USD",
      created_at: new Date().toISOString()
    };
    data.context_packs.push(pack);
    writeJsonFile(file, data);
    writeTextFile(`.kabeeri/ai_usage/${id}.context.md`, buildContextPackMarkdown(pack));
    appendAudit("context_pack.created", "context_pack", id, `Context pack created for ${taskId}`);
    console.log(JSON.stringify(pack, null, 2));
    return;
  }

  throw new Error(`Unknown context-pack action: ${action}`);
}

function preflight(action, value, flags = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const file = ".kabeeri/ai_usage/cost_preflights.json";
  const data = readJsonFile(file);
  data.preflights = data.preflights || [];

  if (!action || action === "list") {
    console.log(table(["Preflight", "Task", "Risk", "Budget", "Model", "Approval"], data.preflights.map((item) => [
      item.preflight_id,
      item.task_id,
      item.risk_level,
      item.budget_status,
      item.recommended_model_class,
      item.approval_required
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing preflight id.");
    const item = data.preflights.find((entry) => entry.preflight_id === id);
    if (!item) throw new Error(`Preflight not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "estimate") {
    const taskId = flags.task || value;
    if (!taskId) throw new Error("Missing --task.");
    const taskItem = getTaskById(taskId);
    if (!taskItem) throw new Error(`Task not found: ${taskId}`);
    const contextPackId = flags.context || flags["context-pack"] || findLatestContextPackForTask(taskId);
    const pack = contextPackId ? getContextPack(contextPackId) : null;
    const inputTokens = Number(flags["input-tokens"] || (pack ? pack.estimated_input_tokens || pack.estimated_tokens || 0 : estimateContextPackTokens(taskItem, [])));
    const outputTokens = Number(flags["output-tokens"] || 3500);
    const cachedTokens = Number(flags["cached-tokens"] || (pack ? pack.estimated_cached_tokens || 0 : 0));
    const provider = flags.provider || "unknown";
    const model = flags.model || "unknown";
    const cost = calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens });
    const riskLevel = flags.risk || inferTaskRisk(taskItem);
    const taskKind = flags.kind || inferTaskKind(taskItem, riskLevel);
    const route = recommendModelRoute(taskKind, riskLevel);
    const estimatedCost = flags.cost !== undefined ? Number(flags.cost || 0) : cost.cost;
    const budget = getTaskBudget(taskId);
    const budgetStatus = budget.max_cost && estimatedCost > budget.max_cost ? "over_budget" : budget.max_usage_tokens && (inputTokens + outputTokens + cachedTokens) > budget.max_usage_tokens ? "over_budget" : "within_budget";
    const broadContext = Boolean(flags["broad-context"]) || inputTokens > 30000;
    const approvalRequired = budgetStatus === "over_budget" || broadContext || ["high", "critical"].includes(riskLevel) || route.recommended_model_class === "premium";
    const preflightItem = {
      preflight_id: flags.id || `preflight-${String(data.preflights.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      context_pack_id: contextPackId || null,
      requested_action: taskKind,
      risk_level: riskLevel,
      estimated_input_tokens: inputTokens,
      estimated_output_tokens: outputTokens,
      estimated_cached_tokens: cachedTokens,
      estimated_cost: estimatedCost,
      cost_source: flags.cost !== undefined ? "manual" : cost.source,
      currency: flags.currency || getPricingCurrency() || "USD",
      budget_status: budgetStatus,
      recommended_path: broadContext ? "split_context_first" : "context_pack_first",
      recommended_model_class: route.recommended_model_class,
      split_recommended: broadContext || inputTokens + outputTokens > 50000,
      approval_required: approvalRequired,
      reason: route.reason,
      created_at: new Date().toISOString()
    };
    data.preflights.push(preflightItem);
    writeJsonFile(file, data);
    appendAudit("cost_preflight.created", "preflight", preflightItem.preflight_id, `Cost preflight created for ${taskId}`);
    console.log(JSON.stringify(preflightItem, null, 2));
    return;
  }

  throw new Error(`Unknown preflight action: ${action}`);
}

function modelRoute(action, value, flags = {}) {
  ensureWorkspace();
  ensureCostControlState();
  const routes = readJsonFile(".kabeeri/ai_usage/model_routing.json").routes || [];

  if (!action || action === "list") {
    console.log(table(["Task Kind", "Model Class", "Reason"], routes.map((item) => [item.task_kind, item.recommended_model_class, item.reason])));
    return;
  }

  if (action === "recommend") {
    const taskKind = flags.kind || value || "implementation";
    const risk = flags.risk || "medium";
    console.log(JSON.stringify(recommendModelRoute(taskKind, risk), null, 2));
    return;
  }

  throw new Error(`Unknown model-route action: ${action}`);
}

function ensureCostControlState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "ai_usage"), { recursive: true });
  if (!fileExists(".kabeeri/ai_usage/context_packs.json")) writeJsonFile(".kabeeri/ai_usage/context_packs.json", { context_packs: [] });
  if (!fileExists(".kabeeri/ai_usage/cost_preflights.json")) writeJsonFile(".kabeeri/ai_usage/cost_preflights.json", { preflights: [] });
  if (!fileExists(".kabeeri/ai_usage/model_routing.json")) {
    writeJsonFile(".kabeeri/ai_usage/model_routing.json", {
      routes: [
        { task_kind: "intent_classification", recommended_model_class: "cheap", reason: "Short classification can use low-cost models or local rules." },
        { task_kind: "context_pack_generation", recommended_model_class: "cheap", reason: "File lists, summaries, and acceptance extraction should be inexpensive." },
        { task_kind: "standard_docs_spec", recommended_model_class: "balanced", reason: "Documentation synthesis needs quality but usually does not require premium reasoning." },
        { task_kind: "implementation", recommended_model_class: "balanced", reason: "Production code changes usually need stronger reasoning than simple classification." },
        { task_kind: "security_review", recommended_model_class: "premium", reason: "Security review has higher risk and benefits from stronger reasoning." },
        { task_kind: "owner_verify", recommended_model_class: "human_only", reason: "Final verification is Owner-only." }
      ]
    });
  }
}

function estimateContextPackTokens(taskItem, allowedFiles) {
  const base = 1200;
  const acceptance = (taskItem.acceptance_criteria || []).join(" ").length * 0.35;
  const fileCost = (allowedFiles || []).length * 450;
  return Math.ceil(base + acceptance + fileCost);
}

function getMemorySummaryText() {
  if (fileExists(".kabeeri/memory/memory_summary.json")) {
    const summary = readJsonFile(".kabeeri/memory/memory_summary.json");
    return JSON.stringify(summary);
  }
  return "No memory summary generated yet.";
}

function buildContextPackMarkdown(pack) {
  return `# Task Context Pack - ${pack.context_pack_id}

Task: ${pack.task_id}
Workstream: ${pack.workstream}
Goal: ${pack.goal}

## Allowed Files

${pack.allowed_files.length ? pack.allowed_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Forbidden Files

${pack.forbidden_files.length ? pack.forbidden_files.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Required Specs

${pack.required_specs.length ? pack.required_specs.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Acceptance Criteria

${pack.acceptance_criteria.length ? pack.acceptance_criteria.map((item) => `- ${item}`).join("\n") : "- None listed."}

## Memory Summary

${pack.memory_summary}

## Open Questions

${pack.open_questions.length ? pack.open_questions.map((item) => `- ${item}`).join("\n") : "- None recorded."}

## Estimate

- Tokens: ${pack.estimated_tokens}
- Cost: ${pack.estimated_cost} ${pack.currency}
- Cost source: ${pack.cost_source}
`;
}

function getPricingCurrency() {
  if (!fileExists(".kabeeri/ai_usage/pricing_rules.json")) return "USD";
  return readJsonFile(".kabeeri/ai_usage/pricing_rules.json").currency || "USD";
}

function findLatestContextPackForTask(taskId) {
  const packs = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs").filter((item) => item.task_id === taskId);
  return packs.length ? packs[packs.length - 1].context_pack_id : null;
}

function getContextPack(id) {
  const pack = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs").find((item) => item.context_pack_id === id);
  if (!pack) throw new Error(`Context pack not found: ${id}`);
  return pack;
}

function inferTaskRisk(taskItem) {
  const text = `${taskItem.title || ""} ${taskItem.workstream || ""} ${(taskItem.workstreams || []).join(" ")}`.toLowerCase();
  if (/security|secret|payment|stripe|migration|release|publish|production|privacy/.test(text)) return "high";
  return "medium";
}

function inferTaskKind(taskItem, riskLevel) {
  if (riskLevel === "high") return "security_review";
  const text = `${taskItem.title || ""} ${taskItem.source || ""}`.toLowerCase();
  if (/doc|spec|documentation/.test(text)) return "standard_docs_spec";
  return "implementation";
}

function recommendModelRoute(taskKind, risk) {
  const routes = readJsonFile(".kabeeri/ai_usage/model_routing.json").routes || [];
  const route = routes.find((item) => item.task_kind === taskKind) || routes.find((item) => item.task_kind === "implementation") || {
    task_kind: taskKind,
    recommended_model_class: "balanced",
    reason: "No exact route exists, so balanced is the safe default."
  };
  if (["high", "critical"].includes(risk) && !["human_only", "premium"].includes(route.recommended_model_class)) {
    return { ...route, risk_level: risk, recommended_model_class: "premium", reason: `${route.reason} Risk is ${risk}, so premium review is recommended.` };
  }
  return { ...route, risk_level: risk };
}

function getTaskBudget(taskId) {
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens").filter((item) => item.task_id === taskId && item.status === "active");
  const active = tokens[0] || {};
  return {
    max_usage_tokens: active.max_usage_tokens || null,
    max_cost: active.max_cost || null
  };
}

function handoff(action, value, flags = {}) {
  ensureWorkspace();
  ensureHandoffState();
  const file = ".kabeeri/handoff/packages.json";
  const data = readJsonFile(file);
  data.packages = data.packages || [];

  if (!action || action === "list") {
    console.log(table(["Package", "Audience", "Status", "Output", "Created"], data.packages.map((item) => [
      item.package_id,
      item.audience,
      item.status,
      item.output_dir,
      item.created_at
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing handoff package id.");
    const item = data.packages.find((entry) => entry.package_id === id);
    if (!item) throw new Error(`Handoff package not found: ${id}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  if (action === "package" || action === "generate") {
    const id = flags.id || value || `handoff-${String(data.packages.length + 1).padStart(3, "0")}`;
    assertSafeName(id);
    if (data.packages.some((entry) => entry.package_id === id)) throw new Error(`Handoff package already exists: ${id}`);
    const outputDir = (flags.output || `.kabeeri/handoff/${id}`).replace(/\\/g, "/").replace(/\/$/, "");
    const audience = normalizeHandoffAudience(flags.audience || "owner");
    runPolicyGate("handoff", { packageId: id, audience }, flags);
    const state = collectDashboardState();
    const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
    const usageSummary = summarizeUsage();
    const packageItem = {
      package_id: id,
      audience,
      status: "generated",
      output_dir: outputDir,
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString(),
      files: [
        `${outputDir}/00_INDEX.md`,
        `${outputDir}/01_BUSINESS_SUMMARY.md`,
        `${outputDir}/02_TECHNICAL_SUMMARY.md`,
        `${outputDir}/03_FEATURE_READINESS.md`,
        `${outputDir}/04_PRODUCTION_PUBLISH_STATUS.md`,
        `${outputDir}/05_AI_COST_SUMMARY.md`,
        `${outputDir}/06_NEXT_ROADMAP.md`
      ]
    };
    writeTextFile(packageItem.files[0], buildHandoffIndex(packageItem, project));
    writeTextFile(packageItem.files[1], buildBusinessHandoffSummary(state, project));
    writeTextFile(packageItem.files[2], buildTechnicalHandoffSummary(state, project));
    writeTextFile(packageItem.files[3], buildFeatureReadinessReport(state));
    writeTextFile(packageItem.files[4], buildProductionPublishReport(state));
    writeTextFile(packageItem.files[5], buildAiCostHandoffReport(usageSummary, state));
    writeTextFile(packageItem.files[6], buildNextRoadmapReport(state));
    data.packages.push(packageItem);
    writeJsonFile(file, data);
    appendAudit("handoff.generated", "handoff", id, `Handoff package generated: ${outputDir}`);
    console.log(`Generated handoff package ${id}: ${outputDir}`);
    return;
  }

  throw new Error(`Unknown handoff action: ${action}`);
}

function ensureHandoffState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "handoff"), { recursive: true });
  if (!fileExists(".kabeeri/handoff/packages.json")) writeJsonFile(".kabeeri/handoff/packages.json", { packages: [] });
}

function normalizeHandoffAudience(value) {
  const normalized = String(value || "owner").toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["client", "owner", "internal", "team"]);
  if (!allowed.has(normalized)) throw new Error("Invalid handoff audience. Use client, owner, internal, or team.");
  return normalized;
}

function buildHandoffIndex(packageItem, project) {
  return `# Kabeeri Handoff Package - ${packageItem.package_id}

Project: ${project.name || project.framework || "Kabeeri project"}
Audience: ${packageItem.audience}
Generated at: ${packageItem.created_at}

## Files

- [Business Summary](01_BUSINESS_SUMMARY.md)
- [Technical Summary](02_TECHNICAL_SUMMARY.md)
- [Feature Readiness](03_FEATURE_READINESS.md)
- [Production Vs Publish Status](04_PRODUCTION_PUBLISH_STATUS.md)
- [AI Cost Summary](05_AI_COST_SUMMARY.md)
- [Next Roadmap](06_NEXT_ROADMAP.md)

## Owner Note

This package is generated from local .kabeeri governance state. Owner approval is still required before final delivery, release, publish, or scope closure.
`;
}

function buildBusinessHandoffSummary(state, project) {
  const business = state.business;
  const readyFeatures = (business.features || []).filter((item) => ["ready_to_demo", "ready_to_publish"].includes(item.readiness));
  const readyJourneys = (business.journeys || []).filter((item) => item.ready_to_show || item.status === "ready_to_show");
  return `# Business Handoff Summary

## Project

- Name: ${project.name || project.framework || "Kabeeri project"}
- Profile: ${project.profile || ""}
- Delivery mode: ${project.delivery_mode || ""}
- Language: ${project.language || ""}
- Version: ${project.version || ""}

## Readiness Snapshot

- Total tasks: ${business.tasks_total || 0}
- Owner verified tasks: ${business.verified_tasks || 0}
- Ready features: ${readyFeatures.length}
- Ready journeys: ${readyJourneys.length}
- AI usage cost: ${business.ai_usage_cost || 0}
- AI usage tokens: ${business.ai_usage_tokens || 0}

## Ready To Show

${readyFeatures.length ? readyFeatures.map((item) => `- ${item.title} (${item.readiness})`).join("\n") : "- No ready features recorded yet."}

## Ready Journeys

${readyJourneys.length ? readyJourneys.map((item) => `- ${item.name} (${item.status})`).join("\n") : "- No ready journeys recorded yet."}
`;
}

function buildTechnicalHandoffSummary(state, project) {
  const technical = state.technical;
  return `# Technical Handoff Summary

## Project Metadata

- Framework: ${project.framework || "Not recorded"}
- Profile: ${project.profile || "Not recorded"}
- Delivery mode: ${project.delivery_mode || "Not recorded"}
- Engine version: ${project.version || "Not recorded"}

## Governance State

- Task status: ${JSON.stringify(technical.tasks || {})}
- Active locks: ${(technical.active_locks || []).length}
- Active tokens: ${(technical.active_tokens || []).length}
- Session status: ${JSON.stringify(technical.sessions || {})}
- Policy status: ${JSON.stringify(technical.policies || {})}
- Context packs: ${technical.context_packs || 0}
- Cost preflight status: ${JSON.stringify(technical.cost_preflights || {})}

## Developers

${(technical.developers || []).length ? technical.developers.map((item) => `- ${item.id}: ${item.display_name || item.name || ""} (${item.role || ""})`).join("\n") : "- No human developers recorded."}

## AI Agents

${(technical.agents || []).length ? technical.agents.map((item) => `- ${item.id}: ${item.display_name || item.name || ""} (${item.role || ""})`).join("\n") : "- No AI agents recorded."}
`;
}

function buildFeatureReadinessReport(state) {
  const features = state.records.features || [];
  const tasks = state.records.tasks || [];
  const taskMap = Object.fromEntries(tasks.map((item) => [item.id, item]));
  const rows = features.map((featureItem) => {
    const evidence = (featureItem.task_ids || []).map((taskId) => `${taskId}:${taskMap[taskId] ? taskMap[taskId].status : "missing"}`).join(", ") || "-";
    return `| ${featureItem.id} | ${featureItem.title} | ${featureItem.readiness} | ${evidence} | ${featureItem.audience || ""} |`;
  });
  return `# Feature Readiness Report

| ID | Feature | Readiness | Evidence | Audience |
| --- | --- | --- | --- | --- |
${rows.length ? rows.join("\n") : "| - | No features recorded | - | - | - |"}
`;
}

function buildProductionPublishReport(state) {
  const tasks = state.records.tasks || [];
  const activeLocks = (state.records.locks || []).filter((item) => item.status === "active");
  const activeTokens = (state.records.tokens || []).filter((item) => item.status === "active");
  const blockedPolicies = (state.records.policy_results || []).filter((item) => item.status === "blocked");
  const unverifiedTasks = tasks.filter((item) => item.status !== "owner_verified");
  const publishStatus = blockedPolicies.length || activeLocks.length || activeTokens.length || unverifiedTasks.length ? "not_ready_to_publish" : "ready_to_publish";
  return `# Production Vs Publish Status

Status: ${publishStatus}

## Blocking Signals

- Unverified tasks: ${unverifiedTasks.length}
- Active locks: ${activeLocks.length}
- Active tokens: ${activeTokens.length}
- Blocked policy results: ${blockedPolicies.length}

## Notes

Kabeeri treats publish as an Owner-governed decision. A clean report does not deploy or publish by itself.
`;
}

function buildAiCostHandoffReport(usage, state) {
  const preflights = state.records.cost_preflights || [];
  return `# AI Token Cost Summary

## Totals

- Events: ${usage.total_events}
- Tokens: ${usage.total_tokens}
- Cost: ${usage.total_cost} ${usage.currency}
- Input tokens: ${usage.input_tokens}
- Output tokens: ${usage.output_tokens}
- Cached tokens: ${usage.cached_tokens}

## By Task

${handoffObjectTable(["Task", "Events", "Tokens", "Cost"], usage.by_task)}

## By Developer

${handoffObjectTable(["Developer", "Events", "Tokens", "Cost"], usage.by_developer)}

## Cost Preflights

${preflights.length ? preflights.map((item) => `- ${item.preflight_id}: ${item.task_id}, ${item.budget_status}, approval_required=${item.approval_required}`).join("\n") : "- No cost preflights recorded."}
`;
}

function buildNextRoadmapReport(state) {
  const tasks = state.records.tasks || [];
  const features = state.records.features || [];
  const blockedPolicies = (state.records.policy_results || []).filter((item) => item.status === "blocked");
  const candidates = tasks.filter((item) => !["owner_verified", "rejected"].includes(item.status)).slice(0, 20);
  const futureFeatures = features.filter((item) => ["future", "needs_review"].includes(item.readiness)).slice(0, 20);
  return `# Next Roadmap

## Task Candidates

${candidates.length ? candidates.map((item) => `- ${item.id}: ${item.title} (${item.status})`).join("\n") : "- No open task candidates recorded."}

## Feature Candidates

${futureFeatures.length ? futureFeatures.map((item) => `- ${item.id}: ${item.title} (${item.readiness})`).join("\n") : "- No future or needs-review features recorded."}

## Governance Follow-Ups

${blockedPolicies.length ? blockedPolicies.map((item) => `- Resolve policy blockers for ${item.subject_id}: ${(item.blockers || []).map((blocker) => blocker.check_id).join(", ")}`).join("\n") : "- No blocked policy results recorded."}
`;
}

function handoffObjectTable(headers, data) {
  const entries = Object.entries(data || {});
  if (!entries.length) return "| Name | Events | Tokens | Cost |\n| --- | ---: | ---: | ---: |\n| - | 0 | 0 | 0 |";
  return `| ${headers.join(" | ")} |\n| --- | ---: | ---: | ---: |\n${entries.map(([key, item]) => `| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} |`).join("\n")}`;
}

function security(action, value, flags = {}) {
  ensureWorkspace();
  ensureSecurityState();
  const file = ".kabeeri/security/security_scans.json";
  const data = readJsonFile(file);
  data.scans = data.scans || [];

  if (!action || action === "list") {
    console.log(table(["Scan", "Status", "Findings", "Critical", "High", "Generated"], data.scans.map((item) => [
      item.scan_id,
      item.status,
      item.findings_total,
      item.severity_counts.critical || 0,
      item.severity_counts.high || 0,
      item.generated_at
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value || (data.scans.length ? data.scans[data.scans.length - 1].scan_id : null);
    if (!id) throw new Error("No security scan exists yet.");
    const scan = data.scans.find((item) => item.scan_id === id);
    if (!scan) throw new Error(`Security scan not found: ${id}`);
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  if (action === "scan") {
    const scan = runSecurityScan(flags);
    data.scans.push(scan);
    writeJsonFile(file, data);
    writeJsonFile(".kabeeri/security/latest_security_scan.json", scan);
    writeTextFile(".kabeeri/security/latest_security_report.md", buildSecurityReport(scan));
    appendAudit("security.scan", "security", scan.scan_id, `Security scan completed: ${scan.status}`);
    console.log(JSON.stringify(scan, null, 2));
    return;
  }

  if (action === "report") {
    const id = flags.id || value || (data.scans.length ? data.scans[data.scans.length - 1].scan_id : null);
    if (!id) throw new Error("No security scan exists yet.");
    const scan = data.scans.find((item) => item.scan_id === id);
    if (!scan) throw new Error(`Security scan not found: ${id}`);
    const output = flags.output || `.kabeeri/security/${id}.security.md`;
    writeTextFile(output, buildSecurityReport(scan));
    appendAudit("security.report", "security", id, `Security report written: ${output}`);
    console.log(`Wrote security report: ${output}`);
    return;
  }

  if (action === "gate") {
    const scan = runSecurityScan(flags);
    data.scans.push(scan);
    writeJsonFile(file, data);
    writeJsonFile(".kabeeri/security/latest_security_scan.json", scan);
    writeTextFile(".kabeeri/security/latest_security_report.md", buildSecurityReport(scan));
    appendAudit("security.gate", "security", scan.scan_id, `Security gate evaluated: ${scan.status}`);
    if (scan.status === "blocked") {
      throw new Error(`Security gate blocked: ${scan.blockers.length} blocker finding(s). Run kvdf security report --id ${scan.scan_id}.`);
    }
    console.log(`Security gate passed: ${scan.scan_id}`);
    return;
  }

  throw new Error(`Unknown security action: ${action}`);
}

function ensureSecurityState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "security"), { recursive: true });
  if (!fileExists(".kabeeri/security/security_scans.json")) writeJsonFile(".kabeeri/security/security_scans.json", { scans: [] });
  if (!fileExists(".kabeeri/security/security_readiness.json")) writeJsonFile(".kabeeri/security/security_readiness.json", { checks: [] });
}

function runSecurityScan(flags = {}) {
  const fs = require("fs");
  const path = require("path");
  const root = repoRoot();
  const include = parseCsv(flags.include || "");
  const exclude = new Set([
    ".git",
    "node_modules",
    ".kabeeri/security",
    ".kabeeri/site",
    "vendor",
    "storage/logs",
    "dist",
    "build",
    "coverage",
    ...parseCsv(flags.exclude || "")
  ].map(normalizeScanPath));
  const files = [];
  const maxBytes = Number(flags["max-bytes"] || 300000);

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = normalizeScanPath(path.relative(root, fullPath));
      if (!relative) continue;
      if (isScanExcluded(relative, exclude)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (include.length > 0 && !include.some((item) => relative.startsWith(normalizeScanPath(item)))) continue;
        if (isLikelyTextFile(relative) && fs.statSync(fullPath).size <= maxBytes) files.push({ fullPath, relative });
      }
    }
  }

  walk(root);
  const findings = [];
  for (const fileItem of files) {
    const fileName = fileItem.relative.split("/").pop() || "";
    if (fileName === ".env") {
      findings.push({
        finding_id: `finding-${String(findings.length + 1).padStart(3, "0")}`,
        rule_id: "env_file_committed",
        severity: "high",
        file: fileItem.relative,
        line: 1,
        message: "A real .env file should not be committed or shared with AI tools.",
        evidence: "[file path only]"
      });
    }
    const content = fs.readFileSync(fileItem.fullPath, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of securityScanRules()) {
        if (rule.pattern.test(line)) {
          findings.push({
            finding_id: `finding-${String(findings.length + 1).padStart(3, "0")}`,
            rule_id: rule.id,
            severity: rule.severity,
            file: fileItem.relative,
            line: index + 1,
            message: rule.message,
            evidence: redactSecretEvidence(line)
          });
        }
      }
    });
  }

  const severityCounts = summarizeBy(findings, "severity");
  const blockers = findings.filter((item) => ["critical", "high"].includes(item.severity));
  return {
    scan_id: flags.id || `security-scan-${Date.now()}`,
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "blocked" : findings.length > 0 ? "warning" : "pass",
    files_scanned: files.length,
    findings_total: findings.length,
    severity_counts: severityCounts,
    blockers,
    findings,
    rules: securityScanRules().map((rule) => ({ rule_id: rule.id, severity: rule.severity, message: rule.message })),
    notes: [
      "This is a lightweight KVDF pattern scan, not a replacement for a professional security scanner.",
      "Do not send files with blocker findings to AI tools until reviewed."
    ]
  };
}

function securityScanRules() {
  return [
    { id: "private_key", severity: "critical", message: "Private key material appears in a file.", pattern: /-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i },
    { id: "openai_api_key", severity: "critical", message: "OpenAI-style API key appears in a file.", pattern: /\bsk-(proj-)?[A-Za-z0-9_-]{20,}\b/ },
    { id: "stripe_secret_key", severity: "critical", message: "Stripe secret key appears in a file.", pattern: /\bsk_(live|test)_[A-Za-z0-9]{16,}\b/ },
    { id: "github_token", severity: "critical", message: "GitHub token appears in a file.", pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/ },
    { id: "aws_access_key", severity: "critical", message: "AWS access key appears in a file.", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: "env_file_committed", severity: "high", message: "A real .env file should not be committed or shared with AI tools.", pattern: /a^/ },
    { id: "generic_secret_assignment", severity: "high", message: "Potential secret assignment found.", pattern: /\b(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|db[_-]?password)\b\s*[:=]\s*['"]?[^'"\s]{8,}/i }
  ];
}

function normalizeScanPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "");
}

function isScanExcluded(relative, exclude) {
  const normalized = normalizeScanPath(relative);
  return [...exclude].some((item) => normalized === item || normalized.startsWith(`${item}/`));
}

function isLikelyTextFile(relative) {
  const name = relative.split("/").pop() || "";
  if (name === ".env" || name.startsWith(".env.")) return true;
  const blocked = /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|gz|tar|7z|exe|dll|bin|woff|woff2|ttf|docx|xlsx|pptx)$/i;
  return !blocked.test(relative);
}

function redactSecretEvidence(line) {
  const trimmed = String(line || "").trim();
  if (trimmed.length <= 12) return "[redacted]";
  return `${trimmed.slice(0, 8)}...[redacted]...${trimmed.slice(-4)}`;
}

function buildSecurityReport(scan) {
  const lines = [
    `# Security Scan Report - ${scan.scan_id}`,
    "",
    `Generated at: ${scan.generated_at}`,
    `Status: ${scan.status}`,
    `Files scanned: ${scan.files_scanned}`,
    `Findings: ${scan.findings_total}`,
    "",
    "## Severity Counts",
    "",
    `- critical: ${scan.severity_counts.critical || 0}`,
    `- high: ${scan.severity_counts.high || 0}`,
    `- medium: ${scan.severity_counts.medium || 0}`,
    `- low: ${scan.severity_counts.low || 0}`,
    "",
    "## Findings",
    "",
    "| Severity | Rule | File | Line | Message | Evidence |",
    "| --- | --- | --- | ---: | --- | --- |"
  ];
  if (scan.findings.length === 0) {
    lines.push("| pass | - | - | 0 | No findings. | - |");
  } else {
    for (const finding of scan.findings) {
      lines.push(`| ${finding.severity} | ${finding.rule_id} | ${finding.file} | ${finding.line} | ${finding.message} | ${finding.evidence.replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("", "## Guidance", "", "- Rotate any real secret that was committed or shared.", "- Add real secrets to local environment stores, not repository files.", "- Use `.env.example` for safe placeholder values only.", "- Do not send blocker files to AI tools until reviewed.");
  return `${lines.join("\n")}\n`;
}

function migration(action, value, flags = {}) {
  ensureWorkspace();
  ensureMigrationState();

  if (!action || action === "list") {
    const plans = readStateArray(".kabeeri/migrations/migration_plans.json", "plans");
    console.log(table(["Plan", "Status", "From", "To", "Risk", "Rollback"], plans.map((item) => [
      item.plan_id,
      item.status,
      item.from_version || "",
      item.to_version || "",
      item.risk_level,
      item.rollback_plan_id || ""
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(id);
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (action === "plan") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create migration plan");
    const plansFile = ".kabeeri/migrations/migration_plans.json";
    const data = readJsonFile(plansFile);
    data.plans = data.plans || [];
    const id = flags.id || `migration-plan-${String(data.plans.length + 1).padStart(3, "0")}`;
    if (data.plans.some((item) => item.plan_id === id)) throw new Error(`Migration plan already exists: ${id}`);
    const plan = {
      plan_id: id,
      title: flags.title || value || id,
      status: "planned",
      from_version: flags.from || flags["from-version"] || "",
      to_version: flags.to || flags["to-version"] || "",
      scope: parseCsv(flags.scope || flags.files),
      reason: flags.reason || "",
      risk_level: normalizeMigrationRisk(flags.risk || inferMigrationRisk(flags)),
      backup_reference: flags.backup || flags["backup-reference"] || "",
      rollback_plan_id: null,
      dry_run_required: flags["dry-run-required"] !== "false",
      owner_approval_required: flags["owner-approval-required"] !== "false",
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString()
    };
    data.plans.push(plan);
    writeJsonFile(plansFile, data);
    updateMigrationState({ phase: "planned", pending_migration: id, rollback_available: false, migration_risks: [plan.risk_level] });
    writeTextFile(`.kabeeri/migrations/${id}.plan.md`, buildMigrationPlanMarkdown(plan));
    appendMigrationAudit("migration.plan.created", id, `Migration plan created: ${plan.title}`);
    appendAudit("migration.plan.created", "migration", id, `Migration plan created: ${plan.title}`);
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (action === "rollback-plan" || action === "rollback") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create rollback plan");
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing --plan.");
    const plan = getMigrationPlan(planId);
    const file = ".kabeeri/migrations/rollback_plans.json";
    const data = readJsonFile(file);
    data.rollback_plans = data.rollback_plans || [];
    const id = flags.id || `rollback-plan-${String(data.rollback_plans.length + 1).padStart(3, "0")}`;
    if (data.rollback_plans.some((item) => item.rollback_plan_id === id)) throw new Error(`Rollback plan already exists: ${id}`);
    const rollback = {
      rollback_plan_id: id,
      plan_id: planId,
      status: "planned",
      backup_reference: flags.backup || flags["backup-reference"] || plan.backup_reference || "",
      steps: parseCsv(flags.steps || "restore backup,run rollback migrations,verify application,record audit result"),
      verification: parseCsv(flags.verify || flags.verification || "tests pass,owner reviews critical paths"),
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString()
    };
    data.rollback_plans.push(rollback);
    writeJsonFile(file, data);
    linkRollbackPlan(planId, id, rollback.backup_reference);
    updateMigrationState({ rollback_available: true });
    writeTextFile(`.kabeeri/migrations/${id}.rollback.md`, buildRollbackPlanMarkdown(rollback));
    appendMigrationAudit("migration.rollback_plan.created", planId, `Rollback plan created: ${id}`);
    appendAudit("migration.rollback_plan.created", "migration", planId, `Rollback plan created: ${id}`);
    console.log(JSON.stringify(rollback, null, 2));
    return;
  }

  if (action === "check" || action === "dry-run") {
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(planId);
    const rollback = plan.rollback_plan_id ? getRollbackPlan(plan.rollback_plan_id) : null;
    const result = evaluateMigrationPlan(plan, rollback, flags);
    const file = ".kabeeri/migrations/migration_checks.json";
    const data = readJsonFile(file);
    data.checks = data.checks || [];
    data.checks.push(result);
    writeJsonFile(file, data);
    updateMigrationPlanStatus(planId, result.status === "blocked" ? "blocked" : "checked");
    updateMigrationState({ phase: result.status === "blocked" ? "blocked" : "checked", pending_migration: planId, migration_risks: result.warnings.map((item) => item.check_id) });
    appendMigrationAudit("migration.check", planId, `Migration check: ${result.status}`);
    appendAudit("migration.check", "migration", planId, `Migration check: ${result.status}`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "report") {
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(planId);
    const rollback = plan.rollback_plan_id ? getRollbackPlan(plan.rollback_plan_id) : null;
    const checks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks").filter((item) => item.plan_id === planId);
    const output = flags.output || `.kabeeri/migrations/${planId}.migration_report.md`;
    writeTextFile(output, buildMigrationReport(plan, rollback, checks));
    appendMigrationAudit("migration.report", planId, `Migration report written: ${output}`);
    appendAudit("migration.report", "migration", planId, `Migration report written: ${output}`);
    console.log(`Wrote migration report: ${output}`);
    return;
  }

  if (action === "audit") {
    const events = readJsonFile(".kabeeri/migrations/migration_audit.json").events || [];
    console.log(table(["Time", "Event", "Plan", "Message"], events.map((item) => [item.timestamp, item.event, item.plan_id, item.message])));
    return;
  }

  throw new Error(`Unknown migration action: ${action}`);
}

function ensureMigrationState() {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "migrations"), { recursive: true });
  if (!fileExists(".kabeeri/migrations/migration_plans.json")) writeJsonFile(".kabeeri/migrations/migration_plans.json", { plans: [] });
  if (!fileExists(".kabeeri/migrations/rollback_plans.json")) writeJsonFile(".kabeeri/migrations/rollback_plans.json", { rollback_plans: [] });
  if (!fileExists(".kabeeri/migrations/migration_checks.json")) writeJsonFile(".kabeeri/migrations/migration_checks.json", { checks: [] });
  if (!fileExists(".kabeeri/migrations/migration_audit.json")) writeJsonFile(".kabeeri/migrations/migration_audit.json", { events: [] });
  if (!fileExists(".kabeeri/migration_state.json")) writeJsonFile(".kabeeri/migration_state.json", { phase: "none", pending_migration: null, last_migration: null, rollback_available: false, migration_risks: [] });
  if (!fileExists(".kabeeri/version_compatibility.json")) writeJsonFile(".kabeeri/version_compatibility.json", { created_with_version: VERSION, current_engine_version: VERSION, compatibility_status: "current", migration_required: false, last_migration: null });
}

function normalizeMigrationRisk(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid migration risk. Use low, medium, high, or critical.");
  return normalized;
}

function inferMigrationRisk(flags) {
  const text = `${flags.scope || ""} ${flags.files || ""} ${flags.title || ""}`.toLowerCase();
  if (/database|migration|schema|payment|stripe|production|auth|permission|role|tenant/.test(text)) return "high";
  return "medium";
}

function getMigrationPlan(id) {
  const plan = readStateArray(".kabeeri/migrations/migration_plans.json", "plans").find((item) => item.plan_id === id);
  if (!plan) throw new Error(`Migration plan not found: ${id}`);
  return plan;
}

function getRollbackPlan(id) {
  const rollback = readStateArray(".kabeeri/migrations/rollback_plans.json", "rollback_plans").find((item) => item.rollback_plan_id === id);
  if (!rollback) throw new Error(`Rollback plan not found: ${id}`);
  return rollback;
}

function linkRollbackPlan(planId, rollbackPlanId, backupReference) {
  const file = ".kabeeri/migrations/migration_plans.json";
  const data = readJsonFile(file);
  const plan = (data.plans || []).find((item) => item.plan_id === planId);
  if (!plan) throw new Error(`Migration plan not found: ${planId}`);
  plan.rollback_plan_id = rollbackPlanId;
  if (backupReference) plan.backup_reference = backupReference;
  plan.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function updateMigrationPlanStatus(planId, status) {
  const file = ".kabeeri/migrations/migration_plans.json";
  const data = readJsonFile(file);
  const plan = (data.plans || []).find((item) => item.plan_id === planId);
  if (!plan) throw new Error(`Migration plan not found: ${planId}`);
  plan.status = status;
  plan.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function updateMigrationState(patch) {
  const file = ".kabeeri/migration_state.json";
  const current = fileExists(file) ? readJsonFile(file) : {};
  writeJsonFile(file, { ...current, ...patch, updated_at: new Date().toISOString() });
  const compatibilityFile = ".kabeeri/version_compatibility.json";
  const compatibility = fileExists(compatibilityFile) ? readJsonFile(compatibilityFile) : {};
  writeJsonFile(compatibilityFile, {
    created_with_version: compatibility.created_with_version || VERSION,
    current_engine_version: VERSION,
    compatibility_status: patch.pending_migration ? "migration_pending" : compatibility.compatibility_status || "current",
    migration_required: Boolean(patch.pending_migration || compatibility.migration_required),
    last_migration: compatibility.last_migration || null,
    updated_at: new Date().toISOString()
  });
}

function evaluateMigrationPlan(plan, rollback, flags = {}) {
  const checks = [];
  const add = (check_id, severity, passed, message) => checks.push({ check_id, severity, result: passed ? "pass" : severity === "warn" ? "warn" : "fail", message });
  add("backup_reference_present", "fail", Boolean(plan.backup_reference || flags.backup), "Migration must record a backup reference.");
  add("rollback_plan_present", "fail", Boolean(rollback), "Migration must have a rollback plan.");
  add("scope_present", "fail", (plan.scope || []).length > 0, "Migration scope must list files, folders, database areas, or version areas.");
  add("reason_present", "warn", Boolean(plan.reason), "Migration should explain why the change is needed.");
  add("dry_run_required", "warn", plan.dry_run_required !== false, "Dry-run should remain required unless Owner approves otherwise.");
  add("high_risk_owner_approval", "fail", !["high", "critical"].includes(plan.risk_level) || Boolean(flags.approved || flags["owner-approved"]), "High/critical migrations require Owner approval evidence.");
  const blockers = checks.filter((item) => item.result === "fail" && item.severity === "fail");
  const warnings = checks.filter((item) => item.result === "warn");
  return {
    check_id: flags.id || `migration-check-${Date.now()}`,
    plan_id: plan.plan_id,
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    blockers,
    warnings,
    checks,
    dry_run: true,
    note: "KVDF migration check is a governance dry-run. It does not execute database or file migrations."
  };
}

function appendMigrationAudit(event, planId, message) {
  const file = ".kabeeri/migrations/migration_audit.json";
  const data = fileExists(file) ? readJsonFile(file) : { events: [] };
  data.events = data.events || [];
  data.events.push({ timestamp: new Date().toISOString(), event, plan_id: planId, message });
  writeJsonFile(file, data);
}

function buildMigrationPlanMarkdown(plan) {
  return `# Migration Plan - ${plan.plan_id}

Title: ${plan.title}
Status: ${plan.status}
From version: ${plan.from_version || "not recorded"}
To version: ${plan.to_version || "not recorded"}
Risk: ${plan.risk_level}

## Scope

${(plan.scope || []).length ? plan.scope.map((item) => `- ${item}`).join("\n") : "- No scope recorded."}

## Reason

${plan.reason || "No reason recorded."}

## Safety Requirements

- Backup reference: ${plan.backup_reference || "missing"}
- Rollback plan: ${plan.rollback_plan_id || "missing"}
- Dry-run required: ${plan.dry_run_required}
- Owner approval required: ${plan.owner_approval_required}
`;
}

function buildRollbackPlanMarkdown(rollback) {
  return `# Rollback Plan - ${rollback.rollback_plan_id}

Migration plan: ${rollback.plan_id}
Backup reference: ${rollback.backup_reference || "missing"}

## Steps

${(rollback.steps || []).map((item) => `- ${item}`).join("\n")}

## Verification

${(rollback.verification || []).map((item) => `- ${item}`).join("\n")}
`;
}

function buildMigrationReport(plan, rollback, checks) {
  const latest = checks.length ? checks[checks.length - 1] : null;
  return `# Migration Safety Report - ${plan.plan_id}

## Summary

- Title: ${plan.title}
- Status: ${plan.status}
- Risk: ${plan.risk_level}
- From version: ${plan.from_version || "not recorded"}
- To version: ${plan.to_version || "not recorded"}
- Backup reference: ${plan.backup_reference || "missing"}
- Rollback plan: ${plan.rollback_plan_id || "missing"}
- Latest check: ${latest ? latest.status : "not checked"}

## Scope

${(plan.scope || []).length ? plan.scope.map((item) => `- ${item}`).join("\n") : "- No scope recorded."}

## Latest Check Findings

${latest ? latest.checks.map((item) => `- ${item.result}: ${item.check_id} - ${item.message}`).join("\n") : "- No checks recorded."}

## Rollback

${rollback ? (rollback.steps || []).map((item) => `- ${item}`).join("\n") : "- No rollback plan recorded."}

## Note

This report is a KVDF governance artifact. It does not execute migrations.
`;
}

function usage(action, value, flags) {
  ensureWorkspace();

  if (!action || action === "summary") {
    const summary = summarizeUsage();
    writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summary);
    writeJsonFile(".kabeeri/ai_usage/cost_breakdown.json", {
      by_task: summary.by_task,
      by_developer: summary.by_developer,
      by_workstream: summary.by_workstream,
      by_provider: summary.by_provider,
      by_sprint: summary.by_sprint
    });
    refreshDashboardArtifacts();
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (action === "efficiency") {
    console.log(JSON.stringify(buildDeveloperEfficiency(), null, 2));
    return;
  }

  if (action === "report") {
    return outputLines(buildUsageReport(), flags.output);
  }

  if (action === "list") {
    const events = readUsageEvents();
    console.log(table(["Event", "Task", "Developer", "Tokens", "Cost"], events.map((event) => [
      event.event_id,
      event.task_id || "",
      event.developer_id || "",
      event.total_tokens || 0,
      event.cost || 0
    ])));
    return;
  }

  if (action === "record") {
    return recordUsageEvent(value, flags);
  }

  if (["admin", "inquiry", "question", "planning", "docs"].includes(action)) {
    return recordUsageEvent(value, {
      ...flags,
      untracked: true,
      operation: flags.operation || action,
      source: flags.source || `ai_${action}_usage`
    });
  }

  throw new Error(`Unknown usage action: ${action}`);
}

function recordUsageEvent(value, flags = {}) {
  const isUntracked = Boolean(flags.untracked);
  const operationType = flags.operation || flags.kind || flags.type || (isUntracked ? "untracked" : "task");
  const taskId = flags.task || value || (isUntracked ? `admin:${operationType}` : null);
  const developerId = flags.developer || flags.assignee || flags.actor || (isUntracked ? "untracked" : null);
  if (!taskId) throw new Error("Missing --task.");
  if (!developerId) throw new Error("Missing --developer.");
  const inputTokens = Number(flags["input-tokens"] || 0);
  const outputTokens = Number(flags["output-tokens"] || 0);
  const cachedTokens = Number(flags["cached-tokens"] || 0);
  const totalTokens = inputTokens + outputTokens + cachedTokens;
  const calculated = calculateUsageCost({
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    inputTokens,
    outputTokens,
    cachedTokens
  });
  const cost = flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost;
  const event = {
    event_id: `usage-${Date.now()}`,
    timestamp: new Date().toISOString(),
    task_id: taskId,
    sprint_id: isUntracked ? flags.sprint || null : flags.sprint || getTaskSprint(taskId),
    developer_id: developerId,
    workstream: flags.workstream || (isUntracked ? "admin" : "untracked"),
    provider: flags.provider || "unknown",
    model: flags.model || "unknown",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cached_tokens: cachedTokens,
    total_tokens: totalTokens,
    cost,
    currency: flags.currency || "USD",
    cost_source: flags.cost !== undefined ? "manual" : calculated.source,
    source: flags.source || (isUntracked ? "untracked_ai_usage" : "manual_entry"),
    operation_type: operationType,
    prompt_kind: flags.prompt || flags["prompt-kind"] || operationType,
    tracked: isUntracked ? false : flags.tracked !== "false"
  };
  if (!isUntracked) enforceBudgetApproval(taskId, totalTokens, cost);
  appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", event);
  const summary = summarizeUsage();
  writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summary);
  refreshDashboardArtifacts();
  appendAudit("ai_usage.recorded", isUntracked ? "operation" : "task", taskId, `AI usage recorded: ${totalTokens} tokens`);
  const warning = isUntracked ? null : getBudgetWarning(taskId, summary);
  console.log(`Recorded usage event ${event.event_id}`);
  if (warning) console.log(`WARN ${warning}`);
}

function pricing(action, value, flags) {
  ensureWorkspace();
  const file = ".kabeeri/ai_usage/pricing_rules.json";
  const data = readJsonFile(file);
  data.currency = data.currency || "USD";
  data.providers = data.providers || [];

  if (!action || action === "list") {
    const rows = [];
    for (const provider of data.providers) {
      for (const model of provider.models || []) {
        rows.push([
          provider.name,
          model.name,
          data.currency,
          model.unit || "1M",
          model.input_price || 0,
          model.output_price || 0,
          model.cached_price || 0
        ]);
      }
    }
    console.log(table(["Provider", "Model", "Currency", "Unit", "Input", "Output", "Cached"], rows));
    return;
  }

  if (action === "show") {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (action === "set") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "set pricing");
    const providerName = flags.provider || value;
    const modelName = flags.model;
    if (!providerName) throw new Error("Missing --provider.");
    if (!modelName) throw new Error("Missing --model.");
    const provider = upsertProvider(data, providerName);
    const model = upsertModel(provider, modelName);
    model.unit = normalizePricingUnit(flags.unit || model.unit || "1M");
    model.input_price = Number(flags.input || flags["input-price"] || model.input_price || 0);
    model.output_price = Number(flags.output || flags["output-price"] || model.output_price || 0);
    model.cached_price = Number(flags.cached || flags["cached-price"] || model.cached_price || 0);
    data.currency = flags.currency || data.currency || "USD";
    data.last_updated = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("pricing.updated", "pricing", `${providerName}/${modelName}`, "Pricing rule updated");
    console.log(`Saved pricing for ${providerName}/${modelName}.`);
    return;
  }

  throw new Error(`Unknown pricing action: ${action}`);
}

function upsertProvider(data, providerName) {
  let provider = data.providers.find((item) => item.name === providerName);
  if (!provider) {
    provider = { name: providerName, models: [] };
    data.providers.push(provider);
  }
  return provider;
}

function upsertModel(provider, modelName) {
  provider.models = provider.models || [];
  let model = provider.models.find((item) => item.name === modelName);
  if (!model) {
    model = { name: modelName };
    provider.models.push(model);
  }
  return model;
}

function normalizePricingUnit(unit) {
  const normalized = String(unit).toLowerCase();
  if (["token", "1", "per-token"].includes(normalized)) return "token";
  if (["1k", "k", "1000"].includes(normalized)) return "1K";
  if (["1m", "m", "1000000"].includes(normalized)) return "1M";
  throw new Error("Invalid pricing unit. Use token, 1K, or 1M.");
}

function calculateUsageCost({ provider, model, inputTokens, outputTokens, cachedTokens }) {
  const rules = fileExists(".kabeeri/ai_usage/pricing_rules.json") ? readJsonFile(".kabeeri/ai_usage/pricing_rules.json") : { providers: [] };
  const providerRule = (rules.providers || []).find((item) => item.name === provider);
  const modelRule = providerRule ? (providerRule.models || []).find((item) => item.name === model) : null;
  if (!modelRule) return { cost: 0, source: "missing_pricing_rule" };
  const divisor = pricingDivisor(modelRule.unit || "1M");
  const inputCost = (inputTokens / divisor) * Number(modelRule.input_price || 0);
  const outputCost = (outputTokens / divisor) * Number(modelRule.output_price || 0);
  const cachedCost = (cachedTokens / divisor) * Number(modelRule.cached_price || 0);
  return {
    cost: roundMoney(inputCost + outputCost + cachedCost),
    source: "pricing_rules"
  };
}

function pricingDivisor(unit) {
  if (unit === "token") return 1;
  if (unit === "1K") return 1000;
  return 1000000;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 1000000) / 1000000;
}

function readUsageEvents() {
  const fs = require("fs");
  const path = require("path");
  const file = path.join(repoRoot(), ".kabeeri", "ai_usage", "usage_events.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function summarizeUsage() {
  const events = readUsageEvents();
  const summary = {
    total_events: events.length,
    total_tokens: 0,
    input_tokens: 0,
    output_tokens: 0,
    cached_tokens: 0,
    total_cost: 0,
    currency: events[0] ? events[0].currency : "USD",
    by_task: {},
    by_developer: {},
    by_workstream: {},
    by_provider: {},
    by_sprint: {},
    tracked_vs_untracked: {
      tracked: { events: 0, tokens: 0, cost: 0 },
      untracked: { events: 0, tokens: 0, cost: 0 }
    }
  };

  for (const event of events) {
    const tokens = Number(event.total_tokens || 0);
    const cost = Number(event.cost || 0);
    summary.total_tokens += tokens;
    summary.input_tokens += Number(event.input_tokens || 0);
    summary.output_tokens += Number(event.output_tokens || 0);
    summary.cached_tokens += Number(event.cached_tokens || 0);
    summary.total_cost += cost;
    addUsageBucket(summary.by_task, event.task_id || "untracked", tokens, cost);
    addUsageBucket(summary.by_developer, event.developer_id || "untracked", tokens, cost);
    addUsageBucket(summary.by_workstream, event.workstream || "untracked", tokens, cost);
    addUsageBucket(summary.by_provider, event.provider || "unknown", tokens, cost);
    addUsageBucket(summary.by_sprint, event.sprint_id || "unassigned", tokens, cost);
    const trackedKey = event.tracked === false ? "untracked" : "tracked";
    summary.tracked_vs_untracked[trackedKey].events += 1;
    summary.tracked_vs_untracked[trackedKey].tokens += tokens;
    summary.tracked_vs_untracked[trackedKey].cost += cost;
  }

  return summary;
}

function buildUsageReport() {
  const summary = summarizeUsage();
  const lines = [
    "# Kabeeri AI Usage Cost Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Total events: ${summary.total_events}`,
    `Total tokens: ${summary.total_tokens}`,
    `Total cost: ${summary.total_cost} ${summary.currency}`,
    "",
    "## By Task",
    ...usageMarkdownRows(summary.by_task, "Task"),
    "",
    "## By Developer",
    ...usageMarkdownRows(summary.by_developer, "Developer"),
    "",
    "## By Workstream",
    ...usageMarkdownRows(summary.by_workstream, "Workstream"),
    "",
    "## By Sprint",
    ...usageMarkdownRows(summary.by_sprint, "Sprint"),
    "",
    "## Tracked vs Untracked",
    ...usageMarkdownRows(summary.tracked_vs_untracked, "Type"),
    "",
    "## Developer Efficiency",
    ...developerEfficiencyRows(buildDeveloperEfficiency().by_developer)
  ];
  return lines;
}

function usageMarkdownRows(buckets, label) {
  const rows = [`| ${label} | Events | Tokens | Cost |`, "| --- | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} |`);
  }
  if (rows.length === 2) rows.push(`| none | 0 | 0 | 0 |`);
  return rows;
}

function developerEfficiencyRows(buckets) {
  const rows = ["| Developer | Events | Tokens | Cost | Accepted | Rejected | Rework | Untracked |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"];
  for (const [key, item] of Object.entries(buckets || {})) {
    rows.push(`| ${key} | ${item.events || 0} | ${item.tokens || 0} | ${item.cost || 0} | ${item.accepted_cost || 0} | ${item.rejected_cost || 0} | ${item.rework_cost || 0} | ${item.untracked_cost || 0} |`);
  }
  if (rows.length === 2) rows.push("| none | 0 | 0 | 0 | 0 | 0 | 0 | 0 |");
  return rows;
}

function getTaskSprint(taskId) {
  if (!fileExists(".kabeeri/tasks.json")) return null;
  const task = (readJsonFile(".kabeeri/tasks.json").tasks || []).find((item) => item.id === taskId);
  return task ? task.sprint_id || null : null;
}

function buildSprintSummary(sprintId) {
  const sprints = readStateArray(".kabeeri/sprints.json", "sprints");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const usage = summarizeUsage();
  const sprint = sprints.find((item) => item.id === sprintId) || { id: sprintId, name: sprintId };
  const sprintTasks = tasks.filter((taskItem) => taskItem.sprint_id === sprintId);
  const usageEvents = readUsageEvents().filter((event) => (event.sprint_id || getTaskSprint(event.task_id)) === sprintId);
  const acceptedTasks = sprintTasks.filter((taskItem) => taskItem.status === "owner_verified");
  const reworkEvents = usageEvents.filter((event) => event.source === "rework");

  return {
    sprint,
    tasks_total: sprintTasks.length,
    tasks_verified: acceptedTasks.length,
    total_tokens: usageEvents.reduce((sum, event) => sum + Number(event.total_tokens || 0), 0),
    total_cost: usageEvents.reduce((sum, event) => sum + Number(event.cost || 0), 0),
    usage: usage.by_sprint[sprintId] || { events: 0, tokens: 0, cost: 0 },
    by_task: Object.fromEntries(sprintTasks.map((taskItem) => [taskItem.id, usage.by_task[taskItem.id] || { events: 0, tokens: 0, cost: 0 }])),
    rework_cost: reworkEvents.reduce((sum, event) => sum + Number(event.cost || 0), 0),
    untracked_cost: usageEvents.filter((event) => event.tracked === false).reduce((sum, event) => sum + Number(event.cost || 0), 0)
  };
}

function buildDeveloperEfficiency() {
  const events = readUsageEvents();
  const tasks = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const taskStatus = Object.fromEntries(tasks.map((taskItem) => [taskItem.id, taskItem.status]));
  const byDeveloper = {};
  for (const event of events) {
    const developer = event.developer_id || "untracked";
    byDeveloper[developer] = byDeveloper[developer] || {
      events: 0,
      tokens: 0,
      cost: 0,
      accepted_cost: 0,
      rejected_cost: 0,
      rework_cost: 0,
      untracked_cost: 0
    };
    const bucket = byDeveloper[developer];
    const cost = Number(event.cost || 0);
    bucket.events += 1;
    bucket.tokens += Number(event.total_tokens || 0);
    bucket.cost += cost;
    if (event.tracked === false || !event.task_id || event.task_id === "untracked") bucket.untracked_cost += cost;
    if (event.source === "rework") bucket.rework_cost += cost;
    if (taskStatus[event.task_id] === "owner_verified") bucket.accepted_cost += cost;
    if (taskStatus[event.task_id] === "rejected") bucket.rejected_cost += cost;
  }
  return {
    generated_at: new Date().toISOString(),
    by_developer: byDeveloper
  };
}

function addUsageBucket(target, key, tokens, cost) {
  target[key] = target[key] || { events: 0, tokens: 0, cost: 0 };
  target[key].events += 1;
  target[key].tokens += tokens;
  target[key].cost += cost;
}

function getBudgetWarning(taskId, summary) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const active = tokens.find((token) => token.task_id === taskId && token.status === "active");
  if (!active) return null;
  const taskUsage = summary.by_task[taskId] || { tokens: 0, cost: 0 };
  if (active.max_usage_tokens && taskUsage.tokens > active.max_usage_tokens) {
    return `Task ${taskId} exceeded token budget (${taskUsage.tokens}/${active.max_usage_tokens}).`;
  }
  if (active.max_usage_tokens && taskUsage.tokens >= active.max_usage_tokens * 0.9) {
    return `Task ${taskId} is above 90% token budget (${taskUsage.tokens}/${active.max_usage_tokens}).`;
  }
  if (active.max_cost && taskUsage.cost > active.max_cost) {
    return `Task ${taskId} exceeded cost budget (${taskUsage.cost}/${active.max_cost}).`;
  }
  if (active.max_cost && taskUsage.cost >= active.max_cost * 0.9) {
    return `Task ${taskId} is above 90% cost budget (${taskUsage.cost}/${active.max_cost}).`;
  }
  return null;
}

function enforceBudgetApproval(taskId, newTokens, newCost) {
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const active = tokens.find((token) => token.task_id === taskId && token.status === "active");
  if (!active || !active.budget_approval_required) return;
  const summary = summarizeUsage();
  const current = summary.by_task[taskId] || { tokens: 0, cost: 0 };
  const projectedTokens = Number(current.tokens || 0) + Number(newTokens || 0);
  const projectedCost = Number(current.cost || 0) + Number(newCost || 0);
  const tokenOverrun = active.max_usage_tokens && projectedTokens > active.max_usage_tokens;
  const costOverrun = active.max_cost && projectedCost > active.max_cost;
  if (!tokenOverrun && !costOverrun) return;
  const approval = findActiveBudgetApproval(taskId, {
    extraTokens: tokenOverrun ? projectedTokens - active.max_usage_tokens : 0,
    extraCost: costOverrun ? projectedCost - active.max_cost : 0
  });
  if (!approval) {
    throw new Error(`Budget approval required for ${taskId}. Run \`kvdf budget approve --task ${taskId}\` before recording over-budget usage.`);
  }
}

function findActiveBudgetApproval(taskId, required) {
  const file = ".kabeeri/ai_usage/budget_approvals.json";
  if (!fileExists(file)) return null;
  const approvals = readJsonFile(file).approvals || [];
  return approvals.find((approval) => {
    if (approval.task_id !== taskId || approval.status !== "active") return false;
    if (isExpired(approval.expires_at)) return false;
    if (approval.extra_tokens !== null && approval.extra_tokens !== undefined && required.extraTokens > Number(approval.extra_tokens)) return false;
    if (approval.extra_cost !== null && approval.extra_cost !== undefined && required.extraCost > Number(approval.extra_cost)) return false;
    return true;
  }) || null;
}

function appendJsonLine(relativePath, value) {
  const fs = require("fs");
  const path = require("path");
  fs.appendFileSync(path.join(repoRoot(), relativePath), `${JSON.stringify(value)}\n`, "utf8");
}

function readJsonLines(relativePath) {
  const fs = require("fs");
  const path = require("path");
  const file = path.join(repoRoot(), relativePath);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function writeJsonLines(relativePath, records) {
  const content = (records || []).map((item) => JSON.stringify(item)).join("\n");
  writeTextFile(relativePath, content ? `${content}\n` : "");
}

function appendAudit(eventType, entityType, entityId, summary) {
  const fs = require("fs");
  const path = require("path");
  const line = JSON.stringify({
    event_id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor_id: "local-cli",
    actor_role: "local",
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata: {}
  });
  fs.appendFileSync(path.join(repoRoot(), ".kabeeri", "audit_log.jsonl"), `${line}\n`, "utf8");
}

module.exports = { run };

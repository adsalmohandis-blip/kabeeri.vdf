function init(flags = {}, deps = {}) {
  const {
    createWorkspace,
    questionnaireIntakePlan,
    refreshDashboardArtifacts,
    readJsonFile,
    writeJsonFile,
    table,
    buildProjectProfileRecommendation,
    persistProjectProfileRecommendation
  } = deps;

  const lang = flags.lang || flags.language || "user";
  const goal = flags.goal || flags.app || flags.description || flags.project || flags.text || promptForInitialProjectGoal(flags);
  const profileRecommendation = typeof buildProjectProfileRecommendation === "function"
    ? buildProjectProfileRecommendation(goal, { ...flags, description: goal, path: flags.path || ".", profile: flags.profile, mode: flags.mode, lang }, deps)
    : null;
  const profile = flags.profile || (profileRecommendation && profileRecommendation.selected_profile) || "standard";
  const mode = flags.mode || (profileRecommendation && profileRecommendation.delivery_mode_recommendation ? profileRecommendation.delivery_mode_recommendation.recommended_mode : "structured");
  const created = createWorkspace({ profile, mode, lang });

  console.log("Initialized Kabeeri workspace state.");
  console.log(table(["File", "Status"], created.map((item) => [item.path, item.status])));
  if (profileRecommendation && typeof persistProjectProfileRecommendation === "function") {
    persistProjectProfileRecommendation(profileRecommendation, deps);
    console.log("");
    console.log("Project profile routing:");
    console.log(table(["Field", "Value"], [
      ["Profile", profileRecommendation.selected_profile],
      ["Delivery", profileRecommendation.delivery_mode_recommendation.recommended_mode],
      ["Prompt packs", (profileRecommendation.pack_router && profileRecommendation.pack_router.selected_prompt_packs || []).join(", ") || "none"],
      ["Intake groups", (profileRecommendation.intake_groups || []).join(", ") || "none"]
    ]));
  }
  const intake = runInitIntake({ ...flags, goal }, { questionnaireIntakePlan, readJsonFile, writeJsonFile, table });
  refreshDashboardArtifacts();
  if (!intake) {
    console.log("");
    console.log("Next: tell your AI assistant what you want to build, or run:");
    console.log('kvdf init --goal "Build ecommerce store with Laravel backend and Next.js frontend"');
  }
}

function runInitIntake(flags = {}, deps = {}) {
  const { questionnaireIntakePlan, readJsonFile, writeJsonFile, table, appendAudit } = deps;
  if (flags["no-intake"] || flags.skipIntake) return null;
  const goal = flags.goal || flags.app || flags.description || flags.project || flags.text || promptForInitialProjectGoal(flags);
  if (!goal) return null;
  const plan = questionnaireIntakePlan(goal, {
    ...flags,
    description: goal,
    source: "init_intake",
    silent: true,
    json: false
  });
  const docsTasks = createDocsFirstTasksFromIntakePlan(plan, {
    readJsonFile,
    writeJsonFile,
    appendAudit,
    noDocTasks: Boolean(flags["no-doc-tasks"])
  });
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

function promptForInitialProjectGoal(flags = {}) {
  if (flags.yes || flags.nonInteractive || flags["non-interactive"]) return "";
  if (!process.stdin.isTTY || !process.stdout.isTTY) return "";
  return "";
}

function createDocsFirstTasksFromIntakePlan(plan, deps = {}) {
  const { readJsonFile, writeJsonFile, appendAudit = () => {} } = deps;
  if (!plan || !plan.plan_id) return [];
  if (deps.noDocTasks) return [];
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

module.exports = {
  init,
  runInitIntake,
  promptForInitialProjectGoal,
  createDocsFirstTasksFromIntakePlan
};

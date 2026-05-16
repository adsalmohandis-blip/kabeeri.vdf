function init(flags = {}, deps = {}) {
  const {
    createWorkspace,
    questionnaireIntakePlan,
    refreshDashboardArtifacts,
    readJsonFile,
    writeJsonFile,
    writeTextFile,
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
  const intake = runInitIntake({ ...flags, goal }, { questionnaireIntakePlan, readJsonFile, writeJsonFile, writeTextFile, table });
  refreshDashboardArtifacts();
  if (!intake) {
    console.log("");
    console.log("Next: tell your AI assistant what you want to build, or run:");
    console.log('kvdf init --goal "Build ecommerce store with Laravel backend and Next.js frontend"');
  }
}

function runInitIntake(flags = {}, deps = {}) {
  const { questionnaireIntakePlan, readJsonFile, writeJsonFile, writeTextFile, table, appendAudit } = deps;
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
    writeTextFile,
    appendAudit,
    noDocTasks: Boolean(flags["no-doc-tasks"])
  });
  console.log("");
  console.log("Initial project intake created.");
  console.log(table(["Item", "Value"], [
    ["Goal", goal],
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Questions", plan.generated_questions.length],
    ["Planning pack tasks", docsTasks.length]
  ]));
  console.log("");
  console.log("Ask the developer only these generated questions first. Do not start implementation until the planning pack is reviewed and approved.");
  return { plan, docsTasks };
}

function promptForInitialProjectGoal(flags = {}) {
  if (flags.yes || flags.nonInteractive || flags["non-interactive"]) return "";
  if (!process.stdin.isTTY || !process.stdout.isTTY) return "";
  return "";
}

function createDocsFirstTasksFromIntakePlan(plan, deps = {}) {
  const { readJsonFile, writeJsonFile, writeTextFile, appendAudit = () => {} } = deps;
  if (!plan || !plan.plan_id) return [];
  const file = ".kabeeri/tasks.json";
  const data = readJsonFile(file);
  data.tasks = data.tasks || [];
  const alreadyCreated = data.tasks.some((taskItem) => taskItem.source === `init_intake:${plan.plan_id}`);
  if (typeof writeTextFile === "function") {
    writeIntakeAnswersReport(plan, {
      readJsonFile,
      writeJsonFile,
      writeTextFile,
      appendAudit
    });
  }
  if (deps.noDocTasks) return [];
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
    ["Implementation task backlog", "Convert approved documentation into implementation tasks only after the planning pack is reviewed and approved."]
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

function writeIntakeAnswersReport(plan, deps = {}) {
  const { readJsonFile, writeJsonFile, writeTextFile, appendAudit = () => {} } = deps;
  if (!plan || !plan.plan_id || typeof writeTextFile !== "function") return null;
  const answersState = readJsonFile(".kabeeri/questionnaires/answers.json");
  const sourcesState = readJsonFile(".kabeeri/questionnaires/answer_sources.json");
  const questionMap = new Map((Array.isArray(plan.generated_questions) ? plan.generated_questions : []).map((question) => [question.question_id, question]));
  const answers = Array.isArray(answersState.answers) ? answersState.answers : [];
  const recordedAt = new Date().toISOString();
  const generatedQuestionAnswers = answers.filter((answer) => String(answer.question_id || "").startsWith("adaptive."));
  const intakeEntryAnswers = answers.filter((answer) => String(answer.question_id || "").startsWith("entry."));
  const unansweredQuestions = (Array.isArray(plan.generated_questions) ? plan.generated_questions : [])
    .filter((question) => !answers.some((answer) => answer.question_id === question.question_id));
  const artifact = {
    report_id: `intake-answers-${plan.plan_id}`,
    report_type: "intake_answers",
    generated_at: recordedAt,
    task_id: "task-077",
    task_title: "Project intake answers",
    status: "recorded",
    source: `init_intake:${plan.plan_id}`,
    intake_plan_id: plan.plan_id,
    blueprint: plan.blueprint ? {
      key: plan.blueprint.key,
      name: plan.blueprint.name,
      category: plan.blueprint.category
    } : null,
    delivery_mode: plan.delivery_mode_recommendation ? plan.delivery_mode_recommendation.recommended_mode : null,
    summary: {
      total_questions: Array.isArray(plan.generated_questions) ? plan.generated_questions.length : 0,
      total_answers: answers.length,
      generated_question_answers: generatedQuestionAnswers.length,
      intake_entry_answers: intakeEntryAnswers.length,
      unanswered_questions: unansweredQuestions.length
    },
    answers: answers.map((answer) => ({
      answer_id: answer.answer_id,
      question_id: answer.question_id,
      question_text: questionMap.has(answer.question_id) ? questionMap.get(answer.question_id).text : null,
      value: answer.value,
      area_ids: answer.area_ids || [],
      confidence: answer.confidence || null,
      answered_by: answer.answered_by || null,
      answered_at: answer.answered_at || null,
      source: answer.source || null,
      source_mode: answer.source_mode || null,
      intake_mode: answer.intake_mode || null
    })),
    unanswered_questions: unansweredQuestions.map((question) => ({
      question_id: question.question_id,
      text: question.text,
      why: question.why,
      area_ids: question.area_ids || [],
      priority: question.priority || null
    })),
    answer_sources: Array.isArray(sourcesState.sources) ? sourcesState.sources : []
  };
  const jsonPath = "docs/reports/INTAKE_PROJECT_INTAKE_ANSWERS.json";
  const mdPath = "docs/reports/INTAKE_PROJECT_INTAKE_ANSWERS.md";
  writeJsonFile(jsonPath, artifact);
  writeTextFile(mdPath, renderIntakeAnswersReportMarkdown(artifact));
  appendAudit("intake.answers.recorded", "questionnaire", plan.plan_id, `Recorded intake answers for ${plan.plan_id}`);
  return artifact;
}

function renderIntakeAnswersReportMarkdown(report) {
  const answerLines = report.answers.map((answer) => `- \`${answer.question_id}\` => \`${answer.value}\` (${(answer.area_ids || []).join(", ")})`);
  const unansweredLines = report.unanswered_questions.map((question) => `- \`${question.question_id}\` - ${question.text}`);
  return [
    "# Intake Project Answers",
    "",
    `**Task ID:** \`${report.task_id}\`  `,
    `**Task Title:** ${report.task_title}  `,
    `**Intake Plan:** \`${report.intake_plan_id}\`  `,
    `**Status:** \`${report.status}\`  `,
    `**Date:** ${report.generated_at.slice(0, 10)}`,
    "",
    "## Summary",
    "",
    `- Total questions: ${report.summary.total_questions}`,
    `- Total answers: ${report.summary.total_answers}`,
    `- Generated question answers: ${report.summary.generated_question_answers}`,
    `- Intake entry answers: ${report.summary.intake_entry_answers}`,
    `- Unanswered questions: ${report.summary.unanswered_questions}`,
    "",
    "## Recorded Answers",
    "",
    answerLines.length ? answerLines.join("\n") : "- No answers recorded.",
    "",
    "## Unanswered Questions",
    "",
    unansweredLines.length ? unansweredLines.join("\n") : "- No unanswered questions.",
    "",
    "## Source Trail",
    "",
    `- Source: ${report.source}`,
    `- Blueprint: ${report.blueprint ? `${report.blueprint.name} (${report.blueprint.key})` : "n/a"}`,
    `- Delivery mode: ${report.delivery_mode || "n/a"}`,
    `- Answer sources recorded: ${Array.isArray(report.answer_sources) ? report.answer_sources.length : 0}`
  ].join("\n");
}

module.exports = {
  init,
  runInitIntake,
  promptForInitialProjectGoal,
  createDocsFirstTasksFromIntakePlan
};

const { createWorkspace, ensureWorkspace, getStateDir, readJsonFile, writeJsonFile } = require("./workspace");
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

  const [rawGroup, action, value] = args.positionals;
  const group = normalizeCommandName(rawGroup);

  if (group === "doctor") return doctor();
  if (group === "validate") return validate(action);
  if (group === "init") return init(args.flags);
  if (group === "generator" || group === "generate") return generator(action, value, args.flags);
  if (group === "create") return generator("create", action, args.flags);
  if (group === "prompt-pack") return promptPack(action, value, args.flags);
  if (group === "example") return example(action, value);
  if (group === "questionnaire") return questionnaire(action, value, args.flags);
  if (group === "capability") return capability(action, value, args.flags);
  if (group === "plan") return plan(action, value);
  if (group === "task") return task(action, value, args.flags);
  if (group === "app") return customerApp(action, value, args.flags);
  if (group === "feature") return feature(action, value, args.flags);
  if (group === "journey") return journey(action, value, args.flags);
  if (group === "sprint") return sprint(action, value, args.flags);
  if (group === "session") return session(action, value, args.flags);
  if (group === "acceptance") return acceptance(action, value, args.flags);
  if (group === "audit") return audit(action, value, args.flags);
  if (group === "memory") return memory(action, value, args.flags);
  if (group === "developer") return identity("developers", action, value, args.flags);
  if (group === "owner") return owner(action, value, args.flags);
  if (group === "agent") return identity("agents", action, value, args.flags);
  if (group === "lock") return lock(action, value, args.flags);
  if (group === "vscode") return vscode(action, value, args.flags);
  if (group === "dashboard") return dashboard(action, value, args.flags);
  if (group === "release") return release(action, value, args.flags);
  if (group === "github") return github(action, value, args.flags);
  if (group === "token") return token(action, value, args.flags);
  if (group === "budget") return budget(action, value, args.flags);
  if (group === "pricing") return pricing(action, value, args.flags);
  if (group === "usage") return usage(action, value, args.flags);

  throw new Error(`Unknown command: ${rawGroup}${suggestCommand(rawGroup)}`);
}

function suggestCommand(command) {
  const known = ["init", "doctor", "validate", "generator", "generate", "create", "prompt-pack", "example", "questionnaire", "capability", "plan", "task", "app", "feature", "journey", "sprint", "session", "acceptance", "audit", "memory", "developer", "owner", "agent", "lock", "vscode", "dashboard", "release", "github", "token", "budget", "pricing", "usage"];
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

function init(flags) {
  const profile = flags.profile || "standard";
  const mode = flags.mode || "structured";
  const lang = flags.lang || "both";
  const created = createWorkspace({ profile, mode, lang });

  console.log("Initialized Kabeeri workspace state.");
  console.log(table(["File", "Status"], created.map((item) => [item.path, item.status])));
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
  console.log(`Generated ${folders.length} folders in ${output}`);
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

function exportDirectory(sourceRelative, outputRelative, force) {
  const fs = require("fs");
  const path = require("path");
  const sourceRoot = path.join(repoRoot(), sourceRelative);
  const packageSourceRoot = path.join(__dirname, "../..", sourceRelative);
  const actualSource = fs.existsSync(sourceRoot) ? sourceRoot : packageSourceRoot;
  const outputRoot = path.resolve(repoRoot(), outputRelative);

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

function findPlan(version) {
  const requested = version || "v4.0.0";
  const found = getPlanRegistry().find(([itemVersion]) => itemVersion === requested || itemVersion.replace(/^v/, "") === requested || itemVersion.replace(/\./g, "_") === requested);
  if (!found) throw new Error(`Plan not found: ${requested}`);
  return { version: found[0], file: found[1], data: readJsonFile(found[1]) };
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
    validateTaskWorkstreamCreation(flags.type || "general", workstreams);
    const item = {
      id: flags.id || `task-${String(next).padStart(3, "0")}`,
      title,
      status: "proposed",
      type: flags.type || "general",
      workstream: workstreams[0] || "unassigned",
      workstreams,
      sprint_id: flags.sprint || null,
      source: flags.source || "manual",
      acceptance_criteria: flags.acceptance ? [flags.acceptance] : [],
      created_at: new Date().toISOString()
    };
    data.tasks.push(item);
    writeJsonFile(file, data);
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
    appendAudit(`task.${action}`, "task", found.id, `Task ${action}: ${found.title}`);
    console.log(`Task ${found.id} is now ${found.status}`);
    return;
  }

  throw new Error(`Unknown task action: ${action}`);
}

function validateTaskWorkstreamCreation(type, workstreams) {
  const active = (workstreams || []).filter((item) => item && item !== "unassigned");
  const normalizedType = String(type || "general").toLowerCase();
  if (active.length > 1 && !["integration", "integration-task"].includes(normalizedType)) {
    throw new Error("Task touches multiple workstreams. Use --type integration for approved integration tasks.");
  }
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
  return values.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
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
    console.log(table(["Username", "Name", "Status", "Public URL"], data.apps.map((item) => [
      item.username,
      item.name,
      item.status,
      publicCustomerAppUrl(item.username)
    ])));
    return;
  }

  if (action === "create") {
    requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create customer app");
    const username = normalizePublicUsername(flags.username || value);
    const name = flags.name || username;
    if (data.apps.some((item) => item.username === username)) {
      throw new Error(`Customer app username already exists: ${username}`);
    }
    const item = {
      app_id: flags["app-id"] || `app-${String(data.apps.length + 1).padStart(3, "0")}`,
      username,
      name,
      status: normalizeCustomerAppStatus(flags.status || "draft"),
      audience: flags.audience || "",
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
    enforceTokenFileScope(item);
    enforceSessionLockCoverage(item);
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
    return syncGithubLabels(plan);
  }

  if (action === "milestone" && (!subaction || subaction === "sync")) {
    return syncGithubMilestones(plan);
  }

  if (action === "issue" && (!subaction || subaction === "sync")) {
    return syncGithubIssues(plan);
  }

  if (action === "release" && subaction === "publish") {
    return publishGithubRelease(plan, flags);
  }

  throw new Error(`Unknown confirmed GitHub command: github ${action} ${subaction || ""}`.trim());
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
    const item = {
      id,
      type: kind === "agents" ? "ai_developer" : "human",
      display_name: flags.name,
      role,
      workstreams: flags.workstreams ? flags.workstreams.split(",").map((part) => part.trim()) : [],
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
  const allowed = ["Owner", "Maintainer", "Backend Developer", "Frontend Developer", "Admin Frontend Developer", "AI Developer"];
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
  if (!action || action === "generate") {
    writeDashboardStateFiles(collectDashboardState());
    appendAudit("dashboard.generated", "dashboard", "local", "Dashboard state generated");
    console.log("Generated dashboard state files.");
    return;
  }

  if (action === "export") {
    dashboard("generate");
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
    const state = collectDashboardState();
    writeDashboardStateFiles(state);
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  if (action === "serve") {
    dashboard("export");
    return serveSite(Number(flags.port || 4177));
  }

  throw new Error(`Unknown dashboard action: ${action}`);
}

function collectDashboardState() {
  const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  const features = fileExists(".kabeeri/features.json") ? readJsonFile(".kabeeri/features.json").features || [] : [];
  const journeys = fileExists(".kabeeri/journeys.json") ? readJsonFile(".kabeeri/journeys.json").journeys || [] : [];
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const locks = readJsonFile(".kabeeri/locks.json").locks || [];
  const usageSummary = summarizeUsage();
  const sprints = fileExists(".kabeeri/sprints.json") ? readJsonFile(".kabeeri/sprints.json").sprints || [] : [];
  const sessions = fileExists(".kabeeri/sessions.json") ? readJsonFile(".kabeeri/sessions.json").sessions || [] : [];
  const developers = readJsonFile(".kabeeri/developers.json").developers || [];
  const agents = readJsonFile(".kabeeri/agents.json").agents || [];
  const developerEfficiency = buildDeveloperEfficiency();
  const generatedAt = new Date().toISOString();

  return {
    generated_at: generatedAt,
    technical: {
      generated_at: generatedAt,
      tasks: summarizeBy(tasks, "status"),
      active_locks: locks.filter((item) => item.status === "active"),
      active_tokens: tokens.filter((item) => item.status === "active"),
      ai_usage: usageSummary,
      sprints: sprints.map((item) => buildSprintSummary(item.id)),
      sessions: summarizeBy(sessions, "status"),
      developers,
      agents,
      developer_efficiency: developerEfficiency
    },
    business: {
      generated_at: generatedAt,
      customer_apps: apps,
      task_status: summarizeBy(tasks, "status"),
      tasks_total: tasks.length,
      verified_tasks: tasks.filter((item) => item.status === "owner_verified").length,
      ai_usage_cost: usageSummary.total_cost,
      ai_usage_tokens: usageSummary.total_tokens,
      features,
      feature_readiness: summarizeBy(features, "readiness"),
      journeys,
      journey_status: summarizeBy(journeys, "status"),
      developer_efficiency: developerEfficiency,
      sprints: sprints.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        cost: buildSprintSummary(item.id).total_cost
      }))
    },
    records: {
      tasks,
      apps,
      features,
      journeys,
      tokens,
      locks,
      usage: usageSummary
    }
  };
}

function writeDashboardStateFiles(state) {
  writeJsonFile(".kabeeri/dashboard/technical_state.json", state.technical);
  writeJsonFile(".kabeeri/dashboard/business_state.json", state.business);
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
    .status { display: inline-block; margin-top: 12px; font-size: 13px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 5px 9px; }
    a { color: #0b5cad; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <a href="/">Back to apps</a>
    <h1>${escapeHtml(appItem.name)}</h1>
    <p>Public username: <strong>${escapeHtml(appItem.username)}</strong></p>
    <p>Public route: <strong>${escapeHtml(publicCustomerAppUrl(appItem.username))}</strong></p>
    <div class="status">${escapeHtml(appItem.status || "draft")}</div>
  </main>
</body>
</html>
`;
}

function buildDashboardHtml() {
  const technical = readJsonFile(".kabeeri/dashboard/technical_state.json");
  const business = readJsonFile(".kabeeri/dashboard/business_state.json");
  const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
  const features = fileExists(".kabeeri/features.json") ? readJsonFile(".kabeeri/features.json").features || [] : [];
  const journeys = fileExists(".kabeeri/journeys.json") ? readJsonFile(".kabeeri/journeys.json").journeys || [] : [];
  const tokens = readJsonFile(".kabeeri/tokens.json").tokens || [];
  const locks = readJsonFile(".kabeeri/locks.json").locks || [];
  const usage = summarizeUsage();

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
    <div class="live">Live endpoint: <code>/__kvdf/api/state</code></div>
  </header>
  <main>
    <section class="grid">
      ${metricCard("Tasks", tasks.length)}
      ${metricCard("Verified", business.verified_tasks || 0)}
      ${metricCard("Active Tokens", tokens.filter((item) => item.status === "active").length)}
      ${metricCard("Active Locks", locks.filter((item) => item.status === "active").length)}
      ${metricCard("AI Tokens", usage.total_tokens)}
      ${metricCard("AI Cost", `${usage.total_cost} ${usage.currency}`)}
      ${metricCard("Untracked Cost", `${usage.tracked_vs_untracked && usage.tracked_vs_untracked.untracked ? usage.tracked_vs_untracked.untracked.cost : 0} ${usage.currency}`)}
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
      ${htmlTable(["ID", "Title", "Status", "Assignee", "Workstream"], tasks.map((task) => [task.id, task.title, task.status, task.assignee_id || "", task.workstream || ""]))}
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
      <h2>Developer Token Efficiency</h2>
      ${htmlTable(["Developer", "Events", "Tokens", "Cost", "Accepted", "Rejected", "Rework"], Object.entries(buildDeveloperEfficiency().by_developer).map(([developer, item]) => [developer, item.events, item.tokens, item.cost, item.accepted_cost, item.rejected_cost, item.rework_cost]))}
    </section>
  </main>
  <script>
    async function refreshLiveMetrics() {
      try {
        const response = await fetch("/__kvdf/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const state = await response.json();
        document.title = "Kabeeri VDF Dashboard - " + state.generated_at;
      } catch (_) {
        /* Static exports keep working without the local live API. */
      }
    }
    refreshLiveMetrics();
    setInterval(refreshLiveMetrics, 5000);
  </script>
</body>
</html>
`;
}

function metricCard(label, value) {
  return `<div class="card"><div>${escapeHtml(label)}</div><div class="metric">${escapeHtml(value)}</div></div>`;
}

function htmlTable(headers, rows) {
  const safeRows = rows.length ? rows : [["", "No records", "", "", ""]];
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${safeRows.map((row) => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
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

function serveSite(port) {
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const homeFile = path.join(repoRoot(), ".kabeeri", "site", "index.html");
  const dashboardFile = path.join(repoRoot(), ".kabeeri", "site", "__kvdf", "dashboard", "index.html");
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    let file = null;
    if (pathname === "/" || pathname === "/index.html") {
      file = homeFile;
    } else if (pathname === "/__kvdf/dashboard" || pathname === "/__kvdf/dashboard/index.html") {
      file = dashboardFile;
    } else if (pathname === "/__kvdf/api/state") {
      const state = collectDashboardState();
      writeDashboardStateFiles(state);
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
  server.listen(port, "127.0.0.1", () => {
    console.log(`Kabeeri customer page running at http://127.0.0.1:${port}/`);
    console.log(`Private dashboard running at http://127.0.0.1:${port}/__kvdf/dashboard`);
  });
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
    console.log(table(["Token", "Task", "Assignee", "Status"], data.tokens.map((item) => [item.token_id, item.task_id, item.assignee_id, item.status])));
    return;
  }

  if (action === "issue") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "issue token");
    const taskId = flags.task || value;
    const assignee = flags.assignee;
    if (!taskId) throw new Error("Missing --task.");
    if (!assignee) throw new Error("Missing --assignee.");
    assertTokenCanBeIssued(taskId, assignee);
    const token = {
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || null,
      allowed_files: parseCsv(flags["allowed-files"]),
      forbidden_files: parseCsv(flags["forbidden-files"]),
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
    const token = {
      ...previous,
      token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      assignee_id: assignee,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: flags.expires || previous.expires_at || null,
      allowed_files: flags["allowed-files"] ? parseCsv(flags["allowed-files"]) : previous.allowed_files || [],
      forbidden_files: flags["forbidden-files"] ? parseCsv(flags["forbidden-files"]) : previous.forbidden_files || [],
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
    const isUntracked = Boolean(flags.untracked);
    const taskId = flags.task || value || (isUntracked ? "untracked" : null);
    const developerId = flags.developer || flags.assignee || (isUntracked ? "untracked" : null);
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
      sprint_id: flags.sprint || getTaskSprint(taskId),
      developer_id: developerId,
      workstream: flags.workstream || "untracked",
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
      tracked: isUntracked ? false : flags.tracked !== "false"
    };
    if (!isUntracked) enforceBudgetApproval(taskId, totalTokens, cost);
    appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", event);
    const summary = summarizeUsage();
    writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summary);
    appendAudit("ai_usage.recorded", "task", taskId, `AI usage recorded: ${totalTokens} tokens`);
    const warning = getBudgetWarning(taskId, summary);
    console.log(`Recorded usage event ${event.event_id}`);
    if (warning) console.log(`WARN ${warning}`);
    return;
  }

  throw new Error(`Unknown usage action: ${action}`);
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
  const sprints = fileExists(".kabeeri/sprints.json") ? readJsonFile(".kabeeri/sprints.json").sprints || [] : [];
  const tasks = readJsonFile(".kabeeri/tasks.json").tasks || [];
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

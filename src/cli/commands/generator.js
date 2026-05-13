const fs = require("fs");
const path = require("path");
const { readJsonFile, writeJsonFile } = require("../workspace");
const { listFiles, fileExists, repoRoot, assertSafeName } = require("../fs_utils");
const { table } = require("../ui");

function generator(action, value, flags = {}, deps = {}) {
  if (!action && flags.profile) {
    assertSafeName(flags.profile);
    const file = `generators/${flags.profile}.json`;
    if (!fileExists(file)) throw new Error(`Generator not found: ${flags.profile}`);
    return createProjectSkeleton(readJsonFile(file), flags, deps);
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
    return createProjectSkeleton(data, flags, deps);
  }

  if (value || flags.profile) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  throw new Error(`Unknown generator action: ${action}`);
}

function createProjectSkeleton(generatorData, flags, deps = {}) {
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

  const governedArtifacts = createGeneratorGovernanceArtifacts(generatorData, outputPath, force);
  created.push(...governedArtifacts);

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
  const createdTasks = createGeneratorGovernanceTasks(generatorData, output, flags, deps);
  if (typeof deps.refreshDashboardArtifacts === "function") deps.refreshDashboardArtifacts();
  console.log(`Generated ${folders.length} folders in ${output}`);
  if (createdTasks.length) console.log(`Created ${createdTasks.length} governance task(s) for ${output}.`);
}

function createGeneratorGovernanceTasks(generatorData, output, flags = {}, deps = {}) {
  const localFileExists = deps.localFileExists || fileExists;
  const appendAudit = deps.appendAudit || (() => {});
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

function createGeneratorGovernanceArtifacts(generatorData, outputPath, force) {
  const created = [];
  const architectureGuideFiles = Array.isArray(generatorData.default_files && generatorData.default_files.architecture_guides)
    ? generatorData.default_files.architecture_guides
    : [];
  const questionnaireFiles = Array.isArray(generatorData.default_files && generatorData.default_files.folder_questionnaires)
    ? generatorData.default_files.folder_questionnaires
    : [];

  for (const file of architectureGuideFiles) {
    const content = file.includes("_AR.")
      ? buildArchitectureGuide(generatorData, "ar")
      : buildArchitectureGuide(generatorData, "en");
    const target = path.join(outputPath, file);
    writeIfAllowed(target, content, force);
    created.push(path.relative(outputPath, target).replace(/\\/g, "/"));
  }

  for (const folder of generatorData.folders || []) {
    if (!folder.create_questionnaires) continue;
    for (const file of questionnaireFiles) {
      const target = path.join(outputPath, folder.path, file);
      const content = file.includes("_AR.")
        ? buildFolderQuestionnaire(generatorData, folder, "ar")
        : buildFolderQuestionnaire(generatorData, folder, "en");
      writeIfAllowed(target, content, force);
      created.push(path.relative(outputPath, target).replace(/\\/g, "/"));
    }
    const answersPath = path.join(outputPath, folder.path, "answers.md");
    writeIfAllowed(answersPath, buildFolderAnswersShell(folder), force);
    created.push(path.relative(outputPath, answersPath).replace(/\\/g, "/"));
  }

  return created;
}

function writeIfAllowed(filePath, content, force) {
  if (fs.existsSync(filePath) && !force) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function buildArchitectureGuide(generatorData, lang = "en") {
  const isAr = String(lang).toLowerCase() === "ar";
  const title = isAr ? "دليل معمارية هيكل المشروع" : "Project Skeleton Architecture Guide";
  const intro = isAr
    ? "يشرح هذا الملف بنية الهيكل المولد وكيف تبدأ بأسئلة الحوكمة قبل أي تنفيذ."
    : "This file explains the generated skeleton structure and how to start with governed questions before implementation.";
  const rule = isAr ? "قاعدة التوليد" : "Generation Rule";
  const next = isAr ? "الخطوات التالية" : "Next Steps";
  const folderLines = (generatorData.folders || []).map((folder) => `- \`${folder.path}\` - ${folder.purpose || (isAr ? "بدون وصف." : "No purpose documented.")}`).join("\n");

  return `# ${title}

${intro}

## ${rule}

${generatorData.core_rule || (isAr ? "أنشئ الهيكل فقط ولا تملأ المحتوى التفصيلي قبل أسئلة الفولدر." : "Create only the skeleton and do not fill detailed content before folder questionnaires are answered.")}

## ${isAr ? "الهيكل" : "Structure"}

${folderLines}

## ${next}

1. ${isAr ? "أجب عن أسئلة كل فولدر قبل إنشاء المحتوى التفصيلي." : "Answer each folder questionnaire before generating detailed content."}
2. ${isAr ? "استخدم التاسكات المحكومة لمراجعة أي تنفيذ داخل `.kabeeri/tasks.json`." : "Use governed tasks in `.kabeeri/tasks.json` to review any implementation work."}
3. ${isAr ? "اربط البرومبت المناسب بكل تاسك قبل البدء في التنفيذ." : "Bind the correct prompt pack to each task before starting implementation."}
`;
}

function buildFolderQuestionnaire(generatorData, folder, lang = "en") {
  const isAr = String(lang).toLowerCase() === "ar";
  const title = isAr ? `استبيان فولدر ${folder.path}` : `${folder.path} Questionnaire`;
  const purpose = folder.purpose || (isAr ? "لا يوجد وصف." : "No purpose documented.");
  const policy = folder.detailed_documents_policy || generatorData.core_rule || (isAr ? "لا تنشئ محتوى تفصيليًا بعد." : "Do not create detailed content yet.");
  const questions = isAr
    ? [
      "ما الهدف الأولي لهذا الفولدر؟",
      "ما الملفات المسموح إنشاؤها هنا الآن؟",
      "ما المعلومات التي يجب تأجيلها حتى تكتمل المراجعة؟",
      "ما معيار القبول لهذا الجزء من الهيكل؟"
    ]
    : [
      "What is the initial purpose of this folder?",
      "What files are allowed to exist here right now?",
      "What information must wait until review is complete?",
      "What is the acceptance criterion for this part of the skeleton?"
    ];

  return `# ${title}

## ${isAr ? "الغرض" : "Purpose"}

${purpose}

## ${isAr ? "السياسة" : "Policy"}

${policy}

## ${isAr ? "الأسئلة" : "Questions"}

${questions.map((question) => `- ${question}`).join("\n")}
`;
}

function buildFolderAnswersShell(folder, lang = "en") {
  const isAr = String(lang).toLowerCase() === "ar";
  return `# ${isAr ? "إجابات" : "Answers"}: ${folder.path}

${isAr ? "أضف هنا إجابات صاحب المشروع أو الفريق قبل إنشاء المحتوى التفصيلي." : "Add project-owner or team answers here before generating detailed content."}
`;
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

module.exports = {
  generator
};

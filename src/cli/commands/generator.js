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

function writeIfAllowed(filePath, content, force) {
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

module.exports = {
  generator
};

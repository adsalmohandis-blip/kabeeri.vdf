const fs = require("fs");
const path = require("path");
const { readJsonFile } = require("../workspace");
const { listDirectories, listFiles, fileExists, repoRoot, resolveAsset, assertSafeName } = require("../fs_utils");
const { table } = require("../ui");

function promptPack(action, name, flags = {}, dependencies = {}) {
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
    if (typeof dependencies.composePromptPack !== "function") {
      throw new Error("Prompt pack composition service is not available.");
    }
    return dependencies.composePromptPack(name, flags);
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
    if (!name) throw new Error("Missing prompt pack name.");
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

function uniqueList(items) {
  return [...new Set((items || []).filter(Boolean))];
}

module.exports = {
  promptPack,
  getPromptPackCatalog,
  detectFrameworkPacks,
  recommendFrameworkPacksForBlueprint
};

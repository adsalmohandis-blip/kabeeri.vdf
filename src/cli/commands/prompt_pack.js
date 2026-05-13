const fs = require("fs");
const path = require("path");
const { readJsonFile } = require("../workspace");
const { listDirectories, listFiles, fileExists, repoRoot, resolveAsset, assertSafeName } = require("../fs_utils");
const { table } = require("../ui");
const { uniqueList } = require("../services/collections");

const { composePromptPack: composePromptPackService } = require("../services/prompt_pack");
const SCALE_SPECIFIC_PACKS_REPORT_FILE = ".kabeeri/reports/scale_specific_packs_report.json";

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
    const composePromptPack = dependencies.composePromptPack || composePromptPackService;
    if (typeof composePromptPack !== "function") throw new Error("Prompt pack composition service is not available.");
    return composePromptPack(name, flags);
  }

  if (action === "scale") {
    const report = buildScaleSpecificPackReport(name, flags);
    writeScaleSpecificPackReport(report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else renderScaleSpecificPackReport(report);
    return report;
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

function buildScaleSpecificPackReport(input, flags = {}) {
  const packs = getPromptPackCatalog();
  const available = new Set(["common", ...packs.map((pack) => pack.pack)]);
  const text = collectScalePackText(input, flags);
  const lower = text.toLowerCase();
  const profile = normalizeScaleProfile(flags.profile || inferScaleProfile(lower, flags));
  const riskLevel = String(flags.risk || inferScaleRiskLevel(lower, profile)).toLowerCase();
  const detectedPacks = uniqueList(detectFrameworkPacks(text, packs));
  const foundationPacks = uniqueList(["common", ...detectedPacks].filter((pack) => available.has(pack))).slice(0, 4);
  const backendPacks = uniqueList(matchScalePackGroup(lower, available, ["laravel", "nestjs", "dotnet", "fastapi", "django", "expressjs", "springboot", "go-gin", "rails"]));
  const frontendPacks = uniqueList(matchScalePackGroup(lower, available, ["nextjs", "react", "vue", "angular", "sveltekit", "astro", "nuxt-vue"]));
  const mobilePacks = uniqueList(matchScalePackGroup(lower, available, ["react-native-expo", "flutter"]));
  const contentPacks = uniqueList(matchScalePackGroup(lower, available, ["wordpress", "shopify", "strapi", "supabase", "firebase"]));
  const enterpriseBoost = profile === "enterprise" || riskLevel === "high";
  const bundleRecommendations = [
    {
      bundle_id: "foundation",
      title: "Foundation pack bundle",
      packs: foundationPacks,
      reason: "Always include the common layer and the directly detected stack packs."
    }
  ];
  if (backendPacks.length) {
    bundleRecommendations.push({
      bundle_id: "backend_scale",
      title: "Backend scale bundle",
      packs: backendPacks,
      reason: enterpriseBoost ? "Large systems often need stronger backend, API, and integration context." : "Backend keywords were detected in the request."
    });
  }
  if (frontendPacks.length) {
    bundleRecommendations.push({
      bundle_id: "frontend_scale",
      title: "Frontend scale bundle",
      packs: frontendPacks,
      reason: enterpriseBoost ? "Large systems usually need a dedicated UI/app surface pack in addition to backend context." : "Frontend keywords were detected in the request."
    });
  }
  if (mobilePacks.length) {
    bundleRecommendations.push({
      bundle_id: "mobile_scale",
      title: "Mobile scale bundle",
      packs: mobilePacks,
      reason: "Mobile systems need a separate mobile prompt path so the AI does not overload the web context."
    });
  }
  if (contentPacks.length) {
    bundleRecommendations.push({
      bundle_id: "content_scale",
      title: "Content and platform bundle",
      packs: contentPacks,
      reason: "CMS, commerce, and backend-as-a-service platforms benefit from a dedicated content/platform pack selection."
    });
  }

  const selectedPromptPacks = uniqueList(bundleRecommendations.flatMap((bundle) => bundle.packs)).slice(0, enterpriseBoost ? 8 : 6);
  const scaleTier = enterpriseBoost ? "large_system" : profile === "standard" ? "standard_system" : "lightweight";

  return {
    report_type: "scale_specific_packs_report",
    generated_at: new Date().toISOString(),
    report_path: SCALE_SPECIFIC_PACKS_REPORT_FILE,
    input: text,
    profile,
    risk_level: riskLevel,
    scale_tier: scaleTier,
    foundation_packs: foundationPacks,
    bundle_recommendations: bundleRecommendations,
    selected_prompt_packs: selectedPromptPacks,
    source_of_truth: {
      prompt_pack_catalog: true,
      pack_manifests: true
    },
    next_actions: [
      "Use the foundation bundle first when composing the AI context.",
      "Add the backend or frontend scale bundle when the system is large or high-risk.",
      "Route the selected packs into `kvdf prompt-pack compose` or `kvdf project profile report`."
    ]
  };
}

function writeScaleSpecificPackReport(report) {
  fs.mkdirSync(path.dirname(path.join(repoRoot(), SCALE_SPECIFIC_PACKS_REPORT_FILE)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot(), SCALE_SPECIFIC_PACKS_REPORT_FILE), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function renderScaleSpecificPackReport(report) {
  console.log(`Scale-specific packs: ${report.scale_tier}`);
  console.log(table(["Field", "Value"], [
    ["Profile", report.profile],
    ["Risk", report.risk_level],
    ["Selected packs", (report.selected_prompt_packs || []).join(", ") || "none"],
    ["Foundation packs", (report.foundation_packs || []).join(", ") || "none"]
  ]));
  console.log("");
  console.log("Bundle recommendations:");
  for (const bundle of report.bundle_recommendations || []) {
    console.log(`- ${bundle.title}: ${(bundle.packs || []).join(", ") || "none"}`);
  }
}

function collectScalePackText(input, flags = {}) {
  return [
    input,
    flags.goal,
    flags.description,
    flags.text,
    flags.profile,
    flags.blueprint,
    flags.risk,
    flags.path
  ].filter(Boolean).join(" ").trim();
}

function inferScaleProfile(text, flags = {}) {
  const explicit = String(flags.profile || "").toLowerCase();
  if (["lite", "standard", "enterprise"].includes(explicit)) return explicit;
  if (/enterprise|regulated|compliance|audit|multi-tenant|multi tenant|erp|crm|billing|payments|hospital|government|gov/.test(text)) return "enterprise";
  if (/mvp|prototype|blog|landing|small|simple|lite/.test(text)) return "lite";
  return "standard";
}

function inferScaleRiskLevel(text, profile) {
  if (profile === "enterprise") return "high";
  if (/audit|compliance|security|migration|billing|payments|multi-tenant|multi tenant|integration/.test(text)) return "medium";
  return "low";
}

function normalizeScaleProfile(profile) {
  const value = String(profile || "").toLowerCase();
  if (["lite", "standard", "enterprise"].includes(value)) return value;
  return "standard";
}

function matchScalePackGroup(text, available, candidates) {
  const keywords = new Map([
    ["laravel", ["laravel", "php", "backend", "erp", "billing", "crm"]],
    ["nestjs", ["nestjs", "node", "api", "backend", "integration"]],
    ["dotnet", ["dotnet", ".net", "enterprise", "backend", "integration"]],
    ["fastapi", ["fastapi", "python", "api", "backend"]],
    ["django", ["django", "python", "admin", "backend"]],
    ["expressjs", ["express", "node", "api", "backend"]],
    ["springboot", ["spring", "enterprise", "backend", "integration"]],
    ["go-gin", ["go", "gin", "api", "backend"]],
    ["rails", ["rails", "ruby", "backend"]],
    ["nextjs", ["next", "web", "frontend", "dashboard", "customer portal", "admin"]],
    ["react", ["react", "frontend", "dashboard", "admin"]],
    ["vue", ["vue", "frontend", "dashboard"]],
    ["angular", ["angular", "admin", "enterprise", "dashboard"]],
    ["sveltekit", ["svelte", "frontend", "site"]],
    ["astro", ["astro", "content", "docs", "marketing"]],
    ["nuxt-vue", ["nuxt", "vue", "frontend", "site"]],
    ["react-native-expo", ["expo", "react native", "mobile", "app"]],
    ["flutter", ["flutter", "mobile", "app"]],
    ["wordpress", ["wordpress", "cms", "content", "marketing", "site"]],
    ["shopify", ["shopify", "commerce", "store", "ecommerce"]],
    ["strapi", ["strapi", "cms", "content", "headless"]],
    ["supabase", ["supabase", "backend as a service", "b2b", "real-time"]],
    ["firebase", ["firebase", "mobile", "realtime", "auth"]],
  ]);
  const selected = [];
  for (const pack of candidates) {
    if (!available.has(pack)) continue;
    const words = keywords.get(pack) || [pack];
    if (words.some((word) => text.includes(word))) selected.push(pack);
  }
  return selected;
}

module.exports = {
  promptPack,
  getPromptPackCatalog,
  detectFrameworkPacks,
  recommendFrameworkPacksForBlueprint,
  buildScaleSpecificPackReport
};

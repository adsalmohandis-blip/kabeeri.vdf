const fs = require("fs");
const path = require("path");

const pages = [
  ["what-is", "Overview", "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©"],
  ["kabeeri-4-parts", "Kabeeri in 4 Parts", "Ø§Ù„Ø´Ø±Ø­ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„ÙƒØ¨ÙŠØ±ÙŠ"],
  ["start-here", "Start Here", "Ø§Ø¨Ø¯Ø£ Ù…Ù† Ù‡Ù†Ø§"],
  ["install-profiles", "Install and Profiles", "Ø§Ù„ØªØ«Ø¨ÙŠØª ÙˆØ§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„Ø§Øª"],
  ["ai-with-kabeeri", "AI Works Inside Kabeeri", "ÙƒÙŠÙ ÙŠØ¹Ù…Ù„ AI Ø¯Ø§Ø®Ù„ ÙƒØ¨ÙŠØ±ÙŠ"],
  ["developer-onboarding", "Developer Onboarding", "ØªØ£Ù‡ÙŠÙ„ Ø§Ù„Ù…Ø·ÙˆØ±"],
  ["capabilities", "System Capabilities", "Ù‚Ø¯Ø±Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…"],
  ["repository-layout", "Repository Layout", "ØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø³ØªÙˆØ¯Ø¹"],
  ["new-project", "Start a New Application", "Ø¨Ø¯Ø¡ ØªØ·Ø¨ÙŠÙ‚ Ø¬Ø¯ÙŠØ¯"],
  ["existing-kabeeri-project", "Continue a Kabeeri Project", "Ø§Ø³ØªÙƒÙ…Ø§Ù„ Ù…Ø´Ø±ÙˆØ¹ ÙƒØ¨ÙŠØ±ÙŠ"],
  ["existing-non-kabeeri-project", "Adopt an Existing App", "Ø§Ø¹ØªÙ…Ø§Ø¯ ØªØ·Ø¨ÙŠÙ‚ Ù‚Ø§Ø¦Ù…"],
  ["delivery-mode", "Choose Agile or Structured", "Ø§Ø®ØªÙŠØ§Ø± Agile Ø£Ùˆ Structured"],
  ["agile-delivery", "Agile Delivery", "Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ø£Ø¬Ø§ÙŠÙ„"],
  ["structured-delivery", "Structured Delivery", "Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ù…Ù†Ø¸Ù…"],
  ["questionnaire-engine", "Questionnaire Engine", "Ù…Ø­Ø±Ùƒ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©"],
  ["product-blueprints", "Product Blueprints", "Ø®Ø±Ø§Ø¦Ø· Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª"],
  ["data-design", "Data Design", "ØªØµÙ…ÙŠÙ… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª"],
  ["ui-ux-advisor", "UI/UX Advisor", "Ù…Ø³Ø§Ø¹Ø¯ ØªØµÙ…ÙŠÙ… Ø§Ù„ÙˆØ§Ø¬Ù‡Ø§Øª"],
  ["ui-ux-reference-library", "UI/UX Reference Library", "Ù…ÙƒØªØ¨Ø© Ù…Ø±Ø§Ø¬Ø¹ UI/UX"],
  ["vibe-first", "Vibe-first Workflow", "Ù…Ø³Ø§Ø± Vibe-first"],
  ["task-governance", "Task Governance", "Ø­ÙˆÙƒÙ…Ø© Ø§Ù„ØªØ§Ø³ÙƒØ§Øª"],
  ["app-boundary", "App Boundary Governance", "Ø­ÙˆÙƒÙ…Ø© Ø­Ø¯ÙˆØ¯ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª"],
  ["workstreams-scope", "Workstreams and Scope", "Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆØ§Ù„Ù†Ø·Ø§Ù‚"],
  ["prompt-packs", "Prompt Packs", "Ø­Ø²Ù… Ø§Ù„Ø¨Ø±ÙˆÙ…Ø¨Øª"],
  ["wordpress-development", "WordPress Development", "ØªØ·ÙˆÙŠØ± WordPress"],
  ["wordpress-plugins", "WordPress Plugin Development", "ØªØ·ÙˆÙŠØ± Ø¥Ø¶Ø§ÙØ§Øª WordPress"],
  ["ai-tool", "AI Tool Instructions", "ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø£Ø¯Ø§Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ"],
  ["vibe-developer", "Vibe Developer Instructions", "ØªØ¹Ù„ÙŠÙ…Ø§Øª Ù…Ø·ÙˆØ± Vibe"],
  ["ai-tool-hub", "AI Tool Docs Site", "Ø¨ÙˆØ§Ø¨Ø© Ø£Ø¯Ø§Ø© AI"],
  ["vibe-developer-hub", "Vibe Developer Docs Site", "Ø¨ÙˆØ§Ø¨Ø© Ù…Ø·ÙˆØ± Vibe"],
  ["dashboard-monitoring", "Live Dashboard", "Ø§Ù„Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ø§Ù„Ø­ÙŠ"],
  ["ai-cost-control", "AI Cost Control", "Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ ØªÙƒÙ„ÙØ© AI"],
  ["multi-ai-governance", "Multi-AI Governance", "Ø­ÙˆÙƒÙ…Ø© ØªØ¹Ø¯Ø¯ ÙˆÙƒÙ„Ø§Ø¡ AI"],
  ["github-release", "GitHub and Release Gates", "GitHub ÙˆØ¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø¥ØµØ¯Ø§Ø±"],
  ["practical-examples", "Seven Practical Builds", "Ø³Ø¨Ø¹Ø© ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø¹Ù…Ù„ÙŠØ©"],
  ["example-ecommerce", "Example: Ecommerce Website", "Ù…Ø«Ø§Ù„: Ù…ØªØ¬Ø± Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ"],
  ["example-ai-team-ecommerce", "Example: 3 AI Developers Build Ecommerce", "Ù…Ø«Ø§Ù„: 3 Ù…Ø·ÙˆØ±ÙŠ AI Ù„Ø¨Ù†Ø§Ø¡ Ù…ØªØ¬Ø±"],
  ["example-blog", "Example: Personal Blog", "Ù…Ø«Ø§Ù„: Ù…Ø¯ÙˆÙ†Ø© Ø´Ø®ØµÙŠØ©"],
  ["example-wordpress-digital-agency", "Example: WordPress Digital Agency", "Ù…Ø«Ø§Ù„: WordPress Ù„Ø´Ø±ÙƒØ© ØªØ³ÙˆÙŠÙ‚ Ø±Ù‚Ù…ÙŠ"],
  ["example-dental-clinic", "Example: Dental Clinic Booking", "Ù…Ø«Ø§Ù„: Ø¹ÙŠØ§Ø¯Ø© Ø£Ø³Ù†Ø§Ù† ÙˆØ­Ø¬ÙˆØ²Ø§Øª"],
  ["example-crm", "Example: Professional CRM", "Ù…Ø«Ø§Ù„: CRM Ø§Ø­ØªØ±Ø§ÙÙŠ"],
  ["example-mobile-commerce", "Example: Ecommerce Mobile App", "Ù…Ø«Ø§Ù„: ØªØ·Ø¨ÙŠÙ‚ Ù…ÙˆØ¨Ø§ÙŠÙ„ Ù„Ù„Ù…ØªØ¬Ø±"],
  ["example-pos", "Example: Supermarket POS", "Ù…Ø«Ø§Ù„: POS Ø³ÙˆØ¨Ø±Ù…Ø§Ø±ÙƒØª"],
  ["troubleshooting", "Troubleshooting", "Ø­Ù„ Ø§Ù„Ù…Ø´ÙƒÙ„Ø§Øª"]
];

const pageAliases = {
  "ai-tool-hub": "ai-tool",
  "vibe-developer-hub": "vibe-developer"
};

const templates = [
  {
    template_id: "docs-site-index",
    title: "Docs Site Index Template",
    purpose: "Render the landing shell for the documentation site.",
    output_paths: ["index.html"],
    languages: ["en"],
    surface: "docs/site",
    source: "docs/site/generate-pages.js"
  },
  {
    template_id: "docs-site-page",
    title: "Docs Site Page Template",
    purpose: "Render each localized docs page shell under pages/en and pages/ar.",
    output_paths: ["pages/en/*.html", "pages/ar/*.html"],
    languages: ["en", "ar"],
    surface: "docs/site/pages",
    source: "docs/site/generate-pages.js"
  }
];

function buildSiteManifest() {
  return {
    manifest_version: 1,
    generated_by: "docs/site/generate-pages.js",
    site_name: "Kabeeri VDF Docs",
    default_language: "ar", // Arabic-first, bilingual site
    languages: ["en", "ar"],
    template_count: templates.length,
    page_count: pages.length,
    pages: pages.map(([slug, enTitle, arTitle]) => ({
      slug,
      titles: { en: enTitle, ar: arTitle },
      paths: {
        en: `pages/en/${slug}.html`,
        ar: `pages/ar/${slug}.html`
      }
    }))
  };
}

function buildPageContracts() {
  const contracts = [];
  for (const [slug, enTitle, arTitle] of pages) {
    contracts.push({
      contract_id: `${slug}.en`,
      slug,
      language: "en",
      direction: "ltr",
      title: enTitle,
      path: `pages/en/${slug}.html`,
      root_path: "../../",
      template: "docs-site-page",
      surface: "docs/site/pages",
      source: "docs/site/generate-pages.js"
    });
    contracts.push({
      contract_id: `${slug}.ar`,
      slug,
      language: "ar",
      direction: "rtl",
      title: arTitle,
      path: `pages/ar/${slug}.html`,
      root_path: "../../",
      template: "docs-site-page",
      surface: "docs/site/pages",
      source: "docs/site/generate-pages.js"
    });
  }
  return {
    contract_version: 1,
    generated_by: "docs/site/generate-pages.js",
    site_name: "Kabeeri VDF Docs",
    template_count: templates.length,
    page_count: contracts.length,
    contracts
  };
}

function html({ lang, dir, title, slug, rootPath }) {
  const filter = lang === "ar" ? "ØªØµÙÙŠØ©" : "Filter";
  const search = lang === "ar" ? "Ø§Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„" : "Search docs";
  const arabicLabel = "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©";

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Kabeeri VDF Docs</title>
  <link rel="stylesheet" href="${rootPath}assets/css/style.css">
</head>
<body data-page="${slug}" data-root="${rootPath}">
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="${rootPath}index.html" aria-label="Kabeeri VDF documentation home">
        <span class="brand-mark">K</span>
        <span>Kabeeri VDF</span>
      </a>
      <nav class="top-actions" aria-label="Language">
        <a class="language-link" data-lang-target="en" href="#">English</a>
        <a class="language-link" data-lang-target="ar" href="#">${arabicLabel}</a>
      </nav>
    </header>
    <div class="layout">
      <aside class="sidebar">
        <label class="search-label" for="doc-search">${filter}</label>
        <input id="doc-search" class="search-input" type="search" placeholder="${search}">
        <nav id="sidebar-nav" class="sidebar-nav" aria-label="Documentation"></nav>
      </aside>
      <main class="content" id="content" tabindex="-1"></main>
    </div>
  </div>
  <script src="${rootPath}assets/js/app.js"></script>
</body>
</html>
`;
}

function redirectHtml({ lang, targetHref, title }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${targetHref}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Kabeeri VDF Docs</title>
  <script>window.location.replace(${JSON.stringify(targetHref)});</script>
</head>
<body>
  <p>Redirecting to <a href="${targetHref}">${targetHref}</a></p>
</body>
</html>
`;
}

function write(filePath, body) {
  fs.mkdirSync(path.dirname(path.join(__dirname, filePath)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, filePath), body, "utf8");
}

function writeJson(filePath, data) {
  write(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

write("index.html", html({ lang: "ar", dir: "rtl", title: "Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©", slug: "what-is", rootPath: "" }));
writeJson("page-templates.json", {
  template_version: 1,
  generated_by: "docs/site/generate-pages.js",
  site_name: "Kabeeri VDF Docs",
  template_count: templates.length,
  templates
});
writeJson("site-manifest.json", buildSiteManifest());
writeJson("page-contracts.json", buildPageContracts());

for (const [slug, enTitle, arTitle] of pages) {
  const targetSlug = pageAliases[slug] || slug;
  if (targetSlug !== slug) {
    write(path.join("pages", "en", `${slug}.html`), redirectHtml({ lang: "en", targetHref: `../../pages/en/${targetSlug}.html`, title: enTitle }));
    write(path.join("pages", "ar", `${slug}.html`), redirectHtml({ lang: "ar", targetHref: `../../pages/ar/${targetSlug}.html`, title: arTitle }));
    continue;
  }
  write(path.join("pages", "en", `${slug}.html`), html({ lang: "en", dir: "ltr", title: enTitle, slug, rootPath: "../../" }));
  write(path.join("pages", "ar", `${slug}.html`), html({ lang: "ar", dir: "rtl", title: arTitle, slug, rootPath: "../../" }));
}




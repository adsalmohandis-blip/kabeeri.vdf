const fs = require("fs");
const path = require("path");

const pages = [
  ["what-is", "Overview", "نظرة عامة"],
  ["start-here", "Start Here", "ابدأ من هنا"],
  ["install-profiles", "Install and Profiles", "التثبيت والبروفايلات"],
  ["ai-with-kabeeri", "AI Works Inside Kabeeri", "كيف يعمل AI داخل كبيري"],
  ["developer-onboarding", "Developer Onboarding", "تأهيل المطور"],
  ["capabilities", "System Capabilities", "قدرات النظام"],
  ["repository-layout", "Repository Layout", "تنظيم المستودع"],
  ["new-project", "Start a New Application", "بدء تطبيق جديد"],
  ["existing-kabeeri-project", "Continue a Kabeeri Project", "استكمال مشروع كبيري"],
  ["existing-non-kabeeri-project", "Adopt an Existing App", "اعتماد تطبيق قائم"],
  ["delivery-mode", "Choose Agile or Structured", "اختيار Agile أو Structured"],
  ["agile-delivery", "Agile Delivery", "التسليم الأجايل"],
  ["structured-delivery", "Structured Delivery", "التسليم المنظم"],
  ["questionnaire-engine", "Questionnaire Engine", "محرك الأسئلة"],
  ["product-blueprints", "Product Blueprints", "خرائط المنتجات"],
  ["data-design", "Data Design", "تصميم البيانات"],
  ["ui-ux-advisor", "UI/UX Advisor", "مساعد تصميم الواجهات"],
  ["ui-ux-reference-library", "UI/UX Reference Library", "مكتبة مراجع UI/UX"],
  ["vibe-first", "Vibe-first Workflow", "مسار Vibe-first"],
  ["task-governance", "Task Governance", "حوكمة التاسكات"],
  ["app-boundary", "App Boundary Governance", "حوكمة حدود التطبيقات"],
  ["workstreams-scope", "Workstreams and Scope", "مسارات العمل والنطاق"],
  ["prompt-packs", "Prompt Packs", "حزم البرومبت"],
  ["wordpress-development", "WordPress Development", "تطوير WordPress"],
  ["wordpress-plugins", "WordPress Plugin Development", "تطوير إضافات WordPress"],
  ["dashboard-monitoring", "Live Dashboard", "الداشبورد الحي"],
  ["ai-cost-control", "AI Cost Control", "التحكم في تكلفة AI"],
  ["multi-ai-governance", "Multi-AI Governance", "حوكمة تعدد وكلاء AI"],
  ["github-release", "GitHub and Release Gates", "GitHub وبوابات الإصدار"],
  ["practical-examples", "Seven Practical Builds", "سبعة تطبيقات عملية"],
  ["example-ecommerce", "Example: Ecommerce Website", "مثال: متجر إلكتروني"],
  ["example-ai-team-ecommerce", "Example: 3 AI Developers Build Ecommerce", "مثال: 3 مطوري AI لبناء متجر"],
  ["example-blog", "Example: Personal Blog", "مثال: مدونة شخصية"],
  ["example-wordpress-digital-agency", "Example: WordPress Digital Agency", "مثال: WordPress لشركة تسويق رقمي"],
  ["example-dental-clinic", "Example: Dental Clinic Booking", "مثال: عيادة أسنان وحجوزات"],
  ["example-crm", "Example: Professional CRM", "مثال: CRM احترافي"],
  ["example-mobile-commerce", "Example: Ecommerce Mobile App", "مثال: تطبيق موبايل للمتجر"],
  ["example-pos", "Example: Supermarket POS", "مثال: POS سوبرماركت"],
  ["troubleshooting", "Troubleshooting", "حل المشكلات"]
];

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
  const filter = lang === "ar" ? "تصفية" : "Filter";
  const search = lang === "ar" ? "ابحث في الدليل" : "Search docs";
  const arabicLabel = "العربية";

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

function write(filePath, body) {
  fs.mkdirSync(path.dirname(path.join(__dirname, filePath)), { recursive: true });
  fs.writeFileSync(path.join(__dirname, filePath), body, "utf8");
}

function writeJson(filePath, data) {
  write(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

write("index.html", html({ lang: "ar", dir: "rtl", title: "نظرة عامة", slug: "what-is", rootPath: "" }));
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
  write(path.join("pages", "en", `${slug}.html`), html({ lang: "en", dir: "ltr", title: enTitle, slug, rootPath: "../../" }));
  write(path.join("pages", "ar", `${slug}.html`), html({ lang: "ar", dir: "rtl", title: arTitle, slug, rootPath: "../../" }));
}

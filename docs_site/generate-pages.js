const fs = require("fs");
const path = require("path");

const pages = [
  ["what-is", "What is Kabeeri-vdf", "ما هو Kabeeri-vdf"],
  ["start-here", "Start here", "ابدأ من هنا"],
  ["new-project", "New project workflow", "مسار مشروع جديد"],
  ["existing-project", "Existing project adoption", "اعتماد مشروع قائم"],
  ["structured-delivery", "Structured Delivery", "التسليم المنظم"],
  ["agile-delivery", "Agile Delivery", "التسليم الأجايل"],
  ["questionnaire-engine", "Questionnaire engine", "محرك الأسئلة"],
  ["task-governance", "Task governance and provenance", "حوكمة التاسكات والمصدر"],
  ["dashboard-monitoring", "Dashboard and monitoring", "الداشبورد والمتابعة"],
  ["owner-verify", "Owner verify", "تحقق المالك"],
  ["ai-cost-control", "AI cost control", "التحكم في تكلفة الذكاء الاصطناعي"],
  ["multi-ai-governance", "Multi-AI governance", "حوكمة تعدد وكلاء الذكاء الاصطناعي"],
  ["vibe-first", "Vibe-first workflow", "مسار Vibe-first"],
  ["design-source-governance", "Design source governance", "حوكمة مصادر التصميم"],
  ["production-publish", "Production vs Publish", "الإنتاج مقابل النشر"],
  ["troubleshooting", "Troubleshooting", "حل المشكلات"]
];

function html({ lang, dir, title, slug, rootPath }) {
  const filter = lang === "ar" ? "تصفية" : "Filter";
  const search = lang === "ar" ? "ابحث في الدليل" : "Search docs";
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
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
        <a class="language-link" data-lang-target="ar" href="#">العربية</a>
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
  fs.writeFileSync(path.join(__dirname, filePath), body, "utf8");
}

write("index.html", html({ lang: "en", dir: "ltr", title: "Kabeeri VDF Docs", slug: "what-is", rootPath: "" }));

for (const [slug, enTitle, arTitle] of pages) {
  write(path.join("pages", "en", `${slug}.html`), html({ lang: "en", dir: "ltr", title: enTitle, slug, rootPath: "../../" }));
  write(path.join("pages", "ar", `${slug}.html`), html({ lang: "ar", dir: "rtl", title: arTitle, slug, rootPath: "../../" }));
}

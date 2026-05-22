const fs = require("fs");
const path = require("path");

const PLUGIN_ID = "ui_ux_intelligence";

const EXPECTED_DATA_FILES = [
  "products.csv",
  "styles.csv",
  "colors.csv",
  "typography.csv",
  "ui-reasoning.csv",
  "ux-guidelines.csv",
  "charts.csv",
  "landing.csv",
  "icons.csv",
  "app-interface.csv",
  "react-performance.csv"
];

const EXPECTED_STACK_FILES = [
  "angular.csv",
  "astro.csv",
  "flutter.csv",
  "html-tailwind.csv",
  "jetpack-compose.csv",
  "laravel.csv",
  "nextjs.csv",
  "nuxt-ui.csv",
  "nuxtjs.csv",
  "react-native.csv",
  "react.csv",
  "shadcn.csv",
  "svelte.csv",
  "swiftui.csv",
  "threejs.csv",
  "vue.csv"
];

const DOMAIN_FILES = {
  products: ["products.csv"],
  styles: ["styles.csv"],
  colors: ["colors.csv"],
  typography: ["typography.csv"],
  ui_reasoning: ["ui-reasoning.csv"],
  ux_guidelines: ["ux-guidelines.csv"],
  charts: ["charts.csv"],
  landing: ["landing.csv"],
  icons: ["icons.csv"],
  app_interface: ["app-interface.csv"],
  react_performance: ["react-performance.csv"],
  stacks: [...EXPECTED_STACK_FILES]
};

const STACK_FAMILIES = {
  angular: "web",
  astro: "web",
  flutter: "mobile",
  "html-tailwind": "web",
  "jetpack-compose": "mobile",
  laravel: "web",
  nextjs: "web",
  "nuxt-ui": "web",
  nuxtjs: "web",
  "react-native": "mobile",
  react: "web",
  shadcn: "web",
  svelte: "web",
  swiftui: "mobile",
  threejs: "immersive",
  vue: "web"
};

const CACHE = new Map();

const PRODUCT_PROFILES = {
  saas: {
    label: "SaaS (General)",
    source_label: "SaaS (General)",
    keywords: ["app", "b2b", "cloud", "general", "saas", "software", "subscription"],
    style: "modern_saas",
    palette: "trust",
    typography: "professional",
    layout_patterns: ["hero_features_cta", "pricing_page_cta", "real_time_operations_landing"],
    components: ["top_navigation", "pricing_cards", "insights_cards", "empty_state", "settings_panel"],
    ux_rules: ["visible focus states", "clear empty states", "loading states", "error states"]
  },
  ecommerce: {
    label: "E-commerce",
    source_label: "E-commerce",
    keywords: ["buy", "commerce", "e", "ecommerce", "products", "retail", "sell", "shop", "store"],
    style: "ecommerce_conversion",
    palette: "ecommerce",
    typography: "modern",
    layout_patterns: ["feature_rich_showcase", "comparison_table_cta", "pricing_focused_landing"],
    components: ["product_grid", "filter_sidebar", "cart_drawer", "checkout_summary", "product_gallery"],
    ux_rules: ["no hidden primary action", "no destructive action without confirmation", "loading states", "error states"]
  },
  booking: {
    label: "B2B Service",
    source_label: "B2B Service",
    keywords: ["appointment", "booking", "business", "consultation", "corporate", "enterprise", "service", "clinic", "schedule", "reservation"],
    style: "professional_dashboard",
    palette: "trust",
    typography: "professional",
    layout_patterns: ["minimal_single_column", "lead_magnet_form", "faq_documentation_landing"],
    components: ["availability_calendar", "time_slot_picker", "booking_form", "confirmation_state", "reminder_banner"],
    ux_rules: ["visible focus states", "clear empty states", "loading states", "no hidden primary action"]
  },
  dashboard: {
    label: "Analytics Dashboard",
    source_label: "Analytics Dashboard",
    keywords: ["admin", "analytics", "dashboard", "data", "panel", "monitoring", "ops"],
    style: "enterprise_clean",
    palette: "technical",
    typography: "technical",
    layout_patterns: ["real_time_operations_landing", "bento_grid_showcase", "feature_rich_showcase"],
    components: ["sidebar_navigation", "metrics_cards", "data_table", "filters_bar", "status_badges"],
    ux_rules: ["clear empty states", "loading states", "error states", "keyboard accessibility"]
  },
  marketplace: {
    label: "Marketplace (P2P)",
    source_label: "Marketplace (P2P)",
    keywords: ["marketplace", "multi-vendor", "catalog", "listing", "browse", "p2p"],
    style: "modern_saas",
    palette: "ecommerce",
    typography: "modern",
    layout_patterns: ["marketplace_directory", "feature_rich_showcase", "comparison_table_cta"],
    components: ["search_bar", "filter_sidebar", "listing_cards", "seller_cards", "trust_badges"],
    ux_rules: ["visible focus states", "clear empty states", "loading states", "no hidden primary action"]
  },
  portfolio: {
    label: "Portfolio/Personal",
    source_label: "Portfolio/Personal",
    keywords: ["creative", "personal", "portfolio", "projects", "showcase", "work"],
    style: "minimal",
    palette: "calm",
    typography: "editorial",
    layout_patterns: ["portfolio_grid", "hero_centric_design", "scroll_triggered_storytelling"],
    components: ["hero_banner", "project_cards", "about_section", "contact_cta", "testimonials"],
    ux_rules: ["visible focus states", "mobile responsiveness", "clear empty states"]
  },
  blog: {
    label: "Newsletter / Content First",
    source_label: "Knowledge Base/Documentation",
    keywords: ["blog", "article", "content", "editorial", "publishing", "newsletter", "subscribe", "writer"],
    style: "content_focused",
    palette: "calm",
    typography: "editorial",
    layout_patterns: ["newsletter_content_first", "faq_documentation_landing", "hero_testimonials_cta"],
    components: ["article_list", "featured_story", "sidebar_toc", "author_card", "newsletter_cta"],
    ux_rules: ["visible focus states", "loading states", "responsive layout", "clear empty states"]
  },
  admin_panel: {
    label: "Enterprise Gateway",
    source_label: "Enterprise Gateway",
    keywords: ["admin panel", "backoffice", "ops panel", "internal tool", "enterprise", "gateway", "portal"],
    style: "enterprise_clean",
    palette: "technical",
    typography: "technical",
    layout_patterns: ["trust_authority_conversion", "real_time_operations_landing", "feature_rich_showcase"],
    components: ["table_view", "bulk_actions", "settings_form", "audit_log", "status_filters"],
    ux_rules: ["keyboard accessibility", "loading states", "error states", "contrast targets"]
  },
  mobile_app: {
    label: "Mobile App",
    source_label: "Mobile App",
    keywords: ["mobile app", "ios", "android", "app", "react native", "flutter"],
    style: "mobile_first",
    palette: "calm",
    typography: "friendly",
    layout_patterns: ["flat_design_mobile_touch_first", "md3_mobile", "neo_brutalism_mobile"],
    components: ["bottom_navigation", "action_sheet", "profile_header", "primary_cta", "empty_state"],
    ux_rules: ["mobile responsiveness", "keyboard accessibility", "visible focus states", "loading states"]
  },
  landing_page: {
    label: "Hero-Centric Design",
    source_label: "Hero-Centric Design",
    keywords: ["landing page", "marketing page", "campaign", "conversion", "hero", "hero-centric"],
    style: "modern_saas",
    palette: "trust",
    typography: "modern",
    layout_patterns: ["hero_centric_design", "feature_rich_showcase", "pricing_focused_landing"],
    components: ["hero_banner", "social_proof_strip", "feature_cards", "pricing_teaser", "primary_cta"],
    ux_rules: ["no hidden primary action", "mobile responsiveness", "loading states"]
  }
};

const STYLE_PROFILES = {
  minimal: { source_label: "Minimalism & Swiss Style", mood: "minimal", title: "Minimal / Swiss", description: "Minimal, functional layouts with strong hierarchy and wide spacing." },
  professional_dashboard: { source_label: "Corporate Trust", mood: "professional", title: "Professional Dashboard", description: "Clear, durable interfaces for enterprise dashboards and internal tools." },
  modern_saas: { source_label: "Friendly SaaS", mood: "modern", title: "Modern SaaS", description: "Modern product surfaces with soft structure and clear conversion hierarchy." },
  ecommerce_conversion: { source_label: "E-commerce Clean", mood: "ecommerce", title: "Ecommerce Conversion", description: "Conversion-focused commerce layouts with product clarity and strong calls to action." },
  mobile_first: { source_label: "Flat Design Mobile (Touch-First)", mood: "mobile", title: "Mobile First", description: "Touch-first responsive composition optimized for small screens." },
  content_focused: { source_label: "News Editorial", mood: "editorial", title: "Content Focused", description: "Editorial composition for story-led or knowledge-heavy products." },
  enterprise_clean: { source_label: "Corporate Trust", mood: "technical", title: "Enterprise Clean", description: "Professional surfaces for compliance-sensitive or operational products." }
};

const PALETTE_PROFILES = {
  trust: { source_label: "SaaS (General)", title: "Trust", mood: "trust" },
  premium: { source_label: "Luxury/Premium Brand", title: "Premium", mood: "premium" },
  calm: { source_label: "Healthcare App", title: "Calm", mood: "calm" },
  energetic: { source_label: "Social Media App", title: "Energetic", mood: "energetic" },
  technical: { source_label: "Smart Home/IoT Dashboard", title: "Technical", mood: "technical" },
  healthcare: { source_label: "Medical Clinic", title: "Healthcare", mood: "healthcare" },
  finance: { source_label: "Banking/Traditional Finance", title: "Finance", mood: "finance" },
  ecommerce: { source_label: "E-commerce", title: "Ecommerce", mood: "ecommerce" }
};

const TYPOGRAPHY_PROFILES = {
  professional: { source_label: "Modern Professional", mood: "professional", title: "Professional" },
  modern: { source_label: "Geometric Modern", mood: "modern", title: "Modern" },
  technical: { source_label: "Developer Mono", mood: "technical", title: "Technical" },
  friendly: { source_label: "Soft Rounded", mood: "friendly", title: "Friendly" },
  editorial: { source_label: "Editorial Classic", mood: "editorial", title: "Editorial" },
  luxury: { source_label: "Luxury Serif", mood: "luxury", title: "Luxury" },
  calm: { source_label: "Wellness Calm", mood: "calm", title: "Calm" },
  accessible: { source_label: "Accessibility First", mood: "accessible", title: "Accessible" },
  playful: { source_label: "Playful Creative", mood: "playful", title: "Playful" },
  mono: { source_label: "Developer Mono", mood: "mono", title: "Mono" }
};

const LAYOUT_NAMES = [
  "Hero + Features + CTA",
  "Hero + Testimonials + CTA",
  "Product Demo + Features",
  "Minimal Single Column",
  "Funnel (3-Step Conversion)",
  "Comparison Table + CTA",
  "Lead Magnet + Form",
  "Pricing Page + CTA",
  "Video-First Hero",
  "Scroll-Triggered Storytelling",
  "AI Personalization Landing",
  "Waitlist/Coming Soon",
  "Comparison Table Focus",
  "Pricing-Focused Landing",
  "App Store Style Landing",
  "FAQ/Documentation Landing",
  "Immersive/Interactive Experience",
  "Event/Conference Landing",
  "Product Review/Ratings Focused",
  "Community/Forum Landing",
  "Before-After Transformation",
  "Marketplace / Directory",
  "Newsletter / Content First",
  "Webinar Registration",
  "Enterprise Gateway",
  "Portfolio Grid",
  "Horizontal Scroll Journey",
  "Bento Grid Showcase",
  "Interactive 3D Configurator",
  "AI-Driven Dynamic Landing",
  "Feature-Rich Showcase",
  "Hero-Centric Design",
  "Trust & Authority + Conversion",
  "Real-Time / Operations Landing"
];

const UX_RULE_TEXTS = [
  "Accessible: high contrast, large text, keyboard support, ARIA labels.",
  "Touch: 44x44px minimum targets and clear spacing.",
  "Performance: avoid layout thrash and keep loading states visible.",
  "Forms: labels, inline errors, helper text, and confirmation feedback.",
  "Navigation: predictable back behavior and visible active states.",
  "Data: legends, tooltips, and accessible colors for charts."
];

const ANTI_PATTERNS = [
  "color-only state signaling",
  "hover-only primary actions",
  "forms without validation messages",
  "too many CTAs",
  "dashboard without empty states",
  "tables without headers",
  "mobile layout with horizontal scroll",
  "loading without feedback"
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s/]+/gu, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function splitList(value) {
  return String(value || "")
    .split(/[,|/;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === ",") {
      current.push(cell);
      cell = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      current.push(cell);
      if (current.some((item) => String(item).trim() !== "")) rows.push(current);
      current = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  current.push(cell);
  if (current.some((item) => String(item).trim() !== "")) rows.push(current);
  return rows;
}

function toFieldName(value) {
  return normalizeText(value).replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function readCsvRecords(filePath) {
  const warnings = [];
  if (!fs.existsSync(filePath)) return { headers: [], rows: [], warnings: [`Missing file: ${path.basename(filePath)}`] };

  const text = fs.readFileSync(filePath, "utf8");
  const table = parseCsv(text);
  if (!table.length) return { headers: [], rows: [], warnings };

  const headers = table[0].map((header) => String(header || "").trim());
  const rows = [];
  for (let rowIndex = 1; rowIndex < table.length; rowIndex += 1) {
    const values = table[rowIndex];
    const record = {};
    headers.forEach((header, headerIndex) => {
      record[toFieldName(header)] = String(values[headerIndex] || "").trim();
    });
    if (Object.values(record).some((value) => String(value).trim() !== "")) {
      rows.push(record);
    }
  }
  return { headers, rows, warnings };
}

function locateRowByLabel(rows, labelKey, label) {
  const normalizedLabel = normalizeText(label);
  return rows.find((row) => normalizeText(row[labelKey]) === normalizedLabel) || null;
}

function buildLayoutPatterns(rows) {
  return rows.map((row) => ({
    id: slugify(row.pattern_name),
    title: row.pattern_name,
    purpose: row.conversion_optimization || row.section_order || "",
    section_order: row.section_order || "",
    cta_placement: row.primary_cta_placement || "",
    color_strategy: row.color_strategy || "",
    effects: row.recommended_effects || "",
    text: normalizeText([row.pattern_name, row.keywords, row.section_order, row.primary_cta_placement, row.color_strategy, row.recommended_effects, row.conversion_optimization].join(" "))
  }));
}

function buildProductRecord(row) {
  const label = row.product_type || row["product type"] || "Unknown";
  const profile = PRODUCT_PROFILES[slugify(label)] || PRODUCT_PROFILES.saas;
  return {
    id: slugify(label),
    label,
    keywords: splitList(row.keywords).concat(profile.keywords || []),
    style: profile.style,
    palette_mood: profile.palette,
    typography_mood: profile.typography,
    layout_patterns: profile.layout_patterns,
    components: profile.components,
    ux_rules: profile.ux_rules,
    source_label: profile.source_label,
    source_file: "products.csv",
    text: normalizeText([
      label,
      row.keywords,
      row.primary_style_recommendation,
      row.secondary_styles,
      row.landing_page_pattern,
      row.dashboard_style_if_applicable,
      row.color_palette_focus,
      row.key_considerations
    ].join(" "))
  };
}

function buildStyleRecord(row) {
  const label = row.style_category || "Style";
  const id = row.type ? slugify(row.type) : slugify(label);
  return {
    id,
    label,
    type: row.type || "",
    keywords: splitList(row.keywords),
    description: row.best_for || row["do_not_use_for"] || "",
    source_file: "styles.csv",
    text: normalizeText(Object.values(row).join(" "))
  };
}

function buildColorRecord(row) {
  const label = row.product_type || "Palette";
  const id = slugify(label);
  return {
    id,
    label,
    primary: row.primary || "",
    on_primary: row.on_primary || "",
    secondary: row.secondary || "",
    on_secondary: row.on_secondary || "",
    accent: row.accent || "",
    background: row.background || "",
    foreground: row.foreground || "",
    card: row.card || "",
    notes: row.notes || "",
    source_file: "colors.csv",
    text: normalizeText(Object.values(row).join(" "))
  };
}

function buildTypographyRecord(row) {
  const label = row.font_pairing_name || "Typography";
  return {
    id: slugify(label),
    label,
    category: row.category || "",
    heading_font: row.heading_font || "",
    body_font: row.body_font || "",
    mood_keywords: splitList(row.mood_style_keywords),
    best_for: row.best_for || "",
    notes: row.notes || "",
    source_file: "typography.csv",
    text: normalizeText(Object.values(row).join(" "))
  };
}

function buildGenericRecord(domain, row, labelKey, kind) {
  const label = row[labelKey] || Object.values(row).find((value) => String(value || "").trim()) || domain;
  return {
    id: slugify(label),
    label,
    kind,
    source_file: domain,
    text: normalizeText(Object.values(row).join(" ")),
    ...row
  };
}

function buildStackRecord(fileName, row) {
  const stackId = path.basename(fileName, ".csv");
  return {
    id: `${stackId}-${slugify(row.category || row.guideline || row.issue || row.icon_name || row.pattern_name || row["data type"] || "row")}`,
    stack_id: stackId,
    label: row.category || row.guideline || row.issue || row.icon_name || row.pattern_name || stackId,
    family: STACK_FAMILIES[stackId] || "web",
    source_file: fileName,
    text: normalizeText(Object.values(row).join(" ")),
    ...row
  };
}

function buildCatalog(root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const pluginRoot = path.join(resolvedRoot, "plugins", PLUGIN_ID);
  const dataRoot = path.join(pluginRoot, "data");
  const stackRoot = path.join(dataRoot, "stacks");
  const warnings = [];

  const domainBuckets = {
    products: [],
    styles: [],
    colors: [],
    typography: [],
    ui_reasoning: [],
    ux_guidelines: [],
    charts: [],
    landing: [],
    icons: [],
    app_interface: [],
    react_performance: [],
    stacks: []
  };

  const fileStats = {};

  for (const fileName of EXPECTED_DATA_FILES) {
    const filePath = path.join(dataRoot, fileName);
    const { rows, warnings: fileWarnings } = readCsvRecords(filePath);
    warnings.push(...fileWarnings);
    fileStats[fileName] = rows.length;

    const domain = fileName.replace(/\.csv$/, "").replace(/-/g, "_");
    if (!rows.length) continue;

    if (fileName === "products.csv") {
      domainBuckets.products.push(...rows.map(buildProductRecord));
    } else if (fileName === "styles.csv") {
      domainBuckets.styles.push(...rows.map(buildStyleRecord));
    } else if (fileName === "colors.csv") {
      domainBuckets.colors.push(...rows.map(buildColorRecord));
    } else if (fileName === "typography.csv") {
      domainBuckets.typography.push(...rows.map(buildTypographyRecord));
    } else if (fileName === "landing.csv") {
      domainBuckets.landing.push(...rows.map((row) => buildGenericRecord("landing", row, "pattern_name", "landing_pattern")));
    } else if (fileName === "icons.csv") {
      domainBuckets.icons.push(...rows.map((row) => buildGenericRecord("icons", row, "icon_name", "icon")));
    } else if (fileName === "charts.csv") {
      domainBuckets.charts.push(...rows.map((row) => buildGenericRecord("charts", row, "best_chart_type", "chart")));
    } else if (fileName === "app-interface.csv") {
      domainBuckets.app_interface.push(...rows.map((row) => buildGenericRecord("app-interface", row, "issue", "interface_issue")));
    } else if (fileName === "react-performance.csv") {
      domainBuckets.react_performance.push(...rows.map((row) => buildGenericRecord("react-performance", row, "issue", "performance_issue")));
    } else if (fileName === "ux-guidelines.csv") {
      domainBuckets.ux_guidelines.push(...rows.map((row) => buildGenericRecord("ux-guidelines", row, "issue", "ux_guideline")));
    } else if (fileName === "ui-reasoning.csv") {
      domainBuckets.ui_reasoning.push(...rows.map((row) => buildGenericRecord("ui-reasoning", row, "recommended_pattern", "ui_reasoning")));
    }
  }

  for (const stackFile of EXPECTED_STACK_FILES) {
    const filePath = path.join(stackRoot, stackFile);
    const { rows, warnings: fileWarnings } = readCsvRecords(filePath);
    warnings.push(...fileWarnings);
    fileStats[`stacks/${stackFile}`] = rows.length;
    domainBuckets.stacks.push(...rows.map((row) => buildStackRecord(stackFile, row)));
  }

  const records = [];
  for (const domain of Object.keys(domainBuckets)) {
    for (const record of domainBuckets[domain]) {
      records.push({
        ...record,
        domain,
        search_text: record.text || normalizeText(Object.values(record).join(" "))
      });
    }
  }

  const layouts = buildLayoutPatterns(domainBuckets.landing.map((record) => ({
    pattern_name: record.label,
    section_order: record.section_order || "",
    primary_cta_placement: record.primary_cta_placement || "",
    color_strategy: record.color_strategy || "",
    recommended_effects: record.recommended_effects || "",
    conversion_optimization: record.conversion_optimization || "",
    keywords: record.keywords || ""
  })));

  const summary = buildSummary(records, warnings, fileStats);

  return {
    plugin_id: PLUGIN_ID,
    root: resolvedRoot,
    plugin_root: pluginRoot,
    data_root: dataRoot,
    stack_root: stackRoot,
    records,
    domains: domainBuckets,
    layouts,
    warnings,
    file_stats: fileStats,
    summary,
    catalog_ready: summary.catalog_ready,
    external_github_dependency: false,
    temp_meta_dependency: false
  };
}

function buildSummary(records, warnings, fileStats) {
  const domainCounts = {};
  for (const record of records) {
    domainCounts[record.domain] = (domainCounts[record.domain] || 0) + 1;
  }
  const catalogReady = Object.values(domainCounts).every((count, index, list) => count > 0 && list.length > 0) && !warnings.some((warning) => warning.startsWith("Missing file:"));
  return {
    total_records: records.length,
    domain_counts: domainCounts,
    file_stats: fileStats,
    warnings: warnings.slice(),
    catalog_ready: catalogReady
  };
}

function loadCatalog(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const cached = CACHE.get(root);
  if (cached && !options.refresh) return cached;
  const catalog = buildCatalog(root);
  CACHE.set(root, catalog);
  return catalog;
}

function getCatalogSummary(options = {}) {
  const catalog = loadCatalog(options);
  return {
    report_type: "ui_ux_intelligence_catalog",
    plugin_id: PLUGIN_ID,
    catalog_ready: catalog.catalog_ready,
    domains: listCatalogDomains(),
    summary: {
      total_records: catalog.summary.total_records,
      domain_counts: catalog.summary.domain_counts,
      file_stats: catalog.summary.file_stats,
      warnings: catalog.summary.warnings
    },
    external_github_dependency: false,
    temp_meta_dependency: false,
    next_action: "Run kvdf ui-ux-intelligence search --query \"...\" --domain all --json."
  };
}

function listCatalogDomains() {
  return [...Object.keys(DOMAIN_FILES), "all"];
}

function normalizeDomain(domain) {
  const value = normalizeText(domain);
  if (!value || value === "all") return "all";
  return value.replace(/\s+/g, "_").replace(/[^a-z0-9_]+/g, "");
}

function getRecords(domain, options = {}) {
  const catalog = loadCatalog(options);
  const normalized = normalizeDomain(domain);
  if (normalized === "all") return catalog.records.map(cloneRecord);
  if (catalog.domains[normalized]) return catalog.domains[normalized].map(cloneRecord);

  const stackOnly = catalog.domains.stacks.filter((record) => record.stack_id === normalized);
  if (stackOnly.length) return stackOnly.map(cloneRecord);
  return [];
}

function searchCatalog(query, options = {}) {
  const { searchRecords } = require("./search_engine");
  const domain = normalizeDomain(options.domain || "all");
  const records = getRecords(domain, options);
  const result = searchRecords(query, records, options);
  return {
    report_type: "ui_ux_intelligence_search",
    query: String(query || ""),
    domain,
    total_matches: result.results.length,
    results: result.results,
    warnings: result.warnings,
    next_action: "Use a match to refine a UI/UX recommendation or design-system output."
  };
}

function findProductProfile(idOrText, options = {}) {
  const catalog = loadCatalog(options);
  const query = normalizeText(idOrText);
  if (!query) return buildProfileFromSpec("saas", catalog);

  for (const [key, spec] of Object.entries(PRODUCT_PROFILES)) {
    if (normalizeText(key) === query || normalizeText(spec.label) === query || normalizeText(spec.source_label) === query) {
      return buildProfileFromSpec(key, catalog);
    }
    if ([...(spec.keywords || []), ...(spec.extra_keywords || [])].some((keyword) => normalizeText(keyword) === query || normalizeText(keyword).includes(query) || query.includes(normalizeText(keyword)))) {
      return buildProfileFromSpec(key, catalog);
    }
  }

  const direct = catalog.domains.products.find((record) => normalizeText(record.label) === query || normalizeText(record.id) === query || (record.keywords || []).some((keyword) => normalizeText(keyword) === query));
  if (direct) {
    const profileKey = Object.keys(PRODUCT_PROFILES).find((key) => normalizeText(PRODUCT_PROFILES[key].label) === normalizeText(direct.label));
    if (profileKey) return buildProfileFromSpec(profileKey, catalog);
    return enrichProductRecord(direct);
  }

  return buildProfileFromSpec("saas", catalog);
}

function buildProfileFromSpec(key, catalog) {
  const spec = PRODUCT_PROFILES[key] || PRODUCT_PROFILES.saas;
  const base = locateRowByLabel(catalog.domains.products.map((record) => record), "label", spec.source_label) || catalog.domains.products[0] || null;
  const record = base ? enrichProductRecord(base) : {
    id: key,
    label: spec.label,
    keywords: spec.keywords.slice(),
    style: spec.style,
    palette_mood: spec.palette,
    typography_mood: spec.typography,
    layout_patterns: spec.layout_patterns.slice(),
    components: spec.components.slice(),
    ux_rules: spec.ux_rules.slice()
  };
  return {
    ...record,
    id: key,
    label: spec.label,
    keywords: uniqueStrings([...(record.keywords || []), ...(spec.keywords || [])]),
    style: spec.style,
    palette_mood: spec.palette,
    typography_mood: spec.typography,
    layout_patterns: spec.layout_patterns.slice(),
    components: spec.components.slice(),
    ux_rules: spec.ux_rules.slice()
  };
}

function enrichProductRecord(record) {
  return {
    id: record.id,
    label: record.label,
    keywords: uniqueStrings([...(record.keywords || []), ...(PRODUCT_PROFILES[record.id]?.keywords || [])]),
    style: PRODUCT_PROFILES[record.id]?.style || "modern_saas",
    palette_mood: PRODUCT_PROFILES[record.id]?.palette || "trust",
    typography_mood: PRODUCT_PROFILES[record.id]?.typography || "professional",
    layout_patterns: PRODUCT_PROFILES[record.id]?.layout_patterns || [],
    components: PRODUCT_PROFILES[record.id]?.components || [],
    ux_rules: PRODUCT_PROFILES[record.id]?.ux_rules || []
  };
}

function getProductType(idOrText, options = {}) {
  return findProductProfile(idOrText, options);
}

function getStyle(idOrText, options = {}) {
  const catalog = loadCatalog(options);
  const query = normalizeText(idOrText);
  const specKey = Object.keys(STYLE_PROFILES).find((key) => normalizeText(key) === query);
  if (specKey) {
    const spec = STYLE_PROFILES[specKey];
    return {
      id: specKey,
      label: spec.title,
      description: spec.description,
      source_label: spec.source_label,
      keywords: [],
      source: "styles.csv"
    };
  }

  const byLabel = catalog.domains.styles.find((record) => normalizeText(record.label) === query || normalizeText(record.id) === query);
  if (byLabel) {
    return {
      id: byLabel.id,
      label: byLabel.label,
      description: byLabel.description || byLabel.best_for || byLabel.notes || "",
      source_label: byLabel.label,
      keywords: byLabel.keywords || [],
      source: byLabel.source_file
    };
  }

  const fallback = STYLE_PROFILES.modern_saas;
  return {
    id: "modern_saas",
    label: fallback.title,
    description: fallback.description,
    source_label: fallback.source_label,
    keywords: [],
    source: "styles.csv"
  };
}

function getPalette(mood, options = {}) {
  const catalog = loadCatalog(options);
  const query = normalizeText(mood);
  const specKey = Object.keys(PALETTE_PROFILES).find((key) => normalizeText(key) === query);
  const spec = PALETTE_PROFILES[specKey || "trust"];
  const row = catalog.domains.colors.find((record) => normalizeText(record.label) === normalizeText(spec.source_label)) || catalog.domains.colors[0];
  const colors = row ? {
    background: row.background || "#f8fafc",
    surface: row.card || "#ffffff",
    primary: row.primary || "#1d4ed8",
    secondary: row.secondary || "#0f172a",
    accent: row.accent || "#38bdf8",
    text: row.foreground || "#0f172a",
    border: row.border || "#dbe3ef"
  } : {
    background: "#f8fafc",
    surface: "#ffffff",
    primary: "#1d4ed8",
    secondary: "#0f172a",
    accent: "#38bdf8",
    text: "#0f172a",
    border: "#dbe3ef"
  };
  return {
    mood: spec.mood,
    title: spec.title,
    colors,
    source_label: spec.source_label
  };
}

function getTypography(mood, options = {}) {
  const catalog = loadCatalog(options);
  const query = normalizeText(mood);
  const specKey = Object.keys(TYPOGRAPHY_PROFILES).find((key) => normalizeText(key) === query);
  const spec = TYPOGRAPHY_PROFILES[specKey || "professional"];
  const row = catalog.domains.typography.find((record) => normalizeText(record.label) === normalizeText(spec.source_label)) || catalog.domains.typography[0];
  const families = row ? {
    heading: splitList(row.heading_font || row.category || "").length ? splitList(row.heading_font || row.category || "") : [row.heading_font || "Inter"],
    body: splitList(row.body_font || row.category || "").length ? splitList(row.body_font || row.category || "") : [row.body_font || "Inter"]
  } : {
    heading: ["Inter"],
    body: ["Inter"]
  };
  return {
    mood: spec.mood,
    title: spec.title,
    families,
    scale: {
      display: "3.5rem",
      h1: "2.5rem",
      h2: "2rem",
      h3: "1.5rem",
      body: "1rem",
      small: "0.875rem"
    },
    source_label: spec.source_label
  };
}

function getStackProfile(idOrText, options = {}) {
  const catalog = loadCatalog(options);
  const query = normalizeText(idOrText);
  const stackId = Object.keys(STACK_FAMILIES).find((key) => normalizeText(key) === query);
  if (stackId) {
    const rows = catalog.domains.stacks.filter((record) => record.stack_id === stackId);
    return {
      id: stackId,
      label: stackId,
      family: STACK_FAMILIES[stackId] || "web",
      ui_focus: buildStackUiFocus(stackId),
      keywords: uniqueStrings(rows.flatMap((record) => splitList(record.keywords || record.category || record.issue || record.guideline || ""))),
      notes: rows.slice(0, 4).map((record) => record.label).join("; ")
    };
  }

  const matchingRecord = catalog.domains.stacks.find((record) => normalizeText(record.stack_id) === query || normalizeText(record.label) === query || normalizeText(record.id) === query);
  if (matchingRecord) {
    return {
      id: matchingRecord.stack_id,
      label: matchingRecord.stack_id,
      family: matchingRecord.family || "web",
      ui_focus: buildStackUiFocus(matchingRecord.stack_id),
      keywords: splitList(matchingRecord.keywords || matchingRecord.category || matchingRecord.issue || matchingRecord.guideline || ""),
      notes: matchingRecord.label || ""
    };
  }

  return null;
}

function buildStackUiFocus(stackId) {
  const family = STACK_FAMILIES[stackId] || "web";
  if (family === "mobile") return ["bottom_navigation", "primary_cta", "sheet_panel"];
  if (family === "immersive") return ["hero_cta", "media_surface", "story_timeline"];
  return ["top_navigation", "data_table", "card_grid"];
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function cloneRecord(record) {
  return JSON.parse(JSON.stringify(record));
}

function listSearchEntries(options = {}) {
  const catalog = loadCatalog(options);
  return [
    ...catalog.records.map((record) => ({
      kind: record.domain,
      id: record.id,
      label: record.label,
      text: record.search_text || record.text || ""
    })),
    ...catalog.layouts.map((pattern) => ({
      kind: "layout_pattern",
      id: pattern.id,
      label: pattern.title,
      text: pattern.text
    })),
    ...UX_RULE_TEXTS.map((rule, index) => ({
      kind: "ux_rule",
      id: `ux_rule_${index + 1}`,
      label: rule,
      text: rule
    })),
    ...ANTI_PATTERNS.map((item) => ({
      kind: "anti_pattern",
      id: slugify(item),
      label: item,
      text: item
    }))
  ];
}

function buildSummary(records, warnings, fileStats) {
  const domainCounts = {};
  for (const record of records) {
    domainCounts[record.domain] = (domainCounts[record.domain] || 0) + 1;
  }
  const catalogReady = EXPECTED_DATA_FILES.every((fileName) => fileStats[fileName] > 0) && EXPECTED_STACK_FILES.every((fileName) => fileStats[`stacks/${fileName}`] > 0);
  return {
    total_records: records.length,
    domain_counts: domainCounts,
    file_stats: fileStats,
    warnings: warnings.slice(),
    catalog_ready: catalogReady
  };
}

module.exports = {
  PLUGIN_ID,
  EXPECTED_DATA_FILES,
  EXPECTED_STACK_FILES,
  DOMAIN_FILES,
  LAYOUT_NAMES,
  UX_RULE_TEXTS,
  ANTI_PATTERNS,
  normalizeText,
  slugify,
  parseCsv,
  loadCatalog,
  getCatalogSummary,
  listCatalogDomains,
  getRecords,
  searchCatalog,
  getProductType,
  getStyle,
  getPalette,
  getTypography,
  getStackProfile,
  listSearchEntries
};

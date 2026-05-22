const {
  ANTI_PATTERNS,
  getPalette,
  getProductType,
  getStackProfile,
  getStyle,
  getTypography,
  loadCatalog,
  normalizeText
} = require("./catalog");
const { scoreRecord, searchRecords } = require("./search_engine");

const STACK_ALIASES = [
  { id: "react", terms: ["react", "react js", "reactjs"] },
  { id: "nextjs", terms: ["next", "next js", "nextjs"] },
  { id: "vue", terms: ["vue", "vuejs"] },
  { id: "nuxtjs", terms: ["nuxt", "nuxt js", "nuxtjs"] },
  { id: "nuxt-ui", terms: ["nuxt ui", "nuxt-ui"] },
  { id: "angular", terms: ["angular"] },
  { id: "svelte", terms: ["svelte"] },
  { id: "astro", terms: ["astro"] },
  { id: "flutter", terms: ["flutter"] },
  { id: "react-native", terms: ["react native", "react-native", "rn"] },
  { id: "swiftui", terms: ["swiftui", "swift ui"] },
  { id: "jetpack-compose", terms: ["jetpack compose", "jetpack-compose"] },
  { id: "html-tailwind", terms: ["html tailwind", "tailwind", "html-tailwind"] },
  { id: "shadcn", terms: ["shadcn"] },
  { id: "laravel", terms: ["laravel"] },
  { id: "threejs", terms: ["three js", "threejs", "3d"] }
];

const PRODUCT_HINTS = {
  booking: ["appointment", "booking", "clinic", "doctor", "schedule", "reservation", "calendar", "patient", "visit"],
  ecommerce: ["buy", "cart", "checkout", "commerce", "product", "retail", "shop", "store", "catalog", "purchase"],
  dashboard: ["analytics", "dashboard", "data", "insights", "kpi", "metrics", "monitoring", "report", "reports", "ops"],
  admin_panel: ["admin", "backoffice", "internal tool", "management", "portal", "operations"],
  marketplace: ["marketplace", "listing", "vendor", "multi-vendor", "browse", "catalog"],
  portfolio: ["portfolio", "creative", "showcase", "projects", "personal"],
  blog: ["blog", "article", "content", "newsletter", "editorial", "publish"],
  landing_page: ["landing", "marketing", "campaign", "conversion", "hero"],
  mobile_app: ["ios", "android", "mobile app", "react native", "flutter", "mobile"],
  saas: ["app", "platform", "cloud", "b2b", "software", "subscription", "saas"]
};

const PROFILE_PRIORITY_RULES = [
  { id: "booking", pattern: /(booking|appointment|clinic|doctor|patient|schedule|reservation|calendar)/i, boost: 120 },
  { id: "ecommerce", pattern: /(ecommerce|commerce|shop|store|cart|checkout|buy|purchase|product|retail|catalog)/i, boost: 120 },
  { id: "dashboard", pattern: /(dashboard|analytics|metric|metrics|insight|insights|report|reports|kpi|operations|monitoring)/i, boost: 120 },
  { id: "marketplace", pattern: /(marketplace|listing|vendor|multi-vendor|browse|seller)/i, boost: 100 },
  { id: "blog", pattern: /(blog|article|content|newsletter|editorial|publish)/i, boost: 100 },
  { id: "portfolio", pattern: /(portfolio|creative|showcase|project|projects|personal)/i, boost: 100 },
  { id: "landing_page", pattern: /(landing|marketing|campaign|hero|conversion)/i, boost: 90 },
  { id: "mobile_app", pattern: /(mobile app|ios|android|react native|flutter|mobile)/i, boost: 90 },
  { id: "saas", pattern: /(saas|b2b|platform|software|subscription|cloud)/i, boost: 60 }
];

const STYLE_BY_PRODUCT = {
  booking: "professional_dashboard",
  ecommerce: "ecommerce_conversion",
  dashboard: "enterprise_clean",
  admin_panel: "enterprise_clean",
  marketplace: "modern_saas",
  portfolio: "minimal",
  blog: "content_focused",
  landing_page: "modern_saas",
  mobile_app: "mobile_first",
  saas: "modern_saas"
};

const PALETTE_BY_PRODUCT = {
  booking: "healthcare",
  ecommerce: "ecommerce",
  dashboard: "technical",
  admin_panel: "technical",
  marketplace: "ecommerce",
  portfolio: "calm",
  blog: "calm",
  landing_page: "trust",
  mobile_app: "calm",
  saas: "trust"
};

const TYPOGRAPHY_BY_PRODUCT = {
  booking: "professional",
  ecommerce: "modern",
  dashboard: "technical",
  admin_panel: "technical",
  marketplace: "modern",
  portfolio: "editorial",
  blog: "editorial",
  landing_page: "modern",
  mobile_app: "friendly",
  saas: "professional"
};

const ICON_QUERY_BY_PRODUCT = {
  booking: ["calendar", "clock", "search", "check", "list"],
  ecommerce: ["shopping-cart", "shopping-bag", "search", "funnel", "heart"],
  dashboard: ["chart", "list", "search", "funnel", "clock"],
  admin_panel: ["sidebar", "list", "search", "funnel", "clock"],
  mobile_app: ["list", "arrow-left", "arrow-right", "close", "plus"],
  landing_page: ["arrow-right", "magnifying-glass", "share", "list", "calendar"],
  blog: ["list", "magnifying-glass", "calendar", "arrow-right", "share"],
  portfolio: ["arrow-right", "list", "share", "magnifying-glass", "link"],
  marketplace: ["search", "funnel", "shopping-bag", "heart", "list"]
};

const GENERIC_UX_RULES = [
  "Use visible focus states for every actionable control.",
  "Keep labels, helper text, and error states visible in forms.",
  "Preserve keyboard navigation and semantic structure.",
  "Maintain WCAG AA contrast targets for text and key surfaces.",
  "Avoid color-only state signaling.",
  "Keep primary actions obvious and consistent."
];

const PRODUCT_UX_RULES = {
  booking: [
    "Show availability before asking for commitment.",
    "Keep booking, rescheduling, and cancellation steps short.",
    "Confirm the selected slot and next step immediately.",
    "Surface reminders and time-zone handling clearly."
  ],
  ecommerce: [
    "Keep product comparison and filtering easy to reach.",
    "Do not hide shipping, taxes, or totals during checkout.",
    "Show validation before the user submits a form.",
    "Preserve the cart state across navigation."
  ],
  dashboard: [
    "Label charts and tables so they can be interpreted quickly.",
    "Provide empty, loading, and error states for data surfaces.",
    "Keep filters and date ranges discoverable.",
    "Let users export or inspect data without leaving the view."
  ],
  admin_panel: [
    "Keep bulk actions and audit state visible.",
    "Make permission boundaries and destructive actions explicit.",
    "Keep dense tables readable at a glance.",
    "Keep the default path safe and reversible."
  ],
  marketplace: [
    "Help users trust the listing quality and seller identity.",
    "Keep browse, filter, and compare actions easy to scan.",
    "Avoid overloading the primary page with competing CTAs."
  ],
  portfolio: [
    "Keep the story scannable and visually calm.",
    "Make contact or project actions obvious without crowding the page."
  ],
  blog: [
    "Optimize for readability, scanning, and clear article hierarchy.",
    "Keep subscription, share, and related-content actions visible."
  ],
  landing_page: [
    "Keep the first viewport focused on one primary conversion goal.",
    "Use trust signals early and avoid competing CTAs."
  ],
  mobile_app: [
    "Keep tap targets large and spacing generous.",
    "Prefer bottom navigation or a simple single-column hierarchy."
  ],
  saas: [
    "Keep the main value proposition and CTA easy to find.",
    "Use clear states for loading, empty, and failure paths."
  ]
};

const GENERIC_ANTI_PATTERNS = [
  "color-only state signaling",
  "hover-only primary actions",
  "forms without validation messages",
  "too many CTAs",
  "tables without headers",
  "loading without feedback",
  "mobile layout with horizontal scroll"
];

function detectProductType(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  return buildProductDetection(input, catalog, options);
}

function recommendStyle(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const styleId = resolveStyleId(detection, stack, options);
  const style = getStyle(styleId, { root: catalog.root, refresh: Boolean(options.refresh) });
  return decorateWithMeta(style, {
    score: scoreStyle(styleId, detection, stack),
    confidence: deriveConfidence(detection.score, stack ? 1 : 0),
    matched_terms: uniqueStrings([styleId, detection.style, stack ? stack.id : ""]).filter(Boolean),
    warnings: []
  });
}

function recommendPalette(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const mood = resolvePaletteMood(input, detection, stack, options);
  const palette = getPalette(mood, { root: catalog.root, refresh: Boolean(options.refresh) });
  return decorateWithMeta(palette, {
    score: scorePalette(mood, detection, stack),
    confidence: deriveConfidence(detection.score, stack ? 1 : 0),
    matched_terms: uniqueStrings([mood, detection.palette_mood, stack ? stack.id : ""]).filter(Boolean),
    warnings: []
  });
}

function recommendTypography(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const mood = resolveTypographyMood(input, detection, stack, options);
  const typography = getTypography(mood, { root: catalog.root, refresh: Boolean(options.refresh) });
  return decorateWithMeta(typography, {
    score: scoreTypography(mood, detection, stack),
    confidence: deriveConfidence(detection.score, stack ? 1 : 0),
    matched_terms: uniqueStrings([mood, detection.typography_mood, stack ? stack.id : ""]).filter(Boolean),
    warnings: []
  });
}

function recommendLayoutPatterns(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const query = buildSearchQuery([input, detection.label, detection.source_label, detection.id, stack ? stack.id : ""]);
  const records = Array.isArray(catalog.layouts) ? catalog.layouts : [];
  const ranked = searchRecords(query, records, { limit: 8 }).results;
  const preferredIds = uniqueStrings([
    ...(Array.isArray(detection.layout_patterns) ? detection.layout_patterns : []),
    ...ranked.map((item) => item.id)
  ]);
  const selected = preferredIds
    .map((id) => findLayoutPattern(catalog, id))
    .filter(Boolean)
    .slice(0, 5)
    .map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      purpose: pattern.purpose || pattern.conversion_optimization || "",
      section_order: pattern.section_order || "",
      cta_placement: pattern.cta_placement || "",
      color_strategy: pattern.color_strategy || "",
      recommended_effects: pattern.effects || pattern.recommended_effects || "",
      conversion_optimization: pattern.conversion_optimization || "",
      score: ranked.find((item) => item.id === pattern.id)?.score || scoreRecord(query, pattern),
      reason: buildPatternReason(pattern, detection, stack)
    }));

  const warnings = [];
  if (!selected.length) warnings.push("No layout patterns were matched from the local catalog.");
  return selected.length ? selected : [];
}

function recommendUxRules(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const text = normalizeText(input);
  const catalogRules = collectCatalogRuleText(catalog, "ux_guidelines", text, 4);
  const reasoningRules = collectCatalogRuleText(catalog, "ui_reasoning", text, 3);
  const manualRules = [
    ...GENERIC_UX_RULES,
    ...(PRODUCT_UX_RULES[detection.id] || PRODUCT_UX_RULES.saas),
    ...stackRuleHints(stack),
    ...queryRuleHints(text)
  ];
  return uniqueStrings([...manualRules, ...catalogRules, ...reasoningRules]);
}

function recommendAntiPatterns(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const text = normalizeText(input);
  const catalogPatterns = collectCatalogAntiPatterns(catalog, text, 4);
  return uniqueStrings([
    ...GENERIC_ANTI_PATTERNS,
    ...productAntiPatterns(detection, text),
    ...stackAntiPatterns(stack),
    ...catalogPatterns
  ]);
}

function recommendCharts(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const text = normalizeText(input);
  if (!needsChartGuidance(text, detection)) return [];

  const query = buildSearchQuery([
    input,
    detection.label,
    detection.source_label,
    detection.id,
    "trend comparison ratio proportion dashboard analytics reporting"
  ]);
  const records = Array.isArray(catalog.domains?.charts) ? catalog.domains.charts : [];
  if (!records.length) return [];

  const results = searchRecords(query, records, { limit: 4 }).results;
  const selected = results
    .map((item) => records.find((record) => record.id === item.id) || null)
    .filter(Boolean)
    .map((record) => ({
      id: record.id,
      label: record.label,
      best_chart_type: record.best_chart_type || record.label || "",
      secondary_options: splitList(record.secondary_options || record.alternatives || record.options),
      when_to_use: record.when_to_use || record.best_for || "",
      when_not_to_use: record.when_not_to_use || record.avoid || "",
      color_guidance: record.color_guidance || record.color_notes || "",
      accessibility_notes: record.accessibility_notes || record.a11y_notes || "",
      library_recommendation: record.library_recommendation || record.library || "",
      interactive_level: record.interactive_level || record.interactivity || "",
      score: scoreRecord(query, record),
      reason: buildChartReason(record, detection)
    }));
  return uniqueById(selected).slice(0, 3);
}

function recommendIcons(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const stack = resolveStackProfile(input, catalog, options, detection);
  const query = buildIconQuery(input, detection, stack);
  const records = Array.isArray(catalog.domains?.icons) ? catalog.domains.icons : [];
  if (!records.length) return [];

  const results = searchRecords(query, records, { limit: 8 }).results;
  const fallbackQueries = [
    ...(ICON_QUERY_BY_PRODUCT[detection.id] || []),
    ...(stack && stack.family === "mobile" ? ["menu", "close", "plus"] : []),
    "search"
  ];
  const selected = uniqueById([
    ...results.map((item) => records.find((record) => record.id === item.id) || null).filter(Boolean),
    ...fallbackQueries
      .flatMap((term) => searchRecords(term, records, { limit: 2 }).results)
      .map((item) => records.find((record) => record.id === item.id) || null)
      .filter(Boolean)
  ])
    .slice(0, 5)
    .map((record) => ({
      id: record.id,
      label: record.label,
      category: record.category || "",
      icon_name: record.icon_name || record.label || "",
      library: record.library || "",
      import_code: record.import_code || "",
      usage: record.usage || "",
      best_for: record.best_for || "",
      style: record.style || "",
      score: scoreRecord(query, record),
      reason: buildIconReason(record, detection, stack)
    }));
  return selected;
}

function recommendStackGuidance(input, catalogOrOptions = {}, maybeOptions = {}) {
  const { catalog, options } = resolveCatalogBundle(catalogOrOptions, maybeOptions);
  const detection = buildProductDetection(input, catalog, options);
  const explicit = normalizeText(options.stack || options.stack_profile || options.framework || "");
  const inferred = inferStackId(input, detection);
  const stackId = explicit || inferred;
  const warnings = [];

  if (!stackId) {
    return {
      items: [],
      warnings,
      inferred_stack: "",
      confidence: "low"
    };
  }

  const stack = getStackProfile(stackId, { root: catalog.root, refresh: Boolean(options.refresh) });
  if (!stack) {
    return {
      items: [],
      warnings: [`No stack guidance matched "${stackId}".`],
      inferred_stack: stackId,
      confidence: "low"
    };
  }

  const related = searchRecords(stackId, Array.isArray(catalog.domains?.stacks) ? catalog.domains.stacks : [], { limit: 3 }).results;
  return {
    items: [
      {
        id: stack.id,
        label: stack.label,
        family: stack.family,
        ui_focus: stack.ui_focus,
        keywords: stack.keywords,
        notes: stack.notes,
        guidance: buildStackGuidance(stack, detection, related),
        related_rules: related.map((record) => record.label).filter(Boolean)
      }
    ],
    warnings,
    inferred_stack: stack.id,
    confidence: stack.family === "mobile" ? "high" : "medium"
  };
}

function recommendUiUx(input, options = {}) {
  const catalog = options.catalog && options.catalog.records && options.catalog.domains ? options.catalog : loadCatalog({ root: options.root, refresh: Boolean(options.refresh) });
  const text = String(input || "").trim();
  const detection = buildProductDetection(text, catalog, options);
  const style = recommendStyle(text, catalog, options);
  const palette = recommendPalette(text, catalog, options);
  const typography = recommendTypography(text, catalog, options);
  const layoutPatternDetails = recommendLayoutPatterns(text, catalog, options);
  const layoutPatterns = layoutPatternDetails.map((pattern) => pattern.id);
  const stackResult = recommendStackGuidance(text, catalog, options);
  const charts = recommendCharts(text, catalog, options);
  const icons = recommendIcons(text, catalog, options);
  const uxRules = recommendUxRules(text, catalog, options);
  const antiPatterns = recommendAntiPatterns(text, catalog, options);
  const warnings = uniqueStrings([
    ...(catalog.summary?.warnings || []),
    ...(detection.warnings || []),
    ...(style.warnings || []),
    ...(palette.warnings || []),
    ...(typography.warnings || []),
    ...(stackResult.warnings || []),
    ...missingOptionalGuidanceWarnings(catalog, charts, icons, stackResult)
  ]);
  const components = buildComponentRecommendations(detection, layoutPatternDetails, charts, icons, stackResult);
  const confidence = deriveConfidence(detection.score, stackResult.items.length + layoutPatternDetails.length);

  return {
    report_type: "ui_ux_intelligence_recommendation",
    input: text,
    detected_product_type: detection.id,
    detected_product_type_details: detection,
    recommended_style: style.id,
    recommended_style_details: style,
    recommended_palette_mood: palette.mood,
    recommended_palette_details: palette,
    recommended_typography_mood: typography.mood,
    recommended_typography_details: typography,
    recommended_layout_patterns: layoutPatterns,
    recommended_layout_pattern_details: layoutPatternDetails,
    recommended_components: components,
    ux_rules: uxRules,
    anti_patterns_to_avoid: antiPatterns,
    chart_recommendations: charts,
    icon_recommendations: icons,
    stack_guidance: stackResult.items,
    accessibility_notes: buildAccessibilityNotes(detection, stackResult, charts),
    responsive_notes: buildResponsiveNotes(detection, stackResult),
    warnings,
    confidence,
    standalone: true,
    external_github_dependency: false,
    next_action: "Use this output in UI_UX_DESIGN.md and UI_SPECIFICATION.md."
  };
}

function buildProductDetection(input, catalog = loadCatalog(), options = {}) {
  const text = normalizeText(input);
  const explicit = normalizeText(options.product_type || options.productType || "");
  const productRecords = Array.isArray(catalog.domains?.products) ? catalog.domains.products : [];

  if (explicit) {
    const explicitProfileId = resolveProfileId(explicit) || explicit;
    const profile = getProductType(explicitProfileId, { root: catalog.root, refresh: Boolean(options.refresh) });
    return decorateDetection(profile, {
      score: 100,
      confidence: "high",
      matched_terms: [explicit],
      warnings: []
    });
  }

  const priority = detectProfilePriority(text);
  if (priority) {
    const profile = getProductType(priority.id, { root: catalog.root, refresh: Boolean(options.refresh) });
    return decorateDetection(profile, {
      score: priority.boost,
      confidence: "high",
      matched_terms: priority.matches,
      warnings: []
    });
  }

  const scored = productRecords
    .map((record) => {
      const score = scoreProductRecord(text, record);
      return {
        record,
        score,
        matched_terms: collectMatchedTerms(text, record, PRODUCT_HINTS[record.id] || [])
      };
    })
    .sort((left, right) => right.score - left.score || String(left.record.label || "").localeCompare(String(right.record.label || "")));

  const best = scored[0];
  if (!best || best.score <= 0) {
    const fallback = getProductType("saas", { root: catalog.root, refresh: Boolean(options.refresh) });
    return decorateDetection(fallback, {
      score: 0,
      confidence: "low",
      matched_terms: [],
      warnings: ["No strong product match found; using the SaaS fallback."]
    });
  }

  const profile = getProductType(best.record.id, { root: catalog.root, refresh: Boolean(options.refresh) });
  return decorateDetection(profile, {
    score: best.score,
    confidence: deriveConfidence(best.score, 0),
    matched_terms: best.matched_terms,
    warnings: []
  });
}

function scoreProductRecord(query, record) {
  const hintBoost = scoreHintBoost(query, PRODUCT_HINTS[record.id] || []);
  const priorityBoost = scorePriorityBoost(query, record.id);
  return scoreRecord(query, record) + hintBoost + priorityBoost;
}

function scoreHintBoost(query, hints) {
  const normalized = normalizeText(query);
  let score = 0;
  for (const hint of hints) {
    const normalizedHint = normalizeText(hint);
    if (!normalizedHint) continue;
    if (normalized === normalizedHint) score += 40;
    if (normalized.includes(normalizedHint)) score += 28;
    if (normalizedHint.includes(normalized)) score += 14;
    if (normalized.split(/\s+/).some((token) => normalizedHint.includes(token))) score += 4;
  }
  return score;
}

function scorePriorityBoost(query, productId) {
  const rule = PROFILE_PRIORITY_RULES.find((entry) => entry.id === productId && entry.pattern.test(query));
  return rule ? rule.boost : 0;
}

function decorateDetection(product, extra = {}) {
  return {
    id: product.id,
    label: product.label,
    source_label: product.source_label || product.label,
    source_file: product.source_file || "products.csv",
    keywords: uniqueStrings(product.keywords || []),
    style: product.style || "modern_saas",
    palette_mood: product.palette_mood || "trust",
    typography_mood: product.typography_mood || "professional",
    layout_patterns: uniqueStrings(product.layout_patterns || []),
    components: uniqueStrings(product.components || []),
    ux_rules: uniqueStrings(product.ux_rules || []),
    score: Number(extra.score || 0),
    confidence: extra.confidence || deriveConfidence(extra.score || 0, 0),
    matched_terms: uniqueStrings(extra.matched_terms || []),
    warnings: uniqueStrings(extra.warnings || []),
    reason: extra.reason || ""
  };
}

function detectProfilePriority(text) {
  const normalized = normalizeText(text);
  for (const rule of PROFILE_PRIORITY_RULES) {
    if (rule.pattern.test(normalized)) {
      return {
        id: rule.id,
        boost: rule.boost,
        matches: uniqueStrings([rule.id, ...splitList(rule.id.replace(/_/g, " "))])
      };
    }
  }
  return null;
}

function resolveProfileId(value) {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  if (normalized === "e_commerce") return "ecommerce";
  if (normalized === "analytics_dashboard" || normalized === "financial_dashboard" || normalized === "smart_home_iot_dashboard") return "dashboard";
  if (normalized === "medical_clinic" || normalized === "healthcare_app" || normalized === "veterinary_clinic" || normalized === "dental_practice") return "booking";
  if (normalized === "portfolio_personal") return "portfolio";
  if (normalized === "magazine_blog" || normalized === "news_media_platform") return "blog";
  if (normalized === "marketplace_p2p") return "marketplace";
  return normalized;
}

function resolveStyleId(detection, stack, options) {
  const explicit = normalizeText(options.style || options.style_id || options.styleId || "");
  if (explicit) return explicit.replace(/\s+/g, "_");
  if (stack && stack.family === "mobile") return "mobile_first";
  return STYLE_BY_PRODUCT[detection.id] || detection.style || "modern_saas";
}

function resolvePaletteMood(input, detection, stack, options) {
  const explicit = normalizeText(options.palette || options.palette_mood || options.paletteMood || "");
  if (explicit) return explicit.replace(/\s+/g, "_");
  const text = normalizeText(input);
  if (/(clinic|medical|patient|hospital|doctor|health)/.test(text)) return "healthcare";
  if (stack && stack.family === "mobile") return "calm";
  return PALETTE_BY_PRODUCT[detection.id] || detection.palette_mood || "trust";
}

function resolveTypographyMood(input, detection, stack, options) {
  const explicit = normalizeText(options.typography || options.typography_mood || options.typographyMood || "");
  if (explicit) return explicit.replace(/\s+/g, "_");
  const text = normalizeText(input);
  if (/(clinic|medical|patient|hospital|doctor|health)/.test(text)) return "professional";
  if (stack && stack.family === "mobile") return "friendly";
  return TYPOGRAPHY_BY_PRODUCT[detection.id] || detection.typography_mood || "professional";
}

function resolveStackProfile(input, catalog, options, detection) {
  const explicit = normalizeText(options.stack || options.stack_profile || options.framework || "");
  const inferred = inferStackId(input, detection);
  const stackId = explicit || inferred;
  if (!stackId) return null;
  return getStackProfile(stackId, { root: catalog.root, refresh: Boolean(options.refresh) });
}

function inferStackId(input, detection) {
  const text = normalizeText([input, detection.label, detection.source_label].filter(Boolean).join(" "));
  for (const alias of STACK_ALIASES) {
    if (alias.terms.some((term) => text.includes(normalizeText(term)))) {
      return alias.id;
    }
  }
  return "";
}

function scoreStyle(styleId, detection, stack) {
  let score = detection.score;
  if (styleId === STYLE_BY_PRODUCT[detection.id]) score += 20;
  if (stack && stack.family === "mobile" && styleId === "mobile_first") score += 15;
  return score;
}

function scorePalette(mood, detection, stack) {
  let score = detection.score;
  if (mood === PALETTE_BY_PRODUCT[detection.id]) score += 20;
  if (/(clinic|medical|patient|hospital|doctor|health)/.test(normalizeText(detection.label))) score += 10;
  if (stack && stack.family === "mobile" && mood === "calm") score += 8;
  return score;
}

function scoreTypography(mood, detection, stack) {
  let score = detection.score;
  if (mood === TYPOGRAPHY_BY_PRODUCT[detection.id]) score += 18;
  if (stack && stack.family === "mobile" && mood === "friendly") score += 8;
  return score;
}

function collectMatchedTerms(query, record, hints = []) {
  const normalizedQuery = normalizeText(query);
  const haystack = uniqueStrings([
    record.id,
    record.label,
    record.source_label,
    record.text,
    record.source_file,
    ...(record.keywords || []),
    ...hints
  ]).map((value) => normalizeText(value));
  return uniqueStrings(
    haystack.filter((item) => item && (normalizedQuery.includes(item) || item.includes(normalizedQuery) || normalizedQuery.split(/\s+/).some((token) => item.includes(token))))
  );
}

function buildSearchQuery(parts) {
  return uniqueStrings(parts).join(" ");
}

function findProductRecord(catalog, query) {
  const normalized = normalizeText(query);
  return (catalog.domains?.products || []).find((record) => {
    return normalizeText(record.id) === normalized ||
      normalizeText(record.label) === normalized ||
      normalizeText(record.source_label) === normalized ||
      (Array.isArray(record.keywords) && record.keywords.some((keyword) => normalizeText(keyword) === normalized || normalizeText(keyword).includes(normalized)));
  }) || null;
}

function findLayoutPattern(catalog, id) {
  const normalized = normalizeText(id).replace(/\s+/g, "_");
  return (catalog.layouts || []).find((pattern) => normalizeText(pattern.id) === normalized || normalizeText(pattern.title) === normalizeText(id)) || null;
}

function buildPatternReason(pattern, detection, stack) {
  const reasons = [];
  if (Array.isArray(detection.layout_patterns) && detection.layout_patterns.includes(pattern.id)) reasons.push("Matched the detected product type.");
  if (stack && stack.family === "mobile" && /mobile|touch|single column/i.test(pattern.title || "")) reasons.push("Fits the inferred stack family.");
  if (pattern.purpose) reasons.push(pattern.purpose);
  return uniqueStrings(reasons).join(" ") || "Useful for the inferred brief.";
}

function buildChartReason(record, detection) {
  const parts = [];
  const text = normalizeText([record.best_chart_type, record.when_to_use, record.color_guidance].join(" "));
  if (detection.id === "dashboard" || detection.id === "admin_panel") parts.push("Dashboard and analytics surfaces benefit from it.");
  if (/trend|growth|time/.test(text)) parts.push("Supports trend tracking.");
  if (/compare|category/.test(text)) parts.push("Supports comparison.");
  if (/part to whole|proportion|percentage/.test(text)) parts.push("Supports proportion storytelling.");
  return uniqueStrings(parts).join(" ") || "Useful for the inferred data story.";
}

function buildIconReason(record, detection, stack) {
  const parts = [];
  const text = normalizeText([record.label, record.best_for, record.usage].join(" "));
  if (record.category) parts.push(`Category: ${record.category}.`);
  if (detection.id === "booking" && /(calendar|clock|check|list)/.test(text)) parts.push("Supports booking flows.");
  if (detection.id === "ecommerce" && /(cart|bag|filter|search|heart)/.test(text)) parts.push("Supports commerce flows.");
  if (stack && stack.family === "mobile") parts.push("Fits mobile-first navigation and touch targets.");
  return uniqueStrings(parts).join(" ") || "Useful for the inferred UI surface.";
}

function buildStackGuidance(stack, detection, relatedRecords) {
  const guidance = [
    `Prefer ${stack.family}-friendly navigation and touch targets.`,
    `Reinforce ${stack.ui_focus.join(", ")} in the main surface.`,
    `Keep the stack guidance aligned with the ${detection.label.toLowerCase()} product pattern.`
  ];
  if (relatedRecords.length) {
    guidance.push(`Related stack notes: ${relatedRecords.map((record) => record.label).join("; ")}.`);
  }
  return guidance;
}

function stackRuleHints(stack) {
  if (!stack) return [];
  const hints = [];
  if (stack.family === "mobile") hints.push("Keep bottom navigation and tap targets easy to reach.");
  if (stack.family === "web") hints.push("Use responsive grids and clear hover/focus states.");
  if (stack.family === "immersive") hints.push("Keep interaction cues obvious in spatial layouts.");
  return hints;
}

function stackAntiPatterns(stack) {
  if (!stack) return [];
  if (stack.family === "mobile") return ["tiny tap targets", "hidden navigation"];
  if (stack.family === "immersive") return ["unclear interaction affordances", "motion without purpose"];
  return ["overly dense layouts on small screens"];
}

function queryRuleHints(text) {
  const hints = [];
  if (/(checkout|purchase|billing|pay)/.test(text)) hints.push("Keep totals and validation visible before submission.");
  if (/(dashboard|analytics|report|metrics|kpi|insight)/.test(text)) hints.push("Show charts, tables, and summaries with accessible labels.");
  if (/(landing|marketing|hero)/.test(text)) hints.push("Keep one primary call to action in the first viewport.");
  if (/(form|booking|signup|register)/.test(text)) hints.push("Keep field validation and error recovery visible.");
  return hints;
}

function collectCatalogRuleText(catalog, domain, text, limit) {
  const records = Array.isArray(catalog.domains?.[domain]) ? catalog.domains[domain] : [];
  if (!records.length) return [];
  return searchRecords(text, records, { limit })
    .results
    .map((item) => records.find((record) => record.id === item.id) || null)
    .filter(Boolean)
    .map((record) => summarizeRecord(record))
    .filter(Boolean);
}

function collectCatalogAntiPatterns(catalog, text, limit) {
  const records = Array.isArray(catalog.domains?.ui_reasoning) ? catalog.domains.ui_reasoning : [];
  if (!records.length) return [];
  return searchRecords(text, records, { limit })
    .results
    .map((item) => records.find((record) => record.id === item.id) || null)
    .filter(Boolean)
    .map((record) => summarizeAntiPattern(record))
    .filter(Boolean);
}

function summarizeRecord(record) {
  return String(
    record.recommended_pattern ||
    record.guideline ||
    record.issue ||
    record.best_for ||
    record.pattern_name ||
    record.label ||
    ""
  ).trim();
}

function summarizeAntiPattern(record) {
  return String(
    record.bad_pattern ||
    record.do_not_use_for ||
    record.when_not_to_use ||
    record.avoid ||
    record.label ||
    ""
  ).trim();
}

function productAntiPatterns(detection, text) {
  const items = [];
  const id = detection.id;
  if (id === "ecommerce") items.push("too many CTAs", "forms without validation messages", "hidden shipping or taxes");
  if (id === "booking") items.push("modals for critical booking steps", "unclear cancellation flow");
  if (id === "dashboard" || id === "admin_panel") items.push("tables without headers", "dashboard without empty states");
  if (id === "landing_page") items.push("competing CTAs in the hero", "long forms before trust is established");
  if (/(checkout|purchase|billing|pay)/.test(text)) items.push("forced account creation before checkout");
  return items;
}

function needsChartGuidance(text, detection) {
  return detection.id === "dashboard" || detection.id === "admin_panel" || /(dashboard|analytics|metric|metrics|report|reports|revenue|trend|growth|conversion|performance|data|insight|insights|chart|charts|funnel|kpi|kpis)/.test(text);
}

function buildComponentRecommendations(detection, layoutPatterns, charts, icons, stackResult) {
  const components = new Set([...(detection.components || [])]);
  const layoutIds = layoutPatterns.map((pattern) => pattern.id);
  if (layoutIds.some((id) => /pricing|comparison/.test(id))) {
    ["pricing_cards", "comparison_table", "billing_summary"].forEach((item) => components.add(item));
  }
  if (layoutIds.some((id) => /dashboard|operations|real_time/.test(id))) {
    ["metrics_cards", "data_table", "filters_bar", "status_badges"].forEach((item) => components.add(item));
  }
  if (layoutIds.some((id) => /booking|lead_magnet|form/.test(id))) {
    ["booking_form", "availability_calendar", "time_slot_picker", "confirmation_state"].forEach((item) => components.add(item));
  }
  if (layoutIds.some((id) => /ecommerce|comparison|product/.test(id))) {
    ["product_grid", "filter_sidebar", "cart_drawer", "checkout_summary", "product_gallery"].forEach((item) => components.add(item));
  }
  if (layoutIds.some((id) => /landing|hero|showcase/.test(id))) {
    ["hero_banner", "feature_cards", "social_proof_strip", "primary_cta"].forEach((item) => components.add(item));
  }
  if (detection.id === "blog") {
    ["article_list", "sidebar_toc", "newsletter_cta", "author_card"].forEach((item) => components.add(item));
  }
  if (detection.id === "portfolio") {
    ["project_cards", "about_section", "contact_cta", "testimonials"].forEach((item) => components.add(item));
  }
  if (stackResult.items.some((item) => item.family === "mobile")) {
    ["bottom_navigation", "action_sheet", "segmented_control"].forEach((item) => components.add(item));
  }
  if (charts.length) {
    ["chart_legend", "data_summary", "metric_overview"].forEach((item) => components.add(item));
  }
  if (icons.length) {
    ["search_bar", "filter_bar", "icon_button"].forEach((item) => components.add(item));
  }
  return uniqueStrings(Array.from(components));
}

function buildAccessibilityNotes(detection, stackResult, charts) {
  const notes = [
    "Use visible focus states for all actionable controls.",
    "Keep keyboard navigation and semantic structure intact.",
    "Maintain WCAG AA contrast targets for text and key UI surfaces.",
    "Avoid color-only state signaling."
  ];
  if (detection.id === "dashboard" || detection.id === "admin_panel" || charts.length) {
    notes.push("Ensure charts and tables have accessible labels, summaries, and fallbacks.");
  }
  if (stackResult.items.length) {
    notes.push("Match accessibility patterns to the inferred stack and interaction model.");
  }
  return uniqueStrings(notes);
}

function buildResponsiveNotes(detection, stackResult) {
  const notes = [
    "Start from a narrow viewport and preserve the primary action above the fold.",
    "Reflow cards, tables, and sidebars into a readable single-column flow on mobile.",
    "Keep touch targets at least 44x44px."
  ];
  if (detection.id === "dashboard" || detection.id === "admin_panel") {
    notes.push("Provide a responsive strategy for dense data tables and filters.");
  }
  if (stackResult.items.length) {
    notes.push("Use the inferred stack to pick responsive primitives and layout breakpoints.");
  }
  return uniqueStrings(notes);
}

function missingOptionalGuidanceWarnings(catalog, charts, icons, stackResult) {
  const warnings = [];
  if (!Array.isArray(catalog.domains?.charts) || !catalog.domains.charts.length) warnings.push("Charts domain data is missing; chart recommendations are partial.");
  if (!Array.isArray(catalog.domains?.icons) || !catalog.domains.icons.length) warnings.push("Icons domain data is missing; icon recommendations are partial.");
  if (!Array.isArray(catalog.domains?.stacks) || !catalog.domains.stacks.length) warnings.push("Stack guidance data is missing; stack guidance is partial.");
  return warnings;
}

function deriveConfidence(score, supportCount) {
  if (score >= 80 || (score >= 55 && supportCount >= 2)) return "high";
  if (score >= 35 || supportCount >= 1) return "medium";
  return "low";
}

function decorateWithMeta(base, extra = {}) {
  return {
    ...base,
    score: Number(extra.score || 0),
    confidence: extra.confidence || deriveConfidence(extra.score || 0, 0),
    matched_terms: uniqueStrings(extra.matched_terms || []),
    warnings: uniqueStrings(extra.warnings || [])
  };
}

function resolveCatalogBundle(catalogOrOptions, maybeOptions = {}) {
  if (catalogOrOptions && catalogOrOptions.records && catalogOrOptions.domains) {
    return { catalog: catalogOrOptions, options: maybeOptions || {} };
  }
  if (catalogOrOptions && catalogOrOptions.domains && catalogOrOptions.layouts) {
    return { catalog: catalogOrOptions, options: maybeOptions || {} };
  }
  const options = catalogOrOptions && typeof catalogOrOptions === "object" ? catalogOrOptions : (maybeOptions || {});
  const catalog = loadCatalog({ root: options.root, refresh: Boolean(options.refresh) });
  return { catalog, options };
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

function uniqueById(items) {
  const seen = new Set();
  const result = [];
  for (const item of items || []) {
    if (!item || !item.id || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function splitList(value) {
  return String(value || "")
    .split(/[,|/;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildIconQuery(input, detection, stack) {
  return buildSearchQuery([input, detection.label, detection.source_label, detection.id, stack ? stack.id : "", ...(ICON_QUERY_BY_PRODUCT[detection.id] || [])]);
}

module.exports = {
  detectProductType,
  recommendStyle,
  recommendPalette,
  recommendTypography,
  recommendLayoutPatterns,
  recommendUxRules,
  recommendAntiPatterns,
  recommendCharts,
  recommendIcons,
  recommendStackGuidance,
  recommendUiUx
};

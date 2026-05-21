const PRODUCT_TYPES = [
  {
    id: "saas",
    label: "SaaS",
    keywords: ["saas", "subscription", "workspace", "platform"],
    style: "modern_saas",
    palette_mood: "trust",
    typography_mood: "professional",
    layout_patterns: ["hero_cta", "dashboard_grid", "card_grid"],
    components: ["top_navigation", "pricing_cards", "insights_cards", "empty_state", "settings_panel"],
    ux_rules: ["visible_focus_states", "clear_empty_states", "loading_states", "error_states"]
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    keywords: ["ecommerce", "store", "shop", "cart", "checkout", "catalog"],
    style: "ecommerce_conversion",
    palette_mood: "ecommerce",
    typography_mood: "modern",
    layout_patterns: ["marketplace_listing", "card_grid", "checkout_flow"],
    components: ["product_grid", "filter_sidebar", "cart_drawer", "checkout_summary", "product_gallery"],
    ux_rules: ["no_hidden_primary_action", "no_destructive_action_without_confirmation", "loading_states", "error_states"]
  },
  {
    id: "booking",
    label: "Booking",
    keywords: ["booking", "appointment", "reservation", "clinic", "schedule"],
    style: "professional_dashboard",
    palette_mood: "trust",
    typography_mood: "professional",
    layout_patterns: ["wizard_flow", "profile_detail", "card_grid"],
    components: ["availability_calendar", "time_slot_picker", "booking_form", "confirmation_state", "reminder_banner"],
    ux_rules: ["visible_focus_states", "clear_empty_states", "loading_states", "no_hidden_primary_action"]
  },
  {
    id: "dashboard",
    label: "Dashboard",
    keywords: ["dashboard", "admin", "analytics", "ops", "monitoring"],
    style: "professional_dashboard",
    palette_mood: "technical",
    typography_mood: "technical",
    layout_patterns: ["dashboard_grid", "sidebar_admin", "card_grid"],
    components: ["sidebar_navigation", "metrics_cards", "data_table", "filters_bar", "status_badges"],
    ux_rules: ["clear_empty_states", "loading_states", "error_states", "keyboard_accessibility"]
  },
  {
    id: "marketplace",
    label: "Marketplace",
    keywords: ["marketplace", "multi-vendor", "catalog", "listing", "browse"],
    style: "modern_saas",
    palette_mood: "ecommerce",
    typography_mood: "modern",
    layout_patterns: ["marketplace_listing", "card_grid", "hero_cta"],
    components: ["search_bar", "filter_sidebar", "listing_cards", "seller_cards", "trust_badges"],
    ux_rules: ["visible_focus_states", "clear_empty_states", "loading_states", "no_hidden_primary_action"]
  },
  {
    id: "portfolio",
    label: "Portfolio",
    keywords: ["portfolio", "personal site", "resume", "showcase", "creative"],
    style: "minimal",
    palette_mood: "calm",
    typography_mood: "editorial",
    layout_patterns: ["hero_cta", "card_grid", "profile_detail"],
    components: ["hero_banner", "project_cards", "about_section", "contact_cta", "testimonials"],
    ux_rules: ["visible_focus_states", "mobile_responsiveness", "clear_empty_states"]
  },
  {
    id: "blog",
    label: "Blog",
    keywords: ["blog", "article", "content", "editorial", "publishing"],
    style: "content_focused",
    palette_mood: "calm",
    typography_mood: "editorial",
    layout_patterns: ["hero_cta", "card_grid", "profile_detail"],
    components: ["article_list", "featured_story", "sidebar_toc", "author_card", "newsletter_cta"],
    ux_rules: ["visible_focus_states", "loading_states", "responsive_layout", "clear_empty_states"]
  },
  {
    id: "admin_panel",
    label: "Admin Panel",
    keywords: ["admin panel", "backoffice", "ops panel", "internal tool"],
    style: "enterprise_clean",
    palette_mood: "technical",
    typography_mood: "technical",
    layout_patterns: ["sidebar_admin", "dashboard_grid", "card_grid"],
    components: ["table_view", "bulk_actions", "settings_form", "audit_log", "status_filters"],
    ux_rules: ["keyboard_accessibility", "loading_states", "error_states", "contrast_targets"]
  },
  {
    id: "mobile_app",
    label: "Mobile App",
    keywords: ["mobile app", "ios", "android", "app", "react native", "flutter"],
    style: "mobile_first",
    palette_mood: "calm",
    typography_mood: "friendly",
    layout_patterns: ["wizard_flow", "card_grid", "profile_detail"],
    components: ["bottom_navigation", "action_sheet", "profile_header", "primary_cta", "empty_state"],
    ux_rules: ["mobile_responsiveness", "keyboard_accessibility", "visible_focus_states", "loading_states"]
  },
  {
    id: "landing_page",
    label: "Landing Page",
    keywords: ["landing page", "marketing page", "campaign", "conversion"],
    style: "minimal",
    palette_mood: "energetic",
    typography_mood: "modern",
    layout_patterns: ["hero_cta", "card_grid"],
    components: ["hero_banner", "social_proof_strip", "feature_cards", "pricing_teaser", "primary_cta"],
    ux_rules: ["no_hidden_primary_action", "mobile_responsiveness", "loading_states"]
  }
];

const UI_STYLES = [
  {
    id: "minimal",
    label: "Minimal",
    tones: ["calm", "clean"],
    description: "Lightweight visual language with strong spacing and restrained accents."
  },
  {
    id: "professional_dashboard",
    label: "Professional Dashboard",
    tones: ["trust", "technical"],
    description: "Structured, data-dense interface with crisp hierarchy and calm surfaces."
  },
  {
    id: "modern_saas",
    label: "Modern SaaS",
    tones: ["trust", "premium"],
    description: "Polished SaaS layout with clear CTA hierarchy and modular cards."
  },
  {
    id: "ecommerce_conversion",
    label: "Ecommerce Conversion",
    tones: ["ecommerce", "energetic"],
    description: "Conversion-focused layout optimized for browse, compare, and checkout."
  },
  {
    id: "mobile_first",
    label: "Mobile First",
    tones: ["calm", "friendly"],
    description: "Touch-first responsive layout optimized for narrow viewports."
  },
  {
    id: "content_focused",
    label: "Content Focused",
    tones: ["calm", "editorial"],
    description: "Editorial composition for story-led or knowledge-heavy products."
  },
  {
    id: "enterprise_clean",
    label: "Enterprise Clean",
    tones: ["trust", "technical"],
    description: "Clear, durable interfaces for compliance-sensitive or operational products."
  }
];

const PALETTES = [
  {
    mood: "trust",
    title: "Trust",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      primary: "#1d4ed8",
      secondary: "#0f172a",
      accent: "#38bdf8",
      text: "#0f172a",
      border: "#dbe3ef"
    }
  },
  {
    mood: "premium",
    title: "Premium",
    colors: {
      background: "#0b1120",
      surface: "#111827",
      primary: "#c084fc",
      secondary: "#f5d0fe",
      accent: "#f59e0b",
      text: "#f8fafc",
      border: "#312e81"
    }
  },
  {
    mood: "calm",
    title: "Calm",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      primary: "#0f766e",
      secondary: "#334155",
      accent: "#14b8a6",
      text: "#0f172a",
      border: "#cbd5e1"
    }
  },
  {
    mood: "energetic",
    title: "Energetic",
    colors: {
      background: "#fff7ed",
      surface: "#ffffff",
      primary: "#ea580c",
      secondary: "#7c2d12",
      accent: "#fb7185",
      text: "#431407",
      border: "#fed7aa"
    }
  },
  {
    mood: "technical",
    title: "Technical",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      primary: "#334155",
      secondary: "#0f172a",
      accent: "#3b82f6",
      text: "#020617",
      border: "#cbd5e1"
    }
  },
  {
    mood: "healthcare",
    title: "Healthcare",
    colors: {
      background: "#f0fdfa",
      surface: "#ffffff",
      primary: "#0d9488",
      secondary: "#0f172a",
      accent: "#22c55e",
      text: "#042f2e",
      border: "#99f6e4"
    }
  },
  {
    mood: "finance",
    title: "Finance",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      primary: "#0f766e",
      secondary: "#111827",
      accent: "#16a34a",
      text: "#0f172a",
      border: "#cbd5e1"
    }
  },
  {
    mood: "ecommerce",
    title: "Ecommerce",
    colors: {
      background: "#fffdf7",
      surface: "#ffffff",
      primary: "#b45309",
      secondary: "#1f2937",
      accent: "#f59e0b",
      text: "#1f2937",
      border: "#fde68a"
    }
  }
];

const TYPOGRAPHY = [
  {
    mood: "professional",
    title: "Professional",
    families: ["Inter", "ui-sans-serif", "system-ui"],
    scale: { base: 16, heading: 32, body: 16, small: 14 },
    description: "Clean sans-serif system with consistent hierarchy and legibility."
  },
  {
    mood: "editorial",
    title: "Editorial",
    families: ["Georgia", "ui-serif", "serif"],
    scale: { base: 17, heading: 34, body: 17, small: 14 },
    description: "More expressive typography for story-driven interfaces and content surfaces."
  },
  {
    mood: "modern",
    title: "Modern",
    families: ["Inter", "ui-sans-serif", "system-ui"],
    scale: { base: 16, heading: 30, body: 16, small: 13 },
    description: "Neutral, modern, product-led typography."
  },
  {
    mood: "friendly",
    title: "Friendly",
    families: ["Nunito", "ui-sans-serif", "system-ui"],
    scale: { base: 16, heading: 28, body: 16, small: 13 },
    description: "Warm rounded typography for approachable product experiences."
  },
  {
    mood: "technical",
    title: "Technical",
    families: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
    scale: { base: 15, heading: 28, body: 15, small: 13 },
    description: "Sharper product typography for dashboards and admin tooling."
  }
];

const LAYOUT_PATTERNS = [
  { id: "hero_cta", title: "Hero CTA", purpose: "Conversion-first introduction with a single primary action." },
  { id: "dashboard_grid", title: "Dashboard Grid", purpose: "Structured grid for metrics and operational cards." },
  { id: "sidebar_admin", title: "Sidebar Admin", purpose: "Persistent navigation for dense admin surfaces." },
  { id: "card_grid", title: "Card Grid", purpose: "Scannable content or feature grid." },
  { id: "wizard_flow", title: "Wizard Flow", purpose: "Multi-step guided workflow." },
  { id: "marketplace_listing", title: "Marketplace Listing", purpose: "Browse/search/filter listing surface." },
  { id: "checkout_flow", title: "Checkout Flow", purpose: "Linear purchase or confirmation sequence." },
  { id: "profile_detail", title: "Profile Detail", purpose: "Focused detail view with supporting metadata." }
];

const UX_RULES = [
  { id: "visible_focus_states", label: "Visible focus states" },
  { id: "clear_empty_states", label: "Clear empty states" },
  { id: "loading_states", label: "Loading states" },
  { id: "error_states", label: "Error states" },
  { id: "mobile_responsiveness", label: "Mobile responsiveness" },
  { id: "keyboard_accessibility", label: "Keyboard accessibility" },
  { id: "contrast_targets", label: "Contrast targets" },
  { id: "no_hidden_primary_action", label: "No hidden primary action" },
  { id: "no_destructive_action_without_confirmation", label: "No destructive action without confirmation" }
];

const ANTI_PATTERNS = [
  "too many CTAs",
  "unreadable contrast",
  "no hover/focus states",
  "no mobile layout",
  "dashboard without empty states",
  "forms without validation messages",
  "modals for critical long workflows",
  "destructive actions without confirmation"
];

const STACKS = [
  {
    id: "angular",
    label: "Angular",
    family: "web",
    strengths: ["enterprise shells", "strict structure", "forms"],
    ui_focus: ["sidebar_admin", "dashboard_grid"]
  },
  {
    id: "astro",
    label: "Astro",
    family: "web",
    strengths: ["content sites", "static delivery", "small bundles"],
    ui_focus: ["hero_cta", "card_grid"]
  },
  {
    id: "flutter",
    label: "Flutter",
    family: "mobile",
    strengths: ["cross-platform mobile", "fluid motion", "shared design tokens"],
    ui_focus: ["wizard_flow", "card_grid"]
  },
  {
    id: "html-tailwind",
    label: "HTML + Tailwind",
    family: "web",
    strengths: ["rapid prototyping", "utility-first layout", "responsive composition"],
    ui_focus: ["hero_cta", "card_grid"]
  },
  {
    id: "jetpack-compose",
    label: "Jetpack Compose",
    family: "mobile",
    strengths: ["Android native UI", "declarative mobile patterns"],
    ui_focus: ["wizard_flow", "profile_detail"]
  },
  {
    id: "laravel",
    label: "Laravel",
    family: "web",
    strengths: ["admin tools", "server-driven workflows", "forms"],
    ui_focus: ["sidebar_admin", "dashboard_grid"]
  },
  {
    id: "nextjs",
    label: "Next.js",
    family: "web",
    strengths: ["product UI", "routing", "hybrid web apps"],
    ui_focus: ["hero_cta", "dashboard_grid"]
  },
  {
    id: "nuxt-ui",
    label: "Nuxt UI",
    family: "web",
    strengths: ["Vue UI systems", "component libraries", "dashboards"],
    ui_focus: ["dashboard_grid", "card_grid"]
  },
  {
    id: "nuxtjs",
    label: "Nuxt.js",
    family: "web",
    strengths: ["content-heavy apps", "SSR", "structured pages"],
    ui_focus: ["hero_cta", "card_grid"]
  },
  {
    id: "react-native",
    label: "React Native",
    family: "mobile",
    strengths: ["cross-platform mobile", "shared logic"],
    ui_focus: ["wizard_flow", "card_grid"]
  },
  {
    id: "react",
    label: "React",
    family: "web",
    strengths: ["component systems", "design systems", "dashboards"],
    ui_focus: ["dashboard_grid", "card_grid"]
  },
  {
    id: "shadcn",
    label: "shadcn/ui",
    family: "web",
    strengths: ["design-system-first", "copyable primitives", "accessible defaults"],
    ui_focus: ["card_grid", "dashboard_grid"]
  },
  {
    id: "svelte",
    label: "Svelte",
    family: "web",
    strengths: ["fast interaction", "lean state", "simple apps"],
    ui_focus: ["hero_cta", "card_grid"]
  },
  {
    id: "swiftui",
    label: "SwiftUI",
    family: "mobile",
    strengths: ["iOS-native UI", "fluid mobile experiences"],
    ui_focus: ["wizard_flow", "profile_detail"]
  },
  {
    id: "threejs",
    label: "Three.js",
    family: "web",
    strengths: ["3D surfaces", "visual showcases", "immersive interactions"],
    ui_focus: ["hero_cta", "profile_detail"]
  },
  {
    id: "vue",
    label: "Vue",
    family: "web",
    strengths: ["component apps", "incremental adoption", "dashboards"],
    ui_focus: ["dashboard_grid", "card_grid"]
  }
];

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findById(items, id) {
  return items.find((item) => item.id === id || item.mood === id || item.label === id) || null;
}

function getProductType(id) {
  return findById(PRODUCT_TYPES, id) || PRODUCT_TYPES[0];
}

function getStyle(id) {
  return findById(UI_STYLES, id) || UI_STYLES[0];
}

function getPalette(mood) {
  return findById(PALETTES, mood) || PALETTES[0];
}

function getTypography(mood) {
  return findById(TYPOGRAPHY, mood) || TYPOGRAPHY[0];
}

function getStackProfile(id) {
  return findById(STACKS, id);
}

function getLayoutPattern(id) {
  return LAYOUT_PATTERNS.find((item) => item.id === id) || null;
}

function listSearchEntries() {
  return [
    ...PRODUCT_TYPES.map((item) => ({ kind: "product_type", id: item.id, label: item.label, text: `${item.label} ${item.keywords.join(" ")}` })),
    ...UI_STYLES.map((item) => ({ kind: "style", id: item.id, label: item.label, text: `${item.label} ${item.description} ${item.tones.join(" ")}` })),
    ...PALETTES.map((item) => ({ kind: "palette", id: item.mood, label: item.title, text: `${item.title} ${Object.keys(item.colors).join(" ")}` })),
    ...TYPOGRAPHY.map((item) => ({ kind: "typography", id: item.mood, label: item.title, text: `${item.title} ${item.description}` })),
    ...LAYOUT_PATTERNS.map((item) => ({ kind: "layout_pattern", id: item.id, label: item.title, text: `${item.title} ${item.purpose}` })),
    ...UX_RULES.map((item) => ({ kind: "ux_rule", id: item.id, label: item.label, text: item.label })),
    ...ANTI_PATTERNS.map((item) => ({ kind: "anti_pattern", id: item, label: item, text: item })),
    ...STACKS.map((item) => ({ kind: "stack", id: item.id, label: item.label, text: `${item.label} ${item.family} ${item.strengths.join(" ")}` }))
  ];
}

module.exports = {
  PRODUCT_TYPES,
  UI_STYLES,
  PALETTES,
  TYPOGRAPHY,
  LAYOUT_PATTERNS,
  UX_RULES,
  ANTI_PATTERNS,
  STACKS,
  normalizeText,
  getProductType,
  getStyle,
  getPalette,
  getTypography,
  getStackProfile,
  getLayoutPattern,
  listSearchEntries
};

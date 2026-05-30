const { normalizeCategory } = require("../utils/slugify");
const { appFolderError } = require("./errors");
const { PROFILE_VERSION, SOURCE_PLUGIN } = require("./constants");

const CATEGORY_PROFILES = {
  web_app: {
    category_id: "web_app",
    title: "Web App",
    platform_type: "web",
    profile_version: PROFILE_VERSION,
    uiux_sections: [
      "public_pages",
      "auth_pages",
      "user_dashboard",
      "admin_dashboard",
      "workflows",
      "page_by_page_specs",
      "components",
      "visual_identity",
      "responsive_rules",
      "motion_interaction",
      "accessibility"
    ],
    system_design_sections: [
      "architecture_overview",
      "service_boundaries",
      "api_layer",
      "authentication",
      "deployment_model",
      "integration_points"
    ],
    database_sections: [
      "entities",
      "relationships",
      "migrations",
      "seeders",
      "indexes",
      "backup_recovery"
    ],
    required_docs: ["wireframes", "ux_patterns", "auth_flow"],
    optional_docs: ["animation_notes", "seo_notes"],
    notes: "Best fit for dashboard, portal, SaaS, and content-heavy web apps."
  },
  mobile_app: {
    category_id: "mobile_app",
    title: "Mobile App",
    platform_type: "mobile",
    profile_version: PROFILE_VERSION,
    uiux_sections: [
      "app_screens",
      "navigation_flows",
      "onboarding_flow",
      "gestures",
      "push_notification_states",
      "offline_states",
      "device_permissions"
    ],
    system_design_sections: [
      "app_architecture",
      "sync_strategy",
      "notification_pipeline",
      "device_integration",
      "auth_and_session",
      "storage_and_cache"
    ],
    database_sections: [
      "local_storage",
      "sync_models",
      "offline_queue",
      "migrations",
      "backup_recovery"
    ],
    required_docs: ["screen_map", "navigation_map", "permissions_map"],
    optional_docs: ["app_store_notes", "push_token_notes"],
    notes: "Best fit for native, hybrid, and mobile-first products."
  },
  embedded_system: {
    category_id: "embedded_system",
    title: "Embedded System",
    platform_type: "embedded",
    profile_version: PROFILE_VERSION,
    uiux_sections: [
      "device_interaction_flow",
      "button_behavior",
      "led_states",
      "small_display_screens",
      "error_signals",
      "setup_pairing_flow"
    ],
    system_design_sections: [
      "firmware_architecture",
      "hardware_interfaces",
      "io_mapping",
      "update_strategy",
      "safety_controls",
      "telemetry"
    ],
    database_sections: [
      "config_storage",
      "event_log",
      "calibration",
      "firmware_records",
      "diagnostics"
    ],
    required_docs: ["io_map", "safety_notes", "device_state_map"],
    optional_docs: ["factory_reset_notes"],
    notes: "Best fit for constrained devices, firmware, and hardware control loops."
  },
  cli: {
    category_id: "cli",
    title: "Command Line Tool",
    platform_type: "cli",
    profile_version: PROFILE_VERSION,
    uiux_sections: [
      "commands",
      "flags",
      "help_output",
      "interactive_prompts",
      "error_messages"
    ],
    system_design_sections: [
      "command_router",
      "configuration",
      "filesystem",
      "logging",
      "plugin_hooks"
    ],
    database_sections: [
      "state_files",
      "cache",
      "history"
    ],
    required_docs: ["command_reference", "shell_examples"],
    optional_docs: ["autocomplete_notes"],
    notes: "Best fit for developer tools and automation utilities."
  },
  desktop: {
    category_id: "desktop",
    title: "Desktop App",
    platform_type: "desktop",
    profile_version: PROFILE_VERSION,
    uiux_sections: ["windows", "navigation_flows", "shortcuts", "dialogs", "settings", "accessibility"],
    system_design_sections: ["app_shell", "windowing", "storage", "updates", "integration_points"],
    database_sections: ["entities", "migrations", "user_settings", "cache"],
    required_docs: ["window_map", "shortcut_map"],
    optional_docs: ["tray_notes"]
  },
  ai_agent: {
    category_id: "ai_agent",
    title: "AI Agent",
    platform_type: "ai_agent",
    profile_version: PROFILE_VERSION,
    uiux_sections: ["prompt_flows", "memory_views", "conversation_states", "tooling_states"],
    system_design_sections: ["agent_loop", "tool_contracts", "memory_layers", "safety_controls"],
    database_sections: ["memory_store", "conversation_log", "task_state"],
    required_docs: ["agent_contract", "tool_map"],
    optional_docs: ["human_handoff_notes"]
  },
  generic: {
    category_id: "generic",
    title: "Generic App",
    platform_type: "generic",
    profile_version: PROFILE_VERSION,
    uiux_sections: ["overview", "primary_flows", "states"],
    system_design_sections: ["architecture_overview", "service_boundaries", "integration_points"],
    database_sections: ["entities", "state_models"],
    required_docs: ["overview_notes"],
    optional_docs: [],
    notes: "Fallback profile when a category has not been explicitly specialized."
  }
};

function listCategories() {
  return Object.values(CATEGORY_PROFILES).map((profile) => ({
    category_id: profile.category_id,
    title: profile.title,
    platform_type: profile.platform_type,
    profile_version: profile.profile_version
  }));
}

function resolveCategoryProfile(category) {
  const key = normalizeCategory(category);
  const profile = CATEGORY_PROFILES[key] || CATEGORY_PROFILES.generic;
  if (!profile) throw appFolderError(`Missing category profile for ${category || "(empty)"}.`);
  return {
    ...profile,
    source_plugin: SOURCE_PLUGIN,
    selected_category: profile.category_id,
    folder_structure_profile: {
      selected_category: profile.category_id,
      platform_type: profile.platform_type,
      profile_version: profile.profile_version,
      uiux_sections: [...profile.uiux_sections],
      system_design_sections: [...profile.system_design_sections],
      database_sections: [...profile.database_sections],
      required_docs: [...profile.required_docs],
      optional_docs: [...profile.optional_docs],
      source_plugin: SOURCE_PLUGIN
    }
  };
}

function printCategoryProfile(category) {
  const profile = resolveCategoryProfile(category);
  return [
    `# ${profile.title}`,
    "",
    `- category_id: ${profile.category_id}`,
    `- platform_type: ${profile.platform_type}`,
    `- profile_version: ${profile.profile_version}`,
    `- source_plugin: ${SOURCE_PLUGIN}`,
    "",
    "## UI/UX",
    ...profile.uiux_sections.map((item) => `- ${item}`),
    "",
    "## System Design",
    ...profile.system_design_sections.map((item) => `- ${item}`),
    "",
    "## Database / Storage",
    ...profile.database_sections.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

module.exports = {
  CATEGORY_PROFILES,
  listCategories,
  printCategoryProfile,
  resolveCategoryProfile
};

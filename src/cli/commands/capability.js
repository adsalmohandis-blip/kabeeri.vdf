const { table } = require("../ui");

function capability(action, value) {
  const areas = getSystemAreas();
  if (!action || action === "list") {
    console.log(table(["ID", "Area", "Group"], areas.map((area) => [area.id, area.name, area.group])));
    return;
  }

  if (action === "show") {
    const key = String(value || "").toLowerCase();
    if (!key) throw new Error("Missing capability id or name.");
    const area = areas.find((item) => String(item.id) === key || item.key === key || item.name.toLowerCase() === key);
    if (!area) throw new Error(`Capability area not found: ${value}`);
    console.log(JSON.stringify(area, null, 2));
    return;
  }

  if (action === "map") {
    console.log(JSON.stringify({ areas, groups: buildCapabilityGroups() }, null, 2));
    return;
  }

  throw new Error(`Unknown capability action: ${action}`);
}

function getSuggestedQuestionsForArea(areaKey) {
  const area = getSystemAreas().find((item) => item.key === areaKey);
  if (!area) return [];
  const examples = {
    theme_branding: ["Do you need colors controlled from admin?", "Do you need dark mode?", "Should low-contrast colors be blocked?"],
    dashboard_customization: ["Which dashboards are required?", "Do widgets differ by role?", "Do reports need export?"],
    users_roles: ["What user types exist?", "Is there exactly one Owner?", "Who approves, publishes, and deletes?"],
    multi_tenancy: ["Will multiple companies use the system?", "Is tenant data separated?", "Does each tenant need settings, colors, or billing?"],
    payments_billing: ["Are payments required in V1?", "Are subscriptions or invoices needed?", "Who can refund or cancel?"]
  };
  return examples[areaKey] || [`What is required for ${area.name} in V1?`, `Should ${area.name} be deferred or not applicable?`];
}

function mapAreaToWorkstream(areaKey) {
  if (areaKey.includes("frontend") || ["theme_branding", "accessibility", "seo", "navigation"].includes(areaKey)) return "public_frontend";
  if (areaKey.includes("admin") || areaKey === "settings_system") return "admin_frontend";
  if (["backend_apis", "business_logic", "database", "integrations", "payments_billing", "webhooks"].includes(areaKey)) return "backend";
  if (["testing_qa", "security", "performance", "monitoring", "deployment"].includes(areaKey)) return "qa";
  return "docs";
}

function buildCapabilityGroups() {
  return {
    "A. Product & Business": ["Product vision", "Target users", "Business goals", "Core value proposition", "Use cases", "Pricing/revenue model", "MVP scope", "Future scope", "Out of scope", "KPIs"],
    "B. Users, Access, and Journeys": ["User roles", "Permissions", "Role hierarchy", "User journey", "Onboarding", "Offboarding", "Authentication", "Authorization"],
    "C. Frontend Experience": ["Public frontend", "User portal", "Admin frontend", "Internal operations frontend", "Responsive UI", "Accessibility", "RTL/LTR", "Navigation", "Forms"],
    "D. Backend, Data, and APIs": ["Backend APIs", "Business logic", "Services", "Jobs/queues", "Database", "Migrations", "Data model", "API access", "Webhooks"],
    "E. Admin, Settings, and Customization": ["Admin panel", "Settings system", "Theme/colors/branding", "Dashboard customization", "Feature flags", "Custom fields", "Email templates"],
    "F. Engagement, Content, and Growth": ["Notifications", "Search/filtering", "Files/media", "Content management", "SEO", "Localization", "Support/help center", "Feedback"],
    "G. Commerce and Integrations": ["Payments", "Billing", "Subscriptions", "Invoices", "Coupons", "Integrations", "CRM/ERP", "Email/SMS providers", "Maps/calendar"],
    "H. Quality, Security, and Compliance": ["Security", "Audit logs", "Data governance", "Privacy/legal", "Testing/QA", "Error handling", "Performance", "Secrets policy"],
    "I. Operations and Release": ["Deployment", "Production vs publish", "Backup/recovery", "Monitoring", "Maintenance mode", "Import/export", "Scheduling/automation", "Versioning"],
    "J. Kabeeri Control Layer": ["Delivery mode", "Intake mode", "Task creation rules", "Task provenance", "AI token usage", "Owner verify", "Locks", "Prompt runs", "Cost calculator", "Dashboard state"]
  };
}

function getSystemAreas() {
  const names = [
    ["product_business", "Product & Business", "A. Product & Business"],
    ["users_roles", "Users & Roles", "B. Users, Access, and Journeys"],
    ["permissions", "Permissions", "B. Users, Access, and Journeys"],
    ["user_journeys", "User Journeys", "B. Users, Access, and Journeys"],
    ["onboarding", "Onboarding", "B. Users, Access, and Journeys"],
    ["offboarding", "Offboarding", "B. Users, Access, and Journeys"],
    ["public_frontend", "Public Frontend", "C. Frontend Experience"],
    ["user_frontend", "User Frontend", "C. Frontend Experience"],
    ["admin_frontend", "Admin Frontend", "C. Frontend Experience"],
    ["internal_operations_frontend", "Internal Operations Frontend", "C. Frontend Experience"],
    ["backend_apis", "Backend APIs", "D. Backend, Data, and APIs"],
    ["business_logic", "Business Logic", "D. Backend, Data, and APIs"],
    ["database", "Database", "D. Backend, Data, and APIs"],
    ["authentication", "Authentication", "B. Users, Access, and Journeys"],
    ["authorization", "Authorization", "B. Users, Access, and Journeys"],
    ["admin_panel", "Admin Panel", "E. Admin, Settings, and Customization"],
    ["settings_system", "Settings System", "E. Admin, Settings, and Customization"],
    ["theme_branding", "Theme / Colors / Branding / Design Tokens", "E. Admin, Settings, and Customization"],
    ["dashboard_customization", "Dashboard Customization", "E. Admin, Settings, and Customization"],
    ["notifications", "Notifications", "F. Engagement, Content, and Growth"],
    ["search_filtering", "Search & Filtering", "F. Engagement, Content, and Growth"],
    ["files_media", "Files & Media", "F. Engagement, Content, and Growth"],
    ["reports_analytics", "Reports & Analytics", "F. Engagement, Content, and Growth"],
    ["audit_logs", "Audit Logs", "H. Quality, Security, and Compliance"],
    ["security", "Security", "H. Quality, Security, and Compliance"],
    ["integrations", "Integrations", "G. Commerce and Integrations"],
    ["payments_billing", "Payments / Billing", "G. Commerce and Integrations"],
    ["seo", "SEO", "F. Engagement, Content, and Growth"],
    ["localization_languages", "Localization / Languages", "F. Engagement, Content, and Growth"],
    ["accessibility", "Accessibility", "C. Frontend Experience"],
    ["performance", "Performance", "H. Quality, Security, and Compliance"],
    ["error_handling", "Error Handling", "H. Quality, Security, and Compliance"],
    ["testing_qa", "Testing / QA", "H. Quality, Security, and Compliance"],
    ["deployment", "Deployment", "I. Operations and Release"],
    ["production_publish", "Production vs Publish", "I. Operations and Release"],
    ["backup_recovery", "Backup / Recovery", "I. Operations and Release"],
    ["monitoring", "Monitoring", "I. Operations and Release"],
    ["documentation", "Documentation", "I. Operations and Release"],
    ["support_help_center", "Support / Help Center", "F. Engagement, Content, and Growth"],
    ["legal_compliance", "Legal / Compliance", "H. Quality, Security, and Compliance"],
    ["content_management", "Content Management", "F. Engagement, Content, and Growth"],
    ["workflows_approvals", "Workflows / Approvals", "I. Operations and Release"],
    ["multi_tenancy", "Multi-Tenancy", "G. Commerce and Integrations"],
    ["feature_flags", "Feature Flags", "E. Admin, Settings, and Customization"],
    ["data_import_export", "Data Import / Export", "I. Operations and Release"],
    ["scheduling_automation", "Scheduling / Automation", "I. Operations and Release"],
    ["ai_product_features", "AI Product Features", "F. Engagement, Content, and Growth"],
    ["data_governance", "Data Governance", "H. Quality, Security, and Compliance"],
    ["tenant_admin_customization", "Tenant / Admin Customization", "E. Admin, Settings, and Customization"],
    ["email_notification_templates", "Email / Notification Templates", "E. Admin, Settings, and Customization"],
    ["dynamic_forms_custom_fields", "Dynamic Forms / Custom Fields", "E. Admin, Settings, and Customization"],
    ["versioning_api_versioning", "Versioning / API Versioning", "I. Operations and Release"],
    ["kabeeri_control_layer", "Kabeeri Development Control Layer", "J. Kabeeri Control Layer"]
  ];
  return names.map(([key, name, group], index) => ({
    id: index + 1,
    key,
    name,
    group,
    activation_states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    question_group: group.replace(/^[A-J]\. /, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
  }));
}

module.exports = {
  capability,
  getSuggestedQuestionsForArea,
  mapAreaToWorkstream,
  buildCapabilityGroups,
  getSystemAreas
};

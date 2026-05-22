const { parseCliArgs, toBoolean } = require("./lib/command_args");

const primaryNavigationRoutes = [
  { id: "home", label: "Home", href: "#home", purpose: "Orientation and status summary" },
  { id: "projects", label: "Projects", href: "#projects", purpose: "Projects placeholder" },
  { id: "discovery", label: "Discovery", href: "#discovery", purpose: "Questionnaire placeholder" },
  { id: "spec", label: "Spec", href: "#spec", purpose: "Spec placeholder" },
  { id: "tasks", label: "Tasks", href: "#tasks", purpose: "Task queue placeholder" },
  { id: "approvals", label: "Approvals", href: "#approvals", purpose: "Approval queue placeholder" },
  { id: "reports", label: "Reports", href: "#reports", purpose: "Evidence and status placeholder" },
  { id: "settings", label: "Settings", href: "#settings", purpose: "Local preferences placeholder" }
];

function normalizeActiveRoute(value) {
  if (!value) {
    return "home";
  }
  const normalized = String(value).trim().toLowerCase();
  return primaryNavigationRoutes.some((route) => route.id === normalized) ? normalized : "home";
}

function createStudioNavigationModel(options = {}) {
  const activeRoute = normalizeActiveRoute(options.activeRoute || options.route);
  const items = primaryNavigationRoutes.map((route) => ({
    ...route,
    active: route.id === activeRoute,
    placeholder: true
  }));

  return {
    surface: "studio-navigation",
    title: "Primary Studio Navigation",
    active_route: activeRoute,
    route_model: primaryNavigationRoutes.map((route) => ({
      id: route.id,
      label: route.label,
      href: route.href,
      purpose: route.purpose
    })),
    items,
    placeholder_regions: items.map((item) => ({
      id: `nav-${item.id}`,
      label: item.label,
      purpose: item.purpose
    }))
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStudioNavigation(model = createStudioNavigationModel()) {
  const items = Array.isArray(model.items) ? model.items : [];
  return [
    '<nav class="studio-primary-navigation" aria-label="Primary Studio navigation">',
    '  <h2>Primary navigation</h2>',
    '  <p class="navigation-note">Placeholder route model only. No registry behavior.</p>',
    "  <ul>",
    ...items.map((item) => {
      const classes = ["navigation-item"];
      if (item.active) {
        classes.push("is-active");
      }
      return [
        `    <li class="${classes.join(" ")}">`,
        `      <a href="${escapeHtml(item.href)}" data-route="${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`,
        `      <span class="navigation-purpose">${escapeHtml(item.purpose)}</span>`,
        "    </li>"
      ].join("\n");
    }),
    "  </ul>",
    "</nav>"
  ].join("\n");
}

function formatStudioNavigationState(model = createStudioNavigationModel()) {
  const items = Array.isArray(model.items) ? model.items : [];
  return [
    `Surface: ${model.surface}`,
    `Title: ${model.title}`,
    `Active route: ${model.active_route}`,
    "Navigation items:",
    ...items.map((item) => `- ${item.id}: ${item.label}${item.active ? " [active]" : ""}`),
    "This navigation scaffold is placeholder-only."
  ].join("\n");
}

function formatStudioNavigationHelp() {
  return [
    "KVDOS studio:navigation",
    "Usage: node src/studio_navigation.js [--json] [--route <name>]",
    "",
    "Prints the primary Studio navigation scaffold.",
    "This command does not render registry or runtime behavior."
  ].join("\n");
}

function main(argv = process.argv.slice(2)) {
  const { flags, command } = parseCliArgs(argv);
  if (command === "help" || flags.help) {
    process.stdout.write(`${formatStudioNavigationHelp()}\n`);
    return { help: true };
  }
  const model = createStudioNavigationModel({ activeRoute: flags.route || null });
  if (toBoolean(flags.json)) {
    process.stdout.write(`${JSON.stringify(model, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatStudioNavigationState(model)}\n`);
  }
  return model;
}

if (require.main === module) {
  main();
}

module.exports = {
  createStudioNavigationModel,
  formatStudioNavigationHelp,
  formatStudioNavigationState,
  main,
  primaryNavigationRoutes,
  renderStudioNavigation
};

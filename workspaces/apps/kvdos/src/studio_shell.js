const { parseCliArgs, toBoolean } = require("./lib/command_args");
const { createStudioNavigationModel, renderStudioNavigation } = require("./studio_navigation");

const studioShellMetadata = {
  surface: "studio",
  title: "KVDOS Local Studio",
  purpose: "Control surface for KVDOS projects, tasks, and product state."
};

function createStudioShellFrame(options = {}) {
  const selectedProject = options.selectedProject || null;
  const navigation = options.navigation || createStudioNavigationModel({ activeRoute: options.activeRoute });
  const layout = {
    type: "studio-shell-frame",
    regions: [
      {
        id: "top-bar",
        label: "Top bar",
        purpose: "Show the current project, scope, and shell mode.",
        placeholder: true
      },
      {
        id: "left-sidebar",
        label: "Left sidebar",
        purpose: "Hold primary navigation.",
        placeholder: true
      },
      {
        id: "main-canvas",
        label: "Main canvas",
        purpose: "Host the current Studio surface.",
        placeholder: true
      },
      {
        id: "right-panel",
        label: "Right panel",
        purpose: "Hold evidence, approvals, or inspector details.",
        placeholder: true
      },
      {
        id: "bottom-strip",
        label: "Bottom strip",
        purpose: "Show status notes and future quick actions.",
        placeholder: true
      }
    ]
  };

  return {
    surface: "studio-shell",
    title: studioShellMetadata.title,
    purpose: "First visible KVDOS Studio shell frame.",
    current_project: selectedProject,
    navigation,
    layout,
    placeholder_regions: layout.regions.map((region) => ({
      id: region.id,
      label: region.label,
      purpose: region.purpose
    })),
    shell_summary: {
      ...studioShellMetadata,
      navigation_title: navigation.title,
      active_navigation_route: navigation.active_route,
      navigation_items: navigation.items.map((item) => ({
        id: item.id,
        label: item.label,
        active: item.active
      }))
    }
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

function renderStudioShellFrame(frame = createStudioShellFrame()) {
  const currentProject = frame.current_project ? escapeHtml(frame.current_project) : "No project selected";
  const navigationMarkup = renderStudioNavigation(frame.navigation || createStudioNavigationModel());
  return [
    '<main class="kvdos-studio-shell">',
    '  <section class="shell-top-bar">',
    '    <h1>KVDOS Local Studio</h1>',
    `    <p class="shell-project">${currentProject}</p>`,
    '    <p class="shell-note">Placeholder shell regions only. No execution or cloud behavior.</p>',
    "  </section>",
    '  <section class="shell-layout">',
    '    <aside class="shell-left-sidebar">',
    ...navigationMarkup.split("\n").map((line) => `      ${line}`),
    "    </aside>",
    '    <section class="shell-main-canvas">',
    "      <h2>Main canvas</h2>",
    "      <p>Studio landing canvas placeholder.</p>",
    "    </section>",
    '    <aside class="shell-right-panel">',
    "      <h2>Right panel</h2>",
    "      <p>Evidence and inspector placeholder.</p>",
    "    </aside>",
    "  </section>",
    '  <footer class="shell-bottom-strip">',
    "    <h2>Bottom strip</h2>",
    "    <p>Status notes and future quick actions placeholder.</p>",
    "  </footer>",
    "</main>"
  ].join("\n");
}

function formatStudioShellHelp() {
  return [
    "KVDOS studio:shell",
    "Usage: npm run studio:shell -- [--json] [--project <name>]",
    "",
    "Prints the first Studio shell frame skeleton.",
    "This command does not execute tasks or invoke cloud behavior."
  ].join("\n");
}

function formatStudioShellFrame(frame) {
  return [
    `Surface: ${frame.surface}`,
    `Title: ${frame.title}`,
    `Purpose: ${frame.purpose}`,
    `Current project: ${frame.current_project || "none"}`,
    `Navigation title: ${frame.shell_summary.navigation_title}`,
    `Active navigation route: ${frame.shell_summary.active_navigation_route}`,
    "Layout regions:",
    ...frame.layout.regions.map((region) => `- ${region.id}: ${region.label} [placeholder]`),
    "This shell is frame-only and does not execute tasks."
  ].join("\n");
}

function main(argv = process.argv.slice(2)) {
  const { flags, command } = parseCliArgs(argv);
  if (command === "help" || flags.help) {
    process.stdout.write(`${formatStudioShellHelp()}\n`);
    return { help: true };
  }
  const frame = createStudioShellFrame({ selectedProject: flags.project || null });
  if (toBoolean(flags.json)) {
    process.stdout.write(`${JSON.stringify(frame, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatStudioShellFrame(frame)}\n`);
  }
  return frame;
}

if (require.main === module) {
  main();
}

module.exports = {
  createStudioShellFrame,
  formatStudioShellFrame,
  formatStudioShellHelp,
  main,
  renderStudioShellFrame
};

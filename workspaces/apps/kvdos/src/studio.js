function createStudioShell() {
  const { createStudioShellFrame } = require("./studio_shell");
  const frame = createStudioShellFrame();
  return {
    surface: frame.shell_summary.surface,
    title: frame.shell_summary.title,
    purpose: frame.shell_summary.purpose,
    panels: frame.placeholder_regions.map((region) => region.label)
  };
}

module.exports = {
  createStudioShell
};

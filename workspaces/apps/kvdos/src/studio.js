const { createWorkspaceModel } = require("./workspace_model");

function createStudioShell() {
  const { createStudioShellFrame } = require("./studio_shell");
  const { createStudioNavigationModel } = require("./studio_navigation");
  const navigation = createStudioNavigationModel();
  const frame = createStudioShellFrame({ navigation });
  const workspaceModel = createWorkspaceModel();
  return {
    surface: frame.shell_summary.surface,
    title: frame.shell_summary.title,
    purpose: frame.shell_summary.purpose,
    panels: frame.placeholder_regions.map((region) => region.label),
    navigation: navigation.items.map((item) => item.label),
    active_navigation_route: navigation.active_route,
    workspace_model: workspaceModel
  };
}

module.exports = {
  createStudioShell
};

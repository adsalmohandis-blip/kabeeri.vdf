const { createWorkspaceModel } = require("./workspace_model");
const { createWorkspaceOpenFlow } = require("./workspace_open");
const { createRecentWorkspacesRegistry } = require("./workspace_recent");
const { createWorkspaceContextContract } = require("./workspace_context");
const { createStudioLandingCanvas } = require("./studio_landing_canvas");
const { createStudioEmptyStateOrchestration } = require("./studio_empty_state");
const { createStudioCommandPaletteShell } = require("./studio_command_palette");
const { createLocalRuntimeStateSkeleton } = require("./local_runtime_state");
const { createWorkspacePersistenceLayer } = require("./workspace_persistence");
const { createKvdosWorkspaceSurface } = require("./kvdos_workspace_surface");
const { createAppStateValidationContract } = require("./app_state_validation");
const { createWorkspaceExplorerSurface } = require("./workspace_explorer_surface");
const { createDiscoveryQuestionnairesSurface } = require("./discovery_questionnaires_surface");
const { createSpecBlueprintSurface } = require("./spec_blueprint_surface");
const { createTaskingSurface } = require("./tasking_surface");
const { createApprovalSurface } = require("./approval_surface");
const { createTaskApprovalPersistence } = require("./task_approval_persistence");
const { createReportsDashboard } = require("./reports_dashboard");
const { createTerminalPanelShell } = require("./terminal_panel_shell");
const { createPreviewBrowserViewer } = require("./preview_browser_viewer");
const { createAiWorkbenchMultiChatShell } = require("./ai_workbench_multi_chat_shell");
const { createAiToolSessionModel } = require("./ai_tool_session_model");
const { createProblemsPanel } = require("./problems_panel");
const { createContextErrorCaptureEngine } = require("./context_error_capture_engine");
const { createErrorToTaskConversion } = require("./error_to_task_conversion");
const { createLogsTraceAuditViewer } = require("./logs_trace_audit_viewer");
const { createPatchDiffReviewPanel } = require("./patch_diff_review_panel");
const { createHealthDashboard } = require("./health_dashboard");

function createStudioShell() {
  const { createStudioShellFrame } = require("./studio_shell");
  const { createStudioNavigationModel } = require("./studio_navigation");
  const navigation = createStudioNavigationModel();
  const frame = createStudioShellFrame({ navigation });
  const workspaceModel = createWorkspaceModel();
  const workspaceOpenFlow = createWorkspaceOpenFlow();
  const recentWorkspacesRegistry = createRecentWorkspacesRegistry();
  const workspaceContextContract = createWorkspaceContextContract();
  const studioLandingCanvas = createStudioLandingCanvas();
  const studioEmptyStateOrchestration = createStudioEmptyStateOrchestration();
  const studioCommandPaletteShell = createStudioCommandPaletteShell();
  const localRuntimeStateSkeleton = createLocalRuntimeStateSkeleton();
  const workspacePersistenceLayer = createWorkspacePersistenceLayer();
  const kvdosWorkspaceSurface = createKvdosWorkspaceSurface();
  const appStateValidation = createAppStateValidationContract();
  const workspaceExplorerSurface = createWorkspaceExplorerSurface();
  const discoveryQuestionnairesSurface = createDiscoveryQuestionnairesSurface();
  const specBlueprintSurface = createSpecBlueprintSurface();
  const taskingSurface = createTaskingSurface();
  const approvalSurface = createApprovalSurface();
  const taskApprovalPersistence = createTaskApprovalPersistence();
  const reportsDashboard = createReportsDashboard();
  const terminalPanelShell = createTerminalPanelShell();
  const previewBrowserViewer = createPreviewBrowserViewer();
  const aiWorkbenchMultiChatShell = createAiWorkbenchMultiChatShell();
  const aiToolSessionModel = createAiToolSessionModel();
  const problemsPanel = createProblemsPanel();
  const contextErrorCaptureEngine = createContextErrorCaptureEngine();
  const errorToTaskConversion = createErrorToTaskConversion();
  const logsTraceAuditViewer = createLogsTraceAuditViewer();
  const patchDiffReviewPanel = createPatchDiffReviewPanel();
  const healthDashboard = createHealthDashboard();
  return {
    surface: frame.shell_summary.surface,
    title: frame.shell_summary.title,
    purpose: frame.shell_summary.purpose,
    panels: frame.placeholder_regions.map((region) => region.label),
    navigation: navigation.items.map((item) => item.label),
    active_navigation_route: navigation.active_route,
    workspace_model: workspaceModel,
    workspace_open_flow: workspaceOpenFlow,
    recent_workspaces_registry: recentWorkspacesRegistry,
    workspace_context_contract: workspaceContextContract,
    studio_landing_canvas: studioLandingCanvas,
    studio_empty_state_orchestration: studioEmptyStateOrchestration,
    studio_command_palette_shell: studioCommandPaletteShell,
    local_runtime_state_skeleton: localRuntimeStateSkeleton,
    workspace_persistence_layer: workspacePersistenceLayer,
    kvdos_workspace_surface: kvdosWorkspaceSurface,
    app_state_validation: appStateValidation,
    workspace_explorer_surface: workspaceExplorerSurface,
    discovery_questionnaires_surface: discoveryQuestionnairesSurface,
    spec_blueprint_surface: specBlueprintSurface,
    tasking_surface: taskingSurface,
    approval_surface: approvalSurface,
    task_approval_persistence: taskApprovalPersistence,
    reports_dashboard: reportsDashboard,
    terminal_panel_shell: terminalPanelShell,
    preview_browser_viewer: previewBrowserViewer,
    ai_workbench_multi_chat_shell: aiWorkbenchMultiChatShell,
    ai_tool_session_model: aiToolSessionModel,
    problems_panel: problemsPanel,
    context_error_capture_engine: contextErrorCaptureEngine,
    error_to_task_conversion: errorToTaskConversion,
    logs_trace_audit_viewer: logsTraceAuditViewer,
    patch_diff_review_panel: patchDiffReviewPanel,
    health_dashboard: healthDashboard
  };
}

module.exports = {
  createStudioShell
};

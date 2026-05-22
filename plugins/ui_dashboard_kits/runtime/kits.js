function listDashboardKits(options = {}) {
  void options;
  return [
    {
      kit_id: "owner-dashboard-summary",
      title: "Owner Dashboard Summary",
      surface: "owner-dashboard",
      description: "High-level owner dashboard overview widgets and status cards."
    },
    {
      kit_id: "viber-dashboard-summary",
      title: "Viber Dashboard Summary",
      surface: "viber-dashboard",
      description: "App-track readiness and handoff widgets for Viber dashboards."
    },
    {
      kit_id: "planner-visual-summary",
      title: "Planner Visual Summary",
      surface: "planner-visual",
      description: "Planner visual review widgets, stage maps, and stop-condition cues."
    },
    {
      kit_id: "task-board",
      title: "Task Board",
      surface: "task-board",
      description: "Task board layout and status widgets for implementation review."
    },
    {
      kit_id: "readiness-gates",
      title: "Readiness Gates",
      surface: "release-readiness",
      description: "Reusable read-only gate summary widgets."
    },
    {
      kit_id: "cost-control-widget",
      title: "Cost Control Widget",
      surface: "ai-cost-control",
      description: "Usage and budget status widgets."
    },
    {
      kit_id: "security-gate-widget",
      title: "Security Gate Widget",
      surface: "security-gate",
      description: "Security gate and blocked-state widgets."
    },
    {
      kit_id: "docs-status-widget",
      title: "Docs Status Widget",
      surface: "docs-status",
      description: "Docs coverage, publication, and missing-docs widgets."
    }
  ];
}

function getDashboardKit(kitId, options = {}) {
  void options;
  return listDashboardKits().find((item) => item.kit_id === kitId || item.surface === kitId) || null;
}

function recommendDashboardKit(surface, options = {}) {
  void options;
  const normalized = String(surface || options.surface || "owner-dashboard").trim().toLowerCase();
  const kits = listDashboardKits(options);
  const recommended = kits.filter((kit) => kit.surface === normalized || (normalized === "owner-dashboard" && kit.surface === "owner-dashboard")).map((kit) => kit.kit_id);
  return recommended.length ? recommended : ["owner-dashboard-summary", "readiness-gates"];
}

module.exports = {
  listDashboardKits,
  getDashboardKit,
  recommendDashboardKit
};

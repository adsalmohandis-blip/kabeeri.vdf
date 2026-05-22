function buildWordPressSecurityCleanupPlan(input, options = {}) {
  const idea = String(input || options.idea || options.description || "WordPress security cleanup").trim();
  return {
    report_type: "wordpress_security_cleanup_plan",
    idea,
    scope: "planning_only",
    inspection_steps: [
      "Identify the WordPress root, theme, plugin, and upload boundaries before touching anything.",
      "Inventory active plugins, themes, and MU plugins.",
      "Record versions, file hashes, and recent changes for the cleanup scope."
    ],
    backup_steps: [
      "Create a full file backup before any changes.",
      "Export the database before any changes.",
      "Confirm a rollback point exists before any cleanup work."
    ],
    malware_indicator_checks: [
      "Unexpected admin users or API keys",
      "Suspicious file timestamps or obfuscated code",
      "Unknown plugins, themes, or scheduled tasks",
      "Injected redirects, iframes, or hidden links"
    ],
    file_integrity_checks: [
      "Compare WordPress core files to known-good checksums.",
      "Review wp-config.php, .htaccess, and upload directories for unexpected modifications.",
      "Check plugin and theme files for inline obfuscation or backdoors."
    ],
    plugin_theme_review_steps: [
      "Review the active theme and child theme for custom code changes.",
      "Review plugins for version drift, abandoned code, and suspicious hooks.",
      "Remove or quarantine only after backup and Owner approval."
    ],
    hardening_steps: [
      "Rotate credentials after cleanup.",
      "Update WordPress, plugins, and themes after verification.",
      "Enable least-privilege roles and logging.",
      "Document post-cleanup monitoring and re-scan cadence."
    ],
    do_not_do: [
      "Do not delete files before backup.",
      "Do not modify production without owner approval."
    ],
    security_gate_recommendations: [
      "Require staging confirmation before cleanup.",
      "Require backup confirmation before cleanup.",
      "Require evidence of file integrity review before production release."
    ],
    next_action: "Use this as a security gate checklist only; do not delete or modify production files in this planning phase."
  };
}

module.exports = {
  buildWordPressSecurityCleanupPlan
};

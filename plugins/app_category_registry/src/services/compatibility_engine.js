const { collectSelectedCategoryIds } = require("./registry_loader");

function addIssue(issues, severity, message, rule) {
  issues.push({ severity, message, rule });
}

function assessCompatibility(profile) {
  const issues = [];
  const selectedIds = collectSelectedCategoryIds(profile);
  const selected = new Set(selectedIds);
  const architecture = String(profile.architecture_pattern || "").toLowerCase();
  const governance = String(profile.governance_profile || "").toLowerCase();
  const domain = String(profile.domain_category || "").toLowerCase();
  const delivery = String(profile.delivery_category || "").toLowerCase();

  if (selected.has("ecommerce_platform") || delivery === "ecommerce_platform" || domain === "ecommerce_platform") {
    if (governance && governance !== "payment_commerce_app") {
      addIssue(issues, "warning", "E-commerce profiles usually pair with payment_commerce_app governance.", "ecommerce_governance");
    }
  }

  if (selected.has("marketplace_platform") || delivery === "marketplace_platform" || domain === "marketplace_platform") {
    if (governance && governance !== "marketplace_trust_dispute_app") {
      addIssue(issues, "error", "Marketplace profiles require marketplace_trust_dispute_app governance.", "marketplace_governance");
    }
  }

  if (selected.has("saas_platform") || delivery === "saas_platform" || domain === "saas_platform") {
    if (architecture && architecture !== "multi_tenant_saas") {
      addIssue(issues, "warning", "SaaS profiles usually pair with multi_tenant_saas architecture.", "saas_architecture");
    }
  }

  if (selected.has("mobile_application") || delivery === "mobile_application") {
    if (architecture && architecture === "microservices") {
      addIssue(issues, "warning", "Mobile apps can use microservices, but the delivery and synchronization constraints should be explicit.", "mobile_microservices");
    }
  }

  if (selected.has("ai_agent_automation_app") || delivery === "ai_agent_automation_app") {
    if (architecture && architecture !== "ai_agent_architecture") {
      addIssue(issues, "error", "AI agent profiles require ai_agent_architecture.", "ai_agent_architecture");
    }
  }

  if (selected.has("robotics_application") || delivery === "robotics_application") {
    if (governance && governance !== "safety_critical_device_app") {
      addIssue(issues, "error", "Robotics profiles require safety_critical_device_app governance.", "robotics_governance");
    }
  }

  if (selected.has("industrial_control_application") || delivery === "industrial_control_application") {
    if (governance && governance !== "industrial_machine_control_app") {
      addIssue(issues, "error", "Industrial control profiles require industrial_machine_control_app governance.", "industrial_governance");
    }
  }

  if ((selected.has("web_application") || delivery === "web_application") && architecture === "microservices") {
    addIssue(issues, "warning", "Public websites and small web apps should explicitly justify microservices.", "public_website_microservices");
  }

  if (selected.has("api_only_backend") || delivery === "api_only_backend") {
    if (selected.has("ui_heavy") || domain === "ui_heavy") {
      addIssue(issues, "warning", "API-only backends with UI-heavy domains need an explicit frontend delivery plan.", "api_only_backend_ui_heavy");
    }
  }

  if (selected.has("healthcare_platform") || delivery === "healthcare_platform") {
    if (governance && governance !== "healthcare_sensitive_app") {
      addIssue(issues, "warning", "Healthcare profiles usually pair with healthcare_sensitive_app governance.", "healthcare_governance");
    }
  }

  return {
    issues,
    warnings: issues.filter((issue) => issue.severity === "warning"),
    blocking: issues.some((issue) => issue.severity === "error" || issue.severity === "blocking")
  };
}

module.exports = { assessCompatibility };

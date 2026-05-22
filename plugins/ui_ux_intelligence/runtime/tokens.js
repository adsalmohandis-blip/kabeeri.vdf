const { generateDesignSystem } = require("./design_system");
const { recommendUiUx } = require("./recommender");

function generateDesignTokens(input, options = {}) {
  const recommendation = resolveRecommendation(input, options);
  const designSystem = options.designSystem && options.designSystem.report_type === "ui_ux_intelligence_design_system"
    ? options.designSystem
    : generateDesignSystem(input, { ...options, recommendation });
  const tokens = {
    color: buildColorTokens(designSystem, options),
    typography: buildTypographyTokens(designSystem, options),
    spacing: buildSpacingTokens(designSystem, options),
    radius: buildRadiusTokens(designSystem, options),
    shadow: buildShadowTokens(designSystem, options),
    motion: buildMotionTokens(designSystem, options),
    state: buildStateTokens(designSystem, options)
  };
  return {
    report_type: "ui_ux_intelligence_tokens",
    input: String(input || ""),
    tokens,
    usage_notes: buildUsageNotes(recommendation, options),
    accessibility_notes: buildAccessibilityNotes(designSystem, options),
    standalone: true,
    external_github_dependency: false,
    next_action: "Use these tokens in UI_SPECIFICATION.md or the implementation design system."
  };
}

function buildColorTokens(designSystem, options = {}) {
  const colors = designSystem && designSystem.colors ? designSystem.colors : {};
  return {
    primary: colors.primary || "#1d4ed8",
    secondary: colors.secondary || "#0f172a",
    background: colors.background || "#f8fafc",
    surface: colors.surface || "#ffffff",
    text: colors.text || "#0f172a",
    accent: colors.accent || colors.primary || "#2563eb",
    border: colors.border || "#dbe3ef",
    semantic: colors.semantic || {
      success: "#16a34a",
      warning: "#f59e0b",
      danger: "#dc2626",
      info: "#2563eb"
    },
    stack_notes: options.stack ? [`Keep this palette framework-neutral for ${options.stack}.`] : []
  };
}

function buildTypographyTokens(designSystem, options = {}) {
  const typography = designSystem && designSystem.typography ? designSystem.typography : {};
  const scale = typography.scale || defaultScale();
  return {
    heading_font: typography.heading_font || "Inter",
    body_font: typography.body_font || "Inter",
    mono_font: typography.mono_font || "ui-monospace",
    scale,
    weights: typography.weights || { regular: 400, medium: 500, semibold: 600, bold: 700 },
    line_height: typography.line_height || { body: 1.6, heading: 1.2 },
    stack_notes: options.stack ? [`Keep the typography system neutral for ${options.stack}.`] : []
  };
}

function buildSpacingTokens(designSystem, options = {}) {
  const base = options.baseSpacing || 4;
  return {
    base,
    scale: {
      none: 0,
      xs: base,
      sm: base * 2,
      md: base * 3,
      lg: base * 4,
      xl: base * 6,
      "2xl": base * 8,
      "3xl": base * 12
    },
    layout_gaps: {
      compact: base * 2,
      standard: base * 3,
      comfortable: base * 4
    }
  };
}

function buildRadiusTokens(designSystem, options = {}) {
  return {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 9999,
    notes: options.stack ? [`Radius values should stay neutral for ${options.stack}.`] : []
  };
}

function buildShadowTokens(designSystem, options = {}) {
  return {
    none: "none",
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 12px rgba(15, 23, 42, 0.10)",
    lg: "0 12px 24px rgba(15, 23, 42, 0.12)",
    focus_ring: "0 0 0 3px rgba(37, 99, 235, 0.24)"
  };
}

function buildMotionTokens(designSystem, options = {}) {
  return {
    duration: {
      fast: 120,
      standard: 180,
      slow: 260
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      in_out: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    transition: {
      subtle: "opacity 180ms cubic-bezier(0.2, 0, 0, 1), transform 180ms cubic-bezier(0.2, 0, 0, 1)",
      focus: "box-shadow 120ms cubic-bezier(0.2, 0, 0, 1)"
    },
    reduced_motion: {
      respect_prefers_reduced_motion: true,
      minimize_duration_ms: 0
    }
  };
}

function buildStateTokens(designSystem, options = {}) {
  return {
    hover: { opacity: 0.96 },
    focus: { ring: true, offset: 2 },
    active: { transform: "translateY(0.5px)" },
    selected: { border_weight: 2 },
    disabled: { opacity: 0.45 },
    loading: { skeleton: true },
    error: { color: "#dc2626" },
    success: { color: "#16a34a" }
  };
}

function buildUsageNotes(recommendation, options = {}) {
  const notes = [
    "Use these tokens as the single source of truth for UI surfaces, spacing, and interaction states.",
    "Keep implementation framework-neutral unless a stack-specific adapter is explicitly required."
  ];
  if (options.stack) notes.push(`Adjust naming conventions only if the ${options.stack} stack requires it.`);
  if (recommendation && recommendation.recommended_style) {
    notes.push(`Align the token usage with the ${recommendation.recommended_style} style direction.`);
  }
  return uniqueStrings(notes);
}

function buildAccessibilityNotes(designSystem, options = {}) {
  return uniqueStrings([
    "Keep contrast strong across primary, secondary, and muted text.",
    "Expose visible focus tokens for every interactive element.",
    "Reserve the motion tokens for subtle transitions and respect reduced-motion users.",
    options.stack ? `Validate touch targets and state tokens within the ${options.stack} implementation.` : ""
  ]);
}

function resolveRecommendation(input, options = {}) {
  if (options.recommendation && options.recommendation.report_type === "ui_ux_intelligence_recommendation") {
    return options.recommendation;
  }
  return recommendUiUx(input, options);
}

function defaultScale() {
  return {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    "2xl": 30,
    "3xl": 36
  };
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean)));
}

module.exports = {
  generateDesignTokens,
  buildColorTokens,
  buildTypographyTokens,
  buildSpacingTokens,
  buildRadiusTokens,
  buildShadowTokens,
  buildMotionTokens,
  buildStateTokens
};

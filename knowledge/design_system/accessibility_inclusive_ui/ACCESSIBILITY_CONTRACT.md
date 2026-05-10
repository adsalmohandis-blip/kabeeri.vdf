# Accessibility Contract

## Principle

Every UI must be operable, perceivable, understandable, and robust before it is considered visually complete.

## Required Baseline

- Use semantic elements before ARIA.
- Every interactive element is reachable by keyboard.
- Focus is visible and never trapped except inside active modal/dialog flows.
- Forms have visible labels, helper text, validation text, and programmatic error association.
- Icon-only controls have accessible names.
- Color is not the only indicator of meaning.
- Text and controls remain usable at 200% zoom.
- Touch targets are large enough for mobile and tablet workflows.
- Loading, empty, error, success, disabled, and permission states are accessible.
- Motion respects reduced-motion preferences.
- Tables expose headers, captions or summaries, row context, sorting state, and pagination context.
- Modals, drawers, popovers, dropdowns, and menus define focus behavior.

## Levels

### ACCESSIBILITY_STRICT

Use for admin panels, ERP, CRM, FinTech, HealthTech, government, security, dashboards, and dense operational tools.

Required emphasis:

- keyboard-first workflows;
- data table accessibility;
- visible focus rings;
- precise error messages;
- permission and audit clarity;
- no decorative motion that competes with work.

### ACCESSIBILITY_BALANCED

Use for SaaS, booking, delivery, LMS, real estate, AI products, and general apps.

Required emphasis:

- understandable flows;
- clear form recovery;
- accessible navigation;
- reduced-motion support;
- touch target comfort.

### ACCESSIBILITY_CONTENT

Use for landing pages, corporate sites, blogs, news, documentation, and content-heavy public surfaces.

Required emphasis:

- semantic headings;
- readable text width;
- skip links;
- link purpose clarity;
- image alt text policy;
- structured content landmarks.

## Anti-Patterns

- Divs or spans used as buttons.
- Custom dropdowns without keyboard behavior.
- Placeholder-only labels.
- Error messages that rely only on red color.
- Icon-only buttons without accessible names.
- Modals that do not restore focus.
- Auto-playing motion that cannot be reduced or paused.
- Tables with no header relationships.
- Low-contrast disabled text that hides required context.


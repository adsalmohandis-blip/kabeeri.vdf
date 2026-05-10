# KVDF Motion and Microinteractions System

Motion must support meaning, not decoration. Use it to improve feedback, guidance, continuity, perceived performance, hierarchy, and product quality without harming speed, readability, or accessibility.

## Core Principle

Motion equals:

```text
Feedback + Guidance + Continuity + Perceived Performance + Quality
```

Motion does not equal:

```text
Decoration + Noise + Random Effects + Delayed Content
```

If an animation does not help the user understand what happened, where to look, what changed, or what to do next, remove it.

## Decision Workflow

Before adding animation:

1. Identify the business type.
2. Choose the motion level.
3. Identify the UX purpose.
4. Prefer CSS or the existing UI framework.
5. Use motion tokens.
6. Add reduced-motion fallback.
7. Review performance and accessibility.

Use this decision:

```text
Does it communicate feedback, guidance, continuity, or waiting state?
  yes -> use a small tokenized motion pattern
  no -> do not animate

Can CSS transitions solve it?
  yes -> do not add a motion library
  no -> choose the smallest justified library

Is the screen dense, financial, medical, or destructive?
  yes -> MINIMAL_MOTION
```

## UX Purposes

### Feedback

Use when the system responds to user action.

Examples:

- Button press
- Save success
- Delete confirmation
- Copy to clipboard
- Add to cart
- Form validation

### Guidance

Use when attention should move to a relevant change.

Examples:

- Error message appears
- Updated row is highlighted
- Current checkout step changes
- New AI output is ready

### Continuity

Use when UI state changes and the relationship should remain understandable.

Examples:

- Modal opens
- Drawer closes
- Tab changes
- Stepper advances
- Row added to table

### Perceived Performance

Use when data is loading or processing.

Examples:

- Skeleton
- Spinner
- Progress bar
- Streaming indicator
- File upload progress

### Storytelling

Use mostly for public pages.

Examples:

- Hero entrance
- Product demo sequence
- Section reveal
- Case study highlight

## Motion Levels

### MINIMAL_MOTION

Best for:

- Admin panels
- ERP
- FinTech
- HealthTech
- Internal tools
- Security dashboards
- Dense data screens
- Destructive flows

Allowed:

- Button press feedback
- Modal, dropdown, drawer, and toast transitions
- Loading and saving states
- Form validation feedback
- Row highlight after update
- Focus and hover states

Avoid:

- Hero animation
- Scroll reveal
- Confetti
- Parallax
- Heavy animated backgrounds
- Constant chart motion
- Bouncy destructive or payment buttons

Goal:

- Speed, clarity, trust, stability.

### BALANCED_MOTION

Best for:

- SaaS
- CRM
- Dashboards
- Booking
- Delivery
- LMS / EdTech
- Real estate
- AI products
- Medium-complexity apps

Allowed:

- All Minimal Motion
- Interactive card hover
- Step transitions
- Empty state emphasis
- Onboarding progress
- Sidebar transition
- One-time chart entrance
- Success feedback
- Upload/progress feedback

Avoid:

- Motion in every section
- Decorative animation without purpose
- Delayed useful content
- Overly animated data tables

Goal:

- Modern, responsive, helpful.

### EXPRESSIVE_MOTION

Best for:

- Landing pages
- Corporate sites
- Product showcases
- Campaign pages
- Portfolios
- Event pages

Allowed:

- Hero entrance
- Section reveal
- Staggered cards
- Product demo animation
- Smooth anchor transitions
- CTA hover feedback
- Testimonial carousel transition

Avoid:

- Multiple competing effects in one viewport
- Motion that hides the message
- Heavy parallax
- Slow first content
- Autoplay motion that cannot be paused

Goal:

- Premium storytelling without sacrificing clarity.

## Business Motion Map

| Business | Default Level | Notes |
| --- | --- | --- |
| landing-page | EXPRESSIVE_MOTION | Use for hero, proof, CTA, and section storytelling. |
| corporate | EXPRESSIVE_MOTION | Controlled credibility motion; avoid gimmicks. |
| ecommerce | BALANCED_MOTION | Product hover, cart feedback, checkout continuity. |
| marketplace | BALANCED_MOTION | Save/compare feedback, listing transitions, trust clarity. |
| saas | BALANCED_MOTION | Onboarding, usage, activity, settings feedback. |
| admin-panel | MINIMAL_MOTION | Dense work, fast interactions, no decorative motion. |
| dashboard | BALANCED_MOTION | One-time chart entrance; minimal in dense monitors. |
| crm | BALANCED_MOTION | Pipeline movement, task completion, timeline updates. |
| erp | MINIMAL_MOTION | Row highlight, modal, saving, validation only. |
| booking | BALANCED_MOTION | Stepper, slot selection, summary update. |
| delivery | BALANCED_MOTION | Timeline/ETA updates, but avoid excessive map motion. |
| lms | BALANCED_MOTION | Progress, quiz feedback; lesson screens stay calm. |
| fintech | MINIMAL_MOTION | Review-confirm-processing-receipt; no playful effects. |
| healthtech | MINIMAL_MOTION | Calm, readable, no motion near critical info. |
| real-estate | BALANCED_MOTION | Gallery and card transitions; no photo-obscuring effects. |
| ai-product | BALANCED_MOTION | Streaming, upload progress, copy/regenerate feedback. |

## Library Decision Matrix

| Use Case | Preferred Choice |
| --- | --- |
| Hover, active, focus | CSS transitions |
| Button press | CSS transitions |
| Form validation | CSS transitions |
| Modal, dropdown, toast | Current UI library or CSS |
| Drawer/sidebar | CSS or current UI framework |
| Simple scroll reveal | IntersectionObserver + CSS, or AOS only when justified |
| React/Next structured transitions | Motion for React when justified |
| Complex timeline | GSAP when justified |
| Advanced SVG animation | GSAP |
| Animated illustration asset | Lottie / dotLottie only when asset exists |
| Dashboard/Admin/ERP | CSS transitions only in most cases |

Rules:

- Do not add GSAP for hover effects.
- Do not add AOS in admin, ERP, FinTech, or HealthTech by default.
- Do not mix Motion, GSAP, AOS, and Lottie in one screen without a documented reason.
- Prefer the framework's existing transitions before custom motion.
- Adding a library requires an implementation note explaining why CSS is insufficient.

## Motion Tokens

Durations:

| Token | Value | Use |
| --- | --- | --- |
| `instant` | 80ms | Tiny feedback, status flicker replacement |
| `fast` | 120ms | Hover, active, focus |
| `normal` | 200ms | Tooltip, dropdown, badge, small validation |
| `medium` | 300ms | Modal, drawer, toast, step transition |
| `slow` | 500ms | Section entrance, hero element |
| `showcase` | 700ms | Public-page storytelling only |

Easing:

| Token | Value | Use |
| --- | --- | --- |
| `standard` | `ease-out` | General entrance |
| `emphasized` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Modal, drawer, hero |
| `exit` | `ease-in` | Leaving UI |
| `linear` | `linear` | Progress/loading only |

Distance:

| Token | Value | Use |
| --- | --- | --- |
| `micro` | 2px | Button press |
| `small` | 6px | Hover lift |
| `medium` | 12px | Card entrance |
| `large` | 24px | Modal/drawer entrance |

Scale:

| Token | Value | Use |
| --- | --- | --- |
| `press` | 0.98 | Button active |
| `hover` | 1.02 | Interactive card hover |
| `pop` | 1.04 | Success emphasis only |

## CSS Presets

Use these classes directly in prototypes, or map them into the project's component system.

```css
:root {
  --motion-instant: 80ms;
  --motion-fast: 120ms;
  --motion-normal: 200ms;
  --motion-medium: 300ms;
  --motion-slow: 500ms;
  --motion-showcase: 700ms;

  --ease-standard: ease-out;
  --ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-exit: ease-in;
  --ease-linear: linear;

  --motion-distance-micro: 2px;
  --motion-distance-small: 6px;
  --motion-distance-medium: 12px;
  --motion-distance-large: 24px;
  --motion-scale-press: 0.98;
  --motion-scale-hover: 1.02;
  --motion-scale-pop: 1.04;
}

.kvdf-pressable {
  transition: transform var(--motion-fast) var(--ease-standard);
}

.kvdf-pressable:active {
  transform: scale(var(--motion-scale-press));
}

.kvdf-hover-lift {
  transition:
    transform var(--motion-normal) var(--ease-standard),
    box-shadow var(--motion-normal) var(--ease-standard);
}

.kvdf-hover-lift:hover {
  transform: translateY(calc(var(--motion-distance-small) * -1));
}

.kvdf-fade-in {
  animation: kvdfFadeIn var(--motion-medium) var(--ease-standard) both;
}

.kvdf-slide-up {
  animation: kvdfSlideUp var(--motion-medium) var(--ease-emphasized) both;
}

.kvdf-pop-in {
  animation: kvdfPopIn var(--motion-normal) var(--ease-emphasized) both;
}

.kvdf-row-updated {
  animation: kvdfRowUpdated var(--motion-slow) var(--ease-standard) both;
}

@keyframes kvdfFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes kvdfSlideUp {
  from {
    opacity: 0;
    transform: translateY(var(--motion-distance-medium));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes kvdfPopIn {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes kvdfRowUpdated {
  0% { background-color: rgba(34, 197, 94, 0.16); }
  100% { background-color: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Component Recipes

### Buttons

Use:

- hover/active feedback;
- disabled state;
- loading state;
- success feedback where useful.

Avoid:

- bounce on destructive or payment actions;
- scale above `1.02`;
- motion-only feedback.

### Cards

Use hover lift only when the card is clickable.

Avoid hover lift on:

- static information cards;
- dense KPI grids where motion distracts;
- medical or financial critical cards.

### Modals And Drawers

Use:

- medium duration;
- opacity plus transform;
- focus management;
- reduced-motion fallback.

Avoid:

- delayed close;
- moving focus unexpectedly;
- dramatic entrances for confirmations.

### Toasts

Use:

- short slide/fade;
- enough reading time;
- icon plus text.

Avoid:

- toast-only errors for forms;
- disappearing critical information too quickly.

### Tables

Use:

- row highlight after update;
- skeleton loading;
- minimal drawer transition.

Avoid:

- animated sorting that reorders rows dramatically;
- looping loading states inside every cell;
- chart-like effects in dense tables.

### Forms

Use:

- validation message reveal;
- saving disabled state;
- success or error feedback.

Avoid:

- moving fields after validation;
- hiding labels;
- shaking fields aggressively.

### Charts

Use:

- one-time entrance on first load;
- skeleton before data;
- static fallback for reduced motion.

Avoid:

- animating every refresh;
- chart animation that delays data reading;
- decorative chart motion in admin/ERP.

### Empty States

Use:

- subtle entrance;
- helpful CTA;
- icon or illustration if consistent.

Avoid:

- looping decorative animation;
- empty states that feel playful in serious domains.

### AI Output

Use:

- truthful processing or streaming state;
- upload progress;
- copy/regenerate feedback.

Avoid:

- fake thinking that runs too long;
- animated text that harms readability;
- motion that implies output is final before it is complete.

## Reduced Motion Requirements

Reduced motion is mandatory for any implementation that adds animation.

Rules:

- Do not remove meaning when motion is reduced.
- Replace motion meaning with static indicators.
- Keep icons, badges, labels, progress text, and alerts.
- Preserve focus states.

Examples:

- If online pulse is removed, keep `Online` text and badge.
- If progress animation is removed, keep percentage or current step.
- If success pop is removed, keep success icon and message.

## Performance Rules

Prefer:

- `transform`
- `opacity`

Avoid animating:

- `width`
- `height`
- `top`
- `left`
- `right`
- `bottom`
- `margin`
- `padding`
- heavy repeated `box-shadow`

Rules:

- Do not animate hundreds of nodes at once.
- Do not run infinite animations unless there is a clear UX reason.
- Do not animate offscreen content without need.
- For scroll animations, use IntersectionObserver or an approved library.
- Test dense dashboards and tables for responsiveness.

## Accessibility Rules

- Motion must not be the only status signal.
- Respect `prefers-reduced-motion`.
- Avoid flashing or rapid blinking.
- Do not animate critical text in a way that makes it hard to read.
- Keep focus states visible.
- Do not move focus unexpectedly.
- Modals must manage focus properly.
- Toasts and errors must remain readable long enough.
- Error messages should not disappear automatically.

## Anti-Patterns

Never use:

- animating every element on the page;
- long intro animations before content;
- scroll reveal in admin panels or ERP screens;
- infinite decorative loops near important content;
- confetti for serious, medical, financial, destructive, or compliance actions;
- bounce effects on delete, payment, approval, or security actions;
- random durations or easing;
- multiple motion libraries without a documented reason;
- motion that hides prices, errors, warnings, confirmations, or medical data;
- hover effects on disabled elements;
- page transitions that make the app feel slower.

## Motion Assessment Report

Use this report before adding a new motion library or broad animation system.

```md
# KVDF Motion Assessment Report

## Current Motion Status

- Existing animation library:
- Existing CSS transitions:
- Reduced motion support:
- Components with motion:
- Components missing feedback:

## Business And Surface

- Business type:
- Screen type:
- User context:
- Risk level:

## Recommended Motion Level

- Level: MINIMAL_MOTION / BALANCED_MOTION / EXPRESSIVE_MOTION
- Reason:

## Recommended Approach

- CSS only:
- Existing UI framework:
- Motion for React:
- GSAP:
- AOS:
- Lottie:
- New library needed: Yes / No
- Why:

## Motion Areas

- Buttons:
- Cards:
- Modals/drawers:
- Dropdowns:
- Toasts:
- Empty states:
- Loading states:
- Tables:
- Forms:
- Charts:
- Page sections:

## Reduced Motion Plan

- Static fallback indicators:
- Critical states preserved:

## Performance Notes

- Heavy animation risks:
- Large list/table concerns:
- Optimizations:

## Final Recommendation

Status: APPROVED_AS_IS / APPROVED_WITH_MODIFICATIONS / NOT_RECOMMENDED
```

## Review Checklist

Before finishing UI work with motion:

- Every animation has a UX purpose.
- Motion level matches business type and screen risk.
- Durations and easing come from tokens.
- Transform and opacity are preferred.
- Reduced motion is respected.
- Critical content remains available and readable.
- No new motion library was added without justification.
- No confetti, bounce, or playful effect appears in serious flows.
- Dense tables and dashboards remain fast.
- Form errors and important alerts do not disappear too quickly.
- Motion is not the only way to communicate status.

## Compact Prompt

Use this when asking an AI agent to improve motion:

```text
Improve motion using Kabeeri Motion System.
Choose motion level from business type.
Use CSS/framework motion first.
Use motion tokens only.
Respect prefers-reduced-motion.
Animate only feedback, guidance, continuity, or perceived performance.
Do not add a motion library unless justified.
Do not animate prices, errors, warnings, confirmations, medical data, or dense tables distractingly.
Run the motion review checklist.
```


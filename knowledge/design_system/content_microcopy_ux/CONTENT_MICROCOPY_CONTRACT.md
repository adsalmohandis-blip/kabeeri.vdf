# Content Microcopy Contract

## Principle

Every visible text string must help the user decide, act, recover, or understand state.

## Required Baseline

- Action labels describe the outcome, not the implementation.
- Buttons use consistent verbs.
- Empty states explain what is missing and the next useful action.
- Error states explain what happened and how to recover.
- Form labels are visible, specific, and not replaced by placeholders.
- Validation messages are actionable.
- Destructive confirmations explain consequence.
- Loading and progress text is honest and specific when duration matters.
- Status labels use stable vocabulary.
- Help text appears close to the decision point.
- User-facing copy matches product tone, user role, and risk level.
- Arabic and bilingual interfaces avoid literal translation of English-only idioms.

## Levels

### CONTENT_OPERATIONAL

Use for admin panels, ERP, CRM, dashboards, FinTech, HealthTech, WMS, accounting, helpdesk, and internal tools.

Tone: precise, calm, direct.

Required emphasis:

- task clarity;
- audit and permission wording;
- exact status labels;
- recoverable errors;
- low drama confirmations.

### CONTENT_CONVERSION

Use for eCommerce, marketplace, booking, landing pages, SaaS signup, lead generation, and checkout flows.

Tone: clear, helpful, trust-building.

Required emphasis:

- value clarity;
- friction reduction;
- price, fee, date, stock, and availability transparency;
- trust signals;
- next-step confidence.

### CONTENT_EDITORIAL

Use for blogs, news, corporate sites, documentation, knowledge bases, and content-heavy pages.

Tone: readable, structured, credible.

Required emphasis:

- scannable headings;
- clear source/date/update labels;
- descriptive links;
- useful summaries;
- no clickbait in product-critical UI.

### CONTENT_CONVERSATIONAL

Use for AI products, assistants, prompt tools, onboarding, and guided workflows.

Tone: helpful, concise, transparent.

Required emphasis:

- expectation setting;
- progress messaging;
- confidence boundaries;
- retry and edit paths;
- clear generated-output state.

## Anti-Patterns

- Generic buttons such as Submit, Click Here, OK, Do It, Continue everywhere.
- Empty states that only say "No data".
- Error states that only say "Something went wrong".
- Destructive dialogs that do not say what will be deleted.
- Status labels that change vocabulary across screens.
- Helper text far away from the relevant field.
- Marketing copy inside operational dashboards.
- Technical errors shown directly to non-technical users.


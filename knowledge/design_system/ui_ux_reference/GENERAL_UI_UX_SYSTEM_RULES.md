# General UI/UX System Rules

This file turns broad system-building knowledge into UI/UX governance. It helps Kabeeri decide what to ask, what to document, and what to require before an AI coding tool builds the interface.

## 1. Start From Product Workflow

Do not design screens first. Design from the real workflow:

```text
user role -> goal -> workflow steps -> data needed -> permissions -> errors -> success state
```

For every project, capture:

- product type;
- target users and roles;
- core workflows;
- permissions and restrictions;
- integrations;
- reports;
- content model;
- admin operations;
- launch and maintenance needs.

## 2. Define MVP Before Rich UI

A good UI/UX system separates the first useful version from later upgrades.

The UI brief must identify:

- MVP pages;
- later pages;
- hidden complexity;
- business-critical workflows;
- optional polish;
- launch blockers.

## 3. Match UI Pattern To Product Type

Use the right experience pattern:

| Product type | Primary UI pattern |
| --- | --- |
| Company website | SEO public site, service pages, contact flow |
| Blog/news | Content site, article pages, taxonomy, author/date, search |
| E-commerce | Storefront, product discovery, cart, checkout, account, admin |
| ERP/CRM/POS | Data-heavy dashboard, tables, forms, permissions, reports |
| Mobile app | Touch-first navigation, offline states, deep links, push permissions |
| SaaS | App shell, onboarding, billing, workspaces, admin, settings |

## 4. Design System Layers

Every serious UI should produce:

- brand foundation;
- design tokens;
- typography rules;
- color semantics;
- spacing scale;
- layout/grid system;
- approved UI library foundation when one is selected, such as Bootstrap, Tailwind CSS, Bulma, Foundation, MUI, Ant Design, daisyUI, or shadcn/ui;
- component library;
- product patterns;
- accessibility rules;
- responsive behavior;
- content guidelines;
- SEO/GEO rules when public;
- visual acceptance checklist.

## 5. Required Page States

Every page or component must define:

- loading;
- empty;
- error;
- success;
- permission denied;
- no results;
- action in progress;
- action succeeded;
- action failed;
- offline or sync error when relevant.

## 6. Admin And Dashboard Rules

Dashboards are tools, not landing pages.

Require:

- sidebar or app-shell navigation when modules are many;
- topbar for global search, notifications, profile, theme/language;
- data tables with search, filters, sorting, pagination, row actions, empty/loading/error states;
- role-aware widgets;
- clear status badges;
- drill-down from KPI to detail pages;
- audit/activity surfaces for important entities;
- readable density without decorative clutter.

## 7. Public SEO/GEO Rules

Public pages must use:

- semantic HTML;
- clear H1/H2/H3 structure;
- clean URLs;
- breadcrumbs;
- structured data when eligible;
- readable paragraphs;
- FAQ blocks when useful;
- author/date/source fields for content;
- optimized images with alt text;
- fast loading and Core Web Vitals awareness.

## 8. Accessibility Rules

Every UI task must check:

- real buttons for actions and real links for navigation;
- visible focus states;
- labels for fields;
- text plus icon/status, not color only;
- keyboard access for menus, dialogs, tabs, dropdowns, tables;
- accessible names for icon-only buttons;
- sufficient contrast;
- dialog focus management;
- RTL readiness for Arabic.

## 9. Implementation Gate

Before frontend code starts, Kabeeri should have:

1. selected UI/UX reference pattern;
2. answered discovery questions;
3. approved design tokens;
4. approved UI library decision when Bootstrap, MUI, Tailwind, shadcn/ui, or another foundation is selected;
5. approved page specs;
6. approved component contracts;
7. generated frontend tasks with acceptance criteria;
8. visual QA checklist.

If any of these are missing, the AI tool should create documentation/design tasks before implementation tasks.

# UI/UX Advisor Runtime

The UI/UX Advisor helps Kabeeri and AI coding tools choose the right frontend
design direction for the requested product instead of inventing UI from scratch.

It extends the existing Design Governance layer:

- Product Blueprints identify the product type.
- UI/UX Advisor maps that type to experience patterns, component groups,
  page templates, stack suggestions, SEO/GEO rules, dashboard rules, or mobile
  rules.
- Design Governance still requires approved text specs, page specs, component
  contracts, visual reviews, and Owner/client approval.

## Commands

```bash
kvdf design recommend ecommerce --json
kvdf design recommend news_website --json
kvdf design recommend erp --json
kvdf design ui-checklist
kvdf design ui-review "news article page with semantic HTML structured data responsive accessibility loading empty error"
kvdf design ui-history
kvdf validate ui-design
```

## Runtime State

Recommendations and UI reviews are stored in:

```text
.kabeeri/design_sources/ui_advisor.json
```

## What It Returns

For a blueprint such as `news_website`, the advisor returns:

- `experience_pattern`: for example `seo_content_site`
- recommended stacks: for example Astro, Next.js, Tailwind, shadcn/ui
- design foundations: brand, tokens, typography, color, spacing, layout, accessibility
- component groups: core, content, commerce, dashboard, mobile
- components: article cards, author boxes, FAQ, tables, cards, modals, drawers, etc.
- page templates: home, listing, detail, search, FAQ, account, checkout, dashboard
- SEO/GEO rules: semantic HTML, structured data, breadcrumbs, author/date, source lists
- avoid list: common bad UX choices for that product type
- approval checklist

## Experience Patterns

| Pattern | Use For |
| --- | --- |
| `seo_content_site` | Blog, news, corporate, knowledge base, docs, paid content. |
| `commerce_storefront` | eCommerce, marketplace, loyalty, booking-style public flows. |
| `data_heavy_web_app` | ERP, CRM, WMS, accounting, helpdesk, HR, BI dashboards. |
| `pos_operations` | POS, restaurant, fast operator workflows. |
| `mobile_app` | Customer, driver, sales rep, employee, news, delivery mobile apps. |

## Rule

The advisor is not a license to skip design approval. It is a compact planning
context for AI and developers. Frontend implementation should still pass:

```bash
kvdf design gate --task <task-id> --page <page-spec-id>
```

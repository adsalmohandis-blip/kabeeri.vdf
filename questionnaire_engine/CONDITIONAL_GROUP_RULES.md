# Conditional Group Rules

Question groups open only when coverage says an area is relevant.

- `payments_billing` opens payment, subscription, invoice, coupon, and refund questions.
- `multi_tenancy` opens tenant isolation, tenant settings, tenant branding, tenant billing, and tenant admin questions.
- `admin_panel` opens admin roles, dashboard widgets, owner-only actions, and audit questions.
- `public_frontend` opens SEO, accessibility, responsive UI, content, localization, and analytics questions.

Skipped groups must be marked `deferred` or `not_applicable`; they are not silently removed.

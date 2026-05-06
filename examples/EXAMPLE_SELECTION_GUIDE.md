# Example Selection Guide

Use this guide to choose the correct example profile.

## Choose Lite when

Use `examples/lite/` when the project is:

```text
- a simple MVP
- a landing page with contact form
- a small admin tool
- a single-purpose app
- an internal helper tool
- a prototype for validation
```

Good examples:

```text
Booking request form
Simple CRM
Task list
Portfolio site
Product landing page
Small directory
```

## Choose Standard when

Use `examples/standard/` when the project is:

```text
- a real client project
- a SaaS MVP
- a customer portal
- a marketplace MVP
- an app with user login
- a product with admin panel
- a system that needs database planning
```

Good examples:

```text
Clinic booking system
Course platform MVP
Small e-commerce backend
Multi-user dashboard
Agency client portal
```

## Choose Enterprise when

Use `examples/enterprise/` when the project is:

```text
- a large system
- a multi-role platform
- a system with departments/teams
- a regulated or sensitive product
- a product with complex permissions
- a product with multiple integrations
- a project that needs formal handoff and governance
```

Good examples:

```text
ERP module
Healthcare platform
Education management system
Large marketplace
Financial operations system
Multi-tenant SaaS
```

## Simple decision tree

```text
Is it only a small MVP or prototype?
→ Use Lite.

Does it need login, database, admin panel, and real release planning?
→ Use Standard.

Does it need teams, permissions, integrations, audit, governance, and release controls?
→ Use Enterprise.
```

## Important rule

Do not choose Enterprise just because the idea feels important.

Choose Enterprise only when the product truly needs enterprise-level controls.

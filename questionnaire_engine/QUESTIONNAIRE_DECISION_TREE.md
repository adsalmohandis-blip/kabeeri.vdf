# Questionnaire Decision Tree

```text
entry.project_type
  saas -> users/auth/backend/database/admin unknown, tenancy unknown
  ecommerce -> public frontend/backend/payments/security required
  landing_page -> public frontend/SEO/accessibility required, backend optional

entry.has_users
  yes -> users/auth/authorization/journeys required
  no -> auth not_applicable unless admin exists
  unknown -> follow-up

entry.has_payments
  yes -> payments required
  later -> payments deferred
  no -> payments not_applicable
  unknown -> follow-up
```

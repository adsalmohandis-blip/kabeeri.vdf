# System Area Activation Rules

Activation is based on project type and entry answers.

Start here:

1. Run `kvdf questionnaire flow` to see the activation order.
2. Run `kvdf capability list` for the machine-readable system area map.
3. Run `kvdf questionnaire plan "<project>"` to generate the first focused questions.

- SaaS, ecommerce, booking, internal tools, APIs, and mobile apps usually require backend, data, users, and security coverage.
- Public pages require public frontend, SEO, and accessibility coverage.
- Payments become required only when the answer says `yes` or the project is ecommerce.
- Multi-tenancy becomes required only when explicitly needed; SaaS with unknown tenancy stays `unknown`.
- Unknown answers trigger follow-up instead of skipping the area.

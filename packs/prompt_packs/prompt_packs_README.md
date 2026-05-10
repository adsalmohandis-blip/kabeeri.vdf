# Prompt Packs

This directory contains implementation-stack prompt packs for **Kabeeri Vibe Developer Framework**.

A prompt pack is a structured set of AI prompts that helps a vibe developer move from project planning documents into controlled implementation tasks.

## Important clarification

Prompt packs are **not installers**.

They do not install frameworks, create accounts, run setup commands, configure hosting, or generate complete applications automatically.

They are AI-ready guidance files used after the project has been planned through Kabeeri VDF documents.

## Core idea

Traditional frameworks help developers write code.

Kabeeri VDF prompt packs help AI-powered builders tell AI what to build, where to build it, what files it may edit, what files it must not touch, how to control scope, and how to review the result.

```text
Planning documents
→ choose implementation stack
→ choose the matching prompt pack
→ run one prompt
→ review output
→ test/check
→ commit
→ continue
```

## Main rule

Do not ask an AI coding assistant to build the whole product at once.

Use one prompt at a time.

```text
One prompt
→ one focused task
→ review changed files
→ run checks/tests
→ fix issues
→ commit
→ move to the next prompt
```

## Recommended usage

1. Complete the required Kabeeri VDF planning documents.
2. Choose the implementation stack.
3. Open the matching folder inside `prompt_packs/`.
4. Read the pack `README.md`.
5. Read the pack index file.
6. Start from prompt `01`.
7. Copy one prompt into the AI coding assistant.
8. Review the output manually.
9. Run tests/checks.
10. Commit the change.
11. Continue to the next prompt.

## Shared prompt rules

Every prompt pack follows the same base discipline:

```text
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
Do not skip review.
Do not skip checks/tests when available.
```

## Common Prompt Layer

The repository includes a shared common layer for rules repeated across all stacks:

```text
prompt_packs/common/
├── 00_COMMON_PROMPT_PACK_INDEX.md
├── 01_GENERAL_AI_CODING_RULES.md
├── 02_SCOPE_CONTROL_RULES.md
├── 03_TASK_EXECUTION_FLOW.md
├── 04_TESTING_REVIEW_RULES.md
└── 05_RELEASE_HANDOFF_RULES.md
```

The stack-specific packs should be composed with the common layer instead of
repeating every rule forever.

Runtime commands:

```bash
kvdf prompt-pack common
kvdf prompt-pack compose react --task task-001
kvdf prompt-pack compose react --task task-001 --context ctx-001 --output .kabeeri/prompt_layer/task-001.react.md
kvdf prompt-pack compositions
kvdf validate prompt-layer
```

`compose` merges common rules, stack-specific prompt text, task acceptance,
allowed/forbidden files, and an optional context pack into one reviewable prompt.

## Current prompt pack categories

```text
prompt_packs/
├── common/
├── php-frameworks/
├── backend-frameworks/
├── frontend-frameworks/
├── frontend-meta-frameworks/
├── mobile-frameworks/
├── cms-commerce-platforms/
├── backend-as-a-service/
└── headless-cms/
```

The actual repository currently stores packs directly under `prompt_packs/<pack-name>/`.

The categories below are logical categories for documentation and future organization.

## v1 Prompt Pack Status

| Item | Current State |
| --- | --- |
| Stack folders | Many concrete stack packs exist directly under `prompt_packs/<pack-name>/`. |
| Common layer | Implemented as `prompt_packs/common/` plus `kvdf prompt-pack compose`. |
| React Native / Expo | Implemented as `prompt_packs/react-native-expo/` with Expo-specific mobile prompts, manifest, common-layer composition support, export support, and validation through prompt-pack manifests. |
| Categories | Documented as logical categories; the repository does not need to physically reorganize folders during v1 stabilization. |

Phase 04 does not rename prompt-pack folders. The common prompt layer is shared
by composition instead of physical folder reorganization.

---

# 1. PHP Framework Prompt Packs

These packs are for PHP frameworks and PHP-based application development.

## Laravel

```text
prompt_packs/laravel/
```

Use for:

```text
Laravel apps
Laravel APIs
Blade apps
Laravel admin systems
Laravel SaaS projects
Laravel queues/jobs/mail
Laravel policies/middleware
```

## Symfony

```text
prompt_packs/symfony/
```

Use for:

```text
Symfony full-stack apps
Symfony APIs
Doctrine entities
Symfony security
Symfony services
Twig apps
Symfony admin/backoffice
```

## CodeIgniter

```text
prompt_packs/codeigniter/
```

Use for:

```text
Lightweight PHP apps
Simple APIs
Admin panels
Small business systems
Legacy-friendly PHP projects
```

---

# 2. Backend / Full-stack Framework Prompt Packs

These packs are for backend services, APIs, full-stack frameworks, and server-side systems.

## .NET

```text
prompt_packs/dotnet/
```

Use for:

```text
ASP.NET Core APIs
Enterprise backends
Admin systems
Clean architecture style apps
Authentication and authorization
Entity Framework Core
```

## Django

```text
prompt_packs/django/
```

Use for:

```text
Django full-stack apps
Django admin-heavy systems
Django APIs
Django REST Framework projects
Content/admin tools
Python web apps
```

## FastAPI

```text
prompt_packs/fastapi/
```

Use for:

```text
Python APIs
AI API backends
Microservices
Data/ML service APIs
Fast backend prototypes
```

## NestJS

```text
prompt_packs/nestjs/
```

Use for:

```text
Node.js enterprise APIs
TypeScript backends
Modular APIs
Auth systems
Microservices
Event-driven backends
```

## Express.js

```text
prompt_packs/expressjs/
```

Use for:

```text
Lightweight Node.js APIs
Simple REST backends
Webhook receivers
Backend-for-frontend services
Microservices
```

## Ruby on Rails

```text
prompt_packs/rails/
```

Use for:

```text
Rails full-stack apps
SaaS products
Admin systems
Active Record apps
Jobs/mailers/services
Fast CRUD-heavy products
```

## Spring Boot

```text
prompt_packs/springboot/
```

Use for:

```text
Java APIs
Enterprise backends
Spring Security
JPA/Hibernate projects
Large backend systems
Microservices
```

## Go / Gin

```text
prompt_packs/go-gin/
```

Use for:

```text
Go REST APIs
High-performance services
Small backend services
Webhook receivers
Microservices
```

---

# 3. Frontend Framework Prompt Packs

These packs are for frontend-only apps, dashboards, portals, and UI layers connected to separate backends.

## React.js

```text
prompt_packs/react/
```

Use for:

```text
React SPAs
Admin dashboards
Customer portals
Frontend connected to APIs
Embedded UI
```

## Vue.js

```text
prompt_packs/vue/
```

Use for:

```text
Vue SPAs
Frontend dashboards
Customer portals
Vue UI connected to backend APIs
```

## Angular

```text
prompt_packs/angular/
```

Use for:

```text
Enterprise frontend apps
Admin dashboards
Internal systems
Large SPAs
Frontend for .NET/Spring/Laravel APIs
```

---

# 4. Frontend Meta-Framework Prompt Packs

These packs include routing, rendering, deployment, and app structure conventions beyond simple UI.

## Next.js

```text
prompt_packs/nextjs/
```

Use for:

```text
React full-stack apps
SSR/SSG apps
App Router projects
Marketing + app hybrids
Dashboards
Frontend connected to APIs
```

## Nuxt / Vue

```text
prompt_packs/nuxt-vue/
```

Use for:

```text
Nuxt apps
Vue full-stack apps
SSR/SSG Vue projects
Vue frontend platforms
```

## SvelteKit

```text
prompt_packs/sveltekit/
```

Use for:

```text
SvelteKit full-stack apps
Fast frontend apps
Server load functions
SvelteKit form actions
Lightweight web apps
```

## Astro

```text
prompt_packs/astro/
```

Use for:

```text
Landing pages
Marketing websites
Documentation sites
Blogs
Content sites
SEO-focused websites
Hybrid islands
```

---

# 5. Mobile Framework Prompt Packs

These packs are for mobile app implementation.

## React Native / Expo

```text
prompt_packs/react-native-expo/
```

Use for:

```text
iOS apps
Android apps
Expo apps
Mobile apps connected to APIs
Customer apps
Internal mobile tools
```

Key rules:

```text
Do not expose server secrets in mobile code.
Do not add permissions unless the task needs them.
Do not edit native folders or EAS release settings without explicit approval.
Use kvdf prompt-pack compose react-native-expo --task <task-id> for governed AI runs.
```

Current Expo coverage includes mobile context, routing, public config, theme
foundation, auth/onboarding, API/data/state, core screens, forms/keyboard,
offline storage, permissions/notifications, testing/review, EAS handoff,
backend API contract alignment, and accessibility/performance review.

## Flutter

```text
prompt_packs/flutter/
```

Use for:

```text
iOS apps
Android apps
Flutter mobile apps
Cross-platform apps
Mobile apps connected to APIs
```

---

# 6. CMS / Commerce Platform Prompt Packs

These packs are not traditional frameworks, but they are important implementation platforms for vibe developers.

## WordPress

```text
prompt_packs/wordpress/
```

Use for:

```text
WordPress plugins
Themes
Child themes
Custom post types
Shortcodes
Blocks
WooCommerce extensions
REST API endpoints
```

Important rule:

```text
Never modify WordPress core files.
```

Work should normally happen inside:

```text
wp-content/plugins/
wp-content/themes/
wp-content/mu-plugins/
```

## Shopify

```text
prompt_packs/shopify/
```

Use for:

```text
Shopify theme customization
Liquid sections and blocks
Shopify apps
Admin API integration
Storefront API integration
Webhooks
Product/collection/metafield planning
Checkout-related planning
```

Important rule:

```text
Do not modify a live production theme or store without backup and approval.
Do not expose Shopify Admin API tokens or app secrets in frontend code.
```

---

# 7. Backend-as-a-Service Prompt Packs

These packs are for managed backend platforms used heavily by AI builders and vibe developers.

## Supabase

```text
prompt_packs/supabase/
```

Use for:

```text
Postgres database
Supabase Auth
Row Level Security
Storage buckets
Edge Functions
Realtime features
Frontend integration
```

Important rule:

```text
Never expose Supabase service role keys in frontend or mobile apps.
Review Row Level Security before using private data.
```

## Firebase

```text
prompt_packs/firebase/
```

Use for:

```text
Firebase Auth
Firestore
Realtime Database
Storage
Cloud Functions
Hosting
Emulators
Frontend/mobile integration
```

Important rule:

```text
Never expose Firebase Admin SDK private keys in frontend or mobile apps.
Do not create open security rules for private data.
```

---

# 8. Headless CMS Prompt Packs

## Strapi

```text
prompt_packs/strapi/
```

Use for:

```text
Content types
Components
Dynamic zones
Roles and permissions
API access
Media library
Frontend integration
Custom controllers/services
Webhooks
i18n/localization
```

Important rule:

```text
Do not expose admin credentials, API tokens, database credentials, or private environment variables.
Do not make content public unless explicitly requested.
```

---

# How to choose the right prompt pack

## If the project is PHP

Use:

```text
laravel/
symfony/
codeigniter/
wordpress/
```

## If the project is backend/API only

Use:

```text
dotnet/
django/
fastapi/
nestjs/
expressjs/
springboot/
go-gin/
rails/
```

## If the project is frontend only

Use:

```text
react/
vue/
angular/
```

## If the project is full-stack frontend/meta framework

Use:

```text
nextjs/
nuxt-vue/
sveltekit/
astro/
```

## If the project is mobile

Use:

```text
react-native-expo/
flutter/
```

## If the project is CMS/content

Use:

```text
wordpress/
strapi/
astro/
```

## If the project is e-commerce

Use:

```text
shopify/
wordpress/
laravel/
nextjs/
```

## If the project needs fast backend/auth/database without building everything manually

Use:

```text
supabase/
firebase/
```

---

# Suggested prompt pack folder naming rules

Use lowercase folder names.

Use hyphens for multi-word stacks.

```text
react-native-expo
go-gin
nuxt-vue
springboot
expressjs
codeigniter
```

Avoid spaces, uppercase names, and inconsistent spellings.

---

# Standard files inside each prompt pack

Most prompt packs should follow this pattern:

```text
README.md
00_<STACK>_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_OR_API_PROMPT.md
04_FOUNDATION_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_PERMISSIONS_PROMPT.md
07_CORE_MODELS_OR_FEATURES_PROMPT.md
08_SERVICES_OR_DATA_PROMPT.md
09_VALIDATION_ERROR_HANDLING_PROMPT.md
10_STACK_SPECIFIC_ADVANCED_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
prompt_pack_manifest.json
```

Not every stack needs the exact same files, but the order should stay predictable.

---

# How an AI coding assistant should use any pack

When sending a prompt from any pack to an AI coding assistant, include this instruction:

```text
You are working inside a project that uses Kabeeri Vibe Developer Framework.

Use only this prompt.
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
Explain what you changed.
List files changed.
List checks/tests to run.
Stop after completing this task.
```

---

# Versioning recommendation

For the current repository stage:

```text
v0.1.1
```

Recommended goal:

```text
First complete prompt pack foundation.
```

Future versions:

```text
v0.2.0  Add common prompt layer and improve manifests.
v0.3.0  Add examples and sample projects.
v0.4.0  Add CLI planning.
v0.5.0  Add VS Code extension planning.
v1.0.0  Stable open-source framework release.
```

---

# Recommended next improvement

Create:

```text
prompt_packs/common/
```

Then update all packs to reference it.

This will reduce repetition and make the framework easier to maintain as the number of implementation stacks grows.

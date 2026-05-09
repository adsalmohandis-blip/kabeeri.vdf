# 00 — WordPress Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

WordPress

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly WordPress prompt pack that helps vibe developers build WordPress plugins, themes, child themes, WooCommerce extensions, and customizations step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on a WordPress project in a controlled order.

## What this pack is not

This pack is not:

- a WordPress installer
- a hosting setup tool
- a replacement for WordPress admin
- a replacement for official WordPress documentation
- a full plugin marketplace
- a full theme generator
- a license bypass tool

## WordPress work types supported

This prompt pack can guide AI for:

```text
Plugin development
Theme or child theme customization
Custom post types
Custom taxonomies
Admin settings pages
Shortcodes
Gutenberg blocks
REST API endpoints
WooCommerce extensions
Migration helpers
Security review
Release handoff
```

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE or content/data plan
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite projects, not all folders are required, but the product idea and first release scope should be clear.

## Prompt order

Use the prompts in this order when applicable:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_PLUGIN_STRUCTURE_PROMPT.md
03_CUSTOM_POST_TYPES_TAXONOMIES_PROMPT.md
04_ADMIN_SETTINGS_PAGE_PROMPT.md
05_SHORTCODES_BLOCKS_PROMPT.md
06_REST_API_ENDPOINTS_PROMPT.md
07_WOOCOMMERCE_EXTENSION_PROMPT.md
08_THEME_CHILD_THEME_PROMPT.md
09_SECURITY_CAPABILITIES_NONCES_PROMPT.md
10_MIGRATION_HELPERS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

Not every WordPress project needs every prompt.

Example:

- A simple plugin may need prompts 01, 02, 04, 09, 11, 12.
- A content plugin may need 01, 02, 03, 05, 09, 11, 12.
- A WooCommerce extension may need 01, 02, 07, 09, 11, 12.
- A theme customization may need 01, 08, 09, 11, 12.

## Important

These prompts are intentionally small. They should not be merged into one large prompt.

# WordPress Prompt Pack

This directory contains the first WordPress prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use WordPress as an implementation platform after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a WordPress installer.

It does not download WordPress, install WordPress, create a hosting account, configure a database, or replace WordPress admin tools.

It provides structured AI prompts that help an AI coding assistant work on WordPress customization tasks such as:

- plugins
- themes
- child themes
- WooCommerce extensions
- custom post types
- taxonomies
- admin settings pages
- shortcodes
- blocks
- REST API endpoints
- migration helpers

## Most important safety rule

Never modify WordPress core files.

Allowed work should normally happen inside:

```text
wp-content/plugins/
wp-content/themes/
wp-content/mu-plugins/
```

## Purpose

This prompt pack helps the user move from planning to implementation in small, controlled AI coding tasks.

Each prompt should be used one at a time.

## Core rule

Do not ask an AI coding tool to build the whole WordPress product at once.

Use this flow:

```text
One prompt
→ one small WordPress task
→ review output
→ test locally
→ commit
→ move to next prompt
```

## Included files

```text
00_WORDPRESS_PROMPT_PACK_INDEX.md
00_WORDPRESS_SAFETY_RULES.md
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
prompt_pack_manifest.json
```

## Recommended tools

This prompt pack can be used with:

- ChatGPT
- Codex
- Cursor
- Claude Code
- Windsurf
- GitHub Copilot
- other AI coding assistants

## Status

Foundation prompt pack for `v0.1.1`.

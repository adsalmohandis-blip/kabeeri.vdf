# WordPress Builder CLI

## Commands

```bash
kvdf wordpress-builder status
kvdf wordpress-builder plan --idea "Business website with blog and services"
kvdf wordpress-builder theme-plan --idea "Business website with blog and services"
kvdf wordpress-builder plugin-plan --idea "Business website with blog and services"
kvdf wordpress-builder woocommerce-plan --idea "Commerce store"
kvdf wordpress-builder security-cleanup-plan --idea "Hacked WordPress site cleanup"
kvdf wordpress plan "Build a WordPress company website" --type corporate --mode new
```

## Notes

- The plugin is optional and removable.
- WordPress-specific planning is plugin-owned, not Core-owned.
- The compatibility `kvdf wordpress` command remains available while delegating to the plugin runtime.
- Security cleanup is planning-only in this phase.
- Do not delete files, deploy sites, or modify WordPress installations from this plugin.

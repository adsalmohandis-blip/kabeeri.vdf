# Plugin Brief

`app_category_registry` is the category brain for KVDOS app creation.

It decides which category profile is active, which questionnaire packs load, which docs are required, which roadmap tracks are generated, and which workspace plan is allowed.

Core responsibilities:

- keep the full category universe in data
- expose only active ready categories by default
- build a selected category profile from delivery, domain, architecture, governance, and optional industry layers
- route intake sources and questionnaire gaps
- resolve required specs and micro-doc contracts
- derive roadmap tracks and workspace plans
- emit evidence and approval gates

The plugin prepares the normal app creation pipeline. It does not build the app itself.

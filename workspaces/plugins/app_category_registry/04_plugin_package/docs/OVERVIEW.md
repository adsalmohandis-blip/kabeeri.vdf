# Overview

`app_category_registry` is the category and planning layer that sits in front of KVDOS app creation.

It defines the app's category profile, resolves the required planning artifacts, and prepares the governed handoff into the normal KVDOS pipeline.

## Responsibilities

- category visibility and catalog filtering
- category profile resolution
- source intake routing
- questionnaire routing
- spec and micro-doc contract resolution
- roadmap order generation
- workspace planning
- evidence and readiness outputs

## Product behavior

- show ready default categories in the normal create flow
- allow advanced categories only when explicitly requested
- keep hidden or incomplete categories out of production selection
- preserve conflicts and missing information instead of guessing
- generate deterministic outputs for downstream KVDOS stages

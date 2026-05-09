# 12 - Extension Layer

The extension layer is where optional or future capabilities can live before
they become stable core behavior.

## Purpose

- keep the core framework clean
- avoid mixing experimental ideas with stable workflows
- allow future products, plugins, VS Code surfaces, dashboards, and integrations
  to evolve safely

## Rule

An extension should become part of the core only when its use case, runtime
state, documentation, and governance value are clear.

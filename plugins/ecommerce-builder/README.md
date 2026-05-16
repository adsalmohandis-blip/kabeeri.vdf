# Ecommerce Builder

`ecommerce-builder` is the app-track plugin for ecommerce and commerce systems.

## Install and uninstall

```bash
kvdf plugins install ecommerce-builder
kvdf plugins uninstall ecommerce-builder
```

## Runtime pipeline

```text
kvdf ecommerce status
kvdf ecommerce init --mode store
kvdf ecommerce questionnaire
kvdf ecommerce brief
kvdf ecommerce design
kvdf ecommerce modules
kvdf ecommerce tasks
kvdf ecommerce approve
kvdf ecommerce report
```

## Live state

The runtime state lives in `.kabeeri/ecommerce.json` and is validated as a first-class KVDF runtime schema.

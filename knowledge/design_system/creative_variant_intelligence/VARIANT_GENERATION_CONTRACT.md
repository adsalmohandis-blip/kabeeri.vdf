# Variant Generation Contract

## Purpose

For similar app requests, Kabeeri should avoid giving the same layout, palette, density, and tone to every developer.

Creative variants must be generated from:

- product blueprint;
- business pattern;
- target user role;
- page intent;
- brand tone;
- language/RTL needs;
- selected framework adapter;
- selected token set;
- selected screen composition.

## Fixed Rules

Every variant must keep:

- approved UI foundation and adapter;
- semantic tokens;
- required states;
- accessibility and keyboard behavior;
- performance constraints;
- content/microcopy level;
- RTL rules when enabled;
- no raw component colors;
- no unapproved UI libraries.

## Variable Axes

Every generated variant should vary at least four of:

- palette preset;
- density;
- navigation pattern;
- page hierarchy;
- component emphasis;
- surface style;
- motion level;
- empty-state tone;
- dashboard ordering;
- microcopy tone;
- media/illustration strategy.

## Prompt Rule

Implementation prompts should reference:

- `variant_id`;
- `adapter_key`;
- `composition_id`;
- `token_set_id`;
- business pattern and selected references.

Do not paste the full variant catalog into prompts.


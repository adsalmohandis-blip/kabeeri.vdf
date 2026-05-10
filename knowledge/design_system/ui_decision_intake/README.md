# UI Decision Intake

This pack turns developer/client answers into concrete UI design decisions.

Use it before implementation when the product has no approved visual direction or when Kabeeri needs to choose between multiple creative variants.

## Commands

```bash
kvdf design ui-questions ecommerce --json
kvdf design ui-decisions ecommerce --page checkout --json
kvdf questionnaire answer ui.brand_personality --value "premium, trustworthy, Arabic-first"
```

## Output

The decision profile should recommend:

- creative variant;
- palette preset;
- density;
- navigation pattern;
- surface style;
- microcopy tone;
- motion bias;
- framework adapter;
- composition ID;
- missing answers.

## Rule

If answers are missing, Kabeeri should ask compact questions instead of inventing a generic design direction.


# ADMIT-ADB04 Soft UI Billing

## Identity

- Design code: `ADMIT-ADB04`
- Category: account finance billing page
- Style: soft UI / neumorphic light dashboard
- Use: billing, payment methods, invoices, billing profiles, transactions
- Copy policy: inspiration only

## Core Pattern

Use a light soft dashboard with rounded cards, diffused shadows, and a 12-column billing layout.

Desktop layout:

```text
left column: credit card, mini finance cards, payment methods, billing information
right column: invoices, transactions
```

## Required Sections

- credit card preview with masked number only;
- income or quick balance cards;
- payment methods list;
- invoices list with PDF action;
- billing information list;
- transaction timeline grouped by date;
- optional configurator for safe theme settings.

## Security Rule

Never store or display a full credit card number in production mode unless PCI compliance is explicitly approved. Use masked numbers only.

## Design Rules

- Use soft light background.
- Cards are white or muted surfaces with large radius.
- Shadows must be diffused and tokenized.
- Amounts need sign, icon/status, and color.
- Delete requires confirmation.
- PDF actions must announce invoice IDs.
- RTL is required, while card number grouping can remain left-to-right.

## Task Seed

- Create Soft UI billing tokens and shadow tokens.
- Build app shell, credit card preview, mini finance cards, payment methods, invoices, billing info, transactions.
- Add modal/drawer flows for card edits and delete confirmations.
- Add responsive, RTL, accessibility, and security checks.

# HLTH-UI04 Prescriptions

## Identity

- Design code: `HLTH-UI04`
- Business: healthtech
- View: prescriptions and medication
- Style: medication clarity and refill support

## Layout Anatomy

```text
active medications
dosage
refill status
warnings
history
```

## UX Goals

- Make medication instructions clear.
- Show refill and expiration state.
- Surface warnings calmly.

## Required Components

- `MedicationCard`
- `DosageInfo`
- `RefillStatus`
- `WarningAlert`
- `MedicationHistory`
- `RefillButton`

## Required States

- active;
- expired;
- refill available;
- refill pending;
- warning;
- no prescriptions.

## Data Requirements

- medication name;
- dosage;
- frequency;
- prescriber;
- refill count;
- warnings.

## Accessibility

- Medication names and dosage are readable.
- Warnings use text plus icon.
- Refill button label is specific.

## Motion

- `MINIMAL_MOTION`
- Refill success can show calm feedback.
- Avoid motion around warnings.

## Common Mistakes

- Dosage too small.
- Expired medications not obvious.
- Warning hidden in low-contrast text.

## Acceptance Criteria

- User can identify what to take, when, and refill status.

## Task Seed

- Build prescriptions view with medication cards, dosage, refill, warnings, and history states.


# HLTH-UI02 Appointments

## Identity

- Design code: `HLTH-UI02`
- Business: healthtech
- View: appointments
- Style: accessible scheduling and visit management

## Layout Anatomy

```text
upcoming appointments
book/reschedule
provider
location/telehealth
instructions
```

## UX Goals

- Help users manage appointments confidently.
- Show visit details and preparation.
- Support reschedule/cancel safely.

## Required Components

- `AppointmentCard`
- `BookAppointmentButton`
- `ProviderCard`
- `VisitInstructions`
- `RescheduleButton`
- `CancelConfirmModal`

## Required States

- upcoming;
- past;
- cancelled;
- telehealth;
- reschedule pending;
- no appointments.

## Data Requirements

- date/time;
- provider;
- location/link;
- instructions;
- policy.

## Accessibility

- Date and time are textually clear.
- Telehealth link labels are specific.
- Cancellation policy is readable.

## Motion

- `MINIMAL_MOTION`
- Appointment update feedback can be subtle.
- Avoid delaying appointment details.

## Common Mistakes

- Location or telehealth link hidden.
- Policy shown after cancellation only.
- No preparation instructions.

## Acceptance Criteria

- User can view, book, reschedule, and cancel with clear consequences.

## Task Seed

- Build appointments view with cards, booking/reschedule/cancel, telehealth, instructions, and states.


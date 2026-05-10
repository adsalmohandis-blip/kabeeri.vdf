# BOOK-UI02 Calendar Time Slots

## Identity

- Design code: `BOOK-UI02`
- Business: booking
- View: calendar and time slots
- Style: availability-first scheduling

## Core Pattern

```text
calendar
available days
time slot picker
timezone or location note
selected slot summary
```

## Required Sections

- month/week calendar;
- available day indicators;
- time slots;
- timezone or location note;
- selected date/time summary.

## Component Contracts

- `CalendarPicker`
- `AvailabilityIndicator`
- `TimeSlotPicker`
- `TimezoneNote`
- `SelectedSlotSummary`

## States

- available;
- selected;
- unavailable;
- slot taken after refresh;
- loading availability;
- no availability.

## Design Rules

- Available and unavailable states must be visually and textually clear.
- Recently unavailable state should explain what happened.
- Summary updates immediately after selection.

## Motion

- `BALANCED_MOTION`
- Calendar month transitions can be subtle.
- Do not delay slot selection.

## Task Seed

- Build calendar and slot picker with availability, selected, unavailable, refresh conflict, and empty states.


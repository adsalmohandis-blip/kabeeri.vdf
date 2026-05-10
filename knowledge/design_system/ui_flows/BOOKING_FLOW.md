# Booking Flow

Use for appointments, reservations, rentals, service scheduling, and consultation booking.

Steps:

1. Select service, item, place, or provider.
2. Select date and available time.
3. Collect required user details.
4. Review summary, price, duration, location, and cancellation policy.
5. Confirm booking and show calendar/export/support next steps.

Required states:

- No availability
- Slot selected
- Slot unavailable after refresh
- Confirmation
- Reschedule
- Cancellation

Rules:

- Available and unavailable times must be visually distinct.
- Do not animate availability in a way that creates ambiguity.
- Summary must be shown before final confirmation.

